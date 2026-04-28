// ── User-authored Journal entry data model ─────────────────────────────────
// Distinct from types/journal.ts's `Article` (editorial magazine content).
// JournalEntry is what the couple saves — URLs, podcasts, videos, notes —
// during planning. Tagged with WorkspaceCategoryTag so the same entry
// surfaces in the main-nav Journal AND in each tagged workspace's
// Journal tab. Same data, scoped views.

import type { WorkspaceCategoryTag } from "@/types/checklist";

export type JournalEntryKind =
  | "article"
  | "podcast"
  | "video"
  | "social"
  | "pdf"
  | "note";

// Cross-module source reference. Attached to moodboard images, style
// keywords, shortlist entries, tasks — anything that was created from a
// Journal entry. Enables two-way linking ("From Journal: <title>") and
// backref lookup ("this entry is used in moodboard + 2 keywords").
export type SourceRef =
  | { kind: "journal"; entryId: string; entryTitle: string }
  | { kind: "editorial"; articleSlug: string; articleTitle: string }
  | { kind: "manual" };

export interface JournalEntry {
  id: string;
  kind: JournalEntryKind;
  // External URL — absent for kind: "note", may be absent for "pdf" if
  // the PDF was pasted as text rather than linked.
  url?: string;
  title: string;
  description?: string;
  // Thumbnail / hero image — from link-preview OG tags, or user-uploaded.
  image?: string;
  domain?: string;
  favicon?: string;
  // Rich personal annotation / the body for kind: "note". Supports
  // lightweight markdown; rendered read-only inside cards, editable in
  // the detail editor.
  bodyMarkdown?: string;
  // Categories this entry is tagged with. Filters decide where it
  // appears. Empty array = only in main-nav Journal.
  categoryTags: WorkspaceCategoryTag[];
  // Categories Claude proposed but the user hasn't yet accepted/dismissed.
  // Render as ghosted "accept?" chips above the confirmed tag row.
  autoTagSuggestions?: WorkspaceCategoryTag[];
  addedAt: string;
  editedAt: string;
}

// Lightweight shape returned by /api/journal/auto-tag. Matches what the
// client's handleSuggestions() expects so the response can be assigned
// straight into entry.autoTagSuggestions.
export interface AutoTagResponse {
  suggestions: WorkspaceCategoryTag[];
}
