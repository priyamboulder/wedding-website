// ── Travel & Accommodations store ─────────────────────────────────────────
// Backs the six Travel workspace tabs. State is scoped by `category_id` so
// the same store can handle multiple wedding workspaces without collision.
// Persists to localStorage via zustand/persist.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  GuestTravelEntry,
  HotelStrategyPlan,
  RoomBlockAmenity,
  TravelDocument,
  TravelRoomBlock,
  WelcomeBagItem,
  WelcomeBagPlan,
} from "@/types/travel";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function nextOrder<T extends { category_id: string; sort_order: number }>(
  list: T[],
  category_id: string,
): number {
  const scoped = list.filter((x) => x.category_id === category_id);
  return scoped.length > 0
    ? Math.max(...scoped.map((x) => x.sort_order)) + 1
    : 1;
}

// ── Defaults ──────────────────────────────────────────────────────────────

export function defaultStrategy(category_id: string): HotelStrategyPlan {
  return {
    category_id,
    out_of_town_guests: 0,
    nights_needed: 3,
    rooms_needed: 0,
    dates_window: "",
    on_site_rooms: "unknown",
    on_site_detail: "",
    nearby_hotels: "",
    shuttle_needed: false,
    block_strategy: "single",
    budget_approach: "group_rate",
    budget_notes: "",
    updated_at: new Date().toISOString(),
  };
}

export function defaultWelcomeBagPlan(category_id: string): WelcomeBagPlan {
  return {
    category_id,
    per_bag_cost: 0,
    bag_count: 0,
    delivery_location: "",
    delivery_date: "",
    assembled_by: "",
    assembly_date: "",
    notes: "",
    updated_at: new Date().toISOString(),
  };
}

// Estimated rooms @ 1.9 guests/room, used by the strategy tab's autocalc
// hint. Couples often want to see the math update as they tune guest count.
export function estimateRooms(guests: number): number {
  if (!guests || guests <= 0) return 0;
  return Math.ceil(guests / 1.9);
}

// Seed items the couple can toggle off instead of staring at a blank box.
const DEFAULT_WELCOME_BAG_ITEMS: Array<
  Pick<WelcomeBagItem, "label" | "detail" | "linked_to" | "included">
> = [
  {
    label: "Welcome letter (from couple)",
    detail: "",
    linked_to: "Stationery",
    included: true,
  },
  {
    label: "Weekend itinerary card",
    detail: "",
    linked_to: "Stationery",
    included: true,
  },
  { label: "Local snacks", detail: "Regional treats", linked_to: "", included: true },
  { label: "Water bottles", detail: "2 per bag", linked_to: "", included: true },
  {
    label: "Advil / Tums — wedding survival kit",
    detail: "",
    linked_to: "",
    included: true,
  },
  {
    label: "Bangles or small mithai box",
    detail: "Indian touch",
    linked_to: "",
    included: true,
  },
  { label: "Custom tote bag", detail: "With wedding monogram", linked_to: "Stationery", included: false },
  {
    label: "Hotel area guide",
    detail: "Restaurants + things to do",
    linked_to: "",
    included: false,
  },
];

// ── State ─────────────────────────────────────────────────────────────────

interface TravelState {
  strategies: HotelStrategyPlan[];
  blocks: TravelRoomBlock[];
  guests: GuestTravelEntry[];
  welcomeBagPlans: WelcomeBagPlan[];
  welcomeBagItems: WelcomeBagItem[];
  documents: TravelDocument[];

  // ── Strategy ──
  updateStrategy: (
    category_id: string,
    patch: Partial<Omit<HotelStrategyPlan, "category_id">>,
  ) => void;

  // ── Room blocks ──
  addBlock: (
    input: Omit<TravelRoomBlock, "id" | "sort_order" | "amenities"> & {
      amenities?: RoomBlockAmenity[];
    },
  ) => TravelRoomBlock;
  updateBlock: (id: string, patch: Partial<TravelRoomBlock>) => void;
  deleteBlock: (id: string) => void;
  addBlockAmenity: (
    block_id: string,
    input: Omit<RoomBlockAmenity, "id">,
  ) => void;
  updateBlockAmenity: (
    block_id: string,
    amenity_id: string,
    patch: Partial<RoomBlockAmenity>,
  ) => void;
  deleteBlockAmenity: (block_id: string, amenity_id: string) => void;

  // ── Guest travel ──
  addGuest: (
    input: Omit<GuestTravelEntry, "id" | "sort_order">,
  ) => GuestTravelEntry;
  updateGuest: (id: string, patch: Partial<GuestTravelEntry>) => void;
  deleteGuest: (id: string) => void;

  // ── Welcome experience ──
  updateWelcomeBagPlan: (
    category_id: string,
    patch: Partial<Omit<WelcomeBagPlan, "category_id">>,
  ) => void;
  addWelcomeBagItem: (
    input: Omit<WelcomeBagItem, "id" | "sort_order">,
  ) => WelcomeBagItem;
  seedDefaultWelcomeBagItems: (category_id: string) => void;
  updateWelcomeBagItem: (id: string, patch: Partial<WelcomeBagItem>) => void;
  toggleWelcomeBagItem: (id: string) => void;
  deleteWelcomeBagItem: (id: string) => void;

  // ── Documents ──
  addDocument: (
    input: Omit<TravelDocument, "id" | "created_at">,
  ) => TravelDocument;
  updateDocument: (id: string, patch: Partial<TravelDocument>) => void;
  deleteDocument: (id: string) => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      strategies: [],
      blocks: [],
      guests: [],
      welcomeBagPlans: [],
      welcomeBagItems: [],
      documents: [],

      // ── Strategy ──
      updateStrategy: (category_id, patch) =>
        set((s) => {
          const existing = s.strategies.find(
            (x) => x.category_id === category_id,
          );
          const base = existing ?? defaultStrategy(category_id);
          const next: HotelStrategyPlan = {
            ...base,
            ...patch,
            category_id,
            updated_at: new Date().toISOString(),
          };
          if (existing) {
            return {
              strategies: s.strategies.map((x) =>
                x.category_id === category_id ? next : x,
              ),
            };
          }
          return { strategies: [...s.strategies, next] };
        }),

      // ── Room blocks ──
      addBlock: (input) => {
        const block: TravelRoomBlock = {
          ...input,
          id: rid("blk"),
          amenities: input.amenities ?? [],
          sort_order: nextOrder(get().blocks, input.category_id),
        };
        set((s) => ({ blocks: [...s.blocks, block] }));
        return block;
      },
      updateBlock: (id, patch) =>
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBlock: (id) =>
        set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),
      addBlockAmenity: (block_id, input) => {
        const amenity: RoomBlockAmenity = { id: rid("amn"), ...input };
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === block_id
              ? { ...b, amenities: [...b.amenities, amenity] }
              : b,
          ),
        }));
      },
      updateBlockAmenity: (block_id, amenity_id, patch) =>
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === block_id
              ? {
                  ...b,
                  amenities: b.amenities.map((a) =>
                    a.id === amenity_id ? { ...a, ...patch } : a,
                  ),
                }
              : b,
          ),
        })),
      deleteBlockAmenity: (block_id, amenity_id) =>
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === block_id
              ? {
                  ...b,
                  amenities: b.amenities.filter((a) => a.id !== amenity_id),
                }
              : b,
          ),
        })),

      // ── Guest travel ──
      addGuest: (input) => {
        const row: GuestTravelEntry = {
          ...input,
          id: rid("gst"),
          sort_order: nextOrder(get().guests, input.category_id),
        };
        set((s) => ({ guests: [...s.guests, row] }));
        return row;
      },
      updateGuest: (id, patch) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteGuest: (id) =>
        set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),

      // ── Welcome experience ──
      updateWelcomeBagPlan: (category_id, patch) =>
        set((s) => {
          const existing = s.welcomeBagPlans.find(
            (x) => x.category_id === category_id,
          );
          const base = existing ?? defaultWelcomeBagPlan(category_id);
          const next: WelcomeBagPlan = {
            ...base,
            ...patch,
            category_id,
            updated_at: new Date().toISOString(),
          };
          if (existing) {
            return {
              welcomeBagPlans: s.welcomeBagPlans.map((x) =>
                x.category_id === category_id ? next : x,
              ),
            };
          }
          return { welcomeBagPlans: [...s.welcomeBagPlans, next] };
        }),
      addWelcomeBagItem: (input) => {
        const item: WelcomeBagItem = {
          ...input,
          id: rid("wbg"),
          sort_order: nextOrder(get().welcomeBagItems, input.category_id),
        };
        set((s) => ({ welcomeBagItems: [...s.welcomeBagItems, item] }));
        return item;
      },
      seedDefaultWelcomeBagItems: (category_id) => {
        const existing = get().welcomeBagItems.filter(
          (x) => x.category_id === category_id,
        );
        if (existing.length > 0) return;
        const created = DEFAULT_WELCOME_BAG_ITEMS.map((tmpl, i) => ({
          id: rid("wbg"),
          category_id,
          sort_order: i + 1,
          ...tmpl,
        }));
        set((s) => ({
          welcomeBagItems: [...s.welcomeBagItems, ...created],
        }));
      },
      updateWelcomeBagItem: (id, patch) =>
        set((s) => ({
          welcomeBagItems: s.welcomeBagItems.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      toggleWelcomeBagItem: (id) =>
        set((s) => ({
          welcomeBagItems: s.welcomeBagItems.map((x) =>
            x.id === id ? { ...x, included: !x.included } : x,
          ),
        })),
      deleteWelcomeBagItem: (id) =>
        set((s) => ({
          welcomeBagItems: s.welcomeBagItems.filter((x) => x.id !== id),
        })),

      // ── Documents ──
      addDocument: (input) => {
        const doc: TravelDocument = {
          ...input,
          id: rid("tdoc"),
          created_at: new Date().toISOString(),
        };
        set((s) => ({ documents: [doc, ...s.documents] }));
        return doc;
      },
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
    }),
    {
      name: "ananya-travel",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _travelSyncTimer: ReturnType<typeof setTimeout> | null = null;
useTravelStore.subscribe((state) => {
  if (_travelSyncTimer) clearTimeout(_travelSyncTimer);
  _travelSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("travel_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
