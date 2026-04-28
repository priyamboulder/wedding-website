"use client";

// ── Discover tab ──────────────────────────────────────────────────────────
// Hero surface. Auto-detects Discover mode (party / ceremony / combined /
// grand) and ranks themes, activities, menus, vendors, ceremony guides,
// and ritual setups against the family's Plan & Vibe inputs.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  CakeSlice,
  Compass,
  Gem,
  Sparkles,
  ThumbsDown,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import {
  FIRST_BIRTHDAY_RECOMMENDATIONS,
  firstBirthdayRecTypeLabel,
  formatCostRange,
  getFirstBirthdayRec,
  rankFirstBirthdayRecs,
  scoreFirstBirthdayRec,
} from "@/lib/first-birthday-recommendations";
import { deriveDiscoverMode } from "@/lib/first-birthday-seed";
import type {
  FirstBirthdayDiscoverMode,
  FirstBirthdayRec,
  FirstBirthdayRecScore,
  FirstBirthdayRecType,
} from "@/types/first-birthday";
import { Section } from "../../bachelorette/ui";

type TypeFilter = "all" | FirstBirthdayRecType;

interface Props {
  onGoToItinerary: () => void;
}

export function DiscoverTab({ onGoToItinerary }: Props) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const ceremony = useFirstBirthdayStore((s) => s.ceremony);
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mode = deriveDiscoverMode(plan.vibes, plan.discoverModeOverride);

  if (plan.vibes.length === 0) {
    return <EmptyState />;
  }

  if (selectedId) {
    const rec = getFirstBirthdayRec(selectedId);
    if (!rec) {
      setSelectedId(null);
      return null;
    }
    const score = scoreFirstBirthdayRec(rec, plan, ceremony);
    return (
      <DetailView
        rec={rec}
        score={score}
        onBack={() => setSelectedId(null)}
        onGoToItinerary={onGoToItinerary}
      />
    );
  }

  const visibleTypes = typesForMode(mode);

  return (
    <div className="space-y-5">
      <HeaderCard mode={mode} babyName={plan.babyName} />
      <FilterBar
        filter={filter}
        onFilter={setFilter}
        visibleTypes={visibleTypes}
      />
      <Grid filter={filter} visibleTypes={visibleTypes} onSelect={setSelectedId} />
    </div>
  );
}

// ── Which types surface per mode ──────────────────────────────────────────

function typesForMode(
  mode: FirstBirthdayDiscoverMode,
): FirstBirthdayRecType[] {
  switch (mode) {
    case "party":
      return ["theme", "activity", "menu", "vendor"];
    case "ceremony":
      return ["ceremony_guide", "ritual_setup", "menu", "vendor"];
    case "combined":
      return [
        "ceremony_guide",
        "ritual_setup",
        "theme",
        "activity",
        "menu",
        "vendor",
      ];
    case "grand":
      return ["theme", "vendor", "menu", "activity", "ceremony_guide"];
  }
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Section
      eyebrow="CURATED FOR YOUR CELEBRATION"
      title="Pick a vibe in Plan & Vibe to unlock matches"
      description="We need at least one vibe selected before we can rank the pool."
    >
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <div className="max-w-md">
          <Compass
            size={28}
            strokeWidth={1.3}
            className="mx-auto mb-3 text-ink-faint"
          />
          <p className="font-serif text-[17px] leading-snug text-ink">
            Start in Plan & Vibe
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            Pick a vibe or two and (if applicable) a cultural ceremony — the rest
            of the inputs are optional but sharpen the ranking.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function HeaderCard({
  mode,
  babyName,
}: {
  mode: FirstBirthdayDiscoverMode;
  babyName: string;
}) {
  const copy = headerCopyForMode(mode, babyName);
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
        {copy.eyebrow}
      </p>
      <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
        {copy.title}
      </h3>
      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
        {copy.description}
      </p>
    </section>
  );
}

function headerCopyForMode(
  mode: FirstBirthdayDiscoverMode,
  babyName: string,
): { eyebrow: string; title: string; description: string } {
  const name = babyName.trim() || "your baby";
  switch (mode) {
    case "party":
      return {
        eyebrow: "Curated for your celebration",
        title: `Themes and experiences for ${name}'s first birthday`,
        description:
          "We scored each idea on vibe fit, guest count, venue, season, kid-friendliness, and budget — then filtered out your hard no's.",
      };
    case "ceremony":
      return {
        eyebrow: "Honoring your traditions",
        title: `Guides and setup for ${name}'s ceremony`,
        description:
          "Ceremony guides, setup checklists, and vendor recommendations matched to the traditions you selected.",
      };
    case "combined":
      return {
        eyebrow: "Ceremony & celebration",
        title: "A day that honors your traditions and celebrates your way",
        description:
          "Ceremony guides come first, then party ideas that complement — all scored for your vibe, venue, and guest count.",
      };
    case "grand":
      return {
        eyebrow: "Grand celebration",
        title: "Venue-scale themes and professional vendors",
        description:
          "Built for 100+ guests, banquet halls, and full production. Ceremony guides included if your traditions call for one.",
      };
  }
}

// ── Filter bar ────────────────────────────────────────────────────────────

function FilterBar({
  filter,
  onFilter,
  visibleTypes,
}: {
  filter: TypeFilter;
  onFilter: (f: TypeFilter) => void;
  visibleTypes: FirstBirthdayRecType[];
}) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const ceremony = useFirstBirthdayStore((s) => s.ceremony);
  const ranked = useMemo(
    () => rankFirstBirthdayRecs(plan, ceremony),
    [plan, ceremony],
  );
  const states = useFirstBirthdayStore((s) => s.recStates);
  const visibleForCount = ranked.filter(
    ({ rec }) =>
      visibleTypes.includes(rec.type) &&
      states[rec.id]?.status !== "dismissed",
  );

  const counts: Record<TypeFilter, number> = {
    all: visibleForCount.length,
    theme: 0,
    activity: 0,
    menu: 0,
    vendor: 0,
    ceremony_guide: 0,
    ritual_setup: 0,
  };
  for (const { rec } of visibleForCount) {
    counts[rec.type] = (counts[rec.type] ?? 0) + 1;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        label={`All · ${counts.all}`}
        active={filter === "all"}
        onClick={() => onFilter("all")}
      />
      {visibleTypes.map((t) => (
        <FilterPill
          key={t}
          label={`${firstBirthdayRecTypeLabel(t)} · ${counts[t] ?? 0}`}
          active={filter === t}
          onClick={() => onFilter(t)}
        />
      ))}
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
  visibleTypes,
  onSelect,
}: {
  filter: TypeFilter;
  visibleTypes: FirstBirthdayRecType[];
  onSelect: (id: string) => void;
}) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const ceremony = useFirstBirthdayStore((s) => s.ceremony);
  const states = useFirstBirthdayStore((s) => s.recStates);

  const ranked = useMemo(
    () => rankFirstBirthdayRecs(plan, ceremony),
    [plan, ceremony],
  );

  const filtered = useMemo(
    () =>
      ranked
        .filter(({ rec }) => {
          if (!visibleTypes.includes(rec.type)) return false;
          if (states[rec.id]?.status === "dismissed") return false;
          if (filter !== "all" && rec.type !== filter) return false;
          return true;
        }),
    [ranked, filter, visibleTypes, states],
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
      {filtered.map(({ rec, score }) => (
        <RecCard
          key={rec.id}
          rec={rec}
          score={score}
          saved={states[rec.id]?.status === "saved"}
          onSelect={() => onSelect(rec.id)}
        />
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────

function RecCard({
  rec,
  score,
  saved,
  onSelect,
}: {
  rec: FirstBirthdayRec;
  score: FirstBirthdayRecScore;
  saved: boolean;
  onSelect: () => void;
}) {
  const setRecStatus = useFirstBirthdayStore((s) => s.setRecStatus);
  const gradient = useMemo(() => buildGradient(rec.palette), [rec.palette]);

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
            setRecStatus(rec.id, saved ? "suggested" : "saved");
          }}
          className={cn(
            "absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
            saved
              ? "border-saffron bg-saffron text-ivory"
              : "border-white/80 bg-white/80 text-ink hover:bg-white",
          )}
        >
          <Bookmark
            size={12}
            strokeWidth={2}
            fill={saved ? "currentColor" : "none"}
          />
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

        <span
          className="inline-flex w-fit items-center rounded-full border border-saffron/40 bg-saffron-pale/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score.matchTag}
        </span>

        <ul className="flex flex-wrap gap-1">
          {rec.highlights.slice(0, 4).map((h) => (
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
              Est. range
            </p>
            <p className="font-serif text-[14px] text-ink">
              {formatCostRange(rec)}
            </p>
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

function TypeBadge({ type }: { type: FirstBirthdayRecType }) {
  const Icon =
    type === "theme"
      ? Sparkles
      : type === "activity"
        ? Wand2
        : type === "menu"
          ? UtensilsCrossed
          : type === "vendor"
            ? Gem
            : CakeSlice;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm bg-white/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink backdrop-blur"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={10} strokeWidth={2} />
      {firstBirthdayRecTypeLabel(type)}
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
  rec: FirstBirthdayRec;
  score: FirstBirthdayRecScore;
  onBack: () => void;
  onGoToItinerary: () => void;
}) {
  const setRecStatus = useFirstBirthdayStore((s) => s.setRecStatus);
  const addItineraryItem = useFirstBirthdayStore((s) => s.addItineraryItem);
  const itinerary = useFirstBirthdayStore((s) => s.itinerary);
  const states = useFirstBirthdayStore((s) => s.recStates);
  const currentStatus = states[rec.id]?.status ?? "suggested";
  const gradient = useMemo(() => buildGradient(rec.palette), [rec.palette]);

  function handleAddToItinerary() {
    const sortOrder = itinerary.length;
    addItineraryItem({
      dayNumber: 1,
      phase: rec.type === "ceremony_guide" ? "ceremony" : "party",
      startTime: "",
      durationMinutes: 30,
      activityName: rec.name,
      description: rec.hook,
      blockType:
        rec.type === "ceremony_guide"
          ? "ceremony"
          : rec.type === "activity"
            ? "highlight"
            : "standard",
      kidSafetyNote: rec.kidSafetyNotes,
      sortOrder,
      sourceRecId: rec.id,
    });
    setRecStatus(rec.id, "selected");
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
            rec.heroImage &&
              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-12 text-ivory",
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
          <h2
            className={cn(
              "font-serif text-[26px] leading-tight",
              rec.heroImage ? "text-ivory" : "text-ink",
            )}
          >
            {rec.name}
          </h2>
          <p
            className={cn(
              "max-w-xl text-[14px] italic leading-snug",
              rec.heroImage ? "text-ivory/90" : "text-ink-muted",
            )}
          >
            {rec.hook}
          </p>
        </div>
      </section>

      <Section
        eyebrow="WHY THIS MATCHES YOUR CELEBRATION"
        title={score.matchTag}
        description={score.whyNote}
      >
        <ScoreBreakdown breakdown={score.breakdown} />
      </Section>

      <Section eyebrow="THE EDITORIAL" title="What to expect">
        <div className="space-y-3 text-[13.5px] leading-relaxed text-ink">
          {rec.editorialDescription.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Section>

      <Section eyebrow="WHAT YOU'LL NEED" title="Checklist">
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {rec.whatYoullNeed.map((item) => (
            <li
              key={item}
              className="rounded-md border border-border bg-ivory-warm/40 px-3 py-2 text-[12.5px] text-ink"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md border border-border/60 bg-white p-4 md:grid-cols-3">
          <Fact label="Est. range" value={formatCostRange(rec)} />
          <Fact label="Duration" value={rec.suggestedDuration} />
          <Fact
            label="Guest range"
            value={`${rec.minGuests}–${rec.maxGuests}`}
          />
        </div>

        {rec.kidSafetyNotes && (
          <div className="mt-4 rounded-md border border-rose/30 bg-rose-pale/20 px-4 py-3 text-[12.5px] leading-snug text-ink">
            <p
              className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Kid safety note
            </p>
            {rec.kidSafetyNotes}
          </div>
        )}
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setRecStatus(
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
            <Bookmark
              size={12}
              strokeWidth={1.8}
              fill={currentStatus === "saved" ? "currentColor" : "none"}
            />
            {currentStatus === "saved" ? "Saved" : "Save for later"}
          </button>
          <button
            type="button"
            onClick={() => setRecStatus(rec.id, "dismissed")}
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
  breakdown: FirstBirthdayRecScore["breakdown"];
}) {
  const rows: { label: string; value: number }[] = [
    { label: "Vibe fit", value: breakdown.vibe },
    { label: "Guest count", value: breakdown.guestFit },
    { label: "Budget", value: breakdown.budget },
    { label: "Venue", value: breakdown.venue },
    { label: "Kid-friendly", value: breakdown.kid },
    { label: "Cultural", value: breakdown.cultural },
    { label: "Season", value: breakdown.season },
    { label: "Personal", value: breakdown.personal },
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
  if (palette.length === 0)
    return "linear-gradient(135deg, #F5E6D3, #D4A853)";
  if (palette.length === 1)
    return `linear-gradient(135deg, ${palette[0]}, ${palette[0]})`;
  return `linear-gradient(135deg, ${palette.join(", ")})`;
}

// Keep the full pool accessible for consumers that need to render the full
// library (e.g., saved tabs or saved-for-later views — reserved for future).
export { FIRST_BIRTHDAY_RECOMMENDATIONS };
