// ── Bachelorette destination pool + scoring ───────────────────────────────
// Curated destination library for the discovery phase of the Bachelorette
// module. Each destination carries enough metadata for a pure scoring
// function to rank it against a VibeProfile (no backend, no AI).
//
// When adding a destination: fill `weather` for all 12 quiz month values
// plus "flexible"; vibeAffinity defaults to 30 for omitted energy types.

import type {
  Destination,
  DestinationScore,
  DestinationWeatherMonth,
  VibeProfile,
} from "@/types/bachelorette";
import type { BudgetTier, CrewBracket } from "@/types/bachelorette";

// Compact weather row helper: high, low, score, optional flag.
function w(
  high: number,
  low: number,
  score: number,
  flag?: string,
): DestinationWeatherMonth {
  return flag ? { high, low, score, flag } : { high, low, score };
}

// ── Destination pool ──────────────────────────────────────────────────────

export const DESTINATIONS: Destination[] = [
  {
    id: "nashville",
    name: "Nashville",
    hook: "Live music, BBQ smoke, and rooftop pools",
    region: "domestic",
    palette: ["#D4A853", "#8B4513", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      party: 95,
      bougie: 65,
      unexpected: 60,
      adventure: 45,
      pamper: 40,
      beach: 10,
    },
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Live music on Broadway",
      "Pedal tavern",
      "Rooftop pools",
      "Hot chicken",
    ],
    estPerPersonUsd: {
      "300_600": [380, 560],
      "600_1000": [620, 900],
      "1000_2000": [1100, 1600],
    },
    avoidSignals: ["big_crowds", "clubs"],
    weather: {
      january: w(48, 30, 45, "Cold and drizzly"),
      february: w(53, 33, 50),
      march: w(61, 41, 70),
      april: w(71, 49, 95, "Peak spring — perfect"),
      may: w(78, 58, 90),
      june: w(86, 67, 70, "Hot, humid, patio weather"),
      july: w(89, 71, 60, "Hot, thunderstorms"),
      august: w(88, 70, 60, "Hot, thunderstorms"),
      september: w(83, 63, 90, "Back to patio weather"),
      october: w(72, 51, 95, "Peak fall — gorgeous"),
      november: w(60, 40, 65),
      december: w(51, 34, 50, "Holiday crowds + cold"),
      flexible: w(70, 50, 85),
    },
  },
  {
    id: "scottsdale",
    name: "Scottsdale, AZ",
    hook: "Desert spa days, pool cabanas, tequila at sunset",
    region: "domestic",
    palette: ["#C4766E", "#E8C4A0", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      pamper: 95,
      bougie: 90,
      party: 70,
      unexpected: 55,
      adventure: 50,
      beach: 20,
    },
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Resort spas",
      "Pool cabanas",
      "Sunrise hike — Camelback",
      "Old Town nightlife",
    ],
    estPerPersonUsd: {
      "600_1000": [700, 980],
      "1000_2000": [1200, 1800],
      sky: [2000, 3500],
    },
    avoidSignals: ["extreme_heat"],
    weather: {
      january: w(67, 44, 85, "Peak season — warm days, cool nights"),
      february: w(71, 47, 90, "Prime spa-and-pool weather"),
      march: w(77, 53, 95, "Peak season — book early"),
      april: w(85, 60, 90),
      may: w(94, 68, 70, "Getting hot — pool becomes mandatory"),
      june: w(104, 77, 35, "Dangerously hot — locals hide indoors"),
      july: w(106, 83, 30, "Monsoon + extreme heat"),
      august: w(104, 82, 35, "Still brutal"),
      september: w(100, 76, 55, "Cooling off but still hot"),
      october: w(89, 63, 85),
      november: w(76, 51, 90, "Ideal"),
      december: w(67, 44, 80),
      flexible: w(85, 60, 85),
    },
  },
  {
    id: "austin",
    name: "Austin, TX",
    hook: "Honky-tonks, breakfast tacos, and lake days",
    region: "domestic",
    palette: ["#4A3B2A", "#D4A853", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      party: 90,
      unexpected: 80,
      bougie: 70,
      adventure: 60,
      pamper: 45,
      beach: 20,
    },
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Rainey Street bars",
      "Lake Travis boat day",
      "Taco crawl",
      "Live music 7 nights",
    ],
    estPerPersonUsd: {
      "300_600": [400, 580],
      "600_1000": [650, 920],
      "1000_2000": [1100, 1700],
    },
    avoidSignals: ["extreme_heat", "big_crowds"],
    weather: {
      january: w(62, 42, 60, "Cooler, occasional cold snap"),
      february: w(66, 45, 70),
      march: w(73, 52, 90, "SXSW week is chaos — avoid mid-March"),
      april: w(80, 60, 95, "Peak — perfect for outdoor everything"),
      may: w(86, 67, 80),
      june: w(93, 73, 65, "Hot but bearable at night"),
      july: w(97, 75, 50, "Brutal heat"),
      august: w(98, 76, 45, "Brutal heat"),
      september: w(91, 71, 70),
      october: w(82, 61, 95, "Peak fall — ACL week crowded"),
      november: w(71, 51, 85),
      december: w(63, 44, 65),
      flexible: w(80, 60, 85),
    },
  },
  {
    id: "palm_springs",
    name: "Palm Springs, CA",
    hook: "Mid-century pools, desert light, matching swimsuits",
    region: "domestic",
    palette: ["#F5C78C", "#6B8E9C", "#E8A895"],
    drivableWeekend: true,
    vibeAffinity: {
      pamper: 90,
      bougie: 85,
      party: 70,
      beach: 40,
      unexpected: 60,
      adventure: 40,
    },
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Private Airbnb pool",
      "Aerial tramway",
      "Vintage thrift crawl",
      "Saguaro dinner",
    ],
    estPerPersonUsd: {
      "600_1000": [700, 970],
      "1000_2000": [1150, 1700],
      sky: [1900, 3200],
    },
    avoidSignals: ["extreme_heat"],
    weather: {
      january: w(69, 44, 80, "Cool but sunny — prime season"),
      february: w(73, 46, 90),
      march: w(79, 51, 95, "Peak — Coachella weekends sell out"),
      april: w(85, 57, 90),
      may: w(94, 64, 70),
      june: w(103, 72, 40, "Triple digits daily"),
      july: w(108, 79, 30, "Dangerous heat"),
      august: w(107, 79, 30, "Dangerous heat"),
      september: w(101, 72, 55),
      october: w(90, 62, 85),
      november: w(78, 51, 90),
      december: w(69, 44, 80),
      flexible: w(85, 60, 85),
    },
  },
  {
    id: "charleston",
    name: "Charleston, SC",
    hook: "Cobblestone streets, rooftop oysters, coastal bougie",
    region: "domestic",
    palette: ["#E8D4B0", "#A8876D", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      bougie: 90,
      pamper: 80,
      unexpected: 70,
      party: 55,
      beach: 55,
      adventure: 40,
    },
    budgetFit: ["600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Rainbow Row photo walk",
      "Oyster + rosé",
      "Sullivan's Island beach",
      "Rooftop cocktails",
    ],
    estPerPersonUsd: {
      "600_1000": [720, 960],
      "1000_2000": [1150, 1650],
    },
    avoidSignals: ["extreme_heat", "bugs"],
    weather: {
      january: w(59, 40, 60),
      february: w(62, 43, 65),
      march: w(69, 50, 80),
      april: w(77, 57, 95, "Peak spring — perfect"),
      may: w(84, 65, 85),
      june: w(89, 72, 65, "Humid, bugs"),
      july: w(92, 75, 55, "Muggy, afternoon storms"),
      august: w(90, 74, 55, "Muggy, afternoon storms"),
      september: w(85, 69, 70, "Hurricane season peak"),
      october: w(77, 59, 95, "Peak fall"),
      november: w(69, 50, 85),
      december: w(61, 43, 65),
      flexible: w(76, 58, 85),
    },
  },
  {
    id: "asheville",
    name: "Asheville, NC",
    hook: "Breweries, Blue Ridge hikes, cabin glow",
    region: "domestic",
    palette: ["#4A6548", "#C89B7B", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      adventure: 90,
      unexpected: 85,
      pamper: 70,
      bougie: 55,
      party: 40,
      beach: 5,
    },
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Blue Ridge Parkway hike",
      "Brewery crawl",
      "Biltmore tour",
      "Hot tub cabin",
    ],
    estPerPersonUsd: {
      "300_600": [400, 570],
      "600_1000": [620, 880],
      "1000_2000": [1050, 1500],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(47, 27, 40, "Cold — cabin weather"),
      february: w(51, 29, 45),
      march: w(59, 36, 70),
      april: w(67, 43, 85, "Wildflowers"),
      may: w(74, 52, 90),
      june: w(80, 60, 85),
      july: w(83, 64, 80, "Occasional thunderstorms"),
      august: w(82, 63, 80),
      september: w(76, 57, 90),
      october: w(67, 45, 95, "Peak fall foliage — book early"),
      november: w(57, 36, 70),
      december: w(49, 30, 50),
      flexible: w(70, 48, 85),
    },
  },
  {
    id: "napa_sonoma",
    name: "Napa / Sonoma",
    hook: "Vineyards, long lunches, private tastings",
    region: "domestic",
    palette: ["#8B4A52", "#D4A853", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      bougie: 95,
      pamper: 90,
      unexpected: 55,
      party: 40,
      adventure: 50,
      beach: 15,
    },
    budgetFit: ["1000_2000", "sky"],
    crewFit: ["4_6", "7_10"],
    activityHighlights: [
      "Private winery tour",
      "Chef's table dinner",
      "Hot air balloon sunrise",
      "Spa at Meadowood",
    ],
    estPerPersonUsd: {
      "1000_2000": [1300, 1950],
      sky: [2200, 4000],
    },
    avoidSignals: [],
    weather: {
      january: w(58, 38, 55, "Rainy season"),
      february: w(61, 40, 60),
      march: w(65, 42, 75),
      april: w(71, 44, 85),
      may: w(77, 48, 90),
      june: w(82, 52, 90),
      july: w(85, 53, 85, "Crush not yet"),
      august: w(86, 54, 85),
      september: w(86, 54, 95, "Peak — harvest season"),
      october: w(80, 50, 95, "Peak — crush"),
      november: w(67, 43, 70, "Wildfire season tail"),
      december: w(58, 39, 55),
      flexible: w(75, 48, 85),
    },
  },
  {
    id: "tulum",
    name: "Tulum, Mexico",
    hook: "Jungle cenotes, beach clubs, mezcal ceremonies",
    region: "international",
    palette: ["#6B8E7F", "#E8D4B0", "#D4A853"],
    drivableWeekend: false,
    vibeAffinity: {
      beach: 95,
      bougie: 90,
      unexpected: 85,
      pamper: 80,
      party: 70,
      adventure: 60,
    },
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Beach club day",
      "Cenote swim",
      "Mezcal tasting",
      "Jungle yoga",
    ],
    estPerPersonUsd: {
      "600_1000": [750, 980],
      "1000_2000": [1200, 1800],
      sky: [2000, 3800],
    },
    avoidSignals: ["bugs", "extreme_heat"],
    weather: {
      january: w(82, 68, 90, "Dry season perfection"),
      february: w(84, 68, 95, "Prime"),
      march: w(86, 70, 95),
      april: w(88, 72, 90, "Sargassum starts"),
      may: w(89, 74, 75, "Sargassum can be heavy"),
      june: w(89, 75, 60, "Hurricane season + sargassum"),
      july: w(89, 75, 55, "Rainy, hot"),
      august: w(89, 75, 55, "Rainy, hot"),
      september: w(88, 74, 40, "Peak hurricane risk"),
      october: w(86, 72, 55, "Hurricane tail"),
      november: w(84, 70, 85, "Dry season starting"),
      december: w(82, 68, 90),
      flexible: w(86, 71, 85),
    },
  },
  {
    id: "lisbon",
    name: "Lisbon, Portugal",
    hook: "Tiled alleys, rooftop wine, late-late dinners",
    region: "international",
    palette: ["#E8C4A0", "#6B8E9C", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      bougie: 85,
      unexpected: 95,
      party: 75,
      pamper: 65,
      beach: 55,
      adventure: 55,
    },
    budgetFit: ["600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10"],
    activityHighlights: [
      "Alfama tiles walk",
      "Time Out Market",
      "Sintra day trip",
      "Rooftop sunset",
    ],
    estPerPersonUsd: {
      "600_1000": [800, 980],
      "1000_2000": [1250, 1800],
    },
    avoidSignals: ["red_eye"],
    weather: {
      january: w(59, 47, 55),
      february: w(62, 48, 60),
      march: w(66, 51, 75),
      april: w(70, 54, 85),
      may: w(75, 58, 95, "Peak spring"),
      june: w(82, 63, 95),
      july: w(86, 65, 90, "Hot + crowded"),
      august: w(87, 66, 85, "Hot + crowded"),
      september: w(83, 63, 95, "Peak — ideal weather"),
      october: w(74, 58, 90),
      november: w(65, 52, 70),
      december: w(60, 48, 55),
      flexible: w(73, 56, 85),
    },
  },
  {
    id: "bend",
    name: "Bend, OR",
    hook: "Mountain air, brewery crawls, river float days",
    region: "domestic",
    palette: ["#6B8E9C", "#A8876D", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      adventure: 95,
      unexpected: 85,
      bougie: 50,
      pamper: 50,
      party: 45,
      beach: 10,
    },
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10"],
    activityHighlights: [
      "Deschutes River float",
      "Brewery bike trail",
      "Smith Rock hike",
      "Hot spring soak",
    ],
    estPerPersonUsd: {
      "300_600": [420, 580],
      "600_1000": [640, 900],
      "1000_2000": [1100, 1550],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(41, 23, 35, "Snow — ski-trip mode only"),
      february: w(45, 24, 40),
      march: w(52, 28, 55),
      april: w(59, 32, 70),
      may: w(67, 37, 85),
      june: w(75, 43, 90, "River opens"),
      july: w(83, 47, 95, "Peak — float days"),
      august: w(83, 46, 95, "Peak"),
      september: w(76, 40, 90),
      october: w(63, 32, 70),
      november: w(48, 27, 45),
      december: w(41, 23, 35),
      flexible: w(67, 37, 80),
    },
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────
// Pure function. Runs in render — cheap enough across 10 destinations.

interface ScoringWeights {
  vibe: number;
  budget: number;
  weather: number;
  travel: number;
  crew: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  vibe: 0.30,
  budget: 0.25,
  weather: 0.20,
  travel: 0.15,
  crew: 0.10,
};

// Budget tiers in order — used for near-miss partial credit.
const BUDGET_ORDER: BudgetTier[] = [
  "under_300",
  "300_600",
  "600_1000",
  "1000_2000",
  "sky",
];

// Crew bracket adjacency — picking an adjacent bracket still works most
// of the time; one tier off is worse.
const CREW_ORDER: CrewBracket[] = ["4_6", "7_10", "11_15", "16_plus"];

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
  if (nearestDist === 1) return 70;
  if (nearestDist === 2) return 40;
  return 20;
}

function scoreCrew(
  bracket: CrewBracket | null,
  fits: CrewBracket[],
): number {
  if (!bracket) return 70;
  if (fits.includes(bracket)) return 100;
  const userIdx = CREW_ORDER.indexOf(bracket);
  const nearestDist = fits.reduce((best, f) => {
    const d = Math.abs(CREW_ORDER.indexOf(f) - userIdx);
    return d < best ? d : best;
  }, Infinity);
  if (nearestDist === 1) return 75;
  if (nearestDist === 2) return 50;
  return 30;
}

function scoreTravel(
  profile: VibeProfile,
  dest: Destination,
): number {
  if (profile.travelMode === "drive_only") {
    return dest.drivableWeekend ? 100 : 20;
  }
  if (profile.travelMode === "fly_open") {
    return dest.region === "international"
      ? 95
      : dest.drivableWeekend
        ? 80
        : 100;
  }
  // flexible or null
  return 90;
}

function scoreWeather(
  profile: VibeProfile,
  dest: Destination,
): { score: number; note: string | null } {
  if (!profile.month) return { score: 70, note: null };
  const entry = dest.weather[profile.month];
  if (!entry) return { score: 70, note: null };
  if (profile.month === "flexible") {
    return { score: entry.score, note: null };
  }
  const note = entry.flag
    ? `${entry.flag} · ${entry.high}°/${entry.low}°F`
    : `${entry.high}°/${entry.low}°F average`;
  return { score: entry.score, note };
}

function applyAvoidPenalty(
  profile: VibeProfile,
  dest: Destination,
): number {
  if (profile.avoidTags.length === 0) return 0;
  const hits = profile.avoidTags.filter((t) =>
    dest.avoidSignals.includes(t),
  );
  return hits.length * 12;
}

function pickMatchTag(
  breakdown: DestinationScore["breakdown"],
  profile: VibeProfile,
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
      return "Great for your budget";
    case "weather":
      return profile.month && profile.month !== "flexible"
        ? `Perfect in ${profile.month.charAt(0).toUpperCase() + profile.month.slice(1)}`
        : "Great weather window";
    case "travel":
      return profile.travelMode === "drive_only"
        ? "Drive-to friendly"
        : "Easy to get to";
    case "crew":
      return "Perfect for your crew";
  }
}

export function scoreDestination(
  dest: Destination,
  profile: VibeProfile,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): DestinationScore {
  const vibe = profile.energy
    ? (dest.vibeAffinity[profile.energy] ?? 30)
    : 55;
  const budget = scoreBudget(profile.budgetTier, dest.budgetFit);
  const { score: weather, note: weatherNote } = scoreWeather(profile, dest);
  const travel = scoreTravel(profile, dest);
  const crew = scoreCrew(profile.crew, dest.crewFit);

  const rawScore =
    vibe * weights.vibe +
    budget * weights.budget +
    weather * weights.weather +
    travel * weights.travel +
    crew * weights.crew;

  const penalty = applyAvoidPenalty(profile, dest);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - penalty)));

  const breakdown = { vibe, budget, weather, travel, crew };

  return {
    destinationId: dest.id,
    score: finalScore,
    breakdown,
    weatherNote,
    matchTag: pickMatchTag(breakdown, profile),
  };
}

export function rankDestinations(
  profile: VibeProfile,
  pool: Destination[] = DESTINATIONS,
): { destination: Destination; score: DestinationScore }[] {
  return pool
    .map((d) => ({ destination: d, score: scoreDestination(d, profile) }))
    .sort((a, b) => b.score.score - a.score.score);
}

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
