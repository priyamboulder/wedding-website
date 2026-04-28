"use client";

// ── Honeymoon workspace page ────────────────────────────────────────────────
// Trip planning — not vendor workflow. Six tabs: Dream & Plan, Destinations,
// Bookings & Itinerary, Budget & Registry, Packing & Prep, Documents. All
// state lives in stores/honeymoon-store.ts, persisted to localStorage.

import {
  CalendarDays,
  FileText,
  Luggage,
  MapPinned,
  Plane,
  PiggyBank,
  Send,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "./ExtraCanvasShell";
import { DreamPlanTab } from "./honeymoon/tabs/DreamPlanTab";
import { DestinationsTab } from "./honeymoon/tabs/DestinationsTab";
import { BookingsItineraryTab } from "./honeymoon/tabs/BookingsItineraryTab";
import { BudgetRegistryTab } from "./honeymoon/tabs/BudgetRegistryTab";
import { PackingPrepTab } from "./honeymoon/tabs/PackingPrepTab";
import { DocumentsTab } from "./honeymoon/tabs/DocumentsTab";
import { useEffect } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";

type HoneymoonTabId =
  | "dream_plan"
  | "destinations"
  | "bookings_itinerary"
  | "budget_registry"
  | "packing_prep"
  | "documents";

const TABS: ExtraTabDef<HoneymoonTabId>[] = [
  { id: "dream_plan", label: "Dream & Plan", icon: Sparkles },
  { id: "destinations", label: "Destinations", icon: MapPinned },
  { id: "bookings_itinerary", label: "Bookings & Itinerary", icon: CalendarDays },
  { id: "budget_registry", label: "Budget & Registry", icon: PiggyBank },
  { id: "packing_prep", label: "Packing & Prep", icon: Luggage },
  { id: "documents", label: "Documents", icon: FileText },
];

export function HoneymoonCanvas() {
  const ensureSeeded = useHoneymoonStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const destinations = useHoneymoonStore((s) => s.destinations);
  const leading = destinations.find((d) => d.status === "leading");
  const subtitle = leading
    ? `Planning — ${leading.name} leading`
    : "Planning — dreaming first, booking later";

  return (
    <ExtraCanvasShell<HoneymoonTabId>
      eyebrow="WORKSPACE · TRIP"
      icon={Plane}
      title="Honeymoon"
      subtitle={subtitle}
      actions={
        <>
          <ExtraActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label="Invite co-planner"
          />
          <ExtraActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Share registry"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab) => <HoneymoonTab tab={tab} />}
    />
  );
}

function HoneymoonTab({ tab }: { tab: HoneymoonTabId }) {
  switch (tab) {
    case "dream_plan":
      return <DreamPlanTab />;
    case "destinations":
      return <DestinationsTab />;
    case "bookings_itinerary":
      return <BookingsItineraryTab />;
    case "budget_registry":
      return <BudgetRegistryTab />;
    case "packing_prep":
      return <PackingPrepTab />;
    case "documents":
      return <DocumentsTab />;
  }
}
