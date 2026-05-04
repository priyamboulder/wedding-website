// ──────────────────────────────────────────────────────────────────────────
// /tools/shagun — Shagun Calculator.
//
// Pure client tool: relationship + wedding context + tradition + reciprocity
// produce a deterministic USD recommendation. No API calls, no database.
// This route is a thin server shell so we can pre-set metadata and ship the
// client orchestrator.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { ShagunTool } from "@/components/marigold-tools/shagun/ShagunTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Shagun Calculator — The Marigold Tool",
  description:
    "How much shagun do you actually give? Your relationship, their wedding, your tradition — we'll give you the real number. No more Googling in the venue parking lot.",
});

export default function ShagunCalculatorPage() {
  return (
    <Suspense fallback={null}>
      <ShagunTool />
    </Suspense>
  );
}
