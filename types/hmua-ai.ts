// ── HMUA AI types ──────────────────────────────────────────────────────────
// I/O shapes for the 7 modes of the Hair & Makeup Style Intelligence engine
// (see ananya-beauty-ai-spec.md). Shared between the API route and the UI.
//
// Kept permissive on the output side: the model can surface extra keys we
// don't yet render. Required keys are the ones we actively depend on.

import type { WeddingEvent } from "./workspace";

// ── Shared vocabularies ───────────────────────────────────────────────────

export type StyleCategory = "hair" | "makeup" | "accessories";

export type ArtistDifficulty = "simple" | "standard" | "advanced";

export interface OutfitHints {
  haldi?: string;
  mehendi?: string;
  sangeet?: string;
  wedding?: string;
  reception?: string;
}

// ── MODE: STYLE_CARDS ─────────────────────────────────────────────────────

export interface StyleCardsRequest {
  category: StyleCategory;
  count?: number;
  events: WeddingEvent[];
  already_liked?: string[];
  already_skipped?: string[];
  bride_notes?: string;
  outfit_hints?: OutfitHints;
}

export interface StyleCard {
  id: string;
  category: StyleCategory;
  name: string;
  one_liner: string;
  description: string;
  best_for_events: string[];
  vibe_tags: string[];
  style_tags: string[];
  pairs_well_with: {
    hair?: string[];
    makeup?: string[];
    accessories?: string[];
  };
  cultural_note?: string;
  artist_difficulty?: ArtistDifficulty;
  longevity_hours?: number;
  dupatta_compatible?: boolean;
}

// ── MODE: BEAUTY_BRIEF ────────────────────────────────────────────────────

export interface BeautyBriefRequest {
  liked: {
    hair?: string[];
    makeup?: string[];
    accessories?: string[];
  };
  skipped?: {
    hair?: string[];
    makeup?: string[];
    accessories?: string[];
  };
  events: WeddingEvent[];
  outfit_hints?: OutfitHints;
}

export interface PerEventGuidance {
  direction: string;
  mood: string;
}

export interface BeautyBrief {
  headline: string;
  skin_direction: string;
  eye_direction: string;
  lip_direction: string;
  hair_direction: string;
  accessory_direction: string;
  overall_vibe: string;
  per_event_guidance: Partial<Record<string, PerEventGuidance>>;
  style_keywords: string[];
  avoid_list: string[];
}

// ── MODE: EVENT_LOOK ──────────────────────────────────────────────────────

export interface EventLookRequest {
  event: WeddingEvent;
  beauty_brief?: BeautyBrief | null;
  liked_styles?: {
    hair?: string[];
    makeup?: string[];
    accessories?: string[];
  };
  outfit?: string;
  event_duration_hours?: number;
  weather?: string;
}

export interface EventLookHair {
  style: string;
  details: string;
  prep_notes?: string;
  hold_strategy?: string;
}

export interface EventLookMakeup {
  style: string;
  base?: string;
  eyes?: string;
  brows?: string;
  lips?: string;
  cheeks?: string;
  durability_notes?: string;
}

export interface EventLookAccessories {
  head?: string;
  hair?: string;
  face?: string;
  notes?: string;
}

export interface EventLook {
  event: WeddingEvent;
  title: string;
  hair: EventLookHair;
  makeup: EventLookMakeup;
  accessories: EventLookAccessories;
  timeline_minutes?: {
    hair?: number;
    makeup?: number;
    accessories_and_draping?: number;
    photos_of_finished_look?: number;
    total?: number;
  };
}

// ── MODE: CHAIR_SCHEDULE (AI review of the deterministic schedule) ───────
// We let the existing lane-packer build the concrete grid — the AI layer
// produces a narrative summary, conflict callouts beyond the deterministic
// ones, and a recommended bride touch-up window.

export interface ChairSchedulePerson {
  name: string;
  role: string;
  services: string[]; // ["hair", "makeup", "draping"]
  estimated_minutes: number;
  priority?: number;
  is_bride?: boolean;
  assigned_artist?: string;
}

export interface ChairScheduleRequest {
  ceremony_time: string;
  bride_ready_by: string;
  team_arrival: string;
  artists: { name: string; specialty?: string }[];
  people: ChairSchedulePerson[];
  buffer_between_people_minutes?: number;
  bride_touch_up_at_end?: boolean;
}

export interface ChairScheduleReview {
  summary: string;
  warnings: string[];
  artist_utilization: {
    artist: string;
    total_hours: number;
    idle_minutes: number;
    people_count: number;
  }[];
  bride_touch_up?: {
    time: string;
    artist: string;
    notes: string;
  };
}

// ── MODE: SMS_SCHEDULE ────────────────────────────────────────────────────

export interface SmsScheduleRequest {
  schedule: {
    person: string;
    artist: string;
    start: string; // HH:mm
    services: string[];
  }[];
  wedding_details: {
    bride_name: string;
    event: string;
    venue?: string;
    getting_ready_location?: string;
  };
  include_inspo_upload_link?: boolean;
  upload_link_base?: string;
}

export interface SmsMessage {
  person: string;
  message: string;
  estimated_chars: number;
}

// ── MODE: STYLE_QUIZ ──────────────────────────────────────────────────────

export interface StyleQuizRequest {
  person_name: string;
  services: ("hair" | "makeup")[];
  event: WeddingEvent;
}

export type QuizQuestionType = "single_select" | "multi_select" | "free_text";

export interface QuizOption {
  id: string;
  label: string;
  signals: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  options?: QuizOption[];
  placeholder?: string;
}

export interface StyleQuiz {
  intro: string;
  questions: QuizQuestion[];
}

// ── MODE: ACCESSORY_RECOMMEND ─────────────────────────────────────────────

export interface AccessoryRecommendRequest {
  hair_style: string;
  event: WeddingEvent;
  outfit: string;
  jewelry_already_selected?: string[];
  bride_vibe?: string;
}

export type AccessoryConfidence = "strong_match" | "possible" | "stretch";

export interface AccessoryRecommendation {
  accessory: string;
  placement: string;
  why: string;
  pairs_with?: string;
  alternatives?: string[];
  practical_notes?: string;
  confidence: AccessoryConfidence;
}

// ── Route envelope ────────────────────────────────────────────────────────

export type HmuaAiMode =
  | "STYLE_CARDS"
  | "BEAUTY_BRIEF"
  | "EVENT_LOOK"
  | "CHAIR_SCHEDULE"
  | "SMS_SCHEDULE"
  | "STYLE_QUIZ"
  | "ACCESSORY_RECOMMEND";

export type HmuaAiRequest =
  | { mode: "STYLE_CARDS"; payload: StyleCardsRequest }
  | { mode: "BEAUTY_BRIEF"; payload: BeautyBriefRequest }
  | { mode: "EVENT_LOOK"; payload: EventLookRequest }
  | { mode: "CHAIR_SCHEDULE"; payload: ChairScheduleRequest }
  | { mode: "SMS_SCHEDULE"; payload: SmsScheduleRequest }
  | { mode: "STYLE_QUIZ"; payload: StyleQuizRequest }
  | { mode: "ACCESSORY_RECOMMEND"; payload: AccessoryRecommendRequest };

export type HmuaAiResponseData =
  | { mode: "STYLE_CARDS"; cards: StyleCard[] }
  | { mode: "BEAUTY_BRIEF"; beauty_brief: BeautyBrief }
  | { mode: "EVENT_LOOK"; event_look: EventLook }
  | { mode: "CHAIR_SCHEDULE"; schedule: ChairScheduleReview }
  | { mode: "SMS_SCHEDULE"; messages: SmsMessage[] }
  | { mode: "STYLE_QUIZ"; quiz: StyleQuiz }
  | { mode: "ACCESSORY_RECOMMEND"; recommendations: AccessoryRecommendation[] };

export interface HmuaAiResponse {
  ok: boolean;
  data?: HmuaAiResponseData;
  model: string;
  error?: string;
}
