"use client";

// ── Baby Shower canvas ─────────────────────────────────────────────────────
// Six-tab surface: Plan & Vibe → Discover → Guest List & RSVP → Itinerary →
// Budget & Contributions → Documents. Mirrors the shape of the other
// celebration modules (bridal shower, bachelorette) but carries baby-
// shower-specific concerns: funding model, kids-in-guest-mix, and a
// run-of-show itinerary rather than a multi-day one.

import {
  Baby,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  FileText,
  Send,
  Sparkles,
  UserPlus,
  Users,
  Clock,
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
import { useBabyShowerStore } from "@/stores/baby-shower-store";

type BabyShowerTabId =
  | "plan"
  | "discover"
  | "guests"
  | "itinerary"
  | "budget"
  | "documents";

const TABS: ExtraTabDef<BabyShowerTabId>[] = [
  { id: "plan", label: "Plan & Vibe", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Baby },
  { id: "guests", label: "Guest List", icon: Users },
  { id: "itinerary", label: "Itinerary", icon: Clock },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

export function BabyShowerCanvas() {
  const ensureSeeded = useBabyShowerStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const parentName = useBabyShowerStore((s) => s.parentName);
  const plan = useBabyShowerStore((s) => s.plan);
  const guests = useBabyShowerStore((s) => s.guests);

  const goingCount = guests.filter((g) => g.rsvp === "going").length;

  const subtitleParts = [
    plan.showerDate || "Date not set",
    plan.venueName || null,
    `${goingCount}/${guests.length} going`,
    plan.isSurprise ? "🤫 Surprise" : null,
  ].filter(Boolean) as string[];

  return (
    <ExtraCanvasShell<BabyShowerTabId>
      eyebrow="WORKSPACE · CELEBRATIONS"
      icon={Baby}
      title={`${parentName}'s Baby Shower`}
      subtitle={subtitleParts.join(" · ")}
      actions={
        <>
          <ExtraActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label="Invite co-host"
          />
          <ExtraActionButton
            icon={<CalendarCheck size={13} strokeWidth={1.8} />}
            label="Share plan"
          />
          <ExtraActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Send invitations"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab, setTab) => {
        switch (tab) {
          case "plan":
            return <PlanVibeTab onGoToDiscover={() => setTab("discover")} />;
          case "discover":
            return <DiscoverTab onGoToItinerary={() => setTab("itinerary")} />;
          case "guests":
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
