"use client";

// ── Day-of Schedule tab (Music) ───────────────────────────────────────────
// Per-event timeline of music cues. Tabs through the canonical event list,
// shows a vertical timeline of slots (load-in → sound check → background →
// cued moments → handoffs → curfew → after-party → teardown).
//
// Curfew slots are styled with an amber rule. Handoff slots show a "from →
// to" badge. Each slot is editable inline.

import { useState } from "react";
import {
  AlertOctagon,
  ArrowRightLeft,
  CalendarClock,
  Clock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Eyebrow,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { ENERGY_EVENTS } from "@/stores/music-soundscape-store";
import {
  SCHEDULE_SLOT_LABEL,
  useMusicScheduleStore,
} from "@/stores/music-schedule-store";
import type {
  EnergyEventId,
  MusicScheduleSlot,
  ScheduleSlotKind,
} from "@/types/music";

export function MusicDayOfTab() {
  const [event, setEvent] = useState<EnergyEventId>("sangeet");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Day-of Schedule"
        title="The operational timeline"
        description="Every music cue across the wedding week — load-in, sound check, background music, cued moments, handoffs between vendors, curfew warnings, after-party, teardown."
      />

      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {ENERGY_EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEvent(e.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              event === e.id
                ? "bg-ink text-ivory"
                : "text-ink-muted hover:bg-ivory-warm/40 hover:text-ink",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      <EventTimeline event={event} />
    </div>
  );
}

// ── Per-event timeline ───────────────────────────────────────────────────

function EventTimeline({ event }: { event: EnergyEventId }) {
  const slots = useMusicScheduleStore((s) => s.slotsForEvent(event));

  return (
    <PanelCard
      icon={<CalendarClock size={13} strokeWidth={1.7} />}
      title={`${labelFor(event)} timeline`}
      badge={<Tag tone="ink">{slots.length} slots</Tag>}
    >
      {slots.length === 0 ? (
        <p className="py-3 text-[12px] italic text-ink-faint">
          No slots yet for this event. Add a load-in to get started.
        </p>
      ) : (
        <ol className="space-y-2">
          {slots.map((slot, i) => (
            <li key={slot.id} className="relative">
              {i < slots.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[18px] top-7 h-[calc(100%+8px)] w-px bg-border"
                />
              )}
              <SlotRow slot={slot} />
            </li>
          ))}
        </ol>
      )}

      <AddSlotForm event={event} />
    </PanelCard>
  );
}

// ── Slot row ─────────────────────────────────────────────────────────────

function SlotRow({ slot }: { slot: MusicScheduleSlot }) {
  const remove = useMusicScheduleStore((s) => s.deleteSlot);
  const isCurfew = slot.kind === "curfew_warning" || slot.curfew;
  const isHandoff = slot.kind === "handoff";

  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={cn(
          "relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isCurfew
            ? "bg-amber-100 text-amber-700"
            : isHandoff
              ? "bg-rose-pale/60 text-rose"
              : "bg-saffron-pale/60 text-saffron",
        )}
      >
        {isCurfew ? (
          <AlertOctagon size={14} strokeWidth={1.7} />
        ) : isHandoff ? (
          <ArrowRightLeft size={14} strokeWidth={1.7} />
        ) : (
          <Sparkles size={14} strokeWidth={1.7} />
        )}
      </span>

      <div
        className={cn(
          "flex-1 rounded-md border p-3",
          isCurfew
            ? "border-amber-200 bg-amber-50/50"
            : "border-border bg-white",
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-[12px] tabular-nums text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {slot.start_time}
              {slot.end_time && (
                <>
                  <span className="mx-0.5 text-ink-faint">–</span>
                  {slot.end_time}
                </>
              )}
            </span>
            <Tag tone={isCurfew ? "amber" : isHandoff ? "rose" : "saffron"}>
              {SCHEDULE_SLOT_LABEL[slot.kind]}
            </Tag>
          </div>
          <button
            type="button"
            onClick={() => remove(slot.id)}
            aria-label="Remove slot"
            className="text-ink-faint hover:text-rose"
          >
            <Trash2 size={11} strokeWidth={1.8} />
          </button>
        </div>

        <p className="mt-1.5 text-[12.5px] text-ink">{slot.label}</p>

        {(slot.owner || slot.handoff_from || slot.handoff_to) && (
          <p className="mt-1 text-[11px] text-ink-muted">
            {isHandoff && slot.handoff_from && slot.handoff_to ? (
              <>
                <span className="font-medium">{slot.handoff_from}</span>
                <span className="mx-1.5 text-ink-faint">→</span>
                <span className="font-medium">{slot.handoff_to}</span>
              </>
            ) : (
              <span>Owner: {slot.owner ?? "—"}</span>
            )}
          </p>
        )}

        {slot.notes && (
          <p className="mt-1 text-[11px] italic text-ink-muted">{slot.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Add slot form ────────────────────────────────────────────────────────

function AddSlotForm({ event }: { event: EnergyEventId }) {
  const add = useMusicScheduleStore((s) => s.addSlot);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [kind, setKind] = useState<ScheduleSlotKind>("cue");
  const [owner, setOwner] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-saffron hover:underline"
      >
        <Plus size={11} strokeWidth={2} /> Add slot
      </button>
    );
  }

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-saffron/40 bg-ivory-warm/30 p-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim() || !start.trim()) return;
        add({
          event,
          start_time: start.trim(),
          end_time: end.trim() || undefined,
          kind,
          label: label.trim(),
          owner: owner.trim() || undefined,
          curfew: kind === "curfew_warning" || undefined,
        });
        setLabel("");
        setStart("");
        setEnd("");
        setOwner("");
        setKind("cue");
        setOpen(false);
      }}
    >
      <div>
        <Eyebrow>Start time</Eyebrow>
        <input
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="HH:mm"
          className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
      </div>
      <div>
        <Eyebrow>End time (optional)</Eyebrow>
        <input
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="HH:mm"
          className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
      </div>
      <div className="md:col-span-2">
        <Eyebrow>Label</Eyebrow>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What's happening?"
          className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
      </div>
      <div>
        <Eyebrow>Kind</Eyebrow>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ScheduleSlotKind)}
          className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/50 focus:outline-none"
        >
          {(
            [
              "load_in",
              "sound_check",
              "background_music",
              "cue",
              "handoff",
              "curfew_warning",
              "after_party",
              "teardown",
            ] as ScheduleSlotKind[]
          ).map((k) => (
            <option key={k} value={k}>
              {SCHEDULE_SLOT_LABEL[k]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Eyebrow>Owner (optional)</Eyebrow>
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="DJ Pranav, Mumbai Dhol Ensemble…"
          className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} /> Add slot
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function labelFor(event: EnergyEventId): string {
  return ENERGY_EVENTS.find((e) => e.id === event)?.label ?? event;
}
