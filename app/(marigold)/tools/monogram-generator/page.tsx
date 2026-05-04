// /tools/monogram-generator — Wedding Monogram Generator.
//
// Public, no-auth, session-only. Six SVG monogram variations rendered
// client-side from initials and (optional) Devanagari names. Download
// as SVG, PNG, or copy SVG code.

import { Suspense } from "react";

import { MonogramTool } from "@/components/marigold-tools/monogram-generator/MonogramTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Monogram Generator — The Marigold",
  description:
    "Your initials, your way. Six monogram variations — Latin, Devanagari, intertwined, stacked. Download as SVG or PNG to share with your stationery designer.",
});

export default function MonogramGeneratorPage() {
  return (
    <Suspense fallback={null}>
      <MonogramTool />
    </Suspense>
  );
}
