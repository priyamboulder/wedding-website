// ── Officiant Build field-mapping table ─────────────────────────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying pandit-store. The session UIs already read & write through
// this store directly, which gives automatic two-way sync between the
// guided journey and Tabs 1 §5 (rituals), 4 (Family Roles), 5 (Samagri),
// and 6 (Ceremony Logistics).
//
// This file is documentation more than runtime code — it exists so that
// when fields change in either the Build schema OR the full workspace,
// you have a single map to update / verify.

import type { OfficiantBuildSessionKey } from "./officiant-build";

export type PanditStoreSlice =
  | "rituals"
  | "additions"
  | "roles"
  | "samagri"
  | "logistics"
  | "brief"
  | "journeyMeta"; // small metadata blob added for the Build journey

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** pandit-store slice that holds the canonical value. */
  slice: PanditStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<OfficiantBuildSessionKey, FieldMapping[]> = {
  // ── Session 1 · Rituals walkthrough ─────────────────────────────────────
  rituals_walkthrough: [
    {
      formDataPath: "rituals[].id",
      slice: "rituals",
      storePath: "rituals[].id",
    },
    {
      formDataPath: "rituals[].name_english",
      slice: "rituals",
      storePath: "rituals[].name_english",
    },
    {
      formDataPath: "rituals[].name_devanagari",
      slice: "rituals",
      storePath: "rituals[].name_sanskrit",
    },
    {
      formDataPath: "rituals[].description",
      slice: "rituals",
      storePath: "rituals[].short_description",
    },
    {
      formDataPath: "rituals[].estimated_minutes",
      slice: "rituals",
      storePath: "rituals[].included_duration_min",
    },
    {
      formDataPath: "rituals[].decision",
      slice: "rituals",
      storePath: "rituals[].inclusion",
      notes:
        "yes ↔ including, discuss ↔ discuss_with_pandit, no ↔ skipping",
    },
    {
      formDataPath: "rituals[].couple_notes",
      slice: "rituals",
      storePath: "rituals[].couple_notes",
    },
    {
      formDataPath: "personal_additions[]",
      slice: "additions",
      storePath: "additions[].body",
      notes:
        "Each addition is a free-text body. placement_hint is appended in parens.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "ritualsWalkthroughComputed",
      notes:
        "Recomputed on every save from rituals[]. Cached for sticky-footer display.",
    },
  ],

  // ── Session 2 · Family roles ────────────────────────────────────────────
  family_roles: [
    {
      formDataPath: "roles[].id",
      slice: "roles",
      storePath: "roles[].id",
    },
    {
      formDataPath: "roles[].title",
      slice: "roles",
      storePath: "roles[].role_name",
    },
    {
      formDataPath: "roles[].ritual_id",
      slice: "roles",
      storePath: "roles[].linked_ritual_id",
    },
    {
      formDataPath: "roles[].side",
      slice: "roles",
      storePath: "roles[].side",
      notes:
        "bride ↔ brides, groom ↔ grooms, shared ↔ shared",
    },
    {
      formDataPath: "roles[].assigned_to",
      slice: "roles",
      storePath: "[primary_name, backup_name].filter(non-empty)",
      notes:
        "Builds the assigned_to[] from primary + backup. Reverse: first item → primary_name, second → backup_name.",
    },
    {
      formDataPath: "roles[].relationship",
      slice: "roles",
      storePath: "roles[].primary_relationship",
    },
    {
      formDataPath: "roles[].needs_practice",
      slice: "roles",
      storePath: "roles[].practice_needed",
    },
    {
      formDataPath: "roles[].sensitivity_note",
      slice: "roles",
      storePath: "roles[].planner_private_note",
      notes:
        "Planner-only field. Surface only when a planner has been invited to the workspace.",
    },
    {
      formDataPath: "roles[].is_private",
      slice: "journeyMeta",
      storePath: "rolePrivacyById[role.id]",
      notes:
        "When true, hide from couple-shared exports. No corresponding store field on roles[].",
    },
    {
      formDataPath: "roles[].is_skipped_ritual",
      slice: "rituals",
      storePath: "rituals[linked_ritual_id].inclusion === 'no'",
      notes: "Computed — not stored on the role itself.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "familyRolesComputed",
    },
  ],

  // ── Session 3 · Samagri review ──────────────────────────────────────────
  samagri_review: [
    {
      formDataPath: "items[].id",
      slice: "samagri",
      storePath: "samagri[].id",
    },
    {
      formDataPath: "items[].name_english",
      slice: "samagri",
      storePath: "samagri[].name_english",
    },
    {
      formDataPath: "items[].name_devanagari",
      slice: "samagri",
      storePath: "samagri[].name_local",
    },
    {
      formDataPath: "items[].quantity",
      slice: "samagri",
      storePath: "samagri[].quantity",
    },
    {
      formDataPath: "items[].ritual_id",
      slice: "samagri",
      storePath: "samagri[].used_for_ritual_id",
    },
    {
      formDataPath: "items[].category",
      slice: "samagri",
      storePath: "samagri[].category",
      notes:
        "personal ↔ personal_items; general_setup/floral/food_grain/fabric/metal_vessels/other map directly.",
    },
    {
      formDataPath: "items[].source",
      slice: "samagri",
      storePath: "samagri[].source",
      notes:
        "indian_grocery_store ↔ indian_grocery, officiant_provides ↔ pandit_provides, venue ↔ venue_provides, florist/tbd ↔ other.",
    },
    {
      formDataPath: "items[].status",
      slice: "samagri",
      storePath: "samagri[].status",
    },
    {
      formDataPath: "items[].notes",
      slice: "samagri",
      storePath: "samagri[].notes",
    },
    {
      formDataPath: "items[].is_fresh",
      slice: "journeyMeta",
      storePath: "samagriFreshFlagsById[item.id]",
      notes: "No fresh-flag column on samagri rows yet — ride on journeyMeta.",
    },
    {
      formDataPath: "procurement_cadence.*",
      slice: "journeyMeta",
      storePath: "procurementCadence",
      notes:
        "Free-text per checkpoint. Defaults seeded from DEFAULT_PROCUREMENT_CADENCE.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "samagriReviewComputed",
    },
  ],

  // ── Session 4 · Ceremony logistics ──────────────────────────────────────
  ceremony_logistics: [
    {
      formDataPath: "mandap.couple_faces",
      slice: "logistics",
      storePath: "mandap_orientation",
    },
    {
      formDataPath: "mandap.dimensions",
      slice: "logistics",
      storePath: "mandap_dimensions",
    },
    {
      formDataPath: "mandap.havan_kund_placement",
      slice: "logistics",
      storePath: "havan_kund_placement",
    },
    {
      formDataPath: "mandap.fire_permit_required",
      slice: "logistics",
      storePath: "fire_permit_needed",
    },
    {
      formDataPath: "mandap.fire_permit_status",
      slice: "logistics",
      storePath: "fire_permit_status",
      notes:
        "free-text on the store; we discretize into pending|confirmed|not_required|tbd in the journey.",
    },
    {
      formDataPath: "audio.officiant_mic_type",
      slice: "logistics",
      storePath: "pandit_mic_type",
      notes: "podium ↔ handheld for the journey UI.",
    },
    {
      formDataPath: "audio.amplify_mantras",
      slice: "logistics",
      storePath: "amplify_mantras",
    },
    {
      formDataPath: "audio.background_instrumental",
      slice: "logistics",
      storePath: "background_instrumental",
    },
    {
      formDataPath: "audio.instrumental_notes",
      slice: "logistics",
      storePath: "background_instrumental_note",
    },
    {
      formDataPath: "audio.sound_check_time",
      slice: "logistics",
      storePath: "sound_check_time",
    },
    {
      formDataPath: "guest_experience.shoe_removal_plan",
      slice: "logistics",
      storePath: "shoe_removal_plan",
    },
    {
      formDataPath: "guest_experience.water_accessible_near_seating",
      slice: "logistics",
      storePath: "water_available",
    },
    {
      formDataPath: "guest_experience.unplugged_ceremony",
      slice: "logistics",
      storePath: "unplugged_ceremony",
    },
    {
      formDataPath: "guest_experience.childrens_quiet_area",
      slice: "logistics",
      storePath: "childrens_area",
    },
    {
      formDataPath: "guest_experience.childrens_area_note",
      slice: "logistics",
      storePath: "childrens_area_note",
    },
    {
      formDataPath: "guest_experience.weather_considerations",
      slice: "logistics",
      storePath: "weather_considerations",
      notes:
        "Auto-prefilled when Venue's is_outdoor is true. See useOutdoorVenue() in lib/cross-workspace.",
    },
    {
      formDataPath: "vendor_notes.photographer",
      slice: "logistics",
      storePath: "photography_note",
      notes:
        "ONE-WAY mirror: also written into Photography workspace's day-of coordination notes. Two-way sync is out of scope for v1.",
    },
    {
      formDataPath: "vendor_notes.videographer",
      slice: "logistics",
      storePath: "videography_note",
    },
    {
      formDataPath: "vendor_notes.dj_music",
      slice: "logistics",
      storePath: "dj_note",
    },
    {
      formDataPath: "vendor_notes.decor",
      slice: "logistics",
      storePath: "decor_note",
    },
  ],
};
