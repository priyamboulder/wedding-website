// ──────────────────────────────────────────────────────────────────────────
// /tools/visualizer — the Wedding Weekend Visualizer.
//
// Pre-auth, ungated tool. The whole experience lives client-side:
// scheduling algorithm, drag-reordering, PDF export, share-link encoding.
// No server data needed.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { VisualizerTool } from "@/components/marigold-tools/visualizer/VisualizerTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Wedding Weekend Visualizer — The Marigold Tool",
  description:
    "See your whole wedding weekend before you plan a thing. Pick your events and style — we'll show you how 3 days actually flow, hour by hour. No signup needed.",
});

export default function VisualizerToolPage() {
  return (
    <Suspense fallback={null}>
      <VisualizerTool />
    </Suspense>
  );
}
