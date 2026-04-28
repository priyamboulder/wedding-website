import { create } from "zustand";
import type { UploadedFile } from "@/types/popout-infrastructure";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface UploadsState {
  /** Map of entity_id → uploaded files */
  filesByEntity: Record<string, UploadedFile[]>;

  getFiles: (entityId: string) => UploadedFile[];
  addFile: (entityId: string, file: UploadedFile) => void;
  addFiles: (entityId: string, files: UploadedFile[]) => void;
  removeFile: (entityId: string, fileId: string) => void;
  clearFiles: (entityId: string) => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
  filesByEntity: {},

  getFiles: (entityId) => get().filesByEntity[entityId] ?? [],

  addFile: (entityId, file) =>
    set((state) => ({
      filesByEntity: {
        ...state.filesByEntity,
        [entityId]: [...(state.filesByEntity[entityId] ?? []), file],
      },
    })),

  addFiles: (entityId, files) =>
    set((state) => ({
      filesByEntity: {
        ...state.filesByEntity,
        [entityId]: [...(state.filesByEntity[entityId] ?? []), ...files],
      },
    })),

  removeFile: (entityId, fileId) =>
    set((state) => ({
      filesByEntity: {
        ...state.filesByEntity,
        [entityId]: (state.filesByEntity[entityId] ?? []).filter(
          (f) => f.id !== fileId,
        ),
      },
    })),

  clearFiles: (entityId) =>
    set((state) => ({
      filesByEntity: {
        ...state.filesByEntity,
        [entityId]: [],
      },
    })),
}));

let _uploadsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useUploadsStore.subscribe((state) => {
  if (_uploadsSyncTimer) clearTimeout(_uploadsSyncTimer);
  _uploadsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("couple_uploads", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
