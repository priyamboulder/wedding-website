"use client";

// ── TimelineDetailDrawer ───────────────────────────────────────────────────
// Right-side slide-over with the full detail and inline editing for a single
// schedule item. Every field is click-to-edit; writes flow through props so
// the caller can re-resolve dependencies on each change.
//
// The drawer is a controlled component — the parent owns the selected item
// id and provides the handlers. We render nothing when `item` is null.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  Copy,
  Lock,
  MapPin,
  Music,
  StickyNote,
  Trash2,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScheduleCategory,
  ScheduleItem,
  ScheduleTrack,
} from "@/types/schedule";
import { SCHEDULE_CATEGORY_META } from "./scheduleCategoryMeta";
import { formatTime12h, resolveVendorTags } from "@/lib/schedule/data";
import { useVendorsStore } from "@/stores/vendors-store";
import { VendorTagPicker } from "./VendorTagPicker";

interface Props {
  item: ScheduleItem | null;
  allItems: ScheduleItem[];
  onClose: () => void;
  onPatch: (patch: Partial<ScheduleItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const CATEGORY_OPTIONS: ScheduleCategory[] = [
  "getting_ready",
  "logistics",
  "cultural",
  "ceremony",
  "transitions",
  "cocktail",
  "food",
  "entertainment",
  "reception",
  "photography",
  "custom",
];

const TRACK_LABEL: Record<ScheduleTrack, string> = {
  main: "Main",
  bride: "Bride",
  groom: "Groom",
  vendor_setup: "Vendor setup",
  custom: "Custom",
};

export function TimelineDetailDrawer({
  item,
  allItems,
  onClose,
  onPatch,
  onDelete,
  onDuplicate,
}: Props) {
  const vendors = useVendorsStore((s) => s.vendors);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const reference = useMemo(() => {
    if (!item?.dependency?.referenceId) return null;
    return allItems.find((i) => i.id === item.dependency?.referenceId) ?? null;
  }, [item, allItems]);

  const follower = useMemo(() => {
    if (!item) return null;
    return allItems.find(
      (i) => i.dependency?.referenceId === item.id,
    ) ?? null;
  }, [item, allItems]);

  if (!item) return null;

  const meta = SCHEDULE_CATEGORY_META[item.category];
  const vendorTags = resolveVendorTags(item);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/10 backdrop-blur-[1px]"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${item.label}`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-white shadow-[-8px_0_40px_-20px_rgba(26,26,26,0.2)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <InlineText
              value={item.label}
              placeholder="Untitled item"
              onChange={(v) => onPatch({ label: v })}
              className="text-[16px] font-semibold leading-tight text-ink"
            />
            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  meta.accentClass,
                )}
              />
              {meta.label}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* TIME */}
          <Section label="Time">
            <div className="flex items-center gap-3">
              <TimeField
                value={item.startTime}
                onChange={(v) =>
                  onPatch({ startTime: v, isFixed: true, isAiDraft: false })
                }
              />
              <span className="text-ink-faint">–</span>
              <span className="font-mono text-[13px] tabular-nums text-ink-muted">
                {formatTime12h(item.endTime)}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <DurationField
                  value={item.durationMinutes}
                  onChange={(v) =>
                    onPatch({ durationMinutes: v, isAiDraft: false })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    onPatch({ isFixed: !item.isFixed, isAiDraft: false })
                  }
                  aria-label={item.isFixed ? "Unlock start time" : "Lock start time"}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border",
                    item.isFixed
                      ? "border-gold/40 bg-gold-pale/50 text-ink"
                      : "border-border text-ink-muted hover:border-ink-faint hover:text-ink",
                  )}
                >
                  {item.isFixed ? (
                    <Lock size={12} strokeWidth={1.6} />
                  ) : (
                    <Unlock size={12} strokeWidth={1.6} />
                  )}
                </button>
              </div>
            </div>
          </Section>

          {/* LOCATION */}
          <Section label="Location" icon={<MapPin size={12} strokeWidth={1.6} />}>
            <InlineText
              value={item.location ?? ""}
              placeholder="Add location"
              onChange={(v) =>
                onPatch({ location: v.length > 0 ? v : null, isAiDraft: false })
              }
              className="text-[13px] text-ink"
            />
          </Section>

          {/* CATEGORY + TRACK */}
          <Section label="Category">
            <div className="flex items-center gap-2">
              <SelectField
                value={item.category}
                options={CATEGORY_OPTIONS.map((c) => ({
                  value: c,
                  label: SCHEDULE_CATEGORY_META[c].label,
                }))}
                onChange={(v) =>
                  onPatch({
                    category: v as ScheduleCategory,
                    isAiDraft: false,
                  })
                }
              />
              <SelectField
                value={item.track}
                options={Object.entries(TRACK_LABEL).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
                onChange={(v) =>
                  onPatch({ track: v as ScheduleTrack, isAiDraft: false })
                }
              />
            </div>
          </Section>

          {/* DESCRIPTION */}
          <Section label="Description">
            <InlineTextarea
              value={item.description ?? ""}
              placeholder="Notes, prep steps, coordination tips…"
              onChange={(v) =>
                onPatch({
                  description: v.length > 0 ? v : null,
                  isAiDraft: false,
                })
              }
            />
          </Section>

          {/* VENDORS */}
          <Section label="Vendors" icon={<Users size={12} strokeWidth={1.6} />}>
            <div className="space-y-2">
              {vendorTags.length === 0 ? (
                <p className="text-[12px] italic text-ink-faint">
                  No vendors assigned yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {vendorTags.map((tag) => (
                    <li
                      key={tag.key}
                      className="flex items-center justify-between rounded-md border border-border bg-ivory-warm/40 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium text-ink">
                          {tag.name}
                        </p>
                        {tag.category && (
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
                            {tag.category.replace(/_/g, " ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${tag.name}`}
                        className="ml-2 flex h-5 w-5 items-center justify-center rounded text-ink-faint hover:bg-white hover:text-rose"
                        onClick={() => {
                          if (tag.vendorId) {
                            onPatch({
                              vendorIds: item.vendorIds.filter(
                                (id) => id !== tag.vendorId,
                              ),
                              isAiDraft: false,
                            });
                          } else {
                            onPatch({
                              assignedTo: item.assignedTo.filter(
                                (n) =>
                                  n.trim().toLowerCase() !==
                                  tag.name.toLowerCase(),
                              ),
                              isAiDraft: false,
                            });
                          }
                        }}
                      >
                        <X size={11} strokeWidth={1.8} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <VendorTagPicker
                vendors={vendors}
                assignedIds={item.vendorIds}
                onAssign={(id) =>
                  onPatch({
                    vendorIds: [...item.vendorIds, id],
                    isAiDraft: false,
                  })
                }
                onAddCustom={(name) => {
                  const trimmed = name.trim();
                  if (!trimmed) return;
                  onPatch({
                    assignedTo: [...item.assignedTo, trimmed],
                    isAiDraft: false,
                  });
                }}
              />
            </div>
          </Section>

          {/* DEPENDENCIES */}
          <Section label="Dependencies">
            <div className="rounded-md border border-border bg-ivory-warm/30 px-3 py-2 text-[12px] text-ink-muted">
              <p>
                <span className="font-mono uppercase tracking-[0.14em] text-ink-faint">
                  After:
                </span>{" "}
                {reference
                  ? `${reference.label} (${item.dependency?.gapMinutes ?? 0} min gap)`
                  : "—"}
              </p>
              <p className="mt-1">
                <span className="font-mono uppercase tracking-[0.14em] text-ink-faint">
                  Followed by:
                </span>{" "}
                {follower ? follower.label : "—"}
              </p>
              {item.dependency && (
                <button
                  type="button"
                  onClick={() =>
                    onPatch({ dependency: null, isAiDraft: false })
                  }
                  className="mt-2 text-[11.5px] font-medium text-ink hover:underline"
                >
                  Break dependency
                </button>
              )}
            </div>
          </Section>

          {/* PHOTO + MUSIC */}
          <Section label="Coverage">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[12.5px] text-ink">
                <input
                  type="checkbox"
                  checked={item.isPhotoMoment}
                  onChange={(e) =>
                    onPatch({
                      isPhotoMoment: e.target.checked,
                      isAiDraft: false,
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-border text-ink focus:ring-0"
                />
                <Camera size={12} strokeWidth={1.6} />
                Must-capture photo moment
              </label>
              <div>
                <div className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
                  <Music size={11} strokeWidth={1.6} />
                  Music cue
                </div>
                <InlineText
                  value={item.musicCue ?? ""}
                  placeholder="Song or playlist cue for the DJ"
                  onChange={(v) =>
                    onPatch({
                      musicCue: v.length > 0 ? v : null,
                      isAiDraft: false,
                    })
                  }
                  className="text-[13px] text-ink"
                />
              </div>
            </div>
          </Section>

          {/* INTERNAL NOTES */}
          <Section
            label="Internal notes"
            icon={<StickyNote size={12} strokeWidth={1.6} />}
          >
            <InlineTextarea
              value={item.internalNotes ?? ""}
              placeholder="Planner-only — never shared with vendors."
              onChange={(v) =>
                onPatch({
                  internalNotes: v.length > 0 ? v : null,
                  isAiDraft: false,
                })
              }
            />
          </Section>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
          >
            <Copy size={12} strokeWidth={1.6} />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${item.label}"?`)) {
                onDelete();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose/30 bg-white px-3 py-1.5 text-[12px] text-rose hover:bg-rose-pale/40"
          >
            <Trash2 size={12} strokeWidth={1.6} />
            Delete
          </button>
        </footer>
      </aside>
    </>
  );
}

// ── Inline editor primitives ───────────────────────────────────────────────

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
        {icon}
        {label}
      </h3>
      {children}
    </section>
  );
}

function InlineText({
  value,
  placeholder,
  onChange,
  className,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        defaultValue={value}
        onBlur={(e) => {
          onChange(e.target.value.trim());
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder={placeholder}
        className={cn(
          "w-full rounded border border-gold/40 bg-white px-2 py-1 outline-none",
          className,
        )}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "block w-full truncate text-left hover:text-ink",
        className,
      )}
    >
      {value.length > 0 ? (
        value
      ) : (
        <span className="italic text-ink-faint">{placeholder}</span>
      )}
    </button>
  );
}

function InlineTextarea({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <textarea
        autoFocus
        rows={3}
        defaultValue={value}
        onBlur={(e) => {
          onChange(e.target.value.trim());
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder={placeholder}
        className="w-full resize-none rounded border border-gold/40 bg-white px-2 py-1 text-[12.5px] text-ink outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full rounded border border-dashed border-border bg-white px-2 py-1.5 text-left text-[12.5px] leading-snug text-ink-muted hover:border-ink-faint hover:text-ink"
    >
      {value.length > 0 ? (
        value
      ) : (
        <span className="italic text-ink-faint">{placeholder}</span>
      )}
    </button>
  );
}

function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value);
      }}
      className="rounded border border-border bg-white px-2 py-1 font-mono text-[13px] tabular-nums text-ink outline-none focus:border-gold"
    />
  );
}

function DurationField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={600}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n) && n >= 0) onChange(n);
      }}
      className="w-16 rounded border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-gold"
      aria-label="Duration in minutes"
    />
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink hover:border-ink-faint">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent pr-1 text-[12px] text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={11} strokeWidth={1.8} className="text-ink-faint" />
    </label>
  );
}
