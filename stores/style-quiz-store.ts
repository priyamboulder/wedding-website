// ── Style quiz store ─────────────────────────────────────────────────────
// Drives Vendor Chemistry Match. The couple answers a 5-question visual
// quiz (photography style, decor energy, music vibe, food style, overall
// energy); we persist the responses + completion timestamp and use them to
// score vendors against the couple's aesthetic profile.
//
// Schema mirrors the dashboard prompt:
//   id · couple_id · responses (Record<dimension, optionId>) · completed_at

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StyleDimension =
  | "photography_style"
  | "decor_energy"
  | "music_vibe"
  | "food_style"
  | "overall_energy";

export type StyleQuizResponses = Partial<Record<StyleDimension, string>>;

interface StyleQuizState {
  responses: StyleQuizResponses;
  completedAt: string | null;
  startedAt: string | null;

  setAnswer: (dimension: StyleDimension, optionId: string) => void;
  markComplete: () => void;
  reset: () => void;
}

export const useStyleQuizStore = create<StyleQuizState>()(
  persist(
    (set) => ({
      responses: {},
      completedAt: null,
      startedAt: null,

      setAnswer: (dimension, optionId) =>
        set((s) => ({
          responses: { ...s.responses, [dimension]: optionId },
          startedAt: s.startedAt ?? new Date().toISOString(),
        })),

      markComplete: () =>
        set(() => ({ completedAt: new Date().toISOString() })),

      reset: () =>
        set({ responses: {}, completedAt: null, startedAt: null }),
    }),
    {
      name: "ananya:style-quiz",
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
        responses: s.responses,
        completedAt: s.completedAt,
        startedAt: s.startedAt,
      }),
    },
  ),
);
