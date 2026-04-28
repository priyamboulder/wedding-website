import Link from "next/link";
import {
  MetaPill,
  ProgressBar,
  SectionHeader,
  StatCard,
  TrendBadge,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import {
  AVAILABILITY,
  INQUIRY_SOURCES,
  MONTHLY_TRENDS,
  RECENT_INQUIRIES,
  TOP_SHOWCASES,
  UPCOMING_WEDDINGS,
  VENUE,
  VENUE_STATS,
  type AvailabilityDay,
  type AvailabilityMonth,
  type Inquiry,
  type SourceShare,
  type TrendStat,
  type ShowcaseView,
  type UpcomingWedding,
} from "@/lib/venue/seed";

export default function VenueDashboardPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8">
      <VenueIdentityHeader />

      {/* Stats row */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Weddings on Platform"
          value={VENUE_STATS.totalWeddings}
          sub={VENUE_STATS.totalWeddingsSub}
        />
        <StatCard
          label="Upcoming Weddings"
          value={VENUE_STATS.upcomingBooked}
          sub={`Next: ${VENUE_STATS.upcomingNext}`}
        />
        <StatCard
          label="Inquiries This Month"
          value={VENUE_STATS.inquiriesThisMonth}
          sub={
            <>
              {VENUE_STATS.inquiriesDelta >= 0 ? "+" : ""}
              {VENUE_STATS.inquiriesDelta} vs last month
            </>
          }
          trend={{ delta: VENUE_STATS.inquiriesDelta }}
        />
        <StatCard
          label={`Wedding Revenue (${VENUE_STATS.estimatedYear})`}
          value={VENUE_STATS.estimatedRevenue}
          sub={VENUE_STATS.estimatedRevenueSub}
        />
        <StatCard
          label="Profile Views This Month"
          value={VENUE_STATS.profileViews.toLocaleString()}
          sub={VENUE_STATS.profileViewsSub}
        />
      </section>

      {/* Two-col body */}
      <section className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: weddings + inquiries */}
        <div className="space-y-12 lg:col-span-2">
          <div>
            <SectionHeader
              title="Upcoming Weddings"
              eyebrow="Next 90 days"
              actionHref="/venue/weddings"
              actionLabel="View all →"
            />
            <div className="mt-5 space-y-5">
              {UPCOMING_WEDDINGS.map((w) => (
                <WeddingCard key={w.id} wedding={w} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Recent Inquiries"
              eyebrow="From couples browsing your profile"
              actionHref="/venue/leads"
              actionLabel="View all →"
            />
            <div className="mt-5 space-y-4">
              {RECENT_INQUIRIES.map((inq) => (
                <InquiryCard key={inq.id} inquiry={inq} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: quick stats sidebar */}
        <div className="space-y-8">
          <MonthlyTrends trends={MONTHLY_TRENDS} />
          <SourcesPanel sources={INQUIRY_SOURCES} />
          <TopShowcasesPanel showcases={TOP_SHOWCASES} />
          <AvailabilityPanel months={AVAILABILITY} />
        </div>
      </section>
    </div>
  );
}

/* ----------------------------- Identity header ---------------------------- */

function VenueIdentityHeader() {
  return (
    <section className="overflow-hidden rounded-3xl border"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 30px 60px -40px rgba(44,44,44,0.25)",
      }}
    >
      {/* Hero photo */}
      <div
        className="relative h-[280px] w-full"
        style={{
          backgroundImage: `url(${VENUE.heroImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {VENUE.managedBy && (
          <span
            className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{
              backgroundColor: "rgba(255,255,240,0.92)",
              color: VENUE_PALETTE.goldDeep,
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            }}
          >
            <span aria-hidden>✦</span>
            {VENUE.managedBy}
          </span>
        )}
      </div>

      <div
        className="flex flex-wrap items-end justify-between gap-4 px-8 py-6"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Venue dashboard
          </p>
          <h1
            className="mt-2 text-[48px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {VENUE.name}
          </h1>
          <p
            className="mt-1.5 text-[15.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {VENUE.city}, {VENUE.region}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.45)" }}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            New inquiry
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Wedding card ------------------------------- */

function WeddingCard({ wedding }: { wedding: UpcomingWedding }) {
  const accent =
    wedding.daysAway <= 14
      ? VENUE_PALETTE.warning
      : wedding.daysAway <= 30
        ? VENUE_PALETTE.gold
        : VENUE_PALETTE.ontrack;

  return (
    <VenueCard className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent, opacity: 0.85 }}
      />
      <div className="p-6 pl-7">
        {/* Row 1: names + countdown */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-[28px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              {wedding.coupleNames}
            </h3>
            <p className="mt-1.5 text-[13px] text-[#5a5a5a]">
              <span className="text-[#2C2C2C]">{wedding.dateRange}</span>
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              <span className="font-mono text-[11.5px] text-[#2C2C2C]">
                {wedding.guestCount}
              </span>{" "}
              guests
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {wedding.duration}
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {wedding.ceremonyType}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {wedding.plannerName ? (
                <Link
                  href={wedding.plannerHref ?? "#"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FBF1DF] px-3 py-[5px] text-[12px] text-[#5a4220] transition-colors hover:bg-[#F5E6D0]"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.30)",
                  }}
                >
                  <span aria-hidden className="text-[10px] text-[#9E8245]">
                    ✦
                  </span>
                  Planner: {wedding.plannerName}
                  {wedding.plannerLead && (
                    <span className="text-[#8a7a5a]">
                      ({wedding.plannerLead.split(" ")[0]})
                    </span>
                  )}
                </Link>
              ) : (
                <MetaPill>No planner</MetaPill>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p
              className="text-[13px] font-medium tracking-wide"
              style={{ color: accent }}
            >
              {wedding.daysAway} days away
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              {wedding.spaces.length} spaces
            </p>
          </div>
        </div>

        {/* Events */}
        <div className="mt-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
            Events
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#2C2C2C]">
            {wedding.events.map((e, i) => (
              <span key={`${e.name}-${i}`} className="inline-flex items-baseline gap-1.5">
                <span>{e.name}</span>
                {e.day && (
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#9E8245]">
                    {e.day}
                  </span>
                )}
                {i < wedding.events.length - 1 && (
                  <span className="ml-1 text-[#cdbf9c]" aria-hidden>
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Spaces */}
        <div className="mt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
            Spaces in use
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {wedding.spaces.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11.5px] text-[#5a4a30]"
                style={{
                  backgroundColor: "#F5E6D0",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.30)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Vendors
            </p>
            <p className="font-mono text-[11.5px] text-[#2C2C2C]">
              {wedding.vendorsBooked}/{wedding.vendorsTotal} booked
            </p>
          </div>
          <div className="mt-2">
            <ProgressBar
              value={wedding.vendorsBooked}
              total={wedding.vendorsTotal}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end">
          <Link
            href={`/venue/weddings/${wedding.id}`}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            View Details
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </VenueCard>
  );
}

/* ----------------------------- Inquiry card ------------------------------- */

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const isNew = inquiry.status === "new";
  return (
    <VenueCard className="overflow-hidden">
      <div className="p-5">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-[9px] w-[9px] rounded-full"
              style={{
                backgroundColor: isNew ? VENUE_PALETTE.critical : "#c8b795",
              }}
            />
            <span
              className="font-mono text-[10.5px] uppercase tracking-[0.22em]"
              style={{
                color: isNew ? VENUE_PALETTE.critical : "#8a8a8a",
                fontWeight: isNew ? 600 : 500,
              }}
            >
              {isNew ? "New" : "Read"}
            </span>
          </span>
          <span className="text-[#cdbf9c]" aria-hidden>
            ·
          </span>
          <span className="text-[12px] text-[#6a6a6a]">{inquiry.receivedLabel}</span>
        </div>

        {/* Headline */}
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-[22px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {inquiry.coupleNames}
            </h3>
            <p className="mt-1 text-[12.5px] text-[#5a5a5a]">
              <span className="text-[#2C2C2C]">{inquiry.estimatedDate}</span>
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              <span className="font-mono text-[11.5px] text-[#2C2C2C]">
                {inquiry.guestCount}
              </span>{" "}
              guests
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {inquiry.ceremonyType}
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {inquiry.duration}
            </p>
          </div>
          <Link
            href={`/venue/leads/${inquiry.id}`}
            className="shrink-0 text-[12px] font-medium text-[#9E8245] hover:text-[#C4A265]"
          >
            Respond →
          </Link>
        </div>

        {/* Source line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[#5a5a5a]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-[10px] text-[#9E8245]">
              ✦
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.20em] text-[#9E8245]">
              Source
            </span>
            <span className="text-[#2C2C2C]">
              {inquiry.source}
              {inquiry.sourceDetail ? ` (${inquiry.sourceDetail})` : ""}
            </span>
          </span>
          {inquiry.budget && (
            <>
              <span aria-hidden className="text-[#cdbf9c]">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.20em] text-[#9E8245]">
                  Budget
                </span>
                <span className="font-mono text-[12px] text-[#2C2C2C]">
                  {inquiry.budget}
                </span>
              </span>
            </>
          )}
          {inquiry.notes?.map((n, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="text-[#cdbf9c]">·</span>
              <span className="text-[#6a6a6a]">{n}</span>
            </span>
          ))}
        </div>

        {/* Browsing intelligence — the gold for the sales team */}
        <div
          className="mt-3.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
          style={{
            backgroundColor: "#FBF1DF",
            color: "#5a4a30",
          }}
        >
          <span aria-hidden className="text-[12px] text-[#9E8245]">
            ◔
          </span>
          <span>
            Browsed{" "}
            <span className="font-mono text-[11.5px] text-[#2C2C2C]">
              {inquiry.browsed.count}
            </span>{" "}
            wedding showcases ({inquiry.browsed.descriptor})
          </span>
        </div>
      </div>
    </VenueCard>
  );
}

/* ------------------------------ Sidebar ----------------------------------- */

function MonthlyTrends({ trends }: { trends: TrendStat[] }) {
  return (
    <div>
      <SectionHeader title="This Month" eyebrow="vs. last month" />
      <VenueCard className="mt-5 overflow-hidden">
        <ul>
          {trends.map((t, i) => (
            <li
              key={t.label}
              className={i === 0 ? "" : "border-t"}
              style={i === 0 ? undefined : { borderColor: VENUE_PALETTE.hairlineSoft }}
            >
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13px] text-[#2C2C2C]">{t.label}</span>
                <div className="flex items-center gap-2.5">
                  <span
                    className="font-mono text-[16px] text-[#2C2C2C]"
                    style={{ fontWeight: 500 }}
                  >
                    {t.value}
                  </span>
                  <TrendBadge delta={t.delta} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </VenueCard>
    </div>
  );
}

function SourcesPanel({ sources }: { sources: SourceShare[] }) {
  const total = sources.reduce((sum, s) => sum + s.count, 0);
  // Color stops so the donut reads in palette
  const colors = ["#C4A265", "#9E8245", "#E8D5D0", "#5a5a5a"];

  // Build conic-gradient string
  let cursor = 0;
  const stops = sources
    .map((s, i) => {
      const start = (cursor / total) * 360;
      cursor += s.count;
      const end = (cursor / total) * 360;
      return `${colors[i % colors.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div>
      <SectionHeader title="Inquiry Sources" eyebrow="Last 90 days" />
      <VenueCard className="mt-5 p-5">
        <div className="flex items-center gap-5">
          <div
            className="relative grid h-[112px] w-[112px] shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(${stops})` }}
            aria-hidden
          >
            <div
              className="grid h-[72px] w-[72px] place-items-center rounded-full bg-white"
              style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)" }}
            >
              <div className="text-center leading-none">
                <p
                  className="font-mono text-[20px] text-[#2C2C2C]"
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
              const pct = Math.round((s.count / total) * 100);
              return (
                <li key={s.label} className="flex items-center gap-2 text-[12.5px]">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[#2C2C2C]">
                    {s.label}
                  </span>
                  <span className="font-mono text-[11.5px] text-[#6a6a6a]">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </VenueCard>
    </div>
  );
}

function TopShowcasesPanel({ showcases }: { showcases: ShowcaseView[] }) {
  const max = Math.max(...showcases.map((s) => s.views));
  return (
    <div>
      <SectionHeader title="Top Wedding Showcases" eyebrow="Most viewed" />
      <VenueCard className="mt-5 overflow-hidden">
        <ul>
          {showcases.map((s, i) => {
            const pct = Math.round((s.views / max) * 100);
            return (
              <li
                key={s.id}
                className={i === 0 ? "" : "border-t"}
                style={i === 0 ? undefined : { borderColor: VENUE_PALETTE.hairlineSoft }}
              >
                <div className="px-5 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[15px] text-[#2C2C2C]"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                    >
                      {s.coupleNames}
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.20em] text-[#9E8245]">
                        {s.ceremonyType}
                      </span>
                    </p>
                    <span className="font-mono text-[12px] text-[#2C2C2C]">
                      {s.views}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-[4px] w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: VENUE_PALETTE.gold }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </VenueCard>
    </div>
  );
}

function AvailabilityPanel({ months }: { months: AvailabilityMonth[] }) {
  return (
    <div>
      <SectionHeader title="Availability" eyebrow="Next 6 months" />
      <VenueCard className="mt-5 p-5">
        <div className="grid grid-cols-2 gap-4">
          {months.map((m) => (
            <MiniCalendar key={`${m.year}-${m.monthIndex}`} month={m} />
          ))}
        </div>
        <Legend />
      </VenueCard>
    </div>
  );
}

function MiniCalendar({ month }: { month: AvailabilityMonth }) {
  const cells: Array<number | null> = [];
  for (let i = 0; i < month.startWeekday; i++) cells.push(null);
  for (let d = 1; d <= month.daysInMonth; d++) cells.push(d);

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
        {month.monthLabel} {month.year}
      </p>
      <div className="mt-2 grid grid-cols-7 gap-[3px]">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const status = month.status[d];
          return <DayCell key={d} day={d} status={status} />;
        })}
      </div>
    </div>
  );
}

function DayCell({ day, status }: { day: number; status: AvailabilityDay }) {
  const styles =
    status === "booked"
      ? { bg: VENUE_PALETTE.charcoal, color: "#FAF8F5" }
      : status === "hold"
        ? { bg: VENUE_PALETTE.gold, color: "#FFFFFF" }
        : { bg: "#F5EFE3", color: "#9E8245" };

  return (
    <div
      title={`${day} · ${status}`}
      className="flex aspect-square items-center justify-center rounded-[3px] font-mono text-[8.5px]"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {day}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <LegendChip color="#F5EFE3" label="Open" textColor="#9E8245" />
      <LegendChip color={VENUE_PALETTE.gold} label="Hold" textColor="#FFFFFF" />
      <LegendChip color={VENUE_PALETTE.charcoal} label="Booked" textColor="#FAF8F5" />
    </div>
  );
}

function LegendChip({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-[#6a6a6a]">
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-[2px]"
        style={{ backgroundColor: color, color: textColor }}
      />
      {label}
    </span>
  );
}
