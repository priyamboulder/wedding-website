"use client";

import { cn } from "@/lib/utils";

export function RadialProgress({
  value,
  total,
  size = 36,
  stroke = 3,
  color = "var(--color-sage)",
  trackColor = "rgba(26, 26, 26, 0.08)",
  className,
  children,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(1, Math.max(0, value / safeTotal));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      {children !== undefined && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
