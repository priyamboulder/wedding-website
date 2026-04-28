// Helpers to build the context payload for the Smart Task Input Bar and to
// translate its parsed output into a checklist-store `addCustomItem` call.

import type { Phase, ChecklistItem, Member } from "@/types/checklist";
import { subsectionsForPhase } from "@/lib/checklist-seed";
import { CATEGORY_TAG_META } from "@/lib/journal/category-vocab";
import type {
  ParsedTask,
  ParsedTaskSuggestion,
  SmartTaskContext,
} from "@/components/checklist/SmartTaskInputBar";
import type { NewCustomItemInput } from "@/stores/checklist-store";

export function buildSmartTaskContext(
  phases: Phase[],
  items: ChecklistItem[],
  members: Member[],
  weddingDate: Date | null,
): SmartTaskContext {
  return {
    today: new Date().toISOString().slice(0, 10),
    weddingDate: weddingDate ? weddingDate.toISOString().slice(0, 10) : null,
    phases: phases.map((p) => ({
      id: p.id,
      title: p.title,
      subsections: subsectionsForPhase(p.id, items),
    })),
    categoryTags: CATEGORY_TAG_META.map((c) => ({ slug: c.slug, label: c.label })),
    members: members.map((m) => ({ id: m.id, name: m.name })),
    events: [], // wedding events are tracked in the guest page; wire up later.
    // Latest 200 titles, newest first — keeps payload small while giving the
    // parser enough to dedup cross-phase.
    existingTitles: items.slice(-200).map((it) => it.title),
  };
}

/**
 * Convert a parsed task (or suggestion) from the smart-add API into the
 * shape `useChecklistStore.addCustomItem` expects. If the parser didn't
 * pick a phase, the caller supplies `fallbackPhaseId` (usually the phase
 * the user is currently viewing, or `phase-0` for the All Tasks view).
 */
export function parsedTaskToCustomInput(
  parsed: ParsedTask | ParsedTaskSuggestion,
  fallbackPhaseId: string,
): NewCustomItemInput | null {
  const title = parsed.title?.trim();
  if (!title) return null;

  const phase_id = parsed.phaseId ?? fallbackPhaseId;
  const subsection = parsed.subsectionKey ?? "general";

  const assigneeIds =
    "assignee" in parsed && parsed.assignee ? [parsed.assignee.id] : undefined;

  return {
    phase_id,
    subsection,
    title,
    priority: parsed.priority,
    due_date: parsed.deadline,
    assignee_ids: assigneeIds,
    category_tags: parsed.categoryTags.length
      ? (parsed.categoryTags as NewCustomItemInput["category_tags"])
      : undefined,
  };
}
