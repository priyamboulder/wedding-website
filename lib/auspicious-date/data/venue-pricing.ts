// ──────────────────────────────────────────────────────────────────────────
// US Indian-wedding venue pricing seasons.
//
// DFW-calibrated for v1. Other cities follow similar patterns; treat these
// as directionally accurate. The four-tier system reflects how Indian
// wedding venues actually price across the year.
// ──────────────────────────────────────────────────────────────────────────

import type { PricingTier } from "@/types/auspicious-date";

interface MonthPricing {
  tier: PricingTier;
  note: string;
}

// DFW Indian-wedding venue pricing seasons. Calibrated to muhurat density,
// weather, and post-Chaturmas demand pressure.
const DFW_PRICING: Record<number, MonthPricing> = {
  1: { tier: "peak", note: "Peak Indian wedding season — January muhurats are scarce so demand concentrates" },
  2: { tier: "peak", note: "Highest demand month — 12 muhurat dates plus great weather" },
  3: { tier: "standard", note: "Spring shoulder season — reasonable pricing" },
  4: { tier: "standard", note: "Demand growing as spring peaks" },
  5: { tier: "peak", note: "Peak season — most popular Hindu wedding month" },
  6: { tier: "standard", note: "Post-Adhik Maas rush — 8 dates, moderate pricing" },
  7: { tier: "off-peak", note: "Chaturmas + heat = lowest demand. Venue deals possible." },
  8: { tier: "off-peak", note: "Chaturmas + extreme heat — best venue pricing all year" },
  9: { tier: "off-peak", note: "Chaturmas — low demand" },
  10: { tier: "off-peak", note: "Chaturmas through mid-month — beautiful weather but no muhurats" },
  11: { tier: "premium", note: "Post-Chaturmas — only 4 muhurat dates. EXTREME demand. Premium pricing." },
  12: { tier: "peak", note: "Holiday season + 7 muhurat dates — high demand" },
};

// Houston pattern is similar to DFW
const HOUSTON_PRICING: Record<number, MonthPricing> = { ...DFW_PRICING };

// NYC: weather flips the script — winter is brutal, June–October are peak
const NYC_PRICING: Record<number, MonthPricing> = {
  1: { tier: "off-peak", note: "Cold winter — low outdoor demand, indoor venues moderate" },
  2: { tier: "standard", note: "Indoor wedding season picking up" },
  3: { tier: "standard", note: "Shoulder season" },
  4: { tier: "peak", note: "Spring blossom season — high demand" },
  5: { tier: "peak", note: "Peak NYC wedding season — high demand" },
  6: { tier: "premium", note: "Premium pricing — peak weather, peak demand" },
  7: { tier: "peak", note: "Strong summer pricing" },
  8: { tier: "peak", note: "Strong summer pricing" },
  9: { tier: "premium", note: "Premium pricing — peak fall, ideal weather" },
  10: { tier: "premium", note: "Premium fall foliage season — book 18+ months out" },
  11: { tier: "standard", note: "Cool fall, demand drops slightly" },
  12: { tier: "standard", note: "Holiday-season indoor weddings — moderate demand" },
};

// LA / Bay Area: year-round mild, less seasonality but spring + fall premium
const CA_PRICING: Record<number, MonthPricing> = {
  1: { tier: "standard", note: "Pleasant winter — moderate demand" },
  2: { tier: "standard", note: "Pleasant — moderate demand" },
  3: { tier: "peak", note: "Peak spring — high demand" },
  4: { tier: "peak", note: "Peak spring — high demand" },
  5: { tier: "premium", note: "Premium pricing — ideal weather, peak season" },
  6: { tier: "premium", note: "Premium pricing — peak season" },
  7: { tier: "peak", note: "Peak summer" },
  8: { tier: "peak", note: "Peak summer" },
  9: { tier: "premium", note: "Premium fall — Indian summer, peak weather" },
  10: { tier: "premium", note: "Peak fall — premium pricing" },
  11: { tier: "standard", note: "Cool fall — moderate demand" },
  12: { tier: "standard", note: "Holiday season — moderate demand" },
};

const CITY_PRICING: Record<string, Record<number, MonthPricing>> = {
  dallas: DFW_PRICING,
  houston: HOUSTON_PRICING,
  nyc: NYC_PRICING,
  chicago: NYC_PRICING,
  dc: NYC_PRICING,
  atlanta: DFW_PRICING,
  la: CA_PRICING,
  "bay-area": CA_PRICING,
  india: DFW_PRICING,
  other: DFW_PRICING,
};

export function getPricingForCityMonth(city: string, month: number): MonthPricing {
  const table = CITY_PRICING[city] ?? DFW_PRICING;
  return table[month] ?? table[1];
}

// US federal holidays creating long weekends, 2026–2027.
// Used to flag dates adjacent to a federal Monday or Friday holiday.
export const US_HOLIDAY_LONG_WEEKENDS: Record<string, string> = {
  // 2026
  "2026-01-19": "MLK Day weekend",
  "2026-02-16": "Presidents Day weekend",
  "2026-05-25": "Memorial Day weekend",
  "2026-07-03": "Independence Day weekend",
  "2026-09-07": "Labor Day weekend",
  "2026-10-12": "Columbus Day weekend",
  "2026-11-26": "Thanksgiving weekend",
  "2026-11-27": "Thanksgiving weekend",
  "2026-12-25": "Christmas weekend",
  // 2027
  "2027-01-18": "MLK Day weekend",
  "2027-02-15": "Presidents Day weekend",
  "2027-05-31": "Memorial Day weekend",
  "2027-07-05": "Independence Day weekend",
  "2027-09-06": "Labor Day weekend",
  "2027-10-11": "Columbus Day weekend",
  "2027-11-25": "Thanksgiving weekend",
  "2027-11-26": "Thanksgiving weekend",
  "2027-12-24": "Christmas weekend",
};

export function getLongWeekendName(isoDate: string): string | undefined {
  // Check the date itself, plus the day before and after for adjacent holidays
  const d = new Date(isoDate + "T12:00:00");
  for (let offset = -1; offset <= 1; offset++) {
    const test = new Date(d);
    test.setDate(test.getDate() + offset);
    const key = test.toISOString().slice(0, 10);
    if (US_HOLIDAY_LONG_WEEKENDS[key]) return US_HOLIDAY_LONG_WEEKENDS[key];
  }
  return undefined;
}
