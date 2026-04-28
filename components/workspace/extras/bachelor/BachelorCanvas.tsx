"use client";

// ── Bachelor canvas ────────────────────────────────────────────────────────
// Replaces the static CelebrationCanvas preset for the Bachelor module with
// a fully store-backed surface. Six tabs, matching the spec:
// Plan & Vibe · Discover · Guest List & RSVP · Itinerary · Budget & Splits
// · Documents.

import {
  CalendarDays,
  Compass,
  DollarSign,
  FileText,
  GlassWater,
  Send,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { PlanVibeTab } from "./tabs/PlanVibeTab";
import { DiscoverTab } from "./tabs/DiscoverTab";
import { GuestListTab } from "./tabs/GuestListTab";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { BudgetTab } from "./tabs/BudgetTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { useEffect } from "react";
import { useBachelorStore } from "@/stores/bachelor-store";

type BachelorTabId =
  | "plan_vibe"
  | "discover"
  | "guest_list"
  | "itinerary"
  | "budget"
  | "documents";

const TABS: ExtraTabDef<BachelorTabId>[] = [
  { id: "plan_vibe", label: "Plan & Vibe", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "guest_list", label: "Guest List & RSVP", icon: Users },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "budget", label: "Budget & Splits", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

function CanvasActionButton({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          : "inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
      }
    >
      {icon}
      {label}
    </button>
  );
}

export function BachelorCanvas() {
  const ensureSeeded = useBachelorStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const basics = useBachelorStore((s) => s.basics);
  const guests = useBachelorStore((s) => s.guests);

  const goingCount = guests.filter((g) => g.rsvp === "going").length;
  const subtitle = `${basics.dateRange} · ${basics.location} · ${goingCount}/${guests.length} going`;

  return (
    <ExtraCanvasShell<BachelorTabId>
      eyebrow="WORKSPACE · CELEBRATIONS"
      icon={GlassWater}
      title={`${basics.groomName}'s Bachelor`}
      subtitle={subtitle}
      actions={
        <>
          <CanvasActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label="Invite co-planner"
          />
          <CanvasActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Share RSVP link"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab) => {
        switch (tab) {
          case "plan_vibe":
            return <PlanVibeTab />;
          case "discover":
            return <DiscoverTab />;
          case "guest_list":
            return <GuestListTab />;
          case "itinerary":
            return <ItineraryTab />;
          case "budget":
            return <BudgetTab />;
          case "documents":
            return <DocumentsTab />;
        }
      }}
    />
  );
}
