"use client";

// ── Finance shared primitives ────────────────────────────────────────────
// Used across all six Finance tabs. Keeps the Bloomberg-terminal-meets-Linear
// language consistent: ink-heavy, mono labels, tabular numerics, no candy.

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinanceCategoryId } from "@/types/finance";
import {
  FINANCE_CATEGORY_LABEL,
  FINANCE_CATEGORY_TINT,
} from "@/types/finance";
import { useFinanceStore } from "@/stores/finance-store";
import type { WorkspaceCategorySlug } from "@/types/workspace";

// ── Section header with mono eyebrow + serif title ───────────────────────

export function FinanceSectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-[18px] text-ink">{title}</h3>
        {description && (
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{description}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

// ── Stat tile (Overview + summary strips) ────────────────────────────────

export function FinanceStatTile({
  label,
  value,
  hint,
  tone = "ink",
  mono = false,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "sage" | "gold" | "rose" | "saffron";
  mono?: boolean;
}) {
  const valueTone =
    tone === "sage"
      ? "text-sage"
      : tone === "gold"
        ? "text-gold"
        : tone === "rose"
          ? "text-rose"
          : tone === "saffron"
            ? "text-saffron"
            : "text-ink";
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 leading-tight",
          mono
            ? "font-mono text-[20px] tabular-nums"
            : "font-serif text-[22px]",
          valueTone,
        )}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

// ── Category chip (filter + badges) ───────────────────────────────────────

export function CategoryChip({
  category,
  size = "sm",
}: {
  category: FinanceCategoryId;
  size?: "sm" | "xs";
}) {
  // Prefer the live store record (covers custom categories). Fall back to
  // the static maps — they still resolve for the 12 default slugs even
  // after a bad persist state.
  const resolved = useFinanceStore((s) =>
    s.categories.find((c) => c.id === category),
  );
  const label =
    resolved?.name ??
    FINANCE_CATEGORY_LABEL[category as WorkspaceCategorySlug] ??
    "Uncategorized";
  const tint =
    resolved?.color_class ??
    FINANCE_CATEGORY_TINT[category as WorkspaceCategorySlug] ??
    "bg-ink-faint";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border/80 bg-white px-2 py-0.5 font-mono uppercase tracking-[0.1em] text-ink-muted",
        size === "xs" ? "text-[9.5px]" : "text-[10.5px]",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", tint)}
        aria-hidden
      />
      {label}
    </span>
  );
}

// ── Dismissible filter chip ──────────────────────────────────────────────

export function FilterChip({
  label,
  onDismiss,
  tone = "ink",
}: {
  label: string;
  onDismiss?: () => void;
  tone?: "ink" | "gold" | "rose";
}) {
  const toneClasses =
    tone === "gold"
      ? "border-gold/50 bg-gold-light/15 text-ink"
      : tone === "rose"
        ? "border-rose/50 bg-rose/10 text-ink"
        : "border-ink bg-ink text-ivory";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em]",
        toneClasses,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Remove filter: ${label}`}
          className={cn(
            "-mr-1 rounded-sm p-0.5 transition-colors",
            tone === "ink"
              ? "text-ivory/70 hover:text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <X size={11} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}

// ── Toggle chip (for filter rows) ─────────────────────────────────────────

export function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

// ── Action button ────────────────────────────────────────────────────────

export function FinanceActionButton({
  icon,
  label,
  primary = false,
  onClick,
  disabled,
}: {
  icon?: ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Side panel (right-edge drawer) ───────────────────────────────────────

export function SidePanel({
  title,
  eyebrow,
  children,
  onClose,
  footer,
  widthClass = "w-[480px]",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-ink/30"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex h-full flex-col border-l border-border bg-white shadow-[0_0_40px_-12px_rgba(26,26,26,0.3)]",
          widthClass,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {eyebrow}
              </p>
            )}
            <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-border bg-ivory/40 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel card (mirrors Catering look) ───────────────────────────────────

export function FinancePanelCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-white p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ── Mono value cell (for dense tables) ───────────────────────────────────

export function MonoCell({
  value,
  tone = "ink",
  align = "right",
}: {
  value: string;
  tone?: "ink" | "muted" | "faint" | "rose" | "sage" | "gold";
  align?: "left" | "right";
}) {
  const toneClasses =
    tone === "muted"
      ? "text-ink-muted"
      : tone === "faint"
        ? "text-ink-faint"
        : tone === "rose"
          ? "text-rose"
          : tone === "sage"
            ? "text-sage"
            : tone === "gold"
              ? "text-gold"
              : "text-ink";
  return (
    <span
      className={cn(
        "font-mono text-[12px] tabular-nums",
        align === "right" ? "text-right" : "text-left",
        toneClasses,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {value}
    </span>
  );
}
