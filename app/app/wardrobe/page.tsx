"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { WardrobeCanvas } from "@/components/workspace/canvases/WardrobeCanvas";

export default function CoupleWardrobePage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "wardrobe");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <WardrobeCanvas category={category} />
    </div>
  );
}
