import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Exhibition,
  Exhibitor,
  ExhibitionItem,
  WishlistEntry,
  Inquiry,
  RsvpEntry,
  ContactPreference,
} from "@/types/exhibition";
import {
  SEED_EXHIBITIONS,
  SEED_EXHIBITORS,
  SEED_ITEMS,
} from "@/lib/exhibitions/seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface ExhibitionsState {
  // Catalog (seeded on first load, not persisted separately — source of truth
  // is the seed file; persist only user actions).
  exhibitions: Exhibition[];
  exhibitors: Exhibitor[];
  items: ExhibitionItem[];

  // User state (persisted)
  wishlist: WishlistEntry[];
  inquiries: Inquiry[];
  rsvps: RsvpEntry[];
  visitedExhibitionIds: string[];

  // ── Catalog reads
  listExhibitions: () => Exhibition[];
  getExhibition: (slug: string) => Exhibition | undefined;
  getExhibitors: (exhibitionId: string) => Exhibitor[];
  getExhibitor: (exhibitorId: string) => Exhibitor | undefined;
  getItems: (exhibitorId: string) => ExhibitionItem[];
  getItem: (itemId: string) => ExhibitionItem | undefined;

  // ── Wishlist
  isSaved: (itemId: string) => boolean;
  toggleSaved: (
    item: Pick<WishlistEntry, "item_id" | "exhibitor_id" | "exhibition_id">,
  ) => void;
  clearWishlistForExhibition: (exhibitionId: string) => void;

  // ── Inquiries
  sendInquiry: (draft: {
    item_id?: string;
    exhibitor_id: string;
    exhibition_id: string;
    message: string;
    contact_preference: ContactPreference;
  }) => Inquiry;
  getInquiriesForExhibition: (exhibitionId: string) => Inquiry[];

  // ── RSVP
  hasRsvped: (exhibitionId: string) => boolean;
  toggleRsvp: (exhibitionId: string) => void;

  // ── Visit tracking
  markVisited: (exhibitionId: string) => void;
}

type PersistedSlice = Pick<
  ExhibitionsState,
  "wishlist" | "inquiries" | "rsvps" | "visitedExhibitionIds"
>;

export const useExhibitionsStore = create<ExhibitionsState>()(
  persist(
    (set, get) => ({
      exhibitions: SEED_EXHIBITIONS,
      exhibitors: SEED_EXHIBITORS,
      items: SEED_ITEMS,

      wishlist: [],
      inquiries: [],
      rsvps: [],
      visitedExhibitionIds: [],

      listExhibitions: () => get().exhibitions,
      getExhibition: (slug) => get().exhibitions.find((e) => e.slug === slug),
      getExhibitors: (exhibitionId) =>
        get()
          .exhibitors.filter((x) => x.exhibition_id === exhibitionId)
          .sort((a, b) => a.sort_order - b.sort_order),
      getExhibitor: (exhibitorId) =>
        get().exhibitors.find((x) => x.id === exhibitorId),
      getItems: (exhibitorId) =>
        get()
          .items.filter((i) => i.exhibitor_id === exhibitorId)
          .sort((a, b) => a.sort_order - b.sort_order),
      getItem: (itemId) => get().items.find((i) => i.id === itemId),

      isSaved: (itemId) => get().wishlist.some((w) => w.item_id === itemId),
      toggleSaved: (item) =>
        set((state) => {
          const existing = state.wishlist.find(
            (w) => w.item_id === item.item_id,
          );
          if (existing) {
            return {
              wishlist: state.wishlist.filter(
                (w) => w.item_id !== item.item_id,
              ),
            };
          }
          const entry: WishlistEntry = {
            id: uuid(),
            item_id: item.item_id,
            exhibitor_id: item.exhibitor_id,
            exhibition_id: item.exhibition_id,
            created_at: new Date().toISOString(),
          };
          return { wishlist: [entry, ...state.wishlist] };
        }),
      clearWishlistForExhibition: (exhibitionId) =>
        set((state) => ({
          wishlist: state.wishlist.filter(
            (w) => w.exhibition_id !== exhibitionId,
          ),
        })),

      sendInquiry: (draft) => {
        const inquiry: Inquiry = {
          id: uuid(),
          ...draft,
          status: "sent",
          created_at: new Date().toISOString(),
        };
        set((state) => ({ inquiries: [inquiry, ...state.inquiries] }));
        return inquiry;
      },
      getInquiriesForExhibition: (exhibitionId) =>
        get().inquiries.filter((i) => i.exhibition_id === exhibitionId),

      hasRsvped: (exhibitionId) =>
        get().rsvps.some((r) => r.exhibition_id === exhibitionId),
      toggleRsvp: (exhibitionId) =>
        set((state) => {
          const existing = state.rsvps.find(
            (r) => r.exhibition_id === exhibitionId,
          );
          if (existing) {
            return {
              rsvps: state.rsvps.filter(
                (r) => r.exhibition_id !== exhibitionId,
              ),
            };
          }
          return {
            rsvps: [
              ...state.rsvps,
              {
                exhibition_id: exhibitionId,
                registered_at: new Date().toISOString(),
              },
            ],
          };
        }),

      markVisited: (exhibitionId) =>
        set((state) => {
          if (state.visitedExhibitionIds.includes(exhibitionId)) return state;
          return {
            visitedExhibitionIds: [...state.visitedExhibitionIds, exhibitionId],
          };
        }),
    }),
    {
      name: "ananya-exhibitions",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        wishlist: state.wishlist,
        inquiries: state.inquiries,
        rsvps: state.rsvps,
        visitedExhibitionIds: state.visitedExhibitionIds,
      }),
    },
  ),
);

let _exhibitionsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useExhibitionsStore.subscribe((state) => {
  if (_exhibitionsSyncTimer) clearTimeout(_exhibitionsSyncTimer);
  _exhibitionsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("exhibitions_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
