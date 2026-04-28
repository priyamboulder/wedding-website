"use client";

// ── Audio & Coverage tab (Videography) ────────────────────────────────────
// The technical planning tab. Mic plan (who's lav'd, when), coverage matrix
// (which event gets what level), camera positions (especially for the
// ceremony), and the photo↔video coordination notes for priority moments.

import { useMemo } from "react";
import { Camera, Handshake, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideographyStore } from "@/stores/videography-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  CameraRole,
  CoverageLevel,
  MicType,
  VideoCameraPosition,
  VideoCoordinationNote,
  VideoEventId,
  VideoMicAssignment,
} from "@/types/videography";
import {
  CAMERA_ROLE_LABEL,
  COVERAGE_LEVEL_LABEL,
  MIC_TYPE_LABEL,
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

const MIC_EVENTS: VideoEventId[] = [
  "haldi",
  "mehendi",
  "sangeet",
  "baraat",
  "wedding",
  "reception",
];

const COVERAGE_LEVELS: CoverageLevel[] = ["full", "key_moments", "skip"];

export function AudioCoverageTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-8">
      <MicPlan category={category} />
      <CoverageMatrix category={category} />
      <CameraPositions category={category} />
      <CoordinationNotes category={category} />
    </div>
  );
}

// ── Mic plan ────────────────────────────────────────────────────────────

function MicPlan({ category }: { category: WorkspaceCategory }) {
  const mics = useVideographyStore((s) => s.mic_assignments);
  const addMic = useVideographyStore((s) => s.addMicAssignment);

  const list = useMemo(
    () =>
      mics
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [mics, category.id],
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Audio"
        title="Mic plan"
        description="Who wears a mic, what kind, during which events. The ambient room mic is a redundant backup — leave it on every event."
        right={
          <button
            type="button"
            onClick={() =>
              addMic({
                category_id: category.id,
                person_name: "",
                mic_type: "lavalier",
                events: ["wedding"],
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add mic
          </button>
        }
      />

      {list.length === 0 ? (
        <EmptyRow>No mic assignments yet.</EmptyRow>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full divide-y divide-border text-[12.5px]">
            <thead className="bg-ivory/50">
              <tr>
                <th className="py-2 pl-3 pr-4 text-left">
                  <Eyebrow>Person</Eyebrow>
                </th>
                <th className="py-2 pr-4 text-left">
                  <Eyebrow>Type</Eyebrow>
                </th>
                {MIC_EVENTS.map((e) => (
                  <th key={e} className="py-2 px-2 text-center">
                    <Eyebrow>{videoEventLabel(e)}</Eyebrow>
                  </th>
                ))}
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-white">
              {list.map((m) => (
                <MicRow key={m.id} mic={m} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MicRow({ mic }: { mic: VideoMicAssignment }) {
  const updateMic = useVideographyStore((s) => s.updateMicAssignment);
  const deleteMic = useVideographyStore((s) => s.deleteMicAssignment);
  const toggleMicEvent = useVideographyStore((s) => s.toggleMicEvent);
  const addMic = useVideographyStore((s) => s.addMicAssignment);

  function handleDelete() {
    const snap = { ...mic };
    deleteMic(mic.id);
    pushUndo({
      message: `Removed ${snap.person_name || "mic"}`,
      undo: () =>
        addMic({
          category_id: snap.category_id,
          person_name: snap.person_name,
          role: snap.role,
          mic_type: snap.mic_type,
          events: snap.events,
          notes: snap.notes,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <tr className="group">
      <td className="py-2 pl-3 pr-4 align-middle">
        <InlineText
          value={mic.person_name}
          onSave={(v) => updateMic(mic.id, { person_name: v })}
          placeholder="Person name"
          className="!p-0 text-[13px] text-ink"
        />
        {mic.role && (
          <p className="text-[11px] text-ink-muted">{mic.role}</p>
        )}
      </td>
      <td className="py-2 pr-4 align-middle">
        <select
          value={mic.mic_type}
          onChange={(e) => updateMic(mic.id, { mic_type: e.target.value as MicType })}
          className="rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted focus:border-saffron focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {(Object.keys(MIC_TYPE_LABEL) as MicType[]).map((t) => (
            <option key={t} value={t}>
              {MIC_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </td>
      {MIC_EVENTS.map((e) => {
        const on = mic.events.includes(e);
        return (
          <td key={e} className="py-2 px-2 text-center align-middle">
            <button
              type="button"
              onClick={() => toggleMicEvent(mic.id, e)}
              aria-pressed={on}
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-sm border transition-colors",
                on
                  ? "border-sage bg-sage text-ivory"
                  : "border-border bg-white text-ink-faint hover:border-ink",
              )}
            >
              {on ? "✓" : ""}
            </button>
          </td>
        );
      })}
      <td className="py-2 pr-3 text-right align-middle">
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete mic"
          className="text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

// ── Coverage matrix ─────────────────────────────────────────────────────

function CoverageMatrix({ category }: { category: WorkspaceCategory }) {
  const coverage = useVideographyStore((s) => s.coverage);
  const setCoverage = useVideographyStore((s) => s.setCoverage);

  const byEvent = useMemo(() => {
    const map = new Map<VideoEventId, (typeof coverage)[number]>();
    for (const c of coverage) {
      if (c.category_id !== category.id) continue;
      map.set(c.event as VideoEventId, c);
    }
    return map;
  }, [coverage, category.id]);

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Coverage matrix"
        title="Which events get video — and how much"
        description="Full coverage = multiple cameras, continuous capture. Key moments only = single camera, specific beats. Skip = no video."
      />
      <PanelCard title="Events × coverage level">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-[12.5px]">
            <thead className="bg-ivory/50">
              <tr>
                <th className="py-2 pl-3 pr-4 text-left">
                  <Eyebrow>Event</Eyebrow>
                </th>
                {COVERAGE_LEVELS.map((lvl) => (
                  <th key={lvl} className="py-2 px-3 text-center">
                    <Eyebrow>{COVERAGE_LEVEL_LABEL[lvl]}</Eyebrow>
                  </th>
                ))}
                <th className="py-2 pr-3 text-left">
                  <Eyebrow>Cameras</Eyebrow>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-white">
              {MIC_EVENTS.map((e) => {
                const row = byEvent.get(e);
                const current = row?.level ?? "full";
                return (
                  <tr key={e}>
                    <td className="py-2 pl-3 pr-4 text-ink">
                      {videoEventLabel(e)}
                    </td>
                    {COVERAGE_LEVELS.map((lvl) => (
                      <td key={lvl} className="py-2 px-3 text-center">
                        <input
                          type="radio"
                          name={`cov-${e}`}
                          checked={current === lvl}
                          onChange={() =>
                            setCoverage(category.id, e, { level: lvl })
                          }
                          className="h-3.5 w-3.5 accent-ink"
                        />
                      </td>
                    ))}
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        max={8}
                        value={row?.camera_count ?? ""}
                        onChange={(ev) =>
                          setCoverage(category.id, e, {
                            camera_count: Number(ev.target.value) || undefined,
                          })
                        }
                        className="w-14 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </section>
  );
}

// ── Camera positions ────────────────────────────────────────────────────

function CameraPositions({ category }: { category: WorkspaceCategory }) {
  const positions = useVideographyStore((s) => s.camera_positions);
  const addPosition = useVideographyStore((s) => s.addCameraPosition);

  const grouped = useMemo(() => {
    const map = new Map<VideoEventId, VideoCameraPosition[]>();
    for (const p of positions) {
      if (p.category_id !== category.id) continue;
      const key = p.event as VideoEventId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    for (const [, list] of map) list.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [positions, category.id]);

  const orderedEvents = MIC_EVENTS.filter((e) => grouped.has(e));

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Staging"
        title="Camera positions"
        description="Where each camera lives during each event. The ceremony needs the most thought — lock this with the videographer before the day."
        right={
          <button
            type="button"
            onClick={() =>
              addPosition({
                category_id: category.id,
                event: "wedding",
                role: "main",
                position_note: "",
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add position
          </button>
        }
      />

      {orderedEvents.length === 0 ? (
        <EmptyRow>No camera positions planned yet.</EmptyRow>
      ) : (
        <div className="space-y-5">
          {orderedEvents.map((e) => (
            <div key={e}>
              <Eyebrow className="mb-2 flex items-center gap-2">
                <Camera size={11} strokeWidth={1.8} />
                {videoEventLabel(e)}
              </Eyebrow>
              <ul className="space-y-2">
                {(grouped.get(e) ?? []).map((p) => (
                  <li key={p.id}>
                    <CameraRow position={p} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CameraRow({ position }: { position: VideoCameraPosition }) {
  const update = useVideographyStore((s) => s.updateCameraPosition);
  const remove = useVideographyStore((s) => s.deleteCameraPosition);
  const add = useVideographyStore((s) => s.addCameraPosition);

  function handleDelete() {
    const snap = { ...position };
    remove(position.id);
    pushUndo({
      message: `Removed ${CAMERA_ROLE_LABEL[snap.role]}`,
      undo: () =>
        add({
          category_id: snap.category_id,
          event: snap.event,
          role: snap.role,
          position_note: snap.position_note,
          operator_name: snap.operator_name,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div className="rounded-md border border-border bg-white p-3">
      <HoverRow className="items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
          <Camera size={13} strokeWidth={1.8} />
        </span>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <select
              value={position.role}
              onChange={(e) =>
                update(position.id, { role: e.target.value as CameraRole })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {(Object.keys(CAMERA_ROLE_LABEL) as CameraRole[]).map((r) => (
                <option key={r} value={r}>
                  {CAMERA_ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <select
              value={position.event}
              onChange={(e) =>
                update(position.id, { event: e.target.value as VideoEventId })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink-muted focus:border-saffron focus:outline-none"
            >
              {VIDEO_EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
            <InlineText
              value={position.operator_name ?? ""}
              onSave={(v) => update(position.id, { operator_name: v })}
              placeholder="Operator (optional)"
              emptyLabel="Assign operator…"
              allowEmpty
              className="!p-0 text-[12px] text-ink-muted"
            />
          </div>
          <div className="mt-1.5">
            <InlineText
              value={position.position_note}
              onSave={(v) => update(position.id, { position_note: v })}
              variant="block"
              placeholder="Where this camera lives, framing notes, any constraints…"
              className="!p-0 text-[13px] leading-relaxed text-ink"
            />
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>
    </div>
  );
}

// ── Coordination notes ──────────────────────────────────────────────────

function CoordinationNotes({ category }: { category: WorkspaceCategory }) {
  const notes = useVideographyStore((s) => s.coordination);
  const addNote = useVideographyStore((s) => s.addCoordinationNote);

  const list = useMemo(
    () =>
      notes
        .filter((n) => n.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [notes, category.id],
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Photo + video"
        title="Coordination with photographer"
        description="At key moments one of them has visual priority — this list is the handoff map. Share it with both teams at the prep call."
        right={
          <button
            type="button"
            onClick={() =>
              addNote({
                category_id: category.id,
                moment: "",
                priority: "shared",
                handoff: "",
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add note
          </button>
        }
      />

      {list.length === 0 ? (
        <EmptyRow>
          No coordination notes yet. Start with Varmala, Vidaai, and Family
          portraits — those are the classic priority-conflict moments.
        </EmptyRow>
      ) : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id}>
              <CoordinationRow note={n} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CoordinationRow({ note }: { note: VideoCoordinationNote }) {
  const update = useVideographyStore((s) => s.updateCoordinationNote);
  const remove = useVideographyStore((s) => s.deleteCoordinationNote);
  const add = useVideographyStore((s) => s.addCoordinationNote);

  function handleDelete() {
    const snap = { ...note };
    remove(note.id);
    pushUndo({
      message: "Coordination note removed",
      undo: () =>
        add({
          category_id: snap.category_id,
          moment: snap.moment,
          priority: snap.priority,
          handoff: snap.handoff,
          sort_order: snap.sort_order,
        }),
    });
  }

  const priorityTone: Record<typeof note.priority, string> = {
    photo: "bg-saffron-pale/50 text-saffron",
    video: "bg-sage-pale/60 text-sage",
    shared: "bg-ivory-warm text-ink-muted",
  };

  return (
    <div className="rounded-md border border-border bg-white p-3">
      <HoverRow>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 text-ink">
              <Handshake size={12} strokeWidth={1.8} className="text-ink-muted" />
              <InlineText
                value={note.moment}
                onSave={(v) => update(note.id, { moment: v })}
                placeholder="Moment (e.g. Varmala)"
                className="!p-0 font-serif text-[14.5px] text-ink"
              />
            </span>
            <select
              value={note.priority}
              onChange={(e) =>
                update(note.id, {
                  priority: e.target.value as typeof note.priority,
                })
              }
              className={cn(
                "rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] focus:outline-none",
                priorityTone[note.priority],
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <option value="photo">Photo priority</option>
              <option value="video">Video priority</option>
              <option value="shared">Shared</option>
            </select>
          </div>
          <div className="mt-1.5">
            <InlineText
              value={note.handoff}
              onSave={(v) => update(note.id, { handoff: v })}
              variant="block"
              placeholder="Who stands where, who leads, handoff signal…"
              className="!p-0 text-[12.5px] leading-relaxed text-ink-muted"
            />
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>
    </div>
  );
}
