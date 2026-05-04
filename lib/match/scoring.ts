// ──────────────────────────────────────────────────────────────────────────
// Match Me — fit-score algorithm.
//
// Pure module. Given a list of locations and the user's inputs, returns the
// top destinations sorted by score with human-readable reasons. The same
// function runs server-side for save-result rendering and could run
// client-side later for live previews — keep it dependency-free.
//
// Score 0..100 breakdown (see scoreLocation):
//   budget   — up to 40 pts: location is affordable at the user's budget
//   priority — up to 35 pts: priorities matched against location.tags
//   capacity — up to 15 pts: max event size fits with headroom
//   vendor   — up to 10 pts: Indian vendor scene present (always counted)
//
// Dealbreakers are HARD filters (return null), not score deductions.
// ──────────────────────────────────────────────────────────────────────────

import type { BudgetLocationRow } from "@/types/budget";
import type {
  DealbreakerSlug,
  MatchInputs,
  MatchReason,
  MatchedDestination,
  PrioritySlug,
} from "@/types/match";

// Score visible-on-page threshold. Locations below this still get scored
// internally but are hidden from results.
export const MIN_VISIBLE_SCORE = 40;

// Top-N to surface on the editorial spread.
export const RESULTS_LIMIT = 5;

// Human-readable priority labels for both UI and reason strings.
export const PRIORITY_LABELS: Record<PrioritySlug, string> = {
  scenic_beauty: "Scenic beauty",
  cultural_immersion: "Cultural immersion",
  convenient_for_indians: "Convenient travel for guests",
  indian_vendors: "Indian vendors locally available",
  exclusivity: "Exclusivity / under-the-radar",
  beach: "Beach / water access",
  mountain: "Mountain / nature setting",
  heritage: "Heritage / palace setting",
  food_scene: "Food scene",
  nightlife: "Nightlife / party energy",
};

export const DEALBREAKER_LABELS: Record<DealbreakerSlug, string> = {
  long_flights: "Long flights (>10 hours from US)",
  visa_hassles: "Visa hassles",
  no_beach: "No beach",
  not_in_india: "Not in India",
  not_outside_us: "Not outside the US",
  limited_indian_vendors: "Limited Indian vendor pool",
};

// Visa-friction list — pulled from rough US-passport visa convenience.
// Conservative: places that genuinely need an in-advance visa or e-visa
// hassle for the bride's family. Schengen, UK and India are flagged.
const VISA_FRICTION_SLUGS = new Set<string>([
  "udaipur",
  "goa",
  "jaipur",
  "kerala",
  "mumbai-delhi",
  "lake-como",
  "france",
  "spain",
  "uk",
  "greece",
  "portugal",
  "turkey",
  "morocco",
  "kenya",
  "sydney",
]);

// ── Public API ────────────────────────────────────────────────────────────

export interface MatchableLocation extends BudgetLocationRow {
  tags?: string[] | null;
  max_capacity?: number | null;
}

export function rankMatches(
  locations: MatchableLocation[],
  inputs: MatchInputs,
): MatchedDestination[] {
  const scored: MatchedDestination[] = [];
  for (const loc of locations) {
    if (loc.type !== "destination" && loc.type !== "us_metro") continue;
    if (failsDealbreaker(loc, inputs.dealbreakers)) continue;
    const result = scoreLocation(loc, inputs);
    if (result.score >= MIN_VISIBLE_SCORE) scored.push(result);
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, RESULTS_LIMIT);
}

// ── Internals ─────────────────────────────────────────────────────────────

function tagsOf(loc: MatchableLocation): string[] {
  // jsonb arrives as a real array via supabase-js; defensive cast for
  // local fixtures that may have left it null.
  const t = loc.tags;
  if (Array.isArray(t)) return t.map(String);
  return [];
}

function failsDealbreaker(
  loc: MatchableLocation,
  dealbreakers: DealbreakerSlug[],
): boolean {
  if (dealbreakers.length === 0) return false;
  const tags = new Set(tagsOf(loc));

  for (const d of dealbreakers) {
    switch (d) {
      case "long_flights":
        if (tags.has("long_haul_from_us")) return true;
        break;
      case "no_beach":
        // "No beach" reads parallel to "Not in India": filter destinations
        // whose vibe IS beach. The bride is opting out of sand in shoes.
        if (tags.has("beach")) return true;
        break;
      case "not_in_india":
        if (tags.has("in_india")) return true;
        break;
      case "not_outside_us":
        if (!tags.has("in_us")) return true;
        break;
      case "limited_indian_vendors":
        if (!tags.has("indian_vendors")) return true;
        break;
      case "visa_hassles":
        if (VISA_FRICTION_SLUGS.has(loc.slug)) return true;
        break;
    }
  }
  return false;
}

function scoreLocation(
  loc: MatchableLocation,
  inputs: MatchInputs,
): MatchedDestination {
  const tags = new Set(tagsOf(loc));
  const reasons: MatchReason[] = [];
  let score = 0;

  // 1. Budget fit (0–40 pts) — full credit when the user's budget is at or
  //    above the location's calibrated minimum, with a soft tail for
  //    locations that are just slightly above the budget so we don't drop
  //    a "$20K under" Lake Como off the list.
  const min = loc.min_budget_usd;
  if (min <= 0) {
    score += 30;
  } else if (inputs.budget >= min) {
    score += 40;
    reasons.push({
      kind: "budget",
      text: `Within your ${formatBudget(inputs.budget)} budget — typical Indian weddings here land around ${formatBudget(min)}.`,
    });
  } else {
    const gap = (inputs.budget - min) / min; // negative
    if (gap > -0.15) {
      score += 22;
      reasons.push({
        kind: "budget",
        text: `Slightly above your ${formatBudget(inputs.budget)} budget (typical: ${formatBudget(min)}). Tightening one or two categories gets you there.`,
      });
    } else if (gap > -0.3) {
      score += 8;
      reasons.push({
        kind: "budget",
        text: `Reach destination — typical weddings here run ${formatBudget(min)}. Doable with a smaller guest list.`,
      });
    } else {
      // Significantly over budget — don't reward, don't reason about it.
      score += 0;
    }
  }

  // 2. Priorities (0–35 pts) — distribute evenly across selected priorities,
  //    full credit when the location's tags include the priority slug.
  if (inputs.priorities.length > 0) {
    const perPriority = 35 / inputs.priorities.length;
    const matched: PrioritySlug[] = [];
    for (const p of inputs.priorities) {
      if (tags.has(p)) {
        score += perPriority;
        matched.push(p);
      }
    }
    if (matched.length > 0) {
      reasons.push({
        kind: "priority",
        text: editorializeMatched(matched),
      });
    }
  } else {
    // No priorities set — give a flat half-credit so locations don't all
    // collapse onto budget alone.
    score += 17;
  }

  // 3. Capacity (0–15 pts) — venue scene can plausibly handle the event.
  const cap = loc.max_capacity ?? 600;
  if (inputs.guests <= cap) {
    score += 15;
    if (inputs.guests > 600) {
      reasons.push({
        kind: "capacity",
        text: `Venues here regularly handle ${inputs.guests}+ guest events.`,
      });
    }
  } else {
    const overflow = inputs.guests - cap;
    if (overflow <= 100) {
      score += 7;
      reasons.push({
        kind: "capacity",
        text: `${inputs.guests} guests is at the top end here — expect to book the largest property in town.`,
      });
    } else {
      reasons.push({
        kind: "capacity",
        text: `${inputs.guests} guests is a stretch for venues here (typical ceiling: ${cap}).`,
      });
      // No score added — they'll feel the cap.
    }
  }

  // 4. Indian vendor scene (0–10 pts) — always rewarded, but only mentioned
  //    in reasons when the user actually flagged it as a priority.
  if (tags.has("indian_vendors")) {
    score += 10;
  } else if (tags.has("convenient_for_indians")) {
    score += 5;
  }

  // Round to the nearest integer. Cap at 100 so "a great fit" reads cleanly.
  const rounded = Math.max(0, Math.min(100, Math.round(score)));

  return {
    slug: loc.slug,
    name: loc.name,
    country: loc.country,
    continent: loc.continent,
    tagline: loc.tagline,
    hero_image_url: loc.hero_image_url,
    multiplier: Number(loc.multiplier ?? 1),
    min_budget_usd: loc.min_budget_usd,
    max_capacity: cap,
    tags: tagsOf(loc),
    score: rounded,
    reasons: reasons.slice(0, 3),
  };
}

function editorializeMatched(matched: PrioritySlug[]): string {
  const labels = matched.map((m) => PRIORITY_LABELS[m]);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} + ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} & ${labels.at(-1)}`;
}

function formatBudget(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}
