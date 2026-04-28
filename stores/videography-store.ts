// ── Videography store ─────────────────────────────────────────────────────
// Backs the purpose-built videography tabs: Vision & Mood (reference films,
// film brief), Film Vision (per-event narrative arc + interviews), Audio &
// Coverage (mic plan, coverage matrix, camera positions, coordination),
// Deliverables, Day-of Coverage.
//
// Kept separate from the photography store so evolving videography doesn't
// ripple into photography tabs. Persisted to localStorage.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  VideoCameraPosition,
  VideoCoordinationNote,
  VideoCoverage,
  VideoDayOfSlot,
  VideoDeliverable,
  VideoEventArc,
  VideoEventId,
  VideoFilmBrief,
  VideoInterview,
  VideoMicAssignment,
  VideoReferenceFilm,
} from "@/types/videography";
import {
  SEED_VIDEO_CAMERA_POSITIONS,
  SEED_VIDEO_COORDINATION,
  SEED_VIDEO_COVERAGE,
  SEED_VIDEO_DAY_OF,
  SEED_VIDEO_DELIVERABLES,
  SEED_VIDEO_EVENT_ARCS,
  SEED_VIDEO_FILM_BRIEF,
  SEED_VIDEO_INTERVIEWS,
  SEED_VIDEO_MIC_ASSIGNMENTS,
  SEED_VIDEO_REFERENCE_FILMS,
} from "@/lib/videography-seed";

interface VideographyState {
  reference_films: VideoReferenceFilm[];
  film_brief: VideoFilmBrief | null;
  event_arcs: VideoEventArc[];
  interviews: VideoInterview[];
  mic_assignments: VideoMicAssignment[];
  coverage: VideoCoverage[];
  camera_positions: VideoCameraPosition[];
  coordination: VideoCoordinationNote[];
  deliverables: VideoDeliverable[];
  day_of: VideoDayOfSlot[];

  // Reference films
  addReferenceFilm: (
    input: Omit<VideoReferenceFilm, "id" | "sort_order"> & { sort_order?: number },
  ) => VideoReferenceFilm;
  updateReferenceFilm: (id: string, patch: Partial<VideoReferenceFilm>) => void;
  deleteReferenceFilm: (id: string) => void;

  // Film brief
  setFilmBrief: (category_id: string, body: string) => void;

  // Event arcs
  ensureEventArc: (
    category_id: string,
    event: VideoEventId,
  ) => VideoEventArc;
  updateEventArc: (id: string, patch: Partial<VideoEventArc>) => void;
  addArcMustCapture: (id: string, entry: string) => void;
  removeArcMustCapture: (id: string, index: number) => void;

  // Interviews
  addInterview: (
    input: Omit<VideoInterview, "id" | "sort_order" | "captured"> & {
      sort_order?: number;
      captured?: boolean;
    },
  ) => VideoInterview;
  updateInterview: (id: string, patch: Partial<VideoInterview>) => void;
  deleteInterview: (id: string) => void;
  toggleInterviewCaptured: (id: string) => void;

  // Audio
  addMicAssignment: (
    input: Omit<VideoMicAssignment, "id" | "sort_order"> & { sort_order?: number },
  ) => VideoMicAssignment;
  updateMicAssignment: (id: string, patch: Partial<VideoMicAssignment>) => void;
  deleteMicAssignment: (id: string) => void;
  toggleMicEvent: (id: string, event: VideoEventId) => void;

  // Coverage
  setCoverage: (
    category_id: string,
    event: VideoEventId,
    patch: Partial<Omit<VideoCoverage, "id" | "category_id" | "event">>,
  ) => void;

  // Camera positions
  addCameraPosition: (
    input: Omit<VideoCameraPosition, "id" | "sort_order"> & { sort_order?: number },
  ) => VideoCameraPosition;
  updateCameraPosition: (id: string, patch: Partial<VideoCameraPosition>) => void;
  deleteCameraPosition: (id: string) => void;

  // Coordination
  addCoordinationNote: (
    input: Omit<VideoCoordinationNote, "id" | "sort_order"> & { sort_order?: number },
  ) => VideoCoordinationNote;
  updateCoordinationNote: (id: string, patch: Partial<VideoCoordinationNote>) => void;
  deleteCoordinationNote: (id: string) => void;

  // Deliverables
  addDeliverable: (
    input: Omit<VideoDeliverable, "id" | "sort_order" | "status"> & {
      sort_order?: number;
      status?: VideoDeliverable["status"];
    },
  ) => VideoDeliverable;
  updateDeliverable: (id: string, patch: Partial<VideoDeliverable>) => void;
  deleteDeliverable: (id: string) => void;

  // Day-of
  addDayOfSlot: (
    input: Omit<VideoDayOfSlot, "id" | "sort_order"> & { sort_order?: number },
  ) => VideoDayOfSlot;
  updateDayOfSlot: (id: string, patch: Partial<VideoDayOfSlot>) => void;
  deleteDayOfSlot: (id: string) => void;
}

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function nextOrder<T extends { category_id: string; sort_order: number }>(
  list: T[],
  category_id: string,
): number {
  const scoped = list.filter((x) => x.category_id === category_id);
  return scoped.length > 0
    ? Math.max(...scoped.map((x) => x.sort_order)) + 1
    : 1;
}

export const useVideographyStore = create<VideographyState>()(
  persist(
    (set, get) => ({
      reference_films: SEED_VIDEO_REFERENCE_FILMS,
      film_brief: SEED_VIDEO_FILM_BRIEF,
      event_arcs: SEED_VIDEO_EVENT_ARCS,
      interviews: SEED_VIDEO_INTERVIEWS,
      mic_assignments: SEED_VIDEO_MIC_ASSIGNMENTS,
      coverage: SEED_VIDEO_COVERAGE,
      camera_positions: SEED_VIDEO_CAMERA_POSITIONS,
      coordination: SEED_VIDEO_COORDINATION,
      deliverables: SEED_VIDEO_DELIVERABLES,
      day_of: SEED_VIDEO_DAY_OF,

      // ── Reference films ──
      addReferenceFilm: (input) => {
        const ref: VideoReferenceFilm = {
          id: rid("vref"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.reference_films, input.category_id);
          return { reference_films: [...s.reference_films, { ...ref, sort_order: order }] };
        });
        return ref;
      },
      updateReferenceFilm: (id, patch) =>
        set((s) => ({
          reference_films: s.reference_films.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteReferenceFilm: (id) =>
        set((s) => ({
          reference_films: s.reference_films.filter((x) => x.id !== id),
        })),

      // ── Film brief ──
      setFilmBrief: (category_id, body) =>
        set(() => ({
          film_brief: {
            category_id,
            body,
            updated_at: new Date().toISOString(),
          },
        })),

      // ── Event arcs ──
      ensureEventArc: (category_id, event) => {
        const existing = get().event_arcs.find(
          (a) => a.category_id === category_id && a.event === event,
        );
        if (existing) return existing;
        const arc: VideoEventArc = {
          id: rid("varc"),
          category_id,
          event,
          must_capture: [],
          sort_order: nextOrder(get().event_arcs, category_id),
        };
        set((s) => ({ event_arcs: [...s.event_arcs, arc] }));
        return arc;
      },
      updateEventArc: (id, patch) =>
        set((s) => ({
          event_arcs: s.event_arcs.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),
      addArcMustCapture: (id, entry) =>
        set((s) => ({
          event_arcs: s.event_arcs.map((a) =>
            a.id === id ? { ...a, must_capture: [...a.must_capture, entry] } : a,
          ),
        })),
      removeArcMustCapture: (id, index) =>
        set((s) => ({
          event_arcs: s.event_arcs.map((a) =>
            a.id === id
              ? { ...a, must_capture: a.must_capture.filter((_, i) => i !== index) }
              : a,
          ),
        })),

      // ── Interviews ──
      addInterview: (input) => {
        const entry: VideoInterview = {
          id: rid("vint"),
          sort_order: input.sort_order ?? 0,
          captured: input.captured ?? false,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.interviews, input.category_id);
          return { interviews: [...s.interviews, { ...entry, sort_order: order }] };
        });
        return entry;
      },
      updateInterview: (id, patch) =>
        set((s) => ({
          interviews: s.interviews.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteInterview: (id) =>
        set((s) => ({ interviews: s.interviews.filter((x) => x.id !== id) })),
      toggleInterviewCaptured: (id) =>
        set((s) => ({
          interviews: s.interviews.map((x) =>
            x.id === id ? { ...x, captured: !x.captured } : x,
          ),
        })),

      // ── Mic assignments ──
      addMicAssignment: (input) => {
        const mic: VideoMicAssignment = {
          id: rid("vmic"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.mic_assignments, input.category_id);
          return {
            mic_assignments: [...s.mic_assignments, { ...mic, sort_order: order }],
          };
        });
        return mic;
      },
      updateMicAssignment: (id, patch) =>
        set((s) => ({
          mic_assignments: s.mic_assignments.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteMicAssignment: (id) =>
        set((s) => ({
          mic_assignments: s.mic_assignments.filter((x) => x.id !== id),
        })),
      toggleMicEvent: (id, event) =>
        set((s) => ({
          mic_assignments: s.mic_assignments.map((x) => {
            if (x.id !== id) return x;
            const has = x.events.includes(event);
            return {
              ...x,
              events: has
                ? x.events.filter((e) => e !== event)
                : [...x.events, event],
            };
          }),
        })),

      // ── Coverage ──
      setCoverage: (category_id, event, patch) =>
        set((s) => {
          const existing = s.coverage.find(
            (c) => c.category_id === category_id && c.event === event,
          );
          if (existing) {
            return {
              coverage: s.coverage.map((c) =>
                c.id === existing.id ? { ...c, ...patch } : c,
              ),
            };
          }
          const next: VideoCoverage = {
            id: rid("vcov"),
            category_id,
            event,
            level: "full",
            ...patch,
          };
          return { coverage: [...s.coverage, next] };
        }),

      // ── Camera positions ──
      addCameraPosition: (input) => {
        const pos: VideoCameraPosition = {
          id: rid("vcam"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.camera_positions, input.category_id);
          return {
            camera_positions: [...s.camera_positions, { ...pos, sort_order: order }],
          };
        });
        return pos;
      },
      updateCameraPosition: (id, patch) =>
        set((s) => ({
          camera_positions: s.camera_positions.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteCameraPosition: (id) =>
        set((s) => ({
          camera_positions: s.camera_positions.filter((x) => x.id !== id),
        })),

      // ── Coordination ──
      addCoordinationNote: (input) => {
        const note: VideoCoordinationNote = {
          id: rid("vcoord"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.coordination, input.category_id);
          return {
            coordination: [...s.coordination, { ...note, sort_order: order }],
          };
        });
        return note;
      },
      updateCoordinationNote: (id, patch) =>
        set((s) => ({
          coordination: s.coordination.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteCoordinationNote: (id) =>
        set((s) => ({
          coordination: s.coordination.filter((x) => x.id !== id),
        })),

      // ── Deliverables ──
      addDeliverable: (input) => {
        const d: VideoDeliverable = {
          id: rid("vdel"),
          sort_order: input.sort_order ?? 0,
          status: input.status ?? "not_started",
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.deliverables, input.category_id);
          return { deliverables: [...s.deliverables, { ...d, sort_order: order }] };
        });
        return d;
      },
      updateDeliverable: (id, patch) =>
        set((s) => ({
          deliverables: s.deliverables.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteDeliverable: (id) =>
        set((s) => ({
          deliverables: s.deliverables.filter((x) => x.id !== id),
        })),

      // ── Day-of ──
      addDayOfSlot: (input) => {
        const slot: VideoDayOfSlot = {
          id: rid("vdof"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.day_of, input.category_id);
          return { day_of: [...s.day_of, { ...slot, sort_order: order }] };
        });
        return slot;
      },
      updateDayOfSlot: (id, patch) =>
        set((s) => ({
          day_of: s.day_of.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteDayOfSlot: (id) =>
        set((s) => ({ day_of: s.day_of.filter((x) => x.id !== id) })),
    }),
    {
      name: "ananya:videography",
      version: 1,
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

let _videoSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVideographyStore.subscribe((state) => {
  if (_videoSyncTimer) clearTimeout(_videoSyncTimer);
  _videoSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { reference_films, film_brief, event_arcs, interviews, mic_assignments, coverage, camera_positions, coordination, deliverables, day_of } = state;
    dbUpsert("videography_state", { couple_id: coupleId, reference_films, film_brief, event_arcs, interviews, mic_assignments, coverage, camera_positions, coordination, deliverables, day_of });
  }, 600);
});
