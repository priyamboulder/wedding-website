// /tools/mehndi-phrases — Custom Mehndi Phrase Generator.
//
// Public, no-auth, session-only. Tradition: the bride hides the groom's
// name in her mehendi for him to find on the wedding night. This tool
// generates custom phrases or inside jokes to hide instead.

import { Suspense } from "react";

import { MehndiTool } from "@/components/marigold-tools/mehndi-phrases/MehndiTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Custom Mehndi Phrase Generator — The Marigold",
  description:
    "Hide something better than his name in your mehendi. Five short phrase options — sweet, cheeky, or both — short enough to fit inside the design.",
});

export default function MehndiPhrasesPage() {
  return (
    <Suspense fallback={null}>
      <MehndiTool />
    </Suspense>
  );
}
