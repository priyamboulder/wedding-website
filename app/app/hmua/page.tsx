"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { HmuaCanvas } from "@/components/workspace/canvases/HmuaCanvas";

export default function CoupleHmuaPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "hmua");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <HmuaCanvas category={category} />
    </div>
  );
}
