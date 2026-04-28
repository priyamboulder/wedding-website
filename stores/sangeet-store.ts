// ── Sangeet Planner store ─────────────────────────────────────────────────
// Per-act state for the Sangeet variety show — performers, tracks, AV
// requirements, rehearsal status, drag-and-drop running order, and
// transition notes. Persisted to localStorage.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  PlaylistTrack,
  SangeetAct,
  SangeetActStatus,
  SangeetPerformer,
} from "@/types/music";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface SangeetState {
  acts: SangeetAct[];

  addAct: (
    input: Omit<SangeetAct, "id" | "created_at" | "updated_at" | "sort_order">,
  ) => SangeetAct;
  updateAct: (id: string, patch: Partial<SangeetAct>) => void;
  deleteAct: (id: string) => void;
  setStatus: (id: string, status: SangeetActStatus) => void;
  // Move act to a new position. positions are 0-indexed across the act list
  // sorted by sort_order.
  reorderAct: (id: string, newIndex: number) => void;

  // Performer mutators (nested)
  addPerformer: (act_id: string, performer: SangeetPerformer) => void;
  updatePerformer: (
    act_id: string,
    name: string,
    patch: Partial<SangeetPerformer>,
  ) => void;
  removePerformer: (act_id: string, name: string) => void;

  // Song mutators (nested)
  addSong: (
    act_id: string,
    song: Omit<PlaylistTrack, "id" | "added_at">,
  ) => void;
  removeSong: (act_id: string, song_id: string) => void;

  // Selectors
  acts_sorted: () => SangeetAct[];
  total_minutes: () => number;
  unrehearsed_count: () => number;
  // Acts whose status is still `not_started` *and* whose closest rehearsal
  // window has elapsed (or no rehearsal scheduled).
  at_risk_acts: () => SangeetAct[];
}

export const useSangeetStore = create<SangeetState>()(
  persist(
    (set, get) => ({
      acts: [],

      addAct: (input) => {
        const now = new Date().toISOString();
        const max = get().acts.reduce(
          (m, a) => Math.max(m, a.sort_order),
          0,
        );
        const record: SangeetAct = {
          ...input,
          id: rid("act"),
          sort_order: max + 1,
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ acts: [...s.acts, record] }));
        return record;
      },
      updateAct: (id, patch) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === id
              ? { ...a, ...patch, updated_at: new Date().toISOString() }
              : a,
          ),
        })),
      deleteAct: (id) => set((s) => ({ acts: s.acts.filter((a) => a.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  last_rehearsed_at:
                    status === "in_rehearsal" ||
                    status === "ready" ||
                    status === "dress_rehearsal_done"
                      ? new Date().toISOString()
                      : a.last_rehearsed_at,
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),
      reorderAct: (id, newIndex) =>
        set((s) => {
          const sorted = [...s.acts].sort((a, b) => a.sort_order - b.sort_order);
          const fromIdx = sorted.findIndex((a) => a.id === id);
          if (fromIdx === -1) return { acts: s.acts };
          const [moving] = sorted.splice(fromIdx, 1);
          sorted.splice(Math.max(0, Math.min(newIndex, sorted.length)), 0, moving!);
          const renumbered = sorted.map((a, i) => ({ ...a, sort_order: i + 1 }));
          return { acts: renumbered };
        }),

      addPerformer: (act_id, performer) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === act_id
              ? {
                  ...a,
                  performers: [...a.performers, performer],
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),
      updatePerformer: (act_id, name, patch) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === act_id
              ? {
                  ...a,
                  performers: a.performers.map((p) =>
                    p.name === name ? { ...p, ...patch } : p,
                  ),
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),
      removePerformer: (act_id, name) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === act_id
              ? {
                  ...a,
                  performers: a.performers.filter((p) => p.name !== name),
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),

      addSong: (act_id, song) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === act_id
              ? {
                  ...a,
                  songs: [
                    ...a.songs,
                    { ...song, id: rid("trk"), added_at: new Date().toISOString() },
                  ],
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),
      removeSong: (act_id, song_id) =>
        set((s) => ({
          acts: s.acts.map((a) =>
            a.id === act_id
              ? {
                  ...a,
                  songs: a.songs.filter((sg) => sg.id !== song_id),
                  updated_at: new Date().toISOString(),
                }
              : a,
          ),
        })),

      acts_sorted: () =>
        [...get().acts].sort((a, b) => a.sort_order - b.sort_order),
      total_minutes: () =>
        get().acts.reduce((sum, a) => sum + (a.estimated_minutes || 0), 0),
      unrehearsed_count: () =>
        get().acts.filter((a) => a.status === "not_started").length,
      at_risk_acts: () => {
        const now = Date.now();
        return get().acts.filter((a) => {
          if (a.status !== "not_started") return false;
          if (!a.next_rehearsal_at) return true;
          return new Date(a.next_rehearsal_at).getTime() < now;
        });
      },
    }),
    {
      name: "ananya-sangeet-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _sangeetSyncTimer: ReturnType<typeof setTimeout> | null = null;
useSangeetStore.subscribe((state) => {
  if (_sangeetSyncTimer) clearTimeout(_sangeetSyncTimer);
  _sangeetSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("sangeet_state", { couple_id: coupleId, acts: state.acts });
  }, 600);
});

// ── Static labels ────────────────────────────────────────────────────────

export const SANGEET_ACT_TYPE_LABEL: Record<
  SangeetAct["type"],
  string
> = {
  dance: "Dance",
  skit: "Skit",
  speech: "Speech",
  slideshow: "Slideshow",
  live_music: "Live music",
  surprise: "Surprise",
};

export const SANGEET_STATUS_LABEL: Record<SangeetActStatus, string> = {
  not_started: "Not started",
  in_rehearsal: "In rehearsal",
  ready: "Ready",
  dress_rehearsal_done: "Dress rehearsal done",
};
