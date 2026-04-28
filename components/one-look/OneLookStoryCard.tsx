"use client";

// ── Community Discover — story card for a One Look ────────────────────────
// Compact card variant shown in the Brides Discover feed. Distinct from the
// existing bride StoryCard — leads with the score and the vendor name.
// When 3+ One Looks are published by the same bride within a short window,
// the feed shows the grouped variant below instead of individual cards.

import NextLink from "next/link";
import { cn } from "@/lib/utils";
import type { OneLookReview } from "@/types/one-look";
import { scoreTone, SENTIMENT_TONE } from "@/types/one-look";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { HelpfulButton } from "./HelpfulButton";

const SCORE_CHIP: Record<"warm" | "neutral" | "cool", string> = {
  warm: "bg-gold-pale/70 ring-gold/40 text-ink",
  neutral: "bg-ivory-warm ring-border text-ink",
  cool: "bg-stone-100 ring-stone-300 text-ink-muted",
};

export function OneLookStoryCard({ review }: { review: OneLookReview }) {
  const scoreT = scoreTone(review.score);
  const sentimentT = SENTIMENT_TONE[review.oneWordSentiment];
  const vendorHref = review.coordinationVendorId
    ? `/coordination/vendors/${review.coordinationVendorId}`
    : review.platformVendorId
      ? `/vendors/${review.platformVendorId}`
      : null;

  const subline = [review.brideCity, review.weddingMonthYear]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="space-y-3 rounded-xl border border-gold/25 bg-white p-5">
      <header>
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          one look
        </p>
        <p className="mt-1 font-serif text-[16px] leading-snug text-ink">
          <span className="font-semibold">{review.brideFirstName}</span>{" "}
          rated her{" "}
          <span className="italic">
            {review.vendorRole.replace(/_/g, " ")}
          </span>
        </p>
      </header>

      <div className="rounded-lg border border-border/70 bg-ivory-warm/30 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {vendorHref ? (
              <NextLink
                href={vendorHref}
                className="font-serif text-[15px] leading-snug text-ink underline-offset-2 hover:underline"
              >
                {review.vendorName}
              </NextLink>
            ) : (
              <p className="font-serif text-[15px] leading-snug text-ink">
                {review.vendorName}
              </p>
            )}
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1",
                sentimentT.bg,
                sentimentT.ring,
                sentimentT.fg,
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {review.oneWord}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-baseline rounded-full px-3 py-1.5 ring-1 font-serif text-[22px] leading-none",
              SCORE_CHIP[scoreT],
            )}
          >
            {review.score.toFixed(1)}
          </span>
        </div>

        <div className="mt-2.5">
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
              size="wide"
            />
          )}
          {review.mediaType === "text" && review.hotTakeText && (
            <p className="font-serif text-[13.5px] italic leading-relaxed text-ink">
              “{review.hotTakeText}”
            </p>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {subline}
        </p>
        <HelpfulButton reviewId={review.id} />
      </footer>
    </article>
  );
}

// ── Grouped variant ──────────────────────────────────────────────────────
// When a bride publishes 3+ One Looks inside a short window, collapse them
// into a single card rather than flooding the feed.

export function OneLookGroupedStoryCard({
  reviews,
}: {
  reviews: OneLookReview[];
}) {
  if (reviews.length === 0) return null;
  const first = reviews[0];
  const subline = [first.brideCity, first.weddingMonthYear]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="space-y-3 rounded-xl border border-gold/25 bg-white p-5">
      <header>
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          one looks
        </p>
        <p className="mt-1 font-serif text-[16px] leading-snug text-ink">
          <span className="font-semibold">{first.brideFirstName}</span>{" "}
          rated {reviews.length} vendors from her {first.weddingMonthYear || "wedding"}
        </p>
      </header>

      <ul className="space-y-1.5" role="list">
        {reviews.map((r) => {
          const sentimentT = SENTIMENT_TONE[r.oneWordSentiment];
          const vendorHref = r.coordinationVendorId
            ? `/coordination/vendors/${r.coordinationVendorId}`
            : r.platformVendorId
              ? `/vendors/${r.platformVendorId}`
              : null;
          const content = (
            <span className="flex items-baseline gap-2">
              <span className="flex-1 truncate font-serif text-[14px] text-ink">
                {r.vendorName}
              </span>
              <span
                className={cn(
                  "font-serif tabular-nums text-ink tracking-[-0.01em]",
                )}
              >
                {r.score.toFixed(1)}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em]",
                  sentimentT.bg,
                  sentimentT.fg,
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {r.oneWord}
              </span>
            </span>
          );
          return (
            <li key={r.id}>
              {vendorHref ? (
                <NextLink
                  href={vendorHref}
                  className="block rounded-md border-b border-dotted border-border/60 px-1 py-1.5 transition-colors hover:bg-ivory-warm/40"
                >
                  {content}
                </NextLink>
              ) : (
                <div className="block border-b border-dotted border-border/60 px-1 py-1.5">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {subline}
        </p>
      </footer>
    </article>
  );
}
