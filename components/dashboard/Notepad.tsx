"use client";

// ── Notepad ─────────────────────────────────────────────────────────────
// Full main-column quick-capture section. A roomy textarea anchored at
// the top, then a 2-column grid of sticky-note cards for the latest
// pinned/recent notes. Notes feel like paper pinned to a board (subtle
// rotation, warm pink shadow) without going full collage. Tints stay in
// the white / rose family — no champagne or cream.
//
// Exposes an imperative `focusInput` so the sidebar's Quick Actions can
// jump the user straight into capture mode.

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Archive,
  ImageIcon,
  Link2,
  Pin,
  PinOff,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { useDashboardNotepadStore } from "@/stores/dashboard-notepad-store";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { DashboardNote } from "@/stores/dashboard-notepad-store";
import { cn } from "@/lib/utils";

const URL_REGEX = /(https?:\/\/[^\s]+)/i;
const VISIBLE_LIMIT = 6;

export interface NotepadHandle {
  focusInput: () => void;
}

function eventLabel(
  events: ReturnType<typeof useEventsStore.getState>["events"],
  eventId: string | null | undefined,
): string | null {
  if (!eventId) return null;
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  return (
    event.customName?.trim() ||
    EVENT_TYPE_OPTIONS.find((o) => o.id === event.type)?.name ||
    event.type
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const Notepad = forwardRef<NotepadHandle>(function Notepad(_props, ref) {
  const notes = useDashboardNotepadStore((s) => s.notes);
  const addNote = useDashboardNotepadStore((s) => s.addNote);
  const togglePin = useDashboardNotepadStore((s) => s.togglePin);
  const toggleArchive = useDashboardNotepadStore((s) => s.toggleArchive);
  const deleteNote = useDashboardNotepadStore((s) => s.deleteNote);

  const events = useEventsStore((s) => s.events);

  const [draft, setDraft] = useState("");
  const [taggedEventId, setTaggedEventId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focusInput: () => inputRef.current?.focus(),
    }),
    [],
  );

  const visible = useMemo(() => {
    const active = notes
      .filter((n) => (showArchive ? true : !n.isArchived))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    return active.slice(0, VISIBLE_LIMIT);
  }, [notes, showArchive]);

  const remainder = Math.max(
    0,
    notes.filter((n) => (showArchive ? true : !n.isArchived)).length -
      visible.length,
  );

  const hasAnyNotes = notes.length > 0;

  const submit = () => {
    const text = draft.trim();
    if (!text && !pendingImage) return;
    const link = (text.match(URL_REGEX) || [])[0] ?? null;
    addNote({
      content: text,
      eventId: taggedEventId,
      imageUrl: pendingImage,
      linkUrl: link,
    });
    setDraft("");
    setPendingImage(null);
    setTaggedEventId(null);
    inputRef.current?.focus();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setPendingImage(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="notepad">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            <em>Notepad</em>
          </h2>
          <p className="dash-spread-sub">
            {hasAnyNotes
              ? "Catch the thoughts before they slip — venue ideas, song picks, anything."
              : "Jot a thought below — venue ideas, song picks, anything."}
          </p>
        </div>
        {hasAnyNotes && (
          <button
            type="button"
            onClick={() => setShowArchive((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)] transition-colors hover:text-[color:var(--dash-blush-deep)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {showArchive ? "Hide archived" : "Show archived"}
          </button>
        )}
      </div>

      <div
        className="dash-card p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onPaste={(e) => {
          const item = Array.from(e.clipboardData.items).find((i) =>
            i.type.startsWith("image/"),
          );
          if (item) {
            const file = item.getAsFile();
            if (file)
              handleFiles({
                0: file,
                length: 1,
                item: () => file,
              } as unknown as FileList);
          }
        }}
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Jot down a thought — venue idea, song for the sangeet, anything…"
          className="block w-full resize-none border-none bg-transparent px-1 py-1 font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text)] placeholder:italic placeholder:text-[color:var(--dash-text-faint)] focus:outline-none"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        />

        {pendingImage && (
          <div className="relative mt-2 inline-block">
            <img
              src={pendingImage}
              alt="Pending attachment"
              className="max-h-24 rounded-[4px]"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 shadow"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[color:rgba(45,45,45,0.06)] pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1 text-[12px] text-[color:var(--dash-text-muted)] transition-colors hover:text-[color:var(--dash-blush-deep)]"
            >
              <ImageIcon size={12} />
              Add image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {events.length > 0 && (
              <select
                value={taggedEventId ?? ""}
                onChange={(e) => setTaggedEventId(e.target.value || null)}
                aria-label="Tag to event"
                className="rounded-[4px] border border-transparent bg-[color:rgba(255,255,255,0.6)] px-2 py-1 text-[12px] text-[color:var(--dash-text-muted)] focus:border-[color:var(--dash-blush)] focus:outline-none"
              >
                <option value="">No event tag</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.customName?.trim() ||
                      EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ||
                      e.type}
                  </option>
                ))}
              </select>
            )}

            <span className="text-[11px] italic text-[color:var(--dash-text-faint)]">
              Press Enter to save
            </span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() && !pendingImage}
            className={cn(
              "dash-btn dash-btn--sm",
              !draft.trim() && !pendingImage && "opacity-50 cursor-not-allowed",
            )}
          >
            Save
          </button>
        </div>
      </div>

      {visible.length === 0 ? null : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((note, idx) => (
            <NoteCard
              key={note.id}
              note={note}
              white={idx % 2 === 1}
              rotateRight={idx % 2 === 0}
              eventName={eventLabel(events, note.eventId)}
              onPin={() => togglePin(note.id)}
              onArchive={() => toggleArchive(note.id)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </ul>
      )}

      {remainder > 0 && (
        <p className="mt-4 px-1 text-[12px] italic text-[color:var(--dash-text-muted)]">
          + {remainder} more — view all in your notebook.
        </p>
      )}
    </section>
  );
});

interface NoteCardProps {
  note: DashboardNote;
  white: boolean;
  rotateRight: boolean;
  eventName: string | null;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function NoteCard({
  note,
  white,
  rotateRight,
  eventName,
  onPin,
  onArchive,
  onDelete,
}: NoteCardProps) {
  return (
    <li
      className={cn(
        "dash-sticky group relative flex gap-3 px-4 py-4",
        white && "dash-sticky--white",
        rotateRight ? "dash-sticky--rotR" : "dash-sticky--rotL",
        note.isPinned && "ring-2 ring-[color:var(--dash-blush)]",
        note.isArchived && "opacity-60",
      )}
    >
      {note.isPinned && (
        <span
          aria-hidden
          className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[color:var(--dash-blush-deep)] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
        />
      )}

      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-[2px] object-cover shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
        />
      )}
      <div className="min-w-0 flex-1">
        {note.content && (
          <p
            className={cn(
              "whitespace-pre-wrap font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text)]",
              note.isPinned && "pl-4",
            )}
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            {note.content}
          </p>
        )}
        {note.linkUrl && (
          <a
            href={note.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate text-[12px] text-[color:var(--dash-blush-deep)] hover:underline"
          >
            <Link2 size={11} className="shrink-0" />
            <span className="truncate">{note.linkUrl}</span>
          </a>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] text-[color:var(--dash-text-faint)]">
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {relativeTime(note.createdAt)}
          </span>
          {eventName && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[color:var(--dash-blush-light)] px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.16em] text-[color:var(--dash-blush-deep)]">
              <TagIcon size={9} />
              {eventName}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onPin}
          aria-label={note.isPinned ? "Unpin" : "Pin"}
          className="text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-blush-deep)]"
        >
          {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
        </button>
        <button
          type="button"
          onClick={onArchive}
          aria-label={note.isArchived ? "Unarchive" : "Archive"}
          className="text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-blush-deep)]"
        >
          <Archive size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete note"
          className="text-[color:var(--dash-text-faint)] hover:text-[color:var(--color-terracotta)]"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}
