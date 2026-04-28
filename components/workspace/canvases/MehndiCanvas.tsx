"use client";

// ── Mehendi Artist workspace ────────────────────────────────────────────────
// Four tabs in the rebuilt, discovery-led flow:
//   1. Your Mehendi Story — emotional brief, style directions, gallery,
//      hidden details, want / not for us.
//   2. Who Gets Mehendi — design tiers, capacity answer, scheduling cards,
//      VIP list, guest sign-up.
//   3. Find Your Artist — direction-tuned guidance, vendor shortlist,
//      guided contract checklist.
//   4. Day-of Flow — timeline with bride-track highlighting, bride care,
//      setup logistics checklist.
// Documents live in the main Documents section in the sidebar, not here.

import { Scissors } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { MEHNDI_TABS, type MehndiTabId } from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { MehendiStoryTab } from "@/components/workspace/mehndi/MehendiStoryTab";
import { WhoGetsMehendiTab } from "@/components/workspace/mehndi/WhoGetsMehendiTab";
import { FindYourArtistTab } from "@/components/workspace/mehndi/FindYourArtistTab";
import { DayOfFlowTab } from "@/components/workspace/mehndi/DayOfFlowTab";

export function MehndiCanvas({ category }: { category: WorkspaceCategory }) {
  return (
    <WorkspaceCanvas<MehndiTabId>
      category={category}
      categoryIcon={Scissors}
      eyebrowSuffix="Mehendi Artist"
      tabs={MEHNDI_TABS}
      renderTab={(tabId) => <MehndiTab tab={tabId} category={category} />}
    />
  );
}

function MehndiTab({
  tab,
  category,
}: {
  tab: MehndiTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <MehendiStoryTab category={category} />;
    case "guest_mehndi":
      return <WhoGetsMehendiTab category={category} />;
    case "shortlist_contract":
      return <FindYourArtistTab category={category} />;
    case "day_of":
      return <DayOfFlowTab category={category} />;
  }
}
