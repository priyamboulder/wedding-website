"use client";

// ── Event tab quiz card ───────────────────────────────────────────────────
// A pocket version of the Photography QuizEntryCard pattern, scoped to the
// Vibe / Attire tabs on a single event. Runs a short (3–5 question) quiz,
// persists answers onto the event record, and collapses into a "Retake"
// affordance once the couple has picked something for every question.
//
// The pattern the spec calls out: "Start quiz →" / "Skip, I'll fill it in
// myself". Answers auto-draft downstream fields — e.g. the attire quiz's
// formality answer seeds EventRecord.formality.

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/events/event-quizzes";

interface Props {
  eyebrow: string;
  title: string;
  blurb: string;
  questions: QuizQuestion[];
  // Current answers keyed by question.id.
  answers: Record<string, unknown>;
  onAnswer: (key: string, value: unknown) => void;
  // Called when the user clicks "Finish" on the last question. No-op by
  // default — parents can use this to auto-draft a brief from answers.
  onFinish?: () => void;
}

export function EventQuizCard({
  eyebrow,
  title,
  blurb,
  questions,
  answers,
  onAnswer,
  onFinish,
}: Props) {
  // Defensive default — events created before the v8 migration ran may
  // still be hydrating with vibeQuizAnswers / attireQuizAnswers as undefined.
  const safeAnswers = answers ?? {};

  // Three modes:
  //   · "idle"    — preamble card with "Start quiz" / "Skip" buttons
  //   · "running" — one question at a time, back / next navigation
  //   · "done"    — collapsed summary with "Retake" link
  const everyAnswered = useMemo(
    () =>
      questions.every((q) => {
        const v = safeAnswers[q.id];
        return (
          v !== undefined &&
          v !== null &&
          (typeof v === "string" ? v.trim() !== "" : true)
        );
      }),
    [questions, safeAnswers],
  );
  const someAnswered = useMemo(
    () => questions.some((q) => safeAnswers[q.id] !== undefined),
    [questions, safeAnswers],
  );

  const [mode, setMode] = useState<"idle" | "running" | "done">(
    everyAnswered ? "done" : someAnswered ? "running" : "idle",
  );
  const [step, setStep] = useState(0);

  const question = questions[step];
  const atLast = step === questions.length - 1;
  const atFirst = step === 0;

  function finish() {
    setMode("done");
    onFinish?.();
  }

  if (mode === "idle") {
    return (
      <section className="relative overflow-hidden rounded-lg border border-ink/10 bg-white p-5 shadow-[0_1px_2px_rgba(26,26,26,0.03)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eyebrow}
            </p>
            <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
              {title}
            </h3>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-muted">
              {blurb}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("done")}
              className="rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
            >
              Skip, I'll fill it in myself
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setMode("running");
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
            >
              Start quiz <ArrowRight size={12} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (mode === "done") {
    const picked = questions.filter((q) => {
      const v = safeAnswers[q.id];
      return v !== undefined && v !== null && (typeof v === "string" ? v.trim() !== "" : true);
    }).length;
    return (
      <section className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-ivory-warm/40 px-5 py-3">
        <div className="min-w-0 flex items-center gap-2.5">
          <Sparkles size={13} strokeWidth={1.8} className="text-saffron" />
          <p className="truncate text-[12.5px] text-ink-muted">
            <span className="font-medium text-ink">{title}</span>
            {" · "}
            {picked > 0 ? `${picked} of ${questions.length} answered` : "Skipped — fill in manually below"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setMode("running");
          }}
          className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
        >
          {picked === 0 ? "Take quiz" : "Retake"}
        </button>
      </section>
    );
  }

  // running
  const pct = Math.round(((step + 1) / questions.length) * 100);

  return (
    <section className="relative overflow-hidden rounded-lg border border-ink/10 bg-white p-6 shadow-[0_1px_2px_rgba(26,26,26,0.03)]">
      <div className="mb-4 flex items-center justify-between">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow} · {step + 1} / {questions.length}
        </p>
        <button
          type="button"
          onClick={() => setMode("done")}
          aria-label="Close quiz"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] text-ink-faint hover:text-ink"
        >
          Skip for now <X size={11} strokeWidth={1.8} />
        </button>
      </div>

      <div className="mb-5 h-[2px] w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-saffron transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {question && (
        <>
          <h3 className="font-serif text-[22px] leading-tight text-ink">
            {question.prompt}
          </h3>

          <div className="mt-4">
            {question.kind === "choice" && question.choices && (
              <div className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((c) => {
                  const active = safeAnswers[question.id] === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onAnswer(question.id, c.value)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-saffron bg-saffron-pale/30 shadow-[0_0_0_2px_rgba(212,162,76,0.15)]"
                          : "border-border bg-white hover:border-gold/60",
                      )}
                    >
                      <p className="text-[13.5px] font-medium text-ink">
                        {c.label}
                      </p>
                      {c.hint && (
                        <p className="mt-0.5 text-[11.5px] text-ink-muted">
                          {c.hint}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {question.kind === "freetext" && (
              <textarea
                value={(safeAnswers[question.id] as string | undefined) ?? ""}
                onChange={(e) => onAnswer(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
              />
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((n) => Math.max(0, n - 1))}
              disabled={atFirst}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink disabled:opacity-40"
            >
              <ChevronLeft size={13} strokeWidth={1.8} /> Back
            </button>
            {atLast ? (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft"
              >
                Finish <Sparkles size={12} strokeWidth={1.8} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((n) => Math.min(questions.length - 1, n + 1))}
                className="inline-flex items-center gap-1 rounded-md bg-ink px-3.5 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft"
              >
                Next <ChevronRight size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
