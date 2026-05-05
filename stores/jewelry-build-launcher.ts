// ── Jewelry Build journey launcher ────────────────────────────────────────
// Tiny zustand store that tracks whether the Jewelry Build guided journey
// is currently open and which session is in focus. The JewelryCanvas reads
// this and overrides its body when active.

import { create } from "zustand";
import type { JewelryBuildSessionKey } from "@/lib/guided-journeys/jewelry-build";

interface LauncherState {
  /** category_id of the currently-launched workspace (null when closed). */
  activeCategoryId: string | null;
  /** Which session is open / focused. */
  activeSessionKey: JewelryBuildSessionKey | null;

  open: (categoryId: string, sessionKey: JewelryBuildSessionKey) => void;
  setSession: (sessionKey: JewelryBuildSessionKey) => void;
  close: () => void;
}

export const useJewelryBuildLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
