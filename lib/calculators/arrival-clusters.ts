// ── Arrival cluster calculator ─────────────────────────────────────────────
// Shared cluster math — single source of truth for both:
//
//   • Travel & Accommodations Build · Session 2 (guest_travel_tracker) —
//     groups guest arrivals into clusters and pushes them as airport pickup
//     rosters into Transportation Build.
//   • Transportation Build · Session 2 (airport_pickups) — re-derives
//     clusters from the live guest travel entries when the couple updates
//     them on the Travel side.
//
// Cluster rule: any 2+ guests with arrivals on the same date and within
// 3 hours of each other form a cluster. Solo arrivals or arrivals more
// than 3 hours apart sit in their own cluster (size = 1).
//
// The deliverable is the cluster, not the data. Couples don't think
// "I have 8 guests arriving in a 2-hour window" — they think "tell the
// airport pickup vendor when to send vans." Output is shaped accordingly.

export interface ArrivalClusterInput {
  /** Stable id from the source guest entry. */
  id: string;
  /** ISO date "YYYY-MM-DD". Required — entries without dates are skipped. */
  arrival_date: string;
  /** Optional 24h "HH:mm". When absent, treated as midday for windowing. */
  arrival_time?: string;
  /** Optional party-size; defaults to 1. */
  travel_party_size?: number;
  /** Optional airport — passed through for downstream filtering. */
  arrival_airport?: string;
  /** Optional flight info — passed through. */
  flight_info?: string;
}

export interface ArrivalCluster {
  id: string;
  cluster_date: string;
  /** ISO datetime of the earliest arrival in the cluster. */
  arrival_window_start: string;
  /** ISO datetime of the latest arrival. */
  arrival_window_end: string;
  /** Source ids that belong to this cluster, in order of arrival_time. */
  guests_in_cluster: string[];
  /** Sum of travel_party_size across all entries in the cluster. */
  total_pax: number;
  /** Human-readable suggestion: e.g. "Apr 10, 2:30pm". */
  suggested_pickup_window: string;
  /** When all entries share an airport, surface it; otherwise undefined. */
  arrival_airport?: string;
  /** Optional notes — left empty by the calculator; consumers populate. */
  notes?: string;
}

const DEFAULT_WINDOW_HOURS = 3;
const NOON_DEFAULT = "12:00";

/**
 * Group arrivals into clusters. Stable ordering: clusters are returned
 * sorted by date, then by earliest arrival within the date. Cluster ids
 * are deterministic — derived from the date and earliest arrival time so
 * downstream consumers can dedupe across recomputations.
 */
export function buildArrivalClusters(
  entries: ArrivalClusterInput[],
  opts: { windowHours?: number } = {},
): ArrivalCluster[] {
  const windowMs = (opts.windowHours ?? DEFAULT_WINDOW_HOURS) * 60 * 60 * 1000;

  // Group by date first.
  const byDate = new Map<string, ArrivalClusterInput[]>();
  for (const e of entries) {
    if (!e.arrival_date) continue;
    const list = byDate.get(e.arrival_date) ?? [];
    list.push(e);
    byDate.set(e.arrival_date, list);
  }

  const clusters: ArrivalCluster[] = [];

  for (const [date, list] of byDate) {
    // Sort within a date by arrival_time (or noon default).
    const sorted = [...list].sort(
      (a, b) =>
        toMillis(date, a.arrival_time) - toMillis(date, b.arrival_time),
    );

    // Greedy windowing: open a cluster, keep adding while next arrival is
    // within the window of the cluster's first arrival. When the window
    // breaks, close the cluster and start a new one.
    let current: ArrivalClusterInput[] = [];
    const closeAndPush = () => {
      if (current.length === 0) return;
      clusters.push(makeCluster(date, current));
      current = [];
    };

    for (const e of sorted) {
      if (current.length === 0) {
        current.push(e);
        continue;
      }
      const head = current[0];
      const headMs = toMillis(date, head.arrival_time);
      const eMs = toMillis(date, e.arrival_time);
      if (eMs - headMs <= windowMs) {
        current.push(e);
      } else {
        closeAndPush();
        current.push(e);
      }
    }
    closeAndPush();
  }

  // Sort clusters by date, then earliest arrival time.
  clusters.sort((a, b) =>
    a.arrival_window_start < b.arrival_window_start ? -1 : 1,
  );
  return clusters;
}

function makeCluster(
  date: string,
  list: ArrivalClusterInput[],
): ArrivalCluster {
  const first = list[0];
  const last = list[list.length - 1];
  const startIso = isoFromDateTime(date, first.arrival_time);
  const endIso = isoFromDateTime(date, last.arrival_time);
  const totalPax = list.reduce(
    (sum, e) => sum + (e.travel_party_size ?? 1),
    0,
  );

  const airports = new Set(
    list.map((e) => e.arrival_airport).filter(Boolean) as string[],
  );

  // Suggested pickup window is the midpoint of the cluster, rounded down
  // to the half-hour. Falls back to "midday" if no times were entered.
  const midMs = (toMillis(date, first.arrival_time) + toMillis(date, last.arrival_time)) / 2;
  const mid = new Date(midMs);
  const suggested = formatHumanWindow(date, mid);

  return {
    id: `cluster-${date}-${first.arrival_time ?? NOON_DEFAULT}`,
    cluster_date: date,
    arrival_window_start: startIso,
    arrival_window_end: endIso,
    guests_in_cluster: list.map((e) => e.id),
    total_pax: totalPax,
    suggested_pickup_window: suggested,
    arrival_airport: airports.size === 1 ? [...airports][0] : undefined,
  };
}

function toMillis(dateIso: string, time: string | undefined): number {
  const t = time && /^\d{1,2}:\d{2}$/.test(time) ? time : NOON_DEFAULT;
  const d = new Date(`${dateIso}T${padTime(t)}:00`);
  if (Number.isNaN(d.getTime())) return 0;
  return d.getTime();
}

function isoFromDateTime(
  dateIso: string,
  time: string | undefined,
): string {
  const t = time && /^\d{1,2}:\d{2}$/.test(time) ? time : NOON_DEFAULT;
  return `${dateIso}T${padTime(t)}:00`;
}

function padTime(t: string): string {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function formatHumanWindow(dateIso: string, mid: Date): string {
  if (Number.isNaN(mid.getTime())) {
    return `${dateIso} (time TBD)`;
  }
  const dateLabel = new Date(`${dateIso}T12:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" },
  );
  const hours = mid.getHours();
  const mins = mid.getMinutes();
  const rounded = mins < 30 ? "00" : "30";
  const h12 = ((hours + 11) % 12) + 1;
  const meridiem = hours >= 12 ? "pm" : "am";
  return `${dateLabel}, ${h12}:${rounded}${meridiem}`;
}

/**
 * Convert clusters to Transportation Build's `airport_pickups[]` shape.
 * One cluster → one pickup entry. Returned shape kept loose so the
 * Transportation Build journey can pick the fields it cares about.
 */
export function clustersToAirportPickups(
  clusters: ArrivalCluster[],
): Array<{
  cluster_id: string;
  pickup_date: string;
  pickup_window: string;
  total_pax: number;
  airport?: string;
  guest_ids: string[];
}> {
  return clusters.map((c) => ({
    cluster_id: c.id,
    pickup_date: c.cluster_date,
    pickup_window: c.suggested_pickup_window,
    total_pax: c.total_pax,
    airport: c.arrival_airport,
    guest_ids: c.guests_in_cluster,
  }));
}
