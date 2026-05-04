"use client";

// ──────────────────────────────────────────────────────────────────────────
// EventBlock — a single time-block card on the timeline.
//
// Two modes:
//   - compact: name, time, duration only
//   - detailed: + logistics note + guest subset
//
// Tapping the block toggles an expanded panel with the long-form description
// (the "what actually happens" copy). Anchored events (Ceremony, Vidaai)
// render the same but skip the drag handle.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { ScheduledEvent } from "@/types/visualizer";
import {
  formatClockTime,
  formatDurationLabel,
  guestSubsetLabel,
} from "@/lib/tools/visualizer";

import styles from "./EventBlock.module.css";

type Props = {
  event: ScheduledEvent;
  view: "compact" | "detailed";
  isLast: boolean;
};

export function SortableEventBlock({ event, view, isLast }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: event.slug,
    disabled: !event.isMovable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [expanded, setExpanded] = useState(false);

  const className = [
    styles.block,
    isDragging ? styles.blockDragging : "",
    !event.isMovable ? styles.blockAnchored : "",
    expanded ? styles.blockExpanded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={setNodeRef} style={style} className={styles.row}>
      <div className={styles.timeRail}>
        <span className={styles.startTime}>
          {formatClockTime(event.startMinutes)}
        </span>
        <span className={styles.endTime}>
          {formatClockTime(event.endMinutes)}
        </span>
        {!isLast && <span className={styles.connector} aria-hidden />}
      </div>

      <button
        type="button"
        className={className}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className={styles.blockHead}>
          <span className={styles.icon} aria-hidden>
            {event.icon}
          </span>
          <div className={styles.headText}>
            <span className={styles.name}>{event.name}</span>
            <span className={styles.duration}>
              {formatDurationLabel(event.durationHours)}
              {!event.isMovable && (
                <span className={styles.lockedTag}>locked</span>
              )}
            </span>
          </div>
          {event.isMovable && (
            <span
              className={styles.dragHandle}
              {...attributes}
              {...listeners}
              role="button"
              aria-label={`Drag ${event.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              ⋮⋮
            </span>
          )}
        </div>

        {view === "detailed" && (
          <div className={styles.note}>
            <span className={styles.noteIcon} aria-hidden>
              ✎
            </span>
            <span>{event.logisticsNote}</span>
          </div>
        )}

        <div className={styles.metaRow}>
          <span className={styles.guestSubset}>
            {guestSubsetLabel(event.guestSubset)}
          </span>
        </div>

        {expanded && (
          <p className={styles.description}>
            <span className={styles.descLabel}>what actually happens</span>
            {event.description}
          </p>
        )}
      </button>
    </li>
  );
}
