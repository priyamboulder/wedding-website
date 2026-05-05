// ── Dashboard Journey store ────────────────────────────────────────────
//
// Persists journey-specific state that doesn't naturally live in the
// existing events / brief / checklist stores:
//   - which step the couple has expanded
//   - the chosen mood / palette ID for Step 3
//   - per-event dress codes for Step 4
//   - whether timeline milestones have been generated for Step 5
//   - explicit user-marked completion (skipped or revisited)
//
// Step "completion" is computed in the consumer by combining this
// store's flags with derived signals (events.length, weddingDate, etc).
// This store only persists the bits that can't be derived elsewhere.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  EMPTY_DRESS_CODE,
  type DressCode,
} from "@/lib/journey/dress-code-options";

export type JourneyStepId = 1 | 2 | 3 | 4 | 5;

interface JourneyState {
  /** The step currently expanded in the UI; null = follow auto-advance. */
  activeStep: JourneyStepId | null;
  /** When the couple has explicitly minimized the foundation banner. */
  bannerDismissed: boolean;
  /** Mood / palette ID selected in Step 3 (see lib/journey/mood-palettes). */
  selectedMoodId: string | null;
  /** Custom 5-color palette built in Step 3 if the couple opts to skip moods. */
  customPalette: string[] | null;
  /** Per-event dress codes set in Step 4, keyed by event id. */
  dressCodes: Record<string, DressCode>;
  /** Auspicious dates the couple has favorited in Step 1's finder. */
  favoriteAuspiciousIso: string[];
  /** True after Step 5's timeline has been generated and seeded. */
  timelineGenerated: boolean;
  timelineGeneratedAt: string | null;

  // ── actions ──
  setActiveStep: (step: JourneyStepId | null) => void;
  dismissBanner: () => void;
  reopenBanner: () => void;
  setSelectedMood: (id: string | null) => void;
  setCustomPalette: (colors: string[] | null) => void;
  setDressCode: (eventId: string, patch: Partial<DressCode>) => void;
  clearDressCode: (eventId: string) => void;
  toggleFavoriteAuspicious: (iso: string) => void;
  markTimelineGenerated: () => void;
  resetTimeline: () => void;
}

export const useDashboardJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      activeStep: null,
      bannerDismissed: false,
      selectedMoodId: null,
      customPalette: null,
      dressCodes: {},
      favoriteAuspiciousIso: [],
      timelineGenerated: false,
      timelineGeneratedAt: null,

      setActiveStep: (step) => set({ activeStep: step }),

      dismissBanner: () => set({ bannerDismissed: true }),
      reopenBanner: () => set({ bannerDismissed: false }),

      setSelectedMood: (id) =>
        set({ selectedMoodId: id, customPalette: id ? null : undefined as unknown as null }),
      setCustomPalette: (colors) =>
        set({ customPalette: colors, selectedMoodId: colors ? null : undefined as unknown as null }),

      setDressCode: (eventId, patch) =>
        set((s) => ({
          dressCodes: {
            ...s.dressCodes,
            [eventId]: {
              ...(s.dressCodes[eventId] ?? EMPTY_DRESS_CODE),
              ...patch,
            },
          },
        })),
      clearDressCode: (eventId) =>
        set((s) => {
          const next = { ...s.dressCodes };
          delete next[eventId];
          return { dressCodes: next };
        }),

      toggleFavoriteAuspicious: (iso) =>
        set((s) => ({
          favoriteAuspiciousIso: s.favoriteAuspiciousIso.includes(iso)
            ? s.favoriteAuspiciousIso.filter((d) => d !== iso)
            : [...s.favoriteAuspiciousIso, iso],
        })),

      markTimelineGenerated: () =>
        set({
          timelineGenerated: true,
          timelineGeneratedAt: new Date().toISOString(),
        }),
      resetTimeline: () =>
        set({ timelineGenerated: false, timelineGeneratedAt: null }),
    }),
    {
      name: "ananya:dashboard-journey",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({
        bannerDismissed: s.bannerDismissed,
        selectedMoodId: s.selectedMoodId,
        customPalette: s.customPalette,
        dressCodes: s.dressCodes,
        favoriteAuspiciousIso: s.favoriteAuspiciousIso,
        timelineGenerated: s.timelineGenerated,
        timelineGeneratedAt: s.timelineGeneratedAt,
      }),
    },
  ),
);
