"use client";

// ── TimelineRow ────────────────────────────────────────────────────────────
// Compact single-row representation of a schedule item. Collapsed by
// default — click anywhere on the row to open the slide-over drawer for
// inline editing. No error text is rendered in the card itself; conflicts
// surface as a small coloured dot on the left rail (feeding the
// ConflictPanel at the top of the timeline).
//
// Drag behaviour: the grip handle on the left is the only drag surface, so
// the row itself remains clickable. Fixed items skip the drag listeners.

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Camera,
  GripVertical,
  Lock,
  MapPin,
  Music,
  MoreVertical,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScheduleConflict,
  ScheduleItem,
} from "@/types/schedule";
import { SCHEDULE_CATEGORY_META } from "./scheduleCategoryMeta";
import { formatTime12h } from "@/lib/schedule/data";
import { resolveVendorTags } from "@/lib/schedule/data";

interface Props {
  item: ScheduleItem;
  conflicts: ScheduleConflict[];
  onOpen: () => void;
  onQuickDelete: () => void;
}

export function TimelineRow({ item, conflicts, onOpen, onQuickDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: item.isFixed });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = SCHEDULE_CATEGORY_META[item.category];
  const hasHardConflict = conflicts.some((c) => c.severity === "hard");
  const hasSoftConflict = conflicts.some((c) => c.severity === "soft");
  const vendorTags = resolveVendorTags(item);
  const isCompleted = item.status === "completed";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-stretch gap-3 rounded-md border bg-white px-3 py-2 transition-colors",
        hasHardConflict
          ? "border-rose/40"
          : hasSoftConflict
            ? "border-gold/30"
            : "border-border hover:border-ink-faint/50",
        isDragging && "shadow-[0_12px_28px_-18px_rgba(26,26,26,0.3)]",
        isCompleted && "opacity-60",
      )}
    >
      {/* Left rail: category colour + drag handle + conflict dot */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Drag to reorder"
          disabled={item.isFixed}
          className={cn(
            "flex h-6 w-4 items-center justify-center text-ink-faint",
            "opacity-0 transition-opacity group-hover:opacity-100",
            item.isFixed && "cursor-not-allowed",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={13} strokeWidth={1.6} />
        </button>
        <span
          aria-hidden
          className={cn("h-full w-[3px] rounded-full", meta.accentClass)}
        />
        {(hasHardConflict || hasSoftConflict) && (
          <span
            aria-hidden
            title={hasHardConflict ? "Hard conflict" : "Suggestion"}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              hasHardConflict ? "bg-rose" : "bg-gold",
            )}
          />
        )}
      </div>

      {/* Main clickable body */}
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {/* Time column — fixed width, tabular numerals so rows align */}
        <span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-ink">
          {formatTime12h(item.startTime)}
        </span>

        {/* Title + optional meta row */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-[13.5px] font-medium text-ink",
                isCompleted && "line-through",
              )}
            >
              {item.label}
            </span>
            {item.isFixed && (
              <Lock
                size={10}
                strokeWidth={1.8}
                className="shrink-0 text-ink-faint"
              />
            )}
            {item.isPhotoMoment && (
              <Camera
                size={11}
                strokeWidth={1.6}
                className="shrink-0 text-teal"
              />
            )}
            {item.musicCue && (
              <Music
                size={11}
                strokeWidth={1.6}
                className="shrink-0 text-rose"
              />
            )}
          </div>
          {(item.location || vendorTags.length > 0) && (
            <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-muted">
              {item.location && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin size={10} strokeWidth={1.6} />
                  <span className="truncate">{item.location}</span>
                </span>
              )}
              {vendorTags.length > 0 && (
                <span className="inline-flex items-center gap-1 truncate">
                  <Users size={10} strokeWidth={1.6} />
                  <span className="truncate">
                    {vendorTags.map((t) => t.name).join(" · ")}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Duration + category pill, right-aligned */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-ivory-warm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">
            {formatDuration(item.durationMinutes)}
          </span>
          <span
            className={cn(
              "hidden rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] sm:inline-block",
              meta.pillClass,
            )}
          >
            {meta.label}
          </span>
        </div>
      </button>

      {/* Overflow menu */}
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          aria-label="More options"
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint opacity-0 transition-opacity hover:bg-ivory-warm hover:text-ink group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${item.label}"?`)) {
              onQuickDelete();
            }
          }}
        >
          <MoreVertical size={13} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
