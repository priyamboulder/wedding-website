// ── Gifting Build · Field-mapping table ───────────────────────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying stores. The session UIs read & write through these stores
// directly, which gives automatic two-way sync between the guided journey
// and Tabs 3/4/5/6 of the full Gifting workspace.
//
// Documentation more than runtime code — when fields change in either the
// Build schema OR the full workspace, this file is the single map to
// update / verify.

import type { GiftingBuildSessionKey } from "./gifting-build";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Which underlying store holds the canonical value. */
  store:
    | "workspace_store"
    | "auth_store"
    | "guests_store"
    | "vendors_store"
    | "stationery_store"
    | "travel_accommodations_store"
    | "journey_storage";
  /** Slice / table inside that store. */
  slice: string;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<GiftingBuildSessionKey, FieldMapping[]> = {
  welcome_bags: [
    {
      formDataPath: "bag_plan.quantity_total",
      store: "travel_accommodations_store",
      slice: "hotel_blocks",
      storePath: "sum(hotel_blocks[].rooms_blocked)",
      notes:
        "Pre-seeded from Travel & Accommodations Build. Couple can override via quantity_override.",
    },
    {
      formDataPath: "bag_plan.quantity_basis",
      store: "journey_storage",
      slice: "gifting:build/welcome_bags/form_data",
      storePath: "bag_plan.quantity_basis",
    },
    {
      formDataPath: "bag_plan.bag_theme",
      store: "journey_storage",
      slice: "gifting:build/welcome_bags/form_data",
      storePath: "bag_plan.bag_theme",
    },
    {
      formDataPath: "bag_plan.delivery_plan",
      store: "journey_storage",
      slice: "gifting:build/welcome_bags/form_data",
      storePath: "bag_plan.delivery_plan",
    },
    {
      formDataPath: "bag_items[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = welcome_bags",
      notes:
        "Each bag item is a WorkspaceItem. meta carries: ideaId, category, qty, unitCost, status, vendor, sourcing_status, source_idea_id, reuses_loved_idea.",
    },
    {
      formDataPath: "bag_items[].sourcing_status",
      store: "workspace_store",
      slice: "items",
      storePath: "items[].meta.sourcing_status",
      notes:
        "Existing meta.status (planned/ordered/received) maps to lifecycle: planned → wishlist|sourcing, ordered → ordered, received → received|packed.",
    },
    {
      formDataPath: "assembly",
      store: "journey_storage",
      slice: "gifting:build/welcome_bags/form_data",
      storePath: "assembly",
      notes:
        "Assembly plan is journey-only — there's no equivalent on the full workspace.",
    },
    {
      formDataPath: "computed",
      store: "journey_storage",
      slice: "gifting:build/welcome_bags/form_data",
      storePath: "computed",
      notes:
        "Recomputed on each save: total cost, cost-per-bag, sourcing breakdown, cost_vs_budget_anchor against Vision welcome_bags_per_bag.",
    },
  ],

  trousseau_packaging: [
    {
      formDataPath: "trousseau_pieces[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = trousseau_packaging",
      notes:
        "Each piece is a WorkspaceItem. meta carries: piece_type, sourcing_status, vendor, vendor_contact, cost_estimate, actual_cost, order_date, expected_delivery_date, needs_monogram, needs_label, label_text, stationery_coordination_status, photos, cultural_purpose, used_at_event.",
    },
    {
      formDataPath: "trousseau_pieces[].label_text",
      store: "stationery_store",
      slice: "label_orders",
      storePath: "stationery.label_orders.gifting[]",
      notes:
        "One-way write: when needs_monogram or needs_label flips true, push the label_text to Stationery's label-orders queue.",
    },
    {
      formDataPath: "computed.sourcing_lead_time_warnings[]",
      store: "journey_storage",
      slice: "gifting:build/trousseau_packaging/form_data",
      storePath: "computed.sourcing_lead_time_warnings",
      notes:
        "Computed: pieces with order_date later than wedding-minus-90-days surface as warnings.",
    },
  ],

  return_favors: [
    {
      formDataPath: "favor_plan.expected_guest_count",
      store: "guests_store",
      slice: "rsvp_summary",
      storePath: "rsvp_summary.confirmed_count",
      notes:
        "Pre-seeded from Guests workspace RSVP. Falls back to auth_store.user.wedding.guest_count when unset.",
    },
    {
      formDataPath: "favor_plan.buffer_count",
      store: "journey_storage",
      slice: "gifting:build/return_favors/form_data",
      storePath: "favor_plan.buffer_count",
      notes: "Default = ceil(expected_guest_count × 0.10).",
    },
    {
      formDataPath: "favor_items[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = return_favors",
      notes:
        "Each favor item is a WorkspaceItem. meta carries: ideaId, qty, unitCost, status, vendor, sourcing_status, used_at_event, source_idea_id, reuses_loved_idea.",
    },
    {
      formDataPath: "charitable_donation",
      store: "journey_storage",
      slice: "gifting:build/return_favors/form_data",
      storePath: "charitable_donation",
      notes:
        "Renders only when at least one favor_item has item_category === 'charitable_donation'.",
    },
    {
      formDataPath: "computed.cost_vs_budget_anchor",
      store: "journey_storage",
      slice: "gifting:build/return_favors/form_data",
      storePath: "computed.cost_vs_budget_anchor",
      notes:
        "Computed against Vision's return_favors_per_guest anchor.",
    },
  ],

  family_exchanges: [
    {
      formDataPath: "family_exchanges[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = family_exchanges AND meta.kind = exchange",
      notes:
        "Each exchange is a WorkspaceItem (block_type = note). meta carries: exchange_type, event, giver_family, receiver_family, gift_idea, quantity, estimated_cost_total, sourcing_status, cultural_significance, is_reciprocal, reciprocal_exchange_id, vendor_tip_amount.",
    },
    {
      formDataPath: "bridal_party_gifts[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = family_exchanges AND meta.kind = bridal_party",
      notes:
        "Each bridal-party gift is a WorkspaceItem with meta.kind = bridal_party.",
    },
    {
      formDataPath: "vendor_thank_yous[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = gifting AND tab = family_exchanges AND meta.kind = vendor_thank_you",
      notes:
        "Pre-seeded from contracted vendors across all workspaces (Photography, Catering, etc.).",
    },
  ],
};

// ── Cross-workspace pulls (Build consumes from elsewhere) ──────────────────

export const CROSS_WORKSPACE_PULLS = [
  {
    consumer: "welcome_bags.bag_plan.quantity_total",
    source:
      "travel_accommodations workspace · sum(hotel_blocks[].rooms_blocked)",
    notes:
      "Welcome bags follow rooms-in-block, not guest count. Falls back to auth_store guest_count when no blocks set.",
  },
  {
    consumer: "return_favors.favor_plan.expected_guest_count",
    source: "guests workspace · rsvp_summary.confirmed_count",
    notes:
      "Falls back to auth_store.user.wedding.guest_count when RSVP isn't open yet.",
  },
  {
    consumer: "family_exchanges.family_exchanges[].giver_specific_role",
    source: "officiant workspace · family_roles[]",
    notes:
      "Autocomplete suggestions for the giver_specific_role field — pulls roles already named for the ceremony.",
  },
  {
    consumer: "family_exchanges.vendor_thank_yous[]",
    source: "all vendor workspaces · contracted vendor list",
    notes:
      "Pre-seeds with one entry per vendor where contracted = true. Default draft copy: 'Small mithai box + handwritten note', $50.",
  },
  {
    consumer: "*.computed.cost_vs_budget_anchor",
    source:
      "gifting vision · gifting_philosophy.budget_anchors.{category}",
    notes:
      "Each Build session compares its computed total against Vision's chip-band anchor (welcome_bags_per_bag, return_favors_per_guest, family_exchanges_per_family, trousseau_packaging_total).",
  },
  {
    consumer: "welcome_bags.bag_items[] (initial pre-seed)",
    source:
      "gifting vision · gifting_inspiration.idea_reactions[] where category=welcome_bags AND reaction=love",
    notes:
      "Loved Vision ideas are lifted into wishlist-state bag_items with reuses_loved_idea = true. Idempotent on re-lift.",
  },
  {
    consumer: "return_favors.favor_items[] (initial pre-seed)",
    source:
      "gifting vision · gifting_inspiration.idea_reactions[] where category=return_favors AND reaction=love",
    notes: "Same lift-loved-ideas pattern as welcome_bags.",
  },
] as const;

// ── Cross-workspace writes (Build projects out — one-way for v1) ───────────

export const CROSS_WORKSPACE_WRITES = [
  {
    producer: "trousseau_pieces[].label_text",
    target: "stationery workspace · label/monogram orders queue",
    notes:
      "When needs_monogram or needs_label flips true with a non-empty label_text, push to Stationery as a label order.",
  },
  {
    producer: "family_exchanges[].vendor_tip_amount",
    target: "finance workspace · budget tracker line items",
    notes:
      "Vendor tip amounts on family exchanges become budget line items so they're tracked in the master budget.",
  },
  {
    producer: "*.bag_items[] / favor_items[] / trousseau_pieces[] · sourcing_status='received'",
    target: "master shopping ledger (if present)",
    notes:
      "Items reaching `received` status flow to the unified shopping ledger when one exists.",
  },
  {
    producer:
      "vendor_thank_yous[] AND bridal_party_gifts[] (with delivery_plan='morning_of_wedding')",
    target: "schedule workspace · day-of timeline · morning-of tasks",
    notes:
      "Wedding-day handoff gifts surface as morning-of timeline tasks.",
  },
] as const;
