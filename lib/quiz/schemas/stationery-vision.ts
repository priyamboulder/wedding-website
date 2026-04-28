// ── Stationery & Invitations → Vision & Mood quiz ─────────────────────────
// Four quick picks that discover the emotional tone, visual motif, paper
// ambition, and must-avoid list for the stationery designer. Results seed
// the Paper Brief, style keywords, and moodboard — the same discovery-first
// pattern the Photography workspace uses.

import { createVisionMoodQuiz } from "./_shared";

export const stationeryVisionQuiz = createVisionMoodQuiz({
  category: "stationery",
  id: "stationery:vision:v3",
  version: "3",
  title: "Invitation tone in 4 quick picks",
  intro:
    "Stationery is the first thing your guests hold — so it sets the emotional tone before anyone arrives. Tell us how the paper should feel and we'll draft the brief your designer reads first.",
  estimatedMinutes: 2,
  stylePrompt:
    "When someone opens your envelope, what should they feel first?",
  styleHelper: "Pick the one or two that fit best.",
  styleOptions: [
    {
      value: "heirloom",
      label:
        "Like they're holding something precious — heirloom quality",
    },
    {
      value: "modern_striking",
      label: "Clean, modern, striking",
    },
    {
      value: "warm_playful",
      label: "Warm and playful — this is going to be fun",
    },
    {
      value: "lush_layered",
      label: "Lush and layered — every detail tells a story",
    },
    {
      value: "minimal_confident",
      label: "Minimal and confident — let the words breathe",
    },
  ],
  stylePickMin: 1,
  stylePickMax: 2,
  moodPrompt: "Which of these do you keep coming back to?",
  moodHelper:
    "Pick a few — we'll seed your moodboard and tell your designer what direction you trust.",
  moodOptions: [
    {
      value: "letterpress",
      label: "Letterpress",
      image_url:
        "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=480&q=70",
    },
    {
      value: "foil_stamping",
      label: "Foil stamping",
      image_url:
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=480&q=70",
    },
    {
      value: "watercolour",
      label: "Watercolour illustration",
      image_url:
        "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=480&q=70",
    },
    {
      value: "minimalist_type",
      label: "Minimalist typography",
      image_url:
        "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
    },
    {
      value: "laser_cut",
      label: "Laser-cut details",
      image_url:
        "https://images.unsplash.com/photo-1567002260557-eec64317e6e4?w=480&q=70",
    },
    {
      value: "acrylic",
      label: "Acrylic or non-paper materials",
      image_url:
        "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=480&q=70",
    },
    {
      value: "calligraphic",
      label: "Handmade / calligraphic",
      image_url:
        "https://images.unsplash.com/photo-1520512236001-f7edd6b32b8d?w=480&q=70",
    },
    {
      value: "photo_forward",
      label: "Photo-forward",
      image_url:
        "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=480&q=70",
    },
    {
      value: "digital_first",
      label: "Digital-first",
      image_url:
        "https://images.unsplash.com/photo-1513436539083-9d2127e742f1?w=480&q=70",
    },
  ],
  moodPickMin: 1,
  moodPickMax: 5,
  scalePrompt: "How much paper do you want in the suite?",
  scaleHelper:
    "Drives cost more than any other decision. Slide toward the full experience for heirloom-feel; toward digital for reach + speed.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 25,
  scaleMinLabel: "The full experience",
  scaleMaxLabel: "Mostly digital",
  scaleDescriptors: {
    0: "The full experience — save-the-date, invite, RSVP, details, liner, belly band, the works",
    25: "The essentials, done beautifully — invite, RSVP, details",
    50: "Hybrid — digital save-the-dates, physical invites for close family",
    75: "Mostly digital — just a few printed hero pieces",
    100: "Fully digital — show me options",
  },
  scaleNoteLabel: "Paper ambition",
  avoidPrompt: "Anything the stationer should avoid?",
  avoidHelper:
    "Fonts, finishes, motifs, languages, or colors you don't want. We'll pass this to the designer briefing.",
  avoidPlaceholder:
    "e.g. no cliché elephant motifs, no glitter, avoid pastel pinks, skip plastic-feel digital prints…",
  moodboardPreviewLabel: "Style references",
});
