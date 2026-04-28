"use client";

// ── JournalPanel ───────────────────────────────────────────────────────────
// Category-scoped Journal view. Used by the workspace Journal tab
// (`<JournalPanel category="photography" />`) and by the Overview preview
// in compact mode. Reads the SAME store as the main-nav Journal —
// filtering is the only difference. No duplicated data.
//
// Beyond filtering, this view adds category-specific enrichment actions
// that do not make sense in the undifferentiated main-nav view:
//   · Add to moodboard (extract hero image → Vision tab)
//   · Extract style keywords (AI → Vision keywords)        [stub]
//   · Add to shortlist                                      [stub]
//   · Create task (Journal takeaway → checklist)
//   · Add to shot list (photography only)                   [stub]
//
// Stubs record the intent and show a toast — full wiring lives in
// follow-up work as noted in the spec.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ImagePlus,
  ListPlus,
  Sparkles,
  UserPlus,
  Camera,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournalEntriesStore } from "@/stores/journal-entries-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { JournalEntryComposer } from "./JournalEntryComposer";
import { JournalEntryCard } from "./JournalEntryCard";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { CATEGORY_LABEL } from "@/lib/journal/category-vocab";
import type { JournalEntry, SourceRef } from "@/types/journal-entries";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export function JournalPanel({
  category,
  compact = false,
  limit,
}: {
  category: WorkspaceCategoryTag;
  compact?: boolean;
  limit?: number;
}) {
  const entries = useJournalEntriesStore((s) => s.entries);
  const categoryLabel = CATEGORY_LABEL[category];

  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = entries
      .filter((e) => e.categoryTags.includes(category))
      .sort(
        (a, b) =>
          new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime(),
      );
    return limit ? list.slice(0, limit) : list;
  }, [entries, category, limit]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {!compact && (
        <header className="flex items-end justify-between gap-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {categoryLabel} Journal
            </p>
            <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
              {filtered.length === 0
                ? "No entries yet"
                : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} from your Journal tagged ${categoryLabel.toLowerCase()}`}
            </h2>
          </div>
          <Link
            href="/journal"
            className="text-[11.5px] text-ink-muted hover:text-saffron"
          >
            View full Journal →
          </Link>
        </header>
      )}

      {!compact && (
        <JournalEntryComposer
          pinnedCategory={category}
          placeholderUrl={`Paste a ${categoryLabel.toLowerCase()}-relevant link — will be tagged ${categoryLabel.toLowerCase()}…`}
        />
      )}

      {filtered.length === 0 ? (
        !compact && (
          <div className="rounded-lg border border-dashed border-gold/25 bg-white px-6 py-10 text-center">
            <BookOpen
              size={24}
              strokeWidth={1.4}
              className="mx-auto mb-2 text-ink-faint"
            />
            <p className="text-[13px] text-ink-muted">
              Save an article, podcast, or note above — tagged entries will
              show up here.
            </p>
          </div>
        )
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            !compact && "md:grid-cols-2",
          )}
        >
          {filtered.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={compact ? undefined : setEditing}
              actionsSlot={
                compact ? null : (
                  <EnrichmentActions
                    entry={entry}
                    category={category}
                    onToast={showToast}
                  />
                )
              }
            />
          ))}
        </div>
      )}

      {compact && filtered.length > 0 && (
        <div className="text-right">
          <Link
            href={`?tab=journal`}
            className="text-[11.5px] text-saffron hover:text-saffron/80"
          >
            See more →
          </Link>
        </div>
      )}

      {editing && (
        <JournalEntryEditor
          entry={entries.find((e) => e.id === editing.id) ?? editing}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-2 text-[12px] text-ivory shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Enrichment actions ─────────────────────────────────────────────────────

function EnrichmentActions({
  entry,
  category,
  onToast,
}: {
  entry: JournalEntry;
  category: WorkspaceCategoryTag;
  onToast: (msg: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const getCategory = useWorkspaceStore((s) => s.getCategory);
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);
  const updateChecklistItem = useChecklistStore((s) => s.updateItem);

  const sourceRef: SourceRef = {
    kind: "journal",
    entryId: entry.id,
    entryTitle: entry.title,
  };

  const handleAddToMoodboard = () => {
    if (!entry.image) {
      onToast("This entry has no image to add");
      return;
    }
    const workspaceCat = getCategory(category);
    if (!workspaceCat) {
      onToast("Workspace not initialized for this category");
      return;
    }
    addMoodboardItem(
      workspaceCat.id,
      entry.image,
      entry.title.slice(0, 80),
      sourceRef,
    );
    onToast(`Added to ${CATEGORY_LABEL[category]} moodboard`);
    setMenuOpen(false);
  };

  const handleCreateTask = () => {
    try {
      const created = addCustomItem({
        phase_id: "p2",
        subsection: category,
        title: entry.title.slice(0, 80),
        description: entry.description ?? entry.bodyMarkdown ?? "",
        priority: "medium",
        notes: entry.url ? `Source: ${entry.url}` : "",
      });
      // Patch the two fields addCustomItem doesn't wire natively.
      updateChecklistItem(created.id, {
        category_tags: [category],
        source_ref: sourceRef,
      });
      onToast("Task created in Checklist");
    } catch {
      onToast("Could not create task");
    }
    setMenuOpen(false);
  };

  const handleStub = (label: string) => {
    onToast(`${label} — coming soon`);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        icon={<ImagePlus size={11} strokeWidth={1.8} />}
        label="Add to moodboard"
        onClick={handleAddToMoodboard}
        disabled={!entry.image}
      />
      <ActionButton
        icon={<ListPlus size={11} strokeWidth={1.8} />}
        label="Create task"
        onClick={handleCreateTask}
      />
      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded p-1 text-ink-muted hover:bg-ivory hover:text-ink"
          aria-label="More actions"
        >
          <MoreHorizontal size={13} strokeWidth={1.8} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-md border border-gold/20 bg-white p-1 shadow-lg">
            <MenuRow
              icon={<Sparkles size={11} strokeWidth={1.8} />}
              label="Extract style keywords"
              onClick={() => handleStub("Extract style keywords")}
            />
            <MenuRow
              icon={<UserPlus size={11} strokeWidth={1.8} />}
              label="Add to shortlist"
              onClick={() => handleStub("Add to shortlist")}
            />
            {category === "photography" && (
              <MenuRow
                icon={<Camera size={11} strokeWidth={1.8} />}
                label="Add to shot list"
                onClick={() => handleStub("Add to shot list")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded border border-gold/20 bg-white px-2 py-[3px] text-[10.5px] text-ink-muted hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-50"
      title={disabled ? "No image on this entry" : undefined}
    >
      {icon}
      {label}
    </button>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11.5px] text-ink hover:bg-ivory"
    >
      {icon}
      {label}
    </button>
  );
}
