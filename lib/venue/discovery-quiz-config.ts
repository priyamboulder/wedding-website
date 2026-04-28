// ── Venue Discovery Quiz config ───────────────────────────────────────────
// The 8-step fun / discovery-led quiz that sits on the Dream & Discover tab.
// Copy is warm and couple-driven (no form labels) — if production moves these
// to DB config, the schema stays identical.

import type {
  CateringPref,
  EventScope,
  GuestCountTier,
  IndoorOutdoorPref,
  VenueVibe,
} from "@/types/venue";

export interface VibeOption {
  id: VenueVibe;
  label: string;
  blurb: string;
  imageUrl: string;
}

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: "palace_grand",
    label: "Palace / Grand",
    blurb: "Stone courtyards, archways, the-palace-palace energy.",
    imageUrl:
      "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
  },
  {
    id: "garden_natural",
    label: "Garden / Natural",
    blurb: "Manicured lawns, pergolas, canopy of fairy lights.",
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
  },
  {
    id: "modern_minimal",
    label: "Modern / Minimal",
    blurb: "Clean lines, glass walls, art-gallery quiet.",
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
  },
  {
    id: "rustic_warm",
    label: "Rustic / Warm",
    blurb: "Barn wood, lantern light, vineyard or farmhouse.",
    imageUrl:
      "https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=900&q=80",
  },
  {
    id: "beachfront",
    label: "Beachfront",
    blurb: "Ocean horizon, barefoot aisle, sunset ceremonies.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  },
  {
    id: "intimate_boutique",
    label: "Intimate / Boutique",
    blurb: "Smaller property, one-of-one feel, under 150 guests.",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
  },
];

export interface GuestCountOption {
  id: GuestCountTier;
  label: string;
  blurb: string;
}

export const GUEST_COUNT_OPTIONS: GuestCountOption[] = [
  { id: "intimate", label: "Intimate", blurb: "< 100 guests" },
  { id: "medium", label: "Medium", blurb: "100 – 250" },
  { id: "large", label: "Large", blurb: "250 – 400" },
  { id: "grand", label: "Grand", blurb: "400+" },
];

export const INDOOR_OUTDOOR_OPTIONS: Array<{
  id: IndoorOutdoorPref;
  label: string;
  blurb: string;
}> = [
  { id: "indoor", label: "Indoor", blurb: "Climate-controlled, weather-proof." },
  { id: "outdoor", label: "Outdoor", blurb: "Open sky, garden, lawn, terrace." },
  { id: "flexible", label: "Both / Flexible", blurb: "Mix events across spaces." },
];

export const EVENT_SCOPE_OPTIONS: Array<{
  id: EventScope;
  label: string;
  blurb: string;
}> = [
  { id: "one", label: "Just the wedding", blurb: "One big day." },
  { id: "few", label: "2 – 3 events", blurb: "Ceremony, reception, maybe mehendi." },
  { id: "weekend", label: "Full wedding weekend", blurb: "4+ events across multiple days." },
];

export const CATERING_OPTIONS: Array<{
  id: CateringPref;
  label: string;
  blurb: string;
}> = [
  { id: "venue", label: "Venue catering", blurb: "Let the venue handle food end-to-end." },
  { id: "outside", label: "Outside caterer", blurb: "We have a chef / caterer we want to bring." },
  { id: "flexible", label: "Flexible", blurb: "Open either way — depends on the venue." },
];

export const MUST_HAVE_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "multiple_spaces", label: "Multiple spaces" },
  { id: "overnight_rooms", label: "Overnight rooms on-site" },
  { id: "havan_allowed", label: "Havan / fire ceremony allowed" },
  { id: "late_music", label: "Late-night music OK" },
  { id: "bridal_suite", label: "Bridal suite" },
  { id: "outdoor_ceremony", label: "Outdoor ceremony option" },
  { id: "baraat_path", label: "Baraat arrival path (horse / procession)" },
  { id: "kosher_kitchen", label: "Full kitchen for outside caterer" },
  { id: "step_free", label: "Step-free access for elders" },
  { id: "private_bar", label: "Private bar / corkage allowance" },
];

// Budget bounds used by the slider.
export const QUIZ_BUDGET_MIN = 10000;
export const QUIZ_BUDGET_MAX = 500000;
export const QUIZ_BUDGET_STEP = 5000;

export const QUIZ_STEPS = [
  { id: 1, title: "The feeling" },
  { id: 2, title: "The crowd" },
  { id: 3, title: "The sky" },
  { id: 4, title: "The program" },
  { id: 5, title: "The food" },
  { id: 6, title: "The place" },
  { id: 7, title: "The budget" },
  { id: 8, title: "The must-haves" },
] as const;
