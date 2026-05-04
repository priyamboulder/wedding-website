import type {
  Vendor,
  VendorFilters,
  ShortlistStatus,
  AssignmentFilter,
  VendorCategory,
  VendorTravelLevel,
} from "@/types/vendor";
import {
  priceDisplayHighEnd,
  priceDisplayLowEnd,
} from "@/lib/vendors/price-display";

// ── Price bands ─────────────────────────────────────────────────────────────
// Bucket the high end of a vendor's price_display into a coarse budget label.

const PRICE_BAND_CEILING: Record<
  NonNullable<VendorFilters["price_band"]>,
  number
> = {
  budget: 5_00_000,
  mid: 15_00_000,
  premium: 40_00_000,
  luxe: Number.POSITIVE_INFINITY,
};

// Legacy alias used by the AI recommendation engine for budget scoring. Takes
// the unified PriceDisplay instead of the old price_range string.
export function parseHighEnd(
  priceDisplay: Vendor["price_display"],
): number | null {
  return priceDisplay ? priceDisplayHighEnd(priceDisplay) : null;
}

function vendorInPriceBand(
  vendor: Vendor,
  band: NonNullable<VendorFilters["price_band"]>,
): boolean {
  const high = vendor.price_display ? priceDisplayHighEnd(vendor.price_display) : null;
  if (high === null) return true;
  return high <= PRICE_BAND_CEILING[band];
}

// ── Travel & destination matching ───────────────────────────────────────────
// With the unified Vendor record we no longer carry per-vendor destination
// history. Matching falls back to the vendor's travel_level plus venue/
// location signals that *do* live on the record.

function vendorCoversAnyRegion(_vendor: Vendor, _regions: string[]): boolean {
  // Region coverage is a rich-profile feature and is currently not on the
  // unified record. Keep the filter permissive until destination history
  // makes it back.
  return true;
}

function vendorWillingToTravelTo(vendor: Vendor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (vendor.location.toLowerCase().includes(q)) return true;
  for (const venue of vendor.venue_connections) {
    const hay = `${venue.city} ${venue.state}`.toLowerCase();
    if (hay.includes(q)) return true;
  }
  return false;
}

export function travelMatchStrength(vendor: Vendor, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  for (const venue of vendor.venue_connections) {
    const hay = `${venue.city} ${venue.state}`.toLowerCase();
    if (hay.includes(q)) return 3;
  }
  if (vendor.location.toLowerCase().includes(q)) return 1;
  return 0;
}

// ── Context a vendor query needs ────────────────────────────────────────────

export interface VendorFilterContext {
  shortlistIds: Set<string>;
  linkedVendorIds: Set<string>;
  statusByVendorId: Map<string, ShortlistStatus>;
}

export const EMPTY_FILTER_CONTEXT: VendorFilterContext = {
  shortlistIds: new Set(),
  linkedVendorIds: new Set(),
  statusByVendorId: new Map(),
};

export function applyVendorFilters(
  vendors: Vendor[],
  filters: VendorFilters,
  ctx: VendorFilterContext = EMPTY_FILTER_CONTEXT,
): Vendor[] {
  const q = filters.query.trim().toLowerCase();
  return vendors.filter((v) => {
    if (filters.select_only && v.tier !== "select") return false;
    if (filters.category && v.category !== filters.category) return false;
    if (filters.location && v.location !== filters.location) return false;
    if (filters.price_band && !vendorInPriceBand(v, filters.price_band)) {
      return false;
    }
    if (filters.rating_min != null && (v.rating ?? 0) < filters.rating_min) {
      return false;
    }
    if (filters.assignment.length > 0) {
      const linked = ctx.linkedVendorIds.has(v.id);
      const wantLinked = filters.assignment.includes("linked");
      const wantUnassigned = filters.assignment.includes("unassigned");
      if (!((wantLinked && linked) || (wantUnassigned && !linked))) return false;
    }
    if (filters.statuses.length > 0) {
      const s = ctx.statusByVendorId.get(v.id);
      if (!s || !filters.statuses.includes(s)) return false;
    }
    if (filters.travel_levels.length > 0) {
      if (!filters.travel_levels.includes(v.travel_level)) return false;
    }
    if (filters.preferred_regions.length > 0) {
      if (!vendorCoversAnyRegion(v, filters.preferred_regions)) return false;
    }
    if (filters.willing_to_travel_to.trim()) {
      if (!vendorWillingToTravelTo(v, filters.willing_to_travel_to)) return false;
    }
    if (filters.style_tags.length > 0) {
      const tagSet = new Set(v.style_tags.map((t) => t.toLowerCase()));
      const allPresent = filters.style_tags.every((t) =>
        tagSet.has(t.toLowerCase()),
      );
      if (!allPresent) return false;
    }
    if (q) {
      const hay = [v.name, v.location, v.bio, v.style_tags.join(" ")]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueLocations(vendors: Vendor[]): string[] {
  const set = new Set<string>();
  for (const v of vendors) if (v.location) set.add(v.location);
  return [...set].sort();
}

export function uniqueStyleTags(vendors: Vendor[]): string[] {
  const set = new Set<string>();
  for (const v of vendors) for (const t of v.style_tags) set.add(t);
  return [...set].sort();
}

// ── Facet counts ────────────────────────────────────────────────────────────

export interface FacetCount<T extends string> {
  value: T;
  count: number;
}

export function countByCategory(vendors: Vendor[]): FacetCount<string>[] {
  const m = new Map<string, number>();
  for (const v of vendors) m.set(v.category, (m.get(v.category) ?? 0) + 1);
  return [...m.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByLocation(vendors: Vendor[]): FacetCount<string>[] {
  const m = new Map<string, number>();
  for (const v of vendors) {
    if (!v.location) continue;
    m.set(v.location, (m.get(v.location) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByStatus(
  vendors: Vendor[],
  ctx: VendorFilterContext,
): FacetCount<ShortlistStatus>[] {
  const m = new Map<ShortlistStatus, number>();
  for (const v of vendors) {
    const s = ctx.statusByVendorId.get(v.id);
    if (!s) continue;
    m.set(s, (m.get(s) ?? 0) + 1);
  }
  return [...m.entries()].map(([value, count]) => ({ value, count }));
}

export function countByTravelLevel(
  vendors: Vendor[],
): Record<VendorTravelLevel, number> {
  const m: Record<VendorTravelLevel, number> = {
    local: 0,
    regional: 0,
    nationwide: 0,
    destination: 0,
    worldwide: 0,
  };
  for (const v of vendors) m[v.travel_level] += 1;
  return m;
}

export function countByAssignment(
  vendors: Vendor[],
  ctx: VendorFilterContext,
): Record<AssignmentFilter, number> {
  let linked = 0;
  let unassigned = 0;
  for (const v of vendors) {
    if (ctx.linkedVendorIds.has(v.id)) linked += 1;
    else unassigned += 1;
  }
  return { linked, unassigned };
}

// ── Sort options ────────────────────────────────────────────────────────────

export type VendorSortKey =
  | "relevance"
  | "rating"
  | "name"
  | "priceAsc"
  | "priceDesc";

export function sortVendors(vendors: Vendor[], key: VendorSortKey): Vendor[] {
  const copy = [...vendors];
  switch (key) {
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "priceAsc":
      return copy.sort(
        (a, b) =>
          ((a.price_display ? priceDisplayLowEnd(a.price_display) : null) ?? 0) -
          ((b.price_display ? priceDisplayLowEnd(b.price_display) : null) ?? 0),
      );
    case "priceDesc":
      return copy.sort(
        (a, b) =>
          ((b.price_display ? priceDisplayHighEnd(b.price_display) : null) ?? 0) -
          ((a.price_display ? priceDisplayHighEnd(a.price_display) : null) ?? 0),
      );
    case "relevance":
    default:
      return copy.sort((a, b) => {
        const tierDiff = tierRank(b.tier) - tierRank(a.tier);
        if (tierDiff !== 0) return tierDiff;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
  }
}

function tierRank(tier: Vendor["tier"]): number {
  return tier === "select" ? 1 : 0;
}

// ── Grouping ────────────────────────────────────────────────────────────────

export type VendorGroupKey = "category" | "status" | "location" | "price_tier" | "none";

export interface VendorGroup {
  key: string;
  vendors: Vendor[];
}

export function groupVendors(
  vendors: Vendor[],
  group: VendorGroupKey,
  ctx: VendorFilterContext,
): VendorGroup[] {
  if (group === "none") return [{ key: "all", vendors }];
  const map = new Map<string, Vendor[]>();
  for (const v of vendors) {
    const key = vendorGroupKey(v, group, ctx);
    const arr = map.get(key);
    if (arr) arr.push(v);
    else map.set(key, [v]);
  }
  return [...map.entries()].map(([key, vs]) => ({ key, vendors: vs }));
}

function vendorGroupKey(
  v: Vendor,
  group: VendorGroupKey,
  ctx: VendorFilterContext,
): string {
  switch (group) {
    case "category":
      return v.category;
    case "status":
      return ctx.statusByVendorId.get(v.id) ?? "unsaved";
    case "location":
      return v.location || "unknown";
    case "price_tier": {
      const high = v.price_display ? priceDisplayHighEnd(v.price_display) : null;
      if (high === null) return "unknown";
      if (high <= PRICE_BAND_CEILING.budget) return "budget";
      if (high <= PRICE_BAND_CEILING.mid) return "mid";
      if (high <= PRICE_BAND_CEILING.premium) return "premium";
      return "luxe";
    }
    default:
      return "all";
  }
}

export function filtersAreEmpty(f: VendorFilters): boolean {
  return (
    !f.category &&
    !f.collection &&
    !f.location &&
    !f.price_band &&
    f.rating_min == null &&
    f.assignment.length === 0 &&
    f.statuses.length === 0 &&
    f.style_tags.length === 0 &&
    !f.select_only &&
    f.travel_levels.length === 0 &&
    f.preferred_regions.length === 0 &&
    !f.willing_to_travel_to.trim() &&
    !f.query
  );
}

// ── Category drill-in filter config ────────────────────────────────────────
// Per-category metadata that drives the left filter rail on /vendors/[slug].
// Photography filters ≠ caterer filters — each category surfaces the
// dimensions that actually matter for picking that kind of vendor.

export type CategoryBudgetTier = "within" | "stretch" | "splurge";
export type CategoryTravelBucket = "local" | "india" | "international";

export interface CategoryDrillFilters {
  styles: string[];                  // multi-select chips
  budget_tier: CategoryBudgetTier | null;
  travel: CategoryTravelBucket | null;
  past_venues: string[];             // venue-name keywords toggled on
  available_on_date: boolean;        // gated by config.show_availability
  select_only: boolean;
}

export const EMPTY_DRILL_FILTERS: CategoryDrillFilters = {
  styles: [],
  budget_tier: null,
  travel: null,
  past_venues: [],
  available_on_date: true,           // spec: default on
  select_only: false,
};

export interface CategoryFilterConfig {
  // Multi-select style chips. Empty array hides the section.
  styles: string[];
  // Famous venues that get their own toggle ("Has shot at Leela Palace").
  // Each entry is a label + a substring matched against vendor.venue_connections.
  past_venues: Array<{ label: string; match: string }>;
  show_budget_tier: boolean;
  show_travel: boolean;
  show_availability: boolean;
  show_select_only: boolean;
  // Page chrome.
  noun_singular: string;
  noun_plural: string;
}

const DEFAULT_CONFIG: CategoryFilterConfig = {
  styles: [],
  past_venues: [],
  show_budget_tier: true,
  show_travel: true,
  show_availability: true,
  show_select_only: true,
  noun_singular: "vendor",
  noun_plural: "vendors",
};

export const CATEGORY_FILTER_CONFIG: Record<VendorCategory, CategoryFilterConfig> = {
  photography: {
    ...DEFAULT_CONFIG,
    styles: ["Editorial", "Documentary", "Cinematic", "Traditional", "Candid"],
    past_venues: [
      { label: "Has shot at Leela Palace", match: "leela palace" },
    ],
    noun_singular: "photographer",
    noun_plural: "photographers",
  },
  decor_florals: {
    ...DEFAULT_CONFIG,
    styles: ["Botanical", "Maximalist", "Minimal", "Mandap-forward", "Modern Indian"],
    noun_singular: "designer",
    noun_plural: "decor & florals studios",
  },
  catering: {
    ...DEFAULT_CONFIG,
    styles: ["Regional Indian", "Pan-Asian", "Continental", "Live stations", "Vegetarian-first"],
    noun_singular: "caterer",
    noun_plural: "caterers",
  },
  entertainment: {
    ...DEFAULT_CONFIG,
    styles: ["DJ", "Live band", "Sangeet act", "Anchor / MC", "Dhol / brass"],
    noun_singular: "act",
    noun_plural: "entertainment acts",
  },
  hmua: {
    ...DEFAULT_CONFIG,
    styles: ["Editorial", "Soft glam", "Traditional", "Airbrush", "Low-maintenance"],
    noun_singular: "artist",
    noun_plural: "hair & makeup artists",
  },
  wardrobe: {
    ...DEFAULT_CONFIG,
    styles: ["Heritage couture", "Contemporary", "Lehenga specialist", "Menswear", "Custom"],
    noun_singular: "designer",
    noun_plural: "wardrobe designers",
  },
  stationery: {
    ...DEFAULT_CONFIG,
    styles: ["Letterpress", "Foil", "Bilingual", "Illustrated", "Digital-only"],
    noun_singular: "studio",
    noun_plural: "stationery studios",
  },
  pandit_ceremony: {
    ...DEFAULT_CONFIG,
    styles: ["English-translated", "Traditional Sanskrit", "Inter-faith", "Modern", "Vedic"],
    noun_singular: "officiant",
    noun_plural: "officiants",
  },
};

// True iff the slug matches a known vendor category. Used by the dynamic
// /vendors/[slug] route to decide between the drill-in view and the vendor
// profile view.
export function isVendorCategory(slug: string): slug is VendorCategory {
  return Object.prototype.hasOwnProperty.call(CATEGORY_FILTER_CONFIG, slug);
}

// ── Drill-in filtering & sort ──────────────────────────────────────────────

export type CategoryDrillSort =
  | "best_match"
  | "price_asc"
  | "price_desc"
  | "most_reviewed"
  | "newest";

export interface CategoryBudgetCeilings {
  within_inr: number;
  stretch_inr: number;
}

// Couple's category-specific budget ceilings. `within` = top of the band the
// AI engine maps this category to; `stretch` = ~1.25× that band; anything
// above is "splurge". Falls back to permissive values when no budget is set.
export function categoryBudgetCeilings(
  category: VendorCategory,
  budgetMaxCents: number | null,
): CategoryBudgetCeilings | null {
  if (budgetMaxCents == null) return null;
  // Mirror CATEGORY_BUDGET_SHARE from ai-recommendations without importing
  // (would cycle). Kept in sync manually.
  const SHARE: Record<VendorCategory, number> = {
    photography: 0.12,
    decor_florals: 0.25,
    catering: 0.35,
    entertainment: 0.10,
    hmua: 0.05,
    pandit_ceremony: 0.02,
    wardrobe: 0.20,
    stationery: 0.03,
  };
  const within = (budgetMaxCents / 100) * SHARE[category];
  return { within_inr: within, stretch_inr: within * 1.25 };
}

export function vendorBudgetTier(
  vendor: Vendor,
  ceilings: CategoryBudgetCeilings | null,
): CategoryBudgetTier | null {
  if (!ceilings) return null;
  const high = vendor.price_display ? priceDisplayHighEnd(vendor.price_display) : null;
  if (high == null) return null;
  if (high <= ceilings.within_inr) return "within";
  if (high <= ceilings.stretch_inr) return "stretch";
  return "splurge";
}

function vendorTravelBucket(vendor: Vendor): CategoryTravelBucket {
  switch (vendor.travel_level) {
    case "local":
      return "local";
    case "regional":
    case "nationwide":
      return "india";
    case "destination":
    case "worldwide":
      return "international";
  }
}

function vendorMatchesPastVenue(vendor: Vendor, match: string): boolean {
  const needle = match.toLowerCase();
  return vendor.venue_connections.some((v) =>
    v.name.toLowerCase().includes(needle),
  );
}

// Deterministic, mock availability flag. Real availability data isn't on the
// Vendor record yet — this hashes the id so toggling the filter changes the
// count in a stable, reviewable way. Replace with a calendar lookup once
// /api/vendors/availability lands.
export function vendorAvailableOn(vendor: Vendor, _isoDate: string | null): boolean {
  let h = 0;
  for (let i = 0; i < vendor.id.length; i++) {
    h = (h * 31 + vendor.id.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 5) !== 0; // ~80% available
}

export function applyCategoryDrillFilters(
  vendors: Vendor[],
  filters: CategoryDrillFilters,
  config: CategoryFilterConfig,
  ceilings: CategoryBudgetCeilings | null,
  weddingDateIso: string | null,
): Vendor[] {
  return vendors.filter((v) => {
    if (filters.styles.length > 0) {
      const tags = new Set(v.style_tags.map((t) => t.toLowerCase()));
      const hit = filters.styles.some((s) => tags.has(s.toLowerCase()));
      if (!hit) return false;
    }
    if (filters.budget_tier) {
      const tier = vendorBudgetTier(v, ceilings);
      if (tier !== filters.budget_tier) return false;
    }
    if (filters.travel) {
      if (vendorTravelBucket(v) !== filters.travel) return false;
    }
    if (filters.past_venues.length > 0) {
      const allHit = filters.past_venues.every((needle) => {
        const cfg = config.past_venues.find((pv) => pv.label === needle);
        if (!cfg) return true;
        return vendorMatchesPastVenue(v, cfg.match);
      });
      if (!allHit) return false;
    }
    if (filters.available_on_date && config.show_availability) {
      if (!vendorAvailableOn(v, weddingDateIso)) return false;
    }
    if (filters.select_only && v.tier !== "select") return false;
    return true;
  });
}

export function sortCategoryDrill(
  vendors: Vendor[],
  sort: CategoryDrillSort,
): Vendor[] {
  const copy = [...vendors];
  switch (sort) {
    case "price_asc":
      return copy.sort(
        (a, b) =>
          (priceDisplayLowEnd(a.price_display) ?? Infinity) -
          (priceDisplayLowEnd(b.price_display) ?? Infinity),
      );
    case "price_desc":
      return copy.sort(
        (a, b) =>
          (priceDisplayHighEnd(b.price_display) ?? -1) -
          (priceDisplayHighEnd(a.price_display) ?? -1),
      );
    case "most_reviewed":
      return copy.sort((a, b) => b.review_count - a.review_count);
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "best_match":
    default:
      return copy.sort((a, b) => {
        const tierDiff = (b.tier === "select" ? 1 : 0) - (a.tier === "select" ? 1 : 0);
        if (tierDiff !== 0) return tierDiff;
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return b.review_count - a.review_count;
      });
  }
}

// Suggest the single filter whose removal would surface the most extra
// results — used for the empty-state hint. Returns null if all filters are
// already off or no toggle alone fixes the problem.
export function suggestFilterRelaxation(
  allVendorsInCategory: Vendor[],
  filters: CategoryDrillFilters,
  config: CategoryFilterConfig,
  ceilings: CategoryBudgetCeilings | null,
  weddingDateIso: string | null,
): { hint: string; gain: number } | null {
  const relaxations: Array<{ hint: string; relaxed: CategoryDrillFilters }> = [];
  for (const venue of filters.past_venues) {
    relaxations.push({
      hint: `'${venue}'`,
      relaxed: {
        ...filters,
        past_venues: filters.past_venues.filter((p) => p !== venue),
      },
    });
  }
  for (const style of filters.styles) {
    relaxations.push({
      hint: `'${style}'`,
      relaxed: {
        ...filters,
        styles: filters.styles.filter((s) => s !== style),
      },
    });
  }
  if (filters.budget_tier) {
    relaxations.push({
      hint: "the budget tier filter",
      relaxed: { ...filters, budget_tier: null },
    });
  }
  if (filters.travel) {
    relaxations.push({
      hint: "the travel filter",
      relaxed: { ...filters, travel: null },
    });
  }
  if (filters.select_only) {
    relaxations.push({
      hint: "'Ananya Select only'",
      relaxed: { ...filters, select_only: false },
    });
  }
  if (filters.available_on_date) {
    relaxations.push({
      hint: "the availability filter",
      relaxed: { ...filters, available_on_date: false },
    });
  }
  let best: { hint: string; gain: number } | null = null;
  const baseline = applyCategoryDrillFilters(
    allVendorsInCategory,
    filters,
    config,
    ceilings,
    weddingDateIso,
  ).length;
  for (const r of relaxations) {
    const after = applyCategoryDrillFilters(
      allVendorsInCategory,
      r.relaxed,
      config,
      ceilings,
      weddingDateIso,
    ).length;
    const gain = after - baseline;
    if (gain > 0 && (!best || gain > best.gain)) {
      best = { hint: r.hint, gain };
    }
  }
  return best;
}
