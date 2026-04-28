"use client";

// ── Quiz entry card ───────────────────────────────────────────────────────
// Shown at the top of an empty (or sparsely-filled) vendor subsection to
// offer a 2-minute guided onboarding. Host tab decides whether the
// underlying section is "meaningfully filled" and passes `forceShow` /
// `forceHide` if it needs to override the store-level rules.

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useQuizStore } from "@/stores/quiz-store";
import type { QuizSchema } from "@/types/quiz";
import { WORKSPACE_ROLES } from "@/types/workspace";
import { track } from "@/lib/telemetry";
import { QuizRunner } from "./QuizRunner";

interface Props {
  schema: QuizSchema;
  categoryId: string;
  // When the host tab considers the section already filled, pass
  // `suppressWhenFilled` to hide the card even if no completion exists.
  suppressWhenFilled?: boolean;
}

export function QuizEntryCard({ schema, categoryId, suppressWhenFilled }: Props) {
  const getCompletion = useQuizStore((s) => s.getCompletion);
  const isDismissed = useQuizStore((s) => s.isDismissed);
  const dismiss = useQuizStore((s) => s.dismiss);
  const confirmPlannerDraft = useQuizStore((s) => s.confirmPlannerDraft);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const [runnerOpen, setRunnerOpen] = useState(false);
  // Zustand persist rehydrates on client only; gate until after mount so
  // SSR matches the first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const completion = getCompletion(schema.category, schema.subsection);
  const dismissed = isDismissed(schema.category, schema.subsection);

  if (!mounted) return null;

  // Planner-draft badge: planner took the quiz, couple hasn't confirmed yet.
  const showPlannerDraftBadge =
    completion?.planner_draft &&
    (currentRole === "priya" || currentRole === "arjun");

  if (showPlannerDraftBadge) {
    return (
      <PlannerDraftBadge
        categorySlug={schema.category}
        subsection={schema.subsection}
        onConfirm={() => {
          confirmPlannerDraft(schema.category, schema.subsection);
          track("quiz_planner_draft_confirmed", {
            quiz_id: schema.id,
            role: currentRole,
          });
        }}
      />
    );
  }

  // Card is hidden once THIS version of the quiz has been taken — the
  // section header is expected to surface a "Retake quiz" link via
  // QuizRetakeLink. If the stored completion is from an older schema id
  // (we shipped a new version of the questions), keep showing the card
  // so the couple can take the updated quiz. Similarly, a prior dismissal
  // is scoped to the version that was on screen when they dismissed.
  const stale = completion && completion.quiz_id !== schema.id;
  if (completion && !stale) return null;
  if (dismissed && !stale) return null;
  if (suppressWhenFilled) return null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="relative overflow-hidden rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5 shadow-[0_1px_2px_rgba(184,134,11,0.05)]"
      >
        <button
          type="button"
          onClick={() => {
            dismiss(schema.category, schema.subsection);
            track("quiz_entry_dismissed", {
              quiz_id: schema.id,
              method: "close_icon",
            });
          }}
          aria-label="Dismiss"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-sm text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
        >
          <X size={13} />
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
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
              Not sure where to start?
            </p>
            <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
              {schema.title}
            </h3>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              {schema.intro}
            </p>
            <p
              className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {schema.questions.length} questions · ~{schema.estimated_minutes}{" "}
              min
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRunnerOpen(true);
                track("quiz_started", {
                  quiz_id: schema.id,
                  role: currentRole,
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
            >
              Start quiz
              <ArrowRight size={13} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => {
                dismiss(schema.category, schema.subsection);
                track("quiz_entry_dismissed", {
                  quiz_id: schema.id,
                  method: "skip_link",
                });
              }}
              className="text-[11.5px] text-ink-muted transition-colors hover:text-ink"
            >
              Skip, I'll fill it in myself
            </button>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {runnerOpen && (
          <QuizRunner
            schema={schema}
            categoryId={categoryId}
            onClose={(outcome) => {
              setRunnerOpen(false);
              if (outcome === "dismissed") {
                // User closed without completing — don't auto-dismiss
                // the card; they may want to retry later.
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Retake link ───────────────────────────────────────────────────────────
// A subtle affordance the section header can mount once the quiz has been
// taken. Opens the same runner; recorded completion triggers the
// overwrite-confirmation flow in apply().

export function QuizRetakeLink({
  schema,
  categoryId,
}: {
  schema: QuizSchema;
  categoryId: string;
}) {
  const completion = useQuizStore((s) =>
    s.getCompletion(schema.category, schema.subsection),
  );
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const [open, setOpen] = useState(false);
  // Zustand persist rehydrates on the client only; gate rendering until
  // after mount so SSR output matches the first client render and React
  // doesn't throw a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Only show the retake affordance when the stored completion matches
  // the currently-registered schema. If we shipped a new version, the
  // entry card will re-appear instead.
  if (!mounted || !completion || completion.quiz_id !== schema.id) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("quiz_retaken", {
            quiz_id: schema.id,
            role: currentRole,
          });
        }}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Sparkles size={10} strokeWidth={1.8} />
        Retake quiz
      </button>

      <AnimatePresence>
        {open && (
          <QuizRunner
            schema={schema}
            categoryId={categoryId}
            priorCompletion={completion}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Planner draft badge ───────────────────────────────────────────────────

function PlannerDraftBadge({
  categorySlug,
  subsection,
  onConfirm,
}: {
  categorySlug: string;
  subsection: string;
  onConfirm: () => void;
}) {
  return (
    <Banner tone="saffron">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Sparkles
          size={14}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-saffron"
        />
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Planner draft
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            Your planner filled this in — confirm it's on the right track.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-saffron/40 bg-white px-3 py-1 text-[11.5px] font-medium text-saffron transition-colors hover:bg-saffron-pale/60"
      >
        Looks good
      </button>
    </Banner>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "saffron";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 rounded-md border px-4 py-3",
        tone === "saffron" && "border-saffron/30 bg-saffron-pale/30",
      )}
    >
      {children}
    </div>
  );
}

// Helper re-export so hosts can resolve the current role display name
// without pulling in the whole types module.
export function roleDisplayName(role: string): string {
  return WORKSPACE_ROLES.find((r) => r.id === role)?.name ?? role;
}
