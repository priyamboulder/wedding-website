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
  weddingDate: "2026-11-15",
  primaryVenue: "The Grand Haveli, Udaipur",
  hero: {
    eyebrow: "Together with their families",
    photoUrl: null,
  },
  story: {
    title: "A meeting, a monsoon, a yes.",
    paragraphs: [
      "We met in a college library in 2019 — Priya was buried in a thesis on Mughal miniatures, Arjun was supposed to be studying for finals. The conversation started over a shared love of train travel and did not stop for four years, across Tokyo back-alleys, Lisbon viewpoints, and one very questionable hostel in Hampi.",
      "On a monsoon afternoon in Udaipur, on a balcony overlooking Lake Pichola, Arjun asked. Priya said yes before he finished the sentence. We would love for you to be there when we say it a second time — in front of the people we love most.",
    ],
  },
  events: [
    {
      id: "ev-mehndi",
      name: "Mehndi",
      date: "2026-11-13",
      timeLabel: "4:00 PM",
      venue: "Poolside Garden, The Grand Haveli",
      dressCode: "Garden Florals",
      notes: "Henna artists, chai, mango lassis. Stay as long as you like.",
    },
    {
      id: "ev-sangeet",
      name: "Sangeet & Garba",
      date: "2026-11-14",
      timeLabel: "7:00 PM",
      venue: "The Grand Ballroom",
      dressCode: "Festive Indian",
      notes: "Dance the night with both families.",
    },
    {
      id: "ev-ceremony",
      name: "Wedding Ceremony",
      date: "2026-11-15",
      timeLabel: "10:00 AM",
      venue: "The Royal Courtyard",
      dressCode: "Traditional Indian",
      notes: "The pheras begin promptly at 10:30 AM.",
    },
    {
      id: "ev-reception",
      name: "Reception",
      date: "2026-11-15",
      timeLabel: "7:00 PM",
      venue: "The Lakeside Terrace",
      dressCode: "Black Tie · Indian Formal",
      notes: "Cocktails at sunset, dinner under the stars.",
    },
  ],
  travel: {
    airportCode: "UDR",
    recommendedHotels: [
      { name: "The Grand Haveli", tier: "luxury", note: "Wedding venue · room block under Sharma–Mehta" },
      { name: "Taj Lake Palace", tier: "luxury", note: "Boat shuttle from City Palace jetty" },
      { name: "RAAS Devigarh", tier: "premium", note: "30 minutes from venue, hilltop" },
      { name: "Hotel Lakend", tier: "comfort", note: "For longer-stay guests, lake-facing rooms" },
    ],
    shuttleNote:
      "Shuttles run from the Udaipur airport (UDR) and the recommended hotels every 30 minutes from 3:00 PM onwards on each event day.",
  },
  rsvp: {
    deadlineIso: "2026-10-10",
    instructions: "Reply for each event individually so we can plan accurately.",
  },
  gallery: [],
  registry: [
    {
      id: "reg-cash",
      kind: "cash",
      title: "Wedding fund",
      description: "Toward our first home in Bombay — tiles, a tea kettle, a record player.",
    },
    {
      id: "reg-honeymoon",
      kind: "honeymoon",
      title: "Honeymoon fund",
      description: "Three weeks across Japan in spring — kaiseki, train passes, and a ryokan night.",
    },
    {
      id: "reg-charity",
      kind: "charity",
      title: "Pratham Education",
      description: "In lieu of a gift, support a year of literacy classes for children in Rajasthan.",
      url: "https://www.pratham.org",
    },
  ],
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
  displayFont: '"Cormorant Garamond", "Fraunces", Georgia, serif',
  bodyFont: '"Outfit", "Inter", system-ui, sans-serif',
  monogramInitials: "P&A",
};
