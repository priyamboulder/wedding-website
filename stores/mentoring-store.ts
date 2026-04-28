// ── Mentoring store ────────────────────────────────────────────────────────
// Persists mentor profiles and mentorship matches. A "mentor" here is a
// CommunityProfile that has also registered as a mentor — the link is
// profile_id. DM threads use the existing community-social-store: on accept
// we create (or reuse) a connection so the pair lands in Messages.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BudgetRange,
  MentorCommPref,
  MentorProfile,
  MentorshipMatch,
  MentorshipStatus,
} from "@/types/mentoring";
import { PENDING_EXPIRY_MS } from "@/types/mentoring";
import { useCommunitySocialStore } from "./community-social-store";

function nowIso(): string {
  return new Date().toISOString();
}

export interface MentorProfileDraft {
  expertise_tags: string[];
  max_active_mentees: number;
  preferred_communication: MentorCommPref[];
  availability_note?: string;
  one_thing_i_wish?: string;
  best_decision?: string;
  biggest_surprise?: string;
  // Wedding context — editable
  display_name: string;
  wedding_city?: string;
  wedding_date?: string;
  guest_count?: number;
  cultural_tradition: string[];
  wedding_style: string[];
  budget_range?: BudgetRange;
  number_of_events?: number;
}

interface MentoringState {
  mentors: MentorProfile[];
  matches: MentorshipMatch[];
  _seeded: boolean;

  // ── Queries
  getMentorByProfileId: (profileId: string) => MentorProfile | undefined;
  getActiveMenteesForMentor: (mentorId: string) => MentorshipMatch[];
  getPendingForMentor: (mentorId: string) => MentorshipMatch[];
  getPastForMentor: (mentorId: string) => MentorshipMatch[];
  getActiveForMentee: (menteeProfileId: string) => MentorshipMatch[];
  getPendingForMentee: (menteeProfileId: string) => MentorshipMatch[];

  // ── Mutations — mentor profile
  createMentorProfile: (
    profileId: string,
    draft: MentorProfileDraft,
  ) => MentorProfile;
  updateMentorProfile: (mentorId: string, draft: Partial<MentorProfileDraft>) => void;
  pauseMentor: (mentorId: string) => void;
  unpauseMentor: (mentorId: string) => void;
  deactivateMentor: (mentorId: string) => void;
  reactivateMentor: (mentorId: string) => void;

  // ── Mutations — matches
  requestMentorship: (input: {
    mentor_profile_id: string;
    mentee_profile_id: string;
    topics_interested_in: string[];
    request_message?: string;
  }) => MentorshipMatch | { error: string };
  respondToRequest: (
    matchId: string,
    action: "accept" | "decline",
    decline_reason?: string,
  ) => void;
  withdrawRequest: (matchId: string) => void;
  completeMatch: (
    matchId: string,
    feedback?: { rating?: number; feedback?: string },
  ) => void;
  expireStalePending: () => void;

  // ── Seed
  ensureSeeded: () => void;
}

// Small reproducible seed so the "Ask a Bride" directory isn't empty before
// the user opts in.
const SEED_MENTORS: MentorProfile[] = [
  {
    id: "seed-mentor-priya",
    profile_id: "seed-priya", // may not match a real community profile; UI falls back
    expertise_tags: [
      "indian_weddings",
      "budget_planning",
      "vendor_issues",
      "family_dynamics",
      "day_of_coordination",
    ],
    display_name: "Priya",
    wedding_city: "Dallas, TX",
    wedding_date: "2026-11-10",
    guest_count: 150,
    cultural_tradition: ["south_asian"],
    wedding_style: ["modern", "traditional"],
    budget_range: "50k_100k",
    number_of_events: 4,
    max_active_mentees: 3,
    preferred_communication: ["chat", "huddle"],
    availability_note: "free most evenings after 7pm CST",
    one_thing_i_wish: "Your caterer will always cost more than the quote. Always.",
    best_decision:
      "Hiring a day-of coordinator. I resisted the cost — worth every penny.",
    biggest_surprise: "How fast the day goes. I barely ate.",
    is_active: true,
    is_paused: false,
    total_mentees_helped: 4,
    avg_rating: 4.8,
    created_at: "2027-01-15T00:00:00.000Z",
    updated_at: "2027-01-15T00:00:00.000Z",
  },
  {
    id: "seed-mentor-ananya",
    profile_id: "seed-ananya",
    expertise_tags: [
      "destination_weddings",
      "multi_day_celebrations",
      "interfaith_ceremonies",
      "bridal_fashion",
      "staying_on_budget",
    ],
    display_name: "Ananya",
    wedding_city: "Houston, TX",
    wedding_date: "2027-01-22",
    guest_count: 250,
    cultural_tradition: ["south_asian"],
    wedding_style: ["fusion"],
    budget_range: "100k_200k",
    number_of_events: 5,
    max_active_mentees: 2,
    preferred_communication: ["chat", "video"],
    availability_note: "weekends work best",
    one_thing_i_wish:
      "Build 20% padding into every category. Something always comes up.",
    best_decision:
      "A second photographer for cocktail hour — those candids beat the posed portraits.",
    biggest_surprise: "How much the small vendors rallied when our florist flaked.",
    is_active: true,
    is_paused: false,
    total_mentees_helped: 2,
    avg_rating: 5.0,
    created_at: "2027-02-02T00:00:00.000Z",
    updated_at: "2027-02-02T00:00:00.000Z",
  },
  {
    id: "seed-mentor-meera",
    profile_id: "seed-meera",
    expertise_tags: [
      "micro_weddings",
      "diy_projects",
      "decor_design",
      "floral_design",
      "pre_wedding_stress",
    ],
    display_name: "Meera",
    wedding_city: "Austin, TX",
    wedding_date: "2026-09-05",
    guest_count: 80,
    cultural_tradition: ["south_asian"],
    wedding_style: ["modern"],
    budget_range: "under_50k",
    number_of_events: 2,
    max_active_mentees: 3,
    preferred_communication: ["chat"],
    one_thing_i_wish: "Say no to any event that doesn't bring you joy.",
    best_decision: "We skipped a sangeet. No one missed it. We saved $12K.",
    biggest_surprise: "The DIY flowers held up better than I thought.",
    is_active: true,
    is_paused: false,
    total_mentees_helped: 6,
    avg_rating: 4.7,
    created_at: "2026-11-30T00:00:00.000Z",
    updated_at: "2026-11-30T00:00:00.000Z",
  },
];

export const useMentoringStore = create<MentoringState>()(
  persist(
    (set, get) => ({
      mentors: [],
      matches: [],
      _seeded: false,

      // ── Queries
      getMentorByProfileId: (profileId) =>
        get().mentors.find((m) => m.profile_id === profileId),

      getActiveMenteesForMentor: (mentorId) =>
        get().matches.filter(
          (m) => m.mentor_profile_id === mentorId && m.status === "active",
        ),

      getPendingForMentor: (mentorId) =>
        get().matches.filter(
          (m) => m.mentor_profile_id === mentorId && m.status === "pending",
        ),

      getPastForMentor: (mentorId) =>
        get().matches.filter(
          (m) =>
            m.mentor_profile_id === mentorId &&
            (m.status === "completed" || m.status === "declined"),
        ),

      getActiveForMentee: (menteeProfileId) =>
        get().matches.filter(
          (m) =>
            m.mentee_profile_id === menteeProfileId && m.status === "active",
        ),

      getPendingForMentee: (menteeProfileId) =>
        get().matches.filter(
          (m) =>
            m.mentee_profile_id === menteeProfileId && m.status === "pending",
        ),

      // ── Mentor profile
      createMentorProfile: (profileId, draft) => {
        const existing = get().mentors.find((m) => m.profile_id === profileId);
        if (existing) {
          get().updateMentorProfile(existing.id, draft);
          // reactivate if needed
          set((state) => ({
            mentors: state.mentors.map((m) =>
              m.id === existing.id
                ? { ...m, is_active: true, is_paused: false, updated_at: nowIso() }
                : m,
            ),
          }));
          return get().mentors.find((m) => m.id === existing.id)!;
        }

        const profile: MentorProfile = {
          id: uuid(),
          profile_id: profileId,
          expertise_tags: draft.expertise_tags,
          display_name: draft.display_name,
          wedding_city: draft.wedding_city,
          wedding_date: draft.wedding_date,
          guest_count: draft.guest_count,
          cultural_tradition: draft.cultural_tradition,
          wedding_style: draft.wedding_style,
          budget_range: draft.budget_range,
          number_of_events: draft.number_of_events,
          max_active_mentees: draft.max_active_mentees,
          preferred_communication: draft.preferred_communication,
          availability_note: draft.availability_note,
          one_thing_i_wish: draft.one_thing_i_wish,
          best_decision: draft.best_decision,
          biggest_surprise: draft.biggest_surprise,
          is_active: true,
          is_paused: false,
          total_mentees_helped: 0,
          avg_rating: null,
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((state) => ({ mentors: [...state.mentors, profile] }));
        return profile;
      },

      updateMentorProfile: (mentorId, draft) => {
        set((state) => ({
          mentors: state.mentors.map((m) =>
            m.id === mentorId ? { ...m, ...draft, updated_at: nowIso() } : m,
          ),
        }));
      },

      pauseMentor: (mentorId) => {
        set((state) => ({
          mentors: state.mentors.map((m) =>
            m.id === mentorId ? { ...m, is_paused: true, updated_at: nowIso() } : m,
          ),
        }));
      },

      unpauseMentor: (mentorId) => {
        set((state) => ({
          mentors: state.mentors.map((m) =>
            m.id === mentorId ? { ...m, is_paused: false, updated_at: nowIso() } : m,
          ),
        }));
      },

      deactivateMentor: (mentorId) => {
        set((state) => ({
          mentors: state.mentors.map((m) =>
            m.id === mentorId
              ? { ...m, is_active: false, is_paused: false, updated_at: nowIso() }
              : m,
          ),
          // complete any active/pending matches
          matches: state.matches.map((match) => {
            if (match.mentor_profile_id !== mentorId) return match;
            if (match.status === "active" || match.status === "pending") {
              return {
                ...match,
                status: "completed" as MentorshipStatus,
                completed_at: nowIso(),
                updated_at: nowIso(),
              };
            }
            return match;
          }),
        }));
      },

      reactivateMentor: (mentorId) => {
        set((state) => ({
          mentors: state.mentors.map((m) =>
            m.id === mentorId
              ? { ...m, is_active: true, is_paused: false, updated_at: nowIso() }
              : m,
          ),
        }));
      },

      // ── Matches
      requestMentorship: ({
        mentor_profile_id,
        mentee_profile_id,
        topics_interested_in,
        request_message,
      }) => {
        const state = get();
        const mentor = state.mentors.find((m) => m.id === mentor_profile_id);
        if (!mentor || !mentor.is_active || mentor.is_paused) {
          return { error: "This mentor isn't accepting new requests right now." };
        }

        const active = state.matches.filter(
          (m) => m.mentor_profile_id === mentor_profile_id && m.status === "active",
        ).length;
        if (active >= mentor.max_active_mentees) {
          return { error: "This mentor is currently full." };
        }

        const existing = state.matches.find(
          (m) =>
            m.mentor_profile_id === mentor_profile_id &&
            m.mentee_profile_id === mentee_profile_id &&
            (m.status === "pending" || m.status === "active"),
        );
        if (existing) {
          return { error: "You already have a request with this mentor." };
        }

        const menteeActive = state.matches.filter(
          (m) =>
            m.mentee_profile_id === mentee_profile_id && m.status === "active",
        ).length;
        if (menteeActive >= 3) {
          return { error: "You're already connected with 3 mentors." };
        }

        const menteePending = state.matches.filter(
          (m) =>
            m.mentee_profile_id === mentee_profile_id && m.status === "pending",
        ).length;
        if (menteePending >= 2) {
          return { error: "You have 2 pending requests — wait for a reply first." };
        }

        const match: MentorshipMatch = {
          id: uuid(),
          mentor_profile_id,
          mentee_profile_id,
          request_message,
          topics_interested_in,
          status: "pending",
          requested_at: nowIso(),
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((st) => ({ matches: [...st.matches, match] }));
        return match;
      },

      respondToRequest: (matchId, action, decline_reason) => {
        const match = get().matches.find((m) => m.id === matchId);
        if (!match || match.status !== "pending") return;

        if (action === "accept") {
          const mentor = get().mentors.find(
            (m) => m.id === match.mentor_profile_id,
          );
          let connectionId: string | undefined;
          if (mentor) {
            // Create or reuse a DM connection. The social store's
            // requestConnection auto-creates a pending row, so we flip it to
            // accepted right after.
            const social = useCommunitySocialStore.getState();
            const existing = social.getConnectionBetween(
              mentor.profile_id,
              match.mentee_profile_id,
            );
            if (existing) {
              if (existing.status !== "accepted") {
                social.respondConnection(existing.id, "accepted");
              }
              connectionId = existing.id;
            } else {
              const conn = social.requestConnection(
                mentor.profile_id,
                match.mentee_profile_id,
                "Mentor accepted — start the conversation here.",
              );
              social.respondConnection(conn.id, "accepted");
              connectionId = conn.id;
            }
          }

          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId
                ? {
                    ...m,
                    status: "active",
                    responded_at: nowIso(),
                    connection_id: connectionId,
                    updated_at: nowIso(),
                  }
                : m,
            ),
          }));
        } else {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId
                ? {
                    ...m,
                    status: "declined",
                    responded_at: nowIso(),
                    decline_reason,
                    updated_at: nowIso(),
                  }
                : m,
            ),
          }));
        }
      },

      withdrawRequest: (matchId) => {
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === matchId && m.status === "pending"
              ? { ...m, status: "withdrawn", updated_at: nowIso() }
              : m,
          ),
        }));
      },

      completeMatch: (matchId, feedback) => {
        set((state) => {
          const updated = state.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  status: "completed" as MentorshipStatus,
                  completed_at: nowIso(),
                  mentee_rating: feedback?.rating ?? m.mentee_rating,
                  mentee_feedback: feedback?.feedback ?? m.mentee_feedback,
                  updated_at: nowIso(),
                }
              : m,
          );

          // Recompute mentor stats.
          const target = updated.find((m) => m.id === matchId);
          if (!target) return { matches: updated };
          const allForMentor = updated.filter(
            (m) =>
              m.mentor_profile_id === target.mentor_profile_id &&
              m.status === "completed",
          );
          const rated = allForMentor.filter(
            (m) => typeof m.mentee_rating === "number",
          );
          const avg =
            rated.length > 0
              ? rated.reduce((s, m) => s + (m.mentee_rating ?? 0), 0) / rated.length
              : null;

          return {
            matches: updated,
            mentors: state.mentors.map((m) =>
              m.id === target.mentor_profile_id
                ? {
                    ...m,
                    total_mentees_helped: allForMentor.length,
                    avg_rating: avg,
                    updated_at: nowIso(),
                  }
                : m,
            ),
          };
        });
      },

      expireStalePending: () => {
        const now = Date.now();
        set((state) => ({
          matches: state.matches.map((m) => {
            if (m.status !== "pending") return m;
            if (now - new Date(m.requested_at).getTime() > PENDING_EXPIRY_MS) {
              return { ...m, status: "expired" as MentorshipStatus, updated_at: nowIso() };
            }
            return m;
          }),
        }));
      },

      ensureSeeded: () => {
        const existingIds = new Set(get().mentors.map((m) => m.id));
        const toAdd = SEED_MENTORS.filter((s) => !existingIds.has(s.id));
        if (toAdd.length === 0) {
          if (!get()._seeded) set({ _seeded: true });
          return;
        }
        set((state) => ({
          mentors: [...state.mentors, ...toAdd],
          _seeded: true,
        }));
      },
    }),
    {
      name: "ananya-mentoring",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _mentoringSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMentoringStore.subscribe((state) => {
  if (_mentoringSyncTimer) clearTimeout(_mentoringSyncTimer);
  _mentoringSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("mentoring_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
