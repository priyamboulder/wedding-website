"use client";

// ── Concept deep-dive panel ───────────────────────────────────────────────
// Phase 3: the rich click-in experience for a destination concept. Slides
// in from the right as a full-height overlay so it doesn't disrupt the
// rest of the workspace. Sections: narrative itinerary, accommodation
// tiers, dining categories, experiences menu, money math, logistics,
// booking timeline. Concepts without a deepDive block show a graceful
// "coming soon" message.

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CalendarPlus,
  Check,
  DollarSign,
  MapPinned,
  MinusCircle,
  Plane,
  Plus,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  AccommodationPick,
  AccommodationTier,
  DestinationConcept,
  DiningCategory,
  DiningPick,
  ExperienceCategory,
  ExperiencePick,
} from "@/lib/honeymoon/destination-catalog";
import type { ScoredConcept } from "@/lib/honeymoon/scoring";
import { useHoneymoonStore } from "@/stores/honeymoon-store";

interface Props {
  match: ScoredConcept;
  onClose: () => void;
  onAddToShortlist: () => void;
  alreadyAdded: boolean;
}

export function ConceptDeepDive({
  match,
  onClose,
  onAddToShortlist,
  alreadyAdded,
}: Props) {
  const { concept } = match;
  const dive = concept.deepDive;

  // Close on escape; no-scroll on body while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[90] bg-ink/50"
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="fixed bottom-0 right-0 top-0 z-[91] flex w-full max-w-[880px] flex-col bg-ivory shadow-2xl"
        role="dialog"
        aria-label={`${concept.title} — deep dive`}
      >
        <HeroHeader match={match} onClose={onClose} />

        <div className="flex-1 overflow-y-auto">
          {!dive ? (
            <ComingSoon concept={concept} />
          ) : (
            <div className="mx-auto max-w-[720px] space-y-10 px-6 py-8 md:px-10">
              <DiveSection
                eyebrow="THE SHAPE OF THE TRIP"
                title="How it could go"
                icon={<Sparkles size={14} strokeWidth={1.8} />}
              >
                <p className="text-[14.5px] leading-relaxed text-ink">
                  {dive.openingNarrative}
                </p>
                <div className="mt-6 space-y-6">
                  {dive.days.map((d) => (
                    <div
                      key={d.range}
                      className="border-l-2 border-gold/40 pl-5"
                    >
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {d.range}
                      </p>
                      <h4 className="mt-0.5 font-serif text-[18px] text-ink">
                        {d.title}
                      </h4>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                        {d.body}
                      </p>
                    </div>
                  ))}
                </div>
              </DiveSection>

              <DiveSection
                eyebrow="WHERE YOU STAY"
                title="Accommodation"
                icon={<MapPinned size={14} strokeWidth={1.8} />}
              >
                <div className="space-y-4">
                  {dive.accommodations.map((a) => (
                    <AccommodationCard key={a.name} pick={a} />
                  ))}
                </div>
              </DiveSection>

              <DiveSection
                eyebrow="HOW YOU EAT"
                title="Dining — not every meal needs to be an event"
                icon={<Utensils size={14} strokeWidth={1.8} />}
              >
                <div className="space-y-4">
                  {dive.dining.map((d) => (
                    <DiningCard key={d.name} pick={d} />
                  ))}
                </div>
              </DiveSection>

              <DiveSection
                eyebrow="WHAT YOU DO"
                title="Experiences & activities"
                icon={<Sparkles size={14} strokeWidth={1.8} />}
              >
                <div className="space-y-4">
                  {dive.experiences.map((e) => (
                    <ExperienceCard key={e.name} pick={e} />
                  ))}
                </div>
              </DiveSection>

              <DiveSection
                eyebrow="THE MONEY MATH"
                title="What it actually costs"
                icon={<DollarSign size={14} strokeWidth={1.8} />}
              >
                <MoneyMathBlock match={match} />
              </DiveSection>

              <DiveSection
                eyebrow="PRACTICAL"
                title="Logistics you don't want to think about"
                icon={<Plane size={14} strokeWidth={1.8} />}
              >
                <LogisticsList dive={dive} />
              </DiveSection>

              <DiveSection
                eyebrow="BOOK WHAT, WHEN"
                title="Your booking timeline"
                icon={<Calendar size={14} strokeWidth={1.8} />}
              >
                <div className="space-y-4">
                  {dive.bookingTimeline.map((b) => (
                    <div
                      key={b.when}
                      className="rounded-md border border-border bg-white p-4"
                    >
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {b.when}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {b.items.map((it) => (
                          <li
                            key={it}
                            className="flex items-start gap-2 text-[13px] text-ink"
                          >
                            <Check
                              size={12}
                              strokeWidth={2}
                              className="mt-1 shrink-0 text-gold"
                            />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </DiveSection>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-white px-6 py-4">
          <div className="min-w-0 text-[12.5px] text-ink-muted">
            <span className="font-serif text-[15px] text-ink">
              {concept.title}
            </span>{" "}
            — {concept.regions.join(" · ")}
          </div>
          <button
            type="button"
            onClick={onAddToShortlist}
            disabled={alreadyAdded}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-4 py-2 text-[13px] font-medium transition-colors",
              alreadyAdded
                ? "border-border bg-ivory-warm text-ink-faint"
                : "border-gold/40 bg-gold text-white hover:opacity-90",
            )}
          >
            {alreadyAdded ? "Already on shortlist" : "Add to shortlist"}
          </button>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
}

// ── Hero header ────────────────────────────────────────────────────────────

function HeroHeader({
  match,
  onClose,
}: {
  match: ScoredConcept;
  onClose: () => void;
}) {
  const { concept } = match;
  return (
    <div className="relative h-56 shrink-0 overflow-hidden bg-ink">
      {concept.heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={concept.heroImage}
          alt={concept.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = "hidden";
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white"
      >
        <X size={16} strokeWidth={2} />
      </button>
      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory md:px-10">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-pale"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {concept.regions.join(" · ")} · {concept.recommendedDurationDays[0]}–
          {concept.recommendedDurationDays[1]} days
        </p>
        <h3 className="mt-1 font-serif text-[26px] leading-tight md:text-[30px]">
          {concept.title}
        </h3>
        <p className="mt-1 max-w-2xl text-[14px] italic leading-snug text-gold-pale/90">
          {concept.tagline}
        </p>
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────

function DiveSection({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <p
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="text-saffron">{icon}</span>
        {eyebrow}
      </p>
      <h3 className="mt-1 font-serif text-[22px] leading-tight text-ink">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ── Accommodation ──────────────────────────────────────────────────────────

const ACCOMMODATION_TIER_LABEL: Record<AccommodationTier, string> = {
  dream: "The dream stay",
  sweet_spot: "The sweet spot",
  smart: "The smart pick",
  minimoon: "Minimoon option",
};

function AccommodationCard({ pick }: { pick: AccommodationPick }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {ACCOMMODATION_TIER_LABEL[pick.tier]}
          </p>
          <h4 className="mt-0.5 font-serif text-[18px] text-ink">
            {pick.name}
          </h4>
          <p className="text-[12.5px] text-ink-muted">{pick.location}</p>
        </div>
        <p className="shrink-0 rounded-full border border-border bg-ivory-warm/60 px-2.5 py-1 text-[11.5px] font-medium text-ink">
          {pick.nightlyRange}
        </p>
      </div>

      <p className="mt-3 text-[13px] italic text-ink-muted">{pick.vibe}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailRow label="Room pick" value={pick.roomRec} />
        <DetailRow label="Included" value={pick.included} />
        <DetailRow label="Honeymoon perks" value={pick.honeymoonPerks} />
        <DetailRow label="Booking note" value={pick.bookingNote} />
      </div>

      <p className="mt-4 border-t border-border/60 pt-3 text-[12.5px] leading-relaxed text-ink-muted">
        <span
          className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Honest take
        </span>
        {pick.honestTake}
      </p>
    </div>
  );
}

// ── Dining ─────────────────────────────────────────────────────────────────

const DINING_CATEGORY_LABEL: Record<DiningCategory, string> = {
  big_night: "The big night",
  long_lunch: "The long lunch",
  local_find: "The local find",
  breakfast: "The breakfast spot",
  sunset_dinner: "Sunset dinner",
  casual: "Casual night",
  splurge: "The splurge",
  street_food: "Street food",
};

function DiningCard({ pick }: { pick: DiningPick }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {DINING_CATEGORY_LABEL[pick.category]}
          </p>
          <h4 className="mt-0.5 font-serif text-[17px] text-ink">
            {pick.name}
          </h4>
          <p className="text-[12.5px] text-ink-muted">
            {pick.location} · {pick.cuisine}
          </p>
        </div>
        <p className="shrink-0 rounded-full border border-border bg-ivory-warm/60 px-2.5 py-1 text-[11.5px] font-medium text-ink">
          {pick.priceRange}
        </p>
      </div>

      <p className="mt-3 text-[13px] italic text-ink-muted">{pick.setting}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailRow label="Reservation" value={pick.reservation} />
        <DetailRow label="Best table" value={pick.bestTable} />
        {pick.dressCode && (
          <DetailRow label="Dress code" value={pick.dressCode} />
        )}
        <DetailRow label="Insider" value={pick.insiderTip} />
      </div>

      <div className="mt-3 border-t border-border/60 pt-3">
        <DiningDropIn pick={pick} />
      </div>
    </div>
  );
}

// ── Dining drop-in ─────────────────────────────────────────────────────────
// Symmetric to ExperienceDropIn — drops a deep-dive restaurant pick into
// an existing itinerary day. Default time depends on the dining category
// so "The big night" suggests 8 PM and "The breakfast spot" suggests 8 AM.

function DiningDropIn({ pick }: { pick: DiningPick }) {
  const days = useHoneymoonStore((s) => s.days);
  const items = useHoneymoonStore((s) => s.items);
  const addItem = useHoneymoonStore((s) => s.addItem);

  const defaultTime = defaultDiningTime(pick.category);
  const [open, setOpen] = useState(false);
  const [dayId, setDayId] = useState<string>(days[0]?.id ?? "");
  const [time, setTime] = useState(defaultTime);

  const alreadyAdded = items.some(
    (it) => it.title.trim().toLowerCase() === pick.name.trim().toLowerCase(),
  );

  if (days.length === 0) {
    return (
      <p className="text-[11.5px] italic text-ink-faint">
        Seed the itinerary on the Bookings & Itinerary tab to drop this in.
      </p>
    );
  }

  if (alreadyAdded) {
    return (
      <p
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Check size={11} strokeWidth={2.5} />
        Reserved on your itinerary
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (!dayId) setDayId(days[0]!.id);
          if (!time) setTime(defaultTime);
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
      >
        <CalendarPlus size={11} strokeWidth={1.8} />
        Add to itinerary
      </button>
    );
  }

  function commit() {
    if (!dayId) return;
    const note = `${pick.cuisine} · ${pick.setting} · ${pick.reservation}`;
    addItem(dayId, {
      time: time.trim() || defaultTime,
      title: pick.name,
      note,
    });
    setOpen(false);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_auto_auto] items-center gap-2">
      <select
        value={dayId}
        onChange={(e) => setDayId(e.target.value)}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        {days.map((d) => (
          <option key={d.id} value={d.id}>
            Day {d.dayNumber} · {d.label}
          </option>
        ))}
      </select>
      <input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder={defaultTime}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
      />
      <button
        type="button"
        onClick={commit}
        className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold px-3 py-1.5 text-[11.5px] font-medium text-white hover:opacity-90"
      >
        <Plus size={11} strokeWidth={2} /> Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[11.5px] text-ink-muted hover:border-rose/40 hover:text-rose"
      >
        Cancel
      </button>
    </div>
  );
}

function defaultDiningTime(category: DiningCategory): string {
  switch (category) {
    case "breakfast":
      return "8 AM";
    case "long_lunch":
      return "1 PM";
    case "sunset_dinner":
      return "6:30 PM";
    case "big_night":
    case "splurge":
      return "8 PM";
    case "casual":
    case "local_find":
      return "7:30 PM";
    case "street_food":
      return "7 PM";
  }
}

// ── Experiences ────────────────────────────────────────────────────────────

const EXPERIENCE_CATEGORY_LABEL: Record<ExperienceCategory, string> = {
  romance: "Romance",
  adventure: "Adventure",
  culture: "Culture",
  nature: "Nature",
  food_drink: "Food & drink",
  unique: "Unique",
  skip: "Worth skipping",
};

function ExperienceCard({ pick }: { pick: ExperiencePick }) {
  const skipping = pick.category === "skip";
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        skipping
          ? "border-rose/30 bg-rose/5"
          : pick.theOne
            ? "border-gold/40 bg-gold-light/10"
            : "border-border bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
              skipping ? "text-rose" : pick.theOne ? "text-gold" : "text-saffron",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {skipping && (
              <MinusCircle size={11} strokeWidth={2} className="inline" />
            )}
            {EXPERIENCE_CATEGORY_LABEL[pick.category]}
            {pick.theOne && !skipping && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white px-2 py-[1px] text-[9.5px] text-gold">
                <Sparkles size={8} strokeWidth={2} /> This is the one
              </span>
            )}
          </p>
          <h4 className="mt-0.5 font-serif text-[17px] text-ink">{pick.name}</h4>
        </div>
        <p className="shrink-0 rounded-full border border-border bg-ivory-warm/60 px-2.5 py-1 text-[11.5px] font-medium text-ink">
          {pick.costEstimate}
        </p>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
        {pick.blurb}
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-ink-muted">
        <Metadatum label="Time" value={pick.timeCommitment} />
        <Metadatum label="Intensity" value={pick.intensity} />
        <Metadatum label="Best time" value={pick.bestTime} />
        <Metadatum
          label="Weather"
          value={pick.weatherDependent ? "Weather-dependent" : "Weather-proof"}
        />
        <Metadatum label="Book" value={pick.bookAhead} />
      </div>

      {!skipping && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <ExperienceDropIn pick={pick} />
        </div>
      )}
    </div>
  );
}

// ── Experience drop-in ─────────────────────────────────────────────────────
// Lets the couple drop a deep-dive experience straight into an existing
// itinerary day without retyping it. Disabled (with a helpful nudge) when
// no days exist yet, so the couple knows to seed the itinerary first.

function ExperienceDropIn({ pick }: { pick: ExperiencePick }) {
  const days = useHoneymoonStore((s) => s.days);
  const items = useHoneymoonStore((s) => s.items);
  const addItem = useHoneymoonStore((s) => s.addItem);

  const [open, setOpen] = useState(false);
  const [dayId, setDayId] = useState<string>(days[0]?.id ?? "");
  const [time, setTime] = useState("Morning");

  // Detect whether this experience is already in any day's items so the
  // button goes inert after a successful drop. Matches by title — good
  // enough given catalog entries have unique names.
  const alreadyAdded = items.some(
    (it) => it.title.trim().toLowerCase() === pick.name.trim().toLowerCase(),
  );

  if (days.length === 0) {
    return (
      <p className="text-[11.5px] italic text-ink-faint">
        Seed the itinerary on the Bookings & Itinerary tab to drop this in.
      </p>
    );
  }

  if (alreadyAdded) {
    return (
      <p
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Check size={11} strokeWidth={2.5} />
        Added to your itinerary
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (!dayId) setDayId(days[0]!.id);
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
      >
        <CalendarPlus size={11} strokeWidth={1.8} />
        Add to itinerary
      </button>
    );
  }

  function commit() {
    if (!dayId) return;
    const note = `${pick.blurb} · ${pick.costEstimate}`;
    addItem(dayId, {
      time: time.trim() || "Morning",
      title: pick.name,
      note,
    });
    setOpen(false);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_auto_auto] items-center gap-2">
      <select
        value={dayId}
        onChange={(e) => setDayId(e.target.value)}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        {days.map((d) => (
          <option key={d.id} value={d.id}>
            Day {d.dayNumber} · {d.label}
          </option>
        ))}
      </select>
      <input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="Time (e.g. 9 AM)"
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
      />
      <button
        type="button"
        onClick={commit}
        className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold px-3 py-1.5 text-[11.5px] font-medium text-white hover:opacity-90"
      >
        <Plus size={11} strokeWidth={2} /> Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[11.5px] text-ink-muted hover:border-rose/40 hover:text-rose"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Money math ─────────────────────────────────────────────────────────────

function MoneyMathBlock({ match }: { match: ScoredConcept }) {
  const mm = match.concept.deepDive?.moneyMath;
  if (!mm) return null;
  const rows: { label: string; range: [number, number] }[] = [
    { label: "Flights", range: mm.flights },
    { label: "Accommodation", range: mm.accommodation },
    { label: "Food & drink", range: mm.food },
    { label: "Activities & experiences", range: mm.activities },
    { label: "Transportation", range: mm.transport },
    { label: "Miscellaneous", range: mm.misc },
  ];
  const lo = rows.reduce((a, r) => a + r.range[0], 0);
  const hi = rows.reduce((a, r) => a + r.range[1], 0);
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <dl className="divide-y divide-border/60">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-3 py-2 text-[13px]"
          >
            <dt className="text-ink-muted">{r.label}</dt>
            <dd
              className="font-mono text-[12px] text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${r.range[0].toLocaleString()}–${r.range[1].toLocaleString()}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 py-3 text-[13.5px]">
          <dt className="font-medium text-ink">Total estimated trip cost</dt>
          <dd
            className="font-mono text-[13px] font-semibold text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ${lo.toLocaleString()}–${hi.toLocaleString()}
          </dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-border/60 pt-3 text-[12.5px] leading-relaxed text-ink-muted">
        <span
          className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Where to save / splurge
        </span>
        {mm.saveSplurge}
      </p>
    </div>
  );
}

// ── Logistics ──────────────────────────────────────────────────────────────

function LogisticsList({
  dive,
}: {
  dive: NonNullable<DestinationConcept["deepDive"]>;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Getting there", value: dive.logistics.gettingThere },
    { label: "Getting around", value: dive.logistics.gettingAround },
    { label: "Documents", value: dive.logistics.documents },
    { label: "Health & safety", value: dive.logistics.health },
    { label: "Money", value: dive.logistics.money },
    { label: "Connectivity", value: dive.logistics.connectivity },
    { label: "Language", value: dive.logistics.language },
    { label: "Honeymoon tips", value: dive.logistics.honeymoonTips },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div
          key={r.label}
          className="rounded-md border border-border bg-white p-4"
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {r.label}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">
            {r.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Bits ───────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">
        {value}
      </p>
    </div>
  );
}

function Metadatum({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-ivory-warm/40 px-2 py-0.5">
      <span
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span className="text-ink-muted">{value}</span>
    </span>
  );
}

function ComingSoon({ concept }: { concept: DestinationConcept }) {
  return (
    <div className="mx-auto max-w-[640px] px-8 py-16 text-center">
      <Sparkles
        size={22}
        strokeWidth={1.4}
        className="mx-auto mb-3 text-saffron"
      />
      <h3 className="font-serif text-[22px] text-ink">
        Full trip guide coming soon
      </h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        We're still writing the editorial guide for {concept.title}. In the
        meantime — the card on the inspiration wall has enough to decide if
        this one is worth a place on your shortlist, and the research tab
        below is the right place to start capturing what you find.
      </p>
      <p className="mt-4 text-[12.5px] italic text-ink-faint">
        {concept.hook}
      </p>
    </div>
  );
}
