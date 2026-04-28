// ── Community types ─────────────────────────────────────────────────────────
// Brides-facing social layer + editorial blog + in-person meetups. No
// Supabase — everything persists in Zustand + localStorage stores. Schema
// mirrors the original Supabase sketch so a migration is straightforward if
// persistence moves later.

export type GuestCountRange =
  | "under-50"
  | "50-100"
  | "100-200"
  | "200-300"
  | "300-500"
  | "500-plus";

export const GUEST_COUNT_RANGES: { id: GuestCountRange; label: string }[] = [
  { id: "under-50", label: "Under 50" },
  { id: "50-100", label: "50–100" },
  { id: "100-200", label: "100–200" },
  { id: "200-300", label: "200–300" },
  { id: "300-500", label: "300–500" },
  { id: "500-plus", label: "500+" },
];

// Compact buckets used in the "basics" onboarding step.
export const GUEST_COUNT_BUCKETS: {
  id: GuestCountRange;
  label: string;
  helper: string;
}[] = [
  { id: "under-50", label: "intimate", helper: "under 50" },
  { id: "100-200", label: "medium", helper: "50–150" },
  { id: "200-300", label: "big", helper: "150–300" },
  { id: "500-plus", label: "grand", helper: "300+" },
];

export interface InterestTag {
  slug: string;
  label: string;
  emoji: string;
  sort_order: number;
}

// ── Wedding event list ──────────────────────────────────────────────────────
export type WeddingEvent =
  | "mehendi"
  | "sangeet"
  | "haldi"
  | "baraat"
  | "wedding"
  | "reception"
  | "pre-wedding"
  | "after-party";

export const WEDDING_EVENTS: { id: WeddingEvent; label: string }[] = [
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "haldi", label: "Haldi" },
  { id: "baraat", label: "Baraat" },
  { id: "wedding", label: "Wedding" },
  { id: "reception", label: "Reception" },
  { id: "pre-wedding", label: "Pre-wedding" },
  { id: "after-party", label: "After-party" },
];

// ── Profile photos ──────────────────────────────────────────────────────────
export type ProfilePhotoType =
  | "cover"
  | "engagement"
  | "venue"
  | "outfit"
  | "decor"
  | "mehendi"
  | "bridal_party"
  | "general";

export interface ProfilePhoto {
  id: string;
  // One of:
  data_url?: string; // base64 data URL (user uploads)
  seed_gradient?: [string, string]; // gradient colors for seeded profiles
  seed_label?: string; // short label drawn over the gradient
  caption?: string;
  sort_order: number;
  photo_type: ProfilePhotoType;
  created_at: string;
}

// ── Color palette ──────────────────────────────────────────────────────────
export interface ColorSwatch {
  name: string;
  hex: string; // e.g. "#DCAE96"
}

// ── Fun facts ──────────────────────────────────────────────────────────────
export interface ProfilePrompt {
  slug: string;
  prompt_text: string;
  placeholder: string;
  sort_order: number;
}

// Keyed by prompt slug. Values are free text (short-answer style).
export type FunFacts = Record<string, string>;

// ── Community profile ──────────────────────────────────────────────────────
export interface CommunityProfile {
  id: string;
  user_id: string;

  // Visible card
  display_name: string;
  cover_photo_data_url?: string; // uploaded cover
  cover_seed_gradient?: [string, string]; // seed-only fallback
  cover_seed_label?: string;
  avatar_data_url?: string; // small avatar — optional if a cover exists
  quote?: string; // single-sentence dream-wedding line (≤500 chars)

  // Wedding context
  hometown?: string;
  wedding_city?: string;
  wedding_date?: string; // ISO yyyy-mm-dd; month precision fine
  partner_name?: string;
  guest_count_range?: GuestCountRange;

  // Rich wedding details
  wedding_events: WeddingEvent[];
  color_palette: ColorSwatch[];
  wedding_song?: string; // "Kesariya — it's our song"

  // Fun facts (keyed by prompt slug)
  fun_facts: FunFacts;

  // Legacy / compact alt of quote; kept so v1 profiles read cleanly.
  wedding_vibe?: string;

  // Social prefs
  open_to_connect: boolean;
  looking_for: string[]; // interest tag slugs

  // Experienced brides — women whose wedding has passed and who want to
  // mentor / connect with upcoming brides. `wedding_date` is still in the
  // past for these profiles; `here_to_help` is a short "areas of expertise"
  // line shown on their card and detail view.
  is_experienced?: boolean;
  expertise_tags?: string[]; // short labels, e.g. "indian weddings", "budget planning"
  here_to_help?: string; // one-liner shown on experienced profiles

  // Meta
  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface CommunityConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  read_at?: string;
  created_at: string;
}

export interface CommunityBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface CommunityReport {
  id: string;
  reporter_id: string;
  reported_profile_id?: string;
  reported_message_id?: string;
  reason: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
}

// ── Blog categories (re-exported from v1) ──────────────────────────────────
export interface BlogCategory {
  slug: string;
  label: string;
  sort_order: number;
  tags: string[];
}

// ── Meetups ────────────────────────────────────────────────────────────────
export type MeetupType =
  | "coffee_chat"
  | "brunch"
  | "wedding_market"
  | "workshop"
  | "virtual_hangout"
  | "vendor_event"
  | "custom";

export const MEETUP_TYPES: {
  id: MeetupType;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  {
    id: "coffee_chat",
    label: "Coffee chat",
    emoji: "☕",
    blurb: "small-group casual hangout",
  },
  {
    id: "brunch",
    label: "Brunch",
    emoji: "🥂",
    blurb: "weekend morning group meetup",
  },
  {
    id: "wedding_market",
    label: "Wedding market",
    emoji: "🎪",
    blurb: "bridal show, trunk show, expo",
  },
  {
    id: "workshop",
    label: "Workshop",
    emoji: "🧵",
    blurb: "DIY, calligraphy, floral, mehendi practice",
  },
  {
    id: "virtual_hangout",
    label: "Virtual hangout",
    emoji: "💻",
    blurb: "video call — open to brides anywhere",
  },
  {
    id: "vendor_event",
    label: "Vendor event",
    emoji: "🎀",
    blurb: "tasting, open house, appointment",
  },
  { id: "custom", label: "Something else", emoji: "✨", blurb: "your call" },
];

export type MeetupStatus =
  | "draft"
  | "upcoming"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MeetupOrganizerType = "bride" | "ananya" | "vendor";

export interface Meetup {
  id: string;

  organizer_id?: string; // references a community profile
  organizer_type: MeetupOrganizerType;

  title: string;
  description?: string;
  cover_image_data_url?: string;
  cover_seed_gradient?: [string, string]; // seed fallback

  meetup_type: MeetupType;

  city: string;
  state?: string;
  venue_name?: string;
  venue_address?: string;
  is_virtual: boolean;
  virtual_link?: string;

  starts_at: string; // ISO timestamp
  ends_at?: string;

  max_attendees?: number;
  status: MeetupStatus;

  target_wedding_months: string[]; // e.g. ["2026-10", "2026-11"]
  target_interests: string[]; // interest tag slugs

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export type MeetupRsvpStatus = "going" | "maybe" | "cancelled";

export interface MeetupRsvp {
  id: string;
  meetup_id: string;
  profile_id: string;
  status: MeetupRsvpStatus;
  created_at: string;
}

// ── Huddles ────────────────────────────────────────────────────────────────
// Live audio-first rooms inspired by Slack Huddles. No real WebRTC — the
// "live" experience is simulated (rotating speaker pulses, stubbed mic /
// camera toggles) so the UX renders end-to-end on top of the localStorage
// store. Schema mirrors the original Daily.co + Supabase sketch so a move
// to a real backend is a drop-in.

export type HuddleType = "instant" | "scheduled";

export type HuddleStatus = "waiting" | "live" | "ended";

export type HuddleParticipantStatus = "in_room" | "left" | "invited";

export interface Huddle {
  id: string;

  host_id: string; // community profile id

  title: string;
  description?: string;
  topic_tags: string[]; // interest tag slugs

  huddle_type: HuddleType;
  scheduled_at?: string; // ISO — present when huddle_type === "scheduled"

  status: HuddleStatus;
  started_at?: string;
  ended_at?: string;

  max_participants: number;

  city?: string;
  target_wedding_months: string[]; // ["2026-10", "2026-11"]
  is_open: boolean;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface HuddleParticipant {
  id: string;
  huddle_id: string;
  profile_id: string;
  status: HuddleParticipantStatus;
  has_video: boolean;
  mic_on: boolean;
  joined_at: string;
  left_at?: string;
}

export interface HuddleMessage {
  id: string;
  huddle_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// ── Discussions ────────────────────────────────────────────────────────────
// Reddit/forum-style Q&A board. Flat (no nested replies), warm tone — a
// "helpful" count in place of upvotes so the dynamics stay positive.

export type DiscussionCategorySlug =
  | "vendor_recs"
  | "advice"
  | "budget"
  | "venues"
  | "attire"
  | "decor_flowers"
  | "food_catering"
  | "traditions"
  | "family"
  | "destination"
  | "diy"
  | "emotional"
  | "meetup"
  | "other";

export interface DiscussionCategory {
  slug: DiscussionCategorySlug;
  label: string;
  emoji: string;
  description: string;
  sort_order: number;
}

export interface Discussion {
  id: string;
  author_id: string;

  title: string;
  body?: string;

  category: DiscussionCategorySlug;
  city?: string;
  state?: string;

  reply_count: number;
  last_reply_at?: string;

  is_pinned: boolean;
  is_locked: boolean;

  // Display-layer flag: real author_id is still stored for moderation /
  // edit-delete / block lookup, but the UI renders a generated pseudonym
  // when this is true.
  is_anonymous: boolean;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id: string;

  body: string;

  helpful_count: number;

  is_anonymous: boolean;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReplyReaction {
  id: string;
  reply_id: string;
  reactor_id: string;
  created_at: string;
}

// ── Live events ────────────────────────────────────────────────────────────
// Scheduled sessions with featured wedding industry professionals. Extends
// the Huddle-style UI-only live simulation — bigger rooms, a host/speaker/
// audience model, promotional discovery. Schema mirrors the original
// Supabase sketch so a real backend migration is a drop-in.

export interface FeaturedGuest {
  id: string;

  // Identity
  name: string;
  title: string; // e.g. "Celebrity Wedding Planner"
  bio: string;

  // Visual
  headshot_seed_gradient?: [string, string];
  headshot_initial?: string;
  headshot_data_url?: string;
  cover_seed_gradient?: [string, string];
  cover_seed_label?: string;
  cover_image_data_url?: string;

  // Credentials
  credentials: string[];
  specialties: string[];
  instagram_handle?: string;
  website_url?: string;

  is_seed?: boolean;
  created_at: string;
}

export type LiveEventType =
  | "qa"
  | "masterclass"
  | "conversation"
  | "panel"
  | "trunk_show"
  | "workshop";

export const LIVE_EVENT_TYPES: {
  id: LiveEventType;
  label: string;
  blurb: string;
}[] = [
  { id: "qa", label: "Q&A", blurb: "Ask me anything" },
  { id: "masterclass", label: "Masterclass", blurb: "Guided teaching session" },
  {
    id: "conversation",
    label: "Conversation",
    blurb: "Fireside chat with the guest",
  },
  { id: "panel", label: "Panel", blurb: "Multiple guests, one topic" },
  { id: "trunk_show", label: "Trunk show", blurb: "Designer showcase" },
  { id: "workshop", label: "Workshop", blurb: "Hands-on guided session" },
];

export type LiveEventStatus =
  | "draft"
  | "upcoming"
  | "live"
  | "ended"
  | "cancelled";

export interface LiveEvent {
  id: string;

  // Event details
  title: string;
  subtitle?: string;
  description: string;
  cover_seed_gradient?: [string, string];
  cover_seed_label?: string;
  cover_image_data_url?: string;

  // Featured guest
  guest_id: string;

  // Moderator (Ananya team or a community profile)
  moderator_profile_id?: string;
  moderator_name?: string;

  // Categorization
  event_type: LiveEventType;
  topics: string[]; // interest tag slugs

  // Scheduling
  starts_at: string; // ISO
  duration_minutes: number;

  // Capacity & access
  max_attendees: number;
  is_free: boolean;

  // State
  status: LiveEventStatus;
  started_at?: string;
  ended_at?: string;

  // Post-event
  recap_body?: string;

  // Engagement stats (derived + cached)
  peak_attendees?: number;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export type LiveEventRsvpStatus = "going" | "maybe" | "cancelled";

export interface LiveEventRsvp {
  id: string;
  event_id: string;
  profile_id: string;
  status: LiveEventRsvpStatus;
  remind_15min: boolean;
  created_at: string;
}

// Role in the live room. "guest" and "moderator" always have mic on.
// "audience" starts muted; a raised hand flips to "speaker" when invited.
export type LiveEventRole = "guest" | "moderator" | "audience" | "speaker";

export type LiveEventAttendeeStatus = "in_room" | "left";

export interface LiveEventAttendee {
  id: string;
  event_id: string;
  // Only one of these is present. Guests don't have a community profile.
  profile_id?: string;
  guest_id?: string;
  role: LiveEventRole;
  status: LiveEventAttendeeStatus;
  hand_raised: boolean;
  joined_at: string;
  left_at?: string;
}

export type LiveEventQuestionStatus =
  | "pending"
  | "selected"
  | "answered"
  | "skipped";

export interface LiveEventQuestion {
  id: string;
  event_id: string;
  asker_id: string; // community profile id
  body: string;
  vote_count: number;
  status: LiveEventQuestionStatus;
  is_seed?: boolean;
  created_at: string;
}

export interface LiveEventQuestionVote {
  id: string;
  question_id: string;
  voter_id: string;
  created_at: string;
}

export interface LiveEventChatMessage {
  id: string;
  event_id: string;
  // Speakers (guest/moderator) may post as a FeaturedGuest. Everyone else
  // posts as a community profile. Exactly one of these should be set.
  profile_id?: string;
  guest_id?: string;
  body: string;
  kind?: "message" | "reaction" | "system";
  created_at: string;
}
