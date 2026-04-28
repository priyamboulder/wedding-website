"use client";

// ── JournalEntryEditor ─────────────────────────────────────────────────────
// Full-field editor opened from a card's pencil icon. Everything is
// click-to-edit in place — title and body update live via updateEntry().

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useJournalEntriesStore } from "@/stores/journal-entries-store";
import { CategoryTagChips } from "./CategoryTagChips";
import { KindBadge } from "./KindBadge";
import { fetchAutoTagSuggestions } from "@/lib/journal/auto-tag-client";
import type { JournalEntry } from "@/types/journal-entries";

export function JournalEntryEditor({
  entry,
  onClose,
}: {
  entry: JournalEntry;
  onClose: () => void;
}) {
  const updateEntry = useJournalEntriesStore((s) => s.updateEntry);
  const addTag = useJournalEntriesStore((s) => s.addTag);
  const removeTag = useJournalEntriesStore((s) => s.removeTag);
  const acceptSuggestion = useJournalEntriesStore((s) => s.acceptSuggestion);
  const dismissSuggestion = useJournalEntriesStore((s) => s.dismissSuggestion);
  const dismissAllSuggestions = useJournalEntriesStore(
    (s) => s.dismissAllSuggestions,
  );
  const setAutoTagSuggestions = useJournalEntriesStore(
    (s) => s.setAutoTagSuggestions,
  );

  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description ?? "");
  const [body, setBody] = useState(entry.bodyMarkdown ?? "");
  const [autoTagBusy, setAutoTagBusy] = useState(false);

  // Sync local edits to store with a short debounce.
  useEffect(() => {
    const t = setTimeout(() => {
      if (
        title !== entry.title ||
        description !== (entry.description ?? "") ||
        body !== (entry.bodyMarkdown ?? "")
      ) {
        updateEntry(entry.id, {
          title,
          description: description || undefined,
          bodyMarkdown: body || undefined,
        });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [title, description, body, entry, updateEntry]);

  // Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runAutoTag = async () => {
    setAutoTagBusy(true);
    try {
      const suggestions = await fetchAutoTagSuggestions({
        title,
        description,
        domain: entry.domain,
        bodyMarkdown: body,
      });
      setAutoTagSuggestions(entry.id, suggestions);
    } finally {
      setAutoTagBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-gold/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-gold/15 px-5 py-3">
          <KindBadge kind={entry.kind} />
          {entry.domain && (
            <span className="text-[11px] text-ink-faint">{entry.domain}</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded p-1 text-ink-muted hover:bg-ivory hover:text-ink"
            aria-label="Close editor"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 bg-transparent font-serif text-[22px] text-ink outline-none focus:ring-0"
            placeholder="Untitled entry"
          />

          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-[11px] text-ink-faint hover:text-saffron"
            >
              {entry.url}
            </a>
          )}

          {entry.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.image}
              alt=""
              className="mt-3 max-h-48 w-full rounded border border-gold/15 object-cover"
            />
          )}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description…"
            rows={2}
            className="mt-3 w-full resize-none rounded border border-gold/20 bg-ivory px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />

          <label
            className="mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your notes
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Highlights, takeaways, anything you want to remember…"
            rows={8}
            className="mt-1 w-full resize-y rounded border border-gold/20 bg-ivory px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />

          <label
            className="mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Categories
          </label>
          <div className="mt-1.5">
            <CategoryTagChips
              tags={entry.categoryTags}
              suggestions={entry.autoTagSuggestions ?? []}
              editable
              onAdd={(t) => addTag(entry.id, t)}
              onRemove={(t) => removeTag(entry.id, t)}
              onAcceptSuggestion={(t) => acceptSuggestion(entry.id, t)}
              onDismissSuggestion={(t) => dismissSuggestion(entry.id, t)}
              onDismissAllSuggestions={() => dismissAllSuggestions(entry.id)}
              onRunAutoTag={runAutoTag}
              autoTagBusy={autoTagBusy}
            />
          </div>
        </div>

        <footer className="border-t border-gold/15 bg-ivory/40 px-5 py-2.5 text-[10.5px] italic text-ink-faint">
          Changes save automatically.
        </footer>
      </div>
    </div>
  );
}
