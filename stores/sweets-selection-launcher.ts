// ── Sweets Selection journey launcher ─────────────────────────────────────
// Tiny zustand store that tracks whether the Sweets Selection guided
// journey is currently open and which session is in focus. The
// CakeSweetsCanvas reads this and overrides its body when active.

import { create } from "zustand";
import type { SweetsSelectionSessionKey } from "@/lib/guided-journeys/sweets-selection";

interface LauncherState {
  // category_id of the currently-launched workspace (null when closed).
  activeCategoryId: string | null;
  // Which session is open / focused.
  activeSessionKey: SweetsSelectionSessionKey | null;

  open: (categoryId: string, sessionKey: SweetsSelectionSessionKey) => void;
  setSession: (sessionKey: SweetsSelectionSessionKey) => void;
  close: () => void;
}

export const useSweetsSelectionLauncher = create<LauncherState>((set) => ({
  activeCategoryId: null,
  activeSessionKey: null,
  open: (categoryId, sessionKey) =>
    set({ activeCategoryId: categoryId, activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeCategoryId: null, activeSessionKey: null }),
}));
