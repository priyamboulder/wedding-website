// /tools/hashtag-generator — Wedding Hashtag Generator (improved).
//
// Public, no-auth, session-only. Five inputs (two names, last name, year,
// vibe) feed the Anthropic API, which returns 10 hashtags in three tiers.

import { Suspense } from "react";

import { HashtagTool } from "@/components/marigold-tools/hashtag-generator/HashtagTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Wedding Hashtag Generator — The Marigold",
  description:
    "Cute, clever, or cringe? Ten wedding hashtags in three tiers — built for South Asian names, with a cringe-o-meter so you know exactly what you're picking.",
});

export default function HashtagGeneratorPage() {
  return (
    <Suspense fallback={null}>
      <HashtagTool />
    </Suspense>
  );
}
