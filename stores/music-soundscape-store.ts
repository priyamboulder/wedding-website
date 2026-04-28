// ── Music Soundscape store ────────────────────────────────────────────────
// Per-event "what does this sound like" state — energy arc + opening/build/
// peak/wind-down moods + three playlists (must / request / dnp). Persisted
// to localStorage like every other Ananya store.
//
// Read-only co-write with quiz: the entertainment-vision quiz can seed
// `energyArc`, `genreMix`, `liveDjMix`, `nonNegotiables`, and `sangeetStyle`
// here so the right rail Energy Map renders immediately after the quiz.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  EnergyEventId,
  EnergyPoint,
  GenreTaste,
  LiveDjMix,
  MusicPartyId,
  NonNegotiableMoment,
  PlaylistKind,
  PlaylistTrack,
  SangeetStyle,
  Soundscape,
} from "@/types/music";
import {
  DEMO_MUSIC_WEDDING_ID,
  SEED_ENERGY_ARC,
  SEED_GENRE_MIX,
  SEED_LIVE_DJ_MIX,
  SEED_NON_NEGOTIABLES,
  SEED_SANGEET_STYLE,
  SEED_SOUNDSCAPES,
} from "@/lib/music-soundscape-seed";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface SoundscapeState {
  // Quiz-seeded vibe meta
  energy_arc: EnergyPoint[];
  sangeet_style: SangeetStyle;
  live_dj_mix: LiveDjMix;
  genre_mix: GenreTaste[];
  non_negotiables: NonNegotiableMoment[];

  // Per-event soundscape records
  soundscapes: Soundscape[];

  // ── Vibe setters (called by the quiz apply()) ────────────────────────
  setEnergyArc: (arc: EnergyPoint[]) => void;
  setEnergyForEvent: (event: EnergyEventId, energy: number) => void;
  setSangeetStyle: (style: SangeetStyle) => void;
  setLiveDjMix: (mix: LiveDjMix) => void;
  setGenreMix: (genres: GenreTaste[]) => void;
  setNonNegotiables: (moments: NonNegotiableMoment[]) => void;

  // ── Soundscape mutators ──────────────────────────────────────────────
  updateSoundscape: (
    event: EnergyEventId,
    patch: Partial<Omit<Soundscape, "id" | "wedding_id" | "event" | "playlists">>,
  ) => void;
  addCulturalRequirement: (event: EnergyEventId, label: string) => void;
  removeCulturalRequirement: (event: EnergyEventId, label: string) => void;

  // ── Track mutators ───────────────────────────────────────────────────
  addTrack: (
    event: EnergyEventId,
    kind: PlaylistKind,
    input: Omit<PlaylistTrack, "id" | "added_at">,
  ) => PlaylistTrack;
  updateTrack: (
    event: EnergyEventId,
    kind: PlaylistKind,
    track_id: string,
    patch: Partial<Omit<PlaylistTrack, "id" | "added_at" | "added_by">>,
  ) => void;
  deleteTrack: (
    event: EnergyEventId,
    kind: PlaylistKind,
    track_id: string,
  ) => void;
  moveTrack: (
    event: EnergyEventId,
    fromKind: PlaylistKind,
    toKind: PlaylistKind,
    track_id: string,
  ) => void;

  // ── Selectors ────────────────────────────────────────────────────────
  soundscapeFor: (event: EnergyEventId) => Soundscape;
  // Cross-list conflicts: titles that appear in both must AND dnp across
  // any event. AI cross-check from Tab 3 acceptance criteria.
  conflictTitles: () => string[];
}

const ensureSoundscape = (
  list: Soundscape[],
  event: EnergyEventId,
): { list: Soundscape[]; record: Soundscape } => {
  const found = list.find((s) => s.event === event);
  if (found) return { list, record: found };
  const fresh: Soundscape = {
    id: rid("ss"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event,
    cultural_requirements: [],
    playlists: {
      must: { kind: "must", tracks: [] },
      request: { kind: "request", tracks: [] },
      dnp: { kind: "dnp", tracks: [] },
    },
    updated_at: new Date().toISOString(),
  };
  return { list: [...list, fresh], record: fresh };
};

export const useMusicSoundscapeStore = create<SoundscapeState>()(
  persist(
    (set, get) => ({
      energy_arc: SEED_ENERGY_ARC,
      sangeet_style: SEED_SANGEET_STYLE,
      live_dj_mix: SEED_LIVE_DJ_MIX,
      genre_mix: SEED_GENRE_MIX,
      non_negotiables: SEED_NON_NEGOTIABLES,
      soundscapes: SEED_SOUNDSCAPES,

      setEnergyArc: (arc) => set({ energy_arc: arc }),
      setEnergyForEvent: (event, energy) =>
        set((s) => {
          const exists = s.energy_arc.some((p) => p.event === event);
          if (exists) {
            return {
              energy_arc: s.energy_arc.map((p) =>
                p.event === event ? { ...p, energy } : p,
              ),
            };
          }
          return { energy_arc: [...s.energy_arc, { event, energy }] };
        }),
      setSangeetStyle: (style) => set({ sangeet_style: style }),
      setLiveDjMix: (mix) => set({ live_dj_mix: mix }),
      setGenreMix: (genres) => set({ genre_mix: genres }),
      setNonNegotiables: (moments) => set({ non_negotiables: moments }),

      updateSoundscape: (event, patch) =>
        set((s) => {
          const { list, record } = ensureSoundscape(s.soundscapes, event);
          return {
            soundscapes: list.map((ss) =>
              ss.id === record.id
                ? { ...ss, ...patch, updated_at: new Date().toISOString() }
                : ss,
            ),
          };
        }),
      addCulturalRequirement: (event, label) =>
        set((s) => {
          const { list, record } = ensureSoundscape(s.soundscapes, event);
          if (record.cultural_requirements.includes(label)) {
            return { soundscapes: list };
          }
          return {
            soundscapes: list.map((ss) =>
              ss.id === record.id
                ? {
                    ...ss,
                    cultural_requirements: [...ss.cultural_requirements, label],
                    updated_at: new Date().toISOString(),
                  }
                : ss,
            ),
          };
        }),
      removeCulturalRequirement: (event, label) =>
        set((s) => {
          const { list, record } = ensureSoundscape(s.soundscapes, event);
          return {
            soundscapes: list.map((ss) =>
              ss.id === record.id
                ? {
                    ...ss,
                    cultural_requirements: ss.cultural_requirements.filter(
                      (l) => l !== label,
                    ),
                    updated_at: new Date().toISOString(),
                  }
                : ss,
            ),
          };
        }),

      addTrack: (event, kind, input) => {
        const track: PlaylistTrack = {
          ...input,
          id: rid("trk"),
          added_at: new Date().toISOString(),
        };
        set((s) => {
          const { list, record } = ensureSoundscape(s.soundscapes, event);
          return {
            soundscapes: list.map((ss) =>
              ss.id === record.id
                ? {
                    ...ss,
                    playlists: {
                      ...ss.playlists,
                      [kind]: {
                        kind,
                        tracks: [...ss.playlists[kind].tracks, track],
                      },
                    },
                    updated_at: new Date().toISOString(),
                  }
                : ss,
            ),
          };
        });
        return track;
      },
      updateTrack: (event, kind, track_id, patch) =>
        set((s) => ({
          soundscapes: s.soundscapes.map((ss) =>
            ss.event === event
              ? {
                  ...ss,
                  playlists: {
                    ...ss.playlists,
                    [kind]: {
                      kind,
                      tracks: ss.playlists[kind].tracks.map((t) =>
                        t.id === track_id ? { ...t, ...patch } : t,
                      ),
                    },
                  },
                  updated_at: new Date().toISOString(),
                }
              : ss,
          ),
        })),
      deleteTrack: (event, kind, track_id) =>
        set((s) => ({
          soundscapes: s.soundscapes.map((ss) =>
            ss.event === event
              ? {
                  ...ss,
                  playlists: {
                    ...ss.playlists,
                    [kind]: {
                      kind,
                      tracks: ss.playlists[kind].tracks.filter(
                        (t) => t.id !== track_id,
                      ),
                    },
                  },
                  updated_at: new Date().toISOString(),
                }
              : ss,
          ),
        })),
      moveTrack: (event, fromKind, toKind, track_id) =>
        set((s) => ({
          soundscapes: s.soundscapes.map((ss) => {
            if (ss.event !== event) return ss;
            const moving = ss.playlists[fromKind].tracks.find(
              (t) => t.id === track_id,
            );
            if (!moving) return ss;
            return {
              ...ss,
              playlists: {
                ...ss.playlists,
                [fromKind]: {
                  kind: fromKind,
                  tracks: ss.playlists[fromKind].tracks.filter(
                    (t) => t.id !== track_id,
                  ),
                },
                [toKind]: {
                  kind: toKind,
                  tracks: [...ss.playlists[toKind].tracks, moving],
                },
              },
              updated_at: new Date().toISOString(),
            };
          }),
        })),

      soundscapeFor: (event) => {
        const found = get().soundscapes.find((s) => s.event === event);
        if (found) return found;
        return {
          id: `placeholder-${event}`,
          wedding_id: DEMO_MUSIC_WEDDING_ID,
          event,
          cultural_requirements: [],
          playlists: {
            must: { kind: "must", tracks: [] },
            request: { kind: "request", tracks: [] },
            dnp: { kind: "dnp", tracks: [] },
          },
          updated_at: new Date().toISOString(),
        };
      },
      conflictTitles: () => {
        const seenMust = new Set<string>();
        const seenDnp = new Set<string>();
        for (const ss of get().soundscapes) {
          for (const t of ss.playlists.must.tracks) {
            seenMust.add(t.title.trim().toLowerCase());
          }
          for (const t of ss.playlists.dnp.tracks) {
            seenDnp.add(t.title.trim().toLowerCase());
          }
        }
        const conflicts: string[] = [];
        for (const t of seenMust) if (seenDnp.has(t)) conflicts.push(t);
        return conflicts;
      },
    }),
    {
      name: "ananya-music-soundscape-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _soundscapeSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMusicSoundscapeStore.subscribe((state) => {
  if (_soundscapeSyncTimer) clearTimeout(_soundscapeSyncTimer);
  _soundscapeSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("music_soundscape_state", { couple_id: coupleId, soundscapes: state.soundscapes });
  }, 600);
});

// ── Static helpers (used by tab + sidebar) ───────────────────────────────

export const ENERGY_EVENTS: { id: EnergyEventId; label: string }[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "ceremony", label: "Ceremony" },
  { id: "reception", label: "Reception" },
];

export const PLAYLIST_KIND_LABEL: Record<PlaylistKind, string> = {
  must: "Must Play",
  request: "Request",
  dnp: "Do Not Play",
};

export const SANGEET_STYLE_LABEL: Record<SangeetStyle, string> = {
  "sangeet-casual": "Casual family fun",
  "sangeet-semi": "Semi-choreographed",
  "sangeet-production": "Full production",
  "sangeet-show": "Variety-show with pros",
  "sangeet-skip": "Skipping (folded into reception)",
};

export const LIVE_DJ_LABEL: Record<LiveDjMix, string> = {
  "dj-primary": "DJ-only",
  hybrid: "Live band + DJ hybrid",
  "live-primary": "Live band primary",
  "acoustic-ceremony": "Acoustic ceremony only",
};

export const GENRE_LABEL: Record<GenreTaste, string> = {
  "classic-bollywood": "Classic Bollywood",
  "modern-bollywood": "Modern Bollywood / Punjabi",
  "sufi-qawwali": "Sufi & Qawwali",
  classical: "Classical (sitar, tabla, vocal)",
  "western-pop": "Western pop & R&B",
  edm: "EDM & club",
  "hip-hop": "Hip hop",
  eclectic: "Mix of everything",
};

export const NON_NEG_LABEL: Record<NonNegotiableMoment, string> = {
  "dhol-baraat": "Dhol during baraat",
  "couple-first-dance": "Couple's first dance",
  "parent-dances": "Parent dances",
  "grand-entrance": "Grand entrance with a song",
  "vidaai-song": "Vidaai with traditional song",
  "bouquet-toss": "Bouquet / garter toss",
  "late-night-bollywood": "Late-night Bollywood party",
  "hora-chair-lift": "Hora / chair lifting",
};
