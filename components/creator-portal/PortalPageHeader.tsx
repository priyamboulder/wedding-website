"use client";

import type { ReactNode } from "react";

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-gold/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-serif text-[26px] leading-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PortalStatCard({
  label,
  value,
  trend,
  tone = "gold",
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: "gold" | "saffron" | "ink" | "sage" | "teal" | "rose";
}) {
  const TONES: Record<string, string> = {
    gold: "border-gold/30 bg-gold-pale/30",
    saffron: "border-saffron/30 bg-saffron/10",
    ink: "border-ink/15 bg-ivory-warm",
    sage: "border-sage/30 bg-sage-pale/40",
    teal: "border-teal/30 bg-teal-pale/40",
    rose: "border-rose/30 bg-rose/10",
  };

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border p-4 ${TONES[tone] ?? TONES.gold}`}
    >
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="font-serif text-[22px] leading-none text-ink">{value}</p>
      {trend && (
        <p className="text-[11.5px] text-ink-muted">{trend}</p>
      )}
    </div>
  );
}
