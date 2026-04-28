// â”€â”€ Performances store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Tracks choreographed performances (dances, speeches, skits, musical acts)
// across the wedding events. Persists to localStorage via Zustand â€” same
// pattern as stores/guest-experiences-store.ts.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Performance,
  PerformanceParticipant,
  PerformanceRehearsal,
  PerformanceRole,
  PerformanceSong,
  PerformanceStatus,
  PerformanceType,
} from "@/types/performance";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

type NewPerformanceInput = {
  name: string;
  eventId: string;
  type: PerformanceType;
  songs?: Omit<PerformanceSong, "id">[];
  durationMinutes?: number | null;
  participants?: PerformanceParticipant[];
  status?: PerformanceStatus;
  notes?: string;
  costumes?: string;
  avRequirements?: string[];
};

interface PerformancesState {
  performances: Performance[];

  // CRUD
  addPerformance: (input: NewPerformanceInput) => string;
  updatePerformance: (id: string, patch: Partial<Performance>) => void;
  deletePerformance: (id: string) => void;

  // Reorder within an event
  reorderInEvent: (eventId: string, orderedIds: string[]) => void;

  // Participants
  addParticipant: (
    id: string,
    guestId: string,
    role: PerformanceRole,
  ) => void;
  removeParticipant: (id: string, guestId: string) => void;
  updateParticipantRole: (
    id: string,
    guestId: string,
    role: PerformanceRole,
  ) => void;

  // Songs
  addSong: (id: string, song: Omit<PerformanceSong, "id">) => void;
  updateSong: (
    id: string,
    songId: string,
    patch: Partial<Omit<PerformanceSong, "id">>,
  ) => void;
  removeSong: (id: string, songId: string) => void;

  // Rehearsals
  addRehearsal: (
    id: string,
    rehearsal: Omit<PerformanceRehearsal, "id" | "attendance"> & {
      attendance?: Record<string, boolean>;
    },
  ) => void;
  updateRehearsal: (
    id: string,
    rehearsalId: string,
    patch: Partial<Omit<PerformanceRehearsal, "id">>,
  ) => void;
  removeRehearsal: (id: string, rehearsalId: string) => void;
  setAttendance: (
    id: string,
    rehearsalId: string,
    guestId: string,
    present: boolean,
  ) => void;

  // AV requirements
  setAvRequirements: (id: string, requirements: string[]) => void;

  // Selectors
  performancesForEvent: (eventId: string) => Performance[];
  performancesForGuest: (guestId: string) => Performance[];
  countByEvent: () => Record<string, number>;
}

const now = () => new Date().toISOString();
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function bumpUpdated(p: Performance): Performance {
  return { ...p, updatedAt: now() };
}

function mapInEvent(
  list: Performance[],
  id: string,
  mapper: (p: Performance) => Performance,
): Performance[] {
  return list.map((p) => (p.id === id ? bumpUpdated(mapper(p)) : p));
}

export const usePerformancesStore = create<PerformancesState>()(
  persist(
    (set, get) => ({
      performances: [],

      addPerformance: (input) => {
        const id = rid("perf");
        const eventId = input.eventId;
        const existingInEvent = get().performances.filter(
          (p) => p.eventId === eventId,
        );
        const next: Performance = {
          id,
          name: input.name,
          eventId,
          type: input.type,
          songs: (input.songs ?? []).map((s) => ({ ...s, id: rid("song") })),
          durationMinutes: input.durationMinutes ?? null,
          participants: input.participants ?? [],
          rehearsals: [],
          status: input.status ?? "Planning",
          order: existingInEvent.length,
          notes: input.notes ?? "",
          costumes: input.costumes ?? "",
          avRequirements: input.avRequirements ?? [],
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ performances: [...s.performances, next] }));
        return id;
      },

      updatePerformance: (id, patch) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({ ...p, ...patch })),
        })),

      deletePerformance: (id) =>
        set((s) => ({
          performances: s.performances.filter((p) => p.id !== id),
        })),

      reorderInEvent: (eventId, orderedIds) =>
        set((s) => {
          const indexMap: Record<string, number> = {};
          orderedIds.forEach((pid, i) => {
            indexMap[pid] = i;
          });
          return {
            performances: s.performances.map((p) => {
              if (p.eventId !== eventId) return p;
              const newOrder = indexMap[p.id];
              return newOrder == null
                ? p
                : { ...p, order: newOrder, updatedAt: now() };
            }),
          };
        }),

      addParticipant: (id, guestId, role) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) =>
            p.participants.some((x) => x.guestId === guestId)
              ? p
              : { ...p, participants: [...p.participants, { guestId, role }] },
          ),
        })),

      removeParticipant: (id, guestId) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            participants: p.participants.filter((x) => x.guestId !== guestId),
            rehearsals: p.rehearsals.map((r) => {
              if (!(guestId in r.attendance)) return r;
              const next = { ...r.attendance };
              delete next[guestId];
              return { ...r, attendance: next };
            }),
          })),
        })),

      updateParticipantRole: (id, guestId, role) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            participants: p.participants.map((x) =>
              x.guestId === guestId ? { ...x, role } : x,
            ),
          })),
        })),

      addSong: (id, song) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            songs: [...p.songs, { ...song, id: rid("song") }],
          })),
        })),

      updateSong: (id, songId, patch) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            songs: p.songs.map((sg) =>
              sg.id === songId ? { ...sg, ...patch } : sg,
            ),
          })),
        })),

      removeSong: (id, songId) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            songs: p.songs.filter((sg) => sg.id !== songId),
          })),
        })),

      addRehearsal: (id, rehearsal) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            rehearsals: [
              ...p.rehearsals,
              {
                ...rehearsal,
                id: rid("reh"),
                attendance: rehearsal.attendance ?? {},
              },
            ],
          })),
        })),

      updateRehearsal: (id, rehearsalId, patch) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            rehearsals: p.rehearsals.map((r) =>
              r.id === rehearsalId ? { ...r, ...patch } : r,
            ),
          })),
        })),

      removeRehearsal: (id, rehearsalId) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            rehearsals: p.rehearsals.filter((r) => r.id !== rehearsalId),
          })),
        })),

      setAttendance: (id, rehearsalId, guestId, present) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            rehearsals: p.rehearsals.map((r) =>
              r.id === rehearsalId
                ? { ...r, attendance: { ...r.attendance, [guestId]: present } }
                : r,
            ),
          })),
        })),

      setAvRequirements: (id, requirements) =>
        set((s) => ({
          performances: mapInEvent(s.performances, id, (p) => ({
            ...p,
            avRequirements: requirements,
          })),
        })),

      performancesForEvent: (eventId) =>
        get()
          .performances.filter((p) => p.eventId === eventId)
          .sort((a, b) => a.order - b.order),

      performancesForGuest: (guestId) =>
        get().performances.filter((p) =>
          p.participants.some((x) => x.guestId === guestId),
        ),

      countByEvent: () => {
        const out: Record<string, number> = {};
        for (const p of get().performances) {
          out[p.eventId] = (out[p.eventId] ?? 0) + 1;
        }
        return out;
      },
    }),
    {
      name: "ananya:performances",
      version: 1,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      partialize: (state) => ({ performances: state.performances }),
    },
  ),
);

let _performancesSyncTimer: ReturnType<typeof setTimeout> | null = null;
usePerformancesStore.subscribe((state) => {
  if (_performancesSyncTimer) clearTimeout(_performancesSyncTimer);
  _performancesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("performances_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
