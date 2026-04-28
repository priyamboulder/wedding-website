"use client";

// ── FeaturedInBadge ─────────────────────────────────────────────────────────
// Small "📖 Featured in [Guide Title]" badge that lives on product cards
// across all Shopping tabs (External Finds, Our Store, Marketplace, Creator
// Picks). Renders nothing if the product isn't referenced by any guide.

import Link from "next/link";
import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGuidesFeaturingProduct } from "@/lib/guides/seed";

export function FeaturedInBadge({
  productId,
  className,
  variant = "default",
}: {
  productId: string;
  className?: string;
  variant?: "default" | "compact";
}) {
  const guides = useMemo(
    () => getGuidesFeaturingProduct(productId),
    [productId],
  );
  if (guides.length === 0) return null;
  const primary = guides[0];
  const more = guides.length - 1;

  return (
    <Link
      href={`/community/guides/${primary.slug}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/95 text-ink shadow-sm backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold-pale/50",
        variant === "compact"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-[10.5px]",
        className,
      )}
      title={`Featured in: ${primary.title}`}
    >
      <BookOpen
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
        <span className="ml-1 max-w-[140px] truncate font-medium text-ink group-hover:text-gold">
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
    </Link>
  );
}
