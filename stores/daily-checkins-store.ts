// ── Daily check-ins store ──────────────────────────────────────────────
// Persists the couple's one-per-day journaling responses, used by the
// dashboard's daily check-in card and the Year in Review keepsake.
//
// One entry per ISO date. If the couple "changes their answer" we
// overwrite the existing record for that day rather than appending — the
// check-in is a snapshot of how they felt, and we want a single canonical
// per-day entry for the keepsake.
//
// Schema mirrors the prompt:
//   id · couple_id · question · response · created_at · mood_tag (opt)

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CheckInHistoryEntry } from "@/lib/dashboard/checkin-questions";

export interface DailyCheckIn {
  id: string;
  /** ISO date (YYYY-MM-DD) — one entry per couple per day. */
  date: string;
  questionId: string;
  /** Verbatim question text — stored so the keepsake is self-contained. */
  questionText: string;
  response: string;
  moodTag?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SaveInput {
  date: string;
  questionId: string;
  questionText: string;
  response: string;
  moodTag?: string | null;
}

interface DailyCheckInsState {
  entries: DailyCheckIn[];
  saveCheckIn: (input: SaveInput) => DailyCheckIn;
  deleteCheckIn: (id: string) => void;
  getEntryForDate: (isoDate: string) => DailyCheckIn | null;
  history: () => CheckInHistoryEntry[];
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ci_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useDailyCheckInsStore = create<DailyCheckInsState>()(
  persist(
    (set, get) => ({
      entries: [],

      saveCheckIn: (input) => {
        const now = new Date().toISOString();
        const trimmed = input.response.trim();
        const existing = get().entries.find((e) => e.date === input.date);
        if (existing) {
          const updated: DailyCheckIn = {
            ...existing,
            questionId: input.questionId,
            questionText: input.questionText,
            response: trimmed,
            moodTag: input.moodTag ?? existing.moodTag ?? null,
            updatedAt: now,
          };
          set((s) => ({
            entries: s.entries.map((e) => (e.id === existing.id ? updated : e)),
          }));
          return updated;
        }
        const entry: DailyCheckIn = {
          id: uid(),
          date: input.date,
          questionId: input.questionId,
          questionText: input.questionText,
          response: trimmed,
          moodTag: input.moodTag ?? null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return entry;
      },

      deleteCheckIn: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      getEntryForDate: (isoDate) =>
        get().entries.find((e) => e.date === isoDate) ?? null,

      history: () =>
        get().entries.map((e) => ({ questionId: e.questionId, date: e.date })),
    }),
    {
      name: "ananya:daily-checkins",
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
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
