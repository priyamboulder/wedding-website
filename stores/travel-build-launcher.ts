// ── Travel & Accommodations Build journey launcher ─────────────────────────
// Tiny zustand store that tracks whether the Travel Build guided journey is
// currently open and which session is in focus. The Build dual-CTAs on
// Tabs 2 (Room Block Manager) and 3 (Guest Travel Hub) read this and
// overlay the inline shell when active.
//
// Mirrors the pattern from wardrobe-build-launcher.ts.

import { create } from "zustand";
import type { TravelBuildSessionKey } from "@/lib/guided-journeys/travel-accommodations-build";

interface LauncherState {
  /** category_id of the currently-launched workspace (null when closed). */
  activeCategoryId: string | null;
  /** Which session is open / focused. */
  activeSessionKey: TravelBuildSessionKey | null;

  open: (categoryId: string, sessionKey: TravelBuildSessionKey) => void;
  setSession: (sessionKey: TravelBuildSessionKey) => void;
  close: () => void;
}

export const useTravelBuildLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
