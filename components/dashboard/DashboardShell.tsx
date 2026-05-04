"use client";

import { TopNav } from "@/components/shell/TopNav";
import { DashboardOpener } from "./DashboardOpener";
import { ShaadiSeasonCountdown } from "./ShaadiSeasonCountdown";
import { BriefRecap } from "./BriefRecap";
import { NextMoves } from "./NextMoves";
import { DashboardFlags } from "./DashboardFlags";
import { EventThemesStrip } from "./EventThemesStrip";
import { PortfolioMosaic } from "./PortfolioMosaic";
import { GuestsSummaryCard } from "./GuestsSummaryCard";
import { ChecklistSummaryCard } from "./ChecklistSummaryCard";
import { RegistrySummaryCard } from "./RegistrySummaryCard";
import { StudioSummaryCard } from "./StudioSummaryCard";

export function DashboardShell() {
  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-[1080px] px-8 py-12">
          <DashboardOpener />
          <ShaadiSeasonCountdown />
          <BriefRecap />
          <NextMoves />
          <DashboardFlags />

          {/* Planning tools overview — Guests · Checklist · Registry · Studio */}
          <section className="mt-12">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Planning tools
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <GuestsSummaryCard />
              <ChecklistSummaryCard />
              <RegistrySummaryCard />
              <StudioSummaryCard />
            </div>
          </section>

          <EventThemesStrip />
          <PortfolioMosaic />
        </div>
      </main>
    </div>
  );
}
