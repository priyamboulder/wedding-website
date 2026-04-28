import type { ReactNode } from "react";

// Palette tokens for the planner dashboard. Centralized so the feel
// stays consistent across planner surfaces.
export const PLANNER_PALETTE = {
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

export function PlannerCard({
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
        borderColor: PLANNER_PALETTE.hairline,
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
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <PlannerCard className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {label}
      </p>
      <p
        className="mt-3 text-[38px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="mt-3 text-[12.5px] text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
        >
          {sub}
        </p>
      )}
    </PlannerCard>
  );
}

export function UrgencyDot({
  tone,
}: {
  tone: "critical" | "warning" | "ontrack";
}) {
  const color =
    tone === "critical"
      ? PLANNER_PALETTE.critical
      : tone === "warning"
        ? PLANNER_PALETTE.warning
        : PLANNER_PALETTE.ontrack;
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function ProgressBar({
  value,
  total,
  tone,
}: {
  value: number;
  total: number;
  tone: "critical" | "warning" | "ontrack";
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const color =
    tone === "critical"
      ? PLANNER_PALETTE.critical
      : tone === "warning"
        ? PLANNER_PALETTE.gold
        : PLANNER_PALETTE.ontrack;
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
