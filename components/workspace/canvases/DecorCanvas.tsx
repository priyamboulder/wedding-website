"use client";

// ── Décor & Florals canvas ──────────────────────────────────────────────────
// 4 tabs, discovery-first, matching the Photography pattern. Operational
// content (install plans, contracts, documents) lives in global modules.

import type { ElementType } from "react";
import { FileText, Flower2, Map, Sparkles } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import { VisionMoodTab } from "@/components/decor/tabs/VisionMoodTab";
import { SpacesFloralsTab } from "@/components/decor/tabs/SpacesFloralsTab";
import { ShortlistBriefTab } from "@/components/decor/tabs/ShortlistBriefTab";
import { InspirationTab } from "@/components/decor/tabs/InspirationTab";

type DecorCanvasTabId = "vision" | "spaces" | "shortlist" | "inspiration";

const DECOR_CANVAS_TABS: {
  id: DecorCanvasTabId;
  label: string;
  icon: ElementType;
}[] = [
  { id: "vision", label: "Vision & Mood", icon: Flower2 },
  { id: "spaces", label: "Spaces & Florals", icon: Map },
  { id: "shortlist", label: "Shortlist & Brief", icon: FileText },
  { id: "inspiration", label: "Inspiration", icon: Sparkles },
];

export function DecorCanvas({ category }: { category: WorkspaceCategory }) {
  return (
    <WorkspaceCanvas<DecorCanvasTabId>
      category={category}
      categoryIcon={Flower2}
      eyebrowSuffix="Décor & Florals"
      tabs={DECOR_CANVAS_TABS}
      renderTab={(tab) => (
        <>
          {tab === "vision" && <VisionMoodTab />}
          {tab === "spaces" && <SpacesFloralsTab />}
          {tab === "shortlist" && (
            <div className="space-y-6">
              <ShortlistBriefTab />
              <ContractChecklistBlock category={category} />
            </div>
          )}
          {tab === "inspiration" && <InspirationTab />}
        </>
      )}
    />
  );
}
