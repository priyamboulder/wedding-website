// ── Unified vendor data model ──────────────────────────────────────────────
// Single source of truth for the Vendor type across the couple-facing
// directory, vendor portal, marketing pages, and slide-over profile panel.
// Merges what used to live in types/vendor.ts, types/vendor-profile.ts,
// lib/marketing/data.ts, and lib/vendor-portal/seed.ts into one shape.

export type VendorCategory =
  | "photography"
  | "hmua"
  | "decor_florals"
  | "catering"
  | "entertainment"
  | "wardrobe"
  | "stationery"
  | "pandit_ceremony";

export type VendorTier = "free" | "select";

// Consolidated 5-value travel classification — merges the 4 values that used
// to live in types/vendor.ts (local/regional/nationwide/destination) with the
// 4 values from vendor-profile.ts extras.travel_radius (local/regional/
// nationwide/worldwide). `destination` is for vendors who have demonstrably
// worked abroad; `worldwide` is for vendors who will travel anywhere on
// request (passport valid, no regional preference).
export type VendorTravelLevel =
  | "local"
  | "regional"
  | "nationwide"
  | "destination"
  | "worldwide";

export interface VendorImage {
  url: string;
  alt?: string;
}

export interface VendorContact {
  email: string;
  phone: string;
  website: string;
  instagram: string;
  pinterest?: string;
  facebook?: string;
}

// Discriminated price-display union. Drives the card "From ₹X" / "₹X – ₹Y" /
// "Contact for pricing" rendering at both the vendor level and the package
// level. Snake-case discriminator matches the rest of the unified shape.
export type PriceDisplay =
  | { type: "exact"; amount: number }
  | { type: "starting_from"; amount: number }
  | { type: "range"; min: number; max: number }
  | { type: "contact" };

export type EventCategory =
  | "mehndi"
  | "sangeet"
  | "ceremony"
  | "reception"
  | "full_wedding";

// One priced offering on the vendor's profile. Replaces the separate
// VendorPackage types in lib/marketing/data.ts and lib/vendor-portal/
// packages-seed.ts.
export interface VendorPackage {
  id: string;
  name: string;
  description: string;
  price_display: PriceDisplay;
  currency: "INR" | "USD";
  inclusions: string[];
  event_categories: EventCategory[];
  lead_time: string;
  capacity_notes: string;
  featured: boolean;
  order: number;
  seasonal?: { start_date: string; end_date: string };
}

// Planner this vendor has worked with. Appears on the profile panel's
// "Planners" section. `is_couples_planner` is filled in at render time if
// this couple also hired the same planner.
export interface PlannerConnection {
  planner_id: string;
  name: string;
  company: string;
  photo_url: string | null;
  wedding_count: number;
  is_couples_planner?: boolean;
}

// Venue this vendor has worked at. `is_couples_venue` is filled in at
// render time if this couple has booked the same venue.
export interface VenueConnection {
  venue_id: string;
  name: string;
  city: string;
  state: string;
  wedding_count: number;
  is_couples_venue?: boolean;
}

// ── Rich profile extensions ─────────────────────────────────────────────────
// These were formerly on a separate VendorProfile record. They're now part of
// the unified shape (optional; empty arrays / null for vendors without data
// yet). The slide-over profile panel reads directly from these fields.

// Destination-region buckets the couple-side filter uses. Kept aligned with
// DESTINATION_REGIONS in types/vendor.ts.
export type DestinationRegion =
  | "Mexico / Caribbean"
  | "Europe"
  | "India"
  | "Southeast Asia"
  | "Middle East"
  | "US Resort / Domestic destination";

// One destination where the vendor has worked. Used to build the map/pins,
// country count, and the "8 countries" text on the premium card.
export interface DestinationEntry {
  city: string;
  country: string;
  region: DestinationRegion;
  wedding_count: number;
}

// Instagram-style portfolio post (image or video) surfaced on the profile
// panel's Portfolio tab with filters + lightbox.
export interface PortfolioPost {
  id: string;
  image_url: string;
  caption: string;
  posted_at: string;
  is_video: boolean;
  wedding_id: string | null;
  venue_id: string | null;
  permalink: string | null;
}

// Wedding-team teammate entry for a VendorWedding.vendor_team array.
export interface WeddingVendorReference {
  vendor_id: string;
  category: VendorCategory | "planner" | "venue";
  name: string;
  handle: string | null;
  traveled?: boolean;
  home_base?: string;
}

// One wedding the vendor worked, with full vendor team and destination info.
export interface VendorWedding {
  id: string;
  couple_names: string;
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  date: string;
  duration_days: number;
  cover_image_url: string | null;
  vendor_team: WeddingVendorReference[];
  planner_id: string | null;
  is_destination?: boolean;
  country?: string;
}

// One couple review. The profile panel highlights destination reviews.
export interface CoupleReview {
  id: string;
  rating: number;
  body: string;
  couple_names: string;
  date: string;
  venue_name: string | null;
  verified: boolean;
  helpful_count: number;
  is_destination?: boolean;
  destination_location?: string;
}

// Third-party endorsement from a planner — stronger social proof than a
// self-review. Shown as a blockquote with the planner's company + how many
// weddings they've worked together.
export interface PlannerEndorsement {
  id: string;
  planner_id: string;
  planner_name: string;
  planner_company: string;
  body: string;
  wedding_count: number;
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  owner_name: string;
  category: VendorCategory;
  tier: VendorTier;
  is_verified: boolean;
  bio: string;
  tagline: string;
  location: string;
  travel_level: VendorTravelLevel;
  years_active: number;
  team_size: number;
  style_tags: string[];
  contact: VendorContact;
  cover_image: string;
  portfolio_images: VendorImage[] | null;
  price_display: PriceDisplay;
  currency: "INR" | "USD";
  rating: number | null;
  review_count: number;
  wedding_count: number;
  response_time_hours: number | null;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
  planner_connections: PlannerConnection[];
  venue_connections: VenueConnection[];
  packages: VendorPackage[];

  // ── Rich profile (optional — populated for curated/Select vendors) ────────
  instagram_handle?: string | null;
  instagram_followers?: number | null;
  services?: string[];
  languages?: string[];
  travel_fee_description?: string | null;
  passport_valid?: boolean;
  destination_booking_lead_months?: number | null;
  preferred_regions?: DestinationRegion[];
  destinations?: DestinationEntry[];
  portfolio_posts?: PortfolioPost[];
  weddings?: VendorWedding[];
  couple_reviews?: CoupleReview[];
  planner_endorsements?: PlannerEndorsement[];
}
