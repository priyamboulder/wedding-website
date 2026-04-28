"use client";

// ── Shared UI atoms for Bachelor tabs ──────────────────────────────────────
// Small building blocks the six tabs share — eyebrowed section frames,
// small-caps labels, inline add-item inputs. Kept co-located with the tabs
// rather than promoted to global primitives so bachelor + bachelorette can
// evolve independently.

import { Plus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  tone?: "default" | "muted" | "warning";
}) {
  const border =
    tone === "muted"
      ? "border-border/60"
      : tone === "warning"
        ? "border-rose/35"
        : "border-border";
  const bg =
    tone === "muted"
      ? "bg-ivory-warm/40"
      : tone === "warning"
        ? "bg-rose-pale/30"
        : "bg-white";
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

export function Label({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 py-2">
      <Label>{label}</Label>
      <div className="text-[13.5px] text-ink">{children}</div>
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  type?: "text" | "number";
}) {
  return (
    <input
      type={type}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none",
        className,
      )}
    />
  );
}

export function ChipList({
  items,
  onRemove,
  emptyLabel,
}: {
  items: string[];
  onRemove: (index: number) => void;
  emptyLabel?: string;
}) {
  if (items.length === 0 && emptyLabel) {
    return <p className="text-[12.5px] italic text-ink-faint">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <li
          key={`${i}-${item}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ivory-warm/60 px-3 py-1 text-[12.5px] text-ink"
        >
          <span>{item}</span>
          <button
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() => onRemove(i)}
            className="text-ink-faint hover:text-rose"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function InlineAdd({
  placeholder,
  onAdd,
  buttonLabel = "Add",
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  buttonLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }
  return (
    <div className="mt-3 flex items-center gap-2">
      <TextInput value={draft} onChange={setDraft} placeholder={placeholder} />
      <button
        type="button"
        onClick={commit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} />
        {buttonLabel}
      </button>
    </div>
  );
}

export function StatusPill({
  tone,
  label,
}: {
  tone: "sage" | "gold" | "rose" | "sindoor" | "ink" | "muted";
  label: string;
}) {
  const cls =
    tone === "sage"
      ? "bg-sage-pale/60 text-sage"
      : tone === "gold"
        ? "bg-gold-pale/60 text-gold"
        : tone === "rose"
          ? "bg-rose-pale/60 text-rose"
          : tone === "sindoor"
            ? "bg-sindoor/15 text-sindoor"
            : tone === "ink"
              ? "bg-ink/10 text-ink"
              : "bg-ivory-warm text-ink-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  if (dollars === 0) return "$0";
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
