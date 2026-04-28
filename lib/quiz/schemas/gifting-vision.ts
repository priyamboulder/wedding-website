// ── Gifting → Vision & Mood quiz ──────────────────────────────────────────
// Captures gifting philosophy, packaging level, and cultural gifting
// customs. Seeds moodboard with welcome-bag and favor references.

import { createVisionMoodQuiz } from "./_shared";

export const giftingVisionQuiz = createVisionMoodQuiz({
  category: "gifting",
  id: "gifting:vision:v1",
  version: "1",
  title: "Gifting in 4 quick picks",
  intro:
    "Welcome bags, return favors, family exchanges. Tell us how generous and how curated — we'll seed your moodboard and keyword brief.",
  estimatedMinutes: 2,
  stylePrompt: "What's your gifting style?",
  styleOptions: [
    { value: "curated-thoughtful", label: "Curated & thoughtful" },
    { value: "local-artisan", label: "Local & artisan" },
    { value: "luxe-premium", label: "Luxe premium" },
    { value: "practical-useful", label: "Practical & useful" },
    { value: "edible-indulgent", label: "Edible & indulgent" },
    { value: "personalized-monogrammed", label: "Personalized monogrammed" },
    { value: "eco-sustainable", label: "Eco & sustainable" },
    { value: "cultural-traditional", label: "Cultural traditional" },
  ],
  moodPrompt: "Pick the gift moments that feel right",
  moodOptions: [
    {
      value: "welcome_bag_editorial",
      label: "Editorial welcome bag",
      image_url:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=480&q=70",
    },
    {
      value: "artisan_basket",
      label: "Artisan basket",
      image_url:
        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=480&q=70",
    },
    {
      value: "trousseau_silk",
      label: "Silk trousseau packaging",
      image_url:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
    },
    {
      value: "mithai_box_premium",
      label: "Premium mithai box",
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=480&q=70",
    },
    {
      value: "monogrammed_favors",
      label: "Monogrammed favors",
      image_url:
        "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=480&q=70",
    },
    {
      value: "local_specialty",
      label: "Local specialty",
      image_url:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&q=70",
    },
  ],
  scalePrompt: "Gifting generosity level",
  scaleHelper:
    "From a thoughtful token to a full multi-item experience per guest.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 50,
  scaleMinLabel: "Light token",
  scaleMaxLabel: "Full generosity",
  scaleDescriptors: {
    0: "Single small favor per guest",
    25: "One welcome bag with a couple of items",
    50: "Welcome bag + favor per event",
    75: "Multi-item welcome kit + tiered family gifts",
    100: "Full hospitality experience — curated per guest, per event",
  },
  scaleNoteLabel: "Gifting scope",
  avoidPrompt: "Anything you'd rather not gift?",
  avoidHelper: "Items, categories, or aesthetics to steer clear of.",
  avoidPlaceholder: "e.g. no disposable plastic, avoid generic wedding swag, no alcohol in family gifts…",
  moodboardPreviewLabel: "Gift refs",
});
