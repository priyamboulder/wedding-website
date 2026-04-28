// ── Documents vault data model ─────────────────────────────────────────────
// Standalone file vault — isolated from vendor modules and Finance. The
// vendor_category / vendor_name fields are plain display strings, NOT foreign
// keys. Persists to localStorage via Zustand (stores/documents-store.ts).

export type DocumentType =
  | "contract"
  | "invoice"
  | "receipt"
  | "proposal"
  | "quote"
  | "coi"
  | "w9"
  | "1099"
  | "permit"
  | "license"
  | "deliverable"
  | "shot_list"
  | "menu"
  | "playlist"
  | "seating_chart"
  | "moodboard_reference"
  | "floor_plan"
  | "timeline"
  | "correspondence"
  | "other";

export type DocumentVendorCategory =
  | "photography"
  | "videography"
  | "catering"
  | "decor_florals"
  | "music_entertainment"
  | "hair_makeup"
  | "venue"
  | "mehendi_artist"
  | "stationery"
  | "transportation"
  | "priest_pandit"
  | "wardrobe_styling"
  | "legal_admin"
  | "other";

// Top-level folder buckets — each document lives in exactly one bucket.
export type DocumentFolder =
  | "contracts"
  | "invoices_receipts"
  | "deliverables"
  | "planning"
  | "legal_admin"
  | "unsorted";

export interface DocumentRecord {
  id: string;
  name: string;                 // suggested_filename
  file_url: string;             // /uploads/… path from /api/upload
  mime_type: string;
  size_bytes: number;

  document_type: DocumentType;
  vendor_category: DocumentVendorCategory;
  vendor_name: string | null;

  folder_path: string;          // e.g. "/Contracts/Photography/"
  folder: DocumentFolder;       // top-level bucket for tab filtering

  financial: boolean;
  amount: number | null;        // rupees
  currency: string | null;      // "INR" | "USD" | …

  document_date: string | null; // ISO yyyy-mm-dd
  due_date: string | null;
  event_date: string | null;
  expiration_date: string | null;

  parties: string[];
  signed: boolean | null;
  key_terms: string[];
  summary: string;
  tags: string[];

  confidence_overall: number;   // 0..1
  needs_review: boolean;
  review_reason: string | null;

  uploaded_by: string;
  uploaded_at: string;          // ISO
  updated_at: string;           // ISO
}

// ── Display metadata ──────────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  contract: "Contract",
  invoice: "Invoice",
  receipt: "Receipt",
  proposal: "Proposal",
  quote: "Quote",
  coi: "COI",
  w9: "W-9",
  "1099": "1099",
  permit: "Permit",
  license: "License",
  deliverable: "Deliverable",
  shot_list: "Shot list",
  menu: "Menu",
  playlist: "Playlist",
  seating_chart: "Seating chart",
  moodboard_reference: "Moodboard",
  floor_plan: "Floor plan",
  timeline: "Timeline",
  correspondence: "Correspondence",
  other: "Other",
};

// Color-coded badge classes. Tailwind classes only — no custom CSS.
export const DOCUMENT_TYPE_BADGE: Record<DocumentType, string> = {
  contract:            "bg-ink/5 text-ink border-ink/15",
  invoice:             "bg-saffron/10 text-saffron border-saffron/30",
  receipt:             "bg-sage/10 text-sage border-sage/30",
  proposal:            "bg-gold-pale/60 text-ink border-gold/30",
  quote:               "bg-gold-pale/60 text-ink border-gold/30",
  coi:                 "bg-rose/10 text-rose border-rose/30",
  w9:                  "bg-rose/10 text-rose border-rose/30",
  "1099":              "bg-rose/10 text-rose border-rose/30",
  permit:              "bg-rose/10 text-rose border-rose/30",
  license:             "bg-rose/10 text-rose border-rose/30",
  deliverable:         "bg-ink-soft/10 text-ink-soft border-ink-soft/20",
  shot_list:           "bg-ink/5 text-ink-muted border-border",
  menu:                "bg-ink/5 text-ink-muted border-border",
  playlist:            "bg-ink/5 text-ink-muted border-border",
  seating_chart:       "bg-ink/5 text-ink-muted border-border",
  moodboard_reference: "bg-ink/5 text-ink-muted border-border",
  floor_plan:          "bg-ink/5 text-ink-muted border-border",
  timeline:            "bg-ink/5 text-ink-muted border-border",
  correspondence:      "bg-ink/5 text-ink-muted border-border",
  other:               "bg-ink/5 text-ink-faint border-border",
};

export const VENDOR_CATEGORY_LABEL: Record<DocumentVendorCategory, string> = {
  photography: "Photography",
  videography: "Videography",
  catering: "Catering",
  decor_florals: "Décor & Florals",
  music_entertainment: "Music & Entertainment",
  hair_makeup: "Hair & Makeup",
  venue: "Venue",
  mehendi_artist: "Mehendi Artist",
  stationery: "Stationery",
  transportation: "Transportation",
  priest_pandit: "Officiant",
  wardrobe_styling: "Wardrobe & Styling",
  legal_admin: "Legal & Admin",
  other: "Other",
};

// Vendor categories that should get an auto-generated subfolder under every
// top-level folder. "legal_admin" and "other" are kept off this list because
// they're represented as their own folders or don't need a subfolder.
export const DOCUMENT_VENDOR_SUBFOLDERS: DocumentVendorCategory[] = [
  "photography",
  "videography",
  "catering",
  "decor_florals",
  "music_entertainment",
  "hair_makeup",
  "venue",
  "mehendi_artist",
  "stationery",
  "transportation",
  "priest_pandit",
  "wardrobe_styling",
];

export const FOLDER_LABEL: Record<DocumentFolder, string> = {
  contracts: "Contracts",
  invoices_receipts: "Invoices & Receipts",
  deliverables: "Deliverables",
  planning: "Planning & References",
  legal_admin: "Legal & Admin",
  unsorted: "Unsorted",
};

export const FOLDER_ORDER: DocumentFolder[] = [
  "contracts",
  "invoices_receipts",
  "deliverables",
  "planning",
  "legal_admin",
  "unsorted",
];

// ── Document type → default folder map ─────────────────────────────────────
// Used by the upload flow to derive a folder when the classifier returns a
// document_type but the model was ambiguous about the folder bucket.
export const DEFAULT_FOLDER_FOR_TYPE: Record<DocumentType, DocumentFolder> = {
  contract: "contracts",
  proposal: "contracts",
  quote: "contracts",
  invoice: "invoices_receipts",
  receipt: "invoices_receipts",
  coi: "legal_admin",
  w9: "legal_admin",
  "1099": "legal_admin",
  permit: "legal_admin",
  license: "legal_admin",
  deliverable: "deliverables",
  shot_list: "planning",
  menu: "planning",
  playlist: "planning",
  seating_chart: "planning",
  moodboard_reference: "planning",
  floor_plan: "planning",
  timeline: "planning",
  correspondence: "planning",
  other: "unsorted",
};

// ── Tabs ──────────────────────────────────────────────────────────────────

export type DocumentTabId = "all" | DocumentFolder;

export const DOCUMENT_TABS: { id: DocumentTabId; label: string; slug: string }[] = [
  { id: "all",               label: "All Files",            slug: "" },
  { id: "contracts",         label: "Contracts",            slug: "contracts" },
  { id: "invoices_receipts", label: "Invoices & Receipts",  slug: "invoices" },
  { id: "deliverables",      label: "Deliverables",         slug: "deliverables" },
  { id: "planning",          label: "Planning & References", slug: "planning" },
  { id: "legal_admin",       label: "Legal & Admin",        slug: "legal" },
  { id: "unsorted",          label: "Unsorted",             slug: "unsorted" },
];

// ── Signed / payment status for the Status column ────────────────────────

export type DocumentStatusChip =
  | { kind: "signed" }
  | { kind: "unsigned" }
  | { kind: "paid" }
  | { kind: "unpaid" }
  | { kind: "expired" }
  | { kind: "needs_review" }
  | null;

export function statusChipFor(doc: DocumentRecord, today: Date = new Date()): DocumentStatusChip {
  if (doc.needs_review) return { kind: "needs_review" };
  if (doc.expiration_date) {
    const exp = new Date(doc.expiration_date);
    if (!Number.isNaN(exp.getTime()) && exp < today) return { kind: "expired" };
  }
  if (doc.document_type === "contract") {
    return { kind: doc.signed ? "signed" : "unsigned" };
  }
  if (doc.document_type === "invoice" || doc.document_type === "receipt") {
    // Heuristic: receipts imply paid; invoices default to unpaid unless a
    // user marks the tag "paid".
    if (doc.document_type === "receipt") return { kind: "paid" };
    return { kind: doc.tags.includes("paid") ? "paid" : "unpaid" };
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────

export function prettyBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function relativeUploadedAt(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const ms = now.getTime() - then;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.round(mo / 12);
  return `${yr}y ago`;
}

export function folderPathFor(
  folder: DocumentFolder,
  vendorCategory: DocumentVendorCategory,
): string {
  const top = `/${FOLDER_LABEL[folder]}/`;
  if (folder === "unsorted") return top;
  if (folder === "legal_admin") return top;
  if (DOCUMENT_VENDOR_SUBFOLDERS.includes(vendorCategory)) {
    return `${top}${VENDOR_CATEGORY_LABEL[vendorCategory]}/`;
  }
  return top;
}

export const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024; // 15 MB

export const ACCEPTED_DOCUMENT_MIME_PREFIXES = [
  "application/pdf",
  "image/",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function mimeAccepted(mime: string): boolean {
  return ACCEPTED_DOCUMENT_MIME_PREFIXES.some((p) =>
    p.endsWith("/") ? mime.startsWith(p) : mime === p,
  );
}
