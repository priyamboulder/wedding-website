import { PLANNER_PALETTE } from "@/components/planner/ui";

export function BudgetSummary({
  committed,
  remaining,
  budgetMin,
  budgetMax,
}: {
  committed: number;
  remaining: number;
  budgetMin: number;
  budgetMax: number;
}) {
  const estimatedTotal = committed + remaining;
  const pctOfMin = Math.min(100, (estimatedTotal / budgetMin) * 100);
  const pctOfMax = Math.min(100, (estimatedTotal / budgetMax) * 100);
  const committedPct = Math.min(100, (committed / budgetMax) * 100);
  const remainingPct = Math.min(100 - committedPct, (remaining / budgetMax) * 100);
  const rangeSpanPct = Math.min(100, (budgetMax / budgetMax) * 100);
  const minMarkerPct = Math.min(100, (budgetMin / budgetMax) * 100);

  const overBudget = estimatedTotal > budgetMax;
  const nearTop = !overBudget && estimatedTotal > budgetMax * 0.9;
  const tone = overBudget
    ? PLANNER_PALETTE.critical
    : nearTop
      ? PLANNER_PALETTE.warning
      : PLANNER_PALETTE.ontrack;
  const toneLabel = overBudget
    ? "Over couple's upper budget"
    : nearTop
      ? "Approaching upper range"
      : "Within couple's budget range";

  return (
    <section
      className="mt-8 rounded-2xl border bg-white p-6"
      style={{
        borderColor: PLANNER_PALETTE.hairline,
        boxShadow: "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.16)",
      }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
            Budget
          </p>
          <h2
            className="mt-1 text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Committed vs. Remaining
          </h2>
        </div>
        <div className="text-right">
          <p
            className="text-[12.5px] font-medium"
            style={{ color: tone }}
          >
            {toneLabel}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <BudgetRow
          label="Total committed"
          value={`$${committed.toLocaleString()}`}
          accent="#2C2C2C"
        />
        <BudgetRow
          label="Estimated remaining (open categories)"
          value={`$${remaining.toLocaleString()}`}
          accent="#8a5a20"
        />
        <BudgetRow
          label="Estimated total"
          value={`$${estimatedTotal.toLocaleString()}`}
          accent="#2C2C2C"
          emphasis
        />
        <BudgetRow
          label="Couple's budget range"
          value={`$${(budgetMin / 1000).toFixed(0)}K–$${(budgetMax / 1000).toFixed(0)}K`}
          accent="#6a6a6a"
        />
      </dl>

      <div className="mt-6">
        <div
          className="relative h-[30px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
        >
          {/* Couple range band (min → max) */}
          <div
            className="absolute inset-y-0"
            style={{
              left: `${minMarkerPct}%`,
              width: `${rangeSpanPct - minMarkerPct}%`,
              backgroundColor: "rgba(196,162,101,0.18)",
            }}
          />
          {/* Committed bar */}
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${committedPct}%`,
              backgroundColor: PLANNER_PALETTE.ontrack,
            }}
          />
          {/* Remaining bar stacked */}
          <div
            className="absolute inset-y-0"
            style={{
              left: `${committedPct}%`,
              width: `${remainingPct}%`,
              backgroundColor: PLANNER_PALETTE.gold,
              opacity: 0.7,
            }}
          />

          {/* Min marker */}
          <MarkerLine pct={minMarkerPct} label={`$${(budgetMin / 1000).toFixed(0)}K`} />
          {/* Max marker */}
          <MarkerLine pct={100} label={`$${(budgetMax / 1000).toFixed(0)}K`} align="right" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11.5px]">
          <LegendDot color={PLANNER_PALETTE.ontrack} label="Committed" />
          <LegendDot color={PLANNER_PALETTE.gold} label="Estimated remaining" />
          <LegendDot color="rgba(196,162,101,0.35)" label="Couple's budget band" />
        </div>

        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
          Estimated total is {pctOfMin.toFixed(0)}% of min · {pctOfMax.toFixed(0)}% of max
        </p>
      </div>
    </section>
  );
}

function BudgetRow({
  label,
  value,
  accent,
  emphasis,
}: {
  label: string;
  value: string;
  accent: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between border-b pb-2"
      style={{ borderColor: "rgba(44,44,44,0.06)" }}
    >
      <dt className="text-[12.5px] text-[#5a5a5a]">{label}</dt>
      <dd
        className="font-mono text-[15px]"
        style={{
          color: accent,
          fontWeight: emphasis ? 600 : 500,
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function MarkerLine({
  pct,
  label,
  align,
}: {
  pct: number;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className="absolute inset-y-0"
      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
    >
      <span
        aria-hidden
        className="absolute inset-y-[-4px] w-px"
        style={{ backgroundColor: "#2C2C2C", opacity: 0.45 }}
      />
      <span
        className="absolute -bottom-5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-[#6a6a6a]"
        style={{
          left: align === "right" ? undefined : "50%",
          right: align === "right" ? 0 : undefined,
          transform: align === "right" ? undefined : "translateX(-50%)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#5a5a5a]">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
