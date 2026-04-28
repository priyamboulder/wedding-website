"use client";

// ── Venue workspace ─────────────────────────────────────────────────────────
// Emotional, discovery-led. Six tabs:
//
// Tab 1 · Dream & Discover   — brief + directions + inspiration + chips
// Tab 2 · Venue Shortlist    — cards, compare mode, computed requirements
// Tab 3 · Spaces & Flow      — event→space pairings + flips + floor plan
// Tab 4 · Logistics & Rules  — structured fields read by other workspaces
// Tab 5 · Site Visits        — per-visit cards + checklist + questions
// Tab 6 · Documents          — contracts, floor plans, COIs, permits

import { MapPin } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { VENUE_TABS, type VenueTabId } from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import { VenueDreamDiscover } from "@/components/workspace/venue/VenueDreamDiscover";
import { VenueShortlist } from "@/components/workspace/venue/VenueShortlist";
import { VenueSpacesFlow } from "@/components/workspace/venue/VenueSpacesFlow";
import { VenueLogisticsRules } from "@/components/workspace/venue/VenueLogisticsRules";
import { VenueSiteVisits } from "@/components/workspace/venue/VenueSiteVisits";
import { VenueDocuments } from "@/components/workspace/venue/VenueDocuments";

export function VenueCanvas({ category }: { category: WorkspaceCategory }) {
  return (
    <WorkspaceCanvas<VenueTabId>
      category={category}
      categoryIcon={MapPin}
      eyebrowSuffix="Venue"
      tabs={VENUE_TABS}
      renderTab={(tabId) => <VenueTab tab={tabId} category={category} />}
    />
  );
}

function VenueTab({
  tab,
  category,
}: {
  tab: VenueTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "dream_discover":
      return <VenueDreamDiscover />;
    case "venue_shortlist":
      return (
        <div className="space-y-6">
          <VenueShortlist />
          <ContractChecklistBlock category={category} />
        </div>
      );
    case "spaces_flow":
      return <VenueSpacesFlow />;
    case "logistics_rules":
      return <VenueLogisticsRules />;
    case "site_visits":
      return <VenueSiteVisits />;
    case "documents":
      return <VenueDocuments category={category} />;
  }
}
