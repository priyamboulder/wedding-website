// ── Travel & Accommodations Build · field-mapping table ───────────────────
// Single source of truth for where each Build-journey field lives in the
// underlying stores. The session UIs read & write through these stores
// directly, which gives automatic two-way sync between the guided journey
// and Tabs 2 (Room Block Manager) and 3 (Guest Travel Hub) of the full
// Travel & Accommodations workspace.
//
// This file is documentation more than runtime code — it exists so that
// when fields change in either the Build schema OR the full workspace,
// you have a single map to update / verify.

import type { TravelBuildSessionKey } from "./travel-accommodations-build";

export interface FieldMapping {
  /** Logical path inside the journey form_data for a given session. */
  formDataPath: string;
  /** Which underlying store holds the canonical value. */
  store:
    | "travel_store"
    | "guests_store"
    | "auth_store"
    | "vendors_store"
    | "local_storage";
  /** Slice / sub-store inside that store. */
  slice: string;
  /** Slice-relative pointer to the field. */
  storePath: string;
  /** Read-only / write-only / both. */
  direction: "read" | "write" | "both";
  /** Human-readable note. */
  notes?: string;
}

export const FIELD_MAPPING: Record<TravelBuildSessionKey, FieldMapping[]> = {
  block_setup: [
    {
      formDataPath: "hotel_blocks[].id",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.id",
      direction: "both",
      notes:
        "Stable per block. Build session uses the same id Tab 2 uses so adds and edits round-trip without copying.",
    },
    {
      formDataPath: "hotel_blocks[].is_primary",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.role === 'primary'",
      direction: "both",
      notes:
        "Build's boolean projects from Tab 2's role enum. Setting is_primary=true sets role='primary'; primary=false maps to role='overflow' unless courtesy was explicitly chosen.",
    },
    {
      formDataPath: "hotel_blocks[].hotel_name",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.name",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].rooms_blocked",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.rooms_blocked",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].rooms_booked",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.rooms_booked",
      direction: "both",
      notes:
        "Tab 3's booking_status === 'booked' rolls up into rooms_booked when assigned_to_block_id matches. Manual override allowed in either surface.",
    },
    {
      formDataPath: "hotel_blocks[].negotiated_rate_per_night",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.group_rate (parsed numeric)",
      direction: "both",
      notes:
        "Tab 2 stores the rate as a freeform string ('$169/night'); Build extracts the numeric portion and writes back '$<rate>/night' on save.",
    },
    {
      formDataPath: "hotel_blocks[].cutoff_date",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.cutoff_date",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].attrition_floor_count",
      store: "travel_store",
      slice: "blocks",
      storePath: "ceil(rooms_blocked * attrition_percent / 100)",
      direction: "both",
      notes:
        "Tab 2 stores attrition as a percentage; Build derives the count for display and updates the percentage when the count is edited (count / rooms_blocked × 100, rounded).",
    },
    {
      formDataPath: "hotel_blocks[].attrition_floor_percentage",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.attrition_percent",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].booking_link",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.booking_link",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].rate_includes_breakfast",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.amenities[] (label match)",
      direction: "both",
      notes:
        "Round-tripped through Tab 2's amenities list — a matching 'Breakfast included' amenity with status='negotiated' represents true.",
    },
    {
      formDataPath: "hotel_blocks[].rate_includes_parking",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.amenities[] (label match)",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].resort_fee_waived",
      store: "travel_store",
      slice: "blocks",
      storePath: "TravelRoomBlock.amenities[] (label match)",
      direction: "both",
    },
    {
      formDataPath: "hotel_blocks[].suites_assigned_to[]",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:travel-build:suite-assignments",
      direction: "both",
      notes:
        "Build-only field. Tab 2 doesn't model suite assignments today; preserved per-block in localStorage keyed by block id.",
    },
    {
      formDataPath: "hotel_blocks[].risk_flags[]",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:travel-build:risk-flags",
      direction: "write",
      notes:
        "Build computes these from the attrition-risk calculator and surfaces them in the session header. Tab 2 reads them via the same calculator — local_storage is the cache, calculator is the source of truth.",
    },
  ],

  guest_travel_tracker: [
    {
      formDataPath: "guest_travel_entries[].id",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.id",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].guest_name",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.guest_name",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].travel_party_size",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.party_size",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].departure_city",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.from_city",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].arrival_date",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.arrives_date",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].arrival_time",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.arrives_time",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].flight_info",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.flight",
      direction: "both",
    },
    {
      formDataPath: "guest_travel_entries[].assigned_to_block_id",
      store: "travel_store",
      slice: "guests",
      storePath:
        "GuestTravelEntry.hotel_name (matched by name to block.id)",
      direction: "both",
      notes:
        "Tab 3 stores hotel as a freeform string. Build session resolves hotel_name → block.id and back, falling back to the freeform string when no block matches.",
    },
    {
      formDataPath: "guest_travel_entries[].booking_status",
      store: "travel_store",
      slice: "guests",
      storePath: "GuestTravelEntry.status",
      direction: "both",
      notes:
        "Build's enum is richer (5 values) than Tab 3's (3 values: booked / not_booked / elsewhere). Mapping: not_booked|pending_invitation|booking_link_sent → 'not_booked'; booked → 'booked'; cancelled → 'elsewhere'.",
    },
    {
      formDataPath: "guest_travel_entries[].is_international",
      store: "travel_store",
      slice: "guests",
      storePath: "computed from departure_country (auto)",
      direction: "write",
      notes:
        "Auto-computed by isInternationalGuest(). Defaults to home country = USA; override via wedding profile when present.",
    },
    {
      formDataPath: "arrival_clusters[]",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:travel-build:arrival-clusters",
      direction: "both",
      notes:
        "Computed by buildArrivalClusters() from guest_travel_entries[]. Cached in localStorage so Tab 3 + Transportation Build can read without re-deriving on every render. Cache invalidated whenever any entry's arrival_date or arrival_time changes.",
    },
    {
      formDataPath: "booking_link_dispatch.sent_to_count",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:travel-build:dispatch-counters",
      direction: "both",
    },
    {
      formDataPath: "booking_link_dispatch.last_send_date",
      store: "local_storage",
      slice: "build_meta",
      storePath: "ananya:travel-build:dispatch-counters",
      direction: "both",
    },
  ],
};

// ── Cross-workspace writes (one-way for v1) ────────────────────────────────
// Documented here so future work has a single place to find the contracts.

export const CROSS_WORKSPACE_WRITES = {
  to_transportation: {
    arrival_clusters: {
      target: "Transportation Build · Session 2 · airport_pickups[]",
      shape: "clustersToAirportPickups(clusters) — one cluster ⇒ one pickup",
      direction: "one_way",
    },
    hotel_block_origins: {
      target: "Transportation Build · Session 2 · shuttle_runs[]",
      shape:
        "Each block.hotel_name becomes a default shuttle origin ('<hotel> → venue').",
      direction: "one_way",
    },
  },
  to_welcome_experience: {
    guest_hotel_assignments: {
      target: "Travel & Accommodations · Tab 5 (Welcome Experience)",
      shape:
        "guest_travel_entries[] with assigned_to_block_id is consumed for hospitality coordination.",
      direction: "one_way",
    },
  },
  to_checklist: {
    booking_reminder_task: {
      target: "Checklist suggestions",
      shape:
        "When booking_status === 'not_booked' count > threshold, suggest a 'Send booking reminder' task.",
      direction: "one_way",
    },
  },
} as const;
