import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type { Guide, GuideSave } from "@/types/guide";
import {
  SEED_GUIDES,
  listPublishedGuides,
  getGuide,
  getGuideBySlug,
  getGuidesByCreator,
  getGuidesFeaturingProduct,
} from "@/lib/guides/seed";

// Following the creators-store pattern: catalog (seed) is rebuilt on load,
// only user state (saves + view tally) is persisted to localStorage.

interface GuidesState {
  guides: Guide[];
  saves: GuideSave[];
  // Track which guide ids the user has "viewed" this session, so the
  // save-count badge can reflect a +1 view without spamming the counter on
  // every render.
  viewed: string[];

  // Catalog reads (delegate to seed helpers so the store stays a thin
  // wrapper and the seed file stays the source of truth).
  listGuides: () => Guide[];
  getGuide: (id: string) => Guide | undefined;
  getGuideBySlug: (slug: string) => Guide | undefined;
  getGuidesByCreator: (creatorId: string) => Guide[];
  getGuidesFeaturingProduct: (productId: string) => Guide[];

  // Saves
  isSaved: (guideId: string) => boolean;
  toggleSave: (guideId: string) => void;
  saveCountFor: (guideId: string) => number;

  // Views
  markViewed: (guideId: string) => void;
  viewCountFor: (guideId: string) => number;
}

type PersistedSlice = Pick<GuidesState, "saves" | "viewed">;

export const useGuidesStore = create<GuidesState>()(
  persist(
    (set, get) => ({
      guides: SEED_GUIDES,
      saves: [],
      viewed: [],

      listGuides: () => listPublishedGuides(),
      getGuide: (id) => getGuide(id),
      getGuideBySlug: (slug) => getGuideBySlug(slug),
      getGuidesByCreator: (creatorId) => getGuidesByCreator(creatorId),
      getGuidesFeaturingProduct: (productId) =>
        getGuidesFeaturingProduct(productId),

      isSaved: (guideId) => get().saves.some((s) => s.guideId === guideId),
      toggleSave: (guideId) =>
        set((state) => {
          const existing = state.saves.find((s) => s.guideId === guideId);
          if (existing) {
            return { saves: state.saves.filter((s) => s.guideId !== guideId) };
          }
          return {
            saves: [
              ...state.saves,
              { guideId, savedAt: new Date().toISOString() },
            ],
          };
        }),
      saveCountFor: (guideId) => {
        const base = SEED_GUIDES.find((g) => g.id === guideId)?.baseSaveCount ?? 0;
        const mine = get().saves.some((s) => s.guideId === guideId) ? 1 : 0;
        return base + mine;
      },

      markViewed: (guideId) =>
        set((state) => {
          if (state.viewed.includes(guideId)) return state;
          return { viewed: [...state.viewed, guideId] };
        }),
      viewCountFor: (guideId) => {
        const base = SEED_GUIDES.find((g) => g.id === guideId)?.baseViewCount ?? 0;
        const mine = get().viewed.includes(guideId) ? 1 : 0;
        return base + mine;
      },
    }),
    {
      name: "ananya-guides",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        saves: state.saves,
        viewed: state.viewed,
      }),
    },
  ),
);

let _guidesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useGuidesStore.subscribe((state) => {
  if (_guidesSyncTimer) clearTimeout(_guidesSyncTimer);
  _guidesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("guides_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
