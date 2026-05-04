// ──────────────────────────────────────────────────────────────────────────
// Marigold Tools — unified vendor surfacing types.
//
// One vendor shape, one placement model, one ranking output. Every Tool
// (Budget, Destination Explorer, future tools) consumes the types in this
// file. If a tool needs a new field, extend the canonical row — do not
// branch into a tool-specific shape.
//
// The richer couple-facing shape (portfolio posts, planner endorsements,
// curated reviews, etc.) lives in `types/vendor-unified.ts`. This file is
// the lean surfacing slice that public Tools render.
// ──────────────────────────────────────────────────────────────────────────

// ── Enums (mirror Postgres enums in migration 0021) ───────────────────────

export type VendorPlacementTier = "standard" | "featured" | "sponsored";

export type VendorCategoryScope = "per_event" | "wedding_wide";

export type VendorPlacementType =
  | "global_featured"
  | "category_sponsored"
  | "destination_sponsored"
  | "tier_sponsored";

export type VendorPricingUnit =
  | "flat"
  | "per_event"
  | "per_guest"
  | "per_hour"
  | "package";

export type VendorInquiryStatus = "new" | "sent" | "responded" | "closed";

// Tier values used by Tools (Budget allocator, etc.). String-typed in the DB
// (`vendor_placements.tier`, `vendors.tier_match[]`) so downstream tools can
// add tiers without a migration; the canonical four are enumerated here.
export type ToolsVendorTier = "essential" | "elevated" | "luxury" | "ultra";

// Tools that can be the source of an inquiry. Free-form text in the DB so
// new tools register themselves without a schema change.
export type ToolsInquirySource =
  | "budget"
  | "destination_explorer"
  | "match"
  | "directory"
  | (string & {});

// ── Row shapes (one per table in migration 0021) ──────────────────────────

export interface VendorCategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  group_name: string;
  scope: VendorCategoryScope;
  per_guest: boolean;
  ceremony_only: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
}

// Lean vendor row as returned by the surfacing layer. Joins to the rich
// profile (in vendor-unified.ts) happen on the vendor detail page only.
export interface ToolsVendorRow {
  id: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  bio: string | null;
  hero_image_url: string | null;
  gallery_image_urls: string[];
  website_url: string | null;
  instagram_handle: string | null;
  email: string | null;
  phone: string | null;
  home_base_city: string | null;
  home_base_country: string | null;
  travels_globally: boolean;
  destinations_served: string[];
  tier_match: string[];
  capacity_min: number | null;
  capacity_max: number | null;
  placement_tier: VendorPlacementTier;
  placement_expires_at: string | null;
  active: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorCategoryAssignmentRow {
  id: string;
  vendor_id: string;
  category_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface VendorPlacementRow {
  id: string;
  vendor_id: string;
  placement_type: VendorPlacementType;
  category_slug: string | null;
  location_slug: string | null;
  tier: string | null;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
  notes: string;
  created_at: string;
}

export interface VendorPricingIndicatorRow {
  id: string;
  vendor_id: string;
  category_id: string;
  price_low_usd: number;
  price_high_usd: number;
  price_unit: VendorPricingUnit;
  notes: string;
  created_at: string;
}

export interface VendorInquiryRow {
  id: string;
  vendor_id: string;
  user_id: string | null;
  anonymous_email: string | null;
  source_tool: ToolsInquirySource;
  source_context: Record<string, unknown>;
  status: VendorInquiryStatus;
  created_at: string;
}

// ── Function output: get_ranked_vendors ───────────────────────────────────
// Mirrors the RETURNS TABLE signature in the SQL function. `rank_bucket` is
// 1 (sponsored, exact context) → 4 (everyone else); rendering can group by
// it to draw the "Sponsored" / "Featured" / "Verified" labels.

export interface RankedVendor {
  id: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  bio: string | null;
  hero_image_url: string | null;
  gallery_image_urls: string[];
  website_url: string | null;
  instagram_handle: string | null;
  email: string | null;
  phone: string | null;
  home_base_city: string | null;
  home_base_country: string | null;
  travels_globally: boolean;
  destinations_served: string[];
  tier_match: string[];
  capacity_min: number | null;
  capacity_max: number | null;
  placement_tier: VendorPlacementTier;
  verified: boolean;
  rank_bucket: 1 | 2 | 3 | 4;
}

// ── Query / mutation argument shapes ──────────────────────────────────────

export interface VendorsForCategoryArgs {
  categorySlug: string;
  locationSlug?: string;
  tier?: string;
  capacity?: number;
  limit?: number;
}

export interface VendorsForLocationArgs {
  locationSlug: string;
  categorySlug?: string;
  tier?: string;
  capacity?: number;
  limit?: number;
}

export interface CreateInquiryArgs {
  vendorId: string;
  sourceTool: ToolsInquirySource;
  context: Record<string, unknown>;
  // Optional. If the user is logged in we attach their auth.uid() server-side.
  // If not logged in, pass `email` so the vendor can reply.
  email?: string;
  userId?: string | null;
}

// Convenience hint values shared with other parts of the app.
export const RANK_BUCKET_LABEL: Record<RankedVendor["rank_bucket"], string> = {
  1: "Sponsored",
  2: "Featured",
  3: "Verified",
  4: "",
};
