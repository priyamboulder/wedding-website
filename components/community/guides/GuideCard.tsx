"use client";

// ── GuideCard ───────────────────────────────────────────────────────────────
// Card for guide listings. Cover image with category pill overlay, title,
// creator attribution, read time + save count. Hover scales the cover image.

import Link from "next/link";
import { useState } from "react";
import { BookOpen, BookmarkPlus, BookmarkCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guide } from "@/types/guide";
import type { Creator } from "@/types/creator";
import { GUIDE_CATEGORY_LABEL } from "@/lib/guides/seed";
import { useGuidesStore } from "@/stores/guides-store";

export type GuideCardSize = "default" | "featured";

export function GuideCard({
  guide,
  creator,
  size = "default",
  className,
}: {
  guide: Guide;
  creator: Creator | undefined;
  size?: GuideCardSize;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const isSaved = useGuidesStore((s) => s.isSaved(guide.id));
  const saveCount = useGuidesStore((s) => s.saveCountFor(guide.id));
  const toggleSave = useGuidesStore((s) => s.toggleSave);

  const isFeatured = size === "featured";
  const categoryLabel = GUIDE_CATEGORY_LABEL[guide.category];

  return (
    <Link
      href={`/community/guides/${guide.slug}`}
      className={cn(
        "group block",
        isFeatured ? "md:grid md:grid-cols-5 md:gap-8" : "",
        className,
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-ivory-warm",
          isFeatured ? "aspect-[16/9] md:col-span-3 md:aspect-[5/4]" : "aspect-[16/9]",
        )}
      >
        {guide.coverImageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.coverImageUrl}
            alt={guide.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <BookOpen size={28} strokeWidth={1.3} />
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className={cn("mt-4", isFeatured && "md:col-span-2 md:mt-0 md:flex md:flex-col md:justify-center")}>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {guide.readTimeMinutes} min read
          {isFeatured && (
            <span className="ml-2 text-saffron">· Featured guide</span>
          )}
        </p>
        <h3
          className={cn(
            "mt-2 font-serif font-medium leading-[1.15] tracking-[-0.005em] text-ink transition-colors group-hover:text-saffron",
            isFeatured ? "text-[28px] md:text-[32px]" : "line-clamp-2 text-[20px]",
          )}
        >
          {guide.title}
        </h3>
        {isFeatured && (
          <p className="mt-3 max-w-prose text-[14px] leading-[1.65] text-ink-muted">
            {guide.subtitle}
          </p>
        )}

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-block h-7 w-7 shrink-0 rounded-full ring-1 ring-gold/20"
              style={{ background: creator?.avatarGradient ?? "#F0E4C8" }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {creator?.displayName ?? "Ananya editorial"}
                </p>
                {creator?.isVerified && (
                  <BadgeCheck
                    size={12}
                    strokeWidth={1.8}
                    className="shrink-0 text-gold"
                  />
                )}
              </div>
              <p
                className="truncate font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {creator?.handle ?? "@ananya"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleSave(guide.id);
            }}
            aria-label={isSaved ? "Unsave guide" : "Save guide"}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              isSaved
                ? "border-gold/40 bg-gold-pale/40 text-gold"
                : "border-border bg-white text-ink-muted hover:border-gold/30 hover:text-ink",
            )}
          >
            {isSaved ? (
              <BookmarkCheck size={11} strokeWidth={1.8} />
            ) : (
              <BookmarkPlus size={11} strokeWidth={1.8} />
            )}
            <span
              className="font-mono text-[10.5px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {saveCount.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
