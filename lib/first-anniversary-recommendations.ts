// ── First Anniversary recommendation engine ───────────────────────────────
// Curated pool of getaways + at-home ideas + experiences, scored against
// the couple's VibeProfile and AnniversaryBasics. Pure function, runs in
// render — the pool is small enough that memoization is all we need.
//
// When adding a recommendation: fill vibeAffinity for the vibes it fits
// (others default to 30), specify budgetFit tiers with cost ranges, and
// tag hard-no signals the experience triggers.

import type {
  AnniversaryBasics,
  BudgetTier,
  DurationPref,
  Recommendation,
  RecommendationScore,
  RecommendationType,
  VibeProfile,
} from "@/types/first-anniversary";

// ── Pool ──────────────────────────────────────────────────────────────────

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "sedona",
    type: "getaway",
    name: "Sedona, AZ",
    hook: "Red rocks, stargazing, spa days for two",
    palette: ["#C47666", "#E8A895", "#F5E6D3"],
    vibeAffinity: {
      romantic_escape: 90,
      full_relaxation: 95,
      adventure_together: 70,
      nostalgic_return: 50,
      cultural_immersion: 45,
      culinary_journey: 50,
    },
    budgetFit: ["treat", "all_out", "lifetime"],
    activityHighlights: [
      "Hot air balloon sunrise",
      "Couples spa",
      "Cathedral Rock hike",
      "Vineyard dinner",
    ],
    estCostUsd: {
      treat: [900, 1400],
      all_out: [1800, 3500],
      lifetime: [4500, 7000],
    },
    weatherNote: "Warm & dry · 82°/55°F",
    durationFit: ["weekend", "extended"],
    hardNoSignals: ["extreme_heat"],
    editorialDescription:
      "Sedona is what happens when geology decides to show off. The red rocks glow at sunrise and sunset, the sky gets dark enough to see the Milky Way, and the spa culture here treats couples like they're the whole point. Base yourself creekside at L'Auberge — ask for the cottage with the fireplace, the one where the creek becomes your soundtrack.\n\nGo for a long weekend. Build the first day around slowing down — a soak at Mii Amo, a long dinner at Cress, a walk along the water. Then give yourselves one morning that's a little wild: Cathedral Rock at sunrise, a hot-air balloon over the red rocks, or a Pink Jeep tour that ends up somewhere your phone can't quite capture.",
    peakMonths: [3, 4, 5, 10, 11],
  },
  {
    id: "napa_sonoma",
    type: "getaway",
    name: "Napa / Sonoma",
    hook: "Vineyards, long lunches, private tastings just for two",
    palette: ["#8B4A52", "#D4A853", "#F5E6D3"],
    vibeAffinity: {
      culinary_journey: 95,
      romantic_escape: 85,
      full_relaxation: 75,
      cultural_immersion: 55,
      adventure_together: 40,
    },
    budgetFit: ["all_out", "lifetime"],
    activityHighlights: [
      "Private winery tour",
      "Chef's table dinner",
      "Hot air balloon sunrise",
      "Couples spa at Meadowood",
    ],
    estCostUsd: {
      all_out: [2500, 4800],
      lifetime: [5500, 9000],
    },
    weatherNote: "Peak harvest Sep–Oct · 80°/50°F",
    durationFit: ["weekend", "extended"],
    hardNoSignals: [],
    editorialDescription:
      "Napa for your first anniversary is a confident choice — unapologetic about the long lunch, the third tasting, the afternoon nap before dinner. Set your base in Yountville or up the Silverado Trail so you're five minutes from the next great meal and nowhere near anything that feels like a tourist bus.\n\nBook one marquee dinner (The Restaurant at Meadowood or The French Laundry if you're flexing, Bistro Jeanty if you're human) and leave the rest loose. Morning balloon over the vines, afternoon private tasting at a family winery, sunset from the Auberge du Soleil terrace. You will, at some point, decide this is the trip you take every year. Let that feeling win.",
    peakMonths: [5, 9, 10],
  },
  {
    id: "lisbon_porto",
    type: "getaway",
    name: "Lisbon & Porto",
    hook: "Tiled alleys, rooftop wine, late-late dinners",
    palette: ["#E8C4A0", "#6B8E9C", "#F5E6D3"],
    vibeAffinity: {
      cultural_immersion: 95,
      culinary_journey: 85,
      romantic_escape: 75,
      adventure_together: 60,
      full_relaxation: 50,
    },
    budgetFit: ["all_out", "lifetime"],
    activityHighlights: [
      "Alfama tile walk",
      "Douro river cruise",
      "Rooftop sunset in Chiado",
      "Pastéis at 8am",
    ],
    estCostUsd: {
      all_out: [2800, 4500],
      lifetime: [5500, 8500],
    },
    weatherNote: "Mild spring & fall · 72°/55°F",
    durationFit: ["extended", "grand"],
    hardNoSignals: ["long_flights", "passport_required"],
    editorialDescription:
      "Portugal in the off-season is the trip that feels like you're getting away with something. Lisbon is a city that runs late — dinner at 10, rooftop wine at midnight, tiled stairs you'll climb and re-climb because the light keeps doing something.\n\nSpend four days in Lisbon, then take the train to Porto for three more. In Porto you'll fall for the Douro — the river, the cellars across the water in Vila Nova de Gaia, the bookstores, the narrow streets that somehow always lead to a viewpoint. Eat bifana at a counter standing up at least once. That sandwich will become a reference point for the rest of your life.",
    peakMonths: [4, 5, 9, 10],
  },
  {
    id: "charleston",
    type: "getaway",
    name: "Charleston, SC",
    hook: "Cobblestone streets, rooftop oysters, coastal bougie",
    palette: ["#E8D4B0", "#A8876D", "#F5E6D3"],
    vibeAffinity: {
      cultural_immersion: 85,
      romantic_escape: 80,
      culinary_journey: 80,
      full_relaxation: 70,
      nostalgic_return: 60,
    },
    budgetFit: ["treat", "all_out"],
    activityHighlights: [
      "Rainbow Row walk",
      "Oyster + rosé",
      "Sullivan's Island beach",
      "Husk dinner",
    ],
    estCostUsd: {
      treat: [900, 1400],
      all_out: [1700, 3000],
    },
    weatherNote: "Spring bloom · 76°/57°F",
    durationFit: ["weekend", "extended"],
    hardNoSignals: ["extreme_heat"],
    peakMonths: [3, 4, 10, 11],
  },
  {
    id: "mexico_city",
    type: "getaway",
    name: "Mexico City",
    hook: "Taco omakase, art museums, and a rooftop for every hour",
    palette: ["#C4766E", "#4A6548", "#F5E6D3"],
    vibeAffinity: {
      cultural_immersion: 95,
      culinary_journey: 95,
      adventure_together: 70,
      romantic_escape: 65,
    },
    budgetFit: ["treat", "all_out"],
    activityHighlights: [
      "Pujol tasting menu",
      "Frida Kahlo house",
      "Xochimilco boats",
      "Roma Norte cafes",
    ],
    estCostUsd: {
      treat: [1100, 1500],
      all_out: [1800, 3200],
    },
    weatherNote: "Eternal spring · 75°/52°F",
    durationFit: ["extended"],
    hardNoSignals: ["passport_required"],
    peakMonths: [2, 3, 4, 10, 11],
  },
  {
    id: "anniversary_dinner_home",
    type: "at_home",
    name: "Anniversary Dinner Party",
    hook: "Cook your wedding menu at home, invite no one",
    palette: ["#D4A853", "#F5E6D3", "#C4766E"],
    vibeAffinity: {
      celebrate_at_home: 98,
      nostalgic_return: 85,
      culinary_journey: 80,
      romantic_escape: 70,
      full_relaxation: 60,
    },
    budgetFit: ["simple", "treat"],
    activityHighlights: [
      "Recreate your first course",
      "Wedding playlist",
      "Champagne toast",
      "Watch the ceremony back",
    ],
    estCostUsd: {
      simple: [150, 400],
      treat: [400, 900],
    },
    durationFit: ["evening"],
    hardNoSignals: [],
    editorialDescription:
      "There's a version of this celebration that beats any getaway: cook the wedding menu at home, open the good bottle, watch the ceremony footage while dinner's in the oven. This is the anniversary that says we already have everything.\n\nPull out the first-dance playlist. Set the table like you mean it — cloth napkins, the wedding china if you have it, candles that are taller than sensible. Make the course you had at your reception, or the dish from your first date, or just the pasta you always make on Sundays. No phones on the table. This is the night.",
    peakMonths: [],
  },
  {
    id: "first_date_remix",
    type: "at_home",
    name: "First-Date Remix",
    hook: "Retrace your first date, scene by scene, in your home city",
    palette: ["#6B8E7F", "#E8D4B0", "#F5E6D3"],
    vibeAffinity: {
      nostalgic_return: 98,
      celebrate_at_home: 85,
      romantic_escape: 70,
      cultural_immersion: 55,
    },
    budgetFit: ["simple", "treat"],
    activityHighlights: [
      "Same restaurant, same order",
      "The walk you took after",
      "The drink at the bar next door",
      "Tell the story out loud",
    ],
    estCostUsd: {
      simple: [100, 300],
      treat: [300, 800],
    },
    durationFit: ["evening", "day_trip"],
    hardNoSignals: [],
    peakMonths: [],
  },
  {
    id: "backyard_under_stars",
    type: "at_home",
    name: "Backyard Under the Stars",
    hook: "A projector, a linen-covered table, a home that feels borrowed",
    palette: ["#4A3B2A", "#D4A853", "#F5E6D3"],
    vibeAffinity: {
      celebrate_at_home: 95,
      romantic_escape: 80,
      full_relaxation: 75,
    },
    budgetFit: ["simple", "treat"],
    activityHighlights: [
      "Outdoor projector + film",
      "Long linen table",
      "Cheese + wine only",
      "Stay up for stars",
    ],
    estCostUsd: {
      simple: [150, 350],
      treat: [400, 800],
    },
    durationFit: ["evening"],
    hardNoSignals: ["extreme_cold"],
    peakMonths: [5, 6, 7, 8, 9],
  },
  {
    id: "pottery_class",
    type: "experience",
    name: "Learn Something New Together",
    hook: "Pottery, glassblowing, or a cooking class — pick your craft",
    palette: ["#A8876D", "#E8C4A0", "#F5E6D3"],
    vibeAffinity: {
      adventure_together: 80,
      cultural_immersion: 75,
      celebrate_at_home: 70,
      culinary_journey: 65,
      romantic_escape: 60,
    },
    budgetFit: ["simple", "treat"],
    activityHighlights: [
      "Half-day commitment",
      "Take home a keepsake",
      "Book any weekend",
      "Dinner nearby after",
    ],
    estCostUsd: {
      simple: [150, 400],
      treat: [400, 800],
    },
    durationFit: ["day_trip", "evening"],
    hardNoSignals: [],
    peakMonths: [],
  },
  {
    id: "overnight_spa",
    type: "experience",
    name: "Overnight Spa Retreat",
    hook: "One night, two people, three treatments, zero phones",
    palette: ["#C4766E", "#E8D4B0", "#F5E6D3"],
    vibeAffinity: {
      full_relaxation: 98,
      romantic_escape: 90,
      celebrate_at_home: 50,
    },
    budgetFit: ["treat", "all_out"],
    activityHighlights: [
      "Couples massage",
      "Thermal pool evening",
      "Long slow breakfast",
      "No itinerary allowed",
    ],
    estCostUsd: {
      treat: [600, 1200],
      all_out: [1400, 2800],
    },
    durationFit: ["evening", "weekend"],
    hardNoSignals: [],
    peakMonths: [],
  },
  {
    id: "hiking_cabin",
    type: "experience",
    name: "Cabin + Trail Weekend",
    hook: "A rental with a hot tub and a trailhead ten minutes out",
    palette: ["#4A6548", "#A8876D", "#F5E6D3"],
    vibeAffinity: {
      adventure_together: 95,
      romantic_escape: 70,
      full_relaxation: 65,
      nostalgic_return: 50,
    },
    budgetFit: ["simple", "treat", "all_out"],
    activityHighlights: [
      "One good hike",
      "Hot tub every night",
      "Cook dinner in",
      "No cell service",
    ],
    estCostUsd: {
      simple: [300, 500],
      treat: [600, 1300],
      all_out: [1500, 2800],
    },
    durationFit: ["weekend"],
    hardNoSignals: ["extreme_cold"],
    peakMonths: [5, 6, 7, 8, 9, 10],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

export function getRecommendation(id: string): Recommendation | undefined {
  return RECOMMENDATIONS.find((r) => r.id === id);
}

// ── Scoring ───────────────────────────────────────────────────────────────

interface ScoringWeights {
  vibe: number;
  budget: number;
  timing: number;
  personal: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  vibe: 0.40,
  budget: 0.30,
  timing: 0.20,
  personal: 0.10,
};

const BUDGET_ORDER: BudgetTier[] = ["simple", "treat", "all_out", "lifetime"];

function scoreVibe(
  rec: Recommendation,
  vibes: VibeProfile["vibes"],
): number {
  if (vibes.length === 0) return 55;
  // Take the best match across all selected vibes — people are multi-modal.
  let best = 30;
  for (const v of vibes) {
    const affinity = rec.vibeAffinity[v] ?? 30;
    if (affinity > best) best = affinity;
  }
  return best;
}

function scoreBudget(
  tier: BudgetTier | null,
  fits: BudgetTier[],
): number {
  if (!tier) return 60;
  if (fits.includes(tier)) return 100;
  const userIdx = BUDGET_ORDER.indexOf(tier);
  const nearestDist = fits.reduce((best, f) => {
    const d = Math.abs(BUDGET_ORDER.indexOf(f) - userIdx);
    return d < best ? d : best;
  }, Infinity);
  if (nearestDist === 1) return 65;
  if (nearestDist === 2) return 35;
  return 15;
}

function scoreTiming(
  duration: DurationPref | null,
  fits: DurationPref[],
  anniversaryDate: string,
  peakMonths: number[],
): number {
  let score = 70;
  if (duration) {
    score = fits.includes(duration) ? 100 : 55;
  }
  // Tiny boost if anniversary month falls in peak for the recommendation.
  if (peakMonths.length > 0) {
    const month = extractMonth(anniversaryDate);
    if (month && peakMonths.includes(month)) score = Math.min(100, score + 10);
    else if (month) score = Math.max(40, score - 10);
  }
  return score;
}

function extractMonth(dateStr: string): number | null {
  // "March 15, 2027" → 3; "2027-03-15" → 3. Best-effort.
  const lower = dateStr.toLowerCase();
  const names = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ];
  for (let i = 0; i < names.length; i++) {
    if (lower.includes(names[i]!)) return i + 1;
  }
  const iso = /\b\d{4}-(\d{2})-\d{2}\b/.exec(dateStr);
  if (iso) return Number(iso[1]);
  return null;
}

function scorePersonal(
  rec: Recommendation,
  thingsWeLoved: string,
): number {
  if (!thingsWeLoved.trim()) return 60;
  // Simple keyword overlap — the editorial description, hook, and highlights
  // get tokenized and intersected with the couple's free-text.
  const haystack = [
    rec.hook,
    ...rec.activityHighlights,
    rec.editorialDescription ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const tokens = thingsWeLoved
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 4);
  if (tokens.length === 0) return 60;
  let hits = 0;
  for (const t of tokens) {
    if (haystack.includes(t)) hits++;
  }
  const ratio = hits / tokens.length;
  return Math.round(55 + ratio * 45);
}

function applyHardNoPenalty(
  hardNos: VibeProfile["hardNos"],
  rec: Recommendation,
): number {
  if (hardNos.length === 0) return 0;
  const hits = hardNos.filter((h) => rec.hardNoSignals.includes(h));
  return hits.length * 18;
}

function pickMatchTag(
  breakdown: RecommendationScore["breakdown"],
  budget: BudgetTier | null,
): string {
  const entries = Object.entries(breakdown) as [
    keyof typeof breakdown,
    number,
  ][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = entries[0]!;
  if (topValue < 70) return "Worth considering";
  switch (topKey) {
    case "vibe":
      return "Perfect for your vibe";
    case "budget":
      return budget === "simple"
        ? "Keep it simple"
        : budget === "lifetime"
          ? "Splurge worthy"
          : "Great for your budget";
    case "timing":
      return "Good timing";
    case "personal":
      return "Echoes what you loved";
  }
}

function buildWhyNote(
  rec: Recommendation,
  breakdown: RecommendationScore["breakdown"],
  vibes: VibeProfile["vibes"],
): string {
  const topVibe = vibes.find((v) => (rec.vibeAffinity[v] ?? 0) >= 80);
  if (topVibe && breakdown.vibe >= 80) {
    const label = VIBE_SHORT[topVibe];
    return `Leans into the ${label} vibe you picked — it's what this one is built for.`;
  }
  if (breakdown.budget >= 90) {
    return "Lands comfortably in the budget you set, without compromising the experience.";
  }
  if (breakdown.timing >= 90) {
    return "The timing works — it's in season when your anniversary lands.";
  }
  if (breakdown.personal >= 80) {
    return "Echoes a few of the moments you said you wanted to build on.";
  }
  return "A solid match across vibe, budget, and logistics.";
}

const VIBE_SHORT: Record<string, string> = {
  romantic_escape: "romantic escape",
  adventure_together: "adventure together",
  cultural_immersion: "cultural immersion",
  full_relaxation: "full relaxation",
  nostalgic_return: "nostalgic return",
  culinary_journey: "culinary journey",
  celebrate_at_home: "celebrate at home",
};

export function scoreRecommendation(
  rec: Recommendation,
  vibe: VibeProfile,
  basics: AnniversaryBasics,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): RecommendationScore {
  const vibeScore = scoreVibe(rec, vibe.vibes);
  const budgetScore = scoreBudget(vibe.budget, rec.budgetFit);
  const timingScore = scoreTiming(
    basics.duration,
    rec.durationFit,
    basics.anniversaryDate,
    rec.peakMonths,
  );
  const personalScore = scorePersonal(rec, vibe.thingsWeLoved);

  const raw =
    vibeScore * weights.vibe +
    budgetScore * weights.budget +
    timingScore * weights.timing +
    personalScore * weights.personal;

  const penalty = applyHardNoPenalty(vibe.hardNos, rec);
  const finalScore = Math.max(0, Math.min(100, Math.round(raw - penalty)));

  const breakdown = {
    vibe: vibeScore,
    budget: budgetScore,
    timing: timingScore,
    personal: personalScore,
  };

  return {
    recommendationId: rec.id,
    score: finalScore,
    breakdown,
    matchTag: pickMatchTag(breakdown, vibe.budget),
    whyNote: buildWhyNote(rec, breakdown, vibe.vibes),
  };
}

export function rankRecommendations(
  vibe: VibeProfile,
  basics: AnniversaryBasics,
  pool: Recommendation[] = RECOMMENDATIONS,
): { recommendation: Recommendation; score: RecommendationScore }[] {
  return pool
    .map((r) => ({ recommendation: r, score: scoreRecommendation(r, vibe, basics) }))
    .sort((a, b) => b.score.score - a.score.score);
}

export function costRangeFor(
  rec: Recommendation,
  tier: BudgetTier | null,
): string {
  if (tier && rec.estCostUsd[tier]) {
    const [lo, hi] = rec.estCostUsd[tier]!;
    return `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
  }
  const first = BUDGET_ORDER.find((t) => rec.estCostUsd[t]);
  if (!first) return "—";
  const [lo] = rec.estCostUsd[first]!;
  return `From $${lo.toLocaleString()}`;
}

export function typeLabel(type: RecommendationType): string {
  switch (type) {
    case "getaway":
      return "Getaway";
    case "at_home":
      return "At Home";
    case "experience":
      return "Experience";
  }
}
