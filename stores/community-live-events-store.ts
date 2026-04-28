// ── Community live events store ────────────────────────────────────────────
// Scheduled sessions with featured wedding industry professionals —
// hosted by the Ananya team. localStorage-only, no real WebRTC: the
// "live" experience (guest speaking, audience hand-raise, rotating
// active speaker) is simulated on top of Zustand state so the UX
// renders end-to-end. Schema mirrors the original Supabase sketch so a
// real backend is a drop-in later.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  FeaturedGuest,
  LiveEvent,
  LiveEventAttendee,
  LiveEventChatMessage,
  LiveEventQuestion,
  LiveEventQuestionVote,
  LiveEventRsvp,
  LiveEventRsvpStatus,
  LiveEventRole,
} from "@/types/community";
import {
  SEED_FEATURED_GUESTS,
  SEED_LIVE_EVENTS,
  SEED_LIVE_EVENT_RSVPS,
  SEED_LIVE_EVENT_QUESTIONS,
  SEED_LIVE_EVENT_CHAT,
} from "@/lib/community/seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface CommunityLiveEventsState {
  guests: FeaturedGuest[];
  events: LiveEvent[];
  rsvps: LiveEventRsvp[];
  attendees: LiveEventAttendee[];
  questions: LiveEventQuestion[];
  questionVotes: LiveEventQuestionVote[];
  chat: LiveEventChatMessage[];

  // Which question the moderator is currently asking (per event).
  activeQuestionByEvent: Record<string, string | undefined>;
  // Simulated active speaker (profile_id or guest_id), per event.
  activeSpeakerByEvent: Record<string, string | undefined>;

  _hydratedSeed: boolean;

  // Events
  startEvent: (id: string) => void;
  endEvent: (id: string) => void;

  // RSVPs
  rsvp: (eventId: string, profileId: string, status: LiveEventRsvpStatus) => void;

  // Attendees (join / leave the live room)
  joinRoom: (
    eventId: string,
    opts:
      | { profileId: string; role?: LiveEventRole }
      | { guestId: string; role: "guest" | "moderator" },
  ) => LiveEventAttendee;
  leaveRoom: (eventId: string, attendeeId: string) => void;
  raiseHand: (attendeeId: string) => void;
  lowerHand: (attendeeId: string) => void;
  inviteToSpeak: (attendeeId: string) => void;
  returnToAudience: (attendeeId: string) => void;

  // Questions
  submitQuestion: (eventId: string, askerId: string, body: string) => void;
  voteQuestion: (questionId: string, voterId: string) => void;
  setActiveQuestion: (eventId: string, questionId: string | undefined) => void;
  markQuestionAnswered: (questionId: string) => void;
  skipQuestion: (questionId: string) => void;

  // Chat
  sendChat: (
    eventId: string,
    sender: { profileId?: string; guestId?: string },
    body: string,
  ) => void;

  // Simulated speaker rotation
  setActiveSpeaker: (eventId: string, speakerId: string | undefined) => void;

  // Selectors
  getEventById: (id: string) => LiveEvent | undefined;
  getGuestById: (id: string) => FeaturedGuest | undefined;
  getAttendeesInRoom: (eventId: string) => LiveEventAttendee[];
  getQuestionsFor: (eventId: string) => LiveEventQuestion[];
  getChatFor: (eventId: string) => LiveEventChatMessage[];
  getRsvpCount: (eventId: string) => number;
  getMyRsvp: (
    eventId: string,
    profileId: string,
  ) => LiveEventRsvp | undefined;

  ensureSeeded: () => void;
}

export const useCommunityLiveEventsStore = create<CommunityLiveEventsState>()(
  persist(
    (set, get) => ({
      guests: [],
      events: [],
      rsvps: [],
      attendees: [],
      questions: [],
      questionVotes: [],
      chat: [],
      activeQuestionByEvent: {},
      activeSpeakerByEvent: {},
      _hydratedSeed: false,

      // ── Events ─────────────────────────────────────────────────────────
      startEvent: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "live",
                  started_at: now,
                  updated_at: now,
                }
              : e,
          ),
        }));
      },

      endEvent: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "ended",
                  ended_at: now,
                  updated_at: now,
                }
              : e,
          ),
          attendees: state.attendees.map((a) =>
            a.event_id === id && a.status === "in_room"
              ? { ...a, status: "left", left_at: now }
              : a,
          ),
        }));
      },

      // ── RSVPs ──────────────────────────────────────────────────────────
      rsvp: (eventId, profileId, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.rsvps.find(
            (r) => r.event_id === eventId && r.profile_id === profileId,
          );
          if (existing) {
            return {
              rsvps: state.rsvps.map((r) =>
                r.id === existing.id ? { ...r, status } : r,
              ),
            };
          }
          const rsvp: LiveEventRsvp = {
            id: uuid(),
            event_id: eventId,
            profile_id: profileId,
            status,
            remind_15min: true,
            created_at: now,
          };
          return { rsvps: [...state.rsvps, rsvp] };
        });
      },

      // ── Attendees ──────────────────────────────────────────────────────
      joinRoom: (eventId, opts) => {
        const now = new Date().toISOString();
        const existing = get().attendees.find(
          (a) =>
            a.event_id === eventId &&
            (("profileId" in opts && a.profile_id === opts.profileId) ||
              ("guestId" in opts && a.guest_id === opts.guestId)),
        );
        if (existing) {
          set((state) => ({
            attendees: state.attendees.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    status: "in_room",
                    joined_at: now,
                    left_at: undefined,
                  }
                : a,
            ),
          }));
          return { ...existing, status: "in_room", joined_at: now };
        }

        const role: LiveEventRole =
          "role" in opts && opts.role
            ? opts.role
            : "audience";

        const attendee: LiveEventAttendee = {
          id: uuid(),
          event_id: eventId,
          profile_id: "profileId" in opts ? opts.profileId : undefined,
          guest_id: "guestId" in opts ? opts.guestId : undefined,
          role,
          status: "in_room",
          hand_raised: false,
          joined_at: now,
        };
        set((state) => ({ attendees: [...state.attendees, attendee] }));
        return attendee;
      },

      leaveRoom: (eventId, attendeeId) => {
        const now = new Date().toISOString();
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === attendeeId && a.event_id === eventId
              ? { ...a, status: "left", hand_raised: false, left_at: now }
              : a,
          ),
        }));
      },

      raiseHand: (attendeeId) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === attendeeId ? { ...a, hand_raised: true } : a,
          ),
        }));
      },

      lowerHand: (attendeeId) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === attendeeId ? { ...a, hand_raised: false } : a,
          ),
        }));
      },

      inviteToSpeak: (attendeeId) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === attendeeId
              ? { ...a, role: "speaker", hand_raised: false }
              : a,
          ),
        }));
      },

      returnToAudience: (attendeeId) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === attendeeId ? { ...a, role: "audience" } : a,
          ),
        }));
      },

      // ── Questions ──────────────────────────────────────────────────────
      submitQuestion: (eventId, askerId, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();
        const question: LiveEventQuestion = {
          id: uuid(),
          event_id: eventId,
          asker_id: askerId,
          body: trimmed,
          vote_count: 1, // self-vote
          status: "pending",
          created_at: now,
        };
        const vote: LiveEventQuestionVote = {
          id: uuid(),
          question_id: question.id,
          voter_id: askerId,
          created_at: now,
        };
        set((state) => ({
          questions: [...state.questions, question],
          questionVotes: [...state.questionVotes, vote],
        }));
      },

      voteQuestion: (questionId, voterId) => {
        set((state) => {
          const existing = state.questionVotes.find(
            (v) => v.question_id === questionId && v.voter_id === voterId,
          );
          if (existing) {
            // Toggle off.
            const votes = state.questionVotes.filter(
              (v) => v.id !== existing.id,
            );
            return {
              questionVotes: votes,
              questions: state.questions.map((q) =>
                q.id === questionId
                  ? { ...q, vote_count: Math.max(0, q.vote_count - 1) }
                  : q,
              ),
            };
          }
          const now = new Date().toISOString();
          const vote: LiveEventQuestionVote = {
            id: uuid(),
            question_id: questionId,
            voter_id: voterId,
            created_at: now,
          };
          return {
            questionVotes: [...state.questionVotes, vote],
            questions: state.questions.map((q) =>
              q.id === questionId
                ? { ...q, vote_count: q.vote_count + 1 }
                : q,
            ),
          };
        });
      },

      setActiveQuestion: (eventId, questionId) => {
        set((state) => ({
          activeQuestionByEvent: {
            ...state.activeQuestionByEvent,
            [eventId]: questionId,
          },
          questions: questionId
            ? state.questions.map((q) =>
                q.id === questionId ? { ...q, status: "selected" } : q,
              )
            : state.questions,
        }));
      },

      markQuestionAnswered: (questionId) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, status: "answered" } : q,
          ),
        }));
      },

      skipQuestion: (questionId) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, status: "skipped" } : q,
          ),
        }));
      },

      // ── Chat ───────────────────────────────────────────────────────────
      sendChat: (eventId, sender, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();
        const msg: LiveEventChatMessage = {
          id: uuid(),
          event_id: eventId,
          profile_id: sender.profileId,
          guest_id: sender.guestId,
          body: trimmed,
          kind: "message",
          created_at: now,
        };
        set((state) => ({ chat: [...state.chat, msg] }));
      },

      setActiveSpeaker: (eventId, speakerId) => {
        set((state) => ({
          activeSpeakerByEvent: {
            ...state.activeSpeakerByEvent,
            [eventId]: speakerId,
          },
        }));
      },

      // ── Selectors ──────────────────────────────────────────────────────
      getEventById: (id) => get().events.find((e) => e.id === id),
      getGuestById: (id) => get().guests.find((g) => g.id === id),
      getAttendeesInRoom: (eventId) =>
        get().attendees.filter(
          (a) => a.event_id === eventId && a.status === "in_room",
        ),
      getQuestionsFor: (eventId) =>
        get()
          .questions.filter((q) => q.event_id === eventId)
          .sort((a, b) => {
            if (a.status === "answered" && b.status !== "answered") return 1;
            if (b.status === "answered" && a.status !== "answered") return -1;
            return b.vote_count - a.vote_count;
          }),
      getChatFor: (eventId) =>
        get()
          .chat.filter((c) => c.event_id === eventId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
      getRsvpCount: (eventId) =>
        get().rsvps.filter(
          (r) => r.event_id === eventId && r.status === "going",
        ).length,
      getMyRsvp: (eventId, profileId) =>
        get().rsvps.find(
          (r) => r.event_id === eventId && r.profile_id === profileId,
        ),

      // ── Seeding ────────────────────────────────────────────────────────
      ensureSeeded: () => {
        if (get()._hydratedSeed) return;

        const existingGuestIds = new Set(get().guests.map((g) => g.id));
        const guestsToAdd = SEED_FEATURED_GUESTS.filter(
          (g) => !existingGuestIds.has(g.id),
        );

        const existingEventIds = new Set(get().events.map((e) => e.id));
        const eventsToAdd = SEED_LIVE_EVENTS.filter(
          (e) => !existingEventIds.has(e.id),
        );

        const existingRsvpIds = new Set(get().rsvps.map((r) => r.id));
        const rsvpsToAdd = SEED_LIVE_EVENT_RSVPS.filter(
          (r) => !existingRsvpIds.has(r.id),
        );

        const existingQuestionIds = new Set(
          get().questions.map((q) => q.id),
        );
        const questionsToAdd = SEED_LIVE_EVENT_QUESTIONS.filter(
          (q) => !existingQuestionIds.has(q.id),
        );

        const existingChatIds = new Set(get().chat.map((c) => c.id));
        const chatToAdd = SEED_LIVE_EVENT_CHAT.filter(
          (c) => !existingChatIds.has(c.id),
        );

        set((state) => ({
          guests: [...state.guests, ...guestsToAdd],
          events: [...state.events, ...eventsToAdd],
          rsvps: [...state.rsvps, ...rsvpsToAdd],
          questions: [...state.questions, ...questionsToAdd],
          chat: [...state.chat, ...chatToAdd],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-community-live-events",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      // Active question & active speaker are transient — derived from
      // client-side timers / moderator actions within a session.
      partialize: (state) => ({
        guests: state.guests,
        events: state.events,
        rsvps: state.rsvps,
        attendees: state.attendees,
        questions: state.questions,
        questionVotes: state.questionVotes,
        chat: state.chat,
        _hydratedSeed: state._hydratedSeed,
      }),
    },
  ),
);

let _communityLiveEventsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunityLiveEventsStore.subscribe((state) => {
  if (_communityLiveEventsSyncTimer) clearTimeout(_communityLiveEventsSyncTimer);
  _communityLiveEventsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_live_events_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
