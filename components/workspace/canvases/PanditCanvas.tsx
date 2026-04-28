"use client";

// ── Priest / Pandit workspace ───────────────────────────────────────────────
// The most emotionally complex workspace — tradition vs. personalization,
// information asymmetry, family politics, procurement, duration management.
// Six purpose-built tabs map to the spec:
//   vision              — guided ceremony brief (not a quiz)
//   shortlist_contract  — shared shortlist/contract surface
//   ceremony_script     — the collaborative play-by-play
//   family_roles        — who does what (with planner-private notes)
//   samagri             — procurement tracker
//   ceremony_logistics  — mandap, audio, guest flow, vendor coordination
//
// The design language leans slightly more formal: gold-warmed direction
// strip, Cormorant-style serif for ritual names, reverent empty states.

import { UserCheck } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { PANDIT_TABS, type PanditTabId } from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryVisionTab } from "@/components/workspace/shared/CategoryVisionTab";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { CeremonyBrief } from "@/components/workspace/pandit/CeremonyBrief";
import { CeremonyDirectionStrip } from "@/components/workspace/pandit/CeremonyDirectionStrip";
import { CeremonyLogistics } from "@/components/workspace/pandit/CeremonyLogistics";
import { CeremonyScript } from "@/components/workspace/pandit/CeremonyScript";
import { FamilyRoles } from "@/components/workspace/pandit/FamilyRoles";
import { SamagriSupplies } from "@/components/workspace/pandit/SamagriSupplies";

export function PanditCanvas({ category }: { category: WorkspaceCategory }) {
  return (
    <WorkspaceCanvas<PanditTabId>
      category={category}
      categoryIcon={UserCheck}
      eyebrowSuffix="Officiant"
      tabs={PANDIT_TABS}
      renderTab={(tabId) => <PanditTab tab={tabId} category={category} />}
    />
  );
}

function PanditTab({
  tab,
  category,
}: {
  tab: PanditTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      // Guided brief — not a quiz. CeremonyBrief carries the full spec.
      // We still render the shared Vision surface underneath so couples who
      // want a moodboard/palette/notes block for ceremony aesthetics can use
      // it (e.g. wedding flowers, pooja thali images).
      return (
        <div className="space-y-8">
          <CeremonyBrief />
          <div className="pt-2">
            <div
              className="mb-5 h-px w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(197, 156, 92, 0.4) 0, rgba(197, 156, 92, 0.4) 6px, transparent 6px, transparent 12px)",
              }}
              aria-hidden
            />
            <CategoryVisionTab category={category} />
          </div>
        </div>
      );
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "ceremony_script":
      return (
        <>
          <CeremonyDirectionStrip />
          <CeremonyScript />
        </>
      );
    case "family_roles":
      return (
        <>
          <CeremonyDirectionStrip />
          <FamilyRoles />
        </>
      );
    case "samagri":
      return (
        <>
          <CeremonyDirectionStrip />
          <SamagriSupplies />
        </>
      );
    case "ceremony_logistics":
      return (
        <>
          <CeremonyDirectionStrip />
          <CeremonyLogistics />
        </>
      );
  }
}
