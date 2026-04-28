"use client";

// ── Hair & Makeup → Getting-Ready Experience panel ────────────────────────
// Most couples don't plan the getting-ready window intentionally — it just
// "happens" around them. This panel captures the three ingredients of a
// memory-making morning: music, food, and a short sub-timeline. Lives on
// the Family & Bridal Party tab, beneath the chair schedule, because it
// describes the same window at a different layer.
//
// Pure client state via localStorage — no new backend.

import { useEffect, useState } from "react";
import {
  Apple,
  Clock,
  Coffee,
  ExternalLink,
  Music,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard, Eyebrow, EmptyRow } from "@/components/workspace/blocks/primitives";

// ── Types ────────────────────────────────────────────────────────────────

type PlaylistVibe = "hype" | "chill" | "emotional" | "bollywood" | "mixed" | "";

interface TimelineBeat {
  id: string;
  time: string;       // HH:MM
  label: string;
  subject: string;    // who — "Photographer arrives" / "Mom + aunties enter"
}

interface SnackItem {
  id: string;
  label: string;
  packed: boolean;
  lipstickSafe: boolean;
}

interface GettingReadyState {
  vibe: PlaylistVibe;
  mood_note: string;
  spotify_url: string;
  collaborative_notes: string;
  snacks: SnackItem[];
  timeline: TimelineBeat[];
}

const EMPTY_STATE: GettingReadyState = {
  vibe: "",
  mood_note: "",
  spotify_url: "",
  collaborative_notes: "",
  snacks: [],
  timeline: [],
};

const VIBE_OPTIONS: {
  value: Exclude<PlaylistVibe, "">;
  label: string;
  hint: string;
  emoji: string;
}[] = [
  { value: "hype", label: "Hype", hint: "Dance-while-lashes-set energy", emoji: "🔥" },
  { value: "chill", label: "Chill", hint: "Soft, acoustic, sunrise coffee", emoji: "☕" },
  { value: "emotional", label: "Emotional", hint: "Father-daughter ballads", emoji: "💛" },
  { value: "bollywood", label: "Bollywood", hint: "Full dance party, trust-fall Fridays", emoji: "🎬" },
  { value: "mixed", label: "Mixed", hint: "Swap vibes across the morning", emoji: "🎚" },
];

const SUGGESTED_SNACKS_BY_VIBE: Record<Exclude<PlaylistVibe, "">, string[]> = {
  hype: ["Fresh fruit platter", "Masala chai", "Bubbly — mimosas", "Sliced cucumber with lime"],
  chill: ["Overnight oats", "Masala chai", "Green tea", "Berries & yogurt"],
  emotional: ["Masala chai", "Khakra / matthi", "Almond milk cardamom latte", "Dry fruits"],
  bollywood: ["Samosa chaat", "Masala chai", "Mango lassi with straw", "Cut fruit", "Bubbly — mimosas"],
  mixed: ["Fresh fruit platter", "Masala chai", "Coffee bar", "Sliced veggies + hummus"],
};

const DEFAULT_SNACKS = [
  "Masala chai",
  "Fresh fruit platter",
  "Granola bars",
  "Sparkling water",
  "Coffee",
];

const LIPSTICK_RISKY = /coffee|chai|latte|curry|pasta|tomato|berry|berries|mango|lassi|masala|samosa|chaat/i;

function classifySnack(label: string): boolean {
  // true = lipstick-safe. Most whole fruits (other than berries/mango) are
  // relatively safe, as are cut veggies, crackers, and straws-on-everything.
  return !LIPSTICK_RISKY.test(label);
}

// ── localStorage bridge ──────────────────────────────────────────────────

const STORAGE_PREFIX = "ananya:hmua-getting-ready";

function loadState(categoryId: string): GettingReadyState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${categoryId}`);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<GettingReadyState>;
    return {
      ...EMPTY_STATE,
      ...parsed,
      snacks: Array.isArray(parsed.snacks) ? parsed.snacks : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(categoryId: string, state: GettingReadyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}:${categoryId}`,
      JSON.stringify(state),
    );
  } catch {
    // ignore
  }
}

// ── Entry ─────────────────────────────────────────────────────────────────

export function GettingReadyExperiencePanel({
  categoryId,
  canEdit,
}: {
  categoryId: string;
  canEdit: boolean;
}) {
  const [state, setState] = useState<GettingReadyState>(EMPTY_STATE);

  useEffect(() => {
    setState(loadState(categoryId));
  }, [categoryId]);

  function update(patch: Partial<GettingReadyState>) {
    const next = { ...state, ...patch };
    setState(next);
    saveState(categoryId, next);
  }

  return (
    <PanelCard
      icon={<Music size={14} strokeWidth={1.8} />}
      title="Getting-ready experience"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The vibe your photos will remember
        </span>
      }
    >
      <p className="-mt-2 mb-4 max-w-2xl text-[12px] italic text-ink-faint">
        The morning you get ready in is the first memory of the day. Don't
        let it happen to you — choose the music, the food, the pace.
      </p>

      <div className="space-y-5">
        <PlaylistSection
          vibe={state.vibe}
          spotifyUrl={state.spotify_url}
          collaborativeNotes={state.collaborative_notes}
          moodNote={state.mood_note}
          canEdit={canEdit}
          onUpdate={(patch) => update(patch)}
        />

        <SnacksSection
          vibe={state.vibe}
          snacks={state.snacks}
          canEdit={canEdit}
          onUpdate={(snacks) => update({ snacks })}
        />

        <TimelineSection
          timeline={state.timeline}
          canEdit={canEdit}
          onUpdate={(timeline) => update({ timeline })}
        />
      </div>
    </PanelCard>
  );
}

// ── Playlist ─────────────────────────────────────────────────────────────

function PlaylistSection({
  vibe,
  spotifyUrl,
  collaborativeNotes,
  moodNote,
  canEdit,
  onUpdate,
}: {
  vibe: PlaylistVibe;
  spotifyUrl: string;
  collaborativeNotes: string;
  moodNote: string;
  canEdit: boolean;
  onUpdate: (patch: Partial<GettingReadyState>) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Eyebrow>Playlist & vibe</Eyebrow>
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Bollywood dance party or soft acoustic sunrise?
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {VIBE_OPTIONS.map((o) => {
          const active = vibe === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={!canEdit}
              onClick={() => onUpdate({ vibe: active ? "" : o.value })}
              className={cn(
                "inline-flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/50"
                  : "border-border bg-white hover:border-saffron/40 hover:bg-saffron-pale/10",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="flex items-center gap-1.5 text-[13px] text-ink">
                <span>{o.emoji}</span>
                <span className="font-medium">{o.label}</span>
              </span>
              <span className="text-[10.5px] italic text-ink-muted">
                {o.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <Eyebrow>Playlist link</Eyebrow>
          <div className="mt-1 flex items-center gap-1">
            <input
              type="url"
              value={spotifyUrl}
              disabled={!canEdit}
              onChange={(e) => onUpdate({ spotify_url: e.target.value })}
              placeholder="https://open.spotify.com/playlist/…"
              className="flex-1 rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            />
            {spotifyUrl && (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-ink-muted hover:border-saffron hover:text-saffron"
                aria-label="Open playlist"
              >
                <ExternalLink size={12} strokeWidth={1.8} />
              </a>
            )}
          </div>
        </label>
        <label className="block">
          <Eyebrow>Opening song (the first memory)</Eyebrow>
          <input
            value={moodNote}
            disabled={!canEdit}
            onChange={(e) => onUpdate({ mood_note: e.target.value })}
            placeholder="e.g. 'Tum Hi Ho' — unplugged cover"
            className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <Eyebrow>Songs the party has requested</Eyebrow>
        <textarea
          value={collaborativeNotes}
          disabled={!canEdit}
          onChange={(e) => onUpdate({ collaborative_notes: e.target.value })}
          rows={2}
          placeholder="Aanya wants 'Kabhi Kabhi Aditi' for the hair-flower moment. Share the collab playlist with the party for their picks."
          className="mt-1 w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
      </label>
    </section>
  );
}

// ── Snacks ───────────────────────────────────────────────────────────────

function SnacksSection({
  vibe,
  snacks,
  canEdit,
  onUpdate,
}: {
  vibe: PlaylistVibe;
  snacks: SnackItem[];
  canEdit: boolean;
  onUpdate: (snacks: SnackItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const suggestions = vibe ? SUGGESTED_SNACKS_BY_VIBE[vibe] : DEFAULT_SNACKS;

  function add(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (snacks.some((s) => s.label.toLowerCase() === trimmed.toLowerCase())) return;
    onUpdate([
      ...snacks,
      {
        id: `snack-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        label: trimmed,
        packed: false,
        lipstickSafe: classifySnack(trimmed),
      },
    ]);
  }

  function toggle(id: string) {
    onUpdate(
      snacks.map((s) => (s.id === id ? { ...s, packed: !s.packed } : s)),
    );
  }

  function remove(id: string) {
    onUpdate(snacks.filter((s) => s.id !== id));
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Eyebrow>Snacks & drinks</Eyebrow>
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Eat before makeup · use a straw · mind the lipstick
        </span>
      </div>

      {snacks.length === 0 ? (
        <EmptyRow>
          Fresh fruit, chai, mimosas, something the groomsmen can demolish —
          pick what shows up on the table before the chair schedule starts.
        </EmptyRow>
      ) : (
        <ul className="space-y-1">
          {snacks.map((s) => (
            <li
              key={s.id}
              className="group flex items-center gap-2 rounded-sm border border-transparent bg-white/40 px-2 py-1.5 hover:border-border hover:bg-white"
            >
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => toggle(s.id)}
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  s.packed
                    ? "border-sage bg-sage text-white"
                    : "border-ink-faint bg-white",
                )}
                aria-label={s.packed ? "Mark not ordered" : "Mark ordered"}
              >
                {s.packed && <span className="text-[10px]">✓</span>}
              </button>
              <span
                className={cn(
                  "flex-1 text-[12.5px]",
                  s.packed ? "text-ink-faint line-through" : "text-ink",
                )}
              >
                {s.label}
              </span>
              {!s.lipstickSafe && (
                <span
                  className="rounded-full border border-rose/40 bg-rose-pale/30 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-rose"
                  style={{ fontFamily: "var(--font-mono)" }}
                  title="Stains lipstick — drink with a straw or have before makeup"
                >
                  🥤 Straw
                </span>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
                  aria-label="Remove snack"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <>
          <div className="mt-2 flex items-center gap-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  add(draft);
                  setDraft("");
                }
              }}
              placeholder="Add a snack, drink, or coffee run…"
              className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (draft.trim()) {
                  add(draft);
                  setDraft("");
                }
              }}
              disabled={!draft.trim()}
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium",
                draft.trim()
                  ? "bg-ink text-ivory hover:opacity-90"
                  : "bg-ivory-warm text-ink-faint",
              )}
            >
              <Plus size={11} strokeWidth={2} />
              Add
            </button>
          </div>

          <div className="mt-3 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
            <Eyebrow className="mb-1.5">
              <Apple size={10} className="mr-1 inline" />
              Suggested for this vibe
            </Eyebrow>
            <div className="flex flex-wrap gap-1">
              {suggestions
                .filter((s) => !snacks.some((x) => x.label === s))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => add(s)}
                    className="inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-white px-2.5 py-1 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:bg-saffron-pale/30 hover:text-ink"
                  >
                    <Plus size={10} strokeWidth={1.8} className="text-saffron" />
                    {s}
                  </button>
                ))}
              {suggestions.every((s) => snacks.some((x) => x.label === s)) && (
                <span className="text-[11.5px] italic text-ink-faint">
                  All added — keep going with your own ideas above.
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────

const TIMELINE_SEEDS: Omit<TimelineBeat, "id">[] = [
  { time: "07:30", label: "Breakfast — eat before makeup", subject: "Bride + bridal party" },
  { time: "08:00", label: "Artist arrives, sets up", subject: "HMUA team" },
  { time: "08:30", label: "Hair starts on bride", subject: "Lead artist" },
  { time: "09:30", label: "Photographer arrives for getting-ready", subject: "Photographer" },
  { time: "10:30", label: "Makeup starts on bride", subject: "Lead artist" },
  { time: "12:30", label: "First-look dress moment", subject: "Bride + mom" },
  { time: "13:30", label: "Departure buffer", subject: "Everyone" },
];

function TimelineSection({
  timeline,
  canEdit,
  onUpdate,
}: {
  timeline: TimelineBeat[];
  canEdit: boolean;
  onUpdate: (next: TimelineBeat[]) => void;
}) {
  const sorted = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  function seed() {
    onUpdate(
      TIMELINE_SEEDS.map((s, i) => ({
        id: `beat-${Date.now().toString(36)}-${i}`,
        ...s,
      })),
    );
  }

  function addBeat() {
    onUpdate([
      ...timeline,
      {
        id: `beat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        time: "09:00",
        label: "New beat",
        subject: "",
      },
    ]);
  }

  function update(id: string, patch: Partial<TimelineBeat>) {
    onUpdate(timeline.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function remove(id: string) {
    onUpdate(timeline.filter((b) => b.id !== id));
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Eyebrow>Getting-ready timeline</Eyebrow>
        {canEdit && timeline.length === 0 && (
          <button
            type="button"
            onClick={seed}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-saffron hover:underline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Use defaults
          </button>
        )}
      </div>
      <p className="mb-2 text-[11.5px] italic text-ink-faint">
        The sub-schedule before the chair schedule. Eat → hair → photographer
        → makeup → dress → depart. Short beats, no epic timelines.
      </p>

      {sorted.length === 0 ? (
        <EmptyRow>
          Tap "Use defaults" for a starter timeline you can edit — or add beats yourself.
        </EmptyRow>
      ) : (
        <ol className="space-y-1">
          {sorted.map((b) => (
            <li
              key={b.id}
              className="group flex items-center gap-2 rounded-sm border border-border bg-white px-2 py-1.5"
            >
              <Clock size={11} strokeWidth={1.8} className="shrink-0 text-ink-muted" />
              <input
                type="time"
                value={b.time}
                disabled={!canEdit}
                onChange={(e) => update(b.id, { time: e.target.value })}
                className="w-[100px] rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <input
                value={b.label}
                disabled={!canEdit}
                onChange={(e) => update(b.id, { label: e.target.value })}
                className="flex-1 bg-transparent text-[12.5px] text-ink focus:outline-none disabled:opacity-60"
                placeholder="What happens"
              />
              <input
                value={b.subject}
                disabled={!canEdit}
                onChange={(e) => update(b.id, { subject: e.target.value })}
                className="w-[160px] bg-transparent text-[11.5px] italic text-ink-muted focus:outline-none disabled:opacity-60"
                placeholder="Who"
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
                  aria-label="Remove beat"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {canEdit && timeline.length > 0 && (
        <button
          type="button"
          onClick={addBeat}
          className="mt-2 inline-flex items-center gap-1 rounded-sm border border-dashed border-border px-2 py-1 text-[11px] text-ink-muted hover:border-saffron hover:text-saffron"
        >
          <Plus size={10} strokeWidth={1.8} />
          Add beat
        </button>
      )}
    </section>
  );
}

// Silence unused-import warnings for icons we keep referenced in suggestions.
void Coffee;
