// ── Music & Entertainment collaboration types ─────────────────────────────
// Shared vocabulary for the working-desk version of the Music workspace.
// Three internal parties (Priya + Arjun + Urvashi) plus an arbitrary
// number of vendor parties whose ids are whatever the vendor store uses.
// Persisted via Zustand + localStorage like every other workspace — no
// backend.
//
// The shape mirrors types/catering.ts where they overlap, but the music
// module diverges in two places:
//   1. Reactions are five-state ("love" | "yes" | "unsure" | "no" | "idle")
//      rather than three, so "haven't looked yet" is a first-class state
//      and the cluster always shows one chip per internal party.
//   2. MusicEntityState follows the brief's pill vocabulary directly —
//      "waiting" names the party we're waiting on, which catering never
//      needed.

// ── Identity ─────────────────────────────────────────────────────────────

// A party id is either one of the fixed couple/planner role strings or
// an arbitrary vendor id sourced from the vendors store. We keep it
// loose (`string`) so vendor ids can flow through unchanged.
export type MusicPartyId = string;

export type MusicPartyRole = "couple" | "planner" | "vendor";

// Tones map to existing Ananya palette variables — no new colors.
// Note: the spec asks for "muted blue" for Arjun, which isn't in the
// palette; we use sage (the closest cool, restrained tone) so we stay
// inside the locked design language.
export type MusicPartyTone = "rose" | "sage" | "ink" | "gold";

export interface MusicParty {
  id: MusicPartyId;
  initials: string;
  display_name: string;
  role: MusicPartyRole;
  tone: MusicPartyTone;
}

// ── Entity state ─────────────────────────────────────────────────────────

export type MusicEntityState =
  | "draft"
  | "waiting"
  | "in_debate"
  | "resolved"
  | "blocked"
  | "parked";

// ── Reactions ────────────────────────────────────────────────────────────
// Five states so "haven't looked yet" is explicit. `idle` is the default
// — a party with no stored reaction still renders a chip, just in idle
// style. That's what makes the cluster legible at a glance ("Arjun
// hasn't weighed in").
export type MusicReactionKind =
  | "love"
  | "yes"
  | "unsure"
  | "no"
  | "idle";

export interface MusicReaction {
  id: string;
  entity_id: string;
  entity_kind: string;          // free-form — "song", "performer", "set_list_slot"
  party_id: MusicPartyId;
  kind: MusicReactionKind;
  note?: string;                // short explanation surfaced on click
  updated_at: string;
}

// Convenience — ordered for deterministic cycling in the UI. Idle is at
// the end so a click cycles love → yes → unsure → no → idle → love.
export const MUSIC_REACTION_ORDER: MusicReactionKind[] = [
  "love",
  "yes",
  "unsure",
  "no",
  "idle",
];

// ── Comments ─────────────────────────────────────────────────────────────

export interface MusicComment {
  id: string;
  entity_id: string;
  entity_kind: string;
  party_id: MusicPartyId;
  parent_id?: string;           // 2 levels of nesting max (enforced at render)
  body: string;                 // may contain @-mentions as "@priya" etc.
  reference_url?: string;       // optional inline reference
  created_at: string;
  resolved_at?: string;
}

// ── References / embeds ──────────────────────────────────────────────────
// Discriminated union returned by lib/music/references.ts classifyUrl().
// Keeps the component switch exhaustive instead of string-sniffing at
// render time.
export type MusicReferenceKind =
  | "spotify"
  | "youtube"
  | "instagram"
  | "soundcloud"
  | "apple_music"
  | "image"
  | "link";

export interface MusicReference {
  kind: MusicReferenceKind;
  url: string;
  // Kind-specific derivations. Undefined fields are filled at render time
  // (youtube thumbnail, link OG fetch, etc.).
  spotify_kind?: "track" | "album" | "playlist" | "episode" | "show";
  spotify_id?: string;
  youtube_id?: string;
  soundcloud_url?: string;      // the embed URL can reuse the original
  instagram_kind?: "p" | "reel" | "tv";
  instagram_id?: string;
  apple_embed?: string;         // music.apple.com/* becomes embed.music.apple.com/*
}

// ── Events ───────────────────────────────────────────────────────────────
// Music-shaped event list — differs from types/workspace.ts WeddingEvent
// by using "ceremony_lunch" to match the brief's filter bar copy.

export type MusicEventId =
  | "all"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "ceremony_lunch"
  | "reception";

export interface MusicEventOption {
  id: MusicEventId;
  label: string;
}

export const MUSIC_EVENTS: MusicEventOption[] = [
  { id: "all", label: "All" },
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "ceremony_lunch", label: "Ceremony & Lunch" },
  { id: "reception", label: "Reception" },
];

// ── Presence ─────────────────────────────────────────────────────────────

export interface MusicPresenceSignal {
  party_id: MusicPartyId;
  last_seen_at: string;         // ISO
  last_action?: string;         // "replied", "viewed", "added song"
}

// ── Work-in-progress strip items ─────────────────────────────────────────
// Shape consumed by WorkInProgressStrip. Caller derives these from
// whatever tab-level store is in play (Zustand slice, context, etc.)
// and the strip renders them without knowing the source.

export interface MusicWipItem {
  id: string;
  title: string;
  hint?: string;
  state: MusicEntityState;
  waiting_on?: MusicPartyId;    // shown only when state === "waiting"
  attribution: MusicPartyId[];  // 1–3 ids that own / last-edited
  onJump?: () => void;
}

// ── Shortlist & Contract domain ──────────────────────────────────────────
// Music has many vendor types, unlike catering's single "caterer" entity.
// A candidate is the music-scoped working record: it may or may not be
// linked to a global Vendor row (vendor_id optional — a candidate can be
// an unknown lead Urvashi heard about before we've added them to the
// vendor directory).

export type MusicVendorType =
  | "dj"
  | "band"
  | "dhol"
  | "classical_singers"
  | "choreographer"
  | "mc"
  | "other";

export const MUSIC_VENDOR_TYPES: { id: MusicVendorType; label: string }[] = [
  { id: "dj", label: "DJ" },
  { id: "band", label: "Live Band" },
  { id: "dhol", label: "Dhol" },
  { id: "classical_singers", label: "Classical Singers" },
  { id: "choreographer", label: "Sangeet Choreographer" },
  { id: "mc", label: "MC" },
  { id: "other", label: "Other" },
];

// Pipeline statuses — strictly richer than the generic MusicEntityState
// because the Shortlist & Contract board needs to encode booking state.
// MusicEntityState is still used for WIP strip pills (it maps from this
// status; see musicCandidateEntityState below).
export type MusicCandidateStatus =
  | "draft"               // just logged, nothing sent
  | "waiting_vendor"      // outreach sent, awaiting reply
  | "proposal_received"   // vendor has sent terms
  | "in_debate"           // parties disagree
  | "booked"              // verbal yes, contract in motion
  | "contract_sent"       // contract PDF sent to vendor
  | "signed"              // fully executed
  | "passed"              // passed on, with reason
  | "parked";             // not now, maybe later

export interface MusicPendingAction {
  owner: MusicPartyId;              // who the action is waiting on
  description: string;              // "Listen to the sample mix", "Request availability"
  due_at?: string;                  // optional ISO date
}

export interface MusicCandidate {
  id: string;
  wedding_id: string;
  vendor_type: MusicVendorType;
  name: string;                     // "DJ Pranav", "Mumbai Dhol Ensemble"
  descriptor: string;               // one-line — "Mumbai wedding DJ, Bollywood + house"
  rate_low?: number;                // INR. Undefined if not yet quoted.
  rate_high?: number;
  currency: "INR";
  // 1–3 sample links (Spotify / YouTube / Instagram / SoundCloud / etc.).
  // ReferenceEmbed classifies and renders them.
  sample_urls: string[];
  // Which events this candidate is being considered for. Drives the event
  // filter bar slicing.
  events: MusicEventId[];
  status: MusicCandidateStatus;
  pending_action?: MusicPendingAction;
  // When the candidate sits in `passed`, why. Kept visible in the Passed
  // section so the decision is reviewable later without spelunking
  // through comments.
  passed_reason?: string;
  // Optional link to a Vendor row if this candidate has been added to
  // the global vendor directory. Many music leads never will be.
  vendor_id?: string;
  // Who suggested this candidate (used in Attribution).
  suggested_by: MusicPartyId;
  created_at: string;
  updated_at: string;
}

// Per-party lean on a candidate. Shares its vocabulary with
// MusicReactionKind ("love" | "yes" | "unsure" | "no" | "idle") so the
// ReactionCluster primitive renders these directly.
export interface MusicCandidateLean {
  id: string;
  wedding_id: string;
  candidate_id: string;
  party_id: MusicPartyId;
  lean: MusicReactionKind;
  note?: string;
  updated_at: string;
}

// Contract status is richer than the spec's simple labels because we
// need to distinguish "sent but not signed by either party" from
// "signed by vendor, awaiting countersign." Aligns with
// ContractStatus in types/workspace.ts.
export type MusicContractStatus =
  | "draft"
  | "sent"
  | "signed_by_vendor"
  | "countersigned";

export interface MusicPaymentMilestone {
  id: string;
  label: string;
  amount: number;                   // INR
  due_date?: string;
  paid_at?: string;
}

export interface MusicContract {
  id: string;
  wedding_id: string;
  candidate_id: string;
  status: MusicContractStatus;
  total_amount?: number;            // INR; undefined while the contract is still pricing
  currency: "INR";
  // Deposit split out because it's the single number the couple checks
  // most often ("did Priya's dad wire the deposit yet?").
  deposit_amount?: number;
  deposit_paid?: number;
  milestones: MusicPaymentMilestone[];
  pdf_url?: string;
  sent_at?: string;
  signed_by_vendor_at?: string;
  countersigned_at?: string;
  created_at: string;
  updated_at: string;
}

// ── Energy arc ───────────────────────────────────────────────────────────
// Visual-graph state from quiz Q1. Five canonical events, each on a
// 0–100 energy scale (low → intimate, high → party). Drives Soundscape
// suggestions and the right-rail Energy Map.

export type EnergyEventId =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "ceremony"
  | "reception";

export interface EnergyPoint {
  event: EnergyEventId;
  energy: number;             // 0..100
}

// ── Sangeet style (quiz Q2) ──────────────────────────────────────────────
// Drives whether the Sangeet Planner tab is visible (`sangeet-skip` hides
// it) and what scaffolding the planner shows by default.

export type SangeetStyle =
  | "sangeet-casual"
  | "sangeet-semi"
  | "sangeet-production"
  | "sangeet-show"
  | "sangeet-skip";

// ── Live-vs-DJ disposition (quiz Q4) ─────────────────────────────────────

export type LiveDjMix =
  | "dj-primary"
  | "hybrid"
  | "live-primary"
  | "acoustic-ceremony";

// ── Genre taste (quiz Q3) ────────────────────────────────────────────────
// Free-form chip ids used to seed playlist filters and the genre-mix
// percentage breakdown.

export type GenreTaste =
  | "classic-bollywood"
  | "modern-bollywood"
  | "sufi-qawwali"
  | "classical"
  | "western-pop"
  | "edm"
  | "hip-hop"
  | "eclectic";

// ── Non-negotiable moments (quiz Q5) ─────────────────────────────────────

export type NonNegotiableMoment =
  | "dhol-baraat"
  | "couple-first-dance"
  | "parent-dances"
  | "grand-entrance"
  | "vidaai-song"
  | "bouquet-toss"
  | "late-night-bollywood"
  | "hora-chair-lift";

// ── Soundscape (per event) ───────────────────────────────────────────────
// Captures the emotional design for an event: opening / build / peak /
// wind-down moods plus three playlist categories (must / request / dnp).

export type PlaylistKind = "must" | "request" | "dnp";

export interface PlaylistTrack {
  id: string;
  title: string;
  artist?: string;
  // Streaming link the ReferenceEmbed primitive can render inline.
  url?: string;
  // Which moment / cue this is for — free-form ("entrance", "first dance",
  // "dinner background"). Surfaced as a chip on the row.
  moment?: string;
  notes?: string;
  added_by: MusicPartyId;
  added_at: string;
}

export interface Playlist {
  kind: PlaylistKind;
  tracks: PlaylistTrack[];
}

// One soundscape per event. The four mood lines describe the emotional
// arc; if a couple skips them the playlists still work standalone.
export interface Soundscape {
  id: string;
  wedding_id: string;
  event: EnergyEventId;
  opening_mood?: string;
  build_mood?: string;
  peak_mood?: string;
  wind_down_mood?: string;
  // Pre-populated cultural-music requirements that match the event type.
  // Couples can edit / dismiss but the seed gives them a starting point.
  cultural_requirements: string[];
  playlists: {
    must: Playlist;
    request: Playlist;
    dnp: Playlist;
  };
  updated_at: string;
}

// ── Sangeet Planner ──────────────────────────────────────────────────────

export type SangeetActType =
  | "dance"
  | "skit"
  | "speech"
  | "slideshow"
  | "live_music"
  | "surprise";

export type SangeetActStatus =
  | "not_started"
  | "in_rehearsal"
  | "ready"
  | "dress_rehearsal_done";

export interface SangeetPerformer {
  name: string;
  // Soft-attendance — `confirmed` once they've shown up to a rehearsal.
  confirmed: boolean;
  // Free-form note the couple jots in. ("In NYC — joining via Zoom.")
  note?: string;
}

export interface SangeetAct {
  id: string;
  wedding_id: string;
  name: string;                           // "Kapoor Cousins' Bollywood Mashup"
  type: SangeetActType;
  performers: SangeetPerformer[];
  songs: PlaylistTrack[];                 // 1–N tracks (medley / mashup)
  estimated_minutes: number;
  status: SangeetActStatus;
  // AV requirements (optional bool flags so the Master Sheet aggregator
  // can sum them up cleanly).
  needs_screen?: boolean;
  needs_lighting?: boolean;
  wireless_mics?: number;                 // count
  props?: string;
  // True if the couple is hidden from this act (someone is surprising
  // them). We preserve a separate `surprise_for` field so the planner
  // can still see the act in their view.
  surprise?: boolean;
  surprise_for?: ("priya" | "arjun" | "couple")[];
  // Drag-and-drop order within the running list.
  sort_order: number;
  // Free-form transition note — what plays / happens *between* this act
  // and the next ("Emcee fills 30s, lights dim").
  transition_after?: string;
  // Most recent rehearsal date, to surface "hasn't rehearsed in 14 days"
  // warnings on the act card.
  last_rehearsed_at?: string;
  // Optional next rehearsal anchor.
  next_rehearsal_at?: string;
  rehearsal_location?: string;
  created_at: string;
  updated_at: string;
}

// ── Equipment & Technical ────────────────────────────────────────────────
// One bundle per event. Sound + lighting + stage + power are kept inside
// one record because they're decided together at venue walkthroughs.

export interface SoundSpeaker {
  id: string;
  // Where the speaker lives ("Main PA stage left", "Subwoofer center").
  placement: string;
  kind: "main_pa" | "monitor" | "delay" | "subwoofer" | "fill";
}

export interface SoundMic {
  id: string;
  kind: "wireless_handheld" | "lapel" | "instrument" | "headset";
  count: number;
  notes?: string;                         // "for emcee + speeches"
}

export type VolumePhase =
  | "ceremony"
  | "cocktails"
  | "dinner"
  | "party"
  | "after_curfew";

export interface VolumeLevel {
  phase: VolumePhase;
  // 1..5 where 1 = ambient, 5 = club. Matches the brief's qualitative
  // language (ceremony low, party high) without forcing dB precision.
  level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface LightingPlan {
  uplighting_color?: string;              // tied to Décor palette label
  dance_floor?: string;                   // "Disco ball + LED wash"
  performance_spotlight?: boolean;
  pin_spots_on_centerpieces?: boolean;
  cake_spotlight?: boolean;
  ceremony_lighting?: string;             // "Up-lit mandap + candle aisle"
  notes?: string;
}

export interface StagePlan {
  stage_size?: string;                    // "16x12 ft riser"
  dance_floor_size?: string;              // "30x30 ft parquet"
  dj_booth_placement?: string;
  stage_risers_for_performers?: boolean;
  notes?: string;
}

export interface PowerPlan {
  total_draw_estimate?: string;           // "~80A 3-phase"
  generator_required?: boolean;
  power_drop_locations?: string[];
  notes?: string;
}

export interface TechSpec {
  id: string;
  wedding_id: string;
  event: EnergyEventId;
  speakers: SoundSpeaker[];
  mics: SoundMic[];
  sound_check_at?: string;                // ISO datetime
  sound_check_attendees?: string[];       // free-form names
  volume_levels: VolumeLevel[];
  backup_plan?: string;
  lighting: LightingPlan;
  stage: StagePlan;
  power: PowerPlan;
  updated_at: string;
}

// ── Day-of music schedule ────────────────────────────────────────────────
// Per-event timeline of cues — load-in → sound check → cued moments →
// teardown. Distinct from the workspace_items schedule_slot blocks
// because each cue carries handoff + curfew metadata the DJ needs.

export type ScheduleSlotKind =
  | "load_in"
  | "sound_check"
  | "background_music"
  | "cue"
  | "handoff"
  | "curfew_warning"
  | "after_party"
  | "teardown";

export interface MusicScheduleSlot {
  id: string;
  wedding_id: string;
  event: EnergyEventId;
  // 24h "HH:mm" — sortable, unambiguous. Day-anchored externally via
  // EventDayId on the broader timeline.
  start_time: string;
  end_time?: string;
  kind: ScheduleSlotKind;
  label: string;                          // "Cocktail jazz playlist"
  // Vendor responsible (free-form id from vendor_names map).
  owner?: string;
  notes?: string;
  // For handoff slots — who's handing to whom, and how long the gap is.
  handoff_from?: string;
  handoff_to?: string;
  // Highlights this cue with a curfew warning style.
  curfew?: boolean;
  sort_order: number;
}
