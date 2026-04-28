"use client";

// ── Concepts tab ───────────────────────────────────────────────────────────
// Renders the ranked concept library as cards + opens a full deep-dive
// detail view. The detail view is the spec's "Phase 3" — menu narrative,
// timeline, décor direction, budget, invitation, and select-this-concept
// CTA. Selecting a concept sets the store's selection and reveals the
// Menu & Flow / Budget / Checklist tabs.

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  DollarSign,
  Flower2,
  Heart,
  Sparkles,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import {
  getConceptById,
  useRankedConcepts,
  type ConceptMatch,
} from "@/lib/bridal-shower-concepts";
import type { ShowerConcept } from "@/types/bridal-shower";

export function ConceptsTab({
  onGoToMenuFlow,
}: {
  onGoToMenuFlow: () => void;
}) {
  const ranked = useRankedConcepts();
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  // Detail view is explicit — null means "show the grid." Defaults to the
  // currently-selected concept when the tab first mounts so returning users
  // land back on their chosen blueprint.
  const [detailId, setDetailId] = useState<string | null>(selectionId);

  // Keep detail in sync when a new concept is selected elsewhere (e.g. via
  // the Select button inside a detail). Doesn't force-open on every render —
  // only reacts to selectionId changes.
  useEffect(() => {
    if (selectionId) setDetailId(selectionId);
  }, [selectionId]);

  const activeConcept = detailId ? getConceptById(detailId) : null;

  if (activeConcept) {
    return (
      <ConceptDetail
        concept={activeConcept}
        onBack={() => setDetailId(null)}
        onGoToMenuFlow={onGoToMenuFlow}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Flower2
            size={10}
            strokeWidth={1.8}
            className="mr-1 inline-block align-[-1px]"
          />
          Tuned to your brief
        </p>
        <h2 className="font-serif text-[22px] leading-tight text-ink">
          Five concepts. Pick the one that actually sounds like her.
        </h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          Each is a complete vision — menu, flow, décor, budget. The top picks
          are ranked against your brief; the rest are fallbacks worth a look.
          Tap any card for the full blueprint.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ranked.map((match) => (
          <ConceptCard
            key={match.concept.id}
            match={match}
            selected={selectionId === match.concept.id}
            onOpen={() => setDetailId(match.concept.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Concept card ──────────────────────────────────────────────────────────

function ConceptCard({
  match,
  selected,
  onOpen,
}: {
  match: ConceptMatch;
  selected: boolean;
  onOpen: () => void;
}) {
  const { concept, score, matchReasons } = match;

  const gradient = `linear-gradient(135deg, ${concept.heroPalette[0]}, ${concept.heroPalette[1]}, ${concept.heroPalette[2]})`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group overflow-hidden rounded-lg border bg-white text-left transition-all",
        selected
          ? "border-ink shadow-sm"
          : "border-border hover:border-saffron/50 hover:shadow-sm",
      )}
    >
      <div
        className="relative h-28 w-full"
        style={{ background: gradient }}
      >
        {selected && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory">
            <Check size={9} strokeWidth={2.5} />
            Selected
          </span>
        )}
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score}% match
        </span>
      </div>
      <div className="space-y-2.5 p-5">
        <div>
          <h3 className="font-serif text-[18px] leading-tight text-ink">
            {concept.name}
          </h3>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
            {concept.tagline}
          </p>
        </div>

        {matchReasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {matchReasons.map((r) => (
              <li
                key={r}
                className="rounded-full bg-sage-pale/50 px-2.5 py-0.5 text-[11px] text-sage"
              >
                {r}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Up to {concept.maxGuests} guests
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-saffron group-hover:underline">
            See the blueprint
            <ChevronRight size={12} strokeWidth={2} />
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Concept detail (the "Phase 3 deep-dive") ──────────────────────────────

function ConceptDetail({
  concept,
  onBack,
  onGoToMenuFlow,
}: {
  concept: ShowerConcept;
  onBack: () => void;
  onGoToMenuFlow: () => void;
}) {
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  const selectConcept = useBridalShowerStore((s) => s.selectConcept);
  const isSelected = selectionId === concept.id;

  const gradient = `linear-gradient(135deg, ${concept.heroPalette[0]}, ${concept.heroPalette[1]}, ${concept.heroPalette[2]})`;

  function onSelect() {
    selectConcept(concept.id);
    onGoToMenuFlow();
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={13} strokeWidth={2} />
        Back to all concepts
      </button>

      {/* Hero */}
      <div
        className="relative h-40 overflow-hidden rounded-lg"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-ivory">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-80"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            THE CONCEPT
          </p>
          <h2 className="mt-1 font-serif text-[28px] leading-tight drop-shadow-sm">
            {concept.name}
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-snug drop-shadow-sm">
            {concept.tagline}
          </p>
        </div>
      </div>

      {/* Narrative */}
      <section className="rounded-lg border border-border bg-white p-6">
        <p className="text-[14px] leading-relaxed text-ink">
          {concept.narrative}
        </p>
      </section>

      {/* Menu */}
      <DetailSection
        eyebrow="THE MENU"
        title="What she'll eat — and what she'll remember"
        icon={<Utensils size={16} strokeWidth={1.6} />}
      >
        <div className="space-y-4">
          <MenuItem
            label={`SIGNATURE COCKTAIL — ${concept.menu.welcomeDrink}`}
            body={concept.menu.welcomeDrinkRecipe}
          />
          <MenuItem
            label={`NON-ALC — ${concept.menu.mocktail}`}
            body={concept.menu.mocktailRecipe}
          />
          <MenuItem
            label="APPETIZERS"
            body={<ul className="list-inside list-disc space-y-0.5">{concept.menu.appetizers.map((a) => <li key={a}>{a}</li>)}</ul>}
          />
          <MenuItem
            label={`MAIN — ${concept.menu.mainStyle.replace("_", "-")}`}
            body={concept.menu.mainCourse}
          />
          {concept.menu.sides.length > 0 && (
            <MenuItem
              label="SIDES"
              body={<ul className="list-inside list-disc space-y-0.5">{concept.menu.sides.map((s) => <li key={s}>{s}</li>)}</ul>}
            />
          )}
          <MenuItem label="DESSERT" body={concept.menu.dessert} />
          <MenuItem label="DRINKS STRATEGY" body={concept.menu.drinksGuidance} />
          <MenuItem
            label="DIETARY ACCOMMODATIONS"
            body={concept.menu.dietaryNotes}
          />
        </div>
      </DetailSection>

      {/* Timeline */}
      <DetailSection
        eyebrow="EVENT TIMELINE"
        title="Minute-by-minute flow"
        icon={<CalendarDays size={16} strokeWidth={1.6} />}
      >
        <ol className="space-y-4">
          {concept.timeline.map((beat, i) => (
            <li key={i} className="grid grid-cols-[90px_1fr] gap-4">
              <span
                className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {beat.time}
              </span>
              <div>
                <p className="text-[13.5px] font-medium text-ink">
                  {beat.title}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
                  {beat.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </DetailSection>

      {/* Activities */}
      <DetailSection
        eyebrow="ACTIVITIES & FLOW"
        title="What to do (and what to skip)"
        icon={<Sparkles size={16} strokeWidth={1.6} />}
      >
        <ul className="space-y-4">
          {concept.activities.map((a) => (
            <li key={a.id} className="rounded-md border border-border/60 bg-ivory-warm/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif text-[15px] leading-tight text-ink">
                    {a.title}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                    {a.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {a.timeMinutes > 0 ? `${a.timeMinutes} min` : "Passive"}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block font-mono text-[10px] uppercase tracking-[0.12em]",
                      a.multiGenerationalFriendly ? "text-sage" : "text-rose",
                    )}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {a.multiGenerationalFriendly
                      ? "Multi-gen ok"
                      : "Skip for elders"}
                  </span>
                </div>
              </div>
              {a.skipIf && (
                <p className="mt-2 border-t border-border/60 pt-2 text-[11.5px] italic text-ink-muted">
                  <strong className="text-ink">Skip if:</strong> {a.skipIf}
                </p>
              )}
            </li>
          ))}
        </ul>
      </DetailSection>

      {/* Décor */}
      <DetailSection
        eyebrow="DÉCOR & AESTHETIC"
        title="Not a shopping list — a direction"
        icon={<Flower2 size={16} strokeWidth={1.6} />}
      >
        <div className="space-y-4">
          <div>
            <Label>PALETTE</Label>
            <ul className="mt-2 flex flex-wrap gap-3">
              {concept.decor.palette.map((c) => (
                <li
                  key={c.hex}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-border/60"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11.5px] text-ink">
                    {c.label}{" "}
                    <span className="font-mono text-[10px] text-ink-faint">
                      {c.hex}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DecorLine label="FLORALS" body={concept.decor.florals} />
          <DecorLine label="TABLE SETTING" body={concept.decor.tableSetting} />
          <DecorLine label="SIGNAGE" body={concept.decor.signage} />
          <DecorLine
            label="STATEMENT MOMENT"
            body={concept.decor.statementMoment}
          />
          <DecorLine
            label="SKIP THESE"
            body={concept.decor.skipThese}
            tone="warning"
          />
        </div>
      </DetailSection>

      {/* Budget */}
      <DetailSection
        eyebrow="BUDGET BREAKDOWN"
        title="Where to save, where to splurge"
        icon={<DollarSign size={16} strokeWidth={1.6} />}
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-sage/30 bg-sage-pale/30 p-3">
              <Label>SAVE ON</Label>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
                {concept.budget.saveOn}
              </p>
            </div>
            <div className="rounded-md border border-gold-light/40 bg-gold-pale/30 p-3">
              <Label>SPLURGE ON</Label>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
                {concept.budget.splurgeOn}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-border/60">
            {concept.budget.lines.map((line) => (
              <li
                key={line.label}
                className="grid grid-cols-[1fr_auto] items-start gap-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {line.label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">
                    {line.note}
                  </p>
                </div>
                <span
                  className="shrink-0 font-mono text-[12px] tabular-nums text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {line.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </DetailSection>

      {/* Invitation */}
      <DetailSection
        eyebrow="THE INVITATION"
        title="Tone, timing, format"
        icon={<Heart size={16} strokeWidth={1.6} />}
      >
        <dl className="space-y-3">
          <div>
            <dt>
              <Label>WHEN TO SEND</Label>
            </dt>
            <dd className="mt-1 text-[13px] text-ink">
              {concept.invitation.sendAt}
            </dd>
          </div>
          <div>
            <dt>
              <Label>TONE EXAMPLE</Label>
            </dt>
            <dd className="mt-1 rounded-md border border-border/60 bg-ivory-warm/30 p-3 font-serif text-[13.5px] italic leading-relaxed text-ink">
              {concept.invitation.toneExample}
            </dd>
          </div>
          <div>
            <dt>
              <Label>FORMAT</Label>
            </dt>
            <dd className="mt-1 text-[13px] leading-relaxed text-ink">
              {concept.invitation.format}
            </dd>
          </div>
        </dl>
      </DetailSection>

      {/* Select CTA */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-lg border border-ink bg-ink p-5 text-ivory shadow-lg">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-80"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {isSelected ? "Current concept" : "Ready to commit?"}
          </p>
          <p className="mt-1 font-serif text-[18px] leading-tight">
            {concept.name}
          </p>
        </div>
        {isSelected ? (
          <button
            type="button"
            onClick={onGoToMenuFlow}
            className="inline-flex items-center gap-1.5 rounded-md bg-ivory px-4 py-2 text-[13px] font-medium text-ink hover:bg-ivory-warm"
          >
            Plan the menu & flow
            <ArrowRight size={13} strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-1.5 rounded-md bg-saffron px-4 py-2 text-[13px] font-medium text-ink hover:opacity-90"
          >
            <Check size={13} strokeWidth={2} />
            Select this concept
          </button>
        )}
      </div>
    </div>
  );
}

// ── Shared detail section wrapper ─────────────────────────────────────────

function DetailSection({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <header className="mb-4">
        <p
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {icon}
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-[18px] leading-snug text-ink">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function MenuItem({
  label,
  body,
}: {
  label: string;
  body: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 text-[13px] leading-relaxed text-ink">{body}</div>
    </div>
  );
}

function DecorLine({
  label,
  body,
  tone = "default",
}: {
  label: string;
  body: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        tone === "warning"
          ? "border-rose/30 bg-rose-pale/25"
          : "border-border/60 bg-white",
      )}
    >
      <Label>{label}</Label>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink">{body}</p>
    </div>
  );
}
