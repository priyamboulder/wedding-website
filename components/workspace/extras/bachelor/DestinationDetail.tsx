"use client";

// ── Destination detail modal ──────────────────────────────────────────────
// Phase-3 deep-dive: hero + AI-style sample itinerary + food & drink picks +
// activity menu + accommodation guide + logistics. Reads the playbook from
// lib/bachelor-playbooks.ts; if the destination has no playbook, shows a
// "coming soon" state pointing back to the top-level overview.

import { useEffect } from "react";
import {
  BedDouble,
  CalendarDays,
  ChefHat,
  Clock,
  Compass,
  DollarSign,
  Map as MapIcon,
  Mountain,
  Music,
  Sparkles,
  Thermometer,
  Trophy,
  Users,
  UtensilsCrossed,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  Destination,
  DestinationPlaybook,
  DestinationScore,
  PlaybookActivity,
  PlaybookActivityCategory,
  PlaybookDay,
  PlaybookFoodCategory,
  PlaybookFoodPick,
  VibeProfile,
} from "@/types/bachelor";
import { getPlaybook } from "@/lib/bachelor-playbooks";
import { MONTH_OPTIONS } from "@/lib/bachelor-seed";
import { cn } from "@/lib/utils";

// ── Category label maps ───────────────────────────────────────────────────

const FOOD_CATEGORY_META: Record<
  PlaybookFoodCategory,
  { label: string; description: string }
> = {
  anchor_dinner: {
    label: "The Anchor Dinner",
    description: "The one reservation you build the night around. Book it first.",
  },
  group_lunch: {
    label: "The Group Lunch",
    description: "Seats 12 without a reservation, cold beer, good food, nobody's stressed.",
  },
  morning_after: {
    label: "The Morning-After Move",
    description: "Where you go when half the crew is hurting and everyone needs carbs.",
  },
  dive_bar: {
    label: "The Dive Bar",
    description: "Cash only, pool table, no pretense, perfect.",
  },
  steakhouse: {
    label: "The Steakhouse",
    description: "If the crew wants one great steak dinner, this is it.",
  },
  sports_bar: {
    label: "The Sports Bar",
    description: "Best spot to catch a game if there's one on.",
  },
  late_night: {
    label: "The Late-Night Call",
    description: "Open past midnight, food that hits different at 1 AM.",
  },
  brewery_distillery: {
    label: "The Brewery / Distillery",
    description: "Worth the visit even if you're not a beer or whiskey nerd.",
  },
};

const ACTIVITY_CATEGORY_META: Record<
  PlaybookActivityCategory,
  { label: string; icon: LucideIcon }
> = {
  competitive: { label: "Competitive", icon: Trophy },
  water: { label: "On the Water", icon: Waves },
  adrenaline: { label: "Adrenaline", icon: Zap },
  chill: { label: "Chill", icon: Sparkles },
  food_drink: { label: "Food & Drink", icon: ChefHat },
  sports_events: { label: "Sports & Events", icon: Music },
  nightlife: { label: "Nightlife", icon: Sparkles },
  unique: { label: "Unique to Here", icon: Compass },
};

const INTENSITY_LABEL: Record<PlaybookActivity["intensity"], string> = {
  easy: "Easy",
  moderate: "Moderate",
  full_send: "Full send",
};

// ── Component ─────────────────────────────────────────────────────────────

export function DestinationDetail({
  destination,
  score,
  profile,
  onClose,
}: {
  destination: Destination;
  score: DestinationScore;
  profile: VibeProfile;
  onClose: () => void;
}) {
  const playbook = getPlaybook(destination.id);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${destination.name} playbook`}
        className="relative h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Hero
          destination={destination}
          score={score}
          profile={profile}
          onClose={onClose}
        />

        {playbook ? (
          <PlaybookBody playbook={playbook} profile={profile} />
        ) : (
          <NoPlaybookState destination={destination} />
        )}
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────

function Hero({
  destination,
  score,
  profile,
  onClose,
}: {
  destination: Destination;
  score: DestinationScore;
  profile: VibeProfile;
  onClose: () => void;
}) {
  const gradient = buildGradient(destination.palette);
  const bestMonths = pickBestMonths(destination);
  const currentMonthLabel =
    profile.month && profile.month !== "flexible"
      ? (MONTH_OPTIONS.find((m) => m.value === profile.month)?.label ?? null)
      : null;

  return (
    <header className="relative">
      <div
        className="relative h-64 w-full overflow-hidden"
        style={{ background: gradient }}
      >
        {destination.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink backdrop-blur hover:bg-white"
        >
          <X size={16} strokeWidth={2} />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-warm/90"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {destination.region === "international" ? "International" : "Domestic"}{" "}
            · {score.score}% match · {score.matchTag}
          </p>
          <h2 className="mt-1 font-serif text-[32px] leading-tight text-white">
            {destination.name}
          </h2>
          <p className="mt-1 max-w-xl text-[14px] leading-snug text-ivory-warm">
            {destination.hook}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-border px-6 py-4 md:grid-cols-3">
        <InfoCard
          icon={<Thermometer size={14} strokeWidth={1.8} />}
          label={currentMonthLabel ? `${currentMonthLabel} weather` : "Weather"}
          value={score.weatherNote ?? "Flexible timing"}
        />
        <InfoCard
          icon={<CalendarDays size={14} strokeWidth={1.8} />}
          label="Best months"
          value={bestMonths.join(" · ") || "Year-round"}
        />
        <InfoCard
          icon={<DollarSign size={14} strokeWidth={1.8} />}
          label="Est. per person"
          value={resolveCostDisplay(destination, profile)}
        />
      </div>
    </header>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-ivory-warm/30 px-3 py-2">
      <p
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[13px] text-ink">{value}</p>
    </div>
  );
}

// ── Playbook body ─────────────────────────────────────────────────────────

function PlaybookBody({
  playbook,
  profile,
}: {
  playbook: DestinationPlaybook;
  profile: VibeProfile;
}) {
  return (
    <div className="divide-y divide-border">
      <Overview overview={playbook.overview} />
      <SampleItinerary days={playbook.sampleItinerary} />
      <FoodAndDrink picks={playbook.foodAndDrink} />
      <ActivityMenu activities={playbook.activities} profile={profile} />
      <AccommodationGuide accommodation={playbook.accommodation} />
      <Logistics logistics={playbook.logistics} />
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────

function Overview({ overview }: { overview: string }) {
  return (
    <section className="px-6 py-5">
      <SectionHeader
        eyebrow="WHY THIS WORKS"
        title="The playbook"
      />
      <p className="text-[14px] leading-relaxed text-ink">{overview}</p>
    </section>
  );
}

// ── Sample Itinerary ──────────────────────────────────────────────────────

function SampleItinerary({ days }: { days: PlaybookDay[] }) {
  return (
    <section className="px-6 py-5">
      <SectionHeader
        eyebrow="DAY-BY-DAY"
        title="Sample itinerary"
        description="Written like a buddy texting the group chat with the plan. Treat it as a starting point — it's hand-curated for the default crew size and budget, not AI-generated."
      />
      <div className="space-y-5">
        {days.map((day) => (
          <DayBlock key={day.label} day={day} />
        ))}
      </div>
    </section>
  );
}

function DayBlock({ day }: { day: PlaybookDay }) {
  return (
    <article className="rounded-lg border border-border bg-ivory-warm/20 p-5">
      <header className="mb-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {day.label}
        </p>
        <h4 className="mt-1 font-serif text-[20px] leading-tight text-ink">
          {day.title}
        </h4>
      </header>

      <p className="mb-4 text-[13.5px] leading-relaxed text-ink">
        {day.body}
      </p>

      <ul className="space-y-1.5 border-t border-border/60 pt-3">
        {day.highlights.map((h, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[12.5px] text-ink"
          >
            {h.time && (
              <span
                className="w-20 shrink-0 font-mono text-[11px] tracking-tight text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {h.time}
              </span>
            )}
            <span className="flex-1">{h.activity}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ── Food & Drink ──────────────────────────────────────────────────────────

function FoodAndDrink({ picks }: { picks: PlaybookFoodPick[] }) {
  // Group by category in the order defined in FOOD_CATEGORY_META
  const order = Object.keys(FOOD_CATEGORY_META) as PlaybookFoodCategory[];
  const grouped = order
    .map((cat) => ({
      cat,
      picks: picks.filter((p) => p.category === cat),
    }))
    .filter((g) => g.picks.length > 0);

  return (
    <section className="px-6 py-5">
      <SectionHeader
        eyebrow="FOOD & DRINK"
        title="Where to eat, in categories that actually matter"
        description="Real, currently-operating venues. Opinionated picks with reservation logistics and one insider tip each."
      />
      <div className="space-y-5">
        {grouped.map(({ cat, picks }) => (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <UtensilsCrossed
                size={14}
                strokeWidth={1.7}
                className="text-ink-muted"
              />
              <h5 className="font-serif text-[15px] text-ink">
                {FOOD_CATEGORY_META[cat].label}
              </h5>
            </div>
            <p className="mb-3 text-[11.5px] italic text-ink-muted">
              {FOOD_CATEGORY_META[cat].description}
            </p>
            <ul className="space-y-3">
              {picks.map((p) => (
                <FoodPickRow key={p.name} pick={p} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function FoodPickRow({ pick }: { pick: PlaybookFoodPick }) {
  return (
    <li className="rounded-md border border-border bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h6 className="font-serif text-[15px] leading-tight text-ink">
            {pick.name}
          </h6>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {pick.neighborhood} · {pick.priceRange} · {pick.perPerson}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[12.5px] text-ink">{pick.vibe}</p>
      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[11.5px] md:grid-cols-2">
        <RowFact label="Reservation" value={pick.reservationNote} />
        {pick.groupNote && <RowFact label="Group note" value={pick.groupNote} />}
      </dl>
      <p className="mt-3 border-t border-border/60 pt-2 text-[12px] italic text-ink-muted">
        <span className="font-medium text-saffron">Insider tip:</span>{" "}
        {pick.insiderTip}
      </p>
    </li>
  );
}

function RowFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt
        className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

// ── Activity Menu ─────────────────────────────────────────────────────────

function ActivityMenu({
  activities,
  profile,
}: {
  activities: PlaybookActivity[];
  profile: VibeProfile;
}) {
  const order = Object.keys(
    ACTIVITY_CATEGORY_META,
  ) as PlaybookActivityCategory[];
  const grouped = order
    .map((cat) => ({
      cat,
      acts: activities.filter((a) => a.category === cat),
    }))
    .filter((g) => g.acts.length > 0);

  return (
    <section className="px-6 py-5">
      <SectionHeader
        eyebrow="ACTIVITY MENU"
        title="Mix and match for your crew"
        description="Costs per person, group-size realities, and booking lead times. Flagged when they match what the groom is into."
      />
      <div className="space-y-5">
        {grouped.map(({ cat, acts }) => {
          const meta = ACTIVITY_CATEGORY_META[cat];
          const Icon = meta.icon;
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <Icon size={14} strokeWidth={1.7} className="text-ink-muted" />
                <h5 className="font-serif text-[15px] text-ink">
                  {meta.label}
                </h5>
              </div>
              <ul className="space-y-3">
                {acts.map((a) => (
                  <ActivityRow key={a.name} act={a} profile={profile} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityRow({
  act,
  profile,
}: {
  act: PlaybookActivity;
  profile: VibeProfile;
}) {
  const matchesInterest =
    act.interestTags?.some((t) => profile.groomInterests.includes(t)) ?? false;

  return (
    <li
      className={cn(
        "rounded-md border px-4 py-3",
        matchesInterest
          ? "border-saffron/50 bg-saffron-pale/20"
          : "border-border bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h6 className="font-serif text-[15px] leading-tight text-ink">
            {act.name}
          </h6>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {act.costPerPerson} · {act.duration} · {INTENSITY_LABEL[act.intensity]}
            {act.weatherDependent && " · Weather-dependent"}
          </p>
        </div>
        {matchesInterest && (
          <span
            className="shrink-0 rounded-full border border-saffron/40 bg-saffron-pale/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ★ Groom pick
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[11.5px] md:grid-cols-2">
        <RowFact label="Group size" value={act.groupSize} />
        <RowFact label="Booking lead" value={act.bookingLead} />
      </dl>
      {act.note && (
        <p className="mt-3 border-t border-border/60 pt-2 text-[12px] italic text-ink-muted">
          {act.note}
        </p>
      )}
    </li>
  );
}

// ── Accommodation Guide ──────────────────────────────────────────────────

function AccommodationGuide({
  accommodation,
}: {
  accommodation: DestinationPlaybook["accommodation"];
}) {
  const rows: { label: string; body?: string }[] = [
    { label: "The House", body: accommodation.house },
    { label: "The Hotel Play", body: accommodation.hotel },
    { label: "The Upgrade", body: accommodation.upgrade },
    { label: "The Budget Move", body: accommodation.budget },
  ].filter((r) => r.body);

  return (
    <section className="px-6 py-5">
      <SectionHeader
        eyebrow="WHERE TO STAY"
        title="Accommodation guide"
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <article
            key={r.label}
            className="rounded-md border border-border bg-white p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <BedDouble
                size={14}
                strokeWidth={1.7}
                className="text-ink-muted"
              />
              <h6 className="font-serif text-[14px] text-ink">{r.label}</h6>
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink">{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Logistics ────────────────────────────────────────────────────────────

function Logistics({
  logistics,
}: {
  logistics: DestinationPlaybook["logistics"];
}) {
  const rows: { label: string; icon: LucideIcon; body: string }[] = [
    { label: "Getting there", icon: MapIcon, body: logistics.gettingThere },
    {
      label: "Getting around",
      icon: Compass,
      body: logistics.gettingAround,
    },
    { label: "Money math", icon: DollarSign, body: logistics.moneyMath },
    {
      label: "Booking timeline",
      icon: Clock,
      body: logistics.bookingTimeline,
    },
    { label: "Best-man tips", icon: Users, body: logistics.bestManTips },
  ];
  return (
    <section className="px-6 py-5">
      <SectionHeader eyebrow="LOGISTICS" title="Getting it done" />
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start gap-3 rounded-md border border-border bg-white p-4"
          >
            <r.icon
              size={14}
              strokeWidth={1.7}
              className="mt-0.5 shrink-0 text-ink-muted"
            />
            <div className="min-w-0">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {r.label}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink">
                {r.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── No-playbook fallback ─────────────────────────────────────────────────

function NoPlaybookState({ destination }: { destination: Destination }) {
  return (
    <section className="px-6 py-10 text-center">
      <Mountain
        size={28}
        strokeWidth={1.3}
        className="mx-auto mb-3 text-ink-faint"
      />
      <h4 className="font-serif text-[18px] leading-snug text-ink">
        Deep-dive playbook coming soon
      </h4>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
        {destination.name} is in the ranked pool, but we haven't written the
        full itinerary + food + activity guide for it yet. In the meantime,
        the highlights and weather are above.
      </p>
      <div className="mx-auto mt-5 max-w-md rounded-md border border-border bg-ivory-warm/40 p-4 text-left">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Top activities here
        </p>
        <ul className="mt-2 space-y-1 text-[12.5px] text-ink">
          {destination.activityHighlights.map((h) => (
            <li key={h}>· {h}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Shared atoms ──────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h3 className="mt-1 font-serif text-[22px] leading-tight text-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
    </header>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildGradient(palette: string[]): string {
  if (palette.length === 0)
    return "linear-gradient(135deg, #F5E6D3, #D4A853)";
  if (palette.length === 1)
    return `linear-gradient(135deg, ${palette[0]}, ${palette[0]})`;
  return `linear-gradient(135deg, ${palette.join(", ")})`;
}

function pickBestMonths(destination: Destination): string[] {
  const entries = Object.entries(destination.weather)
    .filter(([key]) => key !== "flexible")
    .sort((a, b) => b[1].score - a[1].score);
  const top = entries.slice(0, 3);
  return top.map(([month]) =>
    month.charAt(0).toUpperCase() + month.slice(1, 3),
  );
}

function resolveCostDisplay(
  destination: Destination,
  profile: VibeProfile,
): string {
  const tier = profile.budgetTier;
  if (tier && destination.estPerPersonUsd[tier]) {
    const [lo, hi] = destination.estPerPersonUsd[tier]!;
    return `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
  }
  // Fall back to the widest range across available tiers.
  const ranges = Object.values(destination.estPerPersonUsd);
  if (ranges.length === 0) return "—";
  const los = ranges.map((r) => r![0]);
  const his = ranges.map((r) => r![1]);
  return `$${Math.min(...los).toLocaleString()}–$${Math.max(...his).toLocaleString()}`;
}
