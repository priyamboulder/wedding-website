// ── Gifting Build journey ─────────────────────────────────────────────────
// Second guided journey on the Gifting workspace. Vision (the 3-session
// default journey on Tab 1) covers gift style direction, per-category
// budget anchors, the ideas browser, and the brief. Build is operational —
// every welcome bag inventoried, every trousseau piece sourced, every
// favor counted, every family exchange mapped. Lives at journey_id =
// "build". Four sessions, ~15 minutes.
//
//   1. welcome_bags         — quantity tied to room block, item lifecycle
//                             tracking, assembly plan. Pre-seeds from
//                             Travel & Accommodations Build (rooms total)
//                             and Vision (loved welcome-bag ideas).
//   2. trousseau_packaging  — saree trays, jewelry boxes, nagphans, etc.
//                             Indian-import lead-time warnings, Stationery
//                             coordination flags for labels & monograms.
//   3. return_favors        — RSVP-driven quantity math with 10% buffer,
//                             charitable-donation alternative.
//   4. family_exchanges     — milni / vevai reciprocal pairs, bridal-party
//                             gifts, vendor thank-yous.
//
// Build does NOT generate a closing brief. Vision already produced the
// gifting brief. Build's output is operational. Completion routes the
// couple to Tab 7 (Thank-You Tracker) so they're ready to log gifts as
// they arrive, with three action CTAs.
//
// Time-gated: Build CTAs render muted when months_until_event > 4. The
// four-month threshold matches Indian-imported trousseau packaging (60–90
// day shipping) and custom welcome-bag items (~60 day production).
//
// Field storage: Build sessions read & write through useWorkspaceStore
// (the same WorkspaceItem store the full Tabs 3–6 use) plus a small slice
// of localStorage for journey-only blobs (assembly plans, computed
// totals). This gives free two-way sync with no copy-and-paste.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const GIFTING_BUILD_JOURNEY_ID = "build";
export const GIFTING_BUILD_CATEGORY: CategoryKey = "gifting";

export type GiftingBuildSessionKey =
  | "welcome_bags"
  | "trousseau_packaging"
  | "return_favors"
  | "family_exchanges";

export interface GiftingBuildSessionDef {
  key: GiftingBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const GIFTING_BUILD_SESSIONS: readonly GiftingBuildSessionDef[] = [
  {
    key: "welcome_bags",
    index: 1,
    title: "Welcome bags inventory",
    subtitle:
      "One bag per room. Itinerary card, local snacks, water, hangover kit.",
    estimatedMinutes: 4,
  },
  {
    key: "trousseau_packaging",
    index: 2,
    title: "Trousseau packaging",
    subtitle:
      "Saree trays, jewelry boxes, nagphans — coordinated with stationery.",
    estimatedMinutes: 4,
  },
  {
    key: "return_favors",
    index: 3,
    title: "Return favors",
    subtitle:
      "Thank-you favors for guests — quantity by RSVP head count.",
    estimatedMinutes: 3,
  },
  {
    key: "family_exchanges",
    index: 4,
    title: "Family exchanges",
    subtitle: "Milni / vevai gifts between families. Bridal party gifts too.",
    estimatedMinutes: 4,
  },
] as const;

export const GIFTING_BUILD_TOTAL_MINUTES = GIFTING_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export const GIFTING_BUILD_UNLOCK_THRESHOLD_MONTHS = 4;

/**
 * Lead-time threshold (in days before wedding) at which Trousseau
 * pieces ordered later trigger a soft warning. Indian-imported packaging
 * needs 60–90 days; we surface the warning 90 days out.
 */
export const TROUSSEAU_LEAD_TIME_WARNING_DAYS = 90;

export function getGiftingBuildSession(
  key: GiftingBuildSessionKey,
): GiftingBuildSessionDef {
  const found = GIFTING_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown gifting build session: ${key}`);
  }
  return found;
}

// ── Shared types ──────────────────────────────────────────────────────────

export type SourcingStatus =
  | "wishlist"
  | "sourcing"
  | "ordered"
  | "received"
  | "packed";

export type FavorSourcingStatus =
  | "wishlist"
  | "sourcing"
  | "ordered"
  | "received"
  | "distributed";

export type ExchangeSourcingStatus =
  | "wishlist"
  | "idea"
  | "sourcing"
  | "purchased"
  | "wrapped";

export type BudgetBand = "under" | "on_target" | "over";

export type GiftEvent =
  | "mehendi"
  | "haldi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "milni"
  | "vidaai"
  | "pre_wedding"
  | "all_events"
  | "other";

// ── Session 1: welcome_bags ───────────────────────────────────────────────

export type WelcomeBagQuantityBasis =
  | "one_per_room"
  | "one_per_guest"
  | "one_per_family"
  | "custom";

export type WelcomeBagDeliveryPlan =
  | "hotel_drop_off"
  | "in_room_placement"
  | "check_in_handoff"
  | "tbd";

export type WelcomeBagItemCategory =
  | "practical"
  | "reusable"
  | "edible"
  | "cultural"
  | "local"
  | "informational"
  | "fun";

export interface WelcomeBagPlan {
  quantity_basis: WelcomeBagQuantityBasis;
  /** Computed default — pulled from Travel & Accommodations Build hotel blocks. */
  quantity_total: number;
  quantity_override?: number;
  bag_theme?: string;
  delivery_plan: WelcomeBagDeliveryPlan;
  delivery_coordinator?: string;
}

export interface WelcomeBagItem {
  id: string;
  item_label: string;
  item_category: WelcomeBagItemCategory;
  quantity_per_bag: number;
  cost_per_unit?: number;
  vendor?: string;
  vendor_contact?: string;
  sourcing_status: SourcingStatus;
  custom_note?: string;
  reuses_loved_idea: boolean;
  /** When pre-seeded from Vision idea_reactions[], the original idea id. */
  source_idea_id?: string;
}

export interface WelcomeBagAssembly {
  assembly_location?: string;
  assembly_date?: string;
  helpers_needed: number;
  helpers_assigned: string[];
  estimated_assembly_hours?: number;
}

export interface WelcomeBagsComputed {
  total_items_across_bags: number;
  total_estimated_cost: number;
  cost_per_bag: number;
  cost_vs_budget_anchor: BudgetBand;
  sourcing_status_breakdown: {
    wishlist: number;
    sourcing: number;
    ordered: number;
    received: number;
    packed: number;
  };
}

export interface WelcomeBagsFormData {
  bag_plan: WelcomeBagPlan;
  bag_items: WelcomeBagItem[];
  assembly: WelcomeBagAssembly;
  computed?: WelcomeBagsComputed;
}

// ── Session 2: trousseau_packaging ────────────────────────────────────────

export type TrousseauPieceType =
  | "saree_tray"
  | "jewelry_box"
  | "nagphan"
  | "tray_set"
  | "pooja_thali"
  | "gift_box"
  | "monogram_label_set"
  | "custom";

export type TrousseauSourcingStatus =
  | "wishlist"
  | "sourcing"
  | "ordered"
  | "received";

export type StationeryCoordinationStatus =
  | "na"
  | "pending"
  | "designed"
  | "printed"
  | "delivered";

export interface TrousseauPiece {
  id: string;
  piece_type: TrousseauPieceType;
  custom_label?: string;
  description: string;
  quantity: number;
  contents_description?: string;

  sourcing_status: TrousseauSourcingStatus;
  vendor?: string;
  vendor_contact?: string;
  cost_estimate?: number;
  actual_cost?: number;
  order_date?: string;
  expected_delivery_date?: string;

  needs_monogram: boolean;
  needs_label: boolean;
  label_text?: string;
  stationery_coordination_status: StationeryCoordinationStatus;
  photos: string[];

  cultural_purpose?: string;
  used_at_event: GiftEvent;
}

export interface TrousseauComputed {
  total_pieces: number;
  total_estimated_cost: number;
  cost_vs_budget_anchor: BudgetBand;
  pieces_needing_stationery: number;
  /** Piece labels with order_date later than wedding-minus-90-days. */
  sourcing_lead_time_warnings: string[];
}

export interface TrousseauPackagingFormData {
  trousseau_pieces: TrousseauPiece[];
  computed?: TrousseauComputed;
}

export const TROUSSEAU_SUGGESTED_PIECES: ReadonlyArray<{
  piece_type: TrousseauPieceType;
  description: string;
  quantity: number;
  cultural_purpose: string;
  used_at_event: GiftEvent;
  needs_monogram?: boolean;
  needs_label?: boolean;
}> = [
  {
    piece_type: "saree_tray",
    description: "Hand-painted saree tray for the in-laws",
    quantity: 1,
    cultural_purpose: "Wedding day exchange to groom's family",
    used_at_event: "wedding",
    needs_label: true,
  },
  {
    piece_type: "jewelry_box",
    description: "Decorated jewelry box for in-laws' jewelry set",
    quantity: 1,
    cultural_purpose: "Carries the heirloom set offered to the bride",
    used_at_event: "wedding",
    needs_monogram: true,
  },
  {
    piece_type: "nagphan",
    description: "Nagphan set for milni",
    quantity: 2,
    cultural_purpose:
      "Ceremonial trays carried during milni — gifts for groom's elders",
    used_at_event: "milni",
  },
  {
    piece_type: "pooja_thali",
    description: "Pooja thali for ceremony rituals",
    quantity: 1,
    cultural_purpose: "Sacred offerings during the wedding ceremony",
    used_at_event: "wedding",
  },
];

// ── Session 3: return_favors ──────────────────────────────────────────────

export type FavorQuantityBasis =
  | "one_per_guest"
  | "one_per_family"
  | "one_per_couple"
  | "one_per_event"
  | "custom";

export type FavorDistributionPlan =
  | "reception_table_setting"
  | "door_handout_at_exit"
  | "send_off_basket"
  | "multiple_events"
  | "tbd";

export type FavorItemCategory =
  | "edible"
  | "keepsake"
  | "cultural"
  | "practical"
  | "charitable_donation";

export interface FavorPlan {
  quantity_basis: FavorQuantityBasis;
  /** Pulled from Guests workspace RSVP confirmed count when available. */
  expected_guest_count: number;
  favor_count_total: number;
  /** Default 10% of expected_guest_count, rounded up. */
  buffer_count: number;
  distribution_plan: FavorDistributionPlan;
}

export interface FavorItem {
  id: string;
  item_label: string;
  item_category: FavorItemCategory;
  quantity: number;
  cost_per_unit?: number;
  vendor?: string;
  vendor_contact?: string;
  sourcing_status: FavorSourcingStatus;
  used_at_event: GiftEvent;
  customization_note?: string;
  reuses_loved_idea: boolean;
  source_idea_id?: string;
}

export interface CharitableDonation {
  organization: string;
  donation_per_guest: number;
  cause: string;
  card_text?: string;
}

export interface ReturnFavorsComputed {
  total_favors_count: number;
  total_estimated_cost: number;
  cost_per_guest: number;
  cost_vs_budget_anchor: BudgetBand;
  items_with_lead_time_warnings: number;
}

export interface ReturnFavorsFormData {
  favor_plan: FavorPlan;
  favor_items: FavorItem[];
  charitable_donation?: CharitableDonation;
  computed?: ReturnFavorsComputed;
}

// ── Session 4: family_exchanges ───────────────────────────────────────────

export type FamilyExchangeType =
  | "milni"
  | "vevai"
  | "vidaai"
  | "shagun"
  | "mehendi_gifts"
  | "other";

export type FamilySide = "bride_side" | "groom_side" | "mutual" | "guest";

export interface FamilyExchange {
  id: string;
  exchange_type: FamilyExchangeType;
  exchange_label?: string;
  event: GiftEvent;

  giver_family: Exclude<FamilySide, "guest">;
  giver_specific_role?: string;
  receiver_family: FamilySide;
  receiver_specific_role?: string;

  gift_idea?: string;
  quantity: number;
  estimated_cost_total?: number;
  sourcing_status: ExchangeSourcingStatus;

  cultural_significance?: string;
  is_reciprocal: boolean;
  reciprocal_exchange_id?: string;

  vendor_tip_amount?: number;
}

export type BridalPartyRole =
  | "maid_of_honor"
  | "bridesmaid"
  | "best_man"
  | "groomsman"
  | "flower_girl"
  | "ring_bearer"
  | "usher"
  | "family_helper"
  | "custom";

export type BridalPartyDeliveryPlan =
  | "morning_of_wedding"
  | "rehearsal_dinner"
  | "reception"
  | "mailed"
  | "tbd";

export interface BridalPartyGift {
  id: string;
  recipient_name: string;
  recipient_role: BridalPartyRole;
  custom_role?: string;
  gift_idea?: string;
  estimated_cost?: number;
  customization_details?: string;
  sourcing_status: Extract<
    ExchangeSourcingStatus,
    "wishlist" | "idea" | "purchased" | "wrapped"
  >;
  delivery_plan: BridalPartyDeliveryPlan;
}

export type VendorThankYouDeliveryPlan =
  | "wedding_day_handoff"
  | "after_event_thank_you"
  | "tbd";

export interface VendorThankYou {
  id: string;
  vendor_label: string;
  gift_idea?: string;
  estimated_cost?: number;
  delivery_plan: VendorThankYouDeliveryPlan;
}

export interface FamilyExchangesComputed {
  total_exchanges: number;
  total_bridal_party_gifts: number;
  total_vendor_thank_yous: number;
  total_estimated_cost: number;
  cost_vs_budget_anchor: BudgetBand;
  exchanges_unconfirmed_count: number;
}

export interface FamilyExchangesFormData {
  family_exchanges: FamilyExchange[];
  bridal_party_gifts: BridalPartyGift[];
  vendor_thank_yous: VendorThankYou[];
  computed?: FamilyExchangesComputed;
}

// ── Suggested-exchange catalog (Session 4 empty-state pre-seed) ───────────
// Surfaces 4–6 typical exchanges based on Vision's `family_gift_traditions`
// selections. Each entry carries the slug we match against and the draft
// exchange definition.

export interface SuggestedExchange {
  match_tradition: string; // matches Vision family_gift_traditions[] values
  defaults: Omit<FamilyExchange, "id">;
}

export const FAMILY_EXCHANGE_SUGGESTIONS: SuggestedExchange[] = [
  {
    match_tradition: "milni_vevai",
    defaults: {
      exchange_type: "milni",
      event: "milni",
      giver_family: "bride_side",
      giver_specific_role: "Mamaji (bride's mother's brother)",
      receiver_family: "groom_side",
      receiver_specific_role: "Groom's family elders",
      quantity: 1,
      sourcing_status: "wishlist",
      cultural_significance:
        "Mamaji traditionally brings gifts to seal the union",
      is_reciprocal: true,
    },
  },
  {
    match_tradition: "milni_vevai",
    defaults: {
      exchange_type: "vevai",
      event: "wedding",
      giver_family: "bride_side",
      giver_specific_role: "Bride's father",
      receiver_family: "groom_side",
      receiver_specific_role: "Groom's father",
      quantity: 1,
      sourcing_status: "wishlist",
      cultural_significance:
        "Father-to-father exchange formalising the union of families",
      is_reciprocal: true,
    },
  },
  {
    match_tradition: "shagun",
    defaults: {
      exchange_type: "shagun",
      event: "pre_wedding",
      giver_family: "bride_side",
      giver_specific_role: "Bride's parents",
      receiver_family: "groom_side",
      receiver_specific_role: "Groom's elders",
      quantity: 5,
      sourcing_status: "wishlist",
      cultural_significance: "Cash envelopes signifying blessing and welcome",
      is_reciprocal: false,
    },
  },
  {
    match_tradition: "vidaai",
    defaults: {
      exchange_type: "vidaai",
      event: "vidaai",
      giver_family: "bride_side",
      giver_specific_role: "Bride's parents",
      receiver_family: "bride_side",
      receiver_specific_role: "Bride (final family gift)",
      quantity: 1,
      sourcing_status: "wishlist",
      cultural_significance:
        "The bride's parents' final gift before she leaves with her husband",
      is_reciprocal: false,
    },
  },
  {
    match_tradition: "mehendi_gifts",
    defaults: {
      exchange_type: "mehendi_gifts",
      event: "mehendi",
      giver_family: "groom_side",
      giver_specific_role: "Groom's family",
      receiver_family: "bride_side",
      receiver_specific_role: "Bride and her bridesmaids",
      quantity: 1,
      sourcing_status: "wishlist",
      cultural_significance:
        "Pre-wedding gifts brought to the bride during the mehendi ceremony",
      is_reciprocal: false,
    },
  },
];

export const BRIDAL_PARTY_DEFAULT_ROLES: ReadonlyArray<BridalPartyRole> = [
  "maid_of_honor",
  "bridesmaid",
  "best_man",
  "groomsman",
];

// ── Default vendor thank-you draft ────────────────────────────────────────
// Vendors marked `contracted: true` across other workspaces (Photography,
// Catering, etc.) pre-seed into this list. Default draft copy below.

export const DEFAULT_VENDOR_THANK_YOU_GIFT_IDEA =
  "Small mithai box + handwritten note";
export const DEFAULT_VENDOR_THANK_YOU_COST = 50;

// ── Cross-journey labels ──────────────────────────────────────────────────

export const TROUSSEAU_PIECE_TYPE_LABEL: Record<TrousseauPieceType, string> = {
  saree_tray: "Saree tray",
  jewelry_box: "Jewelry box",
  nagphan: "Nagphan",
  tray_set: "Tray set",
  pooja_thali: "Pooja thali",
  gift_box: "Gift box",
  monogram_label_set: "Monogram label set",
  custom: "Custom piece",
};

export const FAMILY_EXCHANGE_TYPE_LABEL: Record<FamilyExchangeType, string> = {
  milni: "Milni",
  vevai: "Vevai",
  vidaai: "Vidaai",
  shagun: "Shagun",
  mehendi_gifts: "Mehendi gifts",
  other: "Other",
};

export const BRIDAL_PARTY_ROLE_LABEL: Record<BridalPartyRole, string> = {
  maid_of_honor: "Maid of honor",
  bridesmaid: "Bridesmaid",
  best_man: "Best man",
  groomsman: "Groomsman",
  flower_girl: "Flower girl",
  ring_bearer: "Ring bearer",
  usher: "Usher",
  family_helper: "Family helper",
  custom: "Custom",
};

export const SOURCING_STATUS_LABEL: Record<SourcingStatus, string> = {
  wishlist: "Wishlist",
  sourcing: "Sourcing",
  ordered: "Ordered",
  received: "Received",
  packed: "Packed",
};

export const FAVOR_SOURCING_STATUS_LABEL: Record<FavorSourcingStatus, string> = {
  wishlist: "Wishlist",
  sourcing: "Sourcing",
  ordered: "Ordered",
  received: "Received",
  distributed: "Distributed",
};

export const EXCHANGE_SOURCING_STATUS_LABEL: Record<
  ExchangeSourcingStatus,
  string
> = {
  wishlist: "Wishlist",
  idea: "Idea",
  sourcing: "Sourcing",
  purchased: "Purchased",
  wrapped: "Wrapped",
};
