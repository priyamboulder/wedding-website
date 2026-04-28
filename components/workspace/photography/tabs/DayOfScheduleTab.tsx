"use client";

// ── Day-of Schedule tab ───────────────────────────────────────────────────
// Photographer-specific timeline: arrival times, golden hour windows, venue
// locations, lighting, and any coverage gaps or travel between venues.
// Ordered by event (Haldi → Reception) using the canonical photography
// event axis.

import { useMemo } from "react";
import {
  Clock,
  MapPin,
  Plus,
  Sun,
  SunMoon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import {
  LIGHTING_LABEL,
  PHOTO_EVENTS,
  type LightingCondition,
  type PhotoDayOfSlot,
  type PhotoEventId,
} from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const EVENT_SORT: Record<PhotoEventId, number> = {
  haldi: 1,
  mehendi: 2,
  sangeet: 3,
  baraat: 4,
  wedding: 5,
  reception: 6,
  general: 99,
};

export function DayOfScheduleTab({ category }: { category: WorkspaceCategory }) {
  const allSlots = usePhotographyStore((s) => s.day_of);
  const addDayOf = usePhotographyStore((s) => s.addDayOf);

  const slots = useMemo(
    () =>
      allSlots
        .filter((s) => s.category_id === category.id)
        .sort((a, b) => {
          const ea = EVENT_SORT[a.event] ?? 99;
          const eb = EVENT_SORT[b.event] ?? 99;
          if (ea !== eb) return ea - eb;
          return a.sort_order - b.sort_order;
        }),
    [allSlots, category.id],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Day-of logistics
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            Arrival, light, and location — per event
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            The photographer's working timeline. Arrival times are yours to
            set; golden-hour windows are yours to protect. Flag coverage
            gaps so they're not surprised mid-event.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            addDayOf({
              category_id: category.id,
              event: "general",
              arrival_time: "",
              location: "",
              lighting: "mixed",
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add slot
        </button>
      </div>

      {slots.length === 0 ? (
        <EmptyRow>
          No slots yet. Add one to start briefing the photographer on arrival
          and locations.
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {slots.map((s) => (
            <li key={s.id}>
              <SlotCard slot={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Slot card ────────────────────────────────────────────────────────────

function SlotCard({ slot }: { slot: PhotoDayOfSlot }) {
  const updateDayOf = usePhotographyStore((s) => s.updateDayOf);
  const deleteDayOf = usePhotographyStore((s) => s.deleteDayOf);
  const addDayOf = usePhotographyStore((s) => s.addDayOf);

  const label = PHOTO_EVENTS.find((e) => e.id === slot.event)?.label ?? slot.event;

  function handleDelete() {
    const snap: PhotoDayOfSlot = { ...slot };
    deleteDayOf(slot.id);
    pushUndo({
      message: `Removed ${label} slot`,
      undo: () =>
        addDayOf({
          category_id: snap.category_id,
          event: snap.event,
          arrival_time: snap.arrival_time,
          location: snap.location,
          lighting: snap.lighting,
          golden_hour: snap.golden_hour,
          coverage_gap: snap.coverage_gap,
          travel_time: snap.travel_time,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <HoverRow className="items-start gap-3">
        <HoverRow.Main>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={slot.event}
              onChange={(e) =>
                updateDayOf(slot.id, {
                  event: e.target.value as PhotoEventId,
                })
              }
              className="rounded-sm border border-border bg-white px-2 py-1 font-serif text-[15px] text-ink focus:border-saffron focus:outline-none"
            >
              {PHOTO_EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
            <LightingToggle
              value={slot.lighting}
              onChange={(v) => updateDayOf(slot.id, { lighting: v })}
            />
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete slot" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Row
          icon={<Clock size={11} strokeWidth={1.8} />}
          label="Arrival time"
          value={slot.arrival_time}
          placeholder="e.g. 4:00 AM"
          onSave={(v) => updateDayOf(slot.id, { arrival_time: v })}
        />
        <Row
          icon={<MapPin size={11} strokeWidth={1.8} />}
          label="Location"
          value={slot.location}
          placeholder="Getting ready room · mandap · venue"
          onSave={(v) => updateDayOf(slot.id, { location: v })}
        />
        <Row
          icon={<Sun size={11} strokeWidth={1.8} />}
          label="Golden hour"
          value={slot.golden_hour ?? ""}
          placeholder="e.g. Sunrise 6:12 AM"
          onSave={(v) => updateDayOf(slot.id, { golden_hour: v })}
          allowEmpty
        />
        <Row
          icon={<SunMoon size={11} strokeWidth={1.8} />}
          label="Travel time"
          value={slot.travel_time ?? ""}
          placeholder="e.g. 45 min to Taj Palace"
          onSave={(v) => updateDayOf(slot.id, { travel_time: v })}
          allowEmpty
        />
      </div>

      {/* Coverage-gap callout */}
      <div className="mt-4 rounded-sm border border-dashed border-amber-400/60 bg-amber-50/50 p-3">
        <div className="mb-1 flex items-center gap-1 text-amber-700">
          <Eyebrow className="!text-[10px] text-amber-700">Coverage gap</Eyebrow>
        </div>
        <InlineText
          value={slot.coverage_gap ?? ""}
          onSave={(v) => updateDayOf(slot.id, { coverage_gap: v })}
          variant="block"
          placeholder="Flag any break in coverage (lunch, travel, family-only moments)…"
          emptyLabel="No gap noted — click to add one."
          allowEmpty
          className="!p-0 text-[12.5px] leading-relaxed text-ink"
        />
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  placeholder,
  onSave,
  allowEmpty = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="rounded-sm bg-ivory/40 p-3">
      <div className="mb-1 flex items-center gap-1 text-ink-muted">
        <span className="text-saffron">{icon}</span>
        <Eyebrow className="!text-[10px]">{label}</Eyebrow>
      </div>
      <InlineText
        value={value}
        onSave={onSave}
        placeholder={placeholder}
        emptyLabel={allowEmpty ? "—" : placeholder}
        allowEmpty={allowEmpty}
        className="!p-0 text-[12.5px] text-ink"
      />
    </div>
  );
}

function LightingToggle({
  value,
  onChange,
}: {
  value: LightingCondition;
  onChange: (v: LightingCondition) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {(["indoor", "outdoor", "mixed"] as LightingCondition[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
            value === l
              ? "border-saffron bg-saffron-pale/40 text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {LIGHTING_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
