"use client";

// ── Cake & Sweets workspace ────────────────────────────────────────────────
// Two desserts at once — a tiered wedding cake and a full mithai spread —
// with a tastings tab that covers both.

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

export function CakeSweetsCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<CakeSweetsTabId>
      category={category}
      categoryIcon={Cake}
      eyebrowSuffix="Cake & Sweets"
      tabs={CAKE_SWEETS_TABS}
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
