"use client";

// ── Hair & Makeup workspace ─────────────────────────────────────────────────
// Tier-1 deep build. The bride's most personal workspace — and operationally
// the most precise (8–12 people in a chair backwards from a fixed ceremony).
//
// Tabs (per spec):
//   1. Vision & Mood — quiz, Beauty Brief, moodboard, skin/hair profile
//   2. Shortlist & Contract — shared canvas
//   3. Trial Notes — structured product recipe + photos + decision per trial
//   4. Bride Looks — per-event design boards, outfit/jewelry connections
//   5. Family & Bridal Party — roster + chair-lane schedule grid
//   6. Touch-up Kit — kit contents + carrier + day-of windows

import { Sparkles } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { HMUA_TABS, type HmuaTabId } from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { HmuaVisionMoodTab } from "@/components/workspace/hmua/VisionMoodTab";
import { HmuaTrialNotesTab } from "@/components/workspace/hmua/TrialNotesTab";
import { HmuaBrideLooksTab } from "@/components/workspace/hmua/BrideLooksTab";
import { HmuaBridalPartyTab } from "@/components/workspace/hmua/BridalPartyTab";
import { HmuaTouchUpKitTab } from "@/components/workspace/hmua/TouchUpKitTab";

export function HmuaCanvas({ category }: { category: WorkspaceCategory }) {
  return (
    <WorkspaceCanvas<HmuaTabId>
      category={category}
      categoryIcon={Sparkles}
      eyebrowSuffix="Hair & Makeup"
      tabs={HMUA_TABS}
      renderTab={(tabId) => <HmuaTab tab={tabId} category={category} />}
    />
  );
}

function HmuaTab({
  tab,
  category,
}: {
  tab: HmuaTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <HmuaVisionMoodTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "trial_notes":
      return <HmuaTrialNotesTab category={category} />;
    case "bride_looks":
      return <HmuaBrideLooksTab category={category} />;
    case "bridal_party":
      return <HmuaBridalPartyTab category={category} />;
    case "touch_up":
      return <HmuaTouchUpKitTab category={category} />;
  }
}
