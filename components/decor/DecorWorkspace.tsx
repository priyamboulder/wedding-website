"use client";

// ── Décor & Florals workspace (4-tab discovery-first rebuild) ───────────────
// Tabs: Vision & Mood · Spaces & Florals · Shortlist & Brief · Inspiration
// Operational content (install plans, contracts, documents) lives in the
// global Checklist, Vendors, and Documents modules.

import { useState } from "react";
import type { ElementType } from "react";
import { FileText, Flower2, Map, Sparkles } from "lucide-react";
import { DECOR_COLORS, FONT_DISPLAY, FONT_UI } from "./primitives";
import { VisionMoodTab } from "./tabs/VisionMoodTab";
import { SpacesFloralsTab } from "./tabs/SpacesFloralsTab";
import { ShortlistBriefTab } from "./tabs/ShortlistBriefTab";
import { InspirationTab } from "./tabs/InspirationTab";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DecorContractChecklist } from "./DecorContractChecklist";

type TabId = "vision" | "spaces" | "shortlist" | "inspiration";

const TABS: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "vision", label: "Vision & Mood", icon: Flower2 },
  { id: "spaces", label: "Spaces & Florals", icon: Map },
  { id: "shortlist", label: "Shortlist & Brief", icon: FileText },
  { id: "inspiration", label: "Inspiration", icon: Sparkles },
];

export function DecorWorkspace() {
  const [tab, setTab] = useState<TabId>("vision");

  return (
    <div
      className="flex flex-1 flex-col min-h-0"
      style={{
        backgroundColor: DECOR_COLORS.ivory,
        color: DECOR_COLORS.cocoa,
        fontFamily: FONT_UI,
      }}
    >
      {/* Workspace header */}
      <header
        className="flex flex-col gap-3 border-b px-6 md:px-10 pt-6 pb-4"
        style={{
          borderColor: DECOR_COLORS.line,
          backgroundColor: DECOR_COLORS.ivoryWarm,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: DECOR_COLORS.rose }}
          />
          <span
            className="text-[10.5px] uppercase"
            style={{
              letterSpacing: "0.28em",
              color: DECOR_COLORS.cocoaMuted,
              fontWeight: 500,
            }}
          >
            Décor & Florals
          </span>
        </div>
        <h1
          className="leading-[1.05] tracking-[-0.01em]"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
            color: DECOR_COLORS.cocoa,
            fontWeight: 400,
          }}
        >
          Art-direct your wedding{" "}
          <span style={{ fontStyle: "italic", color: DECOR_COLORS.rose }}>
            across every event.
          </span>
        </h1>

        {/* Tab bar */}
        <nav
          role="tablist"
          aria-label="Décor workspace tabs"
          className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pt-2"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: active ? DECOR_COLORS.cocoa : "transparent",
                  color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                }}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">
          {tab === "vision" && <VisionMoodTab />}
          {tab === "spaces" && <SpacesFloralsTab />}
          {tab === "shortlist" && (
            <div className="space-y-6">
              <ShortlistBriefTab />
              <DecorContractChecklistConnected />
            </div>
          )}
          {tab === "inspiration" && <InspirationTab />}
        </div>
      </main>
    </div>
  );
}

function DecorContractChecklistConnected() {
  const category = useWorkspaceStore((s) =>
    s.categories.find((c) => c.slug === "decor_florals"),
  );
  if (!category) return null;
  return <DecorContractChecklist category={category} />;
}
