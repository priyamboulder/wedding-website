"use client";

// ── Cake & Sweets workspace ────────────────────────────────────────────────
// Two desserts at once — a tiered wedding cake and a full mithai spread —
// with a tastings tab that covers both.
//
// Hosts two guided journeys:
//   • Vision   (default journey)  — sessions 1-3, surfaced on Tab 1.
//   • Selection (selection journey) — sessions 1-4, surfaced on Tabs
//     3/4/5/6 via the SelectionLauncherBanner. When the launcher is open
//     the canvas body is replaced by SweetsSelectionShell.

import { Cake } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  CAKE_SWEETS_TABS,
  type CakeSweetsTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { VisionMoodTab as CakeVisionMoodTab } from "@/components/workspace/cake-sweets/tabs/VisionMoodTab";
import { CakeDesignBuilder } from "@/components/workspace/cake-sweets/CakeDesignBuilder";
import { CakeTastingsTab } from "@/components/workspace/cake-sweets/CakeTastingsTab";
import { MithaiBrowserTab } from "@/components/workspace/cake-sweets/MithaiBrowserTab";
import { DessertTableLayoutTab } from "@/components/workspace/cake-sweets/DessertTableLayoutTab";
import { ServicePlanTab } from "@/components/workspace/cake-sweets/ServicePlanTab";
import { useGuidedCanvas } from "@/components/workspace/shared/guided-journey/useGuidedCanvas";
import { useSweetsSelectionLauncher } from "@/stores/sweets-selection-launcher";
import { SweetsSelectionShell } from "@/components/guided-journeys/sweets-selection/SweetsSelectionShell";

export function CakeSweetsCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("cake_sweets");
  const selectionActiveCategory = useSweetsSelectionLauncher((s) => s.activeCategoryId);
  const selectionActiveSession = useSweetsSelectionLauncher((s) => s.activeSessionKey);

  // When Selection is open for this workspace, swap the body for the shell.
  // Falls back to the bodyOverride from useGuidedCanvas (Vision shell, etc.)
  // and finally to the normal tab renderer.
  const selectionOpen =
    selectionActiveCategory === category.id &&
    selectionActiveSession != null;

  const finalBodyOverride = selectionOpen ? (
    <SweetsSelectionShell
      category={category}
      initialSessionKey={selectionActiveSession ?? undefined}
    />
  ) : (
    bodyOverride
  );

  return (
    <WorkspaceCanvas<CakeSweetsTabId>
      category={category}
      categoryIcon={Cake}
      eyebrowSuffix="Cake & Sweets"
      tabs={CAKE_SWEETS_TABS}
      subHeader={subHeader}
      headerActions={headerActions}
      bodyOverride={finalBodyOverride}
      renderTab={(tabId) => (
        <CakeSweetsTab tab={tabId} category={category} />
      )}
    />
  );
}

function CakeSweetsTab({
  tab,
  category,
}: {
  tab: CakeSweetsTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <CakeVisionMoodTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "wedding_cake":
      return <CakeDesignBuilder category={category} />;
    case "mithai":
      return <MithaiBrowserTab category={category} />;
    case "dessert_tables":
      return <DessertTableLayoutTab category={category} />;
    case "service_plan":
      return <ServicePlanTab category={category} />;
    case "tasting_approval":
      return <CakeTastingsTab category={category} />;
  }
}
