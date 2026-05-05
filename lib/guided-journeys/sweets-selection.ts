// ── Sweets Selection journey ───────────────────────────────────────────────
// Second guided journey on the Cake & Sweets workspace. Vision (the 3-
// session flow on Tab 1) lives at journey_id = "default"; Selection lives
// at journey_id = "selection". Four sessions:
//
//   1. cake_design     — has-cake gate, tier-by-tier spec, frosting,
//                        per-tier allergen flags, cutting ceremony,
//                        cake-style inspiration reactions.
//   2. mithai_spread   — react across the 54-item catalog. Hydrate loved
//                        items with quantity, events, dietary flags, and
//                        custom additions.
//   3. dessert_tables  — assemble per-event tables from loved cake tiers
//                        + mithai items. Styling, plating, props,
//                        attendants.
//   4. service_plan    — per-event service timing, refresh cadence, late-
//                        night drops, vendor handoff notes, procurement
//                        cadence (cake / mithai / fresh / cold storage).
//
// Unlike Vision, Selection does NOT generate a closing brief — Vision
// already produced the brief that goes to bakers and mithai vendors.
// Selection's output is operational. Completion lands the couple on Tab 4
// (Mithai & Dessert Spread) with three action CTAs (Send to baker / Send
// to mithai vendor / Share day-of plan with planner).
//
// Field storage strategy: every Selection session reads & writes directly
// through `useCakeSweetsStore` and `useWorkspaceStore` — the same source
// of truth Tabs 3/4/5/6 use. This gives free two-way sync with no copy-
// and-paste. The journey state itself only persists session statuses
// (not_started / in_progress / completed). See sweets-selection-sync.ts
// for the canonical field mapping.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const SWEETS_SELECTION_JOURNEY_ID = "selection";
export const SWEETS_SELECTION_CATEGORY: CategoryKey = "cake_sweets";

export type SweetsSelectionSessionKey =
  | "cake_design"
  | "mithai_spread"
  | "dessert_tables"
  | "service_plan";

export interface SweetsSelectionSessionDef {
  key: SweetsSelectionSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const SWEETS_SELECTION_SESSIONS: readonly SweetsSelectionSessionDef[] = [
  {
    key: "cake_design",
    index: 1,
    title: "Design your cake",
    subtitle:
      "Tiers, flavors per tier, cutting ceremony, allergen flags.",
    estimatedMinutes: 4,
  },
  {
    key: "mithai_spread",
    index: 2,
    title: "Build your mithai spread",
    subtitle:
      "Browse the catalog. Love what speaks to you, dismiss what doesn't.",
    estimatedMinutes: 4,
  },
  {
    key: "dessert_tables",
    index: 3,
    title: "Plan your dessert tables",
    subtitle: "Per-event styling, plating, props, attendants.",
    estimatedMinutes: 3,
  },
  {
    key: "service_plan",
    index: 4,
    title: "Service plan",
    subtitle:
      "When each dessert gets served, refresh cadence, late-night drops.",
    estimatedMinutes: 3,
  },
] as const;

export const SWEETS_SELECTION_TOTAL_MINUTES =
  SWEETS_SELECTION_SESSIONS.reduce((sum, s) => sum + s.estimatedMinutes, 0);

export function getSweetsSelectionSession(
  key: SweetsSelectionSessionKey,
): SweetsSelectionSessionDef {
  const found = SWEETS_SELECTION_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown sweets selection session: ${key}`);
  }
  return found;
}

// ── Form data shapes ───────────────────────────────────────────────────────
// These describe the logical shape of each session's form_data. The
// session UIs read & write through useCakeSweetsStore + useWorkspaceStore
// directly, so these types double as documentation of the projection from
// store → guided journey.

export type CakeStyle =
  | "tiered_classic"
  | "naked_rustic"
  | "fondant_sculptural"
  | "modern_minimal"
  | "fusion_indian";

export type CakeFrosting = "buttercream" | "fondant" | "ganache" | "naked";

export type CakeShape = "round" | "square" | "hexagon";

export interface CakeTier {
  id: string;
  position: number; // 1 = bottom, 2 = middle, etc.
  diameter_inches: number; // 6, 8, 10, 12, 14, 16
  shape: CakeShape;
  flavor: string; // "Pistachio rose"
  filling?: string;
  frosting: CakeFrosting;
  allergen_flags: string[]; // ['nut_free','gluten_free','dairy_free','egg_free','vegan']
  is_signature: boolean; // bride's favorite tier
}

export interface CakeDesignFormData {
  has_cake: boolean;
  cake_style?: CakeStyle;
  tiers: CakeTier[];
  inspiration_reactions: Array<{
    style_id: string;
    reaction: "love_it" | "not_for_me" | "no_reaction";
  }>;
  cutting_ceremony: {
    is_planned: boolean;
    event?: "reception" | "sangeet" | "wedding" | "other";
    target_time?: string;
    photographer_setup_minutes: number;
    notes?: string;
  };
  allergen_notes: string;
  computed?: {
    estimated_servings: number;
    allergen_summary: string[];
    has_allergen_separation: boolean;
  };
}

export type MithaiCatalogCategory = "indian_mithai" | "western" | "fusion";

export interface MithaiSpreadFormData {
  catalog_reactions: Array<{
    item_id: string;
    category: MithaiCatalogCategory;
    reaction: "love_it" | "not_for_me" | "no_reaction";
  }>;
  loved_items: Array<{
    item_id: string;
    quantity_per_guest: number;
    quantity_unit: "pieces" | "grams" | "servings";
    events: string[];
    dietary_flags: string[];
    is_signature: boolean;
    notes?: string;
  }>;
  custom_additions: Array<{
    id: string;
    name: string;
    description: string;
    category: MithaiCatalogCategory;
    source: "family_recipe" | "regional_specialty" | "vendor_creation";
    quantity_per_guest: number;
    events: string[];
    dietary_flags: string[];
  }>;
  computed?: {
    total_loved_count: number;
    indian_count: number;
    western_count: number;
    fusion_count: number;
    total_servings_needed: number;
    estimated_cost_range?: { low: number; high: number };
  };
}

export interface DessertTableEntry {
  id: string;
  event: string;
  name: string;
  items: Array<{
    source: "cake_tier" | "mithai_loved" | "mithai_custom";
    ref_id: string;
    display_quantity?: number;
  }>;
  styling: {
    vibe: string[];
    props: string[];
    linen: string;
    backdrop?: string;
  };
  plating: {
    style: "individual_portions" | "family_style" | "self_serve" | "mixed";
    utensils_provided: "plates_forks" | "just_napkins" | "plates_only" | "tbd";
    portion_signage: boolean;
  };
  attendants_count: number;
  attendant_role?: string;
  notes?: string;
}

export interface DessertTablesFormData {
  tables: DessertTableEntry[];
  computed?: {
    total_tables: number;
    total_attendants: number;
    events_with_tables: string[];
    events_without_tables: string[];
  };
}

export interface ServicePlanFormData {
  event_service: Array<{
    event: string;
    desserts_at_event: string[];
    service_start_time: string;
    service_end_time?: string;
    refresh_cadence_minutes?: number;
    late_night_drop: {
      enabled: boolean;
      drop_time?: string;
      items: string[];
      notes?: string;
    };
    cake_cutting?: {
      planned: boolean;
      time?: string;
    };
    notes?: string;
  }>;
  vendor_handoff: {
    photographer_notes: string;
    decor_notes: string;
    catering_coordination: string;
  };
  procurement_cadence: {
    cake_pickup_time?: string;
    mithai_pickup_time?: string;
    fresh_items_pickup_time?: string;
    cold_storage_required: boolean;
    cold_storage_notes?: string;
  };
}

// ── Cake style cards (Selection Session 1) ────────────────────────────────
// Five high-level cake direction cards. The full 12-card inspiration
// gallery still lives in `lib/cake-sweets-seed.ts` (CAKE_INSPIRATIONS) and
// renders below the style cards in Session 1.

export const CAKE_STYLE_CARDS: Array<{
  id: CakeStyle;
  label: string;
  description: string;
  emoji: string;
}> = [
  {
    id: "tiered_classic",
    label: "Tiered classic",
    description:
      "Three-to-five tiers, refined silhouette, fresh florals or piping.",
    emoji: "🎂",
  },
  {
    id: "naked_rustic",
    label: "Naked / rustic",
    description: "Exposed sponge, semi-naked sides, organic fruit and herbs.",
    emoji: "🍯",
  },
  {
    id: "fondant_sculptural",
    label: "Fondant sculptural",
    description: "Couture fondant, drapery, pearls, ornate hand-piping.",
    emoji: "🪞",
  },
  {
    id: "modern_minimal",
    label: "Modern minimal",
    description: "Clean lines, single-tone fondant, metallic accent base.",
    emoji: "🤍",
  },
  {
    id: "fusion_indian",
    label: "Fusion Indian",
    description: "Marigold drips, paisley piping, cardamom-saffron sponge.",
    emoji: "🪔",
  },
];

// ── Default styling props (Selection Session 3) ───────────────────────────

export const DESSERT_TABLE_PROP_OPTIONS: string[] = [
  "cake_stands_tiered",
  "silver_thalis",
  "glass_cloches",
  "wood_boards",
  "floral_runner",
  "candles",
  "signage",
  "marble_slabs",
  "brass_lanterns",
];
