"use client";

// ── Welcome Events shared primitives ───────────────────────────────────────
// Small visual pieces reused across all five tabs — section labels, field
// wrappers, simple inputs. Kept local to the module to avoid bloating the
// cross-workspace shared directory.

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="mt-1 font-serif text-[30px] leading-tight tracking-tight text-ink"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </h2>
  );
}

export function SectionIntro({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
      {children}
    </p>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label
      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-[14px] text-ink",
        "placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40",
        className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={cn(
        "w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-[14px] leading-relaxed text-ink",
        "placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40",
        className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(
        "w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-[14px] text-ink",
        "focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40",
        className,
      )}
    />
  );
}

export function ChipToggle({
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
        "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
        active
          ? "border-gold bg-gold-pale text-ink"
          : "border-ink/10 bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function RadioRow<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2 text-left text-[13.5px] transition-colors",
              active
                ? "border-gold bg-gold-pale/40 text-ink"
                : "border-ink/10 bg-white text-ink-soft hover:border-ink/20",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                active ? "border-gold" : "border-ink/30",
              )}
            >
              {active ? (
                <span className="h-2 w-2 rounded-full bg-gold" />
              ) : null}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[13.5px] text-ink-soft">
      <span
        onClick={onChange}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked
            ? "border-gold bg-gold text-white"
            : "border-ink/30 bg-white hover:border-ink/50",
        )}
      >
        {checked ? (
          <svg
            viewBox="0 0 10 10"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1.5 5 4 7.5 8.5 2.5" />
          </svg>
        ) : null}
      </span>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}

export function IconButton({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
    >
      {children}
    </button>
  );
}
