"use client";

// ── Baraat tab ─────────────────────────────────────────────────────────────
// The groom's procession from hotel to mandap is the most public 20 minutes
// of the wedding and the hardest thing to retcon on the day. This tab walks
// through it top-to-bottom in the order people actually think:
//
//   1. Overview      — where, when, how long
//   2. Participants  — who's in the mob
//   3. Horse/vehicle — the centerpiece
//   4. Road & venue  — permits, permissions, road closure
//   5. Music         — dhol timing + DJ handoff point
//   6. Timing coord  — bride ready, photog in place, milni, ceremony
//
// Persists as WorkspaceItems on tab "baraat":
//   • one `kind: "plan"` item carrying every structured field
//   • many `kind: "participant"` items (checkbox list)

import { useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Footprints,
  Music2,
  Plus,
  Route,
  ShieldAlert,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import {
  PanelCard,
  Eyebrow,
  MiniStat,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

// ── Meta shapes ────────────────────────────────────────────────────────────

interface PlanMeta {
  kind?: "plan";
  // Overview
  start_point?: string;
  end_point?: string;
  route_description?: string;
  duration?: string;
  start_time?: string;
  end_time?: string;
  // Horse / vehicle
  vehicle_type?: "" | "horse" | "car" | "walking" | "elephant";
  horse_vendor?: string;
  horse_arrival_time?: string;
  handler_stays?: boolean;
  groom_outfit?: string;
  practice_noted?: boolean;
  // Road / venue coordination
  venue_allows?: "yes" | "no" | "unknown" | "";
  road_closure?: "yes" | "no" | "na" | "";
  police_escort?: "yes" | "no" | "na" | "";
  noise_permit?: "yes" | "no" | "na" | "";
  venue_coord_note?: string;
  // Music
  dhol_start?: string;
  dhol_end?: string;
  bluetooth_backup?: string;
  dj_handoff_point?: string;
  // Timing coordination
  bride_ready_by?: string;
  photog_at_start?: string;
  videog_at_entrance?: string;
  milni_time?: string;
  ceremony_begins?: string;
}

interface ParticipantMeta {
  kind?: "participant";
  label?: string;
  done?: boolean;
  note?: string;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_PARTICIPANTS: string[] = [
  "Groom (on horse / in car / walking)",
  "Groom's family (dancing, 30–40 people)",
  "Dhol players (2) — linked to Music workspace",
  "Photographer + videographer — walking ahead, capturing",
  "Flower shower at entrance — decide who throws",
  "Fireworks / crackers — check venue policy first",
];

const VEHICLE_OPTIONS: { value: PlanMeta["vehicle_type"]; label: string }[] = [
  { value: "", label: "Pick one" },
  { value: "horse", label: "Horse" },
  { value: "car", label: "Vintage / decorated car" },
  { value: "walking", label: "Walking" },
  { value: "elephant", label: "Elephant" },
];

const YES_NO_OPTIONS: { value: "yes" | "no" | "na" | "unknown" | ""; label: string }[] = [
  { value: "", label: "—" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "na", label: "N/A" },
];

// ── Component ──────────────────────────────────────────────────────────────

export function BaraatTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const scoped = useMemo(
    () => items.filter((i) => i.category_id === category.id && i.tab === "baraat"),
    [items, category.id],
  );

  const plan = scoped.find((i) => (i.meta as PlanMeta).kind === "plan");
  const planMeta = (plan?.meta ?? {}) as PlanMeta;
  const participants = useMemo(
    () =>
      scoped
        .filter((i) => (i.meta as ParticipantMeta).kind === "participant")
        .sort((a, b) => a.sort_order - b.sort_order),
    [scoped],
  );
  const participantsDone = participants.filter(
    (p) => (p.meta as ParticipantMeta).done,
  ).length;

  // ── Mutators ────────────────────────────────────────────────────────────

  const ensurePlan = (): string | null => {
    if (plan) return plan.id;
    if (!canEdit) return null;
    const id = crypto.randomUUID?.() ?? `plan-${Date.now()}`;
    addItem({
      category_id: category.id,
      tab: "baraat",
      block_type: "baraat_slot",
      title: "Baraat procession plan",
      meta: { kind: "plan" } satisfies PlanMeta,
      sort_order: 0,
    });
    return id;
  };

  const patchPlan = (p: Partial<PlanMeta>) => {
    if (!canEdit) return;
    ensurePlan();
    const current = useWorkspaceStore
      .getState()
      .items.find((i) => i.category_id === category.id && i.tab === "baraat" && (i.meta as PlanMeta).kind === "plan");
    if (!current) return;
    updateItem(current.id, { meta: { ...(current.meta ?? {}), ...p } });
  };

  const seedParticipants = () => {
    if (!canEdit || participants.length > 0) return;
    DEFAULT_PARTICIPANTS.forEach((label, i) =>
      addItem({
        category_id: category.id,
        tab: "baraat",
        block_type: "baraat_slot",
        title: label,
        meta: { kind: "participant", label, done: false } satisfies ParticipantMeta,
        sort_order: 100 + i,
      }),
    );
  };

  const addParticipant = () => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "baraat",
      block_type: "baraat_slot",
      title: "New participant",
      meta: { kind: "participant", done: false } satisfies ParticipantMeta,
      sort_order: 100 + participants.length,
    });
  };

  const toggleParticipant = (p: WorkspaceItem) => {
    const meta = (p.meta ?? {}) as ParticipantMeta;
    updateItem(p.id, { meta: { ...meta, done: !meta.done } });
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        The most public 20 minutes of the wedding happen in the street.
        Over-plan it — permits, crowd safety, photographer position, the
        dhol player's arrival window.
      </p>

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Start" value={planMeta.start_time || "—"} tone="saffron" />
        <MiniStat label="Milni / arrival" value={planMeta.milni_time || "—"} tone="saffron" />
        <MiniStat
          label="Vehicle"
          value={
            planMeta.vehicle_type
              ? VEHICLE_OPTIONS.find((v) => v.value === planMeta.vehicle_type)?.label ?? "—"
              : "—"
          }
        />
        <MiniStat
          label="Participants ready"
          value={`${participantsDone}/${participants.length || 0}`}
          tone={
            participants.length > 0 && participantsDone === participants.length
              ? "sage"
              : "ink"
          }
        />
      </div>

      {/* ── 1. Overview ────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Route size={14} strokeWidth={1.8} />}
        title="Your groom's arrival"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Start point">
            <TextInput
              value={planMeta.start_point ?? ""}
              onChange={(v) => patchPlan({ start_point: v })}
              placeholder="Hotel lobby → parking lot"
              disabled={!canEdit}
            />
          </Field>
          <Field label="End point">
            <TextInput
              value={planMeta.end_point ?? ""}
              onChange={(v) => patchPlan({ end_point: v })}
              placeholder="Venue entrance — mandap walkway"
              disabled={!canEdit}
            />
          </Field>
          <Field label="Route description" className="md:col-span-2">
            <TextInput
              value={planMeta.route_description ?? ""}
              onChange={(v) => patchPlan({ route_description: v })}
              placeholder="Hotel exit → right on Main St (100 yards) → venue gate"
              disabled={!canEdit}
            />
          </Field>
          <Field label="Start time">
            <TimeInput
              value={planMeta.start_time ?? ""}
              onChange={(v) => patchPlan({ start_time: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="End time">
            <TimeInput
              value={planMeta.end_time ?? ""}
              onChange={(v) => patchPlan({ end_time: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Duration">
            <TextInput
              value={planMeta.duration ?? ""}
              onChange={(v) => patchPlan({ duration: v })}
              placeholder="30 minutes"
              disabled={!canEdit}
            />
          </Field>
        </div>
      </PanelCard>

      {/* ── 2. Participants ──────────────────────────────────────────── */}
      <PanelCard
        icon={<UsersRound size={14} strokeWidth={1.8} />}
        title="Participants"
        badge={
          canEdit ? (
            <div className="flex gap-1">
              {participants.length === 0 && (
                <ActionButton icon={<Plus size={12} strokeWidth={1.8} />} onClick={seedParticipants}>
                  Use defaults
                </ActionButton>
              )}
              <ActionButton icon={<Plus size={12} strokeWidth={1.8} />} onClick={addParticipant}>
                Add
              </ActionButton>
            </div>
          ) : undefined
        }
      >
        {participants.length === 0 ? (
          <Empty>
            Seed the default list or add your own. Confirm each participant
            has been briefed and is where they need to be.
          </Empty>
        ) : (
          <ul className="divide-y divide-border/60">
            {participants.map((p) => {
              const meta = (p.meta ?? {}) as ParticipantMeta;
              return (
                <li key={p.id} className="group flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleParticipant(p)}
                    disabled={!canEdit}
                    aria-label="Toggle"
                    className={cn(
                      "text-ink-faint transition-colors hover:text-saffron disabled:cursor-not-allowed",
                      meta.done && "text-sage",
                    )}
                  >
                    {meta.done ? (
                      <CheckCircle2 size={15} strokeWidth={1.8} />
                    ) : (
                      <Circle size={15} strokeWidth={1.8} />
                    )}
                  </button>
                  <input
                    value={meta.label ?? p.title}
                    onChange={(e) => {
                      const label = e.target.value;
                      updateItem(p.id, {
                        title: label,
                        meta: { ...meta, label },
                      });
                    }}
                    disabled={!canEdit}
                    className={cn(
                      "flex-1 border-0 bg-transparent px-1 py-0.5 text-[12.5px] focus:outline-none disabled:opacity-60",
                      meta.done ? "text-ink-muted line-through" : "text-ink",
                    )}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteItem(p.id)}
                      className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>

      {/* ── 3. Horse / Vehicle ───────────────────────────────────────── */}
      <PanelCard
        icon={<Footprints size={14} strokeWidth={1.8} />}
        title="Horse / vehicle"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Vehicle type">
            <Select
              value={planMeta.vehicle_type ?? ""}
              onChange={(v) => patchPlan({ vehicle_type: v as PlanMeta["vehicle_type"] })}
              options={VEHICLE_OPTIONS.map((o) => ({ value: o.value ?? "", label: o.label }))}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Rental vendor">
            <TextInput
              value={planMeta.horse_vendor ?? ""}
              onChange={(v) => patchPlan({ horse_vendor: v })}
              placeholder="Vendor name"
              disabled={!canEdit}
            />
          </Field>
          <Field label="Arrives on-site by">
            <TimeInput
              value={planMeta.horse_arrival_time ?? ""}
              onChange={(v) => patchPlan({ horse_arrival_time: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Groom's outfit">
            <TextInput
              value={planMeta.groom_outfit ?? ""}
              onChange={(v) => patchPlan({ groom_outfit: v })}
              placeholder="Sherwani + safa + sword"
              disabled={!canEdit}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Toggle
            label="Handler stays with horse through the ceremony"
            checked={!!planMeta.handler_stays}
            onChange={(v) => patchPlan({ handler_stays: v })}
            disabled={!canEdit}
          />
          <Toggle
            label="Practice getting on and off the horse before wedding day"
            checked={!!planMeta.practice_noted}
            onChange={(v) => patchPlan({ practice_noted: v })}
            disabled={!canEdit}
            tone="amber"
          />
        </div>
      </PanelCard>

      {/* ── 4. Road / Venue Coordination ─────────────────────────────── */}
      <PanelCard
        icon={<ShieldAlert size={14} strokeWidth={1.8} />}
        title="Road & venue coordination"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Venue allows Baraat on property">
            <Select
              value={planMeta.venue_allows ?? ""}
              onChange={(v) => patchPlan({ venue_allows: v as PlanMeta["venue_allows"] })}
              options={[
                { value: "", label: "—" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No — work around" },
                { value: "unknown", label: "Need to ask" },
              ]}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Road closure required">
            <Select
              value={planMeta.road_closure ?? ""}
              onChange={(v) => patchPlan({ road_closure: v as PlanMeta["road_closure"] })}
              options={YES_NO_OPTIONS}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Police escort">
            <Select
              value={planMeta.police_escort ?? ""}
              onChange={(v) => patchPlan({ police_escort: v as PlanMeta["police_escort"] })}
              options={YES_NO_OPTIONS}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Noise permit">
            <Select
              value={planMeta.noise_permit ?? ""}
              onChange={(v) => patchPlan({ noise_permit: v as PlanMeta["noise_permit"] })}
              options={YES_NO_OPTIONS}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Coordination note" className="md:col-span-2">
            <TextInput
              value={planMeta.venue_coord_note ?? ""}
              onChange={(v) => patchPlan({ venue_coord_note: v })}
              placeholder="Venue allows on-grounds; no permit needed — under event permit"
              disabled={!canEdit}
            />
          </Field>
        </div>
      </PanelCard>

      {/* ── 5. Music ──────────────────────────────────────────────────── */}
      <PanelCard icon={<Music2 size={14} strokeWidth={1.8} />} title="Music">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Dhol starts">
            <TimeInput
              value={planMeta.dhol_start ?? ""}
              onChange={(v) => patchPlan({ dhol_start: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Dhol ends">
            <TimeInput
              value={planMeta.dhol_end ?? ""}
              onChange={(v) => patchPlan({ dhol_end: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="DJ handoff point">
            <TextInput
              value={planMeta.dj_handoff_point ?? ""}
              onChange={(v) => patchPlan({ dj_handoff_point: v })}
              placeholder="Venue entrance — Milni"
              disabled={!canEdit}
            />
          </Field>
          <Field label="Bluetooth backup playlist" className="md:col-span-3">
            <TextInput
              value={planMeta.bluetooth_backup ?? ""}
              onChange={(v) => patchPlan({ bluetooth_backup: v })}
              placeholder="Bhangra · 'Baraat 2026' playlist on Spotify"
              disabled={!canEdit}
            />
          </Field>
        </div>
      </PanelCard>

      {/* ── 6. Timing Coordination ───────────────────────────────────── */}
      <PanelCard
        icon={<Clock size={14} strokeWidth={1.8} />}
        title="Timing coordination"
        badge={<Tag tone="stone">Everyone else's clock</Tag>}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Bride ready by">
            <TimeInput
              value={planMeta.bride_ready_by ?? ""}
              onChange={(v) => patchPlan({ bride_ready_by: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Photographer at start">
            <TimeInput
              value={planMeta.photog_at_start ?? ""}
              onChange={(v) => patchPlan({ photog_at_start: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Videographer at entrance">
            <TimeInput
              value={planMeta.videog_at_entrance ?? ""}
              onChange={(v) => patchPlan({ videog_at_entrance: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Milni (family greeting)">
            <TimeInput
              value={planMeta.milni_time ?? ""}
              onChange={(v) => patchPlan({ milni_time: v })}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Ceremony begins">
            <TimeInput
              value={planMeta.ceremony_begins ?? ""}
              onChange={(v) => patchPlan({ ceremony_begins: v })}
              disabled={!canEdit}
            />
          </Field>
        </div>
      </PanelCard>
    </div>
  );
}

// ── Shared tiny inputs ─────────────────────────────────────────────────────

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
    <div className={cn("space-y-1.5", className)}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
    />
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
      style={{ fontFamily: "var(--font-mono)" }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
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
  disabled,
  tone,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  tone?: "amber";
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-sm border border-transparent px-1.5 py-1 text-[12.5px] transition-colors",
        disabled && "cursor-not-allowed opacity-60",
        tone === "amber" && !checked && "text-amber-700",
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        aria-label="Toggle"
        disabled={disabled}
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked
            ? "border-sage bg-sage text-white"
            : tone === "amber"
              ? "border-amber-400 bg-amber-50"
              : "border-ink-faint bg-white hover:border-saffron",
        )}
      >
        {checked && <CheckCircle2 size={11} strokeWidth={2.5} />}
      </button>
      <span className={cn(checked ? "text-ink-muted line-through" : "text-ink")}>
        {label}
      </span>
    </label>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-[12px] italic text-ink-faint">{children}</p>;
}

function ActionButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
    >
      {icon}
      {children}
    </button>
  );
}
