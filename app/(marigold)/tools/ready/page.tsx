// ──────────────────────────────────────────────────────────────────────────
// /tools/ready — "Am I Ready?" readiness assessment.
//
// Pure client tool: scoring is deterministic, priorities are rule-based,
// no API or database calls. The page is a thin server shell so the route
// can pre-set metadata and ship the client orchestrator.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { ReadyTool } from "@/components/marigold-tools/ready/ReadyTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Am I Ready? — The Marigold Tool",
  description:
    "Eight questions, two minutes. We'll tell you exactly where you stand and what to lock down this week — whether you're 18 months out or 18 weeks.",
});

export default function ReadyToolPage() {
  return (
    <Suspense fallback={null}>
      <ReadyTool />
    </Suspense>
  );
}
