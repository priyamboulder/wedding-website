"use client";

// ── Reaction buttons (Love / Not for me) ───────────────────────────────────
// Shared across the cake inspiration gallery, mithai browse catalog, and
// dessert preference quiz. Matches the Venue + Mehendi LOVE/dismiss pattern.

import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DessertReaction } from "@/lib/cake-sweets-seed";

const MONO_FAMILY = "var(--font-mono)";

export function ReactionButtons({
  reaction,
  onReact,
  size = "sm",
  loveLabel = "Love it",
  rejectLabel = "Not for me",
}: {
  reaction: DessertReaction | undefined;
  onReact: (r: DessertReaction) => void;
  size?: "xs" | "sm";
  loveLabel?: string;
  rejectLabel?: string;
}) {
  const padding = size === "xs" ? "px-2 py-0.5" : "px-2.5 py-1";
  const text = size === "xs" ? "text-[9px]" : "text-[10px]";
  const iconSize = size === "xs" ? 10 : 11;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onReact("love")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1 rounded-full border font-mono uppercase tracking-[0.06em] transition-colors",
          padding,
          text,
          reaction === "love"
            ? "border-rose bg-rose text-ivory"
            : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
        )}
        style={{ fontFamily: MONO_FAMILY }}
      >
        <Heart
          size={iconSize}
          strokeWidth={1.8}
          className={reaction === "love" ? "fill-ivory" : ""}
        />
        {loveLabel}
      </button>
      <button
        type="button"
        onClick={() => onReact("not_this")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1 rounded-full border font-mono uppercase tracking-[0.06em] transition-colors",
          padding,
          text,
          reaction === "not_this"
            ? "border-ink bg-ink text-ivory"
            : "border-border bg-white text-ink-muted hover:border-ink",
        )}
        style={{ fontFamily: MONO_FAMILY }}
      >
        <X size={iconSize} strokeWidth={1.8} />
        {rejectLabel}
      </button>
    </div>
  );
}
