"use client";

// ── DashboardShell ──────────────────────────────────────────────────────
// Two-zone scrolling layout: a main column of stacked sections (couple
// identity → Start Here → events → brief → notepad → journal) and a
// sticky right-side POCKET sidebar (planning pulse + toolkit + quick
// actions). White canvas, rose-tinted (#F5ECEA) cards, dusty-blush
// accents, gold for foil rules and the monogram.
//
// On mobile (<lg) the pocket collapses inline beneath the journal so
// every zone stays reachable in a single column flow.
//
// Imperative handles on YourEvents, Notepad, and PlanningJournal let
// StartHere and QuickActions trigger primary actions (open add-event
// modal, focus notepad input, open photo uploader) without prop-
// drilling through the section tree.

import { TopNav } from "@/components/shell/TopNav";
import { CoupleIdentity } from "./CoupleIdentity";
import { DailyCheckIn } from "./DailyCheckIn";
import { GuestPreview } from "./GuestPreview";
import { LetterToFutureSelves } from "./LetterToFutureSelves";
import { MilestoneMarker } from "./MilestoneMarker";
import { WeeklyDigest } from "./WeeklyDigest";
import { YearInReviewCta } from "./YearInReviewCta";
import { Journey } from "./Journey";
import { YourEvents } from "./YourEvents";
import { EditableBrief } from "./EditableBrief";
import { Notepad } from "./Notepad";
import { PlanningPulse } from "./PlanningPulse";
import { PlanningToolkit } from "./PlanningToolkit";
import { QuickActions } from "./QuickActions";
import { VendorChemistryMatch } from "./VendorChemistryMatch";
import { YourToolsTabs } from "./YourToolsTabs";

export function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--dash-canvas)]">
      <TopNav />
      <main className="dash-root flex-1 px-5 py-10 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          {/* ── Main column ─────────────────────────────────────── */}
          <div
            className="flex min-w-0 flex-col text-left"
            style={{ rowGap: "var(--dash-section-gap)" }}
          >
            <CoupleIdentity />
            <DailyCheckIn />
            <WeeklyDigest />
            <MilestoneMarker />
            <LetterToFutureSelves />
            <Journey />
            <YourEvents />
            <VendorChemistryMatch />
            <EditableBrief />
            <YearInReviewCta />
            <Notepad />
            <YourToolsTabs />
          </div>

          {/* ── Sidebar pocket ──────────────────────────────────── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="dash-pocket flex flex-col gap-5">
              <PlanningPulse />
              <div className="dash-rule-gold" />
              <PlanningToolkit />
              <div className="dash-rule-gold" />
              <GuestPreview />
              <div className="dash-rule-gold" />
              <QuickActions />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
