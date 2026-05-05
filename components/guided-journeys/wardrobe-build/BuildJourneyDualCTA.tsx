"use client";

// ── Wardrobe Build · Dual CTA ──────────────────────────────────────────────
// The dual-button row that sits at the top of Tab 3 (Event Looks), Tab 4
// (Family Coordination), and Tab 6 (Documents) on the Wardrobe & Styling
// workspace. Same shape as the Officiant Build dual CTA, retargeted to the
// Build journey on this category.
//
// Behaviour:
//   • Build CTA opens an inline WardrobeBuildShell at the requested
//     starting session (deep-link).
//   • Manual CTA dismisses the shell — the underlying tab body renders
//     normally.
//   • Time-gate from lib/guided-journeys/unlock-rules: muted before the
//     wedding is within 6 months. Soft — still clickable.
//   • If Vision is incomplete (no wardrobe quiz completion AND no brief
//     content), the Build CTA is hidden and replaced with a small note.

import { useState } from "react";
import { ChevronRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useQuizStore } from "@/stores/quiz-store";
import { evaluateUnlockRule, UNLOCK_RULES } from "@/lib/guided-journeys/unlock-rules";
import {
  WARDROBE_BUILD_SESSIONS,
  type WardrobeBuildSessionKey,
} from "@/lib/guided-journeys/wardrobe-build";
import { useWardrobeBuildLauncher } from "@/stores/wardrobe-build-launcher";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import type { WorkspaceCategory } from "@/types/workspace";
import { WardrobeBuildShell } from "./WardrobeBuildShell";
import { cn } from "@/lib/utils";

const WARDROBE_BRIEF_KEY = "ananya:wardrobe-brief";

// Override copy for the wardrobe gate — more specific than the generic
// "Unlocks 6 months before your wedding."
const TOOLTIP_LOCKED =
  "Outfit planning unlocks 6 months before your event. Designers need 4–6 months for couture lehengas and sherwanis.";

export interface WardrobeBuildDualCTAProps {
  category: WorkspaceCategory;
  /** Which session to land on when launched. */
  startAtSession: WardrobeBuildSessionKey;
  /** Heading copy override. */
  guidedHeading?: string;
  /** Subheading copy override. */
  guidedSubheading?: string;
  /** Manual-mode label — defaults to "I'll fill it in myself". */
  manualLabel?: string;
}

export function WardrobeBuildDualCTA({
  category,
  startAtSession,
  guidedHeading = "Plan with us",
  guidedSubheading = "3 sessions · ~12 min",
  manualLabel = "I'll fill it in myself",
}: WardrobeBuildDualCTAProps) {
  const launcher = useWardrobeBuildLauncher();
  const isOpen =
    launcher.activeCategoryId === category.id &&
    launcher.activeSessionKey !== null;

  const monthsUntilEvent = useMonthsUntilEvent();
  const rule = UNLOCK_RULES["wardrobe:build"] ?? { kind: "unconditional" };
  const evaluated = evaluateUnlockRule(rule, { monthsUntilEvent });
  const unlocked = evaluated.unlocked;
  const tooltip = unlocked ? undefined : TOOLTIP_LOCKED;

  const visionComplete = useVisionComplete();

  if (!visionComplete) {
    return (
      <div className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your{" "}
          <Link
            href={`/app/wardrobe?tab=vision`}
            className="text-saffron underline-offset-2 hover:underline"
          >
            wardrobe vision
          </Link>{" "}
          first — Build picks up where Vision leaves off.
        </p>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="-mx-2 mb-6 overflow-hidden rounded-lg border border-saffron/40">
        <WardrobeBuildShell
          category={category}
          initialSessionKey={launcher.activeSessionKey ?? startAtSession}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-saffron/30 bg-saffron-pale/20 px-4 py-3">
      <button
        type="button"
        onClick={() => launcher.open(category.id, startAtSession)}
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
        onClick={() => launcher.close()}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2.5 text-[12.5px] font-medium text-ink-muted hover:border-saffron/40"
      >
        <span>{manualLabel}</span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Full workspace
        </span>
      </button>
      {!unlocked && (
        <p className="basis-full text-[11.5px] italic text-ink-muted">
          {tooltip}
        </p>
      )}
    </div>
  );
}

// ── Smart-resume nudge ─────────────────────────────────────────────────────
// Surfaced at the top of Tab 1 (Vision) once Vision is complete, the wedding
// is within 6 months, and Build has not been started yet.

export function WardrobeBuildSmartResumeNudge({
  category,
  onLaunch,
}: {
  category: WorkspaceCategory;
  onLaunch?: () => void;
}) {
  const launcher = useWardrobeBuildLauncher();
  const monthsUntilEvent = useMonthsUntilEvent();
  const rule = UNLOCK_RULES["wardrobe:build"] ?? { kind: "unconditional" };
  const evaluated = evaluateUnlockRule(rule, { monthsUntilEvent });
  const visionComplete = useVisionComplete();
  const [state] = useCategoryJourneyState("wardrobe", "build");
  const buildNotStarted = WARDROBE_BUILD_SESSIONS.every(
    (s) => (state.sessionStatus[s.key] ?? "not_started") === "not_started",
  );

  if (!visionComplete || !evaluated.unlocked || !buildNotStarted) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-md border border-saffron/40 bg-saffron-pale/30 px-4 py-3 text-[12.5px] text-ink">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-saffron/20 text-saffron">
        <Sparkles size={13} strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <span className="font-medium">Your style direction is locked.</span>{" "}
        <span className="text-ink-muted">
          Ready to plan every look?
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          launcher.open(category.id, "outfit_planner");
          onLaunch?.();
        }}
        className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        Start Build <ChevronRight size={12} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Months until the wedding date, or null if not set.
 * Approximate (1 month = 30.44 days) — close enough for soft gate copy.
 */
function useMonthsUntilEvent(): number | null {
  const weddingDate = useAuthStore(
    (s) => s.user?.wedding?.weddingDate ?? null,
  );
  if (!weddingDate) return null;
  const target = new Date(weddingDate);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 0;
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days / 30.44;
}

/**
 * Vision is "complete" for Wardrobe when the couple has either:
 *   • Recorded a quiz completion under quiz_store, or
 *   • Saved a non-trivial brief (> 80 chars in the local brief blob).
 */
function useVisionComplete(): boolean {
  const completion = useQuizStore((s) =>
    s.getCompletion("wardrobe", "vision"),
  );
  if (completion) return true;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(WARDROBE_BRIEF_KEY);
    if (raw && raw.trim().length >= 80) return true;
  } catch {
    // ignore
  }
  return false;
}
