"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── PopOutGrid ──────────────────────────────────────────────────────────────

interface PopOutGridProps {
  /** Number of columns (responsive: stacks to 1 col on mobile) */
  cols?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const colClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function PopOutGrid({
  cols = 3,
  gap = "md",
  className,
  children,
}: PopOutGridProps) {
  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// ── PopOutCard ──────────────────────────────────────────────────────────────

interface PopOutCardProps {
  title?: string;
  /** Make the card interactive (hover lift + pointer) */
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export function PopOutCard({
  title,
  interactive = false,
  onClick,
  className,
  children,
}: PopOutCardProps) {
  const Component = interactive || onClick ? "button" : "div";

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-ivory-warm/60 p-4 text-left",
        "transition-all duration-150",
        (interactive || onClick) && [
          "cursor-pointer",
          "hover:border-gold/30 hover:shadow-sm hover:-translate-y-0.5",
          "active:translate-y-0",
        ],
        className,
      )}
    >
      {title && (
        <h4 className="font-serif text-sm font-semibold text-ink-soft mb-2">
          {title}
        </h4>
      )}
      {children}
    </Component>
  );
}
