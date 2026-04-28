"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { CakeSweetsCanvas } from "@/components/workspace/canvases/CakeSweetsCanvas";

export default function CoupleCakeSweetsPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "cake_sweets");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <CakeSweetsCanvas category={category} />
    </div>
  );
}
