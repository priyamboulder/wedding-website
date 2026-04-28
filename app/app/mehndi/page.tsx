"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { MehndiCanvas } from "@/components/workspace/canvases/MehndiCanvas";

export default function CoupleMehndiPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "mehndi");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <MehndiCanvas category={category} />
    </div>
  );
}
