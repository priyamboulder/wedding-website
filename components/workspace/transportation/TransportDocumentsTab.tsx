"use client";

// ── Transportation → Documents ─────────────────────────────────────────────
// Shuttle contracts, horse / vintage car rental agreements, route maps,
// parking diagrams, driver contact sheets. Everything tactical that gets
// printed and handed out on the wedding morning.

import type { WorkspaceCategory } from "@/types/workspace";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";
import { SectionHeader } from "@/components/workspace/blocks/primitives";

export function TransportDocumentsTab({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Documents"
        description="Shuttle contracts, horse rental agreements, route maps, parking diagrams, and the driver contact sheet. These are the pieces that get printed and handed out the morning of."
      />

      <FilesPanel category="transportation" tab="documents" />
    </div>
  );
}
