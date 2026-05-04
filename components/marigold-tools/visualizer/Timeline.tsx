"use client";

// ──────────────────────────────────────────────────────────────────────────
// Timeline — multi-day generated visualization.
//
// Each day is a column of EventBlock cards. Within a day, events are
// drag-reorderable (anchored events like Ceremony / Vidaai stay locked).
// Reordering is a swap of position only — the scheduler picks the absolute
// time, but we re-stack adjacent events with the standard 2-hour buffer
// after a drag so the clock times stay sensible.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type {
  ScheduledEvent,
  TimelineDay,
  VisualizerOutput,
} from "@/types/visualizer";
import {
  formatClockTime,
  formatLabel,
  styleLabel,
} from "@/lib/tools/visualizer";

import { SortableEventBlock } from "./EventBlock";
import styles from "./Timeline.module.css";

type Props = {
  output: VisualizerOutput;
  onUpdateDay: (dayNumber: number, events: ScheduledEvent[]) => void;
};

type ViewMode = "compact" | "detailed";

export function Timeline({ output, onUpdateDay }: Props) {
  const [view, setView] = useState<ViewMode>("detailed");

  return (
    <div className={styles.wrap} data-pdf-target="visualizer-timeline">
      <div className={styles.legend}>
        <div className={styles.legendMeta}>
          <span className={styles.metaTag}>{formatLabel(output.format)}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaTag}>
            {styleLabel(output.weddingStyle)}
          </span>
        </div>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={[
              styles.viewBtn,
              view === "compact" ? styles.viewBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setView("compact")}
          >
            compact
          </button>
          <button
            type="button"
            className={[
              styles.viewBtn,
              view === "detailed" ? styles.viewBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setView("detailed")}
          >
            detailed
          </button>
        </div>
      </div>

      <div className={styles.days}>
        {output.days.map((day) => (
          <DayColumn
            key={day.dayNumber}
            day={day}
            view={view}
            onChange={(events) => onUpdateDay(day.dayNumber, events)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Day column ────────────────────────────────────────────────────────────

function DayColumn({
  day,
  view,
  onChange,
}: {
  day: TimelineDay;
  view: ViewMode;
  onChange: (events: ScheduledEvent[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.events.findIndex((e) => e.slug === active.id);
    const newIndex = day.events.findIndex((e) => e.slug === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    // Block movement of anchored events.
    if (!day.events[oldIndex].isMovable) return;
    const reordered = arrayMove(day.events, oldIndex, newIndex);
    onChange(restackTimes(reordered));
  };

  const dayStart = day.events[0];
  const dayEnd = day.events[day.events.length - 1];
  const dayWindow =
    day.events.length === 0
      ? "—"
      : `${formatClockTime(dayStart.startMinutes)} → ${formatClockTime(dayEnd.endMinutes)}`;

  return (
    <article className={styles.day}>
      <header className={styles.dayHeader}>
        <span className={styles.dayNumber}>Day {day.dayNumber}</span>
        <h3 className={styles.dayLabel}>{day.dayLabel.split(" — ")[1]}</h3>
        <span className={styles.dayWindow}>{dayWindow}</span>
      </header>

      {day.events.length === 0 ? (
        <div className={styles.emptyDay}>
          <span>no events scheduled this day</span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={day.events.map((e) => e.slug)}
            strategy={verticalListSortingStrategy}
          >
            <ol className={styles.eventList}>
              {day.events.map((event, idx) => (
                <SortableEventBlock
                  key={event.slug}
                  event={event}
                  view={view}
                  isLast={idx === day.events.length - 1}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </article>
  );
}

/**
 * After a drag swap, recompute clock times so the new sequence still
 * respects the 2-hour buffer rule. We anchor on the earliest start time in
 * the original day so we don't drift wildly.
 */
function restackTimes(events: ScheduledEvent[]): ScheduledEvent[] {
  if (events.length === 0) return events;
  const buffer = 120;
  const out: ScheduledEvent[] = [];
  let cursor = events[0].startMinutes;
  for (const e of events) {
    const duration = e.endMinutes - e.startMinutes;
    out.push({ ...e, startMinutes: cursor, endMinutes: cursor + duration });
    cursor += duration + buffer;
  }
  return out;
}
