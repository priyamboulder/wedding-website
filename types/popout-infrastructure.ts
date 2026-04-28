// ── Pop-out infrastructure types ─────────────────────────────────────────────

// ── File uploads ─────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
}

export type AcceptedMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ACCEPTED_EXTENSIONS: Record<string, AcceptedMime> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const ACCEPTED_MIME_TYPES = Object.values(ACCEPTED_EXTENSIONS);

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Comments / threads ───────────────────────────────────────────────────────

export type CommentEntityType = "item" | "decision" | "sub-decision";

export interface Comment {
  id: string;
  entity_type: CommentEntityType;
  entity_id: string;
  parent_id: string | null; // null = top-level, string = reply (one level deep)
  author: string;
  body: string;
  mentions: string[];
  attachment: UploadedFile | null;
  created_at: string;
  updated_at: string;
}

// ── AI assistance ────────────────────────────────────────────────────────────

export interface AIAssistRequest {
  prompt: string;
  context: string;
  entity_type: CommentEntityType | "general";
  entity_id: string;
}

export interface AIAssistResponse {
  content: string;
  generated_at: string;
}

// ── PDF export ───────────────────────────────────────────────────────────────

export interface PDFExportOptions {
  includeDecisions: boolean;
  includeNotes: boolean;
  includeComments: boolean;
  includeAttachments: boolean;
}

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  includeDecisions: true,
  includeNotes: true,
  includeComments: false,
  includeAttachments: false,
};
