"use client";

// ── SectionShell + SectionHead ────────────────────────────────────────────
// The canonical editorial section header used by every workspace module.
// Renders the 3-tier pattern that Décor & Florals uses as its reference:
//
//   · gold mono eyebrow (10px, 0.18em tracking)
//   · Cormorant Garamond title (default 22px, medium weight)
//   · muted sans description (13px, ink-muted)
//   · 1px soft-ink bottom divider
//   · optional right-aligned slot for buttons/controls
//
// Prefer this over ad-hoc <h2>/<h3> + <p> pairs in tab files so the
// editorial rhythm stays identical across Stationery, HMUA, Photography,
// Videography, Catering, Music, Venue, Mehendi, Pandit, Cake, Wardrobe,
// Jewelry, Transportation, Travel, Gifting, and Events.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const DISPLAY_FAMILY = "var(--font-display)";
const MONO_FAMILY = "var(--font-mono)";

export function SectionShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={className}>{children}</section>;
}

interface SectionHeadProps {
  title: string;
  eyebrow?: string;
  /** Description / hint line beneath the title. Both `hint` and
   *  `description` are accepted — `description` is preferred in new code. */
  hint?: string;
  description?: string;
  right?: ReactNode;
  /** 22px is the canonical Décor size; 24/26 bump the heading when a
   *  section is the page's primary centerpiece. */
  titleSize?: 22 | 24 | 26;
  /** When true, drops the thin bottom divider — use for the first
   *  section under a page title where the divider would feel heavy. */
  bare?: boolean;
}

export function SectionHead({
  title,
  eyebrow,
  hint,
  description,
  right,
  titleSize = 22,
  bare = false,
}: SectionHeadProps) {
  const body = description ?? hint;
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        bare ? "mb-4" : "mb-[18px] border-b border-ink/[0.04] pb-2.5",
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div
            className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: MONO_FAMILY }}
          >
            {eyebrow}
          </div>
        )}
        <h3
          className={cn(
            "m-0 font-bold leading-[1.15] text-ink",
            titleSize === 26
              ? "text-[26px]"
              : titleSize === 24
                ? "text-[24px]"
                : "text-[22px]",
          )}
          style={{
            fontFamily: DISPLAY_FAMILY,
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </h3>
        {body && (
          <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
            {body}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
