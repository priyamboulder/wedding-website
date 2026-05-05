"use client";

// ── Travel & Accommodations Build · Dual CTA ──────────────────────────────
// The dual-button row that sits at the top of Tab 2 (Room Block Manager)
// and Tab 3 (Guest Travel Hub). Same shape as the Wardrobe Build dual CTA,
// retargeted to the Travel Build journey on this category.
//
// Behaviour:
//   • Build CTA opens an inline TravelBuildShell at the requested starting
//     session (deep-link).
//   • Manual CTA dismisses the shell — the underlying tab body renders
//     normally.
//   • Time-gate from lib/guided-journeys/unlock-rules: muted before the
//     wedding is within 6 months. Soft — still clickable.
//   • If Vision is incomplete (no completed sessions in the default journey
//     AND no strategy fields filled in), the Build CTA is hidden and a
//     small note links back to Tab 1 (Hotel Strategy).

import { ChevronRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelStore } from "@/stores/travel-store";
import {
  evaluateUnlockRule,
  UNLOCK_RULES,
} from "@/lib/guided-journeys/unlock-rules";
import {
  TRAVEL_BUILD_CATEGORY,
  TRAVEL_BUILD_JOURNEY_ID,
  TRAVEL_BUILD_SESSIONS,
  type TravelBuildSessionKey,
} from "@/lib/guided-journeys/travel-accommodations-build";
import { useTravelBuildLauncher } from "@/stores/travel-build-launcher";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";
import type { WorkspaceCategory } from "@/types/workspace";
import { TravelBuildShell } from "./TravelBuildShell";
import { cn } from "@/lib/utils";

const TOOLTIP_LOCKED =
  "Travel build unlocks 6 months before your event. Premium hotel blocks need 6–9 months to negotiate, and attrition terms must be locked before the contract is signed — earlier than that and you don't know your guest count yet.";

export interface TravelBuildDualCTAProps {
  category: WorkspaceCategory;
  /** Which session to land on when launched. */
  startAtSession: TravelBuildSessionKey;
  /** Heading copy override. */
  guidedHeading?: string;
  /** Subheading copy override. */
  guidedSubheading?: string;
  /** Manual-mode label — defaults to "I'll fill it in myself". */
  manualLabel?: string;
}

export function TravelBuildDualCTA({
  category,
  startAtSession,
  guidedHeading = "Build with us",
  guidedSubheading = "2 sessions · ~11 min",
  manualLabel = "I'll fill it in myself",
}: TravelBuildDualCTAProps) {
  const launcher = useTravelBuildLauncher();
  const isOpen =
    launcher.activeCategoryId === category.id &&
    launcher.activeSessionKey !== null;

  const monthsUntilEvent = useMonthsUntilEvent();
  const rule = UNLOCK_RULES["travel:build"] ?? { kind: "unconditional" };
  const evaluated = evaluateUnlockRule(rule, { monthsUntilEvent });
  const unlocked = evaluated.unlocked;
  const tooltip = unlocked ? undefined : TOOLTIP_LOCKED;

  const visionComplete = useVisionComplete(category.id);

  if (!visionComplete) {
    return (
      <div className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your{" "}
          <Link
            href="/workspace/travel-accommodations"
            className="text-saffron underline-offset-2 hover:underline"
          >
            accommodation strategy
          </Link>{" "}
          first — Build picks up where Vision leaves off.
        </p>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="-mx-2 mb-6 overflow-hidden rounded-lg border border-saffron/40">
        <TravelBuildShell
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
// Surfaced at the top of Tab 1 (Hotel Strategy / Vision) once Vision is
// complete, the wedding is within 6 months, and Build has not been started.

export function TravelBuildSmartResumeNudge({
  category,
  onLaunch,
}: {
  category: WorkspaceCategory;
  onLaunch?: () => void;
}) {
  const launcher = useTravelBuildLauncher();
  const monthsUntilEvent = useMonthsUntilEvent();
  const rule = UNLOCK_RULES["travel:build"] ?? { kind: "unconditional" };
  const evaluated = evaluateUnlockRule(rule, { monthsUntilEvent });
  const visionComplete = useVisionComplete(category.id);
  const [state] = useCategoryJourneyState(
    TRAVEL_BUILD_CATEGORY,
    TRAVEL_BUILD_JOURNEY_ID,
  );
  const buildNotStarted = TRAVEL_BUILD_SESSIONS.every(
    (s) =>
      ((state.sessionStatus[s.key] as GuidedSessionStatus | undefined) ??
        "not_started") === "not_started",
  );

  if (!visionComplete || !evaluated.unlocked || !buildNotStarted) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-md border border-saffron/40 bg-saffron-pale/30 px-4 py-3 text-[12.5px] text-ink">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-saffron/20 text-saffron">
        <Sparkles size={13} strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <span className="font-medium">
          Your accommodation strategy is locked.
        </span>{" "}
        <span className="text-ink-muted">Ready to set up the blocks?</span>
      </div>
      <button
        type="button"
        onClick={() => {
          launcher.open(category.id, "block_setup");
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
 * Months until the wedding date, or null if not set. 1 month ≈ 30.44 days
 * — close enough for a soft gate.
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
 * Vision is "complete enough" for Travel when:
 *   • All three Vision sessions are marked completed, OR
 *   • The strategy on Tab 1 has its core decisions filled in
 *     (block_strategy + budget_approach + non-zero out_of_town_guests).
 *
 * The OR branch matters because couples often work directly in the
 * full workspace and never run the guided Vision flow — but their
 * strategy is still locked in.
 */
function useVisionComplete(categoryId: string): boolean {
  const [state] = useCategoryJourneyState(TRAVEL_BUILD_CATEGORY, "default");
  const required = ["accommodation_needs", "guest_travel", "travel_brief"];
  const guidedDone = required.every(
    (key) =>
      ((state.sessionStatus[key] as GuidedSessionStatus | undefined) ??
        "not_started") === "completed",
  );
  const strategy = useTravelStore((s) =>
    s.strategies.find((x) => x.category_id === categoryId),
  );
  const tabDone =
    !!strategy &&
    !!strategy.block_strategy &&
    !!strategy.budget_approach &&
    strategy.out_of_town_guests > 0;
  return guidedDone || tabDone;
}
