// ── Quiz schema registry ──────────────────────────────────────────────────
// Central lookup keyed by `${category_slug}:${subsection}`. Subsections
// without a schema return undefined so the entry card can stay hidden
// rather than crashing.

import type { QuizSchema } from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import { photographyVisionMoodQuiz } from "./schemas/photography-vision-mood";
import { photographyShotListQuiz } from "./schemas/photography-shot-list";
import { videographyVisionQuiz } from "./schemas/videography-vision";
import { videographyVisionMoodQuiz } from "./schemas/videography-vision-mood";
import { entertainmentVisionQuiz } from "./schemas/entertainment-vision";
import { guestExperiencesVisionQuiz } from "./schemas/guest-experiences-vision";
import { hmuaVisionQuiz } from "./schemas/hmua-vision";
import { mehndiVisionQuiz } from "./schemas/mehndi-vision";
import { stationeryVisionQuiz } from "./schemas/stationery-vision";
import { wardrobeVisionQuiz } from "./schemas/wardrobe-vision";
import { jewelryVisionQuiz } from "./schemas/jewelry-vision";
import { cakeSweetsVisionQuiz } from "./schemas/cake-sweets-vision";
// Travel & Accommodations no longer has a Vision tab — it opens at Hotel
// Strategy instead. Keeping the schema file on disk for history.
import { giftingVisionQuiz } from "./schemas/gifting-vision";
import { cateringVisionQuiz } from "./schemas/catering-vision";
import { venueVisionQuiz } from "./schemas/venue-vision";
import { bacheloretteVibeQuiz } from "./schemas/bachelorette-vibe";
import { bachelorVibeQuiz } from "./schemas/bachelor-vibe";
import { bridalShowerBriefQuiz } from "./schemas/bridal-shower-brief";
import { honeymoonDreamQuiz } from "./schemas/honeymoon-dream";

const SCHEMAS: QuizSchema[] = [
  photographyVisionMoodQuiz,
  photographyShotListQuiz,
  videographyVisionQuiz,
  videographyVisionMoodQuiz,
  entertainmentVisionQuiz,
  guestExperiencesVisionQuiz,
  hmuaVisionQuiz,
  mehndiVisionQuiz,
  stationeryVisionQuiz,
  wardrobeVisionQuiz,
  jewelryVisionQuiz,
  cakeSweetsVisionQuiz,
  giftingVisionQuiz,
  cateringVisionQuiz,
  venueVisionQuiz,
  bacheloretteVibeQuiz,
  bachelorVibeQuiz,
  bridalShowerBriefQuiz,
  honeymoonDreamQuiz,
];

export function getQuizSchema(
  category: WorkspaceCategorySlug,
  subsection: string,
): QuizSchema | undefined {
  return SCHEMAS.find(
    (s) => s.category === category && s.subsection === subsection,
  );
}

export function listQuizSchemas(): QuizSchema[] {
  return SCHEMAS;
}
