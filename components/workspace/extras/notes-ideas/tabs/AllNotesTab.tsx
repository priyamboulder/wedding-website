"use client";

// ── All Notes tab ─────────────────────────────────────────────────────────
// The main notebook surface. Lists every note (tag-filterable), with a
// compose panel that appears on "New note" and inline edit on click.
// Private notes show a 🔒 indicator and sit under the same list — the
// privacy toggle is part of the note editor.

import { Lock, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotesIdeasStore } from "@/stores/notes-ideas-store";
import type { Note, NoteTag } from "@/types/notes-ideas";
import { NOTE_TAGS } from "@/types/notes-ideas";
import { cn } from "@/lib/utils";
import {
  Section,
  TagChip,
  TagFilterBar,
  TextArea,
  TextInput,
  formatShortDate,
} from "../ui";

export function AllNotesTab() {
  const notesByTag = useNotesIdeasStore((s) => s.notesByTag);
  const addNote = useNotesIdeasStore((s) => s.addNote);
  const deleteNote = useNotesIdeasStore((s) => s.deleteNote);
  const updateNote = useNotesIdeasStore((s) => s.updateNote);
  const toggleNotePrivacy = useNotesIdeasStore((s) => s.toggleNotePrivacy);

  const [filter, setFilter] = useState<NoteTag | null>(null);
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const notes = useMemo(() => notesByTag(filter), [notesByTag, filter]);

  return (
    <div className="space-y-5">
      <Section
        eyebrow="YOUR NOTES & IDEAS"
        title="Your private planning notebook"
        description="Capture thoughts, save links, write letters to your future married self."
        right={
          <button
            type="button"
            onClick={() => setComposing((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              composing
                ? "border border-border bg-white text-ink-muted hover:text-ink"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            {composing ? (
              <>
                <X size={13} strokeWidth={1.8} /> Close
              </>
            ) : (
              <>
                <Plus size={13} strokeWidth={1.8} /> New note
              </>
            )}
          </button>
        }
      >
        {composing && (
          <div className="mb-5">
            <NoteComposer
              onSave={(payload) => {
                addNote(payload);
                setComposing(false);
              }}
              onCancel={() => setComposing(false)}
            />
          </div>
        )}
        <TagFilterBar value={filter} onChange={setFilter} />
      </Section>

      {notes.length === 0 ? (
        <EmptyState
          onCompose={() => {
            setComposing(true);
            setFilter(null);
          }}
          filtered={filter !== null}
        />
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id}>
              {editingId === n.id ? (
                <NoteComposer
                  initial={n}
                  onSave={(payload) => {
                    updateNote(n.id, payload);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => {
                    deleteNote(n.id);
                    setEditingId(null);
                  }}
                />
              ) : (
                <NoteCard
                  note={n}
                  onEdit={() => setEditingId(n.id)}
                  onTogglePrivacy={() => toggleNotePrivacy(n.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onTogglePrivacy,
}: {
  note: Note;
  onEdit: () => void;
  onTogglePrivacy: () => void;
}) {
  return (
    <article className="group rounded-lg border border-border bg-white p-5 transition-colors hover:border-saffron/40">
      <header className="flex items-baseline justify-between gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 text-left font-serif text-[17px] leading-tight text-ink hover:text-saffron"
        >
          {note.title}
          {note.isPrivate && (
            <Lock
              size={12}
              strokeWidth={1.8}
              className="ml-2 inline text-ink-faint"
              aria-label="Private"
            />
          )}
        </button>
        <time
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatShortDate(note.updatedAt)}
        </time>
      </header>
      <p
        className="mt-2 text-[13px] leading-relaxed text-ink-muted"
        onClick={onEdit}
      >
        {note.body}
      </p>
      {(note.tags.length > 0 || note.link || note.isPrivate) && (
        <footer className="mt-3 flex flex-wrap items-center gap-2">
          {note.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
          {note.link && (
            <a
              href={note.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
              onClick={(e) => e.stopPropagation()}
            >
              Link: {note.link.label ?? shortHost(note.link.url)}
            </a>
          )}
          <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onTogglePrivacy}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {note.isPrivate ? "Unlock" : "Make private"}
            </button>
          </div>
        </footer>
      )}
    </article>
  );
}

interface NoteComposerPayload {
  title: string;
  body: string;
  tags: NoteTag[];
  link?: { url: string };
  isPrivate: boolean;
}

function NoteComposer({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: Note;
  onSave: (payload: NoteComposerPayload) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState<NoteTag[]>(initial?.tags ?? []);
  const [link, setLink] = useState(initial?.link?.url ?? "");
  const [isPrivate, setIsPrivate] = useState(initial?.isPrivate ?? false);

  function toggleTag(t: NoteTag) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function submit() {
    if (!title.trim() && !body.trim()) return;
    onSave({
      title: title.trim() || "Untitled note",
      body: body.trim(),
      tags,
      link: link.trim() ? { url: link.trim() } : undefined,
      isPrivate,
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-saffron/40 bg-ivory-warm/30 p-4">
      <TextInput
        value={title}
        onChange={setTitle}
        placeholder="Note title…"
        autoFocus
      />
      <TextArea
        value={body}
        onChange={setBody}
        placeholder="Write what you want to remember…"
        rows={4}
      />
      <TextInput
        value={link}
        onChange={setLink}
        placeholder="Optional link (https://…)"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Tags —
        </span>
        {NOTE_TAGS.map((t) => {
          const active = tags.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-[12px] text-ink-muted">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-3.5 w-3.5 accent-ink"
          />
          <Lock size={11} strokeWidth={1.8} />
          Private — only I can see this
        </label>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-[12px] text-ink-faint hover:text-rose"
            >
              <Trash2 size={12} strokeWidth={1.8} /> Delete
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onCompose,
  filtered,
}: {
  onCompose: () => void;
  filtered: boolean;
}) {
  if (filtered) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <p className="font-serif text-[18px] italic text-ink">
          No notes under that tag yet.
        </p>
        <p className="mt-2 text-[13px] text-ink-muted">
          Clear the filter to see everything, or start a new note here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-16 text-center">
      <p className="font-serif text-[22px] italic leading-tight text-ink">
        Your notebook is empty.
      </p>
      <p className="mt-2 max-w-sm text-[13px] text-ink-muted">
        A seating-chart anxiety, a song stuck in your head, a quote from your
        Pandit-ji — start anywhere.
      </p>
      <button
        type="button"
        onClick={onCompose}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={13} strokeWidth={1.8} /> Write the first one
      </button>
    </div>
  );
}

function shortHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
