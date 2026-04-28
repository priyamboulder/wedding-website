"use client";

// ── ShowcaseCard ────────────────────────────────────────────────────────────
// Card for the Real Weddings listing. Cover image with style-tag overlay,
// couple names, date + venue line, save count. Hover scales the cover.
// "featured" size spans two columns with subtitle copy.

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  HeartOff,
  ImageOff,
  MapPin,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealWeddingShowcase } from "@/types/showcase";
import { SHOWCASE_STYLE_LABEL } from "@/types/showcase";
import { useShowcasesStore } from "@/stores/showcases-store";

export type ShowcaseCardSize = "default" | "featured";

export function ShowcaseCard({
  showcase,
  size = "default",
  isMonthlyWinner = false,
  className,
}: {
  showcase: RealWeddingShowcase;
  size?: ShowcaseCardSize;
  isMonthlyWinner?: boolean;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const isSaved = useShowcasesStore((s) => s.isSaved(showcase.id));
  const saveCount = useShowcasesStore((s) => s.saveCountFor(showcase.id));
  const toggleSave = useShowcasesStore((s) => s.toggleSave);

  const isFeatured = size === "featured";
  const primaryStyle = showcase.styleTags[0];
  const primaryStyleLabel = primaryStyle
    ? SHOWCASE_STYLE_LABEL[primaryStyle]
    : null;

  const weddingDate = new Date(showcase.weddingDate).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  return (
    <Link
      href={`/community/real-weddings/${showcase.slug}`}
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
          isFeatured
            ? "aspect-[16/9] md:col-span-3 md:aspect-[5/4]"
            : "aspect-[4/5]",
        )}
      >
        {showcase.coverImageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={showcase.coverImageUrl}
            alt={`${showcase.brideName} & ${showcase.partnerName}'s wedding`}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={28} strokeWidth={1.3} />
          </div>
        )}

        {/* Gradient + overlay copy */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {primaryStyleLabel && (
          <span
            className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {primaryStyleLabel}
          </span>
        )}

        {isMonthlyWinner && (
          <span
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Trophy size={10} strokeWidth={2} />
            Wedding of the Month
          </span>
        )}

        {/* Overlaid couple names on smaller cards; featured gets a larger external title */}
        {!isFeatured && (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-serif text-[22px] font-medium leading-tight text-ivory">
              {showcase.brideName} & {showcase.partnerName}
            </h3>
            <p className="mt-1 font-serif text-[12.5px] italic text-ivory/85">
              {weddingDate} · {showcase.locationCity}
            </p>
          </div>
        )}
      </div>

      {/* Body — featured variant puts text next to image */}
      <div
        className={cn(
          "mt-4",
          isFeatured && "md:col-span-2 md:mt-0 md:flex md:flex-col md:justify-center",
        )}
      >
        {isFeatured ? (
          <>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Featured Real Wedding
            </p>
            <h3 className="mt-3 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.005em] text-ink group-hover:text-saffron">
              {showcase.brideName} & {showcase.partnerName}
            </h3>
            <p className="mt-3 flex items-center gap-1.5 font-serif text-[14px] italic text-ink-muted">
              <MapPin size={12} strokeWidth={1.8} />
              {weddingDate} · {showcase.venueName}, {showcase.locationCity}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {showcase.styleTags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-gold/25 bg-ivory-warm/40 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {SHOWCASE_STYLE_LABEL[t]}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {/* Footer row */}
        <div className={cn("flex items-center justify-between gap-3", isFeatured ? "mt-5" : "mt-3")}>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {showcase.guestCountRange} guests
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleSave(showcase.id);
            }}
            aria-label={isSaved ? "Unsave showcase" : "Save showcase"}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              isSaved
                ? "border-rose/40 bg-rose-pale/40 text-rose"
                : "border-border bg-white text-ink-muted hover:border-rose/30 hover:text-ink",
            )}
          >
            {isSaved ? (
              <HeartOff size={11} strokeWidth={1.8} />
            ) : (
              <Heart size={11} strokeWidth={1.8} />
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
