"use client";

// ── Score slider (0.0–9.9) ────────────────────────────────────────────────
// The hero element of the One Look form. Large editorial score number on top,
// slim slider underneath. Tone shifts between warm / neutral / cool based on
// the score, matching the score badge tone used on the vendor storefront.

import { cn } from "@/lib/utils";
import { normalizeScore, scoreTone } from "@/types/one-look";

const SCORE_BG: Record<"warm" | "neutral" | "cool", string> = {
  warm: "bg-gold-pale/40 ring-gold/40",
  neutral: "bg-ivory-warm ring-border",
  cool: "bg-stone-100 ring-stone-300",
};

const SCORE_FG: Record<"warm" | "neutral" | "cool", string> = {
  warm: "text-ink",
  neutral: "text-ink",
  cool: "text-ink-muted",
};

export function ScoreSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const tone = scoreTone(value);
  const display = value.toFixed(1);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "mx-auto flex aspect-square max-w-[220px] flex-col items-center justify-center rounded-full ring-1 transition-colors",
          SCORE_BG[tone],
        )}
      >
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          your score
        </p>
        <p
          className={cn(
            "mt-1 font-serif text-[88px] leading-none tracking-[-0.02em]",
            SCORE_FG[tone],
          )}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {display}
        </p>
      </div>
      <div className="space-y-1.5">
        <input
          type="range"
          min={0}
          max={99}
          step={1}
          value={Math.round(value * 10)}
          onChange={(e) => onChange(normalizeScore(Number(e.target.value) / 10))}
          aria-label="Score"
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ivory-deep",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-ink",
          )}
        />
        <div
          className="flex justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>0.0</span>
          <span>9.9</span>
        </div>
      </div>
    </div>
  );
}
