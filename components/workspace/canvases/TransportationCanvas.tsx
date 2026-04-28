"use client";

// ── Transportation workspace ────────────────────────────────────────────────
// Logistics, baraat, guest shuttles, master route plan, and documents.
// Everything converges on the baraat procession window and the day-of
// shuttle table — those two surfaces are the make-or-break timing.

import { Car } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  TRANSPORTATION_TABS,
  type TransportationTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { BaraatTab } from "@/components/workspace/transportation/BaraatTab";
import { PlanLogisticsTab } from "@/components/workspace/transportation/PlanLogisticsTab";
import { ShuttleGuestTransportTab } from "@/components/workspace/transportation/ShuttleGuestTransportTab";
import { DayOfRoutePlanTab } from "@/components/workspace/transportation/DayOfRoutePlanTab";
import { TransportDocumentsTab } from "@/components/workspace/transportation/TransportDocumentsTab";

export function TransportationCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<TransportationTabId>
      category={category}
      categoryIcon={Car}
      eyebrowSuffix="Transportation"
      tabs={TRANSPORTATION_TABS}
      renderTab={(tabId) => (
        <TransportTab tab={tabId} category={category} />
      )}
    />
  );
}

function TransportTab({
  tab,
  category,
}: {
  tab: TransportationTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "plan_logistics":
      return <PlanLogisticsTab category={category} />;
    case "baraat":
      return <BaraatTab category={category} />;
    case "shuttle_transport":
      return <ShuttleGuestTransportTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "day_of":
      return <DayOfRoutePlanTab category={category} />;
    case "documents":
      return <TransportDocumentsTab category={category} />;
  }
}
