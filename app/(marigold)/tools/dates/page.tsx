// ──────────────────────────────────────────────────────────────────────────
// /tools/dates — Auspicious Date Finder.
//
// Pure client tool: muhurat data, weather, and pricing all ship pre-baked.
// This server shell sets metadata and mounts the client orchestrator.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { DatesTool } from "@/components/marigold-tools/dates/DatesTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Auspicious Date Finder — The Marigold Tool",
  description:
    "Every shubh muhurat, blocked period, and auspicious window for 2026 and 2027 — filtered by your tradition, your city, and your Saturday-or-bust requirements.",
});

export default function DatesToolPage() {
  return (
    <Suspense fallback={null}>
      <DatesTool />
    </Suspense>
  );
}
