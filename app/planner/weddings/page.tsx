import Link from "next/link";
import {
  PlannerCard,
  PLANNER_PALETTE,
  ProgressBar,
  UrgencyDot,
} from "@/components/planner/ui";
import {
  UPCOMING_WEDDINGS,
  WEDDING_COUNTDOWN,
  weddingUrgency,
  type UpcomingWedding,
} from "@/lib/planner/seed";

export const metadata = {
  title: "Weddings — Ananya Planner",
};

export default function WeddingsListPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            All weddings
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Weddings in motion
          </h1>
          <p
            className="mt-1.5 text-[15.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {UPCOMING_WEDDINGS.length} active — click a wedding to open its vendor team.
          </p>
        </div>
        <Link
          href="/planner"
          className="text-[12.5px] text-[#9E8245] hover:text-[#C4A265]"
        >
          ← Dashboard
        </Link>
      </header>

      <section className="mt-8 space-y-5">
        {UPCOMING_WEDDINGS.map((w) => (
          <WeddingRow key={w.id} wedding={w} />
        ))}
      </section>
    </div>
  );
}

function WeddingRow({ wedding }: { wedding: UpcomingWedding }) {
  const urgency = weddingUrgency(wedding);
  const accent =
    urgency === "critical"
      ? PLANNER_PALETTE.critical
      : urgency === "warning"
        ? PLANNER_PALETTE.warning
        : PLANNER_PALETTE.ontrack;

  return (
    <Link href={`/planner/weddings/${wedding.id}`} className="block">
      <PlannerCard className="relative overflow-hidden transition-transform hover:-translate-y-[1px]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: accent, opacity: 0.85 }}
        />
        <div className="p-6 pl-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                className="text-[26px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                {wedding.coupleNames}
              </h2>
              <p className="mt-1 text-[13px] text-[#5a5a5a]">
                <span className="text-[#2C2C2C]">{wedding.weddingDates}</span>
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.venue}
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.location}
              </p>
              <p className="mt-2 text-[12.5px] text-[#6a6a6a]">
                <span className="font-mono text-[11.5px] tracking-wider text-[#2C2C2C]">
                  {wedding.guestCount}
                </span>
                <span className="ml-1">guests</span>
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.events.join(", ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="text-[13px] font-medium tracking-wide"
                style={{ color: accent }}
              >
                {WEDDING_COUNTDOWN[wedding.id]}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
                <UrgencyDot tone={urgency} />
                {urgency === "critical"
                  ? "Needs action"
                  : urgency === "warning"
                    ? "Attention"
                    : "On track"}
              </p>
            </div>
          </div>

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
                tone={urgency}
              />
            </div>
          </div>
        </div>
      </PlannerCard>
    </Link>
  );
}
