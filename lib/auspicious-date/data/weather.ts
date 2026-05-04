// ──────────────────────────────────────────────────────────────────────────
// Historical-average monthly weather for major US wedding markets.
//
// Numbers are reasonable historical averages. We surface them as guidance
// ("plan for indoor venues in DFW July"), not as forecasts. No live API.
// ──────────────────────────────────────────────────────────────────────────

import type { WeatherInfo } from "@/types/auspicious-date";

type WeatherTable = Record<number, WeatherInfo>;

export const SUPPORTED_CITIES = [
  { value: "dallas", label: "Dallas / DFW", region: "Texas" },
  { value: "houston", label: "Houston", region: "Texas" },
  { value: "nyc", label: "New York City", region: "Northeast" },
  { value: "chicago", label: "Chicago", region: "Midwest" },
  { value: "la", label: "Los Angeles", region: "California" },
  { value: "bay-area", label: "Bay Area / SF", region: "California" },
  { value: "dc", label: "Washington, DC", region: "Mid-Atlantic" },
  { value: "atlanta", label: "Atlanta", region: "Southeast" },
  { value: "india", label: "India", region: "International" },
  { value: "other", label: "Other", region: "International" },
] as const;

export type CityValue = (typeof SUPPORTED_CITIES)[number]["value"];

const DALLAS: WeatherTable = {
  1: { city: "Dallas", avgHighF: 57, avgLowF: 36, rainChance: 25, weatherScore: 3, description: "Cool and crisp — great for indoor or tented outdoor" },
  2: { city: "Dallas", avgHighF: 61, avgLowF: 40, rainChance: 30, weatherScore: 3, description: "Mild winter — outdoor with heaters works" },
  3: { city: "Dallas", avgHighF: 69, avgLowF: 48, rainChance: 35, weatherScore: 4, description: "Beautiful spring — ideal for outdoor events" },
  4: { city: "Dallas", avgHighF: 77, avgLowF: 56, rainChance: 40, weatherScore: 4, description: "Warm spring, slight rain risk" },
  5: { city: "Dallas", avgHighF: 85, avgLowF: 65, rainChance: 45, weatherScore: 3, description: "Outdoor evenings ideal, afternoons hot" },
  6: { city: "Dallas", avgHighF: 93, avgLowF: 73, rainChance: 30, weatherScore: 2, description: "Hot — indoor or evening-only outdoor" },
  7: { city: "Dallas", avgHighF: 97, avgLowF: 77, rainChance: 20, weatherScore: 1, description: "Very hot — indoor venues strongly recommended" },
  8: { city: "Dallas", avgHighF: 98, avgLowF: 77, rainChance: 15, weatherScore: 1, description: "Peak heat — indoor only" },
  9: { city: "Dallas", avgHighF: 90, avgLowF: 69, rainChance: 25, weatherScore: 2, description: "Still hot, transitioning" },
  10: { city: "Dallas", avgHighF: 80, avgLowF: 58, rainChance: 35, weatherScore: 4, description: "Beautiful fall — ideal outdoor weather" },
  11: { city: "Dallas", avgHighF: 68, avgLowF: 47, rainChance: 30, weatherScore: 4, description: "Pleasant fall — great for any venue type" },
  12: { city: "Dallas", avgHighF: 58, avgLowF: 38, rainChance: 25, weatherScore: 3, description: "Cool winter — indoor or tented outdoor" },
};

const HOUSTON: WeatherTable = {
  1: { city: "Houston", avgHighF: 63, avgLowF: 45, rainChance: 30, weatherScore: 3, description: "Mild winter, occasional fronts" },
  2: { city: "Houston", avgHighF: 67, avgLowF: 48, rainChance: 30, weatherScore: 3, description: "Mild and humid" },
  3: { city: "Houston", avgHighF: 73, avgLowF: 55, rainChance: 35, weatherScore: 4, description: "Pleasant spring" },
  4: { city: "Houston", avgHighF: 80, avgLowF: 62, rainChance: 35, weatherScore: 4, description: "Warm and humid — outdoor evenings" },
  5: { city: "Houston", avgHighF: 87, avgLowF: 69, rainChance: 40, weatherScore: 3, description: "Hot and humid — covered outdoor" },
  6: { city: "Houston", avgHighF: 92, avgLowF: 74, rainChance: 45, weatherScore: 2, description: "Hot, humid, rainy — indoor preferred" },
  7: { city: "Houston", avgHighF: 95, avgLowF: 76, rainChance: 40, weatherScore: 1, description: "Very hot and humid — indoor only" },
  8: { city: "Houston", avgHighF: 95, avgLowF: 76, rainChance: 45, weatherScore: 1, description: "Peak heat + humidity — indoor only" },
  9: { city: "Houston", avgHighF: 90, avgLowF: 71, rainChance: 45, weatherScore: 2, description: "Still hot, hurricane season" },
  10: { city: "Houston", avgHighF: 82, avgLowF: 62, rainChance: 30, weatherScore: 4, description: "Beautiful fall" },
  11: { city: "Houston", avgHighF: 73, avgLowF: 53, rainChance: 30, weatherScore: 4, description: "Pleasant fall" },
  12: { city: "Houston", avgHighF: 65, avgLowF: 47, rainChance: 30, weatherScore: 3, description: "Mild winter" },
};

const NYC: WeatherTable = {
  1: { city: "NYC", avgHighF: 38, avgLowF: 27, rainChance: 35, weatherScore: 1, description: "Cold winter — indoor only" },
  2: { city: "NYC", avgHighF: 42, avgLowF: 29, rainChance: 35, weatherScore: 1, description: "Cold — indoor only" },
  3: { city: "NYC", avgHighF: 50, avgLowF: 35, rainChance: 40, weatherScore: 2, description: "Cool, transitioning" },
  4: { city: "NYC", avgHighF: 62, avgLowF: 45, rainChance: 40, weatherScore: 3, description: "Mild spring" },
  5: { city: "NYC", avgHighF: 71, avgLowF: 54, rainChance: 40, weatherScore: 4, description: "Beautiful spring" },
  6: { city: "NYC", avgHighF: 80, avgLowF: 64, rainChance: 35, weatherScore: 5, description: "Ideal outdoor weather" },
  7: { city: "NYC", avgHighF: 85, avgLowF: 70, rainChance: 35, weatherScore: 4, description: "Warm summer — outdoor evenings ideal" },
  8: { city: "NYC", avgHighF: 83, avgLowF: 69, rainChance: 35, weatherScore: 4, description: "Warm summer" },
  9: { city: "NYC", avgHighF: 76, avgLowF: 61, rainChance: 35, weatherScore: 5, description: "Peak fall — ideal outdoor weather" },
  10: { city: "NYC", avgHighF: 65, avgLowF: 50, rainChance: 35, weatherScore: 4, description: "Beautiful fall foliage" },
  11: { city: "NYC", avgHighF: 54, avgLowF: 41, rainChance: 35, weatherScore: 3, description: "Cool late fall" },
  12: { city: "NYC", avgHighF: 43, avgLowF: 32, rainChance: 35, weatherScore: 1, description: "Cold — indoor only" },
};

const CHICAGO: WeatherTable = {
  1: { city: "Chicago", avgHighF: 32, avgLowF: 18, rainChance: 35, weatherScore: 1, description: "Brutal winter — indoor only" },
  2: { city: "Chicago", avgHighF: 36, avgLowF: 22, rainChance: 35, weatherScore: 1, description: "Cold — indoor only" },
  3: { city: "Chicago", avgHighF: 47, avgLowF: 31, rainChance: 35, weatherScore: 2, description: "Cool, transitioning" },
  4: { city: "Chicago", avgHighF: 59, avgLowF: 41, rainChance: 40, weatherScore: 3, description: "Mild spring" },
  5: { city: "Chicago", avgHighF: 70, avgLowF: 51, rainChance: 40, weatherScore: 4, description: "Beautiful spring" },
  6: { city: "Chicago", avgHighF: 80, avgLowF: 61, rainChance: 35, weatherScore: 5, description: "Ideal outdoor weather" },
  7: { city: "Chicago", avgHighF: 84, avgLowF: 67, rainChance: 35, weatherScore: 5, description: "Warm summer — outdoor ideal" },
  8: { city: "Chicago", avgHighF: 82, avgLowF: 66, rainChance: 35, weatherScore: 4, description: "Warm summer" },
  9: { city: "Chicago", avgHighF: 75, avgLowF: 57, rainChance: 35, weatherScore: 5, description: "Peak fall" },
  10: { city: "Chicago", avgHighF: 62, avgLowF: 45, rainChance: 35, weatherScore: 4, description: "Beautiful fall" },
  11: { city: "Chicago", avgHighF: 48, avgLowF: 33, rainChance: 35, weatherScore: 2, description: "Cold late fall" },
  12: { city: "Chicago", avgHighF: 36, avgLowF: 23, rainChance: 35, weatherScore: 1, description: "Cold winter" },
};

const LA: WeatherTable = {
  1: { city: "Los Angeles", avgHighF: 67, avgLowF: 49, rainChance: 25, weatherScore: 4, description: "Pleasant winter — outdoor possible" },
  2: { city: "Los Angeles", avgHighF: 68, avgLowF: 50, rainChance: 30, weatherScore: 4, description: "Mild and pleasant" },
  3: { city: "Los Angeles", avgHighF: 70, avgLowF: 52, rainChance: 25, weatherScore: 5, description: "Ideal — sunny and mild" },
  4: { city: "Los Angeles", avgHighF: 72, avgLowF: 55, rainChance: 15, weatherScore: 5, description: "Ideal spring" },
  5: { city: "Los Angeles", avgHighF: 74, avgLowF: 58, rainChance: 10, weatherScore: 5, description: "Ideal outdoor weather" },
  6: { city: "Los Angeles", avgHighF: 77, avgLowF: 62, rainChance: 5, weatherScore: 5, description: "Ideal — June gloom mornings" },
  7: { city: "Los Angeles", avgHighF: 82, avgLowF: 65, rainChance: 0, weatherScore: 5, description: "Warm and dry" },
  8: { city: "Los Angeles", avgHighF: 84, avgLowF: 66, rainChance: 0, weatherScore: 4, description: "Warm — outdoor evenings ideal" },
  9: { city: "Los Angeles", avgHighF: 83, avgLowF: 65, rainChance: 5, weatherScore: 5, description: "Beautiful early fall" },
  10: { city: "Los Angeles", avgHighF: 79, avgLowF: 60, rainChance: 10, weatherScore: 5, description: "Ideal fall" },
  11: { city: "Los Angeles", avgHighF: 73, avgLowF: 53, rainChance: 15, weatherScore: 5, description: "Pleasant late fall" },
  12: { city: "Los Angeles", avgHighF: 68, avgLowF: 49, rainChance: 25, weatherScore: 4, description: "Mild winter" },
};

const BAY_AREA: WeatherTable = {
  1: { city: "Bay Area", avgHighF: 58, avgLowF: 45, rainChance: 45, weatherScore: 2, description: "Cool and rainy" },
  2: { city: "Bay Area", avgHighF: 62, avgLowF: 47, rainChance: 40, weatherScore: 3, description: "Cool and rainy" },
  3: { city: "Bay Area", avgHighF: 65, avgLowF: 49, rainChance: 35, weatherScore: 3, description: "Cool spring" },
  4: { city: "Bay Area", avgHighF: 68, avgLowF: 51, rainChance: 20, weatherScore: 4, description: "Mild spring" },
  5: { city: "Bay Area", avgHighF: 70, avgLowF: 53, rainChance: 10, weatherScore: 5, description: "Ideal — sunny and mild" },
  6: { city: "Bay Area", avgHighF: 72, avgLowF: 55, rainChance: 5, weatherScore: 5, description: "Ideal outdoor weather" },
  7: { city: "Bay Area", avgHighF: 73, avgLowF: 56, rainChance: 0, weatherScore: 5, description: "Ideal — fog mornings" },
  8: { city: "Bay Area", avgHighF: 73, avgLowF: 57, rainChance: 0, weatherScore: 5, description: "Ideal" },
  9: { city: "Bay Area", avgHighF: 76, avgLowF: 57, rainChance: 5, weatherScore: 5, description: "Indian summer — peak weather" },
  10: { city: "Bay Area", avgHighF: 73, avgLowF: 54, rainChance: 15, weatherScore: 5, description: "Beautiful fall" },
  11: { city: "Bay Area", avgHighF: 64, avgLowF: 49, rainChance: 30, weatherScore: 4, description: "Cool late fall" },
  12: { city: "Bay Area", avgHighF: 58, avgLowF: 45, rainChance: 45, weatherScore: 2, description: "Cool and rainy" },
};

const DC: WeatherTable = {
  1: { city: "DC", avgHighF: 43, avgLowF: 28, rainChance: 30, weatherScore: 1, description: "Cold winter" },
  2: { city: "DC", avgHighF: 47, avgLowF: 30, rainChance: 30, weatherScore: 2, description: "Cold — indoor preferred" },
  3: { city: "DC", avgHighF: 56, avgLowF: 37, rainChance: 35, weatherScore: 3, description: "Cool spring" },
  4: { city: "DC", avgHighF: 67, avgLowF: 46, rainChance: 35, weatherScore: 4, description: "Beautiful spring — cherry blossom season" },
  5: { city: "DC", avgHighF: 76, avgLowF: 56, rainChance: 35, weatherScore: 5, description: "Ideal late spring" },
  6: { city: "DC", avgHighF: 84, avgLowF: 65, rainChance: 35, weatherScore: 4, description: "Warm summer — humid" },
  7: { city: "DC", avgHighF: 89, avgLowF: 70, rainChance: 35, weatherScore: 3, description: "Hot and humid" },
  8: { city: "DC", avgHighF: 87, avgLowF: 69, rainChance: 35, weatherScore: 3, description: "Hot and humid" },
  9: { city: "DC", avgHighF: 80, avgLowF: 62, rainChance: 30, weatherScore: 5, description: "Beautiful early fall" },
  10: { city: "DC", avgHighF: 69, avgLowF: 50, rainChance: 30, weatherScore: 5, description: "Peak fall" },
  11: { city: "DC", avgHighF: 58, avgLowF: 41, rainChance: 30, weatherScore: 3, description: "Cool late fall" },
  12: { city: "DC", avgHighF: 47, avgLowF: 32, rainChance: 30, weatherScore: 2, description: "Cold winter" },
};

const ATLANTA: WeatherTable = {
  1: { city: "Atlanta", avgHighF: 52, avgLowF: 35, rainChance: 35, weatherScore: 2, description: "Cool winter" },
  2: { city: "Atlanta", avgHighF: 57, avgLowF: 38, rainChance: 35, weatherScore: 3, description: "Mild winter" },
  3: { city: "Atlanta", avgHighF: 65, avgLowF: 45, rainChance: 35, weatherScore: 4, description: "Pleasant spring" },
  4: { city: "Atlanta", avgHighF: 73, avgLowF: 52, rainChance: 35, weatherScore: 5, description: "Ideal spring" },
  5: { city: "Atlanta", avgHighF: 80, avgLowF: 61, rainChance: 35, weatherScore: 5, description: "Beautiful late spring" },
  6: { city: "Atlanta", avgHighF: 87, avgLowF: 68, rainChance: 35, weatherScore: 3, description: "Warm and humid" },
  7: { city: "Atlanta", avgHighF: 89, avgLowF: 71, rainChance: 40, weatherScore: 2, description: "Hot and humid" },
  8: { city: "Atlanta", avgHighF: 88, avgLowF: 71, rainChance: 35, weatherScore: 2, description: "Hot and humid" },
  9: { city: "Atlanta", avgHighF: 82, avgLowF: 65, rainChance: 30, weatherScore: 4, description: "Pleasant early fall" },
  10: { city: "Atlanta", avgHighF: 73, avgLowF: 53, rainChance: 25, weatherScore: 5, description: "Ideal fall" },
  11: { city: "Atlanta", avgHighF: 63, avgLowF: 43, rainChance: 30, weatherScore: 4, description: "Pleasant late fall" },
  12: { city: "Atlanta", avgHighF: 54, avgLowF: 37, rainChance: 35, weatherScore: 3, description: "Cool winter" },
};

const INDIA: WeatherTable = {
  1: { city: "India", avgHighF: 70, avgLowF: 48, rainChance: 5, weatherScore: 5, description: "Peak wedding weather across most of India" },
  2: { city: "India", avgHighF: 76, avgLowF: 54, rainChance: 5, weatherScore: 5, description: "Ideal" },
  3: { city: "India", avgHighF: 86, avgLowF: 64, rainChance: 5, weatherScore: 4, description: "Warming up" },
  4: { city: "India", avgHighF: 95, avgLowF: 73, rainChance: 10, weatherScore: 2, description: "Hot — indoor preferred" },
  5: { city: "India", avgHighF: 100, avgLowF: 78, rainChance: 15, weatherScore: 1, description: "Very hot" },
  6: { city: "India", avgHighF: 95, avgLowF: 79, rainChance: 60, weatherScore: 1, description: "Monsoon begins" },
  7: { city: "India", avgHighF: 88, avgLowF: 77, rainChance: 80, weatherScore: 1, description: "Peak monsoon" },
  8: { city: "India", avgHighF: 86, avgLowF: 76, rainChance: 80, weatherScore: 1, description: "Peak monsoon" },
  9: { city: "India", avgHighF: 88, avgLowF: 74, rainChance: 50, weatherScore: 2, description: "Tail of monsoon" },
  10: { city: "India", avgHighF: 89, avgLowF: 68, rainChance: 15, weatherScore: 4, description: "Post-monsoon — pleasant" },
  11: { city: "India", avgHighF: 80, avgLowF: 58, rainChance: 5, weatherScore: 5, description: "Peak wedding season" },
  12: { city: "India", avgHighF: 72, avgLowF: 50, rainChance: 5, weatherScore: 5, description: "Peak wedding season" },
};

const CITY_WEATHER: Record<string, WeatherTable> = {
  dallas: DALLAS,
  houston: HOUSTON,
  nyc: NYC,
  chicago: CHICAGO,
  la: LA,
  "bay-area": BAY_AREA,
  dc: DC,
  atlanta: ATLANTA,
  india: INDIA,
  other: DALLAS, // fallback to Dallas profile
};

export function getWeatherForCityMonth(city: string, month: number): WeatherInfo {
  const table = CITY_WEATHER[city] ?? DALLAS;
  return table[month] ?? table[1];
}
