// ── Category display tokens ────────────────────────────────────────────────
// Colour system for timeline category pills. Values are intentionally tuned
// to the warm/ivory palette from globals.css — no stark primaries.

import type { ScheduleCategory } from "@/types/schedule";

export interface ScheduleCategoryMeta {
  label: string;
  // Tailwind bg + text + border classes for the pill badge.
  pillClass: string;
  // Left-edge accent colour on the timeline card (thin rail).
  accentClass: string;
  // Soft tinted background for the card body (rarely used — we mostly use
  // a subtle left rail instead to keep the canvas calm).
  tintClass: string;
}

export const SCHEDULE_CATEGORY_META: Record<
  ScheduleCategory,
  ScheduleCategoryMeta
> = {
  ceremony: {
    label: "Ceremony",
    pillClass:
      "bg-saffron-pale text-ink border-saffron/30",
    accentClass: "bg-saffron",
    tintClass: "bg-saffron-pale/30",
  },
  getting_ready: {
    label: "Getting Ready",
    pillClass: "bg-rose-pale text-ink border-rose/30",
    accentClass: "bg-rose",
    tintClass: "bg-rose-pale/30",
  },
  reception: {
    label: "Reception",
    pillClass: "bg-gold-pale text-ink border-gold/30",
    accentClass: "bg-gold",
    tintClass: "bg-gold-pale/30",
  },
  cocktail: {
    label: "Cocktail",
    pillClass: "bg-gold-pale/60 text-ink border-gold-light/40",
    accentClass: "bg-gold-light",
    tintClass: "bg-gold-pale/20",
  },
  entertainment: {
    label: "Entertainment",
    pillClass: "bg-rose-pale/70 text-ink border-rose-light/40",
    accentClass: "bg-rose-light",
    tintClass: "bg-rose-pale/20",
  },
  food: {
    label: "Food",
    pillClass: "bg-sage-pale text-ink border-sage/30",
    accentClass: "bg-sage",
    tintClass: "bg-sage-pale/40",
  },
  logistics: {
    label: "Logistics",
    pillClass: "bg-ivory-warm text-ink-muted border-border",
    accentClass: "bg-ink-faint",
    tintClass: "bg-ivory-warm/40",
  },
  photography: {
    label: "Photography",
    pillClass: "bg-teal-pale text-ink border-teal/30",
    accentClass: "bg-teal",
    tintClass: "bg-teal-pale/40",
  },
  transitions: {
    label: "Transition",
    pillClass: "bg-ivory-deep text-ink-muted border-border",
    accentClass: "bg-ink-faint",
    tintClass: "bg-ivory-deep/40",
  },
  cultural: {
    label: "Cultural",
    pillClass: "bg-saffron-pale/80 text-ink border-saffron/40",
    accentClass: "bg-saffron",
    tintClass: "bg-saffron-pale/20",
  },
  custom: {
    label: "Custom",
    pillClass: "bg-ivory-warm text-ink-muted border-border",
    accentClass: "bg-ink-muted",
    tintClass: "bg-ivory-warm/40",
  },
};
