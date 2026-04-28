"use client";

// ── Creator Portal store ──────────────────────────────────────────────────
// Persistence layer for data authored inside the /creator portal. The
// underlying catalogs (creators, collections, drops, guides) live in their
// own stores and are seeded on every app load. This store overlays:
//   - Profile patches (keyed by creatorId) applied on top of seed Creator
//   - User-created collections, picks, guides (not in seed)
//   - Portal-only creator settings (notification prefs, availability, etc.)
//   - Active creator id for the portal (demo switcher)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Creator,
  CreatorCollection,
  CreatorPick,
} from "@/types/creator";
import type { Guide, GuideBodyBlock, GuideCategory } from "@/types/guide";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export interface CreatorSettings {
  notifyOnFollower: boolean;
  notifyOnProposal: boolean;
  notifyOnBooking: boolean;
  notifyOnDropReminder: boolean;
  weeklyDigest: boolean;
  acceptingConsultations: boolean;
  openToPartnerships: boolean;
  vacationMode: boolean;
  vacationMessage: string;
  payoutMethod: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
}

const DEFAULT_SETTINGS: CreatorSettings = {
  notifyOnFollower: true,
  notifyOnProposal: true,
  notifyOnBooking: true,
  notifyOnDropReminder: true,
  weeklyDigest: true,
  acceptingConsultations: true,
  openToPartnerships: true,
  vacationMode: false,
  vacationMessage: "",
  payoutMethod: { bankName: "", accountNumber: "", routingNumber: "" },
};

export interface PayoutRequest {
  id: string;
  creatorId: string;
  amount: number;
  requestedAt: string;
  status: "processing" | "paid";
  paidAt: string | null;
  referenceId: string;
}

interface CreatorPortalState {
  activeCreatorId: string | null;
  profileOverrides: Record<string, Partial<Creator>>;
  userCollections: CreatorCollection[];
  userPicks: CreatorPick[];
  userGuides: Guide[];
  settings: Record<string, CreatorSettings>;
  payoutRequests: PayoutRequest[];
  deactivated: Record<string, boolean>;

  setActiveCreatorId: (id: string) => void;

  // Profile
  updateProfile: (creatorId: string, patch: Partial<Creator>) => void;
  getProfileOverride: (creatorId: string) => Partial<Creator>;

  // Collections
  createCollection: (input: Omit<CreatorCollection, "id" | "createdAt">) => CreatorCollection;
  updateCollection: (id: string, patch: Partial<CreatorCollection>) => void;
  deleteCollection: (id: string) => void;
  listUserCollections: (creatorId: string) => CreatorCollection[];
  getUserCollection: (id: string) => CreatorCollection | undefined;

  // Picks
  setPicksForCollection: (
    collectionId: string,
    picks: Array<{ productId: string; creatorNote: string | null }>,
  ) => void;
  listUserPicksByCollection: (collectionId: string) => CreatorPick[];

  // Guides
  createGuide: (input: {
    creatorId: string;
    title: string;
    subtitle: string;
    coverImageUrl: string;
    category: GuideCategory;
    body: GuideBodyBlock[];
    status: "draft" | "published";
  }) => Guide;
  updateGuide: (id: string, patch: Partial<Guide>) => void;
  deleteGuide: (id: string) => void;
  listUserGuides: (creatorId: string) => Guide[];
  getUserGuide: (id: string) => Guide | undefined;

  // Settings
  getSettings: (creatorId: string) => CreatorSettings;
  updateSettings: (creatorId: string, patch: Partial<CreatorSettings>) => void;

  // Payouts
  listPayouts: (creatorId: string) => PayoutRequest[];
  requestPayout: (creatorId: string, amount: number) => PayoutRequest;

  // Deactivation
  isDeactivated: (creatorId: string) => boolean;
  toggleDeactivation: (creatorId: string) => void;
}

const nowIso = () => new Date().toISOString();

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `guide-${Date.now().toString(36)}`
  );
}

function estimateReadTime(body: GuideBodyBlock[]): number {
  let words = 0;
  for (const block of body) {
    if (block.type === "rich_text") {
      const stripped = block.html.replace(/<[^>]*>/g, " ");
      words += stripped.split(/\s+/).filter(Boolean).length;
    } else if (block.type === "pull_quote") {
      words += block.text.split(/\s+/).filter(Boolean).length;
    } else if (block.type === "list") {
      words += block.items.join(" ").split(/\s+/).filter(Boolean).length;
    } else {
      words += 40; // rough visual block weight
    }
  }
  return Math.max(1, Math.round(words / 200));
}

export const useCreatorPortalStore = create<CreatorPortalState>()(
  persist(
    (set, get) => ({
      activeCreatorId: null,
      profileOverrides: {},
      userCollections: [],
      userPicks: [],
      userGuides: [],
      settings: {},
      payoutRequests: [],
      deactivated: {},

      setActiveCreatorId: (id) => set({ activeCreatorId: id }),

      updateProfile: (creatorId, patch) =>
        set((s) => ({
          profileOverrides: {
            ...s.profileOverrides,
            [creatorId]: { ...s.profileOverrides[creatorId], ...patch },
          },
        })),

      getProfileOverride: (creatorId) => get().profileOverrides[creatorId] ?? {},

      createCollection: (input) => {
        const col: CreatorCollection = {
          ...input,
          id: `col-u-${uuid().slice(0, 8)}`,
          createdAt: nowIso(),
        };
        set((s) => ({ userCollections: [col, ...s.userCollections] }));
        return col;
      },

      updateCollection: (id, patch) =>
        set((s) => ({
          userCollections: s.userCollections.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCollection: (id) =>
        set((s) => ({
          userCollections: s.userCollections.map((c) =>
            c.id === id ? { ...c, status: "archived" } : c,
          ),
        })),

      listUserCollections: (creatorId) =>
        get().userCollections.filter((c) => c.creatorId === creatorId),

      getUserCollection: (id) => get().userCollections.find((c) => c.id === id),

      setPicksForCollection: (collectionId, picks) => {
        const now = nowIso();
        const next: CreatorPick[] = picks.map((p, idx) => ({
          id: `pk-u-${uuid().slice(0, 8)}`,
          collectionId,
          productId: p.productId,
          creatorNote: p.creatorNote,
          sortOrder: idx,
          addedAt: now,
        }));
        set((s) => ({
          userPicks: [
            ...s.userPicks.filter((p) => p.collectionId !== collectionId),
            ...next,
          ],
        }));
      },

      listUserPicksByCollection: (collectionId) =>
        get()
          .userPicks.filter((p) => p.collectionId === collectionId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      createGuide: (input) => {
        const id = `gd-u-${uuid().slice(0, 8)}`;
        const slug = `${slugify(input.title)}-${id.slice(-4)}`;
        const guide: Guide = {
          id,
          slug,
          creatorId: input.creatorId,
          title: input.title,
          subtitle: input.subtitle,
          coverImageUrl: input.coverImageUrl,
          category: input.category,
          body: input.body,
          readTimeMinutes: estimateReadTime(input.body),
          status: input.status,
          publishedAt: input.status === "published" ? nowIso() : null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          baseSaveCount: 0,
          baseViewCount: 0,
        };
        set((s) => ({ userGuides: [guide, ...s.userGuides] }));
        return guide;
      },

      updateGuide: (id, patch) =>
        set((s) => ({
          userGuides: s.userGuides.map((g) => {
            if (g.id !== id) return g;
            const body = patch.body ?? g.body;
            const next: Guide = {
              ...g,
              ...patch,
              body,
              readTimeMinutes: estimateReadTime(body),
              updatedAt: nowIso(),
              publishedAt:
                patch.status === "published" && !g.publishedAt
                  ? nowIso()
                  : g.publishedAt,
            };
            return next;
          }),
        })),

      deleteGuide: (id) =>
        set((s) => ({
          userGuides: s.userGuides.map((g) =>
            g.id === id ? { ...g, status: "archived" } : g,
          ),
        })),

      listUserGuides: (creatorId) =>
        get().userGuides.filter((g) => g.creatorId === creatorId),

      getUserGuide: (id) => get().userGuides.find((g) => g.id === id),

      getSettings: (creatorId) =>
        get().settings[creatorId] ?? DEFAULT_SETTINGS,

      updateSettings: (creatorId, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [creatorId]: { ...(s.settings[creatorId] ?? DEFAULT_SETTINGS), ...patch },
          },
        })),

      listPayouts: (creatorId) =>
        get()
          .payoutRequests.filter((p) => p.creatorId === creatorId)
          .sort(
            (a, b) =>
              new Date(b.requestedAt).getTime() -
              new Date(a.requestedAt).getTime(),
          ),

      requestPayout: (creatorId, amount) => {
        const req: PayoutRequest = {
          id: `pay-${uuid().slice(0, 8)}`,
          creatorId,
          amount,
          requestedAt: nowIso(),
          status: "processing",
          paidAt: null,
          referenceId: `REF-${Date.now().toString(36).toUpperCase()}`,
        };
        set((s) => ({ payoutRequests: [req, ...s.payoutRequests] }));
        return req;
      },

      isDeactivated: (creatorId) => get().deactivated[creatorId] === true,

      toggleDeactivation: (creatorId) =>
        set((s) => ({
          deactivated: {
            ...s.deactivated,
            [creatorId]: !s.deactivated[creatorId],
          },
        })),
    }),
    {
      name: "ananya-creator-portal",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      version: 1,
    },
  ),
);

let _creatorPortalSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCreatorPortalStore.subscribe((state) => {
  if (_creatorPortalSyncTimer) clearTimeout(_creatorPortalSyncTimer);
  _creatorPortalSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("creator_portal_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
