// ── EditorialInput ──────────────────────────────────────────────────────────
// Bottom-border-only inputs and textareas, in Cormorant Garamond, with a
// gold underline on focus. Used across the basics form and inside blocks.

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const EditorialInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { display?: boolean }
>(function EditorialInput({ className, display, ...rest }, ref) {
  return (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "w-full border-b bg-transparent pb-1.5 pt-2 text-ink outline-none transition-colors placeholder:text-ink-faint",
        "border-warm-border focus:border-gold",
        display
          ? "text-[26px] leading-tight md:text-[30px]"
          : "text-[16px]",
        className,
      )}
      style={{
        fontFamily: display ? "var(--font-display)" : "var(--font-sans)",
        ...((rest.style as object) ?? {}),
      }}
    />
  );
});

export const EditorialTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function EditorialTextarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={cn(
        "w-full resize-y rounded-md border bg-white/60 p-3 text-[14.5px] leading-[1.6] text-ink outline-none transition-colors placeholder:italic placeholder:text-ink-faint",
        "border-warm-border focus:border-gold/60",
        className,
      )}
      style={{ fontFamily: "var(--font-sans)" }}
    />
  );
});

export function EditorialLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {children}
      </span>
      {hint && (
        <span
          className="text-[12px] italic text-ink-muted"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
