"use client";

// ── Service & Flow (reworked) ─────────────────────────────────────────────
// Operational planning surface, drafting-first. Every staff slot and
// rental line shows who added it (planner vs. vendor) and its state
// (draft / vendor_proposed / approved). Warnings aren't status — they're
// actionable: clicking "Only 2 bartenders for 340 guests" opens an
// inline ask to the caterer.
//
// Bar program gets a dedicated section with the AI cocktail designer,
// and signature cocktails carry attribution + state like everything else.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  ClipboardCheck,
  ClipboardCopy,
  FileText,
  Info,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
  Wine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCateringStore } from "@/stores/catering-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { DEMO_WEDDING_ID } from "@/lib/catering-seed";
import {
  buildRunOfShow,
  rentalWarnings,
  staffingWarnings,
  type StaffingWarning,
} from "@/lib/catering/service-flow";
import { URVASHI_ID, buildPartyMap } from "@/lib/catering/parties";
import type {
  MenuEvent,
  MenuMoment,
  PartyId,
  RentalItem,
  SignatureCocktail,
  StaffSlot,
} from "@/types/catering";
import {
  Attribution,
  FlowItem,
  InFlightStrip,
  PartyAvatar,
  PresenceIndicator,
  StatePill,
  SubHeader,
  TabHeader,
} from "./shared/collab";

interface ServiceFlowProps {
  weddingId?: string;
}

const CURRENT_PARTY: PartyId = URVASHI_ID;

export function ServiceFlow({ weddingId = DEMO_WEDDING_ID }: ServiceFlowProps) {
  const allEvents = useCateringStore((s) => s.events);
  const moments = useCateringStore((s) => s.moments);
  const dishes = useCateringStore((s) => s.dishes);
  const staff_slots = useCateringStore((s) => s.staff_slots);
  const rental_items = useCateringStore((s) => s.rental_items);
  const signature_cocktails = useCateringStore((s) => s.signature_cocktails);
  const proposals = useCateringStore((s) => s.proposals);
  const presence = useCateringStore((s) => s.presence);
  const addCocktails = useCateringStore((s) => s.addCocktails);
  const deleteCocktail = useCateringStore((s) => s.deleteCocktail);
  const addOpenQuestion = useCateringStore((s) => s.addOpenQuestion);
  const selectedId = useCateringStore((s) => s.selected_event_id);
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
  const activeEvent =
    events.find((e) => e.id === selectedId) ?? events[0] ?? null;

  const [runOfShowOpen, setRunOfShowOpen] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  if (!activeEvent) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <h3 className="text-[17px] font-medium text-ink">No events yet</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Add events to plot staffing, rentals, and bar program.
          </p>
        </div>
      </div>
    );
  }

  const eventMoments = moments
    .filter((m) => m.event_id === activeEvent.id)
    .sort((a, b) => a.order - b.order);
  const eventStaff = staff_slots.filter((s) => s.event_id === activeEvent.id);
  const eventRentals = rental_items.filter(
    (r) => r.event_id === activeEvent.id,
  );
  const eventCocktails = signature_cocktails.filter(
    (c) => c.event_id === activeEvent.id,
  );

  const staffWarnings = staffingWarnings(activeEvent, eventStaff);
  const rentWarnings = rentalWarnings(activeEvent, eventRentals);

  // Primary caterer for this event — used when opening actionable asks
  // from a warning.
  const primaryCatererId = useMemo<string | null>(() => {
    const received = proposals
      .filter(
        (p) => p.event_id === activeEvent.id && p.status === "received",
      )
      .sort((a, b) =>
        (b.received_at ?? "").localeCompare(a.received_at ?? ""),
      );
    return received[0]?.caterer_id ?? null;
  }, [proposals, activeEvent]);

  // In-flight strip: drafts, vendor-proposed slots/rentals, actionable warnings
  const inFlight: FlowItem[] = useMemo(() => {
    const items: FlowItem[] = [];
    for (const s of eventStaff) {
      if (s.state === "vendor_proposed") {
        items.push({
          id: `fl-ss-${s.id}`,
          label: `Vendor staffing · ${s.count} ${s.role}`,
          hint: "From vendor, awaiting review",
          state: "vendor_proposed",
          waiting_on: CURRENT_PARTY,
        });
      } else if (s.state === "draft") {
        items.push({
          id: `fl-sd-${s.id}`,
          label: `Draft · ${s.count} ${s.role}`,
          hint: "Not confirmed yet",
          state: "draft",
          waiting_on: URVASHI_ID,
        });
      }
    }
    for (const r of eventRentals) {
      if (r.state === "vendor_proposed") {
        items.push({
          id: `fl-rv-${r.id}`,
          label: `Vendor rental · ${r.name}`,
          hint: `${r.quantity}${r.unit ? ` ${r.unit}` : ""}`,
          state: "vendor_proposed",
          waiting_on: CURRENT_PARTY,
        });
      } else if (r.state === "draft") {
        items.push({
          id: `fl-rd-${r.id}`,
          label: `Draft · ${r.name}`,
          hint: "Not confirmed yet",
          state: "draft",
          waiting_on: URVASHI_ID,
        });
      }
    }
    for (const w of staffWarnings) {
      if (w.severity === "info") continue;
      items.push({
        id: `fl-w-${w.role}-${w.message.slice(0, 20)}`,
        label: `${w.role} warning`,
        hint: w.message,
        state: "blocked",
      });
    }
    return items.slice(0, 6);
  }, [eventStaff, eventRentals, staffWarnings]);

  function askCatererAboutStaffing(w: StaffingWarning) {
    if (!primaryCatererId) {
      setLastError(
        "No primary caterer for this event yet — set one in Decision Board first.",
      );
      return;
    }
    addOpenQuestion({
      wedding_id: weddingId,
      entity_kind: "staff_slot",
      entity_id: `${activeEvent.id}:${w.role}`,
      raised_by: CURRENT_PARTY,
      for_party: primaryCatererId,
      body: `Staffing request for ${activeEvent.label}: ${w.message}`,
    });
    setLastError(null);
    setLastSuccess(
      `Asked ${catererNameMap[primaryCatererId] ?? "the caterer"} about ${w.role} staffing.`,
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <TabHeader
        eyebrow={`Catering · Service & Flow · ${activeEvent.label}`}
        title="Operational desk — staff, rentals, bar"
        subtitle={`${activeEvent.guest_count} guests · ${activeEvent.service_style.replace("_", " ")} service`}
        right={
          <div className="flex items-start gap-4">
            <PresenceIndicator signals={presence} partyMap={partyMap} />
            <button
              type="button"
              onClick={() => setRunOfShowOpen(true)}
              className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <FileText size={10} strokeWidth={1.8} />
              Run of show
            </button>
          </div>
        }
      />

      {/* Event picker */}
      <nav className="flex flex-wrap gap-1 border-b border-border bg-ivory-warm/20 px-7 py-2">
        {events.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSelectedEvent(e.id)}
            className={cn(
              "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
              e.id === activeEvent.id
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {e.icon ?? "•"} {e.label}
          </button>
        ))}
      </nav>

      {(lastError || lastSuccess) && (
        <div
          className={cn(
            "border-b px-7 py-1.5 text-[11px]",
            lastError
              ? "border-rose/30 bg-rose-pale/20 text-rose"
              : "border-sage/30 bg-sage-pale/20 text-ink",
          )}
        >
          {lastError ?? lastSuccess}
        </div>
      )}

      {/* In-flight strip */}
      <div className="border-b border-border bg-white px-7 py-3">
        <SubHeader label="In flight" count={inFlight.length} />
        <InFlightStrip
          items={inFlight}
          partyMap={partyMap}
          emptyMessage="No staffing or rental lines in draft · no open warnings."
        />
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-4">
        <TimelineSection
          event={activeEvent}
          moments={eventMoments}
          staff={eventStaff}
          cocktails={eventCocktails}
          partyMap={partyMap}
        />

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <StaffSection
            event={activeEvent}
            staff={eventStaff}
            warnings={staffWarnings}
            partyMap={partyMap}
            onAskCaterer={askCatererAboutStaffing}
          />
          <RentalSection
            rentals={eventRentals}
            warnings={rentWarnings}
            partyMap={partyMap}
          />
        </div>

        <BarSection
          event={activeEvent}
          cocktails={eventCocktails}
          existingCocktailNames={eventCocktails.map((c) => c.name)}
          partyMap={partyMap}
          onAdd={(cs) =>
            addCocktails(
              cs.map((c) => ({
                event_id: activeEvent.id,
                name: c.name,
                ingredients: c.ingredients,
                garnish: c.garnish,
                description: c.description,
                source: "ai" as const,
              })),
            )
          }
          onDelete={deleteCocktail}
        />
      </div>

      {runOfShowOpen && (
        <RunOfShowModal
          markdown={buildRunOfShow(
            events,
            moments,
            dishes,
            staff_slots,
            rental_items,
            signature_cocktails,
          )}
          onClose={() => setRunOfShowOpen(false)}
        />
      )}
    </div>
  );
}

// ── Timeline section ──────────────────────────────────────────────────────

function TimelineSection({
  event,
  moments,
  staff,
  cocktails,
  partyMap,
}: {
  event: MenuEvent;
  moments: MenuMoment[];
  staff: StaffSlot[];
  cocktails: SignatureCocktail[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
}) {
  return (
    <section>
      <SubHeader
        label="Service timeline"
        count={moments.length}
        right={
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Staff / bar overlays
          </span>
        }
      />
      {moments.length === 0 ? (
        <EmptyState>
          This event has no service moments yet. Draft them in Menu Studio first — Service & Flow renders on top of them.
        </EmptyState>
      ) : (
        <ol className="space-y-1.5">
          {moments.map((m, i) => {
            const momentStaff = staff.filter((s) => s.moment_id === m.id);
            const barMoment = /cocktail|bar|drink|welcome/i.test(m.name);
            return (
              <li
                key={m.id}
                className="flex items-start gap-3 rounded-sm border border-border bg-white p-2"
              >
                <span
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-saffron-pale/50 font-mono text-[10px] tabular-nums text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium leading-tight text-ink">
                      {m.name}
                    </span>
                    {m.time_window && (
                      <span
                        className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {m.time_window}
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {momentStaff.map((s) => (
                      <StaffChip key={s.id} slot={s} />
                    ))}
                    {barMoment && cocktails.length > 0 && (
                      <span
                        className="flex items-center gap-1 rounded-sm bg-rose-pale/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-rose"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        <Wine size={9} strokeWidth={1.8} />
                        {cocktails.length} signature
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// ── Staff section ─────────────────────────────────────────────────────────

function StaffSection({
  event,
  staff,
  warnings,
  partyMap,
  onAskCaterer,
}: {
  event: MenuEvent;
  staff: StaffSlot[];
  warnings: StaffingWarning[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  onAskCaterer: (w: StaffingWarning) => void;
}) {
  // Split into "vendor proposed" lane + planner-confirmed list
  const vendorProposed = staff.filter((s) => s.state === "vendor_proposed");
  const planner = staff.filter((s) => s.state !== "vendor_proposed");

  return (
    <section>
      <SubHeader
        icon={<Users size={12} strokeWidth={1.8} />}
        label="Staff on site"
        count={staff.reduce((n, s) => n + s.count, 0)}
      />

      {vendorProposed.length > 0 && (
        <div className="mb-2 rounded-md border border-sage/30 bg-sage-pale/15 p-2">
          <p
            className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Vendor-proposed — awaiting approval
          </p>
          <ul className="space-y-1">
            {vendorProposed.map((s) => (
              <StaffRow key={s.id} slot={s} partyMap={partyMap} />
            ))}
          </ul>
        </div>
      )}

      {planner.length === 0 && vendorProposed.length === 0 ? (
        <EmptyState>
          No staffing drafted yet for {event.label}. Add roles below or
          wait for the caterer to propose.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-white">
          {planner.map((s) => (
            <StaffRow key={s.id} slot={s} partyMap={partyMap} />
          ))}
        </ul>
      )}

      {/* Draft affordance */}
      <button
        type="button"
        disabled
        title="Inline editor coming soon"
        className="mt-2 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Plus size={10} strokeWidth={2} />
        Draft staffing slot
      </button>

      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <WarningRow
              key={i}
              severity={w.severity}
              actionable={w.severity !== "info"}
              onAction={() => onAskCaterer(w)}
            >
              {w.message}
            </WarningRow>
          ))}
        </ul>
      )}
    </section>
  );
}

function StaffRow({
  slot,
  partyMap,
}: {
  slot: StaffSlot;
  partyMap: Record<PartyId, import("@/types/catering").Party>;
}) {
  const state = slot.state ?? "approved";
  return (
    <li className="flex items-start justify-between gap-3 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {slot.role}
          </span>
          <StatePill state={state} tight />
        </div>
        {slot.notes && (
          <p className="mt-0.5 text-[11px] italic leading-snug text-ink-muted">
            {slot.notes}
          </p>
        )}
        {slot.added_by && (
          <div className="mt-1">
            <Attribution partyId={slot.added_by} partyMap={partyMap} />
          </div>
        )}
      </div>
      <span
        className="font-mono text-[15px] tabular-nums text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {slot.count}
      </span>
    </li>
  );
}

function StaffChip({ slot }: { slot: StaffSlot }) {
  return (
    <span
      className="flex items-center gap-1 rounded-sm bg-ivory-warm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Users size={9} strokeWidth={1.8} />
      {slot.count} {slot.role}
    </span>
  );
}

// ── Rental section ────────────────────────────────────────────────────────

function RentalSection({
  rentals,
  warnings,
  partyMap,
}: {
  rentals: RentalItem[];
  warnings: string[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
}) {
  return (
    <section>
      <SubHeader
        icon={<Armchair size={12} strokeWidth={1.8} />}
        label="Rentals"
        count={rentals.length}
      />
      {rentals.length === 0 ? (
        <EmptyState>No rental lines logged for this event yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-white">
          {rentals.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-3 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-ink">{r.name}</p>
                  <StatePill state={r.state ?? "approved"} tight />
                </div>
                <p
                  className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {r.category}
                  {r.covered_by ? ` · ${r.covered_by}` : ""}
                  {r.supplier ? ` · ${r.supplier}` : ""}
                </p>
                {r.notes && (
                  <p className="mt-1 text-[11px] italic leading-snug text-ink-muted">
                    {r.notes}
                  </p>
                )}
                {r.added_by && (
                  <div className="mt-1">
                    <Attribution partyId={r.added_by} partyMap={partyMap} />
                  </div>
                )}
              </div>
              <span
                className="whitespace-nowrap font-mono text-[12px] tabular-nums text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {r.quantity}
                {r.unit && (
                  <span className="ml-0.5 text-[9.5px] text-ink-faint">
                    {r.unit}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {warnings.map((w, i) => (
        <WarningRow key={i} severity="warn">
          {w}
        </WarningRow>
      ))}
    </section>
  );
}

// ── Bar section (AI cocktail designer) ───────────────────────────────────

function BarSection({
  event,
  cocktails,
  existingCocktailNames,
  partyMap,
  onAdd,
  onDelete,
}: {
  event: MenuEvent;
  cocktails: SignatureCocktail[];
  existingCocktailNames: string[];
  partyMap: Record<PartyId, import("@/types/catering").Party>;
  onAdd: (
    cs: Omit<SignatureCocktail, "id" | "sort_order" | "event_id" | "source">[],
  ) => SignatureCocktail[];
  onDelete: (id: string) => void;
}) {
  const [brief, setBrief] = useState("");
  const [thinking, setThinking] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function design() {
    const instruction = brief.trim();
    if (!instruction || thinking) return;
    setThinking(true);
    setError(null);
    setRationale(null);
    try {
      const res = await fetch("/api/catering/signature-cocktails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: {
            id: event.id,
            label: event.label,
            guest_count: event.guest_count,
            vibe_tags: event.vibe_tags,
            cuisine_direction: event.cuisine_direction,
          },
          existing_cocktails: existingCocktailNames,
          brief: instruction,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        cocktails: Array<{
          name: string;
          ingredients: string[];
          garnish?: string;
          description: string;
        }>;
        rationale: string;
        error?: string;
      };
      if (!data.ok) {
        setError(data.error ?? data.rationale ?? "Cocktail design failed.");
        return;
      }
      if (data.cocktails.length > 0) onAdd(data.cocktails);
      setRationale(data.rationale || null);
      setBrief("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <section className="mt-5">
      <SubHeader
        icon={<Wine size={12} strokeWidth={1.8} />}
        label="Bar program"
        count={cocktails.length}
      />

      {cocktails.length === 0 ? (
        <EmptyState>
          No signature cocktails yet. Draft them inline below or start a
          brief for the AI designer — 3 cocktails in one click.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {cocktails.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-md border p-3",
                c.source === "ai"
                  ? "border-saffron/40 bg-saffron-pale/10"
                  : "border-border bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-medium leading-tight text-ink">
                    {c.name}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {c.source === "ai" && <StatePill state="draft" tight />}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Remove ${c.name}`}
                  className="flex h-5 w-5 items-center justify-center rounded-sm text-ink-faint hover:bg-rose-pale/30 hover:text-rose"
                >
                  <Trash2 size={10} strokeWidth={1.8} />
                </button>
              </div>
              <p className="mt-1 text-[11.5px] italic leading-snug text-ink-muted">
                {c.description}
              </p>
              <ul className="mt-1.5 space-y-0">
                {c.ingredients.map((i, idx) => (
                  <li key={idx} className="text-[11px] text-ink">
                    · {i}
                  </li>
                ))}
              </ul>
              {c.garnish && (
                <p
                  className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Garnish · <span className="text-ink-muted">{c.garnish}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Designer input */}
      <div className="mt-3 rounded-md border border-border bg-white p-3">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          AI cocktail designer · drafts for review
        </p>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              design();
            }
          }}
          rows={2}
          placeholder={`e.g. "gin, rose, and something unexpected for ${event.label.toLowerCase()}"`}
          disabled={thinking}
          className="mt-1.5 w-full resize-none rounded-sm border border-border bg-ivory-warm/20 px-2 py-1.5 text-[11.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-saffron/40"
        />
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-[10px] text-ink-faint">
            Returns 3 cocktails. Delete any that don't land.
          </p>
          <button
            type="button"
            onClick={design}
            disabled={!brief.trim() || thinking}
            className={cn(
              "flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
              brief.trim() && !thinking
                ? "bg-ink text-ivory hover:bg-ink-soft"
                : "bg-ink-faint/20 text-ink-faint",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles size={10} strokeWidth={2} />
            {thinking ? "Designing…" : "Design 3"}
          </button>
        </div>
        {rationale && (
          <p className="mt-1.5 rounded-sm border border-gold/20 bg-ivory-warm/40 px-2 py-1 text-[11px] italic leading-relaxed text-ink-muted">
            "{rationale}"
          </p>
        )}
        {error && (
          <p className="mt-1.5 rounded-sm border border-rose/30 bg-rose-pale/20 px-2 py-1 text-[11px] text-rose">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Generic bits ──────────────────────────────────────────────────────────

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-3 text-center">
      <p className="text-[11.5px] text-ink-muted">{children}</p>
    </div>
  );
}

function WarningRow({
  severity,
  actionable,
  onAction,
  children,
}: {
  severity: "info" | "warn" | "risk";
  actionable?: boolean;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  const Icon = severity === "info" ? Info : AlertTriangle;
  const tone =
    severity === "risk"
      ? "border-rose/30 bg-rose-pale/20 text-rose"
      : severity === "warn"
        ? "border-saffron/30 bg-saffron-pale/20 text-ink"
        : "border-border bg-ivory-warm/30 text-ink-muted";
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-sm border px-2 py-1.5 text-[11px] leading-snug",
        tone,
      )}
    >
      <Icon size={11} strokeWidth={2} className="mt-0.5 flex-none" aria-hidden />
      <span className="flex-1">{children}</span>
      {actionable && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-saffron hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Send size={9} strokeWidth={1.8} />
          ask caterer
        </button>
      )}
    </li>
  );
}

// ── Run-of-show modal ─────────────────────────────────────────────────────

function RunOfShowModal({
  markdown,
  onClose,
}: {
  markdown: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-label="Run of Show"
        className="fixed inset-x-8 top-10 z-50 mx-auto flex max-h-[85vh] max-w-3xl flex-col rounded-md border border-border bg-white shadow-[0_12px_50px_rgba(26,26,26,0.2)]"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Run of Show
            </p>
            <h3 className="mt-0.5 text-[17px] font-medium leading-tight text-ink">
              Minute-by-minute — copy to captain & kitchen
            </h3>
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
                  Copy
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
