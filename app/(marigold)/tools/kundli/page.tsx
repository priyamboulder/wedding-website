// ──────────────────────────────────────────────────────────────────────────
// /tools/kundli — Kundli Match (Ashtakoota Guna Milan).
//
// Pure client tool: birth details → Moon position → 36-point compatibility
// report with dosha analysis. Calculations happen entirely in the browser;
// nothing is stored or transmitted.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { KundliTool } from "@/components/marigold-tools/kundli/KundliTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Kundli Match — The Marigold Tool",
  description:
    "Full 36-point Ashtakoota compatibility report with dosha analysis — designed so your parents and your partner can both understand it. No signup needed.",
});

export default function KundliMatchPage() {
  return (
    <Suspense fallback={null}>
      <KundliTool />
    </Suspense>
  );
}
