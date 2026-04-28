// ── Videography seed data ─────────────────────────────────────────────────
// Plausible starter data for the videography workspace. Couples land on a
// draft, not an empty page — they can keep, tweak, or delete any of this.
// All rows are pinned to a stable category_id ("videography") so the rest
// of the store can find them cleanly.

import type {
  VideoCameraPosition,
  VideoCoordinationNote,
  VideoCoverage,
  VideoDayOfSlot,
  VideoDeliverable,
  VideoEventArc,
  VideoFilmBrief,
  VideoInterview,
  VideoMicAssignment,
  VideoReferenceFilm,
} from "@/types/videography";

const CATEGORY = "videography";

// Stable ids used so React keys don't reshuffle across loads.
export const SEED_VIDEO_REFERENCE_FILMS: VideoReferenceFilm[] = [];

export const SEED_VIDEO_FILM_BRIEF: VideoFilmBrief | null = null;

export const SEED_VIDEO_EVENT_ARCS: VideoEventArc[] = [
  {
    id: "varc-haldi",
    category_id: CATEGORY,
    event: "haldi",
    opening_shot:
      "Close on a brass lota, water catching morning light. Pull to the courtyard.",
    emotional_anchor:
      "First turmeric touch — Priya's mom pauses, then laughs mid-application.",
    audio_anchor: "Ambient courtyard chatter, kirtan playing soft underneath.",
    closing_shot: "Priya's hands in yellow, held up like a blessing.",
    must_capture: [
      "First application by elders",
      "Siblings smearing Priya (running gag)",
      "Detail: turmeric in brass katori",
    ],
    music_suggestion: "Traditional kirtan fading into a warm string arrangement",
    sort_order: 1,
  },
  {
    id: "varc-sangeet",
    category_id: CATEGORY,
    event: "sangeet",
    opening_shot:
      "Fade in on the stage lights — empty dance floor, haze drifting.",
    emotional_anchor:
      "Mom's surprise dance for the couple — timed to the chorus drop.",
    audio_anchor: "MC announcement, then the first track cue.",
    closing_shot: "Confetti falling in slow motion, crowd blurred behind.",
    must_capture: [
      "Surprise performance (moms)",
      "Bridesmaids' choreographed number",
      "Priya & Arjun reactions from the audience",
      "Late-night dance floor — wide",
    ],
    music_suggestion: "Original reel track → punchy remix of their first-dance song",
    sort_order: 2,
  },
  {
    id: "varc-wedding",
    category_id: CATEGORY,
    event: "wedding",
    opening_shot:
      "Priya's hands being hennaed during morning prep — a quiet counter to the night before.",
    emotional_anchor:
      "Arjun seeing Priya walk to the mandap — hold on his face.",
    audio_anchor: "Pandit's invocation; Priya's vows in full, uncut.",
    closing_shot: "Vidaai — slow motion, no music, only ambient sound.",
    must_capture: [
      "First look (if they choose to)",
      "Varmala — both angles",
      "Pheras — ground level",
      "Sindoor & mangalsutra",
      "Family portraits outside the mandap",
    ],
    music_suggestion: "Strings + subtle tabla; vows unscored",
    sort_order: 3,
  },
  {
    id: "varc-reception",
    category_id: CATEGORY,
    event: "reception",
    opening_shot: "Couple's entrance — backlit, slight smoke, slow push-in.",
    emotional_anchor: "Father of bride's toast — capture the whole room's reaction.",
    audio_anchor: "Toasts in full, then the first-dance track.",
    closing_shot: "Priya & Arjun walking off, lanterns glowing behind.",
    must_capture: [
      "Entrance",
      "All toasts (full audio)",
      "Cake cut",
      "First dance — wide + close",
      "Late-night dance floor energy",
    ],
    music_suggestion:
      "Upbeat, punchy edit on the reel; slow cinematic on the feature",
    sort_order: 4,
  },
];

export const SEED_VIDEO_INTERVIEWS: VideoInterview[] = [
  {
    id: "vint-1",
    category_id: CATEGORY,
    person_name: "Nani (grandmother)",
    relationship: "Priya's grandmother",
    question: "What do you remember about your own wedding day?",
    event_day: "haldi",
    time_slot: "morning_prep",
    location: "Quiet corner of the courtyard",
    captured: false,
    sort_order: 1,
  },
  {
    id: "vint-2",
    category_id: CATEGORY,
    person_name: "Rohan",
    relationship: "Arjun's older brother",
    question: "When did you know Priya was the one for Arjun?",
    event_day: "sangeet",
    time_slot: "between_events",
    location: "Suite hallway — soft light",
    captured: false,
    sort_order: 2,
  },
  {
    id: "vint-3",
    category_id: CATEGORY,
    person_name: "Priya's parents",
    relationship: "Parents of the bride",
    question: "What blessing do you have for Priya and Arjun?",
    event_day: "wedding",
    time_slot: "pre_day",
    location: "Family home, by the window",
    captured: false,
    sort_order: 3,
  },
];

// ── Audio & Coverage ───────────────────────────────────────────────────────

export const SEED_VIDEO_MIC_ASSIGNMENTS: VideoMicAssignment[] = [
  {
    id: "vmic-bride",
    category_id: CATEGORY,
    person_name: "Priya (bride)",
    role: "Bride",
    mic_type: "lavalier",
    events: ["wedding", "reception"],
    notes: "Hidden under dupatta edge for ceremony.",
    sort_order: 1,
  },
  {
    id: "vmic-groom",
    category_id: CATEGORY,
    person_name: "Arjun (groom)",
    role: "Groom",
    mic_type: "lavalier",
    events: ["wedding", "reception"],
    sort_order: 2,
  },
  {
    id: "vmic-pandit",
    category_id: CATEGORY,
    person_name: "Pandit-ji",
    role: "Officiant",
    mic_type: "lavalier",
    events: ["wedding"],
    notes: "Essential — vows unusable without this.",
    sort_order: 3,
  },
  {
    id: "vmic-fob",
    category_id: CATEGORY,
    person_name: "Father of bride",
    role: "Reception speaker",
    mic_type: "handheld",
    events: ["reception"],
    sort_order: 4,
  },
  {
    id: "vmic-ambient",
    category_id: CATEGORY,
    person_name: "Ambient room mic",
    mic_type: "ambient",
    events: ["haldi", "mehendi", "sangeet", "wedding", "reception"],
    notes: "Redundant backup — runs on every event.",
    sort_order: 5,
  },
];

export const SEED_VIDEO_COVERAGE: VideoCoverage[] = [
  { id: "vcov-haldi", category_id: CATEGORY, event: "haldi", level: "full", camera_count: 2 },
  { id: "vcov-mehendi", category_id: CATEGORY, event: "mehendi", level: "key_moments", camera_count: 1 },
  { id: "vcov-sangeet", category_id: CATEGORY, event: "sangeet", level: "full", camera_count: 3 },
  { id: "vcov-baraat", category_id: CATEGORY, event: "baraat", level: "full", camera_count: 3, notes: "Drone if venue permits" },
  { id: "vcov-wedding", category_id: CATEGORY, event: "wedding", level: "full", camera_count: 4 },
  { id: "vcov-reception", category_id: CATEGORY, event: "reception", level: "full", camera_count: 3 },
];

export const SEED_VIDEO_CAMERA_POSITIONS: VideoCameraPosition[] = [
  {
    id: "vcam-wed-main",
    category_id: CATEGORY,
    event: "wedding",
    role: "main",
    position_note: "Front-center of the mandap at seated-eye level, locked off on tripod.",
    sort_order: 1,
  },
  {
    id: "vcam-wed-side",
    category_id: CATEGORY,
    event: "wedding",
    role: "side",
    position_note:
      "Side angle, 90° to Camera 1 — captures fire, hand-tied rituals, and Priya's profile.",
    sort_order: 2,
  },
  {
    id: "vcam-wed-crowd",
    category_id: CATEGORY,
    event: "wedding",
    role: "crowd",
    position_note:
      "Long lens on guest reactions, especially elders in the front rows.",
    sort_order: 3,
  },
  {
    id: "vcam-wed-drone",
    category_id: CATEGORY,
    event: "wedding",
    role: "drone",
    position_note:
      "Aerial establishing of mandap & baraat arrival only — no overhead during rituals.",
    sort_order: 4,
  },
];

export const SEED_VIDEO_COORDINATION: VideoCoordinationNote[] = [
  {
    id: "vcoord-varmala",
    category_id: CATEGORY,
    moment: "Varmala",
    priority: "photo",
    handoff:
      "Photographer has front position. Videographer takes side angle to clear the frame.",
    sort_order: 1,
  },
  {
    id: "vcoord-vidaai",
    category_id: CATEGORY,
    moment: "Vidaai",
    priority: "video",
    handoff:
      "Videographer leads — this scene is audio-and-motion heavy. Photographer stays wide.",
    sort_order: 2,
  },
  {
    id: "vcoord-portraits",
    category_id: CATEGORY,
    moment: "Family portraits",
    priority: "photo",
    handoff:
      "Photographer leads. Videographer grabs B-roll of the setup between groupings.",
    sort_order: 3,
  },
];

// ── Deliverables ──────────────────────────────────────────────────────────

export const SEED_VIDEO_DELIVERABLES: VideoDeliverable[] = [
  {
    id: "vdel-sde",
    category_id: CATEGORY,
    kind: "same_day",
    name: "Reception same-day edit",
    description:
      "60–90 second highlight shown at the reception. Music-driven, fast-cut.",
    contracted_length: "60–90 seconds",
    delivery_target: "Wedding day · 9:00 PM",
    status: "not_started",
    sort_order: 1,
  },
  {
    id: "vdel-teaser",
    category_id: CATEGORY,
    kind: "teaser",
    name: "Social teaser reel",
    description: "For Instagram / WhatsApp — first public share.",
    contracted_length: "60–90 seconds",
    delivery_target: "1 week post-wedding",
    status: "not_started",
    sort_order: 2,
  },
  {
    id: "vdel-highlight",
    category_id: CATEGORY,
    kind: "highlight",
    name: "Highlight film",
    description:
      "The main narrative edit — opens intimate, builds to reception energy.",
    contracted_length: "10–15 minutes",
    delivery_target: "6–8 weeks post-wedding",
    status: "not_started",
    sort_order: 3,
  },
  {
    id: "vdel-feature",
    category_id: CATEGORY,
    kind: "feature",
    name: "Feature film",
    description:
      "Long-form cut for family archives — includes full speeches and interviews.",
    contracted_length: "30–45 minutes",
    delivery_target: "10–12 weeks post-wedding",
    status: "not_started",
    sort_order: 4,
  },
  {
    id: "vdel-ceremony",
    category_id: CATEGORY,
    kind: "ceremony_full",
    name: "Full ceremony capture",
    description:
      "Unedited multi-cam ceremony for family archives — no music, full audio.",
    contracted_length: "~90 minutes",
    delivery_target: "4 weeks post-wedding",
    status: "not_started",
    sort_order: 5,
  },
  {
    id: "vdel-raw",
    category_id: CATEGORY,
    kind: "raw",
    name: "Raw footage on hard drive",
    description: "All unedited files, delivered on a couple-owned drive.",
    delivery_target: "8 weeks post-wedding",
    status: "not_started",
    sort_order: 6,
  },
];

// ── Day-of Coverage ───────────────────────────────────────────────────────

export const SEED_VIDEO_DAY_OF: VideoDayOfSlot[] = [
  {
    id: "vdof-haldi-0700",
    category_id: CATEGORY,
    event: "haldi",
    time_label: "7:00 AM · Crew call",
    location: "Bride's family home · Courtyard",
    audio_note: "Ambient mic on stand. No lavs needed this event.",
    camera_movement: "handheld",
    broll_note:
      "15 min before family arrives — capture empty lotas, turmeric paste, floral details.",
    sort_order: 1,
  },
  {
    id: "vdof-sangeet-1800",
    category_id: CATEGORY,
    event: "sangeet",
    time_label: "6:00 PM · Arrivals & warm-up",
    location: "Hotel ballroom · Main stage",
    audio_note:
      "Lav on MC at 5:30 PM mic check. Soundboard feed confirmed by audio tech.",
    camera_movement: "steadicam",
    broll_note:
      "Stage-light tests, empty dance floor, decor details before doors open.",
    drone_window: "Skip — indoor venue.",
    sort_order: 2,
  },
  {
    id: "vdof-wedding-1600",
    category_id: CATEGORY,
    event: "wedding",
    time_label: "4:00 PM · Processional",
    location: "Mandap lawn",
    audio_note:
      "Lavs on Priya, Arjun, Pandit by 3:30 PM. Ambient mic on mandap corner.",
    camera_movement: "tripod",
    broll_note: "Mandap florals, fire, guest arrivals.",
    drone_window: "3:45–4:00 PM — baraat aerial, then grounded for ceremony.",
    sort_order: 3,
  },
  {
    id: "vdof-reception-2030",
    category_id: CATEGORY,
    event: "reception",
    time_label: "8:30 PM · Entrance & toasts",
    location: "Hotel ballroom",
    audio_note:
      "Handheld mic for toasts — hand-off confirmed with DJ. Lavs still on couple.",
    camera_movement: "slider",
    broll_note:
      "Late-night dance floor — spotlight, confetti, slow-mo reactions.",
    drone_window: "Skip — indoor.",
    sort_order: 4,
  },
];
