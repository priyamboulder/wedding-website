import Link from "next/link";
import {
  MetaPill,
  ProgressBar,
  SectionHeader,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import { VENUE } from "@/lib/venue/seed";
import {
  MONTHLY_REVENUE,
  PMS_AUTO_FLOW,
  PORTFOLIO_TOTALS,
  REVENUE_BREAKDOWN,
  ROOM_BLOCKS,
  STONERIVER_CONNECTION,
  STONERIVER_PORTFOLIO,
  type PmsAutoAction,
  type PmsConnection,
  type RevenueCategory,
  type RoomBlock,
  type StoneriverProperty,
} from "@/lib/venue/stoneriver-seed";

export const metadata = {
  title: "Stoneriver — Ananya Venue",
};

export default function VenueStoneriverPage() {
  if (VENUE.managedBy !== "Stoneriver Hospitality") {
    return <NotAvailable />;
  }

  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8 pb-16">
      <PageHeader />

      {/* Connection status */}
      <section className="mt-8">
        <ConnectionCard connection={STONERIVER_CONNECTION} />
      </section>

      {/* Wedding → PMS flow */}
      <section className="mt-12">
        <SectionHeader
          title="Wedding → PMS flow"
          eyebrow="What happens automatically when a couple books"
        />
        <div className="mt-5">
          <PmsFlow steps={PMS_AUTO_FLOW} />
        </div>
      </section>

      {/* Room blocks */}
      <section className="mt-12">
        <SectionHeader
          title="Room Block Management"
          eyebrow="Active group blocks tied to Ananya weddings"
        />
        <div className="mt-5 space-y-4">
          {ROOM_BLOCKS.map((b) => (
            <RoomBlockCard key={b.id} block={b} />
          ))}
        </div>
      </section>

      {/* Cross-property dashboard */}
      <section className="mt-12">
        <SectionHeader
          title="Stoneriver Wedding Portfolio"
          eyebrow="Cross-property · for Stoneriver corporate"
        />
        <div className="mt-5">
          <PortfolioTable properties={STONERIVER_PORTFOLIO} />
        </div>
      </section>

      {/* Revenue reporting */}
      <section className="mt-12">
        <SectionHeader
          title="Revenue Reporting"
          eyebrow="Ananya-attributed revenue across the portfolio"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <RevenueBreakdownCard data={REVENUE_BREAKDOWN} />
          <MonthlyRevenueChart data={MONTHLY_REVENUE} />
        </div>
      </section>
    </div>
  );
}

/* -------------------------- Fallback (not managed) ----------------------- */

function NotAvailable() {
  return (
    <div className="mx-auto max-w-[720px] px-8 pt-16">
      <VenueCard className="p-10 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#9E8245]">
          Stoneriver integration
        </p>
        <h1
          className="mt-3 text-[32px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
          }}
        >
          Not available for this property
        </h1>
        <p
          className="mt-3 text-[14px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          The Stoneriver module connects Ananya weddings directly to a hotel PMS.
          It's only enabled for properties managed by Stoneriver Hospitality.
        </p>
      </VenueCard>
    </div>
  );
}

/* ------------------------------- Header --------------------------------- */

function PageHeader() {
  return (
    <VenueCard>
      <div className="flex flex-wrap items-end justify-between gap-5 p-8">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Stoneriver Hospitality · Integration
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Ananya × PMS
          </h1>
          <p
            className="mt-2 max-w-[620px] text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Every wedding booked through Ananya flows directly into the property
            management system — group blocks, F&B sheets, and BEOs build
            themselves.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em]"
          style={{
            backgroundColor: "#FBF1DF",
            color: VENUE_PALETTE.goldDeep,
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
          }}
        >
          <span aria-hidden>✦</span>
          {VENUE.managedBy}
        </span>
      </div>
    </VenueCard>
  );
}

/* --------------------------- Connection status --------------------------- */

function ConnectionCard({ connection }: { connection: PmsConnection }) {
  const live = connection.status === "connected";
  return (
    <VenueCard className="p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="relative grid h-11 w-11 place-items-center rounded-full"
            style={{
              backgroundColor: live ? "rgba(39,174,96,0.15)" : "rgba(192,57,43,0.12)",
            }}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{
                backgroundColor: live ? VENUE_PALETTE.ontrack : VENUE_PALETTE.critical,
                boxShadow: live
                  ? "0 0 0 4px rgba(39,174,96,0.12)"
                  : "0 0 0 4px rgba(192,57,43,0.12)",
              }}
            />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              Property
            </p>
            <p
              className="mt-1 text-[20px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {connection.property}
            </p>
          </div>
        </div>

        <Divider />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
            PMS
          </p>
          <p className="mt-1 text-[14px] text-[#2C2C2C]">
            {connection.pms}{" "}
            <span className="ml-1.5 font-mono text-[11px]" style={{ color: VENUE_PALETTE.ontrack }}>
              ✓ Connected
            </span>
          </p>
        </div>

        <Divider />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
            Status
          </p>
          <p className="mt-1 text-[14px] text-[#2C2C2C]">
            Active
            <span className="mx-1.5 text-[#cdbf9c]">·</span>
            <span className="text-[#6a6a6a]">
              Last sync {connection.lastSyncLabel}
            </span>
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.45)" }}
          >
            Re-sync
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.45)" }}
          >
            Connection settings
          </button>
        </div>
      </div>
    </VenueCard>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-8 w-px md:block"
      style={{ backgroundColor: "rgba(44,44,44,0.08)" }}
    />
  );
}

/* ------------------------------- PMS flow -------------------------------- */

function PmsFlow({ steps }: { steps: PmsAutoAction[] }) {
  return (
    <VenueCard className="p-6">
      <ol className="space-y-5">
        {steps.map((s, i) => (
          <li key={s.step} className="flex items-start gap-4">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[11px]"
              style={{
                backgroundColor:
                  s.status === "complete"
                    ? "rgba(39,174,96,0.12)"
                    : "#FBF1DF",
                color:
                  s.status === "complete"
                    ? VENUE_PALETTE.ontrack
                    : VENUE_PALETTE.goldDeep,
                boxShadow:
                  s.status === "complete"
                    ? undefined
                    : "inset 0 0 0 1px rgba(196,162,101,0.40)",
              }}
            >
              {s.status === "complete" ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p
                  className="text-[16px] text-[#2C2C2C]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {s.step}
                </p>
                {s.status === "scheduled" && s.when && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
                    Scheduled · {s.when}
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-[13px] text-[#5a5a5a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {s.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </VenueCard>
  );
}

/* ------------------------------ Room blocks ------------------------------ */

function RoomBlockCard({ block }: { block: RoomBlock }) {
  const pct = Math.round((block.picked / block.blockSize) * 100);
  const tone =
    pct >= 80
      ? VENUE_PALETTE.ontrack
      : pct >= 60
        ? VENUE_PALETTE.gold
        : VENUE_PALETTE.warning;
  return (
    <VenueCard className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: tone, opacity: 0.85 }}
      />
      <div className="p-6 pl-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-[24px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {block.coupleNames}
              </h3>
              <span className="text-[#cdbf9c]" aria-hidden>
                ·
              </span>
              <span className="text-[13px] text-[#5a5a5a]">{block.dates}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#5a5a5a]">
              Group rate{" "}
              <span className="font-mono text-[12px] text-[#2C2C2C]">
                ${block.ratePerNight}
              </span>
              /night
              <span className="mx-1.5 text-[#cdbf9c]">·</span>
              {block.nights} nights
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
              Block revenue
            </p>
            <p
              className="mt-1 font-mono text-[24px] leading-none text-[#2C2C2C]"
              style={{ fontWeight: 500 }}
            >
              ${block.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Pickup */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Pickup
            </span>
            <span className="font-mono text-[13px] text-[#2C2C2C]">
              {block.picked} / {block.blockSize} rooms · {pct}%
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={block.picked} total={block.blockSize} />
          </div>
        </div>

        {/* Cutoff */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  block.cutoffStatus === "passed"
                    ? "#c8b795"
                    : VENUE_PALETTE.gold,
              }}
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Cutoff
            </span>
            <span className="text-[12.5px] text-[#2C2C2C]">
              {block.cutoffLabel}
            </span>
          </div>
          {block.weddingId && (
            <Link
              href={`/venue/weddings/${block.weddingId}`}
              className="font-mono text-[11px] text-[#9E8245] hover:text-[#C4A265]"
            >
              View wedding →
            </Link>
          )}
        </div>

        {block.warning && (
          <div
            className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-[12.5px] italic"
            style={{
              backgroundColor: "rgba(230,126,34,0.10)",
              color: "#8a4e18",
              fontFamily: "'EB Garamond', serif",
            }}
          >
            <span aria-hidden className="mt-0.5">⚠</span>
            <span>{block.warning}</span>
          </div>
        )}
      </div>
    </VenueCard>
  );
}

/* ------------------------------ Portfolio -------------------------------- */

function PortfolioTable({ properties }: { properties: StoneriverProperty[] }) {
  const fmtCurrency = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`;
  return (
    <VenueCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left text-[12.5px]">
          <thead>
            <tr
              style={{
                backgroundColor: "#F5EFE3",
                color: VENUE_PALETTE.goldDeep,
              }}
            >
              <th className="py-3 pl-5 font-mono text-[10px] uppercase tracking-[0.22em]">
                Property
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Weddings
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Revenue
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Avg value
              </th>
              <th className="py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Inquiries
              </th>
              <th className="py-3 pr-5 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                Wed. share of rev.
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p, i) => (
              <tr
                key={p.name}
                className={i === 0 ? "" : "border-t"}
                style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
              >
                <td className="py-4 pl-5">
                  <p
                    className="text-[15px] text-[#2C2C2C]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#9E8245]">
                    {p.location}
                  </p>
                </td>
                <td className="py-4 text-right font-mono text-[13px] text-[#2C2C2C]">
                  {p.weddings}
                </td>
                <td className="py-4 text-right font-mono text-[13px] text-[#2C2C2C]">
                  {fmtCurrency(p.revenue)}
                </td>
                <td className="py-4 text-right font-mono text-[13px] text-[#2C2C2C]">
                  ${Math.round(p.avgValue / 1000)}K
                </td>
                <td className="py-4 text-right font-mono text-[13px] text-[#2C2C2C]">
                  {p.inquiries}
                </td>
                <td className="py-4 pr-5">
                  <div className="flex items-center justify-end gap-3">
                    <div
                      className="h-[6px] w-[90px] overflow-hidden rounded-full"
                      style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.weddingRevenueSharePct}%`,
                          backgroundColor: VENUE_PALETTE.gold,
                        }}
                      />
                    </div>
                    <span className="w-[36px] text-right font-mono text-[12px] text-[#2C2C2C]">
                      {p.weddingRevenueSharePct}%
                    </span>
                  </div>
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
                Portfolio total
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {PORTFOLIO_TOTALS.weddings}
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                ${(PORTFOLIO_TOTALS.revenue / 1_000_000).toFixed(2)}M
              </td>
              <td className="py-3.5 text-right font-mono text-[11.5px] text-[#9E8245]">
                —
              </td>
              <td className="py-3.5 text-right font-mono text-[13px] font-semibold text-[#2C2C2C]">
                {PORTFOLIO_TOTALS.inquiries}
              </td>
              <td className="py-3.5 pr-5 text-right font-mono text-[11.5px] text-[#9E8245]">
                —
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VenueCard>
  );
}

/* ----------------------------- Revenue charts ---------------------------- */

function RevenueBreakdownCard({ data }: { data: RevenueCategory[] }) {
  const total = data.reduce((s, x) => s + x.value, 0);
  const colors = [VENUE_PALETTE.goldDeep, VENUE_PALETTE.gold, "#E8D5D0", "#5a5a5a"];
  return (
    <VenueCard className="p-6 lg:col-span-2">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Revenue by category
      </p>
      <p
        className="mt-3 text-[32px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        ${(total / 1_000_000).toFixed(2)}M
      </p>
      <p
        className="mt-1 text-[12px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Ananya-attributed · last 12 months · portfolio-wide
      </p>
      <ul className="mt-5 space-y-3">
        {data.map((c, i) => (
          <li key={c.category} className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="min-w-[140px] text-[13px] text-[#2C2C2C]">
              {c.category}
            </span>
            <div
              className="h-[6px] flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${c.share}%`,
                  backgroundColor: colors[i % colors.length],
                }}
              />
            </div>
            <span className="w-[56px] shrink-0 text-right font-mono text-[12px] text-[#2C2C2C]">
              ${Math.round(c.value / 1000)}K
            </span>
            <span className="w-[34px] shrink-0 text-right font-mono text-[11px] text-[#9E8245]">
              {c.share}%
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-5 w-full rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
        style={{
          backgroundColor: VENUE_PALETTE.charcoal,
          color: "#FAF8F5",
        }}
      >
        Export to Stoneriver Finance
      </button>
    </VenueCard>
  );
}

function MonthlyRevenueChart({
  data,
}: {
  data: { month: string; ananya: number; other: number }[];
}) {
  const max = Math.max(...data.map((d) => d.ananya + d.other));
  return (
    <VenueCard className="p-6 lg:col-span-3">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
          Monthly wedding revenue · portfolio
        </p>
        <div className="flex items-center gap-3 text-[10.5px] text-[#6a6a6a]">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: VENUE_PALETTE.goldDeep }}
            />
            Ananya
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: "#D6CAB0" }}
            />
            Other sources
          </span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-12 items-end gap-2" style={{ height: 160 }}>
        {data.map((d) => {
          const total = d.ananya + d.other;
          const totalPct = (total / max) * 100;
          const ananyaPct = total === 0 ? 0 : (d.ananya / total) * 100;
          return (
            <div
              key={d.month}
              className="flex h-full flex-col items-center justify-end gap-1"
            >
              <span className="font-mono text-[9.5px] text-[#2C2C2C]">
                ${total}K
              </span>
              <div
                className="relative w-full overflow-hidden rounded-t-sm"
                style={{
                  height: `${totalPct}%`,
                  minHeight: 2,
                  backgroundColor: "#D6CAB0",
                }}
              >
                <div
                  className="absolute bottom-0 left-0 w-full"
                  style={{
                    height: `${ananyaPct}%`,
                    backgroundColor: VENUE_PALETTE.goldDeep,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-12 gap-2">
        {data.map((d) => (
          <div
            key={d.month}
            className="text-center font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#9E8245]"
          >
            {d.month.split(" ")[0]}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-[12px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
          style={{ borderColor: "rgba(196,162,101,0.45)" }}
        >
          Download CSV
        </button>
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-[12px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
          style={{ borderColor: "rgba(196,162,101,0.45)" }}
        >
          Filter by property
        </button>
        <MetaPill tone="gold">Corporate</MetaPill>
      </div>
    </VenueCard>
  );
}
