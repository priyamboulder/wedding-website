"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { PanditCanvas } from "@/components/workspace/canvases/PanditCanvas";

export default function CouplePriestPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "pandit_ceremony");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <PanditCanvas category={category} />
    </div>
  );
}
