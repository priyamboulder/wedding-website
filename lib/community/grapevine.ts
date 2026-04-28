// ── Grapevine helpers + topic catalog ───────────────────────────────────────
// Topic metadata, category lookups, and the helper that decides which
// categories contribute to a vendor's amber-alert thread count. Kept apart
// from the store so non-store consumers (sidebar, vendor list integrations)
// can use it without subscribing to state.

import type {
  GrapevineTopicCategory,
  GrapevineTopicSlug,
} from "@/types/grapevine";

// Categories surfaced as filter pills + in the create-thread modal. The
// `counts_toward_alerts` flag controls whether a tagged vendor sees the
// amber dot on shortlists/checklist when threads in this category exist.
export const GRAPEVINE_TOPICS: GrapevineTopicCategory[] = [
  {
    slug: "vendor_experiences",
    display_name: "Vendor Experiences",
    description:
      "Share what it was actually like working with a vendor — the real story behind the review.",
    icon: "💬",
    body_placeholder:
      "Tell the story — what happened, how it affected your wedding, what you'd do differently…",
    counts_toward_alerts: true,
    sort_order: 1,
  },
  {
    slug: "pricing_and_contracts",
    display_name: "Pricing & Contracts",
    description:
      "Discuss pricing transparency, hidden fees, contract terms, and negotiation experiences.",
    icon: "💰",
    body_placeholder:
      "What did they quote vs. what you actually paid? Any hidden fees or contract surprises?",
    counts_toward_alerts: true,
    sort_order: 2,
  },
  {
    slug: "red_flags",
    display_name: "Red Flags",
    description:
      "Warn other brides about concerning behavior, broken promises, or patterns to watch for.",
    icon: "🚩",
    body_placeholder:
      "What happened that other brides should know about? Be specific but fair.",
    counts_toward_alerts: true,
    sort_order: 3,
  },
  {
    slug: "recommendations",
    display_name: "Recommendations",
    description:
      "Rave about vendors who went above and beyond — the ones worth every penny.",
    icon: "⭐",
    body_placeholder:
      "What made this vendor exceptional? What should the next bride know?",
    counts_toward_alerts: false,
    sort_order: 4,
  },
  {
    slug: "has_anyone_worked_with",
    display_name: "Has Anyone Worked With…?",
    description:
      "Ask the community about a vendor you're considering before you sign.",
    icon: "🔍",
    body_placeholder:
      "What vendor are you considering? What do you want to know?",
    counts_toward_alerts: true,
    sort_order: 5,
  },
  {
    slug: "advice_and_tips",
    display_name: "Advice & Tips",
    description:
      "General wisdom about hiring, managing, and getting the best out of your vendors.",
    icon: "💡",
    body_placeholder: "What do you wish someone had told you?",
    counts_toward_alerts: false,
    sort_order: 6,
  },
];

export function getGrapevineTopic(
  slug: GrapevineTopicSlug,
): GrapevineTopicCategory | undefined {
  return GRAPEVINE_TOPICS.find((t) => t.slug === slug);
}

// Threshold at which a tagged vendor triggers the amber alert across
// shortlist / Roulette / storefront / Grapevine sidebar surfaces.
export const GRAPEVINE_VENDOR_ALERT_THRESHOLD = 3;

// Limits per spec — kept on the helper so the form, the store, and the
// modal copy all read the same numbers.
export const GRAPEVINE_DAILY_THREAD_LIMIT = 3;
export const GRAPEVINE_DAILY_REPLY_LIMIT = 10;

export const GRAPEVINE_TITLE_MIN = 10;
export const GRAPEVINE_TITLE_MAX = 200;
export const GRAPEVINE_BODY_MIN = 50;
export const GRAPEVINE_BODY_MAX = 5000;
export const GRAPEVINE_REPLY_MIN = 10;
export const GRAPEVINE_REPLY_MAX = 3000;

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function withinLast24h(iso: string, now = Date.now()): boolean {
  return now - new Date(iso).getTime() < DAY_MS;
}

// Light auto-flag heuristic so first-pass moderation can fire client-side
// without leaking into the public feed. Mirrors the spec's auto-flag rules.
const FLAGGED_TERMS = [
  "lawsuit",
  "sue",
  "suing",
  "lawyer",
  "scam",
  "fraud",
  "stolen",
  "thief",
];

export function shouldAutoFlag(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  // Mostly-shouting check (>50% upper case among letters).
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 12) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.5) return true;
  }
  const lower = trimmed.toLowerCase();
  return FLAGGED_TERMS.some((term) => lower.includes(term));
}
