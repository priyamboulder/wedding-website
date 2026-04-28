"use client";

// ── Stationery & Invitations workspace ──────────────────────────────────────
// Four tabs, discovery-first — same structural pattern as Photography:
//   vision              — Vision & Mood: quiz, Paper Brief, moodboard,
//                         style keywords, paper-texture + colour palette,
//                         reference gallery by piece and by event.
//   suite_builder       — Discovery-led piece selector: Want this / Maybe /
//                         Skip + top-priority stars.
//   samples_shortlist   — Sample requests, vendor shortlist, budget snapshot.
//   inspiration         — Moodboard link, themed galleries, "I keep coming
//                         back to…" free-text.
//
// Previous production-tool tabs (Guest Print Matrix, Production Timeline,
// Documents) moved out — production logistics belong in the global
// Checklist/Vendors modules, not a workspace-level tab.

import { PenTool } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  STATIONERY_TABS,
  type StationeryTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import { StationeryVisionMoodTab } from "@/components/workspace/stationery/tabs/VisionMoodTab";
import { StationerySuiteBuilderTab } from "@/components/workspace/stationery/tabs/SuiteBuilderTab";
import { StationerySamplesShortlistTab } from "@/components/workspace/stationery/tabs/SamplesShortlistTab";
import { StationeryInspirationTab } from "@/components/workspace/stationery/tabs/InspirationTab";

export function StationeryCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<StationeryTabId>
      category={category}
      categoryIcon={PenTool}
      eyebrowSuffix="Stationery & Invitations"
      tabs={STATIONERY_TABS}
      renderTab={(tabId) => <StationeryTab tab={tabId} category={category} />}
    />
  );
}

function StationeryTab({
  tab,
  category,
}: {
  tab: StationeryTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <StationeryVisionMoodTab category={category} />;
    case "suite_builder":
      return <StationerySuiteBuilderTab />;
    case "samples_shortlist":
      return (
        <div className="space-y-6">
          <StationerySamplesShortlistTab category={category} />
          <ContractChecklistBlock category={category} />
        </div>
      );
    case "inspiration":
      return <StationeryInspirationTab category={category} />;
  }
}
