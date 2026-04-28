"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityState } from "@/types/vendor-discovery";
import {
  AVAILABILITY_CLASS,
  AVAILABILITY_LABEL,
} from "@/lib/vendors/availability";

export function AvailabilityChip({
  state,
  targetDateIso,
  size = "sm",
}: {
  state: AvailabilityState;
  targetDateIso: string | null;
  size?: "xs" | "sm" | "md";
}) {
  const klass = AVAILABILITY_CLASS[state];
  const label = AVAILABILITY_LABEL[state];

  const dateLabel = targetDateIso
    ? new Date(targetDateIso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <span
      title={dateLabel ? `${label} · ${dateLabel}` : label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-[0.12em]",
        klass.bg,
        klass.text,
        size === "xs" && "px-1.5 py-0.5 text-[8.5px]",
        size === "sm" && "px-2 py-0.5 text-[9.5px]",
        size === "md" && "px-2.5 py-1 text-[10.5px]",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", klass.dot)} />
      <Calendar
        size={size === "xs" ? 8 : size === "sm" ? 9 : 10}
        strokeWidth={1.8}
      />
      {label}
    </span>
  );
}
