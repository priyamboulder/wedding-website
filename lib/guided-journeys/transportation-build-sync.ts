// ── Transportation Build field-mapping & cross-workspace sync ─────────────
// Single source of truth for where each Build-journey field lives. The
// Transportation workspace stores all of its operational state in the
// generic workspace store as `WorkspaceItem` rows discriminated by
// `tab` + `meta.kind`. Two-way sync rule: edits in either the Build session
// or the full workspace tab must reach the same canonical store key — the
// Build sessions read & write through the same workspace-store filters
// that Tab 1/2/3 use.
//
// This file documents the mapping table for that sync, plus the cross-
// workspace pulls (Travel & Accommodations Build, Music, Guests) and the
// cross-workspace writes (Guests, Photography, Videography).

import type { TransportationBuildSessionKey } from "./transportation-build";

export type TransportationStoreSlice =
  | "plan_logistics" // Tab 1 — assessment + fleet_vehicle items
  | "baraat" // Tab 2 — plan + participant items
  | "shuttle_transport" // Tab 3 — shuttle / airport_pickup / vip_move items
  | "day_of"; // Tab 5 — schedule_slot items (auto-derived)

export interface TransportationFieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Slice (workspace tab) holding the canonical value. */
  slice: TransportationStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const TRANSPORTATION_BUILD_FIELD_MAPPING: Record<
  TransportationBuildSessionKey,
  TransportationFieldMapping[]
> = {
  baraat_walkthrough: [
    {
      formDataPath: "baraat_happening",
      slice: "plan_logistics",
      storePath: "assessment.meta.baraat_happening",
      notes:
        "Initial value pulled from Vision baraat_intent.happening; couples can override here.",
    },
    {
      formDataPath: "route",
      slice: "baraat",
      storePath: "plan.meta.{start_point,end_point,route_description,start_time,end_time,duration}",
      notes: "Tab 2 'Your groom's arrival' section.",
    },
    {
      formDataPath: "participants[]",
      slice: "baraat",
      storePath: "items where block_type='baraat_slot' AND meta.kind='participant'",
      notes:
        "Tab 2 'Participants' checklist. Pre-seeds the 4 standard rows on first hydration.",
    },
    {
      formDataPath: "vehicle",
      slice: "baraat",
      storePath: "plan.meta.{vehicle_type,horse_vendor,horse_arrival_time,...}",
      notes: "Tab 2 'Horse / vehicle' section.",
    },
    {
      formDataPath: "vehicle.practice_session_scheduled",
      slice: "baraat",
      storePath: "plan.meta.practice_noted",
      notes:
        "Date picker only surfaces when vehicle.type ∈ {horse, elephant}.",
    },
    {
      formDataPath: "road_venue",
      slice: "baraat",
      storePath: "plan.meta.{venue_allows,road_closure,police_escort,noise_permit,venue_coord_note}",
      notes:
        "Tab 2 'Road & venue coordination'. permit_application_deadline auto-calculates from event date − 60 days.",
    },
    {
      formDataPath: "music",
      slice: "baraat",
      storePath: "plan.meta.{dhol_start,dhol_end,dj_handoff_point,bluetooth_backup}",
    },
    {
      formDataPath: "timing_coordination",
      slice: "baraat",
      storePath: "plan.meta.{bride_ready_by,photog_at_start,videog_at_entrance}",
    },
  ],

  guest_movement_math: [
    {
      formDataPath: "shuttle_runs[]",
      slice: "shuttle_transport",
      storePath:
        "items where block_type='shuttle' AND (meta.kind ?? 'shuttle')='shuttle'",
      notes:
        "Tab 3 'Hotel ↔ venue shuttles' table. Pre-seeds from Vision guest_shuttle_intent.needed.",
    },
    {
      formDataPath: "airport_pickups[]",
      slice: "shuttle_transport",
      storePath:
        "items where block_type='shuttle' AND meta.kind='airport_pickup'",
      notes:
        "Pre-seeds from Travel & Accommodations Build · guest_travel_tracker.",
    },
    {
      formDataPath: "auto_group_pickups",
      slice: "shuttle_transport",
      storePath: "(no canonical store field — journey-only meta)",
      notes:
        "Toggle drives clustering via lib/calculators/arrival-clusters.ts.",
    },
    {
      formDataPath: "vip_moves[]",
      slice: "shuttle_transport",
      storePath: "items where block_type='vip_move'",
      notes: "Tab 3 'VIP & family moves' table.",
    },
    {
      formDataPath: "accessibility",
      slice: "plan_logistics",
      storePath:
        "assessment.meta.{mobility_transport,mobility_transport_count}",
    },
    {
      formDataPath: "post_event_return",
      slice: "plan_logistics",
      storePath: "assessment.meta.post_event_shuttle",
      notes:
        "Soft warning when last_shuttle_time < reception_end + 30 min.",
    },
  ],

  fleet_roster: [
    {
      formDataPath: "fleet[]",
      slice: "plan_logistics",
      storePath: "items where block_type='fleet_vehicle'",
      notes:
        "Tab 1 'Family & couple fleet' table. Pre-seeds 3 standard rows (bridal car, baraat vehicle, getaway car) conditional on Vision flags.",
    },
    {
      formDataPath: "vendor_parking",
      slice: "plan_logistics",
      storePath: "assessment.meta.{vendor_parking,vendor_parking_list}",
      notes:
        "Pre-seeds vendors_needing_parking[] from Vision vendor_transport_flags.",
    },
    {
      formDataPath: "driver_assignments[]",
      slice: "day_of",
      storePath:
        "items where block_type='schedule_slot' (one row per shift)",
      notes:
        "Driver assignments feed Tab 5 Day-of Route Plan rows (one row per shift).",
    },
  ],
};

// ── Cross-workspace pulls ─────────────────────────────────────────────────
// Reads we accept from other workspaces. These are pre-fill helpers — the
// Build session never writes back to these external sources.

export const CROSS_WORKSPACE_PULLS: ReadonlyArray<{
  targetField: string;
  sourceWorkspace: string;
  sourcePath: string;
  notes: string;
}> = [
  {
    targetField: "baraat_walkthrough.road_venue.permit_application_deadline",
    sourceWorkspace: "wedding",
    sourcePath: "weddingDate",
    notes:
      "Defaults to wedding date − 60 days (DEFAULT_PERMIT_LEAD_DAYS). See lib/calculators/permit-deadlines.ts.",
  },
  {
    targetField: "guest_movement_math.airport_pickups[]",
    sourceWorkspace: "travel",
    sourcePath:
      "guest_travel_tracker.guests[] (Travel & Accommodations Build · Session 2)",
    notes:
      "Each guest with arrival_date + arrival_time pre-populates an airport_pickup entry.",
  },
  {
    targetField: "guest_movement_math.airport_pickups[].guest_label",
    sourceWorkspace: "guests",
    sourcePath: "guest_list[].name (autocomplete)",
    notes: "Guest list provides autocomplete for the guest_label field.",
  },
  {
    targetField: "guest_movement_math.shuttle_runs[].route",
    sourceWorkspace: "travel",
    sourcePath:
      "block_setup.blocks[].hotel_name + venue (Travel & Accommodations Vision)",
    notes:
      "Default shuttle routes seed as 'Marriott → venue' from the contracted hotel block name.",
  },
  {
    targetField: "guest_movement_math.shuttle_runs[].depart_time",
    sourceWorkspace: "wedding",
    sourcePath: "events[].start_time",
    notes:
      "Pre-suggest 15–30 min before event start; couples can adjust.",
  },
  {
    targetField: "baraat_walkthrough.participants[] (dhol entry)",
    sourceWorkspace: "music",
    sourcePath: "vendors[] where category='dhol'",
    notes:
      "Pre-fills the dhol_players label with the contracted vendor name and player count.",
  },
];

// ── Cross-workspace writes (one-way for v1) ───────────────────────────────

export const CROSS_WORKSPACE_WRITES: ReadonlyArray<{
  sourceField: string;
  targetWorkspace: string;
  targetPath: string;
  notes: string;
}> = [
  {
    sourceField: "guest_movement_math.airport_pickups[]",
    targetWorkspace: "guests",
    targetPath: "guest_list[].travel_tracking.pickup_assigned",
    notes:
      "Each airport_pickup entry appears on the matching guest's record as a travel-tracking note.",
  },
  {
    sourceField:
      "guest_movement_math.vip_moves[] involving photographer/videographer",
    targetWorkspace: "photography",
    targetPath: "schedule_anchors[].vip_move_ref",
    notes:
      "Photographer schedule anchors flow to Photography workspace as ready-by anchors.",
  },
  {
    sourceField:
      "guest_movement_math.vip_moves[] involving photographer/videographer",
    targetWorkspace: "videography",
    targetPath: "schedule_anchors[].vip_move_ref",
    notes: "Same as above for the videography schedule.",
  },
  {
    sourceField: "baraat_walkthrough.timing_coordination.photographer_at_start",
    targetWorkspace: "photography",
    targetPath: "ready_by_anchors.baraat_start",
    notes: "Locks the photographer ready-by clock to the baraat start.",
  },
  {
    sourceField: "baraat_walkthrough.timing_coordination.videographer_at_entrance",
    targetWorkspace: "videography",
    targetPath: "ready_by_anchors.baraat_entrance",
    notes: "Locks the videographer position to the baraat entrance arrival.",
  },
];
