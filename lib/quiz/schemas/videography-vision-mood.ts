// ── Videography → Vision & Mood onboarding quiz ───────────────────────────
// Purpose-built for videography. Photography's 4-question quiz isn't the
// right shape — videography asks about narrative, audio, length, arc, and
// reference films. The spec in ananya-ai-feature-spec.md calls this the
// single most important input a videographer can get before the day.
//
// 5 questions, ~3 minutes. Writes:
//   - Film brief (useVideographyStore) — AI-written prose summary
//   - Style keywords (useVisionStore)   — short chip list
//   - Reference films (useVideographyStore) — one row per pasted URL

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useVideographyStore } from "@/stores/videography-store";

// ── Thumbnails for Q1 ─────────────────────────────────────────────────────
// Film stills representing each style. Using representative cinematographic
// references — real wedding-film thumbnails can replace these once couples
// start uploading their own.
const WATCH_BACK_OPTIONS = [
  {
    value: "cinematic",
    label: "Cinematic film",
    image_url:
      "https://images.unsplash.com/photo-1524824267900-2fa9cbf7a506?w=520&q=70",
  },
  {
    value: "documentary",
    label: "Raw documentary",
    image_url:
      "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=520&q=70",
  },
  {
    value: "social",
    label: "Short highlight (social)",
    image_url:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=520&q=70",
  },
  {
    value: "hype",
    label: "Music-video energy",
    image_url:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=520&q=70",
  },
  {
    value: "hybrid",
    label: "Hybrid (ceremony raw, rest cinematic)",
    image_url:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=520&q=70",
  },
];

const AUDIO_OPTIONS = [
  { value: "audio-priority-high", label: "Vows & speeches are sacred — capture every word" },
  { value: "audio-priority-low", label: "Music-driven — audio from the day is secondary" },
  { value: "audio-priority-mixed", label: "Mixed — weave our words into a music-driven edit" },
];

const LENGTH_OPTIONS = [
  { value: "highlight", label: "3–5 min highlight" },
  { value: "short-film", label: "10–15 min short film" },
  { value: "feature", label: "30–45 min feature" },
  { value: "full", label: "Full ceremony capture (90+ min)" },
  { value: "multi", label: "Multiple deliverables" },
];

const ARC_OPTIONS = [
  { value: "arc-build", label: "Build from quiet intimacy to grand celebration" },
  { value: "arc-sustained", label: "Start with energy and keep it there" },
];

// ── Copy helpers ──────────────────────────────────────────────────────────

const STYLE_LABEL: Record<string, string> = {
  cinematic: "Cinematic film with music, slow-motion and voiceover",
  documentary: "Raw documentary — every moment as it happened",
  social: "Short, social-ready highlight",
  hype: "Music-video energy — fast cuts and big music",
  hybrid: "Hybrid — ceremony raw, everything else cinematic",
};

const AUDIO_LABEL: Record<string, string> = {
  "audio-priority-high": "Vows and speeches should be crystal clear, uncut.",
  "audio-priority-low": "Music-driven — ambient audio is a bonus, not the point.",
  "audio-priority-mixed":
    "Words woven into the music — speech fragments become narration.",
};

const LENGTH_LABEL: Record<string, string> = {
  highlight: "3–5 minute highlight",
  "short-film": "10–15 minute short film",
  feature: "30–45 minute feature",
  full: "full ceremony capture",
  multi: "a multi-deliverable package",
};

const ARC_LABEL: Record<string, string> = {
  "arc-build":
    "builds from the quiet intimacy of getting ready to the explosive energy of the reception",
  "arc-sustained":
    "opens with energy and holds it — a reel that never drops the tempo",
};

// Extract a plausible style_keywords list from the answers.
function keywordsFor(answers: QuizAnswerMap): string[] {
  const watch = answers.watch_back;
  const audio = answers.audio;
  const length = answers.length;
  const arc = answers.arc;
  const kw = new Set<string>();
  if (watch?.kind === "images" && watch.values[0]) {
    kw.add(watch.values[0]);
  }
  if (audio?.kind === "single") {
    if (audio.value === "audio-priority-high") kw.add("audio-forward");
    if (audio.value === "audio-priority-low") kw.add("music-driven");
    if (audio.value === "audio-priority-mixed") kw.add("narrative-driven");
  }
  if (length?.kind === "multi") {
    for (const v of length.values) kw.add(v);
  }
  if (arc?.kind === "single") {
    kw.add(arc.value === "arc-build" ? "intimate-to-epic" : "sustained-energy");
  }
  return Array.from(kw).slice(0, 5);
}

// Join an array of phrases with Oxford-comma grammar: "a, b, and c".
function joinWithAnd(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0]!;
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

// Generate the film brief narrative from the answer set.
function buildFilmBrief(answers: QuizAnswerMap): string {
  const watch = answers.watch_back;
  const audio = answers.audio;
  const length = answers.length;
  const arc = answers.arc;
  const comment = answers.length_comment;

  const watchValue = watch?.kind === "images" ? watch.values[0] : undefined;
  const audioValue = audio?.kind === "single" ? audio.value : undefined;
  const lengthValues =
    length?.kind === "multi" ? length.values : [];
  const arcValue = arc?.kind === "single" ? arc.value : undefined;
  const commentValue =
    comment?.kind === "text" ? comment.value.trim() : "";

  const lengthPhrase = lengthValues.length
    ? joinWithAnd(
        lengthValues.map((v) => LENGTH_LABEL[v] ?? v),
      )
    : "";

  const parts: string[] = [];
  if (lengthPhrase && watchValue) {
    parts.push(
      `You want ${lengthPhrase} in the style of ${STYLE_LABEL[watchValue]?.toLowerCase() ?? "a cinematic short film"}.`,
    );
  } else if (lengthPhrase) {
    parts.push(`You want ${lengthPhrase}.`);
  } else if (watchValue) {
    parts.push(`${STYLE_LABEL[watchValue]}.`);
  }
  if (arcValue) {
    parts.push(`The emotional arc ${ARC_LABEL[arcValue]}.`);
  }
  if (audioValue) {
    parts.push(AUDIO_LABEL[audioValue]);
  }
  if (commentValue) {
    parts.push(`Format notes: ${commentValue}`);
  }
  if (parts.length === 0) {
    return "Your film brief will land here after the quiz. Retake any time to refresh it.";
  }
  return parts.join(" ");
}

// Extract URL-looking tokens from the paste.
function extractUrls(raw: string): string[] {
  const pattern = /(https?:\/\/[^\s]+)/gi;
  const found = raw.match(pattern) ?? [];
  return Array.from(new Set(found.map((u) => u.replace(/[.,;]+$/, ""))));
}

// ── Schema ────────────────────────────────────────────────────────────────

export const videographyVisionMoodQuiz: QuizSchema = {
  id: "videography:vision_mood:v1",
  version: "1",
  category: "videography",
  subsection: "vision_mood",
  title: "Your wedding film in 5 questions",
  intro:
    "Videographers charge $3K–$15K because the brief matters as much as the gear. Spend three minutes here and we'll seed your film brief, style keywords, and reference gallery.",
  estimated_minutes: 3,
  questions: [
    {
      id: "watch_back",
      prompt: "How do you imagine watching your wedding back?",
      helper:
        "Pick the one that feels closest. Thumbnails are directional — we can fine-tune later.",
      input: {
        type: "image_grid",
        min: 1,
        max: 1,
        options: WATCH_BACK_OPTIONS,
      },
    },
    {
      id: "audio",
      prompt: "What role should audio play?",
      helper:
        "This is the question that separates a $3K videographer from a $15K one.",
      input: {
        type: "single_select",
        options: AUDIO_OPTIONS,
      },
    },
    {
      id: "length",
      prompt: "Film length & format",
      helper:
        "Pick every deliverable you want. A 3-minute highlight and a full ceremony capture are different edits — you can ask for both.",
      input: {
        type: "multi_select",
        options: LENGTH_OPTIONS,
      },
    },
    {
      id: "length_comment",
      prompt: "Any custom format requests?",
      helper:
        "Optional. e.g. a short film per event (mehndi, sangeet, reception), a vertical edit for social, or a runtime that doesn't match the options above.",
      optional: true,
      input: {
        type: "short_text",
        placeholder: "Short films for each event, vertical social cut, …",
      },
    },
    {
      id: "arc",
      prompt: "What's the emotional arc?",
      helper: "One sentence, two directions — pick the one that reads true.",
      input: {
        type: "single_select",
        options: ARC_OPTIONS,
      },
    },
    {
      id: "references",
      prompt: "Reference films you love",
      helper:
        "Paste YouTube / Vimeo links — this is the single most useful input for your videographer. One per line.",
      optional: true,
      input: {
        type: "long_text",
        placeholder:
          "https://vimeo.com/…\nhttps://youtu.be/…\nhttps://instagram.com/reel/…",
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const brief = buildFilmBrief(answers);
    items.push({
      fieldKey: "film_brief",
      label: "Film brief",
      value: brief,
      editable: true,
    });

    const keywords = keywordsFor(answers);
    if (keywords.length > 0) {
      items.push({
        fieldKey: "style_keywords",
        label: "Style keywords",
        value: keywords,
        editable: true,
      });
    }

    const refs = answers.references;
    if (refs && refs.kind === "text") {
      const urls = extractUrls(refs.value);
      if (urls.length > 0) {
        items.push({
          fieldKey: "reference_films",
          label: `Reference films (${urls.length})`,
          value: urls,
          editable: false,
        });
      }
    }

    return items;
  },

  apply: (answers, edited, ctx) => {
    const vision = useVisionStore.getState();
    const videography = useVideographyStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Film brief → videography store
    const briefEdit = byKey.get("film_brief");
    if (briefEdit && typeof briefEdit.value === "string") {
      videography.setFilmBrief(ctx.categoryId, briefEdit.value);
    }

    // Style keywords → vision store
    const keywordsEdit = byKey.get("style_keywords");
    if (keywordsEdit && Array.isArray(keywordsEdit.value)) {
      vision.setKeywords(ctx.categorySlug, keywordsEdit.value);
    }

    // Reference films → one row per URL
    const refs = answers.references;
    if (refs && refs.kind === "text") {
      const urls = extractUrls(refs.value);
      for (const url of urls) {
        videography.addReferenceFilm({
          category_id: ctx.categoryId,
          url,
          title: "",
          note: "",
        });
      }
    }
  },
};
