"use client";

// ── Spaces & Flow tab ──────────────────────────────────────────────────────
// Only meaningful content once a venue is booked or seriously considered
// (status = shortlisted / site_visit_planned / visited / booked). Shows a
// venue selector at the top when more than one shortlisted venue exists;
// otherwise scoped to the single active venue.
//
// Three sections:
//   1. "Map your events to spaces" — event→space pairings drawn as cards
//      in the event order (from the Events workspace). Each card shows
//      the event, the assigned space, capacity, and flags when a space is
//      either double-booked or the event guest count exceeds capacity.
//   2. "Flip & transition notes" — per-space transition cards (flip time,
//      changes, responsible).
//   3. "Floor plan" — upload slot. Captioned.

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  FileUp,
  Image as ImageIcon,
  Map as MapIcon,
  Plus,
  Repeat,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";
import type { ShortlistVenue, VenueSpace } from "@/types/venue";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { suggestLayout } from "@/lib/venue/mock-ai";

const VENUE_STATUSES_TO_SHOW: ShortlistVenue["status"][] = [
  "shortlisted",
  "site_visit_planned",
  "visited",
  "booked",
];

export function VenueSpacesFlow() {
  const shortlist = useVenueStore((s) => s.shortlist);
  const active = shortlist.filter((v) => VENUE_STATUSES_TO_SHOW.includes(v.status));
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    active[0]?.id ?? null,
  );

  if (active.length === 0) {
    return (
      <div className="space-y-6">
        <PanelCard title="spaces & flow">
          <EmptyRow>
            This tab lights up once a venue reaches "Shortlisted" or later.
            Until then, stay on Dream & Discover or Shortlist.
          </EmptyRow>
        </PanelCard>
      </div>
    );
  }

  const current =
    active.find((v) => v.id === selectedVenueId) ?? active[0] ?? null;

  return (
    <div className="space-y-6">
      {active.length > 1 && (
        <VenueSelector
          venues={active}
          selectedId={current?.id ?? null}
          onSelect={setSelectedVenueId}
        />
      )}
      <EventFlowSection />
      <TransitionSection />
      <FloorPlanSection />
      <AILayoutSection />
    </div>
  );
}

// ── AI Layout suggestions ─────────────────────────────────────────────────
// Once a floor plan is uploaded OR events have been paired to spaces, this
// section surfaces "this is the possibility — this is what we can turn this
// space into" for each assigned space. Output is inspirational, not
// prescriptive. Each card has a Generate / Regenerate button.

function AILayoutSection() {
  const spaces = useVenueStore((s) => s.spaces);
  const pairings = useVenueStore((s) => s.pairings);
  const floorPlanUrl = useVenueStore((s) => s.profile.floor_plan_url);
  const updateSpace = useVenueStore((s) => s.updateSpace);
  const discovery = useVenueStore((s) => s.discovery);
  const events = useEventsStore((s) => s.events);

  // Only show spaces that are either linked to a pairing or were upgraded
  // via the floor plan upload.
  const assignedSpaceIds = new Set(pairings.map((p) => p.space_id));
  const relevantSpaces = useMemo(() => {
    if (!floorPlanUrl && assignedSpaceIds.size === 0) return spaces.slice(0, 3);
    return spaces.filter(
      (sp) => assignedSpaceIds.has(sp.id) || sp.ai_layout_suggestion,
    );
  }, [spaces, floorPlanUrl, assignedSpaceIds]);

  if (relevantSpaces.length === 0) return null;

  function generate(space: VenueSpace) {
    const eventForSpace = pairings.find((p) => p.space_id === space.id);
    const event = eventForSpace
      ? events.find((ev) => ev.id === eventForSpace.event_id)
      : null;
    const guestCount = event?.guestCount ?? 300;
    const result = suggestLayout(space, {
      guestCount,
      vibes: discovery.quiz.answers.vibes,
      mustHaves: discovery.quiz.answers.must_haves,
      eventName: event
        ? event.customName ||
          EVENT_TYPE_OPTIONS.find((o) => o.id === event.type)?.name
        : undefined,
    });
    updateSpace(space.id, { ai_layout_suggestion: result });
  }

  function generateAll() {
    for (const s of relevantSpaces) generate(s);
  }

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="what this space could become"
      description="AI-drafted layout directions for each assigned space — inspiration, not prescription. Regenerate whenever you want a fresh read."
      badge={
        <button
          type="button"
          onClick={generateAll}
          className="flex items-center gap-1 rounded-sm border border-saffron bg-saffron px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ivory hover:bg-saffron/90"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Wand2 size={10} /> Suggest for all
        </button>
      }
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {relevantSpaces.map((sp) => {
          const eventForSpace = pairings.find((p) => p.space_id === sp.id);
          const event = eventForSpace
            ? events.find((ev) => ev.id === eventForSpace.event_id)
            : null;
          const eventLabelStr = event
            ? event.customName ||
              EVENT_TYPE_OPTIONS.find((o) => o.id === event.type)?.name ||
              event.type
            : "Unassigned";
          return (
            <li
              key={sp.id}
              className="overflow-hidden rounded-md border border-gold/20 bg-white"
            >
              <div className="flex items-stretch">
                <div className="relative aspect-[4/3] w-28 shrink-0 bg-ivory-warm">
                  {sp.image_url ? (
                    <img
                      src={sp.image_url}
                      alt={sp.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-faint">
                      <ImageIcon size={18} strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-ink">{sp.name}</p>
                      <p
                        className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        For {eventLabelStr} · Cap {sp.capacity || "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => generate(sp)}
                      className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Wand2 size={9} />{" "}
                      {sp.ai_layout_suggestion ? "Regenerate" : "Suggest"}
                    </button>
                  </div>
                  <div className="mt-2 rounded-sm border border-gold/30 bg-gold-pale/10 p-2.5">
                    {sp.ai_layout_suggestion ? (
                      <p className="text-[12.5px] leading-relaxed text-ink">
                        {sp.ai_layout_suggestion}
                      </p>
                    ) : (
                      <p className="text-[11.5px] italic text-ink-faint">
                        Tap Suggest — we'll sketch a plausible layout using
                        your guest count, vibe, and this space's capacity.
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Eyebrow>Your annotations</Eyebrow>
                    <InlineText
                      value={sp.notes}
                      onSave={(n) => updateSpace(sp.id, { notes: n })}
                      variant="block"
                      allowEmpty
                      placeholder="Riff on the AI idea, or overwrite it with your own plan."
                      emptyLabel="Click to annotate…"
                      className="!p-0 text-[12px] leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}

// ── Venue selector ────────────────────────────────────────────────────────

function VenueSelector({
  venues,
  selectedId,
  onSelect,
}: {
  venues: ShortlistVenue[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
      <Eyebrow>Viewing spaces at</Eyebrow>
      {venues.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onSelect(v.id)}
          className={cn(
            "rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
            selectedId === v.id
              ? "border-saffron bg-saffron-pale/50 text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron/50",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {v.name}
        </button>
      ))}
    </section>
  );
}

// ── Event → Space flow ────────────────────────────────────────────────────

function eventLabel(e: EventRecord): string {
  if (e.customName) return e.customName;
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
  return opt?.name ?? e.type;
}

function parseCapacity(cap: string): number | null {
  // "80" → 80, "400 / 320" → 400 (max), "Cap 500" → 500
  const matches = cap.match(/\d+/g);
  if (!matches) return null;
  return Math.max(...matches.map((n) => Number(n)));
}

function EventFlowSection() {
  const events = useEventsStore((s) => s.events);
  const spaces = useVenueStore((s) => s.spaces);
  const pairings = useVenueStore((s) => s.pairings);
  const addPairing = useVenueStore((s) => s.addPairing);
  const updatePairing = useVenueStore((s) => s.updatePairing);
  const removePairing = useVenueStore((s) => s.removePairing);
  const addSpace = useVenueStore((s) => s.addSpace);
  const [newSpaceDraft, setNewSpaceDraft] = useState("");

  const orderedEvents = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  // Map event_id → pairings (an event can in theory pair with one space;
  // if there are multiples we surface the first and leave others to manage
  // manually).
  const pairingByEvent = useMemo(() => {
    const m = new Map<string, typeof pairings>();
    for (const p of pairings) {
      if (!m.has(p.event_id)) m.set(p.event_id, []);
      m.get(p.event_id)!.push(p);
    }
    return m;
  }, [pairings]);

  // Count pairings per space — anything > 1 is a double-booking flag.
  const spaceCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pairings) {
      m.set(p.space_id, (m.get(p.space_id) ?? 0) + 1);
    }
    return m;
  }, [pairings]);

  return (
    <PanelCard
      icon={<MapIcon size={14} strokeWidth={1.8} />}
      title="map your events to spaces"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {orderedEvents.length} events · {spaces.length} spaces
        </span>
      }
    >
      {orderedEvents.length === 0 ? (
        <EmptyRow>
          No events yet — head to the Events workspace first to shape the
          program, then come back here to assign spaces.
        </EmptyRow>
      ) : (
        <ol className="space-y-3">
          {orderedEvents.map((ev, i) => {
            const pairs = pairingByEvent.get(ev.id) ?? [];
            return (
              <li key={ev.id}>
                <EventFlowCard
                  event={ev}
                  spaces={spaces}
                  pairings={pairs}
                  spaceCount={spaceCount}
                  onAssign={(sid) => addPairing(ev.id, sid)}
                  onReassign={(pid, sid) =>
                    updatePairing(pid, { space_id: sid })
                  }
                  onUnassign={(pid) => removePairing(pid)}
                />
                {i < orderedEvents.length - 1 && (
                  <div className="my-1 flex justify-center text-ink-faint">
                    <ArrowDown size={12} strokeWidth={1.5} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <Plus size={12} className="text-ink-faint" />
        <input
          type="text"
          value={newSpaceDraft}
          onChange={(e) => setNewSpaceDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSpaceDraft.trim()) {
              e.preventDefault();
              addSpace({ name: newSpaceDraft.trim() });
              setNewSpaceDraft("");
            }
          }}
          placeholder="Add a space not in the default inventory…"
          className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

function EventFlowCard({
  event,
  spaces,
  pairings,
  spaceCount,
  onAssign,
  onReassign,
  onUnassign,
}: {
  event: EventRecord;
  spaces: VenueSpace[];
  pairings: Array<{ id: string; event_id: string; space_id: string }>;
  spaceCount: Map<string, number>;
  onAssign: (spaceId: string) => void;
  onReassign: (pairingId: string, spaceId: string) => void;
  onUnassign: (pairingId: string) => void;
}) {
  const pairing = pairings[0] ?? null;
  const space = pairing ? spaces.find((s) => s.id === pairing.space_id) : null;
  const capacity = space ? parseCapacity(space.capacity) : null;
  const overCap =
    capacity !== null && event.guestCount > 0 && event.guestCount > capacity;
  const doubleBooked = space && (spaceCount.get(space.id) ?? 0) > 1;
  const updateSpace = useVenueStore((s) => s.updateSpace);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-md border bg-white transition-colors",
        overCap || doubleBooked ? "border-rose" : "border-border",
      )}
    >
      <div className="flex items-stretch">
        <div className="w-[160px] shrink-0 border-r border-border bg-ivory-warm/40 px-3 py-3">
          <Eyebrow>Event</Eyebrow>
          <p className="mt-1 text-[13px] font-medium text-ink">
            {eventLabel(event)}
          </p>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            {event.guestCount > 0 ? `${event.guestCount} guests` : "Guest count TBD"}
          </p>
        </div>

        <div className="relative flex-1 p-3">
          {space ? (
            <div className="flex items-start gap-3">
              {space.image_url ? (
                <img
                  src={space.image_url}
                  alt={space.name}
                  className="h-16 w-20 shrink-0 rounded-sm object-cover ring-1 ring-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-sm bg-ivory-warm text-ink-faint ring-1 ring-border">
                  <ImageIcon size={18} strokeWidth={1.2} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink">{space.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  Cap {space.capacity || "—"}
                </p>
                <div className="mt-1">
                  <InlineText
                    value={space.notes}
                    onSave={(n) => updateSpace(space.id, { notes: n })}
                    variant="block"
                    allowEmpty
                    placeholder="Gotchas, setup notes, photographer-friendly times…"
                    emptyLabel="Click to add space notes…"
                    className="!p-0 text-[11.5px] leading-snug text-ink-muted"
                  />
                </div>
                {(overCap || doubleBooked) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {overCap && (
                      <Flag>
                        <AlertTriangle size={10} /> Over capacity
                      </Flag>
                    )}
                    {doubleBooked && (
                      <Flag>
                        <Repeat size={10} /> Double-booked
                      </Flag>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <SpacePicker
                  spaces={spaces}
                  currentId={space.id}
                  onSelect={(sid) => onReassign(pairing!.id, sid)}
                />
                <button
                  type="button"
                  onClick={() => onUnassign(pairing!.id)}
                  className="flex items-center gap-1 rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-rose hover:text-rose"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <X size={9} /> Unassign
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12.5px] italic text-ink-faint">
                No space assigned — pick one →
              </p>
              <SpacePicker
                spaces={spaces}
                currentId={null}
                onSelect={onAssign}
                assignMode
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function SpacePicker({
  spaces,
  currentId,
  onSelect,
  assignMode = false,
}: {
  spaces: VenueSpace[];
  currentId: string | null;
  onSelect: (id: string) => void;
  assignMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
          assignMode
            ? "border-saffron bg-saffron text-ivory hover:bg-saffron/90"
            : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {assignMode ? "+ Assign space" : "Change"}
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-10 mt-1 max-h-56 w-[220px] overflow-y-auto rounded-md border border-border bg-white shadow-lg">
          {spaces.length === 0 ? (
            <li className="px-3 py-1.5 text-[11.5px] italic text-ink-faint">
              No spaces yet.
            </li>
          ) : (
            spaces.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(s.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[11.5px] text-ink hover:bg-ivory-warm/60",
                    s.id === currentId && "bg-saffron-pale/30",
                  )}
                >
                  <span>{s.name}</span>
                  <span className="font-mono text-[9.5px] text-ink-faint">
                    {s.capacity || "—"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function Flag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-rose bg-rose-pale/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-rose"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

// ── Flip & transition notes ──────────────────────────────────────────────

function TransitionSection() {
  const spaces = useVenueStore((s) => s.spaces);
  const pairings = useVenueStore((s) => s.pairings);
  const transitions = useVenueStore((s) => s.transitions);
  const addTransition = useVenueStore((s) => s.addTransition);
  const updateTransition = useVenueStore((s) => s.updateTransition);
  const removeTransition = useVenueStore((s) => s.removeTransition);

  // Spaces that host more than one event are flip candidates.
  const flipCandidates = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of pairings) count.set(p.space_id, (count.get(p.space_id) ?? 0) + 1);
    return spaces.filter((s) => {
      // If the space is used for "→" in its use field, or has multiple
      // pairings, it's a flip candidate.
      return (count.get(s.id) ?? 0) > 1 || s.use.includes("→");
    });
  }, [spaces, pairings]);

  return (
    <PanelCard
      icon={<Repeat size={14} strokeWidth={1.8} />}
      title="flip & transition notes"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Same space, different event → who flips it?
        </span>
      }
    >
      {flipCandidates.length === 0 ? (
        <EmptyRow>
          No spaces used for multiple events yet — no flips to plan.
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {flipCandidates.map((space) => {
            const spaceTransitions = transitions.filter(
              (t) => t.space_id === space.id,
            );
            return (
              <li
                key={space.id}
                className="rounded-md border border-border bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-ink">{space.name}</p>
                  <button
                    type="button"
                    onClick={() => addTransition(space.id)}
                    className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Plus size={10} /> Add flip note
                  </button>
                </div>
                {spaceTransitions.length === 0 ? (
                  <EmptyRow>No flip notes yet.</EmptyRow>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {spaceTransitions.map((t) => (
                      <li
                        key={t.id}
                        className="group grid grid-cols-1 gap-2 rounded-sm border border-border/60 bg-ivory-warm/30 p-2.5 md:grid-cols-3"
                      >
                        <LabelledField label="Flip time">
                          <InlineText
                            value={t.flip_time}
                            onSave={(n) => updateTransition(t.id, { flip_time: n })}
                            allowEmpty
                            placeholder="e.g. overnight, 90 min"
                            className="!p-0 text-[12px]"
                          />
                        </LabelledField>
                        <LabelledField label="What changes">
                          <InlineText
                            value={t.changes}
                            onSave={(n) => updateTransition(t.id, { changes: n })}
                            variant="block"
                            allowEmpty
                            placeholder="stage out, mandap in, floral swap"
                            className="!p-0 text-[12px]"
                          />
                        </LabelledField>
                        <LabelledField label="Responsible">
                          <InlineText
                            value={t.responsible}
                            onSave={(n) => updateTransition(t.id, { responsible: n })}
                            allowEmpty
                            placeholder="Venue + Décor + day-of"
                            className="!p-0 text-[12px]"
                          />
                        </LabelledField>
                        <div className="col-span-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeTransition(t.id)}
                            className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

function LabelledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      {children}
    </div>
  );
}

// ── Floor plan ────────────────────────────────────────────────────────────

function FloorPlanSection() {
  const url = useVenueStore((s) => s.profile.floor_plan_url);
  const caption = useVenueStore((s) => s.profile.floor_plan_caption);
  const setFloorPlan = useVenueStore((s) => s.setFloorPlan);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <PanelCard
      icon={<FileUp size={14} strokeWidth={1.8} />}
      title="floor plan"
    >
      {url ? (
        <figure className="overflow-hidden rounded-md border border-border bg-ivory-warm">
          <img
            src={url}
            alt="Floor plan"
            className="w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <figcaption className="border-t border-border bg-white px-3 py-2 text-[12px] text-ink-muted">
            <InlineText
              value={caption}
              onSave={(n) => setFloorPlan(url, n)}
              allowEmpty
              placeholder="Add a caption…"
              className="!p-0 text-[12px]"
            />
          </figcaption>
          <div className="flex items-center justify-end gap-2 border-t border-border bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setFloorPlan(null, "")}
              className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted hover:border-rose hover:text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <X size={10} /> Remove
            </button>
          </div>
        </figure>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/40 py-12 text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <FileUp size={20} strokeWidth={1.5} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em]">
            Upload floor plan (PDF / image)
          </span>
          <span className="text-[11.5px] italic text-ink-faint">
            {caption || "You and your planner can annotate once uploaded."}
          </span>
        </button>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFloorPlan(URL.createObjectURL(f), caption || f.name);
          }
          e.target.value = "";
        }}
      />
    </PanelCard>
  );
}
