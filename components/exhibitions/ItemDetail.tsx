"use client";

import { useEffect } from "react";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import { GradientCover } from "./primitives";
import { InquiryForm } from "./InquiryForm";

export function ItemDetail({
  itemId,
  exhibitionId,
  onClose,
  boothName,
}: {
  itemId: string | null;
  exhibitionId: string;
  onClose: () => void;
  boothName: string;
}) {
  const item = useExhibitionsStore((s) =>
    itemId ? s.getItem(itemId) : undefined,
  );
  const exhibitor = useExhibitionsStore((s) =>
    item ? s.getExhibitor(item.exhibitor_id) : undefined,
  );
  const saved = useExhibitionsStore((s) =>
    itemId ? s.isSaved(itemId) : false,
  );
  const toggleSaved = useExhibitionsStore((s) => s.toggleSaved);

  useEffect(() => {
    if (!itemId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [itemId, onClose]);

  useEffect(() => {
    if (!itemId) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [itemId]);

  if (!itemId || !item || !exhibitor) return null;

  const showCrossedOut =
    item.original_price_cents &&
    item.exhibition_price_cents &&
    item.original_price_cents > item.exhibition_price_cents;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex-1 bg-ink/40 backdrop-blur-sm transition-opacity"
      />
      <aside className="flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/10 bg-white px-5 py-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {exhibitor.booth_name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <GradientCover
          gradient={item.image_gradient}
          label={item.name}
          ratio="3/4"
        />

        <div className="flex flex-col gap-5 px-5 py-6">
          <div>
            <h2 className="font-serif text-[26px] leading-tight text-ink">
              {item.name}
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              by {exhibitor.external_name}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[22px] text-ink">
              {item.price_display ?? "—"}
            </span>
            {showCrossedOut && (
              <span className="text-[13px] text-ink-faint line-through">
                ₹{(item.original_price_cents! / 100).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {item.is_exhibition_exclusive && (
              <Badge tone="gold">Exhibition Exclusive</Badge>
            )}
            {item.is_limited_edition && (
              <Badge tone="rose">Limited Edition</Badge>
            )}
            {item.is_new_launch && <Badge tone="sage">New Launch</Badge>}
            {item.quantity_available != null && (
              <Badge tone="ink">Only {item.quantity_available} available</Badge>
            )}
          </div>

          {item.description && (
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              {item.description}
            </p>
          )}

          {item.tags.length > 0 && (
            <p
              className="font-mono text-[10.5px] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {item.tags.map((t) => `#${t}`).join("  ·  ")}
            </p>
          )}

          <div className="flex flex-col gap-2 border-y border-gold/10 py-4">
            <button
              type="button"
              onClick={() =>
                toggleSaved({
                  item_id: item.id,
                  exhibitor_id: item.exhibitor_id,
                  exhibition_id: exhibitionId,
                })
              }
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                saved
                  ? "border-rose/40 bg-rose-pale/40 text-rose"
                  : "border-gold/25 bg-white text-ink-muted hover:border-gold/40 hover:bg-gold-pale/30 hover:text-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Heart
                size={12}
                strokeWidth={1.8}
                fill={saved ? "currentColor" : "none"}
              />
              {saved ? "Saved to wishlist" : "Save to wishlist"}
            </button>
          </div>

          <div>
            <p
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Inquire about this piece
            </p>
            <InquiryForm
              exhibitionId={exhibitionId}
              exhibitorId={exhibitor.id}
              itemId={item.id}
              boothName={exhibitor.booth_name}
              defaultMessage={`I love the ${item.name} — `}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "gold" | "rose" | "sage" | "teal" | "ink";
}) {
  const map = {
    gold: "border-gold/30 bg-gold-pale/40 text-gold",
    rose: "border-rose/30 bg-rose-pale/40 text-rose",
    sage: "border-sage/30 bg-sage-pale/50 text-sage",
    teal: "border-teal/30 bg-teal-pale/50 text-teal",
    ink: "border-ink/15 bg-ivory-warm text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em]",
        map[tone],
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
