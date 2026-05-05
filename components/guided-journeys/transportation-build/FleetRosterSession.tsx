"use client";

// ── Build Session 3 · Fleet roster ────────────────────────────────────────
// Combines Tab 1's "Family & couple fleet" section with vendor parking
// flags and day-of driver assignments. Pre-seeds 3 standard rows
// (bridal car, baraat vehicle, getaway car) conditional on Vision flags.
//
// Hard warning: when must-have vehicles are still uncontracted with less
// than 3 months until the wedding, surfaces a loud alert. This is the
// single biggest day-of operational failure point in the entire workspace.

import { useEffect, useMemo } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  FLEET_HARD_WARNING_THRESHOLD_MONTHS,
  FLEET_PRIORITY_LABEL,
  TRANSPORT_EVENT_LABEL,
  TRANSPORTATION_BUILD_CATEGORY,
  TRANSPORTATION_BUILD_JOURNEY_ID,
  newBuildId,
  type DriverAssignment,
  type DriverShift,
  type FleetPriority,
  type FleetRosterComputed,
  type FleetRosterFormData,
  type FleetVehicle,
  type GuestMovementMathFormData,
  type TransportEvent,
} from "@/lib/guided-journeys/transportation-build";
import { useAuthStore } from "@/stores/auth-store";
import type { WorkspaceCategory } from "@/types/workspace";

const PRIORITY_OPTIONS: Array<{ value: FleetPriority; label: string }> = (
  Object.keys(FLEET_PRIORITY_LABEL) as FleetPriority[]
).map((k) => ({ value: k, label: FLEET_PRIORITY_LABEL[k] }));

const EVENT_OPTIONS: Array<{ value: TransportEvent; label: string }> = (
  Object.keys(TRANSPORT_EVENT_LABEL) as TransportEvent[]
).map((k) => ({ value: k, label: TRANSPORT_EVENT_LABEL[k] }));

function emptyForm(): FleetRosterFormData {
  return {
    fleet: [],
    vendor_parking: {
      needed: false,
      vendors_needing_parking: [],
    },
    driver_assignments: [],
  };
}

function compute(
  data: FleetRosterFormData,
  movement?: Partial<GuestMovementMathFormData>,
): FleetRosterComputed {
  const total = data.fleet.length;
  const contracted = data.fleet.filter((v) => v.contracted).length;
  const pending = total - contracted;
  const must_have_uncontracted = data.fleet.filter(
    (v) => v.priority === "must" && !v.contracted,
  ).length;

  const drivers_assigned_count = data.driver_assignments.length;

  // Coverage gaps: events that have shuttle_runs / vip_moves but no driver
  // shift assigned.
  const coveredEvents = new Set<TransportEvent>();
  for (const d of data.driver_assignments) {
    for (const s of d.shifts ?? []) coveredEvents.add(s.event);
  }
  const requiredEvents = new Set<TransportEvent>();
  for (const r of movement?.shuttle_runs ?? []) requiredEvents.add(r.event);
  for (const v of movement?.vip_moves ?? []) requiredEvents.add(v.event);
  const coverage_gaps: string[] = [];
  for (const e of requiredEvents) {
    if (!coveredEvents.has(e))
      coverage_gaps.push(TRANSPORT_EVENT_LABEL[e] ?? e);
  }

  return {
    total_vehicles: total,
    contracted_count: contracted,
    pending_count: pending,
    must_have_uncontracted,
    drivers_assigned_count,
    coverage_gaps,
  };
}

function monthsUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  return (
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  );
}

export function FleetRosterSession({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );
  const weddingDate = useAuthStore((s) => s.user?.wedding?.weddingDate);
  const monthsLeft = monthsUntil(weddingDate);

  const data = useMemo<FleetRosterFormData>(() => {
    const stored = state.formData["fleet_roster"] as
      | Partial<FleetRosterFormData>
      | undefined;
    if (stored && Object.keys(stored).length > 0) {
      return { ...emptyForm(), ...stored } as FleetRosterFormData;
    }
    return emptyForm();
  }, [state.formData]);

  const movement = state.formData["guest_movement_math"] as
    | Partial<GuestMovementMathFormData>
    | undefined;

  // Pre-seed: 3 standard rows + vendor parking, conditional on Vision.
  useEffect(() => {
    if (state.formData["fleet_roster"]) return;
    const visionNeeds = state.formData["transport_needs"] as
      | {
          baraat_intent?: { happening?: boolean };
          getaway_car?: { wanted?: boolean; style_preference?: string };
          vendor_transport_flags?: {
            dhol_players_need_transport?: boolean;
            other_vendors_need_transport?: boolean;
            notes?: string;
          };
        }
      | undefined;

    const seeded = emptyForm();
    seeded.fleet.push({
      id: newBuildId("fleet"),
      priority: "must",
      vehicle: "Bridal car",
      role: "Bride arrival",
      quantity: 1,
      contracted: false,
    });
    if (visionNeeds?.baraat_intent?.happening) {
      seeded.fleet.push({
        id: newBuildId("fleet"),
        priority: "must",
        vehicle: "Groom's baraat vehicle",
        role: "Baraat",
        quantity: 1,
        contracted: false,
      });
    }
    if (visionNeeds?.getaway_car?.wanted) {
      seeded.fleet.push({
        id: newBuildId("fleet"),
        priority: "preferred",
        vehicle: visionNeeds.getaway_car.style_preference || "Getaway car",
        role: "Reception exit",
        quantity: 1,
        contracted: false,
      });
    }

    // Vendor parking pre-seed
    const flags = visionNeeds?.vendor_transport_flags;
    const initialVendors: string[] = [];
    if (flags?.dhol_players_need_transport) initialVendors.push("Dhol players");
    if (flags?.other_vendors_need_transport && flags.notes) {
      for (const v of flags.notes.split(/[,;]/).map((s) => s.trim())) {
        if (v) initialVendors.push(v);
      }
    }
    if (initialVendors.length > 0) {
      seeded.vendor_parking = {
        needed: true,
        vendors_needing_parking: initialVendors,
      };
    }

    writeAll(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Mutators ─────────────────────────────────────────────────────────

  function writeAll(next: FleetRosterFormData) {
    update((s) => setSessionFormPath(s, "fleet_roster", "", next));
    update((s) =>
      setSessionFormPath(s, "fleet_roster", "computed", compute(next, movement)),
    );
  }

  function patchData(patch: Partial<FleetRosterFormData>) {
    writeAll({ ...data, ...patch });
  }

  function addVehicle() {
    patchData({
      fleet: [
        ...data.fleet,
        {
          id: newBuildId("fleet"),
          priority: "preferred",
          vehicle: "",
          role: "",
          quantity: 1,
          contracted: false,
        },
      ],
    });
  }

  function patchVehicle(id: string, patch: Partial<FleetVehicle>) {
    patchData({
      fleet: data.fleet.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    });
  }

  function removeVehicle(id: string) {
    patchData({ fleet: data.fleet.filter((v) => v.id !== id) });
  }

  function addParkingVendor() {
    const v = window.prompt("Vendor name");
    if (!v) return;
    patchData({
      vendor_parking: {
        ...data.vendor_parking,
        needed: true,
        vendors_needing_parking: [
          ...data.vendor_parking.vendors_needing_parking,
          v,
        ],
      },
    });
  }

  function removeParkingVendor(name: string) {
    patchData({
      vendor_parking: {
        ...data.vendor_parking,
        vendors_needing_parking:
          data.vendor_parking.vendors_needing_parking.filter((x) => x !== name),
      },
    });
  }

  function addDriver() {
    patchData({
      driver_assignments: [
        ...data.driver_assignments,
        {
          id: newBuildId("driver"),
          driver_name: "",
          contact: "",
          vehicle_assigned: "",
          shifts: [],
        },
      ],
    });
  }

  function patchDriver(id: string, patch: Partial<DriverAssignment>) {
    patchData({
      driver_assignments: data.driver_assignments.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    });
  }

  function removeDriver(id: string) {
    patchData({
      driver_assignments: data.driver_assignments.filter((d) => d.id !== id),
    });
  }

  function addShift(driverId: string) {
    const driver = data.driver_assignments.find((d) => d.id === driverId);
    if (!driver) return;
    patchDriver(driverId, {
      shifts: [
        ...driver.shifts,
        { event: "wedding", start_time: "", end_time: "", role: "" },
      ],
    });
  }

  function patchShift(
    driverId: string,
    idx: number,
    patch: Partial<DriverShift>,
  ) {
    const driver = data.driver_assignments.find((d) => d.id === driverId);
    if (!driver) return;
    const shifts = driver.shifts.map((s, i) =>
      i === idx ? { ...s, ...patch } : s,
    );
    patchDriver(driverId, { shifts });
  }

  function removeShift(driverId: string, idx: number) {
    const driver = data.driver_assignments.find((d) => d.id === driverId);
    if (!driver) return;
    patchDriver(driverId, {
      shifts: driver.shifts.filter((_, i) => i !== idx),
    });
  }

  // ─── Hard warning trigger ─────────────────────────────────────────────

  const mustUnc = data.computed?.must_have_uncontracted ?? 0;
  const showHardWarning =
    mustUnc > 0 &&
    monthsLeft != null &&
    monthsLeft < FLEET_HARD_WARNING_THRESHOLD_MONTHS;

  return (
    <div className="space-y-6">
      {showHardWarning && (
        <HardWarning>
          {mustUnc} must-have vehicle{mustUnc === 1 ? "" : "s"} still
          uncontracted with {monthsLeft} month{monthsLeft === 1 ? "" : "s"} to
          go. Wedding transport is the single biggest day-of failure point —
          lock contracts now.
        </HardWarning>
      )}

      {/* Header note */}
      <div className="rounded-md border border-ink/10 bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
          ✦ The closer
        </p>
        <p className="mt-1 text-[13px] italic text-ink-muted">
          Family fleet, vendor parking, and who drives what on the day.
        </p>
      </div>

      {/* 1. Family & couple fleet */}
      <Section
        title="Family & couple fleet"
        eyebrow="Vehicles tied to the family"
        action={
          <SmallButton onClick={addVehicle}>
            <Plus size={11} /> Add vehicle
          </SmallButton>
        }
      >
        {data.fleet.length === 0 ? (
          <Empty>
            Bridal car, groom's horse/car, reception exit. Guest shuttles
            live in the previous session.
          </Empty>
        ) : (
          <div className="space-y-2">
            {data.fleet.map((v) => (
              <div
                key={v.id}
                className="group grid items-center gap-2 rounded-md border border-ink/10 bg-paper p-2 md:grid-cols-[110px_2fr_1.4fr_70px_1.4fr_90px_24px]"
              >
                <SelectInput
                  value={v.priority}
                  onChange={(val) =>
                    patchVehicle(v.id, { priority: val as FleetPriority })
                  }
                  options={PRIORITY_OPTIONS}
                />
                <TextInput
                  value={v.vehicle}
                  onChange={(val) => patchVehicle(v.id, { vehicle: val })}
                  placeholder="Vintage Rolls Royce"
                />
                <TextInput
                  value={v.role}
                  onChange={(val) => patchVehicle(v.id, { role: val })}
                  placeholder="Bridal · family · exit"
                />
                <NumberInput
                  value={v.quantity}
                  onChange={(val) =>
                    patchVehicle(v.id, { quantity: val ?? 1 })
                  }
                  placeholder="1"
                />
                <TextInput
                  value={v.vendor ?? ""}
                  onChange={(val) => patchVehicle(v.id, { vendor: val })}
                  placeholder="Vendor"
                />
                <ContractedToggle
                  contracted={v.contracted}
                  onChange={(val) => patchVehicle(v.id, { contracted: val })}
                />
                <RemoveButton onClick={() => removeVehicle(v.id)} />
              </div>
            ))}
          </div>
        )}

        {data.computed && data.fleet.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-md border border-ink/10 bg-ivory-soft p-3 text-[12px]">
            <Stat label="Total" value={`${data.computed.total_vehicles}`} />
            <Stat
              label="Contracted"
              value={`${data.computed.contracted_count}`}
            />
            <Stat
              label="Pending"
              value={`${data.computed.pending_count}`}
              tone={data.computed.pending_count > 0 ? "amber" : "ink"}
            />
          </div>
        )}
      </Section>

      {/* 2. Vendor parking */}
      <Section title="Vendor parking" eyebrow="Reserved spots, gear loading">
        <div className="space-y-3">
          <Toggle
            label="Vendors need parking reserved"
            checked={data.vendor_parking.needed}
            onChange={(v) =>
              patchData({
                vendor_parking: { ...data.vendor_parking, needed: v },
              })
            }
          />
          {data.vendor_parking.needed && (
            <>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  Vendors needing parking
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {data.vendor_parking.vendors_needing_parking.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-ivory-soft px-2 py-1 text-[11.5px] text-ink"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => removeParkingVendor(v)}
                        aria-label={`Remove ${v}`}
                        className="text-ink-faint hover:text-rose"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <SmallButton onClick={addParkingVendor}>
                    <Plus size={11} /> Add
                  </SmallButton>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Reserved spots count">
                  <NumberInput
                    value={data.vendor_parking.reserved_spots_count}
                    onChange={(v) =>
                      patchData({
                        vendor_parking: {
                          ...data.vendor_parking,
                          reserved_spots_count: v,
                        },
                      })
                    }
                    placeholder="6"
                  />
                </Field>
                <Field label="Parking location">
                  <TextInput
                    value={data.vendor_parking.parking_location ?? ""}
                    onChange={(v) =>
                      patchData({
                        vendor_parking: {
                          ...data.vendor_parking,
                          parking_location: v,
                        },
                      })
                    }
                    placeholder="Behind kitchen entrance"
                  />
                </Field>
                <Field label="Venue coordination note" className="md:col-span-2">
                  <TextInput
                    value={data.vendor_parking.venue_coordination_note ?? ""}
                    onChange={(v) =>
                      patchData({
                        vendor_parking: {
                          ...data.vendor_parking,
                          venue_coordination_note: v,
                        },
                      })
                    }
                    placeholder="Confirmed with venue manager"
                  />
                </Field>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 3. Driver assignments */}
      <Section
        title="Driver assignments"
        eyebrow="One driver per vehicle, shifts per event"
        action={
          <SmallButton onClick={addDriver}>
            <Plus size={11} /> Add driver
          </SmallButton>
        }
      >
        {data.driver_assignments.length === 0 ? (
          <Empty>
            Assign a driver to each vehicle. Each driver can have multiple
            shifts spanning haldi, mehendi, sangeet, wedding, reception.
          </Empty>
        ) : (
          <div className="space-y-3">
            {data.driver_assignments.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-ink/10 bg-paper p-3"
              >
                <div className="grid items-center gap-2 md:grid-cols-[1.2fr_1.2fr_1.6fr_24px]">
                  <TextInput
                    value={d.driver_name}
                    onChange={(v) => patchDriver(d.id, { driver_name: v })}
                    placeholder="Driver name"
                  />
                  <TextInput
                    value={d.contact}
                    onChange={(v) => patchDriver(d.id, { contact: v })}
                    placeholder="(555) 555-1212"
                  />
                  <TextInput
                    value={d.vehicle_assigned}
                    onChange={(v) =>
                      patchDriver(d.id, { vehicle_assigned: v })
                    }
                    placeholder="Vehicle assigned"
                  />
                  <RemoveButton onClick={() => removeDriver(d.id)} />
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                      Shifts
                    </p>
                    <SmallButton onClick={() => addShift(d.id)}>
                      <Plus size={11} /> Add shift
                    </SmallButton>
                  </div>
                  {d.shifts.length === 0 ? (
                    <p className="mt-1.5 text-[12px] italic text-ink-faint">
                      No shifts yet — add one per event this driver covers.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      {d.shifts.map((s, i) => (
                        <div
                          key={i}
                          className="group grid items-center gap-2 md:grid-cols-[1fr_90px_90px_1.5fr_24px]"
                        >
                          <SelectInput
                            value={s.event}
                            onChange={(v) =>
                              patchShift(d.id, i, {
                                event: v as TransportEvent,
                              })
                            }
                            options={EVENT_OPTIONS}
                          />
                          <TimeInput
                            value={s.start_time}
                            onChange={(v) =>
                              patchShift(d.id, i, { start_time: v })
                            }
                          />
                          <TimeInput
                            value={s.end_time}
                            onChange={(v) =>
                              patchShift(d.id, i, { end_time: v })
                            }
                          />
                          <TextInput
                            value={s.role}
                            onChange={(v) =>
                              patchShift(d.id, i, { role: v })
                            }
                            placeholder="Role on this shift"
                          />
                          <RemoveButton onClick={() => removeShift(d.id, i)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.computed && data.computed.coverage_gaps.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 p-3 text-[13px]">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber" />
            <p className="leading-snug text-ink">
              Coverage gap:{" "}
              <strong>{data.computed.coverage_gaps.join(", ")}</strong> ha
              {data.computed.coverage_gaps.length === 1 ? "s" : "ve"} guest
              moves but no driver shift assigned.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
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
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
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

function ContractedToggle({
  contracted,
  onChange,
}: {
  contracted: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!contracted)}
      className={cn(
        "rounded-md border px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em]",
        contracted
          ? "border-sage bg-sage/10 text-sage"
          : "border-amber/40 bg-amber/10 text-amber",
      )}
    >
      {contracted ? "Signed" : "Pending"}
    </button>
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "ink";
}) {
  return (
    <div>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-serif text-[18px] tabular-nums",
          tone === "amber" ? "text-amber" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function HardWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border-2 border-rose bg-rose-pale/60 p-4 text-[13.5px]">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-rose"
        />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
            Hard warning
          </p>
          <p className="mt-1 leading-snug text-ink">{children}</p>
        </div>
      </div>
    </div>
  );
}
