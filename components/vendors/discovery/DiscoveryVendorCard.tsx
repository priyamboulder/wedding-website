"use client";

import { useState } from "react";
import { Heart, ImageOff, Scale, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorWithDiscovery } from "@/types/vendor-discovery";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { SUBCATEGORY_BY_ID, TOP_CATEGORY_LABEL } from "@/lib/vendors/taxonomy";
import { VideoBadge } from "./VideoBadge";
import { VideoHoverPreview } from "./VideoHoverPreview";
import { StyleMatchBadge } from "./StyleMatchBadge";
import { CollaborationBadge } from "./CollaborationBadge";
import { AvailabilityChip } from "./AvailabilityChip";
import { availabilityStateFor } from "@/lib/vendors/availability";
import type { StyleSignature } from "@/types/vendor-discovery";
import { matchScore } from "@/lib/vendors/style-matching";

interface Props {
  vendor: VendorWithDiscovery;
  shortlisted: boolean;
  inCompare: boolean;
  onToggleShortlist: () => void;
  onToggleCompare: () => void;
  onOpen: () => void;
  coupleStyle: StyleSignature | null;
  targetDateIso: string | null;
  collaborationOverlap: number;
  collaborationNames?: string[];
}

export function DiscoveryVendorCard({
  vendor,
  shortlisted,
  inCompare,
  onToggleShortlist,
  onToggleCompare,
  onOpen,
  coupleStyle,
  targetDateIso,
  collaborationOverlap,
  collaborationNames,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = vendor.cover_image || (vendor.portfolio_images ?? [])[0]?.url || null;
  const hasImage = coverUrl && !imgError;
  const priceLabel = formatPriceShort(vendor.price_display);

  const subcategory = vendor.subcategory_id
    ? SUBCATEGORY_BY_ID.get(vendor.subcategory_id)
    : null;

  const styleMatch =
    coupleStyle && vendor.style_signature
      ? matchScore(coupleStyle, vendor.style_signature)
      : null;

  const availabilityState = targetDateIso
    ? availabilityStateFor(vendor.availability, targetDateIso)
    : "unknown";

  const introVideo = vendor.video_profile?.intro_video ?? null;

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-white transition-all duration-200",
        inCompare
          ? "border-gold shadow-[0_8px_22px_-10px_rgba(184,134,11,0.45)]"
          : "border-border hover:border-gold/30 hover:shadow-[0_6px_18px_rgba(26,26,26,0.06)]",
        "hover:-translate-y-0.5",
      )}
    >
      {/* Cover area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt={vendor.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.08]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}

        {/* Hover-to-play video preview — desktop only effectively */}
        {introVideo && (
          <VideoHoverPreview video={introVideo} posterUrl={coverUrl} />
        )}

        {/* Top-left badges */}
        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1.5">
          {vendor.video_profile && vendor.video_profile.badge !== "none" && (
            <VideoBadge state={vendor.video_profile.badge} size="xs" />
          )}
          {styleMatch != null && (
            <StyleMatchBadge score={styleMatch} size="xs" />
          )}
        </div>

        {/* Top-right actions */}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <IconButton
            label={inCompare ? "Remove from comparison" : "Add to comparison"}
            pressed={inCompare}
            onClick={onToggleCompare}
            active={inCompare}
            tone="gold"
          >
            <Scale size={13} strokeWidth={inCompare ? 2.2 : 1.8} />
          </IconButton>
          <IconButton
            label={shortlisted ? "Remove from favorites" : "Save to favorites"}
            pressed={shortlisted}
            onClick={onToggleShortlist}
            active={shortlisted}
            tone="saffron"
          >
            <Heart
              size={13}
              strokeWidth={1.8}
              fill={shortlisted ? "currentColor" : "none"}
            />
          </IconButton>
        </div>

        {/* Bottom-right availability */}
        {targetDateIso && (
          <div className="absolute bottom-2 right-2">
            <AvailabilityChip
              state={availabilityState}
              targetDateIso={targetDateIso}
              size="xs"
            />
          </div>
        )}

        {/* Collaboration badge bottom-left */}
        {collaborationOverlap > 0 && (
          <div className="absolute bottom-2 left-2">
            <CollaborationBadge
              overlapCount={collaborationOverlap}
              shortlistedNames={collaborationNames}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Body */}
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
              <span
                className="font-mono text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                · {vendor.review_count}
              </span>
            </span>
          )}
          <span
            className="truncate font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {subcategory
              ? subcategory.label.toLowerCase()
              : TOP_CATEGORY_LABEL[vendor.category].toLowerCase()}
            {vendor.location && ` · ${vendor.location.toLowerCase()}`}
          </span>
        </div>

        {/* Style / specialty tags */}
        {vendor.style_tags && vendor.style_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vendor.style_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ivory-warm px-2 py-0.5 text-[10px] text-ink-muted"
              >
                {tag}
              </span>
            ))}
            {vendor.style_tags.length > 3 && (
              <span className="text-[10px] text-ink-faint">
                +{vendor.style_tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  active,
  pressed,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  pressed: boolean;
  tone: "gold" | "saffron";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-border backdrop-blur-[2px] transition-all hover:bg-white",
        active && tone === "gold" && "text-gold ring-gold/40",
        active && tone === "saffron" && "text-saffron ring-saffron/40",
        !active && "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
