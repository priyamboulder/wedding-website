import type { ReactNode } from "react";

// Shared palette tokens for the vendor portal. Aligned 1:1 with the
// planner workspace so the two sides feel like a single product.
export const VENDOR_PALETTE = {
  ivory: "#FFFFF0",
  ivoryMuted: "#FAF8F5",
  champagne: "#F5E6D0",
  champagneDeep: "#EAD3B0",
  champagneSoft: "#FBF4E6",
  gold: "#C4A265",
  goldDeep: "#9E8245",
  charcoal: "#2C2C2C",
  charcoalSoft: "#5a5a5a",
  rose: "#E8D5D0",
  critical: "#C0392B",
  warning: "#E67E22",
  ontrack: "#27AE60",
  hairline: "rgba(44, 44, 44, 0.08)",
  hairlineSoft: "rgba(44, 44, 44, 0.05)",
} as const;

// ── PageHeader ─────────────────────────────────────────────
// Consistent top-of-page header across every vendor portal route.

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-end justify-between gap-4 border-b px-8 py-7"
      style={{ borderColor: VENDOR_PALETTE.hairline }}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.28em]"
            style={{ color: VENDOR_PALETTE.gold }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="mt-2 text-[38px] leading-[1.05]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: VENDOR_PALETTE.charcoal,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1.5 max-w-2xl text-[15.5px] italic"
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "#6a6a6a",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

type ButtonLikeProps = {
  children: ReactNode;
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function PrimaryButton({ children, as = "button", ...rest }: ButtonLikeProps) {
  const className =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium transition-colors hover:brightness-110";
  const style = {
    backgroundColor: VENDOR_PALETTE.charcoal,
    color: "#FAF8F5",
  };
  if (as === "a") {
    return (
      <a href={rest.href} className={className} style={style} onClick={rest.onClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={rest.type ?? "button"}
      onClick={rest.onClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, as = "button", ...rest }: ButtonLikeProps) {
  const className =
    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] transition-colors hover:bg-white";
  const style = {
    borderColor: "rgba(196,162,101,0.35)",
    color: VENDOR_PALETTE.charcoal,
  };
  if (as === "a") {
    return (
      <a href={rest.href} className={className} style={style} onClick={rest.onClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={rest.type ?? "button"}
      onClick={rest.onClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  style,
  id,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  tone?: "paper" | "champagne";
}) {
  const bg = tone === "champagne" ? "#FBF1DF" : "#FFFFFF";
  return (
    <div
      id={id}
      className={`rounded-2xl border ${className}`}
      style={{
        backgroundColor: bg,
        borderColor: VENDOR_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  hint,
  action,
  id,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: VENDOR_PALETTE.hairlineSoft }}
    >
      <div className="min-w-0">
        <h3
          className="text-[19px] leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.005em",
            color: VENDOR_PALETTE.charcoal,
          }}
        >
          {title}
        </h3>
        {hint && (
          <p
            className="mt-0.5 text-[12.5px] italic"
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "#8a8a8a",
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────
// Spaced-caps label used above grouped rows.

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-mono text-[10.5px] uppercase tracking-[0.26em]"
      style={{ color: VENDOR_PALETTE.goldDeep }}
    >
      {children}
    </p>
  );
}

// ── Stat tile ───────────────────────────────────────────────

export function StatTile({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { direction: "up" | "down" | "flat"; text: string };
}) {
  const trendColor =
    trend?.direction === "up"
      ? "#4a7a4a"
      : trend?.direction === "down"
        ? "#C0392B"
        : "#8a8a8a";
  const trendGlyph =
    trend?.direction === "up" ? "↑" : trend?.direction === "down" ? "↓" : "→";
  return (
    <Card className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {label}
      </p>
      <p
        className="mt-3 text-[38px] leading-none"
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: VENDOR_PALETTE.charcoal,
        }}
      >
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {sub && (
          <span
            className="text-[12.5px] italic"
            style={{ fontFamily: "'EB Garamond', serif", color: "#6a6a6a" }}
          >
            {sub}
          </span>
        )}
        {trend && (
          <span
            className="font-mono text-[11px] tracking-wider"
            style={{ color: trendColor }}
          >
            {trendGlyph} {trend.text}
          </span>
        )}
      </div>
    </Card>
  );
}

// ── Status chip ────────────────────────────────────────────

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "gold" | "sage" | "rose" | "teal";
  children: ReactNode;
}) {
  const tones: Record<string, { bg: string; fg: string; ring: string }> = {
    neutral: { bg: "#F5F0E3", fg: "#4a4a4a", ring: "rgba(44,44,44,0.08)" },
    gold:    { bg: "#F5E6D0", fg: "#8a5a20", ring: "rgba(196,162,101,0.35)" },
    sage:    { bg: "#E8F0E0", fg: "#4a6b3a", ring: "rgba(156,175,136,0.4)" },
    rose:    { bg: "#F5E0D6", fg: "#9a4a30", ring: "rgba(201,123,99,0.3)" },
    teal:    { bg: "#DCE9E7", fg: "#3a6b67", ring: "rgba(91,142,138,0.3)" },
  };
  const t = tones[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.18em] ring-1"
      style={{ backgroundColor: t.bg, color: t.fg, boxShadow: `inset 0 0 0 1px ${t.ring}` }}
    >
      {children}
    </span>
  );
}
