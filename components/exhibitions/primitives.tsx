"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Exhibition, Exhibitor } from "@/types/exhibition";

// ── Eyebrow: "── label ──" editorial small-caps header ────────────────────

export function Eyebrow({
  children,
  className,
  rule = true,
}: {
  children: React.ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {rule && <span aria-hidden className="h-px w-6 bg-ink/15" />}
      <span>{children}</span>
      {rule && <span aria-hidden className="h-px flex-1 bg-ink/10" />}
    </div>
  );
}

// ── StatusChip: LIVE / UPCOMING / ENDED ───────────────────────────────────

export function StatusChip({
  status,
  className,
}: {
  status: Exhibition["status"];
  className?: string;
}) {
  const map = {
    live: { label: "Live Now", dot: "bg-rose", border: "border-rose/30", bg: "bg-rose-pale/40", text: "text-rose" },
    upcoming: { label: "Upcoming", dot: "bg-teal", border: "border-teal/30", bg: "bg-teal-pale/40", text: "text-teal" },
    ended: { label: "Ended", dot: "bg-ink-faint", border: "border-ink/10", bg: "bg-ivory-warm", text: "text-ink-muted" },
    draft: { label: "Draft", dot: "bg-ink-faint", border: "border-ink/10", bg: "bg-ivory-warm", text: "text-ink-muted" },
    preview: { label: "Preview", dot: "bg-ink-faint", border: "border-ink/10", bg: "bg-ivory-warm", text: "text-ink-muted" },
    archived: { label: "Archived", dot: "bg-ink-faint", border: "border-ink/10", bg: "bg-ivory-warm", text: "text-ink-muted" },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em]",
        s.border,
        s.bg,
        s.text,
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status === "live" && (
        <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", s.dot)} aria-hidden />
      )}
      {s.label}
    </span>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────

function diffParts(target: Date) {
  const now = new Date();
  let ms = target.getTime() - now.getTime();
  const sign = ms < 0 ? -1 : 1;
  ms = Math.abs(ms);
  const d = Math.floor(ms / 86_400_000);
  ms -= d * 86_400_000;
  const h = Math.floor(ms / 3_600_000);
  ms -= h * 3_600_000;
  const m = Math.floor(ms / 60_000);
  return { d, h, m, past: sign < 0 };
}

export function Countdown({
  target,
  label,
  className,
}: {
  target: string;
  label: string;
  className?: string;
}) {
  const [parts, setParts] = useState(() => diffParts(new Date(target)));
  useEffect(() => {
    const id = setInterval(
      () => setParts(diffParts(new Date(target))),
      60_000,
    );
    return () => clearInterval(id);
  }, [target]);

  if (parts.past) return null;

  const pieces: string[] = [];
  if (parts.d > 0) pieces.push(`${parts.d} day${parts.d === 1 ? "" : "s"}`);
  if (parts.h > 0 || parts.d > 0)
    pieces.push(`${parts.h} hour${parts.h === 1 ? "" : "s"}`);
  if (parts.d === 0)
    pieces.push(`${parts.m} minute${parts.m === 1 ? "" : "s"}`);

  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      — {label} {pieces.join(", ")} —
    </p>
  );
}

// ── Feature badges for exhibitors ──────────────────────────────────────────

export function FeatureBadges({ exhibitor, size = "sm" }: { exhibitor: Exhibitor; size?: "sm" | "md" }) {
  const items: { label: string; tone: string }[] = [];
  if (exhibitor.has_new_collection)
    items.push({ label: "New Collection", tone: "bg-sage-pale/60 border-sage/25 text-sage" });
  if (exhibitor.has_exclusive_pricing)
    items.push({ label: "Exhibition Pricing", tone: "bg-gold-pale/40 border-gold/25 text-gold" });
  if (exhibitor.has_limited_edition)
    items.push({ label: "Limited Edition", tone: "bg-rose-pale/40 border-rose/25 text-rose" });
  if (exhibitor.offers_virtual_appointment)
    items.push({ label: "Virtual Appointment", tone: "bg-teal-pale/50 border-teal/25 text-teal" });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((b) => (
        <span
          key={b.label}
          className={cn(
            "inline-flex items-center rounded-full border font-mono uppercase tracking-[0.18em]",
            b.tone,
            size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ── Gradient cover ────────────────────────────────────────────────────────
// Used as a visually-rich placeholder until real images are loaded. Accepts
// an optional overlay (brand name / booth name rendered in serif).

export function GradientCover({
  gradient,
  label,
  sublabel,
  className,
  children,
  ratio = "16/9",
}: {
  gradient?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  children?: React.ReactNode;
  ratio?: "16/9" | "21/9" | "4/5" | "1/1" | "3/4";
}) {
  const fallback =
    "linear-gradient(135deg, #F0E4C8 0%, #D4A843 50%, #B8860B 100%)";
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        className,
      )}
      style={{
        background: gradient ?? fallback,
        aspectRatio: ratio,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 40%), linear-gradient(180deg, rgba(26,26,26,0) 55%, rgba(26,26,26,0.35) 100%)",
        }}
      />
      {(label || sublabel) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-ivory">
          {sublabel && (
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] opacity-80"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {sublabel}
            </span>
          )}
          {label && (
            <span className="font-serif text-[18px] leading-tight tracking-tight">
              {label}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Formatted date range ──────────────────────────────────────────────────

export function formatDateRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const monthFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const yearFmt: Intl.DateTimeFormatOptions = { year: "numeric" };
  if (sameMonth) {
    return `${s.toLocaleDateString("en-US", { month: "short" })} ${s.getDate()}–${e.getDate()}, ${s.toLocaleDateString("en-US", yearFmt)}`;
  }
  return `${s.toLocaleDateString("en-US", monthFmt)} – ${e.toLocaleDateString("en-US", monthFmt)}, ${e.toLocaleDateString("en-US", yearFmt)}`;
}
