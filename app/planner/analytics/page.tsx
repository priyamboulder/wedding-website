import { PlannerCard, PLANNER_PALETTE } from "@/components/planner/ui";
import {
  ANALYTICS_HEADLINE,
  FASTEST_VENDORS,
  FUNNEL,
  MARKET_INSIGHTS,
  MONTHLY_WEDDINGS,
  POPULAR_VENUES,
  QUARTERLY_REVENUE,
  RATING_DISTRIBUTION,
  RATING_TREND,
  RECENT_REVIEWS,
  REVIEW_TREND,
  SLOWEST_VENDORS,
  TOP_VENDORS,
  TRENDING_CATEGORIES,
  VENDOR_NETWORK_TOTALS,
} from "@/lib/planner/analytics-seed";

export const metadata = {
  title: "Analytics — Radz Events",
};

export default function PlannerAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10">
      {/* Page head */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Analytics
          </p>
          <h1
            className="mt-2 text-[40px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Your business at a glance
          </h1>
          <p
            className="mt-1.5 text-[15px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Twenty-two weddings, $4.2M under management, and a 4.9 average — best year yet.
          </p>
        </div>
        <RangePicker />
      </section>

      {/* Row 1 — Key metrics */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WeddingsThisYearCard />
        <RevenueCard />
        <RatingCard />
        <ProfileViewsCard />
      </section>

      {/* Row 2 — Pipeline */}
      <Row title="Wedding Pipeline" sub="Inquiries this year, compared to last">
        <PlannerCard className="p-6">
          <FunnelChart />
        </PlannerCard>
      </Row>

      {/* Row 3 — Vendor network */}
      <Row title="Vendor Network" sub={`${VENDOR_NETWORK_TOTALS.total} vendors · ${VENDOR_NETWORK_TOTALS.addedThisQuarter} added this quarter`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <TopVendorsTable />
          <div className="space-y-4">
            <ResponseCard
              title="Fastest to respond"
              hint="Top 5 — keep recommending"
              vendors={FASTEST_VENDORS}
              tone="ontrack"
            />
            <ResponseCard
              title="Slowest to respond"
              hint="Bottom 5 — follow up or replace"
              vendors={SLOWEST_VENDORS}
              tone="warning"
            />
          </div>
        </div>
      </Row>

      {/* Row 4 — Satisfaction */}
      <Row title="Couple Satisfaction" sub={`${ANALYTICS_HEADLINE.averageRating.toFixed(1)} average across 38 reviews`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <RecentReviewsCard />
          <div className="space-y-4">
            <RatingDistributionCard />
            <ReviewTrendCard />
          </div>
        </div>
      </Row>

      {/* Row 5 — Market */}
      <Row
        title="Market Insights"
        sub="Benchmarks across South Asian weddings in your region"
        premium
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MarketBudgetCard />
          <PopularVenuesCard />
          <TrendingCategoriesCard />
        </div>
        <MarketShareCard />
      </Row>
    </div>
  );
}

function Row({
  title,
  sub,
  children,
  premium,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  premium?: boolean;
}) {
  return (
    <section className="mt-10">
      <div
        className="flex flex-wrap items-end justify-between gap-3 border-b pb-3"
        style={{ borderColor: PLANNER_PALETTE.hairline }}
      >
        <div>
          <h2
            className="text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
          {sub && (
            <p
              className="mt-1 text-[13px] italic text-[#6a6a6a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {sub}
            </p>
          )}
        </div>
        {premium && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em]"
            style={{
              backgroundColor: PLANNER_PALETTE.champagne,
              color: "#8a5a20",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            }}
          >
            <span aria-hidden>✦</span> Premium
          </span>
        )}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function RangePicker() {
  const ranges = ["This year", "Last 12 months", "All time"];
  return (
    <div className="flex gap-1.5 rounded-full bg-white p-1"
      style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.08)" }}
    >
      {ranges.map((r, i) => (
        <button
          key={r}
          type="button"
          className="rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors"
          style={{
            backgroundColor: i === 0 ? PLANNER_PALETTE.charcoal : "transparent",
            color: i === 0 ? "#FAF8F5" : "#5a5a5a",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// --- Metric cards ------------------------------------------------------------

function MetricShell({
  label,
  value,
  children,
  delta,
  deltaLabel,
  positive = true,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
  delta?: string;
  deltaLabel?: string;
  positive?: boolean;
}) {
  return (
    <PlannerCard className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {label}
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p
          className="text-[36px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
        {delta && (
          <div className="text-right">
            <p
              className="text-[12.5px] font-medium"
              style={{
                color: positive ? PLANNER_PALETTE.ontrack : PLANNER_PALETTE.critical,
              }}
            >
              {positive ? "↑" : "↓"} {delta}
            </p>
            {deltaLabel && (
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                {deltaLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </PlannerCard>
  );
}

function WeddingsThisYearCard() {
  const max = Math.max(...MONTHLY_WEDDINGS.map((m) => m.count));
  return (
    <MetricShell
      label="Weddings this year"
      value={ANALYTICS_HEADLINE.weddingsThisYear.toString()}
      delta={`+${ANALYTICS_HEADLINE.weddingsYoYDelta}`}
      deltaLabel="vs 2025"
    >
      <div className="flex h-[58px] items-end gap-[3px]" aria-label="Monthly wedding distribution">
        {MONTHLY_WEDDINGS.map((m) => {
          const h = max === 0 ? 0 : (m.count / max) * 100;
          const peak = m.count >= 3;
          return (
            <div
              key={m.month}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${m.month}: ${m.count} weddings`}
            >
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${h}%`,
                  minHeight: m.count > 0 ? "3px" : "0",
                  backgroundColor: peak ? PLANNER_PALETTE.goldDeep : PLANNER_PALETTE.gold,
                  opacity: peak ? 1 : 0.6,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-[#8a8a8a]">
        {MONTHLY_WEDDINGS.filter((_, i) => i % 2 === 0).map((m) => (
          <span key={m.month}>{m.month}</span>
        ))}
      </div>
    </MetricShell>
  );
}

function RevenueCard() {
  const d = ANALYTICS_HEADLINE.revenueYoYDelta;
  return (
    <MetricShell
      label="Revenue under management"
      value={`$${(ANALYTICS_HEADLINE.revenueUnderManagement / 1_000_000).toFixed(1)}M`}
      delta={`${(d * 100).toFixed(0)}%`}
      deltaLabel="vs last year"
    >
      <Sparkline points={QUARTERLY_REVENUE.map((q) => q.revenue)} />
      <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
        <span>Q3 '24</span>
        <span>Q2 '26</span>
      </div>
    </MetricShell>
  );
}

function RatingCard() {
  const delta = ANALYTICS_HEADLINE.averageRating - ANALYTICS_HEADLINE.ratingPrev;
  return (
    <MetricShell
      label="Average rating"
      value={`★ ${ANALYTICS_HEADLINE.averageRating.toFixed(1)}`}
      delta={`+${delta.toFixed(1)}`}
      deltaLabel="vs last year"
    >
      <Sparkline
        points={RATING_TREND.map((r) => r.rating)}
        tone="ontrack"
        domain={[4.4, 5.0]}
      />
      <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
        <span>38 reviews</span>
        <span>32 five-star</span>
      </div>
    </MetricShell>
  );
}

function ProfileViewsCard() {
  const delta = ANALYTICS_HEADLINE.profileViewsDelta;
  return (
    <MetricShell
      label="Profile views this month"
      value={ANALYTICS_HEADLINE.profileViewsThisMonth.toLocaleString()}
      delta={`${(delta * 100).toFixed(0)}%`}
      deltaLabel="vs last month"
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-8 w-8 place-items-center rounded-full text-[13px]"
          style={{
            backgroundColor: "#F5E6D0",
            color: "#9E8245",
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
          }}
          aria-hidden
        >
          ◉
        </span>
        <p className="text-[12.5px] text-[#5a5a5a]">
          <span className="text-[#2C2C2C]">82%</span> from organic search · <span className="text-[#2C2C2C]">14</span> from Instagram
        </p>
      </div>
    </MetricShell>
  );
}

// --- Charts ------------------------------------------------------------------

function Sparkline({
  points,
  tone = "gold",
  domain,
}: {
  points: number[];
  tone?: "gold" | "ontrack";
  domain?: [number, number];
}) {
  const [lo, hi] = domain ?? [Math.min(...points), Math.max(...points)];
  const width = 200;
  const height = 48;
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = height - ((v - lo) / Math.max(hi - lo, 0.0001)) * (height - 6) - 3;
    return [x, y] as const;
  });
  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${path} L ${(coords[coords.length - 1][0]).toFixed(1)} ${height} L 0 ${height} Z`
      : "";
  const stroke = tone === "ontrack" ? PLANNER_PALETTE.ontrack : PLANNER_PALETTE.goldDeep;
  const fill = tone === "ontrack" ? "rgba(39,174,96,0.12)" : "rgba(196,162,101,0.18)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[58px] w-full" preserveAspectRatio="none">
      <path d={areaPath} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {coords.length > 0 && (
        <circle
          cx={coords[coords.length - 1][0]}
          cy={coords[coords.length - 1][1]}
          r={2.5}
          fill={stroke}
        />
      )}
    </svg>
  );
}

// --- Funnel ------------------------------------------------------------------

function FunnelChart() {
  const max = FUNNEL[0].count;
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {FUNNEL.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100);
          return (
            <div key={stage.key} className="relative">
              <div
                className="flex flex-col items-start justify-between rounded-xl px-4 py-5"
                style={{
                  backgroundColor: i === FUNNEL.length - 1 ? PLANNER_PALETTE.charcoal : "#FBF4E6",
                  color: i === FUNNEL.length - 1 ? "#FAF8F5" : "#2C2C2C",
                  boxShadow:
                    i === FUNNEL.length - 1
                      ? "0 10px 30px -20px rgba(44,44,44,0.35)"
                      : "inset 0 0 0 1px rgba(196,162,101,0.35)",
                  minHeight: "132px",
                }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{
                    color: i === FUNNEL.length - 1 ? "#C4A265" : "#9E8245",
                  }}
                >
                  {stage.label}
                </p>
                <p
                  className="mt-2 text-[38px] leading-none"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stage.count}
                </p>
                <div
                  className="mt-4 h-[5px] w-full overflow-hidden rounded-full"
                  style={{
                    backgroundColor:
                      i === FUNNEL.length - 1 ? "rgba(255,255,240,0.15)" : "rgba(44,44,44,0.08)",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        i === FUNNEL.length - 1 ? PLANNER_PALETTE.gold : PLANNER_PALETTE.goldDeep,
                    }}
                  />
                </div>
                <div className="mt-3 flex w-full items-center justify-between text-[11px]">
                  {stage.conversionFromPrev != null ? (
                    <span
                      style={{
                        color: i === FUNNEL.length - 1 ? "#C4A265" : "#9E8245",
                      }}
                    >
                      {stage.conversionFromPrev}% converted
                    </span>
                  ) : (
                    <span
                      style={{
                        color: i === FUNNEL.length - 1 ? "#C4A265" : "#9E8245",
                      }}
                    >
                      Starts here
                    </span>
                  )}
                  <span
                    className="font-mono"
                    style={{
                      color:
                        stage.deltaYoY >= 0
                          ? PLANNER_PALETTE.ontrack
                          : PLANNER_PALETTE.critical,
                    }}
                  >
                    {stage.deltaYoY >= 0 ? "+" : ""}
                    {stage.deltaYoY} YoY
                  </span>
                </div>
              </div>
              {i < FUNNEL.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-2 z-10 hidden -translate-y-1/2 text-[20px] text-[#C4A265] sm:block"
                >
                  ›
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p
        className="mt-4 text-[12.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Booked rate: <span className="text-[#2C2C2C] not-italic">40%</span> of all inquiries — above industry average of 18% for luxury planners.
      </p>
    </div>
  );
}

// --- Vendor network ----------------------------------------------------------

function TopVendorsTable() {
  return (
    <PlannerCard className="overflow-hidden">
      <div
        className="flex items-baseline justify-between border-b px-5 py-3"
        style={{ borderColor: PLANNER_PALETTE.hairline }}
      >
        <h3
          className="text-[17px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Most-used vendors
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
          Top 10
        </span>
      </div>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr
            className="text-left font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]"
            style={{ backgroundColor: "#FBF4E6" }}
          >
            <th className="py-2 pl-5 pr-3">#</th>
            <th className="py-2 pr-3">Vendor</th>
            <th className="py-2 pr-3">Category</th>
            <th className="py-2 pr-3 text-right">Weddings</th>
            <th className="py-2 pr-3 text-right">Rating</th>
            <th className="py-2 pr-5 text-right">Avg. reply</th>
          </tr>
        </thead>
        <tbody>
          {TOP_VENDORS.map((v) => (
            <tr
              key={v.rank}
              className="border-t"
              style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
            >
              <td className="py-2.5 pl-5 pr-3 font-mono text-[11px] text-[#9E8245]">
                {v.rank.toString().padStart(2, "0")}
              </td>
              <td className="py-2.5 pr-3 text-[#2C2C2C]">{v.name}</td>
              <td className="py-2.5 pr-3 text-[#6a6a6a]">{v.category}</td>
              <td className="py-2.5 pr-3 text-right font-mono text-[#2C2C2C]">
                {v.weddings}
              </td>
              <td className="py-2.5 pr-3 text-right font-mono" style={{ color: PLANNER_PALETTE.goldDeep }}>
                ★ {v.rating.toFixed(1)}
              </td>
              <td className="py-2.5 pr-5 text-right font-mono text-[#5a5a5a]">{v.avgResponse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PlannerCard>
  );
}

function ResponseCard({
  title,
  hint,
  vendors,
  tone,
}: {
  title: string;
  hint: string;
  vendors: typeof FASTEST_VENDORS;
  tone: "ontrack" | "warning";
}) {
  const color =
    tone === "ontrack" ? PLANNER_PALETTE.ontrack : PLANNER_PALETTE.warning;
  return (
    <PlannerCard className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className="text-[17px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color }}>
          ● {hint}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {vendors.map((v) => (
          <li key={v.name} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] text-[#2C2C2C]">{v.name}</p>
              <p className="truncate text-[11.5px] text-[#6a6a6a]">{v.category}</p>
              {v.note && (
                <p className="mt-0.5 text-[11px] italic" style={{ color }}>
                  {v.note}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-[11.5px] text-[#2C2C2C]">
              {v.avgResponseHours}h
            </span>
          </li>
        ))}
      </ul>
    </PlannerCard>
  );
}

// --- Satisfaction ------------------------------------------------------------

function RecentReviewsCard() {
  return (
    <PlannerCard className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className="text-[17px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Recent reviews
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
          Last 5
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {RECENT_REVIEWS.map((r) => (
          <li
            key={r.id}
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: "#FBF4E6",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.2)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-[14px] text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {r.couple}
              </p>
              <span
                className="shrink-0 font-mono text-[11.5px]"
                style={{ color: PLANNER_PALETTE.goldDeep }}
              >
                {"★".repeat(r.rating)}
              </span>
            </div>
            <p
              className="mt-1.5 text-[13px] italic text-[#4a4a4a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              "{r.snippet}"
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
              {r.date}
            </p>
          </li>
        ))}
      </ul>
    </PlannerCard>
  );
}

function RatingDistributionCard() {
  const total = RATING_DISTRIBUTION.reduce((s, b) => s + b.count, 0);
  return (
    <PlannerCard className="p-5">
      <h3
        className="text-[17px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Rating distribution
      </h3>
      <ul className="mt-4 space-y-2">
        {RATING_DISTRIBUTION.map((b) => {
          const pct = total === 0 ? 0 : Math.round((b.count / total) * 100);
          return (
            <li key={b.stars} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-[11.5px] text-[#9E8245]">
                {b.stars}★
              </span>
              <div
                className="h-[6px] flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: PLANNER_PALETTE.goldDeep,
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-[#5a5a5a]">
                {b.count}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11.5px] italic text-[#8a8a8a]">
        {total} total reviews · {Math.round((RATING_DISTRIBUTION[0].count / total) * 100)}% are 5-star
      </p>
    </PlannerCard>
  );
}

function ReviewTrendCard() {
  return (
    <PlannerCard className="p-5">
      <h3
        className="text-[17px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Review trend
      </h3>
      <div className="mt-3">
        <Sparkline
          points={REVIEW_TREND.map((r) => r.rating)}
          tone="ontrack"
          domain={[4.4, 5.0]}
        />
        <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          <span>Q3 '24</span>
          <span>Q2 '26</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[12px]">
        <span className="text-[#5a5a5a]">
          Trend: <span className="text-[#2C2C2C]">+0.3</span> over 8 quarters
        </span>
        <span className="font-mono text-[11px] text-[#9E8245]">
          {REVIEW_TREND.reduce((s, r) => s + r.volume, 0)} reviews
        </span>
      </div>
    </PlannerCard>
  );
}

// --- Market insights ---------------------------------------------------------

function MarketBudgetCard() {
  const delta = MARKET_INSIGHTS.avgMarketBudgetDelta;
  const diff = MARKET_INSIGHTS.yourAvgBudget - MARKET_INSIGHTS.avgMarketBudget;
  const diffPct = Math.round((diff / MARKET_INSIGHTS.avgMarketBudget) * 100);
  return (
    <PlannerCard className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Avg. wedding budget
      </p>
      <p
        className="mt-3 text-[32px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        ${(MARKET_INSIGHTS.avgMarketBudget / 1000).toFixed(0)}K
      </p>
      <p className="mt-1 text-[11.5px] text-[#6a6a6a]">
        Your market · +{Math.round(delta * 100)}% vs last year
      </p>
      <div
        className="mt-4 rounded-lg px-3 py-2.5"
        style={{ backgroundColor: "#FBF4E6" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
          Your couples average
        </p>
        <p
          className="mt-1 text-[20px] leading-none text-[#2C2C2C]"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
        >
          ${(MARKET_INSIGHTS.yourAvgBudget / 1000).toFixed(0)}K
        </p>
        <p
          className="mt-1 text-[11px]"
          style={{ color: diff >= 0 ? PLANNER_PALETTE.ontrack : PLANNER_PALETTE.warning }}
        >
          {diff >= 0 ? "+" : ""}{diffPct}% vs market
        </p>
      </div>
    </PlannerCard>
  );
}

function PopularVenuesCard() {
  const trendGlyph = (t: "up" | "down" | "steady") =>
    t === "up" ? "↑" : t === "down" ? "↓" : "→";
  const trendColor = (t: "up" | "down" | "steady") =>
    t === "up"
      ? PLANNER_PALETTE.ontrack
      : t === "down"
        ? PLANNER_PALETTE.critical
        : "#8a8a8a";
  return (
    <PlannerCard className="p-5">
      <h3
        className="text-[17px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Popular venues this quarter
      </h3>
      <ul className="mt-4 space-y-2.5">
        {POPULAR_VENUES.map((v, i) => (
          <li key={v.name} className="flex items-baseline justify-between gap-3">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="font-mono text-[10.5px] text-[#9E8245]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-[13px] text-[#2C2C2C]">{v.name}</span>
            </div>
            <span className="shrink-0 font-mono text-[11.5px]" style={{ color: trendColor(v.trend) }}>
              {v.weddingsThisQuarter} {trendGlyph(v.trend)}
            </span>
          </li>
        ))}
      </ul>
    </PlannerCard>
  );
}

function TrendingCategoriesCard() {
  return (
    <PlannerCard className="p-5">
      <h3
        className="text-[17px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Trending vendor categories
      </h3>
      <ul className="mt-4 space-y-2.5">
        {TRENDING_CATEGORIES.map((c) => (
          <li key={c.label} className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-[#2C2C2C]">{c.label}</span>
            <span
              className="shrink-0 font-mono text-[11.5px]"
              style={{ color: PLANNER_PALETTE.ontrack }}
            >
              ↑ {Math.round(c.growth * 100)}%
            </span>
          </li>
        ))}
      </ul>
      <p
        className="mt-4 text-[11.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Couples are asking about these — consider expanding your roster.
      </p>
    </PlannerCard>
  );
}

function MarketShareCard() {
  const share = MARKET_INSIGHTS.marketShareEstimate;
  return (
    <PlannerCard className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex-1 min-w-[220px]">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
            Market share estimate
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <p
              className="text-[44px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {Math.round(share * 100)}%
            </p>
            <span className="font-mono text-[11px] text-[#9E8245]">
              ≈ 1 in {Math.round(1 / share)} weddings
            </span>
          </div>
          <p
            className="mt-2 text-[13px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {MARKET_INSIGHTS.marketShareSub}
          </p>
        </div>
        <div className="flex-1 min-w-[240px]">
          <div
            className="h-[12px] w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(44,44,44,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(share * 100)}%`,
                backgroundColor: PLANNER_PALETTE.goldDeep,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#6a6a6a]">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
              Radz Events
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Remaining tri-state market
            </span>
          </div>
        </div>
      </div>
    </PlannerCard>
  );
}
