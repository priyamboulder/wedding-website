"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { TransportationCanvas } from "@/components/workspace/canvases/TransportationCanvas";

export default function CoupleTransportationPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "transportation");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TransportationCanvas category={category} />
    </div>
  );
}
