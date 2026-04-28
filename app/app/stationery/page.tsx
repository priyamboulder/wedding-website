"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { StationeryCanvas } from "@/components/workspace/canvases/StationeryCanvas";

export default function CoupleStationeryPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "stationery");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <StationeryCanvas category={category} />
    </div>
  );
}
