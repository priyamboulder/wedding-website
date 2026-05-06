"use client";

// ── Venue Build · Dual CTA + Smart-resume nudge ─────────────────────────────
// Mounts at the top of every Venue workspace tab that has a Build entry
// point (Spaces & Layout, Rules & Restrictions, Logistics Hub, Contacts &
// Emergency). Wraps the shared BuildJourneyDualCTA from
// components/guided-journeys/BuildJourneyDualCTA.tsx — same visual pattern
// as Officiant + Wardrobe, retargeted to the venue:build journey.
//
// Behaviour:
//   • Build CTA opens an inline VenueBuildShell at the requested starting
//     session (deep-link).
//   • Manual CTA dismisses the shell.
//   • Gate: `venue_booked` rule — muted when no shortlist venue has
//     status === "booked". Soft (still clickable for preview).
//   • Vision-completion check: must have a venue brief saved (the venue
//     workspace's Vision flow approves the brief into venue-store).

import { useEffect, useState } from "react";
import {
  BuildJourneyDualCTA,
  BuildSmartResumeNudge,
} from "@/components/guided-journeys/BuildJourneyDualCTA";
import { useUnlockEvaluation } from "@/lib/guided-journeys/unlock-rules";
import { useVenueStore } from "@/stores/venue-store";
import { useVenueBuildLauncher } from "@/stores/venue-build-launcher";
import { EXTRA_JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import {
  VENUE_BUILD_SESSIONS,
  type VenueBuildSessionKey,
} from "@/lib/guided-journeys/venue-build";
import {
  VenueBuildShell,
  useVenueBuildJourney,
} from "./VenueBuildShell";

const TOOLTIP_LOCKED =
  "Spaces & rules pull from your venue contract — unlocks once you've moved a venue to Booked on the shortlist.";

// Vision is "complete" for Venue when the couple has approved the
// generated brief. Tracked by venue-store.discovery.coupleApprovedBrief
// (set in the Vision flow's brief approval step).
function useVenueVisionComplete(): boolean {
  return useVenueStore((s) => s.discovery.couple_approved_brief);
}

export interface VenueBuildDualCTAProps {
  startAtSession: VenueBuildSessionKey;
  guidedHeading?: string;
  guidedSubheading?: string;
}

export function VenueBuildDualCTA({
  startAtSession,
  guidedHeading,
  guidedSubheading,
}: VenueBuildDualCTAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unlock = useUnlockEvaluation("venue:build");
  const visionComplete = useVenueVisionComplete();
  const intro = EXTRA_JOURNEY_INTROS["venue:build"];

  // Cross-tab deep-link: when the smart-resume nudge (or any other surface)
  // sets activeSessionKey on the launcher store, self-open and route to it.
  // We only respond to sessions our `startAtSession` plausibly hosts — the
  // first session of the journey, since each Build dual-CTA "owns" deep-
  // linking to its tab's natural starting point. The shell handles
  // intra-journey navigation after that.
  const launcherSession = useVenueBuildLauncher((s) => s.activeSessionKey);
  const closeLauncher = useVenueBuildLauncher((s) => s.close);
  useEffect(() => {
    if (launcherSession === startAtSession && !isOpen) {
      setIsOpen(true);
    }
  }, [launcherSession, startAtSession, isOpen]);

  const subtext =
    guidedSubheading ?? `${VENUE_BUILD_SESSIONS.length} sessions · ~${intro.totalMinutes} min`;

  return (
    <BuildJourneyDualCTA
      journeyKey="venue:build"
      guidedHeading={guidedHeading ?? "Build with us"}
      guidedSubheading={subtext}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => {
        setIsOpen(false);
        // Clear the launcher so a stale activeSessionKey doesn't re-open
        // the shell on the user's next tab visit.
        if (launcherSession) closeLauncher();
      }}
      isVisionComplete={visionComplete}
      visionPathHref="/app/venue?tab=vision"
      visionLabel="venue brief"
      unlockEvaluation={unlock}
      lockedTooltipOverride={TOOLTIP_LOCKED}
      shellSlot={
        <VenueBuildShell
          startAtSession={launcherSession ?? startAtSession}
          onClose={() => {
            setIsOpen(false);
            if (launcherSession) closeLauncher();
          }}
        />
      }
    />
  );
}

// ── Smart-resume nudge ─────────────────────────────────────────────────────
// Surfaced at the top of Tab 1 (Vision) once the brief is approved, a venue
// is booked, and Build hasn't been started yet. Composes the shared
// BuildSmartResumeNudge for visual consistency.

export function VenueBuildSmartResumeNudge({
  onNavigateToSpacesTab,
}: {
  /**
   * Called with the venue tab id the launcher wants to switch to. Caller
   * is the Dream & Discover tab body, which receives `setActiveTab` from
   * VenueCanvas and bridges that callback through. Without this prop the
   * nudge still flips the launcher state, but it's up to the user to
   * navigate manually.
   */
  onNavigateToSpacesTab?: (tabId: "spaces_flow") => void;
}) {
  const visionComplete = useVenueVisionComplete();
  const unlock = useUnlockEvaluation("venue:build");
  const sessionStatus = useVenueBuildJourney((s) => s.sessionStatus);
  const openLauncher = useVenueBuildLauncher((s) => s.open);
  const buildNotStarted = VENUE_BUILD_SESSIONS.every(
    (s) => (sessionStatus[s.key] ?? "not_started") === "not_started",
  );

  const visible = visionComplete && unlock.unlocked && buildNotStarted;

  return (
    <BuildSmartResumeNudge
      visible={visible}
      headline="Your venue is booked."
      prompt="Ready to lock the spaces and capture every rule?"
      onLaunch={() => {
        // Open the journey at session 1; the dual-CTA on Spaces & Flow
        // will pick up activeSessionKey on render and self-expand the
        // shell. Then switch tabs so the user lands on the open shell.
        openLauncher("spaces_and_layout");
        onNavigateToSpacesTab?.("spaces_flow");
      }}
    />
  );
}
