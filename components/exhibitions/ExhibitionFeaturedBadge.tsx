"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExhibitionsFeaturingProduct } from "@/lib/exhibitions/product-features";

// Renders a small "Featured in [Exhibition]" chip on product cards when the
// product was part of any exhibition — live, upcoming, or ended. Self-hides
// when there's no matching exhibition. Intended for Store and Creator Picks
// cards; functionally the complement of FeaturedInBadge (which points at
// creator guides).

export function ExhibitionFeaturedBadge({
  productId,
  weddingId,
  variant = "compact",
  className,
}: {
  productId: string | null | undefined;
  weddingId?: string;
  variant?: "default" | "compact";
  className?: string;
}) {
  const exhibitions = getExhibitionsFeaturingProduct(productId);
  if (exhibitions.length === 0) return null;
  const primary = exhibitions[0];
  const more = exhibitions.length - 1;

  const inner = (
    <>
      <Sparkles
        size={variant === "compact" ? 9 : 10}
        strokeWidth={1.8}
        className="shrink-0 text-gold"
      />
      <span className="truncate">
        <span
          className="font-mono uppercase tracking-wider text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Featured in
        </span>
        <span className="ml-1 max-w-[160px] truncate font-medium text-ink">
          {primary.title}
        </span>
        {more > 0 && (
          <span
            className="ml-1 font-mono text-[9.5px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            +{more}
          </span>
        )}
      </span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/95 text-ink shadow-sm backdrop-blur-sm transition-colors",
    variant === "compact"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[10.5px]",
    className,
  );

  if (!weddingId) {
    return (
      <span className={classes} title={`Featured in: ${primary.title}`}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={`/${weddingId}/shopping/exhibitions/${primary.slug}`}
      onClick={(e) => e.stopPropagation()}
      title={`Featured in: ${primary.title}`}
      className={cn(classes, "hover:border-gold hover:bg-gold-pale/50")}
    >
      {inner}
    </Link>
  );
}
