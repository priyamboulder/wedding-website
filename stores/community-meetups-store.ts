// ── Community meetups store ─────────────────────────────────────────────────
// In-person + virtual gatherings plus RSVPs. Seeded on first load with a
// handful of Ananya-hosted events so the Meetups sub-tab reads as a real
// community, not an empty state.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Meetup, MeetupRsvp, MeetupRsvpStatus } from "@/types/community";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

type MeetupDraft = Omit<
  Meetup,
  "id" | "created_at" | "updated_at" | "status" | "is_seed"
> & { status?: Meetup["status"] };

interface CommunityMeetupsState {
  meetups: Meetup[];
  rsvps: MeetupRsvp[];
  _hydratedSeed: boolean;

  createMeetup: (draft: MeetupDraft) => Meetup;
  updateMeetup: (id: string, patch: Partial<Meetup>) => void;
  cancelMeetup: (id: string) => void;

  rsvp: (meetupId: string, profileId: string, status: MeetupRsvpStatus) => void;
  getRsvpsFor: (meetupId: string) => MeetupRsvp[];

  ensureSeeded: () => void;
}

export const useCommunityMeetupsStore = create<CommunityMeetupsState>()(
  persist(
    (set, get) => ({
      meetups: [],
      rsvps: [],
      _hydratedSeed: false,

      createMeetup: (draft) => {
        const now = new Date().toISOString();
        const meetup: Meetup = {
          id: uuid(),
          ...draft,
          status: draft.status ?? "upcoming",
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ meetups: [...state.meetups, meetup] }));
        return meetup;
      },

      updateMeetup: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          meetups: state.meetups.map((m) =>
            m.id === id ? { ...m, ...patch, updated_at: now } : m,
          ),
        }));
      },

      cancelMeetup: (id) => {
        get().updateMeetup(id, { status: "cancelled" });
      },

      rsvp: (meetupId, profileId, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.rsvps.find(
            (r) => r.meetup_id === meetupId && r.profile_id === profileId,
          );
          if (existing) {
            return {
              rsvps: state.rsvps.map((r) =>
                r.id === existing.id ? { ...r, status } : r,
              ),
            };
          }
          const rsvp: MeetupRsvp = {
            id: uuid(),
            meetup_id: meetupId,
            profile_id: profileId,
            status,
            created_at: now,
          };
          return { rsvps: [...state.rsvps, rsvp] };
        });
      },

      getRsvpsFor: (meetupId) =>
        get().rsvps.filter((r) => r.meetup_id === meetupId),

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;
        import("@/lib/community/seed").then(({ SEED_MEETUPS, SEED_MEETUP_RSVPS }) => {
          const existingMeetupIds = new Set(get().meetups.map((m) => m.id));
          const meetupsToAdd = SEED_MEETUPS.filter((m) => !existingMeetupIds.has(m.id));
          const now = new Date().toISOString();
          const existingRsvpKey = (r: MeetupRsvp) => `${r.meetup_id}:${r.profile_id}`;
          const seenRsvps = new Set(get().rsvps.map(existingRsvpKey));
          const rsvpsToAdd: MeetupRsvp[] = [];
          for (const r of SEED_MEETUP_RSVPS) {
            const key = `${r.meetup_id}:${r.profile_id}`;
            if (seenRsvps.has(key)) continue;
            rsvpsToAdd.push({ id: `${key}-seed`, meetup_id: r.meetup_id, profile_id: r.profile_id, status: "going", created_at: now });
          }
          set((state) => ({ meetups: [...state.meetups, ...meetupsToAdd], rsvps: [...state.rsvps, ...rsvpsToAdd], _hydratedSeed: true }));
        });
      },
    }),
    {
      name: "ananya-community-meetups",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _communityMeetupsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunityMeetupsStore.subscribe((state) => {
  if (_communityMeetupsSyncTimer) clearTimeout(_communityMeetupsSyncTimer);
  _communityMeetupsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_meetups_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
