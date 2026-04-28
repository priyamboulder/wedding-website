"use client";

// ── Travel & Accommodations workspace ──────────────────────────────────────
// Six-tab planning surface for out-of-town guest logistics: hotel strategy,
// room block management, guest travel, vendor shortlist, welcome bags, and
// the document binder.
//
// The guest-side source-of-truth (who is in which room, roommates, requests)
// lives in the Guest module (`app/guests/page.tsx`). This workspace is the
// couple+planner side — strategy, pickup math, and bag assembly.

import { Luggage } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  TRAVEL_ACCOMMODATIONS_TABS,
  type TravelAccommodationsTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { HotelStrategyTab } from "@/components/workspace/travel/HotelStrategyTab";
import { RoomBlockManagerTab } from "@/components/workspace/travel/RoomBlockManagerTab";
import { GuestTravelHubTab } from "@/components/workspace/travel/GuestTravelHubTab";
import { WelcomeExperienceTab } from "@/components/workspace/travel/WelcomeExperienceTab";
import { TravelDocumentsTab } from "@/components/workspace/travel/TravelDocumentsTab";

export function TravelAccommodationsCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<TravelAccommodationsTabId>
      category={category}
      categoryIcon={Luggage}
      eyebrowSuffix="Travel & Accommodations"
      tabs={TRAVEL_ACCOMMODATIONS_TABS}
      renderTab={(tabId) => (
        <TravelAccommodationsTab tab={tabId} category={category} />
      )}
    />
  );
}

function TravelAccommodationsTab({
  tab,
  category,
}: {
  tab: TravelAccommodationsTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "hotel_strategy":
      return <HotelStrategyTab category={category} />;
    case "room_blocks":
      return <RoomBlockManagerTab category={category} />;
    case "guest_travel":
      return <GuestTravelHubTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "welcome_experience":
      return <WelcomeExperienceTab category={category} />;
    case "documents":
      return <TravelDocumentsTab category={category} />;
  }
}
