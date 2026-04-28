// ── Grapevine types ─────────────────────────────────────────────────────────
// Anonymous, semi-private vendor discussion forum that lives inside the
// Community section. Schema mirrors the spec's Supabase sketch 1:1 so a
// later migration is a drop-in — for now everything persists in Zustand
// + localStorage like the rest of the community surface.

export type GrapevineTopicSlug =
  | "vendor_experiences"
  | "pricing_and_contracts"
  | "red_flags"
  | "recommendations"
  | "has_anyone_worked_with"
  | "advice_and_tips";

export interface GrapevineTopicCategory {
  slug: GrapevineTopicSlug;
  display_name: string;
  description: string;
  icon: string;
  body_placeholder: string;
  // Categories that contribute to the vendor concern alert threshold.
  // Recommendations / advice_and_tips are excluded so the amber dot
  // doesn't fire on positive coverage.
  counts_toward_alerts: boolean;
  sort_order: number;
}

export type GrapevineThreadStatus =
  | "active"
  | "under_review"
  | "removed"
  | "auto_flagged";

export type GrapevineReplyStatus =
  | "active"
  | "under_review"
  | "removed";

export interface GrapevineThread {
  id: string;
  // Real author_id stays in storage so moderation, edit/delete, and own-post
  // detection still work. Anonymity is a display-layer concern: pseudonym is
  // derived at render time from (author_id, thread_id).
  author_id: string;

  title: string;
  body: string;

  topic_category: GrapevineTopicSlug;

  // Optional vendor tag — the vendor is shown as a neutral pill, never as a
  // link to their storefront, so vendors can't trivially monitor the feed.
  tagged_vendor_id?: string;
  tagged_vendor_name?: string; // denormalized so deletes don't orphan the tag

  status: GrapevineThreadStatus;
  moderation_notes?: string;

  reply_count: number;
  helpful_count: number;
  view_count: number;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
  last_reply_at?: string;
}

export interface GrapevineReply {
  id: string;
  thread_id: string;
  author_id: string;

  body: string;

  status: GrapevineReplyStatus;
  helpful_count: number;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

export type GrapevineVoteTarget = "thread" | "reply";

export interface GrapevineHelpfulVote {
  id: string;
  user_id: string;
  target: GrapevineVoteTarget;
  thread_id?: string;
  reply_id?: string;
  created_at: string;
}

export interface GrapevineReport {
  id: string;
  reporter_id: string;
  target: GrapevineVoteTarget;
  thread_id?: string;
  reply_id?: string;
  reason?: string;
  created_at: string;
}

export interface GrapevineVendorAlertSummary {
  vendor_id: string;
  thread_count: number;
  // Topic categories present in the contributing threads. Useful for
  // tooltips ("3 discussions — 2 red flags, 1 pricing").
  categories: GrapevineTopicSlug[];
  last_thread_at?: string;
}

export type GrapevineSortKey = "newest" | "most_discussed" | "most_helpful";
