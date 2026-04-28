"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PopOutSectionProps {
  title: string;
  icon?: ReactNode;
  helperText?: string;
  /** Hide the gold rule below the title */
  noRule?: boolean;
  className?: string;
  children: ReactNode;
}

export function PopOutSection({
  title,
  icon,
  helperText,
  noRule = false,
  className,
  children,
}: PopOutSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {/* Title row */}
      <div>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-ink-muted flex-shrink-0">{icon}</span>
          )}
          <h3 className="font-serif text-sm font-semibold text-ink-soft tracking-wide">
            {title}
          </h3>
        </div>
        {helperText && (
          <p className="text-[11px] text-ink-faint mt-0.5 pl-0.5">
            {helperText}
          </p>
        )}
        {!noRule && (
          <div className="mt-2 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}
