"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Flag,
  Heart,
  Layers,
  Link2,
  MapPin,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MarketplaceListing,
  ListingType,
} from "@/types/marketplace";
import {
  conditionBadge,
  discountPct,
  formatPrice,
  listingTypeBadge,
} from "@/lib/marketplace/utils";

// ── Eyebrow ─────────────────────────────────────────────────────────────────

export function Eyebrow({
  children,
  className,
  rule = true,
}: {
  children: React.ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {rule && <span aria-hidden className="h-px w-6 bg-ink/15" />}
      <span>{children}</span>
      {rule && <span aria-hidden className="h-px flex-1 bg-ink/10" />}
    </div>
  );
}

// ── Gradient image placeholder ─────────────────────────────────────────────
// Since we don't ship real photos, each listing gets one or more gradients
// stored in image_gradients[]. Rendered as a subtly-textured panel that
// reads as "image" without needing an actual file.

export function GradientImage({
  gradient,
  label,
  ratio = "3/4",
  className,
  children,
}: {
  gradient?: string;
  label?: string;
  ratio?: "3/4" | "1/1" | "16/9" | "4/5";
  className?: string;
  children?: React.ReactNode;
}) {
  const fallback =
    "linear-gradient(135deg, #F0E4C8 0%, #D4A843 50%, #B8860B 100%)";
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        background: gradient ?? fallback,
        aspectRatio: ratio,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 45%), radial-gradient(circle at 75% 85%, rgba(0,0,0,0.15) 0%, transparent 45%)",
        }}
      />
      {label && (
        <div
          className="absolute inset-x-0 bottom-3 flex items-center justify-center font-serif text-[12px] italic tracking-tight text-ivory/85"
          aria-hidden
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Listing type pill (overlay on image corner) ─────────────────────────────

export function ListingTypePill({
  type,
  className,
}: {
  type: ListingType;
  className?: string;
}) {
  const { label, tone } = listingTypeBadge(type);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] shadow-sm",
        tone,
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

// ── Verified seller badge ──────────────────────────────────────────────────
// Shown when `seller_is_verified` is true. Criteria in v1: email confirmed +
// at least one completed transaction or manual identity check. Keep the
// visual small — this is a trust signal, not a brag.

export function VerifiedSellerBadge({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      title="Verified seller — email + identity confirmed"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-teal/25 bg-teal-pale/40 font-mono uppercase tracking-[0.18em] text-teal",
        size === "sm"
          ? "px-1.5 py-0.5 text-[9px]"
          : "px-2 py-0.5 text-[10px]",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <BadgeCheck
        size={size === "sm" ? 10 : 12}
        strokeWidth={2}
        className="text-teal"
      />
      Verified
    </span>
  );
}

// ── Condition badge ─────────────────────────────────────────────────────────

export function ConditionBadge({
  condition,
  className,
}: {
  condition: MarketplaceListing["condition"];
  className?: string;
}) {
  const tone =
    condition === "new_with_tags"
      ? "border-sage/30 bg-sage-pale/50 text-sage"
      : condition === "like_new"
        ? "border-teal/25 bg-teal-pale/40 text-teal"
        : condition === "good"
          ? "border-gold/25 bg-gold-pale/40 text-gold"
          : "border-ink/15 bg-ivory-warm text-ink-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]",
        tone,
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {conditionBadge(condition)}
    </span>
  );
}

// ── Listing card ────────────────────────────────────────────────────────────

export function ListingCard({
  listing,
  weddingId,
  saved,
  onToggleSave,
  onReport,
}: {
  listing: MarketplaceListing;
  weddingId: string;
  saved: boolean;
  onToggleSave: () => void;
  onReport?: (listingId: string) => void;
}) {
  const country = listing.seller_location_country;
  const price = formatPrice(listing.price_cents, country);
  const original = listing.original_price_cents
    ? formatPrice(listing.original_price_cents, country, { truncate: true })
    : null;
  const pct = discountPct(listing.price_cents, listing.original_price_cents);
  const gradient = listing.image_gradients?.[0];

  const priceLine = (() => {
    if (listing.listing_type === "free") {
      return (
        <span className="font-serif text-[17px] text-rose">
          FREE <span className="text-[13px]">·</span> give it a new home
        </span>
      );
    }
    if (listing.listing_type === "rent") {
      return (
        <span className="font-serif text-[17px] text-ink">
          {price}
          <span className="ml-1 text-[11px] font-sans text-ink-muted">
            / event
          </span>
        </span>
      );
    }
    return (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-serif text-[17px] text-ink">{price}</span>
        {original && (
          <span className="font-mono text-[10.5px] text-ink-faint line-through" style={{ fontFamily: "var(--font-mono)" }}>
            {original}
          </span>
        )}
        {pct != null && pct >= 10 && (
          <span
            className="rounded-full bg-gold-pale/60 px-1.5 py-0 font-mono text-[9px] uppercase tracking-wider text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {pct}% off
          </span>
        )}
      </span>
    );
  })();

  return (
    <Link
      href={`/${weddingId}/shopping/marketplace/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gold/15 bg-white transition-all hover:border-gold/35 hover:shadow-md"
    >
      <div className="relative">
        <GradientImage gradient={gradient} ratio="3/4" label={listing.title} />
        <div className="absolute left-3 top-3">
          <ListingTypePill type={listing.listing_type} />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all",
            saved
              ? "border-rose/40 bg-rose text-ivory"
              : "border-white/50 bg-white/85 text-ink-muted hover:bg-white hover:text-rose",
          )}
          aria-label={saved ? "Remove from saves" : "Save"}
          aria-pressed={saved}
        >
          <Heart size={14} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-[15.5px] leading-tight tracking-tight text-ink line-clamp-2">
          {listing.title}
        </h3>

        {priceLine}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <ConditionBadge condition={listing.condition} />
            {listing.seller_is_verified && <VerifiedSellerBadge />}
          </div>
          {listing.price_is_negotiable && listing.listing_type !== "free" && (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Negotiable
            </span>
          )}
        </div>

        <div
          className="mt-auto flex items-center gap-1 border-t border-ink/5 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <MapPin size={10} strokeWidth={1.8} />
          <span>{listing.seller_location_city}</span>
          {listing.seller_member_since && (
            <>
              <span aria-hidden className="mx-1">·</span>
              <span>
                Since{" "}
                {new Date(listing.seller_member_since).toLocaleDateString(
                  "en-US",
                  { month: "short", year: "numeric" },
                )}
              </span>
            </>
          )}
          {listing.shipping_available && (
            <>
              <span aria-hidden className="mx-1">·</span>
              <span>Ships</span>
            </>
          )}
          {onReport && (
            <button
              type="button"
              aria-label="Report this listing"
              title="Report this listing"
              onClick={(e) => {
                e.preventDefault();
                onReport(listing.id);
              }}
              className="ml-auto rounded-full p-1 text-ink-faint transition-colors hover:bg-ink/5 hover:text-rose"
            >
              <Flag size={10} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Shopping sub-nav (mirrors the ModeToggle on /shopping) ────────────────
// Keeps the four-pill control visually consistent when the user is inside
// /marketplace. The first three pills link back to the main shopping board
// (with ?mode=… so the view lands the right scope); "Marketplace" is the
// active pill. A subtle divider + "My Listings" secondary link sits to the
// right so sellers have a path to their dashboard.

export function MarketplaceTabBar({
  weddingId,
  active,
}: {
  weddingId: string;
  active: "exhibitions" | "marketplace" | "mine";
}) {
  const shoppingHref = (mode: string) =>
    `/${weddingId}/shopping${mode === "external" ? "" : `?mode=${mode}`}`;

  const pills: {
    id: "external" | "ananya_store" | "all" | "marketplace";
    label: string;
    href: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "external",
      label: "External Finds",
      href: shoppingHref("external"),
      icon: <Link2 size={12} strokeWidth={1.8} />,
    },
    {
      id: "ananya_store",
      label: "Our Store",
      href: shoppingHref("ananya_store"),
      icon: <Store size={12} strokeWidth={1.8} />,
    },
    {
      id: "all",
      label: "All",
      href: shoppingHref("all"),
      icon: <Layers size={12} strokeWidth={1.8} />,
    },
    {
      id: "marketplace",
      label: "Pre-Loved",
      href: `/${weddingId}/shopping/marketplace`,
      icon: <Tag size={12} strokeWidth={1.8} />,
    },
  ];

  // "mine" is a sub-view of Marketplace — keep that pill highlighted too.
  const activePillId = active === "mine" ? "marketplace" : active === "exhibitions" ? null : active;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gold/10 bg-ivory-warm/30 px-6 py-3 lg:px-8">
      <div className="flex items-center gap-1 rounded-full border border-gold/20 bg-white p-0.5 shadow-sm">
        {pills.map((p, i) => {
          const isActive = p.id === activePillId;
          // Insert the subtle divider between "All" and "Marketplace" to
          // mirror the grouping on /shopping.
          return (
            <span key={p.id} className="flex items-center">
              {i === 3 && (
                <span aria-hidden className="mx-1 h-4 w-px bg-gold/20" />
              )}
              <Link
                href={p.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
                )}
              >
                {p.icon}
                {p.label}
              </Link>
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/${weddingId}/shopping/exhibitions`}
          className={cn(
            "hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px] font-medium transition-colors md:inline-flex",
            active === "exhibitions"
              ? "border-gold/40 bg-gold-pale/30 text-gold"
              : "border-gold/20 bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
          )}
        >
          <Sparkles size={12} strokeWidth={1.8} className="text-gold" />
          Exhibitions
        </Link>
        <Link
          href={`/${weddingId}/shopping/marketplace/mine`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
            active === "mine"
              ? "border-ink bg-ink text-ivory"
              : "border-gold/20 bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
          )}
        >
          My listings
        </Link>
      </div>
    </div>
  );
}
