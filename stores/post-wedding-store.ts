// ── Post-Wedding store ─────────────────────────────────────────────────────
// Zustand + persist for the Post-Wedding module. Five tabs (thank-yous,
// deliveries, reviews, name change, archive) all read and write here.
// Single-wedding scoping — no weddingId key.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  Delivery,
  DeliveryStatus,
  Gift,
  NameChangeItem,
  NameChangeStatus,
  PostWeddingState,
  Review,
  ThankYouStatus,
} from "@/types/post-wedding";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Delivery status auto-resolution ──
// Recomputes status when a delivery's dates change. Explicit terminal states
// (delivered / in_review / complete) are left alone — we only shuffle between
// waiting / due_soon / overdue.
function resolveDeliveryStatus(d: Delivery): DeliveryStatus {
  if (
    d.status === "delivered" ||
    d.status === "in_review" ||
    d.status === "complete"
  ) {
    return d.status;
  }
  if (!d.promisedDate) return "waiting";
  const promised = new Date(d.promisedDate).getTime();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (now > promised) return "overdue";
  if (promised - now < 7 * day) return "due_soon";
  return "waiting";
}

interface PostWeddingActions {
  // ── Gifts ──
  addGift: (input: Partial<Omit<Gift, "id" | "createdAt" | "updatedAt">>) => Gift;
  updateGift: (id: string, patch: Partial<Gift>) => void;
  deleteGift: (id: string) => void;
  setGiftStatus: (id: string, status: ThankYouStatus) => void;
  setThankYouNote: (id: string, note: string) => void;
  importGuestsAsGifts: (
    guests: { id: string; name: string; relationship: string }[],
  ) => number;

  // ── Deliveries ──
  addDelivery: (
    input: Partial<Omit<Delivery, "id" | "createdAt" | "updatedAt">>,
  ) => Delivery;
  updateDelivery: (id: string, patch: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  markDeliveryReceived: (
    id: string,
    input: {
      link?: string;
      password?: string;
      fileCount?: number | null;
      date?: string;
    },
  ) => void;
  refreshDeliveryStatuses: () => void;

  // ── Reviews ──
  addReview: (
    input: Partial<Omit<Review, "id" | "createdAt" | "updatedAt">>,
  ) => Review;
  updateReview: (id: string, patch: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  // ── Name change ──
  ensureNameChangeSeeded: () => Promise<void>;
  setNameChangeStatus: (id: string, status: NameChangeStatus) => void;
  cycleNameChangeStatus: (id: string) => void;
  setNameChangeNotes: (id: string, notes: string) => void;

  // ── Activation ──
  setManualUnlock: (v: boolean) => void;
  dismissBanner: () => void;

  // ── Selectors ──
  giftsByStatus: (status: ThankYouStatus | "all") => Gift[];
  reviewsNeeded: (vendorIds: string[]) => string[];
  nameChangeProgress: () => { done: number; total: number };
}

const INITIAL: PostWeddingState = {
  gifts: [],
  deliveries: [],
  reviews: [],
  nameChange: [],
  manualUnlock: false,
  bannerDismissed: false,
  nameChangeSeeded: false,
};

export const usePostWeddingStore = create<
  PostWeddingState & PostWeddingActions
>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      // ── Gifts ────────────────────────────────────────────────────────
      addGift: (input) => {
        const gift: Gift = {
          id: uid("gift"),
          guestName: input.guestName?.trim() || "Unknown guest",
          guestId: input.guestId ?? null,
          relationship: input.relationship ?? "",
          giftType: input.giftType ?? "physical_gift",
          giftDescription: input.giftDescription ?? "",
          amountRupees: input.amountRupees ?? null,
          eventName: input.eventName ?? "",
          thankYouStatus: input.thankYouStatus ?? "pending",
          thankYouMethod: input.thankYouMethod ?? null,
          thankYouSentAt: input.thankYouSentAt ?? null,
          thankYouNote: input.thankYouNote ?? "",
          notes: input.notes ?? "",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ gifts: [gift, ...s.gifts] }));
        return gift;
      },

      updateGift: (id, patch) =>
        set((s) => ({
          gifts: s.gifts.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: nowIso() } : g,
          ),
        })),

      deleteGift: (id) =>
        set((s) => ({ gifts: s.gifts.filter((g) => g.id !== id) })),

      setGiftStatus: (id, status) =>
        set((s) => ({
          gifts: s.gifts.map((g) =>
            g.id === id
              ? {
                  ...g,
                  thankYouStatus: status,
                  thankYouSentAt:
                    status === "sent"
                      ? g.thankYouSentAt ?? today()
                      : g.thankYouSentAt,
                  updatedAt: nowIso(),
                }
              : g,
          ),
        })),

      setThankYouNote: (id, note) =>
        set((s) => ({
          gifts: s.gifts.map((g) =>
            g.id === id
              ? {
                  ...g,
                  thankYouNote: note,
                  thankYouStatus:
                    g.thankYouStatus === "pending" && note.trim()
                      ? "drafted"
                      : g.thankYouStatus,
                  updatedAt: nowIso(),
                }
              : g,
          ),
        })),

      importGuestsAsGifts: (guests) => {
        const existing = new Set(get().gifts.map((g) => g.guestId));
        const filtered = guests.filter((g) => !existing.has(g.id));
        const newGifts: Gift[] = filtered.map((g) => ({
          id: uid("gift"),
          guestName: g.name,
          guestId: g.id,
          relationship: g.relationship,
          giftType: "physical_gift",
          giftDescription: "",
          amountRupees: null,
          eventName: "",
          thankYouStatus: "pending",
          thankYouMethod: null,
          thankYouSentAt: null,
          thankYouNote: "",
          notes: "",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }));
        set((s) => ({ gifts: [...newGifts, ...s.gifts] }));
        return newGifts.length;
      },

      // ── Deliveries ───────────────────────────────────────────────────
      addDelivery: (input) => {
        const base: Delivery = {
          id: uid("dlv"),
          vendorName: input.vendorName?.trim() || "Unnamed vendor",
          vendorContact: input.vendorContact ?? "",
          vendorRole: input.vendorRole ?? "photographer",
          coordinationVendorId: input.coordinationVendorId ?? null,
          deliverableType: input.deliverableType ?? "edited_photos",
          deliverableDescription: input.deliverableDescription ?? "",
          promisedDate: input.promisedDate ?? null,
          actualDeliveryDate: input.actualDeliveryDate ?? null,
          status: input.status ?? "waiting",
          deliveryLink: input.deliveryLink ?? "",
          deliveryPassword: input.deliveryPassword ?? "",
          fileCount: input.fileCount ?? null,
          notes: input.notes ?? "",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        const delivery = { ...base, status: resolveDeliveryStatus(base) };
        set((s) => ({ deliveries: [delivery, ...s.deliveries] }));
        return delivery;
      },

      updateDelivery: (id, patch) =>
        set((s) => ({
          deliveries: s.deliveries.map((d) => {
            if (d.id !== id) return d;
            const merged = { ...d, ...patch, updatedAt: nowIso() };
            return { ...merged, status: resolveDeliveryStatus(merged) };
          }),
        })),

      deleteDelivery: (id) =>
        set((s) => ({
          deliveries: s.deliveries.filter((d) => d.id !== id),
        })),

      markDeliveryReceived: (id, { link, password, fileCount, date }) =>
        set((s) => ({
          deliveries: s.deliveries.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "delivered",
                  actualDeliveryDate: date ?? today(),
                  deliveryLink: link ?? d.deliveryLink,
                  deliveryPassword: password ?? d.deliveryPassword,
                  fileCount: fileCount ?? d.fileCount,
                  updatedAt: nowIso(),
                }
              : d,
          ),
        })),

      refreshDeliveryStatuses: () =>
        set((s) => ({
          deliveries: s.deliveries.map((d) => ({
            ...d,
            status: resolveDeliveryStatus(d),
          })),
        })),

      // ── Reviews ──────────────────────────────────────────────────────
      addReview: (input) => {
        const review: Review = {
          id: uid("rev"),
          vendorName: input.vendorName?.trim() || "Unnamed vendor",
          vendorRole: input.vendorRole ?? "vendor",
          coordinationVendorId: input.coordinationVendorId ?? null,
          platformVendorId: input.platformVendorId ?? null,
          overallRating: input.overallRating ?? 5,
          qualityRating: input.qualityRating ?? null,
          communicationRating: input.communicationRating ?? null,
          valueRating: input.valueRating ?? null,
          professionalismRating: input.professionalismRating ?? null,
          title: input.title ?? "",
          body: input.body ?? "",
          highlights: input.highlights ?? [],
          wouldRecommend: input.wouldRecommend ?? true,
          aiDrafted: input.aiDrafted ?? false,
          aiDraftOriginal: input.aiDraftOriginal ?? "",
          status: input.status ?? "draft",
          approximateSpend: input.approximateSpend ?? null,
          eventTypes: input.eventTypes ?? [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        return review;
      },

      updateReview: (id, patch) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
          ),
        })),

      deleteReview: (id) =>
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),

      // ── Name change ──────────────────────────────────────────────────
      ensureNameChangeSeeded: async () => {
        if (get().nameChangeSeeded) return;
        const { buildNameChangeSeed } = await import("@/lib/post-wedding-seed");
        set({ nameChange: buildNameChangeSeed(), nameChangeSeeded: true });
      },

      setNameChangeStatus: (id, status) =>
        set((s) => ({
          nameChange: s.nameChange.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  completedAt:
                    status === "done" ? i.completedAt ?? today() : null,
                }
              : i,
          ),
        })),

      cycleNameChangeStatus: (id) => {
        const next: Record<NameChangeStatus, NameChangeStatus> = {
          not_started: "in_progress",
          in_progress: "done",
          done: "not_started",
          not_applicable: "not_started",
        };
        const item = get().nameChange.find((i) => i.id === id);
        if (!item) return;
        get().setNameChangeStatus(id, next[item.status]);
      },

      setNameChangeNotes: (id, notes) =>
        set((s) => ({
          nameChange: s.nameChange.map((i) =>
            i.id === id ? { ...i, notes } : i,
          ),
        })),

      // ── Activation ──────────────────────────────────────────────────
      setManualUnlock: (v) => set({ manualUnlock: v }),
      dismissBanner: () => set({ bannerDismissed: true }),

      // ── Selectors ───────────────────────────────────────────────────
      giftsByStatus: (status) => {
        const all = get().gifts;
        if (status === "all") return all;
        return all.filter((g) => g.thankYouStatus === status);
      },

      reviewsNeeded: (vendorIds) => {
        const reviewed = new Set(
          get()
            .reviews.filter((r) => r.coordinationVendorId)
            .map((r) => r.coordinationVendorId as string),
        );
        return vendorIds.filter((id) => !reviewed.has(id));
      },

      nameChangeProgress: () => {
        const items = get().nameChange;
        const active = items.filter((i) => i.status !== "not_applicable");
        const done = active.filter((i) => i.status === "done").length;
        return { done, total: active.length };
      },
    }),
    {
      name: "ananya:post-wedding",
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
      partialize: (s) => ({
        gifts: s.gifts,
        deliveries: s.deliveries,
        reviews: s.reviews,
        nameChange: s.nameChange,
        manualUnlock: s.manualUnlock,
        bannerDismissed: s.bannerDismissed,
        nameChangeSeeded: s.nameChangeSeeded,
      }),
    },
  ),
);

let _postWeddingSyncTimer: ReturnType<typeof setTimeout> | null = null;
usePostWeddingStore.subscribe((state) => {
  if (_postWeddingSyncTimer) clearTimeout(_postWeddingSyncTimer);
  _postWeddingSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("post_wedding_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
