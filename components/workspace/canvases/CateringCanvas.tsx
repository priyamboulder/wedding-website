"use client";

// ── Catering canvas ─────────────────────────────────────────────────────────
// Thin wrapper over the shared WorkspaceCanvas so Catering sits on the same
// white page chrome, underline-style tabs, and editorial header as every
// other vendor workspace. Tab bodies are named exports from
// CateringCoupleWorkspace.tsx.

import type { ElementType } from "react";
import {
  ChefHat,
  Clock,
  FileText,
  Leaf,
  Palette,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import {
  DietaryTab,
  DocumentsTab,
  MenuBuilderTab,
  ServicePlanTab,
  ShortlistTab,
  TasteAndVisionTab,
} from "@/components/workspace/catering/CateringCoupleWorkspace";
import { useGuidedCanvas } from "@/components/workspace/shared/guided-journey/useGuidedCanvas";

type CateringCanvasTabId =
  | "vision"
  | "menu"
  | "dietary"
  | "shortlist"
  | "service"
  | "documents";

const CATERING_CANVAS_TABS: {
  id: CateringCanvasTabId;
  label: string;
  icon: ElementType;
}[] = [
  { id: "vision", label: "Taste & Vision", icon: Palette },
  { id: "menu", label: "Menu Builder", icon: ChefHat },
  { id: "dietary", label: "Dietary & Guests", icon: Leaf },
  { id: "shortlist", label: "Shortlist & Tasting", icon: Users },
  { id: "service", label: "Service Plan", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText },
];

export function CateringCanvas({ category }: { category: WorkspaceCategory }) {
  const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("catering");
  return (
    <WorkspaceCanvas<CateringCanvasTabId>
      category={category}
      categoryIcon={UtensilsCrossed}
      eyebrowSuffix="Catering"
      tabs={CATERING_CANVAS_TABS}
      subHeader={subHeader}
      headerActions={headerActions}
      bodyOverride={bodyOverride}
      renderTab={(tab) => (
        <>
          {tab === "vision" && <TasteAndVisionTab />}
          {tab === "menu" && <MenuBuilderTab />}
          {tab === "dietary" && <DietaryTab />}
          {tab === "shortlist" && (
            <div className="space-y-6">
              <ShortlistTab />
              <ContractChecklistBlock category={category} />
            </div>
          )}
          {tab === "service" && <ServicePlanTab />}
          {tab === "documents" && <DocumentsTab />}
        </>
      )}
    />
  );
}
