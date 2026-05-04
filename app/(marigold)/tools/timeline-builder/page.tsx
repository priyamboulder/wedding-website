import { Suspense } from "react";

import { TimelineBuilderTool } from "@/components/marigold-tools/timeline-builder/TimelineBuilderTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Indian Wedding Timeline Builder — The Marigold Tool",
  description:
    "Which events, which days, what order? Drag-and-drop your multi-day wedding into shape, with day-of skeletons for every event.",
});

export default function TimelineBuilderPage() {
  return (
    <Suspense fallback={null}>
      <TimelineBuilderTool />
    </Suspense>
  );
}
