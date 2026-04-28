"use client";

// ── Discover tab ──────────────────────────────────────────────────────────
// Hero surface. Scores the curated pool against the couple's VibeProfile +
// AnniversaryBasics and renders magazine-style cards. Click a card to
// expand into an editorial detail view; from there the user can seed the
// itinerary, save, or dismiss.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Compass,
  Home,
  MapPin,
  Sparkles,
  Thermometer,
  ThumbsDown,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirstAnniversaryStore } from "@/stores/first-anniversary-store";
import {
  RECOMMENDATIONS,
  costRangeFor,
  getRecommendation,
  rankRecommendations,
  scoreRecommendation,
  typeLabel,
} from "@/lib/first-anniversary-recommendations";
import type {
  Recommendation,
  RecommendationScore,
  RecommendationType,
} from "@/types/first-anniversary";
import { Section } from "../../bachelorette/ui";

type TypeFilter = "all" | RecommendationType;

interface Props {
  onGoToItinerary: () => void;
}

export function DiscoverTab({ onGoToItinerary }: Props) {
  const vibe = useFirstAnniversaryStore((s) => s.vibe);
  const basics = useFirstAnniversaryStore((s) => s.basics);
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (vibe.vibes.length === 0 || !vibe.budget) {
    return <EmptyState />;
  }

  if (selectedId) {
    const rec = getRecommendation(selectedId);
    if (!rec) {
      setSelectedId(null);
      return null;
    }
    const score = scoreRecommendation(rec, vibe, basics);
    return (
      <DetailView
        rec={rec}
        score={score}
        onBack={() => setSelectedId(null)}
        onGoToItinerary={onGoToItinerary}
      />
    );
  }

  const counts = {
    all: RECOMMENDATIONS.length,
    getaway: RECOMMENDATIONS.filter((r) => r.type === "getaway").length,
    at_home: RECOMMENDATIONS.filter((r) => r.type === "at_home").length,
    experience: RECOMMENDATIONS.filter((r) => r.type === "experience").length,
  };

  return (
    <div className="space-y-5">
      <HeaderCard />
      <FilterBar filter={filter} onFilter={setFilter} counts={counts} />
      <Grid filter={filter} onSelect={setSelectedId} />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Section
      eyebrow="RANKED FOR YOUR VIBE"
      title="Start with a vibe and a budget"
      description="We'll rank the curated pool against what you picked — getaways, at-home evenings, and new experiences all in one view."
    >
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <div className="max-w-md">
          <Compass
            size={28}
            strokeWidth={1.3}
            className="mx-auto mb-3 text-ink-faint"
          />
          <p className="font-serif text-[17px] leading-snug text-ink">
            Head to Plan & Vibe to unlock your matches
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            Pick at least one vibe and a budget — everything else is optional.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Header recap ──────────────────────────────────────────────────────────

function HeaderCard() {
  return (
    <section className="rounded-lg border border-border bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Sparkles
          size={10}
          strokeWidth={1.8}
          className="mr-1 inline-block align-[-1px]"
        />
        Ranked for your vibe
      </p>
      <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
        Experiences that match your style
      </h3>
      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
        We scored each idea on vibe fit, budget, timing, travel logistics,
        and weather — then applied your hard no's as penalties. The top
        matches are below.
      </p>
    </section>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────

function FilterBar({
  filter,
  onFilter,
  counts,
}: {
  filter: TypeFilter;
  onFilter: (f: TypeFilter) => void;
  counts: { all: number; getaway: number; at_home: number; experience: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        label={`All · ${counts.all}`}
        active={filter === "all"}
        onClick={() => onFilter("all")}
      />
      <FilterPill
        label={`Getaways · ${counts.getaway}`}
        active={filter === "getaway"}
        onClick={() => onFilter("getaway")}
      />
      <FilterPill
        label={`At Home · ${counts.at_home}`}
        active={filter === "at_home"}
        onClick={() => onFilter("at_home")}
      />
      <FilterPill
        label={`Experiences · ${counts.experience}`}
        active={filter === "experience"}
        onClick={() => onFilter("experience")}
      />
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────

function Grid({
  filter,
  onSelect,
}: {
  filter: TypeFilter;
  onSelect: (id: string) => void;
}) {
  const vibe = useFirstAnniversaryStore((s) => s.vibe);
  const basics = useFirstAnniversaryStore((s) => s.basics);
  const states = useFirstAnniversaryStore((s) => s.recommendationStates);

  const ranked = useMemo(
    () => rankRecommendations(vibe, basics),
    [vibe, basics],
  );

  const filtered = useMemo(
    () =>
      ranked
        .filter(({ recommendation }) => {
          const state = states[recommendation.id];
          return state?.status !== "dismissed";
        })
        .filter(({ recommendation }) =>
          filter === "all" ? true : recommendation.type === filter,
        ),
    [ranked, filter, states],
  );

  if (filtered.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center text-[13px] text-ink-muted">
        No matches in this filter — switch categories or adjust Plan & Vibe.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map(({ recommendation, score }) => (
        <RecommendationCard
          key={recommendation.id}
          rec={recommendation}
          score={score}
          saved={states[recommendation.id]?.status === "saved"}
          onSelect={() => onSelect(recommendation.id)}
        />
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  score,
  saved,
  onSelect,
}: {
  rec: Recommendation;
  score: RecommendationScore;
  saved: boolean;
  onSelect: () => void;
}) {
  const budget = useFirstAnniversaryStore((s) => s.vibe.budget);
  const setStatus = useFirstAnniversaryStore((s) => s.setRecommendationStatus);
  const gradient = useMemo(() => buildGradient(rec.palette), [rec.palette]);
  const costRange = costRangeFor(rec, budget);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ background: gradient }}
      >
        {rec.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rec.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <TypeBadge type={rec.type} />
          <span
            className="inline-flex items-center rounded-sm bg-ink/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ivory"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {score.score}% match
          </span>
        </div>
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save for later"}
          onClick={(e) => {
            e.stopPropagation();
            setStatus(rec.id, saved ? "suggested" : "saved");
          }}
          className={cn(
            "absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
            saved
              ? "border-saffron bg-saffron text-ivory"
              : "border-white/80 bg-white/80 text-ink hover:bg-white",
          )}
        >
          <Bookmark size={12} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h4 className="font-serif text-[18px] leading-tight text-ink">
            {rec.name}
          </h4>
          <p className="mt-1 text-[13px] italic leading-snug text-ink-muted">
            {rec.hook}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full border border-saffron/40 bg-saffron-pale/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {score.matchTag}
          </span>
        </div>

        {rec.weatherNote && (
          <div className="flex items-start gap-1.5 rounded-md border border-border/60 bg-ivory-warm/50 px-2.5 py-1.5 text-[11.5px] leading-snug text-ink-muted">
            <Thermometer
              size={12}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-ink-faint"
            />
            <span>{rec.weatherNote}</span>
          </div>
        )}

        <ul className="flex flex-wrap gap-1">
          {rec.activityHighlights.slice(0, 4).map((h) => (
            <li
              key={h}
              className="rounded-full border border-border bg-ivory-warm/50 px-2 py-0.5 text-[11px] text-ink-muted"
            >
              {h}
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-3">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Est. total
            </p>
            <p className="font-serif text-[14px] text-ink">{costRange}</p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-1 rounded-md border border-ink bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            Open →
          </button>
        </div>
      </div>
    </article>
  );
}

function TypeBadge({ type }: { type: RecommendationType }) {
  const Icon =
    type === "getaway" ? MapPin : type === "at_home" ? Home : Sparkles;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm bg-white/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink backdrop-blur"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={10} strokeWidth={2} />
      {typeLabel(type)}
    </span>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────

function DetailView({
  rec,
  score,
  onBack,
  onGoToItinerary,
}: {
  rec: Recommendation;
  score: RecommendationScore;
  onBack: () => void;
  onGoToItinerary: () => void;
}) {
  const budget = useFirstAnniversaryStore((s) => s.vibe.budget);
  const setStatus = useFirstAnniversaryStore((s) => s.setRecommendationStatus);
  const applyItinerary = useFirstAnniversaryStore(
    (s) => s.applyRecommendationItinerary,
  );
  const states = useFirstAnniversaryStore((s) => s.recommendationStates);
  const currentStatus = states[rec.id]?.status ?? "suggested";
  const gradient = useMemo(() => buildGradient(rec.palette), [rec.palette]);

  function handleAddToItinerary() {
    applyItinerary(rec);
    onGoToItinerary();
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={13} strokeWidth={1.8} />
        Back to ideas
      </button>

      <section
        className="relative overflow-hidden rounded-lg border border-border"
        style={{ background: gradient }}
      >
        {rec.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rec.heroImage}
            alt=""
            className="h-48 w-full object-cover opacity-80 md:h-64"
          />
        )}
        <div
          className={cn(
            "flex flex-col gap-3 p-6",
            rec.heroImage && "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-12 text-ivory",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={rec.type} />
            <span
              className="inline-flex items-center rounded-sm bg-ink/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ivory"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {score.score}% match
            </span>
          </div>
          <h2 className={cn("font-serif text-[28px] leading-tight", rec.heroImage ? "text-ivory" : "text-ink")}>
            {rec.name}
          </h2>
          <p className={cn("max-w-xl text-[14px] italic leading-snug", rec.heroImage ? "text-ivory/90" : "text-ink-muted")}>
            {rec.hook}
          </p>
        </div>
      </section>

      <Section
        eyebrow="WHY THIS MATCHES YOU"
        title={score.matchTag}
        description={score.whyNote}
      >
        <ScoreBreakdown breakdown={score.breakdown} />
      </Section>

      {rec.editorialDescription && (
        <Section eyebrow="THE EDITORIAL" title="What to expect">
          <div className="space-y-3 text-[13.5px] leading-relaxed text-ink">
            {rec.editorialDescription.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Section>
      )}

      <Section eyebrow="HIGHLIGHTS" title="What you'll do">
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {rec.activityHighlights.map((h) => (
            <li
              key={h}
              className="rounded-md border border-border bg-ivory-warm/40 px-3 py-2 text-[12.5px] text-ink"
            >
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md border border-border/60 bg-white p-4 md:grid-cols-3">
          <Fact label="Estimated total" value={costRangeFor(rec, budget)} />
          <Fact label="Best for" value={typeLabel(rec.type)} />
          {rec.weatherNote && <Fact label="Weather" value={rec.weatherNote} />}
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setStatus(
                rec.id,
                currentStatus === "saved" ? "suggested" : "saved",
              )
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              currentStatus === "saved"
                ? "border-saffron bg-saffron-pale/40 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            <Bookmark size={12} strokeWidth={1.8} fill={currentStatus === "saved" ? "currentColor" : "none"} />
            {currentStatus === "saved" ? "Saved" : "Save for later"}
          </button>
          <button
            type="button"
            onClick={() => setStatus(rec.id, "dismissed")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-rose/40 hover:text-rose"
          >
            <ThumbsDown size={12} strokeWidth={1.8} />
            Not for us
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToItinerary}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Wand2 size={13} strokeWidth={1.8} />
          Add to itinerary
        </button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-0.5 font-serif text-[14px] text-ink">{value}</p>
    </div>
  );
}

function ScoreBreakdown({
  breakdown,
}: {
  breakdown: RecommendationScore["breakdown"];
}) {
  const rows: { label: string; value: number }[] = [
    { label: "Vibe fit", value: breakdown.vibe },
    { label: "Budget", value: breakdown.budget },
    { label: "Timing", value: breakdown.timing },
    { label: "Personal resonance", value: breakdown.personal },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {rows.map((r) => (
        <div key={r.label}>
          <dt
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {r.label}
          </dt>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-ivory-warm">
              <div
                className="h-full rounded-full bg-ink"
                style={{ width: `${Math.max(4, Math.min(100, r.value))}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-ink-muted">
              {Math.round(r.value)}
            </span>
          </div>
        </div>
      ))}
    </dl>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function buildGradient(palette: string[]): string {
  if (palette.length === 0) return "linear-gradient(135deg, #F5E6D3, #D4A853)";
  if (palette.length === 1) return `linear-gradient(135deg, ${palette[0]}, ${palette[0]})`;
  return `linear-gradient(135deg, ${palette.join(", ")})`;
}
