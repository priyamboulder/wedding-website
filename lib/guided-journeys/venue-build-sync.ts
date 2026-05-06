// ── Venue Build field-mapping table ────────────────────────────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying venue-store. The session UIs (forthcoming) will read & write
// through this store directly, which gives automatic two-way sync between
// the guided journey and the corresponding Venue workspace tabs (Spaces &
// Layout, Rules & Restrictions, Logistics Hub, Contacts & Emergency).
//
// Most fields land on `useVenueStore.logistics` — that single VenueLogistics
// object is the policy backbone broadcast by venue-policy-broadcast.ts.
// Spatial data (spaces, pairings, transitions) lives in dedicated slices.
//
// This file is documentation as much as runtime mapping — it's the one
// place to look when fields change in either the Build schema OR the
// venue store, so they can be reconciled atomically.

import type { VenueBuildSessionKey } from "./venue-build";

// ── Slice identifiers ──────────────────────────────────────────────────────
// String-literal union of the venue-store top-level slices the Build
// journey reads from. `journeyMeta` is reserved for any fields the journey
// needs to persist that don't have a corresponding venue-store column —
// e.g. day-of contacts, which today live as free-form documents.

export type VenueStoreSlice =
  | "spaces"
  | "pairings"
  | "transitions"
  | "logistics"
  | "documents"
  | "journeyMeta";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** venue-store slice that holds the canonical value. */
  slice: VenueStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<VenueBuildSessionKey, FieldMapping[]> = {
  // ── Session 1 · Spaces & layout ─────────────────────────────────────────
  spaces_and_layout: [
    {
      formDataPath: "spaces[]",
      slice: "spaces",
      storePath: "spaces[]",
      notes:
        "Direct projection — VenueSpace is already the canonical shape used by the Spaces & Layout tab.",
    },
    {
      formDataPath: "pairings[]",
      slice: "pairings",
      storePath: "pairings[]",
      notes:
        "SpaceEventPairing maps event_id ↔ space_id. Couples drag-pair on Tab 'Spaces & Flow'; same store reads here.",
    },
    {
      formDataPath: "transitions[]",
      slice: "transitions",
      storePath: "transitions[]",
      notes:
        "Flip / changeover notes per space. responsible field is free-form (vendor name or family role).",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "spacesAndLayoutComputed",
      notes: "Derived counters; recomputed by the session UI on each save.",
    },
  ],

  // ── Session 2 · Rules & restrictions ────────────────────────────────────
  rules_and_restrictions: [
    {
      formDataPath: "restrictions",
      slice: "logistics",
      storePath: "restrictions",
      notes:
        "Free-form string[] of restriction tags. parseRestrictions() in venue-policy-broadcast normalises to RestrictionTag.",
    },
    {
      formDataPath: "music_curfew_indoor",
      slice: "logistics",
      storePath: "music_curfew_indoor",
      notes: "Broadcast → music workspace (curfew check on every slot).",
    },
    {
      formDataPath: "music_curfew_outdoor",
      slice: "logistics",
      storePath: "music_curfew_outdoor",
      notes: "Broadcast → music workspace (outdoor performances only).",
    },
    {
      formDataPath: "event_end_time",
      slice: "logistics",
      storePath: "event_end_time",
      notes:
        "Broadcast → music (hard stop), catering (late-night service), transportation (shuttle return).",
    },
    {
      formDataPath: "fire_ceremony_policy",
      slice: "logistics",
      storePath: "fire_ceremony_policy",
      notes: "Broadcast → décor (havan / agni allowance).",
    },
    {
      formDataPath: "fire_permit_owner",
      slice: "logistics",
      storePath: "fire_permit_owner",
      notes: "Broadcast → checklist (permit ownership task).",
    },
    {
      formDataPath: "wall_attachment_rules",
      slice: "logistics",
      storePath: "wall_attachment_rules",
      notes: "Broadcast → décor (hanging hardware constraints).",
    },
    {
      formDataPath: "wet_weather_backup",
      slice: "logistics",
      storePath: "wet_weather_backup",
      notes:
        "Drives the rain-plan checklist + décor backup spec. Doesn't auto-broadcast.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "rulesAndRestrictionsComputed",
    },
  ],

  // ── Session 3 · Vendor policies ─────────────────────────────────────────
  vendor_policies: [
    {
      formDataPath: "catering_policy",
      slice: "logistics",
      storePath: "catering_policy",
      notes: "Free-form summary; broadcast → catering.",
    },
    {
      formDataPath: "kitchen_access",
      slice: "logistics",
      storePath: "kitchen_access",
      notes:
        "Drives staffing / equipment math when an outside caterer is in scope.",
    },
    {
      formDataPath: "outside_caterer_allowed",
      slice: "logistics",
      storePath: "outside_caterer_allowed",
      notes:
        "Hard gate: when false, catering shortlist filters to in-house only.",
    },
    {
      formDataPath: "preferred_caterer_list",
      slice: "logistics",
      storePath: "preferred_caterer_list",
      notes:
        "Free-text list of names. catering shortlist tags matches as preferred.",
    },
    {
      formDataPath: "alcohol_policy",
      slice: "logistics",
      storePath: "alcohol_policy",
      notes:
        "Drives the bar-program in-scope flag (computed.bar_program_in_scope).",
    },
    {
      formDataPath: "corkage_fee",
      slice: "logistics",
      storePath: "corkage_fee",
    },
    {
      formDataPath: "vendor_access",
      slice: "logistics",
      storePath: "vendor_access",
      notes: "Where vendors check in, badging, escort policies.",
    },
    {
      formDataPath: "vendor_loading_window",
      slice: "logistics",
      storePath: "vendor_loading_window",
      notes:
        "Tighter than vendor_access at some venues — overrides on load-in derivation.",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "vendorPoliciesComputed",
    },
  ],

  // ── Session 4 · Load-in & day-of ────────────────────────────────────────
  load_in_and_day_of: [
    {
      formDataPath: "load_in_window",
      slice: "logistics",
      storePath: "load_in_window",
      notes:
        "Drives decor-load-in-derivation (forthcoming) and music-day-of-derivation.",
    },
    {
      formDataPath: "power_circuits",
      slice: "logistics",
      storePath: "power_circuits",
    },
    {
      formDataPath: "power_notes",
      slice: "logistics",
      storePath: "power_notes",
    },
    {
      formDataPath: "parking_capacity",
      slice: "logistics",
      storePath: "parking_capacity",
      notes:
        "Drives shuttle math: shuttles required when capacity < expected guest car count.",
    },
    {
      formDataPath: "valet",
      slice: "logistics",
      storePath: "valet",
    },
    {
      formDataPath: "shuttle_drop_off",
      slice: "logistics",
      storePath: "shuttle_drop_off",
    },
    {
      formDataPath: "baraat_rules",
      slice: "logistics",
      storePath: "baraat_rules",
      notes:
        "Broadcast → transportation (baraat walkthrough constraints).",
    },
    {
      formDataPath: "room_block_details",
      slice: "logistics",
      storePath: "room_block_details",
      notes: "Often pulled from the contract verbatim.",
    },
    {
      formDataPath: "minimum_night_stay",
      slice: "logistics",
      storePath: "minimum_night_stay",
    },
    {
      formDataPath: "event_insurance_required",
      slice: "logistics",
      storePath: "event_insurance_required",
      notes:
        "Drives lib/calculators/coi-deadline-tracker.ts requirements list.",
    },
    {
      formDataPath: "liquor_liability",
      slice: "logistics",
      storePath: "liquor_liability",
      notes:
        "Specific COI rider when bar service is in scope. Broadcast → catering + checklist.",
    },
    {
      formDataPath: "day_of_contacts[]",
      slice: "journeyMeta",
      storePath: "dayOfContacts",
      notes:
        "Not first-class on venue-store yet — persisted in journeyMeta. When the venue store gains a contacts slice, migrate to it (move-only; no UX change).",
    },
    {
      formDataPath: "computed.*",
      slice: "journeyMeta",
      storePath: "loadInAndDayOfComputed",
    },
  ],
};
