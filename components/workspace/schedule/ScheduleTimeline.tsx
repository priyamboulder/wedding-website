"use client";

// ── ScheduleTimeline ───────────────────────────────────────────────────────
// Compact vertical timeline for a single event. Each row is a single-line
// summary (see TimelineRow). Clicking a row opens the slide-over detail
// drawer (TimelineDetailDrawer) where every field is editable inline.
//
// Mutations flow through the data access layer so dependency cascades resolve
// on every change. Drag-to-reorder is handled here; the row renders the grip.

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScheduleConflict,
  ScheduleItem,
} from "@/types/schedule";
import {
  getScheduleForEvent,
  replaceScheduleForEvent,
  saveScheduleItem,
  deleteScheduleItem,
  hhmmToMinutes,
  minutesToHhmm,
} from "@/lib/schedule/data";
import { resolveTimelineTimes } from "@/lib/schedule/resolver";
import { conflictsForItem } from "@/lib/schedule/conflicts";
import { TimelineRow } from "./TimelineRow";
import { TimelineDetailDrawer } from "./TimelineDetailDrawer";

interface Props {
  eventId: string;
  items: ScheduleItem[];
  conflicts: ScheduleConflict[];
  onChange: () => void;
  focusedItemId?: string | null;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ScheduleTimeline({
  eventId,
  items,
  conflicts,
  onChange,
  focusedItemId,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemRefs = useRef(new Map<string, HTMLDivElement | null>());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    // Defensive dedupe by id — a stale localStorage rehydrate from a
    // pre-v2 build could leave duplicate ids in `items`, which would make
    // React keys collide.
    const seen = new Set<string>();
    const unique: ScheduleItem[] = [];
    for (const item of items) {
      if (!item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      unique.push(item);
    }
    return unique.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items]);

  const selectedItem = useMemo(
    () => sorted.find((i) => i.id === selectedId) ?? null,
    [sorted, selectedId],
  );

  // Auto-scroll to focused item (invoked from the conflict panel's Jump
  // affordance). Runs on the plain DOM via the ref map.
  if (focusedItemId) {
    const el = itemRefs.current.get(focusedItemId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const fromIndex = sorted.findIndex((i) => i.id === active.id);
    const toIndex = sorted.findIndex((i) => i.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = sorted.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const reordered = next.map((i, idx) => ({ ...i, sortOrder: idx }));
    const resolved = resolveTimelineTimes(reordered);
    replaceScheduleForEvent(eventId, resolved);
    onChange();
  }

  function patchItem(id: string, patch: Partial<ScheduleItem>) {
    const current = getScheduleForEvent(eventId);
    const updated = current.map((i) =>
      i.id === id ? { ...i, ...patch } : i,
    );
    const resolved = resolveTimelineTimes(updated);
    replaceScheduleForEvent(eventId, resolved);
    onChange();
  }

  function handleDelete(id: string) {
    deleteScheduleItem(id);
    const remaining = getScheduleForEvent(eventId).map((i) =>
      i.dependency?.referenceId === id
        ? { ...i, dependency: null }
        : i,
    );
    const resolved = resolveTimelineTimes(remaining);
    replaceScheduleForEvent(eventId, resolved);
    if (selectedId === id) setSelectedId(null);
    onChange();
  }

  function handleDuplicate(item: ScheduleItem) {
    const copy: ScheduleItem = {
      ...item,
      id: uid(),
      label: `${item.label} (copy)`,
      dependency: {
        type: "after",
        referenceId: item.id,
        gapMinutes: 0,
        isHard: false,
      },
      isFixed: false,
      sortOrder: item.sortOrder + 0.5,
      isAiDraft: false,
    };
    saveScheduleItem(copy);
    const all = getScheduleForEvent(eventId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i, idx) => ({ ...i, sortOrder: idx }));
    const resolved = resolveTimelineTimes(all);
    replaceScheduleForEvent(eventId, resolved);
    onChange();
    setSelectedId(copy.id);
  }

  function handleInsertAfter(afterItem: ScheduleItem | undefined) {
    const current = getScheduleForEvent(eventId);
    const fallbackAnchor = current[0]?.startTime ?? "12:00";
    const startTime = afterItem
      ? minutesToHhmm(hhmmToMinutes(afterItem.endTime) + 0)
      : fallbackAnchor;
    const newItem: ScheduleItem = {
      id: uid(),
      eventId,
      label: "New item",
      description: null,
      startTime,
      durationMinutes: 15,
      endTime: minutesToHhmm(hhmmToMinutes(startTime) + 15),
      category: afterItem?.category ?? "custom",
      isFixed: false,
      dependency: afterItem
        ? {
            type: "after",
            referenceId: afterItem.id,
            gapMinutes: 0,
            isHard: false,
          }
        : null,
      assignedTo: [],
      vendorIds: [],
      track: afterItem?.track ?? "main",
      location: null,
      notesForVendor: null,
      internalNotes: null,
      sortOrder: (afterItem?.sortOrder ?? -1) + 0.5,
      color: null,
      isPhotoMoment: false,
      musicCue: null,
      status: "draft",
      actualStartTime: null,
      actualEndTime: null,
    };

    saveScheduleItem(newItem);

    const all = getScheduleForEvent(eventId).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const normalised = all.map((i, idx) => ({ ...i, sortOrder: idx }));
    const resolved = resolveTimelineTimes(normalised);
    replaceScheduleForEvent(eventId, resolved);
    onChange();
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            <AddBetween onClick={() => handleInsertAfter(undefined)} first />
            {sorted.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current.set(item.id, el);
                }}
                className="scroll-mt-24"
              >
                <TimelineRow
                  item={item}
                  conflicts={conflictsForItem(conflicts, item.id)}
                  onOpen={() => setSelectedId(item.id)}
                  onQuickDelete={() => handleDelete(item.id)}
                />
                {idx < sorted.length - 1 && (
                  <AddBetween onClick={() => handleInsertAfter(item)} />
                )}
              </div>
            ))}
            {sorted.length > 0 && (
              <AddBetween
                onClick={() => handleInsertAfter(sorted[sorted.length - 1])}
                last
              />
            )}
          </div>
        </SortableContext>
      </DndContext>

      <TimelineDetailDrawer
        item={selectedItem}
        allItems={sorted}
        onClose={() => setSelectedId(null)}
        onPatch={(patch) => {
          if (selectedItem) patchItem(selectedItem.id, patch);
        }}
        onDelete={() => {
          if (selectedItem) handleDelete(selectedItem.id);
        }}
        onDuplicate={() => {
          if (selectedItem) handleDuplicate(selectedItem);
        }}
      />
    </>
  );
}

function AddBetween({
  onClick,
  first,
  last,
}: {
  onClick: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-center gap-1.5",
        "h-5 rounded text-ink-faint transition-all",
        "hover:bg-ivory-warm/60 hover:text-ink-muted",
        first && "mt-0",
        last && "mb-0",
      )}
    >
      <span className="h-px flex-1 bg-border opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.14em] opacity-0 transition-opacity group-hover:opacity-100">
        <Plus size={10} strokeWidth={1.8} />
        Add
      </span>
      <span className="h-px flex-1 bg-border opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

// Empty-state shell invoked from the canvas when an event has no schedule
// rows yet. Kept in this file so timeline-specific copy stays colocated.
export function TimelineEmptyState({
  eventLabel,
  onDraft,
  onStartBlank,
}: {
  eventLabel: string;
  onDraft: () => void;
  onStartBlank: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-xl rounded-xl border border-border bg-white px-10 py-12 text-center">
        <p className="section-eyebrow">
          YOUR {eventLabel.toUpperCase()} TIMELINE
        </p>
        <h2 className="section-title mt-2">
          Every moment matters — let's map it out.
        </h2>
        <p className="section-description mx-auto mt-3">
          A minute-by-minute plan so your vendors, your family, and your
          coordinator know exactly what's happening and when. We'll draft
          it from wedding traditions, then you adjust whatever doesn't
          feel like you.
        </p>
        <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onDraft}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Sparkles size={14} strokeWidth={1.6} />
            Draft with AI
          </button>
          <button
            type="button"
            onClick={onStartBlank}
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-2.5 text-[13px] font-medium text-ink-muted hover:border-ink-faint hover:text-ink"
          >
            Start from scratch
          </button>
        </div>
      </div>
    </div>
  );
}
