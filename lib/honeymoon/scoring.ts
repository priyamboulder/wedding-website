// ── Destination scoring ───────────────────────────────────────────────────
// Scores each seeded trip concept against the couple's vibeProfile and
// returns enough metadata to render the inspiration wall card (match
// label, season fit line, budget fit line, weighted score). Weights
// mirror the product brief:
//   vibe 25 · budget 25 · season 20 · duration 10 · logistics 10 · priorities 10

import type { HoneymoonVibeProfile } from "@/types/honeymoon";
import type { DestinationConcept } from "./destination-catalog";
import { DESTINATION_CONCEPTS } from "./destination-catalog";

export interface ScoreBreakdown {
  vibe: number;
  budget: number;
  season: number;
  duration: number;
  logistics: number;
  priorities: number;
}

export type FitLabel = "perfect" | "good" | "stretch" | "poor";

export interface ScoredConcept {
  concept: DestinationConcept;
  score: number; // 0–100
  breakdown: ScoreBreakdown;
  reasons: string[];
  warnings: string[];
  budgetFit: "fits" | "stretch" | "over" | "under";
  budgetLine: string;
  seasonFit: "perfect" | "shoulder" | "avoid" | "unknown";
  seasonLine: string;
  durationFit: "ideal" | "ok" | "tight" | "too_much" | "unknown";
  flightFit: "fits" | "stretch" | "blocked";
  matchLabel: FitLabel;
  eliminated: boolean;
  eliminatedReason?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const BUDGET_TIER_USD: Record<
  NonNullable<HoneymoonVibeProfile["budgetTier"]>,
  [number, number]
> = {
  under_3k: [0, 3000],
  "3k_6k": [3000, 6000],
  "6k_10k": [6000, 10000],
  "10k_15k": [10000, 15000],
  "15k_25k": [15000, 25000],
  over_25k: [25000, 60000],
};

const DURATION_DAYS: Record<
  NonNullable<HoneymoonVibeProfile["duration"]>,
  [number, number] | null
> = {
  long_weekend: [3, 4],
  one_week: [5, 7],
  ten_days: [9, 11],
  two_weeks_plus: [12, 21],
  unsure: null,
};

const FLIGHT_MAX_HOURS: Record<
  NonNullable<HoneymoonVibeProfile["flightTolerance"]>,
  number
> = {
  drive_only: 0,
  domestic_short: 4,
  na_caribbean: 6,
  longhaul_ok: 16,
  exotic_ok: 30,
};

const MONTH_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function rangesOverlap(
  a: [number, number],
  b: [number, number],
): number {
  // Returns 0..1 — fraction of B covered by A. Used for duration + budget fit.
  const lo = Math.max(a[0], b[0]);
  const hi = Math.min(a[1], b[1]);
  if (hi < lo) return 0;
  const overlap = hi - lo;
  const bSpan = b[1] - b[0];
  if (bSpan === 0) return overlap >= 0 ? 1 : 0;
  return overlap / bSpan;
}

function monthsSummary(months: number[]): string {
  if (months.length === 0) return "";
  // Find consecutive runs to render "May–Jun, Sep–Oct" style.
  const sorted = [...months].sort((a, b) => a - b);
  const runs: [number, number][] = [];
  let start = sorted[0]!;
  let end = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const m = sorted[i]!;
    if (m === end + 1) {
      end = m;
    } else {
      runs.push([start, end]);
      start = m;
      end = m;
    }
  }
  runs.push([start, end]);
  return runs
    .map(([s, e]) => (s === e ? MONTH_LABEL[s - 1] : `${MONTH_LABEL[s - 1]}–${MONTH_LABEL[e - 1]}`))
    .join(", ");
}

// ── Sub-scores ─────────────────────────────────────────────────────────────

function scoreVibe(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): { score: number; reason: string | null } {
  if (profile.vibes.length === 0) return { score: 12, reason: null };
  const matches = profile.vibes.filter((v) => c.vibeMatch.includes(v));
  if (matches.length === 0) return { score: 3, reason: null };
  if (matches.length === profile.vibes.length) {
    return {
      score: 25,
      reason:
        profile.vibes.length === 1
          ? "Matches your vibe"
          : "Hits both of your vibes",
    };
  }
  return { score: 16, reason: "Partial vibe match" };
}

function scoreBudget(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): {
  score: number;
  fit: ScoredConcept["budgetFit"];
  line: string;
  reason: string | null;
  warning: string | null;
} {
  const [cLo, cHi] = c.couplesBudgetUsd;
  const budgetLine = `$${(cLo / 1000).toFixed(0)}k–$${(cHi / 1000).toFixed(0)}k total for two`;
  if (profile.budgetTier === null) {
    return {
      score: 12,
      fit: "fits",
      line: budgetLine,
      reason: null,
      warning: null,
    };
  }
  const [bLo, bHi] = BUDGET_TIER_USD[profile.budgetTier];
  const overlap = rangesOverlap([cLo, cHi], [bLo, bHi]);
  if (overlap >= 0.6) {
    return {
      score: 25,
      fit: "fits",
      line: `${budgetLine} · strong budget fit`,
      reason: "Strong budget fit",
      warning: null,
    };
  }
  if (overlap >= 0.2) {
    return {
      score: 16,
      fit: "stretch",
      line: `${budgetLine} · stretches your range`,
      reason: null,
      warning: "Budget is a stretch at this tier",
    };
  }
  // Completely outside — over or under.
  if (cLo > bHi) {
    return {
      score: 4,
      fit: "over",
      line: `${budgetLine} · above your range`,
      reason: null,
      warning: `Starts at $${(cLo / 1000).toFixed(0)}k — above your budget`,
    };
  }
  return {
    score: 10,
    fit: "under",
    line: `${budgetLine} · well under your range`,
    reason: "You'd come in well under budget",
    warning: null,
  };
}

function scoreSeason(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): {
  score: number;
  fit: ScoredConcept["seasonFit"];
  line: string;
  warning: string | null;
} {
  const bestLine = `Best ${monthsSummary(c.bestMonths)}`;
  if (!profile.travelMonth || !/^\d{1,2}$/.test(profile.travelMonth)) {
    // No specific month set — just surface the best-season line.
    return {
      score: 14,
      fit: "unknown",
      line: bestLine,
      warning: null,
    };
  }
  const m = Number(profile.travelMonth);
  if (c.bestMonths.includes(m)) {
    return {
      score: 20,
      fit: "perfect",
      line: `${MONTH_LABEL[m - 1]} is peak season · ${bestLine}`,
      warning: null,
    };
  }
  if (c.shoulderMonths.includes(m)) {
    return {
      score: 15,
      fit: "shoulder",
      line: `${MONTH_LABEL[m - 1]} is shoulder — fewer crowds, lower prices`,
      warning: null,
    };
  }
  if (c.avoidMonths.includes(m)) {
    return {
      score: 3,
      fit: "avoid",
      line: `${MONTH_LABEL[m - 1]} is wet/off-season — consider shifting dates`,
      warning: `${MONTH_LABEL[m - 1]} is a poor time to visit — ${bestLine.toLowerCase()} instead`,
    };
  }
  return {
    score: 10,
    fit: "unknown",
    line: bestLine,
    warning: null,
  };
}

function scoreDuration(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): {
  score: number;
  fit: ScoredConcept["durationFit"];
  warning: string | null;
} {
  if (!profile.duration) return { score: 5, fit: "unknown", warning: null };
  const range = DURATION_DAYS[profile.duration];
  if (range === null) return { score: 5, fit: "unknown", warning: null };
  const overlap = rangesOverlap(c.recommendedDurationDays, range);
  if (overlap >= 0.5) return { score: 10, fit: "ideal", warning: null };
  if (overlap >= 0.1) return { score: 6, fit: "ok", warning: null };
  // No overlap — either trip needs more time or couple has more time than
  // concept supports.
  if (c.recommendedDurationDays[0] > range[1]) {
    return {
      score: 2,
      fit: "tight",
      warning: `This trip really needs ${c.recommendedDurationDays[0]}+ days to work — you'd be rushed`,
    };
  }
  return {
    score: 4,
    fit: "too_much",
    warning: `${c.recommendedDurationDays[1]} days is enough here — you could tack on a second stop`,
  };
}

function scoreLogistics(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): {
  score: number;
  fit: ScoredConcept["flightFit"];
  warning: string | null;
} {
  if (!profile.flightTolerance) {
    return { score: 5, fit: "fits", warning: null };
  }
  const max = FLIGHT_MAX_HOURS[profile.flightTolerance];
  if (profile.flightTolerance === "drive_only" && c.flightHoursFromDFW[0] > 0) {
    return {
      score: 0,
      fit: "blocked",
      warning: "You said drive-to only — this requires a flight",
    };
  }
  if (c.flightHoursFromDFW[0] <= max) {
    return { score: 10, fit: "fits", warning: null };
  }
  if (c.flightHoursFromDFW[0] <= max + 4) {
    return {
      score: 5,
      fit: "stretch",
      warning: `Flight is longer than you said you'd like (${c.flightHoursFromDFW[0]}+ hrs)`,
    };
  }
  return {
    score: 1,
    fit: "blocked",
    warning: `Flight is much longer than you'd like (${c.flightHoursFromDFW[0]}+ hrs)`,
  };
}

function scorePriorities(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): { score: number; reason: string | null } {
  if (profile.priorityInterests.length === 0) {
    return { score: 5, reason: null };
  }
  const hits = profile.priorityInterests.filter((p) =>
    c.priorityTags.includes(p),
  );
  if (hits.length === 0) return { score: 1, reason: null };
  const ratio = hits.length / profile.priorityInterests.length;
  const score = Math.round(10 * ratio);
  if (ratio >= 0.75) {
    return {
      score,
      reason: `Hits ${hits.length} of your ${profile.priorityInterests.length} priorities`,
    };
  }
  return { score, reason: null };
}

// ── Dealbreaker filter ─────────────────────────────────────────────────────

function checkDealbreakers(
  c: DestinationConcept,
  profile: HoneymoonVibeProfile,
): string | null {
  for (const db of profile.dealbreakers) {
    if (c.triggers.includes(db)) {
      if (db === "long_flights") {
        return "Trip requires a long-haul flight (one of your dealbreakers)";
      }
      if (db === "malaria") {
        return "Destination is in a malaria-risk zone";
      }
      return "Destination triggers one of your dealbreakers";
    }
  }
  return null;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function scoreConcept(
  concept: DestinationConcept,
  profile: HoneymoonVibeProfile,
): ScoredConcept {
  const vibe = scoreVibe(concept, profile);
  const budget = scoreBudget(concept, profile);
  const season = scoreSeason(concept, profile);
  const duration = scoreDuration(concept, profile);
  const logistics = scoreLogistics(concept, profile);
  const priorities = scorePriorities(concept, profile);

  const breakdown: ScoreBreakdown = {
    vibe: vibe.score,
    budget: budget.score,
    season: season.score,
    duration: duration.score,
    logistics: logistics.score,
    priorities: priorities.score,
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const reasons = [
    vibe.reason,
    budget.reason,
    priorities.reason,
  ].filter((x): x is string => Boolean(x));
  const warnings = [
    budget.warning,
    season.warning,
    duration.warning,
    logistics.warning,
  ].filter((x): x is string => Boolean(x));

  const dealbreakerReason = checkDealbreakers(concept, profile);

  let matchLabel: FitLabel;
  if (score >= 80) matchLabel = "perfect";
  else if (score >= 60) matchLabel = "good";
  else if (score >= 40) matchLabel = "stretch";
  else matchLabel = "poor";

  return {
    concept,
    score,
    breakdown,
    reasons,
    warnings,
    budgetFit: budget.fit,
    budgetLine: budget.line,
    seasonFit: season.fit,
    seasonLine: season.line,
    durationFit: duration.fit,
    flightFit: logistics.fit,
    matchLabel,
    eliminated: Boolean(dealbreakerReason) || logistics.fit === "blocked",
    eliminatedReason:
      dealbreakerReason ??
      (logistics.fit === "blocked" ? logistics.warning ?? undefined : undefined),
  };
}

export interface MatchResult {
  matches: ScoredConcept[];
  wildcards: ScoredConcept[];
  eliminated: ScoredConcept[];
}

// Returns:
// - top N primary matches (sorted by score, excluding eliminated)
// - up to 2 "wildcard" picks (flagged wildcard=true in catalog, not already
//   in primary matches) for unconventional discovery
// - eliminated set is surfaced so the UI can explain why a destination
//   didn't make the cut
export function matchDestinations(
  profile: HoneymoonVibeProfile,
  limit = 6,
): MatchResult {
  const all = DESTINATION_CONCEPTS.map((c) => scoreConcept(c, profile));
  const live = all.filter((r) => !r.eliminated).sort((a, b) => b.score - a.score);
  const matches = live.slice(0, limit);

  const matchIds = new Set(matches.map((m) => m.concept.id));
  const wildcards = live
    .filter((r) => r.concept.wildcard && !matchIds.has(r.concept.id))
    .slice(0, 2);

  const eliminated = all.filter((r) => r.eliminated);
  return { matches, wildcards, eliminated };
}
