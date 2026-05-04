// ──────────────────────────────────────────────────────────────────────────
// Marigold Destination Explorer — display continent mapping.
//
// The DB stores raw geographic continents on `budget_locations.continent`
// (Asia, Europe, North America, Middle East, Africa, Oceania). The Tool
// surface groups them into the seven display continents brides actually
// shop by — South Asia, Southeast Asia, Caribbean, etc. — using country as
// the disambiguator. The mapping lives here so the page-level code stays
// declarative.
// ──────────────────────────────────────────────────────────────────────────

import type { BudgetLocationRow } from "@/types/budget";

export type DisplayContinentSlug =
  | "south-asia"
  | "europe"
  | "southeast-asia"
  | "middle-east"
  | "mexico-caribbean"
  | "africa"
  | "oceania"
  | "united-states";

export interface DisplayContinent {
  slug: DisplayContinentSlug;
  name: string;
  tagline: string;
  heroImageUrl: string;
  display_order: number;
}

export const DISPLAY_CONTINENTS: DisplayContinent[] = [
  {
    slug: "south-asia",
    name: "South Asia",
    tagline: "where the playbook was written.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80",
    display_order: 10,
  },
  {
    slug: "europe",
    name: "Europe",
    tagline: "lake como, manor houses, and the kind of stone walls that ruin you for everywhere else.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1600&q=80",
    display_order: 20,
  },
  {
    slug: "southeast-asia",
    name: "Southeast Asia",
    tagline: "frangipani, cliffside ceremonies, your aunties in linen.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
    display_order: 30,
  },
  {
    slug: "middle-east",
    name: "Middle East",
    tagline: "skyline + sand + zero-tax glam.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
    display_order: 40,
  },
  {
    slug: "mexico-caribbean",
    name: "Mexico & Caribbean",
    tagline: "where the uncles discover tequila and the baraat hits the beach.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    display_order: 50,
  },
  {
    slug: "africa",
    name: "Africa",
    tagline: "wine country baraats, riad mehndi, safari sangeet.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80",
    display_order: 60,
  },
  {
    slug: "oceania",
    name: "Oceania",
    tagline: "harbour-side glam, southern hemisphere sunsets.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80",
    display_order: 70,
  },
  {
    slug: "united-states",
    name: "United States",
    tagline:
      "no passport required, no excuses left — these venues go as hard as any international destination.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1600&q=80",
    display_order: 80,
  },
];

const SOUTHEAST_ASIA_COUNTRIES = new Set([
  "Thailand",
  "Indonesia",
  "Singapore",
  "Vietnam",
  "Malaysia",
  "Philippines",
]);

const SOUTH_ASIA_COUNTRIES = new Set([
  "India",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
  "Bangladesh",
  "Pakistan",
]);

const MEXICO_CARIBBEAN_COUNTRIES = new Set([
  "Mexico",
  "Jamaica",
  "Turks & Caicos",
  "Bahamas",
  "Barbados",
  "Dominican Republic",
  "St. Lucia",
  "Cuba",
]);

// US destinations live in the same `North America` continent bucket as
// Caribbean rows in the DB, so we disambiguate by country before falling
// through to the continent switch (which defaults to null for "North
// America"). The `type='destination'` guard above keeps `us_metro` rows
// — those are baseline pricing references — out of this map entirely.
const UNITED_STATES_COUNTRIES = new Set(["USA", "United States"]);

/**
 * Map a `budget_locations` row to its display continent slug.
 * Returns null for rows that don't belong on the destination explorer
 * (US metros — those are baseline pricing references, not destinations).
 */
export function getDisplayContinentSlug(
  location: Pick<BudgetLocationRow, "type" | "continent" | "country">,
): DisplayContinentSlug | null {
  if (location.type !== "destination") return null;

  const country = location.country?.trim() ?? "";
  if (UNITED_STATES_COUNTRIES.has(country)) return "united-states";
  if (SOUTH_ASIA_COUNTRIES.has(country)) return "south-asia";
  if (SOUTHEAST_ASIA_COUNTRIES.has(country)) return "southeast-asia";
  if (MEXICO_CARIBBEAN_COUNTRIES.has(country)) return "mexico-caribbean";

  switch (location.continent) {
    case "Europe":
      return "europe";
    case "Middle East":
      return "middle-east";
    case "Africa":
      return "africa";
    case "Oceania":
      return "oceania";
    case "Asia":
      // Anything in Asia not classified above defaults to South Asia
      // (India is the most common case in the seed).
      return "south-asia";
    default:
      return null;
  }
}

export function findDisplayContinent(
  slug: string,
): DisplayContinent | undefined {
  return DISPLAY_CONTINENTS.find((c) => c.slug === slug);
}
