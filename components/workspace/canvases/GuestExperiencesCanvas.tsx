"use client";

// ── Guest Experiences workspace ─────────────────────────────────────────────
// Discovery-first canvas for the experiential extras a couple might layer
// onto their wedding (photo booths, AI stations, chai cart, neon signs,
// baraat horse, sparkler exits, and so on). Three tabs:
//   • Discover & Dream — quiz + Experience Explorer + Experience Map by event
//   • Shortlist & Plan — loved cards become a plannable shortlist
//   • Inspiration      — moodboard + reference gallery + free-text notes
//
// Catalog data lives in lib/guest-experiences/experience-catalog.ts.
// Runtime reactions + shortlist state live in stores/guest-experiences-store.

import { Sparkles } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  GUEST_EXPERIENCES_TABS,
  type GuestExperiencesTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { DiscoverDreamTab } from "@/components/workspace/guest-experiences/tabs/DiscoverDreamTab";
import { ShortlistPlanTab } from "@/components/workspace/guest-experiences/tabs/ShortlistPlanTab";
import { InspirationTab } from "@/components/workspace/guest-experiences/tabs/InspirationTab";
import { useGuestExperiencesGuidedCanvas } from "@/components/workspace/guest-experiences/shared/useGuestExperiencesGuidedCanvas";

export function GuestExperiencesCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const { subHeader, headerActions, bodyOverride } =
    useGuestExperiencesGuidedCanvas();
  return (
    <WorkspaceCanvas<GuestExperiencesTabId>
      category={category}
      categoryIcon={Sparkles}
      eyebrowSuffix="Guest Experiences"
      tabs={GUEST_EXPERIENCES_TABS}
      subHeader={subHeader}
      headerActions={headerActions}
      bodyOverride={bodyOverride}
      renderTab={(tab, setTab) => (
        <GuestExperiencesTab
          tab={tab}
          category={category}
          onNavigate={setTab}
        />
      )}
    />
  );
}

function GuestExperiencesTab({
  tab,
  category,
  onNavigate,
}: {
  tab: GuestExperiencesTabId;
  category: WorkspaceCategory;
  onNavigate: (t: GuestExperiencesTabId) => void;
}) {
  switch (tab) {
    case "guest_discover":
      return (
        <DiscoverDreamTab category={category} onViewShortlist={() => onNavigate("guest_shortlist")} />
      );
    case "guest_shortlist":
      return (
        <ShortlistPlanTab category={category} onBackToExplore={() => onNavigate("guest_discover")} />
      );
    case "guest_inspiration":
      return <InspirationTab category={category} />;
  }
}
