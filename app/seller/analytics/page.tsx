import { Card, SectionHeading } from "@/components/seller/ui";
import {
  SELLER,
  SELLER_ANALYTICS,
  type DemographicSlice,
  type MonthDatum,
  type ProductInsight,
  type SeasonalMonth,
  type TopProductRow,
  type TrafficSource,
} from "@/lib/seller/seed";

const GOLD = "#C4A265";
const GOLD_DEEP = "#7a5a16";
const GOLD_SOFT = "#F5E6D0";
const INK = "#2C2C2C";
const BORDER = "rgba(196,162,101,0.25)";
const HAIRLINE = "rgba(44,44,44,0.08)";

const INSIGHT_META: Record<
  ProductInsight["tag"],
  { label: string; glyph: string; tone: string; bg: string }
> = {
  "best-converter": {
    label: "Best converter",
    glyph: "◎",
    tone: "#2C6E6A",
    bg: "rgba(217,232,228,0.55)",
  },
  "top-revenue": {
    label: "Highest revenue per sale",
    glyph: "$",
    tone: GOLD_DEEP,
    bg: "rgba(245,230,208,0.65)",
  },
  "trending-up": {
    label: "Trending up",
    glyph: "↑",
    tone: "#6B5BA8",
    bg: "rgba(232,222,245,0.55)",
  },
  "needs-attention": {
    label: "Needs attention",
    glyph: "⚠",
    tone: "#B23A2A",
    bg: "rgba(232,213,208,0.55)",
  },
};

function money(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function SellerAnalyticsPage() {
  return (
    <div className="pb-16">
      <PageHeader />

      <div className="space-y-10 px-8 py-8">
        <RevenueOverviewRow />
        <ProductPerformanceRow />
        <TrafficSourcesRow />
        <CustomerDemographicsRow />
        <SeasonalTrendsRow />
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <section className="border-b px-8 py-8" style={{ borderColor: HAIRLINE }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-[36px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.015em",
            }}
          >
            Analytics
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-600">
            How {SELLER.shopName} is performing — sales, traffic, and who is
            buying.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
            {SELLER_ANALYTICS.rangeLabel}
          </p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            <span aria-hidden>⤓</span> Export
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Row 1: Revenue Overview ─────────────────────────────────────────────────

function RevenueOverviewRow() {
  const A = SELLER_ANALYTICS;
  return (
    <section>
      <SectionHeading title="Revenue overview" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <MetricChartCard
          label="Total revenue YTD"
          value={money(A.revenueYTD)}
          delta={`+${A.revenueDeltaPct}% vs last year`}
          chart={
            <LineChart
              data={A.revenueByMonth}
              format={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
              tone={GOLD}
            />
          }
          footnote="Monthly revenue"
        />
        <MetricChartCard
          label="Orders YTD"
          value={String(A.ordersYTD)}
          delta={`Avg ${(A.ordersYTD / 10).toFixed(0)} / mo`}
          chart={<BarChart data={A.ordersByMonth} tone={GOLD} />}
          footnote="Monthly orders"
        />
        <MetricChartCard
          label="Average order value"
          value={money(A.averageOrderValue)}
          delta="Trending stable"
          chart={
            <LineChart
              data={A.aovByMonth}
              format={(v) => `$${v}`}
              tone={GOLD}
            />
          }
          footnote="Monthly AOV"
        />
        <MetricChartCard
          label="Conversion rate"
          value={`${A.conversionRatePct}%`}
          delta={`${A.shopViewsYTD.toLocaleString("en-US")} views → ${A.ordersYTD} orders`}
          chart={<ConversionFunnel views={A.shopViewsYTD} orders={A.ordersYTD} />}
          footnote="Shop views → orders"
        />
      </div>
    </section>
  );
}

function MetricChartCard({
  label,
  value,
  delta,
  chart,
  footnote,
}: {
  label: string;
  value: string;
  delta: string;
  chart: React.ReactNode;
  footnote: string;
}) {
  return (
    <Card>
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
            {label}
          </p>
        </div>
        <p
          className="text-[32px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
        <p className="text-[11.5px] text-emerald-700">
          <span aria-hidden>↑</span> {delta}
        </p>
        <div className="mt-auto">
          {chart}
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-stone-400">
            {footnote}
          </p>
        </div>
      </div>
    </Card>
  );
}

function LineChart({
  data,
  format,
  tone,
}: {
  data: MonthDatum[];
  format: (v: number) => string;
  tone: string;
}) {
  const active = data.filter((d) => d.value > 0);
  const w = 220;
  const h = 70;
  const pad = 4;
  const max = Math.max(...active.map((d) => d.value));
  const min = Math.min(...active.map((d) => d.value));
  const span = max - min || 1;
  const pts = active
    .map((d, i) => {
      const x = pad + (i / Math.max(active.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - ((d.value - min) / span) * (h - pad * 2);
      return { x, y, d };
    });
  const poly = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `M${pts[0].x.toFixed(1)},${h} L${poly.replace(/\s+/g, " L")} L${pts[pts.length - 1].x.toFixed(1)},${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block" role="img">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineFill)" />
        <polyline
          points={poly}
          fill="none"
          stroke={tone}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last.x} cy={last.y} r="2.5" fill={tone} />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
        <span>{active[0]?.shortLabel}</span>
        <span>
          {last.d.shortLabel} · {format(last.d.value)}
        </span>
      </div>
    </div>
  );
}

function BarChart({ data, tone }: { data: MonthDatum[]; tone: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex h-[70px] items-end gap-[3px]">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 items-end">
            <div
              className="w-full rounded-sm"
              style={{
                height: `${d.value > 0 ? Math.max((d.value / max) * 100, 4) : 3}%`,
                backgroundColor: d.value > 0 ? tone : "rgba(196,162,101,0.18)",
                opacity: d.value > 0 ? 0.9 : 1,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
        <span>Jan</span>
        <span>Dec</span>
      </div>
    </div>
  );
}

function ConversionFunnel({ views, orders }: { views: number; orders: number }) {
  const ratio = orders / views;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="w-10 font-mono text-[9.5px] uppercase tracking-wider text-stone-500">
          Views
        </span>
        <div className="h-4 flex-1 overflow-hidden rounded" style={{ backgroundColor: "rgba(196,162,101,0.14)" }}>
          <div className="h-full w-full" style={{ backgroundColor: GOLD, opacity: 0.5 }} />
        </div>
        <span className="font-mono text-[10px] text-stone-600">
          {views.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 font-mono text-[9.5px] uppercase tracking-wider text-stone-500">
          Orders
        </span>
        <div className="h-4 flex-1 overflow-hidden rounded" style={{ backgroundColor: "rgba(196,162,101,0.14)" }}>
          <div
            className="h-full"
            style={{
              width: `${Math.max(ratio * 100 * 6, 4)}%`,
              backgroundColor: GOLD,
            }}
          />
        </div>
        <span className="font-mono text-[10px] text-stone-600">
          {orders.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}

// ── Row 2: Product Performance ──────────────────────────────────────────────

function ProductPerformanceRow() {
  return (
    <section>
      <SectionHeading title="Product performance" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProductsTable rows={SELLER_ANALYTICS.topProducts} />
        </div>
        <div>
          <ProductInsightStack insights={SELLER_ANALYTICS.productInsights} />
        </div>
      </div>
    </section>
  );
}

function TopProductsTable({ rows }: { rows: TopProductRow[] }) {
  return (
    <Card tone="ivory">
      <div className="px-6 pt-5 pb-3">
        <p
          className="text-[15px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Top selling products
        </p>
        <p className="mt-0.5 text-[11.5px] text-stone-500">
          Ranked by units sold this year.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr
              className="border-t"
              style={{
                borderColor: HAIRLINE,
                backgroundColor: "rgba(245,230,208,0.35)",
              }}
            >
              <Th className="w-10 text-left">#</Th>
              <Th className="text-left">Product</Th>
              <Th className="w-20 text-right">Units</Th>
              <Th className="w-24 text-right">Revenue</Th>
              <Th className="w-20 text-right">Views</Th>
              <Th className="w-24 text-right">Conv.</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rank} className="border-t" style={{ borderColor: "rgba(44,44,44,0.06)" }}>
                <Td>
                  <span className="font-mono text-[12px] text-stone-500">
                    {row.rank}
                  </span>
                </Td>
                <Td>
                  <span
                    className="text-[14px] text-[#2C2C2C]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {row.name}
                  </span>
                </Td>
                <Td className="text-right font-mono text-[12.5px]">{row.units}</Td>
                <Td className="text-right font-mono text-[12.5px] text-[#2C2C2C]">
                  ${row.revenue.toLocaleString("en-US")}
                </Td>
                <Td className="text-right font-mono text-[12.5px] text-stone-500">
                  {row.views}
                </Td>
                <Td className="text-right font-mono text-[12.5px]">
                  <ConversionPill pct={row.conversionRatePct} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}

function ConversionPill({ pct }: { pct: number }) {
  const hot = pct >= 15;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
      style={{
        color: hot ? "#2C6E6A" : GOLD_DEEP,
        backgroundColor: hot ? "rgba(217,232,228,0.55)" : "rgba(245,230,208,0.55)",
      }}
    >
      {pct.toFixed(1)}%
    </span>
  );
}

function ProductInsightStack({ insights }: { insights: ProductInsight[] }) {
  return (
    <div className="flex h-full flex-col gap-3">
      {insights.map((ins) => {
        const meta = INSIGHT_META[ins.tag];
        return (
          <div
            key={ins.tag}
            className="flex gap-3 rounded-xl border p-4"
            style={{
              borderColor: BORDER,
              backgroundColor: "#FFFFFA",
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px]"
              style={{ backgroundColor: meta.bg, color: meta.tone }}
              aria-hidden
            >
              {meta.glyph}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-stone-500">
                {meta.label}
              </p>
              <p
                className="mt-1 text-[14.5px] leading-snug text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {ins.headline}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-stone-600">
                {ins.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Row 3: Traffic Sources ──────────────────────────────────────────────────

function TrafficSourcesRow() {
  return (
    <section>
      <SectionHeading title="Traffic sources" />
      <Card tone="ivory">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[240px_1fr]">
          <div
            className="flex items-center justify-center border-b p-6 md:border-b-0 md:border-r"
            style={{ borderColor: HAIRLINE }}
          >
            <DonutChart sources={SELLER_ANALYTICS.trafficSources} />
          </div>
          <div>
            <ul>
              {SELLER_ANALYTICS.trafficSources.map((src, idx) => (
                <TrafficRow key={src.key} source={src} first={idx === 0} />
              ))}
            </ul>
          </div>
        </div>
      </Card>
      <p className="mt-3 text-[11.5px] text-stone-500">
        <span className="italic">Where couples find your products.</span> AI
        recommendations are {SELLER_ANALYTICS.trafficSources[0].share}% of visits
        — the single largest channel.
      </p>
    </section>
  );
}

function DonutChart({ sources }: { sources: TrafficSource[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 78;
  const inner = 50;
  let angle = -Math.PI / 2;
  const slices = sources.map((src) => {
    const delta = (src.share / 100) * Math.PI * 2;
    const start = angle;
    const end = angle + delta;
    angle = end;
    const x1 = cx + outer * Math.cos(start);
    const y1 = cy + outer * Math.sin(start);
    const x2 = cx + outer * Math.cos(end);
    const y2 = cy + outer * Math.sin(end);
    const x3 = cx + inner * Math.cos(end);
    const y3 = cy + inner * Math.sin(end);
    const x4 = cx + inner * Math.cos(start);
    const y4 = cy + inner * Math.sin(start);
    const large = delta > Math.PI ? 1 : 0;
    const d = [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${outer} ${outer} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      "Z",
    ].join(" ");
    return { d, tone: src.tone, key: src.key };
  });
  return (
    <svg width={size} height={size} role="img" aria-label="Traffic sources donut">
      {slices.map((s) => (
        <path key={s.key} d={s.d} fill={s.tone} />
      ))}
      <circle cx={cx} cy={cy} r={inner} fill="#FFFFFA" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15,
          fontWeight: 500,
          fill: INK,
        }}
      >
        100%
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8.5,
          letterSpacing: "0.18em",
          fill: "#78716C",
        }}
      >
        VISITS
      </text>
    </svg>
  );
}

function TrafficRow({
  source,
  first,
}: {
  source: TrafficSource;
  first: boolean;
}) {
  return (
    <li
      className={`flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:gap-5 ${
        first ? "" : "border-t"
      }`}
      style={{ borderColor: "rgba(44,44,44,0.06)" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: source.tone }}
          aria-hidden
        />
        <div className="min-w-0">
          <p
            className="text-[14px] text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {source.label}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-stone-600">
            {source.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 md:w-[220px]">
        <div className="h-2 flex-1 overflow-hidden rounded" style={{ backgroundColor: "rgba(196,162,101,0.12)" }}>
          <div
            className="h-full"
            style={{
              width: `${source.share}%`,
              backgroundColor: source.tone,
            }}
          />
        </div>
        <span className="w-10 text-right font-mono text-[12.5px] text-[#2C2C2C]">
          {source.share}%
        </span>
      </div>
    </li>
  );
}

// ── Row 4: Customer Demographics ────────────────────────────────────────────

function CustomerDemographicsRow() {
  const D = SELLER_ANALYTICS.demographics;
  return (
    <section>
      <SectionHeading title="Customer demographics" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DemographicCard title="Wedding type" slices={D.weddingType} />
        <DemographicCard title="Guest count" slices={D.guestCount} />
        <DemographicCard title="Location" slices={D.location} />
        <DemographicCard title="Timeline from wedding date" slices={D.timeline} />
      </div>
      <div className="mt-4">
        <RepeatBuyersCard />
      </div>
    </section>
  );
}

function DemographicCard({
  title,
  slices,
}: {
  title: string;
  slices: DemographicSlice[];
}) {
  const max = Math.max(...slices.map((s) => s.share));
  return (
    <Card>
      <div className="p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
          {title}
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {slices.map((s) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between gap-3 pb-1">
                <span className="text-[13px] text-[#2C2C2C]">{s.label}</span>
                <span className="font-mono text-[11.5px] text-stone-500">
                  {s.share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded" style={{ backgroundColor: "rgba(196,162,101,0.16)" }}>
                <div
                  className="h-full"
                  style={{
                    width: `${(s.share / max) * 100}%`,
                    backgroundColor: GOLD,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function RepeatBuyersCard() {
  const D = SELLER_ANALYTICS.demographics;
  return (
    <div
      className="flex flex-col items-start gap-4 rounded-xl border px-6 py-5 md:flex-row md:items-center md:justify-between"
      style={{
        borderColor: BORDER,
        backgroundColor: "rgba(245,230,208,0.35)",
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-[18px]"
          style={{ backgroundColor: GOLD_SOFT, color: GOLD_DEEP }}
          aria-hidden
        >
          ⟳
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
            Repeat buyers
          </p>
          <p
            className="mt-1 text-[22px] leading-none text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {D.repeatBuyersPct}% order multiple products
          </p>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-snug text-stone-600">
            {D.repeatBuyersNote}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Row 5: Seasonal Trends ──────────────────────────────────────────────────

function SeasonalTrendsRow() {
  return (
    <section>
      <SectionHeading title="Seasonal trends" />
      <Card tone="ivory">
        <div className="p-6">
          <p className="text-[13px] text-stone-600">
            Which months see the most orders — darker cells are busier.
          </p>
          <SeasonalHeatmap months={SELLER_ANALYTICS.seasonalTrend} />
          <div className="mt-5 grid grid-cols-1 gap-4 border-t pt-5 md:grid-cols-2" style={{ borderColor: HAIRLINE }}>
            <SeasonalCallout
              label="Peak ordering"
              headline="Jan–Mar and Jul–Sep"
              detail="Couples order for spring/summer weddings in Q1 and for fall/winter weddings in Q3."
              tone={GOLD_DEEP}
            />
            <SeasonalCallout
              label="Lead time insight"
              headline="4–6 months before"
              detail={SELLER_ANALYTICS.leadTimeInsight}
              tone="#2C6E6A"
            />
          </div>
        </div>
      </Card>
    </section>
  );
}

function SeasonalHeatmap({ months }: { months: SeasonalMonth[] }) {
  return (
    <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
      {months.map((m) => {
        const op = 0.12 + m.intensity * 0.8;
        return (
          <div key={m.label} className="flex flex-col items-center gap-1.5">
            <div
              className="flex h-16 w-full items-end justify-center rounded-md border"
              style={{
                backgroundColor: `rgba(196,162,101,${op.toFixed(2)})`,
                borderColor: "rgba(196,162,101,0.35)",
              }}
              title={`${m.label}: ${Math.round(m.intensity * 100)}%`}
            >
              <span
                className="pb-1.5 font-mono text-[10px]"
                style={{ color: m.intensity > 0.6 ? "#FFFFFA" : GOLD_DEEP }}
              >
                {Math.round(m.intensity * 100)}
              </span>
            </div>
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-stone-500">
              {m.shortLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SeasonalCallout({
  label,
  headline,
  detail,
  tone,
}: {
  label: string;
  headline: string;
  detail: string;
  tone: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: tone }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-[17px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {headline}
      </p>
      <p className="mt-1 text-[12.5px] leading-snug text-stone-600">{detail}</p>
    </div>
  );
}
