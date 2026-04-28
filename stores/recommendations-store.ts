// ── Recommendations store (couple-scoped) ──────────────────────────────────
// Persists the latest batch of AI recommendations per (wedding_id, category),
// plus thumb/dismiss feedback and dismissal list. When Supabase lands these
// tables move server-side; shape is identical.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  RecommendationDismissal,
  RecommendationFeedback,
  VendorRecommendation,
} from "@/types/recommendations";
import type { VendorCategory } from "@/types/vendor";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface RecommendationsState {
  recommendations: VendorRecommendation[];
  dismissals: RecommendationDismissal[];

  // ── Mutations ──────────────────────────────────────────────────────────
  replaceBatch: (
    wedding_id: string,
    category: VendorCategory,
    batch: VendorRecommendation[],
  ) => void;
  setFeedback: (
    id: string,
    feedback: RecommendationFeedback,
    note?: string,
  ) => void;
  dismissVendor: (
    wedding_id: string,
    category: VendorCategory,
    vendor_id: string,
    note?: string,
  ) => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  listFor: (
    wedding_id: string,
    category: VendorCategory,
  ) => VendorRecommendation[];
  dismissalsFor: (
    wedding_id: string,
    category: VendorCategory,
  ) => RecommendationDismissal[];
  thumbsUpVendorIds: (
    wedding_id: string,
    category: VendorCategory,
  ) => string[];
  thumbsDownVendorIds: (
    wedding_id: string,
    category: VendorCategory,
  ) => string[];
}

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      recommendations: [],
      dismissals: [],

      replaceBatch: (wedding_id, category, batch) =>
        set((state) => ({
          recommendations: [
            ...state.recommendations.filter(
              (r) =>
                !(r.wedding_id === wedding_id && r.category === category) ||
                r.feedback, // keep entries that have feedback — historical record
            ),
            ...batch,
          ],
        })),

      setFeedback: (id, feedback, note) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id
              ? {
                  ...r,
                  feedback,
                  feedback_at: new Date().toISOString(),
                  ...(note !== undefined && { feedback_note: note }),
                }
              : r,
          ),
        })),

      dismissVendor: (wedding_id, category, vendor_id, note) =>
        set((state) => {
          const already = state.dismissals.find(
            (d) =>
              d.wedding_id === wedding_id &&
              d.category === category &&
              d.vendor_id === vendor_id,
          );
          if (already) return state;
          return {
            dismissals: [
              ...state.dismissals,
              {
                wedding_id,
                category,
                vendor_id,
                dismissed_at: new Date().toISOString(),
                ...(note && { note }),
              },
            ],
            recommendations: state.recommendations.map((r) =>
              r.wedding_id === wedding_id &&
              r.category === category &&
              r.vendor_id === vendor_id
                ? {
                    ...r,
                    feedback: "dismissed" as const,
                    feedback_at: new Date().toISOString(),
                    ...(note !== undefined && { feedback_note: note }),
                  }
                : r,
            ),
          };
        }),

      listFor: (wedding_id, category) =>
        get()
          .recommendations.filter(
            (r) => r.wedding_id === wedding_id && r.category === category,
          )
          .sort((a, b) => a.rank - b.rank),

      dismissalsFor: (wedding_id, category) =>
        get().dismissals.filter(
          (d) => d.wedding_id === wedding_id && d.category === category,
        ),

      thumbsUpVendorIds: (wedding_id, category) =>
        get()
          .recommendations.filter(
            (r) =>
              r.wedding_id === wedding_id &&
              r.category === category &&
              r.feedback === "up",
          )
          .map((r) => r.vendor_id),

      thumbsDownVendorIds: (wedding_id, category) =>
        get()
          .recommendations.filter(
            (r) =>
              r.wedding_id === wedding_id &&
              r.category === category &&
              r.feedback === "down",
          )
          .map((r) => r.vendor_id),
    }),
    {
      name: "ananya:recommendations",
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

let _recommendationsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useRecommendationsStore.subscribe((state) => {
  if (_recommendationsSyncTimer) clearTimeout(_recommendationsSyncTimer);
  _recommendationsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("recommendations_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
