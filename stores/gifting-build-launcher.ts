// ── Gifting Build journey launcher ─────────────────────────────────────────
// Tiny zustand store that tracks whether the Gifting Build guided journey
// is currently open and which session is in focus. The Build dual-CTAs on
// Tabs 3, 4, 5, and 6 read this and overlay the inline shell when active.
//
// Mirrors the pattern from wardrobe-build-launcher.ts.

import { create } from "zustand";
import type { GiftingBuildSessionKey } from "@/lib/guided-journeys/gifting-build";

interface LauncherState {
  /** category_id of the currently-launched workspace (null when closed). */
  activeCategoryId: string | null;
  /** Which session is open / focused. */
  activeSessionKey: GiftingBuildSessionKey | null;

  open: (categoryId: string, sessionKey: GiftingBuildSessionKey) => void;
  setSession: (sessionKey: GiftingBuildSessionKey) => void;
  close: () => void;
}

export const useGiftingBuildLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
