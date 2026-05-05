// ── Transportation Day-of Route Plan derivation ────────────────────────────
// Tab 5 (Day-of Route Plan) is a derivation, not a session. Couples don't
// fill it directly — its rows are computed from the three Build sessions
// and rendered as an editable table in Tab 5. Edits in Tab 5 flow back
// through the sync mapping to the Build session that produced the row.
//
// Source-of-truth precedence (highest first):
//   1. baraat_walkthrough → adds rows for vehicle on-site arrival, baraat
//      start, baraat end.
//   2. guest_movement_math.shuttle_runs[]  → 1 row per run.
//   3. guest_movement_math.airport_pickups[] → 1 row per pickup
//      (filtered to wedding day only, when known).
//   4. guest_movement_math.vip_moves[] → 1 row per move.
//   5. fleet_roster.driver_assignments[].shifts[] → 1 row per shift, but
//      only when the shift doesn't already align with a row from 1–4.
//
// Each derived row is tagged with a `source_path` so Tab 5 can route inline
// edits back to the right session.

import type {
  AirportPickup,
  BaraatWalkthroughFormData,
  DriverAssignment,
  FleetRosterFormData,
  GuestMovementMathFormData,
  ShuttleRun,
  TransportEvent,
  VipMove,
} from "./transportation-build";
import { TRANSPORT_EVENT_LABEL } from "./transportation-build";

export interface DayOfRouteRow {
  id: string;
  /** Event label used as the section grouper in Tab 5. */
  event: string;
  /** ISO time "HH:mm" — sorted within the event. */
  time: string;
  /** Movement description rendered in the title column. */
  movement: string;
  /** Vehicle column. */
  vehicle: string;
  /** Driver column. */
  driver: string;
  /** Optional notes column. */
  notes?: string;
  /**
   * Pointer to the Build form_data path that produced this row, so
   * inline edits in Tab 5 can route back to the originating session.
   */
  source_path: string;
  /** Stable id of the source entry (e.g. shuttle id, baraat slot id). */
  source_id: string;
}

export interface DerivationInput {
  baraat?: Partial<BaraatWalkthroughFormData>;
  movement?: Partial<GuestMovementMathFormData>;
  fleet?: Partial<FleetRosterFormData>;
  /** Wedding date (ISO "YYYY-MM-DD"), used to filter airport pickups. */
  weddingDate?: string;
}

export function deriveDayOfRoutePlan(
  input: DerivationInput,
): DayOfRouteRow[] {
  const rows: DayOfRouteRow[] = [];

  // ── 1. Baraat: vehicle on-site, baraat start, baraat end ──────────────
  if (input.baraat?.baraat_happening !== false && input.baraat?.route) {
    const route = input.baraat.route;
    const vehicleType = input.baraat.vehicle?.type ?? "";
    const vehicleLabel = vehicleType ? labelizeVehicle(vehicleType) : "—";
    const vendor = input.baraat.vehicle?.rental_vendor ?? "";

    if (input.baraat.vehicle?.arrives_on_site_by) {
      rows.push({
        id: `baraat-vehicle-arrives`,
        event: "Baraat",
        time: input.baraat.vehicle.arrives_on_site_by,
        movement: "Vehicle arrives on-site",
        vehicle: vehicleLabel + (vendor ? ` · ${vendor}` : ""),
        driver: "",
        source_path: "baraat_walkthrough.vehicle.arrives_on_site_by",
        source_id: "baraat-vehicle-arrives",
      });
    }
    if (route.start_time) {
      rows.push({
        id: `baraat-start`,
        event: "Baraat",
        time: route.start_time,
        movement: route.start_point
          ? `Baraat starts · ${route.start_point}`
          : "Baraat starts",
        vehicle: vehicleLabel,
        driver: "",
        notes: route.route_description,
        source_path: "baraat_walkthrough.route",
        source_id: "baraat-start",
      });
    }
    if (route.end_time) {
      rows.push({
        id: `baraat-end`,
        event: "Baraat",
        time: route.end_time,
        movement: route.end_point
          ? `Baraat arrives · ${route.end_point}`
          : "Baraat arrives",
        vehicle: vehicleLabel,
        driver: "",
        source_path: "baraat_walkthrough.route",
        source_id: "baraat-end",
      });
    }
  }

  // ── 2. Shuttle runs ────────────────────────────────────────────────────
  for (const run of input.movement?.shuttle_runs ?? []) {
    const eventLabel = eventLabelOf(run);
    rows.push({
      id: `shuttle-${run.id}`,
      event: eventLabel,
      time: run.depart_time,
      movement: `Shuttle: ${run.route}${run.return_run ? " (return)" : ""}`,
      vehicle: paxLabel(run.pax),
      driver: "",
      notes: run.arrive_time ? `Arrives ${run.arrive_time}` : undefined,
      source_path: "guest_movement_math.shuttle_runs[]",
      source_id: run.id,
    });
  }

  // ── 3. Airport pickups (filtered to wedding day if known) ──────────────
  for (const pickup of input.movement?.airport_pickups ?? []) {
    if (
      input.weddingDate &&
      pickup.arrival_datetime &&
      !pickup.arrival_datetime.startsWith(input.weddingDate)
    ) {
      continue;
    }
    rows.push(rowFromPickup(pickup));
  }

  // ── 4. VIP moves ───────────────────────────────────────────────────────
  for (const vip of input.movement?.vip_moves ?? []) {
    rows.push(rowFromVip(vip));
  }

  // ── 5. Driver shifts that don't overlap an existing row ────────────────
  for (const driver of input.fleet?.driver_assignments ?? []) {
    for (const shift of driver.shifts ?? []) {
      if (rowsCoverShift(rows, driver, shift)) continue;
      rows.push({
        id: `shift-${driver.id}-${shift.event}-${shift.start_time}`,
        event: TRANSPORT_EVENT_LABEL[shift.event] ?? "Other",
        time: shift.start_time,
        movement: shift.role || `${driver.driver_name} — on duty`,
        vehicle: driver.vehicle_assigned,
        driver: driver.driver_name,
        notes: shift.end_time ? `Until ${shift.end_time}` : undefined,
        source_path: "fleet_roster.driver_assignments[].shifts[]",
        source_id: `${driver.id}:${shift.event}:${shift.start_time}`,
      });
    }
  }

  // Sort by event-section then time; Tab 5 groups by event but expects
  // pre-sorted rows for consistent rendering.
  return rows.sort((a, b) => {
    if (a.event === b.event) return a.time.localeCompare(b.time);
    return a.event.localeCompare(b.event);
  });
}

function rowFromPickup(pickup: AirportPickup): DayOfRouteRow {
  const time = pickup.arrival_datetime?.split("T")[1]?.slice(0, 5) ?? "";
  return {
    id: `pickup-${pickup.id}`,
    event: "Airport",
    time,
    movement: `Airport pickup · ${pickup.guest_label}`,
    vehicle: pickup.transport_type,
    driver: "",
    notes: pickup.flight_info,
    source_path: "guest_movement_math.airport_pickups[]",
    source_id: pickup.id,
  };
}

function rowFromVip(vip: VipMove): DayOfRouteRow {
  const eventLabel = TRANSPORT_EVENT_LABEL[vip.event] ?? "Other";
  return {
    id: `vip-${vip.id}`,
    event: eventLabel,
    time: vip.time,
    movement: `${vip.move_label}${vip.who ? ` · ${vip.who}` : ""}`,
    vehicle: vip.vehicle_assigned ?? "",
    driver: "",
    source_path: "guest_movement_math.vip_moves[]",
    source_id: vip.id,
  };
}

function eventLabelOf(run: ShuttleRun): string {
  if (run.event === "other") {
    return run.event_label?.trim() || "Other";
  }
  return TRANSPORT_EVENT_LABEL[run.event] ?? "Other";
}

function paxLabel(pax: number): string {
  if (!pax || pax <= 0) return "Shuttle";
  if (pax <= 7) return `Sedan · ${pax} pax`;
  if (pax <= 14) return `Sprinter · ${pax} pax`;
  if (pax <= 30) return `Mid-shuttle · ${pax} pax`;
  if (pax <= 50) return `Mini-coach · ${pax} pax`;
  return `Coach · ${pax} pax`;
}

function labelizeVehicle(t: string): string {
  return t
    .split("_")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(" ");
}

/**
 * Skip a driver shift when the same vehicle/event window is already
 * represented by a baraat / shuttle / vip row — otherwise the day-of plan
 * doubles up entries. Coverage rule: same event, same vehicle, and the
 * shift start_time falls inside an existing row's window (±15 min).
 */
function rowsCoverShift(
  rows: DayOfRouteRow[],
  driver: DriverAssignment,
  shift: { event: TransportEvent; start_time: string; end_time: string },
): boolean {
  const eventLabel = TRANSPORT_EVENT_LABEL[shift.event] ?? "Other";
  return rows.some((r) => {
    if (r.event !== eventLabel) return false;
    if (
      driver.vehicle_assigned &&
      r.vehicle &&
      !r.vehicle.toLowerCase().includes(driver.vehicle_assigned.toLowerCase())
    ) {
      return false;
    }
    return Math.abs(timeDiffMin(r.time, shift.start_time)) <= 15;
  });
}

function timeDiffMin(a: string, b: string): number {
  const toMin = (t: string): number => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return Number.NaN;
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const aMin = toMin(a);
  const bMin = toMin(b);
  if (Number.isNaN(aMin) || Number.isNaN(bMin)) return Number.MAX_SAFE_INTEGER;
  return aMin - bMin;
}
