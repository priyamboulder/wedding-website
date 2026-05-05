"use client";

// ── ModuleHero ─────────────────────────────────────────────────────────────
// The editorial "first paragraph" at the top of every couple-side module.
// Modeled on the Studio and Community headers — a confident Fraunces title
// in lowercase and a single italic Inter sentence that orients the couple
// before the functional UI begins.
//
// Usage:
//   <ModuleHero
//     title="the planning circle."
//     subtitle="stories from the studio — and the brides figuring it out alongside you."
//   />
//
// The optional `eyebrow` slot is a small gold mono label (e.g. "Community",
// "Registry · Overview"). The optional `action` slot is for a quiet trailing
// link or share button. Layout assumes the parent constrains width — keep the
// hero close to the page's content column so the rule under the hero
// matches the column.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ModuleHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small gold-mono eyebrow above the title. */
  eyebrow?: ReactNode;
  /** Trailing affordance — share, copy-link, etc. */
  action?: ReactNode;
  /** Pull title size up for module-landing surfaces (Community / Studio). */
  size?: "md" | "lg";
  /** Drop the bottom hairline (use when a sub-nav follows immediately). */
  bare?: boolean;
  className?: string;
}

export function ModuleHero({
  title,
  subtitle,
  eyebrow,
  action,
  size = "md",
  bare = false,
  className,
}: ModuleHeroProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2",
        !bare && "border-b border-[color:var(--color-warm-border)] pb-7",
        className,
      )}
    >
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p
              className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "font-serif font-bold leading-[1.05] tracking-[-0.005em] text-ink",
              eyebrow ? "mt-2" : "",
              size === "lg" ? "text-[46px]" : "text-[36px]",
            )}
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-[640px] font-serif text-[17px] italic leading-snug text-ink-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 self-start">{action}</div> : null}
      </div>
    </header>
  );
}
