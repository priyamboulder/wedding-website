// ── One Look micro-review store ────────────────────────────────────────────
// Zustand + persist. Audio/video blobs live in IndexedDB (see
// lib/one-look/blob-store.ts) — only the metadata + text payload is persisted
// to localStorage under `ananya:one-look`.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  OneLookReview,
  OneLookMediaType,
  OneLookAggregate,
} from "@/types/one-look";
import { normalizeScore } from "@/types/one-look";
import { sentimentForWord } from "@/lib/one-look/words";
import { deleteBlob } from "@/lib/one-look/blob-store";

function uid(): string {
  return `ol_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const LOCAL_USER_ID = "local-user";

// Default bride metadata if the community profile isn't set up yet. Real
// values are passed in via createOneLook(bride: …).
const DEFAULT_BRIDE = {
  firstName: "You",
  city: "",
  weddingMonthYear: "",
};

export interface OneLookBrideContext {
  firstName: string;
  city: string;
  weddingMonthYear: string;
}

export interface OneLookDraftInput {
  coordinationVendorId: string | null;
  platformVendorId: string | null;
  vendorName: string;
  vendorRole: string;
  vendorCategory: string;
  score: number;
  oneWord: string;
  mediaType: OneLookMediaType;
  hotTakeText?: string;
  audioBlobKey?: string | null;
  audioDurationSeconds?: number | null;
  videoBlobKey?: string | null;
  videoDurationSeconds?: number | null;
  videoThumbnailDataUrl?: string | null;
  bride?: OneLookBrideContext;
}

interface OneLookState {
  reviews: OneLookReview[];
}

interface OneLookActions {
  /** Create or update the One Look for this vendor (one per vendor). */
  upsertDraft: (input: OneLookDraftInput) => OneLookReview;
  publish: (id: string) => OneLookReview | null;
  unpublish: (id: string) => void;
  update: (id: string, patch: Partial<OneLookReview>) => void;
  remove: (id: string) => Promise<void>;
  toggleHelpful: (id: string) => void;

  // Selectors
  forCoordinationVendor: (vendorId: string) => OneLookReview | null;
  forPlatformVendor: (vendorId: string) => OneLookReview | null;
  publishedForCoordinationVendor: (vendorId: string) => OneLookReview | null;
  publishedForPlatformVendor: (vendorId: string) => OneLookReview | null;
  aggregateForCoordinationVendor: (
    vendorId: string,
  ) => OneLookAggregate | null;
  aggregateForPlatformVendor: (vendorId: string) => OneLookAggregate | null;
  allPublished: () => OneLookReview[];
  myRecentPublished: (sinceMs: number) => OneLookReview[];
}

export const useOneLookStore = create<OneLookState & OneLookActions>()(
  persist(
    (set, get) => ({
      reviews: [],

      upsertDraft: (input) => {
        const {
          coordinationVendorId,
          platformVendorId,
          vendorName,
          vendorRole,
          vendorCategory,
          score,
          oneWord,
          mediaType,
          hotTakeText,
          audioBlobKey,
          audioDurationSeconds,
          videoBlobKey,
          videoDurationSeconds,
          videoThumbnailDataUrl,
          bride,
        } = input;

        const b = bride ?? DEFAULT_BRIDE;
        const normalizedScore = normalizeScore(score);
        const sentiment = sentimentForWord(oneWord);

        // Lookup by either linkage — keep one per vendor.
        const existing = get().reviews.find((r) => {
          if (coordinationVendorId && r.coordinationVendorId === coordinationVendorId) return true;
          if (platformVendorId && r.platformVendorId === platformVendorId) return true;
          return false;
        });

        if (existing) {
          const updated: OneLookReview = {
            ...existing,
            vendorName,
            vendorRole,
            vendorCategory,
            score: normalizedScore,
            oneWord,
            oneWordSentiment: sentiment,
            mediaType,
            hotTakeText: hotTakeText ?? "",
            audioBlobKey: audioBlobKey ?? null,
            audioDurationSeconds: audioDurationSeconds ?? null,
            videoBlobKey: videoBlobKey ?? null,
            videoDurationSeconds: videoDurationSeconds ?? null,
            videoThumbnailDataUrl: videoThumbnailDataUrl ?? null,
            brideFirstName: b.firstName,
            brideCity: b.city,
            weddingMonthYear: b.weddingMonthYear,
            updatedAt: nowIso(),
          };
          set((s) => ({
            reviews: s.reviews.map((r) => (r.id === existing.id ? updated : r)),
          }));
          return updated;
        }

        const review: OneLookReview = {
          id: uid(),
          coordinationVendorId,
          platformVendorId,
          vendorName,
          vendorRole,
          vendorCategory,
          brideFirstName: b.firstName,
          brideCity: b.city,
          weddingMonthYear: b.weddingMonthYear,
          score: normalizedScore,
          oneWord,
          oneWordSentiment: sentiment,
          mediaType,
          hotTakeText: hotTakeText ?? "",
          audioBlobKey: audioBlobKey ?? null,
          audioDurationSeconds: audioDurationSeconds ?? null,
          videoBlobKey: videoBlobKey ?? null,
          videoDurationSeconds: videoDurationSeconds ?? null,
          videoThumbnailDataUrl: videoThumbnailDataUrl ?? null,
          status: "draft",
          publishedAt: null,
          helpfulCount: 0,
          helpfulVoters: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        return review;
      },

      publish: (id) => {
        let out: OneLookReview | null = null;
        set((s) => ({
          reviews: s.reviews.map((r) => {
            if (r.id !== id) return r;
            out = {
              ...r,
              status: "published",
              publishedAt: r.publishedAt ?? nowIso(),
              updatedAt: nowIso(),
            };
            return out;
          }),
        }));
        return out;
      },

      unpublish: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id
              ? { ...r, status: "draft", publishedAt: null, updatedAt: nowIso() }
              : r,
          ),
        })),

      update: (id, patch) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
          ),
        })),

      remove: async (id) => {
        const review = get().reviews.find((r) => r.id === id);
        if (review?.audioBlobKey) await deleteBlob(review.audioBlobKey).catch(() => {});
        if (review?.videoBlobKey) await deleteBlob(review.videoBlobKey).catch(() => {});
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
      },

      toggleHelpful: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) => {
            if (r.id !== id) return r;
            const has = r.helpfulVoters.includes(LOCAL_USER_ID);
            return {
              ...r,
              helpfulVoters: has
                ? r.helpfulVoters.filter((v) => v !== LOCAL_USER_ID)
                : [...r.helpfulVoters, LOCAL_USER_ID],
              helpfulCount: has ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
              updatedAt: nowIso(),
            };
          }),
        })),

      // ── Selectors ────────────────────────────────────────────────────
      forCoordinationVendor: (vendorId) =>
        get().reviews.find((r) => r.coordinationVendorId === vendorId) ?? null,

      forPlatformVendor: (vendorId) =>
        get().reviews.find((r) => r.platformVendorId === vendorId) ?? null,

      publishedForCoordinationVendor: (vendorId) =>
        get().reviews.find(
          (r) => r.coordinationVendorId === vendorId && r.status === "published",
        ) ?? null,

      publishedForPlatformVendor: (vendorId) =>
        get().reviews.find(
          (r) => r.platformVendorId === vendorId && r.status === "published",
        ) ?? null,

      aggregateForCoordinationVendor: (vendorId) =>
        buildAggregate(
          get().reviews.filter(
            (r) => r.coordinationVendorId === vendorId && r.status === "published",
          ),
        ),

      aggregateForPlatformVendor: (vendorId) =>
        buildAggregate(
          get().reviews.filter(
            (r) => r.platformVendorId === vendorId && r.status === "published",
          ),
        ),

      allPublished: () => get().reviews.filter((r) => r.status === "published"),

      myRecentPublished: (sinceMs) => {
        const cutoff = Date.now() - sinceMs;
        return get()
          .reviews.filter(
            (r) =>
              r.status === "published" &&
              r.publishedAt &&
              new Date(r.publishedAt).getTime() >= cutoff,
          )
          .sort(
            (a, b) =>
              new Date(b.publishedAt as string).getTime() -
              new Date(a.publishedAt as string).getTime(),
          );
      },
    }),
    {
      name: "ananya:one-look",
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
      partialize: (s) => ({ reviews: s.reviews }),
    },
  ),
);

let _oneLookSyncTimer: ReturnType<typeof setTimeout> | null = null;
useOneLookStore.subscribe((state) => {
  if (_oneLookSyncTimer) clearTimeout(_oneLookSyncTimer);
  _oneLookSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("one_look_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

function buildAggregate(reviews: OneLookReview[]): OneLookAggregate | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.score, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  const wordCounts = new Map<string, number>();
  reviews.forEach((r) => wordCounts.set(r.oneWord, (wordCounts.get(r.oneWord) ?? 0) + 1));
  const topWords = [...wordCounts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
  const first = reviews[0];
  return {
    vendorId:
      first.coordinationVendorId ??
      first.platformVendorId ??
      "unknown",
    vendorName: first.vendorName,
    vendorCategory: first.vendorCategory,
    averageScore: avg,
    lookCount: reviews.length,
    topWords,
  };
}
