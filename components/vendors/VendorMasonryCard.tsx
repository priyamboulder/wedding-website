"use client";

// ── Masonry vendor card ────────────────────────────────────────────────────
// Pinterest-style card for the /vendors/[category] drill-in. Smaller and
// denser than the marketplace VendorCard — no inquire/task-link footer, no
// review snippet. The "why this pick" rationale lives on the vendor profile,
// reached by clicking the card.

import { useState } from "react";
import Link from "next/link";
import { Heart, ImageOff, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor";
import { formatPriceShort } from "@/lib/vendors/price-display";
import type { CategoryBudgetTier } from "@/lib/vendors/filters";

export type MasonryRibbon = "top_match" | "rising_star" | null;

export type MasonryBadge =
  | "within_budget"
  | "stretch_budget"
  | "rising_talent"
  | "books_fast"
  | "shoots_at_match"; // generic "past venues" hit

interface Props {
  vendor: Vendor;
  shortlisted: boolean;
  onToggleShortlist: () => void;
  ribbon: MasonryRibbon;
  budgetTier: CategoryBudgetTier | null;
  // Card image height — varied across the grid to create rhythm.
  imageHeight: 240 | 280 | 320;
  // Optional venue-match label (e.g. "Shoots Leela Palace") shown as a badge.
  venueMatchLabel?: string | null;
}

const BADGE_LABEL: Record<MasonryBadge, string> = {
  within_budget: "Within your budget",
  stretch_budget: "Stretch pick",
  rising_talent: "Rising talent",
  books_fast: "Books fast",
  shoots_at_match: "Past venue",
};

const BADGE_TONE: Record<MasonryBadge, string> = {
  within_budget: "bg-sage-pale/70 text-sage",
  stretch_budget: "bg-saffron-pale/70 text-saffron",
  rising_talent: "bg-rose-pale/70 text-rose",
  books_fast: "bg-teal-pale/70 text-teal",
  shoots_at_match: "bg-gold-pale/70 text-gold",
};

export function VendorMasonryCard({
  vendor,
  shortlisted,
  onToggleShortlist,
  ribbon,
  budgetTier,
  imageHeight,
  venueMatchLabel,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const cover =
    vendor.cover_image || vendor.portfolio_images?.[0]?.url || null;
  const hasImage = cover && !imgError;

  // Pick at most two badges — keeps the card calm.
  const badges: MasonryBadge[] = [];
  if (budgetTier === "within") badges.push("within_budget");
  else if (budgetTier === "stretch") badges.push("stretch_budget");
  if (
    vendor.tier !== "select" &&
    (vendor.rating ?? 0) >= 4.6 &&
    vendor.wedding_count <= 80
  ) {
    badges.push("rising_talent");
  }
  if (venueMatchLabel && badges.length < 2) {
    badges.push("shoots_at_match");
  }
  if (
    badges.length < 2 &&
    vendor.response_time_hours !== null &&
    vendor.response_time_hours <= 6
  ) {
    badges.push("books_fast");
  }
  const visibleBadges = badges.slice(0, 2);

  const priceLabel = formatPriceShort(vendor.price_display);

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className={cn(
        "group relative mb-3 block break-inside-avoid overflow-hidden rounded-[12px] border border-border bg-white",
        "transition-shadow duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(26,26,26,0.07)]",
        "hover:border-gold/30",
      )}
      style={{ transform: "translateZ(0)" }}
    >
      <div
        className="relative w-full overflow-hidden bg-ivory-warm"
        style={{ height: imageHeight }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover!}
            alt={vendor.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}

        {ribbon && <Ribbon kind={ribbon} />}
        <HeartButton shortlisted={shortlisted} onClick={onToggleShortlist} />
      </div>

      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="line-clamp-1 font-serif text-[15px] font-medium text-ink">
            {vendor.name}
          </span>
          <PriceChip
            label={
              vendor.price_display.type === "exact"
                ? `Quoted: ${priceLabel}`
                : priceLabel || "Contact"
            }
          />
        </div>

        {vendor.location && (
          <span className="text-[12px] text-ink-faint">
            {vendor.location}
          </span>
        )}

        <div className="flex items-center gap-1 text-[12px] text-ink-muted">
          {vendor.rating !== null ? (
            <>
              <Star
                size={11}
                strokeWidth={1.6}
                className="text-saffron"
                fill="currentColor"
              />
              <span className="font-mono" style={{ fontFamily: "var(--font-mono)" }}>
                {vendor.rating.toFixed(1)}
              </span>
              <span className="text-ink-faint">
                · {vendor.review_count} review{vendor.review_count === 1 ? "" : "s"}
              </span>
            </>
          ) : (
            <span className="text-ink-faint italic">No reviews yet</span>
          )}
        </div>

        {visibleBadges.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {visibleBadges.map((b) => (
              <span
                key={b}
                className={cn(
                  "rounded-full px-2 py-[2px] text-[10.5px] font-medium",
                  BADGE_TONE[b],
                )}
              >
                {b === "shoots_at_match" && venueMatchLabel
                  ? venueMatchLabel
                  : BADGE_LABEL[b]}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function Ribbon({ kind }: { kind: NonNullable<MasonryRibbon> }) {
  const isTop = kind === "top_match";
  return (
    <span
      className={cn(
        "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm",
        isTop
          ? "bg-gold text-white"
          : "bg-rose text-white",
      )}
    >
      <Sparkles size={9} strokeWidth={2} />
      {isTop ? "Top match" : "Rising star"}
    </span>
  );
}

function PriceChip({ label }: { label: string }) {
  return (
    <span
      className="shrink-0 rounded-full bg-ivory-warm px-2 py-[2px] font-mono text-[10.5px] text-ink-soft"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

function HeartButton({
  shortlisted,
  onClick,
}: {
  shortlisted: boolean;
  onClick: () => void;
}) {
  const [pulse, setPulse] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setPulse(true);
        window.setTimeout(() => setPulse(false), 220);
        onClick();
      }}
      aria-label={shortlisted ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={shortlisted}
      className={cn(
        "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-border backdrop-blur-[2px] transition-all",
        "hover:bg-white",
        shortlisted ? "text-saffron" : "text-ink-muted hover:text-ink",
      )}
    >
      <Heart
        size={14}
        strokeWidth={1.8}
        fill={shortlisted ? "currentColor" : "none"}
        className={cn(
          "transition-transform duration-200 ease-out",
          pulse && "scale-125",
        )}
      />
    </button>
  );
}
