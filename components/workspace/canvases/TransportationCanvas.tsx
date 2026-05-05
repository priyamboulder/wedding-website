"use client";

// ── Transportation workspace ────────────────────────────────────────────────
// Logistics, baraat, guest shuttles, master route plan, and documents.
// Everything converges on the baraat procession window and the day-of
// shuttle table — those two surfaces are the make-or-break timing.
//
// Two guided journeys live on this canvas:
//   • Vision (default) — the existing 2-session intent flow on Tab 1.
//   • Build           — the 3-session operational flow accessible from the
//                       top of Tabs 1/2/3. When launched it overrides the
//                       canvas body via bodyOverride.

import { type ReactNode } from "react";
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
import { useGuidedCanvas } from "@/components/workspace/shared/guided-journey/useGuidedCanvas";
import { useTransportationBuildLauncher } from "@/stores/transportation-build-launcher";
import { TransportationBuildShell } from "@/components/guided-journeys/transportation-build/TransportationBuildShell";
import { TransportationBuildLauncherBanner } from "@/components/guided-journeys/transportation-build/TransportationBuildLauncherBanner";
import type { TransportationBuildSessionKey } from "@/lib/guided-journeys/transportation-build";

export function TransportationCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("transportation");

  const buildActiveCategory = useTransportationBuildLauncher(
    (s) => s.activeCategoryId,
  );
  const buildActiveSession = useTransportationBuildLauncher(
    (s) => s.activeSessionKey,
  );
  const buildActive =
    buildActiveCategory === category.id && !!buildActiveSession;

  // Build journey takes precedence over Vision (default) override because
  // it's launched on demand from Tabs 1/2/3.
  const finalBody = buildActive ? (
    <TransportationBuildShell
      category={category}
      initialSessionKey={buildActiveSession ?? undefined}
    />
  ) : (
    bodyOverride
  );

  return (
    <WorkspaceCanvas<TransportationTabId>
      category={category}
      categoryIcon={Car}
      eyebrowSuffix="Transportation"
      tabs={TRANSPORTATION_TABS}
      subHeader={buildActive ? null : subHeader}
      headerActions={buildActive ? null : headerActions}
      bodyOverride={finalBody}
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
      return (
        <TabWithBuildBanner
          categoryId={category.id}
          sessionKey="fleet_roster"
        >
          <PlanLogisticsTab category={category} />
        </TabWithBuildBanner>
      );
    case "baraat":
      return (
        <TabWithBuildBanner
          categoryId={category.id}
          sessionKey="baraat_walkthrough"
        >
          <BaraatTab category={category} />
        </TabWithBuildBanner>
      );
    case "shuttle_transport":
      return (
        <TabWithBuildBanner
          categoryId={category.id}
          sessionKey="guest_movement_math"
        >
          <ShuttleGuestTransportTab category={category} />
        </TabWithBuildBanner>
      );
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "day_of":
      return <DayOfRoutePlanTab category={category} />;
    case "documents":
      return <TransportDocumentsTab category={category} />;
  }
}

// Wraps a tab body with the dual-CTA Build launcher banner. The banner
// auto-hides when Vision is incomplete (see TransportationBuildLauncherBanner).
function TabWithBuildBanner({
  categoryId,
  sessionKey,
  children,
}: {
  categoryId: string;
  sessionKey: TransportationBuildSessionKey;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <TransportationBuildLauncherBanner
        categoryId={categoryId}
        sessionKey={sessionKey}
      />
      {children}
    </div>
  );
}
