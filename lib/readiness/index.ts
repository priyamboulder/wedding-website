// ──────────────────────────────────────────────────────────────────────────
// "Am I Ready?" — public surface.
// ──────────────────────────────────────────────────────────────────────────

import type {
  AssessmentAnswer,
  ReadinessResult,
} from "@/types/readiness";

import {
  TIER_BLURBS,
  TIER_LABELS,
  getReadinessTier,
  scoreAssessment,
} from "./scoring";
import { generateCanWait, generatePriorities } from "./priorities";

export {
  TIER_LABELS,
  TIER_BLURBS,
  getReadinessTier,
  scoreAssessment,
} from "./scoring";
export { generatePriorities, generateCanWait } from "./priorities";
export { encodeAnswers, decodeAnswers } from "./share";
export { exportReadinessPdf, downloadReadinessPdf } from "./pdf";

export function evaluateReadiness(
  answer: AssessmentAnswer,
): ReadinessResult {
  const { adjusted } = scoreAssessment(answer);
  const tier = getReadinessTier(adjusted);
  return {
    score: adjusted,
    tier,
    tierLabel: TIER_LABELS[tier],
    tierBlurb: TIER_BLURBS[tier],
    priorities: generatePriorities(answer),
    canWait: generateCanWait(answer),
  };
}
