import type { Review } from "./seed";

// A curated list of praise phrases worth surfacing. Multi-word phrases are
// matched as literals; single words are matched on whole-word boundaries.
// Phrases are chosen to be specific enough to feel like a real compliment
// rather than a generic filler word.
const PRAISE_PHRASES: string[] = [
  "exceeded expectations",
  "worth every rupee",
  "worth the wait",
  "responsive",
  "creative",
  "warm",
  "calm",
  "professional",
  "patient",
  "gorgeous",
  "beautiful",
  "stunning",
  "editorial",
  "candid",
];

export type PraiseKeyword = {
  label: string;
  count: number;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractPraiseKeywords(
  reviews: Review[],
  limit = 6,
): PraiseKeyword[] {
  const counts = new Map<string, number>();
  for (const phrase of PRAISE_PHRASES) {
    const pattern = phrase.includes(" ")
      ? new RegExp(escapeRegex(phrase), "gi")
      : new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi");
    let total = 0;
    for (const r of reviews) {
      const haystack = `${r.title} ${r.body}`;
      const matches = haystack.match(pattern);
      if (matches) total += matches.length;
    }
    if (total > 0) counts.set(phrase, total);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}
