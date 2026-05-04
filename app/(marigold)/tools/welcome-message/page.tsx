// /tools/welcome-message — Wedding Welcome Message Generator.
//
// Public, no-auth, session-only. Five conversational questions feed the
// Anthropic API which returns 4 welcome messages: website, ceremony
// program, OOT bag note, welcome sign.

import { Suspense } from "react";

import { WelcomeMessageTool } from "@/components/marigold-tools/welcome-message/WelcomeMessageTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Wedding Welcome Message Generator — The Marigold",
  description:
    "The words for your website, programs, and OOT bags. Four versions written from your story — not from a template.",
});

export default function WelcomeMessagePage() {
  return (
    <Suspense fallback={null}>
      <WelcomeMessageTool />
    </Suspense>
  );
}
