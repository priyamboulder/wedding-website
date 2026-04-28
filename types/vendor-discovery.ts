// ── Vendor Discovery extensions ────────────────────────────────────────────
// New surfaces for: video profiles, hyper-specific categories, style matching,
// collaboration graph, availability, and comparison. Built as a sibling type
// layer on top of Vendor (types/vendor-unified.ts) so nothing existing breaks.
//
// Every field is optional at the vendor level — vendors without video or
// without an availability calendar continue to render in the existing UI.

import type { Vendor, VendorCategory } from "./vendor-unified";

// ── Video ──────────────────────────────────────────────────────────────────

export type VideoKind =
  | "intro"           // required for the Video Profile badge
  | "portfolio"       // highlight reel tagged to a specific wedding
  | "testimonial"     // past couple's review
  | "behind_scenes";  // process / setup / day-of

export type VideoAspect = "9:16" | "1:1" | "16:9";

export interface VideoMeta {
  id: string;
  kind: VideoKind;
  src_url: string;
  poster_url: string;
  duration_seconds: number;
  aspect: VideoAspect;
  title: string;
  // Tagging — lets a portfolio reel surface when the couple is at the same
  // venue, uses the same planner, or matches the wedding style.
  wedding_id?: string | null;
  venue_name?: string | null;
  venue_city?: string | null;
  wedding_style?: string[];
  planner_name?: string | null;
  wedding_date?: string | null;
  // Couple-facing metadata, testimonial only.
  couple_names?: string | null;
  // Engagement analytics the vendor sees in their dashboard.
  views?: number;
  play_through_rate?: number;
  inquiries_from_video?: number;
  uploaded_at: string;
}

export type VideoBadgeState = "earned" | "partial" | "none";

export interface VideoProfileSummary {
  badge: VideoBadgeState;
  intro_video: VideoMeta | null;
  portfolio_count: number;
  testimonial_count: number;
  behind_scenes_count: number;
  // Recency-weighted, engagement-weighted rank signal [0..1].
  video_score: number;
}

// ── Hyper-specific category taxonomy ──────────────────────────────────────

export type SubcategoryId = string; // e.g. "dhol_players", "drone_photography"

export interface SubcategoryDef {
  id: SubcategoryId;
  label: string;
  parent: VendorCategory;
  // Synonyms power autocomplete fuzzy-match ("henna" → Mehndi Artist).
  synonyms?: string[];
  // Suggested couple-facing chips for discovery.
  popular_tags?: string[];
  // Shown next to the label in the sidebar.
  emoji?: string;
  // Trending flag used by the "popular for your style" rail.
  trending_for_styles?: StylePreset[];
}

// ── Vendor self-tags ───────────────────────────────────────────────────────
// Tags sit inside a subcategory (e.g. Photographer → "Candid Specialist").
// Filterable; displayed as chips on cards.

export interface VendorTag {
  id: string;
  label: string;
  subcategory_ids: SubcategoryId[];
}

// ── Style matching ─────────────────────────────────────────────────────────

export type StyleAxis =
  | "tone"          // moody <-> bright
  | "era"           // traditional <-> fusion
  | "density"       // minimalist <-> maximalist
  | "scale"         // intimate <-> grand
  | "palette";      // neutral <-> saturated

// Each axis is a number in [-1, 1] where -1 and 1 are the two poles named
// on the style quiz. A vendor's style_signature is what they self-describe;
// a couple's style_profile is what they set during onboarding. Match score
// is 1 - avg(|Δ|)/2 across shared axes.
export type StyleSignature = Partial<Record<StyleAxis, number>>;

export type StylePreset =
  | "moody_editorial"
  | "bright_airy"
  | "traditional"
  | "fusion"
  | "minimalist"
  | "maximalist"
  | "intimate"
  | "grand";

// ── Availability ───────────────────────────────────────────────────────────

export type AvailabilityState =
  | "available"
  | "tentative"    // calendar shows a soft hold
  | "booked"
  | "unknown";     // no calendar synced

export interface AvailabilityRecord {
  vendor_id: string;
  source: "google" | "ical" | "manual";
  blocked_ranges: { start: string; end: string }[]; // inclusive, ISO dates
  last_synced_at: string;
}

// ── Collaboration graph ────────────────────────────────────────────────────
// Derived from Vendor.weddings[].vendor_team — for every pair of vendors that
// co-appear in a wedding, we build an edge whose weight is the count.

export interface CollaborationEdge {
  vendor_a_id: string;
  vendor_b_id: string;
  wedding_count: number;
  last_worked_together: string; // ISO date of the most recent shared wedding
}

export interface ProvenTeam {
  vendor_ids: string[];
  wedding_count: number;
  categories: VendorCategory[];
}

// ── Comparison mode ────────────────────────────────────────────────────────

export interface ComparisonRow {
  label: string;
  values: Array<{ vendor_id: string; value: string; highlight?: boolean }>;
}

// ── Vendor extension ───────────────────────────────────────────────────────
// A non-breaking superset of Vendor, for the discovery showcase. Existing
// pages can keep using Vendor; the new primitives take VendorWithDiscovery.

export interface VendorWithDiscovery extends Vendor {
  subcategory_id?: SubcategoryId | null;
  vendor_tag_ids?: string[];
  style_signature?: StyleSignature;
  videos?: VideoMeta[];
  video_profile?: VideoProfileSummary;
  availability?: AvailabilityRecord;
}

export type { Vendor, VendorCategory };
