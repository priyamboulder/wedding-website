import type {
  Vendor,
  VendorFilters,
  ShortlistStatus,
  AssignmentFilter,
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
