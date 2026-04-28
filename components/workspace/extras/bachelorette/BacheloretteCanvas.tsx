"use client";

// ── Bachelorette canvas ────────────────────────────────────────────────────
// Replaces the static CelebrationCanvas preset for the Bachelorette module
// with a fully store-backed surface. Five tabs, matching the spec:
// Plan & Vibe · Guest List & RSVP · Itinerary · Budget & Splits · Documents.

import {
  CalendarDays,
  Compass,
  DollarSign,
  FileText,
  Martini,
  Send,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ExtraActionButton,
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
import { useBacheloretteStore } from "@/stores/bachelorette-store";

type BacheloretteTabId =
  | "plan_vibe"
  | "discover"
  | "guest_list"
  | "itinerary"
  | "budget"
  | "documents";

const TABS: ExtraTabDef<BacheloretteTabId>[] = [
  { id: "plan_vibe", label: "Plan & Vibe", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "guest_list", label: "Guest List & RSVP", icon: Users },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "budget", label: "Budget & Splits", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

export function BacheloretteCanvas() {
  const ensureSeeded = useBacheloretteStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const basics = useBacheloretteStore((s) => s.basics);
  const guests = useBacheloretteStore((s) => s.guests);

  const goingCount = guests.filter((g) => g.rsvp === "going").length;
  const subtitle = `${basics.dateRange} · ${basics.location} · ${goingCount}/${guests.length} going`;

  return (
    <ExtraCanvasShell<BacheloretteTabId>
      eyebrow="WORKSPACE · CELEBRATIONS"
      icon={Martini}
      title={`${basics.brideName}'s Bachelorette`}
      subtitle={subtitle}
      actions={
        <>
          <ExtraActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label="Invite co-planner"
          />
          <ExtraActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Share RSVP link"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab, setTab) => {
        switch (tab) {
          case "plan_vibe":
            return <PlanVibeTab />;
          case "discover":
            return (
              <DiscoverTab onGoToItinerary={() => setTab("itinerary")} />
            );
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
