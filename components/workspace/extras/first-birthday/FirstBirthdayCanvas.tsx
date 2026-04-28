"use client";

// ── Baby's First Birthday canvas ──────────────────────────────────────────
// Non-vendor "Next Chapter" celebration surface. Seven tabs:
// Plan & Vibe · Discover · Guest List & RSVP · Itinerary · Budget ·
// Memories · Documents. Backed by stores/first-birthday-store.

import {
  CalendarDays,
  Cake,
  Camera,
  Compass,
  DollarSign,
  FileText,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { useEffect } from "react";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import { PlanVibeTab } from "./tabs/PlanVibeTab";
import { DiscoverTab } from "./tabs/DiscoverTab";
import { GuestListTab } from "./tabs/GuestListTab";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { BudgetTab } from "./tabs/BudgetTab";
import { MemoriesTab } from "./tabs/MemoriesTab";
import { DocumentsTab } from "./tabs/DocumentsTab";

type TabId =
  | "plan_vibe"
  | "discover"
  | "guest_list"
  | "itinerary"
  | "budget"
  | "memories"
  | "documents";

const TABS: ExtraTabDef<TabId>[] = [
  { id: "plan_vibe", label: "Plan & Vibe", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "guest_list", label: "Guest List & RSVP", icon: Users },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "budget", label: "Budget & Contributions", icon: DollarSign },
  { id: "memories", label: "Memories", icon: Camera },
  { id: "documents", label: "Documents", icon: FileText },
];

export function FirstBirthdayCanvas() {
  const ensureSeeded = useFirstBirthdayStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const plan = useFirstBirthdayStore((s) => s.plan);
  const families = useFirstBirthdayStore((s) => s.families);

  const goingFamilies = families.filter((f) => f.rsvp === "going");
  const goingAdults = goingFamilies.reduce((n, f) => n + f.adults.length, 0);
  const goingKids = goingFamilies.reduce((n, f) => n + f.kids.length, 0);

  const subtitle = `${plan.birthdayDate || "Date TBD"} · ${goingFamilies.length} famil${goingFamilies.length === 1 ? "y" : "ies"} going · ${goingAdults} adult${goingAdults === 1 ? "" : "s"}, ${goingKids} kid${goingKids === 1 ? "" : "s"}`;

  const babyName = plan.babyName.trim() || "Your baby";
  const title = `${babyName}'s First Birthday`;

  return (
    <ExtraCanvasShell<TabId>
      eyebrow="WORKSPACE · CELEBRATIONS"
      icon={Cake}
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <ExtraActionButton
            icon={<Sparkles size={13} strokeWidth={1.8} />}
            label="Browse ideas"
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
            return <PlanVibeTab onGoToDiscover={() => setTab("discover")} />;
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
          case "memories":
            return <MemoriesTab />;
          case "documents":
            return <DocumentsTab />;
        }
      }}
    />
  );
}
