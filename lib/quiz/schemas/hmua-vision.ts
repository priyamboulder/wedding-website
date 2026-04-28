// ── Hair & Makeup → Vision & Mood quiz ────────────────────────────────────
// Five questions, ~3 minutes. Mirrors the Photography quiz shape: one
// tappable pick per axis, no image grids or multi-selects, so a couple who
// "doesn't know what they want yet" can still finish in under three minutes.
//
// Output flows into three surfaces on the Vision & Mood tab:
//   • The Beauty Brief (narrative paragraph, localStorage-backed).
//   • Style keywords (vision-store, rendered as pills).
//   • The Colour & tone slider + skin-finish slider (localStorage).
// Everything remains editable after the quiz — the quiz seeds, it doesn't lock.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

// ── LocalStorage keys (read by VisionMoodTab) ─────────────────────────────

export const HMUA_BRIEF_KEY = "ananya:hmua-brief";
export const HMUA_COLOUR_DIRECTION_KEY = "ananya:hmua-colour-direction";
export const HMUA_SKIN_FINISH_KEY = "ananya:hmua-skin-finish";

// ── Option content ────────────────────────────────────────────────────────

const FEEL_OPTIONS = [
  { value: "regal", label: "Regal" },
  { value: "ethereal", label: "Ethereal" },
  { value: "bold", label: "Bold" },
  { value: "natural", label: "Natural" },
  { value: "glamorous", label: "Glamorous" },
];

const DAILY_OPTIONS = [
  { value: "minimal", label: "Minimal or none" },
  { value: "light-natural", label: "Light and natural" },
  { value: "full-subtle", label: "Full but subtle" },
  { value: "full-glam", label: "Full glam" },
];

const CEREMONY_OPTIONS = [
  { value: "traditional", label: "Traditional & timeless" },
  { value: "editorial", label: "Modern & editorial" },
  { value: "romantic", label: "Soft & romantic" },
  { value: "dramatic", label: "Dramatic & statement" },
];

const RECEPTION_OPTIONS = [
  { value: "freshened", label: "Same look, freshened up" },
  { value: "bolder", label: "Bolder, more glam" },
  { value: "transformation", label: "Complete transformation" },
  { value: "easy", label: "Keep it easy" },
];

const SKIN_OPTIONS = [
  { value: "long-lasting", label: "Long-lasting, won't budge" },
  { value: "dewy", label: "Dewy, skin-like finish" },
  { value: "lightweight", label: "Lightweight, barely-there" },
  { value: "camera-ready", label: "Camera-ready, full coverage" },
];

// ── Derived mappings ──────────────────────────────────────────────────────

// Skin answer → skin-finish slider position (0 matte ↔ 100 dewy).
const SKIN_TO_FINISH: Record<string, number> = {
  "long-lasting": 20,
  "dewy": 85,
  "lightweight": 70,
  "camera-ready": 35,
};

// Ceremony answer → colour-direction slider position (0 soft/nude ↔ 100 rich/saturated).
const CEREMONY_TO_COLOUR: Record<string, number> = {
  "romantic": 25,
  "traditional": 65,
  "editorial": 55,
  "dramatic": 85,
};

// Feel + ceremony → style keywords seed.
const FEEL_KEYWORDS: Record<string, string[]> = {
  regal: ["regal", "statement-brows", "traditional"],
  ethereal: ["ethereal", "dewy", "soft-glam"],
  bold: ["bold-lip", "smokey-eye", "statement"],
  natural: ["natural", "fresh-faced", "minimalist"],
  glamorous: ["soft-glam", "winged-liner", "dramatic"],
};

const CEREMONY_KEYWORDS: Record<string, string> = {
  traditional: "traditional",
  editorial: "editorial",
  romantic: "romantic",
  dramatic: "dramatic",
};

// ── Brief builder ─────────────────────────────────────────────────────────

function buildBrief(answers: QuizAnswerMap): string {
  const feelA = answers.feel;
  const feel = feelA && feelA.kind === "single" ? feelA.value : "regal";
  const feelLabel =
    FEEL_OPTIONS.find((o) => o.value === feel)?.label.toLowerCase() ?? feel;

  const dailyA = answers.daily;
  const daily = dailyA && dailyA.kind === "single" ? dailyA.value : "light-natural";

  const ceremonyA = answers.ceremony;
  const ceremony =
    ceremonyA && ceremonyA.kind === "single" ? ceremonyA.value : "traditional";
  const ceremonyLabel =
    CEREMONY_OPTIONS.find((o) => o.value === ceremony)?.label.toLowerCase() ??
    ceremony;

  const receptionA = answers.reception;
  const reception =
    receptionA && receptionA.kind === "single" ? receptionA.value : "freshened";

  const skinA = answers.skin;
  const skin = skinA && skinA.kind === "single" ? skinA.value : "dewy";

  const dailyClause: Record<string, string> = {
    minimal:
      "You don't wear much makeup day-to-day, so bridal needs to feel like the most elevated version of you — not a mask.",
    "light-natural":
      "You wear light, natural makeup most days, so your bridal look should feel like a richer, more intentional version of that.",
    "full-subtle":
      "You wear full but subtle makeup regularly — bridal can go a step further without feeling unfamiliar.",
    "full-glam":
      "You're comfortable in full glam, so your bridal look can lean into the drama and the craft.",
  };

  const receptionClause: Record<string, string> = {
    freshened: "For sangeet and reception, the same look, freshened and retouched.",
    bolder:
      "For sangeet and reception, go bolder — a darker lip, sharper eye, more glam.",
    transformation:
      "For sangeet and reception, a complete transformation — different look, different mood.",
    easy: "For sangeet and reception, keep it easy — comfort and longevity over reinvention.",
  };

  const skinClause: Record<string, string> = {
    "long-lasting":
      "Skin finish should be long-wearing and won't-budge — you want it to last through the hugs, the tears, and the last song.",
    dewy: "Skin finish should be dewy and skin-like — lit from within, fresh, luminous.",
    lightweight:
      "Skin finish should feel lightweight and barely-there — you don't want to feel it on your face.",
    "camera-ready":
      "Skin finish should be camera-ready and fully covered — you want every frame flawless.",
  };

  const sentence1 = `You want to feel ${feelLabel} on your wedding day.`;
  const sentence2 = dailyClause[daily] ?? dailyClause["light-natural"];
  const sentence3 = `For the ceremony, lean ${ceremonyLabel}. ${receptionClause[reception] ?? receptionClause["freshened"]}`;
  const sentence4 = skinClause[skin] ?? skinClause["dewy"];

  return `${sentence1} ${sentence2} ${sentence3} ${sentence4}`;
}

function colourDirectionLabel(v: number): string {
  if (v <= 25) return `${v}/100 — Soft & nude, barely-there tones`;
  if (v <= 50) return `${v}/100 — Warm neutrals with gentle colour`;
  if (v <= 75) return `${v}/100 — Rich & saturated, jewel tones`;
  return `${v}/100 — Deep & dramatic, statement colour`;
}

function skinFinishLabel(v: number): string {
  if (v <= 25) return `${v}/100 — Matte & flawless, porcelain finish`;
  if (v <= 50) return `${v}/100 — Soft matte with a touch of glow`;
  if (v <= 75) return `${v}/100 — Satin, smooth with subtle glow`;
  return `${v}/100 — Dewy & glowing, lit from within`;
}

// ── Schema ────────────────────────────────────────────────────────────────

export const hmuaVisionQuiz: QuizSchema = {
  id: "hmua:vision:v3",
  version: "3",
  category: "hmua",
  subsection: "vision",
  title: "Your bridal beauty in 5 questions",
  intro:
    "Five light questions — skin type, vibe for each event, how glam vs. natural you lean. We'll draft your Beauty Brief, seed your style keywords, and pre-set your colour direction.",
  estimated_minutes: 3,
  questions: [
    {
      id: "feel",
      prompt: "Which word best describes how you want to feel on your wedding day?",
      input: { type: "single_select", options: FEEL_OPTIONS },
    },
    {
      id: "daily",
      prompt: "How do you typically wear your makeup day-to-day?",
      input: { type: "single_select", options: DAILY_OPTIONS },
    },
    {
      id: "ceremony",
      prompt: "For your wedding ceremony, do you lean more…",
      input: { type: "single_select", options: CEREMONY_OPTIONS },
    },
    {
      id: "reception",
      prompt: "How about the reception and party events (sangeet, reception)?",
      input: { type: "single_select", options: RECEPTION_OPTIONS },
    },
    {
      id: "skin",
      prompt: "Skin & comfort — what matters most to you?",
      input: { type: "single_select", options: SKIN_OPTIONS },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    items.push({
      fieldKey: "brief",
      label: "Your Beauty Brief",
      value: buildBrief(answers),
      editable: true,
    });

    // Style keywords: feel (3) + ceremony (1) — dedupe
    const feelA = answers.feel;
    const ceremonyA = answers.ceremony;
    const feel = feelA && feelA.kind === "single" ? feelA.value : "regal";
    const ceremony =
      ceremonyA && ceremonyA.kind === "single" ? ceremonyA.value : "traditional";
    const seed = new Set<string>([
      ...(FEEL_KEYWORDS[feel] ?? []),
      CEREMONY_KEYWORDS[ceremony] ?? "",
    ]);
    seed.delete("");
    items.push({
      fieldKey: "style_keywords",
      label: "Style keywords",
      value: Array.from(seed),
      editable: true,
    });

    // Skin finish (0-100)
    const skinA = answers.skin;
    const skin = skinA && skinA.kind === "single" ? skinA.value : "dewy";
    const finish = SKIN_TO_FINISH[skin] ?? 60;
    items.push({
      fieldKey: "skin_finish",
      label: "Skin finish",
      value: skinFinishLabel(finish),
      editable: true,
    });

    // Colour direction (0-100)
    const colour = CEREMONY_TO_COLOUR[ceremony] ?? 50;
    items.push({
      fieldKey: "colour_direction",
      label: "Colour direction",
      value: colourDirectionLabel(colour),
      editable: true,
    });

    return items;
  },

  apply: (answers, edited, ctx) => {
    const vision = useVisionStore.getState();
    const workspace = useWorkspaceStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Brief → localStorage + legacy workspace note (so old surfaces still see it)
    const briefEdit = byKey.get("brief");
    if (briefEdit) {
      const brief =
        typeof briefEdit.value === "string"
          ? briefEdit.value
          : String(briefEdit.value);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(HMUA_BRIEF_KEY, brief);
        } catch {
          // ignore
        }
      }
      workspace.addNote(ctx.categoryId, `[Beauty Brief] ${brief}`);
    }

    // Style keywords → vision-store
    const kw = byKey.get("style_keywords");
    if (kw && Array.isArray(kw.value)) {
      vision.setKeywords(ctx.categorySlug, kw.value);
    }

    // Skin finish → localStorage (slider value). Take from raw answer, not edited
    // text, because the text is a human label and the slider wants a number.
    const skinA = answers.skin;
    if (typeof window !== "undefined" && skinA && skinA.kind === "single") {
      const v = SKIN_TO_FINISH[skinA.value] ?? 60;
      try {
        window.localStorage.setItem(HMUA_SKIN_FINISH_KEY, String(v));
      } catch {
        // ignore
      }
    }

    // Colour direction → localStorage
    const ceremonyA = answers.ceremony;
    if (typeof window !== "undefined" && ceremonyA && ceremonyA.kind === "single") {
      const v = CEREMONY_TO_COLOUR[ceremonyA.value] ?? 50;
      try {
        window.localStorage.setItem(HMUA_COLOUR_DIRECTION_KEY, String(v));
      } catch {
        // ignore
      }
    }
  },
};
