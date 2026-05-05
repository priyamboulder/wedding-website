"use client";

// ── VendorChemistryMatch ──────────────────────────────────────────────────
// Style-quiz card on the dashboard. Three states:
//   1) Locked — shown until Journey steps 1-3 (date, events, palette) are
//      done. A teaser card explains what the quiz unlocks.
//   2) Invite — quiz unlocked but not started/finished. A short pitch with
//      a "Take the quiz" button that opens the modal.
//   3) Results — quiz completed. Shows top matches grouped by category
//      with a chemistry score badge, plus a "retake" link.
//
// The quiz itself is a 5-question visual modal; each step is a 4-tile
// grid where tapping a tile records the answer and advances to the next
// question. Responses persist in the style-quiz store; matches are
// recomputed in real time from the matchVendors helper.

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import {
  useStyleQuizStore,
  type StyleDimension,
} from "@/stores/style-quiz-store";
import {
  STYLE_QUIZ_QUESTIONS,
  type QuizOption,
} from "@/lib/style-quiz-seed";
import {
  matchVendors,
  isQuizComplete,
  quizProgress,
} from "@/lib/style-quiz-match";
import { cn } from "@/lib/utils";

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function useFoundationReady(): boolean {
  const events = useEventsStore((s) => s.events);
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const selectedMoodId = useDashboardJourneyStore((s) => s.selectedMoodId);
  const customPalette = useDashboardJourneyStore((s) => s.customPalette);

  const date =
    parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null;
  const hasEvents = events.length > 0;
  const hasPalette = !!selectedMoodId || (customPalette?.length ?? 0) > 0;
  return Boolean(date && hasEvents && hasPalette);
}

export function VendorChemistryMatch() {
  const ready = useFoundationReady();
  const responses = useStyleQuizStore((s) => s.responses);
  const completedAt = useStyleQuizStore((s) => s.completedAt);
  const reset = useStyleQuizStore((s) => s.reset);

  const [open, setOpen] = useState(false);

  const complete = isQuizComplete(responses) && !!completedAt;

  // Hide entirely until the foundation (date + events + palette) is set —
  // a locked card on the canvas takes up scroll space without offering
  // any value. The section reappears as soon as prereqs are met.
  if (!ready) return null;
  if (!complete) {
    return (
      <>
        <InviteCard onStart={() => setOpen(true)} />
        {open && <QuizModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <ResultsCard
        onRetake={() => {
          reset();
          setOpen(true);
        }}
      />
      {open && <QuizModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Invite state ─────────────────────────────────────────────────────────
function InviteCard({ onStart }: { onStart: () => void }) {
  const responses = useStyleQuizStore((s) => s.responses);
  const { answered, total } = quizProgress(responses);
  const inProgress = answered > 0 && answered < total;

  return (
    <section>
      <div className="mb-3">
        <h2 className="dash-spread-title">
          <em>Vendor chemistry</em> match
        </h2>
        <p className="dash-spread-sub">
          A two-minute style quiz will pair you with vendors who get your
          vibe.
        </p>
      </div>
      <div className="dash-card relative overflow-hidden px-5 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(212,165,165,0.45) 0%, rgba(245,236,234,0.0) 70%)",
          }}
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p
              className="font-serif text-[18px] leading-tight text-[color:var(--dash-text)]"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              Ready to meet your vendors?
            </p>
            <p className="mt-1 text-[13px] text-[color:var(--dash-text-muted)]">
              Five visual questions — photography, décor, music, food, vibe
              — and we'll score every vendor by aesthetic compatibility.
            </p>
            {inProgress && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[color:var(--dash-blush-deep)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--dash-blush-deep)]" />
                {answered} of {total} answered — pick up where you left off
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onStart}
            className="dash-btn shrink-0 self-start sm:self-auto"
          >
            <Sparkles size={14} />
            {inProgress ? "Continue quiz" : "Take the quiz"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Results state ────────────────────────────────────────────────────────
function ResultsCard({ onRetake }: { onRetake: () => void }) {
  const responses = useStyleQuizStore((s) => s.responses);
  const matches = useMemo(() => matchVendors(responses, 3), [responses]);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            Your <em>vendor matches</em>
          </h2>
          <p className="dash-spread-sub">
            Ranked by aesthetic chemistry — refreshed as new vendors join.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)] transition-colors hover:text-[color:var(--dash-blush-deep)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <RotateCcw size={11} />
          Retake quiz
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["Photography", "Décor & Florals", "Music & DJ", "Catering"] as const).map(
          (cat) => (
            <div key={cat} className="dash-card px-5 py-5">
              <p
                className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
                style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
              >
                {cat}
              </p>
              <ul className="flex flex-col gap-3">
                {matches[cat].slice(0, 2).map((m) => (
                  <li
                    key={m.vendor.id}
                    className="group flex items-start gap-3"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10.5px] font-medium text-white shadow-[inset_0_-6px_10px_rgba(196,146,155,0.35)]"
                      style={{
                        background:
                          "linear-gradient(135deg, #D4A5A5 0%, #C4929B 60%, #A87A82 100%)",
                        fontFamily:
                          "Inter, var(--font-sans), sans-serif",
                      }}
                    >
                      {m.score}%
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-serif text-[15px] leading-tight text-[color:var(--dash-text)]"
                        style={{
                          fontFamily:
                            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                        }}
                      >
                        {m.vendor.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-[color:var(--dash-text-muted)]">
                        {m.vendor.specialties.join(" · ")}
                      </p>
                      <p className="mt-1 truncate text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--dash-text-faint)]">
                        {m.vendor.city}
                      </p>
                    </div>
                    <a
                      href={`/vendors/${m.vendor.slug}`}
                      className="mt-1.5 inline-flex shrink-0 items-center gap-0.5 text-[11px] text-[color:var(--dash-blush-deep)] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      View
                      <ArrowUpRight size={11} />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="/vendors"
                className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-[color:var(--dash-blush-deep)] hover:underline"
              >
                See all {cat.toLowerCase()} matches
                <ArrowRight size={11} />
              </a>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

// ── Quiz modal ───────────────────────────────────────────────────────────
function QuizModal({ onClose }: { onClose: () => void }) {
  const responses = useStyleQuizStore((s) => s.responses);
  const setAnswer = useStyleQuizStore((s) => s.setAnswer);
  const markComplete = useStyleQuizStore((s) => s.markComplete);

  // Land on the first unanswered question if the couple is mid-flight.
  const initialIndex = useMemo(() => {
    const idx = STYLE_QUIZ_QUESTIONS.findIndex(
      (q) => !responses[q.id as StyleDimension],
    );
    return idx === -1 ? STYLE_QUIZ_QUESTIONS.length - 1 : idx;
  }, [responses]);

  const [step, setStep] = useState(initialIndex);
  const total = STYLE_QUIZ_QUESTIONS.length;
  const question = STYLE_QUIZ_QUESTIONS[step];

  const handleChoose = (option: QuizOption) => {
    setAnswer(question.id, option.id);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      markComplete();
      onClose();
    }
  };

  const currentAnswer = responses[question.id];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[10px] bg-[color:var(--dash-canvas)] p-6 shadow-[0_30px_80px_-20px_rgba(196,146,155,0.45)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="style-quiz-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quiz"
          className="absolute right-4 top-4 rounded-full p-1 text-[color:var(--dash-text-faint)] transition-colors hover:bg-[color:var(--dash-blush-light)] hover:text-[color:var(--dash-blush-deep)]"
        >
          <X size={16} />
        </button>

        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--dash-text-faint)]">
          <span style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}>
            Vendor chemistry · {step + 1} of {total}
          </span>
        </div>
        <h2
          id="style-quiz-title"
          className="dash-spread-title"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          {question.prompt}
        </h2>
        <p className="dash-spread-sub">{question.helper}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {question.options.map((option) => {
            const selected = currentAnswer === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChoose(option)}
                className={cn(
                  "group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[8px] border text-left transition-all",
                  selected
                    ? "border-[color:var(--dash-blush)] shadow-[0_8px_22px_-8px_rgba(196,146,155,0.45)]"
                    : "border-[color:var(--dash-card-border)] hover:border-[color:var(--dash-blush)]",
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ background: option.gradient }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                {selected && (
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[color:var(--dash-blush-deep)] shadow"
                  >
                    <Check size={12} strokeWidth={2.4} />
                  </span>
                )}
                <span className="relative z-10 px-3 pb-3 text-white">
                  <span
                    className="block font-serif text-[16px] leading-tight"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span
                      className="mt-0.5 block text-[11.5px] italic text-white/85"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {option.subtitle}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={cn(
              "inline-flex items-center gap-1 text-[12px] text-[color:var(--dash-text-muted)] transition-colors hover:text-[color:var(--dash-blush-deep)]",
              step === 0 && "cursor-not-allowed opacity-40 hover:text-[color:var(--dash-text-muted)]",
            )}
          >
            <ChevronLeft size={13} />
            Back
          </button>

          <div className="flex items-center gap-1.5" aria-hidden>
            {STYLE_QUIZ_QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  i < step
                    ? "bg-[color:var(--dash-blush)]"
                    : i === step
                      ? "bg-[color:var(--dash-blush-deep)]"
                      : "bg-[color:var(--dash-blush-soft)]",
                )}
              />
            ))}
          </div>

          <span className="text-[11px] italic text-[color:var(--dash-text-faint)]">
            Tap a tile to choose
          </span>
        </div>
      </div>
    </div>
  );
}
