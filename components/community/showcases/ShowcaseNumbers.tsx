"use client";

// ── ShowcaseNumbers ─────────────────────────────────────────────────────────
// The Numbers section. Renders a clean SVG donut chart of the couple's
// budget breakdown plus a legend with percentages. Kept custom rather than
// adding a chart dependency — the shape here is simple and the editorial
// palette would be lost to most off-the-shelf chart defaults.

import type {
  ShowcaseBudgetSlice,
  ShowcaseBudgetRange,
} from "@/types/showcase";
import { SHOWCASE_BUDGET_LABEL } from "@/types/showcase";

// Hand-picked palette from globals.css tokens so the donut sits inside the
// ivory/saffron/sage/rose system instead of fighting it.
const SLICE_COLORS = [
  "#B8860B", // gold
  "#C97B63", // rose
  "#9CAF88", // sage
  "#5B8E8A", // teal
  "#D4A843", // gold-light
  "#DDA08A", // rose-light
  "#85AEAB", // teal-light
  "#F0E4C8", // gold-pale
];

export function ShowcaseNumbers({
  slices,
  budgetRange,
  guestCountRange,
}: {
  slices: ShowcaseBudgetSlice[];
  budgetRange: ShowcaseBudgetRange;
  guestCountRange: string;
}) {
  if (slices.length === 0) return null;

  const total = slices.reduce((sum, s) => sum + s.percent, 0) || 100;
  const normalized = slices.map((s) => ({
    ...s,
    percent: (s.percent / total) * 100,
  }));

  return (
    <section className="border-t border-gold/15 bg-white py-14">
      <div className="mx-auto max-w-[960px] px-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Numbers
        </p>
        <h2 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
          Where it all went.
        </h2>
        <p className="mt-2 max-w-xl font-serif text-[15px] italic text-ink-muted">
          A percentage breakdown — no absolute numbers — so the next couple
          planning in this range can see how to think about allocation.
        </p>

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <DonutChart slices={normalized} />

          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-gold/20 bg-ivory-warm/30 p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <MetaStat
                  label="Total budget"
                  value={SHOWCASE_BUDGET_LABEL[budgetRange]}
                />
                <MetaStat label="Guests" value={guestCountRange} />
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {normalized.map((slice, i) => (
                <li
                  key={`${slice.label}-${i}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2"
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{
                      background: SLICE_COLORS[i % SLICE_COLORS.length],
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {slice.label}
                    </p>
                    {slice.note && (
                      <p className="truncate text-[11.5px] italic text-ink-muted">
                        {slice.note}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 font-mono text-[12.5px] font-semibold text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {slice.percent.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SVG donut ───────────────────────────────────────────────────────────────

function DonutChart({ slices }: { slices: ShowcaseBudgetSlice[] }) {
  const size = 240;
  const center = size / 2;
  const outerRadius = 108;
  const innerRadius = 66;
  const strokeGap = 1.5; // small gap between slices reads more editorial
  const circumference = 2 * Math.PI * outerRadius;

  // Start at the top (-90deg) and render each slice as an SVG arc.
  let cumulative = 0;
  return (
    <div className="relative mx-auto w-fit">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Budget breakdown donut chart"
      >
        {slices.map((slice, i) => {
          if (slice.percent <= 0) return null;
          const fraction = slice.percent / 100;
          const sliceLength = fraction * circumference;
          const startOffset = circumference * 0.25 - cumulative; // rotate so first starts at top
          cumulative += sliceLength;
          return (
            <circle
              key={`${slice.label}-${i}`}
              cx={center}
              cy={center}
              r={outerRadius}
              fill="none"
              stroke={SLICE_COLORS[i % SLICE_COLORS.length]}
              strokeWidth={outerRadius - innerRadius}
              strokeDasharray={`${Math.max(0, sliceLength - strokeGap)} ${circumference}`}
              strokeDashoffset={startOffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-mono)" }}
          className="fill-ink-faint"
          fontSize={10}
          letterSpacing={2}
        >
          BUDGET
        </text>
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-serif)" }}
          className="fill-ink"
          fontSize={22}
          fontWeight={500}
        >
          {slices.length} cats
        </text>
      </svg>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-0.5 font-serif text-[16px] text-ink">{value}</p>
    </div>
  );
}
