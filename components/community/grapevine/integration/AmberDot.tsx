"use client";

// ── Amber dot ───────────────────────────────────────────────────────────────
// Small informational marker for vendor cards (shortlist, Roulette). Warm
// amber, not red — the spec is explicit about not feeling alarmist.

import { cn } from "@/lib/utils";

export function AmberDot({
  count,
  className,
  title,
}: {
  count?: number;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-2 w-2 shrink-0 rounded-full bg-saffron shadow-[0_0_0_3px_rgba(217,159,76,0.18)]",
        className,
      )}
      aria-label={
        title ??
        (count ? `${count} discussions in the grapevine` : "discussed in the grapevine")
      }
      title={
        title ??
        (count ? `${count} discussions in the grapevine` : "discussed in the grapevine")
      }
    />
  );
}
