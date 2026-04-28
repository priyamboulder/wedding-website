// ── Schedule store ─────────────────────────────────────────────────────────
// Single global Zustand store for the Schedule module. Mirrors the pattern
// used by stores/events-store.ts: top-level state, persist middleware,
// partialize to pin exactly what lands in localStorage.
//
// Components should access this via lib/schedule/data.ts (the data access
// layer) rather than subscribing to the store directly. The exceptions are
// React components that need live updates from state changes — those use
// the selector hooks exported here.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ScheduleItem } from "@/types/schedule";
import { dbUpsert, dbDelete, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// Legacy schedule items stored before v2 may be missing the fields added
// by the Schedule v2 overhaul (vendorIds, track, isPhotoMoment, …). Backfill
// safe defaults so the UI doesn't crash when reading persisted state written
// by an older build.
function normaliseItem(item: Partial<ScheduleItem> & { id: string }): ScheduleItem {
  return {
    id: item.id,
    eventId: item.eventId ?? "",
    label: item.label ?? "",
    description: item.description ?? null,
    startTime: item.startTime ?? "00:00",
    durationMinutes: item.durationMinutes ?? 0,
    endTime: item.endTime ?? item.startTime ?? "00:00",
    category: item.category ?? "custom",
    isFixed: item.isFixed ?? false,
    dependency: item.dependency ?? null,
    assignedTo: item.assignedTo ?? [],
    vendorIds: item.vendorIds ?? [],
    track: item.track ?? "main",
    location: item.location ?? null,
    notesForVendor: item.notesForVendor ?? null,
    internalNotes: item.internalNotes ?? null,
    sortOrder: item.sortOrder ?? 0,
    color: item.color ?? null,
    isAiDraft: item.isAiDraft,
    templateRefKey: item.templateRefKey ?? null,
    isPhotoMoment: item.isPhotoMoment ?? false,
    musicCue: item.musicCue ?? null,
    status: item.status ?? "draft",
    actualStartTime: item.actualStartTime ?? null,
    actualEndTime: item.actualEndTime ?? null,
  };
}

interface ScheduleState {
  items: ScheduleItem[];

  // ── Writes ──
  upsertItem: (item: ScheduleItem) => void;
  upsertMany: (items: ScheduleItem[]) => void;
  removeItem: (id: string) => void;
  replaceForEvent: (eventId: string, items: ScheduleItem[]) => void;
  reorderForEvent: (eventId: string, orderedIds: string[]) => void;
  clearEvent: (eventId: string) => void;

  // ── Convenience reads (selectors) ──
  getItemsForEvent: (eventId: string) => ScheduleItem[];
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      items: [],

      upsertItem: (item) => {
        set((s) => {
          const idx = s.items.findIndex((i) => i.id === item.id);
          if (idx === -1) return { items: [...s.items, item] };
          const next = s.items.slice();
          next[idx] = item;
          return { items: next };
        });
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("schedule_items", { ...item, couple_id: coupleId, vendor_ids: item.vendorIds ?? [], assigned_to: item.assignedTo ?? [] });
      },

      upsertMany: (incoming) => {
        set((s) => {
          const byId = new Map(s.items.map((i) => [i.id, i] as const));
          for (const item of incoming) byId.set(item.id, item);
          return { items: Array.from(byId.values()) };
        });
        const coupleId = getCurrentCoupleId();
        if (coupleId) {
          for (const item of incoming) {
            dbUpsert("schedule_items", { ...item, couple_id: coupleId, vendor_ids: item.vendorIds ?? [], assigned_to: item.assignedTo ?? [] });
          }
        }
      },

      removeItem: (id) => {
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("schedule_items", { id, couple_id: coupleId });
      },

      replaceForEvent: (eventId, items) =>
        set((s) => ({
          items: [
            ...s.items.filter((i) => i.eventId !== eventId),
            ...items,
          ],
        })),

      reorderForEvent: (eventId, orderedIds) =>
        set((s) => {
          const rank = new Map(orderedIds.map((id, i) => [id, i] as const));
          const next = s.items.map((i) =>
            i.eventId === eventId && rank.has(i.id)
              ? { ...i, sortOrder: rank.get(i.id) as number }
              : i,
          );
          return { items: next };
        }),

      clearEvent: (eventId) =>
        set((s) => ({
          items: s.items.filter((i) => i.eventId !== eventId),
        })),

      getItemsForEvent: (eventId) =>
        get()
          .items.filter((i) => i.eventId === eventId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
    }),
    {
      name: "schedule-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      partialize: (state) => ({ items: state.items }),
      version: 2,
      migrate: (persisted: unknown, _fromVersion: number) => {
        const p = persisted as { items?: Array<Partial<ScheduleItem> & { id: string }> } | null;
        if (!p || !Array.isArray(p.items)) return { items: [] };
        // Dedupe any duplicate ids left over from the v1 AI-draft bug that
        // collapsed every template row into a single id. Keep the first
        // occurrence; discard the rest (the user will re-draft anyway).
        const seen = new Set<string>();
        const items: ScheduleItem[] = [];
        for (const raw of p.items) {
          if (!raw.id || seen.has(raw.id)) continue;
          seen.add(raw.id);
          items.push(normaliseItem(raw));
        }
        return { items };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Belt-and-braces: if the persisted blob bypassed the migrate hook
        // (e.g. already at version 2 but written by a transitional build),
        // still normalise the items so the UI always sees the full shape.
        state.items = state.items.map((i) => normaliseItem(i));
      },
    },
  ),
);
