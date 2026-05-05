"use client";

// ── Jewelry Build launcher banner ─────────────────────────────────────────
// Renders at the top of Tabs 3, 4, 5, and 6 of the Jewelry workspace. Two
// CTAs:
//   1. "Build with us" — opens the journey at the appropriate session
//      (Session 1 from Tab 3, Session 2 from Tab 4, etc.)
//   2. "I'll fill it in myself" — passive label.
//
// Time gate: when months_until_event > 6, the primary CTA is rendered in
// a muted state with a tooltip. Click is still allowed.
//
// Smart resume: when on Tab 3 AND Vision is complete AND Build is
// not_started, surfaces the soft prompt described in the build prompt.

import { useMemo } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  JEWELRY_BUILD_CATEGORY,
  JEWELRY_BUILD_JOURNEY_ID,
  JEWELRY_BUILD_SESSIONS,
  JEWELRY_BUILD_TOTAL_MINUTES,
  JEWELRY_BUILD_UNLOCK_THRESHOLD_MONTHS,
  type JewelryBuildSessionKey,
} from "@/lib/guided-journeys/jewelry-build";
import {
  JEWELRY_VISION_CATEGORY,
  JEWELRY_VISION_JOURNEY_ID,
  JEWELRY_VISION_SESSIONS,
} from "@/lib/guided-journeys/jewelry-vision";
import { useJewelryBuildLauncher } from "@/stores/jewelry-build-launcher";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";

const SESSION_COUNT = JEWELRY_BUILD_SESSIONS.length;

export function JewelryBuildLauncherBanner({
  categoryId,
  sessionKey,
}: {
  categoryId: string;
  sessionKey: JewelryBuildSessionKey;
}) {
  const open = useJewelryBuildLauncher((s) => s.open);
  const monthsUntil = useMonthsUntilWedding();

  const isLocked =
    monthsUntil != null && monthsUntil > JEWELRY_BUILD_UNLOCK_THRESHOLD_MONTHS;
  const tooltip = isLocked
    ? `Jewelry build unlocks ${JEWELRY_BUILD_UNLOCK_THRESHOLD_MONTHS} months before your event. Custom kundan and polki sets need 8–12 weeks plus shipping — earlier than that and you don't know what to commission yet.`
    : undefined;

  const visionComplete = useVisionJourneyComplete();
  const buildState = useBuildJourneyState();
  const isOnFirstSession = sessionKey === "bridal_inventory";

  const showSmartResume =
    isOnFirstSession &&
    visionComplete &&
    buildState.completedCount === 0 &&
    buildState.touchedCount === 0;

  // Hide Build CTAs entirely if Vision is incomplete.
  if (!visionComplete) return null;

  return (
    <div className="space-y-3">
      {showSmartResume && (
        <SmartResumePrompt onLaunch={() => open(categoryId, sessionKey)} />
      )}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3",
          "border-gold/30 bg-gold-soft/20",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold-soft/70 text-gold">
            <Sparkles size={14} strokeWidth={1.8} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
              Jewelry build journey
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">
              {buildState.completedCount > 0
                ? `${buildState.completedCount} of ${SESSION_COUNT} sessions complete — pick up where you left off.`
                : "Inventory, heirlooms, fittings, custody — four short sessions."}
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
                ? "border border-border bg-white text-ink-muted hover:border-gold/40"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            {isLocked && <Clock size={12} strokeWidth={1.8} />}
            Build with us
            <ArrowRight size={12} strokeWidth={2} />
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75">
              {SESSION_COUNT} sessions · ~{JEWELRY_BUILD_TOTAL_MINUTES} min
            </span>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            or fill it in yourself · full workspace below
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Smart resume prompt ─────────────────────────────────────────────────

function SmartResumePrompt({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose/30 bg-rose-pale/30 px-4 py-3">
      <p className="text-[13px] leading-snug text-ink">
        Your jewelry direction is locked.{" "}
        <span className="text-ink-muted">Ready to track every piece?</span>
      </p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-rose/90"
      >
        Start build journey
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
    JEWELRY_VISION_CATEGORY,
    JEWELRY_VISION_JOURNEY_ID,
  );
  return JEWELRY_VISION_SESSIONS.every(
    (s) =>
      (state.sessionStatus[s.key] as GuidedSessionStatus | undefined) ===
      "completed",
  );
}

function useBuildJourneyState(): {
  completedCount: number;
  touchedCount: number;
} {
  const [state] = useCategoryJourneyState(
    JEWELRY_BUILD_CATEGORY,
    JEWELRY_BUILD_JOURNEY_ID,
  );
  let completedCount = 0;
  let touchedCount = 0;
  for (const session of JEWELRY_BUILD_SESSIONS) {
    const status = state.sessionStatus[session.key];
    if (status === "completed") completedCount += 1;
    if (status === "in_progress" || status === "completed") touchedCount += 1;
  }
  return { completedCount, touchedCount };
}
