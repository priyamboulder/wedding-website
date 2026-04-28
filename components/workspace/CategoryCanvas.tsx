"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Eye,
  Heart,
  ListChecks,
  Mail,
  Milestone,
  Palette as PaletteIcon,
  Send,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WorkspaceCategory,
  WorkspaceTab as WorkspaceTabId,
} from "@/types/workspace";
import { STATUS_LABEL, STATUS_DOT } from "@/types/workspace";
import { SEED_PALETTES } from "@/lib/workspace-seed";
import { CategoryPlan } from "./CategoryPlan";
import { MoodboardBlock, NotesBlock, PaletteBlock } from "./blocks/vision-blocks";
import {
  DecisionsBlock,
  ScheduleBlock,
  ShortlistGridBlock,
} from "./blocks/generic-blocks";
import { JournalPanel } from "@/components/journal/entries/JournalPanel";

const TABS: Array<{ id: WorkspaceTabId; label: string; icon: React.ElementType }> = [
  { id: "vision", label: "Vision", icon: PaletteIcon },
  { id: "plan", label: "Plan", icon: ListChecks },
  { id: "shortlist", label: "Shortlist", icon: Heart },
  { id: "timeline", label: "Timeline", icon: Milestone },
  { id: "decisions", label: "Decisions & Notes", icon: StickyNote },
  { id: "journal", label: "Journal", icon: BookOpen },
];

export function CategoryCanvas({
  category,
  activeTab,
  onTabChange,
}: {
  category: WorkspaceCategory;
  activeTab: WorkspaceTabId;
  onTabChange: (t: WorkspaceTabId) => void;
}) {
  const vendors = useVendorsStore((s) => s.vendors);
  const assignedVendor = category.assigned_vendor_id
    ? vendors.find((v) => v.id === category.assigned_vendor_id)
    : null;

  // Subline
  let subline = STATUS_LABEL[category.status];
  if (category.status === "assigned" && assignedVendor) {
    subline = `Assigned — ${assignedVendor.name}`;
  } else if (category.status === "shortlisted") {
    subline = "Shortlisted — options being compared";
  } else if (category.status === "open") {
    subline = "Not started";
  }

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", STATUS_DOT[category.status])}
                aria-hidden
              />
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Workspace
              </p>
            </div>
            <h1 className="mt-1.5 font-serif text-[30px] leading-[1.1] text-ink">
              {category.name}
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-muted">{subline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {category.status === "assigned" && (
              <ActionButton icon={<Eye size={13} strokeWidth={1.8} />} label="View as vendor" />
            )}
            <ActionButton icon={<Send size={13} strokeWidth={1.8} />} label="Invite vendor" />
          </div>
        </div>

        {/* Tabs */}
        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label="Workspace sections"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto bg-ivory px-10 py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === "vision" && <VisionTabBody category={category} />}
          {activeTab === "plan" && <CategoryPlan category={category} />}
          {activeTab === "shortlist" && (
            <ShortlistGridBlock categorySlug={category.slug} />
          )}
          {activeTab === "timeline" && <TimelineTabBody category={category} />}
          {activeTab === "decisions" && <DecisionsTabBody category={category} />}
          {activeTab === "journal" && <JournalPanel category={category.slug} />}
        </div>
      </div>
    </main>
  );
}

// ── Tab: Vision ─────────────────────────────────────────────────────────────
function VisionTabBody({ category }: { category: WorkspaceCategory }) {
  const allMoodboard = useWorkspaceStore((s) => s.moodboard);
  const allNotes = useWorkspaceStore((s) => s.notes);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const deleteMoodboardItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);

  const moodboard = useMemo(
    () =>
      allMoodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allMoodboard, category.id],
  );
  const notes = useMemo(
    () =>
      allNotes
        .filter((n) => n.category_id === category.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [allNotes, category.id],
  );

  const palette = SEED_PALETTES[category.slug] ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MoodboardBlock
        items={moodboard}
        editable
        onAdd={(url, caption) => addMoodboardItem(category.id, url, caption)}
        onRemove={(id) => deleteMoodboardItem(id)}
      />
      <PaletteBlock swatches={palette} />
      <NotesBlock
        notes={notes}
        editable
        onAdd={(body) => addNote(category.id, body)}
        onDelete={(id) => deleteNote(id)}
      />
      <RecentJournalBlock categorySlug={category.slug} />
    </div>
  );
}

// ── Recent Journal preview (Vision tab) ─────────────────────────────────────
// 3 most recently edited Journal entries tagged with this category.
// "See more" hands off to the Journal tab. The spec called for this on an
// Overview tab; there is no Overview tab in this workspace, so it lives
// on Vision, which is the closest analog.
function RecentJournalBlock({
  categorySlug,
}: {
  categorySlug: WorkspaceCategory["slug"];
}) {
  return (
    <div className="rounded-lg border border-gold/15 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen
          size={13}
          strokeWidth={1.8}
          className="text-saffron/70"
        />
        <h3 className="font-serif text-[14.5px] text-ink">Recent Journal</h3>
      </div>
      <JournalPanel category={categorySlug} compact limit={3} />
    </div>
  );
}

// ── Tab: Timeline ───────────────────────────────────────────────────────────
function TimelineTabBody({ category }: { category: WorkspaceCategory }) {
  const allItems = useWorkspaceStore((s) => s.items);
  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.category_id === category.id && i.tab === "timeline")
        .sort((a, b) => a.sort_order - b.sort_order),
    [allItems, category.id],
  );
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ScheduleBlock items={items} />
    </div>
  );
}

// ── Tab: Decisions & Notes ──────────────────────────────────────────────────
function DecisionsTabBody({ category }: { category: WorkspaceCategory }) {
  const allDecisions = useWorkspaceStore((s) => s.decisions);
  const allNotes = useWorkspaceStore((s) => s.notes);
  const addDecision = useWorkspaceStore((s) => s.addDecision);
  const resolveDecision = useWorkspaceStore((s) => s.resolveDecision);
  const reopenDecision = useWorkspaceStore((s) => s.reopenDecision);
  const deleteDecision = useWorkspaceStore((s) => s.deleteDecision);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);

  const decisions = useMemo(
    () =>
      allDecisions
        .filter((d) => d.category_id === category.id)
        .sort((a, b) => (a.status === "open" ? -1 : 1)),
    [allDecisions, category.id],
  );
  const notes = useMemo(
    () =>
      allNotes
        .filter((n) => n.category_id === category.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [allNotes, category.id],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DecisionsBlock
        decisions={decisions}
        onResolve={(id) => resolveDecision(id)}
        onReopen={(id) => reopenDecision(id)}
        onAdd={(q) => addDecision(category.id, q)}
        onDelete={(id) => deleteDecision(id)}
      />
      <NotesBlock
        notes={notes}
        editable
        onAdd={(body) => addNote(category.id, body)}
        onDelete={(id) => deleteNote(id)}
        title="Running notes"
      />
    </div>
  );
}

// ── Small reusable action button ────────────────────────────────────────────
function ActionButton({
  icon,
  label,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        primary
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// Unused but kept for future invite-email action
const _mailIcon = Mail;
