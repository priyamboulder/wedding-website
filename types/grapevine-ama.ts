// Types for The Grapevine — the live AMA + persistent Q&A archive that
// lives as the fifth tab of the Planning Circle (/blog).
//
// Note: an unrelated community-tab "Grapevine" (vendor-discussion forum,
// localStorage-backed) lives in types/grapevine.ts. The two systems share
// only the brand word — they have different tables, surfaces, and intents.

export type GrapevineSessionStatus =
  | "upcoming"
  | "live"
  | "ended"
  | "archived";

export type GrapevineSessionType =
  | "planner"
  | "vendor"
  | "real_bride"
  | "stylist"
  | "expert"
  | "pandit"
  | "caterer";

export type GrapevineQuestionStatus =
  | "pending"
  | "approved"
  | "answered"
  | "rejected"
  | "pinned";

export type GrapevineReactionType =
  | "helpful"
  | "real_talk"
  | "needed_this"
  | "fire";

export interface GrapevineSession {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  expert_name: string;
  expert_title: string | null;
  expert_bio: string | null;
  expert_avatar_url: string | null;
  expert_credentials: string[] | null;
  session_type: GrapevineSessionType | null;
  tags: string[] | null;
  status: GrapevineSessionStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  total_questions: number;
  total_answered: number;
  created_at: string;
}

export interface GrapevineSessionWithStats extends GrapevineSession {
  total_upvotes: number;
  total_reactions: number;
}

export interface GrapevineQuestion {
  id: string;
  session_id: string;
  user_id: string | null;
  persona_tag: string | null;
  question_text: string;
  is_anonymous: boolean;
  status: GrapevineQuestionStatus;
  upvote_count: number;
  // Server-computed combined upvote count (live + seed). Not always
  // present on the raw row — present on read API responses.
  total_upvotes?: number;
  created_at: string;
}

export interface GrapevineAnswer {
  id: string;
  question_id: string;
  session_id: string;
  answer_text: string;
  answered_by: string | null;
  is_highlighted: boolean;
  created_at: string;
  reaction_counts?: Record<GrapevineReactionType, number>;
}

export interface GrapevineQAPair {
  question: GrapevineQuestion;
  answer: GrapevineAnswer | null;
}

export interface GrapevineSearchHit {
  question_id: string;
  question_text: string;
  answer_text: string | null;
  session_id: string;
  session_slug: string;
  session_title: string;
  expert_name: string;
  is_highlighted: boolean;
}

// ── Display helpers ───────────────────────────────────────────────────────

export const QUESTION_TEXT_MAX = 500;
export const PERSONA_TAG_MAX = 80;

export const REACTION_ORDER: GrapevineReactionType[] = [
  "helpful",
  "real_talk",
  "needed_this",
  "fire",
];

export const REACTION_LABEL: Record<GrapevineReactionType, string> = {
  helpful: "Helpful",
  real_talk: "Real Talk",
  needed_this: "Needed This",
  fire: "Fire",
};

export const REACTION_ICON: Record<GrapevineReactionType, string> = {
  helpful: "👍",
  real_talk: "💯",
  needed_this: "🙏",
  fire: "🔥",
};

export const SESSION_TYPE_LABEL: Record<GrapevineSessionType, string> = {
  planner: "Planner",
  vendor: "Vendor",
  real_bride: "Real Bride",
  stylist: "Stylist",
  expert: "Expert",
  pandit: "Pandit",
  caterer: "Caterer",
};

export const PERSONA_PRESETS: string[] = [
  "Bride, __ months out",
  "Groom, just nodding along",
  "Momzilla, proudly",
  "Aunty ji, concerned",
  "Bridesmaid, exhausted",
  "Planner, seen it all",
];
