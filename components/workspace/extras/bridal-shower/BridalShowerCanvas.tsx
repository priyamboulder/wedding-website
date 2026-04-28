"use client";

// ── Bridal Shower canvas ───────────────────────────────────────────────────
// Six-tab surface for the bridal-shower module. The workflow the spec
// describes is: fill the brief → review generated concepts → pick one →
// execute (menu & flow, guests, budget, checklist). Each tab assumes a
// selected concept when relevant and falls back gracefully when none is
// selected yet.

import {
  CalendarCheck,
  ClipboardCheck,
  DollarSign,
  Flower2,
  Sparkles,
  UserPlus,
  Users,
  Utensils,
  Send,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { BrideBriefTab } from "./tabs/BrideBriefTab";
import { ConceptsTab } from "./tabs/ConceptsTab";
import { MenuFlowTab } from "./tabs/MenuFlowTab";
import { GuestListTab } from "./tabs/GuestListTab";
import { BudgetTab } from "./tabs/BudgetTab";
import { ChecklistTab } from "./tabs/ChecklistTab";
import { useEffect } from "react";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import { getConceptById } from "@/lib/bridal-shower-concepts";

type BridalShowerTabId =
  | "brief"
  | "concepts"
  | "menu_flow"
  | "guest_list"
  | "budget"
  | "checklist";

const TABS: ExtraTabDef<BridalShowerTabId>[] = [
  { id: "brief", label: "Bride Brief", icon: Sparkles },
  { id: "concepts", label: "Concepts", icon: Flower2 },
  { id: "menu_flow", label: "Menu & Flow", icon: Utensils },
  { id: "guest_list", label: "Guest List", icon: Users },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "checklist", label: "Checklist", icon: ClipboardCheck },
];

export function BridalShowerCanvas() {
  const ensureSeeded = useBridalShowerStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const brideName = useBridalShowerStore((s) => s.brideName);
  const guests = useBridalShowerStore((s) => s.guests);
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  const dateTarget = useBridalShowerStore((s) => s.brief.dateTarget);
  const city = useBridalShowerStore((s) => s.brief.city);

  const goingCount = guests.filter((g) => g.rsvp === "going").length;
  const concept = selectionId ? getConceptById(selectionId) : null;

  const subtitleParts = [
    concept?.name ?? "No concept selected yet",
    dateTarget || null,
    city || null,
    `${goingCount}/${guests.length} going`,
  ].filter(Boolean) as string[];

  return (
    <ExtraCanvasShell<BridalShowerTabId>
      eyebrow="WORKSPACE · CELEBRATIONS"
      icon={Flower2}
      title={`${brideName}'s Bridal Shower`}
      subtitle={subtitleParts.join(" · ")}
      actions={
        <>
          <ExtraActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label="Invite co-planner"
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
          case "brief":
            return <BrideBriefTab onGoToConcepts={() => setTab("concepts")} />;
          case "concepts":
            return <ConceptsTab onGoToMenuFlow={() => setTab("menu_flow")} />;
          case "menu_flow":
            return <MenuFlowTab />;
          case "guest_list":
            return <GuestListTab />;
          case "budget":
            return <BudgetTab />;
          case "checklist":
            return <ChecklistTab />;
        }
      }}
    />
  );
}
