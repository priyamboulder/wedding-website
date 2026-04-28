// ── AI vendor recommendation engine ────────────────────────────────────────
// Deterministic, client-side scoring that powers the AI Recommendation section
// on /vendors. Inputs: the full vendor directory + the couple's wedding
// details pulled from the Events / Venue stores + existing shortlist state.
// Output: top 3 diverse picks per category with a one-sentence WHY rationale.
//
// No backend — this is the Phase 1 heuristic layer. It reads only the unified
// Vendor record (no separate profile layer).

import type {
  Vendor,
  VendorCategory,
  ShortlistEntry,
  ShortlistStatus,
} from "@/types/vendor";
import type { VenueProfile } from "@/types/venue";
import type { CoupleContext, EventRecord } from "@/types/events";
import { priceDisplayHighEnd } from "@/lib/vendors/price-display";

// ── Context the engine reads ────────────────────────────────────────────────

export interface WeddingContext {
  venueName: string | null;
  venueCity: string | null;
  venueState: string | null;
  isDestination: boolean;
  destinationCountry: string | null;
  guestCount: number;
  eventNames: string[];
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  traditions: string[];
  plannerName: string | null;
  plannerCompany: string | null;
  priorityRanking: string[];
}

// ── Category order / presentation meta ──────────────────────────────────────

export const RECOMMENDATION_CATEGORY_ORDER: VendorCategory[] = [
  "photography",
  "decor_florals",
  "catering",
  "entertainment",
  "hmua",
  "pandit_ceremony",
  "wardrobe",
  "stationery",
];

export const CATEGORY_EMOJI: Record<VendorCategory, string> = {
  photography: "📷",
  decor_florals: "🎨",
  catering: "🍽",
  entertainment: "🎵",
  hmua: "💄",
  pandit_ceremony: "🕉",
  wardrobe: "👗",
  stationery: "✉️",
};

export const CATEGORY_BUDGET_SHARE: Record<
  VendorCategory,
  { min: number; max: number }
> = {
  photography: { min: 0.08, max: 0.12 },
  decor_florals: { min: 0.15, max: 0.25 },
  catering: { min: 0.2, max: 0.35 },
  entertainment: { min: 0.05, max: 0.1 },
  hmua: { min: 0.02, max: 0.05 },
  pandit_ceremony: { min: 0.005, max: 0.02 },
  wardrobe: { min: 0.08, max: 0.2 },
  stationery: { min: 0.01, max: 0.03 },
};

// ── Recommendation shape (local, not the API shape) ─────────────────────────

export type RecommendationLabel =
  | "top_match"
  | "great_value"
  | "rising_star"
  | "destination_specialist";

export interface LocalRecommendation {
  vendor: Vendor;
  score: number;
  reason: string;
  signals: string[];
  label: RecommendationLabel;
  weddingsAtYourVenue: number;
  weddingsWithYourPlanner: number;
}

export interface CategoryRecommendations {
  category: VendorCategory;
  state: "booked" | "in_progress" | "open";
  bookedVendor: Vendor | null;
  inProgressVendors: Vendor[];
  inProgressStatus: ShortlistStatus | null;
  recommendations: LocalRecommendation[];
  budgetGuidance: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function scoreBudgetFit(
  vendor: Vendor,
  category: VendorCategory,
  ctx: WeddingContext,
): { score: number; inBudget: boolean } {
  if (ctx.budgetMinCents == null || ctx.budgetMaxCents == null) {
    return { score: 0.5, inBudget: true };
  }
  const high = vendor.price_display ? priceDisplayHighEnd(vendor.price_display) : null;
  if (high == null) return { score: 0.4, inBudget: true };

  const share = CATEGORY_BUDGET_SHARE[category];
  const budgetMaxInr = ctx.budgetMaxCents / 100;
  const budgetMinInr = ctx.budgetMinCents / 100;
  const catMin = budgetMinInr * share.min;
  const catMax = budgetMaxInr * share.max;
  const inBudget = high <= catMax && high >= catMin * 0.5;

  if (high <= catMax && high >= catMin) return { score: 1, inBudget: true };
  if (high < catMin) return { score: 0.75, inBudget: true };
  if (high <= catMax * 1.25) return { score: 0.55, inBudget: true };
  return { score: 0.15, inBudget: false };
}

function countWeddingsAtVenue(vendor: Vendor, venueName: string | null): number {
  if (!venueName) return 0;
  const lower = venueName.toLowerCase();
  const match = (vendor.venue_connections ?? []).find(
    (v) =>
      v.name.toLowerCase().includes(lower.split("·")[0].trim().toLowerCase()) ||
      lower.includes(v.name.toLowerCase()),
  );
  return match?.wedding_count ?? 0;
}

function countWeddingsWithPlanner(
  vendor: Vendor,
  plannerCompany: string | null,
): number {
  if (!plannerCompany) return 0;
  const lower = plannerCompany.toLowerCase();
  const planner = (vendor.planner_connections ?? []).find(
    (p) =>
      p.company.toLowerCase().includes(lower) ||
      lower.includes(p.company.toLowerCase()),
  );
  return planner?.wedding_count ?? 0;
}

function countDestinationVenues(vendor: Vendor, country: string | null): number {
  if (!country) return 0;
  const lower = country.toLowerCase();
  return (vendor.venue_connections ?? []).filter(
    (v) => v.city.toLowerCase().includes(lower) || v.state.toLowerCase().includes(lower),
  ).length;
}

function scoreRating(vendor: Vendor): number {
  if (vendor.rating == null) return 0.3;
  const ratingScore = vendor.rating / 5;
  const reviewWeight = Math.min(1, vendor.review_count / 50);
  return 0.5 * ratingScore + 0.5 * ratingScore * reviewWeight;
}

function scoreWeddingCount(vendor: Vendor): number {
  return Math.min(1, vendor.wedding_count / 100);
}

function scoreTravel(vendor: Vendor, isDestination: boolean): number {
  if (!isDestination) return 0.5;
  switch (vendor.travel_level) {
    case "worldwide":
      return 1;
    case "destination":
      return 0.95;
    case "nationwide":
      return 0.6;
    case "regional":
      return 0.3;
    case "local":
      return 0.1;
  }
}

// ── Scoring ─────────────────────────────────────────────────────────────────

interface ScoredVendor {
  vendor: Vendor;
  score: number;
  venueCount: number;
  plannerCount: number;
  destinationCount: number;
  budgetFit: { score: number; inBudget: boolean };
}

function scoreVendor(
  vendor: Vendor,
  category: VendorCategory,
  ctx: WeddingContext,
): ScoredVendor {
  const venueCount = countWeddingsAtVenue(vendor, ctx.venueName);
  const plannerCount = countWeddingsWithPlanner(vendor, ctx.plannerCompany);
  const destinationCount = countDestinationVenues(vendor, ctx.destinationCountry);
  const budgetFit = scoreBudgetFit(vendor, category, ctx);

  const venueScore = Math.min(1, venueCount / 3);
  const plannerScore = Math.min(1, plannerCount / 5);
  const destScore = ctx.isDestination ? Math.min(1, destinationCount / 2) : 0;
  const ratingScore = scoreRating(vendor);
  const weddingScore = scoreWeddingCount(vendor);
  const travelScore = scoreTravel(vendor, ctx.isDestination);

  const score =
    venueScore * 0.22 +
    plannerScore * 0.18 +
    budgetFit.score * 0.18 +
    ratingScore * 0.15 +
    weddingScore * 0.1 +
    destScore * (ctx.isDestination ? 0.1 : 0) +
    travelScore * (ctx.isDestination ? 0.07 : 0.03);

  return {
    vendor,
    score,
    venueCount,
    plannerCount,
    destinationCount,
    budgetFit,
  };
}

function pickDiverse(
  scored: ScoredVendor[],
  ctx: WeddingContext,
): {
  top: ScoredVendor | null;
  value: ScoredVendor | null;
  fresh: ScoredVendor | null;
} {
  if (scored.length === 0) return { top: null, value: null, fresh: null };

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted[0];

  const topHigh = (top.vendor.price_display ? priceDisplayHighEnd(top.vendor.price_display) : null) ?? Infinity;
  const value =
    sorted.find((s) => {
      if (s.vendor.id === top.vendor.id) return false;
      const h = s.vendor.price_display ? priceDisplayHighEnd(s.vendor.price_display) : null;
      if (h == null) return false;
      return h < topHigh * 0.7;
    }) ?? null;

  let fresh: ScoredVendor | null = null;
  const excluded = new Set(
    [top?.vendor.id, value?.vendor.id].filter(Boolean) as string[],
  );
  if (ctx.isDestination) {
    fresh =
      sorted.find(
        (s) => !excluded.has(s.vendor.id) && s.destinationCount > 0,
      ) ?? null;
  }
  if (!fresh) {
    fresh =
      sorted.find((s) => {
        if (excluded.has(s.vendor.id)) return false;
        return (s.vendor.rating ?? 0) >= 4.6 && s.vendor.wedding_count <= 80;
      }) ?? null;
  }
  if (!fresh) {
    fresh = sorted.find((s) => !excluded.has(s.vendor.id)) ?? null;
  }

  return { top, value, fresh };
}

function generateReason(
  s: ScoredVendor,
  category: VendorCategory,
  ctx: WeddingContext,
  label: RecommendationLabel,
): { reason: string; signals: string[] } {
  const signals: string[] = [];
  const reasons: string[] = [];

  if (s.venueCount > 0 && ctx.venueName) {
    signals.push(
      `${s.venueCount} wedding${s.venueCount === 1 ? "" : "s"} at your venue`,
    );
    const venueShort = ctx.venueName.split("·")[0].trim();
    reasons.push(
      `has worked ${s.venueCount} wedding${s.venueCount === 1 ? "" : "s"} at ${venueShort}`,
    );
  }
  if (s.plannerCount > 0 && ctx.plannerCompany) {
    signals.push(`${s.plannerCount} with ${ctx.plannerCompany}`);
    reasons.push(
      `works with your planner ${ctx.plannerCompany} (${s.plannerCount} weddings together)`,
    );
  }
  if (s.destinationCount > 0 && ctx.destinationCountry) {
    signals.push(`${s.destinationCount} in ${ctx.destinationCountry}`);
    reasons.push(
      `${s.destinationCount} ${s.destinationCount === 1 ? "wedding" : "weddings"} in ${ctx.destinationCountry}`,
    );
  }
  if (s.budgetFit.inBudget) {
    signals.push("within your budget");
  }
  if ((s.vendor.rating ?? 0) >= 4.8 && s.vendor.review_count >= 40) {
    signals.push(
      `${s.vendor.rating?.toFixed(1)} stars · ${s.vendor.review_count} reviews`,
    );
  }
  if (label === "great_value" && !signals.some((x) => x.includes("budget"))) {
    signals.push("budget-friendly");
  }
  if (label === "rising_star") {
    signals.push("rising talent");
  }

  let reason = "";
  if (reasons.length > 0) {
    reason = `${capitalize(reasons.slice(0, 2).join(" and "))}.`;
  } else if (label === "great_value") {
    reason = `Strong portfolio at a lower price point — a smart pick if you want to protect budget for another category.`;
  } else if (label === "rising_star") {
    reason = `Rising name with editorial taste and excellent early reviews. Books faster than you'd expect — worth reaching out early.`;
  } else if (label === "destination_specialist") {
    reason = `Specializes in destination weddings and travels well — familiar with resort logistics and local vendor coordination.`;
  } else {
    reason = `Consistent top-tier work in ${category.replace("_", " ")} with strong reviews for weddings at your scale.`;
  }

  if (reason.length < 55 && (s.vendor.rating ?? 0) >= 4.7) {
    reason += ` Rated ${s.vendor.rating?.toFixed(1)} across ${s.vendor.review_count} reviews.`;
  }

  return {
    reason,
    signals: Array.from(new Set(signals)).slice(0, 4),
  };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function formatBudgetRange(
  minCents: number | null,
  maxCents: number | null,
  share: { min: number; max: number },
): string | null {
  if (minCents == null || maxCents == null) return null;
  const min = (minCents / 100) * share.min;
  const max = (maxCents / 100) * share.max;
  return `${formatInr(min)} – ${formatInr(max)}`;
}

function formatInr(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${Math.round(n / 1_00_000)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${Math.round(n)}`;
}

function budgetGuidanceFor(
  category: VendorCategory,
  ctx: WeddingContext,
): string {
  const share = CATEGORY_BUDGET_SHARE[category];
  const pct = `${Math.round(share.min * 100)}–${Math.round(share.max * 100)}%`;
  const range = formatBudgetRange(
    ctx.budgetMinCents,
    ctx.budgetMaxCents,
    share,
  );

  const byCategory: Record<VendorCategory, string> = {
    photography: `Photography typically runs ${pct} of your total budget.`,
    decor_florals: `Décor & florals for a ${ctx.eventNames.length}-event South Asian wedding usually land in the ${pct} band.`,
    catering: `Catering is the heaviest line item — expect ${pct} of your budget.`,
    entertainment: `Entertainment (DJ, live band, sangeet acts) typically runs ${pct}.`,
    hmua: `HMUA typically lands at ${pct} of your total.`,
    pandit_ceremony: `Ceremony services usually run ${pct} per ceremony.`,
    wardrobe: `Wardrobe typically runs ${pct} of your total.`,
    stationery: `Stationery typically runs ${pct}.`,
  };

  const base = byCategory[category];
  if (range) return `${base} For your budget, that's roughly ${range}.`;
  if (ctx.isDestination && ctx.destinationCountry) {
    return `${base} Destination note: budget extra for traveling vendor flights + accommodation.`;
  }
  return base;
}

export function buildRecommendations({
  vendors,
  shortlist,
  ctx,
}: {
  vendors: Vendor[];
  shortlist: ShortlistEntry[];
  ctx: WeddingContext;
}): CategoryRecommendations[] {
  const shortlistByVendor = new Map(
    shortlist.map((e) => [e.vendor_id, e] as const),
  );

  return RECOMMENDATION_CATEGORY_ORDER.map((category) => {
    const catVendors = vendors.filter((v) => v.category === category);

    const booked: Vendor[] = [];
    const inProgress: { vendor: Vendor; status: ShortlistStatus }[] = [];
    for (const v of catVendors) {
      const entry = shortlistByVendor.get(v.id);
      if (!entry) continue;
      if (entry.status === "booked" || entry.status === "contracted") {
        booked.push(v);
      } else if (entry.status !== "ruled_out") {
        inProgress.push({ vendor: v, status: entry.status });
      }
    }

    if (booked.length > 0) {
      return {
        category,
        state: "booked" as const,
        bookedVendor: booked[0],
        inProgressVendors: [],
        inProgressStatus: null,
        recommendations: [],
        budgetGuidance: budgetGuidanceFor(category, ctx),
      };
    }

    const scoringPool = catVendors.filter((v) => {
      const entry = shortlistByVendor.get(v.id);
      return !entry || entry.status !== "ruled_out";
    });

    const scored = scoringPool.map((v) => scoreVendor(v, category, ctx));
    const diverse = pickDiverse(scored, ctx);

    const recs: LocalRecommendation[] = [];
    if (diverse.top) {
      const { reason, signals } = generateReason(
        diverse.top,
        category,
        ctx,
        "top_match",
      );
      recs.push({
        vendor: diverse.top.vendor,
        score: diverse.top.score,
        reason,
        signals,
        label: "top_match",
        weddingsAtYourVenue: diverse.top.venueCount,
        weddingsWithYourPlanner: diverse.top.plannerCount,
      });
    }
    if (diverse.value) {
      const { reason, signals } = generateReason(
        diverse.value,
        category,
        ctx,
        "great_value",
      );
      recs.push({
        vendor: diverse.value.vendor,
        score: diverse.value.score,
        reason,
        signals,
        label: "great_value",
        weddingsAtYourVenue: diverse.value.venueCount,
        weddingsWithYourPlanner: diverse.value.plannerCount,
      });
    }
    if (diverse.fresh) {
      const label: RecommendationLabel = ctx.isDestination
        ? "destination_specialist"
        : "rising_star";
      const { reason, signals } = generateReason(
        diverse.fresh,
        category,
        ctx,
        label,
      );
      recs.push({
        vendor: diverse.fresh.vendor,
        score: diverse.fresh.score,
        reason,
        signals,
        label,
        weddingsAtYourVenue: diverse.fresh.venueCount,
        weddingsWithYourPlanner: diverse.fresh.plannerCount,
      });
    }

    return {
      category,
      state: inProgress.length > 0 ? ("in_progress" as const) : ("open" as const),
      bookedVendor: null,
      inProgressVendors: inProgress.map((x) => x.vendor),
      inProgressStatus: inProgress[0]?.status ?? null,
      recommendations: recs,
      budgetGuidance: budgetGuidanceFor(category, ctx),
    };
  });
}

export function deriveWeddingContext({
  venueProfile,
  coupleContext,
  events,
}: {
  venueProfile: VenueProfile;
  coupleContext: CoupleContext;
  events: EventRecord[];
}): WeddingContext {
  const isDestination =
    venueProfile.venue_type === "destination" ||
    venueProfile.venue_type === "beach";

  const destinationCountry = inferCountryFromLocation(venueProfile.location);

  const eventNames = events
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((e) => e.customName || eventLabelForType(e.type));

  const { budgetMinCents, budgetMaxCents } = estimateBudget(
    coupleContext.totalGuestCount,
  );

  return {
    venueName: venueProfile.name || null,
    venueCity: venueProfile.location?.split(",")[0]?.trim() ?? null,
    venueState: venueProfile.location?.split(",").slice(-2, -1)[0]?.trim() ?? null,
    isDestination,
    destinationCountry,
    guestCount: coupleContext.totalGuestCount,
    eventNames,
    budgetMinCents,
    budgetMaxCents,
    traditions: coupleContext.traditions,
    plannerName: "Urvashi",
    plannerCompany: "Radz Events",
    priorityRanking: coupleContext.priorityRanking,
  };
}

function inferCountryFromLocation(location: string | null): string | null {
  if (!location) return null;
  const lower = location.toLowerCase();
  if (lower.includes("mexico") || lower.includes("cancun")) return "Mexico";
  if (lower.includes("italy") || lower.includes("tuscany")) return "Italy";
  if (lower.includes("thailand")) return "Thailand";
  if (lower.includes("bali") || lower.includes("indonesia")) return "Indonesia";
  if (lower.includes("dubai") || lower.includes("uae")) return "UAE";
  return null;
}

function estimateBudget(guestCount: number): {
  budgetMinCents: number;
  budgetMaxCents: number;
} {
  const perGuestLowInr = 50_000;
  const perGuestHighInr = 1_20_000;
  return {
    budgetMinCents: Math.round(guestCount * perGuestLowInr * 100),
    budgetMaxCents: Math.round(guestCount * perGuestHighInr * 100),
  };
}

function eventLabelForType(type: string): string {
  const map: Record<string, string> = {
    pithi: "Pithi",
    haldi: "Haldi",
    mehendi: "Mehendi",
    sangeet: "Sangeet",
    garba: "Garba",
    baraat: "Baraat",
    ceremony: "Ceremony",
    cocktail: "Cocktail",
    reception: "Reception",
    after_party: "After-party",
    welcome_dinner: "Welcome Dinner",
    farewell_brunch: "Farewell Brunch",
    custom: "Event",
  };
  return map[type] ?? type;
}

export function formatBudgetHeadline(
  min: number | null,
  max: number | null,
): string | null {
  if (min == null || max == null) return null;
  return `${formatInr(min / 100)} – ${formatInr(max / 100)}`;
}

export const RECOMMENDATION_LABEL_TEXT: Record<RecommendationLabel, string> = {
  top_match: "Top Match",
  great_value: "Great Value",
  rising_star: "Rising Star",
  destination_specialist: "Destination Specialist",
};
