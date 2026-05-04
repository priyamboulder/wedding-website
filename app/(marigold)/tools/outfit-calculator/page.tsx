import { Suspense } from "react";

import { OutfitCalculatorTool } from "@/components/marigold-tools/outfit-calculator/OutfitCalculatorTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Outfit Count Calculator — The Marigold Tool",
  description:
    "How many looks do you actually need? A 30-second reality check on outfit count, budget per look, and the alteration timeline you've been ignoring.",
});

export default function OutfitCalculatorPage() {
  return (
    <Suspense fallback={null}>
      <OutfitCalculatorTool />
    </Suspense>
  );
}
