"use client";

import { TopNav } from "@/components/shell/TopNav";
import { DashboardOpener } from "./DashboardOpener";
import { BriefRecap } from "./BriefRecap";
import { NextMoves } from "./NextMoves";
import { DashboardFlags } from "./DashboardFlags";
import { EventThemesStrip } from "./EventThemesStrip";
import { PortfolioMosaic } from "./PortfolioMosaic";
import { GuestsSummaryCard } from "./GuestsSummaryCard";
import { ChecklistSummaryCard } from "./ChecklistSummaryCard";
import { RegistrySummaryCard } from "./RegistrySummaryCard";
import { StudioSummaryCard } from "./StudioSummaryCard";
import { MarigoldTipStrip, CHECKLIST_TIPS } from "./MarigoldTipStrip";

export function DashboardShell() {
  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-[1080px] px-8 py-12">
          <DashboardOpener />
          <BriefRecap />
          <NextMoves />
          <DashboardFlags />

          {/* Planning tools overview — Guests · Checklist · Registry · Studio */}
          <section className="mt-16">
            <p className="playcard-label">Planning tools</p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2" style={{ paddingTop: 8 }}>
              <GuestsSummaryCard />
              <ChecklistSummaryCard />
              <RegistrySummaryCard />
              <StudioSummaryCard />
            </div>
          </section>

          <MarigoldTipStrip tips={CHECKLIST_TIPS} />

          <EventThemesStrip />
          <PortfolioMosaic />
        </div>
      </main>
    </div>
  );
}
