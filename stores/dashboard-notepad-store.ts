// ── Dashboard notepad store ───────────────────────────────────────────────
// The dashboard "brain dump" — a flat, reverse-chronological feed of free
// notes the couple captures from the home surface. Distinct from the
// structured Notes & Ideas module (which has titles, four tabs, weekly
// reflections). Schema mirrors the dashboard prompt:
//   id · couple_id · content · event_id (nullable) · image_url (nullable)
//   · link_url (nullable) · is_pinned · is_archived · created_at

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DashboardNote {
  id: string;
  content: string;
  eventId?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface AddNoteInput {
  content: string;
  eventId?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
}

interface DashboardNotepadState {
  notes: DashboardNote[];
  addNote: (input: AddNoteInput) => DashboardNote;
  updateNote: (id: string, patch: Partial<DashboardNote>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `note_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useDashboardNotepadStore = create<DashboardNotepadState>()(
  persist(
    (set) => ({
      notes: [],

      addNote: (input) => {
        const note: DashboardNote = {
          id: uid(),
          content: input.content.trim(),
          eventId: input.eventId ?? null,
          imageUrl: input.imageUrl ?? null,
          linkUrl: input.linkUrl ?? null,
          isPinned: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),

      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      togglePin: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n,
          ),
        })),

      toggleArchive: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, isArchived: !n.isArchived } : n,
          ),
        })),
    }),
    {
      name: "ananya:dashboard-notepad",
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
      partialize: (state) => ({ notes: state.notes }),
    },
  ),
);
