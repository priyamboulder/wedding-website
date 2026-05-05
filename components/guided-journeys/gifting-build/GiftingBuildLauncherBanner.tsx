"use client";

// ── Gifting Build journey launcher banner ─────────────────────────────────
// Renders at the top of Tabs 3, 4, 5, and 6 of the Gifting workspace. Two
// CTAs:
//   1. "Build with us" — opens the journey at the appropriate session
//      (Tab 3 → Session 1 welcome_bags, Tab 4 → Session 2 trousseau, etc.)
//   2. "I'll fill it in myself" — passive label, the underlying tab is
//      already rendering below.
//
// Time gate: when months_until_event > 4, the primary CTA is rendered in
// a muted state with a tooltip. Click is still allowed (soft gate).
//
// Smart resume: when on Tab 3 AND Vision is complete AND Build has not
// been started AND we're inside the time-window, surfaces the soft prompt
// described in the build prompt.
//
// Vision-incomplete branch: hides Build CTAs entirely and surfaces a
// small note pointing the couple back to Vision first.

import { useMemo } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  GIFTING_BUILD_CATEGORY,
  GIFTING_BUILD_JOURNEY_ID,
  GIFTING_BUILD_SESSIONS,
  GIFTING_BUILD_TOTAL_MINUTES,
  GIFTING_BUILD_UNLOCK_THRESHOLD_MONTHS,
  type GiftingBuildSessionKey,
} from "@/lib/guided-journeys/gifting-build";
import { useGiftingBuildLauncher } from "@/stores/gifting-build-launcher";
import {
  DEFAULT_JOURNEY_ID,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";

const SESSION_COUNT = GIFTING_BUILD_SESSIONS.length;

const VISION_REQUIRED_SESSIONS = [
  "gifting_philosophy",
  "gifting_inspiration",
  "gifting_brief",
];

const TOOLTIP_LOCKED = `Gifting build unlocks ${GIFTING_BUILD_UNLOCK_THRESHOLD_MONTHS} months before your event. Trousseau packaging from India needs 60–90 days, custom welcome-bag items need ~60 days — earlier than that and your guest count isn't locked yet.`;

export function GiftingBuildLauncherBanner({
  categoryId,
  sessionKey,
}: {
  categoryId: string;
  sessionKey: GiftingBuildSessionKey;
}) {
  const open = useGiftingBuildLauncher((s) => s.open);
  const monthsUntil = useMonthsUntilWedding();

  const isLocked =
    monthsUntil != null && monthsUntil > GIFTING_BUILD_UNLOCK_THRESHOLD_MONTHS;
  const tooltip = isLocked ? TOOLTIP_LOCKED : undefined;

  const visionComplete = useVisionJourneyComplete();
  const buildState = useBuildJourneyState();
  const isOnFirstSession = sessionKey === "welcome_bags";

  if (!visionComplete) {
    return (
      <div className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your gifting vision first — Build picks up where Vision
          leaves off. Head over to the Vision &amp; Mood tab.
        </p>
      </div>
    );
  }

  const showSmartResume =
    isOnFirstSession &&
    visionComplete &&
    buildState.completedCount === 0 &&
    buildState.touchedCount === 0 &&
    !isLocked;

  return (
    <div className="mb-6 space-y-3">
      {showSmartResume && (
        <SmartResumePrompt onLaunch={() => open(categoryId, sessionKey)} />
      )}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3",
          "border-saffron/30 bg-saffron-pale/20",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-saffron-pale/70 text-saffron">
            <Sparkles size={14} strokeWidth={1.8} />
          </span>
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Gifting build journey
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">
              {buildState.completedCount > 0
                ? `${buildState.completedCount} of ${SESSION_COUNT} sessions complete — pick up where you left off.`
                : "Welcome bags, trousseau, return favors, family exchanges — four short sessions."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => open(categoryId, sessionKey)}
            title={tooltip}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              isLocked
                ? "border border-border bg-white text-ink-muted hover:border-saffron/40"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            {isLocked && <Clock size={12} strokeWidth={1.8} />}
            Build with us
            <ArrowRight size={12} strokeWidth={2} />
            <span
              className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {SESSION_COUNT} sessions · ~{GIFTING_BUILD_TOTAL_MINUTES} min
            </span>
          </button>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            or fill it in yourself · full workspace below
          </span>
        </div>
      </div>
      {isLocked && (
        <p className="px-1 text-[11.5px] italic text-ink-muted">
          {TOOLTIP_LOCKED}
        </p>
      )}
    </div>
  );
}

// ─── Smart resume prompt ─────────────────────────────────────────────────

function SmartResumePrompt({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose/30 bg-rose-pale/30 px-4 py-3">
      <p className="text-[13px] leading-snug text-ink">
        Your gifting vision is locked.{" "}
        <span className="text-ink-muted">
          Ready to build the inventory?
        </span>
      </p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-rose/90"
      >
        Start build
        <ArrowRight size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────

function useMonthsUntilWedding(): number | null {
  const dateStr = useAuthStore((s) => s.user?.wedding?.weddingDate);
  return useMemo(() => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const months =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());
    return months;
  }, [dateStr]);
}

function useVisionJourneyComplete(): boolean {
  const [state] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    DEFAULT_JOURNEY_ID,
  );
  return VISION_REQUIRED_SESSIONS.every(
    (key) =>
      (state.sessionStatus[key] as GuidedSessionStatus | undefined) ===
      "completed",
  );
}

function useBuildJourneyState(): {
  completedCount: number;
  touchedCount: number;
} {
  const [state] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    GIFTING_BUILD_JOURNEY_ID,
  );
  let completedCount = 0;
  let touchedCount = 0;
  for (const session of GIFTING_BUILD_SESSIONS) {
    const status = state.sessionStatus[session.key];
    if (status === "completed") completedCount += 1;
    if (status === "in_progress" || status === "completed") touchedCount += 1;
  }
  return { completedCount, touchedCount };
}
