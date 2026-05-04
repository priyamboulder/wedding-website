// ──────────────────────────────────────────────────────────────────────────
// Wedding Weekend Visualizer — type definitions.
//
// Pre-auth tool that takes a high-level wedding plan (events, style, scale,
// day count) and renders a hour-by-hour multi-day timeline. Lives entirely
// client-side; nothing here hits the database in v1.
// ──────────────────────────────────────────────────────────────────────────

export type WeddingFormat = "intimate" | "classic" | "grand" | "royal";

export type WeddingStyle =
  | "hindu_north"
  | "hindu_south"
  | "sikh"
  | "muslim"
  | "fusion"
  | "modern";

export type CeremonyTimePref =
  | "morning_muhurat"
  | "afternoon"
  | "evening"
  | "unsure";

export type EventCategory = "pre_wedding" | "wedding_day" | "post_wedding";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export type GuestSubset = "close_family" | "wedding_party" | "full_guest_list";

export type EventSlug =
  | "welcome_dinner"
  | "pooja"
  | "mehndi"
  | "haldi"
  | "maiyan"
  | "chooda"
  | "sangeet"
  | "ceremony"
  | "cocktail"
  | "reception"
  | "vidaai"
  | "farewell_brunch";

export interface CulturalVariant {
  style: WeddingStyle;
  nameVariant?: string;
  durationOverride?: number;
  timeOverride?: TimeOfDay;
  notes?: string;
}

export interface WeddingEvent {
  slug: EventSlug;
  name: string;
  category: EventCategory;
  defaultDuration: number; // hours
  defaultTimeOfDay: TimeOfDay;
  setupBuffer: number; // hours of vendor setup before event start
  typicalGuestSubset: GuestSubset;
  description: string;
  icon: string;
  logisticsNote: string;
  sequencePriority: number; // lower = earlier in the weekend flow
  culturalVariants: CulturalVariant[];
}

export interface VisualizerInputs {
  format: WeddingFormat;
  style: WeddingStyle;
  events: EventSlug[];
  days: number;
  ceremonyTimePref: CeremonyTimePref;
}

export interface ScheduledEvent {
  slug: EventSlug;
  name: string;
  icon: string;
  startMinutes: number; // minutes from 00:00
  endMinutes: number;
  durationHours: number;
  logisticsNote: string;
  guestSubset: GuestSubset;
  description: string;
  isMovable: boolean;
}

export interface TimelineDay {
  dayNumber: number;
  dayLabel: string;
  events: ScheduledEvent[];
}

export interface VisualizerOutput {
  days: TimelineDay[];
  totalGuests: number;
  weddingStyle: WeddingStyle;
  format: WeddingFormat;
  generatedAt: string; // ISO
}
