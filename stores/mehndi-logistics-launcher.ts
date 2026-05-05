// ── Mehendi Logistics journey launcher ──────────────────────────────────
// Tiny zustand store that tracks whether the Logistics guided journey is
// currently open and which session is in focus. The MehndiCanvas reads
// this and overrides its body when active.

import { create } from "zustand";
import type { LogisticsSessionKey } from "@/lib/guided-journeys/mehendi-logistics";

interface LauncherState {
  // category_id of the currently-launched workspace (null when closed).
  activeCategoryId: string | null;
  // Which session is open / focused.
  activeSessionKey: LogisticsSessionKey | null;

  open: (categoryId: string, sessionKey: LogisticsSessionKey) => void;
  setSession: (sessionKey: LogisticsSessionKey) => void;
  close: () => void;
}

export const useMehendiLogisticsLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
