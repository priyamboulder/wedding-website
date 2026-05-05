// ── Dashboard Planning Journal store ────────────────────────────────────
// Photos from the planning journey — venue tours, tastings, outfit
// trials, etc. Distinct from the editorial Showcases module: this is the
// couple's private keepsake feed, attached to the dashboard.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface JournalPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  takenAt: string; // ISO date — couple-controlled, defaults to upload time
  createdAt: string;
}

interface JournalState {
  photos: JournalPhoto[];
  addPhoto: (input: { imageUrl: string; caption?: string; takenAt?: string }) => JournalPhoto;
  updatePhoto: (id: string, patch: Partial<JournalPhoto>) => void;
  deletePhoto: (id: string) => void;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `jp_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useDashboardJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      photos: [],
      addPhoto: (input) => {
        const now = new Date().toISOString();
        const photo: JournalPhoto = {
          id: uid(),
          imageUrl: input.imageUrl,
          caption: input.caption?.trim() ?? "",
          takenAt: input.takenAt ?? now,
          createdAt: now,
        };
        set((s) => ({ photos: [photo, ...s.photos] }));
        return photo;
      },
      updatePhoto: (id, patch) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deletePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),
    }),
    {
      name: "ananya:dashboard-journal",
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
      partialize: (s) => ({ photos: s.photos }),
    },
  ),
);
