"use client";

// ── Shared Build Journey dual-CTA + smart-resume nudge ──────────────────────
// Section 6 of the cross-category refinement pass codifies the dual-CTA
// pattern: every tab that has a Build entry point shows a "Build with us"
// primary button and an "I'll fill it in myself" secondary, with an
// inline-launchable shell when the Build is opened.
//
// This module is the canonical implementation. Per-Build wrappers (e.g.
// `OfficiantBuildDualCTA`, `WardrobeBuildDualCTA`) own the launcher
// integration and the per-Build session deep-link, then hand off the
// presentational concerns here. That keeps the visual pattern locked
// while letting each Build journey wire its open/close mechanics however
// it needs to (local useState, zustand launcher, URL-driven, etc.).
//
// Why pass `shellSlot` as a node rather than a render-prop or component
// type: the parent already knows the shell config it wants. Passing a
// rendered node avoids generic type gymnastics and keeps the parent in
// charge of which shell mounts.

import { ChevronRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Dual-CTA props ─────────────────────────────────────────────────────────

export interface BuildJourneyDualCTAProps {
  /** "wardrobe:build", "priest:build", etc. — used for analytics tagging. */
  journeyKey: string;
  /** "Plan with us" / "Build the ritual list with us" / etc. */
  guidedHeading: string;
  /** "3 sessions · ~12 min" — pulled from EXTRA_JOURNEY_INTROS subtext. */
  guidedSubheading: string;
  /** Manual-mode label; standardised wording per section 6. */
  manualLabel?: string;
  /** Right-CTA badge label; standardised "Full workspace" per section 6. */
  manualSecondaryLabel?: string;

  // ── Visibility control (parent-owned) ─────────────────────────────────
  /** Open state of the inline Build shell. */
  isOpen: boolean;
  /** Triggered when the user clicks the primary CTA. */
  onOpen: () => void;
  /** Triggered when the user clicks the manual CTA. */
  onClose: () => void;

  // ── Vision gate ───────────────────────────────────────────────────────
  /** False → renders a soft prompt to finish Vision instead of the CTAs. */
  isVisionComplete: boolean;
  /** Where "ceremony vision" / "wardrobe vision" link points. */
  visionPathHref: string;
  /** Word the link uses; default "vision". */
  visionLabel?: string;

  // ── Unlock evaluation ─────────────────────────────────────────────────
  /** Pass the result of `evaluateUnlockRule` / `useUnlockEvaluation`. */
  unlockEvaluation: { unlocked: boolean; tooltipWhenLocked?: string };
  /** Optional override of unlockEvaluation.tooltipWhenLocked for category-
   *  specific copy that's more specific than the generic gate text. */
  lockedTooltipOverride?: string;

  // ── Shell ─────────────────────────────────────────────────────────────
  /** Rendered when isOpen === true. Parent constructs the shell with
   *  whatever props it needs. */
  shellSlot: ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────

export function BuildJourneyDualCTA({
  journeyKey,
  guidedHeading,
  guidedSubheading,
  manualLabel = "I'll fill it in myself",
  manualSecondaryLabel = "Full workspace",
  isOpen,
  onOpen,
  onClose,
  isVisionComplete,
  visionPathHref,
  visionLabel = "vision",
  unlockEvaluation,
  lockedTooltipOverride,
  shellSlot,
}: BuildJourneyDualCTAProps) {
  if (!isVisionComplete) {
    return (
      <div
        className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3"
        data-journey={journeyKey}
        data-state="vision-incomplete"
      >
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your{" "}
          <Link
            href={visionPathHref}
            className="text-saffron underline-offset-2 hover:underline"
          >
            {visionLabel}
          </Link>{" "}
          first — Build picks up where Vision leaves off.
        </p>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div
        className="-mx-2 mb-6 overflow-hidden rounded-lg border border-saffron/40"
        data-journey={journeyKey}
        data-state="open"
      >
        {shellSlot}
      </div>
    );
  }

  const unlocked = unlockEvaluation.unlocked;
  const tooltip = unlocked
    ? undefined
    : lockedTooltipOverride ?? unlockEvaluation.tooltipWhenLocked;

  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-saffron/30 bg-saffron-pale/20 px-4 py-3"
      data-journey={journeyKey}
      data-state="closed"
    >
      <button
        type="button"
        onClick={onOpen}
        title={tooltip}
        className={cn(
          "group inline-flex flex-1 min-w-[260px] items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors",
          unlocked
            ? "bg-ink text-ivory hover:bg-ink-soft"
            : "border border-border bg-white text-ink-muted hover:border-saffron/40",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            unlocked
              ? "bg-saffron/20 text-saffron"
              : "bg-ivory-warm/60 text-ink-muted",
          )}
        >
          {unlocked ? (
            <Sparkles size={14} strokeWidth={1.6} />
          ) : (
            <Lock size={12} strokeWidth={1.8} />
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-[14.5px] leading-tight">
            {guidedHeading}
          </span>
          <span
            className={cn(
              "mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em]",
              unlocked ? "text-ivory/70" : "text-ink-faint",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {guidedSubheading}
          </span>
        </span>
        <ChevronRight
          size={14}
          strokeWidth={1.8}
          className={cn(
            "shrink-0 transition-transform group-hover:translate-x-0.5",
            unlocked ? "text-ivory" : "text-ink-faint",
          )}
        />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2.5 text-[12.5px] font-medium text-ink-muted hover:border-saffron/40"
      >
        <span>{manualLabel}</span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {manualSecondaryLabel}
        </span>
      </button>
      {!unlocked && tooltip && (
        <p className="basis-full text-[11.5px] italic text-ink-muted">{tooltip}</p>
      )}
    </div>
  );
}

// ── Smart-resume nudge ─────────────────────────────────────────────────────
// Surfaced at the top of the Vision tab when Vision is complete, the gate
// has tripped, and the Build hasn't been started yet. Each Build computes
// its own visibility — this component only renders the visual.

export interface BuildSmartResumeNudgeProps {
  /** Parent decides — false short-circuits to null for clean composition. */
  visible: boolean;
  /** "Your style direction is locked." */
  headline: string;
  /** "Ready to plan every look?" */
  prompt: string;
  /** Button label. Default "Start Build". */
  ctaLabel?: string;
  /** Triggered on click. */
  onLaunch: () => void;
}

export function BuildSmartResumeNudge({
  visible,
  headline,
  prompt,
  ctaLabel = "Start Build",
  onLaunch,
}: BuildSmartResumeNudgeProps) {
  if (!visible) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-md border border-saffron/40 bg-saffron-pale/30 px-4 py-3 text-[12.5px] text-ink">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-saffron/20 text-saffron">
        <Sparkles size={13} strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <span className="font-medium">{headline}</span>{" "}
        <span className="text-ink-muted">{prompt}</span>
      </div>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        {ctaLabel} <ChevronRight size={12} strokeWidth={1.8} />
      </button>
    </div>
  );
}
