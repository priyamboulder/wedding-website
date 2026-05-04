// ──────────────────────────────────────────────────────────────────────────
// /tools/wedding-stars — Wedding Stars timeline tool.
//
// Pure client tool: Moon sign + wedding date → personalized 12-month
// astrological planning calendar. Transit data is pre-baked; calculation
// is synchronous; nothing is stored or transmitted.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { WeddingStarsTool } from "@/components/marigold-tools/wedding-stars/WeddingStarsTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Wedding Stars — The Marigold Tool",
  description:
    "Your cosmic calendar for every big wedding decision. Enter your Moon sign and your wedding date, get a personalized 12-month timeline of planetary windows — when to book, when to pause, when to act. No signup needed.",
});

export default function WeddingStarsPage() {
  return (
    <Suspense fallback={null}>
      <WeddingStarsTool />
    </Suspense>
  );
}
