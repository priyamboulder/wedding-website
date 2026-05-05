// ── Sweets catalog (lifted shared library) ─────────────────────────────────
// Single source of truth for the cake & dessert reference data used across
// both the full Cake & Sweets workspace and the Sweets Selection guided
// journey. Originally inlined in `lib/cake-sweets-seed.ts` — that module
// now re-exports from here so existing call sites keep working.
//
// Append-safe: id stability matters because reactions persist against ids.

export {
  type DessertReaction,
  type FlavorProfile,
  FLAVOR_PROFILES,
  type TraditionDirection,
  TRADITION_DIRECTIONS,
  type AllergenOption,
  ALLERGEN_OPTIONS,
  type CakeInspiration,
  CAKE_INSPIRATIONS,
  type DessertCategory,
  type DessertItem,
  DESSERT_CATALOG,
  DISPLAY_STYLES,
  type SuggestedSong,
  SUGGESTED_CUTTING_SONGS,
  TEXTURE_OPTIONS,
  SUGGESTED_MOMENTS,
} from "@/lib/cake-sweets-seed";

import {
  DESSERT_CATALOG,
  type DessertCategory,
  type DessertItem,
} from "@/lib/cake-sweets-seed";

// ── Helpers used by Selection Session 2 (Mithai Spread) ──────────────────

export function findDessert(id: string): DessertItem | null {
  return DESSERT_CATALOG.find((d) => d.id === id) ?? null;
}

export function dessertsByCategory(category: DessertCategory): DessertItem[] {
  return DESSERT_CATALOG.filter((d) => d.category === category);
}

// Each catalog item carries its baseline per-guest serving count for
// procurement math. Most mithai are 2 pieces / guest; live stations are
// 1 / guest; statement desserts (cake) are 1 slice / guest. Override on
// individual items via DESSERT_DEFAULT_QUANTITIES below.
export const DESSERT_DEFAULT_QUANTITIES: Record<string, number> = {
  // Mithai high-volume tray staples
  "kaju-katli": 2,
  "barfi-pista": 2,
  "barfi-coconut": 2,
  "barfi-chocolate": 2,
  "ladoo-motichoor": 2,
  "ladoo-besan": 2,
  "ladoo-boondi": 2,
  peda: 2,
  "soan-papdi": 2,
  "mysore-pak": 2,
  // Wet sweets — single-bowl
  "gulab-jamun": 2,
  rasgulla: 2,
  rasmalai: 1,
  chamcham: 1,
  "halwa-gajar": 1,
  "halwa-moong": 1,
  "halwa-sooji": 1,
  rabri: 1,
  kheer: 1,
  basundi: 1,
  // Live stations (per-guest is per-pass, expect ~1)
  jalebi: 1,
  malpua: 1,
  "paan-station": 1,
  modak: 1,
  sandesh: 1,
  kulfi: 1,
  // Western
  cupcakes: 1,
  macarons: 2,
  cookies: 2,
  brownies: 1,
  "cake-pops": 1,
  donuts: 1,
  "mini-cheesecakes": 1,
  cannoli: 1,
  churros: 2,
  "creme-brulee": 1,
  "tart-fruit": 1,
  "tart-chocolate": 1,
  "tart-lemon": 1,
  profiteroles: 2,
  eclairs: 1,
  "tiramisu-cups": 1,
  "smores-station": 1,
  "gelato-bar": 1,
  // Fusion
  "chai-macarons": 2,
  "cardamom-brulee": 1,
  "rose-pistachio-cake": 1,
  "mango-panna-cotta": 1,
  "gulab-jamun-cheesecake": 1,
  "saffron-kulfi-pops": 1,
  "chai-cookies": 2,
  "ras-malai-cake": 1,
  "paan-truffles": 2,
  "jalebi-cheesecake-bites": 1,
};

export function defaultPerGuestQuantity(itemId: string): number {
  return DESSERT_DEFAULT_QUANTITIES[itemId] ?? 2;
}

// Items that absolutely need day-of fresh procurement (live-fried, hot,
// or rapidly degrading). Drives Service Plan's `procurement_cadence.
// fresh_items_pickup_time` auto-population.
export const FRESH_ITEM_IDS: readonly string[] = [
  "jalebi",
  "malpua",
  "rabri",
  "rasmalai",
  "halwa-gajar",
  "halwa-moong",
  "halwa-sooji",
  "kheer",
  "basundi",
  "paan-station",
  "modak",
  "churros",
  "smores-station",
  "gelato-bar",
] as const;

export function isFreshItem(itemId: string): boolean {
  return FRESH_ITEM_IDS.includes(itemId);
}
