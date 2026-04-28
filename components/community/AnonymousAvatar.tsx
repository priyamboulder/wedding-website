"use client";

// Colored circle with a subtle flower glyph — stands in for the real
// avatar on anonymous posts. Color is seeded per-thread so the same
// anonymous bride reads consistently within one conversation.

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function AnonymousAvatar({
  color,
  size = 28,
  className,
  style,
}: {
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center rounded-full text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        ...style,
      }}
      aria-label="anonymous"
    >
      <span
        aria-hidden
        className="font-serif"
        style={{ fontSize: Math.max(11, Math.round(size * 0.5)), lineHeight: 1 }}
      >
        ✿
      </span>
    </span>
  );
}
