// Static Shoe Game question bank, tagged by vibe.
// Used to assemble a custom set per the user's selected length and vibe,
// before optionally appending AI-generated couple-specific questions.

export type Vibe = "wholesome" | "roast" | "mix";
export type Length = 5 | 10 | 15;

interface QuestionEntry {
  text: string;
  vibe: "wholesome" | "roast";
}

const BANK: QuestionEntry[] = [
  // ── wholesome ────────────────────────────────────────────────────────────
  { text: "Who said \"I love you\" first?", vibe: "wholesome" },
  { text: "Who is the better cook?", vibe: "wholesome" },
  { text: "Who is the better dancer?", vibe: "wholesome" },
  { text: "Who suggested the first date?", vibe: "wholesome" },
  { text: "Who picked the wedding colors?", vibe: "wholesome" },
  { text: "Who planned the proposal?", vibe: "wholesome" },
  { text: "Who is more romantic?", vibe: "wholesome" },
  { text: "Who is the better gift-giver?", vibe: "wholesome" },
  { text: "Who is more patient?", vibe: "wholesome" },
  { text: "Who handles emergencies better?", vibe: "wholesome" },
  { text: "Who is more organized?", vibe: "wholesome" },
  { text: "Who is the early bird, and who is the night owl?", vibe: "wholesome" },
  { text: "Who introduced the other to their favorite hobby?", vibe: "wholesome" },
  { text: "Who is the better packer for trips?", vibe: "wholesome" },
  { text: "Who first met the in-laws?", vibe: "wholesome" },
  { text: "Who is the better listener?", vibe: "wholesome" },
  { text: "Who is more likely to plan a surprise date?", vibe: "wholesome" },
  { text: "Who learned a recipe from the other's family first?", vibe: "wholesome" },
  { text: "Who is more excited about having kids?", vibe: "wholesome" },
  { text: "Who picked the honeymoon destination?", vibe: "wholesome" },
  { text: "Who chose the first apartment?", vibe: "wholesome" },
  { text: "Who is better with finances?", vibe: "wholesome" },
  { text: "Who is the designated driver on family trips?", vibe: "wholesome" },
  { text: "Who taught the other a Bollywood dance step?", vibe: "wholesome" },
  { text: "Who is more likely to remember a birthday without a reminder?", vibe: "wholesome" },
  { text: "Who is the better photographer of the two?", vibe: "wholesome" },
  { text: "Who introduced the other to their favorite show?", vibe: "wholesome" },
  { text: "Who handles the kitchen during a dinner party?", vibe: "wholesome" },
  { text: "Who is more likely to bring home flowers \"just because\"?", vibe: "wholesome" },
  { text: "Who is the bigger family person?", vibe: "wholesome" },
  { text: "Who is more likely to call their mom every day?", vibe: "wholesome" },
  { text: "Who first said \"I want to marry you\"?", vibe: "wholesome" },

  // ── roast-worthy ─────────────────────────────────────────────────────────
  { text: "Who takes longer to get ready?", vibe: "roast" },
  { text: "Who controls the thermostat?", vibe: "roast" },
  { text: "Who will be stricter with the kids?", vibe: "roast" },
  { text: "Who spends more money?", vibe: "roast" },
  { text: "Who manages the family WhatsApp group?", vibe: "roast" },
  { text: "Who is more likely to be late to their own wedding?", vibe: "roast" },
  { text: "Who cried more during wedding planning?", vibe: "roast" },
  { text: "Who is more stubborn?", vibe: "roast" },
  { text: "Who forgets the anniversary?", vibe: "roast" },
  { text: "Who picks the restaurant?", vibe: "roast" },
  { text: "Who apologizes first after a fight?", vibe: "roast" },
  { text: "Who is the better driver?", vibe: "roast" },
  { text: "Who has more shoes?", vibe: "roast" },
  { text: "Who is more likely to embarrass the other in public?", vibe: "roast" },
  { text: "Who would survive longer without their phone?", vibe: "roast" },
  { text: "Who hogs the blanket?", vibe: "roast" },
  { text: "Who snores louder?", vibe: "roast" },
  { text: "Who loses their keys more often?", vibe: "roast" },
  { text: "Who is more likely to fall asleep during a movie?", vibe: "roast" },
  { text: "Who is the bigger gossip?", vibe: "roast" },
  { text: "Who has the messier closet?", vibe: "roast" },
  { text: "Who is the bigger backseat driver?", vibe: "roast" },
  { text: "Who screenshots more from the family group chat?", vibe: "roast" },
  { text: "Who is more dramatic when sick?", vibe: "roast" },
  { text: "Who orders the most off Amazon at 1 a.m.?", vibe: "roast" },
  { text: "Who is more likely to start a Netflix episode without the other?", vibe: "roast" },
  { text: "Who has the worst sense of direction?", vibe: "roast" },
  { text: "Who is the slower texter?", vibe: "roast" },
  { text: "Who takes more selfies?", vibe: "roast" },
  { text: "Who is the bigger backseat planner at family events?", vibe: "roast" },
  { text: "Who is more likely to forget to RSVP?", vibe: "roast" },
  { text: "Who is louder when they laugh?", vibe: "roast" },
  { text: "Who is more likely to argue with an aunty over dinner?", vibe: "roast" },
  { text: "Who has the bigger sweet tooth?", vibe: "roast" },
  { text: "Who is the bigger lightweight at the bar?", vibe: "roast" },
  { text: "Who is more likely to start dancing first at a sangeet?", vibe: "roast" },
  { text: "Who steals fries off the other's plate?", vibe: "roast" },
  { text: "Who has more group chats they're ignoring?", vibe: "roast" },
];

const QUESTION_COUNT_BY_LENGTH: Record<Length, number> = {
  5: 15,
  10: 20,
  15: 25,
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuestionSet(opts: { length: Length; vibe: Vibe }): string[] {
  const target = QUESTION_COUNT_BY_LENGTH[opts.length];

  if (opts.vibe === "wholesome") {
    const pool = BANK.filter((q) => q.vibe === "wholesome");
    return shuffle(pool).slice(0, target).map((q) => q.text);
  }

  if (opts.vibe === "roast") {
    const pool = BANK.filter((q) => q.vibe === "roast");
    return shuffle(pool).slice(0, target).map((q) => q.text);
  }

  // mix: roughly 60% roast, 40% wholesome — leans playful, the part guests laugh at.
  const roastCount = Math.round(target * 0.6);
  const wholesomeCount = target - roastCount;
  const roast = shuffle(BANK.filter((q) => q.vibe === "roast")).slice(0, roastCount);
  const wholesome = shuffle(BANK.filter((q) => q.vibe === "wholesome")).slice(0, wholesomeCount);
  return shuffle([...roast, ...wholesome]).map((q) => q.text);
}

export const QUESTION_BANK_SIZE = BANK.length;
