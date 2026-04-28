// ── One Look micro-review types ───────────────────────────────────────────
// Fast, score-first vendor reviews that live alongside the existing full
// review flow. Persisted via stores/one-look-store.ts (Zustand + localStorage).
// Audio/video blobs are kept in IndexedDB (see lib/one-look/blob-store.ts) and
// referenced by blobKey so the localStorage payload stays small.

export type OneLookMediaType = "audio" | "video" | "text";
export type OneLookStatus = "draft" | "published";
export type OneLookSentiment = "positive" | "neutral" | "negative";

export interface OneLookWordOption {
  id: string;
  word: string;
  sentiment: OneLookSentiment;
  sortOrder: number;
  isActive: boolean;
}

// A single micro-review. Unlike the full Review, score and one-word are the
// core data — the hot take is optional flavor.
export interface OneLookReview {
  id: string;

  // Vendor linkage
  coordinationVendorId: string | null;   // rostered vendor (primary)
  platformVendorId: string | null;       // marketplace vendor (if rostered to one)
  vendorName: string;
  vendorRole: string;
  vendorCategory: string;                // normalized category ("photographer", etc)

  // Bride-facing metadata (redacted for public display — first name only)
  brideFirstName: string;
  brideCity: string;
  weddingMonthYear: string;              // "nov 2026" format

  // The review
  score: number;                         // 0.0–9.9, one decimal
  oneWord: string;                       // from OneLookWordOption.word
  oneWordSentiment: OneLookSentiment;

  // The hot take — exactly one of these paths is populated
  mediaType: OneLookMediaType;
  hotTakeText: string;                   // max 280 chars (used if mediaType === "text")
  audioBlobKey: string | null;           // IndexedDB key for audio
  audioDurationSeconds: number | null;
  videoBlobKey: string | null;           // IndexedDB key for video
  videoDurationSeconds: number | null;
  videoThumbnailDataUrl: string | null;  // small inline data URL is fine

  // Status
  status: OneLookStatus;
  publishedAt: string | null;

  // Engagement
  helpfulCount: number;
  helpfulVoters: string[];               // userIds who've marked helpful

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Public-facing shape returned by APIs — omits the blob keys (APIs resolve to
// URLs/data-URLs) and keeps just what the display components need.
export interface OneLookPublic {
  id: string;
  coordinationVendorId: string | null;
  platformVendorId: string | null;
  vendorName: string;
  vendorCategory: string;
  brideFirstName: string;
  brideCity: string;
  weddingMonthYear: string;
  score: number;
  oneWord: string;
  oneWordSentiment: OneLookSentiment;
  mediaType: OneLookMediaType;
  hotTakeText: string;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  videoThumbnailDataUrl: string | null;
  helpfulCount: number;
  publishedAt: string | null;
}

// Vendor-level aggregate used on storefronts and trails.
export interface OneLookAggregate {
  vendorId: string;                      // coordinationVendorId or platformVendorId
  vendorName: string;
  vendorCategory: string;
  averageScore: number;
  lookCount: number;
  topWords: { word: string; count: number }[];
}

export interface OneLookTrail {
  category: string;
  city: string;
  vendorCount: number;
  totalLooks: number;
  vendors: (OneLookAggregate & { reviews: OneLookPublic[] })[];
}

// Sentiment color tokens matching the design system.
export const SENTIMENT_TONE: Record<
  OneLookSentiment,
  { bg: string; ring: string; fg: string }
> = {
  positive: {
    bg: "bg-gold-pale/60",
    ring: "ring-gold/30",
    fg: "text-ink",
  },
  neutral: {
    bg: "bg-ivory-warm",
    ring: "ring-border",
    fg: "text-ink-muted",
  },
  negative: {
    bg: "bg-rose/10",
    ring: "ring-rose/30",
    fg: "text-rose",
  },
};

// Score-to-tone mapping for the big score badge.
export function scoreTone(score: number): "warm" | "neutral" | "cool" {
  if (score >= 8.0) return "warm";
  if (score >= 5.0) return "neutral";
  return "cool";
}

// Clamp + round to 0.1 increment, capped at 9.9.
export function normalizeScore(raw: number): number {
  if (!Number.isFinite(raw)) return 7.0;
  const rounded = Math.round(raw * 10) / 10;
  return Math.max(0, Math.min(9.9, rounded));
}
