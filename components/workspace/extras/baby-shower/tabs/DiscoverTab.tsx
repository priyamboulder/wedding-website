"use client";

// ── Discover tab ──────────────────────────────────────────────────────────
// Ranked theme / activity / menu / vendor / destination recommendations.
// Unlike bachelorette Discover (destinations), baby-shower Discover is
// centered on the *experience* — destinations only appear when the venue
// type is "destination," vendors only when the venue is formal.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Baby,
  Bookmark,
  Check,
  Flower2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import {
  getRecById,
  useRankedBabyShowerRecs,
} from "@/lib/baby-shower-themes";
import type {
  BabyShowerRec,
  BabyShowerRecMatch,
  BabyShowerRecType,
} from "@/types/baby-shower";
import { FORMAL_VENUE_TYPES } from "@/lib/baby-shower-seed";
import { formatMoney } from "../../bachelorette/ui";

type FilterId = "all" | BabyShowerRecType;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "theme", label: "Themes" },
  { id: "activity", label: "Activities" },
  { id: "menu", label: "Menus" },
  { id: "vendor", label: "Vendors" },
  { id: "destination", label: "Destinations" },
];

export function DiscoverTab({
  onGoToItinerary,
}: {
  onGoToItinerary: () => void;
}) {
  const ranked = useRankedBabyShowerRecs();
  const plan = useBabyShowerStore((s) => s.plan);
  const [filter, setFilter] = useState<FilterId>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const activeRec = detailId ? getRecById(detailId) : null;

  const showVendors =
    plan.venueType !== null && FORMAL_VENUE_TYPES.includes(plan.venueType);
  const showDestinations = plan.venueType === "destination";

  const visibleFilters = FILTERS.filter((f) => {
    if (f.id === "vendor") return showVendors;
    if (f.id === "destination") return showDestinations;
    return true;
  });

  const visibleRanked = useMemo(
    () => ranked.filter((m) => filter === "all" || m.rec.type === filter),
    [ranked, filter],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<FilterId, number>> = { all: ranked.length };
    for (const m of ranked) {
      c[m.rec.type] = (c[m.rec.type] ?? 0) + 1;
    }
    return c;
  }, [ranked]);

  if (activeRec) {
    return (
      <RecDetail
        rec={activeRec}
        onBack={() => setDetailId(null)}
        onGoToItinerary={onGoToItinerary}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles
            size={10}
            strokeWidth={1.8}
            className="mr-1 inline-block align-[-1px]"
          />
          Curated for your shower
        </p>
        <h2 className="font-serif text-[22px] leading-tight text-ink">
          Themes and experiences that match your vibe.
        </h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          Each idea is scored on vibe fit, guest count, venue, season, budget,
          and logistics — then filtered against your hard no's. Top matches
          first. Tap any card for the full blueprint.
        </p>
      </header>

      {/* Filter pills */}
      <nav className="flex flex-wrap gap-1.5">
        {visibleFilters.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleRanked.map((match) => (
          <RecCard
            key={match.rec.id}
            match={match}
            onOpen={() => setDetailId(match.rec.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────

function RecCard({
  match,
  onOpen,
}: {
  match: BabyShowerRecMatch;
  onOpen: () => void;
}) {
  const { rec, score, matchReasons, dismissed } = match;
  const recStatus = useBabyShowerStore((s) => s.recStatus[rec.id]);
  const saved = recStatus === "saved" || recStatus === "selected";

  const gradient = `linear-gradient(135deg, ${rec.heroPalette[0]}, ${rec.heroPalette[1]}, ${rec.heroPalette[2]})`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group overflow-hidden rounded-lg border bg-white text-left transition-all",
        dismissed
          ? "border-border/50 opacity-50"
          : saved
            ? "border-ink shadow-sm"
            : "border-border hover:border-saffron/50 hover:shadow-sm",
      )}
    >
      <div className="relative h-28 w-full" style={{ background: gradient }}>
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ◉ {rec.type}
        </span>
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score}% match
        </span>
        {saved && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory">
            <Check size={9} strokeWidth={2.5} />
            Saved
          </span>
        )}
      </div>

      <div className="space-y-2.5 p-5">
        <div>
          <h3 className="font-serif text-[18px] leading-tight text-ink">
            {rec.name}
          </h3>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
            {rec.tagline}
          </p>
        </div>

        {matchReasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {matchReasons.map((r) => (
              <li
                key={r}
                className="rounded-sm bg-sage-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sage"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {r}
              </li>
            ))}
          </ul>
        )}

        {rec.seasonNote && (
          <p className="text-[11.5px] text-ink-faint">
            🌿 {rec.seasonNote}
          </p>
        )}

        <ul className="flex flex-wrap gap-1.5 pt-1">
          {rec.detailPills.slice(0, 4).map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[11.5px] text-ink-muted"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────

function RecDetail({
  rec,
  onBack,
  onGoToItinerary,
}: {
  rec: BabyShowerRec;
  onBack: () => void;
  onGoToItinerary: () => void;
}) {
  const recStatus = useBabyShowerStore((s) => s.recStatus[rec.id]);
  const setRecStatus = useBabyShowerStore((s) => s.setRecStatus);
  const clearRecStatus = useBabyShowerStore((s) => s.clearRecStatus);
  const addItineraryItem = useBabyShowerStore((s) => s.addItineraryItem);
  const itinerary = useBabyShowerStore((s) => s.itinerary);

  const saved = recStatus === "saved" || recStatus === "selected";
  const dismissed = recStatus === "dismissed";

  const gradient = `linear-gradient(135deg, ${rec.heroPalette[0]}, ${rec.heroPalette[1]}, ${rec.heroPalette[2]}, ${rec.heroPalette[3] ?? rec.heroPalette[0]})`;

  const costRange =
    rec.costLowCents > 0 || rec.costHighCents > 0
      ? `${formatMoney(rec.costLowCents)}–${formatMoney(rec.costHighCents)}`
      : "Varies";

  function handleAddToItinerary() {
    const lastItem = [...itinerary]
      .filter((it) => it.blockType !== "behind_the_scenes")
      .sort((a, b) => b.sortOrder - a.sortOrder)[0];
    const nextSort = (lastItem?.sortOrder ?? 0) + 1;
    addItineraryItem({
      dayNumber: 1,
      startTime: "",
      durationMinutes: 30,
      activityName: rec.name,
      description: rec.tagline,
      blockType: rec.type === "theme" ? "highlight" : "standard",
      sortOrder: nextSort,
      sourceRecId: rec.id,
    });
    setRecStatus(rec.id, "selected");
    onGoToItinerary();
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={13} strokeWidth={1.8} />
        Back to all ideas
      </button>

      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div
          className="h-40 w-full"
          style={{ background: gradient }}
          aria-hidden
        />
        <div className="space-y-5 p-6">
          <header>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◉ {rec.type}
            </p>
            <h1 className="mt-1 font-serif text-[26px] leading-tight text-ink">
              {rec.name}
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              {rec.tagline}
            </p>
          </header>

          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink">
            {rec.narrative}
          </p>

          <div className="rounded-md border border-sage/30 bg-sage-pale/30 p-4">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Sparkles
                size={10}
                strokeWidth={1.8}
                className="mr-1 inline-block align-[-1px]"
              />
              Why this matches your shower
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {rec.whyItMatches}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p
                className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                What you'll need
              </p>
              <ul className="space-y-1.5">
                {rec.whatYoullNeed.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px] text-ink"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <DetailField label="Estimated cost" value={costRange} />
              <DetailField
                label="Guest range"
                value={`${rec.minGuests}–${rec.maxGuests} guests`}
              />
              <DetailField label="Duration" value={rec.suggestedDuration} />
              {rec.pairings.length > 0 && (
                <div>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Pairs well with
                  </p>
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {rec.pairings
                      .map((id) => getRecById(id))
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((r) => (
                        <li
                          key={r!.id}
                          className="rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[11.5px] text-ink-muted"
                        >
                          {r!.name}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={handleAddToItinerary}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Flower2 size={12} strokeWidth={1.8} />
              Add to itinerary
            </button>
            <button
              type="button"
              onClick={() =>
                saved ? clearRecStatus(rec.id) : setRecStatus(rec.id, "saved")
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                saved
                  ? "border-ink bg-ink/5 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              <Bookmark size={12} strokeWidth={1.8} />
              {saved ? "Saved" : "Save for later"}
            </button>
            <button
              type="button"
              onClick={() =>
                dismissed
                  ? clearRecStatus(rec.id)
                  : setRecStatus(rec.id, "dismissed")
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-rose/40 hover:text-rose"
            >
              <X size={12} strokeWidth={1.8} />
              {dismissed ? "Undo dismiss" : "Not for us"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="text-[13px] text-ink">{value}</p>
    </div>
  );
}
