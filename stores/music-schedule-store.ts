// ── Music Day-of Schedule store ───────────────────────────────────────────
// Per-event timeline of music cues — load-in → sound check → background
// → cued moments → handoffs → curfew → after-party → teardown. Slots are
// strictly typed via ScheduleSlotKind so the renderer can style cards.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  EnergyEventId,
  MusicScheduleSlot,
  ScheduleSlotKind,
} from "@/types/music";
import {
  DEMO_MUSIC_WEDDING_ID,
  SEED_MUSIC_SCHEDULE,
} from "@/lib/music-schedule-seed";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface ScheduleState {
  slots: MusicScheduleSlot[];

  addSlot: (
    input: Omit<MusicScheduleSlot, "id" | "wedding_id" | "sort_order">,
  ) => MusicScheduleSlot;
  updateSlot: (id: string, patch: Partial<MusicScheduleSlot>) => void;
  deleteSlot: (id: string) => void;

  slotsForEvent: (event: EnergyEventId) => MusicScheduleSlot[];
}

export const useMusicScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      slots: SEED_MUSIC_SCHEDULE,

      addSlot: (input) => {
        const sortOrder = get().slots.filter((s) => s.event === input.event)
          .length + 1;
        const record: MusicScheduleSlot = {
          ...input,
          id: rid("sch"),
          wedding_id: DEMO_MUSIC_WEDDING_ID,
          sort_order: sortOrder,
        };
        set((s) => ({ slots: [...s.slots, record] }));
        return record;
      },
      updateSlot: (id, patch) =>
        set((s) => ({
          slots: s.slots.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)),
        })),
      deleteSlot: (id) =>
        set((s) => ({ slots: s.slots.filter((sl) => sl.id !== id) })),

      slotsForEvent: (event) =>
        [...get().slots]
          .filter((s) => s.event === event)
          .sort((a, b) =>
            a.start_time === b.start_time
              ? a.sort_order - b.sort_order
              : a.start_time.localeCompare(b.start_time),
          ),
    }),
    {
      name: "ananya-music-schedule-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _musicScheduleSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMusicScheduleStore.subscribe((state) => {
  if (_musicScheduleSyncTimer) clearTimeout(_musicScheduleSyncTimer);
  _musicScheduleSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("music_schedule_state", { couple_id: coupleId, slots: state.slots });
  }, 600);
});

export const SCHEDULE_SLOT_LABEL: Record<ScheduleSlotKind, string> = {
  load_in: "Load-in",
  sound_check: "Sound check",
  background_music: "Background music",
  cue: "Music cue",
  handoff: "Vendor handoff",
  curfew_warning: "Curfew warning",
  after_party: "After-party",
  teardown: "Teardown",
};
