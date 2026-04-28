"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { EntertainmentCanvas } from "@/components/workspace/canvases/EntertainmentCanvas";

export default function CoupleEntertainmentPage() {
  const categories = useWorkspaceStore((s) => s.categories);
  const category = categories.find((c) => c.slug === "entertainment");
  if (!category) return null;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <EntertainmentCanvas category={category} />
    </div>
  );
}
