// ── Daily check-in question bank ────────────────────────────────────────
// A curated rotation of prompts surfaced one-per-day on the dashboard.
// Categorized so we can lean emotional early in planning, practical mid-
// planning, and fun throughout. Selection logic in this file:
//
//   pickQuestionForDate(opts) — returns the question to show today.
//
// Selection rules:
//   • Never repeat a question shown within the last 30 days.
//   • Lean by planning phase (>=270d → emotional, 90–270d → practical,
//     <90d → fun + emotional). Fun is mixed in throughout.
//   • Deterministic per (couple, date) so the same question shows on the
//     same day even if a couple opens the dashboard from two devices.
//
// The bank is intentionally a flat array — adding a new question is a
// single line. `id` is a stable hash of the text so reordering is safe.
//
// Note: kept entirely client-side / static so no server fetch is needed.

export type CheckInCategory =
  | "emotional"
  | "practical"
  | "fun"
  | "partner"
  | "closing";

export interface CheckInQuestion {
  id: string;
  text: string;
  category: CheckInCategory;
}

// Tiny stable hash so question IDs survive reorders / additions.
function hashId(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  }
  return `q_${(h >>> 0).toString(36)}`;
}

function q(text: string, category: CheckInCategory): CheckInQuestion {
  return { id: hashId(text), text, category };
}

export const QUESTION_BANK: CheckInQuestion[] = [
  // ── Emotional / reflective ──
  q("What are you most excited about right now?", "emotional"),
  q("What surprised you this week about planning?", "emotional"),
  q("Describe your dream wedding moment in one sentence.", "emotional"),
  q("What's one thing you want your guests to feel?", "emotional"),
  q("What song reminds you of your partner right now?", "emotional"),
  q("If you could tell your future married self one thing, what would it be?", "emotional"),
  q("What's the best piece of advice someone's given you about your wedding?", "emotional"),
  q("What tradition means the most to you and why?", "emotional"),
  q("Close your eyes. Picture the ceremony. What do you see first?", "emotional"),
  q("What's something small that you want to make sure doesn't get lost in the big plans?", "emotional"),

  // ── Practical / decision-oriented ──
  q("What's the one decision you keep going back and forth on?", "practical"),
  q("What vendor interaction made you feel most confident this week?", "practical"),
  q("Is there anything about the planning that's stressing you out right now?", "practical"),
  q("What did you cross off the list this week that felt really good?", "practical"),
  q("What's one thing you wish you'd known when you started planning?", "practical"),
  q("Are you and your partner aligned right now? On what? Not on what?", "practical"),

  // ── Fun / light ──
  q("What's the walk-in song for your baraat?", "fun"),
  q("Describe your ideal mehndi night playlist in 3 songs.", "fun"),
  q("Rate your current wedding stress level: calm seas to full tornado.", "fun"),
  q("What's the most extra thing on your wish list right now?", "fun"),
  q("If budget were unlimited, what's the one thing you'd add?", "fun"),
  q("What food item MUST be on your menu, non-negotiable?", "fun"),

  // ── Partner-specific ──
  q("What's one thing your partner doesn't know you're planning for them?", "partner"),
  q("What moment in your relationship made you think 'this is the one'?", "partner"),
  q("What does your partner care about most for the wedding?", "partner"),
];

// The closing question only ever fires within the final 3 days before the
// wedding — used for the Year in Review's closing pull-quote.
export const CLOSING_QUESTION: CheckInQuestion = q(
  "Any last words before the big day?",
  "closing",
);

export interface CheckInHistoryEntry {
  questionId: string;
  /** ISO date string (YYYY-MM-DD) — the day this question was shown / answered. */
  date: string;
}

interface PickOptions {
  /** ISO date string for the day to pick a question for (defaults to today). */
  todayIso?: string;
  /** Days until the wedding — drives phase-based weighting. null if unknown. */
  daysUntilWedding: number | null;
  /** Past 30+ days of question history. */
  recentHistory: CheckInHistoryEntry[];
  /** Stable per-couple seed (couple id, names, etc.) so two devices match. */
  seed?: string;
}

const RECENT_WINDOW_DAYS = 30;

function isoToday(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function daysBetweenIso(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

function seededIndex(seed: string, max: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % max;
}

function categoryWeightsFor(daysUntil: number | null): Record<CheckInCategory, number> {
  // Closing is reserved for the final-3-days flow; never weighted here.
  if (daysUntil == null) {
    return { emotional: 2, practical: 2, fun: 2, partner: 1, closing: 0 };
  }
  if (daysUntil >= 270) {
    return { emotional: 4, practical: 1, fun: 2, partner: 2, closing: 0 };
  }
  if (daysUntil >= 90) {
    return { emotional: 2, practical: 4, fun: 2, partner: 1, closing: 0 };
  }
  // Final stretch — pull back to fun + emotional, ease off practical.
  return { emotional: 3, practical: 1, fun: 4, partner: 1, closing: 0 };
}

/**
 * Pick the question for `todayIso`. Returns the closing question when the
 * wedding is within 3 days. Otherwise picks a category by weight, then a
 * question within that category that hasn't been shown in the last 30 days
 * (falling back to the least-recently-shown if every question is recent).
 */
export function pickQuestionForDate(opts: PickOptions): CheckInQuestion {
  const today = opts.todayIso ?? isoToday();
  const seed = `${opts.seed ?? "default"}:${today}`;

  if (opts.daysUntilWedding != null && opts.daysUntilWedding <= 3 && opts.daysUntilWedding >= 0) {
    return CLOSING_QUESTION;
  }

  const recent = new Set(
    opts.recentHistory
      .filter((h) => Math.abs(daysBetweenIso(h.date, today)) <= RECENT_WINDOW_DAYS)
      .map((h) => h.questionId),
  );

  // Last-shown lookup so we can fall back to least-recent when fully blocked.
  const lastShown = new Map<string, string>();
  for (const h of opts.recentHistory) {
    const prev = lastShown.get(h.questionId);
    if (!prev || h.date > prev) lastShown.set(h.questionId, h.date);
  }

  const weights = categoryWeightsFor(opts.daysUntilWedding);
  const categories: CheckInCategory[] = ["emotional", "practical", "fun", "partner"];

  // Build a weighted pool of candidate categories, then deterministically
  // rotate through them based on the seed.
  const pool: CheckInCategory[] = [];
  for (const cat of categories) {
    for (let i = 0; i < weights[cat]; i++) pool.push(cat);
  }
  if (pool.length === 0) pool.push("emotional");

  const startIdx = seededIndex(seed, pool.length);

  for (let attempt = 0; attempt < pool.length; attempt++) {
    const cat = pool[(startIdx + attempt) % pool.length];
    const inCat = QUESTION_BANK.filter((qq) => qq.category === cat);
    const fresh = inCat.filter((qq) => !recent.has(qq.id));
    if (fresh.length > 0) {
      return fresh[seededIndex(`${seed}:${cat}`, fresh.length)];
    }
  }

  // Everything in every category is "recent" — pick the least-recently-shown
  // overall, ignoring closing (which is reserved).
  const eligible = QUESTION_BANK.slice();
  eligible.sort((a, b) => {
    const la = lastShown.get(a.id) ?? "0000-00-00";
    const lb = lastShown.get(b.id) ?? "0000-00-00";
    return la.localeCompare(lb);
  });
  return eligible[0] ?? QUESTION_BANK[0];
}

export function findQuestionById(id: string): CheckInQuestion | null {
  if (id === CLOSING_QUESTION.id) return CLOSING_QUESTION;
  return QUESTION_BANK.find((q) => q.id === id) ?? null;
}
