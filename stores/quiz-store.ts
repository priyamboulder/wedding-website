// ── Quiz onboarding store ─────────────────────────────────────────────────
// Tracks which subsections have had their onboarding quiz taken, what the
// raw answers were, who took it, and which quiz-written fields the user
// has since edited (so retakes don't clobber their work).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  QuizAnswerMap,
  QuizCompletion,
  QuizTakenBy,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";

interface QuizState {
  completions: QuizCompletion[];
  // "{slug}:{subsection}" keys the user explicitly dismissed via
  // "Skip, I'll fill it in myself". Different from "no completion" —
  // we want to hide the entry card without requiring a finished quiz.
  dismissed: string[];

  // ── Selectors ───────────────────────────────────────────────────────
  getCompletion: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => QuizCompletion | undefined;
  isDismissed: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => boolean;

  // ── Mutators ────────────────────────────────────────────────────────
  recordCompletion: (args: {
    category: WorkspaceCategorySlug;
    subsection: string;
    quiz_id: string;
    quiz_version: string;
    answers: QuizAnswerMap;
    takenBy: QuizTakenBy;
    plannerDraft: boolean;
  }) => QuizCompletion;
  dismiss: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => void;
  undismiss: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => void;
  markFieldEdited: (
    category: WorkspaceCategorySlug,
    subsection: string,
    fieldKey: string,
  ) => void;
  clearCompletion: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => void;
  // Called when a couple role opens a section that was marked
  // planner_draft — removes the badge.
  confirmPlannerDraft: (
    category: WorkspaceCategorySlug,
    subsection: string,
  ) => void;
}

const key = (category: WorkspaceCategorySlug, subsection: string) =>
  `${category}:${subsection}`;

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      completions: [],
      dismissed: [],

      getCompletion: (category, subsection) =>
        get().completions.find(
          (c) => c.category === category && c.subsection === subsection,
        ),

      isDismissed: (category, subsection) =>
        get().dismissed.includes(key(category, subsection)),

      recordCompletion: ({
        category,
        subsection,
        quiz_id,
        quiz_version,
        answers,
        takenBy,
        plannerDraft,
      }) => {
        const k = key(category, subsection);
        const entry: QuizCompletion = {
          key: k,
          category,
          subsection,
          quiz_id,
          quiz_version,
          quiz_answers: answers,
          quiz_completed_at: new Date().toISOString(),
          quiz_taken_by: takenBy,
          manually_edited_fields: [],
          planner_draft: plannerDraft,
        };
        set((s) => ({
          completions: [
            ...s.completions.filter((c) => c.key !== k),
            entry,
          ],
          // Completing the quiz clears a prior dismissal.
          dismissed: s.dismissed.filter((d) => d !== k),
        }));
        return entry;
      },

      dismiss: (category, subsection) => {
        const k = key(category, subsection);
        set((s) => ({
          dismissed: s.dismissed.includes(k)
            ? s.dismissed
            : [...s.dismissed, k],
        }));
      },
      undismiss: (category, subsection) => {
        const k = key(category, subsection);
        set((s) => ({ dismissed: s.dismissed.filter((d) => d !== k) }));
      },

      markFieldEdited: (category, subsection, fieldKey) => {
        const k = key(category, subsection);
        set((s) => ({
          completions: s.completions.map((c) => {
            if (c.key !== k) return c;
            if (c.manually_edited_fields.includes(fieldKey)) return c;
            return {
              ...c,
              manually_edited_fields: [
                ...c.manually_edited_fields,
                fieldKey,
              ],
            };
          }),
        }));
      },

      clearCompletion: (category, subsection) => {
        const k = key(category, subsection);
        set((s) => ({
          completions: s.completions.filter((c) => c.key !== k),
        }));
      },

      confirmPlannerDraft: (category, subsection) => {
        const k = key(category, subsection);
        set((s) => ({
          completions: s.completions.map((c) =>
            c.key === k ? { ...c, planner_draft: false } : c,
          ),
        }));
      },
    }),
    {
      name: "ananya:quiz-onboarding",
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
    },
  ),
);

let _quizSyncTimer: ReturnType<typeof setTimeout> | null = null;
useQuizStore.subscribe((state) => {
  if (_quizSyncTimer) clearTimeout(_quizSyncTimer);
  _quizSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("quiz_completions", { couple_id: coupleId, quiz_key: "_all", data: { completions: state.completions, dismissed: state.dismissed } });
  }, 600);
});
