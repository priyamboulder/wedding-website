// /tools/shoe-game — Shoe Game Question Generator.
//
// Public, no-auth, session-only. Custom couple-questions hit the Anthropic
// API only when the user provides a relationship detail; everything else is
// a static question bank picked client-side.

import { Suspense } from "react";

import { ShoeGameTool } from "@/components/marigold-tools/shoe-game/ShoeGameTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Shoe Game Question Generator — Ananya",
  description:
    "A custom Shoe Game question set for your reception — printable, MC-ready, built entirely for screenshots and group chats.",
});

export default function ShoeGamePage() {
  return (
    <Suspense fallback={null}>
      <ShoeGameTool />
    </Suspense>
  );
}
