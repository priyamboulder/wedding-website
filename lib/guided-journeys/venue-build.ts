// ── Venue Build journey ─────────────────────────────────────────────────────
// Second guided journey on the Venue workspace. Vision (the 4-session flow
// on Tab 1) covers discovery — feel, must-haves, restrictions wishlist,
// brief. Build is operational and pulls from the booked venue contract:
//
//   1. spaces_and_layout      — per-event spaces from the floorplan, with
//                               transitions / flips between events
//   2. rules_and_restrictions — restrictions tags, fire ceremony policy,
//                               music curfews, event end time
//   3. vendor_policies        — catering rules, alcohol, kitchen access,
//                               preferred caterer list, vendor access
//   4. load_in_and_day_of     — load-in windows, parking, baraat rules,
//                               COI requirements, day-of contacts
//
// Build does NOT generate a closing brief. Output is operational: every
// VenueLogistics field is captured, every space is paired with events,
// transitions are noted, day-of contacts are locked. Section 14 of the
// refinement pass calls this out as the highest-leverage Build journey
// in the platform — every policy entered here cascades through
// `lib/guided-journeys/venue-policy-broadcast.ts` to Catering, Décor,
// Music, Photography, Videography, Transportation, and Checklist.
//
// Field storage strategy: every Build session reads & writes directly
// through `useVenueStore` (the same source of truth Tab 1 + every other
// venue tab uses). This gives free two-way sync. The journey state itself
// only persists session statuses (not_started / in_progress / completed).

import type { CategoryKey } from "@/lib/guided-journey/types";
import type {
  VenueLogistics,
  VenueSpace,
  SpaceEventPairing,
  TransitionNote,
} from "@/types/venue";

export const VENUE_BUILD_JOURNEY_ID = "build";
export const VENUE_BUILD_CATEGORY: CategoryKey = "venue";

export type VenueBuildSessionKey =
  | "spaces_and_layout"
  | "rules_and_restrictions"
  | "vendor_policies"
  | "load_in_and_day_of";

export interface VenueBuildSessionDef {
  key: VenueBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const VENUE_BUILD_SESSIONS: readonly VenueBuildSessionDef[] = [
  {
    key: "spaces_and_layout",
    index: 1,
    title: "Spaces & layout",
    subtitle:
      "Walk through every space at your venue and pair it with the event it hosts.",
    estimatedMinutes: 5,
  },
  {
    key: "rules_and_restrictions",
    index: 2,
    title: "Rules & restrictions",
    subtitle:
      "Curfews, open flame, drones, sparklers — capture every rule once, broadcast everywhere.",
    estimatedMinutes: 4,
  },
  {
    key: "vendor_policies",
    index: 3,
    title: "Vendor policies",
    subtitle:
      "Catering, alcohol, vendor access — what your downstream vendors need to know.",
    estimatedMinutes: 3,
  },
  {
    key: "load_in_and_day_of",
    index: 4,
    title: "Load-in & day-of",
    subtitle:
      "Load-in windows, parking, baraat rules, day-of contacts, COI deadlines.",
    estimatedMinutes: 3,
  },
] as const;

export const VENUE_BUILD_TOTAL_MINUTES = VENUE_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getVenueBuildSession(
  key: VenueBuildSessionKey,
): VenueBuildSessionDef {
  const found = VENUE_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown venue build session: ${key}`);
  }
  return found;
}

// ── Form data shapes ────────────────────────────────────────────────────────
// These describe the projection of useVenueStore slices into each
// session's logical form_data. They double as documentation of the sync
// mapping (see venue-build-sync.ts when it's built). Components read &
// write through useVenueStore directly — these types just constrain the
// session-runtime engine when one exists.

// Session 1 — Spaces & layout. Reads: venue-store `spaces`, `pairings`,
// `transitions`. Most operational space-level data.
export interface SpacesAndLayoutFormData {
  spaces: VenueSpace[];
  pairings: SpaceEventPairing[];
  transitions: TransitionNote[];
  computed?: {
    total_spaces: number;
    paired_events: number;
    unpaired_events: number;
    transitions_count: number;
  };
}

// Session 2 — Rules & restrictions. Reads: a subset of `logistics` plus
// the `restrictions[]` array. Pulled into its own session because it's
// the highest-broadcast set of fields — every restriction here cascades
// to ≥1 downstream workspace.
export interface RulesAndRestrictionsFormData {
  restrictions: VenueLogistics["restrictions"];
  music_curfew_indoor: VenueLogistics["music_curfew_indoor"];
  music_curfew_outdoor: VenueLogistics["music_curfew_outdoor"];
  event_end_time: VenueLogistics["event_end_time"];
  fire_ceremony_policy: VenueLogistics["fire_ceremony_policy"];
  fire_permit_owner: VenueLogistics["fire_permit_owner"];
  wall_attachment_rules: VenueLogistics["wall_attachment_rules"];
  wet_weather_backup: VenueLogistics["wet_weather_backup"];
  computed?: {
    restriction_count: number;
    curfew_set: boolean;
    fire_policy_set: boolean;
  };
}

// Session 3 — Vendor policies. Reads: catering / alcohol / vendor-access
// fields from logistics. Drives Catering Build's shortlist filter and
// every contracted-vendor workspace's COI requirements.
export interface VendorPoliciesFormData {
  catering_policy: VenueLogistics["catering_policy"];
  kitchen_access: VenueLogistics["kitchen_access"];
  outside_caterer_allowed: VenueLogistics["outside_caterer_allowed"];
  preferred_caterer_list: VenueLogistics["preferred_caterer_list"];
  alcohol_policy: VenueLogistics["alcohol_policy"];
  corkage_fee: VenueLogistics["corkage_fee"];
  vendor_access: VenueLogistics["vendor_access"];
  vendor_loading_window: VenueLogistics["vendor_loading_window"];
  computed?: {
    catering_open: boolean; // outside_caterer_allowed === true
    has_preferred_list: boolean;
    bar_program_in_scope: boolean;
  };
}

// Session 4 — Load-in & day-of. Reads: scheduling + parking + insurance
// + baraat fields from logistics. Surfaces the COI deadline tracker
// computed from `lib/calculators/coi-deadline-tracker.ts`.
export interface LoadInAndDayOfFormData {
  load_in_window: VenueLogistics["load_in_window"];
  power_circuits: VenueLogistics["power_circuits"];
  power_notes: VenueLogistics["power_notes"];
  parking_capacity: VenueLogistics["parking_capacity"];
  valet: VenueLogistics["valet"];
  shuttle_drop_off: VenueLogistics["shuttle_drop_off"];
  baraat_rules: VenueLogistics["baraat_rules"];
  room_block_details: VenueLogistics["room_block_details"];
  minimum_night_stay: VenueLogistics["minimum_night_stay"];
  event_insurance_required: VenueLogistics["event_insurance_required"];
  liquor_liability: VenueLogistics["liquor_liability"];
  // Day-of contacts — kept here rather than spread across the workspace
  // because every contracted vendor needs them and they're not really
  // policy. Stored as a free-form list in venue-store.documents today;
  // the Build session UI should help the couple capture them explicitly.
  day_of_contacts: ReadonlyArray<{
    id: string;
    role: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  }>;
  computed?: {
    load_in_set: boolean;
    coi_required: boolean;
    parking_set: boolean;
  };
}

// ── Aggregated journey form data ──────────────────────────────────────────

export interface VenueBuildFormData {
  spaces_and_layout: SpacesAndLayoutFormData;
  rules_and_restrictions: RulesAndRestrictionsFormData;
  vendor_policies: VendorPoliciesFormData;
  load_in_and_day_of: LoadInAndDayOfFormData;
}
