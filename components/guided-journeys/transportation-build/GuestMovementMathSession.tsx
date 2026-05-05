"use client";

// ── Build Session 2 · Guest movement math ─────────────────────────────────
// Three structured tables — shuttle runs, airport pickups, VIP/family moves
// — plus accessibility and post-event return shuttle. Pre-seeds shuttle
// runs from Vision intent and airport pickups from Travel & Accommodations
// Build (when present). Auto-grouping clusters airport arrivals into 60-min
// pickup windows via lib/calculators/arrival-clusters.ts.

import { useEffect, useMemo } from "react";
import { AlertTriangle, Plus, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  AIRPORT_CLUSTER_WINDOW_HOURS,
  AIRPORT_PICKUP_TRANSPORT_LABEL,
  TRANSPORT_EVENT_LABEL,
  TRANSPORTATION_BUILD_CATEGORY,
  TRANSPORTATION_BUILD_JOURNEY_ID,
  newBuildId,
  peakRecommendation,
  type AirportPickup,
  type AirportPickupTransport,
  type ArrivalClusterSummary,
  type GuestMovementMathComputed,
  type GuestMovementMathFormData,
  type ShuttleRun,
  type TransportEvent,
  type VipMove,
} from "@/lib/guided-journeys/transportation-build";
import {
  buildArrivalClusters,
  type ArrivalClusterInput,
} from "@/lib/calculators/arrival-clusters";
import type { WorkspaceCategory } from "@/types/workspace";

const EVENT_OPTIONS: Array<{ value: TransportEvent; label: string }> = (
  Object.keys(TRANSPORT_EVENT_LABEL) as TransportEvent[]
).map((k) => ({ value: k, label: TRANSPORT_EVENT_LABEL[k] }));

const TRANSPORT_TYPE_OPTIONS: Array<{
  value: AirportPickupTransport;
  label: string;
}> = (
  Object.keys(AIRPORT_PICKUP_TRANSPORT_LABEL) as AirportPickupTransport[]
).map((k) => ({ value: k, label: AIRPORT_PICKUP_TRANSPORT_LABEL[k] }));

function emptyForm(): GuestMovementMathFormData {
  return {
    shuttle_runs: [],
    airport_pickups: [],
    auto_group_pickups: false,
    vip_moves: [],
    accessibility: {
      elderly_or_mobility_count: 0,
      accessible_vehicle_needed: false,
    },
    post_event_return: {
      needed: false,
    },
  };
}

function compute(data: GuestMovementMathFormData): GuestMovementMathComputed {
  const peak = data.shuttle_runs.reduce(
    (n, r) => (r.pax > n ? r.pax : n),
    0,
  );
  const clusterInputs: ArrivalClusterInput[] = data.airport_pickups
    .filter((p) => Boolean(p.arrival_datetime))
    .map((p) => {
      const [date, time] = (p.arrival_datetime ?? "").split("T");
      return {
        id: p.id,
        arrival_date: date ?? "",
        arrival_time: time ? time.slice(0, 5) : undefined,
        travel_party_size: 1,
      };
    });
  const clusters = buildArrivalClusters(clusterInputs, {
    windowHours: AIRPORT_CLUSTER_WINDOW_HOURS,
  });
  const arrival_clusters: ArrivalClusterSummary[] = clusters.map((c) => ({
    window_start: c.arrival_window_start,
    window_end: c.arrival_window_end,
    guest_count: c.guests_in_cluster.length,
    total_pax: c.total_pax,
  }));
  return {
    total_shuttle_runs: data.shuttle_runs.length,
    total_airport_pickups: data.airport_pickups.length,
    total_vip_moves: data.vip_moves.length,
    peak_passengers_single_run: peak,
    peak_recommendation: peakRecommendation(peak),
    arrival_clusters,
  };
}

export function GuestMovementMathSession({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );

  const data = useMemo<GuestMovementMathFormData>(() => {
    const stored = state.formData["guest_movement_math"] as
      | Partial<GuestMovementMathFormData>
      | undefined;
    if (stored && Object.keys(stored).length > 0) {
      return { ...emptyForm(), ...stored } as GuestMovementMathFormData;
    }
    return emptyForm();
  }, [state.formData]);

  // First-render seeding from Vision + Travel Build (best-effort)
  useEffect(() => {
    if (state.formData["guest_movement_math"]) return;

    const seeded = emptyForm();

    // Pre-seed shuttle runs from Vision intent
    const visionNeeds = state.formData["transport_needs"] as
      | {
          guest_shuttle_intent?: {
            needed?: boolean;
            return_service?: boolean;
            late_night_service?: boolean;
            rough_guest_count?: number;
          };
        }
      | undefined;
    const intent = visionNeeds?.guest_shuttle_intent;
    if (intent?.needed) {
      const pax = intent.rough_guest_count ?? 0;
      seeded.shuttle_runs.push({
        id: newBuildId("run"),
        route: "Hotel → venue",
        event: "wedding",
        depart_time: "",
        arrive_time: "",
        pax,
        return_run: false,
      });
      if (intent.return_service) {
        seeded.shuttle_runs.push({
          id: newBuildId("run"),
          route: "Venue → hotel",
          event: "wedding",
          depart_time: "",
          arrive_time: "",
          pax,
          return_run: true,
        });
      }
      if (intent.late_night_service) {
        seeded.shuttle_runs.push({
          id: newBuildId("run"),
          route: "Venue → hotel (late night)",
          event: "reception",
          depart_time: "",
          arrive_time: "",
          pax,
          return_run: true,
        });
      }
    }

    // Pre-seed VIP moves with the 2 standard rows for the wedding event
    seeded.vip_moves = [
      {
        id: newBuildId("vip"),
        move_label: "Bride + parents → venue",
        who: "Bride + parents",
        event: "wedding",
        time: "",
      },
      {
        id: newBuildId("vip"),
        move_label: "Grandparents → venue",
        who: "Dadi + Nana-Nani",
        event: "wedding",
        time: "",
      },
    ];

    // Pre-seed airport pickups from Travel & Accommodations Build
    const travelTracker = state.formData["guest_travel_tracker"] as
      | {
          guests?: Array<{
            id?: string;
            guest_name?: string;
            arrival_date?: string;
            arrival_time?: string;
            flight_info?: string;
            arrival_airport?: string;
          }>;
        }
      | undefined;
    const sourceGuests = Array.isArray(travelTracker?.guests)
      ? travelTracker!.guests!
      : [];
    for (const g of sourceGuests) {
      if (!g.arrival_date) continue;
      const time = g.arrival_time ?? "12:00";
      const iso = `${g.arrival_date}T${time.length === 5 ? time : "12:00"}:00`;
      seeded.airport_pickups.push({
        id: newBuildId("pickup"),
        guest_label: g.guest_name ?? "Guest",
        flight_info: g.flight_info,
        arrival_datetime: iso,
        transport_type: "shared_shuttle",
      });
    }

    writeAll(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Mutators ─────────────────────────────────────────────────────────

  function writeAll(next: GuestMovementMathFormData) {
    update((s) => setSessionFormPath(s, "guest_movement_math", "", next));
    update((s) =>
      setSessionFormPath(s, "guest_movement_math", "computed", compute(next)),
    );
  }

  function patchData(patch: Partial<GuestMovementMathFormData>) {
    writeAll({ ...data, ...patch });
  }

  function addShuttle() {
    patchData({
      shuttle_runs: [
        ...data.shuttle_runs,
        {
          id: newBuildId("run"),
          route: "",
          event: "wedding",
          depart_time: "",
          arrive_time: "",
          pax: 0,
          return_run: false,
        },
      ],
    });
  }

  function patchShuttle(id: string, patch: Partial<ShuttleRun>) {
    patchData({
      shuttle_runs: data.shuttle_runs.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    });
  }

  function removeShuttle(id: string) {
    patchData({
      shuttle_runs: data.shuttle_runs.filter((r) => r.id !== id),
    });
  }

  function addPickup() {
    patchData({
      airport_pickups: [
        ...data.airport_pickups,
        {
          id: newBuildId("pickup"),
          guest_label: "",
          arrival_datetime: "",
          transport_type: "shared_shuttle",
        },
      ],
    });
  }

  function patchPickup(id: string, patch: Partial<AirportPickup>) {
    patchData({
      airport_pickups: data.airport_pickups.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    });
  }

  function removePickup(id: string) {
    patchData({
      airport_pickups: data.airport_pickups.filter((p) => p.id !== id),
    });
  }

  function applyAutoGroup() {
    const inputs: ArrivalClusterInput[] = data.airport_pickups
      .filter((p) => Boolean(p.arrival_datetime))
      .map((p) => {
        const [date, time] = (p.arrival_datetime ?? "").split("T");
        return {
          id: p.id,
          arrival_date: date ?? "",
          arrival_time: time ? time.slice(0, 5) : undefined,
        };
      });
    const clusters = buildArrivalClusters(inputs, {
      windowHours: AIRPORT_CLUSTER_WINDOW_HOURS,
    });
    const idToCluster = new Map<string, string>();
    for (const c of clusters) {
      for (const id of c.guests_in_cluster) idToCluster.set(id, c.id);
    }
    patchData({
      auto_group_pickups: true,
      airport_pickups: data.airport_pickups.map((p) => ({
        ...p,
        cluster_id: idToCluster.get(p.id) ?? p.cluster_id,
      })),
    });
  }

  function clearAutoGroup() {
    patchData({
      auto_group_pickups: false,
      airport_pickups: data.airport_pickups.map((p) => ({
        ...p,
        cluster_id: undefined,
      })),
    });
  }

  function addVip() {
    patchData({
      vip_moves: [
        ...data.vip_moves,
        {
          id: newBuildId("vip"),
          move_label: "",
          who: "",
          event: "wedding",
          time: "",
        },
      ],
    });
  }

  function patchVip(id: string, patch: Partial<VipMove>) {
    patchData({
      vip_moves: data.vip_moves.map((v) =>
        v.id === id ? { ...v, ...patch } : v,
      ),
    });
  }

  function removeVip(id: string) {
    patchData({
      vip_moves: data.vip_moves.filter((v) => v.id !== id),
    });
  }

  // ─── Soft warnings ────────────────────────────────────────────────────

  const peak = data.computed?.peak_passengers_single_run ?? 0;
  const peakLabel = data.computed?.peak_recommendation ?? "";

  const lastShuttleTime = data.post_event_return.last_shuttle_time;
  const lateNightWarn =
    data.post_event_return.needed &&
    lastShuttleTime &&
    /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(lastShuttleTime) &&
    Number(lastShuttleTime.split(":")[0]) < 22;

  const groupable =
    data.airport_pickups.filter((p) => p.arrival_datetime).length >= 2;
  const alreadyGrouped =
    data.auto_group_pickups &&
    data.airport_pickups.every((p) => Boolean(p.cluster_id));

  return (
    <div className="space-y-6">
      {/* Header note */}
      <div className="rounded-md border border-ink/10 bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
          ✦ Concrete times and counts
        </p>
        <p className="mt-1 text-[13px] italic text-ink-muted">
          Every guest movement — shuttles, airport pickups, VIPs. Keep
          departures 15–30 min earlier than the event start.
        </p>
      </div>

      {/* 1. Shuttle runs */}
      <Section
        title="Hotel ↔ venue shuttles"
        eyebrow="Outbound, return, late-night"
        action={
          <SmallButton onClick={addShuttle}>
            <Plus size={11} /> Add shuttle
          </SmallButton>
        }
      >
        {data.shuttle_runs.length === 0 ? (
          <Empty>
            Start with one row per event day. Most weddings need 3–5 total
            runs.
          </Empty>
        ) : (
          <div className="space-y-2">
            {data.shuttle_runs.map((r) => (
              <div
                key={r.id}
                className="group grid items-center gap-2 rounded-md border border-ink/10 bg-paper p-2 md:grid-cols-[2fr_1fr_1fr_1fr_70px_24px]"
              >
                <TextInput
                  value={r.route}
                  onChange={(v) => patchShuttle(r.id, { route: v })}
                  placeholder="Marriott → venue"
                />
                <SelectInput
                  value={r.event}
                  onChange={(v) =>
                    patchShuttle(r.id, { event: v as TransportEvent })
                  }
                  options={EVENT_OPTIONS}
                />
                <TimeInput
                  value={r.depart_time}
                  onChange={(v) => patchShuttle(r.id, { depart_time: v })}
                />
                <TimeInput
                  value={r.arrive_time}
                  onChange={(v) => patchShuttle(r.id, { arrive_time: v })}
                />
                <NumberInput
                  value={r.pax}
                  onChange={(v) => patchShuttle(r.id, { pax: v ?? 0 })}
                  placeholder="pax"
                />
                <RemoveButton onClick={() => removeShuttle(r.id)} />
              </div>
            ))}
          </div>
        )}

        {peak > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-saffron/40 bg-saffron-pale/25 p-3 text-[12.5px]">
            <Sparkles size={13} className="mt-0.5 shrink-0 text-saffron" />
            <p className="text-ink">
              Peak passengers in a single run: <strong>{peak}</strong>.{" "}
              <span className="text-ink-muted">
                Recommended vehicle: {peakLabel}.
              </span>
            </p>
          </div>
        )}
      </Section>

      {/* 2. Airport pickups */}
      <Section
        title="Airport pickups"
        eyebrow="Auto-group within 60 min windows"
        action={
          <SmallButton onClick={addPickup}>
            <Plus size={11} /> Add pickup
          </SmallButton>
        }
      >
        {groupable && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-saffron/40 bg-saffron-pale/25 px-3 py-2">
            <Sparkles size={13} className="text-saffron" />
            <p className="flex-1 text-[12.5px] text-ink">
              {data.airport_pickups.length} guest
              {data.airport_pickups.length === 1 ? "" : "s"} flying in.
              {alreadyGrouped
                ? ` Grouped into ${data.computed?.arrival_clusters.length ?? 0} pickup window${(data.computed?.arrival_clusters.length ?? 0) === 1 ? "" : "s"}.`
                : ` Group into pickup windows by arrival time.`}
            </p>
            {alreadyGrouped ? (
              <button
                type="button"
                onClick={clearAutoGroup}
                className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint hover:text-saffron"
              >
                Clear groups
              </button>
            ) : (
              <button
                type="button"
                onClick={applyAutoGroup}
                className="inline-flex items-center gap-1 rounded-sm border border-saffron bg-paper px-2 py-1 text-[11px] text-saffron hover:bg-saffron hover:text-white"
              >
                <Sparkles size={11} /> Auto-group
              </button>
            )}
          </div>
        )}

        {data.airport_pickups.length === 0 ? (
          <Empty>
            Each flight-in guest becomes one row. Group arrivals within a
            60-minute window into a shared pickup to save cost.
          </Empty>
        ) : (
          <div className="space-y-2">
            {data.airport_pickups.map((p) => (
              <div
                key={p.id}
                className="group grid items-center gap-2 rounded-md border border-ink/10 bg-paper p-2 md:grid-cols-[2fr_1.4fr_1.4fr_1.4fr_24px]"
              >
                <TextInput
                  value={p.guest_label}
                  onChange={(v) => patchPickup(p.id, { guest_label: v })}
                  placeholder="Nani + Nana"
                />
                <TextInput
                  value={p.flight_info ?? ""}
                  onChange={(v) => patchPickup(p.id, { flight_info: v })}
                  placeholder="AI 101 · DEL→DFW"
                />
                <DateTimeInput
                  value={p.arrival_datetime}
                  onChange={(v) => patchPickup(p.id, { arrival_datetime: v })}
                />
                <SelectInput
                  value={p.transport_type}
                  onChange={(v) =>
                    patchPickup(p.id, {
                      transport_type: v as AirportPickupTransport,
                    })
                  }
                  options={TRANSPORT_TYPE_OPTIONS}
                />
                <RemoveButton onClick={() => removePickup(p.id)} />
              </div>
            ))}
          </div>
        )}

        {alreadyGrouped && (data.computed?.arrival_clusters.length ?? 0) > 0 && (
          <div className="mt-3 rounded-md border border-ink/10 bg-ivory-soft p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Suggested pickup windows
            </p>
            <ul className="mt-2 space-y-1 text-[12.5px] text-ink">
              {data.computed!.arrival_clusters.map((c, i) => (
                <li key={`${c.window_start}-${i}`}>
                  Window {i + 1} · {fmtClusterRange(c)} · {c.guest_count}{" "}
                  guest
                  {c.guest_count === 1 ? "" : "s"} ({c.total_pax} pax)
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* 3. VIP moves */}
      <Section
        title="VIP & family moves"
        eyebrow="Bride / parents / grandparents"
        action={
          <SmallButton onClick={addVip}>
            <Plus size={11} /> Add move
          </SmallButton>
        }
      >
        {data.vip_moves.length === 0 ? (
          <Empty>
            Grandparents, bride's parents, out-of-town VIPs. Drivers need to
            know who to wait for.
          </Empty>
        ) : (
          <div className="space-y-2">
            {data.vip_moves.map((v) => (
              <div
                key={v.id}
                className="group grid items-center gap-2 rounded-md border border-ink/10 bg-paper p-2 md:grid-cols-[1.5fr_1.5fr_1fr_90px_1fr_24px]"
              >
                <TextInput
                  value={v.move_label}
                  onChange={(val) => patchVip(v.id, { move_label: val })}
                  placeholder="Grandparents → venue"
                />
                <TextInput
                  value={v.who}
                  onChange={(val) => patchVip(v.id, { who: val })}
                  placeholder="Dadi + Nana-Nani"
                />
                <SelectInput
                  value={v.event}
                  onChange={(val) =>
                    patchVip(v.id, { event: val as TransportEvent })
                  }
                  options={EVENT_OPTIONS}
                />
                <TimeInput
                  value={v.time}
                  onChange={(val) => patchVip(v.id, { time: val })}
                />
                <TextInput
                  value={v.vehicle_assigned ?? ""}
                  onChange={(val) =>
                    patchVip(v.id, { vehicle_assigned: val })
                  }
                  placeholder="Bridal car"
                />
                <RemoveButton onClick={() => removeVip(v.id)} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Accessibility */}
      <Section title="Accessibility" eyebrow="Elderly / mobility-impaired">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Guests needing help">
            <NumberInput
              value={data.accessibility.elderly_or_mobility_count}
              onChange={(v) =>
                patchData({
                  accessibility: {
                    ...data.accessibility,
                    elderly_or_mobility_count: v ?? 0,
                  },
                })
              }
              placeholder="0"
            />
          </Field>
          <Field label="Accessible vehicle needed?">
            <Toggle
              label="Yes"
              checked={data.accessibility.accessible_vehicle_needed}
              onChange={(v) =>
                patchData({
                  accessibility: {
                    ...data.accessibility,
                    accessible_vehicle_needed: v,
                  },
                })
              }
            />
          </Field>
          {data.accessibility.accessible_vehicle_needed && (
            <Field label="Vehicle type required">
              <TextInput
                value={data.accessibility.vehicle_type_required ?? ""}
                onChange={(v) =>
                  patchData({
                    accessibility: {
                      ...data.accessibility,
                      vehicle_type_required: v,
                    },
                  })
                }
                placeholder="Wheelchair-accessible van"
              />
            </Field>
          )}
        </div>
      </Section>

      {/* 5. Post-event return shuttle */}
      <Section
        title="Post-event return"
        eyebrow="The last ride home matters"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Return shuttle needed?">
            <Toggle
              label="Yes"
              checked={data.post_event_return.needed}
              onChange={(v) =>
                patchData({
                  post_event_return: { ...data.post_event_return, needed: v },
                })
              }
            />
          </Field>
          {data.post_event_return.needed && (
            <>
              <Field label="Last shuttle time">
                <TimeInput
                  value={data.post_event_return.last_shuttle_time ?? ""}
                  onChange={(v) =>
                    patchData({
                      post_event_return: {
                        ...data.post_event_return,
                        last_shuttle_time: v,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Notes">
                <TextInput
                  value={data.post_event_return.notes ?? ""}
                  onChange={(v) =>
                    patchData({
                      post_event_return: {
                        ...data.post_event_return,
                        notes: v,
                      },
                    })
                  }
                  placeholder="Two waves: 11pm and 1am"
                />
              </Field>
            </>
          )}
        </div>
        {lateNightWarn && (
          <SoftWarning>
            Last shuttle is before 10pm. Receptions usually run later — make
            sure no one's stranded.
          </SoftWarning>
        )}
      </Section>
    </div>
  );
}

function fmtClusterRange(c: ArrivalClusterSummary): string {
  const fmt = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  return `${fmt(c.window_start)} – ${fmt(c.window_end)}`;
}

// ─── Block primitives ────────────────────────────────────────────────────

function Section({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {eyebrow}
            </p>
          )}
          <h3 className="mt-1 font-serif text-xl text-ink">{title}</h3>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-[12.5px] italic text-ink-faint">{children}</p>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[12.5px]"
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : undefined)
      }
      placeholder={placeholder}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[12.5px] tabular-nums"
    />
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 font-mono text-[12px]"
    />
  );
}

function DateTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 font-mono text-[11.5px]"
    />
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[12.5px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px]",
        checked
          ? "border-sage bg-sage/10 text-sage"
          : "border-ink/15 bg-paper text-ink-muted hover:border-rose/40",
      )}
    >
      <span
        className={cn(
          "h-3 w-3 rounded-sm border",
          checked ? "border-sage bg-sage" : "border-ink/30 bg-white",
        )}
      />
      {label}
    </button>
  );
}

function SmallButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-sm border border-ink/15 bg-paper px-2 py-1 text-[11px] text-ink hover:border-rose/40 hover:text-rose"
    >
      {children}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
    >
      <Trash2 size={12} strokeWidth={1.8} />
    </button>
  );
}

function SoftWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 p-3 text-[13px]">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber" />
      <p className="leading-snug text-ink">{children}</p>
    </div>
  );
}
