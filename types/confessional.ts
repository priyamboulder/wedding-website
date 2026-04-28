// ── Confessional types ──────────────────────────────────────────────────────
// Anonymous storytelling layer in the Community tab. Schema mirrors the
// original Supabase sketch so a future migration is a 1:1 port. For now
// everything persists via Zustand + localStorage.
//
// Anonymity model: author_id is stored on every post and reply for
// moderation, but never exposed at the read layer. The store's selectors
// always strip it before returning rows to the UI; admin-only selectors
// keep it.

export type ConfessionalCategorySlug =
  | "vendor-nightmare"
  | "family-drama"
  | "bridal-party-meltdown"
  | "day-of-disaster"
  | "planning-hell"
  | "was-i-wrong"
  | "the-one-thing";

export interface ConfessionalCategory {
  slug: ConfessionalCategorySlug;
  label: string;
  shortLabel: string;
  blurb: string;
  // Muted earth-tone pair: [bg, fg/border]
  tone: { bg: string; fg: string; border: string };
}

export const CONFESSIONAL_CATEGORIES: ConfessionalCategory[] = [
  {
    slug: "vendor-nightmare",
    label: "Vendor Nightmare",
    shortLabel: "Vendor",
    blurb: "florists, photographers, planners — when it all went wrong.",
    tone: {
      bg: "rgba(201, 123, 99, 0.10)",
      fg: "#A85C45",
      border: "rgba(201, 123, 99, 0.35)",
    },
  },
  {
    slug: "family-drama",
    label: "Family Drama",
    shortLabel: "Family",
    blurb: "the in-laws, the parents, the cousin nobody invited.",
    tone: {
      bg: "rgba(184, 134, 11, 0.10)",
      fg: "#8B6508",
      border: "rgba(184, 134, 11, 0.35)",
    },
  },
  {
    slug: "bridal-party-meltdown",
    label: "Bridal Party Meltdown",
    shortLabel: "Bridal Party",
    blurb: "best friends behaving badly.",
    tone: {
      bg: "rgba(156, 175, 136, 0.14)",
      fg: "#5E7548",
      border: "rgba(156, 175, 136, 0.40)",
    },
  },
  {
    slug: "day-of-disaster",
    label: "Day-Of Disaster",
    shortLabel: "Day-Of",
    blurb: "everything that went sideways on the day itself.",
    tone: {
      bg: "rgba(91, 142, 138, 0.12)",
      fg: "#3F6663",
      border: "rgba(91, 142, 138, 0.35)",
    },
  },
  {
    slug: "planning-hell",
    label: "Planning Hell",
    shortLabel: "Planning",
    blurb: "the spreadsheets, the timelines, the breaking points.",
    tone: {
      bg: "rgba(212, 162, 76, 0.14)",
      fg: "#8E6A2A",
      border: "rgba(212, 162, 76, 0.38)",
    },
  },
  {
    slug: "was-i-wrong",
    label: "Was I Wrong?",
    shortLabel: "Was I Wrong?",
    blurb: "the jury decides — vote you-were-right or you-were-wrong.",
    tone: {
      bg: "rgba(180, 100, 140, 0.10)",
      fg: "#7E3A60",
      border: "rgba(180, 100, 140, 0.35)",
    },
  },
  {
    slug: "the-one-thing",
    label: "The One Thing",
    shortLabel: "One Thing",
    blurb: "the single thing they wish they'd known.",
    tone: {
      bg: "rgba(125, 110, 90, 0.12)",
      fg: "#5C4F3E",
      border: "rgba(125, 110, 90, 0.35)",
    },
  },
];

export function getConfessionalCategory(
  slug: string,
): ConfessionalCategory | undefined {
  return CONFESSIONAL_CATEGORIES.find((c) => c.slug === slug);
}

export type ConfessionalStatus =
  | "pending"
  | "published"
  | "rejected"
  | "featured";

export type ConfessionalVoteType = "up" | "down";

// ── Posts ───────────────────────────────────────────────────────────────────

export interface ConfessionalPost {
  id: string;
  created_at: string;
  updated_at: string;
  // Stored for moderation; NEVER returned by public selectors.
  author_id: string;
  display_name: string;
  title: string;
  body: string;
  category: ConfessionalCategorySlug;
  tags: string[];
  status: ConfessionalStatus;
  is_featured: boolean;
  featured_month?: string; // 'YYYY-MM'
  save_count: number;
  vote_up_count: number;
  vote_down_count: number;
  view_count: number;
  report_count: number;
  is_seed?: boolean;
}

// Public-facing shape — author_id stripped.
export type ConfessionalPostPublic = Omit<ConfessionalPost, "author_id">;

// ── Replies ─────────────────────────────────────────────────────────────────

export type ConfessionalReplyStatus = "published" | "removed";

export interface ConfessionalReply {
  id: string;
  post_id: string;
  author_id: string; // stored, never exposed
  display_name: string;
  body: string;
  created_at: string;
  status: ConfessionalReplyStatus;
  report_count: number;
}

export type ConfessionalReplyPublic = Omit<ConfessionalReply, "author_id">;

// ── Votes & saves ───────────────────────────────────────────────────────────

export interface ConfessionalVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: ConfessionalVoteType;
  created_at: string;
}

export interface ConfessionalSave {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ── Reports ─────────────────────────────────────────────────────────────────

export type ConfessionalReportTarget = "post" | "reply";

export type ConfessionalReportReason =
  | "spam"
  | "harassment"
  | "identifying-info"
  | "offensive"
  | "other";

export const CONFESSIONAL_REPORT_REASONS: {
  id: ConfessionalReportReason;
  label: string;
}[] = [
  { id: "identifying-info", label: "Reveals someone's identity" },
  { id: "harassment", label: "Harassment or targeted attack" },
  { id: "offensive", label: "Hateful or offensive content" },
  { id: "spam", label: "Spam or self-promotion" },
  { id: "other", label: "Something else" },
];

export interface ConfessionalReport {
  id: string;
  target_type: ConfessionalReportTarget;
  target_id: string;
  reporter_id: string;
  reason: ConfessionalReportReason;
  details?: string;
  created_at: string;
}

// ── Sort & filter ───────────────────────────────────────────────────────────

export type ConfessionalSort =
  | "newest"
  | "most-saved"
  | "most-voted"
  | "editors-pick";

export const CONFESSIONAL_SORTS: { id: ConfessionalSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "most-saved", label: "Most Saved" },
  { id: "most-voted", label: "Most Voted" },
  { id: "editors-pick", label: "Editor's Pick" },
];

// Auto-hide threshold: 3+ reports flag content for review and hide it.
export const CONFESSIONAL_AUTO_HIDE_REPORTS = 3;

// Field length limits — enforced in the store and the form.
export const CONFESSIONAL_LIMITS = {
  TITLE_MAX: 150,
  BODY_MAX: 5000,
  REPLY_MAX: 2000,
  TAGS_MAX: 6,
} as const;
