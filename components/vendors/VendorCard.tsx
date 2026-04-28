"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Globe2,
  Heart,
  ImageOff,
  Link2,
  Plane,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Vendor,
  ShortlistStatus,
  VendorTravelLevel,
} from "@/types/vendor";
import {
  SHORTLIST_STATUS_LABEL,
  SHORTLIST_STATUS_DOT,
} from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { InquireButton } from "./InquiryDialog";

interface VendorCardProps {
  vendor: Vendor;
  shortlisted: boolean;
  status: ShortlistStatus | undefined;
  linkedTaskCount: number;
  linkedTaskTitle: string | null;
  onOpen: () => void;
  onToggleShortlist: () => void;
  onChooseTask: (e: React.MouseEvent) => void;
  onInquire: () => void;
}

export function VendorCard(props: VendorCardProps) {
  return props.vendor.tier === "select" ? (
    <PremiumVendorCard {...props} />
  ) : (
    <FreeVendorCard {...props} />
  );
}

function vendorCoverUrl(vendor: Vendor): string | null {
  if (vendor.cover_image) return vendor.cover_image;
  return (vendor.portfolio_images ?? [])[0]?.url ?? null;
}

function vendorCoverAlt(vendor: Vendor): string {
  return (vendor.portfolio_images ?? [])[0]?.alt ?? vendor.name;
}

// ── Free tier card ─────────────────────────────────────────────────────────
// Sparse on purpose: one image, no review snippet, no planner/wedding counts.

function FreeVendorCard({
  vendor,
  shortlisted,
  status,
  linkedTaskCount,
  linkedTaskTitle,
  onOpen,
  onToggleShortlist,
  onChooseTask,
  onInquire,
}: VendorCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = vendorCoverUrl(vendor);
  const hasImage = coverUrl && !imgError;
  const priceLabel = formatPriceShort(vendor.price_display);

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-border bg-white transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-[0_6px_18px_rgba(26,26,26,0.06)]",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt={vendorCoverAlt(vendor)}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.08]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}

        {status && <StatusPill status={status} />}
        <HeartButton shortlisted={shortlisted} onClick={onToggleShortlist} />
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 font-serif text-[14px] leading-snug text-ink">
            {vendor.name}
          </h3>
          <span
            className="shrink-0 font-mono text-[11px] text-ink-soft"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {priceLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {vendor.rating != null && (
            <span className="flex items-center gap-1 text-[10.5px] text-ink-muted">
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

        <FreeTravelIndicator level={vendor.travel_level} />

        <CardFooter
          category={vendor.category}
          linkedTaskCount={linkedTaskCount}
          linkedTaskTitle={linkedTaskTitle}
          onChooseTask={onChooseTask}
          onInquire={onInquire}
        />
      </div>
    </div>
  );
}

function FreeTravelIndicator({ level }: { level: VendorTravelLevel }) {
  if (level === "local") return null;
  const label =
    level === "destination"
      ? "Destination specialist"
      : level === "worldwide"
        ? "Travels worldwide"
        : level === "nationwide"
          ? "Travels nationwide"
          : "Travels regionally";
  return (
    <p className="flex items-center gap-1 text-[10.5px] text-teal">
      <Plane size={10} strokeWidth={1.7} />
      <span className="truncate">{label}</span>
    </p>
  );
}

// ── Premium "Ananya Select" card ───────────────────────────────────────────

function PremiumVendorCard({
  vendor,
  shortlisted,
  status,
  linkedTaskCount,
  linkedTaskTitle,
  onOpen,
  onToggleShortlist,
  onChooseTask,
  onInquire,
}: VendorCardProps) {
  // Up to 3 images for the carousel: prefer cover_image then portfolio.
  const carouselImages = useMemo(() => {
    const urls: string[] = [];
    if (vendor.cover_image) urls.push(vendor.cover_image);
    for (const img of (vendor.portfolio_images ?? [])) {
      if (urls.length === 3) break;
      if (img?.url && !urls.includes(img.url)) urls.push(img.url);
    }
    return urls;
  }, [vendor.cover_image, vendor.portfolio_images]);

  const plannersCount = vendor.planner_connections.length;
  const weddingsCount = vendor.wedding_count;
  const priceLabel = formatPriceShort(vendor.price_display);

  // Unique venue-state count for a "shot at N venues" pill.
  const venueCount = vendor.venue_connections.length;

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-white transition-all duration-200",
        "border-gold/40 shadow-[inset_3px_0_0_0_#B8860B]",
        "hover:-translate-y-0.5 hover:border-gold hover:shadow-[inset_3px_0_0_0_#B8860B,0_10px_24px_-8px_rgba(184,134,11,0.35)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gold/15 bg-gradient-to-r from-gold-pale/60 to-gold-pale/10 px-3 py-1.5">
        <span
          className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={2} className="text-gold" />
          Ananya Select
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        <Carousel images={carouselImages} alt={vendor.name} />

        {status && <StatusPill status={status} />}
        <HeartButton shortlisted={shortlisted} onClick={onToggleShortlist} />
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex min-w-0 flex-1 items-start gap-1.5 font-serif text-[14px] leading-snug text-ink">
            <span className="line-clamp-2">{vendor.name}</span>
            {vendor.is_verified && (
              <span
                title="Verified by Ananya — licensed, insured, and vetted."
                className="mt-[2px] shrink-0 text-gold"
                aria-label="Verified by Ananya"
              >
                <BadgeCheck size={14} strokeWidth={1.9} />
              </span>
            )}
          </h3>
          <span
            className="shrink-0 font-mono text-[11px] text-ink-soft"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {priceLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {vendor.rating != null && (
            <span className="flex items-center gap-1 text-[10.5px] text-ink-muted">
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

        {(vendor.travel_level === "destination" ||
          vendor.travel_level === "worldwide") && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-pale/70 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-teal">
                <Plane size={9} strokeWidth={2} />
                {vendor.travel_level === "worldwide" ? "Worldwide" : "Destination"}
              </span>
              {venueCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-teal">
                  <Globe2 size={10} strokeWidth={1.7} />
                  {venueCount} venue{venueCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        )}

        {vendor.travel_level !== "destination" &&
          vendor.travel_level !== "worldwide" &&
          vendor.travel_level !== "local" && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">
              <Plane size={9} strokeWidth={1.8} />
              {vendor.travel_level === "nationwide" ? "Nationwide" : "Regional"}
            </span>
          )}

        {vendor.tagline && (
          <p className="line-clamp-2 font-serif text-[12.5px] italic leading-snug text-ink-soft">
            &ldquo;{vendor.tagline}&rdquo;
          </p>
        )}

        {(plannersCount > 0 || weddingsCount > 0) && (
          <p
            className="font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {plannersCount > 0 && (
              <>
                <span className="text-gold">◆</span>{" "}
                {plannersCount} planner{plannersCount === 1 ? "" : "s"}
              </>
            )}
            {plannersCount > 0 && weddingsCount > 0 && (
              <span className="mx-1.5 text-ink-faint">·</span>
            )}
            {weddingsCount > 0 && (
              <>
                {weddingsCount} wedding{weddingsCount === 1 ? "" : "s"}
              </>
            )}
          </p>
        )}

        <CardFooter
          category={vendor.category}
          linkedTaskCount={linkedTaskCount}
          linkedTaskTitle={linkedTaskTitle}
          onChooseTask={onChooseTask}
          onInquire={onInquire}
        />
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const [errorFor, setErrorFor] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 3500);
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

function StatusPill({ status }: { status: ShortlistStatus }) {
  return (
    <span
      className={cn(
        "absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-ink shadow-sm ring-1 ring-border",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", SHORTLIST_STATUS_DOT[status])} />
      {SHORTLIST_STATUS_LABEL[status]}
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

function CardFooter({
  category,
  linkedTaskCount,
  linkedTaskTitle,
  onChooseTask,
  onInquire,
}: {
  category: Vendor["category"];
  linkedTaskCount: number;
  linkedTaskTitle: string | null;
  onChooseTask: (e: React.MouseEvent) => void;
  onInquire: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
      {linkedTaskTitle ? (
        <span
          className="inline-flex min-w-0 flex-1 items-center gap-1 truncate text-[10.5px] italic text-ink-muted"
          title={linkedTaskTitle}
        >
          <Link2 size={9} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
          <span className="truncate">{linkedTaskTitle}</span>
          {linkedTaskCount > 1 && (
            <span className="font-mono text-[9.5px] text-ink-faint">
              +{linkedTaskCount - 1}
            </span>
          )}
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChooseTask(e);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] text-ink-faint/80 transition-colors hover:bg-gold-pale/40 hover:text-gold"
        >
          <Link2 size={9} strokeWidth={1.8} />
          Choose task
        </button>
      )}
      <InquireButton onClick={onInquire} size="sm" />
    </div>
  );
}
