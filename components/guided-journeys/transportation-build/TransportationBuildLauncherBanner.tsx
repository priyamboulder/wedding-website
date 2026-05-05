"use client";

// ── Transportation Build launcher banner ──────────────────────────────────
// Renders at the top of Tabs 1, 2, and 3 of the Transportation workspace.
// Two CTAs:
//   1. "Build with us" — opens the journey at the appropriate session
//      (Session 3 from Tab 1, Session 1 from Tab 2, Session 2 from Tab 3)
//   2. "I'll fill it in myself" — passive label.
//
// Time gate: when months_until_event > 4, the primary CTA is rendered in
// a muted state with a tooltip. Click is still allowed.
//
// Smart resume: when on Tab 1 AND Vision is complete AND Build is
// not_started, surfaces the soft prompt described in the build prompt.

import { useMemo } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  TRANSPORTATION_BUILD_CATEGORY,
  TRANSPORTATION_BUILD_JOURNEY_ID,
  TRANSPORTATION_BUILD_SESSIONS,
  TRANSPORTATION_BUILD_TOTAL_MINUTES,
  TRANSPORTATION_BUILD_UNLOCK_THRESHOLD_MONTHS,
  type TransportationBuildSessionKey,
} from "@/lib/guided-journeys/transportation-build";
import { useTransportationBuildLauncher } from "@/stores/transportation-build-launcher";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";

const SESSION_COUNT = TRANSPORTATION_BUILD_SESSIONS.length;

export function TransportationBuildLauncherBanner({
  categoryId,
  sessionKey,
}: {
  categoryId: string;
  sessionKey: TransportationBuildSessionKey;
}) {
  const open = useTransportationBuildLauncher((s) => s.open);
  const monthsUntil = useMonthsUntilWedding();

  const isLocked =
    monthsUntil != null &&
    monthsUntil > TRANSPORTATION_BUILD_UNLOCK_THRESHOLD_MONTHS;
  const tooltip = isLocked
    ? `Transport build unlocks ${TRANSPORTATION_BUILD_UNLOCK_THRESHOLD_MONTHS} months before your event. Police escort permits, premium horse vendors, and shuttle contracts typically need 60–90 days — earlier than that and you don't know your final guest count yet.`
    : undefined;

  const visionComplete = useVisionJourneyComplete();
  const buildState = useBuildJourneyState();
  const isOnFirstSession = sessionKey === "fleet_roster"; // Tab 1 entry — smart resume

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
              Transportation build journey
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">
              {buildState.completedCount > 0
                ? `${buildState.completedCount} of ${SESSION_COUNT} sessions complete — pick up where you left off.`
                : "Baraat, shuttle math, fleet roster — three short sessions."}
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
              {SESSION_COUNT} sessions · ~{TRANSPORTATION_BUILD_TOTAL_MINUTES}{" "}
              min
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
        Your transport vision is locked.{" "}
        <span className="text-ink-muted">Ready to plan the routes?</span>
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
    return (
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth())
    );
  }, [dateStr]);
}

function useVisionJourneyComplete(): boolean {
  const [state] = useCategoryJourneyState(TRANSPORTATION_BUILD_CATEGORY);
  const visionSessions = CATEGORY_SCHEMAS.transportation.sessions;
  return visionSessions.every(
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
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );
  let completedCount = 0;
  let touchedCount = 0;
  for (const session of TRANSPORTATION_BUILD_SESSIONS) {
    const status = state.sessionStatus[session.key];
    if (status === "completed") completedCount += 1;
    if (status === "in_progress" || status === "completed") touchedCount += 1;
  }
  return { completedCount, touchedCount };
}
