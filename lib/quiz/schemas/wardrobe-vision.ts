// ── Wardrobe & Styling → Vision & Mood quiz ───────────────────────────────
// Captures bridal style identity, color direction, and embellishment
// comfort. Seeds moodboard with editorial bridal fashion.

import { createVisionMoodQuiz } from "./_shared";

export const wardrobeVisionQuiz = createVisionMoodQuiz({
  category: "wardrobe",
  id: "wardrobe:vision:v1",
  version: "1",
  title: "Bridal wardrobe in 4 quick picks",
  intro:
    "Pick the silhouettes, colors, and level of embellishment you're drawn to — we'll seed your moodboard and keywords for designer appointments.",
  estimatedMinutes: 2,
  stylePrompt: "What's your bridal style identity?",
  styleOptions: [
    { value: "traditional-regal", label: "Traditional & regal" },
    { value: "modern-minimalist", label: "Modern minimalist" },
    { value: "fusion-contemporary", label: "Fusion contemporary" },
    { value: "vintage-heirloom", label: "Vintage heirloom" },
    { value: "fashion-forward", label: "Fashion-forward" },
    { value: "romantic-soft", label: "Romantic soft" },
    { value: "bold-unconventional", label: "Bold unconventional" },
    { value: "classic-couture", label: "Classic couture" },
  ],
  moodPrompt: "Pick the looks that speak to you",
  moodOptions: [
    {
      value: "regal_red_lehenga",
      label: "Regal red lehenga",
      image_url:
        "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=480&q=70",
    },
    {
      value: "blush_modern",
      label: "Blush modern",
      image_url:
        "https://images.unsplash.com/photo-1506469717960-433cebe3f181?w=480&q=70",
    },
    {
      value: "gold_heavy_embellish",
      label: "Gold heavy embellishment",
      image_url:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
    },
    {
      value: "pastel_minimal",
      label: "Pastel minimal",
      image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=70",
    },
    {
      value: "vintage_ivory",
      label: "Vintage ivory",
      image_url:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=480&q=70",
    },
    {
      value: "fusion_saree_gown",
      label: "Fusion saree-gown",
      image_url:
        "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=480&q=70",
    },
  ],
  scalePrompt: "Embellishment level",
  scaleHelper: "How much work do you want on the fabric itself?",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 65,
  scaleMinLabel: "Minimal & clean",
  scaleMaxLabel: "Heavily embellished",
  scaleDescriptors: {
    0: "Clean, no embellishment — fabric and cut do the work",
    25: "Light embellishment on borders only",
    50: "Moderate — detailed embroidery on bodice",
    75: "Heavy — allover zardozi / sequin work",
    100: "Over-the-top — full embellishment, zardozi + mirrorwork + stones",
  },
  scaleNoteLabel: "Embellishment direction",
  avoidPrompt: "Anything the designer should avoid?",
  avoidHelper: "Fabrics, cuts, colors, or silhouettes you don't wear.",
  avoidPlaceholder: "e.g. no strapless, avoid heavy velvet, no neon tones…",
  moodboardPreviewLabel: "Outfit refs",
});
