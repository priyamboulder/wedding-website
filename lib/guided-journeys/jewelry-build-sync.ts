// ── Jewelry Build field-mapping & cross-workspace sync ────────────────────
// Single source of truth for where each Build-journey field lives, both
// inside the journey form_data blob and in the underlying jewelry workspace
// store. Documents the cross-workspace pulls (Wardrobe, Officiant, etc.)
// and the cross-workspace writes (paired pieces flowing back to Wardrobe,
// shot-list metadata flowing to Photography).
//
// Two-way sync rule: edits in either the Build session or the full
// workspace tab must reach the same canonical store key — see the
// jewelry-couple-workspace state for that store. The field-mapping table
// below documents which key holds what.

import type { JewelryBuildSessionKey } from "./jewelry-build";

export type JewelryStoreSlice =
  | "bridalPieces"
  | "groomPieces"
  | "heirlooms"
  | "fittings"
  | "custodyChain"
  | "insurance"
  | "journeyMeta";

export interface JewelryFieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Slice that holds the canonical value. */
  slice: JewelryStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const JEWELRY_BUILD_FIELD_MAPPING: Record<
  JewelryBuildSessionKey,
  JewelryFieldMapping[]
> = {
  bridal_inventory: [
    {
      formDataPath: "pieces[]",
      slice: "bridalPieces",
      storePath: "bridalPieces[]",
      notes: "Tab 3 (Bridal Jewelry) renders the same array.",
    },
    {
      formDataPath: "pieces[].status",
      slice: "bridalPieces",
      storePath: "bridalPieces[].status",
      notes: "Lifecycle: wishlist → sourcing → ordered → received.",
    },
    {
      formDataPath: "pieces[].events_worn_at[]",
      slice: "bridalPieces",
      storePath: "bridalPieces[].events_worn_at[]",
    },
    {
      formDataPath: "pieces[].events_worn_at[].paired_outfit_id",
      slice: "bridalPieces",
      storePath: "bridalPieces[].events_worn_at[].paired_outfit_id",
      notes:
        "Refs Wardrobe workspace outfit ids (Wardrobe Build Session 1).",
    },
  ],

  groom_inventory: [
    {
      formDataPath: "pieces[]",
      slice: "groomPieces",
      storePath: "groomPieces[]",
      notes: "Tab 4 (Groom's Jewelry) renders the same array.",
    },
    {
      formDataPath: "pieces[].turban_placement",
      slice: "groomPieces",
      storePath: "groomPieces[].turban_placement",
      notes: "Surfaced only when piece_type ∈ {kalgi, safa_brooch, turban_chain}.",
    },
    {
      formDataPath: "pieces[].events_worn_at[]",
      slice: "groomPieces",
      storePath: "groomPieces[].events_worn_at[]",
    },
  ],

  family_heirlooms: [
    {
      formDataPath: "heirlooms[]",
      slice: "heirlooms",
      storePath: "heirlooms[]",
      notes: "Tab 5 (Family Heirlooms) renders the same array.",
    },
    {
      formDataPath: "heirlooms[].privacy_level",
      slice: "heirlooms",
      storePath: "heirlooms[].privacy_level",
      notes:
        "Drives visibility in vendor-facing exports — see jewelry-build-privacy.ts.",
    },
    {
      formDataPath: "heirlooms[].is_confirmed_with_lender",
      slice: "heirlooms",
      storePath: "heirlooms[].is_confirmed_with_lender",
      notes: "Soft-style display when false; hidden from couple-facing exports.",
    },
    {
      formDataPath: "heirlooms[].flux_note",
      slice: "heirlooms",
      storePath: "heirlooms[].flux_note",
      notes: "Always planner-only regardless of privacy_level.",
    },
    {
      formDataPath: "cross_side_dynamics",
      slice: "journeyMeta",
      storePath: "heirloom_cross_side_dynamics",
      notes: "Always planner-only.",
    },
  ],

  fittings_custody: [
    {
      formDataPath: "fittings[]",
      slice: "fittings",
      storePath: "fittings[]",
      notes: "Tab 6 (Fittings & Coordination) renders the same array.",
    },
    {
      formDataPath: "custody_chain.overnight_storage",
      slice: "custodyChain",
      storePath: "overnight_storage",
    },
    {
      formDataPath: "custody_chain.per_event_custody[]",
      slice: "custodyChain",
      storePath: "per_event_custody[]",
      notes:
        "Pre-built from bridal_inventory.events_worn_at + groom_inventory.events_worn_at.",
    },
    {
      formDataPath: "custody_chain.special_handoffs[]",
      slice: "custodyChain",
      storePath: "special_handoffs[]",
      notes: "Auto-suggests turban pieces, mangalsutra, ceremonial mala.",
    },
    {
      formDataPath: "insurance",
      slice: "insurance",
      storePath: "*",
    },
    {
      formDataPath: "insurance.appraisals_needed_count",
      slice: "insurance",
      storePath: "appraisals_needed_count",
      notes:
        "Computed across bridal_inventory + family_heirlooms entries with needs_appraisal: true.",
    },
  ],
};

// ── Cross-workspace pulls ────────────────────────────────────────────────
// Reads we accept from other workspaces. These are pre-fill helpers — the
// Build session never writes back to these external sources.

export const CROSS_WORKSPACE_PULLS: Array<{
  targetField: string;
  sourceWorkspace: string;
  sourcePath: string;
  notes: string;
}> = [
  {
    targetField: "bridal_inventory.pieces[].events_worn_at[].paired_outfit_id",
    sourceWorkspace: "wardrobe",
    sourcePath: "outfits[].id",
    notes:
      "Wardrobe Build Session 1 produces per-event outfit ids. Pull as autocomplete options.",
  },
  {
    targetField: "groom_inventory.pieces[].events_worn_at[].paired_outfit_id",
    sourceWorkspace: "wardrobe",
    sourcePath: "outfits[] (groom)",
    notes: "Same as bridal but filtered to groom outfits.",
  },
  {
    targetField:
      "bridal_inventory.pieces[].events_worn_at[].pairing_note (default suggestions)",
    sourceWorkspace: "wardrobe",
    sourcePath: "outfits[].inspiration_image_url",
    notes:
      "Suggest the inspiration image as a visual reference inline with the pairing note.",
  },
  {
    targetField: "fittings_custody.insurance.appraisal_deadline",
    sourceWorkspace: "wedding",
    sourcePath: "weddingDate",
    notes:
      "Defaults to wedding date − 60 days (APPRAISAL_DEADLINE_DAYS_BEFORE_WEDDING).",
  },
  {
    targetField: "family_heirlooms.heirlooms[].lender (autocomplete)",
    sourceWorkspace: "officiant",
    sourcePath: "family_roles[]",
    notes:
      "Suggest family-role names as lender autocomplete entries (Nani, Mami, MIL, etc.).",
  },
  {
    targetField: "family_heirlooms.heirlooms[].lender (autocomplete)",
    sourceWorkspace: "guests",
    sourcePath: "guest_list[].name",
    notes: "Guest list relationships also feed lender autocomplete.",
  },
];

// ── Cross-workspace writes (one-way, v1) ─────────────────────────────────

export const CROSS_WORKSPACE_WRITES: Array<{
  sourceField: string;
  targetWorkspace: string;
  targetPath: string;
  notes: string;
}> = [
  {
    sourceField: "bridal_inventory.pieces[]",
    targetWorkspace: "wardrobe",
    targetPath:
      "outfits[].paired_jewelry_refs[] (per matched paired_outfit_id)",
    notes:
      "Each bridal piece worn at an event whose paired_outfit_id matches a Wardrobe outfit appears as a paired-jewelry reference on that outfit.",
  },
  {
    sourceField: "groom_inventory.pieces[]",
    targetWorkspace: "wardrobe",
    targetPath:
      "outfits[].paired_jewelry_refs[] (per matched paired_outfit_id, groom outfits)",
    notes: "Same as bridal but on the groom side.",
  },
  {
    sourceField: "groom_inventory.pieces[] (kalgi, safa_brooch)",
    targetWorkspace: "photography",
    targetPath: "shot_list_metadata.turban_pieces[]",
    notes:
      "Turban-mounted pieces flow to Photography as shot-list metadata so the photographer knows when they're being placed.",
  },
  {
    sourceField: "bridal_inventory.pieces[piece_type=mangalsutra]",
    targetWorkspace: "photography",
    targetPath: "shot_list_metadata.mangalsutra_moment",
    notes: "Mangalsutra ceremony beat is a non-negotiable shot.",
  },
  {
    sourceField: "bridal_inventory.pieces[].events_worn_at[].pairing_note",
    targetWorkspace: "hmua",
    targetPath: "look_anchors[].jewelry_pairing_note",
    notes: "Stylist-relevant pairing notes flow to HMUA workspace as look anchors.",
  },
];
