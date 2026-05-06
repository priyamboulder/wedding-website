// ── Venue Build journey launcher ───────────────────────────────────────────
// Tiny zustand store that tracks whether the Venue Build guided journey is
// currently open and which session is in focus. The Build dual-CTAs on
// Spaces & Flow and Logistics & Rules read this and overlay the inline
// shell when active. The smart-resume nudge on Dream & Discover writes
// to it (alongside switching the active tab) when the couple clicks "Start
// Build" — so the shell is already open by the time they land on the
// destination tab.
//
// Mirrors the pattern from wardrobe-build-launcher.ts.

import { create } from "zustand";
import type { VenueBuildSessionKey } from "@/lib/guided-journeys/venue-build";

interface LauncherState {
  /** Which session is open / focused. Null when the journey is closed. */
  activeSessionKey: VenueBuildSessionKey | null;

  open: (sessionKey: VenueBuildSessionKey) => void;
  setSession: (sessionKey: VenueBuildSessionKey) => void;
  close: () => void;
}

export const useVenueBuildLauncher = create<LauncherState>((set) => ({
  activeSessionKey: null,
  open: (sessionKey) => set({ activeSessionKey: sessionKey }),
  setSession: (sessionKey) => set({ activeSessionKey: sessionKey }),
  close: () => set({ activeSessionKey: null }),
}));
