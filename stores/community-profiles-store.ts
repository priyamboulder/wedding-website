// ── Community profiles store ────────────────────────────────────────────────
// Holds:
//   - `profiles`: every bride visible in the directory (seed + real users).
//   - `photos`: profile photo gallery items, keyed by profile_id.
//   - `myProfileId`: pointer to the current user's profile. Null until they
//     finish onboarding.
//   - `blocks`: who the current user has blocked.
//
// Seed profiles + their seed photo strips hydrate on first init so Discover
// and the story-card thumbnails aren't empty. Seeds carry `is_seed: true` on
// the profile row and have no uploaded data URLs — the StoryCard reads their
// gradient fields instead.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  CommunityBlock,
  CommunityProfile,
  ProfilePhoto,
  ProfilePhotoType,
} from "@/types/community";
import {
  SEED_BRIDES,
  SEED_BRIDE_PHOTOS_BY_PROFILE,
} from "@/lib/community/seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

const MY_USER_ID = "local-user";
const MAX_PHOTOS_PER_PROFILE = 12;

type ProfileDraft = Partial<
  Omit<CommunityProfile, "id" | "user_id" | "created_at" | "updated_at" | "is_seed">
>;

interface CommunityProfilesState {
  profiles: CommunityProfile[];
  // Flat array: rows carry profile_id (kept outside the type so external
  // consumers don't need to know about the denormalized key).
  photos: (ProfilePhoto & { profile_id: string })[];
  myProfileId: string | null;
  blocks: CommunityBlock[];
  _hydratedSeed: boolean;

  // Mutations — profile
  createMyProfile: (
    draft: ProfileDraft & { display_name: string },
  ) => CommunityProfile;
  updateMyProfile: (draft: ProfileDraft) => void;
  setOpenToConnect: (open: boolean) => void;
  blockProfile: (profileId: string) => void;
  unblockProfile: (profileId: string) => void;

  // Mutations — photos
  addPhoto: (
    profileId: string,
    payload: {
      data_url?: string;
      caption?: string;
      photo_type?: ProfilePhotoType;
    },
  ) => ProfilePhoto | null;
  removePhoto: (photoId: string) => void;
  reorderPhotos: (profileId: string, orderedIds: string[]) => void;
  updatePhotoCaption: (photoId: string, caption: string) => void;

  // Internal
  ensureSeeded: () => void;
}

export const useCommunityProfilesStore = create<CommunityProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [],
      photos: [],
      myProfileId: null,
      blocks: [],
      _hydratedSeed: false,

      createMyProfile: (draft) => {
        const now = new Date().toISOString();
        const profile: CommunityProfile = {
          id: uuid(),
          user_id: MY_USER_ID,
          display_name: draft.display_name,
          cover_photo_data_url: draft.cover_photo_data_url,
          avatar_data_url: draft.avatar_data_url,
          quote: draft.quote,
          wedding_vibe: draft.wedding_vibe,
          hometown: draft.hometown,
          wedding_city: draft.wedding_city,
          wedding_date: draft.wedding_date,
          partner_name: draft.partner_name,
          guest_count_range: draft.guest_count_range,
          wedding_events: draft.wedding_events ?? [],
          color_palette: draft.color_palette ?? [],
          wedding_song: draft.wedding_song,
          fun_facts: draft.fun_facts ?? {},
          open_to_connect: draft.open_to_connect ?? true,
          looking_for: draft.looking_for ?? [],
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          profiles: [...state.profiles, profile],
          myProfileId: profile.id,
        }));
        return profile;
      },

      updateMyProfile: (draft) => {
        const { myProfileId } = get();
        if (!myProfileId) return;
        const now = new Date().toISOString();
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === myProfileId ? { ...p, ...draft, updated_at: now } : p,
          ),
        }));
      },

      setOpenToConnect: (open) => {
        get().updateMyProfile({ open_to_connect: open });
      },

      blockProfile: (profileId) => {
        const { myProfileId, blocks } = get();
        if (!myProfileId) return;
        if (blocks.some((b) => b.blocked_id === profileId)) return;
        const block: CommunityBlock = {
          id: uuid(),
          blocker_id: myProfileId,
          blocked_id: profileId,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ blocks: [...state.blocks, block] }));
      },

      unblockProfile: (profileId) => {
        set((state) => ({
          blocks: state.blocks.filter((b) => b.blocked_id !== profileId),
        }));
      },

      addPhoto: (profileId, payload) => {
        const existing = get().photos.filter((p) => p.profile_id === profileId);
        if (existing.length >= MAX_PHOTOS_PER_PROFILE) return null;
        const now = new Date().toISOString();
        const photo: ProfilePhoto & { profile_id: string } = {
          id: uuid(),
          profile_id: profileId,
          data_url: payload.data_url,
          caption: payload.caption,
          sort_order: existing.length,
          photo_type: payload.photo_type ?? "general",
          created_at: now,
        };
        set((state) => ({ photos: [...state.photos, photo] }));
        return photo;
      },

      removePhoto: (photoId) => {
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== photoId),
        }));
      },

      reorderPhotos: (profileId, orderedIds) => {
        set((state) => ({
          photos: state.photos.map((p) => {
            if (p.profile_id !== profileId) return p;
            const idx = orderedIds.indexOf(p.id);
            return idx === -1 ? p : { ...p, sort_order: idx };
          }),
        }));
      },

      updatePhotoCaption: (photoId, caption) => {
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === photoId ? { ...p, caption } : p,
          ),
        }));
      },

      ensureSeeded: () => {
        // No early return on `_hydratedSeed`: we re-run the diff each load so
        // new seed brides (e.g. experienced brides added later) land in
        // existing localStorage without wiping user data. The id-based dedupe
        // below keeps it idempotent.
        const existingIds = new Set(get().profiles.map((p) => p.id));
        const profilesToAdd = SEED_BRIDES.filter((s) => !existingIds.has(s.id));
        const existingPhotoIds = new Set(get().photos.map((p) => p.id));
        const photosToAdd: (ProfilePhoto & { profile_id: string })[] = [];
        for (const [profileId, photos] of Object.entries(
          SEED_BRIDE_PHOTOS_BY_PROFILE,
        )) {
          for (const photo of photos) {
            if (existingPhotoIds.has(photo.id)) continue;
            photosToAdd.push({ ...photo, profile_id: profileId });
          }
        }
        if (profilesToAdd.length === 0 && photosToAdd.length === 0) {
          if (!get()._hydratedSeed) set({ _hydratedSeed: true });
          return;
        }
        set((state) => ({
          profiles: [...state.profiles, ...profilesToAdd],
          photos: [...state.photos, ...photosToAdd],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-community-profiles",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 2,
    },
  ),
);

let _communityProfilesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunityProfilesStore.subscribe((state) => {
  if (_communityProfilesSyncTimer) clearTimeout(_communityProfilesSyncTimer);
  _communityProfilesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_profiles_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
