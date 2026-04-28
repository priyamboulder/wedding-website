"use client";

// ── Guest Experiences — Inspiration tab ─────────────────────────────────────
// Three sections mirroring Photography's Inspiration tab:
//   • Moodboard           — paste URLs / upload, tag by BOOTHS / STATIONS / …
//   • Reference gallery   — curated images per event, with Love / Not-for-us
//   • "I've seen this…"   — free-text entries + ✨ Suggest experiences button

import { useState } from "react";
import { Heart, Plus, Sparkles, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_EVENT_CHIPS,
  INSPIRATION_GALLERY,
  type ExperienceEvent,
} from "@/lib/guest-experiences/experience-catalog";
import { MoodboardBlock } from "@/components/workspace/blocks/vision-blocks";

type MoodboardFilter = "all" | "booths" | "stations" | "entrances" | "favors" | "wow";

const MOODBOARD_FILTERS: { id: MoodboardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "booths", label: "Booths" },
  { id: "stations", label: "Stations" },
  { id: "entrances", label: "Entrances" },
  { id: "favors", label: "Favors" },
  { id: "wow", label: "Wow moments" },
];

// Simple captioned reference — either loved (added to shortlist) or skipped.
type RefReaction = "love" | "not_for_us" | null;

export function InspirationTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-10">
      <MoodboardSection categoryId={category.id} />
      <ReferenceGallerySection />
      <SeenAndLovedSection />
    </div>
  );
}

// ── Moodboard section ──────────────────────────────────────────────────────

function MoodboardSection({ categoryId }: { categoryId: string }) {
  const allMoodboard = useWorkspaceStore((s) => s.moodboard);
  const addItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const removeItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const [filter, setFilter] = useState<MoodboardFilter>("all");

  const items = allMoodboard
    .filter((m) => m.category_id === categoryId)
    .filter((m) => {
      if (filter === "all") return true;
      const hay = (m.caption ?? "").toLowerCase();
      if (filter === "booths") return /booth|photo|360|gif|polaroid/.test(hay);
      if (filter === "stations") return /chai|paan|chaat|dosa|cart|station|bar/.test(hay);
      if (filter === "entrances") return /baraat|horse|car|entrance|petal|dhol/.test(hay);
      if (filter === "favors") return /favor|bag|keepsake|candle|tote/.test(hay);
      if (filter === "wow") return /fireworks|sparkler|drone|neon|laser|projection/.test(hay);
      return true;
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
          Moodboard
        </p>
        <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
          Pin what makes sense
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
          Paste URLs, drop files, tag each pin so your planner knows the vibe.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {MOODBOARD_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              filter === f.id
                ? "border-saffron bg-saffron/10 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <MoodboardBlock
          items={items}
          editable
          onAdd={(url, caption) => addItem(categoryId, url, caption)}
          onRemove={(id) => removeItem(id)}
        />
      </div>
    </section>
  );
}

// ── Reference gallery by event ─────────────────────────────────────────────

function ReferenceGallerySection() {
  const [activeEvent, setActiveEvent] = useState<ExperienceEvent>("sangeet");
  const [reactions, setReactions] = useState<Record<string, RefReaction>>({});
  const [customRefs, setCustomRefs] = useState<
    { id: string; event: ExperienceEvent; label: string; image_url: string }[]
  >([]);
  const [adding, setAdding] = useState(false);

  const activeSlice = INSPIRATION_GALLERY.find((g) => g.event === activeEvent);
  const eventCustomRefs = customRefs.filter((r) => r.event === activeEvent);

  function toggle(id: string, next: RefReaction) {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === next ? null : next,
    }));
  }

  return (
    <section>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
          Reference gallery
        </p>
        <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
          Experiences in action, by event
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
          Tap an event to see curated real-world references. Love what fits,
          skip what doesn't — or add your own.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {EXPERIENCE_EVENT_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setActiveEvent(chip.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition-colors",
              activeEvent === chip.id
                ? "border-saffron bg-saffron/10 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeSlice?.refs.map((ref) => (
          <ReferenceCard
            key={ref.id}
            id={ref.id}
            label={ref.label}
            image_url={ref.image_url}
            reaction={reactions[ref.id] ?? null}
            onReact={(next) => toggle(ref.id, next)}
          />
        ))}
        {eventCustomRefs.map((ref) => (
          <ReferenceCard
            key={ref.id}
            id={ref.id}
            label={ref.label}
            image_url={ref.image_url}
            reaction={reactions[ref.id] ?? null}
            onReact={(next) => toggle(ref.id, next)}
          />
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add your own reference
        </button>
      </div>

      {adding && (
        <AddReferenceForm
          event={activeEvent}
          onSave={(label, url) => {
            setCustomRefs((prev) => [
              ...prev,
              {
                id: `cref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                event: activeEvent,
                label,
                image_url: url,
              },
            ]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </section>
  );
}

function ReferenceCard({
  label,
  image_url,
  reaction,
  onReact,
}: {
  id: string;
  label: string;
  image_url: string;
  reaction: RefReaction;
  onReact: (r: RefReaction) => void;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border bg-white transition-all",
        reaction === "love"
          ? "border-saffron"
          : reaction === "not_for_us"
            ? "border-border opacity-50"
            : "border-border",
      )}
    >
      <div
        className="aspect-[4/3] bg-cover bg-center bg-ivory-warm"
        style={{ backgroundImage: `url(${image_url})` }}
      />
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="min-w-0 truncate text-[12.5px] text-ink">{label}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReact("love")}
            aria-label="Love this reference"
            className={cn(
              "rounded-md border p-1 transition-colors",
              reaction === "love"
                ? "border-saffron bg-saffron/10 text-saffron"
                : "border-border text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            <Heart size={12} strokeWidth={1.8} fill={reaction === "love" ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onReact("not_for_us")}
            aria-label="Not for us"
            className={cn(
              "rounded-md border p-1 transition-colors",
              reaction === "not_for_us"
                ? "border-border bg-ivory-warm text-ink-muted"
                : "border-border text-ink-muted hover:border-rose/40 hover:text-rose",
            )}
          >
            <X size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

function AddReferenceForm({
  event,
  onSave,
  onCancel,
}: {
  event: ExperienceEvent;
  onSave: (label: string, url: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="mt-4 rounded-lg border border-saffron/40 bg-ivory-warm/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-serif text-[15px] text-ink">
          Add reference for{" "}
          {EXPERIENCE_EVENT_CHIPS.find((c) => c.id === event)?.label}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-faint hover:text-ink"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Caption (e.g. Amit + Aarti's chai cart)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron focus:outline-none"
        />
        <input
          type="url"
          placeholder="Image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (label.trim() && url.trim()) onSave(label.trim(), url.trim());
            }}
            className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory"
          >
            <Upload size={12} className="mr-1 inline-block" strokeWidth={1.8} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── "I've seen this and loved it" section ─────────────────────────────────

function SeenAndLovedSection() {
  const entries = useGuestExperiencesStore((s) => s.inspirationEntries);
  const addEntry = useGuestExperiencesStore((s) => s.addInspirationEntry);
  const deleteEntry = useGuestExperiencesStore((s) => s.deleteInspirationEntry);
  const setReaction = useGuestExperiencesStore((s) => s.setReaction);
  const setEventAssignments = useGuestExperiencesStore(
    (s) => s.setEventAssignments,
  );
  const [draft, setDraft] = useState("");
  const [lastMatches, setLastMatches] = useState<{ id: string; name: string }[]>([]);

  function add() {
    if (!draft.trim()) return;
    addEntry(draft.trim());
    setDraft("");
  }

  function suggest() {
    // Simple keyword → catalog match. A real build would send the entries to
    // an LLM with the catalog as context. Matches auto-love the card.
    const haystack = entries
      .map((e) => e.text.toLowerCase())
      .join(" ");
    if (!haystack) return;
    const matched: { id: string; name: string }[] = [];
    for (const card of EXPERIENCE_CATALOG) {
      const keywords = card.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const hit = keywords.some((k) => haystack.includes(k));
      if (hit) {
        setReaction(card.id, "love");
        setEventAssignments(card.id, card.suggested_events);
        matched.push({ id: card.id, name: card.name });
      }
    }
    setLastMatches(matched);
  }

  return (
    <section>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
          I've seen this and loved it
        </p>
        <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
          Things you can't stop thinking about
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
          Drop anything — something from a cousin's sangeet, a reel you saved,
          an idea from a friend's reception. We'll map them to the catalog.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-4 py-6 text-center text-[13px] text-ink-muted">
            Nothing noted yet. Start with a single line — your planner will
            take it from there.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-2 rounded-md border border-border bg-white px-3 py-2"
              >
                <p className="flex-1 text-[13px] text-ink">{entry.text}</p>
                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  aria-label="Delete entry"
                  className="shrink-0 text-ink-faint transition-colors hover:text-rose"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-start gap-2">
          <input
            type="text"
            placeholder="e.g. The cotton candy cart at Priya's wedding…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="shrink-0 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Add
          </button>
        </div>

        {entries.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={suggest}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-ivory-warm/40 px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-ivory-warm/70"
            >
              <Sparkles size={12} className="text-saffron" />
              Suggest experiences
            </button>
            {lastMatches.length > 0 && (
              <p className="text-[11.5px] text-ink-muted">
                Loved {lastMatches.length} matching card
                {lastMatches.length === 1 ? "" : "s"} on the Discover tab:{" "}
                <span className="text-ink">
                  {lastMatches
                    .slice(0, 3)
                    .map((m) => m.name)
                    .join(" · ")}
                  {lastMatches.length > 3 && ` · +${lastMatches.length - 3}`}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
