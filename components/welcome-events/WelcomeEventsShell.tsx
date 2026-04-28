"use client";

// ── Welcome Events shell ───────────────────────────────────────────────────
// TopNav + editorial header + five-tab canvas. Uses the same TopNav as the
// rest of the app so navigation stays unified; the memories-and-keepsakes
// section lives off the main nav because it's not a vendor workspace.

import { useState } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import { cn } from "@/lib/utils";
import { PlanDetailsTab } from "./tabs/PlanDetailsTab";
import { GuestListTab } from "./tabs/GuestListTab";
import { MenuSetupTab } from "./tabs/MenuSetupTab";
import { CommunicationsTab } from "./tabs/CommunicationsTab";
import { DocumentsTab } from "./tabs/DocumentsTab";

type TabId =
  | "plan"
  | "guests"
  | "menu"
  | "communications"
  | "documents";

const TABS: { id: TabId; label: string }[] = [
  { id: "plan", label: "Plan & Details" },
  { id: "guests", label: "Guest List" },
  { id: "menu", label: "Menu & Setup" },
  { id: "communications", label: "Communications" },
  { id: "documents", label: "Documents" },
];

export function WelcomeEventsShell() {
  const [active, setActive] = useState<TabId>("plan");
  const basics = useWelcomeEventsStore((s) => s.basics);

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-[1080px] px-8 pt-10">
          <header>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Memories & Keepsakes · Welcome Events
            </div>
            <h1
              className="mt-2 font-serif text-[40px] leading-[1.05] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {basics.name || "Welcome Event"}
            </h1>
            <p className="mt-2 max-w-2xl font-serif text-[17px] italic leading-snug text-ink-soft">
              {editorialLine(basics)}
            </p>
          </header>

          <nav
            className="mt-10 flex flex-wrap items-center gap-1 border-b border-ink/10"
            aria-label="Welcome Events tabs"
          >
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "text-ink"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute inset-x-2 bottom-[-1px] h-[2px] bg-gold" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="pb-20">
            {active === "plan" ? <PlanDetailsTab /> : null}
            {active === "guests" ? <GuestListTab /> : null}
            {active === "menu" ? <MenuSetupTab /> : null}
            {active === "communications" ? <CommunicationsTab /> : null}
            {active === "documents" ? <DocumentsTab /> : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function editorialLine(basics: {
  date: string;
  location: string;
  guestCount: number;
}): string {
  const parts: string[] = [];
  if (basics.date) parts.push(basics.date);
  if (basics.location) parts.push(basics.location);
  if (basics.guestCount > 0) parts.push(`${basics.guestCount} guests`);
  if (parts.length === 0) return "A casual gathering before the festivities.";
  return parts.join(" · ");
}
