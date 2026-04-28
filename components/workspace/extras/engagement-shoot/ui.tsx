"use client";

// ── Engagement Shoot shared UI atoms ───────────────────────────────────────
// Thin wrappers over the bachelorette primitives + a couple of module-specific
// bits (phase stepper, hearted-image tile). Kept here so the six tabs don't
// pull from bachelorette's internals directly.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section as BaseSection } from "../bachelorette/ui";

export {
  ChipList,
  FieldRow,
  InlineAdd,
  Label,
  StatusPill,
  TextArea,
  TextInput,
  formatMoney,
} from "../bachelorette/ui";

export function Section(props: Parameters<typeof BaseSection>[0]) {
  return <BaseSection {...props} />;
}

// ── Phase stepper ──────────────────────────────────────────────────────────

export function PhaseStepper({
  phase,
  count,
  label,
}: {
  phase: number; // 1-indexed
  count: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Phase {phase} / {count}
      </span>
      <span className="h-[1px] w-6 bg-border" aria-hidden />
      <span className="text-[12.5px] text-ink-muted">{label}</span>
    </div>
  );
}

// ── Choice tile (visual card with emoji + label + blurb) ───────────────────

export function ChoiceTile({
  emoji,
  label,
  blurb,
  selected,
  onClick,
  disabled,
}: {
  emoji?: string;
  label: string;
  blurb?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex h-full w-full flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-all",
        selected
          ? "border-saffron/70 bg-saffron/8 ring-1 ring-saffron/30"
          : "border-border bg-white hover:border-saffron/40 hover:bg-ivory-warm/40",
        disabled && "cursor-not-allowed opacity-40",
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-2">
        {emoji && <span className="text-[17px]">{emoji}</span>}
        <span className="text-[13px] font-medium leading-tight text-ink">
          {label}
        </span>
      </div>
      {blurb && (
        <span className="text-[11.5px] leading-snug text-ink-muted">
          {blurb}
        </span>
      )}
    </button>
  );
}

// ── Hearted-image tile (reference grid, moodboard pins) ────────────────────

export function HeartTile({
  imageUrl,
  caption,
  hearted,
  onToggle,
  className,
}: {
  imageUrl: string;
  caption: string;
  hearted: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-lg border transition-all",
        hearted
          ? "border-saffron/70 ring-2 ring-saffron/40"
          : "border-border hover:border-saffron/40",
        className,
      )}
      aria-pressed={hearted}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ivory-warm to-gold-pale/30" />
      {/* Placeholder — real build would render <img src={imageUrl}/> */}
      <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
        <span className="font-serif text-[13px] leading-snug text-ink/60">
          {caption}
        </span>
      </div>

      <span
        aria-hidden
        className={cn(
          "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-white/70 backdrop-blur transition-all",
          hearted
            ? "bg-saffron/90 text-white"
            : "text-ink-faint opacity-0 group-hover:opacity-100",
        )}
      >
        <HeartIcon filled={hearted} />
      </span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={12}
      height={12}
      aria-hidden
      className="stroke-current"
      strokeWidth={1.5}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M7 12.5S1.5 8.5 1.5 5a3 3 0 0 1 5.5-1.7A3 3 0 0 1 12.5 5c0 3.5-5.5 7.5-5.5 7.5z" />
    </svg>
  );
}

// ── Inline-editable field ──────────────────────────────────────────────────

export function InlineEdit({
  value,
  onChange,
  placeholder,
  multiline = false,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={cn(
          "w-full resize-y rounded-md border border-transparent bg-transparent px-2 py-1 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint hover:border-border focus:border-saffron/60 focus:bg-white focus:outline-none",
          className,
        )}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-[13px] text-ink placeholder:text-ink-faint hover:border-border focus:border-saffron/60 focus:bg-white focus:outline-none",
        className,
      )}
    />
  );
}

// ── Visual summary pill row ────────────────────────────────────────────────

export function SummaryRow({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-md border border-border/70 bg-ivory-warm/30 p-2.5"
        >
          <dt
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.label}
          </dt>
          <dd className="mt-1 text-[13px] font-medium leading-tight text-ink">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
