"use client";

// ── Shared UI atoms for the Post-Wedding tabs ─────────────────────────────
// Small local building blocks co-located with the tabs. Mirrors the shapes
// from notes-ideas/ui.tsx and bachelorette modules so the whole workspace
// feels like one language.

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  description,
  right,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  const border = tone === "muted" ? "border-border/60" : "border-border";
  const bg = tone === "muted" ? "bg-ivory-warm/40" : "bg-white";
  return (
    <section className={cn("rounded-lg border p-5", border, bg)}>
      {(eyebrow || title || description || right) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className="mt-1 font-serif text-[18px] leading-snug text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
                {description}
              </p>
            )}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  type = "text",
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  type?: "text" | "number" | "date" | "email" | "url";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={cn(
        "w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none",
        className,
      )}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none",
        className,
      )}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ProgressBar({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="space-y-1.5">
      {label && (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label} — {done} of {total} ({pct}%)
        </p>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory-warm">
        <div
          className="h-full bg-saffron transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PillButton({
  active,
  onClick,
  children,
  disabled,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  children,
  size = "md",
  icon,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  size?: "sm" | "md";
  icon?: ReactNode;
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[12px]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-ink font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40",
        pad,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  disabled,
  children,
  size = "md",
  icon,
  tone = "default",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  size?: "sm" | "md";
  icon?: ReactNode;
  tone?: "default" | "danger";
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[12px]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-white font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        pad,
        tone === "danger"
          ? "text-rose hover:border-rose/40"
          : "text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/70 bg-ivory-warm/30 px-6 py-10 text-center">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Empty for now
      </p>
      <h4 className="font-serif text-[16px] leading-snug text-ink">{title}</h4>
      <p className="max-w-md text-[13px] leading-relaxed text-ink-muted">
        {body}
      </p>
      {action}
    </div>
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRupees(amount: number | null | undefined): string {
  if (amount == null) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Rough "due in N weeks" phrasing for the deliveries tab.
export function relativeDateLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const diffDays = Math.round((d - Date.now()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return `${-diffDays} day${diffDays === -1 ? "" : "s"} overdue`;
  if (diffDays === 0) return "due today";
  if (diffDays < 7) return `due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  const weeks = Math.round(diffDays / 7);
  return `due in ${weeks} week${weeks === 1 ? "" : "s"}`;
}
