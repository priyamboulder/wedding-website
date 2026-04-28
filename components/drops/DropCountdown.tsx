"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { dropTimeRemaining, dropTimeUntilStart } from "@/types/drop";

export function DropCountdown({
  startsAt,
  endsAt,
  variant = "compact",
}: {
  startsAt: string;
  endsAt: string;
  variant?: "compact" | "hero";
}) {
  const [, force] = useState(0);
  // Re-render once per minute so the countdown stays close to fresh.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const startsAtMs = new Date(startsAt).getTime();
  const isUpcoming = now < startsAtMs;
  const remaining = isUpcoming
    ? dropTimeUntilStart(startsAt)
    : dropTimeRemaining(endsAt);

  const sizeClass =
    variant === "hero"
      ? "text-[14px]"
      : "text-[11px]";
  const iconSize = variant === "hero" ? 14 : 11;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider ${sizeClass}`}
    >
      <Clock size={iconSize} strokeWidth={1.7} />
      {remaining.label}
    </span>
  );
}
