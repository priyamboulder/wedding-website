"use client";

// ── AI recommendation card ─────────────────────────────────────────────────
// Slightly richer than the marketplace VendorCard. Gold "Top Match" accent,
// WHY paragraph, match-signal chips, and primary CTAs: View Profile + Inquire.
// Styled consistently with the existing ivory/gold/cream palette.

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Heart,
  ImageOff,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor";
import type {
  LocalRecommendation,
  RecommendationLabel,
} from "@/lib/vendors/ai-recommendations";
import { RECOMMENDATION_LABEL_TEXT } from "@/lib/vendors/ai-recommendations";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";

interface AIRecommendationCardProps {
  rec: LocalRecommendation;
  shortlisted: boolean;
  onOpenProfile: (vendorId: string) => void;
  onToggleShortlist: (vendorId: string) => void;
  onInquire: (vendor: Vendor) => void;
  onDismiss: (vendorId: string) => void;
}

export function AIRecommendationCard({
  rec,
  shortlisted,
  onOpenProfile,
  onToggleShortlist,
  onInquire,
  onDismiss,
}: AIRecommendationCardProps) {
  const { vendor, reason, signals, label } = rec;

  const carouselImages = useMemo(() => {
    const urls: string[] = [];
    if (vendor.cover_image) urls.push(vendor.cover_image);
    for (const img of (vendor.portfolio_images ?? [])) {
      if (urls.length === 3) break;
      if (img?.url && !urls.includes(img.url)) urls.push(img.url);
    }
    return urls;
  }, [vendor.cover_image, vendor.portfolio_images]);

  const isTop = label === "top_match";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border bg-white transition-all duration-200",
        isTop
          ? "border-gold/50 shadow-[inset_3px_0_0_0_#C4A265,0_6px_18px_-8px_rgba(196,162,101,0.2)] hover:shadow-[inset_3px_0_0_0_#C4A265,0_12px_26px_-10px_rgba(196,162,101,0.35)]"
          : "border-border hover:border-gold/30 hover:shadow-[0_6px_18px_rgba(26,26,26,0.06)]",
        "hover:-translate-y-0.5",
      )}
    >
      <LabelBadge label={label} />

      {/* Dismiss */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(vendor.id);
        }}
        aria-label="Not interested"
        title="Not interested — replace this pick"
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-faint opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <X size={12} strokeWidth={1.8} />
      </button>

      {/* Image / carousel */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenProfile(vendor.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenProfile(vendor.id);
          }
        }}
        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-ivory-warm text-left"
      >
        <Carousel images={carouselImages} alt={vendor.name} />
        <HeartButton
          shortlisted={shortlisted}
          onClick={() => onToggleShortlist(vendor.id)}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenProfile(vendor.id)}
            className="flex min-w-0 flex-1 items-start gap-1.5 text-left"
          >
            <h3 className="line-clamp-2 font-serif text-[15px] leading-snug text-ink group-hover:text-gold">
              {vendor.name}
            </h3>
            {vendor.is_verified && (
              <span
                title="Verified by Ananya"
                className="mt-[3px] shrink-0 text-gold"
                aria-label="Verified by Ananya"
              >
                <BadgeCheck size={14} strokeWidth={1.9} />
              </span>
            )}
          </button>
          <span
            className="shrink-0 font-mono text-[11px] text-ink-soft"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPriceShort(vendor.price_display)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10.5px] text-ink-muted">
          {vendor.rating != null && (
            <span className="flex items-center gap-1">
              <Star
                size={10}
                strokeWidth={1.6}
                className="text-saffron"
                fill="currentColor"
              />
              <span
                className="font-mono"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {vendor.rating.toFixed(1)}
              </span>
              <span className="text-ink-faint">({vendor.review_count})</span>
            </span>
          )}
          <span
            className="truncate font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {CATEGORY_LABELS[vendor.category].toLowerCase()}
            {vendor.location && ` · ${vendor.location.toLowerCase()}`}
          </span>
        </div>

        {/* Signals (quick chips) */}
        {signals.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {signals.map((s, i) => (
              <li
                key={`${s}-${i}`}
                className="rounded-full bg-gold-pale/40 px-2 py-0.5 text-[10.5px] text-gold ring-1 ring-gold/20"
              >
                {s}
              </li>
            ))}
          </ul>
        )}

        {/* WHY paragraph */}
        <div className="rounded-md bg-ivory-warm/70 px-2.5 py-2 ring-1 ring-border/60">
          <div className="mb-1 flex items-center gap-1">
            <Sparkles size={10} strokeWidth={1.8} className="text-gold" />
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Why this pick
            </span>
          </div>
          <p className="text-[11.5px] italic leading-snug text-ink-soft">
            {reason}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenProfile(vendor.id)}
            className="flex-1 rounded-md border border-border bg-white py-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
          >
            View Profile
          </button>
          <button
            type="button"
            onClick={() => onInquire(vendor)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-ink py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Sparkles size={11} strokeWidth={1.8} />
            Inquire
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LabelBadge({ label }: { label: RecommendationLabel }) {
  const text = RECOMMENDATION_LABEL_TEXT[label];
  const styles =
    label === "top_match"
      ? "from-gold-pale/70 to-gold-pale/20 text-gold ring-gold/20"
      : label === "destination_specialist"
        ? "from-sage-pale/60 to-ivory-warm text-sage ring-sage/20"
        : "from-ivory-warm to-white text-ink-muted ring-border";
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-gradient-to-r px-3 py-1.5",
        styles,
      )}
    >
      <span
        className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.16em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label === "top_match" && (
          <Sparkles size={10} strokeWidth={2} />
        )}
        {text}
      </span>
    </div>
  );
}

function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const [errorFor, setErrorFor] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 4000);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0 || errorFor.size === count) {
    return (
      <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
        <ImageOff size={22} strokeWidth={1.3} />
      </div>
    );
  }

  return (
    <>
      {images.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${url}-${i}`}
          src={url}
          alt={alt}
          loading="lazy"
          onError={() =>
            setErrorFor((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            })
          }
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {count > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full bg-white/80 transition-all",
                i === index ? "w-4 bg-white" : "w-1.5",
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

function HeartButton({
  shortlisted,
  onClick,
}: {
  shortlisted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
      aria-pressed={shortlisted}
      className={cn(
        "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-border transition-colors",
        shortlisted ? "text-saffron" : "text-ink-muted hover:text-ink",
      )}
    >
      <Heart
        size={14}
        strokeWidth={1.8}
        fill={shortlisted ? "currentColor" : "none"}
      />
    </button>
  );
}
