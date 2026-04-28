"use client";

// ── Itinerary tab ─────────────────────────────────────────────────────────
// Run-of-show for a single-event shower. Blocks have types — standard,
// highlight (the main ceremony/activity), optional, and behind-the-scenes
// (host-only, shown in a separate section). Reorder is sort-based for
// simplicity — drag-and-drop can come later.

import { Plus, Star, Trash2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import type {
  BabyShowerBlockType,
  BabyShowerItineraryItem,
} from "@/types/baby-shower";
import { Section, TextInput } from "../../bachelorette/ui";

const BLOCK_OPTIONS: { value: BabyShowerBlockType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "highlight", label: "★ Highlight" },
  { value: "optional", label: "Optional" },
  { value: "behind_the_scenes", label: "Behind the scenes" },
];

export function ItineraryTab() {
  const itinerary = useBabyShowerStore((s) => s.itinerary);
  const addItem = useBabyShowerStore((s) => s.addItineraryItem);
  const updateItem = useBabyShowerStore((s) => s.updateItineraryItem);
  const removeItem = useBabyShowerStore((s) => s.removeItineraryItem);
  const plan = useBabyShowerStore((s) => s.plan);

  const visible = itinerary
    .filter((it) => it.blockType !== "behind_the_scenes")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const behindScenes = itinerary
    .filter((it) => it.blockType === "behind_the_scenes")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (itinerary.length === 0) {
    return <EmptyState />;
  }

  const totalMinutes = visible.reduce((s, it) => s + it.durationMinutes, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SHOWER FLOW
        </p>
        <h2 className="font-serif text-[22px] leading-tight text-ink">
          {plan.showerDate || "Your run of show"}
        </h2>
        <p className="text-[13px] text-ink-muted">
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m of programming
          across {visible.length} blocks.
        </p>
      </header>

      <Section
        eyebrow="GUEST-FACING FLOW"
        title="Arrival → farewell"
        description="Drag order is driven by sort — use the + at the bottom to append, edit start times inline."
        right={
          <button
            type="button"
            onClick={() =>
              addItem({
                dayNumber: 1,
                startTime: "",
                durationMinutes: 30,
                activityName: "New block",
                description: "",
                blockType: "standard",
                sortOrder: (visible[visible.length - 1]?.sortOrder ?? 0) + 1,
                sourceRecId: null,
              })
            }
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
          >
            <Plus size={12} strokeWidth={2} />
            Add block
          </button>
        }
      >
        <ol className="space-y-2">
          {visible.map((item) => (
            <ItineraryBlock
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </ol>
      </Section>

      {behindScenes.length > 0 && (
        <Section
          eyebrow="HOST-ONLY"
          title="Behind the scenes"
          description="Setup, prep, teardown. Not shown on the guest-facing flow."
          tone="muted"
        >
          <ol className="space-y-2">
            {behindScenes.map((item) => (
              <ItineraryBlock
                key={item.id}
                item={item}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

// ── Block ─────────────────────────────────────────────────────────────────

function ItineraryBlock({
  item,
  onUpdate,
  onRemove,
}: {
  item: BabyShowerItineraryItem;
  onUpdate: (patch: Partial<BabyShowerItineraryItem>) => void;
  onRemove: () => void;
}) {
  const isHighlight = item.blockType === "highlight";
  const isOptional = item.blockType === "optional";
  const isBehind = item.blockType === "behind_the_scenes";

  return (
    <li
      className={cn(
        "grid grid-cols-[80px_1fr_auto] gap-3 rounded-md border p-3 transition-colors",
        isHighlight
          ? "border-gold/50 bg-gold-pale/25"
          : isOptional
            ? "border-border/60 bg-ivory-warm/40"
            : isBehind
              ? "border-border/60 bg-white"
              : "border-border bg-white",
      )}
    >
      <div className="flex flex-col gap-1">
        <TextInput
          value={item.startTime}
          onChange={(v) => onUpdate({ startTime: v })}
          placeholder="11:00"
        />
        <div className="flex items-center gap-1 text-[11.5px] text-ink-faint">
          <input
            type="number"
            value={item.durationMinutes}
            onChange={(e) =>
              onUpdate({
                durationMinutes: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-12 rounded-md border border-border bg-white px-1.5 py-0.5 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
          />
          <span>min</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            value={item.activityName}
            onChange={(e) => onUpdate({ activityName: e.target.value })}
            className="flex-1 border-none bg-transparent p-0 font-serif text-[16px] leading-tight text-ink focus:outline-none focus:ring-0"
            placeholder="Block name"
          />
          {isHighlight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-pale/60 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold">
              <Star size={9} strokeWidth={1.8} fill="currentColor" />
              Highlight
            </span>
          )}
          {isBehind && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
              <EyeOff size={9} strokeWidth={1.8} />
              Host only
            </span>
          )}
        </div>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="What happens in this block?"
          rows={1}
          className="w-full resize-y border-none bg-transparent p-0 text-[12.5px] leading-snug text-ink-muted focus:outline-none focus:ring-0"
        />
        <select
          value={item.blockType}
          onChange={(e) =>
            onUpdate({ blockType: e.target.value as BabyShowerBlockType })
          }
          className="mt-1 self-start rounded-md border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink-muted focus:border-saffron/60 focus:outline-none"
        >
          {BLOCK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove block"
        className="self-start text-ink-faint hover:text-rose"
      >
        <Trash2 size={13} strokeWidth={1.6} />
      </button>
    </li>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  const addItem = useBabyShowerStore((s) => s.addItineraryItem);
  return (
    <section className="rounded-lg border border-dashed border-border bg-ivory-warm/30 p-10 text-center">
      <p className="font-serif text-[20px] leading-tight text-ink">
        Your shower flow starts in Discover.
      </p>
      <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-muted">
        Pick a theme or activity, and we'll help you build the timeline. Or
        start fresh with a blank block.
      </p>
      <button
        type="button"
        onClick={() =>
          addItem({
            dayNumber: 1,
            startTime: "11:00",
            durationMinutes: 30,
            activityName: "Guests arrive",
            description: "",
            blockType: "standard",
            sortOrder: 0,
            sourceRecId: null,
          })
        }
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} />
        Add a block
      </button>
    </section>
  );
}
