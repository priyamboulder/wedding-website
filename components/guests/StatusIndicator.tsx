"use client";

import { cn } from "@/lib/utils";
import { Check, Clock, X, Minus } from "lucide-react";
import type { RsvpStatus } from "@/stores/rsvp-store";

interface StatusIndicatorProps {
  status: RsvpStatus | undefined; // undefined = not invited
  onClick?: () => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export function StatusIndicator({
  status,
  onClick,
  size = "md",
  ariaLabel,
}: StatusIndicatorProps) {
  const dims = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSize = size === "sm" ? 12 : 14;
  const interactive = typeof onClick === "function";

  const { bg, border, color, Icon, label } = styleFor(status);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive || status === undefined}
      aria-label={ariaLabel ?? label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition-all",
        dims,
        bg,
        border,
        color,
        interactive && status !== undefined
          ? "cursor-pointer hover:scale-110 active:scale-95"
          : "cursor-default",
      )}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.5} />}
    </button>
  );
}

function styleFor(status: RsvpStatus | undefined) {
  switch (status) {
    case "confirmed":
      return {
        bg: "bg-sage-pale",
        border: "border-sage",
        color: "text-sage",
        Icon: Check,
        label: "Confirmed",
      };
    case "pending":
      return {
        bg: "bg-saffron-pale",
        border: "border-saffron",
        color: "text-saffron",
        Icon: Clock,
        label: "Pending",
      };
    case "declined":
      return {
        bg: "bg-ivory-deep",
        border: "border-ink-faint/50",
        color: "text-ink-faint",
        Icon: X,
        label: "Declined",
      };
    default:
      return {
        bg: "bg-transparent",
        border: "border-border/50 border-dashed",
        color: "text-ink-faint/50",
        Icon: Minus,
        label: "Not invited",
      };
  }
}

export function StatusPill({ status }: { status: RsvpStatus | undefined }) {
  const { bg, color, label } = styleFor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]",
        bg,
        color,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}
