// ── Mehendi Logistics field-mapping table ────────────────────────────────
// Single source of truth for where each Logistics-journey field lives in
// the underlying mehndi-store. The session UIs already read & write through
// this store directly, which gives us automatic two-way sync between the
// guided journey and Tabs 2/3/4.
//
// This file is documentation more than runtime code — it exists so that
// when fields change in either the Logistics schema OR the full workspace,
// you have a single map to update / verify.

import type { LogisticsSessionKey } from "./mehendi-logistics";

export type MehndiStoreSlice =
  | "setups"
  | "vipGuests"
  | "detailedTierGuests"
  | "guestSlots"
  | "contractChecklist"
  | "scheduleItems"
  | "brideCare"
  | "logisticsChecks"
  | "journeyMeta"; // small metadata blob added for the Logistics journey

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** mehndi-store slice that holds the canonical value. */
  slice: MehndiStoreSlice;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<LogisticsSessionKey, FieldMapping[]> = {
  tiers_and_capacity: [
    {
      formDataPath: "tiers[]",
      slice: "setups",
      storePath: "tier_capacity{quick,classic,detailed}",
      notes:
        "Three tiers are baked in (quick / classic / detailed). Editing spot counts here writes to setup.tier_capacity.",
    },
    {
      formDataPath: "tiers[].is_default",
      slice: "setups",
      storePath: "avg_tier",
      notes: "The single tier flagged as default = setup.avg_tier.",
    },
    {
      formDataPath: "artist_count",
      slice: "setups",
      storePath: "stations",
    },
    {
      formDataPath: "hours_on_site",
      slice: "setups",
      storePath: "event_duration_hours",
    },
    {
      formDataPath: "expected_guests",
      slice: "setups",
      storePath: "expected_guest_count",
    },
    {
      formDataPath: "distribution_method",
      slice: "setups",
      storePath: "scheduling_mode",
      notes:
        "priority_queue ↔ priority_queue, appointment_slots ↔ appointments, hybrid ↔ hybrid",
    },
    {
      formDataPath: "vip_list[]",
      slice: "vipGuests",
      storePath: "vipGuests filtered by category_id",
    },
    {
      formDataPath: "detailed_tier_names[]",
      slice: "detailedTierGuests",
      storePath: "detailedTierGuests filtered by category_id",
    },
    {
      formDataPath: "signup_enabled",
      slice: "setups",
      storePath: "signup_open",
    },
    {
      formDataPath: "signup_event_date",
      slice: "setups",
      storePath: "event_date",
    },
    {
      formDataPath: "signup_start_time",
      slice: "setups",
      storePath: "event_start_time",
    },
  ],

  artist_contract: [
    {
      formDataPath: "contract_items.<id>.checked",
      slice: "contractChecklist",
      storePath: "contractChecklist[item_id].checked",
      notes:
        "ids: artists_hours, bride_complexity, guest_coverage, travel_stay, natural_henna, touch_up, cancellation",
    },
    {
      formDataPath: "contract_items.<id>.notes",
      slice: "contractChecklist",
      storePath: "contractChecklist[item_id].notes",
    },
    {
      formDataPath: "contract_items.bride_complexity.estimated_hours",
      slice: "journeyMeta",
      storePath: "bridal_complexity_hours",
      notes: "Stored on the journey meta blob — no home in mehndi-store yet.",
    },
    {
      formDataPath: "contract_items.travel_stay.applies",
      slice: "journeyMeta",
      storePath: "travel_stay_applies",
    },
    {
      formDataPath: "contract_items.cancellation.is_outdoor",
      slice: "journeyMeta",
      storePath: "cancellation_is_outdoor",
    },
    {
      formDataPath: "ready_to_send",
      slice: "journeyMeta",
      storePath: "contract_ready_to_send",
    },
  ],

  day_of_flow: [
    {
      formDataPath: "timeline[]",
      slice: "scheduleItems",
      storePath: "scheduleItems filtered by category_id",
    },
    {
      formDataPath: "timeline_loaded_default",
      slice: "journeyMeta",
      storePath: "timeline_loaded_default",
    },
    {
      formDataPath: "bride_care.assigned_to",
      slice: "brideCare",
      storePath: "assignee_name",
    },
    {
      formDataPath: "bride_care.role",
      slice: "brideCare",
      storePath: "assignee_role",
    },
    {
      formDataPath: "bride_care.contact",
      slice: "brideCare",
      storePath: "assignee_contact",
    },
    {
      formDataPath: "bride_care.tasks",
      slice: "brideCare",
      storePath: "tasks",
    },
    {
      formDataPath: "drying_time_estimate_hours",
      slice: "journeyMeta",
      storePath: "drying_time_hours",
    },
    {
      formDataPath: "setup_logistics.seating.confirmed",
      slice: "logisticsChecks",
      storePath: "chairs_confirmed",
    },
    {
      formDataPath: "setup_logistics.seating.type",
      slice: "setups",
      storePath: "seating",
    },
    {
      formDataPath: "setup_logistics.lighting.confirmed",
      slice: "logisticsChecks",
      storePath: "lighting_arranged",
    },
    {
      formDataPath: "setup_logistics.lighting.type",
      slice: "setups",
      storePath: "lighting",
    },
    {
      formDataPath: "setup_logistics.ventilation.confirmed",
      slice: "logisticsChecks",
      storePath: "ventilation_ready",
    },
    {
      formDataPath: "setup_logistics.ventilation.type",
      slice: "setups",
      storePath: "ventilation",
    },
    {
      formDataPath: "setup_logistics.drying_area.confirmed",
      slice: "logisticsChecks",
      storePath: "drying_area_set",
    },
    {
      formDataPath: "setup_logistics.drying_area.description",
      slice: "setups",
      storePath: "drying_plan",
    },
    {
      formDataPath: "entertainment_during_drying",
      slice: "logisticsChecks",
      storePath: "entertainment_plan",
    },
  ],
};
