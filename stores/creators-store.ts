import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Creator,
  CreatorCollection,
  CreatorPick,
  CreatorFollow,
  ReferralEvent,
  ReferralType,
} from "@/types/creator";
import {
  SEED_CREATORS,
  SEED_COLLECTIONS,
  SEED_PICKS,
} from "@/lib/creators/seed";
import { getStoreProduct } from "@/lib/store-seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface CreatorsState {
  // Catalog (seeded on load — source of truth is the seed file; persist only
  // user actions, following the exhibitions store pattern).
  creators: Creator[];
  collections: CreatorCollection[];
  picks: CreatorPick[];

  // User state (persisted)
  follows: CreatorFollow[];
  referrals: ReferralEvent[];

  // ── Catalog reads
  listCreators: () => Creator[];
  getCreator: (id: string) => Creator | undefined;
  getCollection: (id: string) => CreatorCollection | undefined;
  getCollectionsByCreator: (creatorId: string) => CreatorCollection[];
  getCollectionsByModule: (module: string) => CreatorCollection[];
  getActiveExhibitionCollections: () => CreatorCollection[];
  getPicksByCollection: (collectionId: string) => CreatorPick[];
  getCreatorForPick: (productId: string) => Creator | undefined;

  // ── Follows
  isFollowing: (creatorId: string) => boolean;
  toggleFollow: (creatorId: string) => void;
  followerCountFor: (creatorId: string) => number;

  // ── Referral tracking
  trackReferral: (args: {
    creatorId: string;
    productId?: string | null;
    collectionId?: string | null;
    referralType: ReferralType;
  }) => ReferralEvent;
  markReferralConverted: (
    referralId: string,
    orderId: string,
    orderSubtotal: number,
  ) => void;
  referralsForCreator: (creatorId: string) => ReferralEvent[];
  earningsForCreator: (creatorId: string) => {
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    pendingPayout: number;
    totalEarnings: number;
  };
}

type PersistedSlice = Pick<CreatorsState, "follows" | "referrals">;

export function isWithinExhibitionWindow(c: CreatorCollection): boolean {
  if (!c.isExhibition) return false;
  const now = Date.now();
  const start = c.exhibitionStart ? new Date(c.exhibitionStart).getTime() : 0;
  const end = c.exhibitionEnd
    ? new Date(c.exhibitionEnd).getTime()
    : Infinity;
  return now >= start && now <= end && c.status === "active";
}

export const useCreatorsStore = create<CreatorsState>()(
  persist(
    (set, get) => ({
      creators: SEED_CREATORS,
      collections: SEED_COLLECTIONS,
      picks: SEED_PICKS,

      follows: [],
      referrals: [],

      listCreators: () => get().creators,
      getCreator: (id) => get().creators.find((c) => c.id === id),
      getCollection: (id) => get().collections.find((c) => c.id === id),
      getCollectionsByCreator: (creatorId) =>
        get()
          .collections.filter((c) => c.creatorId === creatorId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      getCollectionsByModule: (module) =>
        get().collections.filter(
          (c) => c.module === module && c.status === "active",
        ),
      getActiveExhibitionCollections: () =>
        get().collections.filter(isWithinExhibitionWindow),
      getPicksByCollection: (collectionId) =>
        get()
          .picks.filter((p) => p.collectionId === collectionId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      getCreatorForPick: (productId) => {
        const pick = get().picks.find((p) => p.productId === productId);
        if (!pick) return undefined;
        const collection = get().collections.find(
          (c) => c.id === pick.collectionId,
        );
        if (!collection) return undefined;
        return get().creators.find((c) => c.id === collection.creatorId);
      },

      isFollowing: (creatorId) =>
        get().follows.some((f) => f.creatorId === creatorId),
      toggleFollow: (creatorId) =>
        set((state) => {
          const existing = state.follows.find((f) => f.creatorId === creatorId);
          if (existing) {
            return {
              follows: state.follows.filter((f) => f.creatorId !== creatorId),
            };
          }
          return {
            follows: [
              ...state.follows,
              { creatorId, followedAt: new Date().toISOString() },
            ],
          };
        }),
      followerCountFor: (creatorId) => {
        const base =
          get().creators.find((c) => c.id === creatorId)?.followerCount ?? 0;
        const mine = get().follows.some((f) => f.creatorId === creatorId)
          ? 1
          : 0;
        return base + mine;
      },

      trackReferral: (args) => {
        const event: ReferralEvent = {
          id: uuid(),
          creatorId: args.creatorId,
          productId: args.productId ?? null,
          collectionId: args.collectionId ?? null,
          referralType: args.referralType,
          clickedAt: new Date().toISOString(),
          convertedAt: null,
          orderId: null,
          commissionAmount: 0,
        };
        set((state) => ({ referrals: [event, ...state.referrals] }));
        return event;
      },
      markReferralConverted: (referralId, orderId, orderSubtotal) =>
        set((state) => ({
          referrals: state.referrals.map((r) => {
            if (r.id !== referralId) return r;
            const creator = state.creators.find((c) => c.id === r.creatorId);
            const rate = creator?.commissionRate ?? 0;
            return {
              ...r,
              convertedAt: new Date().toISOString(),
              orderId,
              commissionAmount: Math.round(orderSubtotal * rate),
            };
          }),
        })),
      referralsForCreator: (creatorId) =>
        get().referrals.filter((r) => r.creatorId === creatorId),
      earningsForCreator: (creatorId) => {
        const all = get().referrals.filter((r) => r.creatorId === creatorId);
        const creator = get().creators.find((c) => c.id === creatorId);
        const totalClicks = all.length;
        const conversions = all.filter((r) => r.convertedAt != null);
        const totalConversions = conversions.length;
        const conversionRate =
          totalClicks === 0 ? 0 : totalConversions / totalClicks;
        const runtimeCommission = conversions.reduce(
          (sum, r) => sum + r.commissionAmount,
          0,
        );
        return {
          totalClicks,
          totalConversions,
          conversionRate,
          pendingPayout: (creator?.pendingPayout ?? 0) + runtimeCommission,
          totalEarnings: (creator?.totalEarnings ?? 0) + runtimeCommission,
        };
      },
    }),
    {
      name: "ananya-creators",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        follows: state.follows,
        referrals: state.referrals,
      }),
    },
  ),
);

let _creatorsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCreatorsStore.subscribe((state) => {
  if (_creatorsSyncTimer) clearTimeout(_creatorsSyncTimer);
  _creatorsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("creators_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Public helper — resolves a pick to the hydrated product object. Returns
// null if the product has been removed from the catalog.
export function resolvePickToProduct(pick: CreatorPick) {
  return getStoreProduct(pick.productId);
}
