"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardHeader, PageHeader } from "@/components/vendor-portal/ui";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";
import {
  PORTFOLIO_SEED,
  type PortfolioItem,
  type PortfolioMedia,
} from "@/lib/vendor-portal/portfolio-seed";
import {
  BENCHMARKS,
  BOOKINGS_90D,
  INQUIRIES_90D,
  PORTFOLIO_PERFORMANCE,
  PROFILE_VIEWS_90D,
  REFERRAL_SOURCES,
  SEARCH_APPEARANCES_90D,
  SEARCH_TERMS,
  SELECTION_ADDS_90D,
} from "@/lib/vendor-portal/analytics-seed";

type Range = 30 | 60 | 90;

// ── Small helpers ────────────────────────────────────────────
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const slice = (xs: number[], r: Range) => xs.slice(-r);
const fmt = (n: number) => n.toLocaleString();

function pctDelta(current: number, prior: number): number {
  if (prior === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - prior) / prior) * 100);
}

// Downsample a daily series to N display buckets, summing within each bucket.
// Keeps the chart readable at 30/60/90 day ranges.
function bucket(values: number[], buckets: number): number[] {
  const n = values.length;
  if (n <= buckets) return values.slice();
  const size = n / buckets;
  const out: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const start = Math.floor(i * size);
    const end = Math.floor((i + 1) * size);
    let s = 0;
    for (let j = start; j < end; j++) s += values[j];
    out.push(s);
  }
  return out;
}

// ── Page ─────────────────────────────────────────────────────
export default function VendorAnalyticsPage() {
  const vendor = usePortalVendor();
  const [range, setRange] = useState<Range>(30);

  const data = useMemo(() => {
    const views = slice(PROFILE_VIEWS_90D, range);
    const search = slice(SEARCH_APPEARANCES_90D, range);
    const inquiries = slice(INQUIRIES_90D, range);
    const adds = slice(SELECTION_ADDS_90D, range);
    const bookings = slice(BOOKINGS_90D, range);

    // Prior equal-length window for the delta calc.
    const priorStart = Math.max(0, 90 - range * 2);
    const priorEnd = 90 - range;
    const prior = {
      views: sum(PROFILE_VIEWS_90D.slice(priorStart, priorEnd)),
      search: sum(SEARCH_APPEARANCES_90D.slice(priorStart, priorEnd)),
      inquiries: sum(INQUIRIES_90D.slice(priorStart, priorEnd)),
      adds: sum(SELECTION_ADDS_90D.slice(priorStart, priorEnd)),
      bookings: sum(BOOKINGS_90D.slice(priorStart, priorEnd)),
    };

    const totalViews = sum(views);
    const totalInquiries = sum(inquiries);
    const totalBookings = sum(bookings);
    const conversion =
      totalInquiries > 0 ? (totalBookings / totalInquiries) * 100 : 0;
    const priorConversion =
      prior.inquiries > 0 ? (prior.bookings / prior.inquiries) * 100 : 0;

    return {
      views,
      search,
      inquiries,
      adds,
      bookings,
      totals: {
        views: totalViews,
        search: sum(search),
        inquiries: totalInquiries,
        adds: sum(adds),
        bookings: totalBookings,
      },
      deltas: {
        views: pctDelta(totalViews, prior.views),
        search: pctDelta(sum(search), prior.search),
        inquiries: pctDelta(totalInquiries, prior.inquiries),
        adds: pctDelta(sum(adds), prior.adds),
      },
      conversion,
      conversionDelta: Math.round((conversion - priorConversion) * 10) / 10,
    };
  }, [range]);

  const tips = useMemo(
    () =>
      buildTips(PORTFOLIO_SEED, {
        responseTimeHours: vendor.response_time_hours,
        profileCompleteness: vendor.profile_completeness,
      }),
    [vendor.response_time_hours, vendor.profile_completeness],
  );

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Analytics"
        title={`Last ${range} days`}
        description="A quiet read on how couples are finding and responding to your profile — so you can keep refining your craft and presentation."
        actions={<RangePicker range={range} onChange={setRange} />}
      />

      <div className="space-y-6 px-8 py-6">
        {/* ── Top metric tiles ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricTile
            label="Profile views"
            value={fmt(data.totals.views)}
            delta={data.deltas.views}
            sub="couples who opened your page"
          />
          <MetricTile
            label="Search appearances"
            value={fmt(data.totals.search)}
            delta={data.deltas.search}
            sub="shown in marketplace searches"
          />
          <MetricTile
            label="Selection adds"
            value={fmt(data.totals.adds)}
            delta={data.deltas.adds}
            sub="saved to couples' shortlists"
          />
          <MetricTile
            label="Inquiries"
            value={fmt(data.totals.inquiries)}
            delta={data.deltas.inquiries}
            sub="messages received"
          />
          <MetricTile
            label="Inquiry → booking"
            value={`${data.conversion.toFixed(1)}%`}
            delta={data.conversionDelta}
            deltaSuffix="pp"
            sub={`${data.totals.bookings} of ${data.totals.inquiries} converted`}
          />
        </div>

        {/* ── Charts row ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Profile views"
              hint="Daily view count over the window. Weekends tend to be highest — couples plan on the weekend."
            />
            <div className="px-5 pb-5 pt-4">
              <LineChart
                values={bucket(data.views, Math.min(range, 45))}
                height={180}
              />
              <AxisLabels range={range} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Inquiries received"
              hint="Each bar is a day. Empty days are normal — couples inquire in clusters."
            />
            <div className="px-5 pb-5 pt-4">
              <BarChart values={data.inquiries} height={180} />
              <AxisLabels range={range} />
            </div>
          </Card>
        </div>

        {/* ── Referral sources + search terms ──────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Top referral sources"
              hint="Where couples were just before they landed on your profile."
            />
            <ul className="space-y-3.5 px-5 py-5">
              {REFERRAL_SOURCES.map((s) => (
                <li key={s.name}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <div className="min-w-0">
                      <p className="truncate text-[#2C2C2C]">{s.name}</p>
                      {s.hint && (
                        <p className="mt-0.5 text-[11.5px] text-stone-500">
                          {s.hint}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[12px] text-[#2C2C2C]">
                      {s.value}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F5E6D0]">
                    <div
                      className="h-full rounded-full bg-[#C4A265]"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Search terms you appeared for"
              hint="The 30-day window. Useful for checking whether your category and city are reaching the right couples."
            />
            <ul className="space-y-3 px-5 py-5">
              {SEARCH_TERMS.map((t) => {
                const maxAppearances = Math.max(
                  ...SEARCH_TERMS.map((x) => x.appearances),
                );
                return (
                  <li key={t.term} className="flex items-center gap-3">
                    <span
                      className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-[#2C2C2C]"
                      title={t.term}
                    >
                      "{t.term}"
                    </span>
                    <div className="h-1 w-20 overflow-hidden rounded-full bg-[#F5E6D0] sm:w-28">
                      <div
                        className="h-full rounded-full bg-[#C0392B]"
                        style={{
                          width: `${(t.appearances / maxAppearances) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[11.5px] text-stone-500">
                      {t.appearances}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* ── Portfolio performance ────────────────────────── */}
        <Card>
          <CardHeader
            title="Portfolio performance"
            hint="Which pieces of your work are doing the most work for you. Sort order is by 30-day views."
            action={
              <Link
                href="/vendor/portfolio"
                className="text-[12px] text-[#9E8245] hover:underline"
              >
                Manage portfolio →
              </Link>
            }
          />
          <PortfolioTable items={PORTFOLIO_SEED} />
        </Card>

        {/* ── Profile tips ─────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
                Profile tips
              </p>
              <h2
                className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                Small moves, drawn from your numbers.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Range picker ─────────────────────────────────────────────
function RangePicker({
  range,
  onChange,
}: {
  range: Range;
  onChange: (r: Range) => void;
}) {
  const opts: Range[] = [30, 60, 90];
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border bg-white"
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    >
      {opts.map((o, idx) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`h-9 px-3.5 text-[12.5px] transition-colors ${
            range === o
              ? "bg-[#2C2C2C] text-[#FAF8F5]"
              : "text-stone-600 hover:bg-[#F5E6D0]"
          } ${idx !== 0 ? "border-l" : ""}`}
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          {o} days
        </button>
      ))}
    </div>
  );
}

// ── Metric tile ──────────────────────────────────────────────
function MetricTile({
  label,
  value,
  sub,
  delta,
  deltaSuffix = "%",
}: {
  label: string;
  value: string;
  sub?: string;
  delta: number;
  deltaSuffix?: string;
}) {
  const direction: "up" | "down" | "flat" =
    delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const trendColor =
    direction === "up"
      ? "text-emerald-600"
      : direction === "down"
        ? "text-[#C0392B]"
        : "text-stone-500";
  const trendGlyph =
    direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <Card className="p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>
      <p
        className="mt-2 text-[28px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-[11.5px] ${trendColor}`}>
          {trendGlyph} {delta > 0 ? "+" : ""}
          {delta}
          {deltaSuffix} vs prior
        </span>
      </div>
      {sub && <p className="mt-1 text-[11.5px] text-stone-500">{sub}</p>}
    </Card>
  );
}

// ── Line chart ───────────────────────────────────────────────
function LineChart({
  values,
  height,
}: {
  values: number[];
  height: number;
}) {
  const width = 640;
  const padX = 6;
  const padY = 10;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? (width - padX * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = padX + i * step;
    const y = height - padY - (v / max) * (height - padY * 2);
    return { x, y };
  });
  const linePath =
    "M" + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
  const areaPath =
    linePath +
    ` L${(width - padX).toFixed(1)},${height - padY} L${padX.toFixed(1)},${
      height - padY
    } Z`;
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-[180px] w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="views-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C4A265" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#C4A265" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Horizontal guide lines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={padX}
          x2={width - padX}
          y1={padY + (height - padY * 2) * p}
          y2={padY + (height - padY * 2) * p}
          stroke="rgba(44,44,44,0.06)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={areaPath} fill="url(#views-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="#C4A265"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r="3.5" fill="#C4A265" />
          <circle cx={last.x} cy={last.y} r="1.5" fill="#FAF8F5" />
        </>
      )}
    </svg>
  );
}

// ── Bar chart ────────────────────────────────────────────────
function BarChart({
  values,
  height,
}: {
  values: number[];
  height: number;
}) {
  const max = Math.max(1, ...values);
  return (
    <div
      className="flex items-end gap-[2px]"
      style={{ height }}
    >
      {values.map((v, i) => {
        const h = v === 0 ? 2 : Math.max(4, (v / max) * height);
        const isEmpty = v === 0;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-[2px] transition-colors ${
              isEmpty
                ? "bg-[#F5E6D0]"
                : "bg-[#C4A265]/80 hover:bg-[#C4A265]"
            }`}
            style={{ height: `${h}px` }}
            title={`Day ${i + 1}: ${v} ${v === 1 ? "inquiry" : "inquiries"}`}
          />
        );
      })}
    </div>
  );
}

function AxisLabels({ range }: { range: Range }) {
  return (
    <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-stone-400">
      <span>{range}d ago</span>
      <span>{Math.round(range / 2)}d</span>
      <span>today</span>
    </div>
  );
}

// ── Portfolio performance table ──────────────────────────────
function PortfolioTable({ items }: { items: PortfolioItem[] }) {
  const ranked = items
    .map((item) => {
      const perf = PORTFOLIO_PERFORMANCE[item.id];
      return {
        item,
        perf: perf ?? {
          id: item.id,
          views30d: 0,
          avgDwellSec: 0,
          inquiriesAttributed: 0,
          trend: "flat" as const,
        },
      };
    })
    .sort((a, b) => b.perf.views30d - a.perf.views30d);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[rgba(44,44,44,0.06)] text-left font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500">
            <th className="px-5 py-3 font-medium">Piece</th>
            <th className="px-3 py-3 font-medium">Event</th>
            <th className="px-3 py-3 font-medium">Views · 30d</th>
            <th className="px-3 py-3 font-medium">Avg. dwell</th>
            <th className="px-3 py-3 font-medium">Inquiries</th>
            <th className="px-5 py-3 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ item, perf }) => {
            const trendGlyph =
              perf.trend === "up" ? "↑" : perf.trend === "down" ? "↓" : "→";
            const trendColor =
              perf.trend === "up"
                ? "text-emerald-600"
                : perf.trend === "down"
                  ? "text-[#C0392B]"
                  : "text-stone-500";
            return (
              <tr
                key={item.id}
                className="border-b border-[rgba(44,44,44,0.04)] last:border-0"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <MediaSwatch media={item.media[0]} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-[#2C2C2C]">
                        {item.title}
                      </p>
                      {item.venue && (
                        <p className="mt-0.5 truncate text-[11.5px] italic text-stone-500">
                          {item.venue}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[12px] text-stone-600">
                  {item.eventTypes.slice(0, 2).join(", ")}
                </td>
                <td className="px-3 py-3 font-mono text-[12.5px] text-[#2C2C2C]">
                  {fmt(perf.views30d)}
                </td>
                <td className="px-3 py-3 font-mono text-[12.5px] text-stone-700">
                  {formatDwell(perf.avgDwellSec)}
                </td>
                <td className="px-3 py-3 font-mono text-[12.5px] text-stone-700">
                  {perf.inquiriesAttributed}
                </td>
                <td className={`px-5 py-3 text-[13px] ${trendColor}`}>
                  {trendGlyph}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MediaSwatch({ media }: { media: PortfolioMedia }) {
  if (media.kind === "image") {
    return (
      <span
        aria-hidden
        className="block h-10 w-10 shrink-0 rounded-md bg-cover bg-center ring-1 ring-[rgba(44,44,44,0.08)]"
        style={{ backgroundImage: `url(${media.src})` }}
      />
    );
  }
  const bg = media.to
    ? `linear-gradient(135deg, ${media.from}, ${media.to})`
    : media.from;
  return (
    <span
      aria-hidden
      className="block h-10 w-10 shrink-0 rounded-md ring-1 ring-[rgba(44,44,44,0.08)]"
      style={{ background: bg }}
    />
  );
}

function formatDwell(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ── Profile tips ─────────────────────────────────────────────
type Tip = {
  id: string;
  tone: "encouraging" | "gentle" | "celebratory";
  headline: string;
  body: string;
  cta?: { label: string; href: string };
};

function buildTips(
  portfolio: PortfolioItem[],
  vendor: {
    responseTimeHours: number | null;
    profileCompleteness: number;
  },
): Tip[] {
  const tips: Tip[] = [];

  const portfolioCount = portfolio.length;
  const gate = BENCHMARKS.portfolioItemsForTopQuartile;
  if (portfolioCount < gate) {
    const missing = gate - portfolioCount;
    // Find event types that are under-represented
    const eventCounts = new Map<string, number>();
    portfolio.forEach((p) =>
      p.eventTypes.forEach((e) =>
        eventCounts.set(e, (eventCounts.get(e) ?? 0) + 1),
      ),
    );
    const quietEvents = ["Haldi", "Mehendi", "Sangeet", "Reception"]
      .filter((e) => (eventCounts.get(e) ?? 0) <= 1)
      .slice(0, 2);
    tips.push({
      id: "portfolio-count",
      tone: "gentle",
      headline: `You have ${portfolioCount} portfolio pieces. Vendors with ${gate}+ receive roughly 3× more inquiries.`,
      body: `${missing === 1 ? "One" : missing} more and you cross that threshold.${
        quietEvents.length
          ? ` ${quietEvents.join(" and ")} ${
              quietEvents.length === 1 ? "is" : "are"
            } under-represented — couples searching for ${quietEvents[0].toLowerCase()} coverage rarely see your work.`
          : ""
      }`,
      cta: { label: "Add a portfolio piece", href: "/vendor/portfolio" },
    });
  }

  // Response time — celebratory when good
  const responseHours = vendor.responseTimeHours;
  if (responseHours != null) {
    const responseLabel = `within ${responseHours} hour${responseHours === 1 ? "" : "s"}`;
    if (responseHours <= BENCHMARKS.topResponseTimeHours) {
      tips.push({
        id: "response-time",
        tone: "celebratory",
        headline: `Your average reply lands ${responseLabel}.`,
        body: `That's faster than the ${BENCHMARKS.topResponseTimeHours}-hour mark we see from top-responding vendors. Couples notice — you're keeping their enthusiasm warm while they're still looking.`,
      });
    } else {
      tips.push({
        id: "response-time",
        tone: "gentle",
        headline: `Your average reply lands ${responseLabel}.`,
        body: `Top-responding vendors reply within ${BENCHMARKS.topResponseTimeHours} hours. Even a short "received, reply tomorrow" note keeps couples from drifting to a faster option.`,
        cta: { label: "Review your inbox", href: "/vendor/inbox" },
      });
    }
  }

  // Profile completeness
  const completeness = vendor.profileCompleteness;
  if (completeness < BENCHMARKS.profileCompletenessGate) {
    const needed = BENCHMARKS.profileCompletenessGate - completeness;
    tips.push({
      id: "profile-completeness",
      tone: "gentle",
      headline: `Your profile is ${completeness}% complete.`,
      body: `We surface profiles above ${BENCHMARKS.profileCompletenessGate}% higher in the marketplace. You're ${needed} point${
        needed === 1 ? "" : "s"
      } away — the remaining fields are pricing tiers, travel policy, and your "about" paragraph.`,
      cta: { label: "Finish your profile", href: "/vendor/profile" },
    });
  } else {
    tips.push({
      id: "profile-completeness",
      tone: "celebratory",
      headline: `Your profile is ${completeness}% complete — well above the surfacing gate.`,
      body: "No action here. Keeping this up is half the battle.",
    });
  }

  // Engagement / portfolio insight — use top-performing piece
  const ranked = portfolio
    .map((p) => ({ p, perf: PORTFOLIO_PERFORMANCE[p.id] }))
    .filter((x) => x.perf)
    .sort((a, b) => (b.perf?.views30d ?? 0) - (a.perf?.views30d ?? 0));
  const top = ranked[0];
  if (top?.perf) {
    const dwell = formatDwell(top.perf.avgDwellSec);
    tips.push({
      id: "portfolio-top",
      tone: "encouraging",
      headline: `Couples are spending ${dwell} inside "${top.p.title}".`,
      body: `That's your strongest pull right now. A short highlight reel or a deeper set from the same wedding could compound on what's already working — couples who linger in one gallery tend to open another.`,
      cta: { label: "Add a companion piece", href: "/vendor/portfolio" },
    });
  }

  return tips.slice(0, 4);
}

function parseResponseHours(text: string): number {
  const m = text.match(/(\d+)\s*hour/i);
  return m ? parseInt(m[1], 10) : 24;
}

function TipCard({ tip }: { tip: Tip }) {
  const accent =
    tip.tone === "celebratory"
      ? { bg: "#E8F0E0", fg: "#4a6b3a", glyph: "✓" }
      : tip.tone === "encouraging"
        ? { bg: "#F5E6D0", fg: "#9E8245", glyph: "✱" }
        : { bg: "#F5E0D6", fg: "#9a4a30", glyph: "◐" };
  return (
    <Card className="flex gap-4 p-5">
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px]"
        style={{ backgroundColor: accent.bg, color: accent.fg }}
        aria-hidden
      >
        {accent.glyph}
      </div>
      <div className="min-w-0">
        <p
          className="text-[15.5px] leading-snug text-[#2C2C2C]"
          style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
        >
          {tip.headline}
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-600">
          {tip.body}
        </p>
        {tip.cta && (
          <Link
            href={tip.cta.href}
            className="mt-2.5 inline-block text-[12px] text-[#9E8245] hover:underline"
          >
            {tip.cta.label} →
          </Link>
        )}
      </div>
    </Card>
  );
}
