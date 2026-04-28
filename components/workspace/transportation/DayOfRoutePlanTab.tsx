"use client";

// ── Day-of Route Plan ──────────────────────────────────────────────────────
// Transportation's master schedule — every vehicle move across the day,
// grouped by event. Differs from the generic Day-of schedule in that each
// row carries a vehicle + driver column so planners can hand this sheet
// directly to the transport coordinator.
//
// Persists as schedule_slot WorkspaceItems on tab "day_of".

import { useMemo, useState } from "react";
import { Plus, Route, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import {
  PanelCard,
  Eyebrow,
  EmptyRow,
} from "@/components/workspace/blocks/primitives";

interface SlotMeta {
  event?: string;
  time?: string;
  vehicle?: string;
  driver?: string;
  notes?: string;
}

const EVENT_ORDER = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Wedding",
  "Reception",
  "Welcome",
  "Brunch",
] as const;

export function DayOfRoutePlanTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const [composeFor, setComposeFor] = useState<string | null>(null);

  const slots = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "day_of" &&
            i.block_type === "schedule_slot",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, WorkspaceItem[]>();
    for (const s of slots) {
      const ev = ((s.meta ?? {}) as SlotMeta).event || "Unscheduled";
      if (!map.has(ev)) map.set(ev, []);
      map.get(ev)!.push(s);
    }
    const keys = Array.from(map.keys()).sort((a, b) => {
      const ia = EVENT_ORDER.indexOf(a as (typeof EVENT_ORDER)[number]);
      const ib = EVENT_ORDER.indexOf(b as (typeof EVENT_ORDER)[number]);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return keys.map((k) => ({
      event: k,
      rows: map.get(k)!.sort((a, b) => {
        const ta = ((a.meta ?? {}) as SlotMeta).time ?? "";
        const tb = ((b.meta ?? {}) as SlotMeta).time ?? "";
        return ta.localeCompare(tb);
      }),
    }));
  }, [slots]);

  const patch = (id: string, p: Record<string, unknown>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  const addSlot = (event?: string) => {
    addItem({
      category_id: category.id,
      tab: "day_of",
      block_type: "schedule_slot",
      title: "New movement",
      meta: event ? ({ event } satisfies SlotMeta) : {},
      sort_order: items.length + 1,
    });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        The master transport schedule — every vehicle move, grouped by event.
        Keep vehicle + driver columns filled so this sheet is handoff-ready.
      </p>

      <PanelCard
        icon={<Route size={14} strokeWidth={1.8} />}
        title="Movements by event"
        badge={
          canEdit ? (
            <button
              type="button"
              onClick={() => addSlot()}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add movement
            </button>
          ) : undefined
        }
      >
        {grouped.length === 0 ? (
          <EmptyRow>
            Log each movement — morning shuttles, family transfers, baraat,
            vidaai convoy. Columns: time, what, vehicle, driver.
          </EmptyRow>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ event, rows }) => (
              <section key={event}>
                <div className="mb-2 flex items-center justify-between">
                  <Eyebrow className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron" />
                    {event} · {rows.length}
                  </Eyebrow>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        addSlot(event === "Unscheduled" ? undefined : event);
                        setComposeFor(event);
                      }}
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-saffron"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      + Row
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-md border border-border/60">
                  <div
                    className="grid border-b border-border/60 bg-ivory-warm/30 px-3 py-2"
                    style={{
                      gridTemplateColumns:
                        "90px minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1.2fr) 24px",
                    }}
                  >
                    <Eyebrow>Time</Eyebrow>
                    <Eyebrow>Movement</Eyebrow>
                    <Eyebrow>Vehicle</Eyebrow>
                    <Eyebrow>Driver</Eyebrow>
                    <span />
                  </div>
                  <ul className="divide-y divide-border/60">
                    {rows.map((r) => {
                      const meta = (r.meta ?? {}) as SlotMeta;
                      return (
                        <li
                          key={r.id}
                          className="group grid items-center gap-2 px-3 py-2"
                          style={{
                            gridTemplateColumns:
                              "90px minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1.2fr) 24px",
                          }}
                        >
                          <input
                            type="time"
                            value={meta.time ?? ""}
                            onChange={(e) => patch(r.id, { time: e.target.value })}
                            disabled={!canEdit}
                            className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                            style={{ fontFamily: "var(--font-mono)" }}
                          />
                          <input
                            value={r.title}
                            onChange={(e) => updateItem(r.id, { title: e.target.value })}
                            disabled={!canEdit}
                            placeholder="Shuttle #1: Hotel → Venue"
                            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                            autoFocus={composeFor === (meta.event ?? "Unscheduled")}
                          />
                          <input
                            value={meta.vehicle ?? ""}
                            onChange={(e) => patch(r.id, { vehicle: e.target.value })}
                            disabled={!canEdit}
                            placeholder="Coach · Private car"
                            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                          />
                          <input
                            value={meta.driver ?? ""}
                            onChange={(e) => patch(r.id, { driver: e.target.value })}
                            disabled={!canEdit}
                            placeholder="Driver A"
                            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                          />
                          <div className="flex justify-end">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => deleteItem(r.id)}
                                className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                                aria-label="Remove"
                              >
                                <Trash2 size={12} strokeWidth={1.8} />
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
