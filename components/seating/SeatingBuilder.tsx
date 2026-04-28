"use client";

// ── Floor Plan builder ──────────────────────────────────────────────
// Top-level orchestrator for the Floor Plan page: tab strip (Layout /
// Seating / Experience Zones), toolbar, canvas, side panels, and all
// modals (auto-suggest, experience-suggest, table detail, library).

import { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  Copy,
  Download,
  Layout as LayoutIcon,
  Map as MapIcon,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Table2,
  Trash2,
  Zap,
} from "lucide-react";
import { RoomConfigPanel } from "./RoomConfigPanel";
import { SeatingCanvas } from "./SeatingCanvas";
import { CombinedSidebar } from "./CombinedSidebar";
import { AutoSuggestModal } from "./AutoSuggestModal";
import { DiningIntelligenceBadge } from "./DiningIntelligenceBadge";
import { TableDetailPopup } from "./TableDetailPopup";
import { ElementLibraryPanel } from "./ElementLibraryPanel";
import { ElementPropertiesPanel } from "./ElementPropertiesPanel";
import { ExperienceSuggestModal } from "./ExperienceSuggestModal";
import { ZonesPanel } from "./ZonesPanel";
import {
  totalCapacity,
  useSeatingStore,
} from "@/stores/seating-store";
import { runAutoAssignAll } from "@/lib/seating-ai";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import type { SeatAssignment } from "@/types/seating-assignments";
import type { FloorPlanTab, SeatingTable } from "@/types/seating";
import type { SeatingEventOption, SeatingGuest } from "@/types/seating-guest";
import { DEFAULT_SEATING_EVENT } from "@/types/seating-guest";
import {
  buildAvPowerMap,
  buildExperienceOverview,
  buildGuestLookupList,
  buildPrintableHtml,
  buildSeatingCsv,
  buildTableCardsMarkdown,
  buildVendorSetupSheet,
  downloadText,
  openPrintableWindow,
} from "@/lib/seating-export";
import { cn } from "@/lib/utils";

interface Props {
  guests?: SeatingGuest[];
  events?: SeatingEventOption[];
}

export function SeatingBuilder({ guests = [], events }: Props) {
  const [tab, setTab] = useState<FloorPlanTab>("layout");
  const [configOpen, setConfigOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const [autoOpen, setAutoOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cardTableId, setCardTableId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string>("");
  const [exportOpen, setExportOpen] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<{
    summary: string;
    snapshot: SeatAssignment[];
    newlyAssignedIds: string[];
  } | null>(null);
  const [oneClickBusy, setOneClickBusy] = useState(false);

  const tables = useSeatingStore((s) => s.tables);
  const fixed = useSeatingStore((s) => s.fixed);
  const zones = useSeatingStore((s) => s.zones);
  const room = useSeatingStore((s) => s.room);
  const lastSavedAt = useSeatingStore((s) => s.lastSavedAt);
  const setActivePlan = useSeatingStore((s) => s.setActivePlan);
  const copyPlanFrom = useSeatingStore((s) => s.copyPlanFrom);
  const plans = useSeatingStore((s) => s.plans);
  const selectedFixedId = useSeatingStore((s) => s.selectedFixedId);

  const activeEventId = useSeatingAssignmentsStore((s) => s.activeEventId);
  const setActiveEvent = useSeatingAssignmentsStore((s) => s.setActiveEvent);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[activeEventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const clearEvent = useSeatingAssignmentsStore((s) => s.clearEvent);
  const restoreEventSnapshot = useSeatingAssignmentsStore(
    (s) => s.restoreEventSnapshot,
  );

  // Keep the seating-store's active plan in sync with assignments store.
  useEffect(() => {
    setActivePlan(activeEventId);
  }, [activeEventId, setActivePlan]);

  // Resolve the event list (fall back to Reception-only if the parent
  // didn't pass one). Ensure the active event stays valid.
  const eventOptions: SeatingEventOption[] = useMemo(() => {
    if (events && events.length > 0) return events;
    return [DEFAULT_SEATING_EVENT];
  }, [events]);

  useEffect(() => {
    if (!eventOptions.some((e) => e.id === activeEventId)) {
      setActiveEvent(eventOptions[0].id);
    }
  }, [eventOptions, activeEventId, setActiveEvent]);

  const activeEvent =
    eventOptions.find((e) => e.id === activeEventId) ?? eventOptions[0];

  const eventGuests: SeatingGuest[] = useMemo(() => {
    if (!guests.length) return [];
    const strict = guests.filter((g) => g.rsvp?.[activeEventId] === "confirmed");
    if (strict.length > 0) return strict;
    return guests.filter((g) =>
      Object.values(g.rsvp ?? {}).some((s) => s === "confirmed"),
    );
  }, [guests, activeEventId]);

  // Saved indicator label
  const [savedLabel, setSavedLabel] = useState<string>("Up to date");
  useEffect(() => {
    if (!lastSavedAt) return;
    setSavedLabel("Saving…");
    const timer = window.setTimeout(() => {
      setSavedLabel(`Saved · ${formatTime(lastSavedAt)}`);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [lastSavedAt]);

  useEffect(() => {
    if (!banner || lastSuggestion) return;
    const t = window.setTimeout(() => setBanner(""), 6000);
    return () => window.clearTimeout(t);
  }, [banner, lastSuggestion]);

  useEffect(() => {
    if (!lastSuggestion) return;
    const t = window.setTimeout(() => setLastSuggestion(null), 20000);
    return () => window.clearTimeout(t);
  }, [lastSuggestion]);

  useEffect(() => {
    setLastSuggestion(null);
  }, [activeEventId]);

  const capacity = totalCapacity(tables);
  const assigned = assignments.length;

  const canExport = (tables.length > 0 && eventGuests.length > 0) || fixed.length > 0;
  const canAutoSuggest = tables.length > 0 && eventGuests.length > 0;

  // Copy-layout offer — show when the current event has no meaningful data
  // but another event does.
  const copyCandidates = useMemo(() => {
    const planKeys = Object.keys(plans);
    return planKeys.filter(
      (k) =>
        k !== activeEventId &&
        (plans[k]?.fixed.length ?? 0) + (plans[k]?.tables.length ?? 0) > 0,
    );
  }, [plans, activeEventId]);

  const currentPlanIsBlank =
    tables.length <= 16 && fixed.length <= 6 && zones.length === 0;

  // One-click AI flow: assigns all guests, classifies zones, and
  // re-arranges tables into concentric rings around the stage — the
  // spec's "✦ Auto-assign all" primary action.
  const handleAutoAssignAll = async () => {
    if (!canAutoSuggest || oneClickBusy) return;
    setOneClickBusy(true);
    const snapshot = useSeatingAssignmentsStore
      .getState()
      .snapshotEvent(activeEventId);
    const result = await runAutoAssignAll({
      eventId: activeEventId,
      eventLabel: activeEvent.label,
      guests: eventGuests,
      strategy: "family_first",
      repositionRings: true,
    });
    setOneClickBusy(false);
    if (!result.ok) {
      setBanner(result.error ?? "Auto-assign failed. See console.");
      return;
    }
    setBanner(result.summary);
    setLastSuggestion({
      summary: result.summary,
      snapshot,
      newlyAssignedIds: result.newlyAssignedIds,
    });
  };

  const handlePrint = () => {
    const html = buildPrintableHtml({
      eventLabel: activeEvent.label,
      roomName: room.name,
      roomLength: room.length,
      roomWidth: room.width,
      unit: room.unit,
      tables,
      fixedElements: fixed,
      assignments,
      guests: eventGuests,
    });
    openPrintableWindow(html);
    setExportOpen(false);
  };

  const handleExportCards = () => {
    const md = buildTableCardsMarkdown(eventGuests, tables, assignments);
    downloadText(
      `seating-${activeEvent.id}-table-cards.md`,
      md,
      "text/markdown",
    );
    setExportOpen(false);
  };

  const handleExportCsv = () => {
    const csv = buildSeatingCsv(eventGuests, tables, assignments);
    downloadText(`seating-${activeEvent.id}.csv`, csv, "text/csv");
    setExportOpen(false);
  };

  const handleExportLookup = () => {
    const txt = buildGuestLookupList(eventGuests, tables, assignments);
    downloadText(
      `seating-${activeEvent.id}-guest-lookup.txt`,
      txt,
      "text/plain",
    );
    setExportOpen(false);
  };

  const handleExportVendorSheet = () => {
    const txt = buildVendorSetupSheet({
      eventLabel: activeEvent.label,
      roomName: room.name,
      elements: fixed,
    });
    downloadText(
      `floor-plan-${activeEvent.id}-vendor-setup.txt`,
      txt,
      "text/plain",
    );
    setExportOpen(false);
  };

  const handleExportAvPower = () => {
    const txt = buildAvPowerMap({
      eventLabel: activeEvent.label,
      elements: fixed,
    });
    downloadText(
      `floor-plan-${activeEvent.id}-av-power.txt`,
      txt,
      "text/plain",
    );
    setExportOpen(false);
  };

  const handleExportExperience = () => {
    const txt = buildExperienceOverview({
      eventLabel: activeEvent.label,
      zones,
      elements: fixed,
    });
    downloadText(
      `floor-plan-${activeEvent.id}-experience-overview.txt`,
      txt,
      "text/plain",
    );
    setExportOpen(false);
  };

  const handleClearAll = () => {
    if (!assignments.length) return;
    const ok = window.confirm(
      `Clear all ${assignments.length} assignment${assignments.length === 1 ? "" : "s"} for ${activeEvent.label}? This can't be undone.`,
    );
    if (!ok) return;
    clearEvent();
    setBanner(`Cleared assignments for ${activeEvent.label}.`);
  };

  return (
    <div>
      {/* Tab strip */}
      <div className="mb-4 flex items-center gap-1 border-b border-border">
        <TabBtn
          active={tab === "layout"}
          icon={<LayoutIcon size={13} strokeWidth={1.6} />}
          onClick={() => setTab("layout")}
        >
          Layout
        </TabBtn>
        <TabBtn
          active={tab === "seating"}
          icon={<Armchair size={13} strokeWidth={1.6} />}
          onClick={() => setTab("seating")}
        >
          Seating
        </TabBtn>
        <TabBtn
          active={tab === "zones"}
          icon={<MapIcon size={13} strokeWidth={1.6} />}
          onClick={() => setTab("zones")}
        >
          Experience Zones
        </TabBtn>
      </div>

      {/* Toolbar row */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!configOpen && (
            <RoomConfigPanel open={false} onToggle={() => setConfigOpen(true)} />
          )}
          <div className="rounded-md border border-border bg-white px-3 py-1.5 font-mono text-[10.5px] text-ink-muted">
            {tables.length} tables · {capacity} seats · {assigned}/{eventGuests.length} seated · {fixed.length} elements · {zones.length} zones
          </div>

          {/* Event selector */}
          {eventOptions.length > 1 && (
            <div className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Event
              </span>
              <select
                value={activeEventId}
                onChange={(e) => setActiveEvent(e.target.value)}
                className="bg-transparent text-[11.5px] text-ink outline-none"
              >
                {eventOptions.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.label}
                    {ev.date ? ` · ${ev.date}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Copy layout from another event */}
          {currentPlanIsBlank && copyCandidates.length > 0 && (
            <div className="flex items-center gap-1 rounded-md border border-dashed border-gold/40 bg-gold-pale/20 px-2 py-1 font-mono text-[10.5px] text-ink-muted">
              <Copy size={10} strokeWidth={1.7} />
              <span>Copy layout from</span>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  copyPlanFrom(e.target.value);
                  setBanner(`Layout copied from ${eventOptions.find((ev) => ev.id === e.target.value)?.label}.`);
                  e.target.value = "";
                }}
                defaultValue=""
                className="bg-transparent text-[11.5px] text-ink outline-none"
              >
                <option value="" disabled>
                  Choose event…
                </option>
                {copyCandidates.map((id) => (
                  <option key={id} value={id}>
                    {eventOptions.find((e) => e.id === id)?.label ?? id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Add element */}
          <button
            onClick={() => setLibraryOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
            title="Add element from library"
          >
            <Plus size={12} strokeWidth={1.7} />
            Add element
          </button>

          {/* Experience Suggestions */}
          <button
            onClick={() => setExperienceOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-br from-gold to-gold/80 px-3 py-1.5 text-[12px] text-ivory shadow-sm hover:opacity-90"
            title="Have Claude suggest experiences"
          >
            <Sparkles size={12} strokeWidth={1.7} />
            Suggest experiences
          </button>

          {/* One-click: ✦ Auto-assign all — full AI flow (assign + zone +
              ring layout + dining intelligence). Primary action per spec. */}
          {tab === "seating" && (
            <button
              disabled={!canAutoSuggest || oneClickBusy}
              onClick={handleAutoAssignAll}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] shadow-sm",
                canAutoSuggest && !oneClickBusy
                  ? "bg-gradient-to-br from-gold to-gold/80 text-ivory hover:opacity-90"
                  : "cursor-not-allowed bg-gold/40 text-ivory",
              )}
              title={
                oneClickBusy
                  ? "Claude is arranging your guests…"
                  : canAutoSuggest
                    ? "Assign all guests, classify zones, and arrange tables in one click"
                    : tables.length === 0
                      ? "Add tables first"
                      : "No guests for this event"
              }
            >
              <Sparkles size={12} strokeWidth={1.7} className={oneClickBusy ? "animate-pulse" : ""} />
              {oneClickBusy ? "Arranging…" : "Auto-assign all"}
            </button>
          )}

          {/* Auto-suggest seating — refined-control modal (strategy, constraints) */}
          {tab === "seating" && (
            <button
              disabled={!canAutoSuggest || oneClickBusy}
              onClick={() => setAutoOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]",
                canAutoSuggest && !oneClickBusy
                  ? "border border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink"
                  : "cursor-not-allowed border border-border bg-ivory/40 text-ink-faint",
              )}
              title={
                canAutoSuggest
                  ? "Fine-tune the strategy, constraints, and must-pair rules"
                  : tables.length === 0
                    ? "Add tables first"
                    : "No guests for this event"
              }
            >
              <Armchair size={12} strokeWidth={1.7} />
              Refine…
            </button>
          )}

          {/* Export menu */}
          <div className="relative">
            <button
              disabled={!canExport}
              onClick={() => setExportOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px]",
                canExport
                  ? "text-ink-muted hover:border-ink/20 hover:text-ink"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              <Download size={12} strokeWidth={1.6} />
              Export
            </button>
            {exportOpen && canExport && (
              <div
                className="absolute right-0 top-full z-10 mt-1 w-60 overflow-hidden rounded-md border border-border bg-white shadow-lg"
                onMouseLeave={() => setExportOpen(false)}
              >
                <div className="border-b border-border bg-ivory/30 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Seating
                </div>
                <button
                  onClick={handlePrint}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Printer size={11} strokeWidth={1.6} />
                  Floor plan PDF
                </button>
                <button
                  onClick={handleExportCards}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Table2 size={11} strokeWidth={1.6} />
                  Table cards
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Download size={11} strokeWidth={1.6} />
                  Seating CSV
                </button>
                <button
                  onClick={handleExportLookup}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Download size={11} strokeWidth={1.6} />
                  Guest lookup list
                </button>
                <div className="border-t border-border bg-ivory/30 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Vendor coordination
                </div>
                <button
                  onClick={handleExportVendorSheet}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Download size={11} strokeWidth={1.6} />
                  Vendor setup sheet
                </button>
                <button
                  onClick={handleExportAvPower}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Zap size={11} strokeWidth={1.6} />
                  AV & power map
                </button>
                <button
                  onClick={handleExportExperience}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-[11.5px] text-ink hover:bg-ivory"
                >
                  <Sparkles size={11} strokeWidth={1.6} />
                  Experience overview
                </button>
              </div>
            )}
          </div>

          {/* Clear all */}
          {tab === "seating" && (
            <button
              disabled={!assigned}
              onClick={handleClearAll}
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border bg-white text-ink-muted hover:border-rose/30 hover:text-rose",
                !assigned && "cursor-not-allowed opacity-40",
              )}
              title={assigned ? "Clear all assignments for this event" : "No assignments yet"}
            >
              <Trash2 size={12} strokeWidth={1.7} />
            </button>
          )}

          <div className="font-mono text-[10px] text-ink-faint">{savedLabel}</div>
          {!listOpen && tab !== "zones" && (
            <button
              onClick={() => setListOpen(true)}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              Show sidebar
            </button>
          )}
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-sage/40 bg-sage-pale/40 px-4 py-2 text-[12px] text-ink">
          <div className="flex items-center gap-2">
            <RefreshCw size={12} strokeWidth={1.7} className="text-sage" />
            {banner}
          </div>
          <div className="flex items-center gap-3">
            {lastSuggestion && (
              <button
                onClick={() => {
                  restoreEventSnapshot(lastSuggestion.snapshot);
                  setLastSuggestion(null);
                  setBanner("Suggestion undone — returned to previous layout.");
                }}
                className="rounded border border-ink/30 bg-white px-2 py-0.5 text-[11px] text-ink hover:bg-ivory"
              >
                Undo suggestion
              </button>
            )}
            <button
              onClick={() => {
                setBanner("");
                setLastSuggestion(null);
              }}
              className="text-ink-faint hover:text-ink"
            >
              dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex h-[620px] gap-3">
        {configOpen && (
          <RoomConfigPanel open onToggle={() => setConfigOpen(false)} />
        )}
        <div className="relative flex-1 min-w-0">
          <SeatingCanvas
            onRequestConfigOpen={() => setConfigOpen(true)}
            guests={eventGuests}
            eventId={activeEventId}
            onOpenTableCard={(id) => setCardTableId(id)}
            highlightGuestIds={lastSuggestion?.newlyAssignedIds}
          />
          {/* Floating Dining Intelligence digest — only renders when the
              assignments store has a record for this event. */}
          {tab === "seating" && <DiningIntelligenceBadge eventId={activeEventId} />}
          {/* Floating properties panel (when a fixed element is selected) */}
          {selectedFixedId && tab !== "zones" && <ElementPropertiesPanel />}
        </div>
        {tab === "zones" ? (
          <div className="flex h-full w-[360px] flex-shrink-0 flex-col overflow-hidden">
            <ZonesPanel />
          </div>
        ) : (
          listOpen && (
            <CombinedSidebar
              open
              onToggle={() => setListOpen(false)}
              guests={eventGuests}
              eventId={activeEventId}
              onAddElement={() => setLibraryOpen(true)}
              initialTab={tab === "seating" ? "guests" : "elements"}
            />
          )
        )}
      </div>

      {/* Modals */}
      {autoOpen && canAutoSuggest && (
        <AutoSuggestModal
          eventId={activeEventId}
          eventLabel={activeEvent.label}
          guests={eventGuests}
          onClose={() => setAutoOpen(false)}
          onApplied={(payload) => {
            setBanner(payload.summary);
            setLastSuggestion({
              summary: payload.summary,
              snapshot: payload.snapshot,
              newlyAssignedIds: payload.newlyAssignedIds,
            });
          }}
        />
      )}

      {cardTableId && (
        <TableDetailPopup
          tableId={cardTableId}
          guests={eventGuests}
          eventId={activeEventId}
          onClose={() => setCardTableId(null)}
        />
      )}

      {libraryOpen && (
        <ElementLibraryPanel open onClose={() => setLibraryOpen(false)} />
      )}

      {experienceOpen && (
        <ExperienceSuggestModal
          eventId={activeEventId}
          eventLabel={activeEvent.label}
          guestCount={eventGuests.length || guests.length || 0}
          guestDemographics={buildDemographicsBlurb(guests)}
          onClose={() => setExperienceOpen(false)}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12.5px] transition",
        active
          ? "border-ink text-ink"
          : "border-transparent text-ink-muted hover:text-ink",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function buildDemographicsBlurb(guests: SeatingGuest[]): string {
  if (!guests.length) return "";
  const kids = guests.filter((g) => g.ageCategory === "child").length;
  const elders = guests.filter((g) => g.ageCategory === "senior").length;
  const outOfTown = guests.filter((g) => g.outOfTown).length;
  const parts: string[] = [];
  if (kids) parts.push(`${kids} kids`);
  if (elders) parts.push(`${elders} elderly`);
  if (outOfTown) parts.push(`${outOfTown} out-of-town`);
  return parts.join(", ");
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "just now";
  }
}

// Silence unused import warnings — SeatingTable is used by downstream hooks
// via the export modules (buildPrintableHtml consumes it).
export type { SeatingTable };
