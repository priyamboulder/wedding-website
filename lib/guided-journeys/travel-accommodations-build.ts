// ── Travel & Accommodations Build journey ──────────────────────────────────
// Second guided journey on the Travel & Accommodations workspace. Vision
// (the 3-session default journey on Tab 1) covers strategy: guest math,
// proximity, block strategy, budget approach. Build is operational —
// block-level negotiation tracking with attrition floors and cutoff dates
// (Tab 2), plus guest-level arrival tracking with cluster pickup rosters
// that share back to Transportation (Tab 3). Two sessions, ~11 minutes.
//
//   1. block_setup            — primary + secondary hotel blocks, negotiated
//                                rates, attrition floors, cutoff dates,
//                                comp policies, suite assignments.
//   2. guest_travel_tracker   — per-guest arrival tracking, hotel
//                                assignments, booking status, computed
//                                arrival clusters that flow into the
//                                Transportation Build journey.
//
// Unlike Vision, Build does NOT generate a closing brief. Vision already
// produced the travel brief. Build's output is operational — every block
// tracked, every guest's travel logged, arrival clusters ready to share.
//
// Field storage strategy: every Build session reads & writes directly
// through `useTravelStore` (the same source of truth Tabs 2/3 use). This
// gives free two-way sync with no copy-and-paste. The journey state itself
// only persists session statuses (not_started / in_progress / completed)
// and a tiny slice of build-only metadata (booking link dispatch counters,
// risk flags). See lib/guided-journeys/travel-accommodations-build-sync.ts
// for the canonical field mapping.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const TRAVEL_BUILD_JOURNEY_ID = "build";
export const TRAVEL_BUILD_CATEGORY: CategoryKey = "travel";

export type TravelBuildSessionKey =
  | "block_setup"
  | "guest_travel_tracker";

export interface TravelBuildSessionDef {
  key: TravelBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const TRAVEL_BUILD_SESSIONS: readonly TravelBuildSessionDef[] = [
  {
    key: "block_setup",
    index: 1,
    title: "Set up your room blocks",
    subtitle:
      "Negotiated rates, attrition floors, cutoff dates — the floor visible.",
    estimatedMinutes: 6,
  },
  {
    key: "guest_travel_tracker",
    index: 2,
    title: "Track guest travel",
    subtitle:
      "Arrival dates, hotels, who hasn't booked yet — pickup rosters from clusters.",
    estimatedMinutes: 5,
  },
] as const;

export const TRAVEL_BUILD_TOTAL_MINUTES = TRAVEL_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getTravelBuildSession(
  key: TravelBuildSessionKey,
): TravelBuildSessionDef {
  const found = TRAVEL_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown travel build session: ${key}`);
  }
  return found;
}

// ── Session 1: block_setup form_data ───────────────────────────────────────

export type BlockType =
  | "standard"
  | "premium"
  | "family_suites_only"
  | "mixed";

export type SuiteRole =
  | "bride"
  | "groom"
  | "family"
  | "hospitality"
  | "other";

export interface SuiteAssignment {
  suite_label: string;
  assigned_to_role: SuiteRole;
  assigned_to_name?: string;
}

export interface HotelBlock {
  id: string;
  is_primary: boolean;

  // Hotel details
  hotel_name: string;
  hotel_address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;

  // Block structure
  block_type: BlockType;
  rooms_blocked: number;
  rooms_booked: number;

  // Rates
  negotiated_rate_per_night: number;
  rate_currency: string;
  rate_includes_breakfast: boolean;
  rate_includes_parking: boolean;
  resort_fee_waived: boolean;

  // Attrition — the floor visible
  attrition_floor_count: number;
  attrition_floor_percentage?: number;
  cutoff_date: string;
  attrition_penalty_per_room?: number;

  // Comp policy
  comp_room_policy?: string;
  comp_rooms_earned?: number;

  // Suites
  suites_available: number;
  suites_assigned_to: SuiteAssignment[];

  // Bookable link
  booking_link?: string;
  booking_code?: string;
  booking_link_active: boolean;

  // Notes
  negotiation_notes?: string;
  risk_flags?: string[];
}

export interface BlockSetupComputed {
  total_rooms_blocked: number;
  total_rooms_booked: number;
  overall_utilization: number;
  minimum_to_meet: number;
  gap_to_floor: number;
  cutoff_date_warnings: Array<{
    hotel_name: string;
    cutoff_date: string;
    days_remaining: number;
    utilization_at_cutoff: number;
  }>;
  attrition_risk_blocks: string[];
}

export interface BlockSetupFormData {
  hotel_blocks: HotelBlock[];
  computed?: BlockSetupComputed;
}

// ── Session 2: guest_travel_tracker form_data ──────────────────────────────

export type BookingStatus =
  | "not_booked"
  | "pending_invitation"
  | "booking_link_sent"
  | "booked"
  | "cancelled";

export interface GuestTravelTrackerEntry {
  id: string;
  guest_name: string;
  guest_relationship?: string;
  travel_party_size: number;

  // Origin
  departure_city: string;
  departure_country?: string;
  is_international: boolean;

  // Arrival
  arrival_date: string;
  arrival_time?: string;
  arrival_airport?: string;
  flight_info?: string;

  // Departure
  departure_date?: string;
  departure_time?: string;

  // Hotel assignment
  assigned_to_block_id?: string;
  booking_status: BookingStatus;
  booked_room_type?: string;
  confirmation_number?: string;

  // Special requirements
  accessibility_needs?: string;
  crib_needed: boolean;
  connecting_room_needed: boolean;
  allergy_notes?: string;

  // Cluster assignment (computed)
  arrival_cluster_id?: string;
}

export interface ArrivalCluster {
  id: string;
  cluster_date: string;
  arrival_window_start: string;
  arrival_window_end: string;
  guests_in_cluster: string[];
  total_pax: number;
  suggested_pickup_window: string;
  notes?: string;
}

export interface BookingLinkDispatch {
  sent_to_count: number;
  not_yet_sent_count: number;
  last_send_date?: string;
  template_text?: string;
}

export interface GuestTravelTrackerComputed {
  total_guests_tracked: number;
  total_entries: number;
  booked_count: number;
  not_booked_count: number;
  international_count: number;
  arrival_cluster_count: number;
  block_utilization_by_hotel: Record<
    string,
    { booked: number; total: number }
  >;
  visa_invitation_letters_needed: number;
}

export interface GuestTravelTrackerFormData {
  guest_travel_entries: GuestTravelTrackerEntry[];
  arrival_clusters: ArrivalCluster[];
  booking_link_dispatch: BookingLinkDispatch;
  computed?: GuestTravelTrackerComputed;
}

// ── Pickers / option labels ────────────────────────────────────────────────

export const BLOCK_TYPE_OPTIONS: Array<{ value: BlockType; label: string }> = [
  { value: "standard", label: "Standard rooms" },
  { value: "premium", label: "Premium / club level" },
  { value: "family_suites_only", label: "Family suites only" },
  { value: "mixed", label: "Mixed — standard + premium" },
];

export const SUITE_ROLE_OPTIONS: Array<{ value: SuiteRole; label: string }> = [
  { value: "bride", label: "Bridal suite" },
  { value: "groom", label: "Groom's suite" },
  { value: "family", label: "Family suite" },
  { value: "hospitality", label: "Hospitality suite" },
  { value: "other", label: "Other" },
];

export const BOOKING_STATUS_OPTIONS: Array<{
  value: BookingStatus;
  label: string;
}> = [
  { value: "not_booked", label: "Not booked" },
  { value: "pending_invitation", label: "Pending invite" },
  { value: "booking_link_sent", label: "Booking link sent" },
  { value: "booked", label: "Booked" },
  { value: "cancelled", label: "Cancelled" },
];

// Default attrition floor: 70% of rooms blocked. Couples adjust per
// contract — this is the typical hotel ask. Default cutoff date is the
// event date minus 30 days.
export const DEFAULT_ATTRITION_PERCENTAGE = 70;
export const DEFAULT_CUTOFF_DAYS_BEFORE_EVENT = 30;

// Country considered "domestic" for international detection. The wedding's
// home country wins, but we default to USA when no signal is set. The Build
// session UI reads the wedding profile to override.
export const DEFAULT_HOME_COUNTRY = "USA";

export function isInternationalGuest(
  departure_country: string | undefined,
  home_country: string = DEFAULT_HOME_COUNTRY,
): boolean {
  if (!departure_country) return false;
  return (
    departure_country.trim().toLowerCase() !== home_country.trim().toLowerCase()
  );
}

// ── Helpers shared by the session UIs ──────────────────────────────────────

export function defaultAttritionFloor(roomsBlocked: number): number {
  if (roomsBlocked <= 0) return 0;
  return Math.ceil((roomsBlocked * DEFAULT_ATTRITION_PERCENTAGE) / 100);
}

export function defaultCutoffDate(eventDateIso: string | null): string {
  if (!eventDateIso) return "";
  const event = new Date(eventDateIso);
  if (Number.isNaN(event.getTime())) return "";
  const cutoff = new Date(event);
  cutoff.setDate(cutoff.getDate() - DEFAULT_CUTOFF_DAYS_BEFORE_EVENT);
  return cutoff.toISOString().slice(0, 10);
}

export function emptyHotelBlock(opts: {
  isPrimary: boolean;
  cutoffDate?: string;
}): HotelBlock {
  const id = `block-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    is_primary: opts.isPrimary,
    hotel_name: "",
    block_type: "standard",
    rooms_blocked: 0,
    rooms_booked: 0,
    negotiated_rate_per_night: 0,
    rate_currency: "USD",
    rate_includes_breakfast: false,
    rate_includes_parking: false,
    resort_fee_waived: false,
    attrition_floor_count: 0,
    cutoff_date: opts.cutoffDate ?? "",
    suites_available: 0,
    suites_assigned_to: [],
    booking_link_active: false,
  };
}

// Suggested seed shape based on the Vision block_strategy. Used by the
// session UI to pre-seed `hotel_blocks[]` on first render.
export function seedBlocksFromStrategy(
  strategy: "single" | "two_tier" | "multiple_hotels" | undefined,
  cutoffDate: string,
): HotelBlock[] {
  switch (strategy) {
    case "two_tier":
      return [
        emptyHotelBlock({ isPrimary: true, cutoffDate }),
        emptyHotelBlock({ isPrimary: false, cutoffDate }),
      ];
    case "multiple_hotels":
      return [
        emptyHotelBlock({ isPrimary: true, cutoffDate }),
        emptyHotelBlock({ isPrimary: false, cutoffDate }),
        emptyHotelBlock({ isPrimary: false, cutoffDate }),
      ];
    case "single":
    default:
      return [emptyHotelBlock({ isPrimary: true, cutoffDate })];
  }
}
