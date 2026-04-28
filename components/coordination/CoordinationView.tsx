"use client";

// ── Coordination hub view ───────────────────────────────────────────────────
// The planner-facing coordination command center. Lives at
// /vendors?tab=coordination. Five internal tabs (Vendors / Timeline / Updates
// / Files / Day-Of) — all backed by useCoordinationStore.

import { useMemo, useState, type ElementType } from "react";
import {
  AlertCircle,
  CalendarDays,
  FileText,
  Megaphone,
  Radio,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { VendorsTabBar } from "@/components/vendors/VendorsTabBar";
import { useCoordinationStore } from "@/stores/coordination-store";
import { CoordinationVendorsTab } from "./tabs/CoordinationVendorsTab";
import { CoordinationTimelineTab } from "./tabs/CoordinationTimelineTab";
import { CoordinationUpdatesTab } from "./tabs/CoordinationUpdatesTab";
import { CoordinationFilesTab } from "./tabs/CoordinationFilesTab";
import { CoordinationDayOfTab } from "./tabs/CoordinationDayOfTab";
import { ScheduleImportBanner } from "./ScheduleImportBanner";

type HubTab = "vendors" | "timeline" | "updates" | "files" | "day-of";

const HUB_TABS: { id: HubTab; label: string; icon: ElementType }[] = [
  { id: "vendors", label: "Vendors", icon: Users },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "updates", label: "Updates", icon: Megaphone },
  { id: "files", label: "Files", icon: FileText },
  { id: "day-of", label: "Day-Of", icon: Radio },
];

export function CoordinationView({
  coordinationBadge,
  favoritesBadge,
}: {
  coordinationBadge?: string | null;
  favoritesBadge?: string | null;
}) {
  const [hubTab, setHubTab] = useState<HubTab>("vendors");
  const vendors = useCoordinationStore((s) => s.vendors);
  const assignments = useCoordinationStore((s) => s.assignments);
  const stats = useMemo(() => {
    return {
      total: vendors.length,
      confirmed: vendors.filter((v) => v.overallStatus === "confirmed").length,
      viewed: vendors.filter((v) => v.overallStatus === "viewed").length,
      pending: vendors.filter((v) => v.overallStatus === "pending").length,
      questions: vendors.filter((v) => v.overallStatus === "has_questions")
        .length,
    };
  }, [vendors]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <VendorsTabBar
        activeTab="coordination"
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />

      <CoordinationHeader stats={stats} />

      <div className="border-b border-gold/10 bg-white px-8">
        <nav
          className="-mb-px mx-auto flex max-w-6xl items-center gap-0 overflow-x-auto"
          aria-label="Coordination sections"
        >
          {HUB_TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === hubTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setHubTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-4 pb-2.5 pt-2 text-[12px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={12} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
        {vendors.length === 0 && assignments.length === 0 ? (
          <ScheduleImportBanner />
        ) : null}

        {hubTab === "vendors" ? <CoordinationVendorsTab /> : null}
        {hubTab === "timeline" ? <CoordinationTimelineTab /> : null}
        {hubTab === "updates" ? <CoordinationUpdatesTab /> : null}
        {hubTab === "files" ? <CoordinationFilesTab /> : null}
        {hubTab === "day-of" ? <CoordinationDayOfTab /> : null}
      </main>
    </div>
  );
}

function CoordinationHeader({
  stats,
}: {
  stats: {
    total: number;
    confirmed: number;
    viewed: number;
    pending: number;
    questions: number;
  };
}) {
  return (
    <header className="border-b border-gold/15 bg-white px-8 pb-7 pt-8">
      <div className="mx-auto max-w-6xl">
        <p
          className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Vendor Coordination Hub
        </p>
        <h1 className="mt-2 font-serif text-[38px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
          your command center for keeping every vendor on the same page.
        </h1>
        <p className="mt-1.5 max-w-[640px] font-serif text-[15.5px] italic text-ink-muted">
          from the pandit to the photo booth — one link each, one source of
          truth.
        </p>

        {stats.total > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
              {stats.total} vendor{stats.total === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage" />
              {stats.confirmed} confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              {stats.viewed} viewed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-faint" />
              {stats.pending} pending
            </span>
            {stats.questions > 0 ? (
              <span className="flex items-center gap-1.5 text-rose">
                <AlertCircle size={11} strokeWidth={2} />
                {stats.questions} question{stats.questions === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
