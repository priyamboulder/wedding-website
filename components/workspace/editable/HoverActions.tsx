"use client";

// ── HoverActions ────────────────────────────────────────────────────────────
// Container + action slot pattern. Actions fade in on hover/focus; hidden
// otherwise so the page reads calm when the user isn't actively working.
//
// Usage:
//   <HoverRow>
//     <HoverRow.Main>…content…</HoverRow.Main>
//     <HoverRow.Actions>
//       <IconButton onClick={edit}><Pencil /></IconButton>
//       <IconButton onClick={del}><Trash /></IconButton>
//     </HoverRow.Actions>
//   </HoverRow>

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface HoverRowProps {
  children?: ReactNode;
  className?: string;
}

function HoverRowRoot({ children, className }: HoverRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Main({ children, className }: HoverRowProps) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

function Actions({ children, className }: HoverRowProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const HoverRow = Object.assign(HoverRowRoot, { Main, Actions });

// ── Small icon button ──────────────────────────────────────────────────────

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;              // aria-label; required so actions are accessible
  tone?: "ink" | "rose" | "saffron";
}

export function IconButton({
  label,
  tone = "ink",
  className,
  children,
  ...rest
}: IconButtonProps) {
  const toneClass = {
    ink: "text-ink-faint hover:text-ink hover:bg-ivory-warm",
    rose: "text-ink-faint hover:text-rose hover:bg-rose-pale/40",
    saffron: "text-ink-faint hover:text-saffron hover:bg-saffron-pale/40",
  }[tone];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-sm transition-colors",
        toneClass,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
