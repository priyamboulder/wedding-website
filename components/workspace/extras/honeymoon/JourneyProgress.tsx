"use client";

// ── Journey progress card ─────────────────────────────────────────────────
// Sits below the quiz summary on the Dream tab. Shows the couple where
// they are across the five-stage flow — dream / discover / research /
// book / prep — so the module feels like one guided experience instead
// of seven disconnected tabs. Each row has a clear "next step" when the
// stage isn't complete.

import { Check, Circle, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import { useQuizStore } from "@/stores/quiz-store";
import type { BookingPriorityTier } from "@/types/honeymoon";
import {
  DESTINATION_CONCEPTS,
  type DestinationConcept,
} from "@/lib/honeymoon/destination-catalog";
import { cn } from "@/lib/utils";

type StageState = "done" | "in_progress" | "not_started";

interface Stage {
  id: string;
  label: string;
  state: StageState;
  detail: string;
  nextStep?: string;
}

export function JourneyProgress() {
  const profile = useHoneymoonStore((s) => s.vibeProfile);
  const destinations = useHoneymoonStore((s) => s.destinations);
  const bookings = useHoneymoonStore((s) => s.bookings);
  const budget = useHoneymoonStore((s) => s.budget);
  const budgetLines = useHoneymoonStore((s) => s.budgetLines);
  const checklist = useHoneymoonStore((s) => s.checklist);
  const days = useHoneymoonStore((s) => s.days);
  const quizCompleted = useQuizStore((s) =>
    s.getCompletion("honeymoon" as never, "dream"),
  );

  const leading = useMemo(
    () => destinations.find((d) => d.status === "leading"),
    [destinations],
  );
  const matchedConcept = useMemo<DestinationConcept | null>(() => {
    if (!leading) return null;
    const n = leading.name.trim().toLowerCase();
    return (
      DESTINATION_CONCEPTS.find((c) => c.title.trim().toLowerCase() === n) ??
      DESTINATION_CONCEPTS.find((c) =>
        c.stops.some((s) => s.trim().toLowerCase() === n),
      ) ??
      null
    );
  }, [leading]);

  const hasProfile =
    profile.vibes.length > 0 ||
    profile.duration !== null ||
    profile.budgetTier !== null;

  const tieredBookings = bookings.filter(
    (b) => b.priorityTier && b.priorityTier !== "unset",
  );
  const bookedCount = bookings.filter((b) => b.status === "booked").length;
  const hasPlanNow = tieredBookings.some(
    (b) => (b.priorityTier as BookingPriorityTier) === "now",
  );

  const totalBudgetSet = budget.totalBudgetCents > 0;
  const plannedCents = budgetLines.reduce((s, b) => s + b.amountCents, 0);
  const budgetPct = totalBudgetSet
    ? Math.min(100, Math.round((plannedCents / budget.totalBudgetCents) * 100))
    : 0;

  const checklistDone = checklist.filter((c) => c.done).length;
  const checklistTotal = checklist.length;
  const prepPct = checklistTotal > 0
    ? Math.round((checklistDone / checklistTotal) * 100)
    : 0;

  const stages: Stage[] = [
    {
      id: "dream",
      label: "1 · Dream",
      state: quizCompleted
        ? "done"
        : hasProfile
          ? "in_progress"
          : "not_started",
      detail: quizCompleted
        ? "Quiz taken — profile locked in"
        : hasProfile
          ? "Profile sketched — consider retaking the quiz for tighter matches"
          : "Haven't taken the Dream Session yet",
      nextStep:
        !quizCompleted && !hasProfile
          ? "Take the 8-question Dream Session above"
          : undefined,
    },
    {
      id: "discover",
      label: "2 · Discover",
      state: destinations.length >= 2
        ? "done"
        : destinations.length === 1
          ? "in_progress"
          : "not_started",
      detail:
        destinations.length === 0
          ? "No destinations shortlisted yet"
          : `${destinations.length} destination${destinations.length === 1 ? "" : "s"} shortlisted${matchedConcept ? ` · ${matchedConcept.title} leading` : ""}`,
      nextStep:
        destinations.length < 2
          ? "Add 2–3 from the inspiration wall"
          : undefined,
    },
    {
      id: "research",
      label: "3 · Research",
      state: leading
        ? matchedConcept?.deepDive
          ? "done"
          : "in_progress"
        : "not_started",
      detail: leading
        ? matchedConcept?.deepDive
          ? `Leading: ${leading.name} — full trip guide available`
          : `Leading: ${leading.name} — no guide yet, research manually`
        : "No leading destination picked",
      nextStep: !leading
        ? "Mark your favorite as Leading in the destinations board"
        : undefined,
    },
    {
      id: "book",
      label: "4 · Book",
      state: bookedCount >= 3
        ? "done"
        : hasPlanNow || bookings.length > 0
          ? "in_progress"
          : "not_started",
      detail:
        bookings.length === 0
          ? "No bookings yet"
          : `${bookedCount} booked / ${bookings.length} total · ${tieredBookings.length} prioritized`,
      nextStep:
        bookings.length === 0
          ? "Seed a priority plan from your leading destination"
          : !hasPlanNow && bookings.length > 0
            ? "Set a Book-now priority on your flights + hotel"
            : undefined,
    },
    {
      id: "prep",
      label: "5 · Prep",
      state: prepPct >= 80
        ? "done"
        : checklistTotal > 0
          ? "in_progress"
          : "not_started",
      detail:
        checklistTotal === 0
          ? "No prep items yet"
          : `${checklistDone} of ${checklistTotal} prep items checked (${prepPct}%)`,
      nextStep:
        checklistTotal === 0
          ? "Seed the prep list from your trip guide"
          : undefined,
    },
  ];

  const completed = stages.filter((s) => s.state === "done").length;
  const headline =
    completed === 5
      ? "You're ready for the trip of your lives."
      : completed >= 3
        ? "You're in the home stretch."
        : completed >= 1
          ? "You're rolling — keep going."
          : "One step at a time.";

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            Your honeymoon journey
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            {headline}
          </h3>
          <p
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {completed}/5 stages complete
          </p>
        </div>
        <ProgressBar completed={completed} total={5} />
      </div>

      <ol className="space-y-2.5">
        {stages.map((stage) => (
          <StageRow key={stage.id} stage={stage} />
        ))}
      </ol>

      {profile.timing === "minimoon_then_big" && (
        <p className="mt-4 border-t border-border/60 pt-3 text-[12px] italic text-ink-muted">
          You picked "minimoon now + big trip later" — check the splitter on
          the Destinations tab to line both trips up as complementary
          chapters.
        </p>
      )}
    </section>
  );
}

function StageRow({ stage }: { stage: Stage }) {
  const tone =
    stage.state === "done"
      ? "border-sage/40 bg-sage/5 text-sage"
      : stage.state === "in_progress"
        ? "border-gold/40 bg-gold-light/10 text-gold"
        : "border-border bg-white text-ink-muted";
  return (
    <li
      className={cn(
        "grid grid-cols-[auto_1fr] items-start gap-3 rounded-md border px-3 py-2",
        tone,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          stage.state === "done"
            ? "bg-sage text-white"
            : stage.state === "in_progress"
              ? "border-2 border-gold text-gold"
              : "border border-border/60 text-ink-faint",
        )}
        aria-hidden
      >
        {stage.state === "done" ? (
          <Check size={11} strokeWidth={2.5} />
        ) : (
          <Circle size={6} strokeWidth={0} fill="currentColor" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {stage.label}
        </p>
        <p className="mt-0.5 text-[12.5px] text-ink">{stage.detail}</p>
        {stage.nextStep && (
          <p className="mt-0.5 text-[11.5px] italic text-ink-muted">
            → {stage.nextStep}
          </p>
        )}
      </div>
    </li>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="hidden w-40 shrink-0 md:block">
      <div className="h-1.5 overflow-hidden rounded-full bg-ivory-warm">
        <div
          className="h-full bg-gradient-to-r from-gold to-saffron"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className="mt-1 text-right font-mono text-[10px] tabular-nums text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {pct}%
      </p>
    </div>
  );
}
