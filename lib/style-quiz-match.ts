// ── Style quiz matcher ────────────────────────────────────────────────────
// Pure functions that turn a couple's quiz responses into ranked vendor
// matches. Score = percentage of overlap between the union of the
// couple's chosen-option tags and a vendor's own tag set, with a small
// floor so even a partial answer set surfaces something useful.

import {
  STYLE_QUIZ_QUESTIONS,
  SEED_MATCHABLE_VENDORS,
  MATCH_CATEGORIES,
  type MatchableVendor,
  type VendorMatchCategory,
} from "./style-quiz-seed";
import type {
  StyleDimension,
  StyleQuizResponses,
} from "@/stores/style-quiz-store";

export interface VendorMatch {
  vendor: MatchableVendor;
  /** 0–100 chemistry score. */
  score: number;
  /** Tags shared between couple and vendor — drives the explainer line. */
  matchedTags: string[];
}

function coupleTags(responses: StyleQuizResponses): Set<string> {
  const tags = new Set<string>();
  for (const q of STYLE_QUIZ_QUESTIONS) {
    const optionId = responses[q.id as StyleDimension];
    if (!optionId) continue;
    const option = q.options.find((o) => o.id === optionId);
    if (!option) continue;
    for (const t of option.tags) tags.add(t);
  }
  return tags;
}

function scoreVendor(
  vendor: MatchableVendor,
  tags: Set<string>,
): VendorMatch {
  if (vendor.tags.length === 0)
    return { vendor, score: 0, matchedTags: [] };
  const matched = vendor.tags.filter((t) => tags.has(t));
  // Pure overlap rate over the vendor's tags. We add a soft floor so a
  // partly answered quiz still shows useful suggestions, then bump
  // anything with at least one match into the >=70% range to keep the
  // chemistry-score copy aspirational without being misleading.
  const raw = matched.length / vendor.tags.length;
  const floor = matched.length > 0 ? 0.7 : 0.5;
  const blended = Math.max(raw, floor + raw * 0.25);
  const score = Math.round(Math.min(0.99, blended) * 100);
  return { vendor, score, matchedTags: matched };
}

export function matchVendors(
  responses: StyleQuizResponses,
  perCategory = 3,
): Record<VendorMatchCategory, VendorMatch[]> {
  const tags = coupleTags(responses);
  const out: Record<VendorMatchCategory, VendorMatch[]> = {
    Photography: [],
    "Décor & Florals": [],
    "Music & DJ": [],
    Catering: [],
  };
  for (const cat of MATCH_CATEGORIES) {
    const inCat = SEED_MATCHABLE_VENDORS.filter((v) => v.category === cat);
    const ranked = inCat
      .map((v) => scoreVendor(v, tags))
      .sort((a, b) => b.score - a.score)
      .slice(0, perCategory);
    out[cat] = ranked;
  }
  return out;
}

export function isQuizComplete(responses: StyleQuizResponses): boolean {
  return STYLE_QUIZ_QUESTIONS.every(
    (q) => !!responses[q.id as StyleDimension],
  );
}

export function quizProgress(responses: StyleQuizResponses): {
  answered: number;
  total: number;
} {
  const total = STYLE_QUIZ_QUESTIONS.length;
  const answered = STYLE_QUIZ_QUESTIONS.reduce(
    (acc, q) => acc + (responses[q.id as StyleDimension] ? 1 : 0),
    0,
  );
  return { answered, total };
}
