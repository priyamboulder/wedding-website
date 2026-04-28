import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RealWeddingShowcase, ShowcaseSave } from "@/types/showcase";
import {
  SEED_SHOWCASES,
  listPublishedShowcases,
  getShowcase,
  getShowcaseBySlug,
  getFeaturedShowcase,
  getShowcasesByVendor,
  getShowcasesByProduct,
  getShowcasesByCreator,
  getRelatedShowcases,
} from "@/lib/showcases/seed";
import { computeMonthlyWinner, currentMonthKey } from "@/lib/showcases/awards";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// Following the guides-store pattern: catalog (seed) is rebuilt on load,
// only user state (saves, view tally, user-submitted showcases) is persisted.

interface ShowcasesState {
  // Catalog: seed + any user-submitted showcases merged in. The user's own
  // drafts/submissions live in localStorage and append to the published list.
  showcases: RealWeddingShowcase[];
  userShowcases: RealWeddingShowcase[];

  saves: ShowcaseSave[];
  viewed: string[];

  // Catalog reads (seed + user's own submissions). Published-only.
  listShowcases: () => RealWeddingShowcase[];
  getShowcase: (id: string) => RealWeddingShowcase | undefined;
  getShowcaseBySlug: (slug: string) => RealWeddingShowcase | undefined;
  getFeaturedShowcase: () => RealWeddingShowcase | undefined;
  getShowcasesByVendor: (vendorId: string) => RealWeddingShowcase[];
  getShowcasesByProduct: (productId: string) => RealWeddingShowcase[];
  getShowcasesByCreator: (creatorId: string) => RealWeddingShowcase[];
  getRelatedShowcases: (
    showcase: RealWeddingShowcase,
    limit?: number,
  ) => RealWeddingShowcase[];

  // Saves
  isSaved: (showcaseId: string) => boolean;
  toggleSave: (showcaseId: string) => void;
  saveCountFor: (showcaseId: string) => number;

  // Views
  markViewed: (showcaseId: string) => void;
  viewCountFor: (showcaseId: string) => number;

  // Wedding of the Month — derived from saves + seed, so no persisted
  // awards table needed. Recomputed on each call; cheap enough for the
  // handful of seeded showcases.
  getMonthlyWinnerId: () => string | null;

  // User submissions (drafts + publishes stay in localStorage).
  saveUserShowcase: (showcase: RealWeddingShowcase) => void;
  deleteUserShowcase: (id: string) => void;
}

type PersistedSlice = Pick<
  ShowcasesState,
  "saves" | "viewed" | "userShowcases"
>;

function mergeShowcases(
  user: RealWeddingShowcase[],
): RealWeddingShowcase[] {
  // User showcases override seeded ones with the same id (edit case), and
  // new ids append. Only published or draft rendered as-needed.
  const byId = new Map(SEED_SHOWCASES.map((s) => [s.id, s]));
  for (const s of user) byId.set(s.id, s);
  return Array.from(byId.values());
}

export const useShowcasesStore = create<ShowcasesState>()(
  persist(
    (set, get) => ({
      showcases: SEED_SHOWCASES,
      userShowcases: [],
      saves: [],
      viewed: [],

      listShowcases: () => {
        const userPublished = get().userShowcases.filter(
          (s) => s.status === "published",
        );
        const seedPublished = listPublishedShowcases();
        // Merge, then de-dupe by id (user copy wins).
        const byId = new Map(seedPublished.map((s) => [s.id, s]));
        for (const s of userPublished) byId.set(s.id, s);
        return Array.from(byId.values());
      },
      getShowcase: (id) => {
        const mine = get().userShowcases.find((s) => s.id === id);
        return mine ?? getShowcase(id);
      },
      getShowcaseBySlug: (slug) => {
        const mine = get().userShowcases.find((s) => s.slug === slug);
        return mine ?? getShowcaseBySlug(slug);
      },
      getFeaturedShowcase: () => getFeaturedShowcase(),
      getShowcasesByVendor: (vendorId) => {
        const seeded = getShowcasesByVendor(vendorId);
        const mine = get().userShowcases.filter(
          (s) =>
            s.status === "published" &&
            s.vendorReviews.some((r) => r.vendorId === vendorId),
        );
        return [...seeded, ...mine];
      },
      getShowcasesByProduct: (productId) => {
        const seeded = getShowcasesByProduct(productId);
        const mine = get().userShowcases.filter(
          (s) =>
            s.status === "published" &&
            s.productTags.some((t) => t.productId === productId),
        );
        return [...seeded, ...mine];
      },
      getShowcasesByCreator: (creatorId) => {
        const seeded = getShowcasesByCreator(creatorId);
        const mine = get().userShowcases.filter(
          (s) =>
            s.status === "published" &&
            s.creatorShoutouts.some((c) => c.creatorId === creatorId),
        );
        return [...seeded, ...mine];
      },
      getRelatedShowcases: (showcase, limit) =>
        getRelatedShowcases(showcase, limit),

      isSaved: (showcaseId) =>
        get().saves.some((s) => s.showcaseId === showcaseId),
      toggleSave: (showcaseId) =>
        set((state) => {
          const existing = state.saves.find((s) => s.showcaseId === showcaseId);
          if (existing) {
            return {
              saves: state.saves.filter((s) => s.showcaseId !== showcaseId),
            };
          }
          return {
            saves: [
              ...state.saves,
              { showcaseId, savedAt: new Date().toISOString() },
            ],
          };
        }),
      saveCountFor: (showcaseId) => {
        const base =
          get().getShowcase(showcaseId)?.baseSaveCount ?? 0;
        const mine = get().saves.some((s) => s.showcaseId === showcaseId)
          ? 1
          : 0;
        return base + mine;
      },

      markViewed: (showcaseId) =>
        set((state) => {
          if (state.viewed.includes(showcaseId)) return state;
          return { viewed: [...state.viewed, showcaseId] };
        }),
      viewCountFor: (showcaseId) => {
        const base = get().getShowcase(showcaseId)?.baseViewCount ?? 0;
        const mine = get().viewed.includes(showcaseId) ? 1 : 0;
        return base + mine;
      },

      getMonthlyWinnerId: () => {
        const award = computeMonthlyWinner(currentMonthKey(), get().saves);
        return award?.showcaseId ?? null;
      },

      saveUserShowcase: (showcase) =>
        set((state) => {
          const existing = state.userShowcases.findIndex(
            (s) => s.id === showcase.id,
          );
          const next = [...state.userShowcases];
          if (existing >= 0) next[existing] = showcase;
          else next.push(showcase);
          return {
            userShowcases: next,
            showcases: mergeShowcases(next),
          };
        }),
      deleteUserShowcase: (id) =>
        set((state) => {
          const next = state.userShowcases.filter((s) => s.id !== id);
          return {
            userShowcases: next,
            showcases: mergeShowcases(next),
          };
        }),
    }),
    {
      name: "ananya-showcases",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        saves: state.saves,
        viewed: state.viewed,
        userShowcases: state.userShowcases,
      }),
    },
  ),
);

let _showcasesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useShowcasesStore.subscribe((state) => {
  if (_showcasesSyncTimer) clearTimeout(_showcasesSyncTimer);
  _showcasesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("showcases_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
