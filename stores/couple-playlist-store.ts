// ── Couple's playlist store ──────────────────────────────────────────────
// Running playlist the couple builds across the entire planning period.
// Songs are grouped by event bucket (garba / sangeet / ceremony /
// reception / baraat / haldi-mehendi / other) and persisted with
// sort_order so drag-reorders survive reload.
//
// Schema mirrors the dashboard prompt:
//   id · couple_id · song_title · artist · event_id (= bucket id) ·
//   spotify_id (nullable) · sort_order · created_at

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PlaylistEventBucket =
  | "haldi_mehendi"
  | "garba"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "reception"
  | "other";

export const PLAYLIST_BUCKET_LABEL: Record<PlaylistEventBucket, string> = {
  haldi_mehendi: "Haldi & Mehendi",
  garba: "Garba",
  sangeet: "Sangeet",
  baraat: "Baraat",
  ceremony: "Ceremony",
  reception: "Reception",
  other: "Other",
};

export const PLAYLIST_BUCKET_ORDER: PlaylistEventBucket[] = [
  "haldi_mehendi",
  "garba",
  "sangeet",
  "baraat",
  "ceremony",
  "reception",
  "other",
];

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  bucket: PlaylistEventBucket;
  spotifyId?: string | null;
  sortOrder: number;
  createdAt: string;
}

interface AddInput {
  title: string;
  artist: string;
  bucket: PlaylistEventBucket;
  spotifyId?: string | null;
}

interface PlaylistState {
  songs: PlaylistSong[];
  addSong: (input: AddInput) => PlaylistSong;
  removeSong: (id: string) => void;
  setBucket: (id: string, bucket: PlaylistEventBucket) => void;
  // Reorder a song within its bucket. Pass the song id and the target
  // index relative to the same-bucket sorted list.
  reorderInBucket: (id: string, toIndex: number) => void;
  clear: () => void;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `song_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

function nextSortOrder(
  songs: PlaylistSong[],
  bucket: PlaylistEventBucket,
): number {
  const inBucket = songs.filter((s) => s.bucket === bucket);
  if (inBucket.length === 0) return 0;
  return Math.max(...inBucket.map((s) => s.sortOrder)) + 1;
}

export const useCouplePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      songs: [],

      addSong: (input) => {
        let created: PlaylistSong | null = null;
        set((s) => {
          const song: PlaylistSong = {
            id: uid(),
            title: input.title.trim(),
            artist: input.artist.trim(),
            bucket: input.bucket,
            spotifyId: input.spotifyId ?? null,
            sortOrder: nextSortOrder(s.songs, input.bucket),
            createdAt: new Date().toISOString(),
          };
          created = song;
          return { songs: [...s.songs, song] };
        });
        return created!;
      },

      removeSong: (id) =>
        set((s) => ({ songs: s.songs.filter((song) => song.id !== id) })),

      setBucket: (id, bucket) =>
        set((s) => {
          const target = s.songs.find((song) => song.id === id);
          if (!target) return s;
          return {
            songs: s.songs.map((song) =>
              song.id === id
                ? { ...song, bucket, sortOrder: nextSortOrder(s.songs, bucket) }
                : song,
            ),
          };
        }),

      reorderInBucket: (id, toIndex) =>
        set((s) => {
          const target = s.songs.find((song) => song.id === id);
          if (!target) return s;
          const inBucket = s.songs
            .filter((song) => song.bucket === target.bucket)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          const fromIndex = inBucket.findIndex((song) => song.id === id);
          if (fromIndex === -1) return s;
          const reordered = [...inBucket];
          const [moved] = reordered.splice(fromIndex, 1);
          const clamped = Math.max(0, Math.min(reordered.length, toIndex));
          reordered.splice(clamped, 0, moved);
          const updated = new Map(
            reordered.map((song, idx) => [song.id, idx] as const),
          );
          return {
            songs: s.songs.map((song) =>
              updated.has(song.id)
                ? { ...song, sortOrder: updated.get(song.id) ?? song.sortOrder }
                : song,
            ),
          };
        }),

      clear: () => set({ songs: [] }),
    }),
    {
      name: "ananya:couple-playlist",
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
      partialize: (s) => ({ songs: s.songs }),
    },
  ),
);
