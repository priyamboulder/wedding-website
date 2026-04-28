// ── Per-event vibe + attire quiz seeds ───────────────────────────────────
// The Vibe & Palette and Attire tabs each open with a short contextual
// quiz. Questions adapt by event type — a Sangeet's quiz feels different
// from a Pithi's. Answers drop into EventRecord.vibeQuizAnswers /
// attireQuizAnswers and are read back into the Brief during assembly.
//
// Shape is deliberately lightweight: each question is either a set of
// visual choices or a short free-text line. All steps are skippable.

import type { EventType } from "@/types/events";

export type QuizQuestionKind = "choice" | "freetext";

export interface QuizChoice {
  value: string;
  label: string;
  // Short secondary line shown under the label, optional.
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  kind: QuizQuestionKind;
  prompt: string;
  // For choice questions — the visual options.
  choices?: QuizChoice[];
  // For freetext — placeholder text.
  placeholder?: string;
}

// Generic fallback used for event types not in the per-type table. Keeps
// the tabs functional even for custom events.
const GENERIC_VIBE: QuizQuestion[] = [
  {
    id: "arrival_feel",
    kind: "choice",
    prompt: "When guests walk in, what hits them first?",
    choices: [
      { value: "color", label: "Colour & light everywhere", hint: "Saturated, floral, joyful" },
      { value: "candle", label: "Intimate candlelit glow", hint: "Warm, soft, moody" },
      { value: "stage", label: "Dramatic stage presence", hint: "Architectural, bold" },
      { value: "garden", label: "Garden party energy", hint: "Natural, open, relaxed" },
    ],
  },
  {
    id: "formality_vibe",
    kind: "choice",
    prompt: "How dressed up is everyone?",
    choices: [
      { value: "black_tie", label: "Black tie glamour" },
      { value: "festive", label: "Festive & colourful" },
      { value: "boho", label: "Boho chic & relaxed" },
      { value: "themed", label: "Themed costumes" },
    ],
  },
  {
    id: "food_drink",
    kind: "choice",
    prompt: "Food & drink vibe?",
    choices: [
      { value: "plated", label: "Plated dinner before dancing" },
      { value: "stations", label: "Grazing stations all night" },
      { value: "street", label: "Street food carts & cocktails" },
      { value: "family", label: "Family-style feasting" },
    ],
  },
  {
    id: "movie_reference",
    kind: "freetext",
    prompt: "If this event were a movie, which one?",
    placeholder: "Crazy Rich Asians, Moulin Rouge, Monsoon Wedding…",
  },
];

const SANGEET_VIBE: QuizQuestion[] = [
  {
    id: "arrival_feel",
    kind: "choice",
    prompt: "When guests walk in, what hits them first?",
    choices: [
      { value: "color", label: "Colour & light everywhere" },
      { value: "candle", label: "Intimate candlelit glow" },
      { value: "stage", label: "Dramatic stage presence" },
      { value: "garden", label: "Garden party energy" },
    ],
  },
  {
    id: "dance_floor",
    kind: "choice",
    prompt: "What's the dance floor energy?",
    choices: [
      { value: "bollywood", label: "Bollywood all night" },
      { value: "mix", label: "Mix of everything" },
      { value: "choreo", label: "Choreographed performances" },
      { value: "open", label: "Open floor, DJ-led" },
    ],
  },
  {
    id: "formality_vibe",
    kind: "choice",
    prompt: "How dressed up is everyone?",
    choices: [
      { value: "black_tie", label: "Black tie glamour" },
      { value: "festive", label: "Festive & colourful" },
      { value: "boho", label: "Boho chic & relaxed" },
      { value: "themed", label: "Themed costumes" },
    ],
  },
  {
    id: "food_drink",
    kind: "choice",
    prompt: "Food & drink vibe?",
    choices: [
      { value: "plated", label: "Plated dinner before dancing" },
      { value: "stations", label: "Grazing stations all night" },
      { value: "street", label: "Street food carts & cocktails" },
      { value: "family", label: "Family-style feasting" },
    ],
  },
  {
    id: "movie_reference",
    kind: "freetext",
    prompt: "If this night were a movie, which one?",
    placeholder: "Moulin Rouge, Crazy Rich Asians, Mamma Mia, Great Gatsby…",
  },
];

const HALDI_VIBE: QuizQuestion[] = [
  {
    id: "intimacy",
    kind: "choice",
    prompt: "How intimate should this feel?",
    choices: [
      { value: "immediate", label: "Just immediate family on the lawn" },
      { value: "close", label: "Close friends & family, ~50 people" },
      { value: "everyone", label: "A proper party with everyone" },
    ],
  },
  {
    id: "aesthetic",
    kind: "choice",
    prompt: "Aesthetic?",
    choices: [
      { value: "traditional", label: "Traditional marigolds & turmeric" },
      { value: "boho", label: "Boho garden" },
      { value: "minimal", label: "Minimalist & modern" },
      { value: "maxi", label: "Colourful maximalism" },
    ],
  },
  {
    id: "music",
    kind: "choice",
    prompt: "Music?",
    choices: [
      { value: "dhol", label: "Live dhol" },
      { value: "acoustic", label: "Acoustic & soft" },
      { value: "playlist", label: "Bollywood playlist" },
      { value: "none", label: "No music, just laughter" },
    ],
  },
  {
    id: "setting",
    kind: "choice",
    prompt: "Setting?",
    choices: [
      { value: "lawn", label: "Outdoor lawn or garden" },
      { value: "courtyard", label: "Courtyard" },
      { value: "poolside", label: "Poolside" },
      { value: "indoor", label: "Indoor (weather backup)" },
    ],
  },
  {
    id: "moment",
    kind: "freetext",
    prompt: "The moment you want most?",
    placeholder: "Everyone's hands covered in turmeric, sun through the trees, grandmother applying haldi…",
  },
];

const VIBE_QUIZZES: Partial<Record<EventType, QuizQuestion[]>> = {
  sangeet: SANGEET_VIBE,
  garba: SANGEET_VIBE,
  reception: SANGEET_VIBE,
  haldi: HALDI_VIBE,
  pithi: HALDI_VIBE,
  mehendi: HALDI_VIBE,
};

export function getVibeQuiz(type: EventType): QuizQuestion[] {
  return VIBE_QUIZZES[type] ?? GENERIC_VIBE;
}

// ── Attire quiz (shared across event types) ──────────────────────────────
// The spec's 4-question attire quiz. Same questions apply to every event;
// the couple's answers steer the dress code, color guidance, cultural
// expectation, and coordination level.
export const ATTIRE_QUIZ: QuizQuestion[] = [
  {
    id: "formality",
    kind: "choice",
    prompt: "How formal is this event?",
    choices: [
      { value: "black_tie", label: "Ultra-formal", hint: "Black tie, heaviest register" },
      { value: "formal", label: "Festive & dressy", hint: "Full Indian formal" },
      { value: "semi_formal", label: "Smart casual", hint: "Dressy but not stiff" },
      { value: "casual", label: "Relaxed & easy", hint: "Come-as-you-are" },
    ],
  },
  {
    id: "color_guidance",
    kind: "choice",
    prompt: "Colour guidance for guests?",
    choices: [
      { value: "specific_palette", label: "Specific palette", hint: "Wear these colours" },
      { value: "general_vibe", label: "General vibe", hint: "Jewel tones, pastels, etc." },
      { value: "code_only", label: "Dress code only", hint: "No colour guidance" },
      { value: "themed", label: "Themed", hint: "White party, all-black, etc." },
    ],
  },
  {
    id: "cultural_expectation",
    kind: "choice",
    prompt: "Cultural attire expectations?",
    choices: [
      { value: "traditional_required", label: "Traditional required" },
      { value: "traditional_encouraged", label: "Traditional encouraged" },
      { value: "western_preferred", label: "Western preferred" },
      { value: "mixed", label: "Mix of both" },
      { value: "no_preference", label: "No preference" },
    ],
  },
  {
    id: "coordination",
    kind: "choice",
    prompt: "How coordinated should the wedding party look?",
    choices: [
      { value: "exactly_matched", label: "Exactly matched" },
      { value: "same_palette", label: "Same palette, own style" },
      { value: "same_vibe", label: "Same vibe, full freedom" },
      { value: "no_wedding_party", label: "No wedding party" },
    ],
  },
];
