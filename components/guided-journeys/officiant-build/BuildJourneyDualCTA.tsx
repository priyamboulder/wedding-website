"use client";

// ── BuildJourneyDualCTA ─────────────────────────────────────────────────────
// The dual-button row that sits at the top of Tabs 1 §5 (rituals), 4
// (Family Roles), 5 (Samagri), and 6 (Ceremony Logistics) on the Officiant
// workspace. Same pattern as the Vision-vs-manual selector at the top of
// Tab 1, but pointed at Build instead.
//
// Behaviour:
//   • Build CTA opens an inline OfficiantBuildShell at the requested
//     starting session (deep-link).
//   • Manual CTA dismisses the shell — the underlying tab body renders
//     normally.
//   • Vendor-shortlist gating from lib/guided-journeys/unlock-rules.ts:
//     when no officiant has been hearted, the Build button renders muted
//     with a soft-nudge tooltip but stays clickable.
//   • If Vision is incomplete, the Build CTA is hidden entirely and
//     replaced with a small note pointing the couple back to Vision.

import { useState } from "react";
import { Sparkles, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUnlockEvaluation } from "@/lib/guided-journeys/unlock-rules";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import { buildRuntimeSessions } from "@/lib/guided-journey/runtime";
import {
  OFFICIANT_BUILD_SESSIONS,
  type OfficiantBuildSessionKey,
} from "@/lib/guided-journeys/officiant-build";
import { useOfficiantBuildJourney, OfficiantBuildShell } from "./OfficiantBuildShell";

export interface BuildJourneyDualCTAProps {
  /** Which session of the Build journey to land on when launched. */
  startAtSession: OfficiantBuildSessionKey;
  /** Heading copy override ("Build the ritual list with us", etc.) */
  guidedHeading?: string;
  /** Subheading copy override. */
  guidedSubheading?: string;
  /** Manual-mode label — defaults to "I'll fill it in myself". */
  manualLabel?: string;
}

export function BuildJourneyDualCTA({
  startAtSession,
  guidedHeading = "Build the ritual list with us",
  guidedSubheading = "4 sessions · ~15 min",
  manualLabel = "I'll fill it in myself",
}: BuildJourneyDualCTAProps) {
  const [open, setOpen] = useState(false);
  const unlock = useUnlockEvaluation("priest:build");
  const visionComplete = useVisionComplete();

  if (!visionComplete) {
    return (
      <div className="mb-6 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
        <p className="text-[12.5px] italic text-ink-muted">
          Finish your{" "}
          <Link
            href="/workspace/officiant?tab=vision"
            className="text-saffron underline-offset-2 hover:underline"
          >
            ceremony vision
          </Link>{" "}
          first — Build picks up where Vision leaves off.
        </p>
      </div>
    );
  }

  if (open) {
    return (
      <div className="-mx-2 mb-6 overflow-hidden rounded-lg border border-saffron/40">
        <OfficiantBuildShell
          startAtSession={startAtSession}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-saffron/30 bg-saffron-pale/20 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={unlock.unlocked ? undefined : unlock.tooltipWhenLocked}
        className={cn(
          "group inline-flex flex-1 min-w-[260px] items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors",
          unlock.unlocked
            ? "bg-ink text-ivory hover:bg-ink-soft"
            : "border border-border bg-white text-ink-muted hover:border-saffron/40",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            unlock.unlocked
              ? "bg-saffron/20 text-saffron"
              : "bg-ivory-warm/60 text-ink-muted",
          )}
        >
          {unlock.unlocked ? (
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
              unlock.unlocked ? "text-ivory/70" : "text-ink-faint",
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
            unlock.unlocked ? "text-ivory" : "text-ink-faint",
          )}
        />
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
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
      {!unlock.unlocked && (
        <p className="basis-full text-[11.5px] italic text-ink-muted">
          {unlock.tooltipWhenLocked}
        </p>
      )}
    </div>
  );
}

// ── Vision-completion check ────────────────────────────────────────────────
// "Vision complete" = both Vision sessions have status === "completed".
// Returns true if there's no Vision wired (defensive — Vision schema is
// always present for `priest`).

function useVisionComplete(): boolean {
  const [state] = useCategoryJourneyState("priest");
  const schema = CATEGORY_SCHEMAS["priest"];
  if (!schema) return true;
  const sessions = buildRuntimeSessions(schema, state);
  if (sessions.length === 0) return true;
  return sessions.every((s) => s.status === "completed");
}

// ── Smart-resume nudge ─────────────────────────────────────────────────────
// Surfaced at the top of Tab 1 (Vision tab) once Vision is complete, an
// officiant has been shortlisted, and Build has not been started yet. The
// component decides its own visibility — callers just drop it in.

export function SmartResumeNudge({
  onLaunch,
}: {
  onLaunch?: () => void;
}) {
  const visionComplete = useVisionComplete();
  const unlock = useUnlockEvaluation("priest:build");
  const sessionStatus = useOfficiantBuildJourney((s) => s.sessionStatus);
  const buildNotStarted = OFFICIANT_BUILD_SESSIONS.every(
    (s) => (sessionStatus[s.key] ?? "not_started") === "not_started",
  );

  if (!visionComplete || !unlock.unlocked || !buildNotStarted) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-md border border-saffron/40 bg-saffron-pale/30 px-4 py-3 text-[12.5px] text-ink">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-saffron/20 text-saffron">
        <Sparkles size={13} strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <span className="font-medium">Vision is locked.</span>{" "}
        <span className="text-ink-muted">
          Ready to build the ceremony with your pandit?
        </span>
      </div>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        Start Build <ChevronRight size={12} strokeWidth={1.8} />
      </button>
    </div>
  );
}
