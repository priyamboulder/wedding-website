// â”€â”€ Seating store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Single source of truth for the spatial floor plan builder.
// Zustand + localStorage (per project persistence memory â€” no Supabase).
//
// Per-event model: each event has its own floor plan (room, fixed
// elements, tables, zones). The active event â€” tracked by the sibling
// seating-assignments-store â€” selects which plan is mutable.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ElementProperties,
  FixedElement,
  FixedElementKind,
  FloorZone,
  LayoutPresetId,
  RoomConfig,
  SeatingLayout,
  SeatingTable,
  TableShape,
  TableZone,
} from "@/types/seating";
import { TABLE_ZONE_META } from "@/types/seating";
import {
  LAYOUT_PRESETS,
  createFixedElement,
  createTable,
  defaultLayout,
} from "@/lib/seating-seed";
import { dbUpsert, dbLoadBlob, getCurrentCoupleId } from "@/lib/supabase/db-sync";

function syncSeatingToDB(plans: Record<string, unknown>, activeEventId: string) {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  dbUpsert("seating_plans", { couple_id: coupleId, plans, active_event_id: activeEventId });
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

// Event-keyed floor plan snapshot.
interface EventPlanEntry {
  room: RoomConfig;
  fixed: FixedElement[];
  tables: SeatingTable[];
  zones: FloorZone[];
  presetId: string | null;
}

interface SeatingState extends SeatingLayout {
  // Currently active event key (mirrors seating-assignments-store).
  activeEventId: string;
  // All events' floor plans.
  plans: Record<string, EventPlanEntry>;

  // Selection â€” which element/table/zone is currently highlighted.
  selectedTableId: string | null;
  selectedFixedId: string | null;
  selectedZoneId: string | null;

  // Switch events + load that event's plan into the live view.
  setActivePlan: (eventId: string) => void;
  // Copy one event's layout into another (room + fixed + zones; tables
  // come along so the couple can iterate without re-adding everything).
  copyPlanFrom: (sourceEventId: string, targetEventId?: string) => void;

  // Room
  setRoom: (patch: Partial<RoomConfig>) => void;

  // Fixed elements
  addFixedElement: (kind: FixedElementKind, overrides?: Partial<FixedElement>) => string;
  updateFixedElement: (id: string, patch: Partial<FixedElement>) => void;
  updateFixedElementProperties: (id: string, patch: Partial<ElementProperties>) => void;
  removeFixedElement: (id: string) => void;

  // Tables
  addTable: (shape: TableShape) => string;
  updateTable: (id: string, patch: Partial<SeatingTable>) => void;
  duplicateTable: (id: string) => void;
  removeTable: (id: string) => void;
  // Set social zones on multiple tables in one call (used by auto-assign-all).
  setTableZones: (map: Record<string, TableZone | null>) => void;
  // Arrange tables in concentric rings by zone (VIP innermost â†’ Kids near food).
  // Anchors on the stage element when one exists, otherwise the room center.
  autoLayoutByZone: () => void;

  // Zones
  addZone: (patch?: Partial<FloorZone>) => string;
  updateZone: (id: string, patch: Partial<FloorZone>) => void;
  removeZone: (id: string) => void;

  // Selection
  selectTable: (id: string | null) => void;
  selectFixed: (id: string | null) => void;
  selectZone: (id: string | null) => void;

  // Presets
  applyPreset: (id: LayoutPresetId) => void;
  resetLayout: () => void;

  // Auto-save stamp
  touchSaved: () => void;
}

function nextTableNumber(tables: SeatingTable[]): number {
  return tables.reduce((m, t) => Math.max(m, t.number), 0) + 1;
}

function clampToRoom(
  val: number,
  halfSize: number,
  roomSize: number,
): number {
  const min = halfSize;
  const max = roomSize - halfSize;
  if (max <= min) return roomSize / 2;
  return Math.max(min, Math.min(max, val));
}

function freshEntry(): EventPlanEntry {
  const init = defaultLayout();
  return {
    room: init.room,
    fixed: init.fixed,
    tables: init.tables,
    zones: [],
    presetId: init.presetId,
  };
}

const initial = defaultLayout();
const INITIAL_EVENT = "reception";

export const useSeatingStore = create<SeatingState>()(
  persist(
    (set, get) => {
      const firstPlan: EventPlanEntry = {
        room: initial.room,
        fixed: initial.fixed,
        tables: initial.tables,
        zones: [],
        presetId: initial.presetId,
      };

      // Helper: write back the active event's plan after a mutation.
      const persistActive = (next: Partial<EventPlanEntry>) => {
        const s = get();
        const key = s.activeEventId;
        const existing = s.plans[key] ?? freshEntry();
        const merged: EventPlanEntry = { ...existing, ...next };
        const updatedPlans = { ...s.plans, [key]: merged };
        set({
          plans: updatedPlans,
          room: merged.room,
          fixed: merged.fixed,
          tables: merged.tables,
          zones: merged.zones,
          presetId: merged.presetId,
          lastSavedAt: new Date().toISOString(),
        });
        syncSeatingToDB(updatedPlans as Record<string, unknown>, s.activeEventId);
      };

      return {
        ...initial,
        zones: [],
        activeEventId: INITIAL_EVENT,
        plans: { [INITIAL_EVENT]: firstPlan },
        selectedTableId: null,
        selectedFixedId: null,
        selectedZoneId: null,

        // â”€â”€ Event switching â”€â”€
        setActivePlan: (eventId) => {
          const s = get();
          if (s.activeEventId === eventId) return;
          // Persist the current in-flight state back to plans[current]
          // (should already be there, but guards against race conditions)
          const updatedPlans = {
            ...s.plans,
            [s.activeEventId]: {
              room: s.room,
              fixed: s.fixed,
              tables: s.tables,
              zones: s.zones,
              presetId: s.presetId,
            },
          };
          const target = updatedPlans[eventId] ?? freshEntry();
          set({
            plans: { ...updatedPlans, [eventId]: target },
            activeEventId: eventId,
            room: target.room,
            fixed: target.fixed,
            tables: target.tables,
            zones: target.zones,
            presetId: target.presetId,
            selectedTableId: null,
            selectedFixedId: null,
            selectedZoneId: null,
          });
        },

        copyPlanFrom: (sourceEventId, targetEventId) => {
          const s = get();
          const src = s.plans[sourceEventId];
          if (!src) return;
          const key = targetEventId ?? s.activeEventId;
          const cloned: EventPlanEntry = {
            room: { ...src.room },
            fixed: src.fixed.map((f) => ({ ...f, id: uid() })),
            tables: src.tables.map((t) => ({ ...t, id: uid() })),
            zones: src.zones.map((z) => ({ ...z, id: uid() })),
            presetId: src.presetId,
          };
          const updatedPlans = { ...s.plans, [key]: cloned };
          if (key === s.activeEventId) {
            set({
              plans: updatedPlans,
              room: cloned.room,
              fixed: cloned.fixed,
              tables: cloned.tables,
              zones: cloned.zones,
              presetId: cloned.presetId,
              lastSavedAt: new Date().toISOString(),
            });
          } else {
            set({ plans: updatedPlans });
          }
        },

        // â”€â”€ Room â”€â”€
        setRoom: (patch) => {
          const s = get();
          const nextRoom = { ...s.room, ...patch };
          persistActive({ room: nextRoom, presetId: null });
        },

        // â”€â”€ Fixed elements â”€â”€
        addFixedElement: (kind, overrides) => {
          const s = get();
          const el = createFixedElement(
            kind,
            s.room.length / 2,
            s.room.width / 2,
            overrides,
          );
          persistActive({
            fixed: [...s.fixed, el],
            presetId: null,
          });
          set({ selectedFixedId: el.id, selectedTableId: null, selectedZoneId: null });
          return el.id;
        },
        updateFixedElement: (id, patch) => {
          const s = get();
          const next = s.fixed.map((f) => {
            if (f.id !== id) return f;
            const merged = { ...f, ...patch };
            merged.x = clampToRoom(merged.x, merged.width / 2, s.room.length);
            merged.y = clampToRoom(merged.y, merged.height / 2, s.room.width);
            return merged;
          });
          persistActive({ fixed: next, presetId: null });
        },
        updateFixedElementProperties: (id, patch) => {
          const s = get();
          const next = s.fixed.map((f) => {
            if (f.id !== id) return f;
            return {
              ...f,
              properties: { ...(f.properties ?? {}), ...patch },
            };
          });
          persistActive({ fixed: next });
        },
        removeFixedElement: (id) => {
          const s = get();
          persistActive({
            fixed: s.fixed.filter((f) => f.id !== id),
            presetId: null,
          });
          if (s.selectedFixedId === id) set({ selectedFixedId: null });
        },

        // â”€â”€ Tables â”€â”€
        addTable: (shape) => {
          const s = get();
          const n = nextTableNumber(s.tables);
          const offset = (n % 6) * 1.5;
          const t = createTable(
            shape,
            s.room.length / 2 + offset,
            s.room.width / 2 + offset,
            n,
          );
          persistActive({
            tables: [...s.tables, t],
            presetId: null,
          });
          set({ selectedTableId: t.id, selectedFixedId: null, selectedZoneId: null });
          return t.id;
        },
        updateTable: (id, patch) => {
          const s = get();
          const next = s.tables.map((t) => {
            if (t.id !== id) return t;
            const merged = { ...t, ...patch };
            const halfW = merged.shape === "round" ? merged.width / 2 : merged.width / 2;
            const halfH = merged.shape === "round" ? merged.width / 2 : merged.height / 2;
            merged.x = clampToRoom(merged.x, halfW, s.room.length);
            merged.y = clampToRoom(merged.y, halfH, s.room.width);
            return merged;
          });
          persistActive({ tables: next, presetId: null });
        },
        duplicateTable: (id) => {
          const s = get();
          const src = s.tables.find((t) => t.id === id);
          if (!src) return;
          const n = nextTableNumber(s.tables);
          const copy: SeatingTable = {
            ...src,
            id: uid(),
            number: n,
            label: undefined,
            x: clampToRoom(src.x + 8, src.width / 2, s.room.length),
            y: clampToRoom(
              src.y + 3,
              (src.shape === "round" ? src.width : src.height) / 2,
              s.room.width,
            ),
          };
          persistActive({ tables: [...s.tables, copy], presetId: null });
          set({ selectedTableId: copy.id });
        },
        removeTable: (id) => {
          const s = get();
          persistActive({
            tables: s.tables.filter((t) => t.id !== id),
            presetId: null,
          });
          if (s.selectedTableId === id) set({ selectedTableId: null });
        },

        setTableZones: (map) => {
          const s = get();
          const next = s.tables.map((t) => {
            if (!(t.id in map)) return t;
            const z = map[t.id];
            return { ...t, zone: z ?? undefined };
          });
          persistActive({ tables: next });
        },

        autoLayoutByZone: () => {
          const s = get();
          const laidOut = ringLayoutByZone(s.tables, s.fixed, s.room);
          persistActive({ tables: laidOut, presetId: null });
        },

        // â”€â”€ Zones â”€â”€
        addZone: (patch) => {
          const s = get();
          const id = uid();
          const zone: FloorZone = {
            id,
            name: patch?.name ?? `Zone ${s.zones.length + 1}`,
            description: patch?.description,
            color: patch?.color ?? "rgba(168, 128, 76, 0.15)",
            x: patch?.x ?? s.room.length / 2,
            y: patch?.y ?? s.room.width / 2,
            width: patch?.width ?? 16,
            height: patch?.height ?? 12,
            rotation: patch?.rotation ?? 0,
            flowOrder: patch?.flowOrder,
          };
          persistActive({ zones: [...s.zones, zone] });
          set({ selectedZoneId: id, selectedTableId: null, selectedFixedId: null });
          return id;
        },
        updateZone: (id, patch) => {
          const s = get();
          const next = s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z));
          persistActive({ zones: next });
        },
        removeZone: (id) => {
          const s = get();
          persistActive({ zones: s.zones.filter((z) => z.id !== id) });
          if (s.selectedZoneId === id) set({ selectedZoneId: null });
        },

        // â”€â”€ Selection â”€â”€
        selectTable: (id) =>
          set({ selectedTableId: id, selectedFixedId: null, selectedZoneId: null }),
        selectFixed: (id) =>
          set({ selectedFixedId: id, selectedTableId: null, selectedZoneId: null }),
        selectZone: (id) =>
          set({ selectedZoneId: id, selectedTableId: null, selectedFixedId: null }),

        // â”€â”€ Presets â”€â”€
        applyPreset: (id) => {
          const s = get();
          const preset = LAYOUT_PRESETS.find((p) => p.id === id);
          if (!preset) return;
          const built = preset.build(s.room);
          persistActive({
            fixed: built.fixed,
            tables: built.tables,
            presetId: id,
          });
          set({ selectedTableId: null, selectedFixedId: null, selectedZoneId: null });
        },
        resetLayout: () => {
          const fresh = defaultLayout();
          persistActive({
            room: fresh.room,
            fixed: fresh.fixed,
            tables: fresh.tables,
            zones: [],
            presetId: fresh.presetId,
          });
          set({ selectedTableId: null, selectedFixedId: null, selectedZoneId: null });
        },

        touchSaved: () => set({ lastSavedAt: new Date().toISOString() }),
      };
    },
    {
      name: "ananya:seating",
      version: 2,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      migrate: (persisted: unknown, version: number) => {
        if (version >= 2) return persisted;
        const prev = (persisted ?? {}) as Partial<SeatingLayout>;
        const room = prev.room ?? { ...defaultLayout().room };
        const fixed = prev.fixed ?? [];
        const tables = prev.tables ?? [];
        const plan: EventPlanEntry = {
          room,
          fixed,
          tables,
          zones: [],
          presetId: prev.presetId ?? null,
        };
        return {
          ...prev,
          room,
          fixed,
          tables,
          zones: [],
          activeEventId: INITIAL_EVENT,
          plans: { [INITIAL_EVENT]: plan },
        };
      },
      partialize: (s) => ({
        activeEventId: s.activeEventId,
        plans: s.plans,
        // Mirror the active plan for quick-read selectors that don't
        // go through `plans`.
        room: s.room,
        fixed: s.fixed,
        tables: s.tables,
        zones: s.zones,
        presetId: s.presetId,
        lastSavedAt: s.lastSavedAt,
      }),
    },
  ),
);

export async function loadSeatingFromDB() {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  const blob = await dbLoadBlob<{ plans: unknown; active_event_id: unknown }>("seating_plans", coupleId);
  if (!blob) return;
  useSeatingStore.setState((s) => ({
    plans: (blob.plans as never) ?? s.plans,
    activeEventId: (blob.active_event_id as string) ?? s.activeEventId,
  }));
}

// â”€â”€ Derived helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function totalCapacity(tables: SeatingTable[]): number {
  return tables.reduce((sum, t) => sum + t.seats, 0);
}

// Concentric-ring layout: VIP innermost, Family next, Friends outer,
// Kids slightly offset toward a food station. Anchors on the stage element
// when one exists; otherwise the room center. Leaves unzoned tables alone.
export function ringLayoutByZone(
  tables: SeatingTable[],
  fixed: FixedElement[],
  room: RoomConfig,
): SeatingTable[] {
  if (!tables.length) return tables;

  const stage = fixed.find((f) => f.kind === "stage") ??
    fixed.find((f) => f.kind === "head_table");
  const anchorX = stage?.x ?? room.length / 2;
  // Anchor a bit below the stage so the ring unfolds into the room.
  const stageBottomY = stage ? stage.y + stage.height / 2 : room.width / 4;
  const anchorY = Math.min(
    room.width - 10,
    stage ? stageBottomY + 10 : room.width / 2,
  );

  // Rough ring radii â€” tuned for a 60x80 ft default hall. Scales with the
  // smaller room dimension so a smaller room still breathes.
  const baseRadius = Math.min(room.length, room.width) / 8;
  const radii: Record<NonNullable<SeatingTable["zone"]>, number> = {
    vip: baseRadius * 1.2,
    family: baseRadius * 2.1,
    friends: baseRadius * 3.0,
    kids: baseRadius * 2.6,
  };

  const buckets: Record<string, SeatingTable[]> = {
    vip: [],
    family: [],
    friends: [],
    kids: [],
    unzoned: [],
  };
  for (const t of tables) {
    const z = t.zone ?? "unzoned";
    buckets[z].push(t);
  }

  const next = [...tables];
  const updateById = (id: string, patch: Partial<SeatingTable>) => {
    const idx = next.findIndex((t) => t.id === id);
    if (idx >= 0) next[idx] = { ...next[idx], ...patch };
  };

  // VIP: fan in a tight arc directly in front of the stage (facing out).
  const vip = buckets.vip;
  if (vip.length) {
    const r = radii.vip;
    const span = Math.min(Math.PI * 0.9, Math.max(Math.PI * 0.4, vip.length * 0.22));
    const start = -span / 2;
    vip.forEach((t, i) => {
      const angle = vip.length === 1
        ? 0
        : start + (span * i) / (vip.length - 1);
      const x = clamp(anchorX + r * Math.sin(angle), t.width / 2, room.length - t.width / 2);
      const y = clamp(
        anchorY + r * Math.cos(angle) * 0.55,
        (t.shape === "round" ? t.width : t.height) / 2,
        room.width - (t.shape === "round" ? t.width : t.height) / 2,
      );
      updateById(t.id, { x, y });
    });
  }

  // Family: arc outside VIP, split bride-left / groom-right not feasible here
  // without guest context; we space them evenly in an outer arc.
  const family = buckets.family;
  if (family.length) {
    const r = radii.family;
    const span = Math.PI * 1.0;
    const start = -span / 2;
    family.forEach((t, i) => {
      const angle = family.length === 1 ? 0 : start + (span * i) / (family.length - 1);
      const x = clamp(anchorX + r * Math.sin(angle), t.width / 2, room.length - t.width / 2);
      const y = clamp(
        anchorY + r * Math.cos(angle) * 0.75,
        (t.shape === "round" ? t.width : t.height) / 2,
        room.width - (t.shape === "round" ? t.width : t.height) / 2,
      );
      updateById(t.id, { x, y });
    });
  }

  // Friends: outermost, wide arc toward the back of the room.
  const friendsAndUnzoned = [...buckets.friends, ...buckets.unzoned];
  if (friendsAndUnzoned.length) {
    const r = radii.friends;
    const span = Math.PI * 1.25;
    const start = -span / 2;
    friendsAndUnzoned.forEach((t, i) => {
      const angle =
        friendsAndUnzoned.length === 1
          ? 0
          : start + (span * i) / (friendsAndUnzoned.length - 1);
      const x = clamp(anchorX + r * Math.sin(angle), t.width / 2, room.length - t.width / 2);
      const y = clamp(
        anchorY + r * Math.cos(angle) * 0.95 + r * 0.25,
        (t.shape === "round" ? t.width : t.height) / 2,
        room.width - (t.shape === "round" ? t.width : t.height) / 2,
      );
      updateById(t.id, { x, y });
    });
  }

  // Kids: offset to the side (near a food station if one exists, else right).
  const kids = buckets.kids;
  if (kids.length) {
    const food = fixed.find(
      (f) => f.kind === "buffet" || f.kind === "food_station" || f.label?.toLowerCase().includes("food"),
    );
    const kidsAnchorX = food?.x ?? Math.min(room.length - 12, anchorX + radii.kids);
    const kidsAnchorY = food?.y ?? anchorY + radii.kids * 0.5;
    kids.forEach((t, i) => {
      const offset = (i - (kids.length - 1) / 2) * (t.width + 4);
      const x = clamp(kidsAnchorX + offset, t.width / 2, room.length - t.width / 2);
      const y = clamp(
        kidsAnchorY,
        (t.shape === "round" ? t.width : t.height) / 2,
        room.width - (t.shape === "round" ? t.width : t.height) / 2,
      );
      updateById(t.id, { x, y });
    });
  }

  return next;
}

function clamp(v: number, min: number, max: number): number {
  if (max <= min) return (min + max) / 2;
  return Math.max(min, Math.min(max, v));
}

// Read-only: derive the zone for a given tableId (used by the canvas border).
export function tableZoneMeta(table: SeatingTable) {
  if (!table.zone) return null;
  return TABLE_ZONE_META[table.zone];
}

// Returns the IDs of tables whose 4ft buffer overlaps another table's buffer.
// Used by the canvas to render a warning glow.
export function tooCloseIds(tables: SeatingTable[], buffer = 4): Set<string> {
  const flagged = new Set<string>();
  const radiusOf = (t: SeatingTable) =>
    t.shape === "round"
      ? t.width / 2
      : Math.sqrt((t.width / 2) ** 2 + (t.height / 2) ** 2);
  for (let i = 0; i < tables.length; i += 1) {
    for (let j = i + 1; j < tables.length; j += 1) {
      const a = tables[i];
      const b = tables[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = radiusOf(a) + radiusOf(b) + buffer;
      if (dist < minDist) {
        flagged.add(a.id);
        flagged.add(b.id);
      }
    }
  }
  return flagged;
}

// Count elements that need power (âš¡ icon + load summary)
export function powerDrawSummary(fixed: FixedElement[]): {
  count: number;
  totalWatts: number;
} {
  let count = 0;
  let totalWatts = 0;
  for (const f of fixed) {
    if (f.properties?.needsPower) {
      count += 1;
      totalWatts += f.properties.powerWatts ?? 0;
    }
  }
  return { count, totalWatts };
}

// Dietary coverage across food-station elements
export function dietaryCoverage(fixed: FixedElement[]): {
  veg: boolean;
  nonVeg: boolean;
  jain: boolean;
  halal: boolean;
} {
  const result = { veg: false, nonVeg: false, jain: false, halal: false };
  for (const f of fixed) {
    const p = f.properties;
    if (!p) continue;
    if (p.dietaryVeg) result.veg = true;
    if (p.dietaryNonVeg) result.nonVeg = true;
    if (p.dietaryJain) result.jain = true;
    if (p.dietaryHalal) result.halal = true;
  }
  return result;
}
