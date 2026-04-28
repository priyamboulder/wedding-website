// ── Matching + consultation marketplace store ────────────────────────────
// Handles the full couple-to-creator consultation flow:
//   - Couple matching preferences
//   - Creator service catalog (seed + creator-authored)
//   - Bookings (couple ↔ creator transactions)
//   - Reviews (after a booking completes)
// Persistence is localStorage only — catalog reloads from seed on every
// app init; user-initiated data (prefs, new services, bookings, reviews)
// persists. Mirrors the creators-store pattern.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  ConsultationBooking,
  ConsultationReview,
  CouplePreferences,
  CreatorService,
  MatchScore,
} from "@/types/matching";
import type { BudgetRange } from "@/types/creator";
import {
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_SERVICES,
} from "@/lib/creators/services-seed";
import { rankCreators } from "@/lib/creators/matching";
import { useCreatorsStore } from "@/stores/creators-store";

export const DEMO_COUPLE_USER_ID = "demo-couple";
const PLATFORM_FEE_RATE = 0.2;

interface MatchingState {
  // Catalog (seed is source of truth; user-authored entries get merged in)
  services: CreatorService[];
  bookings: ConsultationBooking[];
  reviews: ConsultationReview[];

  // User state (persisted)
  preferences: CouplePreferences | null;

  // ── Preferences
  savePreferences: (
    input: Omit<
      CouplePreferences,
      "id" | "userId" | "createdAt" | "updatedAt"
    > & { userId?: string },
  ) => CouplePreferences;
  clearPreferences: () => void;

  // ── Services
  listServicesByCreator: (creatorId: string) => CreatorService[];
  getService: (serviceId: string) => CreatorService | undefined;
  createService: (
    input: Omit<CreatorService, "id" | "createdAt" | "updatedAt">,
  ) => CreatorService;
  updateService: (
    serviceId: string,
    patch: Partial<Omit<CreatorService, "id" | "creatorId" | "createdAt">>,
  ) => CreatorService | undefined;
  deactivateService: (serviceId: string) => void;

  // ── Bookings
  listBookingsForCouple: (userId: string) => ConsultationBooking[];
  listBookingsForCreator: (creatorId: string) => ConsultationBooking[];
  getBooking: (bookingId: string) => ConsultationBooking | undefined;
  createBooking: (input: {
    serviceId: string;
    coupleUserId: string;
    coupleNote: string;
  }) => ConsultationBooking | null;
  confirmBooking: (bookingId: string) => ConsultationBooking | undefined;
  scheduleBooking: (
    bookingId: string,
    scheduledAt: string,
    meetingLink: string,
  ) => ConsultationBooking | undefined;
  completeBooking: (
    bookingId: string,
    deliverableUrl?: string | null,
  ) => ConsultationBooking | undefined;
  cancelBooking: (
    bookingId: string,
    reason: string,
  ) => ConsultationBooking | undefined;

  // ── Reviews
  listReviewsForCreator: (creatorId: string) => ConsultationReview[];
  submitReview: (input: {
    bookingId: string;
    rating: number;
    reviewText: string;
    coupleDisplayInitials: string;
  }) => ConsultationReview | null;
  getReviewForBooking: (
    bookingId: string,
  ) => ConsultationReview | undefined;

  // ── Derived
  computeMatches: (limit?: number) => MatchScore[];
  creatorConsultationStats: (creatorId: string) => {
    totalConsultations: number;
    averageRating: number;
    totalEarnings: number;
    pendingPayout: number;
  };

  // Prefs lookup
  getPreferences: (userId: string) => CouplePreferences | null;
}

type PersistedSlice = Pick<
  MatchingState,
  "preferences" | "bookings" | "reviews" | "services"
>;

// Merge seed catalog with persisted user-authored entries. We keep the seed
// as the authoritative baseline and layer in anything the user has added.
function mergeCatalog<T extends { id: string }>(
  seed: T[],
  persisted: T[] | undefined,
): T[] {
  if (!persisted || persisted.length === 0) return seed;
  const seedIds = new Set(seed.map((s) => s.id));
  const userAuthored = persisted.filter((p) => !seedIds.has(p.id));
  return [...seed, ...userAuthored];
}

export const useMatchingStore = create<MatchingState>()(
  persist(
    (set, get) => ({
      services: SEED_SERVICES,
      bookings: SEED_BOOKINGS,
      reviews: SEED_REVIEWS,
      preferences: null,

      // ── Preferences ────────────────────────────────────────────────
      savePreferences: (input) => {
        const existing = get().preferences;
        const now = new Date().toISOString();
        const next: CouplePreferences = {
          id: existing?.id ?? uuid(),
          userId: input.userId ?? existing?.userId ?? DEMO_COUPLE_USER_ID,
          priorityModules: input.priorityModules,
          styleTags: input.styleTags,
          traditionTags: input.traditionTags,
          budgetRange: input.budgetRange,
          aestheticImageIds: input.aestheticImageIds,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        set({ preferences: next });
        return next;
      },

      clearPreferences: () => set({ preferences: null }),

      getPreferences: (userId) => {
        const p = get().preferences;
        if (!p) return null;
        return p.userId === userId ? p : null;
      },

      // ── Services ───────────────────────────────────────────────────
      listServicesByCreator: (creatorId) =>
        get().services.filter(
          (s) => s.creatorId === creatorId && s.isActive,
        ),

      getService: (serviceId) =>
        get().services.find((s) => s.id === serviceId),

      createService: (input) => {
        const now = new Date().toISOString();
        const service: CreatorService = {
          ...input,
          id: uuid(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ services: [service, ...state.services] }));
        return service;
      },

      updateService: (serviceId, patch) => {
        let updated: CreatorService | undefined;
        set((state) => ({
          services: state.services.map((s) => {
            if (s.id !== serviceId) return s;
            updated = {
              ...s,
              ...patch,
              updatedAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));
        return updated;
      },

      deactivateService: (serviceId) => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId
              ? { ...s, isActive: false, updatedAt: new Date().toISOString() }
              : s,
          ),
        }));
      },

      // ── Bookings ───────────────────────────────────────────────────
      listBookingsForCouple: (userId) =>
        get()
          .bookings.filter((b) => b.coupleUserId === userId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),

      listBookingsForCreator: (creatorId) =>
        get()
          .bookings.filter((b) => b.creatorId === creatorId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),

      getBooking: (bookingId) =>
        get().bookings.find((b) => b.id === bookingId),

      createBooking: ({ serviceId, coupleUserId, coupleNote }) => {
        const service = get().services.find((s) => s.id === serviceId);
        if (!service) return null;
        const now = new Date().toISOString();
        const platformFee = Math.round(service.price * PLATFORM_FEE_RATE);
        const booking: ConsultationBooking = {
          id: uuid(),
          serviceId,
          creatorId: service.creatorId,
          coupleUserId,
          status: "requested",
          scheduledAt: null,
          meetingLink: null,
          pricePaid: service.price,
          platformFee,
          creatorPayout: service.price - platformFee,
          deliverableUrl: null,
          coupleNote,
          cancellationReason: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },

      confirmBooking: (bookingId) =>
        patchBooking(set, get, bookingId, { status: "confirmed" }),

      scheduleBooking: (bookingId, scheduledAt, meetingLink) =>
        patchBooking(set, get, bookingId, {
          status: "scheduled",
          scheduledAt,
          meetingLink,
        }),

      completeBooking: (bookingId, deliverableUrl = null) =>
        patchBooking(set, get, bookingId, {
          status: "completed",
          deliverableUrl: deliverableUrl ?? null,
        }),

      cancelBooking: (bookingId, reason) =>
        patchBooking(set, get, bookingId, {
          status: "cancelled",
          cancellationReason: reason,
        }),

      // ── Reviews ────────────────────────────────────────────────────
      listReviewsForCreator: (creatorId) =>
        get()
          .reviews.filter((r) => r.creatorId === creatorId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),

      getReviewForBooking: (bookingId) =>
        get().reviews.find((r) => r.bookingId === bookingId),

      submitReview: ({ bookingId, rating, reviewText, coupleDisplayInitials }) => {
        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking || booking.status !== "completed") return null;
        if (get().reviews.some((r) => r.bookingId === bookingId)) return null;
        const review: ConsultationReview = {
          id: uuid(),
          bookingId,
          coupleUserId: booking.coupleUserId,
          coupleDisplayInitials,
          creatorId: booking.creatorId,
          rating: Math.max(1, Math.min(5, Math.round(rating))),
          reviewText,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reviews: [review, ...state.reviews] }));
        return review;
      },

      // ── Derived ────────────────────────────────────────────────────
      computeMatches: (limit = 5) => {
        const prefs = get().preferences;
        if (!prefs) return [];
        const creators = useCreatorsStore.getState().creators;
        return rankCreators(creators, prefs, limit);
      },

      creatorConsultationStats: (creatorId) => {
        const bookings = get().bookings.filter(
          (b) => b.creatorId === creatorId,
        );
        const completed = bookings.filter((b) => b.status === "completed");
        const reviews = get().reviews.filter(
          (r) => r.creatorId === creatorId,
        );
        const averageRating =
          reviews.length === 0
            ? 0
            : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const totalEarnings = completed.reduce(
          (sum, b) => sum + b.creatorPayout,
          0,
        );
        const pendingPayout = bookings
          .filter((b) => b.status === "confirmed" || b.status === "scheduled")
          .reduce((sum, b) => sum + b.creatorPayout, 0);
        return {
          totalConsultations: completed.length,
          averageRating: Math.round(averageRating * 10) / 10,
          totalEarnings,
          pendingPayout,
        };
      },
    }),
    {
      name: "ananya-matching",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
      partialize: (state): PersistedSlice => ({
        preferences: state.preferences,
        bookings: state.bookings,
        reviews: state.reviews,
        services: state.services,
      }),
      // On hydrate, merge persisted bookings/services/reviews back with the
      // seed so a fresh user still sees the demo transactions, and a
      // returning user sees their own additions on top.
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedSlice> | undefined;
        return {
          ...current,
          preferences: p?.preferences ?? null,
          services: mergeCatalog(SEED_SERVICES, p?.services),
          bookings: mergeCatalog(SEED_BOOKINGS, p?.bookings),
          reviews: mergeCatalog(SEED_REVIEWS, p?.reviews),
        };
      },
    },
  ),
);

let _matchingSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMatchingStore.subscribe((state) => {
  if (_matchingSyncTimer) clearTimeout(_matchingSyncTimer);
  _matchingSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("matching_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Typed helper to reduce duplication in booking state transitions.
type BookingPatch = Partial<Omit<ConsultationBooking, "id" | "createdAt">>;

function patchBooking(
  set: (
    updater: (state: MatchingState) => Partial<MatchingState>,
  ) => void,
  get: () => MatchingState,
  bookingId: string,
  patch: BookingPatch,
): ConsultationBooking | undefined {
  let updated: ConsultationBooking | undefined;
  set((state) => ({
    bookings: state.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      updated = { ...b, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    }),
  }));
  return updated;
}

// ── Helpers exported for UI/API reuse ────────────────────────────────────

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_50k: "Under $50K",
  "50k_100k": "$50K – $100K",
  "100k_250k": "$100K – $250K",
  "250k_500k": "$250K – $500K",
  "500k_plus": "$500K+",
};

export const ALL_BUDGET_RANGES: BudgetRange[] = [
  "under_50k",
  "50k_100k",
  "100k_250k",
  "250k_500k",
  "500k_plus",
];
