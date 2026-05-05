// ── Wardrobe Build field-mapping table ─────────────────────────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying stores. The session UIs already read & write through these
// stores directly, which gives automatic two-way sync between the guided
// journey and Tabs 3/4/6 of the full Wardrobe & Styling workspace.
//
// This file is documentation more than runtime code — it exists so that
// when fields change in either the Build schema OR the full workspace,
// you have a single map to update / verify.

import type { WardrobeBuildSessionKey } from "./wardrobe-build";

export type WorkspaceStoreSlice = "items" | "moodboard" | "files" | "notes";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Which underlying store holds the canonical value. */
  store: "workspace_store" | "quiz_store" | "auth_store" | "vendors_store" | "local_storage";
  /** Slice / table inside that store. */
  slice: WorkspaceStoreSlice | "wedding_meta" | "build_meta";
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<WardrobeBuildSessionKey, FieldMapping[]> = {
  outfit_planner: [
    {
      formDataPath: "people[]",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:wardrobe-build:people",
      notes:
        "Bride and groom auto-seed. Couples add others. Bride/groom are derived names so renaming flows back from the wedding profile.",
    },
    {
      formDataPath: "outfits[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = wardrobe AND tab = wardrobe_looks AND block_type = outfit",
      notes:
        "Each outfit is a WorkspaceItem. meta carries: person, event, color, designer, status, notes, images[], urls[], jewelry{}, no_jewelry. Same store the OutfitPlannerGrid reads.",
    },
    {
      formDataPath: "outfits[].colour",
      store: "workspace_store",
      slice: "items",
      storePath: "outfit item meta.color (hex string)",
    },
    {
      formDataPath: "outfits[].designer",
      store: "workspace_store",
      slice: "items",
      storePath: "outfit item meta.designer",
    },
    {
      formDataPath: "outfits[].status",
      store: "workspace_store",
      slice: "items",
      storePath:
        "outfit item meta.status (mapping: not_decided→shopping, shortlisted→shopping, purchased→ordered, alterations→fittings, ready→ready)",
      notes:
        "Build's status enum is richer than the grid's. The grid uses 4 buckets (shopping/ordered/fittings/ready); Build adds an explicit not_decided/shortlisted split before purchase. Mapping is bidirectional — the bridge lives in OutfitPlannerSession.tsx.",
    },
    {
      formDataPath: "outfits[].inspiration_image_url",
      store: "workspace_store",
      slice: "items",
      storePath: "outfit item meta.images[0]",
    },
    {
      formDataPath: "outfits[].jewelry_notes",
      store: "workspace_store",
      slice: "items",
      storePath: "outfit item meta.jewelry.notes",
    },
  ],

  family_coordination: [
    {
      formDataPath: "family_members[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = wardrobe AND tab = bridal_party_attire AND block_type = outfit AND meta.kind != 'rule'",
      notes:
        "Same WorkspaceItems the FamilyCoordinationTab Bride/Groom side tables show. meta.side, meta.person, meta.events[], meta.color carry the Build family_member shape.",
    },
    {
      formDataPath: "side_palettes[]",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:wardrobe-ai-palette",
      notes:
        "Already used by FamilyCoordinationTab's AiPaletteSuggestionsPanel. Build reads + writes the same key so accepted palettes round-trip.",
    },
    {
      formDataPath: "family_outfits[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where tab = bridal_party_attire (one row per family member, meta.events[] holds the events they wear it for)",
      notes:
        "v1 collapses (member × event) into a single member row. Per-event differences live in meta.events[] + free-form notes. Future v2 splits into one row per (member × event).",
    },
    {
      formDataPath: "coordination_rules[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where tab = bridal_party_attire AND meta.kind = 'rule'. meta.rule holds the text, meta.is_ai_suggested optional flag.",
    },
  ],

  delivery_documents: [
    {
      formDataPath: "delivery_slots[]",
      store: "workspace_store",
      slice: "items",
      storePath:
        "items where category_id = wardrobe AND tab = delivery AND block_type = delivery_slot",
      notes:
        "Same WorkspaceItems the DocumentsTab CategoryItemList shows. meta.target_date, meta.is_must_flag, meta.status, meta.linked_outfit_ids[].",
    },
    {
      formDataPath: "files[]",
      store: "workspace_store",
      slice: "files",
      storePath:
        "files-store entries with category=wardrobe and tab=delivery; same surface FilesPanel renders.",
    },
    {
      formDataPath: "alterations_buffer",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:wardrobe-build:alterations-buffer",
      notes:
        "Soft warning surfaced when any delivery slot is within buffer_days of the wedding date.",
    },
    {
      formDataPath: "vendor_handoff",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:wardrobe-build:vendor-handoff",
      notes:
        "Toggles trigger one-way writes to Photography & HMUA workspaces. v1 sets the flag; the receiving-side surfacing is out of scope.",
    },
  ],
};

// ── Cross-workspace pulls (Build consumes from elsewhere) ──────────────────

export const CROSS_WORKSPACE_PULLS = [
  {
    consumer: "outfit_planner.outfits[].colour (swatch picker defaults)",
    source:
      "wardrobe vision · palette_by_event[event].swatches[] (the Tab 1 per-event palette)",
    notes:
      "Each outfit cell's colour picker pre-loads with the Vision per-event palette as quick-pick chips.",
  },
  {
    consumer: "outfit_planner.outfits[].inspiration_image_url (suggestions)",
    source:
      "wardrobe vision · per_event_references[event] filtered to role tag",
    notes:
      "Loved Vision references for that event + role surface as inspiration suggestions on each cell.",
  },
  {
    consumer: "family_coordination.family_members[]",
    source: "officiant workspace · family roles (mother of bride, etc.)",
    notes:
      "Pre-fills the family roster from any Officiant family roles already captured to avoid double-entry.",
  },
  {
    consumer: "family_coordination.side_palettes[].bride_anchor_colour",
    source:
      "outfit_planner.outfits where person_id = bride_id and event = X — meta.color",
    notes:
      "AI palette generator pulls the bride's outfit colour per event as the anchor.",
  },
  {
    consumer: "delivery_documents.delivery_slots[] (auto-seed)",
    source:
      "outfit_planner.outfits where status = 'purchased' or 'alterations'",
    notes:
      "Each purchased outfit auto-creates a delivery slot. Bride's wedding outfit auto-flags is_must_flag = true.",
  },
  {
    consumer:
      "delivery_documents.alterations_buffer warning threshold",
    source: "auth_store.user.wedding.event_date",
    notes:
      "Soft warning when any delivery slot date is within buffer_days of the wedding date.",
  },
] as const;

// ── Cross-workspace writes (Build projects out — one-way for v1) ───────────

export const CROSS_WORKSPACE_WRITES = [
  {
    producer: "outfit_planner.outfits[].colour (per-event for bride)",
    target: "hmua workspace · per-event look anchor colours",
    notes:
      "One-way. Drives HMUA's per-event makeup palettes so the look complements the outfit.",
  },
  {
    producer: "delivery_documents.files[] tagged 'fabric_swatch_photo'",
    target: "photography workspace · day-of coordination block (shot list)",
  },
  {
    producer: "delivery_documents.files[] tagged 'outfit_photo'",
    target: "photography workspace · day-of coordination block (shot list)",
  },
  {
    producer: "delivery_documents.files[] tagged 'outfit_photo'",
    target: "hmua workspace · trial pre-visualization",
  },
  {
    producer:
      "delivery_documents.vendor_handoff.photographer_swatches_shared (toggle)",
    target: "photography workspace · day-of coordination block",
    notes:
      "Toggle gates whether the swatches actually surface on the receiving workspace.",
  },
  {
    producer:
      "delivery_documents.vendor_handoff.hmua_outfit_photos_shared (toggle)",
    target: "hmua workspace · trial pre-visualization",
  },
] as const;

// ── Status-enum bridge (OutfitPlannerSession ↔ OutfitPlannerGrid) ──────────
// Build's enum is richer than the grid's. The mapping below is consulted in
// both directions inside OutfitPlannerSession.tsx so an edit in either
// surface lands somewhere reasonable on the other.

import type { OutfitStatus } from "./wardrobe-build";

export const BUILD_STATUS_TO_GRID_STATUS: Record<
  OutfitStatus,
  "shopping" | "ordered" | "fittings" | "ready"
> = {
  not_decided: "shopping",
  shortlisted: "shopping",
  purchased: "ordered",
  alterations: "fittings",
  ready: "ready",
};

/**
 * Reverse mapping: grid → Build. Loses fidelity (shopping collapses both
 * not_decided + shortlisted into not_decided). The session UI keeps its
 * own richer in-memory state when the user edits there directly.
 */
export const GRID_STATUS_TO_BUILD_STATUS: Record<
  "shopping" | "ordered" | "fittings" | "ready",
  OutfitStatus
> = {
  shopping: "not_decided",
  ordered: "purchased",
  fittings: "alterations",
  ready: "ready",
};
