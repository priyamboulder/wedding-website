"use client";

// ── YourToolsTabs ───────────────────────────────────────────────────────
// Bottom tabbed section that houses the dashboard's "valuable but not
// daily-use" features: Decisions, Playlist, Journal. They're one tap
// away but don't consume vertical scroll space on the main canvas.
// Default tab is Decisions (most likely to have new content).

import { useState, type ComponentType } from "react";
import { ListChecks, Music2, ImageIcon } from "lucide-react";
import { CouplePlaylist } from "./CouplePlaylist";
import { DecisionTracker } from "./DecisionTracker";
import { PlanningJournal } from "./PlanningJournal";
import { cn } from "@/lib/utils";

type TabId = "decisions" | "playlist" | "journal";

interface TabDef {
  id: TabId;
  label: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  Component: ComponentType;
}

const TABS: TabDef[] = [
  { id: "decisions", label: "Decisions", Icon: ListChecks, Component: DecisionTracker },
  { id: "playlist", label: "Playlist", Icon: Music2, Component: CouplePlaylist },
  { id: "journal", label: "Journal", Icon: ImageIcon, Component: PlanningJournal },
];

export function YourToolsTabs() {
  const [active, setActive] = useState<TabId>("decisions");
  const ActiveComponent = TABS.find((t) => t.id === active)?.Component ?? DecisionTracker;

  return (
    <section aria-label="Your tools">
      <div className="mb-4">
        <h2 className="dash-spread-title">
          Your <em>tools</em>
        </h2>
        <p className="dash-spread-sub">
          One tap away — pick a tab to capture a decision, a song, or a photo.
        </p>
      </div>

      <div
        className="mb-5 flex items-center gap-1 border-b border-[color:var(--dash-blush-soft)]"
        role="tablist"
        aria-label="Your tools"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-2 text-[13px] transition-colors",
                isActive
                  ? "text-[color:var(--dash-text)]"
                  : "text-[color:var(--dash-text-muted)] hover:text-[color:var(--dash-text)]",
              )}
              style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
            >
              <tab.Icon size={13} strokeWidth={1.8} />
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[color:var(--dash-blush)]"
                />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        <ActiveComponent />
      </div>
    </section>
  );
}
