// ── Event prompts (Journey Step 2) ─────────────────────────────────────
//
// Editorial copy for each event type — used in the visual menu in
// Step 2 of the journey. Each entry pairs an EventType (from the
// existing events seed) with a tagline, a default creative name, and
// a typical guest-count anchor for the suggestion UI.

import type { EventType } from "@/types/events";

export interface EventPrompt {
  type: EventType;
  label: string;        // human display name
  tagline: string;      // editorial italic line
  defaultName: string;  // creative starter name shown pre-filled
  defaultGuestCount: number;
}

export const EVENT_PROMPTS: EventPrompt[] = [
  {
    type: "pithi",
    label: "Pithi",
    tagline: "The golden blessing. Turmeric, laughter, family.",
    defaultName: "Golden Hour",
    defaultGuestCount: 80,
  },
  {
    type: "haldi",
    label: "Haldi",
    tagline: "The golden blessing. Turmeric, laughter, family.",
    defaultName: "Marigold Morning",
    defaultGuestCount: 80,
  },
  {
    type: "mehendi",
    label: "Mehndi",
    tagline: "Henna, music, stories told on skin.",
    defaultName: "Henna & Hush",
    defaultGuestCount: 60,
  },
  {
    type: "sangeet",
    label: "Sangeet",
    tagline: "The night of performances, tears, and too much dancing.",
    defaultName: "The Sangeet",
    defaultGuestCount: 250,
  },
  {
    type: "garba",
    label: "Garba / Dandiya",
    tagline: "Sticks, spins, and the energy of a thousand diyas.",
    defaultName: "Full Spin",
    defaultGuestCount: 250,
  },
  {
    type: "cocktail",
    label: "Cocktail",
    tagline: "The first hello. Where the two sides meet.",
    defaultName: "First Hello",
    defaultGuestCount: 200,
  },
  {
    type: "welcome_dinner",
    label: "Welcome Dinner",
    tagline: "Travelers arrive. Long tables, longer hugs.",
    defaultName: "The Welcome",
    defaultGuestCount: 100,
  },
  {
    type: "baraat",
    label: "Baraat",
    tagline: "The procession. Drums, dancing, the groom on his way.",
    defaultName: "The Baraat",
    defaultGuestCount: 150,
  },
  {
    type: "ceremony",
    label: "Wedding Ceremony",
    tagline: "The vows. The pheras. The moment it's real.",
    defaultName: "Under the Banyan",
    defaultGuestCount: 300,
  },
  {
    type: "reception",
    label: "Reception",
    tagline: "The grand celebration. Dinner, toasts, first dance.",
    defaultName: "After Glow",
    defaultGuestCount: 350,
  },
  {
    type: "after_party",
    label: "After Party",
    tagline: "Because the party doesn't stop.",
    defaultName: "The After",
    defaultGuestCount: 120,
  },
  {
    type: "farewell_brunch",
    label: "Farewell Brunch",
    tagline: "The farewell. The most emotional five minutes.",
    defaultName: "The Send-off",
    defaultGuestCount: 100,
  },
  {
    type: "custom",
    label: "Custom event",
    tagline: "Something uniquely yours.",
    defaultName: "Our Moment",
    defaultGuestCount: 100,
  },
];

export const VIBE_TAGS = [
  "Intimate",
  "Grand",
  "Festive",
  "Elegant",
  "Bohemian",
  "Traditional",
  "Modern",
  "Fusion",
  "Wild",
  "Sacred",
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];
