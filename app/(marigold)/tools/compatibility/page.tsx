// /tools/compatibility — Couple Compatibility Score.
//
// Public, no-auth, session-only. Two flows: pass-the-phone (both partners on
// the same device) or share-via-link (partner 1's answers encoded in the URL,
// partner 2 plays after opening). Pure client-side comparison.

import { Suspense } from "react";

import { CompatibilityTool } from "@/components/marigold-tools/compatibility/CompatibilityTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Couple Compatibility Score — The Marigold",
  description:
    "Answer separately. Compare. Survive. A frivolous, wildly shareable look at how aligned you and your partner actually are.",
});

export default function CompatibilityPage() {
  return (
    <Suspense fallback={null}>
      <CompatibilityTool />
    </Suspense>
  );
}
