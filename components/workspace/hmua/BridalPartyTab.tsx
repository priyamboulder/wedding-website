"use client";

// ── Hair & Makeup → Family & Bridal Party tab ─────────────────────────────
// The operational planning surface. Two halves:
//   1. People roster — who needs hair / makeup, what level, which events,
//      which artist on the team they're assigned to.
//   2. Schedule grid — chairs (lanes) × time, computed backwards from
//      ceremony_start. Surfaces conflicts: too many people, photographer
//      arrival overlap, bride-finish overrun.
//
// People are stored as WorkspaceItems (block_type "bridal_party_look"). The
// schedule settings live in useHmuaStore (ceremony time, team size, etc.).
// Groom grooming sits in a separate sub-panel — different timeline, weeks
// out, not chairs-on-the-day.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useHmuaStore } from "@/stores/hmua-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import {
  ChairScheduleOptimizer,
  SmsScheduleDraft,
  StyleQuizPanel,
} from "@/components/workspace/hmua/ai/PartyAi";
import { GettingReadyExperiencePanel } from "@/components/workspace/hmua/GettingReadyExperience";

// ── Types on item.meta ────────────────────────────────────────────────────

type ServiceLevel = "full" | "hair_only" | "makeup_only" | "touchup_only";

type PartySide = "bride" | "groom" | "groom_himself";

interface PartyMeta {
  person?: string;
  role?: string; // Mother of bride, Bridesmaid, Flower girl, …
  side?: PartySide; // explicit override; otherwise inferred from role
  events?: string[]; // event labels
  service_level?: ServiceLevel;
  assigned_artist?: string; // artist id from useHmuaStore
  chair_minutes?: number; // override
  cost_cents?: number; // optional
  notes?: string;
  is_bride?: boolean; // marks this row as the bride for scheduling
}

const ROLE_OPTIONS = [
  "Bride",
  "Mother of Bride",
  "Mother of Groom",
  "Sister",
  "Brother",
  "Bridesmaid",
  "Flower Girl",
  "Mother-in-law",
  "Groom",
  "Other",
];

// Roles whose default side is the bride's. Everything else defaults to
// the groom's side; "Groom" itself is promoted to its own section.
const BRIDE_SIDE_ROLES = new Set([
  "Bride",
  "Mother of Bride",
  "Sister",
  "Bridesmaid",
  "Flower Girl",
]);

function inferSide(meta: PartyMeta): PartySide {
  if (meta.side) return meta.side;
  if (meta.is_bride) return "bride";
  const role = meta.role ?? "";
  if (role === "Groom") return "groom_himself";
  if (BRIDE_SIDE_ROLES.has(role)) return "bride";
  if (!role) return "bride";
  return "groom";
}

const SIDE_LABEL: Record<PartySide, string> = {
  bride: "Bride side",
  groom: "Groom side",
  groom_himself: "Groom",
};

const SIDE_ORDER: PartySide[] = ["bride", "groom", "groom_himself"];

const SERVICE_LABEL: Record<ServiceLevel, string> = {
  full: "Full glam (hair + makeup)",
  hair_only: "Hair only",
  makeup_only: "Makeup only",
  touchup_only: "Touch-up only",
};

const SERVICE_TONE: Record<ServiceLevel, string> = {
  full: "border border-rose/40 bg-rose-pale/40 text-rose",
  hair_only: "border border-amber-300 bg-amber-50 text-amber-700",
  makeup_only: "border border-sage/40 bg-sage-pale/40 text-sage",
  touchup_only: "border border-stone-300 bg-stone-50 text-stone-600",
};

// ── Time helpers ──────────────────────────────────────────────────────────

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function fmtTime(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

// ── Root ─────────────────────────────────────────────────────────────────

export function HmuaBridalPartyTab({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const people = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "bridal_party" &&
            i.block_type === "bridal_party_look",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  const handleAdd = (role?: string) => {
    addItem({
      category_id: category.id,
      tab: "bridal_party",
      block_type: "bridal_party_look",
      title: role ?? "Person",
      meta: {
        role: role ?? "",
        events: ["Wedding"],
        service_level: "full" as ServiceLevel,
        is_bride: role === "Bride",
      } satisfies PartyMeta,
      sort_order: people.length + 1,
    });
  };

  const hasBride = people.some((p) => (p.meta as PartyMeta)?.is_bride);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The day-of plan
          </p>
          <h2 className="mt-1 font-serif font-bold text-[22px] leading-tight text-ink">
            Everyone in a chair, in the right order
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Indian weddings: 8–12 people, 3 artists, working backwards from a
            ceremony time that cannot move. Add the people, set the ceremony,
            and we'll lay out the chairs.
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {!hasBride && (
              <button
                type="button"
                onClick={() => handleAdd("Bride")}
                className="rounded-md border border-saffron bg-saffron-pale/30 px-3 py-1.5 text-[12px] font-medium text-saffron hover:bg-saffron-pale/60"
              >
                + Add bride
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAdd()}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
            >
              <Plus size={13} strokeWidth={1.8} />
              Add person
            </button>
          </div>
        )}
      </header>

      <ScheduleSettingsCard categoryId={category.id} canEdit={canEdit} />

      <PeopleRoster people={people} categoryId={category.id} canEdit={canEdit} />

      <ScheduleGrid people={people} categoryId={category.id} />

      <ChairScheduleOptimizer category={category} />

      <SmsScheduleDraft category={category} />

      <StyleQuizPanel category={category} />

      <GettingReadyExperiencePanel categoryId={category.id} canEdit={canEdit} />

      <GroomGroomingPanel categoryId={category.id} canEdit={canEdit} />
    </div>
  );
}

// ── Schedule settings ─────────────────────────────────────────────────────

function ScheduleSettingsCard({
  categoryId,
  canEdit,
}: {
  categoryId: string;
  canEdit: boolean;
}) {
  const settings = useHmuaStore((s) => s.getSchedule(categoryId));
  const set = useHmuaStore((s) => s.setSchedule);
  const setArtistName = useHmuaStore((s) => s.setArtistName);

  return (
    <PanelCard
      icon={<Clock size={14} strokeWidth={1.8} />}
      title="Schedule settings"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <TimeField
          label="Ceremony start"
          value={settings.ceremony_start}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { ceremony_start: v })}
        />
        <TimeField
          label="Bride ready by"
          value={settings.bride_ready_by}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { bride_ready_by: v })}
        />
        <TimeField
          label="Team arrival"
          value={settings.team_arrival}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { team_arrival: v })}
        />
        <NumberField
          label="Artists"
          min={1}
          max={6}
          value={settings.artist_count}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { artist_count: v })}
        />
        <NumberField
          label="Bride chair (min)"
          min={30}
          max={300}
          step={15}
          value={settings.bride_chair_minutes}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { bride_chair_minutes: v })}
        />
        <NumberField
          label="Default per-person (min)"
          min={20}
          max={180}
          step={5}
          value={settings.default_chair_minutes}
          canEdit={canEdit}
          onChange={(v) => set(categoryId, { default_chair_minutes: v })}
        />
      </div>

      <div className="mt-4">
        <Eyebrow>Artists on the team</Eyebrow>
        <div className="mt-1.5 space-y-1.5">
          {settings.artists.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  ARTIST_LANE_COLOR[idx % ARTIST_LANE_COLOR.length],
                )}
              />
              <input
                value={a.name}
                disabled={!canEdit}
                onChange={(e) => setArtistName(categoryId, a.id, e.target.value)}
                placeholder={`Artist ${idx + 1}`}
                className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}

const ARTIST_LANE_COLOR = [
  "bg-saffron",
  "bg-sage",
  "bg-rose",
  "bg-amber-400",
  "bg-stone-500",
  "bg-ink-soft",
];

const ARTIST_LANE_BAR = [
  "bg-saffron-pale/80 border-saffron text-saffron",
  "bg-sage-pale/80 border-sage text-sage",
  "bg-rose-pale/80 border-rose text-rose",
  "bg-amber-50 border-amber-300 text-amber-700",
  "bg-stone-100 border-stone-400 text-stone-700",
  "bg-ivory-warm border-ink-soft text-ink",
];

// ── People roster ────────────────────────────────────────────────────────

function PeopleRoster({
  people,
  categoryId,
  canEdit,
}: {
  people: WorkspaceItem[];
  categoryId: string;
  canEdit: boolean;
}) {
  const settings = useHmuaStore((s) => s.getSchedule(categoryId));
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  if (people.length === 0) {
    return (
      <PanelCard icon={<Users size={14} strokeWidth={1.8} />} title="People">
        <EmptyRow>
          Add the bride first, then everyone else who needs a chair.
        </EmptyRow>
      </PanelCard>
    );
  }

  // Bucket by side (explicit override > inferred from role).
  const buckets: Record<PartySide, WorkspaceItem[]> = {
    bride: [],
    groom: [],
    groom_himself: [],
  };
  for (const person of people) {
    const meta = (person.meta ?? {}) as PartyMeta;
    buckets[inferSide(meta)].push(person);
  }

  const totalCostCents = people.reduce(
    (sum, p) => sum + (((p.meta ?? {}) as PartyMeta).cost_cents ?? 0),
    0,
  );

  return (
    <PanelCard
      icon={<Users size={14} strokeWidth={1.8} />}
      title={`Beauty roster (${people.length})`}
      badge={
        totalCostCents > 0 && (
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Total: {formatCents(totalCostCents)}
          </span>
        )
      }
    >
      <div className="space-y-4">
        {SIDE_ORDER.map((side) => {
          const group = buckets[side];
          if (group.length === 0) return null;
          const groupCost = group.reduce(
            (sum, p) => sum + (((p.meta ?? {}) as PartyMeta).cost_cents ?? 0),
            0,
          );
          return (
            <section key={side}>
              <header className="mb-1.5 flex items-center justify-between">
                <Eyebrow>{SIDE_LABEL[side]}</Eyebrow>
                <span
                  className="font-mono text-[10px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {group.length} {group.length === 1 ? "person" : "people"}
                  {groupCost > 0 && ` · ${formatCents(groupCost)}`}
                </span>
              </header>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[820px] text-[12.5px]">
                  <thead className="bg-ivory-warm/40">
                    <tr className="border-b border-border/60 text-left">
                      <Th>Person</Th>
                      <Th>Role</Th>
                      <Th>Events</Th>
                      <Th>Service</Th>
                      <Th>Artist</Th>
                      <Th>Chair min</Th>
                      <Th>Cost</Th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((p) => (
                      <PersonRow
                        key={p.id}
                        person={p}
                        artists={settings.artists}
                        defaultChairMinutes={settings.default_chair_minutes}
                        brideChairMinutes={settings.bride_chair_minutes}
                        canEdit={canEdit}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </PanelCard>
  );
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function PersonRow({
  person,
  artists,
  defaultChairMinutes,
  brideChairMinutes,
  canEdit,
  onUpdate,
  onDelete,
}: {
  person: WorkspaceItem;
  artists: { id: string; name: string }[];
  defaultChairMinutes: number;
  brideChairMinutes: number;
  canEdit: boolean;
  onUpdate: (id: string, patch: Partial<WorkspaceItem>) => void;
  onDelete: (id: string) => void;
}) {
  const meta = (person.meta ?? {}) as PartyMeta;
  const patchMeta = (patch: Partial<PartyMeta>) =>
    onUpdate(person.id, { meta: { ...(person.meta ?? {}), ...patch } });

  const events = meta.events ?? [];
  const isBride = !!meta.is_bride;
  const chairMinutes = meta.chair_minutes ?? (isBride ? brideChairMinutes : defaultChairMinutes);

  const toggleEvent = (label: string) => {
    const next = events.includes(label)
      ? events.filter((e) => e !== label)
      : [...events, label];
    patchMeta({ events: next });
  };

  return (
    <tr
      className={cn(
        "border-b border-border/40",
        isBride && "bg-saffron-pale/15",
      )}
    >
      <td className="px-2 py-2 align-top">
        <div className="flex items-center gap-1.5">
          {isBride && (
            <Sparkles size={12} strokeWidth={1.8} className="text-saffron" />
          )}
          <input
            value={person.title}
            disabled={!canEdit}
            onChange={(e) => onUpdate(person.id, { title: e.target.value })}
            placeholder="Name"
            className="w-full bg-transparent text-[12.5px] text-ink focus:outline-none disabled:opacity-60"
          />
        </div>
      </td>
      <td className="px-2 py-2 align-top">
        <select
          value={meta.role ?? ""}
          disabled={!canEdit}
          onChange={(e) => {
            const role = e.target.value;
            patchMeta({ role, is_bride: role === "Bride" });
          }}
          className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
        >
          <option value="">—</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex flex-wrap gap-1">
          {WEDDING_EVENTS.map((ev) => {
            const active = events.includes(ev.label);
            return (
              <button
                key={ev.id}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleEvent(ev.label)}
                className={cn(
                  "rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors",
                  active
                    ? "border-saffron bg-saffron-pale/60 text-saffron"
                    : "border-border bg-white text-ink-faint hover:border-saffron/40 hover:text-saffron",
                  !canEdit && "cursor-not-allowed opacity-60",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {ev.label.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </td>
      <td className="px-2 py-2 align-top">
        <select
          value={meta.service_level ?? "full"}
          disabled={!canEdit}
          onChange={(e) =>
            patchMeta({ service_level: e.target.value as ServiceLevel })
          }
          className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
        >
          {(Object.keys(SERVICE_LABEL) as ServiceLevel[]).map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABEL[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <select
          value={meta.assigned_artist ?? ""}
          disabled={!canEdit}
          onChange={(e) => patchMeta({ assigned_artist: e.target.value })}
          className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
        >
          <option value="">Auto-assign</option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <input
          type="number"
          min={5}
          step={5}
          value={chairMinutes}
          disabled={!canEdit}
          onChange={(e) =>
            patchMeta({
              chair_minutes: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-16 rounded-sm border border-border bg-white px-1.5 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex items-center gap-0.5">
          <span
            className="font-mono text-[11px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            $
          </span>
          <input
            type="number"
            min={0}
            step={50}
            value={
              meta.cost_cents !== undefined
                ? Math.round(meta.cost_cents / 100)
                : ""
            }
            disabled={!canEdit}
            onChange={(e) =>
              patchMeta({
                cost_cents: e.target.value
                  ? Math.round(Number(e.target.value) * 100)
                  : undefined,
              })
            }
            placeholder="—"
            className="w-20 rounded-sm border border-border bg-white px-1.5 py-1 font-mono text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </td>
      <td className="px-2 py-2 align-top text-right">
        {canEdit && (
          <button
            type="button"
            onClick={() => onDelete(person.id)}
            className="text-ink-faint hover:text-rose"
            aria-label="Remove person"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
        )}
      </td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

// ── Schedule grid ─────────────────────────────────────────────────────────
// Pure scheduling: pack non-bride people across (artist_count - 1 if bride
// is on lead lane else artist_count) lanes earliest-first. Compute conflicts
// against bride_ready_by + team_arrival.

interface ScheduledBlock {
  personId: string;
  personName: string;
  start: number;     // minutes from midnight
  end: number;
  laneIndex: number;
  serviceLevel: ServiceLevel;
  isBride: boolean;
}

function buildSchedule(
  people: WorkspaceItem[],
  artists: { id: string; name: string }[],
  brideChairMinutes: number,
  defaultChairMinutes: number,
  ceremonyStart: number,
  brideReadyBy: number,
  teamArrival: number,
): { blocks: ScheduledBlock[]; conflicts: string[]; firstStart: number; lastEnd: number } {
  const conflicts: string[] = [];
  const blocks: ScheduledBlock[] = [];
  if (artists.length === 0) {
    return { blocks: [], conflicts: ["Add at least one artist to lay out the schedule."], firstStart: teamArrival, lastEnd: teamArrival };
  }

  // Bride goes on lane 0 (Lead). Bride finishes at brideReadyBy.
  const bride = people.find((p) => (p.meta as PartyMeta)?.is_bride);
  const others = people.filter((p) => !(p.meta as PartyMeta)?.is_bride);

  let lastEnd = teamArrival;

  if (bride) {
    const meta = bride.meta as PartyMeta;
    const dur = meta.chair_minutes ?? brideChairMinutes;
    const brideStart = brideReadyBy - dur;
    blocks.push({
      personId: bride.id,
      personName: bride.title || "Bride",
      start: brideStart,
      end: brideReadyBy,
      laneIndex: 0,
      serviceLevel: meta.service_level ?? "full",
      isBride: true,
    });
    if (brideStart < teamArrival) {
      conflicts.push(
        `Bride needs to be in the chair at ${fmtTime(brideStart)} but the team isn't scheduled to arrive until ${fmtTime(teamArrival)}. Move team arrival earlier.`,
      );
    }
    lastEnd = Math.max(lastEnd, brideReadyBy);
  }

  // Other lanes packed FCFS by sort order.
  const otherLanes = bride && artists.length > 1 ? artists.slice(1) : artists;
  const laneOffset = bride && artists.length > 1 ? 1 : 0;
  const laneNextFree: number[] = otherLanes.map(() => teamArrival);

  // Allow explicit assignment to a specific artist lane when set.
  for (const p of others) {
    const meta = p.meta as PartyMeta;
    const dur = meta.chair_minutes ?? defaultChairMinutes;

    let chosenLaneIdx = -1;
    if (meta.assigned_artist) {
      const idx = artists.findIndex((a) => a.id === meta.assigned_artist);
      if (idx !== -1) {
        chosenLaneIdx = idx;
      }
    }
    if (chosenLaneIdx === -1) {
      // Pick the lane (excluding bride lane 0 if bride exists) with the
      // earliest next-free time.
      let bestLaneInOthers = 0;
      for (let i = 1; i < laneNextFree.length; i++) {
        if (laneNextFree[i]! < laneNextFree[bestLaneInOthers]!) bestLaneInOthers = i;
      }
      chosenLaneIdx = bestLaneInOthers + laneOffset;
    }

    const otherIdx = chosenLaneIdx - laneOffset;
    const start = otherIdx >= 0 && otherIdx < laneNextFree.length
      ? laneNextFree[otherIdx]!
      : teamArrival;
    const end = start + dur;
    blocks.push({
      personId: p.id,
      personName: p.title || meta.role || "Person",
      start,
      end,
      laneIndex: chosenLaneIdx,
      serviceLevel: meta.service_level ?? "full",
      isBride: false,
    });
    if (otherIdx >= 0 && otherIdx < laneNextFree.length) {
      laneNextFree[otherIdx] = end;
    }
    if (end > brideReadyBy) {
      conflicts.push(
        `${p.title || meta.role || "A person"} won't be ready until ${fmtTime(end)} — ${Math.round((end - brideReadyBy))} min after bride is ready.`,
      );
    }
    lastEnd = Math.max(lastEnd, end);
  }

  // Flag if total people exceed the practical 2:1 ratio.
  if (others.length > otherLanes.length * 5) {
    conflicts.push(
      `${others.length} people across ${otherLanes.length} non-bride artist lane${otherLanes.length === 1 ? "" : "s"} is tight. Consider adding an artist.`,
    );
  }

  if (lastEnd > ceremonyStart) {
    conflicts.push(
      `Last person finishes after ceremony start (${fmtTime(ceremonyStart)}). Start earlier or trim services.`,
    );
  }

  const firstStart = blocks.reduce(
    (acc, b) => Math.min(acc, b.start),
    teamArrival,
  );

  return { blocks, conflicts, firstStart, lastEnd };
}

function ScheduleGrid({
  people,
  categoryId,
}: {
  people: WorkspaceItem[];
  categoryId: string;
}) {
  const settings = useHmuaStore((s) => s.getSchedule(categoryId));

  const ceremonyStart = parseTime(settings.ceremony_start);
  const brideReadyBy = parseTime(settings.bride_ready_by);
  const teamArrival = parseTime(settings.team_arrival);

  const { blocks, conflicts, firstStart, lastEnd } = useMemo(
    () =>
      buildSchedule(
        people,
        settings.artists,
        settings.bride_chair_minutes,
        settings.default_chair_minutes,
        ceremonyStart,
        brideReadyBy,
        teamArrival,
      ),
    [
      people,
      settings.artists,
      settings.bride_chair_minutes,
      settings.default_chair_minutes,
      ceremonyStart,
      brideReadyBy,
      teamArrival,
    ],
  );

  if (people.length === 0) {
    return null;
  }

  // Snap visible window to whole hours, padded a bit.
  const windowStart = Math.floor(Math.min(firstStart, teamArrival) / 60) * 60;
  const windowEnd =
    Math.ceil(Math.max(lastEnd, brideReadyBy + 30) / 60) * 60;
  const totalMinutes = Math.max(60, windowEnd - windowStart);

  // Hour ticks
  const hourTicks: number[] = [];
  for (let h = windowStart; h <= windowEnd; h += 60) hourTicks.push(h);

  return (
    <PanelCard
      icon={<Calendar size={14} strokeWidth={1.8} />}
      title="Day-of schedule"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {fmtTime(windowStart)} → {fmtTime(windowEnd)}
        </span>
      }
    >
      {/* Conflicts panel */}
      {conflicts.length === 0 ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-sage/40 bg-sage-pale/30 px-3 py-2">
          <CheckCircle2 size={13} strokeWidth={1.8} className="text-sage" />
          <span className="text-[12px] text-ink">
            No conflicts — everyone is in a chair on time.
          </span>
        </div>
      ) : (
        <div className="mb-4 space-y-1.5">
          {conflicts.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2"
            >
              <AlertTriangle
                size={13}
                strokeWidth={1.8}
                className="mt-0.5 text-rose shrink-0"
              />
              <span className="text-[12px] text-ink">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lane chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour ticks */}
          <div className="relative ml-32 h-5 border-b border-border">
            {hourTicks.map((t) => {
              const left = ((t - windowStart) / totalMinutes) * 100;
              return (
                <span
                  key={t}
                  className="absolute -top-0.5 -translate-x-1/2 font-mono text-[9.5px] text-ink-faint"
                  style={{
                    left: `${left}%`,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {fmtTime(t).replace(":00 ", "").replace(" ", "")}
                </span>
              );
            })}
            {/* Bride-ready marker */}
            <span
              className="absolute top-3 h-2 w-px bg-saffron"
              style={{
                left: `${((brideReadyBy - windowStart) / totalMinutes) * 100}%`,
              }}
            />
            <span
              className="absolute -top-0.5 font-mono text-[9px] text-saffron"
              style={{
                left: `${((brideReadyBy - windowStart) / totalMinutes) * 100}%`,
                fontFamily: "var(--font-mono)",
                transform: "translateX(4px)",
              }}
            >
              ready
            </span>
          </div>

          {/* Lanes */}
          <div className="space-y-1.5 pt-2">
            {settings.artists.map((artist, idx) => {
              const laneBlocks = blocks
                .filter((b) => b.laneIndex === idx)
                .sort((a, b) => a.start - b.start);
              return (
                <div key={artist.id} className="flex items-center gap-2">
                  <div className="w-32 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          ARTIST_LANE_COLOR[idx % ARTIST_LANE_COLOR.length],
                        )}
                      />
                      <span className="text-[12px] font-medium text-ink">
                        {artist.name}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-9 flex-1 rounded-sm bg-ivory-warm/40">
                    {laneBlocks.map((b) => {
                      const left = ((b.start - windowStart) / totalMinutes) * 100;
                      const width = ((b.end - b.start) / totalMinutes) * 100;
                      return (
                        <div
                          key={b.personId}
                          title={`${b.personName} · ${fmtTime(b.start)} → ${fmtTime(b.end)} (${b.end - b.start} min)`}
                          className={cn(
                            "absolute top-1 flex h-7 items-center justify-center overflow-hidden rounded-sm border px-1.5 text-[10.5px] font-medium",
                            ARTIST_LANE_BAR[idx % ARTIST_LANE_BAR.length],
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 4)}%`,
                          }}
                        >
                          <span className="truncate">
                            {b.isBride ? "★ " : ""}
                            {b.personName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] italic text-ink-faint">
        ★ = bride. Hover a block for start/end. The vertical saffron tick marks
        when the bride needs to be ready.
      </p>
    </PanelCard>
  );
}

// ── Groom grooming sub-panel ─────────────────────────────────────────────

function GroomGroomingPanel({
  categoryId,
  canEdit,
}: {
  categoryId: string;
  canEdit: boolean;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const groomItems = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === categoryId &&
            i.tab === "bridal_party" &&
            i.block_type === "note" &&
            i.title.startsWith("[groom-grooming]"),
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, categoryId],
  );

  // Seed default groom timeline if empty (one-time per workspace).
  const seedDefaults = () => {
    const defaults = [
      { label: "Haircut", weeks_before: 2, notes: "Not the day before — too fresh doesn't photograph well" },
      { label: "Facial", weeks_before: 1, notes: "Brightens skin, calms breakouts" },
      { label: "Daily skincare ramp-up", weeks_before: 4, notes: "Moisturizer + sunscreen daily, starting now" },
      { label: "Beard trim", weeks_before: 0, notes: "Day before or morning of — depending on growth rate" },
      { label: "Eyebrow cleanup", weeks_before: 0, notes: "Subtle — most artists do this on the day" },
      { label: "Turban / pagdi tying practice", weeks_before: 1, notes: "Who's tying? Trial run scheduled?" },
    ];
    defaults.forEach((d, idx) => {
      addItem({
        category_id: categoryId,
        tab: "bridal_party",
        block_type: "note",
        title: `[groom-grooming] ${d.label}`,
        meta: { weeks_before: d.weeks_before, notes: d.notes, checked: false },
        sort_order: idx + 100,
      });
    });
  };

  return (
    <PanelCard
      icon={<Scissors size={14} strokeWidth={1.8} />}
      title="Groom grooming timeline"
      badge={
        groomItems.length === 0 && canEdit ? (
          <button
            type="button"
            onClick={seedDefaults}
            className="text-[11px] text-saffron hover:underline"
          >
            Seed defaults
          </button>
        ) : null
      }
    >
      {groomItems.length === 0 ? (
        <EmptyRow>
          The grooming side most weddings forget — haircut weeks (not days)
          before, facial timing, beard cleanup, turban practice.
        </EmptyRow>
      ) : (
        <ul className="space-y-1.5">
          {groomItems.map((g) => {
            const meta = g.meta ?? {};
            const checked = Boolean(meta.checked);
            const weeks = (meta.weeks_before as number | undefined) ?? 0;
            const label = g.title.replace("[groom-grooming]", "").trim();
            return (
              <li
                key={g.id}
                className="group flex items-start gap-2.5 rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-ivory-warm/30"
              >
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() =>
                    updateItem(g.id, {
                      meta: { ...(g.meta ?? {}), checked: !checked },
                    })
                  }
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    checked
                      ? "border-sage bg-sage text-white"
                      : "border-ink-faint bg-white",
                  )}
                  aria-label={checked ? "Mark not done" : "Mark done"}
                >
                  {checked && <span className="text-[10px]">✓</span>}
                </button>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-[12.5px]",
                        checked ? "text-ink-faint line-through" : "text-ink",
                      )}
                    >
                      {label}
                    </span>
                    <Tag tone="stone">
                      {weeks === 0
                        ? "Day-of / day-before"
                        : `${weeks} wk${weeks === 1 ? "" : "s"} before`}
                    </Tag>
                  </div>
                  {meta.notes ? (
                    <p className="text-[11.5px] italic text-ink-muted">
                      {String(meta.notes)}
                    </p>
                  ) : null}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteItem(g.id)}
                    className="text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 size={11} strokeWidth={1.8} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Field helpers ────────────────────────────────────────────────────────

function TimeField({
  label,
  value,
  canEdit,
  onChange,
}: {
  label: string;
  value: string;
  canEdit: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <input
        type="time"
        value={value}
        disabled={!canEdit}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
        style={{ fontFamily: "var(--font-mono)" }}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  canEdit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  canEdit: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={!canEdit}
        onChange={(e) => onChange(Number(e.target.value) || min)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
        style={{ fontFamily: "var(--font-mono)" }}
      />
    </div>
  );
}
