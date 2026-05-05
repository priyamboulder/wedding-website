"use client";

// ── Journey ─────────────────────────────────────────────────────────────
// "The Journey" — a five-step guided discovery section. Behaves as a
// strict accordion: at most one step is expanded at a time. Completed
// steps collapse to a single inline row (~40px) showing the result
// inline; tapping Edit re-expands them and auto-collapses any other
// open step. When all five are done the whole journey collapses to a
// foundation banner; the couple can re-expand anytime via "Edit
// foundation →".

import { useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useEventsStore } from "@/stores/events-store";
import {
  useDashboardJourneyStore,
  type JourneyStepId,
} from "@/stores/dashboard-journey-store";
import { JourneyProgress, type StoneState } from "./journey/JourneyProgress";
import { JourneyStep1Date } from "./journey/JourneyStep1Date";
import { JourneyStep2Events } from "./journey/JourneyStep2Events";
import { JourneyStep3Palette } from "./journey/JourneyStep3Palette";
import { JourneyStep4DressCode } from "./journey/JourneyStep4DressCode";
import { JourneyStep5Timeline } from "./journey/JourneyStep5Timeline";
import { JourneyBanner } from "./journey/JourneyBanner";
import { moodById } from "@/lib/journey/mood-palettes";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import { cn } from "@/lib/utils";

const STEP_TITLES: Record<JourneyStepId, string> = {
  1: "Pick your date",
  2: "Shape your celebrations",
  3: "Find your palette",
  4: "Set the dress code",
  5: "Plan your timeline",
};

const STEP_PROMPTS: Record<JourneyStepId, string> = {
  1: "Tap to start →",
  2: "Tap to start →",
  3: "Tap to start →",
  4: "Tap to start →",
  5: "Tap to start →",
};

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const ms =
    new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function Journey() {
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const events = useEventsStore((s) => s.events);

  const activeStepStore = useDashboardJourneyStore((s) => s.activeStep);
  const setActiveStep = useDashboardJourneyStore((s) => s.setActiveStep);
  const bannerDismissed = useDashboardJourneyStore((s) => s.bannerDismissed);
  const dismissBanner = useDashboardJourneyStore((s) => s.dismissBanner);
  const reopenBanner = useDashboardJourneyStore((s) => s.reopenBanner);
  const selectedMoodId = useDashboardJourneyStore((s) => s.selectedMoodId);
  const customPalette = useDashboardJourneyStore((s) => s.customPalette);
  const dressCodes = useDashboardJourneyStore((s) => s.dressCodes);
  const timelineGenerated = useDashboardJourneyStore((s) => s.timelineGenerated);

  // ── Derived state ────────────────────────────────────────────────
  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );
  const weddingDateIso = useMemo(
    () => (weddingDate ? weddingDate.toISOString().slice(0, 10) : ""),
    [weddingDate],
  );
  const daysUntil = useMemo(() => {
    if (!weddingDate) return null;
    return daysBetween(new Date(), weddingDate);
  }, [weddingDate]);

  const totalEventGuests = useMemo(
    () => events.reduce((acc, e) => acc + (e.guestCount ?? 0), 0),
    [events],
  );

  // Step completion is derived from underlying state where possible.
  const step1Done = !!weddingDate;
  const step2Done = events.length > 0;
  const step3Done = !!selectedMoodId || (!!customPalette && customPalette.length > 0);
  const step4Done =
    events.length > 0 && events.every((e) => !!dressCodes[e.id]?.style);
  const step5Done = timelineGenerated;
  const doneCount =
    Number(step1Done) +
    Number(step2Done) +
    Number(step3Done) +
    Number(step4Done) +
    Number(step5Done);
  const allDone = doneCount === 5;

  // Active step. Strict accordion: at most one open at a time, and the
  // user must be allowed to collapse every step. The store value is the
  // single source of truth — null means "all collapsed."
  const activeStep: JourneyStepId | null = activeStepStore;

  // First-mount nudge: if no step has been picked yet (fresh session —
  // activeStep is not persisted), open the lowest incomplete step so a
  // brand-new couple sees an inviting first action. Runs ONCE per mount,
  // so the user collapsing the open step won't re-trigger this.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (activeStepStore != null) return;
    if (!step1Done) setActiveStep(1);
    else if (!step2Done) setActiveStep(2);
    else if (!step3Done) setActiveStep(3);
    else if (!step4Done) setActiveStep(4);
    else if (!step5Done) setActiveStep(5);
    // Intentionally empty deps — initial-mount default only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Per-step inline summaries (rendered when collapsed/done). ────
  const step1Summary = useMemo(() => {
    if (!weddingDate) return "";
    const d = weddingDate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (daysUntil == null) return d;
    const tail =
      daysUntil < 0 ? `${Math.abs(daysUntil)} days since` : `${daysUntil} days`;
    return `${d} · ${tail}`;
  }, [weddingDate, daysUntil]);

  const step2Summary = useMemo(() => {
    if (events.length === 0) return "";
    const names = events
      .map(
        (e) =>
          e.customName?.trim() ||
          EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ||
          e.type,
      )
      .slice(0, 4)
      .join(" · ");
    const more = events.length > 4 ? ` +${events.length - 4}` : "";
    return `${events.length} event${events.length === 1 ? "" : "s"} — ${names}${more}`;
  }, [events]);

  const step3Summary = useMemo(() => {
    if (selectedMoodId) {
      const m = moodById(selectedMoodId);
      return m?.name ?? "Palette set";
    }
    if (customPalette && customPalette.length > 0) {
      return `Custom · ${customPalette.length} colors`;
    }
    return "";
  }, [selectedMoodId, customPalette]);

  const step4Summary = useMemo(() => {
    if (!step4Done) return "";
    const styles = events
      .map((e) => dressCodes[e.id]?.style)
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map((s) => String(s));
    const unique = Array.from(new Set(styles));
    return unique.slice(0, 3).join(" · ") || "Dress codes set";
  }, [events, dressCodes, step4Done]);

  const step5Summary = useMemo(
    () => (step5Done ? "Timeline ready" : ""),
    [step5Done],
  );

  // ── Collapsed banner ─────────────────────────────────────────────
  if (allDone && bannerDismissed) {
    return (
      <JourneyBanner
        weddingDate={weddingDate}
        eventCount={events.length}
        totalGuestCount={totalEventGuests}
        onReopen={() => {
          reopenBanner();
          setActiveStep(1);
        }}
      />
    );
  }

  // ── Stone state for the progress row ─────────────────────────────
  const stoneStates: Record<JourneyStepId, StoneState> = {
    1: step1Done ? "done" : activeStep === 1 ? "active" : "upcoming",
    2: step2Done ? "done" : activeStep === 2 ? "active" : "upcoming",
    3: step3Done ? "done" : activeStep === 3 ? "active" : "upcoming",
    4: step4Done ? "done" : activeStep === 4 ? "active" : "upcoming",
    5: step5Done ? "done" : activeStep === 5 ? "active" : "upcoming",
  };

  // Strict accordion toggle: opening a step collapses any other; tapping
  // the active step collapses it.
  const handleToggle = (n: JourneyStepId) =>
    setActiveStep(activeStep === n ? null : n);

  const renderStep = (n: JourneyStepId, child: React.ReactNode, summary: string) => {
    const done =
      n === 1 ? step1Done :
      n === 2 ? step2Done :
      n === 3 ? step3Done :
      n === 4 ? step4Done :
      step5Done;
    const active = activeStep === n;

    if (done && !active) {
      return (
        <li key={n}>
          <button
            type="button"
            onClick={() => handleToggle(n)}
            className="dash-step-row"
            aria-expanded="false"
          >
            <span aria-hidden className="dash-step-row__check">✓</span>
            <span className="dash-step-row__title">
              <span className="dash-step-row__title-num">Step {n}.</span>{" "}
              {STEP_TITLES[n]}
            </span>
            <span className="dash-step-row__summary">— {summary}</span>
            <span className="dash-step-row__edit">
              <Pencil size={10} strokeWidth={1.8} />
              Edit ↗
            </span>
          </button>
        </li>
      );
    }

    return (
      <StepWrapper
        key={n}
        n={n}
        title={STEP_TITLES[n]}
        done={done}
        active={active}
        onToggle={() => handleToggle(n)}
        summaryWhenCollapsed={!done && !active ? STEP_PROMPTS[n] : undefined}
      >
        {child}
      </StepWrapper>
    );
  };

  return (
    <section className="dash-card dash-card--feature relative overflow-hidden px-6 py-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="font-serif text-[26px] leading-tight text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            Your <em className="italic text-[color:var(--dash-blush-deep)]">journey</em>
          </h2>
          <p
            className="mt-0.5 font-serif text-[14.5px] italic text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Five decisions that shape everything else. Take them in any order
            you like.
          </p>
        </div>
        {allDone && (
          <button
            type="button"
            onClick={dismissBanner}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
          >
            Collapse
            <ChevronUp size={12} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Stepping stones */}
      <div className="mb-6 max-w-[420px]">
        <JourneyProgress
          states={stoneStates}
          onSelect={(s) => handleToggle(s)}
        />
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-2">
        {renderStep(
          1,
          <JourneyStep1Date
            weddingDateIso={weddingDateIso}
            daysUntil={daysUntil}
            done={step1Done}
            active={activeStep === 1}
          />,
          step1Summary,
        )}
        {renderStep(
          2,
          <JourneyStep2Events done={step2Done} active={activeStep === 2} />,
          step2Summary,
        )}
        {renderStep(
          3,
          <JourneyStep3Palette done={step3Done} active={activeStep === 3} />,
          step3Summary,
        )}
        {renderStep(
          4,
          <JourneyStep4DressCode done={step4Done} active={activeStep === 4} />,
          step4Summary,
        )}
        {renderStep(
          5,
          <JourneyStep5Timeline
            weddingDate={weddingDate}
            done={step5Done}
            active={activeStep === 5}
          />,
          step5Summary,
        )}
      </ol>

      {/* Footer hint */}
      {allDone && !bannerDismissed && (
        <p
          className="mt-5 font-serif text-[14px] italic text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Foundation set. Tap collapse and the events take over.
        </p>
      )}
    </section>
  );
}

interface StepWrapperProps {
  n: JourneyStepId;
  title: string;
  done: boolean;
  active: boolean;
  onToggle: () => void;
  summaryWhenCollapsed?: string;
  children: React.ReactNode;
}

function StepWrapper({
  n,
  title,
  done,
  active,
  onToggle,
  summaryWhenCollapsed,
  children,
}: StepWrapperProps) {
  return (
    <li
      className={cn(
        "dash-step",
        active && "dash-step--active",
        done && !active && "dash-step--done",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={active}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-serif text-[13px] italic",
            done
              ? "bg-[color:var(--dash-blush)] text-white"
              : "border border-[color:var(--dash-gold)] bg-transparent text-[color:var(--dash-text)]",
          )}
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
          }}
        >
          {done ? "✓" : n}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className="font-serif text-[16.5px] leading-snug text-[color:var(--dash-text)]"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
              }}
            >
              <span className="text-[color:var(--dash-text-faint)]">
                Step {n}.
              </span>{" "}
              {title}
            </h3>
            {!done && !active && summaryWhenCollapsed && (
              <span
                className="text-[11.5px] italic text-[color:var(--dash-text-faint)]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                }}
              >
                {summaryWhenCollapsed}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={cn(
            "shrink-0 text-[color:var(--dash-text-faint)] transition-transform",
            active && "rotate-180",
          )}
        />
      </button>

      {active && (
        <div className="border-t border-[color:rgba(45,45,45,0.06)] px-4 py-4">
          {children}
        </div>
      )}
    </li>
  );
}
