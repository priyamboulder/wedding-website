"use client";

// ── First Anniversary canvas ──────────────────────────────────────────────
// Non-vendor "Next Chapter" canvas. Five tabs — Plan & Vibe, Discover,
// Itinerary, Budget, Documents — backed by stores/first-anniversary-store.
// Discover is the hero surface; the rest support it.

import {
  CalendarHeart,
  Compass,
  DollarSign,
  FileText,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { PlanVibeTab } from "./tabs/PlanVibeTab";
import { DiscoverTab } from "./tabs/DiscoverTab";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { BudgetTab } from "./tabs/BudgetTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { useEffect } from "react";
import { useFirstAnniversaryStore } from "@/stores/first-anniversary-store";

type TabId =
  | "plan_vibe"
  | "discover"
  | "itinerary"
  | "budget"
  | "documents";

const TABS: ExtraTabDef<TabId>[] = [
  { id: "plan_vibe", label: "Plan & Vibe", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "itinerary", label: "Itinerary", icon: CalendarHeart },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function FirstAnniversaryCanvas() {
  const ensureSeeded = useFirstAnniversaryStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const basics = useFirstAnniversaryStore((s) => s.basics);
  const vibe = useFirstAnniversaryStore((s) => s.vibe);

  const vibesCount = vibe.vibes.length;
  const subtitle = `${ordinal(basics.anniversaryNumber)} anniversary · ${basics.anniversaryDate}${
    vibesCount ? ` · ${vibesCount} vibe${vibesCount === 1 ? "" : "s"} picked` : ""
  }`;

  return (
    <ExtraCanvasShell<TabId>
      eyebrow="WORKSPACE · NEXT CHAPTER"
      icon={Heart}
      title={`${basics.partnerOne} & ${basics.partnerTwo} — ${ordinal(basics.anniversaryNumber)} Anniversary`}
      subtitle={subtitle}
      actions={
        <ExtraActionButton
          icon={<Sparkles size={13} strokeWidth={1.8} />}
          label="Browse ideas"
          primary
        />
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
