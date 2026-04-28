"use client";

// ── Dietary Atlas (reworked) ──────────────────────────────────────────────
// The matrix stays, but every cell is a working affordance. Beyond the
// grid, the surface now shows:
//   - In-flight strip (upcoming dietary decisions, gaps being filled,
//     questions awaiting vendor reply).
//   - Decisions pending — open questions like "Should Sangeet have a
//     dedicated jain station?" where parties haven't all weighed in.
//   - Briefing action shows last-sent + vendor-response state inline.
//
// Clicking a cell opens a drawer with the same AI gap-fill as before,
// plus inline "ask the caterer" and "park this" affordances.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardCopy,
  FileText,
  HelpCircle,
  Info,
  PauseCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  buildAtlasRisks,
  buildCatererBriefing,
  buildMatrix,
  summarizeRequirements,
  type AtlasRisk,
  type MatrixCell,
  type RequirementSummary,
} from "@/lib/catering/dietary-atlas";
import { dietaryLabel } from "@/lib/catering/intelligence";
import {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  buildPartyMap,
} from "@/lib/catering/parties";
import type {
  DietaryFlag,
  Dish,
  MenuEvent,
  OpenQuestion,
  PartyId,
  PendingEdit,
} from "@/types/catering";
import {
  FlowItem,
  InFlightStrip,
  PartyAvatar,
  PartyAvatars,
  PresenceIndicator,
  StatePill,
  SubHeader,
  TabHeader,
} from "./shared/collab";

interface DietaryAtlasProps {
  weddingId?: string;
}

const CURRENT_PARTY: PartyId = URVASHI_ID;

export function DietaryAtlas({ weddingId = DEMO_WEDDING_ID }: DietaryAtlasProps) {
  const allEvents = useCateringStore((s) => s.events);
  const moments = useCateringStore((s) => s.moments);
  const dishes = useCateringStore((s) => s.dishes);
  const dietary_totals = useCateringStore((s) => s.dietary_totals);
  const open_questions = useCateringStore((s) => s.open_questions);
  const presence = useCateringStore((s) => s.presence);
  const proposals = useCateringStore((s) => s.proposals);
  const queuePendingEdits = useCateringStore((s) => s.queuePendingEdits);
  const addOpenQuestion = useCateringStore((s) => s.addOpenQuestion);
  const setSelectedEvent = useCateringStore((s) => s.setSelectedEvent);

  const vendors = useVendorsStore((s) => s.vendors);
  const catererNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const v of vendors) m[v.id] = v.name;
    return m;
  }, [vendors]);
  const partyMap = useMemo(() => buildPartyMap(catererNameMap), [catererNameMap]);

  const events = useMemo(
    () =>
      allEvents
        .filter((e) => e.wedding_id === weddingId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allEvents, weddingId],
  );

  const requirements = useMemo(
    () => summarizeRequirements(dietary_totals, events),
    [dietary_totals, events],
  );
  const cells = useMemo(
    () => buildMatrix(events, moments, dishes, dietary_totals, requirements),
    [events, moments, dishes, dietary_totals, requirements],
  );
  const risks = useMemo(
    () => buildAtlasRisks(events, cells, requirements),
    [events, cells, requirements],
  );

  // Decisions pending — open questions on dietary cells that haven't
  // been answered yet. These require a party call, not a vendor action.
  const decisionsPending = useMemo(
    () => open_questions.filter((q) => q.entity_kind === "dietary_cell" && !q.answered_at),
    [open_questions],
  );

  // Pick the primary caterer for "ask the caterer" actions — the one
  // with the most received proposals.
  const primaryCatererId = useMemo<string | null>(() => {
    const counts = new Map<string, number>();
    for (const p of proposals) {
      if (p.status !== "received") continue;
      counts.set(p.caterer_id, (counts.get(p.caterer_id) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestN = 0;
    counts.forEach((n, id) => {
      if (n > bestN) {
        best = id;
        bestN = n;
      }
    });
    return best;
  }, [proposals]);

  // In-flight strip
  const inFlight: FlowItem[] = useMemo(() => {
    const items: FlowItem[] = [];
    // Hard gap cells
    for (const cell of cells) {
      if (cell.severity !== "gap") continue;
      const ev = events.find((e) => e.id === cell.event_id);
      const req = requirements.find((r) => r.flag === cell.flag);
      if (!ev || !req) continue;
      items.push({
        id: `fl-gap-${cell.event_id}-${cell.flag}`,
        label: `${req.label} gap at ${ev.label}`,
        hint: `${cell.guest_count} guests, 0 dishes`,
        state: "blocked",
        onClick: () => setSelectedCell(cell),
      });
    }
    // Unanswered dietary questions
    for (const q of decisionsPending) {
      items.push({
        id: `fl-q-${q.id}`,
        label: truncate(q.body, 60),
        hint: `Open · ${partyMap[q.for_party]?.display_name ?? "decision"}`,
        state: "in_debate",
        waiting_on: q.for_party,
      });
    }
    return items.slice(0, 6);
  }, [cells, events, requirements, decisionsPending, partyMap]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingLastSent, setBriefingLastSent] = useState<string | null>(null);
  const [gapFilling, setGapFilling] = useState<string | null>(null);
  const [gapError, setGapError] = useState<string | null>(null);
  const [gapSuccess, setGapSuccess] = useState<string | null>(null);

  async function fillGap(cell: MatrixCell) {
    const event = events.find((e) => e.id === cell.event_id);
    const req = requirements.find((r) => r.flag === cell.flag);
    if (!event || !req) return;
    const key = `${cell.event_id}-${cell.flag}`;
    setGapFilling(key);
    setGapError(null);
    setGapSuccess(null);
    try {
      const eventMoments = moments
        .filter((m) => m.event_id === event.id)
        .sort((a, b) => a.order - b.order);
      const eventDishes = dishes.filter((d) =>
        eventMoments.some((m) => m.id === d.moment_id),
      );
      const otherEventsProjection = events
        .filter((e) => e.id !== event.id)
        .map((e) => {
          const momIds = new Set(
            moments.filter((m) => m.event_id === e.id).map((m) => m.id),
          );
          return {
            event_id: e.id,
            label: e.label,
            cuisine_direction: e.cuisine_direction,
            dish_names: dishes
              .filter((d) => momIds.has(d.moment_id))
              .map((d) => d.name),
          };
        });
      const totals = dietary_totals.find((t) => t.event_id === event.id);
      const instruction = buildGapInstruction(cell, req.label);

      const res = await fetch("/api/catering/menu-design", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wedding_id: weddingId,
          event,
          moments: eventMoments,
          dishes: eventDishes,
          other_events: otherEventsProjection,
          dietary_totals: totals
            ? { total_guests: totals.total_guests, counts: totals.counts }
            : undefined,
          instruction,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        rationale: string;
        edits: Array<Omit<PendingEdit, "id" | "created_at" | "status">>;
        error?: string;
      };
      if (!data.ok) {
        setGapError(data.error ?? "AI gap-fill failed.");
        return;
      }
      if (data.edits?.length) {
        queuePendingEdits(data.edits);
        setGapSuccess(
          `Queued ${data.edits.length} edit${data.edits.length === 1 ? "" : "s"} for ${event.label} — review in Menu Studio.`,
        );
      } else {
        setGapSuccess(data.rationale || "AI returned no edits.");
      }
    } catch (err) {
      setGapError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setGapFilling(null);
    }
  }

  function askCatererAbout(cell: MatrixCell) {
    if (!primaryCatererId) return;
    const event = events.find((e) => e.id === cell.event_id);
    const req = requirements.find((r) => r.flag === cell.flag);
    if (!event || !req) return;
    addOpenQuestion({
      wedding_id: weddingId,
      entity_kind: "dietary_cell",
      entity_id: `${cell.event_id}:${cell.flag}`,
      raised_by: CURRENT_PARTY,
      for_party: primaryCatererId,
      body: `Can you serve ${req.label} at ${event.label}? ${cell.guest_count} guest${cell.guest_count === 1 ? "" : "s"} need it and current coverage is ${Math.round(cell.coverage * 100)}%.`,
    });
    setGapSuccess(
      `Asked ${catererNameMap[primaryCatererId] ?? "the caterer"} about ${req.label} at ${event.label}.`,
    );
  }

  function parkDecision(cell: MatrixCell) {
    const req = requirements.find((r) => r.flag === cell.flag);
    const event = events.find((e) => e.id === cell.event_id);
    if (!req || !event) return;
    addOpenQuestion({
      wedding_id: weddingId,
      entity_kind: "dietary_cell",
      entity_id: `${cell.event_id}:${cell.flag}`,
      raised_by: CURRENT_PARTY,
      for_party: URVASHI_ID,
      body: `Parked: ${req.label} at ${event.label} — revisit before freezing the menu.`,
    });
    setGapSuccess(
      `Parked ${req.label} @ ${event.label}. Shows up in Decisions pending until someone resolves it.`,
    );
  }

  function handleCopyBriefing() {
    setBriefingLastSent(new Date().toISOString());
  }

  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <h3 className="text-[17px] font-medium text-ink">No events yet</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Add wedding events to populate the Dietary Atlas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <TabHeader
        eyebrow="Catering · Dietary Atlas"
        title="Every guest, every event"
        subtitle={`${events.length} event${events.length === 1 ? "" : "s"} · ${requirements.length} requirement${requirements.length === 1 ? "" : "s"} tracked`}
        right={
          <div className="flex items-start gap-4">
            <PresenceIndicator signals={presence} partyMap={partyMap} />
            <button
              type="button"
              onClick={() => setBriefingOpen(true)}
              className="flex flex-col items-end gap-0.5 rounded-sm border border-border bg-white px-2 py-1 text-right hover:border-saffron/40"
            >
              <span
                className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <FileText size={10} strokeWidth={1.8} />
                Caterer briefing
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {briefingLastSent
                  ? `sent ${relTime(briefingLastSent)}`
                  : "not sent yet"}
              </span>
            </button>
          </div>
        }
      />

      {(gapError || gapSuccess) && (
        <div
          className={cn(
            "border-b px-7 py-2 text-[11.5px]",
            gapError
              ? "border-rose/30 bg-rose-pale/20 text-rose"
              : "border-sage/30 bg-sage-pale/20 text-ink",
          )}
        >
          {gapError ?? gapSuccess}
        </div>
      )}

      {/* In-flight strip */}
      <div className="border-b border-border bg-white px-7 py-3">
        <SubHeader label="In flight" count={inFlight.length} />
        <InFlightStrip
          items={inFlight}
          partyMap={partyMap}
          emptyMessage="No open dietary gaps or decisions."
        />
      </div>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_280px] overflow-hidden">
        <section className="overflow-y-auto px-7 py-4">
          {/* Peak counts ribbon */}
          <section className="mb-5">
            <SubHeader
              label="Peak counts across the wedding"
              count={requirements.length}
            />
            <div className="flex flex-wrap gap-1.5">
              {requirements.length === 0 && (
                <p className="text-[11.5px] text-ink-muted">
                  No dietary requirements in the guest list yet.
                </p>
              )}
              {requirements.map((r) => (
                <span
                  key={r.flag}
                  className="flex items-baseline gap-1 rounded-sm border border-border bg-white px-1.5 py-0.5"
                >
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.label}
                  </span>
                  <span
                    className="font-mono text-[12px] tabular-nums text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.peak_count}
                  </span>
                </span>
              ))}
            </div>
          </section>

          {/* Decisions pending */}
          <section className="mb-5">
            <SubHeader
              icon={<HelpCircle size={12} strokeWidth={1.8} />}
              label="Decisions pending"
              count={decisionsPending.length}
            />
            {decisionsPending.length === 0 ? (
              <p className="rounded-sm border border-dashed border-border bg-ivory-warm/30 px-3 py-2 text-[11.5px] text-ink-muted">
                No open dietary decisions. When gaps need a party call,
                they'll show up here.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {decisionsPending.map((q) => (
                  <DecisionPendingRow
                    key={q.id}
                    question={q}
                    partyMap={partyMap}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Matrix */}
          <section>
            <SubHeader label="Coverage matrix" />
            <DietaryMatrix
              events={events}
              requirements={requirements}
              cells={cells}
              onSelectCell={setSelectedCell}
            />
          </section>
        </section>

        {/* Right rail: risks */}
        <RiskRail
          risks={risks}
          events={events}
          onJumpToEvent={setSelectedEvent}
        />
      </div>

      {selectedCell && (
        <CellDrawer
          cell={selectedCell}
          event={events.find((e) => e.id === selectedCell.event_id)!}
          requirement={
            requirements.find((r) => r.flag === selectedCell.flag)!
          }
          dishes={dishes.filter((d) => selectedCell.dish_ids.includes(d.id))}
          primaryCatererName={
            primaryCatererId ? catererNameMap[primaryCatererId] ?? null : null
          }
          isFilling={
            gapFilling === `${selectedCell.event_id}-${selectedCell.flag}`
          }
          onFillGap={() => fillGap(selectedCell)}
          onAskCaterer={() => askCatererAbout(selectedCell)}
          onPark={() => parkDecision(selectedCell)}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {briefingOpen && (
        <BriefingModal
          markdown={buildCatererBriefing(
            events,
            moments,
            dishes,
            dietary_totals,
            requirements,
          )}
          lastSent={briefingLastSent}
          onCopied={handleCopyBriefing}
          onClose={() => setBriefingOpen(false)}
        />
      )}
    </div>
  );
}

// ── Decisions pending row ────────────────────────────────────────────────

function DecisionPendingRow({
  question,
  partyMap,
}: {
  question: OpenQuestion;
  partyMap: Record<PartyId, import("@/types/catering").Party>;
}) {
  const raiser = partyMap[question.raised_by];
  const forParty = partyMap[question.for_party];
  return (
    <li className="flex items-start gap-2 rounded-sm border border-saffron/30 bg-saffron-pale/20 px-2 py-1.5">
      {raiser && <PartyAvatar party={raiser} size="sm" />}
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] leading-snug text-ink">{question.body}</p>
        <p
          className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {raiser ? `raised by ${raiser.display_name}` : "raised"}
          {forParty && ` · for ${forParty.display_name}`}
          {" · "}
          {relTime(question.created_at)}
        </p>
      </div>
      <StatePill state="in_debate" tight />
    </li>
  );
}

// ── Instruction builder for AI gap fill ──────────────────────────────────

function buildGapInstruction(cell: MatrixCell, label: string): string {
  if (cell.severity === "gap") {
    return `Add 1–2 ${label} dishes for this event — ${cell.guest_count} ${label} guest${cell.guest_count === 1 ? "" : "s"} currently have no dish that serves them. Pick the right moment(s) for where the gap matters most (mains first, then apps).`;
  }
  return `Coverage for ${label} is thin — only ${Math.round(cell.coverage * 100)}% of moments serve this requirement. Add 1 ${label} option in a moment that currently has none. ${cell.guest_count} guest${cell.guest_count === 1 ? "" : "s"} rely on it.`;
}

// ── Matrix ────────────────────────────────────────────────────────────────

function DietaryMatrix({
  events,
  requirements,
  cells,
  onSelectCell,
}: {
  events: MenuEvent[];
  requirements: RequirementSummary[];
  cells: MatrixCell[];
  onSelectCell: (cell: MatrixCell) => void;
}) {
  if (requirements.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-4 py-6 text-center">
        <p className="text-[11.5px] text-ink-muted">
          Matrix populates once guests with dietary requirements are added.
        </p>
      </div>
    );
  }

  const cellByKey = new Map<string, MatrixCell>();
  for (const c of cells) cellByKey.set(`${c.event_id}:${c.flag}`, c);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left">
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Requirement
              </span>
            </th>
            {events.map((e) => (
              <th
                key={e.id}
                className="border-b border-border px-2 pb-1.5 pt-1 text-left"
              >
                <span className="block text-[12px] font-medium leading-tight text-ink">
                  {e.label}
                </span>
                <span
                  className="mt-0 block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {e.guest_count} guests
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requirements.map((r) => (
            <tr key={r.flag}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-2 py-1 text-left"
              >
                <span className="flex flex-col">
                  <span className="text-[11.5px] text-ink">{r.label}</span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    peak {r.peak_count}
                  </span>
                </span>
              </th>
              {events.map((e) => {
                const cell = cellByKey.get(`${e.id}:${r.flag}`);
                if (!cell) return <td key={e.id} className="px-0.5 py-0.5" />;
                return (
                  <td key={e.id} className="px-0.5 py-0.5">
                    <MatrixCellButton
                      cell={cell}
                      onClick={() => onSelectCell(cell)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixCellButton({
  cell,
  onClick,
}: {
  cell: MatrixCell;
  onClick: () => void;
}) {
  const pct = Math.round(cell.coverage * 100);
  const styles: Record<MatrixCell["severity"], string> = {
    none: "border-border/60 bg-ivory-warm/30 text-ink-faint",
    gap: "border-rose/40 bg-rose-pale/40 text-rose hover:border-rose/70",
    thin: "border-saffron/40 bg-saffron-pale/40 text-saffron hover:border-saffron/70",
    ok: "border-sage/30 bg-sage-pale/30 text-ink hover:border-sage/60",
  };
  const title =
    cell.severity === "none"
      ? "No guests with this requirement"
      : cell.severity === "gap"
        ? `${cell.guest_count} guests, zero coverage — click to fix`
        : cell.severity === "thin"
          ? `${cell.guest_count} guests, ${pct}% coverage — consider adding one more option`
          : `${cell.guest_count} guests, ${pct}% coverage`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-11 w-full min-w-[90px] flex-col items-start justify-center gap-0 rounded-sm border px-2 py-1 text-left transition-colors",
        styles[cell.severity],
      )}
    >
      <span
        className="font-mono text-[10px] tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {cell.guest_count > 0 ? `${cell.guest_count} · ${pct}%` : "—"}
      </span>
      <span
        className="font-mono text-[8.5px] uppercase tracking-[0.08em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {cell.severity === "none"
          ? "no guests"
          : cell.dish_count === 0
            ? "no dishes"
            : `${cell.dish_count} dish${cell.dish_count === 1 ? "" : "es"}`}
      </span>
    </button>
  );
}

// ── Risk rail ─────────────────────────────────────────────────────────────

function RiskRail({
  risks,
  events,
  onJumpToEvent,
}: {
  risks: AtlasRisk[];
  events: MenuEvent[];
  onJumpToEvent: (eventId: string) => void;
}) {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-border bg-ivory-warm/20">
      <header className="border-b border-border px-4 py-3">
        <p
          className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <AlertTriangle size={10} strokeWidth={2} />
          Dietary risks
        </p>
      </header>
      <ul className="flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
        {risks.length === 0 && (
          <li className="text-[11.5px] text-ink-muted">
            No open dietary risks.
          </li>
        )}
        {risks.map((r, i) => {
          const Icon =
            r.severity === "risk"
              ? AlertTriangle
              : r.severity === "warn"
                ? AlertTriangle
                : Info;
          const tone =
            r.severity === "risk"
              ? "text-rose"
              : r.severity === "warn"
                ? "text-saffron"
                : "text-ink-muted";
          return (
            <li
              key={i}
              className="rounded-sm border border-border bg-white px-2 py-1.5"
            >
              <div className="flex items-start gap-1.5">
                <Icon
                  size={11}
                  strokeWidth={2}
                  className={cn("mt-0.5 flex-none", tone)}
                  aria-hidden
                />
                <p className="text-[11px] leading-snug text-ink">{r.message}</p>
              </div>
              {r.scope?.event_id && (
                <button
                  type="button"
                  onClick={() => onJumpToEvent(r.scope!.event_id!)}
                  className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-saffron transition-colors hover:text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Open in Menu Studio ↗
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ── Cell drawer ───────────────────────────────────────────────────────────

function CellDrawer({
  cell,
  event,
  requirement,
  dishes,
  primaryCatererName,
  isFilling,
  onFillGap,
  onAskCaterer,
  onPark,
  onClose,
}: {
  cell: MatrixCell;
  event: MenuEvent;
  requirement: RequirementSummary;
  dishes: Dish[];
  primaryCatererName: string | null;
  isFilling: boolean;
  onFillGap: () => void;
  onAskCaterer: () => void;
  onPark: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-label={`${event.label} · ${requirement.label} detail`}
        className="fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col border-l border-border bg-white shadow-[0_0_40px_rgba(26,26,26,0.15)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {event.label}
            </p>
            <h3 className="mt-0.5 text-[17px] font-medium leading-tight text-ink">
              {requirement.label}
            </h3>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
              {cell.guest_count} guest{cell.guest_count === 1 ? "" : "s"} at {event.label} ·{" "}
              {Math.round(cell.coverage * 100)}% moment coverage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-6 w-6 flex-none items-center justify-center rounded-sm border border-border text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <X size={11} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
          <section>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Dishes serving this requirement
            </p>
            {dishes.length === 0 ? (
              <p className="mt-1.5 rounded-sm border border-rose/30 bg-rose-pale/20 px-2 py-1.5 text-[11.5px] text-rose">
                No dish at {event.label} currently serves {requirement.label} guests.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {dishes.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-sm border border-border bg-white px-2 py-1"
                  >
                    <p className="text-[11.5px] text-ink">{d.name}</p>
                    <p className="mt-0 text-[10.5px] leading-snug text-ink-muted">
                      {d.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {cell.severity !== "ok" && cell.severity !== "none" && (
            <section>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Close the gap
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                Three options — pick one:
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onFillGap}
                  disabled={isFilling}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-left text-[11.5px] transition-colors",
                    isFilling
                      ? "bg-ink-faint/20 text-ink-faint"
                      : "bg-ink text-ivory hover:bg-ink-soft",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={11} strokeWidth={2} />
                    AI · draft {cell.severity === "gap" ? "1–2 dishes" : "one more option"}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-70"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {isFilling ? "thinking…" : "queue for review"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onAskCaterer}
                  disabled={!primaryCatererName}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border bg-white px-2.5 py-1.5 text-left text-[11.5px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron disabled:text-ink-faint"
                >
                  <span className="flex items-center gap-1.5">
                    <Send size={11} strokeWidth={1.8} />
                    Ask {primaryCatererName ?? "the caterer"}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    open question
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onPark}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border bg-white px-2.5 py-1.5 text-left text-[11.5px] text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
                >
                  <span className="flex items-center gap-1.5">
                    <PauseCircle size={11} strokeWidth={1.8} />
                    Park it for later
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    decisions pending
                  </span>
                </button>
              </div>
            </section>
          )}

          {cell.severity === "ok" && (
            <section className="rounded-sm border border-sage/30 bg-sage-pale/20 px-2 py-1.5">
              <p className="text-[11.5px] leading-relaxed text-ink">
                Coverage is solid — {dishes.length} dish{dishes.length === 1 ? "" : "es"} serve this requirement across {Math.round(cell.coverage * 100)}% of moments.
              </p>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Briefing modal ────────────────────────────────────────────────────────

function BriefingModal({
  markdown,
  lastSent,
  onCopied,
  onClose,
}: {
  markdown: string;
  lastSent: string | null;
  onCopied: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close briefing"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-label="Caterer dietary briefing"
        className="fixed inset-x-8 top-10 z-50 mx-auto flex max-h-[85vh] max-w-3xl flex-col rounded-md border border-border bg-white shadow-[0_12px_50px_rgba(26,26,26,0.2)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Caterer briefing
            </p>
            <h3 className="mt-0.5 text-[17px] font-medium leading-tight text-ink">
              Dietary plan — copy & send
            </h3>
            <p
              className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {lastSent ? `last sent ${relTime(lastSent)}` : "never sent"}
              {" · vendor response "}
              {lastSent ? "waiting" : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 rounded-sm bg-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ivory hover:bg-ink-soft"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {copied ? (
                <>
                  <ClipboardCheck size={11} strokeWidth={2} />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardCopy size={11} strokeWidth={2} />
                  Copy markdown
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-6 w-6 items-center justify-center rounded-sm border border-border text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              <X size={11} strokeWidth={1.8} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto px-5 py-3">
          <pre
            className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {markdown}
          </pre>
        </div>
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

function relTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMin = Math.round((now - then) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return iso;
  }
}
