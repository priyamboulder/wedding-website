// Seed data for Content Studio — caption templates + package recipes.
// No DB; these drive the UI's "auto-generate" flow. The real build would
// load these from a `content_studio_caption_templates` table.

import type { CaptionTemplate, PackageRecipe } from "@/types/content-studio";

export const CAPTION_TEMPLATES: CaptionTemplate[] = [
  {
    slug: "classic_romantic",
    label: "Classic Romantic",
    tone: "romantic",
    template_text:
      "Forever starts here. {date} was the day our story became a celebration — surrounded by the people who made us who we are. {partner_name}, I'd choose you in every lifetime.",
    package_types: ["instagram_carousel", "announcement"],
    sort_order: 1,
  },
  {
    slug: "minimal_elegant",
    label: "Minimal & Elegant",
    tone: "minimal",
    template_text: "{date}.",
    package_types: ["instagram_single", "instagram_carousel"],
    sort_order: 2,
  },
  {
    slug: "funny_real",
    label: "Funny & Real",
    tone: "fun",
    template_text:
      "Married the person who still can't fold a fitted sheet but can make me laugh until I cry. Worth it. {date}",
    package_types: ["announcement", "instagram_single"],
    sort_order: 3,
  },
  {
    slug: "cultural_proud",
    label: "Cultural Pride",
    tone: "cultural",
    template_text:
      "{num_events} events. {num_days} days. One unforgettable celebration. Our wedding was everything we dreamed — and then some.",
    package_types: ["instagram_carousel", "facebook_album"],
    sort_order: 4,
  },
  {
    slug: "thank_you",
    label: "Thank You Post",
    tone: "emotional",
    template_text:
      "To everyone who danced at our sangeet, cried during the pheras, and stayed until the last song at the reception — thank you for making {date} the most magical day of our lives. We felt every ounce of love.",
    package_types: ["thank_you_post"],
    sort_order: 5,
  },
  {
    slug: "detail_focused",
    label: "The Details",
    tone: "romantic",
    template_text:
      "It's in the details — the marigolds, the mehendi, the way the light hit the mandap at golden hour. Every piece of our wedding was a love letter.",
    package_types: ["instagram_carousel"],
    sort_order: 6,
  },
  {
    slug: "vidaai_emotional",
    label: "The Goodbye",
    tone: "emotional",
    template_text: "The moment I looked back. No caption needed.",
    package_types: ["instagram_single"],
    sort_order: 7,
  },
];

// Package auto-assembly recipes. Each has a `pickerSlug` pointing into the
// picker registry in `lib/content-studio-ai.ts`.
export const PACKAGE_RECIPES: PackageRecipe[] = [
  {
    type: "instagram_carousel",
    title: "The Full Story",
    theme: "chronological",
    description:
      "One or two top picks from each event, in chronological order — getting ready through vidaai.",
    aspect_ratio: "4:5",
    max_photos: 10,
    pickerSlug: "chronological",
  },
  {
    type: "instagram_carousel",
    title: "Best Moments",
    theme: "best_moments",
    description: "Top 10 by quality score — the wow shots. Variety across at least three events.",
    aspect_ratio: "4:5",
    max_photos: 10,
    pickerSlug: "best_moments",
  },
  {
    type: "instagram_carousel",
    title: "Couple Portraits",
    theme: "couple_portraits",
    description: "Just the two of you — pulled from portrait sessions and candid couple moments.",
    aspect_ratio: "4:5",
    max_photos: 8,
    pickerSlug: "couple_portraits",
  },
  {
    type: "instagram_single",
    title: "The Announcement",
    theme: "announcement",
    description: "Your best couple portrait — the \"we did it!\" post.",
    aspect_ratio: "4:5",
    max_photos: 1,
    pickerSlug: "announcement",
  },
  {
    type: "instagram_story_set",
    title: "Story: The Full Wedding",
    theme: "chronological",
    description:
      "15 vertical slides walking through every event, getting ready to vidaai, 9:16.",
    aspect_ratio: "9:16",
    max_photos: 15,
    pickerSlug: "story_chronological",
  },
  {
    type: "facebook_album",
    title: "Facebook Album",
    theme: "comprehensive",
    description:
      "30 photos — three to five from each event, balanced between couple, family, friends, details.",
    aspect_ratio: "original",
    max_photos: 30,
    pickerSlug: "facebook_balanced",
  },
  {
    type: "whatsapp_status",
    title: "WhatsApp Status Set",
    theme: "highlights",
    description: "Seven of the most visually striking photos, sized for WhatsApp status.",
    aspect_ratio: "9:16",
    max_photos: 7,
    pickerSlug: "whatsapp_highlights",
  },
  {
    type: "thank_you_post",
    title: "Thank You Post",
    theme: "gratitude",
    description: "One large group or family photo, paired with the thank-you caption.",
    aspect_ratio: "4:5",
    max_photos: 1,
    pickerSlug: "thank_you",
  },
];

// Event order used by the chronological picker + event grouping UI.
export const EVENT_ORDER: { id: import("@/types/content-studio").ContentEvent; label: string }[] = [
  { id: "getting_ready", label: "Getting Ready" },
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "baraat", label: "Baraat" },
  { id: "ceremony", label: "Ceremony" },
  { id: "reception", label: "Reception" },
  { id: "portraits", label: "Portraits" },
  { id: "details", label: "Details" },
  { id: "other", label: "Other" },
];

export const EVENT_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_ORDER.map((e) => [e.id, e.label]),
);

export const ASPECT_DIMS: Record<string, { w: number; h: number; label: string }> = {
  "1:1": { w: 1080, h: 1080, label: "Square · 1:1" },
  "4:5": { w: 1080, h: 1350, label: "Portrait · 4:5" },
  "9:16": { w: 1080, h: 1920, label: "Story · 9:16" },
  "16:9": { w: 1920, h: 1080, label: "Landscape · 16:9" },
  original: { w: 0, h: 0, label: "Original" },
};
