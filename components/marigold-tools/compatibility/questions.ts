// Static question bank for the compatibility tool. Both partners answer the
// same 10 questions. Each question carries a topic label that's used in the
// result card ("Worth a conversation: <topic>").

export type Letter = "A" | "B" | "C" | "D";

export interface Question {
  id: number;
  prompt: string;
  topic: string;
  agreementHook: string; // shown when both partners chose the same answer
  choices: Record<Letter, string>;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "Who is the bigger planner?",
    topic: "the planning split",
    agreementHook: "agree on who's driving the binder",
    choices: {
      A: "Me",
      B: "My partner",
      C: "We're equal",
      D: "Neither — chaos reigns",
    },
  },
  {
    id: 2,
    prompt: "Ideal honeymoon?",
    topic: "the honeymoon",
    agreementHook: "agree on the post-wedding escape",
    choices: {
      A: "Beach, infinity pool, nowhere to be",
      B: "City-hopping, food, culture",
      C: "Adventure — hike, explore",
      D: "Spa resort, spa again, more spa",
    },
  },
  {
    id: 3,
    prompt: "Wedding budget approach?",
    topic: "the budget approach",
    agreementHook: "agree on the money posture",
    choices: {
      A: "Spend what we need",
      B: "Strategic about every decision",
      C: "Defer to whoever cares more",
      D: "Haven't thought about it",
    },
  },
  {
    id: 4,
    prompt: "Who will cry first at the wedding?",
    topic: "who's getting weepy first",
    agreementHook: "agree on who's crying first",
    choices: {
      A: "Me",
      B: "My partner",
      C: "Both of us",
      D: "Neither — we're stoic",
    },
  },
  {
    id: 5,
    prompt: "Guest list size?",
    topic: "the guest list",
    agreementHook: "agree on the headcount",
    choices: {
      A: "Intimate — close friends and family only",
      B: "Medium — everyone who matters",
      C: "Large — this is a celebration",
      D: "Whatever the families decide",
    },
  },
  {
    id: 6,
    prompt: "Wedding photos style?",
    topic: "the photography style",
    agreementHook: "agree on the photo vibe",
    choices: {
      A: "Editorial, moody, artistic",
      B: "Bright, joyful, candid",
      C: "Traditional, posed, classic",
      D: "All of the above",
    },
  },
  {
    id: 7,
    prompt: "Who manages vendor relationships?",
    topic: "vendor management",
    agreementHook: "agree on who's running point with vendors",
    choices: {
      A: "Me",
      B: "My partner",
      C: "We split by category",
      D: "Whoever answers the phone first",
    },
  },
  {
    id: 8,
    prompt: "First dance song vibe?",
    topic: "the first-dance song",
    agreementHook: "agree on the first-dance vibe",
    choices: {
      A: "Romantic Bollywood classic",
      B: "Modern Hindi/English crossover",
      C: "Pure English — something timeless",
      D: "We're not doing a first dance",
    },
  },
  {
    id: 9,
    prompt: "Family involvement in planning?",
    topic: "family involvement",
    agreementHook: "agree on how loud the family voice is",
    choices: {
      A: "Very — we want their input",
      B: "Moderate — some areas",
      C: "Minimal — this is our wedding",
      D: "Whatever keeps the peace",
    },
  },
  {
    id: 10,
    prompt: "Wedding planning feels…",
    topic: "how planning is feeling",
    agreementHook: "agree on the emotional weather",
    choices: {
      A: "Exciting",
      B: "Overwhelming",
      C: "Manageable",
      D: "Like a second job",
    },
  },
];

const ORDER: Letter[] = ["A", "B", "C", "D"];

function distance(a: Letter, b: Letter): number {
  return Math.abs(ORDER.indexOf(a) - ORDER.indexOf(b));
}

const POINTS_BY_DISTANCE: Record<number, number> = {
  0: 10,
  1: 7,
  2: 4,
  3: 1,
};

export interface PerQuestionResult {
  question: Question;
  p1: Letter;
  p2: Letter;
  distance: number;
  points: number;
}

export interface CompatibilityResult {
  score: number; // 0..100
  perQuestion: PerQuestionResult[];
  agreements: PerQuestionResult[]; // distance === 0
  biggestDivergence: PerQuestionResult | null;
}

export function compareAnswers(
  p1: Letter[],
  p2: Letter[],
): CompatibilityResult {
  const perQuestion: PerQuestionResult[] = QUESTIONS.map((q, i) => {
    const a = p1[i];
    const b = p2[i];
    const d = distance(a, b);
    return {
      question: q,
      p1: a,
      p2: b,
      distance: d,
      points: POINTS_BY_DISTANCE[d],
    };
  });

  const score = perQuestion.reduce((s, r) => s + r.points, 0);
  const agreements = perQuestion.filter((r) => r.distance === 0);

  let biggestDivergence: PerQuestionResult | null = null;
  for (const r of perQuestion) {
    if (r.distance === 0) continue;
    if (!biggestDivergence || r.distance > biggestDivergence.distance) {
      biggestDivergence = r;
    }
  }

  return { score, perQuestion, agreements, biggestDivergence };
}

export interface Tier {
  id: "eerie" | "compatible" | "productive" | "opposites";
  range: [number, number];
  name: string;
  blurb: string;
}

const TIERS: Tier[] = [
  {
    id: "eerie",
    range: [85, 100],
    name: "Eerily Aligned",
    blurb:
      "Either you've been together forever, or you're the same person. The aunties already knew.",
  },
  {
    id: "compatible",
    range: [65, 84],
    name: "Beautifully Compatible",
    blurb:
      "Different enough to be interesting. Similar enough to not fight about venues.",
  },
  {
    id: "productive",
    range: [45, 64],
    name: "Productively Different",
    blurb:
      "You'll balance each other out. That's actually a good thing — better decisions live here.",
  },
  {
    id: "opposites",
    range: [0, 44],
    name: "Opposites Attract",
    blurb:
      "Good news: this makes for a more interesting wedding. Start talking — you've got real material.",
  },
];

export function tierFor(score: number): Tier {
  return TIERS.find((t) => score >= t.range[0] && score <= t.range[1])!;
}

// ── URL encoding ──────────────────────────────────────────────────────────
// Partner 1's answers are encoded as a 10-char string of letters.

const ANSWER_RE = /^[ABCD]{10}$/;

export function encodeAnswers(answers: Letter[]): string {
  return answers.join("");
}

export function decodeAnswers(token: string): Letter[] | null {
  const upper = token.toUpperCase();
  if (!ANSWER_RE.test(upper)) return null;
  return upper.split("") as Letter[];
}
