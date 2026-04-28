// ── Roulette ranking ────────────────────────────────────────────────────────
// Given a bride's filters + the vendor directory, produce a ranked, deduped
// vendor stack for a Roulette session. Five weighted factors, plus an
// anti-monotony shuffle so the experience feels like discovery rather than a
// strict leaderboard.

import type { Vendor, PriceDisplay, ShortlistEntry } from "@/types/vendor";
import type { RouletteFilters } from "@/types/roulette";

// Min and max numeric bounds extracted from the price_display union — used
// for budget-fit scoring. "contact" pricing returns nulls (treated neutrally).
export function priceBounds(pd: PriceDisplay): {
  min: number | null;
  max: number | null;
} {
  switch (pd.type) {
    case "exact":
      return { min: pd.amount, max: pd.amount };
    case "starting_from":
      return { min: pd.amount, max: null };
    case "range":
      return { min: pd.min, max: pd.max };
    case "contact":
      return { min: null, max: null };
  }
}

function styleMatchScore(
  brideTags: string[],
  vendorTags: string[],
): number {
  if (brideTags.length === 0) return 0.5;
  const vendor = new Set(vendorTags.map((t) => t.toLowerCase()));
  const hits = brideTags.filter((t) => vendor.has(t.toLowerCase())).length;
  return hits / brideTags.length;
}

function reviewQualityScore(vendor: Vendor): number {
  // Star rating contributes 70% (capped at 5), review count contributes 30%
  // (capped at 20). Vendors with 0 reviews get a neutral 0.5 so they're not
  // locked out of the experience.
  if (vendor.rating == null || vendor.review_count === 0) return 0.5;
  const ratingScore = Math.min(vendor.rating, 5) / 5;
  const countScore = Math.min(vendor.review_count, 20) / 20;
  return ratingScore * 0.7 + countScore * 0.3;
}

function budgetFitScore(
  vendor: Vendor,
  filters: RouletteFilters,
): number {
  const { min: vendorMin, max: vendorMax } = priceBounds(vendor.price_display);
  if (filters.budget_min == null && filters.budget_max == null) return 0.5;
  if (vendorMin == null) return 0.5; // contact-for-pricing — don't penalise
  const brideMin = filters.budget_min ?? 0;
  const brideMax = filters.budget_max ?? Number.POSITIVE_INFINITY;
  const effectiveMax = filters.budget_flexible ? brideMax * 1.25 : brideMax;

  // Perfect overlap — vendor range intersects bride range.
  const vMax = vendorMax ?? vendorMin;
  if (vMax >= brideMin && vendorMin <= brideMax) return 1.0;
  // Flexible zone — vendor min up to 25% above bride max.
  if (vendorMin <= effectiveMax) return 0.7;
  // Stretch zone — vendor min up to 50% above bride max.
  if (vendorMin <= brideMax * 1.5) return 0.3;
  return 0.0;
}

function portfolioQualityScore(vendor: Vendor): number {
  const count = (vendor.portfolio_images ?? []).length;
  const countScore = Math.min(count, 20) / 20;
  // Recency proxy: use profile_completeness as a rough stand-in for how
  // actively the vendor maintains their profile.
  const recencyScore = (vendor.profile_completeness ?? 50) / 100;
  return countScore * 0.6 + recencyScore * 0.4;
}

function responseRateScore(vendor: Vendor): number {
  if (vendor.response_time_hours == null) return 0.5;
  // Faster responders score higher: under 4h → 1.0, 24h → ~0.5, 72h+ → 0.
  const hours = vendor.response_time_hours;
  if (hours <= 4) return 1.0;
  if (hours >= 72) return 0.0;
  return 1 - (hours - 4) / 68;
}

export function vendorScore(
  vendor: Vendor,
  filters: RouletteFilters,
): number {
  return (
    styleMatchScore(filters.style_tags, vendor.style_tags) * 0.3 +
    reviewQualityScore(vendor) * 0.25 +
    budgetFitScore(vendor, filters) * 0.2 +
    portfolioQualityScore(vendor) * 0.15 +
    responseRateScore(vendor) * 0.1
  );
}

// City match: vendor's home location OR (if include_travel) any vendor whose
// travel_level allows them to work beyond their base city.
function cityMatches(
  vendor: Vendor,
  city: string,
  includeTravel: boolean,
): boolean {
  const needle = city.trim().toLowerCase();
  if (!needle) return true;
  const loc = vendor.location?.toLowerCase() ?? "";
  if (loc.includes(needle)) return true;
  if (!includeTravel) return false;
  // Anything beyond "local" is considered traveling-friendly.
  return vendor.travel_level !== "local";
}

// Apply bride's filters + exclude vendors she's already acted on.
export interface MatchContext {
  vendors: Vendor[];
  shortlist: ShortlistEntry[];
  seenVendorIds: Set<string>;  // vendors swiped in any prior roulette session
}

export function matchVendors(
  filters: RouletteFilters,
  ctx: MatchContext,
): Vendor[] {
  const bookedOrRuledOut = new Set(
    ctx.shortlist
      .filter((e) => e.status === "booked" || e.status === "ruled_out")
      .map((e) => e.vendor_id),
  );

  return ctx.vendors.filter((v) => {
    if (v.category !== filters.category) return false;
    if ((v.portfolio_images ?? []).length === 0) return false;
    if (!cityMatches(v, filters.city, filters.include_travel)) return false;
    if (bookedOrRuledOut.has(v.id)) return false;
    if (ctx.seenVendorIds.has(v.id)) return false;
    return true;
  });
}

// Anti-monotony: after sorting by score, swap every 4th vendor with a random
// vendor from positions 5-10 so the stack feels discovery-like rather than a
// strict leaderboard. Uses a seeded RNG so the same session produces the same
// order on resume.
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function antiMonotonyShuffle<T>(ranked: T[], seed: number): T[] {
  if (ranked.length < 11) return ranked.slice();
  const rng = mulberry32(seed);
  const out = ranked.slice();
  for (let i = 3; i < out.length; i += 4) {
    const swapWith = 4 + Math.floor(rng() * 6); // 4..9 offset
    const target = Math.min(i + swapWith, out.length - 1);
    [out[i], out[target]] = [out[target], out[i]];
  }
  return out;
}

export function rankVendors(
  filters: RouletteFilters,
  ctx: MatchContext,
  seed: number = Date.now(),
): Vendor[] {
  const matched = matchVendors(filters, ctx);
  matched.sort((a, b) => vendorScore(b, filters) - vendorScore(a, filters));
  return antiMonotonyShuffle(matched, seed).slice(0, 50);
}

export function countMatches(
  filters: RouletteFilters,
  ctx: MatchContext,
): number {
  return matchVendors(filters, ctx).length;
}
