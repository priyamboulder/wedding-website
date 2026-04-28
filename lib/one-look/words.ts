// ── One Look word options (seeded, immutable in v1) ───────────────────────
// Grouped by sentiment. Order within each group drives visual priority on the
// chip selector. Admin editing is out of scope for v1 — ship a curated list.

import type { OneLookWordOption } from "@/types/one-look";

function opt(
  word: string,
  sentiment: OneLookWordOption["sentiment"],
  sortOrder: number,
): OneLookWordOption {
  return {
    id: `word_${word.replace(/[^a-z0-9]+/g, "_").toLowerCase()}`,
    word,
    sentiment,
    sortOrder,
    isActive: true,
  };
}

export const ONE_LOOK_WORDS: OneLookWordOption[] = [
  // Positive (1–19)
  opt("magic", "positive", 1),
  opt("obsessed", "positive", 2),
  opt("flawless", "positive", 3),
  opt("lifesaver", "positive", 4),
  opt("stunning", "positive", 5),
  opt("above & beyond", "positive", 6),
  opt("creative genius", "positive", 7),
  opt("worth every penny", "positive", 8),
  opt("exceeded expectations", "positive", 9),
  opt("would rebook", "positive", 10),
  opt("calming", "positive", 11),
  opt("effortless", "positive", 12),

  // Neutral (20–29)
  opt("solid", "neutral", 20),
  opt("fine", "neutral", 21),
  opt("as expected", "neutral", 22),
  opt("professional", "neutral", 23),
  opt("decent", "neutral", 24),

  // Negative (30–39)
  opt("overpriced", "negative", 30),
  opt("late", "negative", 31),
  opt("unresponsive", "negative", 32),
  opt("disappointing", "negative", 33),
  opt("wouldn’t rebook", "negative", 34),
  opt("stressful", "negative", 35),
];

export function lookupWord(word: string): OneLookWordOption | undefined {
  const normalized = word.trim().toLowerCase();
  return ONE_LOOK_WORDS.find((w) => w.word.toLowerCase() === normalized);
}

export function sentimentForWord(word: string): OneLookWordOption["sentiment"] {
  return lookupWord(word)?.sentiment ?? "neutral";
}
