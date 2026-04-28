import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import {
  REVIEWS,
  REVIEW_REQUESTS,
  type Review,
  type ReviewRequest,
} from "@/lib/vendor-portal/seed";

type NewRequestInput = {
  coupleName: string;
  email: string;
  eventType?: string;
  weddingDate?: string;
};

interface VendorReviewsState {
  reviews: Review[];
  requests: ReviewRequest[];
  setResponse: (id: string, text: string) => void;
  clearResponse: (id: string) => void;
  toggleFeatured: (id: string) => void;
  addRequest: (input: NewRequestInput) => string;
  resendRequest: (id: string) => void;
  removeRequest: (id: string) => void;
  resetToSeed: () => void;
}

export const useVendorReviewsStore = create<VendorReviewsState>()(
  persist(
    (set) => ({
      reviews: REVIEWS,
      requests: REVIEW_REQUESTS,

      setResponse: (id, text) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, response: text.trim() || undefined } : r,
          ),
        })),

      clearResponse: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, response: undefined } : r,
          ),
        })),

      toggleFeatured: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, featured: !r.featured } : r,
          ),
        })),

      addRequest: (input) => {
        const id = `rq-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        set((s) => ({
          requests: [
            {
              id,
              coupleName: input.coupleName.trim(),
              email: input.email.trim(),
              eventType: input.eventType?.trim() || undefined,
              weddingDate: input.weddingDate?.trim() || undefined,
              sentAt: "just now",
              status: "sent",
            },
            ...s.requests,
          ],
        }));
        return id;
      },

      resendRequest: (id) =>
        set((s) => ({
          requests: s.requests.map((q) =>
            q.id === id ? { ...q, sentAt: "just now", status: "reminded" } : q,
          ),
        })),

      removeRequest: (id) =>
        set((s) => ({ requests: s.requests.filter((q) => q.id !== id) })),

      resetToSeed: () => set({ reviews: REVIEWS, requests: REVIEW_REQUESTS }),
    }),
    {
      name: "ananya:vendor-reviews",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _vendorReviewsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVendorReviewsStore.subscribe((state) => {
  if (_vendorReviewsSyncTimer) clearTimeout(_vendorReviewsSyncTimer);
  _vendorReviewsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("vendor_reviews_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
