// /tools/vow-mad-libs — Wedding Vow Mad Libs.
//
// Public, no-auth, session-only. Eight one-at-a-time prompts get sent to the
// Anthropic API which writes back a 3-paragraph vow draft. Designed to be
// screenshotted, not legally binding.

import { Suspense } from "react";

import { VowMadLibsTool } from "@/components/marigold-tools/vow-mad-libs/VowMadLibsTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Wedding Vow Mad Libs — The Marigold",
  description:
    "Fill in the blanks, get a vow. Funny, heartfelt, screenshot-ready — built for the group chat, not the officiant.",
});

export default function VowMadLibsPage() {
  return (
    <Suspense fallback={null}>
      <VowMadLibsTool />
    </Suspense>
  );
}
