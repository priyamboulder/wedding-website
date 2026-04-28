// ── Notes & Ideas seed data ────────────────────────────────────────────────
// First-run content so the four tabs feel lived-in instead of empty. Mirrors
// the example notebook in the spec (seating chart, mehendi design, letter to
// Raj, caterer follow-up) and seeds a handful of clip boards + a weekly prompt.

import type {
  ClipBoard,
  Clip,
  Note,
  NotesIdeasState,
  QuickCapture,
  Reflection,
  ReflectionPrompt,
} from "@/types/notes-ideas";

// ── Tab 1 seed — All Notes ─────────────────────────────────────────────────

const NOTES_SEED: Note[] = [
  {
    id: "note-seating-chart",
    title: "Seating chart nightmare",
    body:
      "We can't put Uncle Raj near Bua. They haven't spoken since 2019. Ask Urvashi how to handle — maybe split them across the stage and the dance floor, with a buffer table of cousins between.",
    tags: ["to_discuss"],
    isPrivate: false,
    createdAt: "2026-04-15T21:14:00.000Z",
    updatedAt: "2026-04-15T21:14:00.000Z",
  },
  {
    id: "note-mehendi-design",
    title: "Mehendi design idea",
    body:
      "Saw this on Instagram — love the way the gajra wraps into the design at the wrist. Save for the mehendi consult next month.",
    tags: ["ideas"],
    link: {
      url: "https://instagram.com/p/C4xYz1kAbCd",
      label: "instagram.com/p/C4xYz1kAbCd",
    },
    isPrivate: false,
    createdAt: "2026-04-12T19:02:00.000Z",
    updatedAt: "2026-04-12T19:02:00.000Z",
  },
  {
    id: "note-letter-to-raj",
    title: "Letter to Raj",
    body:
      "I know this planning has been crazy but I just want to say I love how patient you've been with all of this. I can't wait to marry you. I'll finish this later.",
    tags: ["personal"],
    isPrivate: true,
    createdAt: "2026-04-10T23:48:00.000Z",
    updatedAt: "2026-04-10T23:48:00.000Z",
  },
  {
    id: "note-caterer-followup",
    title: "Caterer follow-up",
    body:
      "Royal Indian Kitchen hasn't sent revised menu. Ping them by Friday or consider backup. Also ask about the live dosa station — still on the table?",
    tags: ["vendor_notes"],
    isPrivate: false,
    createdAt: "2026-04-08T14:30:00.000Z",
    updatedAt: "2026-04-08T14:30:00.000Z",
  },
];

// ── Tab 2 seed — Quick Capture ─────────────────────────────────────────────

const CAPTURES_SEED: QuickCapture[] = [
  {
    id: "qc-reel-entrance",
    kind: "link",
    content: "https://instagram.com/reel/entrance-idea",
    previewLabel: "Instagram reel — reception entrance idea",
    capturedAt: "2026-04-19T21:12:00.000Z",
  },
  {
    id: "qc-dosa",
    kind: "text",
    content: "Ask caterer about live dosa station",
    capturedAt: "2026-04-18T10:05:00.000Z",
  },
  {
    id: "qc-fabric",
    kind: "image",
    content: "",
    previewLabel: "Photo — saw this fabric at the store",
    capturedAt: "2026-04-16T16:41:00.000Z",
  },
];

// ── Tab 3 seed — Inspiration Clips (boards + a few clips) ──────────────────

const BOARDS_SEED: ClipBoard[] = [
  {
    id: "board-decor",
    name: "Décor ideas",
    destination: "decor",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "board-outfits",
    name: "Outfit inspo",
    destination: "wardrobe",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "board-food",
    name: "Food & presentation",
    destination: "catering",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "board-mehendi",
    name: "Mehendi designs",
    destination: "mehndi",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "board-poses",
    name: "Photo poses",
    destination: "photography",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "board-misc",
    name: "Misc",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
];

const CLIPS_SEED: Clip[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `clip-decor-${i + 1}`,
    boardId: "board-decor",
    title: i % 3 === 0 ? "Suspended marigold ceiling" : undefined,
    savedAt: "2026-03-01T10:00:00.000Z",
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `clip-outfit-${i + 1}`,
    boardId: "board-outfits",
    savedAt: "2026-03-05T10:00:00.000Z",
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `clip-food-${i + 1}`,
    boardId: "board-food",
    savedAt: "2026-03-06T10:00:00.000Z",
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `clip-mehendi-${i + 1}`,
    boardId: "board-mehendi",
    savedAt: "2026-03-08T10:00:00.000Z",
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `clip-poses-${i + 1}`,
    boardId: "board-poses",
    savedAt: "2026-03-10T10:00:00.000Z",
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `clip-misc-${i + 1}`,
    boardId: "board-misc",
    savedAt: "2026-03-12T10:00:00.000Z",
  })),
];

// ── Tab 4 seed — Reflections + prompts ─────────────────────────────────────

export const REFLECTION_PROMPT_LIBRARY: string[] = [
  "What's one moment from this week's planning that made you laugh?",
  "What's one tradition you're including because it genuinely matters to you?",
  "What's a conversation with your partner that changed how you're planning?",
  "Describe the moment you found your wedding outfit.",
  "What do you want to remember about this time, 10 years from now?",
  "Write a note to your partner that they'll read on the wedding morning.",
  "What are you most nervous about? What are you most excited about?",
  "Write a letter to yourself on your wedding day.",
];

const CURRENT_PROMPT: ReflectionPrompt = {
  weekOf: "2026-04-20",
  prompt: "What's one moment from this week's planning that made you laugh?",
};

const REFLECTIONS_SEED: Reflection[] = [
  {
    id: "refl-week-apr-7",
    weekOf: "2026-04-06",
    prompt: "What are you most nervous about? What are you most excited about?",
    body:
      "The thing I'm most nervous about is honestly the ceremony — I want it to feel sacred and special, not rushed. I'm most excited about the Sangeet. Kavya and the girls have been rehearsing a surprise dance and I secretly know about it but I'm going to cry anyway.",
    author: "Priya",
    writtenAt: "2026-04-12T22:04:00.000Z",
  },
  {
    id: "refl-week-mar-31",
    weekOf: "2026-03-30",
    prompt: "Write a letter to yourself on your wedding day.",
    body:
      "Dear future-married-me, I know today is going to be chaos and you're going to want to cry at least six times. Let yourself. Eat something before the ceremony. Don't argue with Mom about the flower placement. And when you see Raj under the mandap, stop thinking about the timeline for one second and actually look at him.",
    author: "Priya",
    writtenAt: "2026-04-04T23:11:00.000Z",
  },
];

// ── Full default state ─────────────────────────────────────────────────────

export const DEFAULT_NOTES_IDEAS: NotesIdeasState = {
  notes: NOTES_SEED,
  captures: CAPTURES_SEED,
  boards: BOARDS_SEED,
  clips: CLIPS_SEED,
  reflections: REFLECTIONS_SEED,
  promptLibrary: REFLECTION_PROMPT_LIBRARY,
  currentPrompt: CURRENT_PROMPT,
};
