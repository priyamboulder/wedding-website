"use client";

import { Sparkles, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorTier } from "@/types/creator";

// ── TierBadge ─────────────────────────────────────────────────────────────
// Single source of truth for tier visualization across the app. Use next
// to every creator name where tier is relevant (cards, profiles, guides,
// drops, exhibitions, match results, featured sections).

const TIER_LABEL: Record<CreatorTier, string> = {
  standard: "Creator",
  rising: "Rising",
  top_creator: "Top Creator",
  partner: "Partner",
};

const TIER_STYLES: Record<CreatorTier, string> = {
  standard: "border-ink/15 bg-ivory-warm text-ink-muted",
  rising: "border-teal/30 bg-teal-pale/40 text-teal",
  top_creator: "border-gold/40 bg-gold-pale/50 text-gold",
  partner:
    "border-transparent bg-gradient-to-r from-ink to-gold text-ivory shadow-sm",
};

const TIER_ICON: Record<CreatorTier, typeof Sparkles> = {
  standard: Sparkles,
  rising: Sparkles,
  top_creator: Star,
  partner: Crown,
};

export function TierBadge({
  tier,
  size = "md",
  className,
  hideOnStandard = false,
}: {
  tier: CreatorTier;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  // Standard tier has no visible badge in some contexts (e.g. match cards
  // where space is tight). Opt in here.
  hideOnStandard?: boolean;
}) {
  if (hideOnStandard && tier === "standard") return null;

  const Icon = TIER_ICON[tier];
  const sizeClasses =
    size === "xs"
      ? "px-1.5 py-0.5 text-[8.5px] tracking-[0.16em]"
      : size === "sm"
        ? "px-2 py-0.5 text-[9px] tracking-[0.18em]"
        : size === "lg"
          ? "px-3 py-1 text-[11px] tracking-[0.2em]"
          : "px-2.5 py-0.5 text-[9.5px] tracking-[0.2em]";

  const iconSize = size === "xs" ? 8 : size === "lg" ? 11 : 9;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-mono uppercase",
        sizeClasses,
        TIER_STYLES[tier],
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={iconSize} strokeWidth={2} />
      {TIER_LABEL[tier]}
    </span>
  );
}
