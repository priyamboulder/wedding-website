"use client";

// ── Inspiration wall ──────────────────────────────────────────────────────
// Phase 2 of the honeymoon flow. Reads the couple's vibeProfile, scores
// every seeded trip concept, and renders the top matches as rich cards.
// Clicking "Add to shortlist" prefills a Destination on the existing
// destinations list so the research board stays authoritative — the
// inspiration wall is a discovery layer on top, not a replacement.

import { AlertTriangle, ArrowRight, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import { matchDestinations, type ScoredConcept } from "@/lib/honeymoon/scoring";
import type { DestinationConcept } from "@/lib/honeymoon/destination-catalog";
import { cn } from "@/lib/utils";
import { Section } from "../bachelorette/ui";
import { ConceptDeepDive } from "./ConceptDeepDive";

export function InspirationWall() {
  const profile = useHoneymoonStore((s) => s.vibeProfile);
  const destinations = useHoneymoonStore((s) => s.destinations);

  // Signal for the empty state — hide the whole wall until the couple has
  // meaningfully answered the Dream Session quiz. Otherwise every concept
  // scores against a null profile and the matches are noise.
  const hasProfile =
    profile.vibes.length > 0 ||
    profile.duration !== null ||
    profile.budgetTier !== null;

  const { matches, wildcards, eliminated } = useMemo(
    () => matchDestinations(profile, 6),
    [profile],
  );

  const [showEliminated, setShowEliminated] = useState(false);
  const [openDiveId, setOpenDiveId] = useState<string | null>(null);

  if (!hasProfile) return null;

  const alreadyAdded = new Set(
    destinations
      .map((d) => d.name.trim().toLowerCase())
      .filter((n) => n.length > 0),
  );

  return (
    <Section
      eyebrow="MATCHED FOR YOU"
      title="Trip concepts that fit you two"
      description="Scored against your dream-session answers. Add any to your shortlist below — we'll prefill the considerations so you don't start from scratch."
    >
      {profile.timing === "minimoon_then_big" && (
        <MinimoonSplitter
          matches={matches}
          alreadyAdded={alreadyAdded}
          onOpenDive={(id) => setOpenDiveId(id)}
        />
      )}

      {matches.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center text-[13px] text-ink-muted">
          No matches yet — retake the Dream Session to get recommendations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <ConceptCard
              key={m.concept.id}
              match={m}
              alreadyAdded={alreadyAdded.has(
                m.concept.title.trim().toLowerCase(),
              )}
              onOpenDive={() => setOpenDiveId(m.concept.id)}
            />
          ))}
        </div>
      )}

      {wildcards.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-6">
          <p
            className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            Wildcards — you probably haven't thought of these
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {wildcards.map((m) => (
              <ConceptCard
                key={m.concept.id}
                match={m}
                alreadyAdded={alreadyAdded.has(
                  m.concept.title.trim().toLowerCase(),
                )}
                wildcard
                onOpenDive={() => setOpenDiveId(m.concept.id)}
              />
            ))}
          </div>
        </div>
      )}

      {openDiveId &&
        (() => {
          const openMatch = [...matches, ...wildcards].find(
            (m) => m.concept.id === openDiveId,
          );
          if (!openMatch) return null;
          const openAdded = alreadyAdded.has(
            openMatch.concept.title.trim().toLowerCase(),
          );
          return (
            <ConceptDeepDive
              match={openMatch}
              onClose={() => setOpenDiveId(null)}
              alreadyAdded={openAdded}
              onAddToShortlist={() => {
                if (!openAdded) addMatchToShortlist(openMatch);
              }}
            />
          );
        })()}

      {eliminated.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-4">
          <button
            type="button"
            onClick={() => setShowEliminated((s) => !s)}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {showEliminated ? "Hide" : "Show"} {eliminated.length} destinations
            ruled out
          </button>
          {showEliminated && (
            <ul className="mt-3 space-y-1.5">
              {eliminated.map((e) => (
                <li
                  key={e.concept.id}
                  className="flex items-start gap-2 text-[12.5px] text-ink-muted"
                >
                  <AlertTriangle
                    size={12}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-rose"
                  />
                  <span>
                    <strong className="text-ink">{e.concept.title}</strong> —{" "}
                    {e.eliminatedReason ?? "Doesn't match your filters"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  );
}

// ── Shared add-to-shortlist ────────────────────────────────────────────────
// Factored out so both the card footer and the deep-dive panel trigger
// identical prefilling of the research destination.

function addMatchToShortlist(match: ScoredConcept) {
  const store = useHoneymoonStore.getState();
  const { concept } = match;
  store.addDestination(concept.title);
  const latest = useHoneymoonStore.getState().destinations;
  const added = latest[latest.length - 1];
  if (!added) return;
  store.updateDestination(added.id, {
    emoji: kindEmoji(concept.kind),
    region: concept.regions.join(" · "),
    whyItFits: match.reasons.join(". ") || concept.tagline,
    duration: `${concept.recommendedDurationDays[0]}–${concept.recommendedDurationDays[1]} days`,
    flightLength: `${concept.flightHoursFromDFW[0]}–${concept.flightHoursFromDFW[1]}h from DFW`,
    seasonOk: match.seasonLine,
    budgetSingleCents: concept.couplesBudgetUsd[0] * 100,
    notes: concept.hook,
  });
  store.updateDestinationConsiderations(added.id, {
    flight: `${concept.flightHoursFromDFW[0]}–${concept.flightHoursFromDFW[1]} hours from DFW`,
    visa: concept.requiresPassport
      ? "Passport required"
      : "No passport needed",
    bestTime: match.seasonLine,
    budgetRange: match.budgetLine,
    jetLag: concept.flightHoursFromDFW[0] >= 12 ? "Significant" : "Mild",
  });

  // Pin the concept hero image to the moodboard so the couple's
  // inspiration grid builds up as they shortlist. Skip if a pin with
  // the same image URL is already there — cheap dedupe, no history loss.
  if (concept.heroImage) {
    const moodboard = useHoneymoonStore.getState().moodboard;
    const exists = moodboard.some((p) => p.imageUrl === concept.heroImage);
    if (!exists) {
      store.addMoodboardPin(concept.heroImage, "scenery", concept.title);
    }
  }
}

// ── Card ───────────────────────────────────────────────────────────────────

function ConceptCard({
  match,
  alreadyAdded,
  wildcard,
  onOpenDive,
}: {
  match: ScoredConcept;
  alreadyAdded: boolean;
  wildcard?: boolean;
  onOpenDive: () => void;
}) {
  const { concept } = match;
  const hasDive = Boolean(concept.deepDive);

  const matchToneClass =
    match.matchLabel === "perfect"
      ? "border-gold/60 bg-gold-light/10 text-gold"
      : match.matchLabel === "good"
        ? "border-sage/40 bg-sage/5 text-sage"
        : "border-border bg-white text-ink-muted";

  function handleAdd() {
    addMatchToShortlist(match);
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border transition-colors",
        wildcard ? "border-saffron/40 bg-saffron-pale/10" : "border-border bg-white",
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ivory-warm">
        {concept.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={concept.heroImage}
            alt={concept.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
              matchToneClass,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {matchLabelText(match.matchLabel)}
          </span>
          {wildcard && (
            <span
              className="rounded-full border border-saffron/50 bg-white/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Wildcard
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <header className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-serif text-[20px] leading-tight text-ink">
              {concept.title}
            </h4>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
               style={{ fontFamily: "var(--font-mono)" }}>
              {concept.regions.join(" · ")} · {concept.recommendedDurationDays[0]}–
              {concept.recommendedDurationDays[1]} days
            </p>
          </div>
        </header>

        <p className="text-[13px] italic leading-relaxed text-ink-muted">
          {concept.tagline}
        </p>

        <div className="mt-3 space-y-1.5 text-[12.5px] text-ink-muted">
          <FitLine tone="budget" text={match.budgetLine} />
          <FitLine tone="season" text={match.seasonLine} />
        </div>

        {concept.experienceHighlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {concept.experienceHighlights.map((h) => (
              <span
                key={h.label}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[11.5px] text-ink-muted"
              >
                <span aria-hidden>{h.emoji}</span>
                {h.label}
              </span>
            ))}
          </div>
        )}

        {match.warnings.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
            {match.warnings.slice(0, 2).map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11.5px] text-ink-muted"
              >
                <AlertTriangle
                  size={11}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-rose"
                />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}

        {concept.yellowFlags.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {concept.yellowFlags.slice(0, 2).map((f, i) => (
              <li
                key={i}
                className="text-[11px] italic leading-snug text-ink-faint"
              >
                ⚠ {f}
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-auto flex items-center justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={onOpenDive}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron transition-colors hover:text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {hasDive ? "View full trip guide" : "Preview the trip"}
            <ArrowRight size={10} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={alreadyAdded}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              alreadyAdded
                ? "border-border bg-ivory-warm text-ink-faint"
                : "border-gold/40 bg-gold text-white hover:opacity-90",
            )}
          >
            <Plus size={12} strokeWidth={2} />
            {alreadyAdded ? "Already on shortlist" : "Add to shortlist"}
          </button>
        </footer>
      </div>
    </article>
  );
}

function FitLine({
  tone,
  text,
}: {
  tone: "budget" | "season";
  text: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
        aria-hidden
      />
      <span>
        <span
          className="mr-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {tone === "budget" ? "Budget" : "Season"}
        </span>
        {text}
      </span>
    </div>
  );
}

function matchLabelText(l: ScoredConcept["matchLabel"]): string {
  switch (l) {
    case "perfect":
      return "Perfect fit";
    case "good":
      return "Good match";
    case "stretch":
      return "Stretch";
    case "poor":
      return "Poor fit";
  }
}

function kindEmoji(kind: DestinationConcept["kind"]): string {
  switch (kind) {
    case "beach":
      return "🌴";
    case "culture":
      return "🏛";
    case "adventure":
      return "🌋";
    case "food_wine":
      return "🍷";
    case "luxury":
      return "🏨";
    case "multi":
      return "🗺";
    case "domestic":
      return "🇺🇸";
  }
}

// ── Minimoon splitter ──────────────────────────────────────────────────────
// Shown when timing === "minimoon_then_big". Picks the best short/near
// concept and the best long/far concept from the live matches and
// suggests pairing them as a two-trip plan.

function MinimoonSplitter({
  matches,
  alreadyAdded,
  onOpenDive,
}: {
  matches: ScoredConcept[];
  alreadyAdded: Set<string>;
  onOpenDive: (id: string) => void;
}) {
  // Short / near: flight ≤ 6h, domestic or regional, shorter duration.
  const minimoon = matches
    .filter(
      (m) =>
        m.concept.flightHoursFromDFW[0] <= 6 &&
        m.concept.recommendedDurationDays[0] <= 7,
    )
    .sort((a, b) => b.score - a.score)[0];

  // Long / far: bigger trip, longer duration, can be long-haul.
  const bigTrip = matches
    .filter(
      (m) =>
        (m.concept.flightHoursFromDFW[0] >= 9 ||
          m.concept.recommendedDurationDays[1] >= 10) &&
        (!minimoon || m.concept.id !== minimoon.concept.id),
    )
    .sort((a, b) => b.score - a.score)[0];

  if (!minimoon && !bigTrip) return null;

  return (
    <section className="mb-6 rounded-lg border border-saffron/40 bg-saffron-pale/20 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Sparkles
          size={10}
          strokeWidth={1.8}
          className="mr-1 inline-block align-[-1px]"
        />
        Mini now + big later
      </p>
      <h3 className="mt-1 font-serif text-[19px] leading-tight text-ink">
        Do them as complementary trips
      </h3>
      <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
        A minimoon that's easy to pull off right after the wedding, and a
        bigger trip later when you've got the PTO and the energy. The pair
        below plays well together — the first decompresses you, the second
        is the one you'll talk about for years.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {minimoon ? (
          <SplitCard
            tag="The minimoon"
            match={minimoon}
            alreadyAdded={alreadyAdded.has(
              minimoon.concept.title.trim().toLowerCase(),
            )}
            onOpenDive={() => onOpenDive(minimoon.concept.id)}
          />
        ) : (
          <SplitPlaceholder label="No minimoon match — try relaxing flight or duration" />
        )}
        {bigTrip ? (
          <SplitCard
            tag="The big trip"
            match={bigTrip}
            alreadyAdded={alreadyAdded.has(
              bigTrip.concept.title.trim().toLowerCase(),
            )}
            onOpenDive={() => onOpenDive(bigTrip.concept.id)}
          />
        ) : (
          <SplitPlaceholder label="No big-trip match — broaden flight tolerance" />
        )}
      </div>
    </section>
  );
}

function SplitCard({
  tag,
  match,
  alreadyAdded,
  onOpenDive,
}: {
  tag: string;
  match: ScoredConcept;
  alreadyAdded: boolean;
  onOpenDive: () => void;
}) {
  const { concept } = match;
  return (
    <article className="flex flex-col rounded-md border border-border bg-white p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {tag}
      </p>
      <h4 className="mt-1 font-serif text-[16.5px] text-ink">
        {concept.title}
      </h4>
      <p className="mt-0.5 text-[11.5px] text-ink-muted">
        {concept.regions.join(" · ")} · {concept.flightHoursFromDFW[0]}–
        {concept.flightHoursFromDFW[1]}h flight ·{" "}
        {concept.recommendedDurationDays[0]}–
        {concept.recommendedDurationDays[1]} days
      </p>
      <p className="mt-2 text-[12.5px] italic leading-snug text-ink-muted">
        {concept.tagline}
      </p>
      <footer className="mt-auto flex items-center justify-between gap-2 pt-3">
        <button
          type="button"
          onClick={onOpenDive}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron transition-colors hover:text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          View guide
          <ArrowRight size={10} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!alreadyAdded) addMatchToShortlist(match);
          }}
          disabled={alreadyAdded}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            alreadyAdded
              ? "border-border bg-ivory-warm text-ink-faint"
              : "border-gold/40 bg-gold text-white hover:opacity-90",
          )}
        >
          <Plus size={10} strokeWidth={2} />
          {alreadyAdded ? "Added" : "Shortlist"}
        </button>
      </footer>
    </article>
  );
}

function SplitPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-6 text-center text-[12px] italic text-ink-muted">
      {label}
    </div>
  );
}
