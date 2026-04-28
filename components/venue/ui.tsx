import type { ReactNode } from "react";

export const VENUE_PALETTE = {
  ivory: "#FFFFF0",
  ivoryMuted: "#FAF8F5",
  champagne: "#F5E6D0",
  champagneDeep: "#EAD3B0",
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

export function VenueCard({
  children,
  className = "",
  tone = "paper",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "champagne";
  id?: string;
}) {
  const bg = tone === "champagne" ? "#FBF1DF" : "#FFFFFF";
  return (
    <div
      id={id}
      className={`rounded-2xl border ${className}`}
      style={{
        backgroundColor: bg,
        borderColor: VENUE_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.18)",
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: ReactNode;
  trend?: { delta: number; suffix?: string };
}) {
  return (
    <VenueCard className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {label}
      </p>
      <div className="mt-3 flex items-end gap-2.5">
        <p
          className="text-[38px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
        {trend && <TrendBadge delta={trend.delta} suffix={trend.suffix} />}
      </div>
      {sub && (
        <p
          className="mt-3 text-[12.5px] text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
        >
          {sub}
        </p>
      )}
    </VenueCard>
  );
}

export function TrendBadge({
  delta,
  suffix,
}: {
  delta: number;
  suffix?: string;
}) {
  if (delta === 0) return null;
  const positive = delta > 0;
  const color = positive ? VENUE_PALETTE.ontrack : VENUE_PALETTE.critical;
  const glyph = positive ? "▲" : "▼";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10.5px] font-medium"
      style={{
        backgroundColor: positive
          ? "rgba(39, 174, 96, 0.10)"
          : "rgba(192, 57, 43, 0.10)",
        color,
      }}
    >
      <span aria-hidden className="text-[8px]">
        {glyph}
      </span>
      <span className="font-mono">
        {Math.abs(delta)}
        {suffix ?? ""}
      </span>
    </span>
  );
}

export function SectionHeader({
  title,
  actionHref,
  actionLabel,
  eyebrow,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  eyebrow?: string;
}) {
  return (
    <div
      className="flex items-end justify-between gap-4 border-b pb-3"
      style={{ borderColor: VENUE_PALETTE.hairline }}
    >
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#9E8245]">
            {eyebrow}
          </p>
        )}
        <h2
          className="mt-1 text-[26px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </div>
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="text-[12.5px] text-[#9E8245] hover:text-[#C4A265]"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}

export function MetaPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "rose" | "gold";
}) {
  const styles =
    tone === "rose"
      ? { bg: "#F4E1DD", color: "#7a4a44" }
      : tone === "gold"
        ? { bg: "#FDF1E3", color: "#8a5a20" }
        : { bg: "#F2EEE5", color: "#5a5a5a" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.16em]"
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.20)",
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const color =
    pct >= 90
      ? VENUE_PALETTE.ontrack
      : pct >= 70
        ? VENUE_PALETTE.gold
        : VENUE_PALETTE.warning;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-[6px] flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(44,44,44,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[11px] tracking-wider text-[#6a6a6a]">
        {pct}%
      </span>
    </div>
  );
}
