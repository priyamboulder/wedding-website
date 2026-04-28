"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff, Sparkles, ShoppingCart, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator, CreatorPick } from "@/types/creator";
import type { StoreProduct } from "@/lib/link-preview/types";
import { useCreatorsStore } from "@/stores/creators-store";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";
import { CreatorAvatar } from "./CreatorAvatar";
import { FeaturedInBadge } from "@/components/community/guides/FeaturedInBadge";
import { ExhibitionFeaturedBadge } from "@/components/exhibitions/ExhibitionFeaturedBadge";

function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: cents % 1 === 0 ? 0 : 2,
    }).format(cents);
  } catch {
    return `${currency} ${cents.toFixed(2)}`;
  }
}

export function CreatorPickCard({
  pick,
  product,
  creator,
  weddingId,
  referralType = "direct_link",
  collectionId,
  module,
  showNote = true,
  className,
}: {
  pick: CreatorPick;
  product: StoreProduct;
  creator: Creator;
  weddingId: string;
  referralType?: "tab_click" | "exhibition" | "styled_by" | "direct_link";
  collectionId?: string;
  module?: string | null;
  showNote?: boolean;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(false);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);
  const { addStoreItem } = useShoppingLinks();

  function handleAddToBoard() {
    trackReferral({
      creatorId: creator.id,
      productId: product.id,
      collectionId: collectionId ?? pick.collectionId,
      referralType,
    });
    addStoreItem({
      productId: product.id,
      variantId: null,
      module: module ?? null,
      note: pick.creatorNote
        ? `Picked by ${creator.displayName}: ${pick.creatorNote}`
        : `Picked by ${creator.displayName}`,
    });
    setSaved(true);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-[0_6px_18px_rgba(26,26,26,0.06)]",
        className,
      )}
    >
      {/* Curator ribbon */}
      <Link
        href={`/${weddingId}/shopping/creators/${creator.id}`}
        onClick={() =>
          trackReferral({
            creatorId: creator.id,
            productId: product.id,
            collectionId: collectionId ?? pick.collectionId,
            referralType: "profile_click",
          })
        }
        className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-ink shadow-sm transition-colors hover:bg-gold-pale/40"
      >
        <CreatorAvatar creator={creator} size="xs" withBadge={false} />
        <span className="truncate max-w-[140px]">
          Recommended by {creator.displayName}
        </span>
      </Link>

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {product.heroImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.heroImage}
            alt={product.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.08]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}
        <span
          className="absolute bottom-2 left-2 rounded-full bg-ink/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ivory"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={8} strokeWidth={2} className="-mt-0.5 mr-1 inline" />
          Creator pick
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 font-serif text-[14px] leading-snug text-ink">
            {product.title}
          </h3>
          <span
            className="shrink-0 font-mono text-[12px] font-semibold text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPrice(product.basePrice, product.currency)}
          </span>
        </div>

        {pick.creatorNote && showNote && (
          <div className="flex gap-1.5 rounded-md bg-ivory-warm/60 px-2.5 py-2">
            <Quote
              size={11}
              strokeWidth={1.6}
              className="mt-0.5 shrink-0 text-gold"
            />
            <p className="text-[11.5px] italic leading-relaxed text-ink-muted">
              {pick.creatorNote}
            </p>
          </div>
        )}

        {/* "Featured in [Guide]" — links into the matching creator guide
            when this product is referenced from a published guide. */}
        <FeaturedInBadge productId={product.id} variant="compact" />

        <ExhibitionFeaturedBadge
          productId={product.id}
          weddingId={weddingId}
          variant="compact"
        />

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <span
            className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Ananya · {product.region.split(",")[0]}
          </span>
          <button
            onClick={handleAddToBoard}
            disabled={saved}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider transition-colors",
              saved
                ? "border-sage/40 bg-sage/20 text-ink"
                : "border-ink bg-ink text-ivory hover:bg-ink/90",
            )}
          >
            <ShoppingCart size={11} strokeWidth={1.8} />
            {saved ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
