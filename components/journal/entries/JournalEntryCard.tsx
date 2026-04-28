"use client";

// ── JournalEntryCard ───────────────────────────────────────────────────────
// Used by the main-nav /journal "Your Journal" section AND by the
// workspace Journal tab. `actionsSlot` lets the caller inject
// category-specific enrichment actions (add-to-moodboard, extract
// keywords, etc.) — the main-nav view passes nothing; the workspace
// view passes a kebab menu.

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryTagChips } from "./CategoryTagChips";
import { KindBadge } from "./KindBadge";
import { useJournalEntriesStore } from "@/stores/journal-entries-store";
import { fetchAutoTagSuggestions } from "@/lib/journal/auto-tag-client";
import type { JournalEntry } from "@/types/journal-entries";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export function JournalEntryCard({
  entry,
  onEdit,
  actionsSlot,
  defaultExpanded = false,
}: {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  actionsSlot?: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [autoTagBusy, setAutoTagBusy] = useState(false);

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
  const deleteEntry = useJournalEntriesStore((s) => s.deleteEntry);

  const runAutoTag = async () => {
    setAutoTagBusy(true);
    try {
      const suggestions = await fetchAutoTagSuggestions(entry);
      setAutoTagSuggestions(entry.id, suggestions);
    } finally {
      setAutoTagBusy(false);
    }
  };

  const hasBody = Boolean(entry.bodyMarkdown?.trim());

  return (
    <article className="group relative overflow-hidden rounded-lg border border-gold/15 bg-white transition-shadow hover:shadow-sm">
      <div className="flex gap-3 p-3">
        {entry.image && (
          <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-ivory">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <KindBadge kind={entry.kind} />
            {entry.domain && (
              <span className="truncate text-[10px] text-ink-faint">
                {entry.domain}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="rounded p-1 text-ink-muted hover:bg-ivory hover:text-ink"
                  aria-label="Edit entry"
                >
                  <Pencil size={12} strokeWidth={1.8} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this Journal entry?")) {
                    deleteEntry(entry.id);
                  }
                }}
                className="rounded p-1 text-ink-muted hover:bg-ivory hover:text-red-500"
                aria-label="Delete entry"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </span>
          </div>

          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-serif text-[15px] leading-tight text-ink">
              {entry.url ? (
                <Link
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:decoration-saffron/40"
                >
                  {entry.title}
                </Link>
              ) : (
                entry.title
              )}
            </h3>
            {entry.url && (
              <Link
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex-shrink-0 text-ink-faint hover:text-saffron"
                aria-label="Open link"
              >
                <ExternalLink size={13} strokeWidth={1.8} />
              </Link>
            )}
          </div>

          {entry.description && (
            <p className="line-clamp-2 text-[12px] text-ink-muted">
              {entry.description}
            </p>
          )}

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
            size="sm"
          />

          {hasBody && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-0.5 inline-flex items-center gap-1 self-start text-[10.5px] text-ink-muted hover:text-ink"
            >
              {expanded ? (
                <>
                  <ChevronUp size={10} strokeWidth={2} />
                  Hide note
                </>
              ) : (
                <>
                  <ChevronDown size={10} strokeWidth={2} />
                  Read note
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {hasBody && expanded && (
        <div className="border-t border-gold/10 bg-ivory/40 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          <NoteBody body={entry.bodyMarkdown!} />
        </div>
      )}

      {actionsSlot && (
        <div className="border-t border-gold/10 bg-ivory/20 px-3 py-2">
          {actionsSlot}
        </div>
      )}
    </article>
  );
}

// Minimal markdown — paragraphs and bullets. Enough for personal notes.
function NoteBody({ body }: { body: string }) {
  const lines = body.split(/\n/);
  const blocks: React.ReactNode[] = [];
  let bulletBuf: string[] = [];

  const flushBullets = () => {
    if (bulletBuf.length === 0) return;
    blocks.push(
      <ul key={blocks.length} className="ml-5 list-disc space-y-1">
        {bulletBuf.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
    bulletBuf = [];
  };

  lines.forEach((raw, i) => {
    const t = raw.trim();
    if (!t) {
      flushBullets();
      return;
    }
    if (t.startsWith("- ") || t.startsWith("* ")) {
      bulletBuf.push(t.slice(2));
      return;
    }
    flushBullets();
    blocks.push(
      <p key={`p-${i}`} className="mb-2 last:mb-0">
        {t}
      </p>,
    );
  });
  flushBullets();
  return <>{blocks}</>;
}

// Re-export for the category-filtered view, which may need to build a
// custom card with extra callouts.
export type { JournalEntry, WorkspaceCategoryTag };
