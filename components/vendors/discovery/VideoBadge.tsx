"use client";

import { Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoBadgeState } from "@/types/vendor-discovery";

export function VideoBadge({
  state,
  size = "sm",
}: {
  state: VideoBadgeState;
  size?: "xs" | "sm" | "md";
}) {
  if (state === "none") return null;

  const earned = state === "earned";

  return (
    <span
      title={
        earned
          ? "Video Profile — intro video + 2+ portfolio reels"
          : "Video in progress"
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-[0.14em]",
        earned
          ? "bg-ink text-ivory"
          : "bg-ivory-warm text-ink-muted ring-1 ring-inset ring-border",
        size === "xs" && "px-1.5 py-0.5 text-[8.5px]",
        size === "sm" && "px-2 py-0.5 text-[9.5px]",
        size === "md" && "px-2.5 py-1 text-[10.5px]",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Film
        size={size === "xs" ? 8 : size === "sm" ? 9 : 11}
        strokeWidth={earned ? 2.2 : 1.8}
      />
      {earned ? "Video Profile" : "Video"}
    </span>
  );
}
