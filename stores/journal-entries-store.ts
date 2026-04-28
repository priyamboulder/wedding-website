// ── Journal entries store ──────────────────────────────────────────────────
// Couple-authored Journal entries (URLs, podcasts, videos, notes).
// Distinct from editorial `Article`s, which are seeded read-only content.
//
// One source of truth: every entry lives here. The main-nav /journal surface
// renders the full list; each vendor workspace's Journal tab renders a
// category-filtered view via entriesForCategory(). Tagging drives filtering.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, dbLoadAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  JournalEntry,
  JournalEntryKind,
} from "@/types/journal-entries";
import type { WorkspaceCategoryTag } from "@/types/checklist";

const now = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export interface CreateEntryInput {
  kind?: JournalEntryKind;
  url?: string;
  title: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
  bodyMarkdown?: string;
  categoryTags?: WorkspaceCategoryTag[];
}

interface JournalEntriesState {
  entries: JournalEntry[];

  addEntry: (input: CreateEntryInput) => JournalEntry;
  updateEntry: (id: string, patch: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;

  addTag: (id: string, tag: WorkspaceCategoryTag) => void;
  removeTag: (id: string, tag: WorkspaceCategoryTag) => void;
  setTags: (id: string, tags: WorkspaceCategoryTag[]) => void;

  setAutoTagSuggestions: (id: string, tags: WorkspaceCategoryTag[]) => void;
  acceptSuggestion: (id: string, tag: WorkspaceCategoryTag) => void;
  dismissSuggestion: (id: string, tag: WorkspaceCategoryTag) => void;
  dismissAllSuggestions: (id: string) => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  getEntry: (id: string) => JournalEntry | undefined;
  entriesForCategory: (tag: WorkspaceCategoryTag) => JournalEntry[];
  recentEntriesForCategory: (
    tag: WorkspaceCategoryTag,
    limit?: number,
  ) => JournalEntry[];
  loadFromDB: () => Promise<void>;
}

export const useJournalEntriesStore = create<JournalEntriesState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (input) => {
        const entry: JournalEntry = {
          id: rid("je"),
          kind: input.kind ?? (input.url ? "article" : "note"),
          url: input.url,
          title: input.title.trim() || "Untitled entry",
          description: input.description,
          image: input.image,
          domain: input.domain,
          favicon: input.favicon,
          bodyMarkdown: input.bodyMarkdown,
          categoryTags: input.categoryTags ?? [],
          addedAt: now(),
          editedAt: now(),
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("journal_entries", { id: entry.id, couple_id: coupleId, kind: entry.kind, url: entry.url ?? null, title: entry.title, category_tags: entry.categoryTags });
        return entry;
      },

      updateEntry: (id, patch) => {
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...patch, editedAt: now() } : e,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("journal_entries", { id, couple_id: coupleId, ...patch, edited_at: now() });
      },

      deleteEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("journal_entries", { id, couple_id: coupleId });
      },

      addTag: (id, tag) =>
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e;
            if (e.categoryTags.includes(tag)) return e;
            return {
              ...e,
              categoryTags: [...e.categoryTags, tag],
              editedAt: now(),
            };
          }),
        })),

      removeTag: (id, tag) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  categoryTags: e.categoryTags.filter((t) => t !== tag),
                  editedAt: now(),
                }
              : e,
          ),
        })),

      setTags: (id, tags) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? { ...e, categoryTags: [...tags], editedAt: now() }
              : e,
          ),
        })),

      setAutoTagSuggestions: (id, tags) =>
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e;
            const novel = tags.filter((t) => !e.categoryTags.includes(t));
            return { ...e, autoTagSuggestions: novel };
          }),
        })),

      acceptSuggestion: (id, tag) =>
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e;
            const tags = e.categoryTags.includes(tag)
              ? e.categoryTags
              : [...e.categoryTags, tag];
            return {
              ...e,
              categoryTags: tags,
              autoTagSuggestions: (e.autoTagSuggestions ?? []).filter(
                (t) => t !== tag,
              ),
              editedAt: now(),
            };
          }),
        })),

      dismissSuggestion: (id, tag) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  autoTagSuggestions: (e.autoTagSuggestions ?? []).filter(
                    (t) => t !== tag,
                  ),
                }
              : e,
          ),
        })),

      dismissAllSuggestions: (id) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, autoTagSuggestions: [] } : e,
          ),
        })),

      getEntry: (id) => get().entries.find((e) => e.id === id),

      entriesForCategory: (tag) =>
        get()
          .entries.filter((e) => e.categoryTags.includes(tag))
          .sort(
            (a, b) =>
              new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime(),
          ),

      recentEntriesForCategory: (tag, limit = 3) =>
        get()
          .entries.filter((e) => e.categoryTags.includes(tag))
          .sort(
            (a, b) =>
              new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime(),
          )
          .slice(0, limit),

      loadFromDB: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId) return;
        const rows = await dbLoadAll("journal_entries", coupleId);
        if (rows.length === 0) return;
        set((s) => {
          const base = s.entries.map((e) => {
            const row = rows.find((r) => r.id === e.id);
            return row ? { ...e, categoryTags: (row.category_tags as WorkspaceCategoryTag[]) ?? e.categoryTags } : e;
          });
          const fresh = rows.filter((r) => !s.entries.some((e) => e.id === r.id)).map((r) => ({
            id: r.id as string,
            kind: (r.kind as JournalEntryKind) ?? "article",
            url: r.url as string | undefined,
            title: r.title as string ?? "Untitled",
            description: undefined,
            image: undefined,
            domain: undefined,
            favicon: undefined,
            bodyMarkdown: undefined,
            categoryTags: (r.category_tags as WorkspaceCategoryTag[]) ?? [],
            addedAt: r.added_at as string ?? now(),
            editedAt: r.edited_at as string ?? now(),
          }));
          return { entries: [...base, ...fresh] };
        });
      },
    }),
    {
      name: "ananya:journal-entries",
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
    },
  ),
);
