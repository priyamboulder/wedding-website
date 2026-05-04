// Types for The Confessional — the fourth tab on /blog (Planning Circle).
//
// Note: a separate community-tab "Confessional" feature lives at
// types/confessional.ts. They have nothing to do with each other; this one
// is the magazine-style anonymous feed, the other is the long-form
// community storytelling layer.

export type MarigoldConfessionType =
  | "rant"
  | "confession"
  | "hot_take"
  | "would_you_believe";

export type MarigoldConfessionReaction =
  | "same"
  | "aunty_disapproves"
  | "fire"
  | "sending_chai";

export interface MarigoldConfessionPost {
  id: string;
  // null for seed/system rows, set to auth.uid() for client-submitted posts.
  user_id: string | null;
  post_type: MarigoldConfessionType;
  persona_tag: string;
  content: string;
  is_flagged: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface MarigoldConfessionPostWithCounts extends MarigoldConfessionPost {
  reaction_same: number;
  reaction_aunty_disapproves: number;
  reaction_fire: number;
  reaction_sending_chai: number;
  comment_count: number;
}

export interface MarigoldConfessionComment {
  id: string;
  post_id: string;
  user_id: string | null;
  persona_tag: string;
  content: string;
  is_flagged: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface MarigoldConfessionSeed {
  post_type: MarigoldConfessionType;
  persona_tag: string;
  content: string;
  reactions?: Partial<Record<MarigoldConfessionReaction, number>>;
}

export const POST_TYPE_LABEL: Record<MarigoldConfessionType, string> = {
  rant: "Rant",
  confession: "Confession",
  hot_take: "Hot Take",
  would_you_believe: "Would You Believe",
};

export const POST_TYPE_EMOJI: Record<MarigoldConfessionType, string> = {
  rant: "😤",
  confession: "🤫",
  hot_take: "🔥",
  would_you_believe: "😱",
};

// Subtle background tints applied to each card.
export const POST_TYPE_TINT: Record<MarigoldConfessionType, string> = {
  rant: "#FFF0F0",
  confession: "#FFFDF0",
  hot_take: "#FFF8F0",
  would_you_believe: "#F8F0FF",
};

// Badge background and text color for the post-type chip in the corner.
export const POST_TYPE_BADGE: Record<
  MarigoldConfessionType,
  { bg: string; fg: string }
> = {
  rant: { bg: "#8B2252", fg: "#FFFDF5" },              // burgundy
  confession: { bg: "#C4A265", fg: "#3A2410" },        // champagne / gold
  hot_take: { bg: "#E07B3E", fg: "#FFFDF5" },          // warm orange
  would_you_believe: { bg: "#9B8BC4", fg: "#FFFDF5" }, // lavender
};

export const REACTION_ORDER: MarigoldConfessionReaction[] = [
  "same",
  "aunty_disapproves",
  "fire",
  "sending_chai",
];

export const REACTION_LABEL: Record<MarigoldConfessionReaction, string> = {
  same: "SAME",
  aunty_disapproves: "Aunty Ji Disapproves",
  fire: "",
  sending_chai: "Sending Chai",
};

export const REACTION_ICON: Record<MarigoldConfessionReaction, string> = {
  same: "",
  aunty_disapproves: "🙊",
  fire: "🔥",
  sending_chai: "☕",
};

export const PERSONA_PRESETS: string[] = [
  "Bride, __ months out",
  "Groom, just nodding along",
  "Momzilla, proudly",
  "Aunty ji, concerned",
  "Bridesmaid, exhausted",
  "Planner, seen it all",
];

export const POST_CONTENT_MAX = 500;
export const COMMENT_CONTENT_MAX = 300;
export const PERSONA_TAG_MAX = 60;
