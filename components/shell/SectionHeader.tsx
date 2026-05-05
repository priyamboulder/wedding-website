"use client";

// ── SectionHeader ──────────────────────────────────────────────────────────
// Editorial section header used across the couple-side app as part of the
// warmth pass. Replaces the old all-caps mono section labels (PLANNING PHASES,
// NEXT MOVES, THE BRIEF · FOUNDATION, etc.) with a Fraunces title + an italic
// Inter subtitle that says, in one sentence, *why* this section matters.
//
// Sizing presets:
//   size="sm"  → 18px Fraunces — for sub-sections inside a larger surface
//   size="md"  → 22px Fraunces — module-level sections (default)
//   size="lg"  → 28px Fraunces — hero-adjacent or page-introducing sections
//
// The trailing slot (`action`) is meant for a single muted "Edit →" link or
// similar quiet affordance — keep it monochrome so it doesn't fight the title.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Optional trailing affordance (e.g. an "Edit" link). */
  action?: ReactNode;
  /** Hide the bottom rule for nested or stacked usage. */
  bare?: boolean;
  className?: string;
  id?: string;
}

const SIZE_CLASS: Record<NonNullable<SectionHeaderProps["size"]>, string> = {
  sm: "section-header--sm",
  md: "",
  lg: "section-header--lg",
};

export function SectionHeader({
  title,
  subtitle,
  size = "md",
  action,
  bare = false,
  className,
  id,
}: SectionHeaderProps) {
  return (
    <header
      id={id}
      className={cn(
        "section-header",
        SIZE_CLASS[size],
        bare && "border-0 mb-0 pb-0",
        action && "flex-row items-end justify-between gap-6",
        className,
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <h2 className="section-header__title">{title}</h2>
        {subtitle ? <p className="section-header__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0 self-end">{action}</div> : null}
    </header>
  );
}
