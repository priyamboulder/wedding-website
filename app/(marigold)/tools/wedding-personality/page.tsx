// /tools/wedding-personality — Buzzfeed-style 7-question archetype quiz.
//
// Public, no-auth, session-only. Pure client-side scoring; no API calls.

import { Suspense } from "react";

import { PersonalityQuiz } from "@/components/marigold-tools/wedding-personality/PersonalityQuiz";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "What's Your Wedding Personality? — The Marigold",
  description:
    "Micromanager or mystery bride? Take the seven-question quiz, find your South Asian wedding planning archetype.",
});

export default function WeddingPersonalityPage() {
  return (
    <Suspense fallback={null}>
      <PersonalityQuiz />
    </Suspense>
  );
}
