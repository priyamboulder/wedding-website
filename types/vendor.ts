// ── Vendor directory data model ─────────────────────────────────────────────
// The couple's shortlist is a single source of truth that surfaces in two
// places: the global /vendors page and the task-level vendor panel inside
// checklist tasks. Hearting = shortlisted. Linking = attached to a task.
//
// The canonical Vendor / VendorCategory / VendorTier / VendorTravelLevel /
// VendorImage / VendorContact / VendorPackage / PlannerConnection /
// VenueConnection / PriceDisplay / EventCategory types now live in
// types/vendor-unified.ts. This file re-exports them for backward
// compatibility and keeps filter/shortlist/collection types that are
// scoped to the couple-facing directory.

export type {
  Vendor,
  VendorCategory,
  VendorTier,
  VendorTravelLevel,
  VendorImage,
  VendorContact,
  VendorPackage,
  PlannerConnection,
  VenueConnection,
  PriceDisplay,
  EventCategory,
  PortfolioPost,
  VendorWedding,
  WeddingVendorReference,
  CoupleReview,
  PlannerEndorsement,
  DestinationEntry,
} from "./vendor-unified";

import type { VendorCategory, VendorTravelLevel } from "./vendor-unified";

export type VendorLinkStatus = "linked" | "contracted" | "booked";

// Shortlist-level status the couple moves a vendor through. Surfaced as a
// colored dot in the filter rail and as a small status pill on the card.
// `met` slots between `quoted` and `contracted` for in-person/video calls;
// `ruled_out` is a terminal "no" state — keeps the card visible but shaded,
// so the couple remembers why they passed.
export type ShortlistStatus =
  | "shortlisted"
  | "contacted"
  | "quoted"
  | "met"
  | "contracted"
  | "booked"
  | "ruled_out";

export type PriceBand = "budget" | "mid" | "premium" | "luxe";

export type AssignmentFilter = "linked" | "unassigned";

// Package specifics collected during outreach — used by the comparison
// table in the photography Shortlist tab. All optional: the table shows
// "—" when a field is blank and highlights differences in rose.
export interface VendorPackageSpec {
  hours?: number | null;
  second_shooter?: boolean | null;
  engagement_shoot?: boolean | null;
  edited_image_count?: number | null;
  album_pages?: number | null;
  album_included?: boolean | null;
  delivery_weeks?: number | null;
  travel_fee?: string | null;
  overtime_rate?: string | null;
}

export interface ShortlistEntry {
  vendor_id: string;
  saved_at: string;
  notes: string;
  status: ShortlistStatus;
  // 1-5 personal rating applied by the couple during review. Null = no
  // opinion yet. Distinct from vendor.rating (aggregate of reviews).
  personal_rating?: number | null;
  // "why we passed" note shown when status = ruled_out.
  ruled_out_reason?: string;
  // Ordering inside the couple's shortlist (priority ranking, drag-reorder).
  sort_order?: number;
  // Custom vendors the couple typed in manually (friend recommendations).
  // When true, vendor_id points to a minimal synthetic Vendor record rather
  // than a curated catalog entry.
  is_custom?: boolean;
  // Comparison-table fields, filled in as the couple gets package info
  // from each photographer.
  package?: VendorPackageSpec;
  // Where this save came from — lets the shortlist view surface
  // roulette-origin saves and group by discovery channel.
  source?: "manual" | "roulette" | "search" | "recommendation";
  // If saved via Roulette, the session ID that produced the save.
  roulette_session_id?: string;
}

export interface TaskVendorLink {
  task_id: string;
  vendor_id: string;
  linked_at: string;
  status: VendorLinkStatus;
}

// ── Curated collections (hand-picked lists) ─────────────────────────────────

export type CollectionSlug =
  | "urvashi_picks"
  | "editorial_favorites"
  | "emerging_talent"
  | "heritage_artisans";

export interface Collection {
  slug: CollectionSlug;
  title: string;
  subtitle: string;
  tone: "saffron" | "ink" | "sage" | "rose";
  vendor_ids: string[];
}

// ── Filter state ────────────────────────────────────────────────────────────

export interface VendorFilters {
  query: string;
  category: VendorCategory | null;
  collection: CollectionSlug | null;
  style_tags: string[];
  location: string | null;
  price_band: PriceBand | null;
  assignment: AssignmentFilter[];
  statuses: ShortlistStatus[];
  rating_min: number | null;
  aiMode: boolean;
  // "Ananya Select Only" toggle — when true, the grid hides free vendors.
  // Subtle but powerful: signals to vendors that couples *can* filter them
  // out if they haven't upgraded, without making free tier unusable.
  select_only: boolean;
  // Travel availability — multi-select. Empty = no travel filter applied.
  travel_levels: VendorTravelLevel[];
  // Preferred destination regions (Mexico/Caribbean, Europe, India, etc.).
  // Matched against vendor.extras.preferred_regions OR wedding history.
  preferred_regions: string[];
  // Free-text "willing to travel to" autocomplete query. Matched against
  // both actual destination history and self-reported preferred regions.
  willing_to_travel_to: string;
}

export const EMPTY_FILTERS: VendorFilters = {
  query: "",
  category: null,
  collection: null,
  style_tags: [],
  location: null,
  price_band: null,
  assignment: [],
  statuses: [],
  rating_min: null,
  aiMode: false,
  select_only: false,
  travel_levels: [],
  preferred_regions: [],
  willing_to_travel_to: "",
};

// ── Travel / destination labels ─────────────────────────────────────────────

export const TRAVEL_LEVEL_LABEL: Record<VendorTravelLevel, string> = {
  local: "Local only",
  regional: "Travels regionally",
  nationwide: "Travels nationwide",
  destination: "Destination (international)",
  worldwide: "Worldwide",
};

// The canonical destination-region buckets used by both the vendor's
// self-reported preferences and the couple's filter sidebar. Kept short
// and marketing-friendly — specific countries are surfaced separately in
// vendor.extras.destinations[].
export const DESTINATION_REGIONS = [
  "Mexico / Caribbean",
  "Europe",
  "India",
  "Southeast Asia",
  "Middle East",
  "US Resort / Domestic destination",
] as const;

export type DestinationRegion = (typeof DESTINATION_REGIONS)[number];

export const SHORTLIST_STATUSES: ShortlistStatus[] = [
  "shortlisted",
  "contacted",
  "quoted",
  "met",
  "contracted",
  "booked",
  "ruled_out",
];

export const SHORTLIST_STATUS_LABEL: Record<ShortlistStatus, string> = {
  shortlisted: "Shortlisted",
  contacted: "Contacted",
  quoted: "Quoted",
  met: "Met",
  contracted: "Contracted",
  booked: "Booked",
  ruled_out: "Ruled out",
};

// Small colored dot, mirroring Shopping's muted-dot pattern — saffron reserved
// for "booked" where we want the strongest accent.
export const SHORTLIST_STATUS_DOT: Record<ShortlistStatus, string> = {
  shortlisted: "bg-ink/60",
  contacted: "bg-sage",
  quoted: "bg-gold-light",
  met: "bg-gold",
  contracted: "bg-rose",
  booked: "bg-saffron",
  ruled_out: "bg-ink-faint",
};
