// /tools/baraat-brief — Baraat Hype Playlist Brief.
//
// Public, no-auth, session-only. Seven inputs feed the Anthropic API,
// which returns a 4-section DJ brief built around the cinematic
// arrival moment.

import { Suspense } from "react";

import { BaraatBriefTool } from "@/components/marigold-tools/baraat-brief/BaraatBriefTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Baraat DJ Brief — The Marigold",
  description:
    "The DJ brief that actually works. Four sections — departure, procession, arrival, milni — with real songs, real cues, ready for your first DJ meeting.",
});

export default function BaraatBriefPage() {
  return (
    <Suspense fallback={null}>
      <BaraatBriefTool />
    </Suspense>
  );
}
