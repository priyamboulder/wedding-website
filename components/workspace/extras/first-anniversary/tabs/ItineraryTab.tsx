"use client";

// ── Itinerary tab ─────────────────────────────────────────────────────────
// Day-by-day plan with Morning/Afternoon/Evening time blocks. One "Anniversary
// Moment" block per trip is rendered with saffron styling — the headline
// celebration separated from logistics. Items land here from Discover's
// "Add to itinerary" action; the tab also supports manual add/edit.

import {
  CalendarDays,
  Compass,
  Link2,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useFirstAnniversaryStore } from "@/stores/first-anniversary-store";
import type {
  ItineraryItem,
  TimeBlock,
} from "@/types/first-anniversary";
import { Section, TextArea, TextInput } from "../../bachelorette/ui";

const BLOCKS: { id: TimeBlock; label: string; icon: typeof Sun }[] = [
  { id: "morning", label: "Morning", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Sunset },
];

export function ItineraryTab() {
  const itinerary = useFirstAnniversaryStore((s) => s.itinerary);
  const addDay = useFirstAnniversaryStore((s) => s.addDay);

  const grouped = useMemo(() => {
    const byDay = new Map<number, ItineraryItem[]>();
    for (const item of itinerary) {
      const existing = byDay.get(item.dayNumber) ?? [];
      existing.push(item);
      byDay.set(item.dayNumber, existing);
    }
    return Array.from(byDay.entries()).sort(([a], [b]) => a - b);
  }, [itinerary]);

  if (itinerary.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      <HeaderCard onAddDay={addDay} dayCount={grouped.length} eventCount={itinerary.length} />
      <div className="space-y-4">
        {grouped.map(([dayNumber, items]) => (
          <DayCard key={dayNumber} dayNumber={dayNumber} items={items} />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Section
      eyebrow="YOUR PLAN"
      title="Your itinerary starts in Discover"
      description="Pick an experience or destination and we'll seed a day-by-day plan you can edit from here."
    >
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <div className="max-w-md">
          <Compass
            size={28}
            strokeWidth={1.3}
            className="mx-auto mb-3 text-ink-faint"
          />
          <p className="font-serif text-[17px] leading-snug text-ink">
            Browse ideas first
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            The Discover tab ranks the curated pool against your vibe — from
            there, one click drops a suggested day-by-day plan here.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function HeaderCard({
  onAddDay,
  dayCount,
  eventCount,
}: {
  onAddDay: () => void;
  dayCount: number;
  eventCount: number;
}) {
  return (
    <Section
      eyebrow="YOUR PLAN"
      title={`${dayCount} day${dayCount === 1 ? "" : "s"} · ${eventCount} activit${eventCount === 1 ? "y" : "ies"}`}
      description="Every block is editable. Mark the anniversary moment — the one block that is the celebration — and it'll stand out."
      right={
        <button
          type="button"
          onClick={onAddDay}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={2} /> Add day
        </button>
      }
    >
      <p className="text-[12.5px] text-ink-muted">
        Unlike a wedding, there's no hard schedule here — these blocks are
        gentle anchors. Leave the middle loose on purpose.
      </p>
    </Section>
  );
}

// ── Day + block rendering ─────────────────────────────────────────────────

function DayCard({
  dayNumber,
  items,
}: {
  dayNumber: number;
  items: ItineraryItem[];
}) {
  const addItem = useFirstAnniversaryStore((s) => s.addItineraryItem);

  return (
    <section className="rounded-lg border border-border bg-white">
      <header className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
        <CalendarDays
          size={16}
          strokeWidth={1.6}
          className="shrink-0 text-ink-faint"
        />
        <h4 className="font-serif text-[17px] leading-tight text-ink">
          Day {dayNumber}
        </h4>
      </header>

      <div className="divide-y divide-border/40">
        {BLOCKS.map((block) => {
          const blockItems = items
            .filter((i) => i.timeBlock === block.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <TimeBlockRow
              key={block.id}
              block={block}
              items={blockItems}
              onAdd={() =>
                addItem({
                  dayNumber,
                  timeBlock: block.id,
                  sortOrder: blockItems.length,
                  activity: "",
                })
              }
            />
          );
        })}
      </div>
    </section>
  );
}

function TimeBlockRow({
  block,
  items,
  onAdd,
}: {
  block: { id: TimeBlock; label: string; icon: typeof Sun };
  items: ItineraryItem[];
  onAdd: () => void;
}) {
  const Icon = block.icon;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 px-5 py-3">
      <div className="flex items-start gap-2 pt-2">
        <Icon size={14} strokeWidth={1.6} className="text-ink-faint" />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {block.label}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-saffron hover:underline"
          >
            <Plus size={12} strokeWidth={2} /> Add {block.label.toLowerCase()}
          </button>
        ) : (
          <>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-faint hover:text-saffron"
            >
              <Plus size={10} strokeWidth={2} /> Another
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: ItineraryItem }) {
  const updateItem = useFirstAnniversaryStore((s) => s.updateItineraryItem);
  const removeItem = useFirstAnniversaryStore((s) => s.removeItineraryItem);

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-3 transition-colors",
        item.isMainEvent
          ? "border-saffron/50 bg-saffron-pale/30"
          : "border-border bg-white",
      )}
    >
      {item.isMainEvent && (
        <p
          className="mb-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={2} />
          The anniversary moment
        </p>
      )}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <TextInput
            value={item.activity}
            onChange={(v) => updateItem(item.id, { activity: v })}
            placeholder="What are you doing?"
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <TextInput
              value={item.location ?? ""}
              onChange={(v) =>
                updateItem(item.id, { location: v || undefined })
              }
              placeholder="Location"
            />
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-ink-faint">$</span>
              <input
                type="number"
                value={
                  item.estimatedCostCents === undefined
                    ? ""
                    : item.estimatedCostCents / 100
                }
                onChange={(e) => {
                  const v = e.target.value;
                  updateItem(item.id, {
                    estimatedCostCents:
                      v === ""
                        ? undefined
                        : Math.max(0, Math.round(Number(v) * 100)),
                  });
                }}
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
                placeholder="Cost (optional)"
                aria-label={`${item.activity || "Activity"} cost`}
              />
            </div>
          </div>
          {item.notes !== undefined && item.notes !== "" ? (
            <TextArea
              value={item.notes}
              onChange={(v) =>
                updateItem(item.id, { notes: v || undefined })
              }
              placeholder="Notes"
              rows={2}
            />
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-ink-muted">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={!!item.isMainEvent}
                onChange={(e) =>
                  updateItem(item.id, {
                    isMainEvent: e.target.checked || undefined,
                  })
                }
                className="accent-saffron"
              />
              Anniversary moment
            </label>
            {item.notes === undefined && (
              <button
                type="button"
                onClick={() => updateItem(item.id, { notes: "" })}
                className="font-medium hover:text-ink"
              >
                + Notes
              </button>
            )}
            {item.bookingUrl === undefined ? (
              <button
                type="button"
                onClick={() => updateItem(item.id, { bookingUrl: "" })}
                className="font-medium hover:text-ink"
              >
                + Booking link
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <Link2 size={11} strokeWidth={1.8} />
                <TextInput
                  value={item.bookingUrl}
                  onChange={(v) =>
                    updateItem(item.id, {
                      bookingUrl: v === "" ? undefined : v,
                    })
                  }
                  placeholder="https://…"
                  className="max-w-[260px] text-[11.5px]"
                />
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="Remove item"
          onClick={() => removeItem(item.id)}
          className="shrink-0 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
