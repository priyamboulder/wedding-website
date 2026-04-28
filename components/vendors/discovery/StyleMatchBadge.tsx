"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MATCH_BAND_CLASS,
  MATCH_BAND_LABEL,
  matchBand,
} from "@/lib/vendors/style-matching";

export function StyleMatchBadge({
  score,
  size = "sm",
  showPercent = true,
}: {
  score: number;
  size?: "xs" | "sm" | "md";
  showPercent?: boolean;
}) {
  const band = matchBand(score);
  if (band === "weak") return null;
  const klass = MATCH_BAND_CLASS[band];
  const pct = Math.round(score * 100);

  return (
    <span
      title={`${MATCH_BAND_LABEL[band]} to your style`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-[0.12em]",
        klass.bg,
        klass.text,
        size === "xs" && "px-1.5 py-0.5 text-[8.5px]",
        size === "sm" && "px-2 py-0.5 text-[9.5px]",
        size === "md" && "px-2.5 py-1 text-[10.5px]",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Sparkles
        size={size === "xs" ? 8 : size === "sm" ? 9 : 10}
        strokeWidth={1.9}
      />
      {showPercent ? `${pct}% match` : MATCH_BAND_LABEL[band]}
    </span>
  );
}
