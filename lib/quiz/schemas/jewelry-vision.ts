// ── Jewelry → Vision & Mood quiz ──────────────────────────────────────────
// Captures jewelry philosophy, metal preference, and how much heirloom vs
// new the couple wants.

import { createVisionMoodQuiz } from "./_shared";

export const jewelryVisionQuiz = createVisionMoodQuiz({
  category: "jewelry",
  id: "jewelry:vision:v1",
  version: "1",
  title: "Jewelry direction in 4 quick picks",
  intro:
    "Tell us the metals, stones, and era you're drawn to — we'll seed your moodboard and a keyword set for the jeweler.",
  estimatedMinutes: 2,
  stylePrompt: "What's your jewelry philosophy?",
  styleOptions: [
    { value: "kundan-polki", label: "Kundan & polki" },
    { value: "diamond-precious", label: "Diamond & precious stones" },
    { value: "temple-traditional", label: "Temple traditional" },
    { value: "modern-minimalist", label: "Modern minimalist" },
    { value: "vintage-heirloom", label: "Vintage heirloom" },
    { value: "statement-costume", label: "Statement costume" },
    { value: "emerald-ruby", label: "Emerald & ruby heavy" },
    { value: "south-indian-gold", label: "South Indian gold" },
  ],
  moodPrompt: "Pick the jewelry moods",
  moodOptions: [
    {
      value: "kundan_polki_set",
      label: "Kundan & polki",
      image_url:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=480&q=70",
    },
    {
      value: "diamond_modern",
      label: "Diamond modern",
      image_url:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&q=70",
    },
    {
      value: "temple_jewelry",
      label: "Temple jewelry",
      image_url:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=480&q=70",
    },
    {
      value: "minimalist_delicate",
      label: "Minimalist delicate",
      image_url:
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=480&q=70",
    },
    {
      value: "heirloom_antique",
      label: "Heirloom antique",
      image_url:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=480&q=70",
    },
    {
      value: "emerald_statement",
      label: "Emerald statement",
      image_url:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=480&q=70",
    },
  ],
  scalePrompt: "Heirloom vs new balance",
  scaleHelper: "How much of your jewelry will be family pieces?",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 40,
  scaleMinLabel: "All heirloom",
  scaleMaxLabel: "All new",
  scaleDescriptors: {
    0: "Entirely family heirlooms, restyled as needed",
    25: "Mostly heirloom with a few new statement pieces",
    50: "Even mix — heirloom for ceremony, new for reception",
    75: "Mostly new pieces with one or two heirloom anchors",
    100: "Entirely new — commissioned or purchased",
  },
  scaleNoteLabel: "Heirloom / new balance",
  avoidPrompt: "Anything the jeweler should avoid?",
  avoidHelper: "Metals, stones, eras, or styles outside your comfort zone.",
  avoidPlaceholder: "e.g. no rose gold, avoid too-chunky pieces, no costume jewelry on ceremony day…",
  moodboardPreviewLabel: "Jewelry refs",
});
