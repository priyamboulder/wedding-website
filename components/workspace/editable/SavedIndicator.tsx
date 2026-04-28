"use client";

// ── SavedIndicator ──────────────────────────────────────────────────────────
// Small "saved just now" badge that fades in when a value recently changed
// and stays visible long enough to reassure, then fades to an ambient
// relative timestamp. Gives users confidence changes stuck without any Save
// buttons.

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SavedIndicatorProps {
  // ISO timestamp of the last save. When this changes, the "saved" pulse fires.
  updatedAt: string | null | undefined;
  // Consider updatedAt within the last N ms as "just saved" and show a
  // stronger green state. Default 4 s.
  recentWindowMs?: number;
  className?: string;
}

export function SavedIndicator({
  updatedAt,
  recentWindowMs = 4000,
  className,
}: SavedIndicatorProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!updatedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [updatedAt]);

  const info = useMemo(() => {
    if (!updatedAt) return null;
    const ts = new Date(updatedAt).getTime();
    if (Number.isNaN(ts)) return null;
    const elapsed = now - ts;
    return { ts, elapsed };
  }, [updatedAt, now]);

  if (!info) return null;

  const isRecent = info.elapsed <= recentWindowMs;
  const label = isRecent
    ? "Saved"
    : relativeAgo(info.elapsed);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em]",
        isRecent ? "text-sage" : "text-ink-faint",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-live="polite"
    >
      {isRecent && <Check size={10} strokeWidth={2.5} />}
      {label}
    </span>
  );
}

function relativeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return "Saved just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `Saved ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Saved ${h}h ago`;
  const d = Math.floor(h / 24);
  return `Saved ${d}d ago`;
}
