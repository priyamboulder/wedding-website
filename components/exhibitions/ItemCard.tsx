"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExhibitionItem } from "@/types/exhibition";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import { GradientCover } from "./primitives";

export function ItemCard({
  item,
  exhibitionId,
  onOpen,
  disableSave = false,
}: {
  item: ExhibitionItem;
  exhibitionId: string;
  onOpen: (itemId: string) => void;
  disableSave?: boolean;
}) {
  const saved = useExhibitionsStore((s) => s.isSaved(item.id));
  const toggleSaved = useExhibitionsStore((s) => s.toggleSaved);

  const flags: string[] = [];
  if (item.is_exhibition_exclusive) flags.push("Exclusive");
  if (item.is_limited_edition) flags.push("Limited Edition");
  if (item.is_new_launch) flags.push("New Launch");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-white transition-all hover:border-gold/35 hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="block text-left"
        aria-label={`View ${item.name}`}
      >
        <GradientCover
          gradient={item.image_gradient}
          label={item.name}
          sublabel={item.item_type}
          ratio="4/5"
        />
      </button>

      {!disableSave && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaved({
              item_id: item.id,
              exhibitor_id: item.exhibitor_id,
              exhibition_id: exhibitionId,
            });
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className={cn(
            "absolute right-3 top-3 rounded-full border bg-white/95 p-2 backdrop-blur transition-all",
            saved
              ? "border-rose/40 text-rose"
              : "border-ink/10 text-ink-faint hover:border-rose/40 hover:text-rose",
          )}
        >
          <Heart size={13} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="font-serif text-[15px] leading-tight text-ink line-clamp-2">
          {item.name}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[14px] text-ink">
            {item.price_display ?? "—"}
          </span>
          {item.original_price_cents &&
            item.exhibition_price_cents &&
            item.original_price_cents > item.exhibition_price_cents && (
              <span className="text-[11px] text-ink-faint line-through">
                ₹{(item.original_price_cents / 100).toLocaleString("en-IN")}
              </span>
            )}
        </div>
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flags.map((f) => (
              <span
                key={f}
                className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                · {f}
              </span>
            ))}
          </div>
        )}
        {item.quantity_available != null && item.quantity_available <= 5 && (
          <p
            className="mt-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Only {item.quantity_available} available
          </p>
        )}
      </div>
    </div>
  );
}
