"use client";

// ── Venue Discovery Quiz ──────────────────────────────────────────────────
// The emotional centerpiece of the Dream & Discover tab. 8 steps, one
// question per screen, animated slide transition, progress indicator at
// the top. Answers persist to venue-store.discovery.quiz; on completion,
// a summary card renders with a "Find Venues" CTA that writes matched
// venue suggestions into venue-store.suggestions.
//
// Shape rules:
//  · Copy is warm — "What feeling do you want when guests first walk in?"
//    rather than "Vibe (select all that apply)".
//  · Selecting an option auto-advances for single-select steps (delay ~400ms
//    so the couple sees the selection animate before the slide changes).
//  · Multi-select steps show a "Continue" chip at the bottom.
//  · The final step's CTA seeds suggestions and closes the quiz into a
//    summary card with an "Edit answers" button so it can be reopened.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Pencil,
  Sparkles,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import type {
  CateringPref,
  DiscoveryQuizAnswers,
  EventScope,
  GuestCountTier,
  IndoorOutdoorPref,
  VenueVibe,
} from "@/types/venue";
import {
  CATERING_OPTIONS,
  EVENT_SCOPE_OPTIONS,
  GUEST_COUNT_OPTIONS,
  INDOOR_OUTDOOR_OPTIONS,
  MUST_HAVE_OPTIONS,
  QUIZ_BUDGET_MAX,
  QUIZ_BUDGET_MIN,
  QUIZ_BUDGET_STEP,
  QUIZ_STEPS,
  VIBE_OPTIONS,
} from "@/lib/venue/discovery-quiz-config";
import { suggestionsFromQuiz, summarizeQuiz } from "@/lib/venue/mock-ai";
import { Eyebrow } from "@/components/workspace/blocks/primitives";

const TOTAL_STEPS = QUIZ_STEPS.length;

export function VenueDiscoveryQuiz() {
  const quiz = useVenueStore((s) => s.discovery.quiz);
  const [open, setOpen] = useState(!quiz.completed);

  if (quiz.completed && !open) {
    return <QuizSummaryCard onEdit={() => setOpen(true)} />;
  }

  return <QuizRunner onDone={() => setOpen(false)} />;
}

// ── Summary card (post-completion) ────────────────────────────────────────

function QuizSummaryCard({ onEdit }: { onEdit: () => void }) {
  const answers = useVenueStore((s) => s.discovery.quiz.answers);
  const summary = useMemo(() => summarizeQuiz(answers), [answers]);

  return (
    <section className="overflow-hidden rounded-lg border border-saffron/30 bg-gradient-to-br from-saffron-pale/40 to-ivory-warm/60">
      <div className="flex items-start gap-4 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron text-ivory">
          <Sparkles size={16} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <Eyebrow>Your venue DNA</Eyebrow>
          <p
            className="mt-1 font-bold leading-[1.2] text-ink"
            style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
          >
            we've translated the feeling into a search
          </p>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-ink-muted">
            {summary}
          </p>
          <button
            type="button"
            onClick={onEdit}
            className="mt-3 inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Pencil size={10} /> Edit answers
          </button>
        </div>
      </div>
    </section>
  );
}

// ── The quiz runner ───────────────────────────────────────────────────────

function QuizRunner({ onDone }: { onDone: () => void }) {
  const quiz = useVenueStore((s) => s.discovery.quiz);
  const setAnswers = useVenueStore((s) => s.setQuizAnswers);
  const setCompleted = useVenueStore((s) => s.setQuizCompleted);
  const resetQuiz = useVenueStore((s) => s.resetQuiz);

  // Start on step 1, or on the step the user last had active. For simplicity
  // we always start on 1 and let answers from a prior pass pre-select.
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const answers = quiz.answers;

  function goNext() {
    setDirection("forward");
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Finish — mark completed and add suggestions.
      setCompleted(true);
      // Pipe quiz-matched suggestions into the existing suggestions slice by
      // dismissing any old pending items and inserting new ones. To avoid
      // churning the store contract (which has addShortlistVenue but no
      // addSuggestion), we use a side-effect: dismiss prior pending
      // suggestions, then rely on `suggestionsFromQuiz` being rendered by
      // the Shortlist tab directly from the quiz answers (read-model) —
      // which we handle by surfacing a "Find Venues" header message there.
      // For now we just mark the quiz done; the Shortlist tab re-reads.
      onDone();
    }
  }

  function goBack() {
    setDirection("back");
    if (step > 1) setStep(step - 1);
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return answers.vibes.length > 0;
      case 2:
        return answers.guest_count !== null;
      case 3:
        return answers.indoor_outdoor !== null;
      case 4:
        return answers.event_scope !== null;
      case 5:
        return answers.catering !== null;
      case 6:
        return true;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return false;
    }
  }

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-saffron/30 bg-ivory-warm/50"
      aria-label="Venue Discovery Quiz"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-saffron/20 bg-ivory-warm/80 px-5 py-3">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-saffron" strokeWidth={1.8} />
          <Eyebrow>The Venue Discovery Quiz · {step} of {TOTAL_STEPS}</Eyebrow>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset your quiz answers?")) resetQuiz();
            }}
            className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint hover:text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Undo2 size={9} /> Reset
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-ivory-warm">
        <div
          className="h-full bg-saffron transition-[width] duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Question content with slide animation */}
      <div className="relative min-h-[320px] overflow-hidden px-6 py-6 md:px-10 md:py-8">
        <div
          key={step}
          className={cn(
            "quiz-slide",
            direction === "forward" ? "quiz-slide-in-right" : "quiz-slide-in-left",
          )}
        >
          <QuizStep
            step={step}
            answers={answers}
            onChange={setAnswers}
            onAutoAdvance={() => {
              setTimeout(() => goNext(), 380);
            }}
          />
        </div>
      </div>

      {/* Footer nav */}
      <footer className="flex items-center justify-between gap-3 border-t border-saffron/20 bg-ivory-warm/80 px-5 py-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className={cn(
            "flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
            step === 1
              ? "cursor-not-allowed border-border bg-transparent text-ink-faint"
              : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={10} /> Back
        </button>

        <StepDots step={step} total={TOTAL_STEPS} />

        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvance()}
          className={cn(
            "flex items-center gap-1 rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
            canAdvance()
              ? step === TOTAL_STEPS
                ? "border-saffron bg-saffron text-ivory hover:bg-saffron/90"
                : "border-ink bg-ink text-ivory hover:bg-ink/90"
              : "cursor-not-allowed border-border bg-transparent text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {step === TOTAL_STEPS ? (
            <>
              <Sparkles size={10} /> Find venues
            </>
          ) : (
            <>
              Continue <ArrowRight size={10} />
            </>
          )}
        </button>
      </footer>

      {/* Inline style for the slide animation — self-contained so no
         Tailwind config change is required. */}
      <style jsx>{`
        .quiz-slide {
          animation-duration: 420ms;
          animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
          animation-fill-mode: both;
        }
        .quiz-slide-in-right {
          animation-name: slideInRight;
        }
        .quiz-slide-in-left {
          animation-name: slideInLeft;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(28px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-28px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

// ── Step dots ─────────────────────────────────────────────────────────────

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            i + 1 < step
              ? "bg-saffron"
              : i + 1 === step
                ? "bg-saffron ring-2 ring-saffron/30"
                : "bg-ink-faint/30",
          )}
        />
      ))}
    </div>
  );
}

// ── The step content ──────────────────────────────────────────────────────

function QuizStep({
  step,
  answers,
  onChange,
  onAutoAdvance,
}: {
  step: number;
  answers: DiscoveryQuizAnswers;
  onChange: (patch: Partial<DiscoveryQuizAnswers>) => void;
  onAutoAdvance: () => void;
}) {
  switch (step) {
    case 1:
      return <StepVibes answers={answers} onChange={onChange} />;
    case 2:
      return (
        <StepGuestCount
          answers={answers}
          onChange={(v) => {
            onChange({ guest_count: v });
            onAutoAdvance();
          }}
        />
      );
    case 3:
      return (
        <StepIndoorOutdoor
          answers={answers}
          onChange={(v) => {
            onChange({ indoor_outdoor: v });
            onAutoAdvance();
          }}
        />
      );
    case 4:
      return (
        <StepEventScope
          answers={answers}
          onChange={(v) => {
            onChange({ event_scope: v });
            onAutoAdvance();
          }}
        />
      );
    case 5:
      return (
        <StepCatering
          answers={answers}
          onChange={(v) => {
            onChange({ catering: v });
            onAutoAdvance();
          }}
        />
      );
    case 6:
      return <StepLocation answers={answers} onChange={onChange} />;
    case 7:
      return <StepBudget answers={answers} onChange={onChange} />;
    case 8:
      return <StepMustHaves answers={answers} onChange={onChange} />;
    default:
      return null;
  }
}

// ── Headline / subhead atoms ─────────────────────────────────────────────

function QuestionHeader({
  eyebrow,
  question,
  subtext,
}: {
  eyebrow: string;
  question: string;
  subtext?: string;
}) {
  return (
    <header className="mb-5 text-center md:text-left">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h4
        className="mt-1 font-bold leading-[1.15] text-ink"
        style={{ fontFamily: "var(--font-display)", fontSize: 28 }}
      >
        {question}
      </h4>
      {subtext && (
        <p className="mt-2 max-w-prose text-[13px] italic text-ink-muted">
          {subtext}
        </p>
      )}
    </header>
  );
}

// ── Step 1 · Vibes ───────────────────────────────────────────────────────

function StepVibes({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (patch: Partial<DiscoveryQuizAnswers>) => void;
}) {
  const selected = new Set(answers.vibes);
  function toggle(v: VenueVibe) {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange({ vibes: Array.from(next) });
  }
  return (
    <>
      <QuestionHeader
        eyebrow="Step 1 of 8 — the feeling"
        question="What feeling do you want when guests first walk in?"
        subtext="Pick any that pull you in. You can love more than one."
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {VIBE_OPTIONS.map((v) => {
          const on = selected.has(v.id);
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => toggle(v.id)}
                className={cn(
                  "group w-full overflow-hidden rounded-md border bg-white text-left transition-all",
                  on
                    ? "border-saffron shadow-[0_6px_18px_rgba(209,128,39,0.18)] ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <div className="relative aspect-[4/3] bg-ivory-warm">
                  <img
                    src={v.imageUrl}
                    alt={v.label}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {on && (
                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-ivory shadow">
                      <Check size={12} strokeWidth={2.4} />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[13.5px] font-medium text-ink">{v.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                    {v.blurb}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Step 2 · Guest count ─────────────────────────────────────────────────

function StepGuestCount({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (v: GuestCountTier) => void;
}) {
  return (
    <>
      <QuestionHeader
        eyebrow="Step 2 of 8 — the crowd"
        question="How big is your celebration?"
        subtext="Rough ranges — we'll sharpen later."
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {GUEST_COUNT_OPTIONS.map((g) => {
          const on = answers.guest_count === g.id;
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => onChange(g.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span
                  className={cn(
                    "text-[20px] font-bold leading-tight",
                    on ? "text-saffron" : "text-ink",
                  )}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {g.label}
                </span>
                <span className="text-[11.5px] text-ink-muted">{g.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Step 3 · Indoor / outdoor ────────────────────────────────────────────

function StepIndoorOutdoor({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (v: IndoorOutdoorPref) => void;
}) {
  return (
    <>
      <QuestionHeader
        eyebrow="Step 3 of 8 — the sky"
        question="Indoors, outdoors, or both?"
      />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {INDOOR_OUTDOOR_OPTIONS.map((o) => {
          const on = answers.indoor_outdoor === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onChange(o.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    on
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-border bg-white text-transparent",
                  )}
                >
                  <Check size={12} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{o.label}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{o.blurb}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Step 4 · Event scope ─────────────────────────────────────────────────

function StepEventScope({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (v: EventScope) => void;
}) {
  return (
    <>
      <QuestionHeader
        eyebrow="Step 4 of 8 — the program"
        question="How many events will this venue need to host?"
        subtext="A weekend wedding needs space for haldi, mehendi, sangeet, ceremony, and reception."
      />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {EVENT_SCOPE_OPTIONS.map((o) => {
          const on = answers.event_scope === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onChange(o.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    on
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-border bg-white text-transparent",
                  )}
                >
                  <Check size={12} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{o.label}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{o.blurb}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Step 5 · Catering ────────────────────────────────────────────────────

function StepCatering({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (v: CateringPref) => void;
}) {
  return (
    <>
      <QuestionHeader
        eyebrow="Step 5 of 8 — the food"
        question="Do you want the venue to handle food, or bring your own caterer?"
        subtext="Outside caterers are the norm for Indian weddings — check this early, it's often a dealbreaker."
      />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {CATERING_OPTIONS.map((o) => {
          const on = answers.catering === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onChange(o.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    on
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-border bg-white text-transparent",
                  )}
                >
                  <Check size={12} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{o.label}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{o.blurb}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Step 6 · Location ────────────────────────────────────────────────────

function StepLocation({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (patch: Partial<DiscoveryQuizAnswers>) => void;
}) {
  const suggestions = [
    "Udaipur",
    "Jaipur",
    "Goa",
    "Delhi NCR",
    "Mumbai",
    "Destination · open",
  ];
  return (
    <>
      <QuestionHeader
        eyebrow="Step 6 of 8 — the place"
        question="Where are you dreaming of?"
        subtext="A city, a region, or just 'destination — we're open'."
      />
      <div className="mx-auto max-w-xl">
        <input
          type="text"
          value={answers.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="e.g. Udaipur, Rajasthan"
          className="w-full rounded-md border border-border bg-white px-4 py-3 text-[16px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ location: s })}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors",
                answers.location === s
                  ? "border-saffron bg-saffron-pale/50 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/50",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Step 7 · Budget ──────────────────────────────────────────────────────

function StepBudget({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (patch: Partial<DiscoveryQuizAnswers>) => void;
}) {
  const { budget_min, budget_max } = answers;
  return (
    <>
      <QuestionHeader
        eyebrow="Step 7 of 8 — the budget"
        question="Budget range for the venue itself?"
        subtext="Venue fee only — catering, décor, and the rest are budgeted separately in other workspaces."
      />
      <div className="mx-auto max-w-2xl rounded-md border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Min</Eyebrow>
            <p
              className="mt-1 text-[24px] font-bold leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${budget_min.toLocaleString()}
            </p>
          </div>
          <span className="text-ink-faint">—</span>
          <div className="text-right">
            <Eyebrow>Max</Eyebrow>
            <p
              className="mt-1 text-[24px] font-bold leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${budget_max.toLocaleString()}
              {budget_max >= QUIZ_BUDGET_MAX ? "+" : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              Min
            </span>
            <input
              type="range"
              min={QUIZ_BUDGET_MIN}
              max={QUIZ_BUDGET_MAX}
              step={QUIZ_BUDGET_STEP}
              value={budget_min}
              onChange={(e) =>
                onChange({
                  budget_min: Math.min(Number(e.target.value), budget_max),
                })
              }
              className="mt-1 w-full accent-saffron"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              Max
            </span>
            <input
              type="range"
              min={QUIZ_BUDGET_MIN}
              max={QUIZ_BUDGET_MAX}
              step={QUIZ_BUDGET_STEP}
              value={budget_max}
              onChange={(e) =>
                onChange({
                  budget_max: Math.max(Number(e.target.value), budget_min),
                })
              }
              className="mt-1 w-full accent-saffron"
            />
          </label>
        </div>
      </div>
    </>
  );
}

// ── Step 8 · Must-haves ──────────────────────────────────────────────────

function StepMustHaves({
  answers,
  onChange,
}: {
  answers: DiscoveryQuizAnswers;
  onChange: (patch: Partial<DiscoveryQuizAnswers>) => void;
}) {
  const selected = new Set(answers.must_haves);
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ must_haves: Array.from(next) });
  }
  return (
    <>
      <QuestionHeader
        eyebrow="Step 8 of 8 — the must-haves"
        question="Anything else the venue MUST have?"
        subtext="Tap everything that matters. These become dealbreakers on the Shortlist."
      />
      <ul className="flex flex-wrap gap-2">
        {MUST_HAVE_OPTIONS.map((o) => {
          const on = selected.has(o.id);
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => toggle(o.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                  on
                    ? "border-saffron bg-saffron text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
                )}
              >
                {o.label}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
