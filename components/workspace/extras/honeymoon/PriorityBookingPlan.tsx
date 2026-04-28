"use client";

// ── Priority booking plan ─────────────────────────────────────────────────
// Phase 4 refinement on the Bookings tab. Groups bookings into four
// deadline tiers (now / 6–8 weeks out / 2 weeks out / day-of) so couples
// can tell at a glance what they should be locking in this week vs. what
// can wait. If a leading destination has a deep-dive with a
// bookingTimeline, a one-click seeder drops the recommended list straight
// into the store.

import { Calendar, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { BOOKING_PRIORITY_OPTIONS } from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type { Booking, BookingPriorityTier } from "@/types/honeymoon";
import { DESTINATION_CONCEPTS } from "@/lib/honeymoon/destination-catalog";
import { cn } from "@/lib/utils";
import { Section } from "../bachelorette/ui";

export function PriorityBookingPlan() {
  const bookings = useHoneymoonStore((s) => s.bookings);
  const destinations = useHoneymoonStore((s) => s.destinations);
  const addBooking = useHoneymoonStore((s) => s.addBooking);

  const leadingDestination = useMemo(
    () => destinations.find((d) => d.status === "leading"),
    [destinations],
  );

  const matchedConcept = useMemo(() => {
    if (!leadingDestination) return null;
    const title = leadingDestination.name.trim().toLowerCase();
    // First pass: direct title match (set when Add to shortlist seeded the
    // destination from the inspiration wall).
    const byTitle = DESTINATION_CONCEPTS.find(
      (c) => c.title.trim().toLowerCase() === title,
    );
    if (byTitle) return byTitle;
    // Fall back to a stop name match ("Amalfi Coast" vs "Positano").
    return (
      DESTINATION_CONCEPTS.find((c) =>
        c.stops.some((s) => s.trim().toLowerCase() === title),
      ) ?? null
    );
  }, [leadingDestination]);

  const grouped = useMemo(() => groupByPriority(bookings), [bookings]);
  const untiered = bookings.filter(
    (b) => !b.priorityTier || b.priorityTier === "unset",
  );
  const hasAnyTiered = bookings.some(
    (b) => b.priorityTier && b.priorityTier !== "unset",
  );

  function seedFromConcept() {
    if (!matchedConcept?.deepDive) return;
    const existing = new Set(
      bookings.map((b) => b.label.trim().toLowerCase()),
    );
    for (const block of matchedConcept.deepDive.bookingTimeline) {
      const tier = classifyBookingWhen(block.when);
      for (const item of block.items) {
        if (existing.has(item.trim().toLowerCase())) continue;
        addBooking(item, tier);
      }
    }
  }

  const canSeed = Boolean(matchedConcept?.deepDive?.bookingTimeline?.length);
  const alreadySeeded =
    matchedConcept?.deepDive &&
    matchedConcept.deepDive.bookingTimeline.every((block) =>
      block.items.every((item) =>
        bookings.some(
          (b) => b.label.trim().toLowerCase() === item.trim().toLowerCase(),
        ),
      ),
    );

  return (
    <Section
      eyebrow="WHEN TO BOOK WHAT"
      title="Priority plan"
      description="Bookings grouped by how urgently you should lock them in. Don't waste a month worrying about beach chairs — those are day-of. Flights and hero hotels are right now."
      right={
        canSeed ? (
          <button
            type="button"
            onClick={seedFromConcept}
            disabled={alreadySeeded}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              alreadySeeded
                ? "border-border bg-ivory-warm text-ink-faint"
                : "border-gold/40 bg-gold-light/20 text-gold hover:bg-gold-light/40",
            )}
          >
            <Sparkles size={12} strokeWidth={1.8} />
            {alreadySeeded
              ? "Already seeded"
              : `Seed from ${matchedConcept?.title ?? "guide"}`}
          </button>
        ) : undefined
      }
    >
      {!hasAnyTiered && !canSeed ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(["now", "six_weeks", "two_weeks", "day_of"] as const).map(
            (tier) => (
              <TierColumn
                key={tier}
                tier={tier}
                bookings={grouped[tier] ?? []}
              />
            ),
          )}
        </div>
      )}

      {untiered.length > 0 && (
        <div className="mt-5 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Unsorted · {untiered.length}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Set a priority on each booking in the table below to move it into
            the plan.
          </p>
        </div>
      )}
    </Section>
  );
}

// ── Tier column ────────────────────────────────────────────────────────────

const TIER_TONE: Record<
  Exclude<BookingPriorityTier, "unset">,
  { border: string; chip: string; label: string }
> = {
  now: {
    border: "border-rose/40 bg-rose/5",
    chip: "text-rose",
    label: "Book now",
  },
  six_weeks: {
    border: "border-gold/40 bg-gold-light/10",
    chip: "text-gold",
    label: "6–8 weeks out",
  },
  two_weeks: {
    border: "border-saffron/40 bg-saffron-pale/30",
    chip: "text-saffron",
    label: "2 weeks out",
  },
  day_of: {
    border: "border-sage/40 bg-sage/5",
    chip: "text-sage",
    label: "Day of",
  },
};

function TierColumn({
  tier,
  bookings,
}: {
  tier: Exclude<BookingPriorityTier, "unset">;
  bookings: Booking[];
}) {
  const opt = BOOKING_PRIORITY_OPTIONS.find((o) => o.value === tier);
  const tone = TIER_TONE[tier];
  return (
    <div className={cn("flex flex-col rounded-lg border p-4", tone.border)}>
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em]",
              tone.chip,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Calendar size={10} strokeWidth={1.8} />
            {tone.label}
          </p>
          <p className="mt-0.5 text-[11.5px] italic text-ink-muted">
            {opt?.blurb}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] tabular-nums text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {bookings.length}
        </span>
      </header>

      {bookings.length === 0 ? (
        <p className="text-[12px] italic text-ink-faint">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-white px-3 py-1.5 text-[12.5px]"
            >
              <span className="min-w-0 flex-1 truncate text-ink">{b.label}</span>
              <StatusBadge status={b.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const tone =
    status === "booked"
      ? "border-sage/40 text-sage"
      : status === "hold"
        ? "border-gold/40 text-gold"
        : status === "researching"
          ? "border-border text-ink-muted"
          : "border-border/40 text-ink-faint";
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
        tone,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function groupByPriority(
  bookings: Booking[],
): Partial<Record<BookingPriorityTier, Booking[]>> {
  const groups: Partial<Record<BookingPriorityTier, Booking[]>> = {};
  for (const b of bookings) {
    const tier = b.priorityTier ?? "unset";
    groups[tier] = groups[tier] ?? [];
    groups[tier]!.push(b);
  }
  return groups;
}

// Matches free-form "when" strings from a deep-dive bookingTimeline to our
// tier enum. Generous on matching — we control the source strings.
export function classifyBookingWhen(when: string): BookingPriorityTier {
  const s = when.toLowerCase();
  if (/(day\s*of|same[-\s]*day|walk[-\s]*in)/.test(s)) return "day_of";
  if (/(2\s*weeks?|14\s*days?|two\s*weeks?|2–3\s*weeks?)/.test(s))
    return "two_weeks";
  if (/(4[-–]?8?\s*weeks?|6[-–]?8?\s*weeks?|weeks?|2\s*months?)/.test(s))
    return "six_weeks";
  if (/(6\s*months?|4\s*months?|3\s*months?|months?|now|today)/.test(s))
    return "now";
  return "unset";
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center">
      <Calendar
        size={22}
        strokeWidth={1.4}
        className="mx-auto mb-2 text-ink-faint"
      />
      <p className="text-[13px] text-ink-muted">
        Priority plan is empty. Mark a destination as{" "}
        <strong className="text-ink">Leading</strong> with a fleshed-out trip
        guide, then seed the plan in one click — or set a priority on each
        booking manually in the table below.
      </p>
    </div>
  );
}

