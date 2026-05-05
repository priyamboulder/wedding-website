"use client";

// ── Sweets Selection journey launcher banner ──────────────────────────────
// Renders at the top of Tabs 3/4/5/6 of the Cake & Sweets workspace. Two
// CTAs:
//   1. "Design with us"  — opens the journey at the appropriate session
//      (Tab 3 → Session 1, Tab 4 → Session 2, Tab 5 → Session 3, Tab 6 →
//      Session 4).
//   2. "I'll fill it in myself"  — passive (the user is already on this
//      tab). Renders as a small label.
//
// Time gate: when months_until_event > 6, the primary CTA is rendered in
// a muted state with a tooltip. Click is still allowed (soft gate).
//
// Smart resume: when on Tab 3 AND Vision is complete AND Selection has
// not been touched, surfaces the soft prompt described in §4 of the build
// spec.
//
// Vision-incomplete branch: hides Selection CTAs entirely and surfaces a
// small note pointing the couple back to Vision first.

import { useMemo } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  SWEETS_SELECTION_CATEGORY,
  SWEETS_SELECTION_JOURNEY_ID,
  SWEETS_SELECTION_SESSIONS,
  SWEETS_SELECTION_TOTAL_MINUTES,
  type SweetsSelectionSessionKey,
} from "@/lib/guided-journeys/sweets-selection";
import { useSweetsSelectionLauncher } from "@/stores/sweets-selection-launcher";
import {
  DEFAULT_JOURNEY_ID,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";

const SESSION_COUNT = SWEETS_SELECTION_SESSIONS.length;
const UNLOCKS_AT_MONTHS = 6;

const VISION_REQUIRED_SESSIONS = [
  "sweets_vision",
  "sweets_inspiration",
  "sweets_brief",
];

export function SelectionLauncherBanner({
  categoryId,
  sessionKey,
}: {
  categoryId: string;
  sessionKey: SweetsSelectionSessionKey;
}) {
  const open = useSweetsSelectionLauncher((s) => s.open);
  const monthsUntil = useMonthsUntilWedding();

  const isLocked = monthsUntil != null && monthsUntil > UNLOCKS_AT_MONTHS;
  const tooltip = isLocked
    ? `Selection unlocks ${UNLOCKS_AT_MONTHS} months before your event. Locking in vision first.`
    : undefined;

  const visionComplete = useVisionJourneyComplete();
  const selectionState = useSelectionJourneyState();
  const isOnFirstSession = sessionKey === "cake_design";

  // Vision-incomplete branch — hide Selection CTAs entirely.
  if (!visionComplete) {
    return (
      <div className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your dessert vision first — Selection picks up where Vision
          leaves off. Head over to the Vision &amp; Mood tab.
        </p>
      </div>
    );
  }

  const showSmartResume =
    isOnFirstSession &&
    visionComplete &&
    selectionState.completedCount === 0 &&
    selectionState.touchedCount === 0;

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
              Sweets selection journey
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">
              {selectionState.completedCount > 0
                ? `${selectionState.completedCount} of ${SESSION_COUNT} sessions complete — pick up where you left off.`
                : "We'll guide you through cake, mithai, dessert tables, and service in four short sessions."}
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
            Design with us
            <ArrowRight size={12} strokeWidth={2} />
            <span
              className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {SESSION_COUNT} sessions · ~{SWEETS_SELECTION_TOTAL_MINUTES} min
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
    </div>
  );
}

// ─── Smart resume prompt ─────────────────────────────────────────────────

function SmartResumePrompt({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose/30 bg-rose-pale/30 px-4 py-3">
      <p className="text-[13px] leading-snug text-ink">
        Your dessert vision is locked.{" "}
        <span className="text-ink-muted">
          Ready to pick the actual desserts?
        </span>
      </p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-rose/90"
      >
        Start selection
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
    SWEETS_SELECTION_CATEGORY,
    DEFAULT_JOURNEY_ID,
  );
  return VISION_REQUIRED_SESSIONS.every(
    (key) =>
      (state.sessionStatus[key] as GuidedSessionStatus | undefined) ===
      "completed",
  );
}

function useSelectionJourneyState(): {
  completedCount: number;
  touchedCount: number;
} {
  const [state] = useCategoryJourneyState(
    SWEETS_SELECTION_CATEGORY,
    SWEETS_SELECTION_JOURNEY_ID,
  );
  let completedCount = 0;
  let touchedCount = 0;
  for (const session of SWEETS_SELECTION_SESSIONS) {
    const status = state.sessionStatus[session.key];
    if (status === "completed") completedCount += 1;
    if (status === "in_progress" || status === "completed") touchedCount += 1;
  }
  return { completedCount, touchedCount };
}
