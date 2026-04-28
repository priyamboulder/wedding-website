"use client";

// ── Wardrobe & Styling → Documents tab ────────────────────────────────────
// Designer receipts, fabric swatches (photos), outfit photos for HMUA /
// photographer coordination, alteration instructions, colour-guide PDF.
// Everything else in this workspace owns its own surface — this tab is the
// quiet filing cabinet.

import type { WorkspaceCategory } from "@/types/workspace";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";
import { CategoryItemList } from "@/components/workspace/shared/CategoryItemList";
import { Package } from "lucide-react";
import { SectionHeader } from "@/components/workspace/blocks/primitives";

export function WardrobeDocumentsTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Documents & delivery"
        description="Receipts, fabric swatches, outfit photos for your HMUA and photographer, alteration instructions. Track delivery windows below so nothing arrives too late."
      />

      <FilesPanel category="wardrobe" tab="delivery" />

      <CategoryItemList
        category={category}
        tab="delivery"
        blockType="delivery_slot"
        title="Delivery windows"
        icon={<Package size={14} strokeWidth={1.8} />}
        description="Bride's wedding lehenga arrives first, bridesmaids in bulk later. Build in a 5-day alterations buffer."
        placeholder="Add a delivery slot"
        defaultBlockType="delivery_slot"
        emptyMessage="No delivery plan yet. Add your first slot."
      />
    </div>
  );
}
