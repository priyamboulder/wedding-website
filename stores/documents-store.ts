// ── Documents store ────────────────────────────────────────────────────────
// Zustand + localStorage, matches the pattern used across Ananya (see
// finance-store.ts, workspace-store.ts). Keeps the Documents vault isolated
// from vendor modules and Finance.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  DocumentFolder,
  DocumentRecord,
  DocumentType,
  DocumentVendorCategory,
} from "@/types/documents";
import { folderPathFor } from "@/types/documents";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface DocumentCreateInput {
  name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  document_type: DocumentType;
  vendor_category: DocumentVendorCategory;
  vendor_name: string | null;
  folder: DocumentFolder;
  financial?: boolean;
  amount?: number | null;
  currency?: string | null;
  document_date?: string | null;
  due_date?: string | null;
  event_date?: string | null;
  expiration_date?: string | null;
  parties?: string[];
  signed?: boolean | null;
  key_terms?: string[];
  summary?: string;
  tags?: string[];
  confidence_overall?: number;
  needs_review?: boolean;
  review_reason?: string | null;
  uploaded_by?: string;
}

export type DocumentPatch = Partial<
  Omit<DocumentRecord, "id" | "uploaded_at" | "updated_at">
>;

interface DocumentsState {
  documents: DocumentRecord[];
  addDocument: (input: DocumentCreateInput) => DocumentRecord;
  updateDocument: (id: string, patch: DocumentPatch) => void;
  deleteDocument: (id: string) => void;
  moveDocument: (id: string, folder: DocumentFolder) => void;
  renameDocument: (id: string, name: string) => void;
  resetToSeed: () => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set) => ({
      documents: [],

      addDocument: (input) => {
        const id = uid("doc");
        const folder_path =
          folderPathFor(input.folder, input.vendor_category);
        const record: DocumentRecord = {
          id,
          name: input.name,
          file_url: input.file_url,
          mime_type: input.mime_type,
          size_bytes: input.size_bytes,
          document_type: input.document_type,
          vendor_category: input.vendor_category,
          vendor_name: input.vendor_name,
          folder: input.folder,
          folder_path,
          financial: input.financial ?? false,
          amount: input.amount ?? null,
          currency: input.currency ?? null,
          document_date: input.document_date ?? null,
          due_date: input.due_date ?? null,
          event_date: input.event_date ?? null,
          expiration_date: input.expiration_date ?? null,
          parties: input.parties ?? [],
          signed: input.signed ?? null,
          key_terms: input.key_terms ?? [],
          summary: input.summary ?? "",
          tags: input.tags ?? [],
          confidence_overall: input.confidence_overall ?? 0.75,
          needs_review: input.needs_review ?? false,
          review_reason: input.review_reason ?? null,
          uploaded_by: input.uploaded_by ?? "priya",
          uploaded_at: nowIso(),
          updated_at: nowIso(),
        };
        set((s) => ({ documents: [record, ...s.documents] }));
        return record;
      },

      updateDocument: (id, patch) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== id) return d;
            const merged = { ...d, ...patch };
            // Keep folder_path in sync if folder or vendor_category changed.
            if (patch.folder || patch.vendor_category) {
              merged.folder_path = folderPathFor(
                merged.folder,
                merged.vendor_category,
              );
            }
            merged.updated_at = nowIso();
            return merged;
          }),
        }));
      },

      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      moveDocument: (id, folder) => {
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  folder,
                  folder_path: folderPathFor(folder, d.vendor_category),
                  updated_at: nowIso(),
                }
              : d,
          ),
        }));
      },

      renameDocument: (id, name) => {
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, name, updated_at: nowIso() } : d,
          ),
        }));
      },

      resetToSeed: async () => {
        const { SEED_DOCUMENTS } = await import("@/lib/documents-seed");
        set({ documents: SEED_DOCUMENTS });
      },
    }),
    {
      name: "ananya-documents",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _documentsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useDocumentsStore.subscribe((state) => {
  if (_documentsSyncTimer) clearTimeout(_documentsSyncTimer);
  _documentsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("couple_documents", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
