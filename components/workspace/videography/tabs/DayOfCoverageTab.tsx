"use client";

// ── Day-of Coverage tab (Videography) ─────────────────────────────────────
// The operational schedule for the video team. Per time block: audio
// notes, camera movement direction, B-roll opportunities, drone windows.
// Photography's Day-of Schedule has the same bones; this adds the audio /
// camera / drone layers that video needs.

import { useMemo } from "react";
import {
  Camera,
  Clapperboard,
  Clock,
  MapPin,
  Mic,
  Plane,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideographyStore } from "@/stores/videography-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  CameraMovement,
  VideoDayOfSlot,
  VideoEventId,
} from "@/types/videography";
import {
  CAMERA_MOVEMENT_LABEL,
  VIDEO_EVENTS,
  videoEventLabel,
} from "@/types/videography";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const EVENT_ORDER: VideoEventId[] = [
  "haldi",
  "mehendi",
  "sangeet",
  "baraat",
  "wedding",
  "reception",
  "general",
];

export function DayOfCoverageTab({ category }: { category: WorkspaceCategory }) {
  const slots = useVideographyStore((s) => s.day_of);
  const addSlot = useVideographyStore((s) => s.addDayOfSlot);

  const list = useMemo(
    () =>
      slots
        .filter((s) => s.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [slots, category.id],
  );

  const grouped = useMemo(() => {
    const map = new Map<VideoEventId, VideoDayOfSlot[]>();
    for (const s of list) {
      const k = s.event as VideoEventId;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [list]);

  const coordinationNotes = useVideographyStore((s) => s.coordination);
  const coordList = useMemo(
    () =>
      coordinationNotes
        .filter((n) => n.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [coordinationNotes, category.id],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Run of show"
        title="Day-of coverage"
        description="The crew's operational guide — crew call times, mic check windows, camera movement per block, B-roll opportunities, drone windows."
        right={
          <button
            type="button"
            onClick={() =>
              addSlot({
                category_id: category.id,
                event: "wedding",
                time_label: "",
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add block
          </button>
        }
      />

      {coordList.length > 0 && (
        <PanelCard
          icon={<Users size={14} strokeWidth={1.8} />}
          title="Photo + Video coordination notes"
          badge={
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Pinned from Audio & Coverage
            </span>
          }
        >
          <ul className="space-y-2">
            {coordList.map((n) => (
              <li
                key={n.id}
                className="rounded-sm border border-border bg-white p-2.5"
              >
                <p className="text-[13px] font-medium text-ink">{n.moment}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">{n.handoff}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      )}

      {list.length === 0 ? (
        <EmptyRow>
          No day-of blocks yet. Add your first block — "Crew call, 7:00 AM"
          is a typical opener.
        </EmptyRow>
      ) : (
        <div className="space-y-6">
          {EVENT_ORDER.filter((e) => grouped.has(e)).map((e) => (
            <div key={e}>
              <Eyebrow className="mb-2 flex items-center gap-2">
                <Clock size={11} strokeWidth={1.8} />
                {videoEventLabel(e)}
              </Eyebrow>
              <ul className="space-y-2">
                {(grouped.get(e) ?? []).map((slot) => (
                  <li key={slot.id}>
                    <DayOfCard slot={slot} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DayOfCard({ slot }: { slot: VideoDayOfSlot }) {
  const update = useVideographyStore((s) => s.updateDayOfSlot);
  const remove = useVideographyStore((s) => s.deleteDayOfSlot);
  const add = useVideographyStore((s) => s.addDayOfSlot);

  function handleDelete() {
    const snap = { ...slot };
    remove(slot.id);
    pushUndo({
      message: `Removed ${snap.time_label || "block"}`,
      undo: () =>
        add({
          category_id: snap.category_id,
          event: snap.event,
          time_label: snap.time_label,
          location: snap.location,
          audio_note: snap.audio_note,
          camera_movement: snap.camera_movement,
          broll_note: snap.broll_note,
          drone_window: snap.drone_window,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <HoverRow>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <InlineText
              value={slot.time_label}
              onSave={(v) => update(slot.id, { time_label: v })}
              placeholder="e.g. 4:00 PM · Processional"
              className="!p-0 font-serif text-[15px] text-ink"
            />
            <select
              value={slot.event}
              onChange={(e) =>
                update(slot.id, { event: e.target.value as VideoEventId })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {VIDEO_EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
            {slot.location !== undefined && (
              <span className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                <MapPin size={11} strokeWidth={1.8} />
                <InlineText
                  value={slot.location ?? ""}
                  onSave={(v) => update(slot.id, { location: v })}
                  placeholder="Location"
                  emptyLabel="Click to add…"
                  allowEmpty
                  className="!p-0 text-[11.5px] text-ink-muted"
                />
              </span>
            )}
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <TechField
          icon={<Mic size={11} strokeWidth={1.8} />}
          label="Audio"
          value={slot.audio_note ?? ""}
          placeholder="Mic check at X, speech mic handoff…"
          onSave={(v) => update(slot.id, { audio_note: v })}
        />
        <TechField
          icon={<Camera size={11} strokeWidth={1.8} />}
          label="Camera movement"
          value={slot.camera_movement ? CAMERA_MOVEMENT_LABEL[slot.camera_movement] : ""}
          placeholder="Tripod / Steadicam / Handheld…"
          renderValue={() => (
            <select
              value={slot.camera_movement ?? ""}
              onChange={(e) =>
                update(slot.id, {
                  camera_movement:
                    (e.target.value || undefined) as CameraMovement | undefined,
                })
              }
              className="w-full bg-transparent text-[13px] text-ink focus:outline-none"
            >
              <option value="">—</option>
              {(Object.keys(CAMERA_MOVEMENT_LABEL) as CameraMovement[]).map((m) => (
                <option key={m} value={m}>
                  {CAMERA_MOVEMENT_LABEL[m]}
                </option>
              ))}
            </select>
          )}
          onSave={() => undefined}
        />
        <TechField
          icon={<Clapperboard size={11} strokeWidth={1.8} />}
          label="B-roll"
          value={slot.broll_note ?? ""}
          placeholder="15 min before, capture empty venue details…"
          onSave={(v) => update(slot.id, { broll_note: v })}
        />
        <TechField
          icon={<Plane size={11} strokeWidth={1.8} />}
          label="Drone window"
          value={slot.drone_window ?? ""}
          placeholder="Check FAA, venue, lighting…"
          onSave={(v) => update(slot.id, { drone_window: v })}
        />
      </div>

      {slot.location === undefined && (
        <button
          type="button"
          onClick={() => update(slot.id, { location: "" })}
          className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Plus size={10} /> Location
        </button>
      )}
    </div>
  );
}

function TechField({
  icon,
  label,
  value,
  placeholder,
  onSave,
  renderValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  renderValue?: () => React.ReactNode;
}) {
  return (
    <div className={cn("rounded-sm bg-ivory/40 p-2.5")}>
      <Eyebrow className="mb-0.5 flex items-center gap-1">
        <span className="text-ink-muted">{icon}</span>
        {label}
      </Eyebrow>
      {renderValue ? (
        renderValue()
      ) : (
        <InlineText
          value={value}
          onSave={onSave}
          variant="block"
          placeholder={placeholder}
          emptyLabel="Click to add…"
          allowEmpty
          className="!p-0 text-[12.5px] leading-relaxed text-ink"
        />
      )}
    </div>
  );
}
