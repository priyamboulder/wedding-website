import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  MarketplaceListing,
  MarketplaceCategory,
  MarketplaceSave,
  MarketplaceInquiry,
  MarketplaceReport,
  InquiryMessage,
  ListingStatus,
  ReportReason,
} from "@/types/marketplace";

// ── Current user identity ────────────────────────────────────────────────
// We don't have real auth here — pretend the signed-in bride is a single
// stable id. Components can still pass their own identity but defaulting
// to this keeps the store self-sufficient.
export const CURRENT_USER_ID = "current-user";
export const CURRENT_USER_NAME = "You";

interface MarketplaceState {
  categories: MarketplaceCategory[];
  listings: MarketplaceListing[];
  saves: MarketplaceSave[];
  inquiries: MarketplaceInquiry[];
  reports: MarketplaceReport[];

  // ── Lazy seed load
  ensureSeeded: () => Promise<void>;

  // ── Category reads
  getCategories: () => MarketplaceCategory[];
  getTopCategories: () => MarketplaceCategory[];
  getCategory: (slug: string) => MarketplaceCategory | undefined;

  // ── Listing reads
  listActive: () => MarketplaceListing[];
  getListing: (id: string) => MarketplaceListing | undefined;
  getListingsByCategory: (slug: string) => MarketplaceListing[];
  getMyListings: (userId?: string) => MarketplaceListing[];
  getRelated: (id: string, limit?: number) => MarketplaceListing[];

  // ── Listing writes
  createListing: (
    draft: Omit<
      MarketplaceListing,
      | "id"
      | "view_count"
      | "save_count"
      | "inquiry_count"
      | "expires_at"
      | "created_at"
      | "updated_at"
      | "status"
    > & { status?: ListingStatus },
  ) => MarketplaceListing;
  updateListing: (
    id: string,
    patch: Partial<MarketplaceListing>,
  ) => void;
  setListingStatus: (id: string, status: ListingStatus) => void;
  deleteListing: (id: string) => void;
  incrementView: (id: string) => void;
  relistListing: (id: string) => void;

  // ── Saves
  isSaved: (listingId: string, userId?: string) => boolean;
  toggleSave: (listingId: string, userId?: string) => void;
  getMySaves: (userId?: string) => MarketplaceListing[];

  // ── Inquiries
  getOrCreateInquiry: (
    listingId: string,
    buyerName?: string,
  ) => MarketplaceInquiry;
  sendMessage: (
    inquiryId: string,
    body: string,
    senderId?: string,
    senderName?: string,
  ) => void;
  markInquiryRead: (inquiryId: string, readerId?: string) => void;
  getInquiry: (id: string) => MarketplaceInquiry | undefined;
  getInquiriesForBuyer: (userId?: string) => MarketplaceInquiry[];
  getInquiriesForSeller: (userId?: string) => MarketplaceInquiry[];
  getInquiriesForListing: (listingId: string) => MarketplaceInquiry[];
  unreadInquiryCount: (userId?: string) => number;

  // ── Reports
  reportListing: (
    listingId: string,
    reason: ReportReason,
    details?: string,
  ) => void;
}

type PersistedSlice = Pick<
  MarketplaceState,
  "listings" | "saves" | "inquiries" | "reports"
>;

// Merge helper used during hydration. When no cached listings exist we return
// an empty array and let ensureSeeded() lazily load the seed on first use.
function mergeListings(
  persistedUser: MarketplaceListing[] | undefined,
): MarketplaceListing[] {
  return persistedUser ?? [];
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      categories: [] as MarketplaceState["categories"],
      listings: [] as MarketplaceState["listings"],
      saves: [],
      inquiries: [],
      reports: [],

      ensureSeeded: async () => {
        if (get().categories.length > 0) return;
        const { SEED_CATEGORIES, SEED_LISTINGS } = await import("@/lib/marketplace/seed");
        set((s) => {
          if (s.categories.length > 0) return s; // guard against race
          const seedIds = new Set(SEED_LISTINGS.map((l) => l.id));
          const userAuthored = s.listings.filter((l) => !seedIds.has(l.id));
          const persistedById = new Map(s.listings.map((l) => [l.id, l] as const));
          const seedsWithOverlay = SEED_LISTINGS.map((l) => persistedById.get(l.id) ?? l);
          return {
            categories: SEED_CATEGORIES,
            listings: [...seedsWithOverlay, ...userAuthored],
          };
        });
      },

      getCategories: () => get().categories,
      getTopCategories: () =>
        get()
          .categories.filter((c) => !c.parent_slug)
          .sort((a, b) => a.sort_order - b.sort_order),
      getCategory: (slug) => get().categories.find((c) => c.slug === slug),

      listActive: () =>
        get()
          .listings.filter((l) => l.status === "active")
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
      getListing: (id) => get().listings.find((l) => l.id === id),
      getListingsByCategory: (slug) =>
        get().listings.filter((l) => l.category === slug && l.status === "active"),
      getMyListings: (userId = CURRENT_USER_ID) =>
        get()
          .listings.filter((l) => l.seller_id === userId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
      getRelated: (id, limit = 4) => {
        const src = get().listings.find((l) => l.id === id);
        if (!src) return [];
        return get()
          .listings.filter(
            (l) =>
              l.id !== id &&
              l.status === "active" &&
              (l.category === src.category ||
                l.tags.some((t) => src.tags.includes(t))),
          )
          .slice(0, limit);
      },

      createListing: (draft) => {
        const nowIso = new Date().toISOString();
        const expires = new Date(
          Date.now() + 90 * 86_400_000,
        ).toISOString();
        const listing: MarketplaceListing = {
          id: `lst-${uuid().slice(0, 8)}`,
          ...draft,
          status: draft.status ?? "active",
          view_count: 0,
          save_count: 0,
          inquiry_count: 0,
          created_at: nowIso,
          updated_at: nowIso,
          expires_at: expires,
        };
        set((s) => ({ listings: [listing, ...s.listings] }));
        return listing;
      },

      updateListing: (id, patch) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id
              ? { ...l, ...patch, updated_at: new Date().toISOString() }
              : l,
          ),
        })),

      setListingStatus: (id, status) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id
              ? { ...l, status, updated_at: new Date().toISOString() }
              : l,
          ),
        })),

      deleteListing: (id) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id
              ? { ...l, status: "removed" as ListingStatus, updated_at: new Date().toISOString() }
              : l,
          ),
        })),

      incrementView: (id) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, view_count: l.view_count + 1 } : l,
          ),
        })),

      relistListing: (id) => {
        const nowIso = new Date().toISOString();
        const expires = new Date(Date.now() + 90 * 86_400_000).toISOString();
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id
              ? { ...l, status: "active" as ListingStatus, created_at: nowIso, updated_at: nowIso, expires_at: expires }
              : l,
          ),
        }));
      },

      isSaved: (listingId, userId = CURRENT_USER_ID) =>
        get().saves.some(
          (s) => s.listing_id === listingId && s.user_id === userId,
        ),

      toggleSave: (listingId, userId = CURRENT_USER_ID) =>
        set((s) => {
          const existing = s.saves.find(
            (x) => x.listing_id === listingId && x.user_id === userId,
          );
          if (existing) {
            return {
              saves: s.saves.filter((x) => x.id !== existing.id),
              listings: s.listings.map((l) =>
                l.id === listingId
                  ? { ...l, save_count: Math.max(0, l.save_count - 1) }
                  : l,
              ),
            };
          }
          const save: MarketplaceSave = {
            id: uuid(),
            user_id: userId,
            listing_id: listingId,
            created_at: new Date().toISOString(),
          };
          return {
            saves: [save, ...s.saves],
            listings: s.listings.map((l) =>
              l.id === listingId ? { ...l, save_count: l.save_count + 1 } : l,
            ),
          };
        }),

      getMySaves: (userId = CURRENT_USER_ID) => {
        const saved = get().saves.filter((s) => s.user_id === userId);
        const ids = new Set(saved.map((s) => s.listing_id));
        return get().listings.filter((l) => ids.has(l.id));
      },

      getOrCreateInquiry: (listingId, buyerName = CURRENT_USER_NAME) => {
        const listing = get().listings.find((l) => l.id === listingId);
        if (!listing) {
          throw new Error(`Listing ${listingId} not found`);
        }
        const existing = get().inquiries.find(
          (i) => i.listing_id === listingId && i.buyer_id === CURRENT_USER_ID,
        );
        if (existing) return existing;

        const nowIso = new Date().toISOString();
        const inquiry: MarketplaceInquiry = {
          id: `inq-${uuid().slice(0, 8)}`,
          listing_id: listingId,
          buyer_id: CURRENT_USER_ID,
          buyer_display_name: buyerName,
          seller_id: listing.seller_id,
          seller_display_name: listing.seller_display_name,
          messages: [],
          status: "open",
          created_at: nowIso,
          updated_at: nowIso,
        };
        set((s) => ({
          inquiries: [inquiry, ...s.inquiries],
          listings: s.listings.map((l) =>
            l.id === listingId
              ? { ...l, inquiry_count: l.inquiry_count + 1 }
              : l,
          ),
        }));
        return inquiry;
      },

      sendMessage: (inquiryId, body, senderId = CURRENT_USER_ID, senderName = CURRENT_USER_NAME) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const nowIso = new Date().toISOString();
        const msg: InquiryMessage = {
          id: `msg-${uuid().slice(0, 8)}`,
          sender_id: senderId,
          sender_display_name: senderName,
          body: trimmed,
          sent_at: nowIso,
          read: senderId === CURRENT_USER_ID, // own messages start read
        };
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === inquiryId
              ? {
                  ...i,
                  messages: [...i.messages, msg],
                  updated_at: nowIso,
                }
              : i,
          ),
        }));
      },

      markInquiryRead: (inquiryId, readerId = CURRENT_USER_ID) =>
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === inquiryId
              ? {
                  ...i,
                  messages: i.messages.map((m) =>
                    m.sender_id !== readerId && !m.read
                      ? { ...m, read: true }
                      : m,
                  ),
                }
              : i,
          ),
        })),

      getInquiry: (id) => get().inquiries.find((i) => i.id === id),
      getInquiriesForBuyer: (userId = CURRENT_USER_ID) =>
        get().inquiries.filter((i) => i.buyer_id === userId),
      getInquiriesForSeller: (userId = CURRENT_USER_ID) =>
        get().inquiries.filter((i) => i.seller_id === userId),
      getInquiriesForListing: (listingId) =>
        get().inquiries.filter((i) => i.listing_id === listingId),

      unreadInquiryCount: (userId = CURRENT_USER_ID) => {
        let count = 0;
        for (const i of get().inquiries) {
          const involvesMe = i.buyer_id === userId || i.seller_id === userId;
          if (!involvesMe) continue;
          for (const m of i.messages) {
            if (m.sender_id !== userId && !m.read) count += 1;
          }
        }
        return count;
      },

      reportListing: (listingId, reason, details) =>
        set((s) => {
          const report: MarketplaceReport = {
            id: `rep-${uuid().slice(0, 8)}`,
            listing_id: listingId,
            reporter_id: CURRENT_USER_ID,
            reason,
            details,
            status: "pending",
            created_at: new Date().toISOString(),
          };
          return { reports: [report, ...s.reports] };
        }),
    }),
    {
      name: "ananya-marketplace",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        listings: state.listings,
        saves: state.saves,
        inquiries: state.inquiries,
        reports: state.reports,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedSlice>;
        return {
          ...current,
          ...p,
          listings: mergeListings(p.listings),
        } as MarketplaceState;
      },
    },
  ),
);

let _marketplaceSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMarketplaceStore.subscribe((state) => {
  if (_marketplaceSyncTimer) clearTimeout(_marketplaceSyncTimer);
  _marketplaceSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("marketplace_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
