// ── Notes & Ideas module types ─────────────────────────────────────────────
// The couple's private planning notebook — not a vendor workspace. Four
// surfaces:
//   1. All Notes          — the main notebook (title + body + tag + privacy)
//   2. Quick Capture      — junk drawer for 11 PM inspiration (no title)
//   3. Inspiration Clips  — Pinterest-style private boards
//   4. Reflections        — prompted weekly journaling
//
// All state is persisted via stores/notes-ideas-store.ts to localStorage.

export type NoteTag =
  | "ideas"
  | "to_discuss"
  | "personal"
  | "vendor_notes";

export const NOTE_TAGS: { id: NoteTag; label: string }[] = [
  { id: "ideas", label: "Ideas" },
  { id: "to_discuss", label: "To discuss" },
  { id: "personal", label: "Personal" },
  { id: "vendor_notes", label: "Vendor notes" },
];

// ── Tab 1 — All Notes ──────────────────────────────────────────────────────

export interface NoteLink {
  url: string;
  label?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: NoteTag[];
  link?: NoteLink;
  imageUrl?: string;
  /** 🔒 only author can see it — not even the partner. */
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Tab 2 — Quick Capture ──────────────────────────────────────────────────

export type QuickCaptureKind = "text" | "link" | "image";

export interface QuickCapture {
  id: string;
  kind: QuickCaptureKind;
  content: string;            // text body, URL, or image URL/data
  previewLabel?: string;      // "Instagram reel — reception entrance idea"
  capturedAt: string;
}

// ── Tab 3 — Inspiration Clips ──────────────────────────────────────────────

/** Optional destination the clip can be "sent to" with one click. */
export type ClipDestination =
  | "decor"
  | "stationery"
  | "wardrobe"
  | "catering"
  | "hmua"
  | "mehndi"
  | "photography"
  | "videography"
  | "music";

export interface Clip {
  id: string;
  boardId: string;
  title?: string;
  url?: string;
  imageUrl?: string;
  note?: string;
  savedAt: string;
}

export interface ClipBoard {
  id: string;
  name: string;
  /** Optional suggested destination for "Send to X moodboard". */
  destination?: ClipDestination;
  createdAt: string;
}

// ── Tab 4 — Reflections ────────────────────────────────────────────────────

export interface ReflectionPrompt {
  /** ISO week anchor date (Monday of that week). */
  weekOf: string;
  prompt: string;
}

export interface Reflection {
  id: string;
  weekOf: string;          // same anchor as the prompt it answers
  prompt: string;          // denormalized so historical edits are stable
  body: string;
  author: string;          // "Priya" etc.
  writtenAt: string;
}

// ── Full module state ──────────────────────────────────────────────────────

export interface NotesIdeasState {
  notes: Note[];
  captures: QuickCapture[];
  boards: ClipBoard[];
  clips: Clip[];
  reflections: Reflection[];
  promptLibrary: string[];
  currentPrompt: ReflectionPrompt;
}
