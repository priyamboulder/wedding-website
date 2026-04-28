"use client";

// ── Wardrobe & Styling workspace ────────────────────────────────────────────
// Six tabs following the spec's narrative arc:
//   1. Style & Vision  — quiz → brief → per-event palette → tagged moodboard
//   2. Shortlist & Contract — designers, boutiques, deposits
//   3. Event Looks — people × events grid with per-event colour coordination
//   4. Family Coordination — bride-side / groom-side tables + colour rules
//   5. Fittings & Alterations — bride's 3-round arc + everyone else
//   6. Documents — files + delivery windows

import { Shirt } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  WARDROBE_TABS,
  type WardrobeTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { OutfitPlannerGrid } from "@/components/workspace/wardrobe/OutfitPlannerGrid";
import { FittingsTimeline } from "@/components/workspace/wardrobe/FittingsTimeline";
import { WardrobeVisionMoodTab } from "@/components/workspace/wardrobe/VisionMoodTab";
import { WardrobeFamilyCoordinationTab } from "@/components/workspace/wardrobe/FamilyCoordinationTab";
import { WardrobeDocumentsTab } from "@/components/workspace/wardrobe/DocumentsTab";

export function WardrobeCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<WardrobeTabId>
      category={category}
      categoryIcon={Shirt}
      eyebrowSuffix="Wardrobe & Styling"
      tabs={WARDROBE_TABS}
      renderTab={(tabId) => (
        <WardrobeTab tab={tabId} category={category} />
      )}
    />
  );
}

function WardrobeTab({
  tab,
  category,
}: {
  tab: WardrobeTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <WardrobeVisionMoodTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "fittings":
      return <FittingsTimeline category={category} />;
    case "wardrobe_looks":
      return <OutfitPlannerGrid category={category} />;
    case "bridal_party_attire":
      return <WardrobeFamilyCoordinationTab category={category} />;
    case "delivery":
      return <WardrobeDocumentsTab category={category} />;
  }
}
