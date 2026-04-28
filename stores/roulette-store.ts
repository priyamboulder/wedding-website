import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  RouletteAction,
  RouletteActionRecord,
  RouletteFilters,
  RouletteSession,
} from "@/types/roulette";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// ── Roulette store ──────────────────────────────────────────────────────────
// Sessions + swipe history persist in localStorage. Sessions hold the ranked
// vendor stack produced at start; actions are the swipe log used for stats
// and to prevent re-showing already-seen vendors in future sessions.

interface RouletteState {
  sessions: RouletteSession[];
  actions: RouletteActionRecord[];
  lastFilters: RouletteFilters | null;

  // Session lifecycle
  startSession: (filters: RouletteFilters, vendorOrder: string[]) => RouletteSession;
  getSession: (id: string) => RouletteSession | undefined;
  advanceSession: (id: string, newIndex: number) => void;
  completeSession: (id: string) => void;
  resumeLatestSession: () => RouletteSession | undefined;

  // Actions (swipe log)
  recordAction: (input: {
    session_id: string;
    vendor_id: string;
    action: RouletteAction;
    position_in_stack: number;
    time_spent_seconds: number;
    images_viewed: number;
    viewed_full_profile: boolean;
  }) => void;
  getActionsForSession: (sessionId: string) => RouletteActionRecord[];
  getSeenVendorIds: () => Set<string>;

  // Filter memory
  rememberFilters: (filters: RouletteFilters) => void;

  // Full reset (debug / "start fresh")
  resetAll: () => void;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useRouletteStore = create<RouletteState>()(
  persist(
    (set, get) => ({
      sessions: [],
      actions: [],
      lastFilters: null,

      startSession: (filters, vendorOrder) => {
        const now = new Date().toISOString();
        const session: RouletteSession = {
          id: uid("rs"),
          filters,
          vendor_order: vendorOrder,
          current_index: 0,
          total_vendors: vendorOrder.length,
          is_complete: false,
          started_at: now,
          last_active_at: now,
        };
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 20),
          lastFilters: filters,
        }));
        return session;
      },

      getSession: (id) => get().sessions.find((s) => s.id === id),

      advanceSession: (id, newIndex) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  current_index: newIndex,
                  last_active_at: new Date().toISOString(),
                }
              : s,
          ),
        })),

      completeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  is_complete: true,
                  completed_at: new Date().toISOString(),
                  last_active_at: new Date().toISOString(),
                }
              : s,
          ),
        })),

      resumeLatestSession: () => {
        const active = get().sessions.find((s) => !s.is_complete);
        return active;
      },

      recordAction: (input) =>
        set((state) => ({
          actions: [
            ...state.actions,
            {
              id: uid("ra"),
              ...input,
              created_at: new Date().toISOString(),
            },
          ],
        })),

      getActionsForSession: (sessionId) =>
        get().actions.filter((a) => a.session_id === sessionId),

      getSeenVendorIds: () => new Set(get().actions.map((a) => a.vendor_id)),

      rememberFilters: (filters) => set({ lastFilters: filters }),

      resetAll: () =>
        set({ sessions: [], actions: [], lastFilters: null }),
    }),
    {
      name: "ananya-roulette",
      version: 1,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    },
  ),
);

let _rouletteSyncTimer: ReturnType<typeof setTimeout> | null = null;
useRouletteStore.subscribe((state) => {
  if (_rouletteSyncTimer) clearTimeout(_rouletteSyncTimer);
  _rouletteSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("roulette_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
