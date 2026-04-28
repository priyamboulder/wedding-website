"use client";

// ── Videography workspace shell ───────────────────────────────────────────
// Mirrors the Photography canvas structure (header · tabs · body · upcoming
// strip · vendor preview), but tuned for Videography: 6 tabs, Film icon,
// and a different subline phrasing.
//
// Why a bespoke shell: Videography plans a continuous narrative arc, not
// discrete shots — the tabs have bespoke layouts (Film Vision's per-event
// cards, Audio & Coverage's mic plan + camera positions) that don't map
// onto the generic WorkspaceCanvas wrapper.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Film, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import { STATUS_DOT, STATUS_LABEL } from "@/types/workspace";
import {
  VIDEOGRAPHY_TABS,
  type VideoTabId,
} from "@/lib/workspace/category-tabs";
import { RoleSwitcher } from "@/components/workspace/photography/RoleSwitcher";
import { UndoToastHost } from "@/components/workspace/editable/UndoToast";
import { VisionMoodTab } from "./tabs/VisionMoodTab";
import { ShortlistContractTab } from "./tabs/ShortlistContractTab";
import { FilmVisionTab } from "./tabs/FilmVisionTab";
import { AudioCoverageTab } from "./tabs/AudioCoverageTab";
import { DeliverablesTab } from "./tabs/DeliverablesTab";
import { DayOfCoverageTab } from "./tabs/DayOfCoverageTab";

export function VideographyCanvas({ category }: { category: WorkspaceCategory }) {
  const [activeTab, setActiveTab] = useState<VideoTabId>(VIDEOGRAPHY_TABS[0]!.id);
  const vendors = useVendorsStore((s) => s.vendors);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const assignedVendor = category.assigned_vendor_id
    ? vendors.find((v) => v.id === category.assigned_vendor_id)
    : null;

  const isVendorView = currentRole === "vendor";

  let subline = STATUS_LABEL[category.status];
  if (category.status === "assigned" && assignedVendor) {
    subline = `Assigned — ${assignedVendor.name}`;
  } else if (category.status === "shortlisted") {
    subline = "Shortlisted — options being compared";
  } else if (category.status === "open") {
    subline = "Not started — tell us the story you want to tell";
  }

  const visibleTabs = useMemo(
    () =>
      isVendorView
        ? VIDEOGRAPHY_TABS.filter((t) => !t.hideFromVendor)
        : VIDEOGRAPHY_TABS,
    [isVendorView],
  );

  useEffect(() => {
    if (isVendorView && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? VIDEOGRAPHY_TABS[0]!.id);
    }
  }, [isVendorView, activeTab, visibleTabs]);

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  STATUS_DOT[category.status],
                )}
                aria-hidden
              />
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Workspace · Videography
              </p>
            </div>
            <h1 className="mt-1.5 flex items-center gap-2.5 font-serif text-[30px] leading-[1.1] text-ink">
              <Film size={26} strokeWidth={1.5} className="text-ink-muted" />
              {category.name}
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-muted">{subline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isVendorView && category.status !== "open" && (
              <ActionButton
                icon={<Send size={13} strokeWidth={1.8} />}
                label="Invite vendor"
              />
            )}
            <RoleSwitcher />
          </div>
        </div>

        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label="Videography workspace sections"
        >
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as VideoTabId)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {isVendorView && (
        <div
          className="flex items-center gap-2 border-b border-gold/25 bg-gold-light/15 px-10 py-2.5"
          role="status"
        >
          <Eye size={13} strokeWidth={1.8} className="text-ink-muted" />
          <p className="text-[12px] text-ink">
            Previewing as <span className="font-medium">vendor</span>.
            <span className="text-ink-muted">
              {" "}
              Budgets, the shortlist, and couple-internal state are hidden.
            </span>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === "vision" && <VisionMoodTab category={category} />}
          {activeTab === "shortlist_contract" && !isVendorView && (
            <ShortlistContractTab category={category} />
          )}
          {activeTab === "film_vision" && <FilmVisionTab category={category} />}
          {activeTab === "audio_coverage" && <AudioCoverageTab category={category} />}
          {activeTab === "deliverables" && <DeliverablesTab category={category} />}
          {activeTab === "day_of" && <DayOfCoverageTab category={category} />}
        </div>
      </div>

      <UndoToastHost />
    </main>
  );
}

function ActionButton({
  icon,
  label,
  primary = false,
}: {
  icon: ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        primary
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
