// ── Notes & Ideas store ────────────────────────────────────────────────────
// Zustand + persist for the Memories & Keepsakes → Notes & Ideas module.
// Single-wedding scoping (same convention as bachelorette-store) — no
// weddingId key. All four tabs read and write through this store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, dbLoadAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  Clip,
  ClipBoard,
  ClipDestination,
  Note,
  NoteLink,
  NoteTag,
  NotesIdeasState,
  QuickCapture,
  QuickCaptureKind,
  Reflection,
  ReflectionPrompt,
} from "@/types/notes-ideas";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface NotesIdeasActions {
  // ── Notes ────────────────────────────────────────────────────────────────
  addNote: (input: {
    title?: string;
    body?: string;
    tags?: NoteTag[];
    link?: NoteLink;
    imageUrl?: string;
    isPrivate?: boolean;
  }) => Note;
  updateNote: (id: string, patch: Partial<Omit<Note, "id" | "createdAt">>) => void;
  deleteNote: (id: string) => void;
  toggleNotePrivacy: (id: string) => void;

  // ── Quick captures ───────────────────────────────────────────────────────
  addCapture: (input: {
    kind?: QuickCaptureKind;
    content: string;
    previewLabel?: string;
  }) => QuickCapture;
  deleteCapture: (id: string) => void;
  /** Promote a quick capture into a full Note. */
  promoteCaptureToNote: (id: string) => Note | null;

  // ── Clip boards ──────────────────────────────────────────────────────────
  addBoard: (input: { name: string; destination?: ClipDestination }) => ClipBoard;
  renameBoard: (id: string, name: string) => void;
  setBoardDestination: (id: string, destination?: ClipDestination) => void;
  deleteBoard: (id: string) => void;

  // ── Clips ────────────────────────────────────────────────────────────────
  addClip: (input: {
    boardId: string;
    title?: string;
    url?: string;
    imageUrl?: string;
    note?: string;
  }) => Clip;
  deleteClip: (id: string) => void;

  // ── Reflections ──────────────────────────────────────────────────────────
  addReflection: (input: {
    weekOf: string;
    prompt: string;
    body: string;
    author?: string;
  }) => Reflection;
  updateReflection: (id: string, body: string) => void;
  deleteReflection: (id: string) => void;
  setCurrentPrompt: (prompt: ReflectionPrompt) => void;
  /** Pick a new prompt from the library, skipping the current one. */
  rotateCurrentPrompt: (weekOf?: string) => void;

  // ── Selectors ────────────────────────────────────────────────────────────
  clipsForBoard: (boardId: string) => Clip[];
  notesByTag: (tag: NoteTag | null) => Note[];
  reflectionsSorted: () => Reflection[];

  // ── DB sync ──────────────────────────────────────────────────────────────
  loadFromDB: () => Promise<void>;
}

export const useNotesIdeasStore = create<NotesIdeasState & NotesIdeasActions>()(
  persist(
    (set, get) => ({
      notes: [] as NotesIdeasState["notes"],
      captures: [] as NotesIdeasState["captures"],
      boards: [] as NotesIdeasState["boards"],
      clips: [] as NotesIdeasState["clips"],
      reflections: [] as NotesIdeasState["reflections"],
      promptLibrary: [] as string[],
      currentPrompt: { weekOf: "", prompt: "" } as NotesIdeasState["currentPrompt"],

      // ── Notes ──────────────────────────────────────────────────────────
      addNote: ({ title, body, tags, link, imageUrl, isPrivate }) => {
        const note: Note = {
          id: uid("note"),
          title: (title ?? "").trim() || "Untitled note",
          body: body ?? "",
          tags: tags ?? [],
          link,
          imageUrl,
          isPrivate: isPrivate ?? false,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("notes", { id: note.id, couple_id: coupleId, title: note.title, body: note.body, tags: note.tags, is_private: note.isPrivate });
        return note;
      },

      updateNote: (id, patch) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: nowIso() } : n,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("notes", { id, couple_id: coupleId, ...patch, updatedAt: nowIso() });
      },

      deleteNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("notes", { id, couple_id: coupleId });
      },

      toggleNotePrivacy: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, isPrivate: !n.isPrivate, updatedAt: nowIso() }
              : n,
          ),
        })),

      // ── Quick captures ─────────────────────────────────────────────────
      addCapture: ({ kind, content, previewLabel }) => {
        const resolvedKind: QuickCaptureKind =
          kind ?? (/^https?:\/\//i.test(content.trim()) ? "link" : "text");
        const capture: QuickCapture = {
          id: uid("qc"),
          kind: resolvedKind,
          content: content.trim(),
          previewLabel,
          capturedAt: nowIso(),
        };
        set((s) => ({ captures: [capture, ...s.captures] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("quick_captures", { id: capture.id, couple_id: coupleId, kind: capture.kind, content: capture.content, preview_label: capture.previewLabel ?? null });
        return capture;
      },

      deleteCapture: (id) => {
        set((s) => ({ captures: s.captures.filter((c) => c.id !== id) }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("quick_captures", { id, couple_id: coupleId });
      },

      promoteCaptureToNote: (id) => {
        const capture = get().captures.find((c) => c.id === id);
        if (!capture) return null;
        const note = get().addNote({
          title: capture.previewLabel ?? "Quick capture",
          body: capture.kind === "text" ? capture.content : "",
          tags: ["ideas"],
          link:
            capture.kind === "link"
              ? { url: capture.content }
              : undefined,
          imageUrl: capture.kind === "image" ? capture.content : undefined,
        });
        get().deleteCapture(id);
        return note;
      },

      // ── Clip boards ────────────────────────────────────────────────────
      addBoard: ({ name, destination }) => {
        const board: ClipBoard = {
          id: uid("board"),
          name: name.trim() || "New board",
          destination,
          createdAt: nowIso(),
        };
        set((s) => ({ boards: [...s.boards, board] }));
        return board;
      },

      renameBoard: (id, name) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === id ? { ...b, name: name.trim() || b.name } : b,
          ),
        })),

      setBoardDestination: (id, destination) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === id ? { ...b, destination } : b,
          ),
        })),

      deleteBoard: (id) =>
        set((s) => ({
          boards: s.boards.filter((b) => b.id !== id),
          clips: s.clips.filter((c) => c.boardId !== id),
        })),

      // ── Clips ──────────────────────────────────────────────────────────
      addClip: ({ boardId, title, url, imageUrl, note }) => {
        const clip: Clip = {
          id: uid("clip"),
          boardId,
          title: title?.trim() || undefined,
          url,
          imageUrl,
          note,
          savedAt: nowIso(),
        };
        set((s) => ({ clips: [clip, ...s.clips] }));
        return clip;
      },

      deleteClip: (id) =>
        set((s) => ({ clips: s.clips.filter((c) => c.id !== id) })),

      // ── Reflections ────────────────────────────────────────────────────
      addReflection: ({ weekOf, prompt, body, author }) => {
        const reflection: Reflection = {
          id: uid("refl"),
          weekOf,
          prompt,
          body,
          author: author ?? "Priya",
          writtenAt: nowIso(),
        };
        set((s) => ({ reflections: [reflection, ...s.reflections] }));
        return reflection;
      },

      updateReflection: (id, body) =>
        set((s) => ({
          reflections: s.reflections.map((r) =>
            r.id === id ? { ...r, body, writtenAt: nowIso() } : r,
          ),
        })),

      deleteReflection: (id) =>
        set((s) => ({
          reflections: s.reflections.filter((r) => r.id !== id),
        })),

      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

      rotateCurrentPrompt: (weekOf) => {
        const { promptLibrary, currentPrompt } = get();
        const pool = promptLibrary.filter((p) => p !== currentPrompt.prompt);
        if (pool.length === 0) return;
        const next = pool[Math.floor(Math.random() * pool.length)]!;
        set({
          currentPrompt: {
            weekOf: weekOf ?? currentPrompt.weekOf,
            prompt: next,
          },
        });
      },

      // ── Selectors ──────────────────────────────────────────────────────
      clipsForBoard: (boardId) =>
        get()
          .clips.filter((c) => c.boardId === boardId)
          .sort(
            (a, b) =>
              new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
          ),

      notesByTag: (tag) => {
        const notes = get().notes;
        const filtered =
          tag === null ? notes : notes.filter((n) => n.tags.includes(tag));
        return [...filtered].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      },

      reflectionsSorted: () =>
        [...get().reflections].sort(
          (a, b) =>
            new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime(),
        ),

      loadFromDB: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId) return;
        try {
          const [noteRows, captureRows] = await Promise.all([
            dbLoadAll("notes", coupleId),
            dbLoadAll("quick_captures", coupleId),
          ]);
          set((s) => {
            const mergedNotes = noteRows.length > 0 ? (() => {
              const base = s.notes.map((n) => {
                const row = noteRows.find((r) => r.id === n.id);
                return row ? { ...n, title: row.title as string, body: row.body as string, tags: row.tags as NoteTag[], isPrivate: !!row.is_private } : n;
              });
              const fresh = noteRows.filter((r) => !s.notes.some((n) => n.id === r.id)).map((r) => ({
                id: r.id as string,
                title: r.title as string,
                body: r.body as string ?? "",
                tags: (r.tags as NoteTag[]) ?? [],
                isPrivate: !!r.is_private,
                createdAt: r.created_at as string ?? nowIso(),
                updatedAt: r.updated_at as string ?? nowIso(),
              }));
              return [...base, ...fresh];
            })() : s.notes;
            return { notes: mergedNotes };
          });
          void captureRows;
        } catch { /* Silently fall back to persisted/seed data */ }
      },
    }),
    {
      name: "ananya:notes-ideas",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({
        notes: s.notes,
        captures: s.captures,
        boards: s.boards,
        clips: s.clips,
        reflections: s.reflections,
        promptLibrary: s.promptLibrary,
        currentPrompt: s.currentPrompt,
      }),
    },
  ),
);
