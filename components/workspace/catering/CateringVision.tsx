"use client";

// ── Catering Vision & Mood ─────────────────────────────────────────────────
// The couple-facing front door of the Catering workspace. Runs the 5-question
// catering quiz at the top, then renders four bespoke read panels that answer
// the questions a planner would otherwise ask in a kickoff call:
//   1. Your Dining Brief   — narrative derived from the quiz answers
//   2. Per-event preview   — one card per wedding event with cuisine + style
//   3. Dietary summary     — aggregate counts pulled from SEED_DIETARY_TOTALS
//   4. Budget context      — running plate-cost estimate across all events
// Below the bespoke content sits the shared Moodboard / Palette / Notes grid
// so vision assets collected elsewhere in Ananya flow through here unchanged.

import { useMemo } from "react";
import {
  BookMarked,
  CalendarClock,
  Leaf,
  Utensils,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";
import { useCateringStore } from "@/stores/catering-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useVisionStore } from "@/stores/vision-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import { SEED_PALETTES } from "@/lib/workspace-seed";
import { DIETARY_FLAG_LABEL, type DietaryFlag } from "@/types/catering";
import { getQuizSchema } from "@/lib/quiz/registry";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import {
  MoodboardBlock,
  NotesBlock,
  PaletteBlock,
} from "@/components/workspace/blocks/vision-blocks";
import { PanelCard, Eyebrow, Tag, MiniStat } from "@/components/workspace/blocks/primitives";

// ── Service-style copy ────────────────────────────────────────────────────
// Short, couple-facing labels the cards use instead of the raw enum.

const SERVICE_STYLE_LABEL: Record<string, string> = {
  plated: "Plated",
  buffet: "Buffet",
  stations: "Live stations",
  family_style: "Family-style",
  passed: "Passed service",
  thali: "Thali",
};

// ── Per-plate bands (USD) by service style ────────────────────────────────
// Demo-plausible mid-market US Indian wedding catering. Used only to give
// couples a directional dollar range — the Decision Board has the real
// vendor proposals.

const PLATE_BANDS: Record<string, [number, number]> = {
  plated: [95, 150],
  buffet: [60, 95],
  stations: [70, 110],
  family_style: [75, 115],
  passed: [80, 120],
  thali: [55, 85],
};

export function CateringVision({ category }: { category: WorkspaceCategory }) {
  // ── Store slices ──────────────────────────────────────────────────────
  const events = useCateringStore((s) => s.events);
  const dietary_totals = useCateringStore((s) => s.dietary_totals);
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const notes = useWorkspaceStore((s) => s.notes);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const deleteMoodboardItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const getCompletion = useQuizStore((s) => s.getCompletion);
  const styleKeywords = useVisionStore((s) =>
    s.style_keywords[category.slug] ?? [],
  );

  // ── Filtered views ─────────────────────────────────────────────────────
  const categoryMoodboard = useMemo(
    () =>
      moodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [moodboard, category.id],
  );
  const categoryNotes = useMemo(
    () =>
      notes
        .filter((n) => n.category_id === category.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [notes, category.id],
  );
  const weddingEvents = useMemo(
    () =>
      events
        .filter((e) => e.wedding_id === DEMO_WEDDING_ID)
        .sort((a, b) => a.sort_order - b.sort_order),
    [events],
  );

  // Aggregate dietary rollup across every event. Totals double-count guests
  // who attend multiple events — the dietary atlas does per-event breakdowns
  // separately. This summary answers "what's the shape of our guest list?"
  const dietaryRollup = useMemo(() => {
    const totals: Partial<Record<DietaryFlag, number>> = {};
    let peak = 0;
    for (const t of dietary_totals) {
      if (t.total_guests > peak) peak = t.total_guests;
      for (const [flag, count] of Object.entries(t.counts)) {
        if (!count) continue;
        totals[flag as DietaryFlag] =
          (totals[flag as DietaryFlag] ?? 0) + count;
      }
    }
    return { peak, totals };
  }, [dietary_totals]);

  const palette = SEED_PALETTES[category.slug] ?? [];
  const quiz = getQuizSchema(category.slug, "vision");
  const completion = quiz
    ? getCompletion(category.slug, "vision")
    : undefined;

  const diningBrief = useMemo(
    () => buildDiningBrief(styleKeywords, weddingEvents, dietaryRollup.peak),
    [styleKeywords, weddingEvents, dietaryRollup.peak],
  );

  // ── Budget band estimate ──────────────────────────────────────────────
  const budgetBand = useMemo(() => {
    let low = 0;
    let high = 0;
    for (const e of weddingEvents) {
      const band = PLATE_BANDS[e.service_style] ?? [70, 110];
      low += band[0]! * e.guest_count;
      high += band[1]! * e.guest_count;
    }
    return { low, high };
  }, [weddingEvents]);

  return (
    <div className="space-y-6">
      {/* Quiz entry — hidden once completed */}
      {quiz && (
        <QuizEntryCard
          schema={quiz}
          categoryId={category.id}
          suppressWhenFilled={Boolean(completion)}
        />
      )}

      {/* Dining Brief — narrative from quiz answers */}
      <DiningBriefPanel brief={diningBrief} keywords={styleKeywords} />

      {/* Per-event cuisine preview */}
      <EventPreviewPanel events={weddingEvents} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Dietary summary + budget context share a row */}
        <DietarySummaryPanel
          peakGuests={dietaryRollup.peak}
          totals={dietaryRollup.totals}
        />
        <BudgetContextPanel
          low={budgetBand.low}
          high={budgetBand.high}
          eventCount={weddingEvents.length}
        />
        <NotesBlock
          notes={categoryNotes}
          editable
          onAdd={(body) => addNote(category.id, body)}
          onDelete={(id) => deleteNote(id)}
        />
      </div>

      {/* Moodboard + palette (moodboard stretches 2 cols via its own className) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MoodboardBlock
          items={categoryMoodboard}
          editable
          onAdd={(url, caption) =>
            addMoodboardItem(category.id, url, caption)
          }
          onRemove={(id) => deleteMoodboardItem(id)}
        />
        <PaletteBlock swatches={palette} />
      </div>

      {quiz && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={quiz} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Dining Brief ──────────────────────────────────────────────────────────
// Reads keyword tokens written by the quiz's apply() and weaves them into
// a planner-voice paragraph. No LLM yet — this is a deterministic template
// so the page renders instantly and never hits an empty state after a quiz.

interface DiningBrief {
  opening: string;
  arcLine: string;
  dietaryLine: string;
  memoryLine: string;
}

function buildDiningBrief(
  keywords: string[],
  events: { label: string; cuisine_direction: string; service_style: string }[],
  peakGuests: number,
): DiningBrief {
  const kset = new Set(keywords);

  const philosophy =
    (kset.has("buffet-grand") && "generous, abundance-forward") ||
    (kset.has("plated-curated") && "curated, restaurant-grade") ||
    (kset.has("family-style") && "warm, family-style sharing") ||
    (kset.has("stations-interactive") && "theatrical, station-led") ||
    (kset.has("mixed") && "style-shifting") ||
    "multi-event";

  const cuisines: string[] = [];
  if (kset.has("north-indian")) cuisines.push("North Indian");
  if (kset.has("south-indian")) cuisines.push("South Indian");
  if (kset.has("gujarati-rajasthani")) cuisines.push("Gujarati/Rajasthani");
  if (kset.has("bengali")) cuisines.push("Bengali");
  if (kset.has("indo-chinese")) cuisines.push("Indo-Chinese fusion");
  if (kset.has("global-stations")) cuisines.push("global stations");
  if (kset.has("street-food")) cuisines.push("regional street food");
  if (kset.has("continental")) cuisines.push("continental");

  const opening =
    keywords.length === 0
      ? `Five wedding events. ${peakGuests || "Hundreds of"} guests at peak. Tell us how you want to feed them — the quiz above will draft this brief.`
      : `You're designing a ${philosophy} culinary journey across ${events.length} events, peaking at ${peakGuests} guests.${
          cuisines.length > 0
            ? ` Cuisine pulls from ${joinList(cuisines)}.`
            : ""
        }`;

  const arcLine =
    events.length > 0
      ? `The arc builds ${events
          .map((e) => `${e.label.toLowerCase()} (${e.cuisine_direction.toLowerCase()})`)
          .join(" → ")}.`
      : "Add wedding events to see your per-event culinary arc.";

  const dietaryLine =
    (kset.has("diet-complex") &&
      "Significant Jain / vegan / allergy work required — we'll flag menu gaps live as you build.") ||
    (kset.has("diet-veg-dominant") &&
      "Veg-dominant list — most of the menu stays vegetarian by default.") ||
    (kset.has("diet-nonveg-dominant") &&
      "Non-veg-dominant list — we'll still keep a proper veg pairing per moment.") ||
    (kset.has("diet-mixed") &&
      "Mixed guest list — every event needs real coverage for both sides.") ||
    "Dietary landscape not captured yet — take the quiz to seed the dietary atlas.";

  const memoryLine =
    (kset.has("memory-abundance") &&
      "You want guests walking away saying \"I can't believe how much food there was.\" We'll push portion and pace over minimal-waste.") ||
    (kset.has("memory-standout") &&
      "You want one dish they'll talk about for years — we'll coordinate tastings around two or three \"hero\" dishes.") ||
    (kset.has("memory-presentation") &&
      "Presentation carries equal weight with taste — expect more investment in plating, chafer dressing, and station design.") ||
    (kset.has("memory-personal") &&
      "You want it to feel like family made it — lean into recipes from the family, home-style breads, hand-written menu cards.") ||
    (kset.has("memory-experience") &&
      "The live stations will be a story. Budget for visible chefs, open flame, and guest flow around the stations.") ||
    "Memory target unset — the quiz above will shape this line.";

  return { opening, arcLine, dietaryLine, memoryLine };
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function DiningBriefPanel({
  brief,
  keywords,
}: {
  brief: DiningBrief;
  keywords: string[];
}) {
  return (
    <PanelCard
      icon={<BookMarked size={14} strokeWidth={1.8} />}
      title="Your Dining Brief"
      badge={
        keywords.length > 0 ? (
          <Tag tone="saffron">{keywords.length} signals</Tag>
        ) : (
          <Tag tone="stone">Not started</Tag>
        )
      }
    >
      <div className="space-y-3">
        <p className="text-[13.5px] leading-relaxed text-ink">
          {brief.opening}
        </p>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          {brief.arcLine}
        </p>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          {brief.dietaryLine}
        </p>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          {brief.memoryLine}
        </p>
      </div>
    </PanelCard>
  );
}

// ── Per-event preview ────────────────────────────────────────────────────

function EventPreviewPanel({
  events,
}: {
  events: ReturnType<typeof useCateringStore.getState>["events"];
}) {
  return (
    <PanelCard
      icon={<CalendarClock size={14} strokeWidth={1.8} />}
      title="Per-event cuisine preview"
    >
      {events.length === 0 ? (
        <p className="py-2 text-[12px] italic text-ink-faint">
          Add wedding events to see the culinary arc.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-md border border-border bg-ivory-warm/30 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {e.icon && (
                    <span className="text-[14px] leading-none">{e.icon}</span>
                  )}
                  <h5 className="font-serif text-[15px] text-ink">{e.label}</h5>
                </div>
                <Tag tone="stone">{e.guest_count} pax</Tag>
              </div>
              <p className="mt-2 text-[12px] leading-snug text-ink-muted">
                {e.cuisine_direction}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Tag tone="saffron">
                  {SERVICE_STYLE_LABEL[e.service_style] ?? e.service_style}
                </Tag>
                {e.vibe_tags.slice(0, 1).map((t) => (
                  <Tag key={t} tone="sage">
                    {t}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}

// ── Dietary summary ──────────────────────────────────────────────────────

function DietarySummaryPanel({
  peakGuests,
  totals,
}: {
  peakGuests: number;
  totals: Partial<Record<DietaryFlag, number>>;
}) {
  // Primary order — what the caterer needs to see first.
  const order: DietaryFlag[] = [
    "vegetarian",
    "non_vegetarian",
    "jain",
    "vegan",
    "halal",
    "swaminarayan",
    "gluten_free",
    "nut_allergy",
    "dairy_free",
  ];
  const rows = order
    .map((f) => [f, totals[f] ?? 0] as const)
    .filter(([, n]) => n > 0);

  return (
    <PanelCard
      icon={<Leaf size={14} strokeWidth={1.8} />}
      title="Dietary summary"
      badge={<Tag tone="sage">{peakGuests} peak guests</Tag>}
    >
      {rows.length === 0 ? (
        <p className="py-2 text-[12px] italic text-ink-faint">
          No dietary rollup yet. Add guests in the Guest workspace.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map(([flag, count]) => (
            <li
              key={flag}
              className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
            >
              <span className="text-[12.5px] text-ink-muted">
                {DIETARY_FLAG_LABEL[flag]}
              </span>
              <span className="font-mono text-[12px] text-ink">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Budget context ───────────────────────────────────────────────────────

function BudgetContextPanel({
  low,
  high,
  eventCount,
}: {
  low: number;
  high: number;
  eventCount: number;
}) {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n.toFixed(0)}`;
  return (
    <PanelCard
      icon={<Wallet size={14} strokeWidth={1.8} />}
      title="Budget context"
      badge={<Tag tone="stone">{eventCount} events</Tag>}
    >
      {eventCount === 0 ? (
        <p className="py-2 text-[12px] italic text-ink-faint">
          Add events to see the estimated band.
        </p>
      ) : (
        <div className="space-y-3">
          <MiniStat
            label="Estimated range"
            value={`${fmt(low)} – ${fmt(high)}`}
            hint="Food + service only. Bar, rentals, gratuity, and tax are separate."
          />
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            Indian wedding catering typically runs $45–$120 per plate depending
            on service style. This band is a directional estimate; the Decision
            Board shows real vendor proposals.
          </p>
        </div>
      )}
    </PanelCard>
  );
}
