// ── Workspace Files ─────────────────────────────────────────────────────────
// Files attached to a vendor workspace. Scoped by category + optional tab,
// link out to vendors/tasks/decisions. Production target lives in Supabase
// storage; Phase 1 ships on object URLs + localStorage per the project's
// localStorage-first policy.
//
// See supabase/migrations/0007_workspace_files.sql for the SQL target.

import type { WorkspaceCategoryTag, WorkspaceTabTag } from "./checklist";

// Specific mime strings surface nicely in type completion; the string
// fallback means unknown mimes never block an upload.
export type FileMime =
  | "application/pdf"
  | `image/${string}`
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "message/rfc822"
  | "text/plain"
  | `audio/${string}`
  | `video/${string}`
  | (string & {});

// Friendly categorization for icons/previews. Derived from mime in helpers.
export type FileKind =
  | "image"
  | "pdf"
  | "doc"
  | "sheet"
  | "email"
  | "audio"
  | "video"
  | "text"
  | "other";

export interface FileContract {
  signed: boolean;
  signed_at?: string;
  total_amount_cents?: number;
  payment_schedule?: Array<{
    label?: string;              // "Deposit", "Milestone 1", "Final"
    due_date: string;            // ISO date
    amount_cents: number;
    paid: boolean;
    paid_at?: string;
  }>;
}

export interface FileLinkedEntities {
  vendor_ids?: string[];
  task_ids?: string[];           // checklist item ids (e.g. "p2-photo-04")
  decision_ids?: string[];       // workspace_decisions ids
}

export interface WorkspaceFile {
  id: string;
  wedding_id: string;
  category: WorkspaceCategoryTag;
  tab?: WorkspaceTabTag;         // null = category-level upload (shared across tabs)
  filename: string;
  mime: FileMime;
  size_bytes: number;

  // Storage resolution. In Phase 1 (localStorage + object URLs):
  //   storage_key = object URL blob:... (volatile — dies on reload)
  // In Phase 2 (Supabase):
  //   storage_key = bucket path wedding/{wid}/category/{slug}/{id}/v{n}/{filename}
  storage_key: string;
  // Optional thumbnail (e.g. first-page PDF render or image preview). Same
  // storage semantics as storage_key.
  thumbnail_url?: string;

  uploaded_by: string;           // member id
  uploaded_at: string;           // ISO

  tags: string[];                // free-form
  linked_entities: FileLinkedEntities;

  // Only populated when a file is recognized/marked as a contract (auto-set
  // if tags includes "contract" — user can override per the UX decision).
  contract?: FileContract;

  // Version chain — a new file uploaded as a "replacement" bumps version
  // and sets replaces_id. All members of the same logical document share
  // file_group_id.
  file_group_id: string;
  version: number;               // 1-indexed
  replaces_id?: string;

  // Soft delete — populated when user removes. Retained briefly for undo.
  deleted_at?: string;
}

export interface FileComment {
  id: string;
  file_id: string;
  author_id: string;
  body: string;
  created_at: string;
  parent_id?: string;            // threaded
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function kindFromMime(mime: FileMime): FileKind {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "doc";
  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "sheet";
  if (mime === "message/rfc822") return "email";
  if (mime === "text/plain") return "text";
  return "other";
}

export function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Phase 1 cap
