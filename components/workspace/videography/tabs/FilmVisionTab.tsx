"use client";

// ── Film Vision tab (Videography) ─────────────────────────────────────────
// The storyboard. Unlike Photography's Shot List (a flat inventory of
// moments), this tab is structured as a narrative arc per event: opening
// shot → emotional anchor → audio anchor → closing shot, plus concise
// must-capture beats and a music suggestion. Video is continuous, so the
// list is short and directional.
//
// Bottom half: interview planning — the voiceover material for the edit.

import { useMemo, useState } from "react";
import {
  Film,
  Mic,
  MicOff,
  MoveRight,
  Music,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideographyStore } from "@/stores/videography-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  InterviewSlot,
  VideoEventArc,
  VideoEventId,
  VideoInterview,
} from "@/types/videography";
import {
  INTERVIEW_SLOT_LABEL,
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

export function FilmVisionTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-8">
      <NarrativeArcsSection category={category} />
      <div className="border-t border-gold/15 pt-6" />
      <InterviewsSection category={category} />
    </div>
  );
}

// ── Narrative arcs (per-event storyboard) ───────────────────────────────

function NarrativeArcsSection({ category }: { category: WorkspaceCategory }) {
  const arcs = useVideographyStore((s) => s.event_arcs);
  const ensureArc = useVideographyStore((s) => s.ensureEventArc);

  const arcsByEvent = useMemo(() => {
    const map = new Map<VideoEventId, VideoEventArc>();
    for (const a of arcs) {
      if (a.category_id !== category.id) continue;
      map.set(a.event as VideoEventId, a);
    }
    return map;
  }, [arcs, category.id]);

  const plannedEvents = EVENT_ORDER.filter(
    (e) => e !== "general" && arcsByEvent.has(e),
  );
  const unplannedEvents = EVENT_ORDER.filter(
    (e) => e !== "general" && !arcsByEvent.has(e),
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Storyboard"
        title="Film vision — a narrative arc per event"
        description="Photography plans shots. Videography plans stories. For each event, sketch the opening shot, the emotional anchor, the audio that carries it, and the closing image."
      />

      {plannedEvents.length === 0 ? (
        <EmptyRow>
          Start with one event — we'll suggest arcs for the others once
          you've planned one.
        </EmptyRow>
      ) : (
        <ul className="space-y-4">
          {plannedEvents.map((e) => (
            <li key={e}>
              <ArcCard arc={arcsByEvent.get(e)!} />
            </li>
          ))}
        </ul>
      )}

      {unplannedEvents.length > 0 && (
        <div className="rounded-md border border-dashed border-border bg-ivory/40 px-4 py-3">
          <Eyebrow className="mb-2">Add an event</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {unplannedEvents.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => ensureArc(category.id, e)}
                className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 text-[12px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
              >
                <Plus size={11} /> {videoEventLabel(e)}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ArcCard({ arc }: { arc: VideoEventArc }) {
  const updateArc = useVideographyStore((s) => s.updateEventArc);
  const addMustCapture = useVideographyStore((s) => s.addArcMustCapture);
  const removeMustCapture = useVideographyStore((s) => s.removeArcMustCapture);
  const [beatDraft, setBeatDraft] = useState("");

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
            <Film size={13} strokeWidth={1.8} />
          </span>
          <h4 className="font-serif text-[17px] text-ink">
            {videoEventLabel(arc.event)}
          </h4>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {VIDEO_EVENTS.find((e) => e.id === arc.event)?.date ?? ""}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ArcField
          eyebrow="Opening shot"
          icon={<MoveRight size={11} strokeWidth={1.8} />}
          value={arc.opening_shot ?? ""}
          placeholder="First image of this section — what does the audience see?"
          onSave={(v) => updateArc(arc.id, { opening_shot: v })}
        />
        <ArcField
          eyebrow="Emotional anchor"
          icon={<Film size={11} strokeWidth={1.8} />}
          value={arc.emotional_anchor ?? ""}
          placeholder="The moment that defines this event."
          onSave={(v) => updateArc(arc.id, { emotional_anchor: v })}
        />
        <ArcField
          eyebrow="Audio anchor"
          icon={<Mic size={11} strokeWidth={1.8} />}
          value={arc.audio_anchor ?? ""}
          placeholder="What sound or speech carries this section?"
          onSave={(v) => updateArc(arc.id, { audio_anchor: v })}
        />
        <ArcField
          eyebrow="Closing shot"
          icon={<MoveRight size={11} strokeWidth={1.8} className="rotate-180" />}
          value={arc.closing_shot ?? ""}
          placeholder="How does this section end?"
          onSave={(v) => updateArc(arc.id, { closing_shot: v })}
        />
      </div>

      <div className="mt-4 rounded-md border border-border bg-ivory/30 p-3">
        <div className="flex items-center justify-between">
          <Eyebrow>Must-capture beats</Eyebrow>
          <span
            className="font-mono text-[10px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Keep this short — video is continuous.
          </span>
        </div>
        {arc.must_capture.length === 0 ? (
          <EmptyRow>No beats queued yet.</EmptyRow>
        ) : (
          <ul className="mt-2 space-y-1">
            {arc.must_capture.map((beat, i) => (
              <li
                key={`${beat}-${i}`}
                className="group flex items-start gap-2 rounded-sm px-1.5 py-1 hover:bg-white"
              >
                <span className="mt-[5px] h-1 w-1 rounded-full bg-ink-muted" />
                <p className="flex-1 text-[12.5px] text-ink">{beat}</p>
                <button
                  type="button"
                  onClick={() => removeMustCapture(arc.id, i)}
                  aria-label="Remove beat"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2
                    size={11}
                    strokeWidth={1.8}
                    className="text-ink-faint hover:text-rose"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={beatDraft}
            onChange={(e) => setBeatDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && beatDraft.trim()) {
                addMustCapture(arc.id, beatDraft.trim());
                setBeatDraft("");
              }
            }}
            placeholder="Add a beat (press Enter)"
            className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border bg-ivory/30 p-3">
        <div className="flex items-center gap-1.5">
          <Music size={11} strokeWidth={1.8} className="text-saffron" />
          <Eyebrow>Music suggestion</Eyebrow>
        </div>
        <InlineText
          value={arc.music_suggestion ?? ""}
          onSave={(v) => updateArc(arc.id, { music_suggestion: v })}
          variant="block"
          placeholder="A song or vibe for this section of the edit."
          emptyLabel="Click to add a music direction…"
          allowEmpty
          className="!p-0 mt-1 text-[12.5px] leading-relaxed text-ink"
        />
      </div>
    </div>
  );
}

function ArcField({
  eyebrow,
  icon,
  value,
  placeholder,
  onSave,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-ivory/30 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-ink-muted">{icon}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <InlineText
        value={value}
        onSave={onSave}
        variant="block"
        placeholder={placeholder}
        emptyLabel="Click to add…"
        allowEmpty
        className="!p-0 mt-1 text-[13px] leading-relaxed text-ink"
      />
    </div>
  );
}

// ── Interviews ───────────────────────────────────────────────────────────

function InterviewsSection({ category }: { category: WorkspaceCategory }) {
  const interviews = useVideographyStore((s) => s.interviews);
  const addInterview = useVideographyStore((s) => s.addInterview);

  const list = useMemo(
    () =>
      interviews
        .filter((i) => i.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [interviews, category.id],
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Voiceover material"
        title="Interviews"
        description="On-camera interviews with family become the voiceover that threads the film together. Plan who, what to ask, and when to film."
        right={
          <button
            type="button"
            onClick={() =>
              addInterview({
                category_id: category.id,
                person_name: "",
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add interview
          </button>
        }
      />

      {list.length === 0 ? (
        <EmptyRow>
          No interviews planned. Start with one — "Nani, what do you
          remember about your wedding day?" is often the first.
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {list.map((i) => (
            <li key={i.id}>
              <InterviewCard item={i} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function InterviewCard({ item }: { item: VideoInterview }) {
  const updateInterview = useVideographyStore((s) => s.updateInterview);
  const deleteInterview = useVideographyStore((s) => s.deleteInterview);
  const toggleCaptured = useVideographyStore((s) => s.toggleInterviewCaptured);
  const addInterview = useVideographyStore((s) => s.addInterview);

  function handleDelete() {
    const snap = { ...item };
    deleteInterview(item.id);
    pushUndo({
      message: `Removed ${snap.person_name || "interview"}`,
      undo: () =>
        addInterview({
          category_id: snap.category_id,
          person_name: snap.person_name,
          relationship: snap.relationship,
          question: snap.question,
          event_day: snap.event_day,
          time_slot: snap.time_slot,
          location: snap.location,
          captured: snap.captured,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-white p-4 transition-colors",
        item.captured ? "border-sage/40 bg-sage-pale/10" : "border-border",
      )}
    >
      <HoverRow className="items-start gap-3">
        <button
          type="button"
          onClick={() => toggleCaptured(item.id)}
          aria-label={item.captured ? "Mark as not captured" : "Mark as captured"}
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
            item.captured
              ? "bg-sage text-ivory"
              : "bg-ivory text-ink-muted hover:bg-saffron-pale/40 hover:text-saffron",
          )}
        >
          {item.captured ? (
            <Mic size={15} strokeWidth={1.8} />
          ) : (
            <MicOff size={15} strokeWidth={1.8} />
          )}
        </button>

        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <InlineText
              value={item.person_name}
              onSave={(v) => updateInterview(item.id, { person_name: v })}
              placeholder="Person name (e.g. Nani)"
              className="!p-0 font-serif text-[16px] text-ink"
            />
            <InlineText
              value={item.relationship ?? ""}
              onSave={(v) => updateInterview(item.id, { relationship: v })}
              placeholder="Relationship (optional)"
              emptyLabel="Add relationship…"
              allowEmpty
              className="!p-0 text-[12px] text-ink-muted"
            />
          </div>
          <div className="mt-2">
            <Eyebrow className="mb-1">Question</Eyebrow>
            <InlineText
              value={item.question ?? ""}
              onSave={(v) => updateInterview(item.id, { question: v })}
              variant="block"
              placeholder="What will you ask them on camera?"
              emptyLabel="Click to add a question…"
              allowEmpty
              className="!p-0 text-[13px] leading-relaxed text-ink"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <EventPicker
              value={item.event_day}
              onChange={(v) => updateInterview(item.id, { event_day: v })}
            />
            <SlotPicker
              value={item.time_slot}
              onChange={(v) => updateInterview(item.id, { time_slot: v })}
            />
            <div className="rounded-sm border border-border bg-white px-2.5 py-1.5">
              <Eyebrow className="mb-0.5">Location</Eyebrow>
              <InlineText
                value={item.location ?? ""}
                onSave={(v) => updateInterview(item.id, { location: v })}
                placeholder="Quiet corner, specific backdrop…"
                emptyLabel="Click to add…"
                allowEmpty
                className="!p-0 text-[12.5px] text-ink"
              />
            </div>
          </div>
        </HoverRow.Main>

        <HoverRow.Actions>
          <IconButton label="Delete interview" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>
    </div>
  );
}

function EventPicker({
  value,
  onChange,
}: {
  value?: VideoEventId;
  onChange: (v: VideoEventId | undefined) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-white px-2.5 py-1.5">
      <Eyebrow className="mb-0.5">Event</Eyebrow>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || undefined) as VideoEventId)}
        className="w-full bg-transparent text-[12.5px] text-ink focus:outline-none"
      >
        <option value="">—</option>
        {VIDEO_EVENTS.filter((e) => e.id !== "general").map((e) => (
          <option key={e.id} value={e.id}>
            {e.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SlotPicker({
  value,
  onChange,
}: {
  value?: InterviewSlot;
  onChange: (v: InterviewSlot | undefined) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-white px-2.5 py-1.5">
      <Eyebrow className="mb-0.5">Time slot</Eyebrow>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || undefined) as InterviewSlot)}
        className="w-full bg-transparent text-[12.5px] text-ink focus:outline-none"
      >
        <option value="">—</option>
        {(Object.keys(INTERVIEW_SLOT_LABEL) as InterviewSlot[]).map((s) => (
          <option key={s} value={s}>
            {INTERVIEW_SLOT_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
