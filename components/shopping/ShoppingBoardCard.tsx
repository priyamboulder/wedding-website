"use client";

import { useState } from "react";
import {
  Check,
  ImageOff,
  AlertTriangle,
  Link2,
  Copy,
  ShoppingCart,
  Clock,
  Store,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ShoppingLink,
  ShoppingStatus,
  StockStatus,
} from "@/lib/link-preview/types";
import {
  STOCK_LABEL,
  getStoreProduct,
} from "@/lib/store-seed";
import { FeaturedInBadge } from "@/components/community/guides/FeaturedInBadge";
import { ExhibitionFeaturedBadge } from "@/components/exhibitions/ExhibitionFeaturedBadge";

const STATUS_LABEL: Record<ShoppingStatus, string> = {
  considering: "Considering",
  ordered: "Ordered",
  received: "Received",
  returned: "Returned",
};

const STATUS_STYLES: Record<ShoppingStatus, string> = {
  considering: "bg-ink/90 text-ivory",
  ordered: "bg-saffron text-ink",
  received: "bg-sage text-ink",
  returned: "bg-rose/80 text-ivory",
};

const STOCK_STYLES: Record<StockStatus, string> = {
  in_stock: "bg-sage/90 text-ink",
  low_stock: "bg-saffron text-ink",
  made_to_order: "bg-ink/90 text-ivory",
  sold_out: "bg-rose/80 text-ivory",
};

function formatPrice(price: number | null, currency: string): string | null {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

function stockLabelForCard(
  stock: StockStatus,
  stockCount: number | null,
  leadTimeDays: number | null,
): string {
  if (stock === "low_stock" && stockCount != null) {
    return `LOW STOCK · ${stockCount} LEFT`;
  }
  if (stock === "made_to_order" && leadTimeDays != null) {
    const weeks = Math.round(leadTimeDays / 7);
    return `MADE TO ORDER · ${weeks}W LEAD`;
  }
  if (stock === "sold_out") return "SOLD OUT — NOTIFY ME";
  return STOCK_LABEL[stock].toUpperCase();
}

export function ShoppingBoardCard({
  link,
  moduleTitle,
  taskTitle,
  detached,
  duplicateCount,
  selected,
  inCart,
  onToggleSelect,
  onOpen,
  onAssignClick,
  onVariantChange,
  onToggleCart,
  onVendorClick,
}: {
  link: ShoppingLink;
  moduleTitle: string | null;
  taskTitle: string | null;
  detached: boolean;
  duplicateCount: number;
  selected: boolean;
  inCart: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onAssignClick: (e: React.MouseEvent) => void;
  onVariantChange?: (variantId: string | null) => void;
  onToggleCart?: () => void;
  onVendorClick?: (vendorId: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const total = link.price != null ? link.price * link.quantity : null;
  const isStandalone = link.taskId == null;
  const isStore = link.sourceType === "ananya_store";
  const product = isStore ? getStoreProduct(link.productId) : null;
  const stock = link.stockStatus;
  const leadWeeks =
    link.leadTimeDays != null ? Math.round(link.leadTimeDays / 7) : null;

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-white transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(26,26,26,0.06)]",
        selected
          ? "border-saffron ring-1 ring-saffron/40"
          : "border-border hover:border-gold/30",
      )}
    >
      {/* Selection checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        aria-label={selected ? "Deselect" : "Select"}
        className={cn(
          "absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border transition-all",
          selected
            ? "border-saffron bg-saffron text-ink opacity-100"
            : "border-border bg-white/90 text-transparent opacity-0 group-hover:opacity-100",
        )}
      >
        <Check size={12} strokeWidth={2.5} />
      </button>

      {/* Detached pill */}
      {detached && (
        <div
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-rose-pale/90 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-rose/90"
          title="The task this link was attached to was deleted"
        >
          <AlertTriangle size={9} strokeWidth={2} />
          Task deleted
        </div>
      )}

      {/* Native: status pill in top-right (stock moves to image bottom-left) */}
      {isStore && !detached && (
        <span
          className={cn(
            "absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider",
            STATUS_STYLES[link.status],
          )}
        >
          {STATUS_LABEL[link.status]}
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {link.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.imageUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.08]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}

        {/* Bottom-left pill:
            - External: current ShoppingStatus pill
            - Native:   StockStatus pill */}
        {isStore && stock ? (
          <span
            className={cn(
              "absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider",
              STOCK_STYLES[stock],
            )}
          >
            {stockLabelForCard(stock, product?.stockCount ?? null, link.leadTimeDays)}
          </span>
        ) : (
          <span
            className={cn(
              "absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider",
              STATUS_STYLES[link.status],
            )}
          >
            {STATUS_LABEL[link.status]}
          </span>
        )}

        {/* Hover-only actions: assign */}
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onAssignClick}
            title={detached ? "Assign to another task" : "Assign to task"}
            aria-label="Assign to task"
            className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-ink shadow-sm ring-1 ring-border transition-colors hover:bg-gold-pale/50 hover:text-gold"
          >
            <Link2 size={10} strokeWidth={1.8} />
            {detached ? "Reassign" : isStandalone ? "Assign" : "Move"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 font-serif text-[14px] leading-snug text-ink">
            {link.title}
          </h3>
          {total != null && (
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span
                className="font-mono text-[12px] font-semibold text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(total, link.currency)}
              </span>
              {isStore && leadWeeks != null && stock === "made_to_order" && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-sm bg-ivory-warm px-1 py-[1px] font-mono text-[9px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                  title="Lead time for this variant"
                >
                  <Clock size={8} strokeWidth={1.8} />
                  {leadWeeks}w lead
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isStore ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (link.vendorId) onVendorClick?.(link.vendorId);
              }}
              className="flex min-w-0 items-center gap-1.5 text-left"
              aria-label={`View ${link.vendorName} profile`}
            >
              <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-saffron/80">
                <Sparkles size={7} strokeWidth={2} className="text-ink" />
              </span>
              <span className="truncate font-mono text-[10px] text-ink-soft hover:text-gold">
                {link.vendorName ?? "Ananya"}
              </span>
              <span
                className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-ink-faint/70"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                · Ananya
              </span>
            </button>
          ) : (
            <>
              {link.faviconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.faviconUrl} alt="" className="h-3 w-3 rounded-sm" />
              )}
              <span
                className="truncate font-mono text-[10px] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {link.domain}
              </span>
              <span
                title="You saved this link"
                className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-gold/25 bg-gold-pale/30 px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.16em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Bookmark size={8} strokeWidth={2} />
                Saved by you
              </span>
            </>
          )}
          {link.quantity > 1 && (
            <span
              className="ml-auto shrink-0 font-mono text-[10px] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ×{link.quantity}
            </span>
          )}
        </div>

        {/* Native: variant selector inline */}
        {isStore && product && product.variants.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={link.variant?.variantId ?? ""}
              onChange={(e) =>
                onVariantChange?.(e.target.value === "" ? null : e.target.value)
              }
              className="w-full truncate rounded-md border border-border bg-ivory-warm/40 px-2 py-1 font-mono text-[10.5px] text-ink outline-none transition-colors focus:border-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <option value="">Select variant…</option>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.attribute}: {v.label}
                  {v.priceDelta ? ` (${v.priceDelta > 0 ? "+" : ""}${v.priceDelta})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {duplicateCount > 1 && (
          <div
            className="flex items-center gap-1 text-[10px] italic text-ink-faint"
            title="This URL is saved in multiple items across the wedding"
          >
            <Copy size={9} strokeWidth={1.6} />
            Saved {duplicateCount} times
          </div>
        )}

        {/* "Featured in [Guide]" — appears when a creator guide references
            this product. Self-hides for products with no guide mentions. */}
        {link.productId && (
          <div
            className="flex flex-wrap gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <FeaturedInBadge productId={link.productId} variant="compact" />
            <ExhibitionFeaturedBadge
              productId={link.productId}
              variant="compact"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <span
            className={cn(
              "truncate text-[10.5px] uppercase tracking-wider",
              moduleTitle ? "text-ink-faint" : "italic text-ink-faint/70",
            )}
          >
            {moduleTitle ?? "Unassigned"}
          </span>
          {taskTitle ? (
            <span className="max-w-[55%] truncate text-[10.5px] italic text-ink-muted">
              {taskTitle}
            </span>
          ) : (
            <span className="max-w-[55%] truncate text-[10.5px] italic text-ink-faint/60">
              {detached ? "task deleted" : "no task"}
            </span>
          )}
        </div>

        {/* Native-only footer: Checkout + cart toggle */}
        {isStore && link.status === "considering" && stock !== "sold_out" && (
          <div
            className="flex items-center gap-1.5 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onToggleCart}
              title={inCart ? "Remove from cart" : "Add to cart"}
              aria-label={inCart ? "Remove from cart" : "Add to cart"}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1 text-[10.5px] font-medium uppercase tracking-wider transition-colors",
                inCart
                  ? "border-saffron bg-saffron/15 text-ink"
                  : "border-ink bg-ink text-ivory hover:bg-ink/90",
              )}
            >
              <ShoppingCart size={11} strokeWidth={1.8} />
              {inCart ? "In Cart" : "Checkout"}
            </button>
          </div>
        )}
        {isStore && stock === "sold_out" && link.status === "considering" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="flex items-center justify-center gap-1 rounded-md border border-rose/40 bg-rose-pale/40 px-2 py-1 text-[10.5px] font-medium uppercase tracking-wider text-rose transition-colors hover:bg-rose-pale/60"
          >
            Notify Me
          </button>
        )}
        {isStore && link.status === "ordered" && link.etaDate && (
          <div
            className="flex items-center justify-between gap-1 border-t border-border/60 pt-1.5 font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="flex items-center gap-1">
              <Store size={9} strokeWidth={1.8} />
              {link.orderId}
            </span>
            <span>
              ETA {new Date(link.etaDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
