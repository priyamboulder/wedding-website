"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PopOutEmptyProps {
  /** Illustration or icon to display */
  illustration?: ReactNode;
  title: string;
  body?: string;
  /** Call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function PopOutEmpty({
  illustration,
  title,
  body,
  action,
  className,
}: PopOutEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 px-6 text-center",
        className,
      )}
    >
      {illustration && (
        <div className="mb-4 text-ink-faint/60">{illustration}</div>
      )}
      <h4 className="font-serif text-sm font-semibold text-ink-muted">
        {title}
      </h4>
      {body && (
        <p className="mt-1 text-[12px] text-ink-faint max-w-[260px] leading-relaxed">
          {body}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "mt-4 inline-flex items-center gap-1.5",
            "rounded-md bg-gold px-3.5 py-1.5",
            "text-xs font-serif font-medium text-ivory",
            "transition-colors hover:bg-gold-light",
          )}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
