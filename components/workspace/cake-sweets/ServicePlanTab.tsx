"use client";

// ── Dessert Service Plan ──────────────────────────────────────────────────
// Per-event ledger of when each dessert element appears, who delivers it,
// and any cue note. Bridges the Mithai/Cake/Dessert Tables tabs (what)
// with the day-of timeline (when + who).
//
// Each row is a WorkspaceItem, tab: "service_plan", block_type:
// "schedule_slot". Meta:
//   event:      one of EVENT_ORDER below (Mehendi, Sangeet, …)
//   dessert:    free text — "Mithai platter", "Cake cutting", "Kulfi station"
//   time:       HH:mm or free text ("Throughout", "Post-dinner")
//   managedBy:  free text — "Caterer", "Baker (delivers 6 PM)"
//   notes:      free text

import { useMemo } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { PanelCard, Eyebrow, MiniStat } from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

interface SlotMeta {
  event?: string;
  dessert?: string;
  time?: string;
  managedBy?: string;
  notes?: string;
}

const EVENT_ORDER = [
  "Mehendi",
  "Haldi",
  "Sangeet",
  "Wedding",
  "Reception",
  "Late night",
] as const;
type EventName = (typeof EVENT_ORDER)[number];

const EVENT_HINTS: Record<EventName, string> = {
  Mehendi: "Mithai platter throughout · light bites",
  Haldi: "Sweet ladoo or barfi · simple",
  Sangeet: "Dessert table post-dinner · cake or mithai",
  Wedding: "Small mithai box post-ceremony",
  Reception: "Full spread — mithai station, cake cutting, kulfi, paan",
  "Late night": "Ice cream cart · chai + biscuit · doughnuts",
};

export function ServicePlanTab({
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

  const slots = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "service_plan" &&
          i.block_type === "schedule_slot",
      ),
    [items, category.id],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, WorkspaceItem[]>();
    for (const ev of EVENT_ORDER) m.set(ev, []);
    for (const s of slots) {
      const ev = ((s.meta as SlotMeta).event ?? "").trim() || "Unscheduled";
      if (!m.has(ev)) m.set(ev, []);
      m.get(ev)!.push(s);
    }
    for (const list of m.values()) {
      list.sort((a, b) => {
        const at = ((a.meta as SlotMeta).time ?? "").localeCompare(
          (b.meta as SlotMeta).time ?? "",
        );
        if (at !== 0) return at;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
    }
    return m;
  }, [slots]);

  const eventCounts = useMemo(() => {
    let scheduled = 0;
    for (const s of slots) {
      if ((s.meta as SlotMeta).time) scheduled += 1;
    }
    return { total: slots.length, scheduled };
  }, [slots]);

  const eventsCovered = useMemo(
    () => EVENT_ORDER.filter((ev) => (grouped.get(ev) ?? []).length > 0).length,
    [grouped],
  );

  const addSlot = (event: EventName) => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "service_plan",
      block_type: "schedule_slot",
      title: `${event} dessert`,
      meta: { event } satisfies SlotMeta,
      sort_order: items.length + 1,
    });
  };

  const patch = (id: string, p: Partial<SlotMeta>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Map every dessert moment to its event — what arrives when, and who
        delivers it. Pulls from your Cake Design, Mithai, and Dessert Tables
        so the day-of team knows exactly where to be.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MiniStat
          label="Events covered"
          value={`${eventsCovered}/${EVENT_ORDER.length}`}
          hint="of standard events"
        />
        <MiniStat
          label="Service slots"
          value={eventCounts.total}
          tone="saffron"
        />
        <MiniStat
          label="Time-confirmed"
          value={`${eventCounts.scheduled}/${eventCounts.total || 0}`}
          tone={
            eventCounts.scheduled === eventCounts.total && eventCounts.total > 0
              ? "sage"
              : "ink"
          }
          hint={eventCounts.scheduled === eventCounts.total ? "all set" : "needs times"}
        />
      </div>

      {EVENT_ORDER.map((ev) => {
        const rows = grouped.get(ev) ?? [];
        return (
          <PanelCard
            key={ev}
            icon={<Clock size={14} strokeWidth={1.8} />}
            title={ev}
            badge={
              canEdit && (
                <button
                  type="button"
                  onClick={() => addSlot(ev)}
                  className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
                >
                  <Plus size={12} strokeWidth={1.8} />
                  Add slot
                </button>
              )
            }
          >
            {rows.length === 0 ? (
              <p className="py-2 text-[12px] italic text-ink-faint">
                {EVENT_HINTS[ev]}
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {rows.map((r) => (
                  <SlotRow
                    key={r.id}
                    item={r}
                    canEdit={canEdit}
                    onPatch={(p) => patch(r.id, p)}
                    onDelete={() => deleteItem(r.id)}
                  />
                ))}
              </ul>
            )}
          </PanelCard>
        );
      })}
    </div>
  );
}

function SlotRow({
  item,
  canEdit,
  onPatch,
  onDelete,
}: {
  item: WorkspaceItem;
  canEdit: boolean;
  onPatch: (p: Partial<SlotMeta>) => void;
  onDelete: () => void;
}) {
  const meta = (item.meta ?? {}) as SlotMeta;

  return (
    <li className="grid grid-cols-12 gap-2 py-3">
      <div className="col-span-12 md:col-span-4">
        <Eyebrow className="mb-1">Dessert</Eyebrow>
        <input
          value={meta.dessert ?? ""}
          onChange={(e) => onPatch({ dessert: e.target.value })}
          placeholder="Mithai station · Cake cutting · Kulfi cart"
          disabled={!canEdit}
          className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
      </div>
      <div className="col-span-6 md:col-span-2">
        <Eyebrow className="mb-1">Timing</Eyebrow>
        <input
          value={meta.time ?? ""}
          onChange={(e) => onPatch({ time: e.target.value })}
          placeholder="7:00 PM · Throughout"
          disabled={!canEdit}
          className={cn(
            "w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60",
            "font-mono",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Eyebrow className="mb-1">Managed by</Eyebrow>
        <input
          value={meta.managedBy ?? ""}
          onChange={(e) => onPatch({ managedBy: e.target.value })}
          placeholder="Caterer · Baker (6 PM drop)"
          disabled={!canEdit}
          className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Eyebrow className="mb-1">Cue / note</Eyebrow>
        <div className="flex items-center gap-2">
          <input
            value={meta.notes ?? ""}
            onChange={(e) => onPatch({ notes: e.target.value })}
            placeholder="Spotlight cue · replenish"
            disabled={!canEdit}
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
          {canEdit && (
            <button
              type="button"
              onClick={onDelete}
              className="text-ink-faint hover:text-rose"
              aria-label="Remove slot"
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
