"use client";

// ── Events dashboard ───────────────────────────────────────────────────────
// Post-quiz surface. Renders:
//  · a program header with the couple's answers
//  · proactive flags from detectFlags()
//  · AI cards: event names, themes, attire, palette shifts, cuisine,
//    budget allocation, wedding party
//
// Every AI output goes through AICard, whose Keep / See alternatives /
// Refine-with-a-note buttons write back to events-store.suggestions. Real
// Claude calls will replace the stub bodies in lib/events/ai.ts without
// changing any of this surface.

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import {
  EVENT_TYPE_OPTIONS,
  MOOD_TILE_OPTIONS,
  PALETTE_LIBRARY,
  PRIORITY_OPTIONS,
  TRADITION_OPTIONS,
} from "@/lib/events-seed";
import {
  detectFlags,
  findPalette,
  generateAttire,
  generateBudgetAllocation,
  generateCuisine,
  generateEventNames,
  generateEventThemes,
  generatePalettePerEvent,
  generateWeddingParty,
  type AttireSuggestion,
  type BudgetSuggestion,
  type EventsAIContext,
  type EventsFlag,
  type WeddingPartySuggestion,
} from "@/lib/events/ai";
import type { AISuggestionScope, EventRecord } from "@/types/events";
import { cn } from "@/lib/utils";
import { AICard, type AICardStatus } from "./AICard";

// v4 palette is per-event, not per-wedding — compose a compact summary
// for the dashboard's palette tile ("Midnight & Gold · Garden Romance …").
function palettesSummary(events: EventRecord[]): string {
  const names = events
    .map((e) => {
      if (e.paletteCustomName?.trim()) return e.paletteCustomName.trim();
      if (e.paletteId)
        return PALETTE_LIBRARY.find((p) => p.id === e.paletteId)?.name ?? null;
      if (e.customPalette) return "Custom";
      return null;
    })
    .filter((n): n is string => Boolean(n));
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return "—";
  if (unique.length === 1) return unique[0];
  return unique.slice(0, 3).join(" · ") + (unique.length > 3 ? "…" : "");
}

export function EventsDashboard() {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);
  const setQuizStepIndex = useEventsStore((s) => s.setQuizStepIndex);
  const resetQuiz = useEventsStore((s) => s.resetQuiz);

  // `regenKey` bumps whenever the couple hits "See alternatives" or
  // "Refine" — we re-run the (deterministic) stub generators so the card
  // content visibly changes. Real Claude calls will replace this with
  // per-card streaming regenerations.
  const [regenKey, setRegenKey] = useState(0);

  const ctx: EventsAIContext = useMemo(
    () => ({ coupleContext, events }),
    [coupleContext, events],
  );

  const names = useMemo(() => generateEventNames(ctx), [ctx, regenKey]);
  const themes = useMemo(() => generateEventThemes(ctx), [ctx, regenKey]);
  const attire = useMemo(() => generateAttire(ctx), [ctx, regenKey]);
  const palettes = useMemo(() => generatePalettePerEvent(ctx), [ctx, regenKey]);
  const cuisine = useMemo(() => generateCuisine(ctx), [ctx, regenKey]);
  const budget = useMemo(() => generateBudgetAllocation(ctx), [ctx, regenKey]);
  const party = useMemo(() => generateWeddingParty(ctx), [ctx, regenKey]);
  const flags = useMemo(() => detectFlags(ctx), [ctx, regenKey]);

  function editAnswer(stepIndex: number) {
    setQuizStepIndex(stepIndex);
    // `completedAt` is kept; the shell renders the dashboard while events-
    // store quiz.completedAt is truthy. We route the couple back into the
    // quiz by resetting completedAt (keeping their data).
    useEventsStore.setState((s) => ({
      quiz: { ...s.quiz, completedAt: null },
    }));
  }

  function onStartOver() {
    if (
      !window.confirm(
        "Start the brief from scratch? This clears your answers and AI drafts.",
      )
    ) {
      return;
    }
    resetQuiz();
  }

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The brief · Summary
          </p>
          <h1 className="mt-1 font-serif text-[34px] leading-tight text-ink">
            Here's what the AI made from your answers
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
            Every card below was drafted from your answers. Keep what feels
            right, regenerate any line, or refine with a note in your own
            words. Nothing is final — this surface is designed to iterate
            with you.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderButton onClick={onStartOver}>
            <RotateCcw size={12} strokeWidth={1.8} />
            Start over
          </HeaderButton>
        </div>
      </header>

      {/* Summary strip — the couple's own answers, always visible and editable. */}
      <section className="mt-8">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Your answers
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <SummaryTile
            label="Program"
            body={
              events.length > 0
                ? events
                    .map(
                      (e) =>
                        EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ??
                        e.type,
                    )
                    .join(" · ")
                : "—"
            }
            onEdit={() => editAnswer(0)}
          />
          <SummaryTile
            label="Traditions"
            body={
              coupleContext.traditions.length > 0
                ? coupleContext.traditions
                    .map(
                      (t) =>
                        TRADITION_OPTIONS.find((o) => o.id === t)?.name ?? t,
                    )
                    .join(", ")
                : "—"
            }
            onEdit={() => editAnswer(1)}
          />
          <SummaryTile
            label="Total guests"
            body={`${coupleContext.totalGuestCount}`}
            onEdit={() => editAnswer(2)}
          />
          <SummaryTile
            label="Palette"
            body={palettesSummary(events)}
            onEdit={() => editAnswer(3)}
          />
          <SummaryTile
            label="Top priorities"
            body={coupleContext.priorityRanking
              .slice(0, 3)
              .map((p) => PRIORITY_OPTIONS.find((o) => o.id === p)?.name ?? p)
              .join(" · ")}
            onEdit={() => editAnswer(4)}
          />
          <SummaryTile
            label="Story"
            body={
              coupleContext.storyText.trim() ||
              "—"
            }
            onEdit={() => editAnswer(1)}
            italic
          />
        </div>
      </section>

      {/* Proactive flags */}
      {flags.length > 0 && (
        <section className="mt-8">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Flags worth a look
          </h2>
          <ul className="mt-3 space-y-2">
            {flags.map((f) => (
              <FlagRow key={f.id} flag={f} />
            ))}
          </ul>
        </section>
      )}

      {/* AI cards */}
      <section className="mt-10 space-y-10">
        <DashboardGroup title="Event names and themes" subtitle="AI pulled these from your story and vibe.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {events.map((e) => {
              const nameSuggestion = names.find((n) => n.eventId === e.id);
              const themeSuggestion = themes.find((t) => t.eventId === e.id);
              return (
                <DashboardAICard
                  key={`name-${e.id}`}
                  eyebrow={labelFor(e)}
                  title={nameSuggestion?.name ?? labelFor(e)}
                  scope="event_name"
                  eventId={e.id}
                  onRegenerate={() => setRegenKey((k) => k + 1)}
                >
                  <p>{themeSuggestion?.narrative}</p>
                  {nameSuggestion?.rationale && (
                    <p className="mt-2 text-[12px] italic text-ink-muted">
                      {nameSuggestion.rationale}
                    </p>
                  )}
                </DashboardAICard>
              );
            })}
          </div>
        </DashboardGroup>

        <DashboardGroup title="Attire direction" subtitle="Draft looks per event — refine any line without touching the others.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {events.map((e) => {
              const a = attire.find((x) => x.eventId === e.id);
              if (!a) return null;
              return (
                <DashboardAICard
                  key={`attire-${e.id}`}
                  eyebrow={`${labelFor(e)} · attire`}
                  title={`Bride, groom, dress code`}
                  scope="attire"
                  eventId={e.id}
                  onRegenerate={() => setRegenKey((k) => k + 1)}
                >
                  <AttireBody a={a} />
                </DashboardAICard>
              );
            })}
          </div>
        </DashboardGroup>

        <DashboardGroup title="Per-event palette shifts" subtitle="Each event leans lighter or deeper from your hero palette.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {events.map((e) => {
              const p = palettes.find((x) => x.eventId === e.id);
              if (!p) return null;
              const palette = findPalette(p.paletteId);
              return (
                <DashboardAICard
                  key={`palette-${e.id}`}
                  eyebrow={`${labelFor(e)} · palette`}
                  title={palette?.name ?? "Palette"}
                  scope="palette_per_event"
                  eventId={e.id}
                  onRegenerate={() => setRegenKey((k) => k + 1)}
                >
                  {palette && (
                    <div className="mb-2 flex h-8 w-full overflow-hidden rounded">
                      {palette.colors.map((c) => (
                        <div
                          key={c.hex}
                          className="flex-1"
                          style={{ backgroundColor: c.hex }}
                          aria-label={c.name}
                        />
                      ))}
                    </div>
                  )}
                  <p>{p.shiftNote}</p>
                </DashboardAICard>
              );
            })}
          </div>
        </DashboardGroup>

        <DashboardGroup title="Cuisine direction" subtitle="Menu language per event, keyed to your primary tradition.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {events.map((e) => {
              const c = cuisine.find((x) => x.eventId === e.id);
              if (!c) return null;
              return (
                <DashboardAICard
                  key={`cuisine-${e.id}`}
                  eyebrow={`${labelFor(e)} · cuisine`}
                  title="Menu direction"
                  scope="cuisine"
                  eventId={e.id}
                  onRegenerate={() => setRegenKey((k) => k + 1)}
                >
                  <p>{c.direction}</p>
                </DashboardAICard>
              );
            })}
          </div>
        </DashboardGroup>

        <DashboardGroup title="Budget split" subtitle="Percentages, not dollars — apply to whatever your total is.">
          <DashboardAICard
            eyebrow="Budget allocation"
            title="Your priorities, as a split"
            scope="budget"
            onRegenerate={() => setRegenKey((k) => k + 1)}
          >
            <BudgetBody budget={budget} />
          </DashboardAICard>
        </DashboardGroup>

        <DashboardGroup title="Wedding party" subtitle="Scaled to your total guest count; adjust any line.">
          <DashboardAICard
            eyebrow="Wedding party"
            title="Rough roster"
            scope="wedding_party"
            onRegenerate={() => setRegenKey((k) => k + 1)}
          >
            <WeddingPartyBody party={party} />
          </DashboardAICard>
        </DashboardGroup>
      </section>
    </div>
  );
}

// ── Dashboard group header ─────────────────────────────────────────────────

function DashboardGroup({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-serif text-[20px] leading-tight text-ink">
          {title}
        </h2>
        <p className="text-[12.5px] text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ── AICard wrapper wired to the store ──────────────────────────────────────

function DashboardAICard({
  eyebrow,
  title,
  children,
  scope,
  eventId,
  onRegenerate,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  scope: AISuggestionScope;
  eventId?: string;
  onRegenerate: () => void;
}) {
  const suggestionsFor = useEventsStore((s) => s.suggestionsFor);
  const addSuggestion = useEventsStore((s) => s.addSuggestion);
  const updateSuggestion = useEventsStore((s) => s.updateSuggestion);

  const existing = suggestionsFor(scope, eventId ?? null)[0];
  const status: AICardStatus = existing?.status ?? "pending";

  function keep() {
    if (existing) {
      updateSuggestion(existing.id, { status: "accepted" });
      return;
    }
    const id = addSuggestion({
      scope,
      eventId: eventId ?? null,
      suggestion: { acceptedAt: new Date().toISOString() },
    });
    updateSuggestion(id, { status: "accepted" });
  }

  function regenerate() {
    if (existing) {
      updateSuggestion(existing.id, { status: "pending", refinementPrompt: null });
    }
    onRegenerate();
  }

  function refine(note: string) {
    if (existing) {
      updateSuggestion(existing.id, { status: "refined", refinementPrompt: note });
    } else {
      addSuggestion({
        scope,
        eventId: eventId ?? null,
        suggestion: { initialRefinement: note },
      });
    }
    onRegenerate();
  }

  return (
    <AICard
      eyebrow={eyebrow}
      title={title}
      status={status}
      onKeep={keep}
      onRegenerate={regenerate}
      onRefine={refine}
    >
      {children}
    </AICard>
  );
}

// ── Suggestion body renderers ──────────────────────────────────────────────

function AttireBody({ a }: { a: AttireSuggestion }) {
  return (
    <dl className="space-y-1.5">
      <BodyRow label="Bride" value={a.bride} />
      <BodyRow label="Groom" value={a.groom} />
      <BodyRow label="Dress code" value={a.partyDressCode} />
      <p className="mt-2 text-[12px] italic text-ink-muted">{a.rationale}</p>
    </dl>
  );
}

function BodyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt
        className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="flex-1 text-[13.5px] text-ink">{value}</dd>
    </div>
  );
}

function BudgetBody({ budget }: { budget: BudgetSuggestion }) {
  const entries = Object.entries(budget.allocation).sort(
    (a, b) => b[1] - a[1],
  );
  return (
    <div>
      <ul className="divide-y divide-border">
        {entries.map(([key, pct]) => {
          const name =
            PRIORITY_OPTIONS.find((p) => p.id === key)?.name ??
            (key === "misc" ? "Misc / contingency" : key);
          return (
            <li key={key} className="flex items-center gap-3 py-2">
              <span className="w-36 shrink-0 text-[13px] text-ink">{name}</span>
              <div className="h-1.5 flex-1 bg-black/5">
                <div
                  className="h-full bg-gold/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className="w-10 text-right font-mono text-[12px] tabular-nums text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[12px] italic text-ink-muted">{budget.summary}</p>
    </div>
  );
}

function WeddingPartyBody({ party }: { party: WeddingPartySuggestion }) {
  const rows: [string, number][] = [
    ["Bridesmaids", party.bridesmaids],
    ["Groomsmen", party.groomsmen],
    ["Parents", party.parents],
    ["Grandparents", party.grandparents],
    ["Flower girls", party.flowerGirls],
    ["Ring bearers", party.ringBearers],
  ];
  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 md:grid-cols-3">
        {rows.map(([label, count]) => (
          <li key={label} className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] text-ink">{label}</span>
            <span
              className="font-mono text-[13px] tabular-nums text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {count}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] italic text-ink-muted">{party.summary}</p>
    </div>
  );
}

// ── Summary & flag primitives ──────────────────────────────────────────────

function SummaryTile({
  label,
  body,
  onEdit,
  italic,
}: {
  label: string;
  body: string;
  onEdit: () => void;
  italic?: boolean;
}) {
  return (
    <div className="group relative border border-border bg-white px-4 py-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[13px] leading-snug text-ink",
          italic && "font-serif italic text-[14px]",
        )}
      >
        {body}
      </p>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="absolute right-2.5 top-2.5 p-1 text-ink-faint opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <Pencil size={12} strokeWidth={1.8} />
      </button>
    </div>
  );
}

function FlagRow({ flag }: { flag: EventsFlag }) {
  const toneClass =
    flag.tone === "conflict"
      ? "border-rose/40 bg-rose-pale/50 text-rose"
      : flag.tone === "warning"
        ? "border-gold/40 bg-gold-pale/40 text-ink"
        : "border-sage/40 bg-sage-pale/50 text-ink";
  return (
    <li
      className={cn(
        "flex items-start gap-2 border px-4 py-2.5 text-[13px] leading-relaxed",
        toneClass,
      )}
    >
      <span
        className="mt-1 inline-block h-1.5 w-1.5 shrink-0 bg-current"
        aria-hidden
      />
      <span>{flag.message}</span>
    </li>
  );
}

function HeaderButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}

function labelFor(e: EventRecord): string {
  if (e.type === "custom" && e.customName) return e.customName;
  return EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type;
}

