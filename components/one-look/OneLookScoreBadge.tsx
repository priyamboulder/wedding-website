"use client";

// ── Aggregate score badge ────────────────────────────────────────────────
// Displayed next to the existing star rating on a vendor storefront. Shows
// average One Look score if there are at least MIN_LOOKS published;
// otherwise shows a "be the first" prompt so brides know the format exists.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { scoreTone } from "@/types/one-look";
import { useOneLookStore } from "@/stores/one-look-store";

const MIN_LOOKS = 3;

const TONE_STYLES: Record<"warm" | "neutral" | "cool", string> = {
  warm: "bg-gold-pale/70 ring-gold/40 text-ink",
  neutral: "bg-ivory-warm ring-border text-ink",
  cool: "bg-stone-100 ring-stone-300 text-ink-muted",
};

export function OneLookScoreBadge({
  coordinationVendorId,
  platformVendorId,
  compact = false,
}: {
  coordinationVendorId?: string | null;
  platformVendorId?: string | null;
  compact?: boolean;
}) {
  const allReviews = useOneLookStore((s) => s.reviews);
  const reviews = useMemo(
    () =>
      allReviews.filter(
        (r) =>
          r.status === "published" &&
          ((coordinationVendorId && r.coordinationVendorId === coordinationVendorId) ||
            (platformVendorId && r.platformVendorId === platformVendorId)),
      ),
    [allReviews, coordinationVendorId, platformVendorId],
  );

  if (reviews.length < MIN_LOOKS) {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center justify-center rounded-lg bg-ivory-warm ring-1 ring-border",
          compact ? "px-3 py-2" : "px-4 py-3",
        )}
      >
        <p
          className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          one look
        </p>
        <p
          className={cn(
            "mt-1 font-serif text-ink-muted",
            compact ? "text-[14px]" : "text-[16px]",
          )}
        >
          be the first
        </p>
      </div>
    );
  }

  const avg =
    Math.round((reviews.reduce((a, r) => a + r.score, 0) / reviews.length) * 10) / 10;
  const tone = scoreTone(avg);

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center rounded-lg ring-1",
        TONE_STYLES[tone],
        compact ? "px-3 py-2" : "px-4 py-3",
      )}
    >
      <p
        className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        one look
      </p>
      <p
        className={cn(
          "font-serif leading-none tracking-[-0.01em]",
          compact ? "text-[26px]" : "text-[34px]",
        )}
      >
        {avg.toFixed(1)}
      </p>
      <p
        className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {reviews.length} looks
      </p>
    </div>
  );
}
