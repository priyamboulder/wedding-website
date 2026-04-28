// Analytics seed for the vendor portal.
// Synthetic but deterministic — numbers are generated from sine functions
// so the charts render the same across reloads while still looking organic.

export type SourceBreakdown = { name: string; value: number; hint?: string };

export type SearchTerm = { term: string; appearances: number };

export type PortfolioPerf = {
  id: string;
  views30d: number;
  avgDwellSec: number;
  inquiriesAttributed: number;
  trend: "up" | "flat" | "down";
};

// ── Time series helpers ──────────────────────────────────────

// 90 daily values, most recent last.  Shape:
//   base ──► peak, with a weekly wave and small noise.
function buildSeries(
  base: number,
  peak: number,
  wavelen: number,
  noiseAmp: number,
  phase = 0,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < 90; i++) {
    const progress = i / 89;
    const growth = base + (peak - base) * progress;
    const wave = Math.sin(((i + phase) / wavelen) * Math.PI * 2) * noiseAmp;
    const noise =
      Math.sin(i * 2.7 + phase) * (noiseAmp * 0.38) +
      Math.cos(i * 1.3 + phase) * (noiseAmp * 0.26);
    out.push(Math.max(0, Math.round(growth + wave + noise)));
  }
  return out;
}

// Sparse daily series — a small number of events per day, weighted recent.
function buildSparse(total: number, seed: number): number[] {
  const out = new Array(90).fill(0) as number[];
  for (let i = 0; i < total; i++) {
    // Weight recent: sample from 0..1, square to push the mass rightward.
    const r = ((i * 9301 + 49297 + seed * 233) % 233280) / 233280;
    const weighted = 1 - Math.pow(1 - r, 1.6);
    const day = Math.min(89, Math.max(0, Math.floor(weighted * 90)));
    out[day] = (out[day] ?? 0) + 1;
  }
  return out;
}

// ── Exports ───────────────────────────────────────────────────

export const PROFILE_VIEWS_90D: number[] = buildSeries(26, 62, 7, 8.5, 0);
export const SEARCH_APPEARANCES_90D: number[] = buildSeries(
  118,
  184,
  7,
  22,
  2,
);
export const INQUIRIES_90D: number[] = buildSparse(47, 1);
export const SELECTION_ADDS_90D: number[] = buildSparse(64, 3);
export const BOOKINGS_90D: number[] = buildSparse(9, 7);

// Where couples come from before landing on Aurora's profile.
export const REFERRAL_SOURCES: SourceBreakdown[] = [
  {
    name: "Marketplace search",
    value: 38,
    hint: "Direct searches in the couples app",
  },
  {
    name: "Photography · Mumbai",
    value: 21,
    hint: "Your primary category page",
  },
  {
    name: "Editorial features",
    value: 16,
    hint: "Ananya Journal stories & palette picks",
  },
  {
    name: "Couple shortlists",
    value: 12,
    hint: "Added to other couples' saved vendors",
  },
  {
    name: "Planner referrals",
    value: 8,
    hint: "Meera Decor · Coral & Dune · 3 others",
  },
  { name: "Direct link / social", value: 5, hint: "Instagram bio + site" },
];

// Search terms where Aurora has appeared most in the last 30 days.
export const SEARCH_TERMS: SearchTerm[] = [
  { term: "mumbai wedding photographer", appearances: 184 },
  { term: "editorial south asian wedding", appearances: 142 },
  { term: "udaipur destination photographer", appearances: 96 },
  { term: "palace wedding editorial", appearances: 71 },
  { term: "intimate wedding photographer mumbai", appearances: 58 },
  { term: "candid south indian wedding", appearances: 41 },
];

// Per-item engagement over the last 30 days.  Keyed by portfolio item id.
export const PORTFOLIO_PERFORMANCE: Record<string, PortfolioPerf> = {
  p1: { id: "p1", views30d: 412, avgDwellSec: 148, inquiriesAttributed: 8, trend: "up" },
  p7: { id: "p7", views30d: 318, avgDwellSec: 121, inquiriesAttributed: 6, trend: "up" },
  p3: { id: "p3", views30d: 241, avgDwellSec: 94,  inquiriesAttributed: 4, trend: "flat" },
  p4: { id: "p4", views30d: 206, avgDwellSec: 87,  inquiriesAttributed: 3, trend: "up" },
  p5: { id: "p5", views30d: 172, avgDwellSec: 76,  inquiriesAttributed: 2, trend: "flat" },
  p2: { id: "p2", views30d: 148, avgDwellSec: 58,  inquiriesAttributed: 2, trend: "up" },
  p6: { id: "p6", views30d: 104, avgDwellSec: 42,  inquiriesAttributed: 1, trend: "flat" },
  p8: { id: "p8", views30d: 73,  avgDwellSec: 34,  inquiriesAttributed: 0, trend: "down" },
};

// Summary benchmarks, rendered in Profile Tips.
export const BENCHMARKS = {
  portfolioItemsForTopQuartile: 10,
  topResponseTimeHours: 4,
  profileCompletenessGate: 90,
};
