"use client";

// Circular avatar for community profiles. Shows the uploaded photo when
// present, otherwise the first initial on a deterministic warm palette.

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#B8755D", // terracotta
  "#A0806B", // taupe
  "#6E6354", // olive
  "#8A5444", // henna
  "#5C463A", // chai
  "#B8860B", // gold
  "#9C6F5D", // rose
  "#3A4452", // slate
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function BrideAvatar({
  name,
  src,
  size = 48,
  className,
  style,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  const bg = colorFor(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        ...style,
      }}
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="font-serif text-white"
          style={{
            fontSize: Math.max(14, Math.round(size * 0.42)),
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}
