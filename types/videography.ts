// ── Videography-specific domain types ─────────────────────────────────────
// Videography's planning surface is fundamentally different from Photography:
// Photography plans discrete moments (a Shot List), Videography plans a
// continuous narrative arc and the technical layers that carry audio, motion
// and story. These types back the Film Vision, Audio & Coverage, Deliverables
// and Day-of Coverage tabs.

import type { WeddingEvent } from "./workspace";

// ── Shared ─────────────────────────────────────────────────────────────────

export type VideoEventId =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "wedding"
  | "reception"
  | "general";

export const VIDEO_EVENTS: { id: VideoEventId; label: string; date?: string }[] = [
  { id: "haldi", label: "Haldi", date: "Nov 12" },
  { id: "mehendi", label: "Mehendi", date: "Nov 13" },
  { id: "sangeet", label: "Sangeet", date: "Nov 13" },
  { id: "baraat", label: "Baraat", date: "Nov 14" },
  { id: "wedding", label: "Wedding", date: "Nov 14" },
  { id: "reception", label: "Reception", date: "Nov 15" },
  { id: "general", label: "General" },
];

// ── Vision & Mood ──────────────────────────────────────────────────────────
// A reference film is a link (YouTube/Vimeo) or an uploaded clip the couple
// pins as a directional reference. This is the single most useful input
// videographers ask for.

export interface VideoReferenceFilm {
  id: string;
  category_id: string;
  url: string;                 // YouTube / Vimeo / uploaded blob URL
  title?: string;              // freeform title ("Our Maysoon moment")
  note?: string;               // why this reference matters
  thumbnail_url?: string | null;
  sort_order: number;
}

// The "film brief" is the narrative the couple (and AI) co-write after the
// Vision quiz. It's a single piece of prose per workspace, not a list.
export interface VideoFilmBrief {
  category_id: string;
  body: string;
  updated_at: string;
}

// ── Film Vision (per-event narrative arc) ──────────────────────────────────
// The storyboard. Each event carries an opening shot, emotional anchor,
// audio anchor, closing shot, concise must-capture beats and a song vibe.

export interface VideoEventArc {
  id: string;
  category_id: string;
  event: VideoEventId;
  opening_shot?: string;         // "Drone pulling back from the dance floor"
  emotional_anchor?: string;     // "Mom's surprise dance"
  audio_anchor?: string;         // "Nani's blessing recorded earlier"
  closing_shot?: string;         // "Confetti falling in slow motion"
  must_capture: string[];        // concise beats — video is continuous
  music_suggestion?: string;     // "Bollywood warm, Arijit Singh-ish"
  sort_order: number;
}

// ── Interviews ─────────────────────────────────────────────────────────────
// Used as voiceover narration in the edit. Who to talk to, which question,
// when and where.

export type InterviewSlot = "morning_prep" | "between_events" | "reception" | "pre_day" | "post_day";

export const INTERVIEW_SLOT_LABEL: Record<InterviewSlot, string> = {
  morning_prep: "Morning prep",
  between_events: "Between events",
  reception: "Reception lull",
  pre_day: "Day before",
  post_day: "Day after",
};

export interface VideoInterview {
  id: string;
  category_id: string;
  person_name: string;
  relationship?: string;
  question?: string;
  event_day?: VideoEventId;
  time_slot?: InterviewSlot;
  location?: string;
  captured: boolean;
  sort_order: number;
}

// ── Audio & Coverage ───────────────────────────────────────────────────────

export type MicType = "lavalier" | "handheld" | "ambient" | "shotgun";

export const MIC_TYPE_LABEL: Record<MicType, string> = {
  lavalier: "Lav mic",
  handheld: "Handheld",
  ambient: "Ambient room",
  shotgun: "Shotgun",
};

export interface VideoMicAssignment {
  id: string;
  category_id: string;
  person_name: string;           // "Priya", "Officiant", "Father of bride"
  role?: string;                 // descriptive role
  mic_type: MicType;
  // Events this person is mic'd for (ids of VideoEventId | custom).
  events: VideoEventId[];
  notes?: string;
  sort_order: number;
}

export type CoverageLevel = "full" | "key_moments" | "skip";

export const COVERAGE_LEVEL_LABEL: Record<CoverageLevel, string> = {
  full: "Full coverage",
  key_moments: "Key moments only",
  skip: "Skip",
};

// One row per event — whether it gets video, and how much.
export interface VideoCoverage {
  id: string;
  category_id: string;
  event: VideoEventId;
  level: CoverageLevel;
  camera_count?: number;         // 1-5
  notes?: string;
}

export type CameraRole = "main" | "side" | "crowd" | "drone" | "steadicam" | "b_cam";

export const CAMERA_ROLE_LABEL: Record<CameraRole, string> = {
  main: "Camera 1 · Main",
  side: "Camera 2 · Side angle",
  crowd: "Camera 3 · Crowd / reactions",
  drone: "Drone · Aerial",
  steadicam: "Steadicam",
  b_cam: "B-cam · B-roll",
};

// Camera positions by event — most useful for the Ceremony but applicable
// to any event with multi-cam coverage.
export interface VideoCameraPosition {
  id: string;
  category_id: string;
  event: VideoEventId;
  role: CameraRole;
  position_note: string;         // "Front-facing the couple, mandap height"
  operator_name?: string;
  sort_order: number;
}

// Coordination note between photo + video teams.
export interface VideoCoordinationNote {
  id: string;
  category_id: string;
  moment: string;                // "Varmala"
  priority: "photo" | "video" | "shared";
  handoff: string;               // "Photographer front; videographer takes side"
  sort_order: number;
}

// ── Deliverables ───────────────────────────────────────────────────────────

export type VideoDeliverableKind =
  | "same_day"
  | "teaser"
  | "highlight"
  | "feature"
  | "ceremony_full"
  | "raw"
  | "interview_package";

export const VIDEO_DELIVERABLE_LABEL: Record<VideoDeliverableKind, string> = {
  same_day: "Same-day edit",
  teaser: "Teaser reel",
  highlight: "Highlight film",
  feature: "Feature film",
  ceremony_full: "Full ceremony capture",
  raw: "Raw footage",
  interview_package: "Interview package",
};

export type VideoDeliverableStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "revisions"
  | "approved"
  | "delivered";

export const VIDEO_DELIVERABLE_STATUS_LABEL: Record<VideoDeliverableStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  review: "Ready for review",
  revisions: "Revisions requested",
  approved: "Approved",
  delivered: "Delivered",
};

export interface VideoDeliverable {
  id: string;
  category_id: string;
  kind: VideoDeliverableKind;
  name: string;
  description?: string;
  contracted_length?: string;    // "5–15 min", "90 seconds"
  delivery_target?: string;      // "6–8 weeks post-wedding"
  status: VideoDeliverableStatus;
  preview_url?: string;          // Vimeo / private link
  download_url?: string;
  revision_notes?: string;
  music_reviewed?: boolean;      // separate approval step
  sort_order: number;
}

// ── Day-of Coverage ────────────────────────────────────────────────────────

export type CameraMovement = "tripod" | "steadicam" | "handheld" | "slider" | "drone";

export const CAMERA_MOVEMENT_LABEL: Record<CameraMovement, string> = {
  tripod: "Tripod",
  steadicam: "Steadicam",
  handheld: "Handheld",
  slider: "Slider",
  drone: "Drone",
};

export interface VideoDayOfSlot {
  id: string;
  category_id: string;
  event: VideoEventId;
  time_label: string;              // "6:30 PM · Varmala"
  location?: string;
  audio_note?: string;             // "Mic check on officiant; lav on groom"
  camera_movement?: CameraMovement;
  broll_note?: string;             // "15 min before — empty venue details"
  drone_window?: string;           // "6:45–7:00 PM · golden hour only"
  sort_order: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function videoEventLabel(id: VideoEventId | string): string {
  return VIDEO_EVENTS.find((e) => e.id === id)?.label ?? id;
}

// Maps a VideoEventId to the platform-canonical WeddingEvent when the id
// matches one. VideoEventId.general has no WeddingEvent counterpart.
export function toWeddingEvent(id: VideoEventId): WeddingEvent | null {
  switch (id) {
    case "haldi":
      return "haldi";
    case "mehendi":
      return "mehendi";
    case "sangeet":
      return "sangeet";
    case "wedding":
    case "baraat":
      return "wedding";
    case "reception":
      return "reception";
    default:
      return null;
  }
}
