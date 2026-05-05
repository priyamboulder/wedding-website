"use client";

// Small ring-progress badge shown next to the budget/invite cluster in the
// workspace header. Mirrors PhotographyProgressIndicator.

import { C, FONT_MONO } from "./styles";

export function GuidedJourneyProgressIndicator({
  pct,
  completed,
  total,
}: {
  pct: number;
  completed: number;
  total: number;
}) {
  const size = 30;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      title={`Vision: ${completed} of ${total} sessions complete (${pct}%)`}
      aria-label={`Vision: ${completed} of ${total} sessions complete`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "5px 12px 5px 6px",
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        backgroundColor: C.paper,
      }}
    >
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.line}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.rose}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 1.05,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 8.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.faint,
          }}
        >
          Vision
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {completed}/{total}
        </span>
      </span>
    </div>
  );
}
