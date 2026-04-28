// ── Cake & Sweets → Vision & Mood quiz ────────────────────────────────────
// Captures dessert identity, cake style preference, and the cake-moment
// priority.

import { createVisionMoodQuiz } from "./_shared";

export const cakeSweetsVisionQuiz = createVisionMoodQuiz({
  category: "cake_sweets",
  id: "cake_sweets:vision:v1",
  version: "1",
  title: "Dessert direction in 4 quick picks",
  intro:
    "Tell us how sweet should land — grand tiered cake, mithai table, fusion spread. We'll seed your moodboard and notes for the pastry team.",
  estimatedMinutes: 2,
  stylePrompt: "What's your dessert identity?",
  styleOptions: [
    { value: "grand-tiered-cake", label: "Grand tiered cake" },
    { value: "mithai-table", label: "Mithai table" },
    { value: "fusion-cake-mithai", label: "Fusion cake + mithai" },
    { value: "dessert-bar", label: "Dessert bar spread" },
    { value: "live-dessert-station", label: "Live dessert station" },
    { value: "classic-elegant", label: "Classic elegant" },
    { value: "playful-modern", label: "Playful & modern" },
    { value: "seasonal-fresh", label: "Seasonal & fresh" },
  ],
  moodPrompt: "Pick the dessert spreads you love",
  moodOptions: [
    {
      value: "tall_tiered_white",
      label: "Tall tiered white cake",
      image_url:
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=480&q=70",
    },
    {
      value: "fondant_intricate",
      label: "Fondant intricate",
      image_url:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=480&q=70",
    },
    {
      value: "mithai_thali",
      label: "Mithai thali display",
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=480&q=70",
    },
    {
      value: "dessert_bar_spread",
      label: "Dessert bar spread",
      image_url:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=480&q=70",
    },
    {
      value: "naked_rustic",
      label: "Naked rustic",
      image_url:
        "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=480&q=70",
    },
    {
      value: "live_jalebi",
      label: "Live jalebi station",
      image_url:
        "https://images.unsplash.com/photo-1601050690117-94f5f7a16345?w=480&q=70",
    },
  ],
  scalePrompt: "How dramatic should the cake moment be?",
  scaleHelper:
    "From low-key tasting-focused dessert to a full cinematic reveal.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 55,
  scaleMinLabel: "Low-key & taste-first",
  scaleMaxLabel: "Grand cinematic moment",
  scaleDescriptors: {
    0: "Low-key — dessert arrives at tables, no ceremony",
    25: "Intimate cake cutting with family only",
    50: "Traditional moment — cake on display, cut during reception",
    75: "Grand reveal — spotlight, music, photo moment",
    100: "Full production — cake rolled in, fireworks / sparklers, stage",
  },
  scaleNoteLabel: "Cake moment direction",
  avoidPrompt: "Anything the pastry team should skip?",
  avoidHelper: "Flavors, allergens, colors, or presentations you don't want.",
  avoidPlaceholder: "e.g. no fondant, avoid nuts in mithai, no overly sweet frosting…",
  moodboardPreviewLabel: "Dessert refs",
});
