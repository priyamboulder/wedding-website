// ── Real Numbers store ─────────────────────────────────────────────────────
// Zustand + localStorage (key: `ananya:real-numbers`). Seeds on first load
// with anonymized demo data so browse view never renders empty. A single
// bride-per-device means `mySubmissionId` tracks her contribution.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CostItem,
  CostSubmission,
  RealNumbersState,
  WorthIt,
} from "@/types/real-numbers";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ── Input shapes ──────────────────────────────────────────────────────────

export interface SubmissionDraftInput {
  wedding_city: string;
  wedding_state: string;
  wedding_country?: string;
  wedding_month: number;
  wedding_year: number;
  guest_count: number;
  wedding_style: CostSubmission["wedding_style"];
  cultural_tradition: CostSubmission["cultural_tradition"];
  wedding_duration_days: number;
  number_of_events: number;
  advice_text?: string;
  auto_populated?: boolean;
  items: Array<{
    vendor_category: string;
    budgeted_cents: number | null;
    actual_cents: number;
    worth_it?: WorthIt | null;
    notes?: string;
  }>;
}

interface Actions {
  ensureSeeded: () => Promise<void>;

  /** Create or update my submission (one per bride). Stays as a draft until `publish`. */
  saveMyDraft: (input: SubmissionDraftInput) => string;

  publishMySubmission: () => void;
  unpublishMySubmission: () => void;
  deleteMySubmission: () => void;

  toggleHelpful: (submissionId: string) => void;

  // ── Selectors ──
  mySubmission: () => CostSubmission | null;
  myItems: () => CostItem[];
  itemsBySubmission: (submissionId: string) => CostItem[];
  publishedSubmissions: () => CostSubmission[];
}

const INITIAL: RealNumbersState = {
  submissions: [],
  items: [],
  helpfulVotes: {},
  mySubmissionId: null,
  seeded: false,
};

export const useRealNumbersStore = create<RealNumbersState & Actions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      ensureSeeded: async () => {
        if (get().seeded) return;
        const { buildRealNumbersSeed } = await import("@/lib/real-numbers-seed");
        const { submissions, items } = buildRealNumbersSeed();
        set({ submissions, items, seeded: true });
      },

      saveMyDraft: (input) => {
        const existing = get().mySubmissionId
          ? get().submissions.find((s) => s.id === get().mySubmissionId) ?? null
          : null;

        const totalBudget = input.items.reduce(
          (sum, it) => sum + (it.budgeted_cents ?? 0),
          0,
        );
        const totalActual = input.items.reduce(
          (sum, it) => sum + it.actual_cents,
          0,
        );

        const submissionId = existing?.id ?? uid("sub");
        const submission: CostSubmission = existing
          ? {
              ...existing,
              wedding_city: input.wedding_city,
              wedding_state: input.wedding_state,
              wedding_country: input.wedding_country ?? existing.wedding_country,
              wedding_month: input.wedding_month,
              wedding_year: input.wedding_year,
              guest_count: input.guest_count,
              wedding_style: input.wedding_style,
              cultural_tradition: input.cultural_tradition,
              wedding_duration_days: input.wedding_duration_days,
              number_of_events: input.number_of_events,
              total_budget_cents: totalBudget,
              total_actual_cents: totalActual,
              advice_text: input.advice_text ?? existing.advice_text,
              auto_populated:
                input.auto_populated ?? existing.auto_populated,
              manually_adjusted: true,
              updated_at: nowIso(),
            }
          : {
              id: submissionId,
              wedding_city: input.wedding_city,
              wedding_state: input.wedding_state,
              wedding_country: input.wedding_country ?? "US",
              wedding_month: input.wedding_month,
              wedding_year: input.wedding_year,
              guest_count: input.guest_count,
              wedding_style: input.wedding_style,
              cultural_tradition: input.cultural_tradition,
              wedding_duration_days: input.wedding_duration_days,
              number_of_events: input.number_of_events,
              total_budget_cents: totalBudget,
              total_actual_cents: totalActual,
              advice_text: input.advice_text ?? "",
              is_published: false,
              published_at: null,
              auto_populated: input.auto_populated ?? false,
              manually_adjusted: false,
              helpful_count: 0,
              created_at: nowIso(),
              updated_at: nowIso(),
            };

        const nextItems: CostItem[] = input.items.map((it) => ({
          id: uid("item"),
          submission_id: submissionId,
          vendor_category: it.vendor_category,
          budgeted_cents: it.budgeted_cents,
          actual_cents: it.actual_cents,
          vendor_count: 1,
          includes_tip: false,
          notes: it.notes ?? "",
          worth_it: it.worth_it ?? null,
          created_at: nowIso(),
        }));

        set((s) => {
          const otherSubs = existing
            ? s.submissions.filter((x) => x.id !== existing.id)
            : s.submissions;
          const otherItems = existing
            ? s.items.filter((x) => x.submission_id !== existing.id)
            : s.items;
          return {
            submissions: [submission, ...otherSubs],
            items: [...nextItems, ...otherItems],
            mySubmissionId: submissionId,
          };
        });

        return submissionId;
      },

      publishMySubmission: () => {
        const id = get().mySubmissionId;
        if (!id) return;
        set((s) => ({
          submissions: s.submissions.map((x) =>
            x.id === id
              ? {
                  ...x,
                  is_published: true,
                  published_at: x.published_at ?? nowIso(),
                  updated_at: nowIso(),
                }
              : x,
          ),
        }));
      },

      unpublishMySubmission: () => {
        const id = get().mySubmissionId;
        if (!id) return;
        set((s) => ({
          submissions: s.submissions.map((x) =>
            x.id === id
              ? { ...x, is_published: false, updated_at: nowIso() }
              : x,
          ),
        }));
      },

      deleteMySubmission: () => {
        const id = get().mySubmissionId;
        if (!id) return;
        set((s) => ({
          submissions: s.submissions.filter((x) => x.id !== id),
          items: s.items.filter((x) => x.submission_id !== id),
          mySubmissionId: null,
        }));
      },

      toggleHelpful: (submissionId) => {
        set((s) => {
          const voted = Boolean(s.helpfulVotes[submissionId]);
          const nextVotes = { ...s.helpfulVotes };
          if (voted) delete nextVotes[submissionId];
          else nextVotes[submissionId] = true;
          return {
            helpfulVotes: nextVotes,
            submissions: s.submissions.map((x) =>
              x.id === submissionId
                ? {
                    ...x,
                    helpful_count: Math.max(
                      0,
                      x.helpful_count + (voted ? -1 : 1),
                    ),
                  }
                : x,
            ),
          };
        });
      },

      // ── Selectors ───────────────────────────────────────────────────
      mySubmission: () => {
        const id = get().mySubmissionId;
        return id ? get().submissions.find((s) => s.id === id) ?? null : null;
      },
      myItems: () => {
        const id = get().mySubmissionId;
        return id ? get().items.filter((x) => x.submission_id === id) : [];
      },
      itemsBySubmission: (submissionId) =>
        get().items.filter((x) => x.submission_id === submissionId),
      publishedSubmissions: () =>
        get().submissions.filter((s) => s.is_published),
    }),
    {
      name: "ananya:real-numbers",
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
        submissions: s.submissions,
        items: s.items,
        helpfulVotes: s.helpfulVotes,
        mySubmissionId: s.mySubmissionId,
        seeded: s.seeded,
      }),
    },
  ),
);

let _realNumbersSyncTimer: ReturnType<typeof setTimeout> | null = null;
useRealNumbersStore.subscribe((state) => {
  if (_realNumbersSyncTimer) clearTimeout(_realNumbersSyncTimer);
  _realNumbersSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("real_numbers_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
