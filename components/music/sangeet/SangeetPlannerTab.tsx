"use client";

// ── Sangeet Planner tab ───────────────────────────────────────────────────
// The Sangeet is a produced variety show. This tab is the production
// workspace for it — performance roster, drag-and-drop running order,
// rehearsal status tracking, AV master sheet aggregation.
//
// Hidden when the couple selects `sangeet-skip` in the vision quiz.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Film,
  GripVertical,
  ListChecks,
  Mic,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import {
  SANGEET_ACT_TYPE_LABEL,
  SANGEET_STATUS_LABEL,
  useSangeetStore,
} from "@/stores/sangeet-store";
import {
  SANGEET_STYLE_LABEL,
  useMusicSoundscapeStore,
} from "@/stores/music-soundscape-store";
import type {
  SangeetAct,
  SangeetActStatus,
  SangeetActType,
} from "@/types/music";

export function SangeetPlannerTab() {
  const sangeetStyle = useMusicSoundscapeStore((s) => s.sangeet_style);

  if (sangeetStyle === "sangeet-skip") {
    return (
      <div className="rounded-lg border border-border bg-ivory-warm/40 p-8 text-center">
        <Sparkles
          size={20}
          strokeWidth={1.5}
          className="mx-auto mb-3 text-saffron"
        />
        <p className="font-serif text-[18px] text-ink">
          You're folding the Sangeet into the reception
        </p>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          The Sangeet Planner is hidden. Manage performance moments inside the
          Reception soundscape instead.
        </p>
      </div>
    );
  }

  return <SangeetPlannerBody />;
}

function SangeetPlannerBody() {
  const rawActs = useSangeetStore((s) => s.acts);
  const acts = useMemo(
    () => [...rawActs].sort((a, b) => a.sort_order - b.sort_order),
    [rawActs],
  );
  const totalMinutes = useSangeetStore((s) => s.total_minutes());
  const unrehearsed = useSangeetStore((s) => s.unrehearsed_count());
  const sangeetStyle = useMusicSoundscapeStore((s) => s.sangeet_style);

  const transitionsAndBuffers = Math.max(0, acts.length - 1) * 2; // 2-min average
  const projected = totalMinutes + transitionsAndBuffers;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Sangeet Planner"
        title="Producer's rundown for your show"
        description={`Running order, rehearsal status, AV requirements. ${SANGEET_STYLE_LABEL[sangeetStyle]}.`}
        right={<Tag tone="saffron">{acts.length} acts</Tag>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Acts" value={acts.length} />
        <MiniStat
          label="Show length"
          value={`${totalMinutes}m`}
          hint={`+ transitions ≈ ${projected}m`}
        />
        <MiniStat
          label="Unrehearsed"
          value={unrehearsed}
          hint="Acts not started"
          tone={unrehearsed > 0 ? "rose" : "sage"}
        />
        <MiniStat
          label="AV peak mics"
          value={maxConcurrentMics(acts)}
          hint="Wireless count needed at peak"
        />
      </div>

      {projected > 75 && (
        <BannerWarn>
          Show is {projected} minutes — most Sangeet audiences lose attention
          past 75. Consider trimming 1–2 acts or shortening longer numbers.
        </BannerWarn>
      )}

      {detectBackToBackHighEnergy(acts) && (
        <BannerWarn>
          Two high-energy dance numbers back-to-back. Inserting a speech or
          slideshow between them gives the audience a breather.
        </BannerWarn>
      )}

      <RunningOrder />

      <AVMasterSheet acts={acts} />

      <RehearsalSchedule acts={acts} />
    </div>
  );
}

// ── Banner ───────────────────────────────────────────────────────────────

function BannerWarn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50/60 p-3">
      <AlertTriangle
        size={14}
        strokeWidth={1.7}
        className="mt-0.5 text-amber-600"
      />
      <p className="text-[12.5px] text-amber-900">{children}</p>
    </div>
  );
}

// ── Running order (sortable list) ────────────────────────────────────────

function RunningOrder() {
  const rawActs = useSangeetStore((s) => s.acts);
  const acts = useMemo(
    () => [...rawActs].sort((a, b) => a.sort_order - b.sort_order),
    [rawActs],
  );
  const reorder = useSangeetStore((s) => s.reorderAct);
  const addAct = useSangeetStore((s) => s.addAct);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <PanelCard
      icon={<ListChecks size={13} strokeWidth={1.7} />}
      title="Running order"
      badge={
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-saffron hover:underline"
        >
          <Plus size={11} strokeWidth={2} /> {showAdd ? "Cancel" : "Add act"}
        </button>
      }
    >
      <div className="space-y-2">
        {acts.length === 0 ? (
          <p className="py-3 text-[12px] italic text-ink-faint">
            No acts yet. Add the first one — emcee welcome is a good opener.
          </p>
        ) : (
          acts.map((act, idx) => (
            <ActCard
              key={act.id}
              act={act}
              index={idx}
              total={acts.length}
              onMove={(dir) => reorder(act.id, dir === "up" ? idx - 1 : idx + 1)}
            />
          ))
        )}
      </div>

      {showAdd && (
        <AddActForm
          onAdd={(input) => {
            addAct(input);
            setShowAdd(false);
          }}
        />
      )}
    </PanelCard>
  );
}

// ── Act card ─────────────────────────────────────────────────────────────

function ActCard({
  act,
  index,
  total,
  onMove,
}: {
  act: SangeetAct;
  index: number;
  total: number;
  onMove: (dir: "up" | "down") => void;
}) {
  const setStatus = useSangeetStore((s) => s.setStatus);
  const updateAct = useSangeetStore((s) => s.updateAct);
  const removeAct = useSangeetStore((s) => s.deleteAct);
  const [open, setOpen] = useState(false);

  const performersConfirmed = act.performers.filter((p) => p.confirmed).length;

  return (
    <div
      className={cn(
        "group rounded-md border bg-white",
        statusBorder(act.status),
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={index === 0}
            aria-label="Move up"
            className="text-ink-faint hover:text-ink disabled:opacity-30"
          >
            <ChevronUp size={13} strokeWidth={1.8} />
          </button>
          <span
            className="font-mono text-[10px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            #{index + 1}
          </span>
          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            aria-label="Move down"
            className="text-ink-faint hover:text-ink disabled:opacity-30"
          >
            <ChevronDown size={13} strokeWidth={1.8} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-start justify-between gap-3 text-left"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-ink">{act.name}</p>
              {act.surprise && (
                <Tag tone="rose">
                  <span className="inline-flex items-center gap-0.5">
                    <EyeOff size={9} strokeWidth={1.8} /> Surprise
                  </span>
                </Tag>
              )}
              <Tag tone="ink">{SANGEET_ACT_TYPE_LABEL[act.type]}</Tag>
              <Tag tone={statusTone(act.status)}>
                {SANGEET_STATUS_LABEL[act.status]}
              </Tag>
            </div>
            <p className="text-[11.5px] text-ink-muted">
              {act.estimated_minutes}m · {performersConfirmed}/
              {act.performers.length} performers confirmed
              {act.songs.length > 0 && ` · ${act.songs.length} song${act.songs.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <GripVertical
            size={13}
            strokeWidth={1.5}
            className="mt-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border/60 px-3 pb-3 pt-3 text-[12px]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <PerformersBlock act={act} />
            <SongsBlock act={act} />
          </div>

          <AVRequirementsBlock act={act} />

          {act.transition_after && (
            <div className="rounded-md bg-ivory-warm/40 px-3 py-2">
              <Eyebrow>Transition after</Eyebrow>
              <p className="mt-1 text-[12px] text-ink-muted">
                {act.transition_after}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-border/40 pt-3">
            <select
              value={act.status}
              onChange={(e) =>
                setStatus(act.id, e.target.value as SangeetActStatus)
              }
              className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-saffron/50 focus:outline-none"
            >
              {(
                [
                  "not_started",
                  "in_rehearsal",
                  "ready",
                  "dress_rehearsal_done",
                ] as SangeetActStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {SANGEET_STATUS_LABEL[s]}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <input
                type="checkbox"
                checked={act.surprise ?? false}
                onChange={(e) =>
                  updateAct(act.id, { surprise: e.target.checked })
                }
              />
              Surprise (hide from couple)
            </label>

            <button
              type="button"
              onClick={() => removeAct(act.id)}
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-ink-faint hover:text-rose"
            >
              <Trash2 size={12} strokeWidth={1.8} /> Remove act
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Performers block ─────────────────────────────────────────────────────

function PerformersBlock({ act }: { act: SangeetAct }) {
  const addPerformer = useSangeetStore((s) => s.addPerformer);
  const updatePerformer = useSangeetStore((s) => s.updatePerformer);
  const remove = useSangeetStore((s) => s.removePerformer);
  const [name, setName] = useState("");

  return (
    <div>
      <Eyebrow>
        <span className="inline-flex items-center gap-1">
          <Users size={10} strokeWidth={1.8} /> Performers
        </span>
      </Eyebrow>
      <ul className="mt-1.5 space-y-1">
        {act.performers.map((p) => (
          <li
            key={p.name}
            className="flex items-center justify-between gap-2 rounded-md bg-ivory-warm/40 px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updatePerformer(act.id, p.name, { confirmed: !p.confirmed })
                }
                aria-label={p.confirmed ? "Mark unconfirmed" : "Mark confirmed"}
                className={cn(
                  "rounded-full p-0.5",
                  p.confirmed ? "text-sage" : "text-ink-faint hover:text-sage",
                )}
              >
                <CheckCircle2 size={13} strokeWidth={1.8} />
              </button>
              <span className="text-[11.5px] text-ink">{p.name}</span>
              {p.note && (
                <span className="text-[10.5px] italic text-ink-muted">
                  ({p.note})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(act.id, p.name)}
              aria-label="Remove performer"
              className="text-ink-faint hover:text-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addPerformer(act.id, { name: name.trim(), confirmed: false });
          setName("");
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add performer name…"
          className="flex-1 rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-ink/90 px-2 py-1 text-[11px] text-ivory hover:bg-ink"
        >
          Add
        </button>
      </form>
    </div>
  );
}

// ── Songs block ──────────────────────────────────────────────────────────

function SongsBlock({ act }: { act: SangeetAct }) {
  const addSong = useSangeetStore((s) => s.addSong);
  const removeSong = useSangeetStore((s) => s.removeSong);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  return (
    <div>
      <Eyebrow>Songs / cues</Eyebrow>
      <ul className="mt-1.5 space-y-1">
        {act.songs.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-md bg-ivory-warm/40 px-2 py-1 text-[11.5px] text-ink"
          >
            <div>
              <p>{s.title}</p>
              {s.artist && (
                <p className="text-[10.5px] text-ink-muted">{s.artist}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeSong(act.id, s.id)}
              aria-label="Remove song"
              className="text-ink-faint hover:text-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 grid grid-cols-2 gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addSong(act.id, {
            title: title.trim(),
            artist: artist.trim() || undefined,
            added_by: "priya",
          });
          setTitle("");
          setArtist("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
          className="rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="submit"
          className="col-span-2 rounded bg-ink/90 px-2 py-1 text-[11px] text-ivory hover:bg-ink"
        >
          Add song
        </button>
      </form>
    </div>
  );
}

// ── AV requirements block ────────────────────────────────────────────────

function AVRequirementsBlock({ act }: { act: SangeetAct }) {
  const update = useSangeetStore((s) => s.updateAct);
  return (
    <div className="rounded-md border border-border/40 bg-white p-2">
      <Eyebrow>AV requirements</Eyebrow>
      <div className="mt-1.5 grid grid-cols-2 gap-2 md:grid-cols-4">
        <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink">
          <input
            type="checkbox"
            checked={act.needs_screen ?? false}
            onChange={(e) => update(act.id, { needs_screen: e.target.checked })}
          />
          Screen
        </label>
        <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink">
          <input
            type="checkbox"
            checked={act.needs_lighting ?? false}
            onChange={(e) =>
              update(act.id, { needs_lighting: e.target.checked })
            }
          />
          Spot lighting
        </label>
        <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink">
          <span>Mics</span>
          <input
            type="number"
            min={0}
            max={12}
            value={act.wireless_mics ?? 0}
            onChange={(e) =>
              update(act.id, { wireless_mics: Number(e.target.value) || 0 })
            }
            className="w-12 rounded border border-border bg-white px-1.5 py-0.5 text-[11.5px] text-ink focus:border-saffron/50 focus:outline-none"
          />
        </label>
        <label className="col-span-2 inline-flex items-center gap-1.5 text-[11.5px] text-ink md:col-span-1">
          <span>Props</span>
          <input
            value={act.props ?? ""}
            onChange={(e) => update(act.id, { props: e.target.value })}
            placeholder="Optional…"
            className="flex-1 rounded border border-border bg-white px-1.5 py-0.5 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}

// ── AV master sheet (aggregated) ─────────────────────────────────────────

function AVMasterSheet({ acts }: { acts: SangeetAct[] }) {
  const totalMics = useMemo(
    () => acts.reduce((sum, a) => sum + (a.wireless_mics ?? 0), 0),
    [acts],
  );
  const screensNeeded = acts.filter((a) => a.needs_screen).length;
  const lightingActs = acts.filter((a) => a.needs_lighting).length;
  const peakMics = useMemo(() => maxConcurrentMics(acts), [acts]);

  return (
    <PanelCard
      icon={<Mic size={13} strokeWidth={1.7} />}
      title="AV master sheet"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Wireless mics (peak)" value={peakMics} />
        <MiniStat label="Mic-uses (sum)" value={totalMics} />
        <MiniStat label="Screen-using acts" value={screensNeeded} />
        <MiniStat label="Lighting cues" value={lightingActs} />
      </div>

      <ul className="mt-4 space-y-1">
        {acts
          .filter((a) => a.needs_screen)
          .map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 text-[11.5px] text-ink-muted"
            >
              <Film size={11} strokeWidth={1.6} className="text-saffron" />
              <span>
                Act #{a.sort_order} · {a.name} — needs screen content cued
              </span>
            </li>
          ))}
      </ul>
    </PanelCard>
  );
}

// ── Rehearsal schedule ───────────────────────────────────────────────────

function RehearsalSchedule({ acts }: { acts: SangeetAct[] }) {
  const items = useMemo(
    () =>
      acts
        .filter((a) => a.next_rehearsal_at || a.last_rehearsed_at || a.status !== "ready")
        .sort((a, b) => {
          const aT = a.next_rehearsal_at
            ? new Date(a.next_rehearsal_at).getTime()
            : Number.POSITIVE_INFINITY;
          const bT = b.next_rehearsal_at
            ? new Date(b.next_rehearsal_at).getTime()
            : Number.POSITIVE_INFINITY;
          return aT - bT;
        }),
    [acts],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <PanelCard
      icon={<Sparkles size={13} strokeWidth={1.7} />}
      title="Rehearsal schedule"
    >
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-start justify-between gap-3 rounded-md bg-ivory-warm/40 px-3 py-2"
          >
            <div>
              <p className="text-[12.5px] font-medium text-ink">{a.name}</p>
              <p className="text-[11px] text-ink-muted">
                {a.next_rehearsal_at
                  ? `Next: ${formatLocal(a.next_rehearsal_at)}`
                  : "No rehearsal scheduled"}
                {a.rehearsal_location && ` · ${a.rehearsal_location}`}
              </p>
            </div>
            <Tag tone={statusTone(a.status)}>
              {SANGEET_STATUS_LABEL[a.status]}
            </Tag>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── Add act form ─────────────────────────────────────────────────────────

function AddActForm({
  onAdd,
}: {
  onAdd: (input: Omit<SangeetAct, "id" | "created_at" | "updated_at" | "sort_order">) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SangeetActType>("dance");
  const [minutes, setMinutes] = useState(5);
  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-saffron/40 bg-ivory-warm/30 p-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
          wedding_id: "wedding-demo",
          name: name.trim(),
          type,
          performers: [],
          songs: [],
          estimated_minutes: minutes,
          status: "not_started",
        });
        setName("");
        setMinutes(5);
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Act name (e.g. 'Cousins' bhangra')"
        className="md:col-span-3 w-full rounded border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as SangeetActType)}
        className="rounded border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/50 focus:outline-none"
      >
        {(["dance", "skit", "speech", "slideshow", "live_music", "surprise"] as SangeetActType[]).map(
          (t) => (
            <option key={t} value={t}>
              {SANGEET_ACT_TYPE_LABEL[t]}
            </option>
          ),
        )}
      </select>
      <input
        type="number"
        min={1}
        max={20}
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value) || 5)}
        placeholder="Estimated minutes"
        className="rounded border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/50 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        Add act
      </button>
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatLocal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBorder(s: SangeetActStatus): string {
  switch (s) {
    case "not_started":
      return "border-rose/30";
    case "in_rehearsal":
      return "border-amber-300/60";
    case "ready":
      return "border-sage/40";
    case "dress_rehearsal_done":
      return "border-saffron/40";
  }
}

function statusTone(s: SangeetActStatus): "ink" | "saffron" | "sage" | "rose" {
  switch (s) {
    case "not_started":
      return "rose";
    case "in_rehearsal":
      return "ink";
    case "ready":
      return "sage";
    case "dress_rehearsal_done":
      return "saffron";
  }
}

function maxConcurrentMics(acts: SangeetAct[]): number {
  let max = 0;
  for (const a of acts) {
    if ((a.wireless_mics ?? 0) > max) max = a.wireless_mics ?? 0;
  }
  return max;
}

function detectBackToBackHighEnergy(acts: SangeetAct[]): boolean {
  const sorted = [...acts].sort((a, b) => a.sort_order - b.sort_order);
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (a.type === "dance" && b.type === "dance" && a.estimated_minutes >= 5 && b.estimated_minutes >= 5) {
      return true;
    }
  }
  return false;
}
