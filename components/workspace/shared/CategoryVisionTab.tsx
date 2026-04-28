"use client";

// ── Generic Vision tab body ─────────────────────────────────────────────────
// Lean vision tab for categories without the photography-specific quiz and
// style-keyword apparatus. Provides a moodboard, palette, notes, and an
// optional couple-facing "what matters most here" note. Each category's
// canvas can add its own bespoke section above this (e.g., Catering adds a
// cuisine-direction card; Decor adds ceremony motifs).

import { useMemo, type ReactNode } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import { SEED_PALETTES } from "@/lib/workspace-seed";
import {
  MoodboardBlock,
  NotesBlock,
  PaletteBlock,
} from "@/components/workspace/blocks/vision-blocks";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

export function CategoryVisionTab({
  category,
  leading,
}: {
  category: WorkspaceCategory;
  // Optional extra content rendered before the moodboard/palette grid.
  // Categories pass bespoke direction cards here.
  leading?: ReactNode;
}) {
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
  const quiz = getQuizSchema(category.slug, "vision");

  return (
    <div className="space-y-4">
      {quiz && <QuizEntryCard schema={quiz} categoryId={category.id} />}
      {leading}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
      </div>
      {quiz && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={quiz} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}
