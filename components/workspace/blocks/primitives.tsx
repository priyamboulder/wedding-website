"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Shared Workspace primitives used by both the couple-side /workspace canvas
// and the vendor-side /vendors/[id] Workspace tab.
//
// Editorial gold standard: Décor & Florals. Every informational section
// renders as the 3-tier pattern —
//   gold uppercase eyebrow → Cormorant Garamond title → muted description
// with no visible card border or shadow. Use variant="card" ONLY for
// genuinely interactive CTA cards (e.g. the quiz entry banner) where a
// warm background is intentional.

const DISPLAY_FAMILY = "var(--font-display)";
const MONO_FAMILY = "var(--font-mono)";

export function PanelCard({
  icon,
  eyebrow,
  title,
  description,
  badge,
  children,
  className,
  variant = "flat",
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  /** "flat" (default) = borderless editorial section. "card" = opt-in
   *  warm bordered wrapper for interactive CTA panels. */
  variant?: "flat" | "card";
}) {
  if (variant === "card") {
    return (
      <section
        className={cn(
          "rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]",
          className,
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
                {icon}
              </span>
            )}
            <h4
              className="m-0 font-bold leading-tight tracking-tight text-ink"
              style={{ fontFamily: DISPLAY_FAMILY, fontSize: 20 }}
            >
              {title}
            </h4>
          </div>
          {badge}
        </header>
        <div className="pt-4">{children}</div>
      </section>
    );
  }

  // Flat / editorial variant — the default. Matches Décor & Florals:
  // gold eyebrow → Cormorant title → muted description → thin divider.
  return (
    <section className={cn("editorial-section", className)}>
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: MONO_FAMILY }}
            >
              {eyebrow}
            </p>
          )}
          <h3
            className={cn(
              "font-bold leading-[1.15] text-ink",
              eyebrow ? "mt-1.5" : "mt-0",
              "mb-0 text-[22px]",
            )}
            style={{ fontFamily: DISPLAY_FAMILY, letterSpacing: "-0.005em" }}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </header>
      <div className="pt-1">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p
            className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: MONO_FAMILY }}
          >
            {eyebrow}
          </p>
        )}
        <h3
          className={cn(
            "font-bold leading-[1.15] text-ink",
            eyebrow ? "mt-1.5" : "mt-0",
            "text-[22px]",
          )}
          style={{ fontFamily: DISPLAY_FAMILY, letterSpacing: "-0.005em" }}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {right}
    </header>
  );
}

export function Tag({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "saffron" | "sage" | "rose" | "amber" | "stone";
}) {
  const toneClass = {
    ink: "bg-ivory-warm text-ink-muted",
    saffron: "bg-saffron-pale/60 text-saffron",
    sage: "bg-sage-pale/60 text-sage",
    rose: "bg-rose-pale/60 text-rose",
    amber: "border border-amber-400 bg-amber-50 text-amber-700",
    stone: "border border-stone-300 bg-stone-50 text-stone-600",
  }[tone];
  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
        toneClass,
      )}
      style={{ fontFamily: MONO_FAMILY }}
    >
      {children}
    </span>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <p className="py-2 text-[12px] italic text-ink-faint">{children}</p>
  );
}

export function MiniStat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ink" | "saffron" | "sage" | "rose";
}) {
  const toneClass = {
    ink: "text-ink",
    saffron: "text-saffron",
    sage: "text-sage",
    rose: "text-rose",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2.5">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: MONO_FAMILY }}
      >
        {label}
      </p>
      <p
        className={cn("mt-1 text-[22px] leading-none", toneClass)}
        style={{ fontFamily: DISPLAY_FAMILY }}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[10.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

// Small-caps label used across Workspace for section eyebrows / field labels.
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.14em] text-stone-500",
        className,
      )}
      style={{ fontFamily: MONO_FAMILY }}
    >
      {children}
    </p>
  );
}
