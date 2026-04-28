// ── Music Equipment & Technical store ─────────────────────────────────────
// One TechSpec per event — sound, lighting, stage, power. Each event gets
// scaffolded on first read so the tab body never has to handle "no record
// yet" branching.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  EnergyEventId,
  LightingPlan,
  PowerPlan,
  SoundMic,
  SoundSpeaker,
  StagePlan,
  TechSpec,
  VolumeLevel,
  VolumePhase,
} from "@/types/music";
const DEMO_MUSIC_WEDDING_ID = "wedding-demo";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const blankSpec = (event: EnergyEventId): TechSpec => ({
  id: rid("tech"),
  wedding_id: DEMO_MUSIC_WEDDING_ID,
  event,
  speakers: [],
  mics: [],
  volume_levels: [],
  lighting: {},
  stage: {},
  power: {},
  updated_at: new Date().toISOString(),
});

interface TechState {
  specs: TechSpec[];

  // Lookup w/ side-effect — returns existing or appends a blank record.
  ensureSpec: (event: EnergyEventId) => TechSpec;

  addSpeaker: (event: EnergyEventId, input: Omit<SoundSpeaker, "id">) => void;
  removeSpeaker: (event: EnergyEventId, speaker_id: string) => void;
  addMic: (event: EnergyEventId, input: Omit<SoundMic, "id">) => void;
  removeMic: (event: EnergyEventId, mic_id: string) => void;
  setSoundCheck: (
    event: EnergyEventId,
    sound_check_at?: string,
    attendees?: string[],
  ) => void;
  setVolumeLevel: (event: EnergyEventId, level: VolumeLevel) => void;
  setLighting: (event: EnergyEventId, patch: Partial<LightingPlan>) => void;
  setStage: (event: EnergyEventId, patch: Partial<StagePlan>) => void;
  setPower: (event: EnergyEventId, patch: Partial<PowerPlan>) => void;
  setBackupPlan: (event: EnergyEventId, plan?: string) => void;

  specFor: (event: EnergyEventId) => TechSpec;
}

export const useMusicTechStore = create<TechState>()(
  persist(
    (set, get) => ({
      specs: [],

      ensureSpec: (event) => {
        const found = get().specs.find((s) => s.event === event);
        if (found) return found;
        const fresh = blankSpec(event);
        set((s) => ({ specs: [...s.specs, fresh] }));
        return fresh;
      },

      addSpeaker: (event, input) =>
        set((s) => {
          const exists = s.specs.some((sp) => sp.event === event);
          const next: TechSpec[] = exists
            ? s.specs
            : [...s.specs, blankSpec(event)];
          const speaker: SoundSpeaker = { ...input, id: rid("spk") };
          return {
            specs: next.map((sp) =>
              sp.event === event
                ? {
                    ...sp,
                    speakers: [...sp.speakers, speaker],
                    updated_at: new Date().toISOString(),
                  }
                : sp,
            ),
          };
        }),
      removeSpeaker: (event, speaker_id) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  speakers: sp.speakers.filter((x) => x.id !== speaker_id),
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      addMic: (event, input) =>
        set((s) => {
          const exists = s.specs.some((sp) => sp.event === event);
          const next: TechSpec[] = exists
            ? s.specs
            : [...s.specs, blankSpec(event)];
          const mic: SoundMic = { ...input, id: rid("mic") };
          return {
            specs: next.map((sp) =>
              sp.event === event
                ? {
                    ...sp,
                    mics: [...sp.mics, mic],
                    updated_at: new Date().toISOString(),
                  }
                : sp,
            ),
          };
        }),
      removeMic: (event, mic_id) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  mics: sp.mics.filter((m) => m.id !== mic_id),
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      setSoundCheck: (event, sound_check_at, attendees) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  sound_check_at,
                  sound_check_attendees: attendees,
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      setVolumeLevel: (event, level) =>
        set((s) => ({
          specs: s.specs.map((sp) => {
            if (sp.event !== event) return sp;
            const without = sp.volume_levels.filter((v) => v.phase !== level.phase);
            return {
              ...sp,
              volume_levels: [...without, level],
              updated_at: new Date().toISOString(),
            };
          }),
        })),
      setLighting: (event, patch) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  lighting: { ...sp.lighting, ...patch },
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      setStage: (event, patch) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  stage: { ...sp.stage, ...patch },
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      setPower: (event, patch) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  power: { ...sp.power, ...patch },
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),
      setBackupPlan: (event, plan) =>
        set((s) => ({
          specs: s.specs.map((sp) =>
            sp.event === event
              ? {
                  ...sp,
                  backup_plan: plan,
                  updated_at: new Date().toISOString(),
                }
              : sp,
          ),
        })),

      specFor: (event) => {
        const found = get().specs.find((s) => s.event === event);
        return found ?? blankSpec(event);
      },
    }),
    {
      name: "ananya-music-tech-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _musicTechSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMusicTechStore.subscribe((state) => {
  if (_musicTechSyncTimer) clearTimeout(_musicTechSyncTimer);
  _musicTechSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("music_tech_state", { couple_id: coupleId, specs: state.specs });
  }, 600);
});

// ── Volume phase + label helpers ─────────────────────────────────────────

export const VOLUME_PHASES: { id: VolumePhase; label: string }[] = [
  { id: "ceremony", label: "Ceremony" },
  { id: "cocktails", label: "Cocktails" },
  { id: "dinner", label: "Dinner" },
  { id: "party", label: "Party" },
  { id: "after_curfew", label: "After curfew" },
];

export const VOLUME_LEVEL_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Ambient",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Club",
};
