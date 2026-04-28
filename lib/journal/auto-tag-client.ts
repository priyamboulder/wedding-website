// ── Client helper for /api/journal/auto-tag ────────────────────────────────
// Non-blocking fire-and-forget caller used by the entry composer.
// Returns [] on any failure so the UI stays resilient.

import type { WorkspaceCategoryTag } from "@/types/checklist";
import type { JournalEntry } from "@/types/journal-entries";

export async function fetchAutoTagSuggestions(
  entry: Pick<JournalEntry, "title" | "description" | "domain" | "bodyMarkdown">,
): Promise<WorkspaceCategoryTag[]> {
  try {
    const res = await fetch("/api/journal/auto-tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: entry.title,
        description: entry.description,
        domain: entry.domain,
        bodyExcerpt: entry.bodyMarkdown?.slice(0, 500),
      }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { suggestions?: WorkspaceCategoryTag[] };
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch {
    return [];
  }
}
