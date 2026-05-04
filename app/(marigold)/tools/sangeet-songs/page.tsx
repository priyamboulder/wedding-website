// /tools/sangeet-songs — Sangeet Song Suggester.
//
// Public, no-auth, session-only. Five preference questions get fed to the
// Anthropic API, which returns a 6-section DJ brief. Designed to be printed
// or sent straight to the DJ.

import { Suspense } from "react";

import { SangeetTool } from "@/components/marigold-tools/sangeet-songs/SangeetTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Sangeet Song Suggester — The Marigold",
  description:
    "Bollywood night or something unexpected? A custom Sangeet DJ brief — six sections, real songs, ready for your first DJ meeting.",
});

export default function SangeetSongsPage() {
  return (
    <Suspense fallback={null}>
      <SangeetTool />
    </Suspense>
  );
}
