// ── Travel & Accommodations workspace types ──────────────────────────────
// Backs the six-tab Travel workspace: Hotel Strategy, Room Block Manager,
// Guest Travel Hub, Shortlist & Contract (generic), Welcome Experience,
// Documents. Vendor-side counterpart to the guest-side hotel assignments
// in `app/guests/page.tsx`.

// ── Hotel Strategy ────────────────────────────────────────────────────────

export type OnSiteRoomsOption = "yes" | "no" | "unknown";
export type BlockStrategy = "single" | "two_tier" | "multiple";
export type BudgetApproach =
  | "cover_all"
  | "cover_family"
  | "group_rate"
  | "mix";

export const BLOCK_STRATEGY_LABEL: Record<BlockStrategy, string> = {
  single: "Single hotel block — all guests at one hotel",
  two_tier: "Two-tier — premium for family, standard for friends",
  multiple: "Multiple hotels — guests choose from 2–3 options",
};

export const BUDGET_APPROACH_LABEL: Record<BudgetApproach, string> = {
  cover_all: "Couple covers all rooms",
  cover_family: "Couple covers family, guests pay their own",
  group_rate: "Negotiated group rate, guests pay",
  mix: "Mix — couple covers elders, group rate for rest",
};

export interface HotelStrategyPlan {
  category_id: string;
  out_of_town_guests: number;
  nights_needed: number;
  rooms_needed: number;
  dates_window: string;
  on_site_rooms: OnSiteRoomsOption;
  on_site_detail: string;
  nearby_hotels: string;
  shuttle_needed: boolean;
  block_strategy: BlockStrategy;
  budget_approach: BudgetApproach;
  budget_notes: string;
  updated_at: string;
}

// ── Room Block Manager ────────────────────────────────────────────────────

export interface RoomBlockAmenity {
  id: string;
  label: string;
  status: "negotiated" | "requested" | "declined";
}

export interface TravelRoomBlock {
  id: string;
  category_id: string;
  name: string;
  role: "primary" | "overflow" | "courtesy";
  group_rate: string;
  retail_rate: string;
  rooms_blocked: number;
  rooms_booked: number;
  cutoff_date: string; // ISO "YYYY-MM-DD"
  attrition_percent: number; // 0–100; 0 means no attrition
  booking_link: string;
  amenities: RoomBlockAmenity[];
  sort_order: number;
}

// ── Guest Travel Hub ──────────────────────────────────────────────────────

export type GuestHotelStatus = "booked" | "not_booked" | "elsewhere";

export const GUEST_HOTEL_STATUS_LABEL: Record<GuestHotelStatus, string> = {
  booked: "Booked",
  not_booked: "Not booked",
  elsewhere: "Staying elsewhere",
};

export interface GuestTravelEntry {
  id: string;
  category_id: string;
  guest_name: string;
  party_size: number;
  from_city: string;
  arrives_date: string; // ISO "YYYY-MM-DD"
  arrives_time: string; // "HH:mm" or empty
  flight: string;
  hotel_name: string;
  status: GuestHotelStatus;
  notes: string;
  sort_order: number;
}

// ── Welcome Experience ────────────────────────────────────────────────────

export interface WelcomeBagItem {
  id: string;
  category_id: string;
  label: string;
  detail: string;
  linked_to: string; // e.g. "Stationery" — free text link hint
  included: boolean;
  sort_order: number;
}

export interface WelcomeBagPlan {
  category_id: string;
  per_bag_cost: number; // USD estimate
  bag_count: number;
  delivery_location: string;
  delivery_date: string; // ISO "YYYY-MM-DD" or empty
  assembled_by: string;
  assembly_date: string; // ISO
  notes: string;
  updated_at: string;
}

// ── Documents ────────────────────────────────────────────────────────────

export type TravelDocumentKind =
  | "contract"
  | "block_agreement"
  | "attrition_terms"
  | "guest_spreadsheet"
  | "welcome_bag_receipt"
  | "other";

export const TRAVEL_DOCUMENT_KIND_LABEL: Record<TravelDocumentKind, string> = {
  contract: "Hotel contract",
  block_agreement: "Room block agreement",
  attrition_terms: "Attrition terms",
  guest_spreadsheet: "Guest travel sheet",
  welcome_bag_receipt: "Welcome bag receipt",
  other: "Other",
};

export interface TravelDocument {
  id: string;
  category_id: string;
  kind: TravelDocumentKind;
  title: string;
  url: string;
  note: string;
  created_at: string;
}
