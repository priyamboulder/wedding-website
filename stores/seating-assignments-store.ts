// â”€â”€ Seating assignments store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Persists the guest â†” table mapping per-event, per-table notes, and
// user-defined must-pair/must-apart constraints that feed AI suggestions.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AutoSuggestConfig,
  DiningIntelligence,
  MustPair,
  SeatAssignment,
  SeatingEventId,
  TableMeta,
} from "@/types/seating-assignments";
import { DEFAULT_AUTO_CONFIG } from "@/types/seating-assignments";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

function syncAssignmentsToDB(
  assignments: Record<string, unknown>,
  mustPairs: unknown[],
  tableMeta: Record<string, unknown>,
) {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  dbUpsert("seating_assignments", { couple_id: coupleId, assignments, must_pairs: mustPairs, table_meta: tableMeta });
}

type AssignmentMap = Record<SeatingEventId, SeatAssignment[]>;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sa_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

interface SeatingAssignmentsState {
  // Which event's seating we're currently editing ("reception" by default).
  activeEventId: SeatingEventId;
  // eventId â†’ list of assignments
  assignments: AssignmentMap;
  // tableId â†’ table-level meta (notes, etc.) â€” shared across events
  tableMeta: Record<string, TableMeta>;
  // Persisted auto-suggest config (keyed by event)
  autoConfig: Record<SeatingEventId, AutoSuggestConfig>;
  // User-defined must-pair / must-apart groups (shared)
  mustPairs: MustPair[];
  // Dining Intelligence digest, keyed by event. Populated by the
  // auto-assign-all flow and refreshed by smart per-table actions.
  dining: Record<SeatingEventId, DiningIntelligence>;

  setActiveEvent: (id: SeatingEventId) => void;
  setDining: (intel: DiningIntelligence, eventId?: SeatingEventId) => void;
  clearDining: (eventId?: SeatingEventId) => void;
  dismissWarning: (warningId: string, eventId?: SeatingEventId) => void;

  // Assignment mutations (all operate on activeEventId)
  assignGuest: (guestId: string, tableId: string, seatIndex?: number) => boolean;
  assignGuests: (guestIds: string[], tableId: string) => { assigned: string[]; rejected: string[] };
  unassignGuest: (guestId: string) => void;
  moveGuest: (guestId: string, toTableId: string) => boolean;
  clearEvent: (eventId?: SeatingEventId) => void;
  replaceEventAssignments: (pairs: { guestId: string; tableId: string }[]) => void;
  // Snapshot + restore â€” used by auto-suggest undo
  snapshotEvent: (eventId?: SeatingEventId) => SeatAssignment[];
  restoreEventSnapshot: (snapshot: SeatAssignment[], eventId?: SeatingEventId) => void;

  // Query helpers (read from activeEvent unless specified)
  getAssignment: (guestId: string, eventId?: SeatingEventId) => SeatAssignment | undefined;
  getTableGuests: (tableId: string, eventId?: SeatingEventId) => string[];
  getTableOccupancy: (tableId: string, eventId?: SeatingEventId) => number;

  // Table meta
  setTableNotes: (tableId: string, notes: string) => void;

  // Auto-suggest config
  setAutoConfig: (patch: Partial<AutoSuggestConfig>) => void;
  getAutoConfig: () => AutoSuggestConfig;

  // Must-pair groups
  addMustPair: (
    kind: "together" | "apart",
    guestIds: string[],
    label?: string,
  ) => string;
  removeMustPair: (id: string) => void;
}

export const useSeatingAssignmentsStore = create<SeatingAssignmentsState>()(
  persist(
    (set, get) => ({
      activeEventId: "reception",
      assignments: {},
      tableMeta: {},
      autoConfig: {},
      mustPairs: [],
      dining: {},

      setActiveEvent: (id) => set({ activeEventId: id }),

      setDining: (intel, eventId) => {
        const { activeEventId, dining } = get();
        const key = eventId ?? activeEventId;
        set({ dining: { ...dining, [key]: intel } });
      },

      clearDining: (eventId) => {
        const { activeEventId, dining } = get();
        const key = eventId ?? activeEventId;
        const next = { ...dining };
        delete next[key];
        set({ dining: next });
      },

      dismissWarning: (warningId, eventId) => {
        const { activeEventId, dining } = get();
        const key = eventId ?? activeEventId;
        const cur = dining[key];
        if (!cur) return;
        const warnings = cur.warnings.filter((w) => w.id !== warningId);
        const status: DiningIntelligence["status"] = warnings.some(
          (w) => w.severity === "red",
        )
          ? "red"
          : warnings.some((w) => w.severity === "amber")
            ? "amber"
            : "green";
        set({
          dining: {
            ...dining,
            [key]: {
              ...cur,
              warnings,
              issuesCount: warnings.length,
              status,
              summary:
                warnings.length === 0
                  ? "No conflicts detected."
                  : cur.summary,
            },
          },
        });
      },

      assignGuest: (guestId, tableId, seatIndex) => {
        const { activeEventId, assignments, tableMeta, mustPairs } = get();
        const list = assignments[activeEventId] ?? [];
        const withoutGuest = list.filter((a) => a.guestId !== guestId);
        const used = new Set(
          withoutGuest.filter((a) => a.tableId === tableId).map((a) => a.seatIndex),
        );
        let idx = seatIndex;
        if (idx === undefined || used.has(idx)) {
          idx = 0;
          while (used.has(idx)) idx += 1;
        }
        const next: SeatAssignment = { guestId, tableId, seatIndex: idx };
        const nextAssignments = { ...assignments, [activeEventId]: [...withoutGuest, next] };
        set({ assignments: nextAssignments });
        syncAssignmentsToDB(nextAssignments as Record<string, unknown>, mustPairs, tableMeta as Record<string, unknown>);
        return true;
      },

      assignGuests: (guestIds, tableId) => {
        const assigned: string[] = [];
        const rejected: string[] = [];
        const { assignGuest } = get();
        for (const gid of guestIds) {
          if (assignGuest(gid, tableId)) assigned.push(gid);
          else rejected.push(gid);
        }
        return { assigned, rejected };
      },

      unassignGuest: (guestId) => {
        const { activeEventId, assignments, tableMeta, mustPairs } = get();
        const list = assignments[activeEventId] ?? [];
        const nextAssignments = { ...assignments, [activeEventId]: list.filter((a) => a.guestId !== guestId) };
        set({ assignments: nextAssignments });
        syncAssignmentsToDB(nextAssignments as Record<string, unknown>, mustPairs, tableMeta as Record<string, unknown>);
      },

      moveGuest: (guestId, toTableId) => {
        return get().assignGuest(guestId, toTableId);
      },

      clearEvent: (eventId) => {
        const { activeEventId, assignments, tableMeta, mustPairs } = get();
        const key = eventId ?? activeEventId;
        const nextAssignments = { ...assignments, [key]: [] };
        set({ assignments: nextAssignments });
        syncAssignmentsToDB(nextAssignments as Record<string, unknown>, mustPairs, tableMeta as Record<string, unknown>);
      },

      replaceEventAssignments: (pairs) => {
        const { activeEventId, assignments } = get();
        const seenGuests = new Set<string>();
        const byTable = new Map<string, Set<number>>();
        const next: SeatAssignment[] = [];
        for (const { guestId, tableId } of pairs) {
          if (seenGuests.has(guestId)) continue;
          seenGuests.add(guestId);
          const used = byTable.get(tableId) ?? new Set<number>();
          let idx = 0;
          while (used.has(idx)) idx += 1;
          used.add(idx);
          byTable.set(tableId, used);
          next.push({ guestId, tableId, seatIndex: idx });
        }
        set({
          assignments: { ...assignments, [activeEventId]: next },
        });
      },

      snapshotEvent: (eventId) => {
        const { activeEventId, assignments } = get();
        const key = eventId ?? activeEventId;
        const list = assignments[key] ?? [];
        // Deep copy so the snapshot is frozen against future mutations.
        return list.map((a) => ({ ...a }));
      },

      restoreEventSnapshot: (snapshot, eventId) => {
        const { activeEventId, assignments } = get();
        const key = eventId ?? activeEventId;
        set({
          assignments: {
            ...assignments,
            [key]: snapshot.map((a) => ({ ...a })),
          },
        });
      },

      getAssignment: (guestId, eventId) => {
        const { activeEventId, assignments } = get();
        const key = eventId ?? activeEventId;
        return (assignments[key] ?? []).find((a) => a.guestId === guestId);
      },

      getTableGuests: (tableId, eventId) => {
        const { activeEventId, assignments } = get();
        const key = eventId ?? activeEventId;
        return (assignments[key] ?? [])
          .filter((a) => a.tableId === tableId)
          .sort((a, b) => a.seatIndex - b.seatIndex)
          .map((a) => a.guestId);
      },

      getTableOccupancy: (tableId, eventId) => {
        return get().getTableGuests(tableId, eventId).length;
      },

      setTableNotes: (tableId, notes) => {
        set((s) => ({
          tableMeta: {
            ...s.tableMeta,
            [tableId]: { ...(s.tableMeta[tableId] ?? {}), notes },
          },
        }));
      },

      setAutoConfig: (patch) => {
        const { activeEventId, autoConfig } = get();
        const current = autoConfig[activeEventId] ?? DEFAULT_AUTO_CONFIG;
        set({
          autoConfig: {
            ...autoConfig,
            [activeEventId]: { ...current, ...patch },
          },
        });
      },

      getAutoConfig: () => {
        const { activeEventId, autoConfig, mustPairs } = get();
        const base = autoConfig[activeEventId] ?? DEFAULT_AUTO_CONFIG;
        return { ...base, mustPairs };
      },

      addMustPair: (kind, guestIds, label) => {
        const id = uid();
        set((s) => ({
          mustPairs: [...s.mustPairs, { id, kind, guestIds, label }],
        }));
        return id;
      },

      removeMustPair: (id) =>
        set((s) => ({ mustPairs: s.mustPairs.filter((p) => p.id !== id) })),
    }),
    {
      name: "ananya:seating-assignments",
      version: 1,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      partialize: (s) => ({
        activeEventId: s.activeEventId,
        assignments: s.assignments,
        tableMeta: s.tableMeta,
        autoConfig: s.autoConfig,
        mustPairs: s.mustPairs,
        dining: s.dining,
      }),
    },
  ),
);
