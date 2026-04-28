// ── Photography → Vision & Mood onboarding quiz ───────────────────────────
// 5 questions, ~2 minutes. Each question addresses one aesthetic axis the
// couple needs to articulate before they meet a photographer. Output
// becomes: a narrative brief (Cormorant italic), 5 derived swatches,
// style keywords, a labeled color/tone position, and seeded moodboard
// pins categorized under section "Quiz picks".

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

// ── Keys persisted outside the stores ─────────────────────────────────────
export const PHOTO_COLOR_TONE_KEY = "ananya:photography-color-tone";
export const PHOTO_BRIEF_KEY = "ananya:photography-brief";
export const PHOTO_SWATCHES_KEY = "ananya:photography-swatches";
export const PHOTO_TONE_SCALE_KEY = "ananya:photography-tone-scale";

// ── Q1. Style grid options ────────────────────────────────────────────────
const STYLE_OPTIONS = [
  {
    value: "candid",
    label: "Candid mid-laugh",
    image_url:
      "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
  },
  {
    value: "portraiture",
    label: "Posed portrait",
    image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
  },
  {
    value: "detail",
    label: "Embroidery close-up",
    image_url:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=640&q=70",
  },
  {
    value: "editorial",
    label: "Cinematic wide",
    image_url:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&q=70",
  },
  {
    value: "documentary",
    label: "Getting-ready moment",
    image_url:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=70",
  },
  {
    value: "fashion",
    label: "Dramatic lighting",
    image_url:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=640&q=70",
  },
];

// ── Q2. Tone labels (0-100 slider) ────────────────────────────────────────
function toneLabel(v: number): string {
  if (v <= 30) return `${v}/100 — Warm & golden, sun-drenched`;
  if (v <= 60) return `${v}/100 — Balanced & true to life`;
  return `${v}/100 — Cool, moody & desaturated`;
}

function toneBucket(v: number): "warm" | "natural" | "moody" {
  if (v <= 30) return "warm";
  if (v <= 60) return "natural";
  return "moody";
}

// ── Q4. Directed vs candid (slider) ───────────────────────────────────────
function directionLabel(v: number): string {
  if (v <= 25) return "Heavily directed — we want posing guidance";
  if (v <= 50) return "Lightly directed — posed key moments, candid fill";
  if (v <= 75) return "Mostly candid — minimal posing";
  return "Pure candid — pretend we aren't there";
}

// ── Q5. Feelings chips (pick 2-3) ─────────────────────────────────────────
const FEELING_OPTIONS = [
  { value: "timeless", label: "Timeless" },
  { value: "joyful", label: "Joyful" },
  { value: "intimate", label: "Intimate" },
  { value: "grand", label: "Grand" },
  { value: "editorial", label: "Editorial" },
  { value: "romantic", label: "Romantic" },
  { value: "dramatic", label: "Dramatic" },
  { value: "effortless", label: "Effortless" },
  { value: "vibrant", label: "Vibrant" },
  { value: "nostalgic", label: "Nostalgic" },
];

// ── Swatch palettes per tone × style combo ────────────────────────────────
// Five swatches: dominant, secondary, accent, neutral, shadow
const SWATCH_PALETTES: Record<
  "warm" | "natural" | "moody",
  [string, string, string, string, string]
> = {
  warm: ["#C9882E", "#EADFC9", "#B08A3E", "#FBF7F1", "#3B2A1E"],
  natural: ["#8A9A7B", "#EADFC9", "#C97B7B", "#FBF7F1", "#3B2A1E"],
  moody: ["#3B2A1E", "#8A7762", "#B8452E", "#EADFC9", "#1B1108"],
};

// ── Build the narrative brief ─────────────────────────────────────────────
// Produces a single Cormorant-italic-friendly paragraph that reflects the
// couple's answers. Run during preview() so it's editable on the Review
// screen, and persisted by apply() so the Vision tab can render it.
function buildBrief(answers: QuizAnswerMap): string {
  const styleA = answers.style;
  const style =
    styleA && styleA.kind === "single" ? styleA.value : "candid";
  const toneA = answers.tone;
  const tone = toneA && toneA.kind === "number" ? toneA.value : 40;
  const toneB = toneBucket(tone);
  const lightA = answers.light;
  const light =
    lightA && lightA.kind === "single" ? lightA.value : "natural-light";
  const directedA = answers.directed;
  const directedVal =
    directedA && directedA.kind === "number" ? directedA.value : 50;
  const feelingsA = answers.feelings;
  const feelings =
    feelingsA && feelingsA.kind === "multi"
      ? feelingsA.values
      : ["joyful", "intimate"];

  const styleClause: Record<string, string> = {
    candid: "candid, in-between moments where people forget the camera",
    portraiture: "classic portraiture with intentional posing",
    detail: "close-up detail work — embroidery, jewelry, hands, textures",
    editorial: "wide, cinematic frames that treat the venue as a stage",
    documentary: "documentary coverage — the getting-ready hours and all",
    fashion: "fashion-magazine lighting with bold, sculpted drama",
  };

  const toneClause: Record<typeof toneB, string> = {
    warm: "a warm, sun-drenched golden palette",
    natural: "a balanced, true-to-life palette",
    moody: "a cool, moody, desaturated palette",
  };

  const lightClause =
    light === "flash"
      ? "bold flash that sculpts the scene"
      : "soft natural light";

  const directedClause =
    directedVal <= 40
      ? "You want direction — tell you where to stand, how to turn, how to hold each other."
      : directedVal >= 70
        ? "You want to be invisible to the camera — no posing, no direction, just presence."
        : "You want a light hand — guided portraits early, candid coverage after.";

  const feelingsClause =
    feelings.length === 0
      ? "joyful and intimate"
      : feelings.length === 1
        ? feelings[0]
        : feelings.length === 2
          ? `${feelings[0]} and ${feelings[1]}`
          : `${feelings.slice(0, -1).join(", ")}, and ${feelings[feelings.length - 1]}`;

  const sentence1 = `You're drawn to ${styleClause[style] ?? styleClause.candid} with ${toneClause[toneB]}, lit by ${lightClause}.`;
  const sentence2 = directedClause;
  const sentence3 = `Your photos should feel ${feelingsClause} — the kind you'd flip through twenty years from now.`;

  return `${sentence1} ${sentence2} ${sentence3}`;
}

// ── Seeded moodboard pin ──────────────────────────────────────────────────
function styleMoodboardPin(
  style: string,
): { url: string; caption: string } | null {
  const opt = STYLE_OPTIONS.find((o) => o.value === style);
  if (!opt) return null;
  return { url: opt.image_url, caption: `${opt.label} — from your quiz` };
}

// ── Schema ────────────────────────────────────────────────────────────────

export const photographyVisionMoodQuiz: QuizSchema = {
  id: "photography:vision_mood:v2",
  version: "2",
  category: "photography",
  subsection: "vision_mood",
  title: "Before we find your photographer",
  intro:
    "Let's discover what your eye is drawn to. Five questions. We'll translate your answers into a brief that a photographer can actually work from.",
  estimated_minutes: 2,
  questions: [
    {
      id: "style",
      prompt: "What draws your eye?",
      helper: "Pick the one that stops your scroll.",
      input: {
        type: "image_grid",
        min: 1,
        max: 1,
        options: STYLE_OPTIONS,
      },
    },
    {
      id: "tone",
      prompt: "Color & tone",
      helper:
        "From warm & sun-drenched to cool & moody — where does your wedding live?",
      input: {
        type: "number_slider",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 35,
        minLabel: "Warm & golden",
        maxLabel: "Cool & moody",
      },
    },
    {
      id: "light",
      prompt: "Light preference",
      helper: "One or the other — they're genuinely different crafts.",
      input: {
        type: "single_select",
        options: [
          { value: "natural-light", label: "Natural light — soft and airy" },
          { value: "flash", label: "Dramatic flash — bold and sculpted" },
        ],
      },
    },
    {
      id: "directed",
      prompt: "Portraiture vs. candid",
      helper:
        "How much direction do you want? Slide toward what feels like you.",
      input: {
        type: "number_slider",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
        minLabel: "Direct us",
        maxLabel: "Pretend we're not there",
      },
    },
    {
      id: "feelings",
      prompt: "What must your wedding photos feel like?",
      helper: "Pick 2 or 3.",
      input: {
        type: "multi_select",
        min: 2,
        max: 3,
        options: FEELING_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    // Brief (primary output)
    items.push({
      fieldKey: "brief",
      label: "Your photography brief",
      value: buildBrief(answers),
      editable: true,
    });

    // Style keywords (built from style + feelings + tone bucket)
    const styleA = answers.style;
    const feelingsA = answers.feelings;
    const toneA = answers.tone;
    const keywords = new Set<string>();
    if (styleA && styleA.kind === "single") keywords.add(styleA.value);
    if (feelingsA && feelingsA.kind === "multi") {
      for (const f of feelingsA.values) keywords.add(f);
    }
    if (toneA && toneA.kind === "number") keywords.add(toneBucket(toneA.value));
    const lightA = answers.light;
    if (lightA && lightA.kind === "single") keywords.add(lightA.value);

    items.push({
      fieldKey: "style_keywords",
      label: "Style keywords",
      value: Array.from(keywords),
      editable: true,
    });

    // Color & tone scale
    if (toneA && toneA.kind === "number") {
      items.push({
        fieldKey: "color_tone",
        label: "Color & tone",
        value: toneLabel(toneA.value),
        editable: true,
      });
    }

    // Directed-vs-candid note
    const directedA = answers.directed;
    if (directedA && directedA.kind === "number") {
      items.push({
        fieldKey: "direction_note",
        label: "Direction preference",
        value: directionLabel(directedA.value),
        editable: true,
      });
    }

    // Moodboard seed
    if (styleA && styleA.kind === "single") {
      const pin = styleMoodboardPin(styleA.value);
      if (pin) {
        items.push({
          fieldKey: "moodboard_pin",
          label: "Moodboard starter pin",
          value: [pin.caption],
          editable: false,
        });
      }
    }

    return items;
  },

  apply: (answers, edited, ctx) => {
    const vision = useVisionStore.getState();
    const workspace = useWorkspaceStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Brief → localStorage so VisionMoodTab can render it inline
    const briefEdit = byKey.get("brief");
    if (typeof window !== "undefined" && briefEdit) {
      const brief =
        typeof briefEdit.value === "string"
          ? briefEdit.value
          : String(briefEdit.value);
      try {
        window.localStorage.setItem(PHOTO_BRIEF_KEY, brief);
      } catch {
        // ignore
      }
    }

    // Style keywords → vision store
    const keywordsEdit = byKey.get("style_keywords");
    if (keywordsEdit && Array.isArray(keywordsEdit.value)) {
      vision.setKeywords(ctx.categorySlug, keywordsEdit.value);
    }

    // Color & tone → localStorage (matches existing tone surface) + scale
    const toneEdit = byKey.get("color_tone");
    const toneA = answers.tone;
    if (typeof window !== "undefined") {
      if (toneEdit && typeof toneEdit.value === "string") {
        try {
          window.localStorage.setItem(PHOTO_COLOR_TONE_KEY, toneEdit.value);
        } catch {
          // ignore
        }
      }
      if (toneA && toneA.kind === "number") {
        try {
          window.localStorage.setItem(PHOTO_TONE_SCALE_KEY, String(toneA.value));
          const bucket = toneBucket(toneA.value);
          window.localStorage.setItem(
            PHOTO_SWATCHES_KEY,
            JSON.stringify(SWATCH_PALETTES[bucket]),
          );
        } catch {
          // ignore
        }
      }
    }

    // Moodboard seed pin
    const pinEdit = byKey.get("moodboard_pin");
    const styleA = answers.style;
    if (pinEdit && styleA && styleA.kind === "single") {
      const pin = styleMoodboardPin(styleA.value);
      if (pin) {
        workspace.addMoodboardItem(ctx.categoryId, pin.url, pin.caption);
      }
    }

    // Direction preference → a workspace note so planner + photographer see it
    const directionEdit = byKey.get("direction_note");
    if (directionEdit && typeof directionEdit.value === "string") {
      workspace.addNote(ctx.categoryId, `Direction: ${directionEdit.value}`);
    }
  },
};
