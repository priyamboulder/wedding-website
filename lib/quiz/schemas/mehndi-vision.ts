// ── Mehndi → Vision & Mood quiz ───────────────────────────────────────────
// Captures style, coverage, elements to include, color priority, and paste
// preference. Seeds the moodboard with design references and writes style
// keywords + tone notes into the vision/workspace stores.

import { createVisionMoodQuiz } from "./_shared";

export const mehndiVisionQuiz = createVisionMoodQuiz({
  category: "mehndi",
  id: "mehndi:vision:v2",
  version: "2",
  title: "Tell us the story your hands should tell",
  intro:
    "Mehendi is art that lives on your hands for two weeks. Five quick choices — style, coverage, elements, color priority, and paste preference — seed your moodboard and brief the artist.",
  estimatedMinutes: 3,

  // ── Q1: Style ──
  stylePrompt: "What's your mehendi style?",
  styleHelper: "Pick up to two — we'll brief the artist on the blend.",
  stylePickMax: 2,
  styleOptions: [
    { value: "rajasthani", label: "Rajasthani — dense, every inch detailed" },
    { value: "arabic", label: "Arabic — flowing, bold lines, negative space" },
    { value: "indo-arabic", label: "Indo-Arabic fusion" },
    { value: "minimal", label: "Minimal & modern" },
    { value: "portrait", label: "Bridal portrait — faces, figures, scenes" },
    { value: "geometric", label: "Jaali / Moroccan geometric" },
  ],

  // ── Q2: Moodboard reference gallery ──
  moodPrompt: "Pin the designs that match your vision",
  moodHelper:
    "These seed your moodboard. The artist pulls from here when sketching.",
  moodOptions: [
    {
      value: "rajasthani_full",
      label: "Rajasthani full bridal",
      image_url:
        "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=480&q=70",
    },
    {
      value: "arabic_flowing",
      label: "Arabic flowing",
      image_url:
        "https://images.unsplash.com/photo-1601122070922-84e7a0e8a3b6?w=480&q=70",
    },
    {
      value: "minimal_modern",
      label: "Minimal modern",
      image_url:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
    },
    {
      value: "peacock_motif",
      label: "Peacock motif",
      image_url:
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=480&q=70",
    },
    {
      value: "hands_and_feet",
      label: "Hands & feet",
      image_url:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=480&q=70",
    },
    {
      value: "portrait_bridal",
      label: "Bridal portrait",
      image_url:
        "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=480&q=70",
    },
  ],

  // ── Q3: Coverage slider ──
  scalePrompt: "How much coverage?",
  scaleHelper:
    "From a single accent to full bridal — hands, feet, elbows. Coverage drives how long application takes.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 75,
  scaleMinLabel: "Signature accent",
  scaleMaxLabel: "Full bridal",
  scaleDescriptors: {
    0: "One signature element (fingertips or a small wrist motif)",
    25: "Front of hands only",
    50: "Hands only — front and back",
    75: "Arms to mid-forearm + hands front and back",
    100: "Full bridal — both hands & feet to elbows/ankles",
  },
  scaleNoteLabel: "Coverage direction",

  // ── Q4 (free-form): Avoid list ──
  avoidPrompt: "Anything the design should NOT include?",
  avoidHelper:
    "Motifs, styles, or material sensitivities to avoid. Paste type (organic vs. chemical), skin allergies, figurative work — mention anything the artist needs to know.",
  avoidPlaceholder:
    "e.g. no figurative faces, organic paste only, skin-sensitive — need patch test first, avoid dense black fill…",
  avoidNoteLabel: "Must avoid / sensitivities",

  moodboardPreviewLabel: "Design references",
});
