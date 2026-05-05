"use client";

// ── Selection Session 4 · Service plan ────────────────────────────────────
// Per-event service timing, late-night drops, vendor handoff notes,
// procurement cadence. Data lives in the guided-journey form_data for
// `service_plan` (this session is the canonical home — Tab 6 reads it back
// when present). Auto-derives "fresh items" pickup time from any loved
// item flagged in FRESH_ITEM_IDS.

import { useEffect, useMemo } from "react";
import { Coffee, Moon, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  SWEETS_SELECTION_CATEGORY,
  SWEETS_SELECTION_JOURNEY_ID,
} from "@/lib/guided-journeys/sweets-selection";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  WEDDING_EVENTS,
  type WeddingEvent,
  type WorkspaceCategory,
} from "@/types/workspace";
import { DESSERT_CATALOG } from "@/lib/cake-sweets-seed";
import { isFreshItem } from "@/lib/libraries/sweets-catalog";

interface EventService {
  event: WeddingEvent;
  service_start_time: string;
  service_end_time?: string;
  refresh_cadence_minutes?: number;
  late_night_drop: {
    enabled: boolean;
    drop_time?: string;
    items: string[]; // dessert ids
    notes?: string;
  };
  notes?: string;
}

interface ServicePlanData {
  event_service?: EventService[];
  vendor_handoff?: {
    photographer_notes?: string;
    decor_notes?: string;
    catering_coordination?: string;
  };
  procurement_cadence?: {
    cake_pickup_time?: string;
    mithai_pickup_time?: string;
    fresh_items_pickup_time?: string;
    cold_storage_required?: boolean;
    cold_storage_notes?: string;
  };
}

interface TableMeta {
  kind?: "table";
  event?: WeddingEvent;
}

const DEFAULT_SERVICE_TIME: Record<WeddingEvent, string> = {
  pre_wedding: "18:00",
  haldi: "11:00",
  mehendi: "16:00",
  sangeet: "21:00",
  wedding: "13:00",
  reception: "21:00",
};

const LATE_NIGHT_DEFAULT: Set<WeddingEvent> = new Set(["sangeet", "reception"]);

export function ServicePlanSession({
  category,
}: {
  category: WorkspaceCategory;
  onSkipToNext?: () => void;
}) {
  const [state, update] = useCategoryJourneyState(
    SWEETS_SELECTION_CATEGORY,
    SWEETS_SELECTION_JOURNEY_ID,
  );

  const data: ServicePlanData =
    (state.formData["service_plan"] as ServicePlanData | undefined) ?? {};

  // Derive events from dessert tables (Session 3) + cake cutting ceremony.
  const items = useWorkspaceStore((s) => s.items);
  const tableEvents = useMemo(() => {
    const events = new Set<WeddingEvent>();
    for (const it of items) {
      if (it.category_id !== category.id || it.tab !== "dessert_tables")
        continue;
      const meta = it.meta as TableMeta | undefined;
      if (meta?.kind === "table" && meta.event) {
        events.add(meta.event);
      }
    }
    return Array.from(events);
  }, [items, category.id]);

  // Loved mithai for late-night drop picker
  const dessertReactions = useCakeSweetsStore((s) => s.dessert_catalog);
  const dessertMeta = useCakeSweetsStore((s) => s.dessert_meta);
  const lovedMithai = useMemo(() => {
    return Object.entries(dessertReactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => {
        const cat = DESSERT_CATALOG.find((d) => d.id === id);
        const m = dessertMeta[id];
        return {
          id,
          name: cat?.name ?? m?.name ?? "(custom)",
          emoji: cat?.emoji ?? "✨",
          fresh: isFreshItem(id),
        };
      });
  }, [dessertReactions, dessertMeta]);

  const hasFreshItems = lovedMithai.some((m) => m.fresh);

  // Pre-seed event_service rows from table events on first hydrate.
  const eventService: EventService[] = data.event_service ?? [];
  useEffect(() => {
    if (eventService.length > 0) return;
    if (tableEvents.length === 0) return;
    const seeded = tableEvents.map<EventService>((evt) => ({
      event: evt,
      service_start_time: DEFAULT_SERVICE_TIME[evt],
      refresh_cadence_minutes: 30,
      late_night_drop: {
        enabled: LATE_NIGHT_DEFAULT.has(evt),
        items: [],
      },
    }));
    update((s) => setSessionFormPath(s, "service_plan", "event_service", seeded));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableEvents.join("|")]);

  // Auto-suggest fresh-items pickup once loved mithai includes fresh items.
  useEffect(() => {
    const cur = data.procurement_cadence?.fresh_items_pickup_time;
    if (hasFreshItems && !cur) {
      update((s) =>
        setSessionFormPath(
          s,
          "service_plan",
          "procurement_cadence.fresh_items_pickup_time",
          "Day-of morning",
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFreshItems]);

  type EventPatch = Partial<Omit<EventService, "late_night_drop">> & {
    late_night_drop?: Partial<EventService["late_night_drop"]>;
  };
  function patchEvent(event: WeddingEvent, patch: EventPatch) {
    const next = (data.event_service ?? []).map((es) =>
      es.event === event
        ? {
            ...es,
            ...patch,
            late_night_drop: {
              ...es.late_night_drop,
              ...(patch.late_night_drop ?? {}),
            },
          }
        : es,
    );
    update((s) => setSessionFormPath(s, "service_plan", "event_service", next));
  }

  function patchHandoff(
    key: keyof NonNullable<ServicePlanData["vendor_handoff"]>,
    value: string,
  ) {
    update((s) =>
      setSessionFormPath(s, "service_plan", `vendor_handoff.${key}`, value),
    );
  }

  function patchProcurement(
    key: keyof NonNullable<ServicePlanData["procurement_cadence"]>,
    value: string | boolean,
  ) {
    update((s) =>
      setSessionFormPath(s, "service_plan", `procurement_cadence.${key}`, value),
    );
  }

  return (
    <div className="space-y-6">
      {tableEvents.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-3 py-2 text-[12.5px] italic text-ink-muted">
          Plan some dessert tables in Session 3 first — service times follow
          the events those tables sit at.
        </p>
      )}

      {/* Per-event service */}
      {(data.event_service ?? []).length > 0 && (
        <section>
          <SectionHeader title="Per-event service" eyebrow="When sweets land" />
          <ul className="space-y-3">
            {(data.event_service ?? []).map((es) => (
              <EventServiceEditor
                key={es.event}
                eventService={es}
                lovedMithai={lovedMithai}
                onPatch={(patch) => patchEvent(es.event, patch)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Vendor handoff */}
      <section>
        <SectionHeader title="Vendor handoff notes" eyebrow="Day-of coordination" />
        <p className="mb-2 text-[12px] text-ink-muted">
          These notes flow into your photography, décor, and catering
          workspaces' day-of coordination sections.
        </p>
        <div className="grid grid-cols-1 gap-2">
          <Field label="Photographer">
            <textarea
              value={data.vendor_handoff?.photographer_notes ?? ""}
              onChange={(e) => patchHandoff("photographer_notes", e.target.value)}
              placeholder="Capture cake cutting setup at 9:25 PM. Wide shot of mithai table at 8 PM before guests arrive."
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Décor">
            <textarea
              value={data.vendor_handoff?.decor_notes ?? ""}
              onChange={(e) => patchHandoff("decor_notes", e.target.value)}
              placeholder="Floral runner on cake table 1 hour before service. Marigold accent props on each mithai station."
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Catering coordination">
            <textarea
              value={data.vendor_handoff?.catering_coordination ?? ""}
              onChange={(e) =>
                patchHandoff("catering_coordination", e.target.value)
              }
              placeholder="Mithai station shares table with chaat — coordinate setup with caterer at 4 PM."
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </Field>
        </div>
      </section>

      {/* Procurement cadence */}
      <section>
        <SectionHeader title="Procurement cadence" eyebrow="Pickup & storage" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Field label="Cake pickup">
            <input
              value={data.procurement_cadence?.cake_pickup_time ?? ""}
              onChange={(e) => patchProcurement("cake_pickup_time", e.target.value)}
              placeholder="9 AM day-of · or T-1 evening"
              className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field label="Mithai pickup">
            <input
              value={data.procurement_cadence?.mithai_pickup_time ?? ""}
              onChange={(e) => patchProcurement("mithai_pickup_time", e.target.value)}
              placeholder="T-1 afternoon · day-of morning"
              className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </Field>
          <Field
            label={
              hasFreshItems
                ? "Fresh-items pickup (auto-set — has fresh)"
                : "Fresh-items pickup"
            }
          >
            <input
              value={data.procurement_cadence?.fresh_items_pickup_time ?? ""}
              onChange={(e) =>
                patchProcurement("fresh_items_pickup_time", e.target.value)
              }
              placeholder="Day-of morning · live station 1 hour before"
              className={cn(
                "w-full rounded-sm border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none",
                hasFreshItems ? "border-amber-400" : "border-border",
              )}
            />
          </Field>
          <Field label="Cold storage required">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-[12.5px] text-ink">
                <input
                  type="checkbox"
                  checked={data.procurement_cadence?.cold_storage_required ?? false}
                  onChange={(e) =>
                    patchProcurement("cold_storage_required", e.target.checked)
                  }
                />
                Yes
              </label>
            </div>
          </Field>
          {data.procurement_cadence?.cold_storage_required && (
            <Field label="Cold storage notes">
              <textarea
                value={data.procurement_cadence?.cold_storage_notes ?? ""}
                onChange={(e) =>
                  patchProcurement("cold_storage_notes", e.target.value)
                }
                placeholder="Venue walk-in fridge available 6 AM onwards. Reserve 2 shelves for mithai trays."
                rows={2}
                className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            </Field>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Per-event editor ────────────────────────────────────────────────────

function EventServiceEditor({
  eventService,
  lovedMithai,
  onPatch,
}: {
  eventService: EventService;
  lovedMithai: Array<{ id: string; name: string; emoji: string; fresh: boolean }>;
  onPatch: (patch: Partial<Omit<EventService, "late_night_drop">> & {
    late_night_drop?: Partial<EventService["late_night_drop"]>;
  }) => void;
}) {
  const drop = eventService.late_night_drop;

  return (
    <li className="rounded-md border border-border bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Coffee size={13} strokeWidth={1.8} className="text-saffron" />
        <h5 className="font-serif text-[15px] text-ink">
          {WEDDING_EVENTS.find((e) => e.id === eventService.event)?.label ??
            eventService.event}
        </h5>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Field label="Service starts">
          <input
            type="time"
            value={eventService.service_start_time}
            onChange={(e) => onPatch({ service_start_time: e.target.value })}
            className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Service ends">
          <input
            type="time"
            value={eventService.service_end_time ?? ""}
            onChange={(e) => onPatch({ service_end_time: e.target.value })}
            className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Refresh cadence (min)">
          <input
            type="number"
            min={0}
            max={120}
            value={eventService.refresh_cadence_minutes ?? 30}
            onChange={(e) =>
              onPatch({ refresh_cadence_minutes: Number(e.target.value) })
            }
            className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Late-night drop">
          <label className="inline-flex items-center gap-1 text-[12px] text-ink">
            <input
              type="checkbox"
              checked={drop.enabled}
              onChange={(e) =>
                onPatch({ late_night_drop: { enabled: e.target.checked } })
              }
            />
            <Moon size={11} strokeWidth={1.8} /> Enabled
          </label>
        </Field>
      </div>

      {drop.enabled && (
        <div className="mt-2 rounded-sm border border-rose/30 bg-rose-pale/15 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Drop time</Eyebrow>
            <input
              type="time"
              value={drop.drop_time ?? ""}
              onChange={(e) =>
                onPatch({ late_night_drop: { drop_time: e.target.value } })
              }
              className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <Eyebrow>Items</Eyebrow>
            <div className="flex flex-wrap gap-1">
              {lovedMithai.map((m) => {
                const active = drop.items.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? drop.items.filter((x) => x !== m.id)
                        : [...drop.items, m.id];
                      onPatch({ late_night_drop: { items: next } });
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                      active
                        ? "border-rose bg-rose-pale/40 text-rose"
                        : "border-border bg-white text-ink-muted hover:border-rose",
                    )}
                  >
                    <span>{m.emoji}</span>
                    {m.name}
                    {m.fresh && (
                      <span className="ml-0.5 text-[9px] uppercase text-amber-700">
                        fresh
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            value={drop.notes ?? ""}
            onChange={(e) =>
              onPatch({ late_night_drop: { notes: e.target.value } })
            }
            placeholder="Hot jalebi station opens at 11:30 — fresh from the fryer."
            className="mt-2 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        </div>
      )}
    </li>
  );
}

// ─── Tiny primitives ─────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function SectionHeader({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-3">
      {eyebrow && (
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
      )}
      <h4 className="font-serif text-[18px] leading-tight text-ink">
        {title}
      </h4>
    </header>
  );
}
