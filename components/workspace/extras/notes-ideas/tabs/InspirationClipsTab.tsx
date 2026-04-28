"use client";

// ── Inspiration Clips tab ─────────────────────────────────────────────────
// Pinterest-style private boards. Top-level grid of board cards; clicking
// into a board shows the clips and lets you add more. "Send to X moodboard"
// is a visible affordance but stubbed — the destination workspaces don't yet
// expose a moodboard inbox.

import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNotesIdeasStore } from "@/stores/notes-ideas-store";
import type { Clip, ClipBoard, ClipDestination } from "@/types/notes-ideas";
import { cn } from "@/lib/utils";
import {
  InlineAdd,
  Section,
  TextArea,
  TextInput,
  formatShortDate,
} from "../ui";

const DESTINATION_LABELS: Record<ClipDestination, string> = {
  decor: "Décor",
  stationery: "Stationery",
  wardrobe: "Wardrobe",
  catering: "Catering",
  hmua: "Hair & Makeup",
  mehndi: "Mehendi",
  photography: "Photography",
  videography: "Videography",
  music: "Music",
};

export function InspirationClipsTab() {
  const boards = useNotesIdeasStore((s) => s.boards);
  const clips = useNotesIdeasStore((s) => s.clips);
  const addBoard = useNotesIdeasStore((s) => s.addBoard);
  const deleteBoard = useNotesIdeasStore((s) => s.deleteBoard);
  const clipsForBoard = useNotesIdeasStore((s) => s.clipsForBoard);

  const [openBoardId, setOpenBoardId] = useState<string | null>(null);
  const openBoard = openBoardId
    ? boards.find((b) => b.id === openBoardId)
    : null;

  if (openBoard) {
    return (
      <BoardDetail
        board={openBoard}
        clips={clipsForBoard(openBoard.id)}
        onBack={() => setOpenBoardId(null)}
        onDelete={() => {
          deleteBoard(openBoard.id);
          setOpenBoardId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Section
        eyebrow="INSPIRATION CLIPS"
        title="Save links, screenshots, and ideas organized by topic"
        description="Like Pinterest, but private. Clips saved here can be sent to the relevant workspace's moodboard with one click."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {boards.map((b) => {
            const count = clips.filter((c) => c.boardId === b.id).length;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpenBoardId(b.id)}
                className="group flex flex-col rounded-lg border border-border bg-white p-5 text-left transition-colors hover:border-saffron/40"
              >
                <h4 className="font-serif text-[17px] leading-tight text-ink">
                  {b.name}
                </h4>
                <p
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {count} {count === 1 ? "clip" : "clips"}
                  {b.destination && (
                    <> · → {DESTINATION_LABELS[b.destination]}</>
                  )}
                </p>
                <span className="mt-auto pt-4 text-[11.5px] text-ink-faint transition-colors group-hover:text-saffron">
                  Open →
                </span>
              </button>
            );
          })}
          <NewBoardCard onCreate={(name) => addBoard({ name })} />
        </div>
        <p className="mt-5 flex items-start gap-2 text-[12.5px] italic text-ink-muted">
          <Sparkles size={12} strokeWidth={1.8} className="mt-0.5 text-saffron" />
          Clips saved here can be sent to the relevant workspace's moodboard
          with one click.
        </p>
      </Section>
    </div>
  );
}

function NewBoardCard({ onCreate }: { onCreate: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <div className="flex flex-col justify-center rounded-lg border border-dashed border-saffron/50 bg-ivory-warm/40 p-5">
        <InlineAdd
          placeholder="Board name…"
          buttonLabel="Create"
          onAdd={(name) => {
            onCreate(name);
            setEditing(false);
          }}
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-ivory-warm/30 p-5 text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
    >
      <Plus size={16} strokeWidth={1.6} />
      <span
        className="font-mono text-[10px] uppercase tracking-[0.14em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        New board
      </span>
    </button>
  );
}

function BoardDetail({
  board,
  clips,
  onBack,
  onDelete,
}: {
  board: ClipBoard;
  clips: Clip[];
  onBack: () => void;
  onDelete: () => void;
}) {
  const addClip = useNotesIdeasStore((s) => s.addClip);
  const deleteClip = useNotesIdeasStore((s) => s.deleteClip);
  const [composing, setComposing] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={12} strokeWidth={1.8} /> All boards
        </button>
        <div className="flex items-center gap-2">
          {board.destination && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              Send to {DESTINATION_LABELS[board.destination]} moodboard
              <ArrowRight size={12} strokeWidth={1.8} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setComposing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={13} strokeWidth={1.8} /> New clip
          </button>
        </div>
      </div>

      <Section eyebrow="BOARD" title={board.name}>
        {composing && (
          <div className="mb-5">
            <ClipComposer
              onSave={(payload) => {
                addClip({ boardId: board.id, ...payload });
                setComposing(false);
              }}
              onCancel={() => setComposing(false)}
            />
          </div>
        )}

        {clips.length === 0 && !composing ? (
          <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
            <p className="font-serif text-[18px] italic text-ink">
              Nothing pinned here yet.
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Paste a link, drop an image, or type an idea to start this board.
            </p>
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Plus size={13} strokeWidth={1.8} /> Add first clip
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {clips.map((c) => (
              <li key={c.id}>
                <ClipCard clip={c} onDelete={() => deleteClip(c.id)} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[12px] text-ink-faint hover:text-rose"
        >
          <Trash2 size={12} strokeWidth={1.8} /> Delete board
        </button>
      </div>
    </div>
  );
}

function ClipCard({
  clip,
  onDelete,
}: {
  clip: Clip;
  onDelete: () => void;
}) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-white p-4 transition-colors hover:border-saffron/40">
      <div className="aspect-[4/3] w-full rounded-md bg-ivory-warm" />
      {clip.title && (
        <h5 className="mt-3 font-serif text-[14px] leading-snug text-ink">
          {clip.title}
        </h5>
      )}
      {clip.note && (
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          {clip.note}
        </p>
      )}
      <footer className="mt-auto flex items-center justify-between gap-2 pt-3">
        <time
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatShortDate(clip.savedAt)}
        </time>
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {clip.url && (
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-saffron",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Open
            </a>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete clip"
            className="text-ink-faint hover:text-rose"
          >
            <Trash2 size={11} strokeWidth={1.8} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function ClipComposer({
  onSave,
  onCancel,
}: {
  onSave: (payload: {
    title?: string;
    url?: string;
    note?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    if (!title.trim() && !url.trim() && !note.trim()) return;
    onSave({
      title: title.trim() || undefined,
      url: url.trim() || undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-saffron/40 bg-ivory-warm/30 p-4">
      <TextInput
        value={title}
        onChange={setTitle}
        placeholder="Title (optional)…"
        autoFocus
      />
      <TextInput
        value={url}
        onChange={setUrl}
        placeholder="Link (optional)…"
      />
      <TextArea
        value={note}
        onChange={setNote}
        placeholder="What drew you to this? (optional)"
        rows={3}
      />
      <div className="flex justify-end gap-2">
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
          Save clip
        </button>
      </div>
    </div>
  );
}
