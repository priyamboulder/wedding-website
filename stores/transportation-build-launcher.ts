// ── Transportation Build journey launcher ─────────────────────────────────
// Tiny zustand store that tracks whether the Transportation Build guided
// journey is currently open and which session is in focus. The
// TransportationCanvas reads this and overrides its body when active.

import { create } from "zustand";
import type { TransportationBuildSessionKey } from "@/lib/guided-journeys/transportation-build";

interface LauncherState {
  /** category_id of the currently-launched workspace (null when closed). */
  activeCategoryId: string | null;
  /** Which session is open / focused. */
  activeSessionKey: TransportationBuildSessionKey | null;

  open: (
    categoryId: string,
    sessionKey: TransportationBuildSessionKey,
  ) => void;
  setSession: (sessionKey: TransportationBuildSessionKey) => void;
  close: () => void;
}

export const useTransportationBuildLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
