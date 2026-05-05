// ── Wardrobe Build journey launcher ────────────────────────────────────────
// Tiny zustand store that tracks whether the Wardrobe Build guided journey
// is currently open and which session is in focus. The Build dual-CTAs on
// Tabs 3, 4, and 6 read this and overlay the inline shell when active.
//
// Mirrors the pattern from sweets-selection-launcher.ts.

import { create } from "zustand";
import type { WardrobeBuildSessionKey } from "@/lib/guided-journeys/wardrobe-build";

interface LauncherState {
  /** category_id of the currently-launched workspace (null when closed). */
  activeCategoryId: string | null;
  /** Which session is open / focused. */
  activeSessionKey: WardrobeBuildSessionKey | null;

  open: (categoryId: string, sessionKey: WardrobeBuildSessionKey) => void;
  setSession: (sessionKey: WardrobeBuildSessionKey) => void;
  close: () => void;
}

export const useWardrobeBuildLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
