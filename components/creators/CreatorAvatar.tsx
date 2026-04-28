"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";

const SIZE_CLASS = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-[13px]",
  lg: "h-14 w-14 text-[16px]",
  xl: "h-20 w-20 text-[22px]",
} as const;

const BADGE_SIZE = {
  xs: 9,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
} as const;

export function CreatorAvatar({
  creator,
  size = "md",
  withBadge = true,
  className,
}: {
  creator: Pick<Creator, "displayName" | "avatarUrl" | "avatarGradient" | "isVerified">;
  size?: keyof typeof SIZE_CLASS;
  withBadge?: boolean;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = creator.displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/25 font-serif text-ink",
        SIZE_CLASS[size],
        className,
      )}
      style={{
        background: creator.avatarUrl && !imgError ? undefined : creator.avatarGradient,
      }}
    >
      {creator.avatarUrl && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creator.avatarUrl}
          alt={creator.displayName}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
      {withBadge && creator.isVerified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white text-gold shadow-sm"
          aria-label="Verified creator"
        >
          <BadgeCheck size={BADGE_SIZE[size]} strokeWidth={1.8} />
        </span>
      )}
    </span>
  );
}

export function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
