"use client";

// ── Tasting Journal (reworked) ────────────────────────────────────────────
// A living tasting notebook, not a log. Three modes:
//
//   Timeline  — chronological list of past visits + upcoming tastings
//               with prep checklists. Each past visit expands to show
//               per-attendee ratings on every dish.
//   Visit detail — per-dish card showing each party's rating + note
//               inline, plus a session-level AI synthesis.
//   Compare  — when the couple has tasted the same dish (by name) at
//               two caterers, show the notes side-by-side.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  Circle,
  Mic,
  RefreshCw,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  buildPartyMap,
} from "@/lib/catering/parties";
import type {
  AttendeeRating,
  Party,
  PartyId,
  TastingCategory,
  TastingDish,
  TastingSynthesis,
  TastingVisit,
  UpcomingTasting,
} from "@/types/catering";
import {
  FlowItem,
  InFlightStrip,
  PartyAvatar,
  PresenceIndicator,
  StatePill,
  SubHeader,
  TabHeader,
} from "./shared/collab";

interface TastingJournalProps {
  weddingId?: string;
}

const CURRENT_PARTY: PartyId = URVASHI_ID;

type Mode = "timeline" | { visitId: string } | "compare";

export function TastingJournal({
  weddingId = DEMO_WEDDING_ID,
}: TastingJournalProps) {
  const vendors = useVendorsStore((s) => s.vendors);
  const allVisits = useCateringStore((s) => s.tasting_visits);
  const allDishes = useCateringStore((s) => s.tasting_dishes);
  const attendee_ratings = useCateringStore((s) => s.attendee_ratings);
  const upcoming_tastings = useCateringStore((s) => s.upcoming_tastings);
  const allEvents = useCateringStore((s) => s.events);
  const presence = useCateringStore((s) => s.presence);
  const setTastingSynthesis = useCateringStore((s) => s.setTastingSynthesis);

  const visits = useMemo(
    () =>
      allVisits
        .filter((v) => v.wedding_id === weddingId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [allVisits, weddingId],
  );
  const events = useMemo(
    () => allEvents.filter((e) => e.wedding_id === weddingId),
    [allEvents, weddingId],
  );
  const upcoming = useMemo(
    () =>
      upcoming_tastings
        .filter((t) => t.wedding_id === weddingId)
        .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for)),
    [upcoming_tastings, weddingId],
  );

  const catererNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const v of vendors) m[v.id] = v.name;
    return m;
  }, [vendors]);
  const partyMap = useMemo(() => buildPartyMap(catererNameMap), [catererNameMap]);

  const [mode, setMode] = useState<Mode>("timeline");
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  async function generateSynthesis(visit: TastingVisit) {
    const caterer = vendors.find((v) => v.id === visit.caterer_id);
    const dishes = allDishes.filter((d) => d.visit_id === visit.id);
    if (!caterer || dishes.length === 0) return;
    setIsSynthesizing(visit.id);
    setLastError(null);
    try {
      const res = await fetch("/api/catering/tasting-synthesis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caterer_name: caterer.name,
          visit,
          dishes,
          candidate_events: events.map((e) => ({
            id: e.id,
            label: e.label,
            cuisine_direction: e.cuisine_direction,
          })),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        synthesis?: TastingSynthesis;
        error?: string;
      };
      if (!data.ok || !data.synthesis) {
        setLastError(data.error ?? "Synthesis failed.");
        return;
      }
      setTastingSynthesis(visit.id, data.synthesis);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsSynthesizing(null);
    }
  }

  const activeVisit =
    typeof mode === "object" && "visitId" in mode
      ? visits.find((v) => v.id === mode.visitId)
      : null;

  // In-flight: upcoming tastings + visits without synthesis + visits where not
  // every attendee has rated yet
  const inFlight: FlowItem[] = useMemo(() => {
    const items: FlowItem[] = [];
    for (const u of upcoming) {
      const daysUntil = Math.max(
        0,
        Math.round(
          (new Date(u.scheduled_for).getTime() - Date.now()) /
            (24 * 3600 * 1000),
        ),
      );
      items.push({
        id: `fl-up-${u.id}`,
        label: `Upcoming · ${catererNameMap[u.caterer_id] ?? "caterer"}`,
        hint: `${daysUntil}d away · ${u.prep_questions.filter((q) => !q.resolved).length} prep questions open`,
        state: "draft",
        onClick: () => setMode({ visitId: u.id }),
      });
    }
    for (const v of visits) {
      if (!v.synthesis) {
        items.push({
          id: `fl-synth-${v.id}`,
          label: `Synthesize ${catererNameMap[v.caterer_id] ?? "caterer"}`,
          hint: `Tasting ${formatDate(v.date)} — no AI read yet`,
          state: "draft",
          waiting_on: URVASHI_ID,
          onClick: () => setMode({ visitId: v.id }),
        });
      }
    }
    return items.slice(0, 6);
  }, [upcoming, visits, catererNameMap]);

  if (visits.length === 0 && upcoming.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <h3 className="text-[17px] font-medium text-ink">No tastings logged</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Log tastings here. Each attendee rates dishes, notes stack
            side-by-side, and an AI synthesis turns impressions into a
            verdict per caterer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <TabHeader
        eyebrow="Catering · Tasting Journal"
        title={
          mode === "timeline"
            ? "Every tasting, every dish"
            : mode === "compare"
              ? "Tastings compared — who won what"
              : activeVisit
                ? `${catererNameMap[activeVisit.caterer_id] ?? "Tasting"}`
                : "Tasting Journal"
        }
        subtitle={
          mode === "timeline"
            ? `${visits.length} logged · ${upcoming.length} upcoming`
            : activeVisit
              ? `${formatDate(activeVisit.date)}${activeVisit.location ? ` · ${activeVisit.location}` : ""}`
              : undefined
        }
        right={<PresenceIndicator signals={presence} partyMap={partyMap} />}
      />

      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-ivory-warm/20 px-7 py-2">
        {activeVisit ? (
          <button
            type="button"
            onClick={() => setMode("timeline")}
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft size={11} strokeWidth={2} />
            Back to timeline
          </button>
        ) : (
          <div className="flex items-center gap-1">
            {(["timeline", "compare"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                  mode === m
                    ? "bg-ink text-ivory"
                    : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {m === "timeline" ? "Timeline" : "Compare across"}
              </button>
            ))}
          </div>
        )}
        {lastError && (
          <p className="rounded-sm border border-rose/30 bg-rose-pale/20 px-2 py-1 text-[11px] text-rose">
            {lastError}
          </p>
        )}
      </div>

      {/* In-flight strip — only on timeline mode */}
      {mode === "timeline" && (
        <div className="border-b border-border bg-white px-7 py-3">
          <SubHeader label="In flight" count={inFlight.length} />
          <InFlightStrip
            items={inFlight}
            partyMap={partyMap}
            emptyMessage="Everything synthesized, no tastings scheduled."
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {mode === "timeline" && (
          <TimelineView
            visits={visits}
            upcoming={upcoming}
            dishes={allDishes}
            ratings={attendee_ratings}
            caterers={vendors}
            partyMap={partyMap}
            onOpenVisit={(id) => setMode({ visitId: id })}
          />
        )}

        {mode === "compare" && (
          <CompareView
            visits={visits}
            dishes={allDishes}
            ratings={attendee_ratings}
            caterers={vendors}
            partyMap={partyMap}
          />
        )}

        {activeVisit && (
          <VisitDetail
            visit={activeVisit}
            dishes={allDishes.filter((d) => d.visit_id === activeVisit.id)}
            ratings={attendee_ratings}
            caterer={vendors.find((v) => v.id === activeVisit.caterer_id)}
            partyMap={partyMap}
            isSynthesizing={isSynthesizing === activeVisit.id}
            onGenerateSynthesis={() => generateSynthesis(activeVisit)}
          />
        )}
      </div>
    </div>
  );
}

// ── Timeline view ────────────────────────────────────────────────────────

function TimelineView({
  visits,
  upcoming,
  dishes,
  ratings,
  caterers,
  partyMap,
  onOpenVisit,
}: {
  visits: TastingVisit[];
  upcoming: UpcomingTasting[];
  dishes: TastingDish[];
  ratings: AttendeeRating[];
  caterers: Array<{ id: string; name: string; location: string | null }>;
  partyMap: Record<PartyId, Party>;
  onOpenVisit: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-border">
      {/* Upcoming first, as a distinct section */}
      {upcoming.length > 0 && (
        <section className="px-7 py-4">
          <SubHeader
            icon={<CalendarClock size={12} strokeWidth={1.8} />}
            label="Upcoming tastings"
            count={upcoming.length}
          />
          <ul className="space-y-2">
            {upcoming.map((u) => (
              <UpcomingCard
                key={u.id}
                upcoming={u}
                catererName={
                  caterers.find((c) => c.id === u.caterer_id)?.name ?? "—"
                }
                partyMap={partyMap}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Logged visits */}
      {visits.map((v) => {
        const caterer = caterers.find((c) => c.id === v.caterer_id);
        const visitDishes = dishes.filter((d) => d.visit_id === v.id);
        const visitRatings = ratings.filter((r) =>
          visitDishes.some((d) => d.id === r.tasting_dish_id),
        );
        const attendeeIds = Array.from(new Set(visitRatings.map((r) => r.party_id)));
        const topDishes = [...visitDishes]
          .sort((a, b) => (b.memorability ?? 0) - (a.memorability ?? 0))
          .slice(0, 3);

        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onOpenVisit(v.id)}
            className="group flex w-full items-start gap-5 px-7 py-4 text-left transition-colors hover:bg-ivory-warm/30"
          >
            <time className="flex w-16 flex-none flex-col" dateTime={v.date}>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatMonth(v.date)}
              </span>
              <span
                className="font-mono text-[20px] leading-none text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDay(v.date)}
              </span>
            </time>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[14.5px] font-medium text-ink">
                  {caterer?.name ?? "Caterer"}
                </h3>
                {!v.synthesis && <StatePill state="draft" tight />}
              </div>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                {v.location ?? caterer?.location ?? "—"}
                {v.attendees.length > 0 ? ` · with ${v.attendees.join(", ")}` : ""}
              </p>
              {v.notes && (
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                  {v.notes}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-1.5">
                {topDishes.map((d) => (
                  <span
                    key={d.id}
                    className="flex items-center gap-1 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink"
                  >
                    {d.name}
                    {d.memorability != null && (
                      <span
                        className="font-mono text-[9px] tabular-nums text-saffron"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {d.memorability}/5
                      </span>
                    )}
                  </span>
                ))}
              </div>

              {v.synthesis && (
                <p className="mt-2 rounded-sm border border-gold/20 bg-ivory-warm/40 px-2 py-1 text-[11.5px] italic leading-relaxed text-ink-muted">
                  "{v.synthesis.recommendation}"
                </p>
              )}
            </div>

            <div className="flex flex-none flex-col items-end gap-1.5 pt-0.5">
              <span
                className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <UtensilsCrossed size={10} strokeWidth={1.8} />
                {visitDishes.length} dish{visitDishes.length === 1 ? "" : "es"}
              </span>
              {attendeeIds.length > 0 && (
                <div className="flex -space-x-1">
                  {attendeeIds.slice(0, 3).map((id) => (
                    <PartyAvatar
                      key={id}
                      party={partyMap[id] ?? { id, initials: id.slice(0, 2), display_name: id, role: "couple", tone: "ink" }}
                      size="sm"
                    />
                  ))}
                </div>
              )}
              <ChevronRight
                size={13}
                strokeWidth={1.8}
                className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-saffron"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Upcoming card with prep checklist ────────────────────────────────────

function UpcomingCard({
  upcoming,
  catererName,
  partyMap,
}: {
  upcoming: UpcomingTasting;
  catererName: string;
  partyMap: Record<PartyId, Party>;
}) {
  const openPrep = upcoming.prep_questions.filter((q) => !q.resolved);
  const daysUntil = Math.max(
    0,
    Math.round(
      (new Date(upcoming.scheduled_for).getTime() - Date.now()) /
        (24 * 3600 * 1000),
    ),
  );
  return (
    <li className="rounded-md border border-saffron/30 bg-saffron-pale/10 p-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[13.5px] font-medium text-ink">
            {catererName} · {formatDate(upcoming.scheduled_for)}
          </h4>
          <p
            className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {upcoming.location ?? "location TBD"} · {daysUntil}d away
          </p>
        </div>
        <div className="flex -space-x-1">
          {upcoming.attendees.slice(0, 3).map((id) => (
            <PartyAvatar
              key={id}
              party={partyMap[id] ?? { id, initials: id.slice(0, 2), display_name: id, role: "couple", tone: "ink" }}
              size="sm"
            />
          ))}
        </div>
      </header>
      {openPrep.length > 0 && (
        <div className="mt-2">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {openPrep.length} prep question{openPrep.length === 1 ? "" : "s"} open
          </p>
          <ul className="mt-1 space-y-0.5">
            {openPrep.map((q) => (
              <li key={q.id} className="flex items-start gap-1.5">
                <Circle
                  size={9}
                  strokeWidth={1.8}
                  className="mt-1 flex-none text-saffron"
                />
                <span className="text-[11.5px] leading-snug text-ink">
                  {q.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {upcoming.dishes_to_request.length > 0 && (
        <p className="mt-2 text-[11px] text-ink-muted">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Request:{" "}
          </span>
          {upcoming.dishes_to_request.join(" · ")}
        </p>
      )}
      {upcoming.dietary_constraints_to_test.length > 0 && (
        <p className="mt-1 text-[11px] text-ink-muted">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Test:{" "}
          </span>
          {upcoming.dietary_constraints_to_test.join(" · ")}
        </p>
      )}
    </li>
  );
}

// ── Visit detail (per-attendee ratings per dish) ─────────────────────────

function VisitDetail({
  visit,
  dishes,
  ratings,
  caterer,
  partyMap,
  isSynthesizing,
  onGenerateSynthesis,
}: {
  visit: TastingVisit;
  dishes: TastingDish[];
  ratings: AttendeeRating[];
  caterer: { name: string } | undefined;
  partyMap: Record<PartyId, Party>;
  isSynthesizing: boolean;
  onGenerateSynthesis: () => void;
}) {
  const grouped = useMemo(() => {
    const groups = new Map<TastingCategory, TastingDish[]>();
    for (const d of dishes) {
      if (!groups.has(d.category)) groups.set(d.category, []);
      groups.get(d.category)!.push(d);
    }
    return groups;
  }, [dishes]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-7 py-4">
      {/* Synthesis card */}
      <section
        className={cn(
          "rounded-md border p-3",
          visit.synthesis
            ? "border-saffron/30 bg-saffron-pale/15"
            : "border-dashed border-border bg-ivory-warm/20",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            AI synthesis {visit.synthesis?.model === "offline" && "(heuristic)"}
          </p>
          <button
            type="button"
            onClick={onGenerateSynthesis}
            disabled={isSynthesizing || dishes.length === 0}
            className={cn(
              "flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
              isSynthesizing
                ? "bg-ink-faint/20 text-ink-faint"
                : visit.synthesis
                  ? "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron"
                  : "bg-ink text-ivory hover:bg-ink-soft",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {isSynthesizing ? (
              <>
                <Sparkles size={10} strokeWidth={2} className="animate-pulse" />
                Reading…
              </>
            ) : visit.synthesis ? (
              <>
                <RefreshCw size={10} strokeWidth={2} />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles size={10} strokeWidth={2} />
                Generate
              </>
            )}
          </button>
        </div>

        {visit.synthesis ? (
          <div className="mt-2 space-y-2">
            <p className="text-[13px] leading-relaxed text-ink">
              {visit.synthesis.summary}
            </p>
            <p className="rounded-sm border border-gold/20 bg-white/70 px-2 py-1 text-[12px] italic text-ink-muted">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] not-italic text-saffron">
                Recommendation ·{" "}
              </span>
              {visit.synthesis.recommendation}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-sage"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Wins
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {visit.synthesis.wins.map((w, i) => (
                    <li key={i} className="text-[11.5px] leading-snug text-ink">
                      · {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Misses
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {visit.synthesis.misses.map((m, i) => (
                    <li key={i} className="text-[11.5px] leading-snug text-ink">
                      · {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
            Generate a synthesis to turn {dishes.length} dish-by-dish impressions into a verdict — wins, misses, and an event-specific recommendation.
          </p>
        )}
      </section>

      {/* Dishes grouped by category */}
      <section className="space-y-4">
        {Array.from(grouped.entries()).map(([cat, list]) => (
          <div key={cat}>
            <SubHeader label={categoryLabel(cat)} count={list.length} />
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              {list.map((d) => (
                <PerAttendeeDishCard
                  key={d.id}
                  dish={d}
                  ratings={ratings.filter((r) => r.tasting_dish_id === d.id)}
                  partyMap={partyMap}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ── Per-attendee dish card ───────────────────────────────────────────────
// Each party's rating + note side-by-side on a single dish.

function PerAttendeeDishCard({
  dish,
  ratings,
  partyMap,
}: {
  dish: TastingDish;
  ratings: AttendeeRating[];
  partyMap: Record<PartyId, Party>;
}) {
  const attendees: PartyId[] = [PRIYA_ID, ARJUN_ID, URVASHI_ID];
  return (
    <article className="rounded-md border border-border bg-white p-3">
      <header className="flex items-start justify-between gap-2">
        <h5 className="text-[13px] font-medium leading-tight text-ink">
          {dish.name}
        </h5>
        {dish.memorability != null && (
          <span
            className={cn(
              "flex-none rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums",
              dish.memorability >= 4
                ? "border-sage/40 bg-sage-pale/40 text-ink"
                : dish.memorability >= 3
                  ? "border-saffron/40 bg-saffron-pale/30 text-ink"
                  : "border-rose/40 bg-rose-pale/30 text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            avg mem {dish.memorability}/5
          </span>
        )}
      </header>

      {/* Per-attendee rows */}
      <ul className="mt-2 divide-y divide-border/60">
        {attendees.map((pid) => {
          const rating = ratings.find((r) => r.party_id === pid);
          const party = partyMap[pid];
          return (
            <li key={pid} className="flex items-start gap-2 py-1.5">
              {party && <PartyAvatar party={party} size="sm" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {party?.display_name ?? pid}
                  </span>
                  {rating ? (
                    <span
                      className="font-mono text-[10.5px] tabular-nums text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {rating.memorability != null && `mem ${rating.memorability}`}
                      {rating.flavor != null &&
                        (rating.memorability != null ? " · " : "") +
                          `flav ${rating.flavor}`}
                    </span>
                  ) : (
                    <span
                      className="font-mono text-[9.5px] italic text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      no rating
                    </span>
                  )}
                </div>
                {rating?.note && (
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                    "{rating.note}"
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Photo / voice affordance (placeholder) */}
      <footer className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
        <button
          type="button"
          disabled
          title="Photo upload coming soon"
          className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Camera size={9} strokeWidth={1.8} />
          photo
        </button>
        <button
          type="button"
          disabled
          title="Voice memo coming soon"
          className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Mic size={9} strokeWidth={1.8} />
          voice memo
        </button>
      </footer>
    </article>
  );
}

// ── Compare across tastings ──────────────────────────────────────────────
// When two caterers served a dish with the same name, lay the notes side
// by side.

function CompareView({
  visits,
  dishes,
  ratings,
  caterers,
  partyMap,
}: {
  visits: TastingVisit[];
  dishes: TastingDish[];
  ratings: AttendeeRating[];
  caterers: Array<{ id: string; name: string }>;
  partyMap: Record<PartyId, Party>;
}) {
  // Group dishes by normalized name
  const sameNameGroups = useMemo(() => {
    const groups = new Map<string, TastingDish[]>();
    for (const d of dishes) {
      const key = normalizeName(d.name);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    return Array.from(groups.entries())
      .filter(([, list]) => {
        // Only care about dishes tasted at multiple visits
        const distinctVisits = new Set(list.map((d) => d.visit_id));
        return distinctVisits.size >= 2;
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [dishes]);

  if (sameNameGroups.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-md border border-dashed border-border bg-ivory-warm/20 px-5 py-8 text-center">
        <h3 className="text-[15px] font-medium text-ink">
          Nothing to compare yet
        </h3>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
          When two caterers serve the same dish at separate tastings, this
          view lines up the notes side by side. Keep tasting and it'll fill.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-7 py-4">
      <ul className="space-y-3">
        {sameNameGroups.map(([key, list]) => (
          <li key={key} className="rounded-md border border-border bg-white p-3">
            <header className="flex items-center justify-between gap-3">
              <h3 className="text-[14.5px] font-medium text-ink">
                {titleCase(key)}
              </h3>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                tasted at {list.length} visit{list.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {list.map((d) => {
                const v = visits.find((x) => x.id === d.visit_id);
                const caterer = caterers.find((c) => c.id === v?.caterer_id);
                const dishRatings = ratings.filter(
                  (r) => r.tasting_dish_id === d.id,
                );
                return (
                  <div
                    key={d.id}
                    className="rounded-sm border border-border/60 bg-ivory-warm/20 p-2"
                  >
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-medium text-ink">
                        {caterer?.name ?? "—"}
                      </span>
                      <span
                        className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {v?.date ?? ""}
                      </span>
                    </p>
                    <dl className="mt-1 grid grid-cols-5 gap-1">
                      <MiniRating label="app" value={d.appearance} />
                      <MiniRating label="flav" value={d.flavor} />
                      <MiniRating label="port" value={d.portion} />
                      <MiniRating label="temp" value={d.temperature} />
                      <MiniRating label="mem" value={d.memorability} />
                    </dl>
                    {d.notes && (
                      <p className="mt-1 text-[11px] italic leading-snug text-ink-muted">
                        "{d.notes}"
                      </p>
                    )}
                    {dishRatings.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {dishRatings.map((r) => {
                          const party = partyMap[r.party_id];
                          return (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1"
                            >
                              {party && <PartyAvatar party={party} size="sm" />}
                              <span
                                className="font-mono text-[9.5px] tabular-nums text-ink"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {r.memorability ?? r.flavor ?? "—"}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniRating({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-sm bg-white px-1 py-0.5 text-center">
      <dt
        className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0 font-mono text-[10.5px] tabular-nums text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function categoryLabel(c: TastingCategory): string {
  return (
    {
      welcome: "Welcome",
      passed_app: "Passed apps",
      main: "Main",
      bread: "Bread",
      side: "Side",
      dessert: "Dessert",
      beverage: "Beverage",
      other: "Other",
    } satisfies Record<TastingCategory, string>
  )[c];
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length > 2 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatMonth(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short" });
  } catch {
    return iso.slice(5, 7);
  }
}

function formatDay(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { day: "numeric" });
  } catch {
    return iso.slice(8, 10);
  }
}
