"use client";

import { cn } from "@/lib/utils";

const PALETTE = [
  { bg: "#F0E4C8", fg: "#8A6410" },
  { bg: "#F5E6C8", fg: "#8A6410" },
  { bg: "#E8F0E0", fg: "#4F6B3F" },
  { bg: "#F5E0D6", fg: "#8A3E28" },
  { bg: "#DCE9E7", fg: "#2F5B58" },
];

function pickPalette(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Monogram({
  name,
  size = 72,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const { bg, fg } = pickPalette(name);
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-serif font-semibold",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: fg,
        fontSize: size * 0.42,
        letterSpacing: "-0.01em",
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
