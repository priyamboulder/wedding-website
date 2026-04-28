"use client";

// ── Discover tab ──────────────────────────────────────────────────────────
// Destination discovery — ranks the curated destination pool against the
// stored VibeProfile and renders a magazine-style card grid. Empty state
// when the vibe quiz has not been taken yet; filter chips for
// domestic/international. Tapping a card swaps the tab content for the
// editorial deep-dive; destinations without a written guide show a
// "coming soon" view instead.

import { useMemo, useState } from "react";
import { Compass, Globe2, MapPin, Sparkles, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBacheloretteStore } from "@/stores/bachelorette-store";
import {
  DESTINATIONS,
  getDestination,
  rankDestinations,
  scoreDestination,
} from "@/lib/bachelorette-destinations";
import {
  getDestinationDetail,
  hasDestinationDetail,
} from "@/lib/bachelorette-details";
import type {
  BudgetTier,
  Destination,
  DestinationScore,
  VibeProfile,
} from "@/types/bachelorette";
import { BUDGET_TIER_OPTIONS } from "@/lib/bachelorette-seed";
import { Section } from "../ui";
import {
  DestinationDetailView,
  DestinationGuideMissingView,
} from "../DestinationDetailView";

type RegionFilter = "all" | "domestic" | "international";

interface DiscoverTabProps {
  onGoToItinerary: () => void;
}

export function DiscoverTab({ onGoToItinerary }: DiscoverTabProps) {
  const vibeProfile = useBacheloretteStore((s) => s.vibeProfile);
  const [region, setRegion] = useState<RegionFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!vibeProfile.energy) {
    return <EmptyState />;
  }

  if (selectedId) {
    const destination = getDestination(selectedId);
    if (!destination) {
      // Stale selection — fall back to grid
      setSelectedId(null);
      return null;
    }
    const detail = getDestinationDetail(selectedId);
    const score = scoreDestination(destination, vibeProfile);
    if (detail) {
      return (
        <DestinationDetailView
          destination={destination}
          detail={detail}
          score={score}
          onBack={() => setSelectedId(null)}
          onGoToItinerary={onGoToItinerary}
        />
      );
    }
    return (
      <DestinationGuideMissingView
        destination={destination}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <HeaderCard profile={vibeProfile} />
      <FilterBar
        region={region}
        onRegion={setRegion}
        counts={{
          all: DESTINATIONS.length,
          domestic: DESTINATIONS.filter((d) => d.region === "domestic").length,
          international: DESTINATIONS.filter(
            (d) => d.region === "international",
          ).length,
        }}
      />
      <DestinationGrid
        profile={vibeProfile}
        region={region}
        onSelect={setSelectedId}
      />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Section
      eyebrow="DESTINATION DISCOVERY"
      title="Start with the vibe check"
      description="We'll rank destinations against the energy, crew, budget and month you pick — no generic top-10 lists. Head to Plan & Vibe to take the quiz."
    >
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <div className="max-w-md">
          <Compass
            size={28}
            strokeWidth={1.3}
            className="mx-auto mb-3 text-ink-faint"
          />
          <p className="font-serif text-[17px] leading-snug text-ink">
            Take the 3-minute vibe check to unlock your matches
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            Energy, crew, budget, travel mode, month. That's it.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Header recap ─────────────────────────────────────────────────────────

function HeaderCard({ profile }: { profile: VibeProfile }) {
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
        Destinations that match your crew
      </h3>
      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
        We scored each destination on vibe fit, budget, weather for your
        month, travel logistics, and crew size — then applied your hard
        no's as penalties. The top matches are below.
      </p>
    </section>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────────

function FilterBar({
  region,
  onRegion,
  counts,
}: {
  region: RegionFilter;
  onRegion: (r: RegionFilter) => void;
  counts: { all: number; domestic: number; international: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        label={`All · ${counts.all}`}
        active={region === "all"}
        onClick={() => onRegion("all")}
      />
      <FilterPill
        label={`Domestic · ${counts.domestic}`}
        active={region === "domestic"}
        onClick={() => onRegion("domestic")}
      />
      <FilterPill
        label={`International · ${counts.international}`}
        active={region === "international"}
        onClick={() => onRegion("international")}
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

function DestinationGrid({
  profile,
  region,
  onSelect,
}: {
  profile: VibeProfile;
  region: RegionFilter;
  onSelect: (id: string) => void;
}) {
  const ranked = useMemo(() => rankDestinations(profile), [profile]);
  const filtered = useMemo(
    () =>
      region === "all"
        ? ranked
        : ranked.filter((r) => r.destination.region === region),
    [ranked, region],
  );

  if (filtered.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center text-[13px] text-ink-muted">
        No destinations in this region yet — try switching filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map(({ destination, score }) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          score={score}
          profile={profile}
          onSelect={() => onSelect(destination.id)}
        />
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────

function DestinationCard({
  destination,
  score,
  profile,
  onSelect,
}: {
  destination: Destination;
  score: DestinationScore;
  profile: VibeProfile;
  onSelect: () => void;
}) {
  const gradient = useMemo(() => buildGradient(destination.palette), [
    destination.palette,
  ]);
  const costRange = resolveCostRange(destination, profile.budgetTier);
  const guideReady = hasDestinationDetail(destination.id);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
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
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span
            className="inline-flex items-center gap-1 rounded-sm bg-white/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink backdrop-blur"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {destination.region === "international" ? (
              <Globe2 size={10} strokeWidth={2} />
            ) : (
              <MapPin size={10} strokeWidth={2} />
            )}
            {destination.region === "international" ? "International" : "Domestic"}
          </span>
          <span
            className="inline-flex items-center rounded-sm bg-ink/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ivory"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {score.score}% match
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-[18px] leading-tight text-ink">
              {destination.name}
            </h4>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-muted">
            {destination.hook}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full border border-saffron/40 bg-saffron-pale/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {score.matchTag}
          </span>
          {destination.redFlag && (
            <span
              className="inline-flex items-center rounded-full border border-rose/40 bg-rose-pale/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {destination.redFlag}
            </span>
          )}
          {!destination.redFlag && destination.yellowFlag && (
            <span
              className="inline-flex items-center rounded-full border border-gold/40 bg-gold-pale/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {destination.yellowFlag}
            </span>
          )}
        </div>

        {score.weatherNote && (
          <div className="flex items-start gap-1.5 rounded-md border border-border/60 bg-ivory-warm/50 px-2.5 py-1.5 text-[11.5px] leading-snug text-ink-muted">
            <Thermometer
              size={12}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-ink-faint"
            />
            <span>{score.weatherNote}</span>
          </div>
        )}

        <ul className="flex flex-wrap gap-1">
          {destination.activityHighlights.slice(0, 4).map((h) => (
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
              Est. per person
            </p>
            <p className="font-serif text-[14px] text-ink">
              {costRange}
            </p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              guideReady
                ? "border-ink bg-ink text-ivory hover:bg-ink-soft"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
            )}
            title={guideReady ? "Open the full guide" : "Guide coming soon — preview what we have"}
          >
            {guideReady ? "View guide →" : "Preview →"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildGradient(palette: string[]): string {
  if (palette.length === 0) return "linear-gradient(135deg, #F5E6D3, #D4A853)";
  if (palette.length === 1) return `linear-gradient(135deg, ${palette[0]}, ${palette[0]})`;
  const stops = palette.join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

function resolveCostRange(
  dest: Destination,
  tier: BudgetTier | null,
): string {
  // Prefer the user's selected tier; fall back to the lowest available.
  if (tier && dest.estPerPersonUsd[tier]) {
    const [lo, hi] = dest.estPerPersonUsd[tier]!;
    return `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
  }
  const firstAvailable = BUDGET_TIER_OPTIONS.find(
    (o) => dest.estPerPersonUsd[o.value],
  );
  if (!firstAvailable) return "—";
  const [lo, hi] = dest.estPerPersonUsd[firstAvailable.value]!;
  return `From $${lo.toLocaleString()}`;
}
