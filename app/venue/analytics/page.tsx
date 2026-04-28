import {
  MetaPill,
  SectionHeader,
  TrendBadge,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import {
  ANANYA_ATTRIBUTED_BOOKINGS,
  ANANYA_ATTRIBUTED_REVENUE,
  BENCHMARK_NOTE,
  BENCHMARK_STATS,
  CEREMONY_BREAKDOWN,
  DURATION_BREAKDOWN,
  GUEST_HISTOGRAM,
  KEY_METRICS,
  MONTHLY_PATTERN,
  PLANNER_INSIGHT,
  PLANNER_RANKINGS,
  SOURCE_ATTRIBUTION,
  VENDOR_RANKINGS,
  VENUE_SUBSCRIPTION_MONTHLY,
  type CeremonyBreakdown,
  type DurationBreakdown,
  type Histogram,
  type KeyMetric,
  type MonthlyBar,
  type PlannerRank,
  type SourceAttribution,
  type VendorRank,
  type BenchmarkStat,
} from "@/lib/venue/analytics-seed";

export const metadata = {
  title: "Analytics — Ananya Venue",
};

export default function VenueAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8">
      <PageHeader />

      {/* Row 1: Key Metrics */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KEY_METRICS.map((m) => (
          <MetricCard key={m.key} metric={m} />
        ))}
      </section>

      {/* Row 2: Demographics */}
      <section className="mt-12">
        <SectionHeader
          title="Wedding Demographics"
          eyebrow="Last 12 months · 47 weddings"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CeremonyDonut data={CEREMONY_BREAKDOWN} />
          <GuestHistogram data={GUEST_HISTOGRAM} />
          <DurationChart data={DURATION_BREAKDOWN} />
          <SeasonalChart data={MONTHLY_PATTERN} />
        </div>
      </section>

      {/* Row 3: Source Attribution */}
      <section className="mt-12">
        <SectionHeader
          title="Source Attribution"
          eyebrow="Where your South Asian wedding leads come from"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <SourcePie sources={SOURCE_ATTRIBUTION} />
          <SourceTable sources={SOURCE_ATTRIBUTION} />
        </div>
      </section>

      {/* Row 4: Vendor & Planner Insights */}
      <section className="mt-12">
        <SectionHeader
          title="Vendors & Planners at Your Venue"
          eyebrow="Who shows up, who brings the weddings"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <VendorRanks ranks={VENDOR_RANKINGS} />
          </div>
          <div className="space-y-5 lg:col-span-2">
            <PlannerRanks ranks={PLANNER_RANKINGS} />
            <PlannerInsight text={PLANNER_INSIGHT} />
          </div>
        </div>
      </section>

      {/* Row 5: Competitive Benchmarking */}
      <section className="mt-12 mb-16">
        <SectionHeader
          title="Competitive Benchmarking"
          eyebrow="Premium · vs. similar NJ venues"
        />
        <div className="mt-5">
          <BenchmarkPanel stats={BENCHMARK_STATS} note={BENCHMARK_NOTE} />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- Header ---------------------------------- */

function PageHeader() {
  const roiMultiple = Math.round(
    ANANYA_ATTRIBUTED_REVENUE / (VENUE_SUBSCRIPTION_MONTHLY * 12)
  );
  return (
    <VenueCard className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-5 p-8">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Venue analytics
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Performance & market position
          </h1>
          <p
            className="mt-2 max-w-[540px] text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            How The Legacy Castle is performing in the South Asian wedding market
            — demand, conversion, source ROI, and peer benchmarks.
          </p>
        </div>
        <div
          className="max-w-[380px] rounded-2xl border px-5 py-4"
          style={{
            borderColor: "rgba(196,162,101,0.40)",
            backgroundColor: "#FBF1DF",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
            Ananya ROI — year to date
          </p>
          <p
            className="mt-2 text-[28px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            ${(ANANYA_ATTRIBUTED_REVENUE / 1_000_000).toFixed(1)}M booked
          </p>
          <p className="mt-1.5 text-[12.5px] text-[#5a4a30]">
            <span className="font-mono text-[12px] text-[#2C2C2C]">
              {ANANYA_ATTRIBUTED_BOOKINGS}
            </span>{" "}
            weddings attributed to Ananya · ~
            <span className="font-mono text-[12px] text-[#2C2C2C]">
              {roiMultiple.toLocaleString()}×
            </span>{" "}
            return on ${VENUE_SUBSCRIPTION_MONTHLY}/mo subscription
          </p>
        </div>
      </div>
    </VenueCard>
  );
}

/* ----------------------------- Metric card ------------------------------- */

function MetricCard({ metric }: { metric: KeyMetric }) {
  return (
    <VenueCard className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {metric.label}
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
          {metric.value}
        </p>
        <TrendBadge delta={metric.delta} suffix={metric.deltaSuffix} />
      </div>
      <p
        className="mt-2 text-[11.5px] text-[#7a7a7a]"
        style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
      >
        {metric.deltaLabel}
        {metric.sub && ` · ${metric.sub}`}
      </p>
      <div className="mt-4">
        <Sparkline values={metric.sparkline} />
      </div>
    </VenueCard>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 180;
  const h = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const stepX = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
    >
      <path d={d} fill="none" stroke={VENUE_PALETTE.gold} strokeWidth={1.5} />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={VENUE_PALETTE.goldDeep} />
    </svg>
  );
}

/* ---------------------------- Ceremony donut ------------------------------ */

const CEREMONY_COLORS: Record<string, string> = {
  Hindu: "#C4A265",
  Muslim: "#9E8245",
  Sikh: "#E8D5D0",
  Interfaith: "#D4B88A",
  Christian: "#5a5a5a",
};

function CeremonyDonut({ data }: { data: CeremonyBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.weddings, 0);
  let cursor = 0;
  const stops = data
    .map((d) => {
      const start = (cursor / total) * 360;
      cursor += d.weddings;
      const end = (cursor / total) * 360;
      return `${CEREMONY_COLORS[d.type] ?? "#ccc"} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <VenueCard className="p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Ceremony type
      </p>
      <div className="mt-4 flex items-center gap-6">
        <div
          className="relative grid h-[140px] w-[140px] shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          aria-hidden
        >
          <div
            className="grid h-[96px] w-[96px] place-items-center rounded-full bg-white"
            style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)" }}
          >
            <div className="text-center leading-none">
              <p
                className="font-mono text-[22px] text-[#2C2C2C]"
                style={{ fontWeight: 500 }}
              >
                {total}
              </p>
              <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                Weddings
              </p>
            </div>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {data.map((d) => (
            <li
              key={d.type}
              className="flex items-center gap-2.5 text-[13px]"
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: CEREMONY_COLORS[d.type] ?? "#ccc" }}
              />
              <span className="min-w-0 flex-1 truncate text-[#2C2C2C]">
                {d.type}
              </span>
              <span className="font-mono text-[12px] text-[#6a6a6a]">
                {d.percent}%
              </span>
              <span className="font-mono text-[11px] text-[#9a9a9a]">
                ({d.weddings})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </VenueCard>
  );
}

/* ---------------------------- Histograms ---------------------------------- */

function GuestHistogram({ data }: { data: Histogram[] }) {
  const max = Math.max(...data.map((d) => d.weddings));
  return (
    <VenueCard className="p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Guest count distribution
      </p>
      <ul className="mt-5 space-y-3.5">
        {data.map((d) => {
          const pct = Math.round((d.weddings / max) * 100);
          return (
            <li key={d.bucket} className="flex items-center gap-3">
              <span className="w-[78px] shrink-0 text-[12.5px] text-[#5a5a5a]">
                {d.bucket}
              </span>
              <div
                className="h-[10px] flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: VENUE_PALETTE.gold,
                  }}
                />
              </div>
              <span className="w-[32px] shrink-0 text-right font-mono text-[12px] text-[#2C2C2C]">
                {d.weddings}
              </span>
            </li>
          );
        })}
      </ul>
    </VenueCard>
  );
}

function DurationChart({ data }: { data: DurationBreakdown[] }) {
  const max = Math.max(...data.map((d) => d.weddings));
  return (
    <VenueCard className="p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Duration breakdown
      </p>
      <div className="mt-5 flex items-end justify-around gap-5" style={{ height: 120 }}>
        {data.map((d) => {
          const pct = (d.weddings / max) * 100;
          return (
            <div
              key={d.duration}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="font-mono text-[12px] text-[#2C2C2C]">
                {d.weddings}
              </span>
              <div
                className="w-full max-w-[64px] rounded-t-md"
                style={{
                  height: `${pct}%`,
                  minHeight: 4,
                  backgroundColor: VENUE_PALETTE.gold,
                  opacity: 0.6 + (pct / 100) * 0.4,
                }}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#9E8245]">
                {d.duration}
              </span>
            </div>
          );
        })}
      </div>
    </VenueCard>
  );
}

function SeasonalChart({ data }: { data: MonthlyBar[] }) {
  const max = Math.max(...data.map((d) => d.weddings));
  return (
    <VenueCard className="p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
          Seasonal pattern
        </p>
        <div className="flex items-center gap-3 text-[10.5px] text-[#6a6a6a]">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: VENUE_PALETTE.goldDeep }}
            />
            Peak
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: "#D6CAB0" }}
            />
            Low
          </span>
        </div>
      </div>
      <div
        className="mt-5 grid grid-cols-12 items-end gap-1.5"
        style={{ height: 120 }}
      >
        {data.map((d) => {
          const pct = (d.weddings / max) * 100;
          const bg = d.isPeak
            ? VENUE_PALETTE.goldDeep
            : d.isLow
              ? "#D6CAB0"
              : VENUE_PALETTE.gold;
          return (
            <div key={d.month} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="font-mono text-[9.5px] text-[#2C2C2C]">
                {d.weddings}
              </span>
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${pct}%`,
                  minHeight: 2,
                  backgroundColor: bg,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-12 gap-1.5">
        {data.map((d) => (
          <div
            key={d.month}
            className="text-center font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#9E8245]"
          >
            {d.month.split(" ")[0]}
          </div>
        ))}
      </div>
    </VenueCard>
  );
}

/* --------------------------- Source attribution -------------------------- */

function SourcePie({ sources }: { sources: SourceAttribution[] }) {
  const colors = [VENUE_PALETTE.gold, VENUE_PALETTE.goldDeep, "#9E8245", "#5a5a5a"];
  const total = sources.reduce((s, x) => s + x.inquiries, 0);
  let cursor = 0;
  const stops = sources
    .map((s, i) => {
      const start = (cursor / total) * 360;
      cursor += s.inquiries;
      const end = (cursor / total) * 360;
      return `${colors[i % colors.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  const ananyaRevenue = sources
    .filter((s) => s.isAnanya)
    .reduce((sum, s) => sum + s.revenue, 0);

  return (
    <VenueCard className="p-6 lg:col-span-2">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Inquiry mix
      </p>
      <div className="mt-4 flex items-center gap-5">
        <div
          className="relative grid h-[140px] w-[140px] shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          aria-hidden
        >
          <div
            className="grid h-[96px] w-[96px] place-items-center rounded-full bg-white"
            style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)" }}
          >
            <div className="text-center leading-none">
              <p
                className="font-mono text-[22px] text-[#2C2C2C]"
                style={{ fontWeight: 500 }}
              >
                {total}
              </p>
              <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                Inquiries
              </p>
            </div>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {sources.map((s, i) => {
            const pct = Math.round((s.inquiries / total) * 100);
            return (
              <li
                key={s.source}
                className="flex items-center gap-2.5 text-[12.5px]"
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-[#2C2C2C]">
                  {s.source}
                </span>
                <span className="font-mono text-[11.5px] text-[#6a6a6a]">
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        className="mt-5 rounded-xl px-4 py-3 text-[12px]"
        style={{ backgroundColor: "#FBF1DF", color: "#5a4a30" }}
      >
        <span aria-hidden className="mr-1.5 text-[11px] text-[#9E8245]">
          ✦
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          Ananya total
        </span>{" "}
        <span className="text-[#2C2C2C]">
          ${(ananyaRevenue / 1_000_000).toFixed(2)}M in booked revenue attributed
        </span>
      </div>
    </VenueCard>
  );
}

function SourceTable({ sources }: { sources: SourceAttribution[] }) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`;
  return (
    <VenueCard className="lg:col-span-3">
      <div className="overflow-hidden rounded-2xl">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr
              style={{
                backgroundColor: "#F5EFE3",
                color: VENUE_PALETTE.goldDeep,
              }}
            >
              <th className="py-3 pl-5 font-mono text-[10px] uppercase tracking-[0.22em]">
                Source
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Inquiries
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Tours
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Booked
              </th>
              <th className="py-3 pr-5 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr
                key={s.source}
                className={i === 0 ? "" : "border-t"}
                style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
              >
                <td className="py-3.5 pl-5">
                  <div className="flex items-center gap-2">
                    {s.isAnanya && (
                      <span
                        className="inline-block h-[6px] w-[6px] rounded-full"
                        style={{ backgroundColor: VENUE_PALETTE.gold }}
                        aria-hidden
                      />
                    )}
                    <span className="text-[#2C2C2C]">{s.source}</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-mono text-[12px] text-[#2C2C2C]">
                  {s.inquiries}
                </td>
                <td className="py-3.5 text-right font-mono text-[12px] text-[#2C2C2C]">
                  {s.tours}
                </td>
                <td className="py-3.5 text-right font-mono text-[12px] text-[#2C2C2C]">
                  {s.booked}
                </td>
                <td
                  className="py-3.5 pr-5 text-right font-mono text-[13px]"
                  style={{
                    color: s.isAnanya ? VENUE_PALETTE.goldDeep : "#2C2C2C",
                    fontWeight: s.isAnanya ? 600 : 400,
                  }}
                >
                  {fmt(s.revenue)}
                </td>
              </tr>
            ))}
            <tr
              style={{
                backgroundColor: "#FBF1DF",
                borderTop: `2px solid ${VENUE_PALETTE.hairline}`,
              }}
            >
              <td
                className="py-3.5 pl-5 font-mono text-[10.5px] uppercase tracking-[0.22em]"
                style={{ color: VENUE_PALETTE.goldDeep }}
              >
                Total
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {sources.reduce((s, x) => s + x.inquiries, 0)}
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {sources.reduce((s, x) => s + x.tours, 0)}
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {sources.reduce((s, x) => s + x.booked, 0)}
              </td>
              <td className="py-3.5 pr-5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {fmt(sources.reduce((s, x) => s + x.revenue, 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VenueCard>
  );
}

/* -------------------------- Vendors & planners --------------------------- */

function VendorRanks({ ranks }: { ranks: VendorRank[] }) {
  return (
    <VenueCard className="p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Top vendors at your venue
      </p>
      <div className="mt-5 space-y-6">
        {ranks.map((r) => {
          const max = Math.max(...r.vendors.map((v) => v.weddings));
          return (
            <div key={r.category}>
              <div className="flex items-baseline justify-between">
                <p
                  className="text-[17px] text-[#2C2C2C]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {r.category}
                </p>
                <MetaPill tone="gold">Ranked by frequency</MetaPill>
              </div>
              <ul className="mt-3 space-y-2">
                {r.vendors.map((v, i) => {
                  const pct = Math.round((v.weddings / max) * 100);
                  return (
                    <li key={v.name} className="flex items-center gap-3">
                      <span className="w-[16px] shrink-0 font-mono text-[11px] text-[#9E8245]">
                        {i + 1}
                      </span>
                      <span className="min-w-[170px] truncate text-[13px] text-[#2C2C2C]">
                        {v.name}
                      </span>
                      <div
                        className="h-[6px] flex-1 overflow-hidden rounded-full"
                        style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              i === 0 ? VENUE_PALETTE.goldDeep : VENUE_PALETTE.gold,
                          }}
                        />
                      </div>
                      <span className="w-[54px] shrink-0 text-right font-mono text-[11.5px] text-[#2C2C2C]">
                        {v.weddings} wed.
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </VenueCard>
  );
}

function PlannerRanks({ ranks }: { ranks: PlannerRank[] }) {
  return (
    <VenueCard className="p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Top planners bringing weddings here
      </p>
      <ul className="mt-5 space-y-3.5">
        {ranks.map((r, i) => (
          <li key={r.name} className="flex items-center gap-3">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[11px] text-[#7a5a1a]"
              style={{
                backgroundColor: i === 0 ? "#F5E6D0" : "#F2EEE5",
                boxShadow:
                  i === 0
                    ? "inset 0 0 0 1px rgba(196,162,101,0.5)"
                    : "inset 0 0 0 1px rgba(44,44,44,0.06)",
              }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[15px] text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {r.name}
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                {r.share}% share
              </p>
            </div>
            <span className="font-mono text-[13px] text-[#2C2C2C]">
              {r.weddings}
            </span>
          </li>
        ))}
      </ul>
    </VenueCard>
  );
}

function PlannerInsight({ text }: { text: string }) {
  return (
    <VenueCard tone="champagne" className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
        Insight
      </p>
      <p
        className="mt-2 text-[14px] leading-relaxed italic text-[#5a4220]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {text}
      </p>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium transition-colors"
        style={{
          backgroundColor: VENUE_PALETTE.charcoal,
          color: "#FAF8F5",
        }}
      >
        Reach out to Radz Events
        <span aria-hidden>→</span>
      </button>
    </VenueCard>
  );
}

/* ------------------------------ Benchmarking ------------------------------ */

function BenchmarkPanel({
  stats,
  note,
}: {
  stats: BenchmarkStat[];
  note: string;
}) {
  return (
    <VenueCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[17px] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Your venue vs. comparable NJ properties
          </p>
          <p
            className="mt-1 text-[12.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {note}
          </p>
        </div>
        <MetaPill tone="gold">Premium</MetaPill>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {stats.map((s) => (
          <li
            key={s.label}
            className="rounded-xl border p-4"
            style={{ borderColor: VENUE_PALETTE.hairline }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] text-[#2C2C2C]">{s.label}</p>
              <TrendBadge delta={s.delta} suffix="%" />
            </div>
            <div className="mt-3 space-y-2.5">
              <BenchmarkBar
                label="You"
                value={s.you}
                pct={s.youPct ?? 0}
                tone="primary"
              />
              <BenchmarkBar
                label="Market"
                value={s.market}
                pct={s.marketPct ?? 0}
                tone="muted"
              />
            </div>
          </li>
        ))}
      </ul>
    </VenueCard>
  );
}

function BenchmarkBar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "primary" | "muted";
}) {
  const color = tone === "primary" ? VENUE_PALETTE.goldDeep : "#C8BA9E";
  return (
    <div className="flex items-center gap-3">
      <span className="w-[52px] shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
        {label}
      </span>
      <div
        className="h-[8px] flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.max(3, pct)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="w-[60px] shrink-0 text-right font-mono text-[12px] text-[#2C2C2C]">
        {value}
      </span>
    </div>
  );
}
