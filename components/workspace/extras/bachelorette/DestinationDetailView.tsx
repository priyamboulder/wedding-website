"use client";

// ── Destination detail view ───────────────────────────────────────────────
// Full-tab replacement view shown when a destination card is tapped on the
// Discover tab. Renders the editorial deep-dive — day-by-day itinerary,
// restaurants, activities, stays, practical details. The "Back" button
// clears the selection in the parent.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  Martini,
  Sparkles,
  Thermometer,
  Utensils,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ActivityCategory,
  Destination,
  DestinationDetail,
  DestinationScore,
  MonthQuality,
  RestaurantCategory,
  StayType,
} from "@/types/bachelorette";
import { MONTH_OPTIONS } from "@/lib/bachelorette-seed";
import { useBacheloretteStore } from "@/stores/bachelorette-store";

interface Props {
  destination: Destination;
  detail: DestinationDetail;
  score: DestinationScore;
  onBack: () => void;
  onGoToItinerary: () => void;
}

const RESTAURANT_CATEGORY_LABEL: Record<RestaurantCategory, string> = {
  must_book: "The Must-Book Dinner",
  brunch: "The Brunch Spot",
  late_night: "The Late Night Move",
  instagram: "The Instagram Moment",
  local_secret: "The Local Secret",
  group_friendly: "The Group-Friendly Option",
};

const ACTIVITY_CATEGORY_LABEL: Record<ActivityCategory, string> = {
  classic_bach: "Classic Bach Activities",
  chill: "Chill & Recover",
  adventure: "Adventure",
  food_drink: "Food & Drink",
  nightlife: "Nightlife",
  culture: "Culture & Explore",
  unique: "Unique to This Destination",
};

const STAY_TYPE_LABEL: Record<StayType, string> = {
  airbnb: "Airbnb / VRBO",
  boutique: "Boutique Hotel",
  resort: "Resort",
  budget: "Budget-friendly",
};

type SectionId = "overview" | "itinerary" | "food" | "activities" | "stays" | "practical";

const SECTION_LINKS: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Sample itinerary" },
  { id: "food", label: "Restaurants & bars" },
  { id: "activities", label: "Activities" },
  { id: "stays", label: "Where to stay" },
  { id: "practical", label: "Practical details" },
];

export function DestinationDetailView({
  destination,
  detail,
  score,
  onBack,
  onGoToItinerary,
}: Props) {
  return (
    <div className="space-y-5">
      <TopBar onBack={onBack} />
      <Hero destination={destination} detail={detail} score={score} />
      <SectionNav />
      <OverviewSection detail={detail} score={score} />
      <ItinerarySection detail={detail} />
      <RestaurantsSection detail={detail} />
      <ActivitiesSection detail={detail} />
      <StaysSection detail={detail} />
      <PracticalSection detail={detail} />
      <PickThisDestinationSection
        destination={destination}
        detail={detail}
        onGoToItinerary={onGoToItinerary}
      />
    </div>
  );
}

// ── Missing-detail fallback ──────────────────────────────────────────────

export function DestinationGuideMissingView({
  destination,
  onBack,
}: {
  destination: Destination;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <TopBar onBack={onBack} />
      <section
        className="relative overflow-hidden rounded-lg border border-border p-6"
        style={{
          background: `linear-gradient(135deg, ${destination.palette.join(", ")})`,
        }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Guide in progress
        </p>
        <h2 className="mt-1 font-serif text-[28px] leading-tight text-ink">
          {destination.name}
        </h2>
        <p className="mt-1 text-[14px] text-ink/80">{destination.hook}</p>
      </section>
      <div className="rounded-lg border border-border bg-ivory-warm/40 p-8 text-center">
        <Wand2
          size={26}
          strokeWidth={1.3}
          className="mx-auto mb-3 text-ink-faint"
        />
        <p className="font-serif text-[17px] leading-snug text-ink">
          We're still writing this guide
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-[12.5px] text-ink-muted">
          Nashville, Scottsdale, and Austin are fully written so far. The rest
          of the pool has match scoring and card summaries today — editorial
          deep-dives are being added one destination at a time.
        </p>
      </div>
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
      >
        <ArrowLeft size={12} strokeWidth={2} />
        Back to matches
      </button>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────

function Hero({
  destination,
  detail,
  score,
}: {
  destination: Destination;
  detail: DestinationDetail;
  score: DestinationScore;
}) {
  const gradient = useMemo(
    () => `linear-gradient(135deg, ${destination.palette.join(", ")})`,
    [destination.palette],
  );

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-border p-8"
      style={{ background: gradient }}
    >
      {destination.heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={destination.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="relative">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {destination.region === "international" ? "International" : "Domestic"} · {score.score}% match · {score.matchTag}
        </p>
        <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">
          {destination.name}
        </h2>
        <p className="mt-1.5 text-[15px] leading-snug text-ink/85">
          {detail.tagline}
        </p>
        {detail.heroQuote && (
          <p className="mt-4 max-w-2xl font-serif text-[15px] italic leading-relaxed text-ink/85">
            "{detail.heroQuote}"
          </p>
        )}
        {score.weatherNote && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white/70 px-3 py-1.5 text-[12px] text-ink backdrop-blur">
            <Thermometer size={12} strokeWidth={1.8} />
            <span>{score.weatherNote}</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Section nav ───────────────────────────────────────────────────────────

function SectionNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
      {SECTION_LINKS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

// ── Overview (weather timeline + pack note) ───────────────────────────────

function OverviewSection({
  detail,
  score,
}: {
  detail: DestinationDetail;
  score: DestinationScore;
}) {
  return (
    <section id="overview" className="rounded-lg border border-border bg-white p-5">
      <h3 className="font-serif text-[18px] leading-tight text-ink">
        Best time to visit
      </h3>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        Month-by-month quality. Peak = book early, Shoulder = good, Avoid =
        plan around it.
      </p>
      <div className="mt-4 grid grid-cols-6 gap-1.5 md:grid-cols-12">
        {MONTH_OPTIONS.filter((m) => m.value !== "flexible").map((m) => {
          const q = detail.bestMonthsTimeline[m.value];
          return <MonthPill key={m.value} label={m.label.slice(0, 3)} quality={q} />;
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border/60 bg-ivory-warm/40 p-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What to pack
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
            {detail.whatToPack}
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-ivory-warm/40 p-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Why we picked it
          </p>
          <ul className="mt-1 space-y-0.5 text-[12.5px] text-ink">
            <li>Vibe fit: {score.breakdown.vibe}/100</li>
            <li>Budget fit: {score.breakdown.budget}/100</li>
            <li>Weather for your month: {score.breakdown.weather}/100</li>
            <li>Travel logistics: {score.breakdown.travel}/100</li>
            <li>Crew size fit: {score.breakdown.crew}/100</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function MonthPill({
  label,
  quality,
}: {
  label: string;
  quality: MonthQuality | undefined;
}) {
  const tone =
    quality === "peak"
      ? "border-sage/40 bg-sage-pale/50 text-sage"
      : quality === "shoulder"
        ? "border-gold/40 bg-gold-pale/50 text-gold"
        : quality === "avoid"
          ? "border-rose/40 bg-rose-pale/50 text-rose"
          : "border-border bg-white text-ink-faint";
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md border px-2 py-1.5",
        tone,
      )}
    >
      <span
        className="font-mono text-[10px] uppercase tracking-[0.14em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Itinerary ─────────────────────────────────────────────────────────────

function ItinerarySection({ detail }: { detail: DestinationDetail }) {
  return (
    <section id="itinerary" className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-center gap-2">
        <CalendarDays size={16} strokeWidth={1.7} className="text-saffron" />
        <h3 className="font-serif text-[18px] leading-tight text-ink">
          Sample itinerary
        </h3>
      </header>
      <p className="text-[12.5px] text-ink-muted">
        Tuned for a long weekend. Swap beats to taste — this is a starting
        point, not a script.
      </p>
      <div className="mt-5 space-y-6">
        {detail.itinerary.map((day, idx) => (
          <article key={idx}>
            <header className="mb-2">
              <h4 className="font-serif text-[16.5px] leading-tight text-ink">
                {day.label}
              </h4>
              <p className="mt-0.5 text-[12.5px] italic text-ink-muted">
                {day.headline}
              </p>
            </header>
            <p className="text-[13px] leading-relaxed text-ink">
              {day.narrative}
            </p>
            <ol className="mt-3 space-y-3 border-l border-border/60 pl-4">
              {day.beats.map((b, bi) => (
                <li key={bi}>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {b.time}
                  </p>
                  <p className="mt-0.5 font-serif text-[14.5px] leading-snug text-ink">
                    {b.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {b.body}
                  </p>
                  {b.reservationNote && (
                    <p
                      className="mt-1.5 inline-flex items-center rounded-sm bg-saffron-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-saffron"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {b.reservationNote}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Restaurants ───────────────────────────────────────────────────────────

function RestaurantsSection({ detail }: { detail: DestinationDetail }) {
  const grouped = useMemo(() => {
    const out = new Map<RestaurantCategory, typeof detail.restaurants>();
    for (const r of detail.restaurants) {
      if (!out.has(r.category)) out.set(r.category, []);
      out.get(r.category)!.push(r);
    }
    return out;
  }, [detail.restaurants]);

  return (
    <section id="food" className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-center gap-2">
        <Utensils size={16} strokeWidth={1.7} className="text-saffron" />
        <h3 className="font-serif text-[18px] leading-tight text-ink">
          Restaurants & bars
        </h3>
      </header>
      <div className="space-y-5">
        {(Object.keys(RESTAURANT_CATEGORY_LABEL) as RestaurantCategory[]).map(
          (cat) => {
            const items = grouped.get(cat);
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {RESTAURANT_CATEGORY_LABEL[cat]}
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {items.map((r, i) => (
                    <li
                      key={`${cat}-${i}`}
                      className="rounded-md border border-border/60 bg-ivory-warm/40 p-3.5"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-serif text-[15px] leading-tight text-ink">
                          {r.name}
                        </h4>
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {r.priceRange}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {r.neighborhood}
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-ink">
                        {r.vibe}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-snug text-ink-muted">
                        {r.whyBach}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <MetaPill label={r.reservation} tone="saffron" />
                        {r.groupSize && (
                          <MetaPill label={r.groupSize} tone="muted" />
                        )}
                      </div>
                      {r.insiderTip && (
                        <p className="mt-2 border-l-2 border-saffron/40 pl-2 text-[11.5px] italic leading-snug text-ink-muted">
                          {r.insiderTip}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}

// ── Activities ────────────────────────────────────────────────────────────

function ActivitiesSection({ detail }: { detail: DestinationDetail }) {
  const [filter, setFilter] = useState<ActivityCategory | "all">("all");
  const visible = useMemo(
    () =>
      filter === "all"
        ? detail.activities
        : detail.activities.filter((a) => a.category === filter),
    [detail.activities, filter],
  );

  const availableCats = useMemo(() => {
    const set = new Set<ActivityCategory>();
    detail.activities.forEach((a) => set.add(a.category));
    return Array.from(set);
  }, [detail.activities]);

  return (
    <section id="activities" className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3 flex items-center gap-2">
        <Martini size={16} strokeWidth={1.7} className="text-saffron" />
        <h3 className="font-serif text-[18px] leading-tight text-ink">
          Activities
        </h3>
      </header>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <CategoryChip
          label="All"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {availableCats.map((c) => (
          <CategoryChip
            key={c}
            label={ACTIVITY_CATEGORY_LABEL[c]}
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visible.map((a, i) => (
          <li
            key={`${a.category}-${i}`}
            className="rounded-md border border-border/60 bg-ivory-warm/40 p-3.5"
          >
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {ACTIVITY_CATEGORY_LABEL[a.category]}
            </p>
            <h4 className="mt-0.5 font-serif text-[15px] leading-snug text-ink">
              {a.title}
            </h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {a.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {a.costPerPerson && (
                <MetaPill label={a.costPerPerson} tone="muted" />
              )}
              {a.groupSize && <MetaPill label={a.groupSize} tone="muted" />}
              {a.timeOfDay && <MetaPill label={a.timeOfDay} tone="muted" />}
              {a.bookAhead && <MetaPill label={a.bookAhead} tone="saffron" />}
              {a.weatherSensitive && (
                <MetaPill label="Weather-dependent" tone="rose" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Stays ────────────────────────────────────────────────────────────────

function StaysSection({ detail }: { detail: DestinationDetail }) {
  return (
    <section id="stays" className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-center gap-2">
        <BedDouble size={16} strokeWidth={1.7} className="text-saffron" />
        <h3 className="font-serif text-[18px] leading-tight text-ink">
          Where to stay
        </h3>
      </header>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {detail.stays.map((s, i) => (
          <li
            key={i}
            className="rounded-md border border-border/60 bg-ivory-warm/40 p-3.5"
          >
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {STAY_TYPE_LABEL[s.type]} · {s.neighborhood}
            </p>
            <h4 className="mt-0.5 font-serif text-[15px] leading-snug text-ink">
              {s.title}
            </h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
              {s.body}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-saffron"
               style={{ fontFamily: "var(--font-mono)" }}>
              {s.priceNote}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Practical ─────────────────────────────────────────────────────────────

function PracticalSection({ detail }: { detail: DestinationDetail }) {
  const p = detail.practical;
  return (
    <section id="practical" className="rounded-lg border border-border bg-white p-5">
      <h3 className="font-serif text-[18px] leading-tight text-ink">
        Practical details
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PracticalRow label="Getting there" body={p.gettingThere} />
        <PracticalRow label="Getting around" body={p.gettingAround} />
        <PracticalRow label="Booking timeline" body={p.bookingTimeline} />
        <div className="rounded-md border border-border/60 bg-ivory-warm/40 p-3.5">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Local tips
          </p>
          <ul className="mt-1.5 space-y-1 text-[12.5px] leading-snug text-ink">
            {p.localTips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ink-faint">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PracticalRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-ivory-warm/40 p-3.5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink">{body}</p>
    </div>
  );
}

// ── Shared atoms ─────────────────────────────────────────────────────────

function MetaPill({
  label,
  tone,
}: {
  label: string;
  tone: "saffron" | "muted" | "rose";
}) {
  const cls =
    tone === "saffron"
      ? "bg-saffron-pale/40 text-saffron border-saffron/40"
      : tone === "rose"
        ? "bg-rose-pale/40 text-rose border-rose/40"
        : "bg-white text-ink-muted border-border/60";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

function CategoryChip({
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
        "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

// ── Pick-this-destination handoff (Slice 4) ───────────────────────────────
// CTA to seed the store's days + events from this destination's sample
// itinerary. Warns before overwriting existing content, then offers a
// jump to the Itinerary tab once seeded.

function PickThisDestinationSection({
  destination,
  detail,
  onGoToItinerary,
}: {
  destination: Destination;
  detail: DestinationDetail;
  onGoToItinerary: () => void;
}) {
  const existingDayCount = useBacheloretteStore((s) => s.days.length);
  const existingEventCount = useBacheloretteStore((s) => s.events.length);
  const existingLocation = useBacheloretteStore((s) => s.basics.location);
  const applyDestinationPlan = useBacheloretteStore(
    (s) => s.applyDestinationPlan,
  );

  const [phase, setPhase] = useState<"idle" | "confirming" | "done">("idle");
  const hasExistingPlan = existingDayCount > 0 || existingEventCount > 0;
  const alreadyPicked =
    existingLocation.toLowerCase() === destination.name.toLowerCase();
  const beatCount = detail.itinerary.reduce(
    (sum, d) => sum + d.beats.length,
    0,
  );

  if (phase === "done") {
    return (
      <section className="rounded-lg border border-sage/40 bg-sage-pale/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Check size={14} strokeWidth={2} className="text-sage" />
              <p
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Plan seeded
              </p>
            </div>
            <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
              Your {destination.name} itinerary is ready to tweak
            </h3>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-ink-muted">
              We wrote {detail.itinerary.length} days and {beatCount} events
              into the Itinerary tab. Review the beats, confirm the ones
              you're committing to, and fill in real dates whenever you
              lock them.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToItinerary}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            Go to Itinerary
            <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      </section>
    );
  }

  function handlePrimary() {
    if (hasExistingPlan) {
      setPhase("confirming");
      return;
    }
    applyDestinationPlan({
      destinationName: destination.name,
      itinerary: detail.itinerary,
    });
    setPhase("done");
  }

  if (phase === "confirming") {
    return (
      <section className="rounded-lg border border-rose/30 bg-rose-pale/30 p-5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Heads up
        </p>
        <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
          This will replace your current itinerary
        </h3>
        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-ink-muted">
          You already have {existingDayCount}{" "}
          {existingDayCount === 1 ? "day" : "days"} and{" "}
          {existingEventCount}{" "}
          {existingEventCount === 1 ? "event" : "events"}
          {existingLocation ? ` pointed at ${existingLocation}` : ""}. Seeding
          the {destination.name} plan overwrites them. Guests, budget,
          documents, and the vibe profile stay put.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              applyDestinationPlan({
                destinationName: destination.name,
                itinerary: detail.itinerary,
              });
              setPhase("done");
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            Replace with {destination.name} plan
          </button>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            Ready to commit?
          </p>
          <h3 className="mt-1 font-serif text-[20px] leading-tight text-ink">
            Use this {destination.name} plan as your starting point
          </h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-muted">
            We'll seed the Itinerary tab with {detail.itinerary.length} days
            and {beatCount} events — narrative notes, reservation windows,
            everything. You can then rearrange, add real dates, and confirm
            the ones you're committing to.
            {alreadyPicked &&
              " (You already picked this destination — re-running will reset any edits you've made.)"}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrimary}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
        >
          <Sparkles size={12} strokeWidth={2} />
          Use this plan
        </button>
      </div>
    </section>
  );
}
