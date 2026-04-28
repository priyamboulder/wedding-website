// ── Workspace files store ───────────────────────────────────────────────────
// Phase 1: in-memory + object URLs. File record metadata persists in
// localStorage via Zustand persist; blob bodies are URL.createObjectURL(file)
// results that DIE on page reload. The UI surfaces a "re-upload to view"
// state when a record's blob is no longer resolvable.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  FileComment,
  FileContract,
  FileLinkedEntities,
  WorkspaceFile,
} from "@/types/files";
import type { WorkspaceCategoryTag, WorkspaceTabTag } from "@/types/checklist";

interface FilesState {
  files: WorkspaceFile[];
  comments: FileComment[];

  // ── CRUD ────────────────────────────────────────────────────────────────
  addFile: (input: {
    file: File;
    wedding_id: string;
    category: WorkspaceCategoryTag;
    tab?: WorkspaceTabTag;
    uploaded_by: string;
    tags?: string[];
    linked_entities?: FileLinkedEntities;
    replaces_id?: string;
  }) => WorkspaceFile;
  updateFile: (id: string, patch: Partial<WorkspaceFile>) => void;
  softDelete: (id: string) => void;
  restoreFile: (id: string) => void;
  purge: (id: string) => void;
  setTags: (id: string, tags: string[]) => void;
  linkEntity: (
    id: string,
    kind: "vendor" | "task" | "decision",
    entityId: string,
  ) => void;
  unlinkEntity: (
    id: string,
    kind: "vendor" | "task" | "decision",
    entityId: string,
  ) => void;
  markContract: (id: string, contract: FileContract | null) => void;

  // ── Comments ────────────────────────────────────────────────────────────
  addComment: (input: Omit<FileComment, "id" | "created_at">) => FileComment;
  deleteComment: (id: string) => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  listFor: (
    category: WorkspaceCategoryTag,
    opts?: { tab?: WorkspaceTabTag; vendorId?: string; tag?: string },
  ) => WorkspaceFile[];
  listRecent: (category: WorkspaceCategoryTag, limit?: number) => WorkspaceFile[];
  groupChain: (file_group_id: string) => WorkspaceFile[];
  getFile: (id: string) => WorkspaceFile | undefined;
}

// Tags that auto-flag a file as a contract per the UX decision.
const CONTRACT_TAG_PATTERN = /\bcontract(s)?\b/i;

function newId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function objectUrlFor(file: File): string {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return "";
  }
  return URL.createObjectURL(file);
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: [],
      comments: [],

      addFile: ({
        file,
        wedding_id,
        category,
        tab,
        uploaded_by,
        tags = [],
        linked_entities = {},
        replaces_id,
      }) => {
        const now = new Date().toISOString();
        const prior = replaces_id
          ? get().files.find((f) => f.id === replaces_id)
          : undefined;
        const file_group_id = prior?.file_group_id ?? newId();
        const version = prior ? prior.version + 1 : 1;
        const storage_key = objectUrlFor(file);
        const autoContract = tags.some((t) => CONTRACT_TAG_PATTERN.test(t));

        const record: WorkspaceFile = {
          id: newId(),
          wedding_id,
          category,
          tab,
          filename: file.name,
          mime: file.type || "application/octet-stream",
          size_bytes: file.size,
          storage_key,
          uploaded_by,
          uploaded_at: now,
          tags,
          linked_entities,
          file_group_id,
          version,
          ...(replaces_id && { replaces_id }),
          ...(autoContract && { contract: { signed: false } satisfies FileContract }),
        };

        set((state) => ({ files: [...state.files, record] }));
        return record;
      },

      updateFile: (id, patch) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      softDelete: (id) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, deleted_at: new Date().toISOString() } : f,
          ),
        })),

      restoreFile: (id) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, deleted_at: undefined } : f,
          ),
        })),

      purge: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
          comments: state.comments.filter((c) => c.file_id !== id),
        })),

      setTags: (id, tags) =>
        set((state) => ({
          files: state.files.map((f) => {
            if (f.id !== id) return f;
            const autoContract = tags.some((t) => CONTRACT_TAG_PATTERN.test(t));
            // Auto-create a minimal contract record if tag was just added;
            // preserve an existing one, drop it if tag was removed AND no manual
            // signed state was set.
            let contract = f.contract;
            if (autoContract && !contract) {
              contract = { signed: false };
            } else if (!autoContract && contract && !contract.signed) {
              contract = undefined;
            }
            return { ...f, tags, contract };
          }),
        })),

      linkEntity: (id, kind, entityId) =>
        set((state) => ({
          files: state.files.map((f) => {
            if (f.id !== id) return f;
            const key =
              kind === "vendor" ? "vendor_ids" : kind === "task" ? "task_ids" : "decision_ids";
            const current = f.linked_entities[key] ?? [];
            if (current.includes(entityId)) return f;
            return {
              ...f,
              linked_entities: {
                ...f.linked_entities,
                [key]: [...current, entityId],
              },
            };
          }),
        })),

      unlinkEntity: (id, kind, entityId) =>
        set((state) => ({
          files: state.files.map((f) => {
            if (f.id !== id) return f;
            const key =
              kind === "vendor" ? "vendor_ids" : kind === "task" ? "task_ids" : "decision_ids";
            const current = f.linked_entities[key] ?? [];
            return {
              ...f,
              linked_entities: {
                ...f.linked_entities,
                [key]: current.filter((x) => x !== entityId),
              },
            };
          }),
        })),

      markContract: (id, contract) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, contract: contract ?? undefined } : f,
          ),
        })),

      addComment: (input) => {
        const record: FileComment = {
          id: newId(),
          created_at: new Date().toISOString(),
          ...input,
        };
        set((state) => ({ comments: [...state.comments, record] }));
        return record;
      },

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),

      listFor: (category, opts) => {
        const { tab, vendorId, tag } = opts ?? {};
        return get()
          .files.filter((f) => {
            if (f.deleted_at) return false;
            if (f.category !== category) return false;
            if (tab !== undefined && f.tab !== tab) return false;
            if (vendorId && !f.linked_entities.vendor_ids?.includes(vendorId))
              return false;
            if (tag && !f.tags.includes(tag)) return false;
            return true;
          })
          .sort(
            (a, b) =>
              new Date(b.uploaded_at).getTime() -
              new Date(a.uploaded_at).getTime(),
          );
      },

      listRecent: (category, limit = 5) =>
        get()
          .files.filter((f) => !f.deleted_at && f.category === category)
          .sort(
            (a, b) =>
              new Date(b.uploaded_at).getTime() -
              new Date(a.uploaded_at).getTime(),
          )
          .slice(0, limit),

      groupChain: (file_group_id) =>
        get()
          .files.filter((f) => f.file_group_id === file_group_id)
          .sort((a, b) => b.version - a.version),

      getFile: (id) => get().files.find((f) => f.id === id),
    }),
    {
      name: "ananya:workspace-files",
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
      // Object URLs don't survive reloads; we still persist metadata so the
      // UI can surface a "re-upload to view" state.
      partialize: (state) => ({ files: state.files, comments: state.comments }),
    },
  ),
);

let _filesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useFilesStore.subscribe((state) => {
  if (_filesSyncTimer) clearTimeout(_filesSyncTimer);
  _filesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("workspace_files", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Utility for callers who need to know if a file's blob body is still live
// (same browser session that created it).
export function isStorageKeyResolvable(storage_key: string): boolean {
  return storage_key.startsWith("blob:") || storage_key.startsWith("http");
}
