// ═══════════════════════════════════════════════════════════════════════════════════
//   Wedding site seed — Priya & Arjun
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Default content used by the studio's preview surfaces and the demo
//   /wedding/[slug] route. In production this comes from Supabase; here we
//   hardcode a complete couple so every template renders fully.
// ═══════════════════════════════════════════════════════════════════════════════════

import type { RenderBrand, SiteContent } from "@/types/wedding-site";

export const PRIYA_ARJUN_CONTENT: SiteContent = {
  couple: {
    first: "Priya",
    second: "Arjun",
    hashtag: "#PriyaMeetsArjun",
  },
  weddingDate: "2026-11-14",
  primaryVenue: "Umaid Bhawan Palace, Jodhpur",
  hero: {
    eyebrow: "Together with their families",
    photoUrl: null,
  },
  story: {
    title: "A meeting, a monsoon, a yes.",
    paragraphs: [
      "We met at a Diwali dinner neither of us wanted to go to. Arjun was home from Bangalore for a week; Priya had just finished her thesis. The conversation started with biryani and did not end for four years.",
      "In the monsoon of 2025, on a rooftop in Jodhpur, Arjun asked. Priya said yes before he finished the sentence. We would love for you to be there when we say it a second time — in front of the people we love most.",
    ],
  },
  events: [
    {
      id: "ev-sangeet",
      name: "Sangeet",
      date: "2026-11-12",
      timeLabel: "Evening",
      venue: "Zenana Mahal",
      dressCode: "Festive Indian",
    },
    {
      id: "ev-mehndi",
      name: "Mehndi",
      date: "2026-11-13",
      timeLabel: "Afternoon",
      venue: "Courtyard Garden",
      dressCode: "Garden Florals",
    },
    {
      id: "ev-wedding",
      name: "Wedding",
      date: "2026-11-14",
      timeLabel: "Sunset",
      venue: "Umaid Bhawan",
      dressCode: "Black Tie · Indian Formal",
    },
  ],
  travel: {
    airportCode: "JDH",
    recommendedHotels: [
      { name: "Umaid Bhawan Palace", tier: "luxury", note: "Room block under Sharma–Mehta" },
      { name: "RAAS Jodhpur", tier: "premium", note: "10 minutes from venue" },
      { name: "Hotel Indrashan", tier: "comfort", note: "For longer-stay guests" },
    ],
    shuttleNote: "Shuttles run from RAAS lobby every 30 minutes from 4:00 PM on Nov 14.",
  },
  rsvp: {
    deadlineIso: "2026-10-10",
    instructions: "Reply for each event individually so we can plan accurately.",
  },
  gallery: [],
};

/**
 * Default brand cascade for the demo couple. In production this is computed
 * from the studio's BrandSystem (palette, typography, monogram).
 */
export const PRIYA_ARJUN_BRAND: RenderBrand = {
  ink: "#1A1A1A",
  surface: "#FAF7F2",
  accent: "#C9A961",
  accentSoft: "#F5E6C8",
  displayFont: '"Fraunces", Georgia, serif',
  bodyFont: '"Inter", system-ui, sans-serif',
  monogramInitials: "P&A",
};
