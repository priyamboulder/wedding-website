"use client";

// ── Quiz runner (modal) ───────────────────────────────────────────────────
// Walks the user through a schema's questions one at a time. Handles the
// five supported input types, extraction for long_text answers, and a
// Review step before any writes happen.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useQuizStore } from "@/stores/quiz-store";
import type {
  QuizAnswer,
  QuizAnswerMap,
  QuizCompletion,
  QuizInput,
  QuizPreviewItem,
  QuizSchema,
  QuizTakenBy,
  ChipOption,
  ImageOption,
} from "@/types/quiz";
import { useWorkspaceRoles } from "@/lib/couple-identity";
import { track } from "@/lib/telemetry";
import { QuizReview } from "./QuizReview";

type CloseOutcome = "completed" | "dismissed";

interface Props {
  schema: QuizSchema;
  categoryId: string;
  priorCompletion?: QuizCompletion;
  onClose: (outcome: CloseOutcome) => void;
}

export function QuizRunner({
  schema,
  categoryId,
  priorCompletion,
  onClose,
}: Props) {
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const recordCompletion = useQuizStore((s) => s.recordCompletion);
  const clearCompletion = useQuizStore((s) => s.clearCompletion);
  const workspaceRoles = useWorkspaceRoles();

  const [phase, setPhase] = useState<"running" | "extracting" | "reviewing">(
    "running",
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerMap>(
    () => priorCompletion?.quiz_answers ?? {},
  );
  const [reviewItems, setReviewItems] = useState<QuizPreviewItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  const question = schema.questions[index];
  const totalQuestions = schema.questions.length;
  const progress = ((index + 1) / totalQuestions) * 100;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss("save_and_exit");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAnswer = useCallback((id: string, answer: QuizAnswer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  }, []);

  const handleDismiss = useCallback(
    (reason: "save_and_exit" | "scrim" | "close_icon") => {
      track("quiz_abandoned", {
        quiz_id: schema.id,
        role: currentRole,
        last_question: question?.id ?? null,
        last_question_index: index,
        reason,
      });
      onClose("dismissed");
    },
    [schema.id, currentRole, question, index, onClose],
  );

  async function handleNext() {
    if (!question) return;
    // If the current question has long-text extraction, run it before
    // moving on so the Review step has the parsed result.
    const ans = answers[question.id];
    if (
      question.input.type === "long_text" &&
      question.input.extraction &&
      ans?.kind === "text" &&
      ans.value.trim() &&
      ans.extracted === undefined
    ) {
      setExtracting(true);
      const extracted = await runExtraction(
        question.prompt,
        ans.value.trim(),
        question.input.extraction.targetShape,
        question.input.extraction.example,
      );
      setExtracting(false);
      setAnswer(question.id, { ...ans, extracted });
    }

    if (index === totalQuestions - 1) {
      await finishToReview();
    } else {
      setIndex((i) => i + 1);
    }
  }

  async function finishToReview() {
    setPhase("extracting");
    // Run extraction on any long_text answers that were skipped over
    // without triggering the per-question extraction (defensive).
    const withExtraction: QuizAnswerMap = { ...answers };
    for (const q of schema.questions) {
      if (q.input.type !== "long_text" || !q.input.extraction) continue;
      const a = withExtraction[q.id];
      if (!a || a.kind !== "text" || !a.value.trim()) continue;
      if (a.extracted !== undefined) continue;
      const extracted = await runExtraction(
        q.prompt,
        a.value.trim(),
        q.input.extraction.targetShape,
        q.input.extraction.example,
      );
      withExtraction[q.id] = { ...a, extracted };
    }

    const preview = schema.preview(withExtraction, {
      categoryId,
      categorySlug: schema.category,
      subsection: schema.subsection,
      role: currentRole,
    });
    setAnswers(withExtraction);
    setReviewItems(preview);
    setPhase("reviewing");
    track("quiz_completed", {
      quiz_id: schema.id,
      role: currentRole,
      answered: Object.values(withExtraction).filter(
        (a) => a.kind !== "skipped",
      ).length,
      total: totalQuestions,
    });
  }

  function handleBack() {
    if (index === 0) return;
    setIndex((i) => i - 1);
  }

  function handleSkipQuestion() {
    if (!question) return;
    setAnswer(question.id, { kind: "skipped" });
    if (index === totalQuestions - 1) {
      void finishToReview();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleApply(edited: QuizPreviewItem[]) {
    const ctx = {
      categoryId,
      categorySlug: schema.category,
      subsection: schema.subsection,
      role: currentRole,
    };
    // If retaking: for each field the user edited manually since last
    // quiz, skip overwriting unless they've just re-edited it on this
    // Review screen. (The Review screen lets them override manually.)
    if (priorCompletion) {
      // Clear the old completion before re-applying — the Review items
      // are the new truth. Fields the user has since edited are in
      // manually_edited_fields; the Review screen shows them marked
      // so the user can confirm.
      clearCompletion(schema.category, schema.subsection);
    }
    schema.apply(answers, edited, ctx);

    const takenBy: QuizTakenBy = {
      role: currentRole,
      name:
        workspaceRoles.find((r) => r.id === currentRole)?.name ?? currentRole,
    };
    recordCompletion({
      category: schema.category,
      subsection: schema.subsection,
      quiz_id: schema.id,
      quiz_version: schema.version,
      answers,
      takenBy,
      plannerDraft: currentRole === "planner",
    });

    track("quiz_applied", {
      quiz_id: schema.id,
      role: currentRole,
      retake: Boolean(priorCompletion),
      field_count: edited.length,
    });
    onClose("completed");
  }

  const currentAnswer = question ? answers[question.id] : undefined;
  const canAdvance = question
    ? canAnswerAdvance(question.input, currentAnswer)
    : false;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => handleDismiss("scrim")}
        className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-label={schema.title}
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_24px_60px_-20px_rgba(26,26,26,0.35)]"
      >
        {/* Progress bar */}
        <div className="relative">
          <div className="h-[3px] bg-ivory-deep">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-light"
              initial={false}
              animate={{
                width:
                  phase === "reviewing" ? "100%" : `${progress}%`,
              }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-6 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {phase === "reviewing"
                ? "Review & confirm"
                : `Question ${Math.min(index + 1, totalQuestions)} of ${totalQuestions}`}
            </p>
            <h2 className="mt-0.5 font-serif text-[16px] font-bold leading-tight text-ink">
              {schema.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleDismiss("close_icon")}
            aria-label="Close"
            className="rounded p-1 text-ink-faint transition-colors hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === "reviewing" ? (
            <QuizReview
              schema={schema}
              items={reviewItems}
              onChange={setReviewItems}
              priorCompletion={priorCompletion}
            />
          ) : phase === "extracting" ? (
            <ExtractingPanel />
          ) : question ? (
            <QuestionPanel
              key={question.id}
              prompt={question.prompt}
              helper={question.helper}
              input={question.input}
              answer={currentAnswer}
              onChange={(a) => setAnswer(question.id, a)}
              extracting={extracting}
            />
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-ivory-warm/40 px-6 py-3">
          <div className="flex items-center gap-2">
            {phase === "running" && (
              <>
                <FooterButton
                  onClick={handleBack}
                  disabled={index === 0}
                  tone="ghost"
                >
                  <ArrowLeft size={12} strokeWidth={1.8} />
                  Back
                </FooterButton>
                {question?.optional && (
                  <FooterButton onClick={handleSkipQuestion} tone="ghost">
                    Skip this question
                  </FooterButton>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FooterButton
              onClick={() => handleDismiss("save_and_exit")}
              tone="ghost"
            >
              Save & exit
            </FooterButton>
            {phase === "running" && (
              <FooterButton
                onClick={handleNext}
                disabled={!canAdvance || extracting}
                tone="primary"
              >
                {extracting ? (
                  <>
                    <Loader2
                      size={12}
                      strokeWidth={1.8}
                      className="animate-spin"
                    />
                    Processing…
                  </>
                ) : index === totalQuestions - 1 ? (
                  <>
                    Review
                    <ArrowRight size={12} strokeWidth={2} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={12} strokeWidth={2} />
                  </>
                )}
              </FooterButton>
            )}
            {phase === "reviewing" && (
              <FooterButton
                onClick={() => handleApply(reviewItems)}
                tone="primary"
              >
                <Check size={12} strokeWidth={2} />
                Apply to section
              </FooterButton>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Extraction helper ─────────────────────────────────────────────────────

async function runExtraction(
  prompt: string,
  answer: string,
  targetShape: string,
  example?: unknown,
): Promise<unknown | null> {
  try {
    const res = await fetch("/api/quiz/extract", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        questionPrompt: prompt,
        answer,
        targetShape,
        example,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { extracted: unknown | null };
    return data.extracted;
  } catch {
    return null;
  }
}

// ── Advance gate ──────────────────────────────────────────────────────────

function canAnswerAdvance(
  input: QuizInput,
  answer: QuizAnswer | undefined,
): boolean {
  if (!answer) {
    // Allow advancing on truly empty state only for optional questions —
    // enforced by the "Skip this question" button, which sets `skipped`.
    return false;
  }
  if (answer.kind === "skipped") return true;
  switch (input.type) {
    case "single_select":
      return answer.kind === "single" && Boolean(answer.value);
    case "multi_select": {
      if (answer.kind !== "multi") return false;
      const n = answer.values.length;
      if (input.min !== undefined && n < input.min) return false;
      return n > 0;
    }
    case "short_text":
      return answer.kind === "text" && Boolean(answer.value.trim());
    case "long_text":
      return answer.kind === "text" && Boolean(answer.value.trim());
    case "number_slider":
      return answer.kind === "number" && Number.isFinite(answer.value);
    case "image_grid": {
      if (answer.kind !== "images") return false;
      const n = answer.values.length;
      if (input.min !== undefined && n < input.min) return false;
      return n > 0;
    }
  }
}

// ── Question renderer ─────────────────────────────────────────────────────

function QuestionPanel({
  prompt,
  helper,
  input,
  answer,
  onChange,
  extracting,
}: {
  prompt: string;
  helper?: string;
  input: QuizInput;
  answer: QuizAnswer | undefined;
  onChange: (answer: QuizAnswer) => void;
  extracting: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-[20px] font-bold leading-tight text-ink">
          {prompt}
        </h3>
        {helper && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            {helper}
          </p>
        )}
      </div>

      <div>
        <InputRenderer
          input={input}
          answer={answer}
          onChange={onChange}
          disabled={extracting}
        />
      </div>
    </div>
  );
}

function InputRenderer({
  input,
  answer,
  onChange,
  disabled,
}: {
  input: QuizInput;
  answer: QuizAnswer | undefined;
  onChange: (a: QuizAnswer) => void;
  disabled?: boolean;
}) {
  switch (input.type) {
    case "single_select":
      return (
        <ChipGroup
          options={input.options}
          selected={
            answer?.kind === "single" ? [answer.value] : []
          }
          onToggle={(v) => onChange({ kind: "single", value: v })}
          singleSelect
          disabled={disabled}
        />
      );
    case "multi_select":
      return (
        <ChipGroup
          options={input.options}
          selected={answer?.kind === "multi" ? answer.values : []}
          onToggle={(v) => {
            const cur =
              answer?.kind === "multi" ? answer.values : [];
            const has = cur.includes(v);
            let next = has ? cur.filter((x) => x !== v) : [...cur, v];
            if (!has && input.max !== undefined && next.length > input.max) {
              next = next.slice(-input.max);
            }
            onChange({ kind: "multi", values: next });
          }}
          disabled={disabled}
          hint={
            input.max !== undefined
              ? `Pick up to ${input.max}`
              : input.min !== undefined
                ? `Pick at least ${input.min}`
                : undefined
          }
        />
      );
    case "short_text":
      return (
        <input
          type="text"
          value={answer?.kind === "text" ? answer.value : ""}
          onChange={(e) =>
            onChange({ kind: "text", value: e.target.value })
          }
          placeholder={input.placeholder}
          disabled={disabled}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-gold/50"
          autoFocus
        />
      );
    case "long_text":
      return (
        <>
          <textarea
            value={answer?.kind === "text" ? answer.value : ""}
            onChange={(e) =>
              onChange({ kind: "text", value: e.target.value })
            }
            placeholder={input.placeholder}
            disabled={disabled}
            rows={4}
            className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-relaxed text-ink outline-none transition-colors focus:border-gold/50"
            autoFocus
          />
          {input.extraction && (
            <p
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              We'll translate this into structured fields on Next.
            </p>
          )}
        </>
      );
    case "number_slider":
      return (
        <SliderInput
          min={input.min}
          max={input.max}
          step={input.step}
          value={
            answer?.kind === "number"
              ? answer.value
              : (input.defaultValue ??
                Math.round((input.min + input.max) / 2))
          }
          minLabel={input.minLabel}
          maxLabel={input.maxLabel}
          onChange={(v) => onChange({ kind: "number", value: v })}
          disabled={disabled}
        />
      );
    case "image_grid":
      return (
        <ImageGrid
          options={input.options}
          selected={
            answer?.kind === "images" ? answer.values : []
          }
          onToggle={(v) => {
            const cur =
              answer?.kind === "images" ? answer.values : [];
            const has = cur.includes(v);
            let next = has ? cur.filter((x) => x !== v) : [...cur, v];
            if (!has && input.max !== undefined && next.length > input.max) {
              next = next.slice(-input.max);
            }
            onChange({ kind: "images", values: next });
          }}
          max={input.max}
          min={input.min}
          disabled={disabled}
        />
      );
  }
}

// ── Input primitives ──────────────────────────────────────────────────────

function ChipGroup({
  options,
  selected,
  onToggle,
  singleSelect,
  disabled,
  hint,
}: {
  options: ChipOption[];
  selected: string[];
  onToggle: (v: string) => void;
  singleSelect?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      {hint && (
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hint}
        </p>
      )}
      <ul
        role={singleSelect ? "radiogroup" : "group"}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <li key={opt.value}>
              <button
                type="button"
                role={singleSelect ? "radio" : "checkbox"}
                aria-checked={isSelected}
                onClick={() => onToggle(opt.value)}
                disabled={disabled}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                  isSelected
                    ? "border-gold bg-gold-pale/60 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/50",
                )}
              >
                {isSelected && (
                  <Check size={11} strokeWidth={2.2} className="text-gold" />
                )}
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SliderInput({
  min,
  max,
  step,
  value,
  minLabel,
  maxLabel,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  minLabel?: string;
  maxLabel?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[11.5px] text-ink-muted">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {minLabel ?? min}
        </span>
        <span
          className="font-mono text-[12px] tabular-nums text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {value}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {maxLabel ?? max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="mt-2 h-2 w-full appearance-none rounded-full bg-ivory-deep accent-gold focus:outline-none"
      />
    </div>
  );
}

function ImageGrid({
  options,
  selected,
  onToggle,
  min,
  max,
  disabled,
}: {
  options: ImageOption[];
  selected: string[];
  onToggle: (v: string) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const hint =
    max !== undefined
      ? `Pick up to ${max}`
      : min !== undefined
        ? `Pick at least ${min}`
        : undefined;

  return (
    <div>
      {hint && (
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hint} · {selected.length} selected
        </p>
      )}
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onToggle(opt.value)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-md border ring-1 transition-colors",
                  isSelected
                    ? "border-gold ring-gold"
                    : "border-border ring-transparent hover:border-gold/50",
                )}
              >
                <div className="aspect-[4/5] bg-ivory-warm">
                  <img
                    src={opt.image_url}
                    alt={opt.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.visibility =
                        "hidden";
                    }}
                  />
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 px-2 py-1.5 text-[11px]",
                    isSelected ? "bg-gold-pale/60 text-ink" : "bg-white text-ink-muted",
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check size={11} strokeWidth={2.4} className="text-gold" />
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Extracting panel ──────────────────────────────────────────────────────

function ExtractingPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <Loader2 size={22} strokeWidth={1.6} className="animate-spin text-gold" />
      <p className="font-serif text-[15px] text-ink">
        Tidying up your answers…
      </p>
      <p className="max-w-sm text-[12.5px] text-ink-muted">
        We're turning your free-text notes into structured fields. Takes just
        a moment.
      </p>
    </div>
  );
}

// ── Footer button ─────────────────────────────────────────────────────────

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
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" &&
          "bg-ink text-ivory hover:opacity-90",
        tone === "ghost" &&
          "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
