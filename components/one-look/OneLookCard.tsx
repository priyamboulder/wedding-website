"use client";

// ── One Look card ────────────────────────────────────────────────────────
// The reusable review card — used on vendor profiles, in the community feed,
// and on trail pages. Bride name/city/date on the left, score+word on the
// right, hot-take media inline underneath, helpful button at the bottom.

import { cn } from "@/lib/utils";
import type { OneLookReview } from "@/types/one-look";
import { SENTIMENT_TONE, scoreTone } from "@/types/one-look";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { HelpfulButton } from "./HelpfulButton";

const SCORE_CHIP: Record<"warm" | "neutral" | "cool", string> = {
  warm: "bg-gold-pale/70 ring-gold/40 text-ink",
  neutral: "bg-ivory-warm ring-border text-ink",
  cool: "bg-stone-100 ring-stone-300 text-ink-muted",
};

export function OneLookCard({
  review,
  showVendorName = false,
}: {
  review: OneLookReview;
  /** When used in a feed (not a vendor profile) show which vendor it's for. */
  showVendorName?: boolean;
}) {
  const scoreT = scoreTone(review.score);
  const sentimentT = SENTIMENT_TONE[review.oneWordSentiment];

  const brideSubline = [
    review.brideCity,
    review.weddingMonthYear,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="space-y-3 rounded-lg border border-border bg-white p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showVendorName && (
            <p className="font-serif text-[14.5px] leading-snug text-ink">
              {review.vendorName}
            </p>
          )}
          <p
            className={cn(
              showVendorName
                ? "mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                : "font-serif text-[14px] leading-snug text-ink",
            )}
            style={showVendorName ? { fontFamily: "var(--font-mono)" } : undefined}
          >
            {review.brideFirstName}
          </p>
          {brideSubline && (
            <p
              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {brideSubline}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "inline-flex items-baseline gap-1 rounded-full px-3 py-1 ring-1 font-serif text-[20px] leading-none",
              SCORE_CHIP[scoreT],
            )}
          >
            {review.score.toFixed(1)}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1",
              sentimentT.bg,
              sentimentT.ring,
              sentimentT.fg,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {review.oneWord}
          </span>
        </div>
      </header>

      <div>
        {review.mediaType === "audio" && review.audioBlobKey && (
          <AudioPlayer
            blobKey={review.audioBlobKey}
            durationSeconds={review.audioDurationSeconds ?? 0}
          />
        )}
        {review.mediaType === "video" && review.videoBlobKey && (
          <VideoPlayer
            blobKey={review.videoBlobKey}
            durationSeconds={review.videoDurationSeconds ?? 0}
            thumbnailDataUrl={review.videoThumbnailDataUrl}
          />
        )}
        {review.mediaType === "text" && review.hotTakeText && (
          <p className="font-serif text-[14px] italic leading-relaxed text-ink">
            “{review.hotTakeText}”
          </p>
        )}
      </div>

      <footer className="flex items-center justify-end">
        <HelpfulButton reviewId={review.id} />
      </footer>
    </article>
  );
}
