"use client";

// ── Events quiz flow (v4) ──────────────────────────────────────────────────
// Five-question onboarding that anchors every AI-generated surface in the
// Events module. v4 consolidates v3's Q4 (vibe) + Q5 (hero palette) into
// a single per-event canvas so each event gets one long-scroll page:
// name/theme chips, inspiration grid, palette (curated + Coolors-style
// workbench). Priorities moves from Q6 → Q5.
//
// Step order:
//   0 · Program (which events)
//   1 · Traditions & story
//   2 · Scale & guest count (total + per-event)
//   3 · Vibe & palette (per-event canvas with sticky rail)
//   4 · Priorities (drag-to-rank)

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import {
  EVENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  TRADITION_OPTIONS,
} from "@/lib/events-seed";
import type {
  EventRecord,
  EventType,
  Priority,
  Tradition,
} from "@/types/events";
import { eventProgressState, isEventReady, PerEventCanvas } from "./PerEventCanvas";

const TOTAL_STEPS = 5;
const STEP_LABELS = [
  "Program",
  "Traditions & story",
  "Scale",
  "Vibe & palette",
  "Priorities",
];

export function EventsQuizFlow() {
  const stepIndex = useEventsStore((s) => s.quiz.stepIndex);
  const setStepIndex = useEventsStore((s) => s.setQuizStepIndex);
  const completeQuiz = useEventsStore((s) => s.completeQuiz);
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);

  const canAdvance = useMemo(
    () => stepCanAdvance(stepIndex, events, coupleContext),
    [stepIndex, events, coupleContext],
  );

  function handleBack() {
    if (stepIndex === 0) return;
    setStepIndex(stepIndex - 1);
  }
  function handleNext() {
    if (!canAdvance) return;
    if (stepIndex === TOTAL_STEPS - 1) {
      completeQuiz();
      return;
    }
    setStepIndex(stepIndex + 1);
  }

  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-full flex-col">
      {/* Progress + header */}
      <div className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="h-[3px] bg-black/5">
          <motion.div
            className="h-full bg-ink"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The brief · {STEP_LABELS[stepIndex]}
            </p>
            <h1 className="mt-1 font-serif text-[22px] font-bold leading-tight text-ink">
              The five questions
            </h1>
          </div>
          <div
            className="font-mono text-[11px] tabular-nums text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {stepIndex + 1} / {TOTAL_STEPS}
          </div>
        </div>
      </div>

      {/* Step body */}
      <div className="flex-1 px-8 py-10">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "mx-auto",
            stepIndex === 3 ? "max-w-[1100px]" : "max-w-[880px]",
          )}
        >
          {stepIndex === 0 && <StepProgram />}
          {stepIndex === 1 && <StepTraditionsAndStory />}
          {stepIndex === 2 && <StepScale />}
          {stepIndex === 3 && <StepVibeAndPalette />}
          {stepIndex === 4 && <StepPriorities />}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border bg-white">
        <div className="flex items-center justify-between px-8 py-4">
          <FooterButton onClick={handleBack} disabled={stepIndex === 0} tone="ghost">
            <ArrowLeft size={13} strokeWidth={1.8} />
            Back
          </FooterButton>
          <FooterButton onClick={handleNext} disabled={!canAdvance} tone="primary">
            {stepIndex === TOTAL_STEPS - 1 ? (
              <>
                <Check size={13} strokeWidth={2} />
                Generate my wedding brief
              </>
            ) : (
              <>
                Next
                <ArrowRight size={13} strokeWidth={2} />
              </>
            )}
          </FooterButton>
        </div>
      </div>
    </div>
  );
}

// ── Step 0: Program ────────────────────────────────────────────────────────

function StepProgram() {
  const events = useEventsStore((s) => s.events);
  const traditions = useEventsStore((s) => s.coupleContext.traditions);
  const setProgram = useEventsStore((s) => s.setProgram);

  const selected = new Set(events.map((e) => e.type));

  function toggle(id: EventType) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const ordered = EVENT_TYPE_OPTIONS.filter((o) => next.has(o.id)).map(
      (o) => o.id,
    );
    setProgram(ordered);
  }

  const nudges = EVENT_TYPE_OPTIONS.filter(
    (o) =>
      !selected.has(o.id) &&
      o.traditions?.some((t) => traditions.includes(t)),
  );

  return (
    <StepHeader
      eyebrow="Question 1 of 5"
      title="Which events are you planning?"
      helper="Tap every event you're including. You can come back and edit anytime — the rest of the app reads from this list."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {EVENT_TYPE_OPTIONS.map((opt) => {
          const on = selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              aria-pressed={on}
              className={cn(
                "group relative flex flex-col gap-1 border px-4 py-3.5 text-left transition-all",
                on
                  ? "border-ink bg-white text-ink"
                  : "border-border bg-white text-ink hover:border-ink/40",
              )}
            >
              <span className="font-serif text-[16px] leading-tight">{opt.name}</span>
              <span className="text-[11.5px] leading-snug text-ink-muted">
                {opt.blurb}
              </span>
              {on && (
                <span className="absolute right-3 top-3 flex h-3 w-3 items-center justify-center bg-ink text-white">
                  <Check size={8} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {nudges.length > 0 && (
        <AIAssistNote>
          Based on your traditions, couples often also include{" "}
          <strong className="text-ink">
            {nudges.map((n) => n.name).join(", ")}
          </strong>
          . Tap any above to add them.
        </AIAssistNote>
      )}
    </StepHeader>
  );
}

// ── Step 1: Traditions & story ─────────────────────────────────────────────

function StepTraditionsAndStory() {
  const traditions = useEventsStore((s) => s.coupleContext.traditions);
  const partnerBg = useEventsStore((s) => s.coupleContext.partnerBackground);
  const story = useEventsStore((s) => s.coupleContext.storyText);
  const setTraditions = useEventsStore((s) => s.setTraditions);
  const setPartnerBackground = useEventsStore((s) => s.setPartnerBackground);
  const setStoryText = useEventsStore((s) => s.setStoryText);

  function toggle(id: Tradition) {
    const set = new Set(traditions);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setTraditions(Array.from(set));
  }

  return (
    <StepHeader
      eyebrow="Question 2 of 5"
      title="Traditions and story"
      helper="Two short inputs. The story powers every AI suggestion downstream — event names, themes, even attire rationale."
    >
      <div className="space-y-8">
        <section>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Cultural traditions
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TRADITION_OPTIONS.map((opt) => {
              const on = traditions.includes(opt.id);
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.id)}
                    aria-pressed={on}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-3.5 py-1.5 text-[13px] transition-colors",
                      on
                        ? "border-ink bg-white text-ink"
                        : "border-border bg-white text-ink-muted hover:border-ink/40",
                    )}
                  >
                    {on && <Check size={11} strokeWidth={2.2} className="text-ink" />}
                    {opt.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {traditions.includes("inter_faith") && (
            <div className="mt-4">
              <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Partner's background
              </label>
              <input
                type="text"
                value={partnerBg}
                onChange={(e) => setPartnerBackground(e.target.value)}
                placeholder="e.g. Jewish, Protestant, Jain…"
                className="mt-1 w-full max-w-sm border border-border bg-white px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink/60"
              />
            </div>
          )}
        </section>

        <section>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Tell us your story
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            How did you meet? What's the feeling you want guests to leave with?
            Two or three sentences is plenty.
          </p>
          <textarea
            value={story}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="We met at a bookshop in Bangalore — both reaching for the same copy of Marquez…"
            rows={5}
            className="mt-3 w-full resize-none border border-border bg-white px-4 py-3 font-serif text-[15px] leading-relaxed text-ink outline-none transition-colors focus:border-ink/60"
          />
          <AIAssistNote>
            We'll parse this into event names, themes, and narrative threads — you'll
            review each one on the next screen.
          </AIAssistNote>
        </section>
      </div>
    </StepHeader>
  );
}

// ── Step 2: Scale & guest count ────────────────────────────────────────────

function StepScale() {
  const total = useEventsStore((s) => s.coupleContext.totalGuestCount);
  const setTotal = useEventsStore((s) => s.setTotalGuestCount);
  const events = useEventsStore((s) => s.events);
  const setEventGuestCount = useEventsStore((s) => s.setEventGuestCount);

  const [draft, setDraft] = useState<string>(String(total));

  function commitDraft() {
    const parsed = Number(draft.replace(/[^\d]/g, ""));
    const next = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : total;
    setTotal(next);
    setDraft(String(next));
  }

  return (
    <StepHeader
      eyebrow="Question 3 of 5"
      title="How many guests, roughly?"
      helper="A rough total is fine. We'll split it across events next."
    >
      <div className="flex flex-col items-center py-8">
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label="Total guest count"
          className="w-full max-w-md bg-transparent text-center font-serif text-[72px] leading-none text-ink outline-none transition-colors focus:text-ink"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        />
        <p className="mt-4 text-center text-[12.5px] leading-relaxed text-ink-muted">
          Most Indian weddings range from 150 to 600 guests.
        </p>
      </div>

      {events.length > 0 && (
        <section className="mt-4 border-t border-border pt-8">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Per-event split
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            We've seeded these from typical patterns. Drag any slider to
            adjust — they don't need to sum to your total.
          </p>
          <ul className="mt-4 space-y-3">
            {events.map((e) => {
              const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-4 border border-border bg-white px-4 py-3"
                >
                  <div className="w-36 shrink-0">
                    <p className="font-serif text-[14px] text-ink">
                      {opt?.name ?? e.type}
                    </p>
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {opt?.blurb ?? ""}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={Math.max(total, e.guestCount)}
                    step={5}
                    value={e.guestCount}
                    onChange={(ev) =>
                      setEventGuestCount(e.id, Number(ev.target.value))
                    }
                    className="h-2 flex-1 appearance-none bg-black/10 accent-ink focus:outline-none"
                  />
                  <span className="w-12 text-right font-mono text-[13px] tabular-nums text-ink">
                    {e.guestCount}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </StepHeader>
  );
}

// ── Step 3: Vibe & palette (consolidated per-event canvas) ─────────────────

function StepVibeAndPalette() {
  const events = useEventsStore((s) => s.events);
  const [activeEventId, setActiveEventId] = useState<string | null>(
    events[0]?.id ?? null,
  );

  useEffect(() => {
    if (activeEventId && !events.some((e) => e.id === activeEventId)) {
      setActiveEventId(events[0]?.id ?? null);
    }
  }, [events, activeEventId]);

  if (events.length === 0) {
    return (
      <StepHeader
        eyebrow="Question 4 of 5"
        title="Vibe & palette per event"
        helper="Add events on the Program step first — each one gets its own canvas here."
      >
        <p className="border border-dashed border-border bg-white px-5 py-6 text-center text-[13px] text-ink-muted">
          Add events on the Program step to start shaping each one.
        </p>
      </StepHeader>
    );
  }

  const activeEvent =
    events.find((e) => e.id === activeEventId) ?? events[0];

  return (
    <StepHeader
      eyebrow="Question 4 of 5"
      title="Vibe & palette per event"
      helper="Pick an AI direction (or write your own), favorite inspiration images, and build the palette. Each event gets its own identity."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <EventRail
          events={events}
          activeId={activeEvent.id}
          onSelect={setActiveEventId}
        />
        <PerEventCanvas key={activeEvent.id} event={activeEvent} />
      </div>
    </StepHeader>
  );
}

function EventRail({
  events,
  activeId,
  onSelect,
}: {
  events: EventRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Events" className="md:sticky md:top-24 md:self-start">
      <p
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your events
      </p>
      <ul className="flex flex-col md:block">
        {events.map((e) => {
          const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
          const state = eventProgressState(e);
          const active = e.id === activeId;
          const displayName =
            e.customEventName?.trim() || e.vibeEventName || opt?.name || e.type;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-l-2 bg-white px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-ink"
                    : "border-transparent hover:border-ink/40",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate font-serif text-[14.5px] leading-tight",
                      active ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {displayName}
                  </span>
                  <span
                    className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {opt?.name ?? e.type} · {e.favoritedImageIds?.length ?? 0}{" "}
                    mood
                    {" · "}
                    {e.favoritedAttireIds?.length ?? 0} attire
                  </span>
                </span>
                <ProgressDot state={state} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ProgressDot({ state }: { state: "empty" | "partial" | "filled" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0",
        state === "empty" && "border border-border",
        state === "partial" && "border border-ink",
        state === "filled" && "bg-ink",
      )}
    />
  );
}

// ── Step 4: Priorities ─────────────────────────────────────────────────────

function StepPriorities() {
  const ranking = useEventsStore((s) => s.coupleContext.priorityRanking);
  const setPriorityRanking = useEventsStore((s) => s.setPriorityRanking);
  const nonNegotiable = useEventsStore((s) => s.coupleContext.nonNegotiable);
  const dontCare = useEventsStore((s) => s.coupleContext.dontCare);
  const setNonNegotiable = useEventsStore((s) => s.setNonNegotiable);
  const setDontCare = useEventsStore((s) => s.setDontCare);

  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= ranking.length) return;
    const next = [...ranking];
    [next[i], next[j]] = [next[j], next[i]];
    setPriorityRanking(next);
  }

  return (
    <StepHeader
      eyebrow="Question 5 of 5"
      title="What matters most?"
      helper="Use the arrows to reorder. This shapes our budget suggestions and vendor recommendations."
    >
      <ol className="space-y-2">
        {ranking.map((id, i) => {
          const opt = PRIORITY_OPTIONS.find((o) => o.id === id);
          const accent = i < 3;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-3 border bg-white px-4 py-3",
                accent ? "border-ink" : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[11px] tabular-nums",
                  accent ? "bg-ink text-white" : "bg-black/5 text-ink-muted",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[15px] leading-tight text-ink">
                  {opt?.name}
                </p>
                <p className="text-[11.5px] text-ink-muted">{opt?.blurb}</p>
              </div>
              <div className="flex items-center gap-1">
                <RankArrow
                  label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={13} strokeWidth={1.8} />
                </RankArrow>
                <RankArrow
                  label="Move down"
                  disabled={i === ranking.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={13} strokeWidth={1.8} />
                </RankArrow>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-10 space-y-5 border-t border-border pt-8">
        <div>
          <label
            htmlFor="non-negotiable"
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            One thing you refuse to compromise on
          </label>
          <input
            id="non-negotiable"
            type="text"
            value={nonNegotiable}
            onChange={(e) => setNonNegotiable(e.target.value)}
            placeholder="e.g. a documentary-style photographer, a live baraat band, Gujarati thali…"
            className="mt-2 w-full border border-border bg-white px-4 py-3 font-serif text-[15px] text-ink outline-none transition-colors focus:border-ink/60"
          />
        </div>
        <div>
          <label
            htmlFor="dont-care"
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            One thing you don't care about
          </label>
          <input
            id="dont-care"
            type="text"
            value={dontCare}
            onChange={(e) => setDontCare(e.target.value)}
            placeholder="e.g. printed menus, a sweetheart table, signature cocktails…"
            className="mt-2 w-full border border-border bg-white px-4 py-3 font-serif text-[15px] text-ink outline-none transition-colors focus:border-ink/60"
          />
        </div>
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Both are optional — skip either if nothing comes to mind.
        </p>
      </section>
    </StepHeader>
  );
}

function RankArrow({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "border border-border bg-white p-1.5 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────

function StepHeader({
  eyebrow,
  title,
  helper,
  children,
}: {
  eyebrow: string;
  title: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-[28px] font-bold leading-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
        {helper}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function AIAssistNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 border-l-2 border-gold bg-gold-pale/30 px-4 py-3 text-[12.5px] leading-relaxed text-ink">
      <Sparkles
        size={13}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0 text-gold"
      />
      <p>{children}</p>
    </div>
  );
}

function FooterButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "bg-ink text-white hover:opacity-90",
        tone === "ghost" && "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ── Advance gating ─────────────────────────────────────────────────────────

function stepCanAdvance(
  stepIndex: number,
  events: EventRecord[],
  ctx: {
    traditions: Tradition[];
    storyText: string;
    totalGuestCount: number;
    priorityRanking: Priority[];
  },
): boolean {
  switch (stepIndex) {
    case 0:
      return events.length > 0;
    case 1:
      return ctx.traditions.length > 0 && ctx.storyText.trim().length >= 10;
    case 2:
      return ctx.totalGuestCount >= 20;
    case 3:
      // Every event needs name/theme AND a palette chosen.
      return events.length > 0 && events.every(isEventReady);
    case 4:
      return ctx.priorityRanking.length > 0;
    default:
      return false;
  }
}
