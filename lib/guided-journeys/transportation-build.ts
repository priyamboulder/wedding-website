// ── Transportation Build journey ──────────────────────────────────────────
// Second guided journey on the Transportation workspace. Vision (the 2-
// session default journey) covers intent — what kinds of transport, what
// vibe, what the baraat should feel like. Build is operational — the
// baraat walkthrough (route, road permits, dhol timing, ready-by clocks),
// shuttle/airport math (concrete depart/arrive times, pax counts, pickup-
// window auto-grouping), and the fleet roster (every vehicle, every driver,
// vendor parking). Lives at journey_id = "build". Three sessions:
//
//   1. baraat_walkthrough  — the marquee feature. Route, participants,
//                            horse/vehicle, road & venue coordination
//                            (permits), music, timing coordination. Auto-
//                            suggests permit deadlines from the wedding
//                            date. Cross-links dhol vendor from Music.
//   2. guest_movement_math  — shuttle runs, airport pickups (auto-grouped
//                            into shared pickup windows), VIP/family
//                            moves, accessibility, post-event return.
//                            Pre-seeds airport pickups from Travel & Acc.
//   3. fleet_roster         — family + couple fleet, vendor parking, day-of
//                            driver assignments. Hard-warns when must-have
//                            vehicles are uncontracted with < 3 months left.
//
// Build does NOT generate a closing brief — Vision already produced the
// transport brief. Build's output is operational. Completion lands the
// couple on Tab 5 (Day-of Route Plan) which is auto-derived from Build.
//
// Time-gated: Build CTAs render muted when months_until_event > 4. The
// four-month threshold matches police escort permits (30–90 days), premium
// horse vendors (60–90 day lock-in), and shuttle vendor contracts (60 day).

import type { CategoryKey } from "@/lib/guided-journey/types";

export const TRANSPORTATION_BUILD_JOURNEY_ID = "build";
export const TRANSPORTATION_BUILD_CATEGORY: CategoryKey = "transportation";

export type TransportationBuildSessionKey =
  | "baraat_walkthrough"
  | "guest_movement_math"
  | "fleet_roster";

export interface TransportationBuildSessionDef {
  key: TransportationBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const TRANSPORTATION_BUILD_SESSIONS: readonly TransportationBuildSessionDef[] = [
  {
    key: "baraat_walkthrough",
    index: 1,
    title: "Baraat walkthrough",
    subtitle:
      "The most public 20 minutes of the wedding. Plan every beat.",
    estimatedMinutes: 6,
  },
  {
    key: "guest_movement_math",
    index: 2,
    title: "Guest movement math",
    subtitle:
      "Shuttles, airport pickups, VIP moves — concrete times and counts.",
    estimatedMinutes: 5,
  },
  {
    key: "fleet_roster",
    index: 3,
    title: "Fleet roster",
    subtitle: "Family vehicles, vendor parking, who drives what.",
    estimatedMinutes: 3,
  },
] as const;

export const TRANSPORTATION_BUILD_TOTAL_MINUTES =
  TRANSPORTATION_BUILD_SESSIONS.reduce(
    (sum, s) => sum + s.estimatedMinutes,
    0,
  );

export const TRANSPORTATION_BUILD_UNLOCK_THRESHOLD_MONTHS = 4;

/** Days of lead time we use for the must-have-uncontracted hard warning. */
export const FLEET_HARD_WARNING_THRESHOLD_MONTHS = 3;

/** Default cluster window for airport pickup auto-grouping. */
export const AIRPORT_CLUSTER_WINDOW_HOURS = 1;

export function getTransportationBuildSession(
  key: TransportationBuildSessionKey,
): TransportationBuildSessionDef {
  const found = TRANSPORTATION_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown transportation build session: ${key}`);
  }
  return found;
}

// ── Shared event vocabulary ───────────────────────────────────────────────

export type TransportEvent =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "baraat"
  | "airport"
  | "other";

export const TRANSPORT_EVENT_LABEL: Record<TransportEvent, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  baraat: "Baraat",
  airport: "Airport",
  other: "Other",
};

// ── Session 1: baraat_walkthrough ─────────────────────────────────────────

export type YesNoTbd = "yes" | "no" | "tbd";

export type BaraatVehicleType =
  | "horse"
  | "vintage_car"
  | "convertible"
  | "elephant"
  | "walking"
  | "other";

export interface BaraatRoute {
  start_point: string;
  end_point: string;
  route_description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface BaraatParticipant {
  id: string;
  label: string;
  confirmed: boolean;
  custom: boolean;
}

export interface BaraatVehicle {
  type: BaraatVehicleType | "";
  rental_vendor?: string;
  arrives_on_site_by?: string;
  grooms_outfit_note?: string;
  handler_stays_with_horse: boolean;
  practice_session_scheduled: boolean;
  practice_date?: string;
}

export interface BaraatRoadVenue {
  venue_allows_baraat_on_property: YesNoTbd;
  road_closure_required: YesNoTbd;
  police_escort: YesNoTbd;
  noise_permit: YesNoTbd;
  coordination_note?: string;
  permit_application_deadline?: string;
}

export interface BaraatMusic {
  dhol_starts: string;
  dhol_ends: string;
  dj_handoff_point?: string;
  bluetooth_backup_playlist?: string;
}

export interface BaraatTimingCoordination {
  bride_ready_by: string;
  photographer_at_start: string;
  videographer_at_entrance: string;
}

export interface BaraatOptionalMoment {
  wanted: boolean;
  who_throws?: string;
  venue_allows?: boolean | null;
}

export type PermitsStatus =
  | "all_clear"
  | "pending_road_closure"
  | "pending_police_escort"
  | "pending_noise"
  | "multiple_pending"
  | "na";

export interface BaraatWalkthroughComputed {
  participants_confirmed_count: number;
  participants_total_count: number;
  permits_status: PermitsStatus;
}

export interface BaraatWalkthroughFormData {
  baraat_happening: boolean;
  route: BaraatRoute;
  participants: BaraatParticipant[];
  optional_moments: {
    flower_shower_at_entrance: BaraatOptionalMoment;
    fireworks: BaraatOptionalMoment;
  };
  vehicle: BaraatVehicle;
  road_venue: BaraatRoadVenue;
  music: BaraatMusic;
  timing_coordination: BaraatTimingCoordination;
  computed?: BaraatWalkthroughComputed;
}

/** Pre-seed list rendered when participants[] is empty. */
export const BARAAT_DEFAULT_PARTICIPANTS: ReadonlyArray<{
  id: string;
  label: string;
}> = [
  { id: "groom", label: "Groom on horse / in car / walking" },
  {
    id: "grooms_family",
    label: "Groom's family (dancing, 30–40 people)",
  },
  { id: "dhol_players", label: "Dhol players (2)" },
  {
    id: "photo_video",
    label: "Photographer + videographer walking ahead",
  },
];

/** Vehicle types where the practice-session date picker should appear. */
export const PRACTICE_REQUIRED_VEHICLES: ReadonlySet<BaraatVehicleType> = new Set<BaraatVehicleType>(
  ["horse", "elephant"],
);

// ── Session 2: guest_movement_math ────────────────────────────────────────

export interface ShuttleRun {
  id: string;
  route: string;
  event: TransportEvent;
  event_label?: string;
  depart_time: string;
  arrive_time: string;
  pax: number;
  return_run: boolean;
}

export type AirportPickupTransport =
  | "private_car_paid"
  | "private_car_couple"
  | "shared_shuttle"
  | "taxi_voucher"
  | "family_pickup"
  | "self_arrange";

export const AIRPORT_PICKUP_TRANSPORT_LABEL: Record<AirportPickupTransport, string> = {
  private_car_paid: "Private car (paid)",
  private_car_couple: "Private car (couple)",
  shared_shuttle: "Shared shuttle",
  taxi_voucher: "Taxi voucher",
  family_pickup: "Family pickup",
  self_arrange: "Self-arrange",
};

export interface AirportPickup {
  id: string;
  guest_label: string;
  flight_info?: string;
  arrival_datetime: string;
  transport_type: AirportPickupTransport;
  accessibility_needs?: string;
  cluster_id?: string;
}

export interface VipMove {
  id: string;
  move_label: string;
  who: string;
  event: TransportEvent;
  time: string;
  vehicle_assigned?: string;
}

export interface AccessibilityNeeds {
  elderly_or_mobility_count: number;
  accessible_vehicle_needed: boolean;
  vehicle_type_required?: string;
}

export interface PostEventReturn {
  needed: boolean;
  last_shuttle_time?: string;
  notes?: string;
}

export interface ArrivalClusterSummary {
  window_start: string;
  window_end: string;
  guest_count: number;
  total_pax: number;
}

export interface GuestMovementMathComputed {
  total_shuttle_runs: number;
  total_airport_pickups: number;
  total_vip_moves: number;
  peak_passengers_single_run: number;
  peak_recommendation: string;
  arrival_clusters: ArrivalClusterSummary[];
}

export interface GuestMovementMathFormData {
  shuttle_runs: ShuttleRun[];
  airport_pickups: AirportPickup[];
  auto_group_pickups: boolean;
  vip_moves: VipMove[];
  accessibility: AccessibilityNeeds;
  post_event_return: PostEventReturn;
  computed?: GuestMovementMathComputed;
}

/**
 * Map peak single-run passenger count to the recommended vehicle band.
 * Render as a soft suggestion in the UI.
 */
export function peakRecommendation(peak: number): string {
  if (peak <= 0) return "Add at least one shuttle run to size your fleet.";
  if (peak <= 7) return "Sedan";
  if (peak <= 14) return "Sprinter";
  if (peak <= 30) return "Mid-size shuttle";
  if (peak <= 50) return "Mini-coach";
  return "Use a coach";
}

// ── Session 3: fleet_roster ───────────────────────────────────────────────

export type FleetPriority = "must" | "preferred" | "nice_to_have";

export const FLEET_PRIORITY_LABEL: Record<FleetPriority, string> = {
  must: "Must",
  preferred: "Preferred",
  nice_to_have: "Nice to have",
};

export interface FleetVehicle {
  id: string;
  priority: FleetPriority;
  vehicle: string;
  role: string;
  quantity: number;
  vendor?: string;
  contact?: string;
  contracted: boolean;
  notes?: string;
}

export interface VendorParking {
  needed: boolean;
  vendors_needing_parking: string[];
  reserved_spots_count?: number;
  parking_location?: string;
  venue_coordination_note?: string;
}

export interface DriverShift {
  event: TransportEvent;
  start_time: string;
  end_time: string;
  role: string;
}

export interface DriverAssignment {
  id: string;
  driver_name: string;
  contact: string;
  vehicle_assigned: string;
  shifts: DriverShift[];
}

export interface FleetRosterComputed {
  total_vehicles: number;
  contracted_count: number;
  pending_count: number;
  must_have_uncontracted: number;
  drivers_assigned_count: number;
  coverage_gaps: string[];
}

export interface FleetRosterFormData {
  fleet: FleetVehicle[];
  vendor_parking: VendorParking;
  driver_assignments: DriverAssignment[];
  computed?: FleetRosterComputed;
}

// ── ID helpers ────────────────────────────────────────────────────────────

export function newBuildId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
