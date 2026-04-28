// ── Vendor profile pop-out panel data model ─────────────────────────────────
// Rich profile data that powers the slide-over vendor profile panel:
// Instagram-sourced portfolio, weddings graph, planner connections, venue
// history, reviews, and inquiry forms. Sits alongside the leaner Vendor
// record in types/vendor.ts — everything here is optional extension data,
// populated from the Instagram-mining pipeline and seeded manually for demo
// vendors where real data isn't yet ingested.

import type { VendorCategory, DestinationRegion } from "./vendor";
import type {
  PlannerConnection,
  VenueConnection,
} from "./vendor-unified";

// PlannerConnection and VenueConnection are defined in types/vendor-unified.ts
// as part of the unified Vendor shape. Re-exported here so existing imports
// from "@/types/vendor-profile" keep working.
export type { PlannerConnection, VenueConnection };

// ── Portfolio (Instagram feed) ──────────────────────────────────────────────

export interface PortfolioPost {
  id: string;
  image_url: string;
  caption: string;
  posted_at: string; // ISO
  is_video: boolean;
  wedding_id: string | null; // links to VendorWedding when parseable
  venue_id: string | null; // links to VenueConnection when parseable
  permalink: string | null; // Instagram URL
}

// ── Wedding graph ───────────────────────────────────────────────────────────
// A wedding record ties a vendor's work to a specific event, its venue, its
// date, and the full vendor team. The same wedding record appears on every
// participant vendor's profile — this is the relationship graph.

export interface WeddingVendorReference {
  vendor_id: string;
  category: VendorCategory | "planner" | "venue";
  name: string;
  handle: string | null; // @instagram handle
  // For destination weddings: flags whether this teammate traveled to the
  // destination or was sourced locally. Powers the "traveled from NJ" vs
  // "(local)" labels couples use to reason about which vendors to source
  // locally when planning their own destination wedding.
  traveled?: boolean;
  // Where this teammate is based — only shown when traveled is set. Used
  // for the subtitle like "(traveled from NJ)".
  home_base?: string;
}

export interface VendorWedding {
  id: string;
  couple_names: string; // "Priya & Arjun"
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  date: string; // ISO (month-level precision OK)
  duration_days: number; // 1, 2, 3…
  cover_image_url: string | null;
  vendor_team: WeddingVendorReference[]; // includes planner as a reference
  planner_id: string | null; // canonical planner for that wedding
  // Destination-wedding flag. Couples filter on this in the wedding history
  // tab. Set at seed-time (or by the Instagram-mining pipeline when a
  // wedding's venue is outside the vendor's home country).
  is_destination?: boolean;
  // Country for destination weddings (e.g. "Mexico", "Italy"). Domestic
  // US weddings leave this undefined — venue_state covers that case.
  country?: string;
}

// ── Reviews & endorsements ──────────────────────────────────────────────────

export interface CoupleReview {
  id: string;
  rating: number; // 1-5
  body: string;
  couple_names: string;
  date: string; // ISO
  venue_name: string | null;
  verified: boolean; // true if couple planned on Ananya
  helpful_count: number;
  // When true, this review is from a destination wedding — surfaced with
  // the ✈ tag and prioritized when a couple is planning a destination
  // wedding themselves. A Tuscany review is far more persuasive to a
  // Tuscany-bound couple than a local NJ review.
  is_destination?: boolean;
  // Human-readable destination location for the review tag line, e.g.
  // "Cancun, Mexico" or "Tuscany, Italy".
  destination_location?: string;
}

export interface PlannerEndorsement {
  id: string;
  planner_id: string;
  planner_name: string;
  planner_company: string;
  body: string;
  wedding_count: number; // social proof — how many times they've worked together
}

// ── Extended profile (services, logistics) ──────────────────────────────────

export interface VendorProfileExtras {
  instagram_handle: string | null;
  instagram_followers: number | null;
  services: string[]; // ["Wedding Day Photography", "Pre-Wedding Shoots", ...]
  travel_radius: "local" | "regional" | "nationwide" | "worldwide" | null;
  languages: string[]; // ["English", "Hindi", "Telugu"]
  team_size: string | null; // "3-5 photographers"
  response_time_hours: number | null; // "typically responds within X hours"
  weddings_count: number | null; // total weddings covered
  planners_count: number | null;
  avg_response_time: string | null; // display-friendly, e.g. "within 24 hours"
  // ── Destination & travel (premium vendor fields) ────────────────────────
  // Specific destinations worked in. Each entry pairs a location with the
  // wedding count there — the map/pins on the pop-out panel reads this.
  destinations: DestinationEntry[];
  // Regions this vendor self-reports as willing to travel to, even if they
  // haven't worked there yet. Empty for free vendors (we don't show
  // unvalidated claims on free profiles).
  preferred_regions: DestinationRegion[];
  // Free-text travel-fee structure, e.g. "Included in package for US
  // destinations; couple covers flights + accommodation for international".
  travel_fee_description: string | null;
  // Is the vendor/team ready for international travel (passports valid)?
  passport_valid: boolean | null;
  // Advance-booking lead time for destination weddings. Typically longer
  // than local — vendors use this to set expectations with couples.
  destination_booking_lead_months: number | null;
}

// One destination where the vendor has worked. Used to build the map/pins,
// country count, and the "8 countries" text on the premium card.
export interface DestinationEntry {
  city: string;
  country: string;
  region: DestinationRegion;
  wedding_count: number;
}

// ── Profile composite (what the panel reads) ────────────────────────────────
// Each record is keyed by vendor_id. Absent → panel falls back to base Vendor
// data + empty sections with helpful empty-states.

export interface VendorProfile {
  vendor_id: string;
  extras: VendorProfileExtras;
  portfolio: PortfolioPost[];
  weddings: VendorWedding[];
  planners: PlannerConnection[];
  venues: VenueConnection[];
  couple_reviews: CoupleReview[];
  planner_endorsements: PlannerEndorsement[];
}

