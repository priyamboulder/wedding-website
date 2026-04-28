"use client";

import { useState } from "react";
import { Images, Palette as PaletteIcon, StickyNote, Trash2, Plus, Check } from "lucide-react";
import type { WorkspaceMoodboardItem, WorkspaceNote } from "@/types/workspace";
import { PanelCard, EmptyRow, Eyebrow } from "./primitives";
import { SourceAttribution } from "@/components/journal/entries/SourceAttribution";
import { cn } from "@/lib/utils";

// ── Moodboard ──────────────────────────────────────────────────────────────
export function MoodboardBlock({
  items,
  editable = false,
  onRemove,
  onAdd,
}: {
  items: WorkspaceMoodboardItem[];
  editable?: boolean;
  onRemove?: (id: string) => void;
  onAdd?: (url: string, caption: string) => void;
}) {
  const [draftUrl, setDraftUrl] = useState("");
  const [draftCaption, setDraftCaption] = useState("");

  const submit = () => {
    if (!draftUrl.trim() || !onAdd) return;
    onAdd(draftUrl.trim(), draftCaption.trim());
    setDraftUrl("");
    setDraftCaption("");
  };

  return (
    <PanelCard
      icon={<Images size={14} strokeWidth={1.8} />}
      title="Moodboard"
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <EmptyRow>Pin references here to shape the look and feel.</EmptyRow>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((m) => (
            <li
              key={m.id}
              className="group relative overflow-hidden rounded-md ring-1 ring-border"
            >
              <div className="aspect-[4/3] bg-ivory-warm">
                <img
                  src={m.image_url}
                  alt={m.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              {(m.caption || m.source) && (
                <div className="bg-white px-3 py-1.5">
                  {m.caption && (
                    <p className="text-[11.5px] text-ink-muted">{m.caption}</p>
                  )}
                  {m.source && (
                    <SourceAttribution source={m.source} className="mt-0.5" />
                  )}
                </div>
              )}
              {editable && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 size={12} strokeWidth={1.8} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && onAdd && (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="Image URL"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <input
            value={draftCaption}
            onChange={(e) => setDraftCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draftUrl.trim()}
            className="inline-flex items-center justify-center gap-1 rounded-sm bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory disabled:opacity-40"
          >
            <Plus size={12} strokeWidth={2} />
            Add
          </button>
        </div>
      )}
    </PanelCard>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
export function PaletteBlock({ swatches }: { swatches: string[] }) {
  return (
    <PanelCard icon={<PaletteIcon size={14} strokeWidth={1.8} />} title="Palette">
      {swatches.length === 0 ? (
        <EmptyRow>No palette set.</EmptyRow>
      ) : (
        <div className="flex flex-wrap gap-3">
          {swatches.map((c) => (
            <div key={c} className="flex flex-col items-center gap-1">
              <div
                className="h-14 w-14 rounded-md shadow-sm ring-1 ring-border"
                style={{ backgroundColor: c }}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                {c}
              </span>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}

// ── Notes thread ───────────────────────────────────────────────────────────
export function NotesBlock({
  notes,
  editable = false,
  onAdd,
  onDelete,
  title = "Notes",
}: {
  notes: WorkspaceNote[];
  editable?: boolean;
  onAdd?: (body: string) => void;
  onDelete?: (id: string) => void;
  title?: string;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body || !onAdd) return;
    onAdd(body);
    setDraft("");
  };

  return (
    <PanelCard
      icon={<StickyNote size={14} strokeWidth={1.8} />}
      title={title}
      className="lg:col-span-2"
    >
      {notes.length === 0 ? (
        <EmptyRow>No notes yet.</EmptyRow>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="group rounded-md border border-border/60 bg-ivory-warm/30 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
                  {n.body}
                </p>
                {editable && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(n.id)}
                    className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                    aria-label="Delete note"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-ink-faint">
                <Eyebrow>{n.author_id}</Eyebrow>
                <span className="text-ink-faint">·</span>
                <span className="font-mono text-[10px]">
                  {new Date(n.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editable && onAdd && (
        <div className="mt-3 rounded-md border border-dashed border-border bg-white p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent p-0 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-3 py-1 text-[11px] font-medium transition-colors",
                draft.trim()
                  ? "bg-ink text-ivory"
                  : "bg-ivory-warm text-ink-faint",
              )}
            >
              <Check size={12} strokeWidth={2} /> Save
            </button>
          </div>
        </div>
      )}
    </PanelCard>
  );
}
