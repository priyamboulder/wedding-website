"use client";

// ── JournalEntryComposer ───────────────────────────────────────────────────
// Inline composer: user pastes a URL OR writes a note. On URL paste, we
// hit /api/link-preview, prefill title/description/image/domain, infer
// kind, create the entry, then kick off auto-tag in the background.
//
// `pinnedCategory` is passed from workspace Journal tabs so new entries
// are pre-tagged for the active category.

import { useRef, useState } from "react";
import { Loader2, Plus, StickyNote, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournalEntriesStore } from "@/stores/journal-entries-store";
import { inferKind } from "@/lib/journal/kind-inference";
import { fetchAutoTagSuggestions } from "@/lib/journal/auto-tag-client";
import type { LinkMetadata } from "@/lib/link-preview/types";
import type { WorkspaceCategoryTag } from "@/types/checklist";

type Mode = "url" | "note";

export function JournalEntryComposer({
  pinnedCategory,
  placeholderUrl = "Paste an article, podcast, video, or Pinterest URL…",
  placeholderNote = "Write a personal note or reflection…",
  className,
}: {
  pinnedCategory?: WorkspaceCategoryTag;
  placeholderUrl?: string;
  placeholderNote?: string;
  className?: string;
}) {
  const addEntry = useJournalEntriesStore((s) => s.addEntry);
  const setAutoTagSuggestions = useJournalEntriesStore(
    (s) => s.setAutoTagSuggestions,
  );

  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const triggerAutoTag = async (
    entryId: string,
    data: {
      title: string;
      description?: string;
      domain?: string;
      bodyMarkdown?: string;
    },
  ) => {
    const suggestions = await fetchAutoTagSuggestions(data);
    setAutoTagSuggestions(entryId, suggestions);
  };

  const submitUrl = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      let meta: LinkMetadata | null = null;
      if (res.ok) {
        meta = (await res.json()) as LinkMetadata;
      }

      const kind = inferKind(
        trimmed,
        meta
          ? {
              siteName: meta.siteName ?? undefined,
              domain: meta.domain ?? undefined,
            }
          : undefined,
      );
      const categoryTags = pinnedCategory ? [pinnedCategory] : [];

      const entry = addEntry({
        kind,
        url: trimmed,
        title: meta?.title?.trim() || trimmed,
        description: meta?.description ?? undefined,
        image: meta?.image ?? undefined,
        domain: meta?.domain ?? undefined,
        favicon: meta?.favicon ?? undefined,
        categoryTags,
      });

      setUrl("");
      urlInputRef.current?.focus();

      // Fire-and-forget. Suggestions arrive seconds later.
      triggerAutoTag(entry.id, {
        title: entry.title,
        description: entry.description,
        domain: entry.domain,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save link");
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async () => {
    const title = noteTitle.trim();
    const body = noteBody.trim();
    if (!title && !body) return;
    setBusy(true);
    setError(null);
    try {
      const entry = addEntry({
        kind: "note",
        title: title || body.slice(0, 60),
        bodyMarkdown: body || undefined,
        categoryTags: pinnedCategory ? [pinnedCategory] : [],
      });
      setNoteTitle("");
      setNoteBody("");

      triggerAutoTag(entry.id, {
        title: entry.title,
        bodyMarkdown: entry.bodyMarkdown,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-gold/20 bg-white p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-1">
        <ModeToggle
          mode={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
        />
        {pinnedCategory && (
          <span
            className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Tagged: {pinnedCategory.replace("_", " ")}
          </span>
        )}
      </div>

      {mode === "url" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUrl();
          }}
          className="flex gap-2"
        >
          <input
            ref={urlInputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholderUrl}
            disabled={busy}
            className="flex-1 rounded border border-gold/20 bg-ivory px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="inline-flex items-center gap-1.5 rounded bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={13} className="animate-spin" strokeWidth={1.8} />
            ) : (
              <Plus size={13} strokeWidth={1.8} />
            )}
            Save
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitNote();
          }}
          className="flex flex-col gap-2"
        >
          <input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title (optional)…"
            disabled={busy}
            className="rounded border border-gold/20 bg-ivory px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder={placeholderNote}
            disabled={busy}
            rows={3}
            className="rounded border border-gold/20 bg-ivory px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] italic text-ink-faint">
              Lightweight markdown — paragraphs and `- ` bullets.
            </p>
            <button
              type="submit"
              disabled={busy || (!noteTitle.trim() && !noteBody.trim())}
              className="inline-flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                  strokeWidth={1.8}
                />
              ) : (
                <StickyNote size={13} strokeWidth={1.8} />
              )}
              Save note
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-2 text-[11px] italic text-red-500">{error}</p>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-gold/20 p-[2px]">
      <ModeBtn active={mode === "url"} onClick={() => onChange("url")}>
        <LinkIcon size={11} strokeWidth={1.8} />
        URL
      </ModeBtn>
      <ModeBtn active={mode === "note"} onClick={() => onChange("note")}>
        <StickyNote size={11} strokeWidth={1.8} />
        Note
      </ModeBtn>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-[3px] text-[11px] font-medium transition-colors",
        active
          ? "bg-ink text-ivory"
          : "text-ink-muted hover:bg-ivory hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
