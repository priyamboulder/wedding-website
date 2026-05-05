// ── Sweets Selection field-mapping table ───────────────────────────────────
// Single source of truth for where each Selection-journey field lives in
// the underlying stores. The session UIs already read & write through
// these stores directly, which gives automatic two-way sync between the
// guided journey and Tabs 3/4/5/6 of the full Cake & Sweets workspace.
//
// This file is documentation more than runtime code — it exists so that
// when fields change in either the Selection schema OR the full workspace,
// you have a single map to update / verify.

import type { SweetsSelectionSessionKey } from "./sweets-selection";

export type CakeSweetsStoreSlice =
  | "flavor"
  | "allergens"
  | "cake_inspirations"
  | "dessert_catalog"
  | "dessert_meta"
  | "table_config"
  | "cutting_song"
  | "tasting_sessions"
  | "journeyMeta"; // small per-Selection metadata blob

export type WorkspaceStoreSlice = "items" | "moodboard" | "notes";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Which underlying store holds the canonical value. */
  store: "cake_sweets_store" | "workspace_store" | "auth_store" | "vendors_store";
  /** Slice / table inside that store. */
  slice: CakeSweetsStoreSlice | WorkspaceStoreSlice | "wedding_meta";
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<SweetsSelectionSessionKey, FieldMapping[]> = {
  cake_design: [
    {
      formDataPath: "has_cake",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "selection_has_cake",
      notes:
        "Boolean gate. False routes Session 1 directly to Session 2 mithai.",
    },
    {
      formDataPath: "cake_style",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "selection_cake_style",
    },
    {
      formDataPath: "tiers[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = cake_sweets AND tab = wedding_cake AND meta.kind = tier",
      notes:
        "Each tier is a WorkspaceItem. meta carries: kind=tier, tierIndex, size, shape, flavor, frosting, allergen_flags[].",
    },
    {
      formDataPath: "inspiration_reactions[]",
      store: "cake_sweets_store",
      slice: "cake_inspirations",
      storePath: "cake_inspirations[style_id] = love | not_this",
    },
    {
      formDataPath: "cutting_ceremony.is_planned",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where meta.kind = ceremony — presence implies is_planned",
    },
    {
      formDataPath: "cutting_ceremony.event",
      store: "workspace_store",
      slice: "items",
      storePath: "ceremony item meta.event",
    },
    {
      formDataPath: "cutting_ceremony.target_time",
      store: "workspace_store",
      slice: "items",
      storePath: "ceremony item meta.time",
    },
    {
      formDataPath: "cutting_ceremony.notes",
      store: "workspace_store",
      slice: "items",
      storePath: "ceremony item meta.notes",
    },
    {
      formDataPath: "allergen_notes",
      store: "cake_sweets_store",
      slice: "allergens",
      storePath: "allergens.notes",
      notes:
        "Per-tier allergen_flags also cascade up to allergens.flags as union.",
    },
  ],

  mithai_spread: [
    {
      formDataPath: "catalog_reactions[]",
      store: "cake_sweets_store",
      slice: "dessert_catalog",
      storePath:
        "dessert_catalog[item_id] = love | not_this (no entry = no_reaction)",
    },
    {
      formDataPath: "loved_items[].item_id",
      store: "cake_sweets_store",
      slice: "dessert_catalog",
      storePath: "dessert_catalog where reaction = love",
      notes:
        "loved_items[] is derived — each loved id surfaces its hydration via dessert_meta.",
    },
    {
      formDataPath: "loved_items[].quantity_per_guest",
      store: "cake_sweets_store",
      slice: "dessert_meta",
      storePath: "dessert_meta[id].quantity (free-form string)",
      notes: "Catalog provides DESSERT_DEFAULT_QUANTITIES as fallback.",
    },
    {
      formDataPath: "loved_items[].events[]",
      store: "cake_sweets_store",
      slice: "dessert_meta",
      storePath: "dessert_meta[id].events",
    },
    {
      formDataPath: "loved_items[].dietary_flags[]",
      store: "cake_sweets_store",
      slice: "dessert_meta",
      storePath: "dessert_meta[id].dietary",
    },
    {
      formDataPath: "loved_items[].is_signature",
      store: "cake_sweets_store",
      slice: "dessert_meta",
      storePath: "dessert_meta[id].is_signature",
    },
    {
      formDataPath: "custom_additions[]",
      store: "cake_sweets_store",
      slice: "dessert_meta",
      storePath:
        "dessert_meta entries where custom = true. addCustomDessert() creates them.",
    },
  ],

  dessert_tables: [
    {
      formDataPath: "tables[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = cake_sweets AND tab = dessert_tables AND meta.kind = table",
      notes:
        "Each table is a WorkspaceItem with meta carrying event, items[], styling, plating, attendants.",
    },
    {
      formDataPath: "tables[].styling.vibe[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "table item meta.styling.vibe — pre-seeded from vision style_keywords.",
    },
    {
      formDataPath: "tables[].items[].ref_id",
      store: "cake_sweets_store",
      slice: "table_config",
      storePath: "table_config[dessert_id]",
      notes:
        "Reverse-lookup: which dessert ids are placed on which table. Source field tags whether it's a cake tier, loved mithai, or custom.",
    },
  ],

  service_plan: [
    {
      formDataPath: "event_service[]",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.events",
      notes:
        "Service plan per event. Cross-references loved_items + cake tiers.",
    },
    {
      formDataPath: "vendor_handoff.photographer_notes",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.handoff.photographer_notes",
      notes:
        "Surfaces (one-way write for v1) on photography workspace's day-of coordination block.",
    },
    {
      formDataPath: "vendor_handoff.decor_notes",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.handoff.decor_notes",
    },
    {
      formDataPath: "vendor_handoff.catering_coordination",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.handoff.catering_coordination",
    },
    {
      formDataPath: "procurement_cadence.cake_pickup_time",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.procurement.cake_pickup_time",
    },
    {
      formDataPath: "procurement_cadence.mithai_pickup_time",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.procurement.mithai_pickup_time",
    },
    {
      formDataPath: "procurement_cadence.fresh_items_pickup_time",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.procurement.fresh_items_pickup_time",
      notes:
        "Auto-suggested as 'day-of morning' when any loved item flags as fresh (FRESH_ITEM_IDS in lib/libraries/sweets-catalog).",
    },
    {
      formDataPath: "procurement_cadence.cold_storage_required",
      store: "cake_sweets_store",
      slice: "journeyMeta",
      storePath: "service_plan.procurement.cold_storage_required",
    },
  ],
};

// ── Cross-workspace pulls (Selection consumes from elsewhere) ──────────────

export const CROSS_WORKSPACE_PULLS = [
  {
    consumer: "mithai_spread.computed.total_servings_needed",
    source: "auth_store.user.wedding.guest_count",
    notes:
      "Procurement math: per-guest qty × guest count. Uses 100 default when unset.",
  },
  {
    consumer: "dessert_tables.tables[].event",
    source: "auth_store.user.wedding.events[].event_type",
    notes:
      "Pre-seeds one default table per dessert-flagged event in the wedding.",
  },
  {
    consumer: "dessert_tables.tables[].styling.vibe[]",
    source:
      "vision_store.style_keywords[cake_sweets] (the 14-chip set on Vision Tab 1)",
    notes: "Pulled as default; couple can override per-table.",
  },
  {
    consumer: "service_plan.procurement_cadence.cold_storage_required",
    source: "venue workspace · outdoor flag",
    notes:
      "When venue is outdoor in a hot climate, cold_storage_required defaults to true.",
  },
] as const;

// ── Cross-workspace writes (Selection projects out — one-way for v1) ───────

export const CROSS_WORKSPACE_WRITES = [
  {
    producer: "service_plan.vendor_handoff.photographer_notes",
    target: "photography workspace · day-of coordination block",
    notes:
      "One-way write. Edits made on the photography side don't echo back.",
  },
  {
    producer: "service_plan.vendor_handoff.decor_notes",
    target: "decor workspace · day-of coordination block",
  },
  {
    producer: "service_plan.vendor_handoff.catering_coordination",
    target: "catering workspace · day-of coordination block",
  },
  {
    producer: "cake_design.tiers[].allergen_flags[]",
    target:
      "vision · dietary_flags object (union, cascading up to workspace level)",
    notes:
      "Also surfaces on Catering workspace's allergen overview as a union with the catering dietary atlas.",
  },
] as const;
