"use client";

// ── Décor shared design primitives ──────────────────────────────────────────
// Centralized palette, fonts, and small UI atoms used across every Décor tab.

import type { CSSProperties, ReactNode } from "react";

export const DECOR_COLORS = {
  ivory: "#FFFDF7",
  ivoryWarm: "#FBF6EC",
  champagne: "#F5E6D3",
  champagneDeep: "#EDD7B5",
  cocoa: "#3D2B1F",
  cocoaSoft: "#5A4434",
  cocoaMuted: "#816655",
  cocoaFaint: "#B09A86",
  rose: "#C4766E",
  marigold: "#D4A853",
  sage: "#8B9E7E",
  sindoor: "#C94030",
  line: "rgba(61, 43, 31, 0.12)",
  lineSoft: "rgba(61, 43, 31, 0.06)",
} as const;

// Typography tokens. The section display face is Cormorant Garamond
// (exposed as --font-display on :root); sans = Inter, mono = JetBrains
// Mono. Décor is the reference for the editorial 3-tier section header
// pattern used across every workspace module.
export const FONT_DISPLAY = "var(--font-display)";
export const FONT_UI = "var(--font-sans)";
export const FONT_MONO = "var(--font-mono)";

// ── Section header ───────────────────────────────────────────────────────────
// Gold uppercase eyebrow → Cormorant title → muted description → thin
// bottom divider. No card border, no box-shadow.
export function SectionHead({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-end justify-between gap-4 flex-wrap border-b border-[rgba(26,26,26,0.04)] pb-[10px]">
      <div className="flex-1 min-w-[260px]">
        <div
          className="mb-1.5 text-[10px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: "var(--color-saffron)",
            fontWeight: 500,
          }}
        >
          {eyebrow}
        </div>
        <h2
          className="leading-[1.15]"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 22,
            color: "var(--color-ink)",
            fontWeight: 700,
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </h2>
        {body ? (
          <p
            className="mt-1.5 text-[13.5px] leading-[1.5] max-w-[52rem]"
            style={{ fontFamily: FONT_UI, color: "var(--color-ink-muted)" }}
          >
            {body}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// ── AI sparkle pill ──────────────────────────────────────────────────────────
export function SparklePill({
  label = "Refine with AI",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors hover:bg-white"
      style={{
        fontFamily: FONT_UI,
        borderColor: DECOR_COLORS.line,
        color: DECOR_COLORS.cocoaSoft,
        backgroundColor: "transparent",
      }}
    >
      <span style={{ color: DECOR_COLORS.marigold }}>✦</span>
      {label}
    </button>
  );
}

// ── Paper card ───────────────────────────────────────────────────────────────
export function Paper({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-[14px] ${className}`}
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${DECOR_COLORS.line}`,
        boxShadow: "0 1px 0 rgba(61, 43, 31, 0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Text field ───────────────────────────────────────────────────────────────
export function TextField({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-[13px] outline-none focus:border-[${DECOR_COLORS.marigold}] ${className}`}
      style={{
        fontFamily: FONT_UI,
        borderColor: DECOR_COLORS.line,
        color: DECOR_COLORS.cocoa,
      }}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
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
      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none ${className}`}
      style={{
        fontFamily: FONT_UI,
        borderColor: DECOR_COLORS.line,
        color: DECOR_COLORS.cocoa,
        resize: "vertical",
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border bg-white px-2.5 py-2 text-[13px] outline-none ${className}`}
      style={{
        fontFamily: FONT_UI,
        borderColor: DECOR_COLORS.line,
        color: DECOR_COLORS.cocoa,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Primary / ghost buttons ──────────────────────────────────────────────────
export function PrimaryButton({
  onClick,
  children,
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] transition-colors disabled:opacity-50"
      style={{
        fontFamily: FONT_UI,
        backgroundColor: DECOR_COLORS.cocoa,
        color: DECOR_COLORS.ivory,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  onClick,
  children,
  className = "",
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] transition-colors hover:bg-white ${className}`}
      style={{
        fontFamily: FONT_UI,
        borderColor: DECOR_COLORS.line,
        color: DECOR_COLORS.cocoaSoft,
        backgroundColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

// ── Status pill ──────────────────────────────────────────────────────────────
type PillKind = "neutral" | "progress" | "review" | "approved" | "blocked";

export function StatusPill({
  kind,
  children,
}: {
  kind: PillKind;
  children: ReactNode;
}) {
  const palette: Record<PillKind, { bg: string; fg: string }> = {
    neutral: { bg: "rgba(176, 154, 134, 0.15)", fg: DECOR_COLORS.cocoaMuted },
    progress: { bg: "rgba(212, 168, 83, 0.18)", fg: "#8A6B22" },
    review: { bg: "rgba(196, 118, 110, 0.18)", fg: "#8F4E48" },
    approved: { bg: "rgba(139, 158, 126, 0.22)", fg: "#4F613F" },
    blocked: { bg: "rgba(201, 64, 48, 0.16)", fg: DECOR_COLORS.sindoor },
  };
  const c = palette[kind];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px]"
      style={{
        fontFamily: FONT_UI,
        backgroundColor: c.bg,
        color: c.fg,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

// ── Section wrapper (tab body blocks) ────────────────────────────────────────
export function Block({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-10 ${className}`}>
      {children}
    </section>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className="italic py-4 text-[13px]"
      style={{
        fontFamily: FONT_DISPLAY,
        color: DECOR_COLORS.cocoaFaint,
      }}
    >
      {children}
    </div>
  );
}

// ── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label
      className="inline-flex items-start gap-2 cursor-pointer text-[12.5px]"
      style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: checked ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
          backgroundColor: checked ? DECOR_COLORS.cocoa : "white",
          color: DECOR_COLORS.ivory,
          fontSize: 10,
          lineHeight: 1,
        }}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{label}</span>
    </label>
  );
}
