"use client";

// ── YourJournalSection ─────────────────────────────────────────────────────
// The user-authored section of the main-nav /journal page — distinct
// from the editorial magazine feed above it. Composer + full list of
// saved entries + tag filter + search.

import { useMemo, useState } from "react";
import { BookOpenText, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournalEntriesStore } from "@/stores/journal-entries-store";
import { JournalEntryComposer } from "./JournalEntryComposer";
import { JournalEntryCard } from "./JournalEntryCard";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { CATEGORY_TAG_META, CATEGORY_LABEL } from "@/lib/journal/category-vocab";
import type { JournalEntry } from "@/types/journal-entries";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export function YourJournalSection() {
  const entries = useJournalEntriesStore((s) => s.entries);

  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState<WorkspaceCategoryTag | null>(
    null,
  );
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => !filterTag || e.categoryTags.includes(filterTag))
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q) ||
          (e.bodyMarkdown ?? "").toLowerCase().includes(q) ||
          (e.domain ?? "").toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime(),
      );
  }, [entries, query, filterTag]);

  return (
    <section className="border-t border-gold/15 bg-ivory/40 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Your Journal
            </p>
            <h2 className="mt-1 font-serif text-[26px] leading-tight text-ink">
              Saved articles, notes & finds
            </h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Paste a link or write a note. Tag it to any vendor category and
              it will appear inside that workspace&rsquo;s Journal tab.
            </p>
          </div>
          <BookOpenText
            size={28}
            strokeWidth={1.4}
            className="text-saffron/40"
          />
        </div>

        <JournalEntryComposer className="mb-6" />

        {entries.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={12}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your entries…"
                className="w-full rounded border border-gold/20 bg-white py-1.5 pl-7 pr-3 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            </div>
            <TagFilter
              value={filterTag}
              onChange={setFilterTag}
              entries={entries}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gold/25 bg-white px-6 py-10 text-center">
            <p className="text-[13px] text-ink-muted">
              {entries.length === 0
                ? "Nothing saved yet. Paste a URL above to start building your Journal."
                : "No entries match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={setEditing}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <JournalEntryEditor
          entry={
            // Always pull the latest from the store so debounced edits
            // stay in sync if the list changes underneath us.
            entries.find((e) => e.id === editing.id) ?? editing
          }
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function TagFilter({
  value,
  onChange,
  entries,
}: {
  value: WorkspaceCategoryTag | null;
  onChange: (v: WorkspaceCategoryTag | null) => void;
  entries: JournalEntry[];
}) {
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<WorkspaceCategoryTag, number>();
    entries.forEach((e) => {
      e.categoryTags.forEach((t) => {
        map.set(t, (map.get(t) ?? 0) + 1);
      });
    });
    return map;
  }, [entries]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded border border-gold/20 bg-white px-2.5 py-1.5 text-[11px]",
          value ? "text-saffron" : "text-ink-muted",
        )}
      >
        <Filter size={11} strokeWidth={1.8} />
        {value ? CATEGORY_LABEL[value] : "All categories"}
        {value && (
          <span
            role="button"
            aria-label="Clear filter"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="ml-1 rounded-full p-[1px] hover:bg-saffron/10"
          >
            <X size={9} strokeWidth={2} />
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-gold/20 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-[12px] text-ink-muted hover:bg-ivory hover:text-ink"
          >
            All categories
            <span className="text-[10px] text-ink-faint">{entries.length}</span>
          </button>
          {CATEGORY_TAG_META.filter((c) => (counts.get(c.slug) ?? 0) > 0).map(
            (c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  onChange(c.slug);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded px-2 py-1 text-[12px] hover:bg-ivory hover:text-ink",
                  value === c.slug ? "text-saffron" : "text-ink",
                )}
              >
                {c.label}
                <span className="text-[10px] text-ink-faint">
                  {counts.get(c.slug)}
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
