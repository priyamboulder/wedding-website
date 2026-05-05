"use client";

// ── Logistics journey launcher banner ────────────────────────────────────
// Renders at the top of Tabs 2/3/4 of the Mehendi workspace. Two CTAs:
//   1. "Guide me through logistics" — opens the journey at the appropriate
//      session (Session 1 from Tab 2, Session 2 from Tab 3, Session 3 from
//      Tab 4).
//   2. "I'll fill it in myself" — passive (the user already is filling it
//      in by being on this tab). Renders as a non-button label.
//
// Time gate: when months_until_event > 4, the primary CTA is rendered in
// a muted state with a tooltip. Click is still allowed.
//
// Smart resume: when Tab 2 is the active tab AND Vision is complete AND
// Logistics is not_started, surfaces the soft prompt described in §4.

import { useMemo } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  MEHENDI_LOGISTICS_CATEGORY,
  MEHENDI_LOGISTICS_JOURNEY_ID,
  MEHENDI_LOGISTICS_SESSIONS,
  MEHENDI_LOGISTICS_TOTAL_MINUTES,
  type LogisticsSessionKey,
} from "@/lib/guided-journeys/mehendi-logistics";
import { useMehendiLogisticsLauncher } from "@/stores/mehndi-logistics-launcher";
import {
  DEFAULT_JOURNEY_ID,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";

const SESSION_COUNT = MEHENDI_LOGISTICS_SESSIONS.length;
const UNLOCKS_AT_MONTHS = 4;

export function LogisticsLauncherBanner({
  categoryId,
  sessionKey,
}: {
  categoryId: string;
  sessionKey: LogisticsSessionKey;
}) {
  const open = useMehendiLogisticsLauncher((s) => s.open);
  const monthsUntil = useMonthsUntilWedding();

  const isLocked = monthsUntil != null && monthsUntil > UNLOCKS_AT_MONTHS;
  const tooltip = isLocked
    ? `Logistics planning unlocks ${UNLOCKS_AT_MONTHS} months before your event. Locking in vision first.`
    : undefined;

  const visionComplete = useVisionJourneyComplete();
  const logisticsState = useLogisticsJourneyState();
  const isOnFirstSession = sessionKey === "tiers_and_capacity";

  const showSmartResume =
    isOnFirstSession &&
    visionComplete &&
    logisticsState.completedCount === 0 &&
    logisticsState.touchedCount === 0;

  return (
    <div className="space-y-3">
      {showSmartResume && (
        <SmartResumePrompt
          onLaunch={() => open(categoryId, sessionKey)}
        />
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
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">
              Mehendi logistics journey
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">
              {logisticsState.completedCount > 0
                ? `${logisticsState.completedCount} of ${SESSION_COUNT} sessions complete — pick up where you left off.`
                : "We'll guide you through tiers, contract, and day-of flow in three short sessions."}
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
            Guide me through logistics
            <ArrowRight size={12} strokeWidth={2} />
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75">
              {SESSION_COUNT} sessions · ~{MEHENDI_LOGISTICS_TOTAL_MINUTES} min
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
        Your mehendi vision is locked in.{" "}
        <span className="text-ink-muted">Ready to plan logistics?</span>
      </p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-rose/90"
      >
        Start logistics journey
        <ArrowRight size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Hooks: months-until + journey progress ──────────────────────────────

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
    MEHENDI_LOGISTICS_CATEGORY,
    DEFAULT_JOURNEY_ID,
  );
  // Vision is the 3-session default journey. All three must be completed.
  const required = ["mehendi_style", "guest_mehendi", "mehendi_brief"];
  return required.every(
    (key) =>
      (state.sessionStatus[key] as GuidedSessionStatus | undefined) ===
      "completed",
  );
}

function useLogisticsJourneyState(): {
  completedCount: number;
  touchedCount: number;
} {
  const [state] = useCategoryJourneyState(
    MEHENDI_LOGISTICS_CATEGORY,
    MEHENDI_LOGISTICS_JOURNEY_ID,
  );
  let completedCount = 0;
  let touchedCount = 0;
  for (const session of MEHENDI_LOGISTICS_SESSIONS) {
    const status = state.sessionStatus[session.key];
    if (status === "completed") completedCount += 1;
    if (status === "in_progress" || status === "completed") touchedCount += 1;
  }
  return { completedCount, touchedCount };
}
