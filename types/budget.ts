// ──────────────────────────────────────────────────────────────────────────
// Marigold Budget & Destination tool — row shapes mirroring migration 0022.
//
// The Budget tool's "tier" templates calculate price points per category;
// real vendor recommendations come from the unified vendors table (see
// types/vendors.ts) filtered by `tier_match`. Nothing here duplicates
// vendor data.
// ──────────────────────────────────────────────────────────────────────────

import type { VendorCategoryScope } from "@/types/vendors";

// ── Enums ─────────────────────────────────────────────────────────────────

export type BudgetLocationType = "us_metro" | "destination";

export type BudgetTier = "essential" | "elevated" | "luxury" | "ultra";

// Free-form in the DB so we can add "Cultural", "Food" etc. without a
// migration; these are the seeded values.
export type BudgetExperienceCategory =
  | "Cultural"
  | "Food"
  | "Adventure"
  | "Entertainment"
  | "Wellness"
  | (string & {});

// Free-form in the DB so seed entries can add new groupings.
export type BudgetAddonCategory =
  | "Food & Beverage"
  | "Entertainment"
  | "Production & Tech"
  | "Guest Experience"
  | "Beauty & Wellness"
  | "Luxury Extras"
  | (string & {});

// ── Reference rows ────────────────────────────────────────────────────────

export interface BudgetLocationRow {
  id: string;
  type: BudgetLocationType;
  continent: string | null;
  country: string | null;
  name: string;
  slug: string;
  multiplier: number;
  tagline: string;
  overview: string;
  best_for: string;
  best_months: string;
  min_budget_usd: number;
  tips: string;
  hero_image_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface BudgetLocationRegionRow {
  id: string;
  location_id: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface BudgetLocationExperienceRow {
  id: string;
  location_id: string;
  name: string;
  icon: string;
  description: string;
  category: BudgetExperienceCategory;
  display_order: number;
  created_at: string;
}

export interface BudgetCultureRow {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface BudgetCultureEventRow {
  id: string;
  culture_id: string;
  name: string;
  slug: string;
  icon: string;
  default_guests: number;
  display_order: number;
  ceremony: boolean;
  created_at: string;
}

export interface BudgetVendorTierRow {
  id: string;
  vendor_category_id: string;
  tier: BudgetTier;
  base_cost_usd: number;
  description: string;
  display_order: number;
  created_at: string;
}

export interface BudgetAddonRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  base_cost_usd: number;
  description: string;
  category: BudgetAddonCategory;
  scope: VendorCategoryScope;
  per_guest: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
}

// ── Plan rows ─────────────────────────────────────────────────────────────

export interface BudgetUserPlanRow {
  id: string;
  user_id: string | null;
  anonymous_token: string | null;
  name: string;
  location_id: string | null;
  culture_id: string | null;
  total_budget: number | null;
  global_tier: BudgetTier;
  source_tool: string;
  created_at: string;
  updated_at: string;
  last_viewed_at: string;
}

export interface BudgetUserEventRow {
  id: string;
  plan_id: string;
  event_slug: string;
  guest_count: number;
  display_order: number;
  created_at: string;
}

export interface BudgetUserVendorSelectionRow {
  id: string;
  plan_id: string;
  // null = wedding-wide selection (e.g., photography). Non-null = per-event
  // override for that category.
  event_slug: string | null;
  vendor_category_id: string;
  selected_tier: BudgetTier;
  created_at: string;
}

export interface BudgetUserAddonSelectionRow {
  id: string;
  plan_id: string;
  addon_id: string;
  // Same convention as vendor selections.
  event_slug: string | null;
  created_at: string;
}

// ── Composite shapes for the UI ───────────────────────────────────────────

export interface BudgetLocationDetail extends BudgetLocationRow {
  regions: BudgetLocationRegionRow[];
  experiences: BudgetLocationExperienceRow[];
}

export interface BudgetCultureWithEvents extends BudgetCultureRow {
  events: BudgetCultureEventRow[];
}

// ── Plan CRUD argument shapes ─────────────────────────────────────────────
//
// Server-side helpers only. The browser passes the anonymous_token; the
// authed user_id is read from the Supabase session — never trust either
// value coming from form data.

export interface CreatePlanArgs {
  // Either userId (authed) or anonymousToken (public) must be set.
  userId?: string | null;
  anonymousToken?: string | null;
  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}

export interface UpdatePlanArgs {
  planId: string;
  // Required so we can scope the update — server reads userId from the
  // session and verifies the plan belongs to that user, OR verifies that
  // anonymousToken matches the plan's stored token.
  userId?: string | null;
  anonymousToken?: string | null;

  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}
