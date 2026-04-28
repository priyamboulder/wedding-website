// ── Music & Entertainment → Vision & Mood quiz (v2) ──────────────────────
// Custom 5-question quiz that captures the planning levers the brief
// flagged as highest-stakes:
//   1. How produced is the Sangeet?  → sangeet_style (drives whether the
//      Sangeet Planner tab is visible)
//   2. Music taste                    → genre_mix (drives suggested tracks
//      and the genre-mix percentage on the Vision tab)
//   3. Live music vs DJ               → live_dj_mix (drives the Shortlist
//      tab's vendor-type emphasis)
//   4. Non-negotiable moments         → non_negotiables (drives auto-pinned
//      Must Play entries on each event Soundscape)
//   5. Energy ceiling                 → scales the energy_arc shape
//
// Apply writes to:
//   • useMusicSoundscapeStore — energy arc + sangeet style + live/dj +
//     genre mix + non-negotiables (drives the right-rail Energy Map and
//     pre-populates Soundscape playlists)
//   • useVisionStore — style keywords (cross-tab for moodboard chips)
//   • useWorkspaceStore — narrative summary as a Vision note

import type {
  QuizPreviewItem,
  QuizQuestion,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useMusicSoundscapeStore } from "@/stores/music-soundscape-store";
import type {
  EnergyEventId,
  EnergyPoint,
  GenreTaste,
  LiveDjMix,
  NonNegotiableMoment,
  SangeetStyle,
} from "@/types/music";

// ── Question content ──────────────────────────────────────────────────────

const SANGEET_OPTIONS: { value: SangeetStyle; label: string }[] = [
  {
    value: "sangeet-casual",
    label: "Casual family fun — people get up and dance, no choreography",
  },
  {
    value: "sangeet-semi",
    label: "Semi-choreographed — a few rehearsed numbers, rest is freestyle",
  },
  {
    value: "sangeet-production",
    label: "Full production — lighting, sound, choreographed performances, emcee",
  },
  {
    value: "sangeet-show",
    label: "Variety show — pro performers + family acts together",
  },
  {
    value: "sangeet-skip",
    label: "Skipping a formal Sangeet — folding into the reception",
  },
];

const GENRE_OPTIONS: { value: GenreTaste; label: string }[] = [
  { value: "classic-bollywood", label: "Classic Bollywood (90s–2000s)" },
  { value: "modern-bollywood", label: "Modern Bollywood + Punjabi hits" },
  { value: "sufi-qawwali", label: "Sufi & Qawwali" },
  { value: "classical", label: "Classical (sitar, tabla, vocal)" },
  { value: "western-pop", label: "Western pop & R&B" },
  { value: "edm", label: "EDM & club" },
  { value: "hip-hop", label: "Hip hop" },
  { value: "eclectic", label: "Mix of everything" },
];

const LIVE_DJ_OPTIONS: { value: LiveDjMix; label: string }[] = [
  {
    value: "dj-primary",
    label: "DJ all the way — seamless mixing, no breaks",
  },
  {
    value: "hybrid",
    label: "Live band for ceremony / cocktails, DJ for party",
  },
  {
    value: "live-primary",
    label: "Full live band — energy of real musicians",
  },
  {
    value: "acoustic-ceremony",
    label: "Acoustic / classical for ceremony only",
  },
];

const NON_NEG_OPTIONS: { value: NonNegotiableMoment; label: string }[] = [
  { value: "dhol-baraat", label: "Dhol during baraat" },
  { value: "couple-first-dance", label: "Couple's first dance" },
  { value: "parent-dances", label: "Parent dances (mother-son / father-daughter)" },
  { value: "grand-entrance", label: "Grand entrance with a specific song" },
  { value: "vidaai-song", label: "Vidaai with traditional song" },
  { value: "bouquet-toss", label: "Bouquet / garter toss" },
  { value: "late-night-bollywood", label: "Late-night Bollywood dance party" },
  { value: "hora-chair-lift", label: "Hora / chair lifting (interfaith)" },
];

// ── Schema ────────────────────────────────────────────────────────────────

const QUESTIONS: QuizQuestion[] = [
  {
    id: "sangeet_style",
    prompt: "The Sangeet — how produced?",
    helper:
      "This is the highest-stakes call. Drives whether you'll need a choreographer + emcee on the shortlist.",
    input: { type: "single_select", options: SANGEET_OPTIONS },
  },
  {
    id: "genre_mix",
    prompt: "Music taste — pick everything that matches",
    helper: "We'll brief the DJ around your blend.",
    input: { type: "multi_select", options: GENRE_OPTIONS, min: 1, max: 5 },
  },
  {
    id: "live_dj",
    prompt: "Live music vs DJ",
    input: { type: "single_select", options: LIVE_DJ_OPTIONS },
  },
  {
    id: "non_negotiables",
    prompt: "Non-negotiable moments",
    helper: "We'll pre-pin these as Must Play entries on each event's soundscape.",
    optional: true,
    input: {
      type: "multi_select",
      options: NON_NEG_OPTIONS,
      min: 0,
      max: NON_NEG_OPTIONS.length,
    },
  },
  {
    id: "energy_ceiling",
    prompt: "Where's the energy ceiling on your party events?",
    helper:
      "Sangeet + reception. We'll shape the energy arc — Haldi stays low, Ceremony stays reverent.",
    input: {
      type: "number_slider",
      min: 50,
      max: 100,
      step: 5,
      defaultValue: 90,
      minLabel: "Festive but contained",
      maxLabel: "Wild — late-night club energy",
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function shapeEnergyArc(ceiling: number): EnergyPoint[] {
  // Curve: Haldi stays low (proxy 30–35), Mehendi mid (proxy ~55), Sangeet
  // peaks at the user's ceiling, Ceremony stays reverent (~25), Reception
  // slightly below Sangeet. Scaling preserves the qualitative shape.
  const sangeet = ceiling;
  const reception = Math.max(60, Math.round(ceiling * 0.85));
  const mehendi = Math.max(40, Math.round(ceiling * 0.6));
  const haldi = 30;
  const ceremony = 25;
  return [
    { event: "haldi", energy: haldi },
    { event: "mehendi", energy: mehendi },
    { event: "sangeet", energy: sangeet },
    { event: "ceremony", energy: ceremony },
    { event: "reception", energy: reception },
  ];
}

function brief(
  sangeet: SangeetStyle,
  liveDj: LiveDjMix,
  genres: GenreTaste[],
  ceiling: number,
): string {
  const sangeetSentence: Record<SangeetStyle, string> = {
    "sangeet-casual": "A casual family-fun Sangeet — no formal performances.",
    "sangeet-semi": "A semi-choreographed Sangeet with a few rehearsed numbers.",
    "sangeet-production":
      "A fully-produced Sangeet with lighting, sound design, and choreographed performances.",
    "sangeet-show":
      "A variety-show Sangeet with professional performers alongside family acts.",
    "sangeet-skip":
      "Folding the Sangeet into the reception — no standalone show.",
  };
  const liveDjSentence: Record<LiveDjMix, string> = {
    "dj-primary": "DJ-led across the wedding for seamless mixing.",
    hybrid: "Live band for ceremony / cocktails, DJ takes over for the party.",
    "live-primary": "Live-band led for the energy of real musicians.",
    "acoustic-ceremony": "Acoustic / classical for the ceremony only; recorded music elsewhere.",
  };
  const genreLabels = genres
    .map((g) => GENRE_OPTIONS.find((o) => o.value === g)?.label ?? g)
    .join(" · ");
  return [
    sangeetSentence[sangeet],
    liveDjSentence[liveDj],
    genreLabels && `Pulling from ${genreLabels.toLowerCase()}.`,
    `Energy ceiling on party nights: ${ceiling}/100.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// ── Quiz schema export ────────────────────────────────────────────────────

export const entertainmentVisionQuiz: QuizSchema = {
  id: "entertainment:vision:v2",
  version: "2",
  category: "entertainment",
  subsection: "vision",
  title: "Music & energy in 5 quick questions",
  intro:
    "Tell us how the wedding should feel — Sangeet style, music taste, live vs DJ, non-negotiable moments, and how wild the party should get. We'll seed your soundscapes from your answers.",
  estimated_minutes: 3,
  questions: QUESTIONS,

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const sangeet = answers.sangeet_style;
    if (sangeet && sangeet.kind === "single") {
      const opt = SANGEET_OPTIONS.find((o) => o.value === sangeet.value);
      items.push({
        fieldKey: "sangeet_style",
        label: "Sangeet style",
        value: opt?.label ?? sangeet.value,
        editable: false,
      });
    }

    const genres = answers.genre_mix;
    if (genres && genres.kind === "multi" && genres.values.length > 0) {
      const labels = genres.values.map(
        (v) => GENRE_OPTIONS.find((o) => o.value === v)?.label ?? v,
      );
      items.push({
        fieldKey: "genre_mix",
        label: "Music taste",
        value: labels,
        editable: true,
      });
    }

    const livedj = answers.live_dj;
    if (livedj && livedj.kind === "single") {
      const opt = LIVE_DJ_OPTIONS.find((o) => o.value === livedj.value);
      items.push({
        fieldKey: "live_dj",
        label: "Live vs DJ",
        value: opt?.label ?? livedj.value,
        editable: false,
      });
    }

    const nn = answers.non_negotiables;
    if (nn && nn.kind === "multi" && nn.values.length > 0) {
      const labels = nn.values.map(
        (v) => NON_NEG_OPTIONS.find((o) => o.value === v)?.label ?? v,
      );
      items.push({
        fieldKey: "non_negotiables",
        label: "Non-negotiable moments",
        value: labels,
        editable: true,
      });
    }

    const ceiling = answers.energy_ceiling;
    if (ceiling && ceiling.kind === "number") {
      items.push({
        fieldKey: "energy_ceiling",
        label: "Energy ceiling",
        value: `${ceiling.value}/100`,
        editable: false,
      });
    }

    return items;
  },

  apply: (answers, _edited, ctx) => {
    const sound = useMusicSoundscapeStore.getState();
    const vision = useVisionStore.getState();
    const workspace = useWorkspaceStore.getState();

    let sangeetStyle: SangeetStyle = "sangeet-production";
    let liveDj: LiveDjMix = "hybrid";
    let genres: GenreTaste[] = [];
    let nonNeg: NonNegotiableMoment[] = [];
    let ceiling = 90;

    const sangeetA = answers.sangeet_style;
    if (sangeetA && sangeetA.kind === "single") {
      sangeetStyle = sangeetA.value as SangeetStyle;
      sound.setSangeetStyle(sangeetStyle);
    }

    const genreA = answers.genre_mix;
    if (genreA && genreA.kind === "multi") {
      genres = genreA.values as GenreTaste[];
      sound.setGenreMix(genres);
      // Style keyword chips so the moodboard surfaces match.
      vision.setKeywords(ctx.categorySlug, genres);
    }

    const liveDjA = answers.live_dj;
    if (liveDjA && liveDjA.kind === "single") {
      liveDj = liveDjA.value as LiveDjMix;
      sound.setLiveDjMix(liveDj);
    }

    const nnA = answers.non_negotiables;
    if (nnA && nnA.kind === "multi") {
      nonNeg = nnA.values as NonNegotiableMoment[];
      sound.setNonNegotiables(nonNeg);
    }

    const ceilingA = answers.energy_ceiling;
    if (ceilingA && ceilingA.kind === "number") {
      ceiling = ceilingA.value;
      sound.setEnergyArc(shapeEnergyArc(ceiling));
    }

    workspace.addNote(
      ctx.categoryId,
      `Sound brief: ${brief(sangeetStyle, liveDj, genres, ceiling)}`,
    );
  },
};
