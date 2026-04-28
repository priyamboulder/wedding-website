// ── Community huddles store ────────────────────────────────────────────────
// Live audio-first rooms, localStorage-only. No real WebRTC — the "live"
// experience is simulated via a rotating active-speaker id that callers can
// read to drive a pulsing ring on participant avatars. Schema mirrors the
// original Daily.co + Supabase sketch so a real backend is a drop-in later.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Huddle,
  HuddleMessage,
  HuddleParticipant,
  HuddleType,
} from "@/types/community";
import {
  SEED_HUDDLES,
  SEED_HUDDLE_PARTICIPANTS,
  SEED_HUDDLE_MESSAGES,
} from "@/lib/community/seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

type HuddleDraft = {
  host_id: string;
  title: string;
  description?: string;
  topic_tags?: string[];
  huddle_type: HuddleType;
  scheduled_at?: string;
  max_participants?: number;
  city?: string;
  target_wedding_months?: string[];
  is_open?: boolean;
};

interface CommunityHuddlesState {
  huddles: Huddle[];
  participants: HuddleParticipant[];
  messages: HuddleMessage[];
  activeHuddleId: string | null;

  // Simulated "who's talking right now" id, keyed by huddle id. Non-persisted
  // because it's driven by a client-side timer (see useSpeakerRotation).
  activeSpeakerByHuddle: Record<string, string | undefined>;

  _hydratedSeed: boolean;

  createHuddle: (draft: HuddleDraft) => Huddle;
  updateHuddle: (id: string, patch: Partial<Huddle>) => void;
  startScheduledHuddle: (id: string) => void;
  endHuddle: (id: string) => void;

  joinHuddle: (huddleId: string, profileId: string) => void;
  leaveHuddle: (huddleId: string, profileId: string) => void;
  setActiveHuddle: (id: string | null) => void;
  toggleInterest: (huddleId: string, profileId: string) => void;

  toggleMic: (huddleId: string, profileId: string) => void;
  toggleVideo: (huddleId: string, profileId: string) => void;

  sendMessage: (huddleId: string, senderId: string, body: string) => void;

  setActiveSpeaker: (huddleId: string, profileId: string | undefined) => void;

  getInRoom: (huddleId: string) => HuddleParticipant[];
  getMessages: (huddleId: string) => HuddleMessage[];

  ensureSeeded: () => void;
}

export const useCommunityHuddlesStore = create<CommunityHuddlesState>()(
  persist(
    (set, get) => ({
      huddles: [],
      participants: [],
      messages: [],
      activeHuddleId: null,
      activeSpeakerByHuddle: {},
      _hydratedSeed: false,

      createHuddle: (draft) => {
        const now = new Date().toISOString();
        const huddle: Huddle = {
          id: uuid(),
          host_id: draft.host_id,
          title: draft.title,
          description: draft.description,
          topic_tags: draft.topic_tags ?? [],
          huddle_type: draft.huddle_type,
          scheduled_at: draft.scheduled_at,
          status: draft.huddle_type === "instant" ? "live" : "waiting",
          started_at: draft.huddle_type === "instant" ? now : undefined,
          max_participants: draft.max_participants ?? 12,
          city: draft.city,
          target_wedding_months: draft.target_wedding_months ?? [],
          is_open: draft.is_open ?? true,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ huddles: [...state.huddles, huddle] }));
        if (huddle.status === "live") {
          get().joinHuddle(huddle.id, draft.host_id);
        }
        return huddle;
      },

      updateHuddle: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          huddles: state.huddles.map((h) =>
            h.id === id ? { ...h, ...patch, updated_at: now } : h,
          ),
        }));
      },

      startScheduledHuddle: (id) => {
        const now = new Date().toISOString();
        const h = get().huddles.find((x) => x.id === id);
        if (!h) return;
        get().updateHuddle(id, { status: "live", started_at: now });
        get().joinHuddle(id, h.host_id);
      },

      endHuddle: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          huddles: state.huddles.map((h) =>
            h.id === id
              ? { ...h, status: "ended", ended_at: now, updated_at: now }
              : h,
          ),
          participants: state.participants.map((p) =>
            p.huddle_id === id && p.status === "in_room"
              ? { ...p, status: "left", left_at: now }
              : p,
          ),
          activeHuddleId: state.activeHuddleId === id ? null : state.activeHuddleId,
        }));
      },

      joinHuddle: (huddleId, profileId) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.participants.find(
            (p) => p.huddle_id === huddleId && p.profile_id === profileId,
          );
          if (existing) {
            return {
              participants: state.participants.map((p) =>
                p.id === existing.id
                  ? {
                      ...p,
                      status: "in_room",
                      joined_at: now,
                      left_at: undefined,
                    }
                  : p,
              ),
              activeHuddleId: huddleId,
            };
          }
          const participant: HuddleParticipant = {
            id: uuid(),
            huddle_id: huddleId,
            profile_id: profileId,
            status: "in_room",
            has_video: false,
            mic_on: true,
            joined_at: now,
          };
          return {
            participants: [...state.participants, participant],
            activeHuddleId: huddleId,
          };
        });
      },

      leaveHuddle: (huddleId, profileId) => {
        const now = new Date().toISOString();
        set((state) => ({
          participants: state.participants.map((p) =>
            p.huddle_id === huddleId &&
            p.profile_id === profileId &&
            p.status === "in_room"
              ? { ...p, status: "left", left_at: now }
              : p,
          ),
          activeHuddleId:
            state.activeHuddleId === huddleId ? null : state.activeHuddleId,
        }));
      },

      setActiveHuddle: (id) => set({ activeHuddleId: id }),

      toggleInterest: (huddleId, profileId) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.participants.find(
            (p) => p.huddle_id === huddleId && p.profile_id === profileId,
          );
          if (existing) {
            // Toggle off if currently invited; otherwise leave alone.
            if (existing.status === "invited") {
              return {
                participants: state.participants.filter(
                  (p) => p.id !== existing.id,
                ),
              };
            }
            return state;
          }
          const participant: HuddleParticipant = {
            id: uuid(),
            huddle_id: huddleId,
            profile_id: profileId,
            status: "invited",
            has_video: false,
            mic_on: true,
            joined_at: now,
          };
          return { participants: [...state.participants, participant] };
        });
      },

      toggleMic: (huddleId, profileId) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.huddle_id === huddleId && p.profile_id === profileId
              ? { ...p, mic_on: !p.mic_on }
              : p,
          ),
        }));
      },

      toggleVideo: (huddleId, profileId) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.huddle_id === huddleId && p.profile_id === profileId
              ? { ...p, has_video: !p.has_video }
              : p,
          ),
        }));
      },

      sendMessage: (huddleId, senderId, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();
        const message: HuddleMessage = {
          id: uuid(),
          huddle_id: huddleId,
          sender_id: senderId,
          body: trimmed,
          created_at: now,
        };
        set((state) => ({ messages: [...state.messages, message] }));
      },

      setActiveSpeaker: (huddleId, profileId) => {
        set((state) => ({
          activeSpeakerByHuddle: {
            ...state.activeSpeakerByHuddle,
            [huddleId]: profileId,
          },
        }));
      },

      getInRoom: (huddleId) =>
        get().participants.filter(
          (p) => p.huddle_id === huddleId && p.status === "in_room",
        ),

      getMessages: (huddleId) =>
        get()
          .messages.filter((m) => m.huddle_id === huddleId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;

        const existingHuddleIds = new Set(get().huddles.map((h) => h.id));
        const huddlesToAdd = SEED_HUDDLES.filter(
          (h) => !existingHuddleIds.has(h.id),
        );

        const existingParticipantKey = (p: HuddleParticipant) =>
          `${p.huddle_id}:${p.profile_id}`;
        const seenParticipants = new Set(
          get().participants.map(existingParticipantKey),
        );
        const participantsToAdd = SEED_HUDDLE_PARTICIPANTS.filter(
          (p) => !seenParticipants.has(`${p.huddle_id}:${p.profile_id}`),
        );

        const existingMessageIds = new Set(get().messages.map((m) => m.id));
        const messagesToAdd = SEED_HUDDLE_MESSAGES.filter(
          (m) => !existingMessageIds.has(m.id),
        );

        set((state) => ({
          huddles: [...state.huddles, ...huddlesToAdd],
          participants: [...state.participants, ...participantsToAdd],
          messages: [...state.messages, ...messagesToAdd],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-community-huddles",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      // Don't persist simulated speaker state — it's driven by a client timer.
      partialize: (state) => ({
        huddles: state.huddles,
        participants: state.participants,
        messages: state.messages,
        activeHuddleId: state.activeHuddleId,
        _hydratedSeed: state._hydratedSeed,
      }),
    },
  ),
);

let _communityHuddlesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunityHuddlesStore.subscribe((state) => {
  if (_communityHuddlesSyncTimer) clearTimeout(_communityHuddlesSyncTimer);
  _communityHuddlesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_huddles_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
