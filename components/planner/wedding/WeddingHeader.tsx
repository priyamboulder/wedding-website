"use client";

import Link from "next/link";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import type { WeddingDetail } from "@/lib/planner/wedding-detail-seed";

const SUB_TABS = [
  { key: "vendors", label: "Vendors" },
  { key: "timeline", label: "Timeline" },
  { key: "budget", label: "Budget" },
  { key: "guests", label: "Guests" },
  { key: "tasks", label: "Tasks" },
  { key: "messages", label: "Messages" },
] as const;

export type WeddingSubTab = (typeof SUB_TABS)[number]["key"];

export function WeddingHeader({
  wedding,
  bookedCount,
  totalCount,
  activeTab = "vendors",
  onTabChange,
}: {
  wedding: WeddingDetail;
  bookedCount: number;
  totalCount: number;
  activeTab?: WeddingSubTab;
  onTabChange?: (tab: WeddingSubTab) => void;
}) {
  return (
    <header
      className="sticky top-[64px] z-20 border-b"
      style={{
        backgroundColor: "rgba(250, 248, 245, 0.94)",
        borderColor: PLANNER_PALETTE.hairline,
        backdropFilter: "saturate(140%) blur(10px)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-8 pb-0 pt-6">
        <Link
          href="/planner/weddings"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9E8245] hover:text-[#C4A265]"
        >
          ← All Weddings
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-[46px] leading-[1.02] text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.012em",
              }}
            >
              {wedding.coupleNames}
            </h1>
            <p className="mt-2 text-[13.5px] text-[#5a5a5a]">
              <span className="text-[#2C2C2C]">{wedding.weddingDates}</span>
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {wedding.venue}
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {wedding.location}
              {wedding.destination && (
                <span
                  className="ml-3 inline-flex items-center gap-1 rounded-full px-2 py-[2px] align-middle text-[10px] font-medium uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: "#FDF1E3",
                    color: "#8a5a20",
                    boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
                  }}
                >
                  <span aria-hidden>✈</span>
                  Destination
                </span>
              )}
            </p>
            <p className="mt-2 text-[12.5px] text-[#6a6a6a]">
              <span className="font-mono text-[11.5px] tracking-wider text-[#2C2C2C]">
                {wedding.guestCount}
              </span>
              <span className="ml-1">guests</span>
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              <span className="text-[#2C2C2C]">{wedding.budgetRangeLabel}</span>
              <span className="ml-1">budget</span>
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {wedding.events.join(" · ")}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Vendor team
            </p>
            <p
              className="mt-1 text-[26px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {bookedCount}
              <span className="text-[#b5a68e]"> / </span>
              {totalCount}
            </p>
            <p className="mt-1 text-[11.5px] italic text-[#8a8a8a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              booked
            </p>
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto">
          {SUB_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className="relative shrink-0 px-3.5 py-3 text-[13px] transition-colors"
                style={{
                  color: isActive ? "#2C2C2C" : "#5a5a5a",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                    style={{ backgroundColor: PLANNER_PALETTE.gold }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
