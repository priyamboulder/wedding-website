"use client";

// ── Build Session 1 · Baraat walkthrough ──────────────────────────────────
// The marquee feature. Walks the couple through the most public 20 minutes
// of the wedding in operational depth: route, participants, horse/vehicle,
// road & venue coordination (permits with auto-suggested deadlines), music
// timing, and ready-by clocks for everyone whose schedule pivots on it.
//
// Pre-seeds:
//   • baraat_happening from Vision baraat_intent.happening
//   • participants[] with the 4 standard rows
//   • permit_application_deadline = wedding_date − 60 days
//   • dhol_players label + count from Music workspace (best-effort)
//
// Skip behaviour: when baraat_happening is false (from Vision or set here),
// the entire session collapses to a "No baraat" state with a "We changed
// our mind" toggle.

import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  BARAAT_DEFAULT_PARTICIPANTS,
  PRACTICE_REQUIRED_VEHICLES,
  TRANSPORTATION_BUILD_CATEGORY,
  TRANSPORTATION_BUILD_JOURNEY_ID,
  newBuildId,
  type BaraatParticipant,
  type BaraatVehicleType,
  type BaraatWalkthroughComputed,
  type BaraatWalkthroughFormData,
  type PermitsStatus,
  type YesNoTbd,
} from "@/lib/guided-journeys/transportation-build";
import {
  DEFAULT_PERMIT_LEAD_DAYS,
  permitApplicationDeadline,
  permitUrgency,
} from "@/lib/calculators/permit-deadlines";
import { useAuthStore } from "@/stores/auth-store";
import type { WorkspaceCategory } from "@/types/workspace";

const VEHICLE_OPTIONS: Array<{ value: BaraatVehicleType | ""; label: string }> = [
  { value: "", label: "Pick one" },
  { value: "horse", label: "Horse" },
  { value: "vintage_car", label: "Vintage car" },
  { value: "convertible", label: "Convertible" },
  { value: "elephant", label: "Elephant" },
  { value: "walking", label: "Walking" },
  { value: "other", label: "Other" },
];

const YES_NO_TBD_OPTIONS: Array<{ value: YesNoTbd; label: string }> = [
  { value: "tbd", label: "TBD" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

function emptyForm(): BaraatWalkthroughFormData {
  return {
    baraat_happening: true,
    route: {
      start_point: "",
      end_point: "",
      route_description: "",
      start_time: "",
      end_time: "",
      duration_minutes: 0,
    },
    participants: [],
    optional_moments: {
      flower_shower_at_entrance: { wanted: false },
      fireworks: { wanted: false, venue_allows: null },
    },
    vehicle: {
      type: "",
      handler_stays_with_horse: false,
      practice_session_scheduled: false,
    },
    road_venue: {
      venue_allows_baraat_on_property: "tbd",
      road_closure_required: "tbd",
      police_escort: "tbd",
      noise_permit: "tbd",
    },
    music: {
      dhol_starts: "",
      dhol_ends: "",
    },
    timing_coordination: {
      bride_ready_by: "",
      photographer_at_start: "",
      videographer_at_entrance: "",
    },
  };
}

function compute(data: BaraatWalkthroughFormData): BaraatWalkthroughComputed {
  const total = data.participants.length;
  const confirmed = data.participants.filter((p) => p.confirmed).length;

  const pending: PermitsStatus[] = [];
  if (data.road_venue.road_closure_required === "tbd")
    pending.push("pending_road_closure");
  if (data.road_venue.police_escort === "tbd")
    pending.push("pending_police_escort");
  if (data.road_venue.noise_permit === "tbd") pending.push("pending_noise");

  let permits_status: PermitsStatus;
  if (!data.baraat_happening) permits_status = "na";
  else if (pending.length === 0) permits_status = "all_clear";
  else if (pending.length === 1) permits_status = pending[0];
  else permits_status = "multiple_pending";

  return {
    participants_confirmed_count: confirmed,
    participants_total_count: total,
    permits_status,
  };
}

export function BaraatWalkthroughSession({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );
  const weddingDate = useAuthStore((s) => s.user?.wedding?.weddingDate);

  // Read or initialise the session data. Pre-seed baraat_happening from
  // Vision intent on first hydration.
  const data = useMemo<BaraatWalkthroughFormData>(() => {
    const stored = state.formData["baraat_walkthrough"] as
      | Partial<BaraatWalkthroughFormData>
      | undefined;
    if (stored && Object.keys(stored).length > 0) {
      return { ...emptyForm(), ...stored } as BaraatWalkthroughFormData;
    }
    const visionNeeds = state.formData["transport_needs"] as
      | { baraat_intent?: { happening?: boolean } }
      | undefined;
    return {
      ...emptyForm(),
      baraat_happening: visionNeeds?.baraat_intent?.happening ?? true,
    };
  }, [state.formData]);

  // First-render seed: write the hydrated form back so the rest of the
  // session reads from form_data going forward.
  useEffect(() => {
    if (!state.formData["baraat_walkthrough"]) {
      writeAll(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-suggest the permit_application_deadline from the wedding date on
  // first render, when not already set.
  useEffect(() => {
    if (!weddingDate) return;
    if (data.road_venue.permit_application_deadline) return;
    const deadline = permitApplicationDeadline({ event_date: weddingDate });
    if (deadline) {
      writePath("road_venue.permit_application_deadline", deadline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingDate]);

  // ─── Mutators ─────────────────────────────────────────────────────────

  function writeAll(next: BaraatWalkthroughFormData) {
    const c = compute(next);
    update((s) => setSessionFormPath(s, "baraat_walkthrough", "", next));
    update((s) =>
      setSessionFormPath(s, "baraat_walkthrough", "computed", c),
    );
  }

  function writePath(path: string, value: unknown) {
    update((s) => setSessionFormPath(s, "baraat_walkthrough", path, value));
    // Recompute after any write — cheap.
    const next = readNext(state.formData["baraat_walkthrough"], path, value);
    update((s) =>
      setSessionFormPath(s, "baraat_walkthrough", "computed", compute(next)),
    );
  }

  function setHappening(v: boolean) {
    writePath("baraat_happening", v);
    if (v && data.participants.length === 0) {
      seedDefaultParticipants();
    }
  }

  function seedDefaultParticipants() {
    const seeded: BaraatParticipant[] = BARAAT_DEFAULT_PARTICIPANTS.map((p) => ({
      id: p.id,
      label: p.label,
      confirmed: false,
      custom: false,
    }));
    writePath("participants", seeded);
  }

  function addParticipant() {
    const next: BaraatParticipant[] = [
      ...data.participants,
      {
        id: newBuildId("participant"),
        label: "New participant",
        confirmed: false,
        custom: true,
      },
    ];
    writePath("participants", next);
  }

  function patchParticipant(id: string, patch: Partial<BaraatParticipant>) {
    const next = data.participants.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    writePath("participants", next);
  }

  function removeParticipant(id: string) {
    writePath(
      "participants",
      data.participants.filter((p) => p.id !== id),
    );
  }

  // ─── Skip state ────────────────────────────────────────────────────────

  if (!data.baraat_happening) {
    return (
      <SkipState
        onResume={() => {
          setHappening(true);
        }}
      />
    );
  }

  const showPracticeDate =
    data.vehicle.type !== "" &&
    PRACTICE_REQUIRED_VEHICLES.has(data.vehicle.type as BaraatVehicleType);

  const deadline = data.road_venue.permit_application_deadline;
  const urgency = permitUrgency(deadline);

  return (
    <div className="space-y-6">
      {/* Header note */}
      <div className="rounded-md border border-ink/10 bg-paper p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
              ✦ The marquee moment
            </p>
            <p className="mt-1 text-[13px] italic text-ink-muted">
              The most public 20 minutes of the wedding happen in the street.
              Over-plan it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHappening(false)}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose"
          >
            We're not doing a baraat
          </button>
        </div>
      </div>

      {/* 1. Route */}
      <Section title="Route" eyebrow="Where, when, how long">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Start point">
            <TextInput
              value={data.route.start_point}
              onChange={(v) => writePath("route.start_point", v)}
              placeholder="Hotel lobby → parking lot"
            />
          </Field>
          <Field label="End point">
            <TextInput
              value={data.route.end_point}
              onChange={(v) => writePath("route.end_point", v)}
              placeholder="Venue entrance — mandap walkway"
            />
          </Field>
          <Field label="Route description" className="md:col-span-2">
            <TextInput
              value={data.route.route_description}
              onChange={(v) => writePath("route.route_description", v)}
              placeholder="Hotel exit → right on Main St (100 yards) → venue gate"
            />
          </Field>
          <Field label="Start time">
            <TimeInput
              value={data.route.start_time}
              onChange={(v) => writePath("route.start_time", v)}
            />
          </Field>
          <Field label="End time">
            <TimeInput
              value={data.route.end_time}
              onChange={(v) => writePath("route.end_time", v)}
            />
          </Field>
          <Field label="Duration (min)">
            <NumberInput
              value={data.route.duration_minutes}
              onChange={(v) => writePath("route.duration_minutes", v ?? 0)}
              placeholder="20"
            />
          </Field>
        </div>
      </Section>

      {/* 2. Participants */}
      <Section
        title="Participants"
        eyebrow="Who's in the procession"
        action={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {data.computed?.participants_confirmed_count ?? 0}/
              {data.computed?.participants_total_count ?? 0} ready
            </span>
            {data.participants.length === 0 && (
              <SmallButton onClick={seedDefaultParticipants}>
                <Sparkles size={11} /> Seed defaults
              </SmallButton>
            )}
            <SmallButton onClick={addParticipant}>
              <Plus size={11} /> Add
            </SmallButton>
          </div>
        }
      >
        {data.participants.length === 0 ? (
          <p className="py-2 text-[12.5px] italic text-ink-faint">
            Seed the four standard participants — groom, family, dhol players,
            photo/video. Confirm each as ready when briefed.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {data.participants.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-3 py-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    patchParticipant(p.id, { confirmed: !p.confirmed })
                  }
                  aria-label="Toggle confirmed"
                  className={cn(
                    "text-ink-faint transition-colors hover:text-rose",
                    p.confirmed && "text-sage",
                  )}
                >
                  {p.confirmed ? (
                    <CheckCircle2 size={15} strokeWidth={1.8} />
                  ) : (
                    <Circle size={15} strokeWidth={1.8} />
                  )}
                </button>
                <input
                  value={p.label}
                  onChange={(e) =>
                    patchParticipant(p.id, { label: e.target.value })
                  }
                  className={cn(
                    "flex-1 border-0 bg-transparent px-1 py-0.5 text-[12.5px] focus:outline-none",
                    p.confirmed ? "text-ink-muted line-through" : "text-ink",
                  )}
                />
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove participant"
                >
                  <Trash2 size={12} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 2b. Optional moments */}
      <Section title="Optional moments" eyebrow="Add if it's right">
        <div className="space-y-3">
          <Toggle
            label="Flower shower at entrance"
            checked={data.optional_moments.flower_shower_at_entrance.wanted}
            onChange={(v) =>
              writePath(
                "optional_moments.flower_shower_at_entrance.wanted",
                v,
              )
            }
          />
          {data.optional_moments.flower_shower_at_entrance.wanted && (
            <Field label="Who throws?">
              <TextInput
                value={
                  data.optional_moments.flower_shower_at_entrance.who_throws ??
                  ""
                }
                onChange={(v) =>
                  writePath(
                    "optional_moments.flower_shower_at_entrance.who_throws",
                    v,
                  )
                }
                placeholder="Cousins on bride's side"
              />
            </Field>
          )}
          <Toggle
            label="Fireworks"
            checked={data.optional_moments.fireworks.wanted}
            onChange={(v) => writePath("optional_moments.fireworks.wanted", v)}
          />
          {data.optional_moments.fireworks.wanted && (
            <Field label="Venue allows fireworks?">
              <SelectInput
                value={
                  data.optional_moments.fireworks.venue_allows === true
                    ? "yes"
                    : data.optional_moments.fireworks.venue_allows === false
                      ? "no"
                      : "tbd"
                }
                onChange={(v) =>
                  writePath(
                    "optional_moments.fireworks.venue_allows",
                    v === "yes" ? true : v === "no" ? false : null,
                  )
                }
                options={YES_NO_TBD_OPTIONS}
              />
            </Field>
          )}
        </div>
      </Section>

      {/* 3. Vehicle */}
      <Section title="Horse / vehicle" eyebrow="The centerpiece">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Vehicle type">
            <SelectInput
              value={data.vehicle.type}
              onChange={(v) => writePath("vehicle.type", v)}
              options={VEHICLE_OPTIONS}
            />
          </Field>
          <Field label="Rental vendor">
            <TextInput
              value={data.vehicle.rental_vendor ?? ""}
              onChange={(v) => writePath("vehicle.rental_vendor", v)}
              placeholder="Royal Stables"
            />
          </Field>
          <Field label="Arrives on-site by">
            <TimeInput
              value={data.vehicle.arrives_on_site_by ?? ""}
              onChange={(v) => writePath("vehicle.arrives_on_site_by", v)}
            />
          </Field>
          <Field label="Groom's outfit">
            <TextInput
              value={data.vehicle.grooms_outfit_note ?? ""}
              onChange={(v) => writePath("vehicle.grooms_outfit_note", v)}
              placeholder="Sherwani + safa + sword"
            />
          </Field>
        </div>
        <div className="mt-4 space-y-2">
          <Toggle
            label="Handler stays with horse through the ceremony"
            checked={data.vehicle.handler_stays_with_horse}
            onChange={(v) => writePath("vehicle.handler_stays_with_horse", v)}
          />
          <Toggle
            label="Practice getting on and off before wedding day"
            checked={data.vehicle.practice_session_scheduled}
            onChange={(v) =>
              writePath("vehicle.practice_session_scheduled", v)
            }
            tone="amber"
          />
          {showPracticeDate && data.vehicle.practice_session_scheduled && (
            <Field label="Practice date">
              <DateInput
                value={data.vehicle.practice_date ?? ""}
                onChange={(v) => writePath("vehicle.practice_date", v)}
              />
            </Field>
          )}
        </div>
      </Section>

      {/* 4. Road & venue coordination */}
      <Section
        title="Road & venue coordination"
        eyebrow="Permits, permissions, road closure"
        icon={<ShieldAlert size={14} className="text-amber" />}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Venue allows baraat on property">
            <SelectInput
              value={data.road_venue.venue_allows_baraat_on_property}
              onChange={(v) =>
                writePath("road_venue.venue_allows_baraat_on_property", v)
              }
              options={YES_NO_TBD_OPTIONS}
            />
          </Field>
          <Field label="Road closure required">
            <SelectInput
              value={data.road_venue.road_closure_required}
              onChange={(v) => writePath("road_venue.road_closure_required", v)}
              options={YES_NO_TBD_OPTIONS}
            />
          </Field>
          <Field label="Police escort">
            <SelectInput
              value={data.road_venue.police_escort}
              onChange={(v) => writePath("road_venue.police_escort", v)}
              options={YES_NO_TBD_OPTIONS}
            />
          </Field>
          <Field label="Noise permit">
            <SelectInput
              value={data.road_venue.noise_permit}
              onChange={(v) => writePath("road_venue.noise_permit", v)}
              options={YES_NO_TBD_OPTIONS}
            />
          </Field>
          <Field label="Coordination note" className="md:col-span-2">
            <TextInput
              value={data.road_venue.coordination_note ?? ""}
              onChange={(v) => writePath("road_venue.coordination_note", v)}
              placeholder="On venue grounds — covered by event permit"
            />
          </Field>
          <Field
            label={`Permit application deadline (default: wedding − ${DEFAULT_PERMIT_LEAD_DAYS} days)`}
            className="md:col-span-2"
          >
            <DateInput
              value={data.road_venue.permit_application_deadline ?? ""}
              onChange={(v) =>
                writePath("road_venue.permit_application_deadline", v)
              }
            />
          </Field>
        </div>
        {urgency === "tight" && (
          <SoftWarning>
            Permit deadline is within 14 days. Submit applications now if you
            haven't.
          </SoftWarning>
        )}
        {urgency === "overdue" && (
          <SoftWarning tone="urgent">
            Permit deadline has passed. Contact the city immediately for
            emergency processing.
          </SoftWarning>
        )}
      </Section>

      {/* 5. Music */}
      <Section title="Music" eyebrow="Dhol timing & DJ handoff">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Dhol starts">
            <TimeInput
              value={data.music.dhol_starts}
              onChange={(v) => writePath("music.dhol_starts", v)}
            />
          </Field>
          <Field label="Dhol ends">
            <TimeInput
              value={data.music.dhol_ends}
              onChange={(v) => writePath("music.dhol_ends", v)}
            />
          </Field>
          <Field label="DJ handoff point">
            <TextInput
              value={data.music.dj_handoff_point ?? ""}
              onChange={(v) => writePath("music.dj_handoff_point", v)}
              placeholder="Venue entrance — Milni"
            />
          </Field>
          <Field label="Bluetooth backup playlist" className="md:col-span-3">
            <TextInput
              value={data.music.bluetooth_backup_playlist ?? ""}
              onChange={(v) => writePath("music.bluetooth_backup_playlist", v)}
              placeholder="Bhangra · 'Baraat 2026' playlist on Spotify"
            />
          </Field>
        </div>
      </Section>

      {/* 6. Timing coordination */}
      <Section title="Timing coordination" eyebrow="Everyone else's clock">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Bride ready by">
            <TimeInput
              value={data.timing_coordination.bride_ready_by}
              onChange={(v) => writePath("timing_coordination.bride_ready_by", v)}
            />
          </Field>
          <Field label="Photographer at start">
            <TimeInput
              value={data.timing_coordination.photographer_at_start}
              onChange={(v) =>
                writePath("timing_coordination.photographer_at_start", v)
              }
            />
          </Field>
          <Field label="Videographer at entrance">
            <TimeInput
              value={data.timing_coordination.videographer_at_entrance}
              onChange={(v) =>
                writePath("timing_coordination.videographer_at_entrance", v)
              }
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

// Helpers — readNext rebuilds form state with one field set, used for
// recomputing computed{} after a path write.
function readNext(
  prev: Record<string, unknown> | undefined,
  path: string,
  value: unknown,
): BaraatWalkthroughFormData {
  const base = (prev ?? {}) as Record<string, unknown>;
  if (path === "") return value as BaraatWalkthroughFormData;
  const segs = path.split(".");
  const next: Record<string, unknown> = JSON.parse(JSON.stringify(base));
  let cur: Record<string, unknown> = next;
  for (let i = 0; i < segs.length - 1; i += 1) {
    const k = segs[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[segs[segs.length - 1]] = value;
  return { ...emptyForm(), ...(next as Partial<BaraatWalkthroughFormData>) };
}

// ─── Skip state ──────────────────────────────────────────────────────────

function SkipState({ onResume }: { onResume: () => void }) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Baraat skipped
      </p>
      <p className="mt-2 text-[14px] text-ink-muted">
        No baraat — the rest of this session is hidden. You can resume any
        time.
      </p>
      <button
        type="button"
        onClick={onResume}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-rose/40 bg-paper px-3 py-1.5 text-[12px] text-rose hover:bg-rose-pale/30"
      >
        We changed our mind — start the walkthrough
      </button>
    </div>
  );
}

// ─── Block primitives ────────────────────────────────────────────────────

function Section({
  title,
  eyebrow,
  icon,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  icon?: React.ReactNode;
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
          <h3 className="mt-1 flex items-center gap-2 font-serif text-xl text-ink">
            {icon}
            {title}
          </h3>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
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
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
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
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
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
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 font-mono text-[12.5px]"
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
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
      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
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
  tone,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tone?: "amber";
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-[12.5px]">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked
            ? "border-sage bg-sage text-white"
            : tone === "amber"
              ? "border-amber/40 bg-amber/10"
              : "border-ink/30 bg-white",
        )}
        aria-label="Toggle"
      >
        {checked && <CheckCircle2 size={11} strokeWidth={2.5} />}
      </button>
      <span className={cn(checked ? "text-ink-muted line-through" : "text-ink")}>
        {label}
      </span>
    </label>
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

function SoftWarning({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "urgent";
}) {
  return (
    <div
      className={cn(
        "mt-3 flex items-start gap-2 rounded-md p-3 text-[13px]",
        tone === "urgent"
          ? "border border-rose/40 bg-rose-pale/50"
          : "border border-amber/40 bg-amber/10",
      )}
    >
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber" />
      <p className="leading-snug text-ink">{children}</p>
    </div>
  );
}
