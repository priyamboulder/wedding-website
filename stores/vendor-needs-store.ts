// ── Vendor needs store ──────────────────────────────────────────────────────
// Powers the Bride Vendor Discovery feature on both sides:
//   · Bride side: her vendor checklist + per-row visibility + master privacy.
//   · Vendor side: the discovery feed (reads `looking` rows) and the
//     introductions tracker (reads + writes `interests`).
//
// Persistence: Zustand + localStorage. Schema parallels the Supabase sketch
// in `types/vendor-needs.ts` so a backend move is a drop-in. Auto-expires
// pending interests older than VENDOR_INTEREST_EXPIRY_DAYS on every read so
// no cron is needed.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import { v4 as uuid } from "uuid";
import type {
  BudgetRange,
  CommunityVendorInterest,
  CommunityVendorNeed,
  VendorDiscoveryPrivacy,
  VendorInterestStatus,
  VendorNeedCategorySlug,
  VendorNeedStatus,
  VendorNeedUrgency,
} from "@/types/vendor-needs";
import {
  DEFAULT_CHECKLIST_SLUGS,
  VENDOR_INTEREST_DAILY_LIMIT,
  VENDOR_INTEREST_EXPIRY_DAYS,
} from "@/types/vendor-needs";
import {
  SEED_VENDOR_INTERESTS,
  SEED_VENDOR_NEEDS,
} from "@/lib/community/vendor-needs-seed";

interface NeedDraft {
  status?: VendorNeedStatus;
  budget_range?: BudgetRange;
  notes?: string;
  preferred_style?: string;
  urgency?: VendorNeedUrgency;
  is_visible_to_vendors?: boolean;
  booked_vendor_id?: string;
  booked_vendor_name?: string;
}

interface VendorNeedsState {
  needs: CommunityVendorNeed[];
  interests: CommunityVendorInterest[];
  privacy: VendorDiscoveryPrivacy[];
  _hydratedSeed: boolean;

  // ── Bride-side mutations ────────────────────────────────────────────────

  ensureChecklistFor: (profileId: string) => void;
  upsertNeed: (
    profileId: string,
    categorySlug: VendorNeedCategorySlug,
    draft: NeedDraft,
  ) => CommunityVendorNeed;
  removeNeed: (needId: string) => void;
  setNeedVisibility: (needId: string, visible: boolean) => void;
  setDiscoverable: (profileId: string, discoverable: boolean) => void;
  isDiscoverable: (profileId: string) => boolean;

  // Bride responds to a vendor interest.
  acceptInterest: (interestId: string) => void;
  declineInterest: (interestId: string) => void;
  markInterestViewed: (interestId: string) => void;

  // ── Vendor-side mutations ───────────────────────────────────────────────

  expressInterest: (
    vendorId: string,
    needId: string,
    brideProfileId: string,
    message: string,
  ) =>
    | { ok: true; interest: CommunityVendorInterest }
    | { ok: false; reason: "rate_limit" | "duplicate" | "missing_need" };

  // ── Internal ────────────────────────────────────────────────────────────

  _expirePending: () => void;
  ensureSeeded: () => void;
}

const now = () => new Date().toISOString();

export const useVendorNeedsStore = create<VendorNeedsState>()(
  persist(
    (set, get) => ({
      needs: [],
      interests: [],
      privacy: [],
      _hydratedSeed: false,

      ensureChecklistFor: (profileId) => {
        const existing = get().needs.filter((n) => n.profile_id === profileId);
        if (existing.length > 0) return;
        const ts = now();
        const seeded: CommunityVendorNeed[] = DEFAULT_CHECKLIST_SLUGS.map(
          (slug) => ({
            id: uuid(),
            profile_id: profileId,
            category_slug: slug,
            status: "looking" as const,
            urgency: "flexible" as const,
            is_visible_to_vendors: true,
            created_at: ts,
            updated_at: ts,
          }),
        );
        set((state) => ({ needs: [...state.needs, ...seeded] }));
      },

      upsertNeed: (profileId, categorySlug, draft) => {
        const ts = now();
        const existing = get().needs.find(
          (n) =>
            n.profile_id === profileId && n.category_slug === categorySlug,
        );
        if (existing) {
          const updated: CommunityVendorNeed = {
            ...existing,
            ...draft,
            updated_at: ts,
          };
          // Auto-hide booked rows from vendor discovery + auto-expire any
          // pending interests for that need.
          if (draft.status === "booked" || draft.status === "not_needed") {
            updated.is_visible_to_vendors = false;
            set((state) => ({
              interests: state.interests.map((i) =>
                i.need_id === existing.id && i.status === "pending"
                  ? { ...i, status: "expired" as const, updated_at: ts }
                  : i,
              ),
            }));
          }
          set((state) => ({
            needs: state.needs.map((n) => (n.id === existing.id ? updated : n)),
          }));
          return updated;
        }
        const created: CommunityVendorNeed = {
          id: uuid(),
          profile_id: profileId,
          category_slug: categorySlug,
          status: draft.status ?? "looking",
          budget_range: draft.budget_range,
          notes: draft.notes,
          preferred_style: draft.preferred_style,
          urgency: draft.urgency ?? "flexible",
          is_visible_to_vendors:
            draft.is_visible_to_vendors ??
            (draft.status !== "booked" && draft.status !== "not_needed"),
          booked_vendor_id: draft.booked_vendor_id,
          booked_vendor_name: draft.booked_vendor_name,
          created_at: ts,
          updated_at: ts,
        };
        set((state) => ({ needs: [...state.needs, created] }));
        return created;
      },

      removeNeed: (needId) => {
        set((state) => ({
          needs: state.needs.filter((n) => n.id !== needId),
          interests: state.interests.filter((i) => i.need_id !== needId),
        }));
      },

      setNeedVisibility: (needId, visible) => {
        const ts = now();
        set((state) => ({
          needs: state.needs.map((n) =>
            n.id === needId
              ? { ...n, is_visible_to_vendors: visible, updated_at: ts }
              : n,
          ),
        }));
      },

      setDiscoverable: (profileId, discoverable) => {
        const ts = now();
        const existing = get().privacy.find((p) => p.profile_id === profileId);
        if (existing) {
          set((state) => ({
            privacy: state.privacy.map((p) =>
              p.profile_id === profileId
                ? { ...p, discoverable_by_vendors: discoverable, updated_at: ts }
                : p,
            ),
          }));
          return;
        }
        set((state) => ({
          privacy: [
            ...state.privacy,
            {
              profile_id: profileId,
              discoverable_by_vendors: discoverable,
              updated_at: ts,
            },
          ],
        }));
      },

      isDiscoverable: (profileId) => {
        const row = get().privacy.find((p) => p.profile_id === profileId);
        // Default to discoverable when no preference is set.
        return row?.discoverable_by_vendors ?? true;
      },

      acceptInterest: (interestId) => {
        const ts = now();
        set((state) => ({
          interests: state.interests.map((i) =>
            i.id === interestId
              ? { ...i, status: "accepted" as const, updated_at: ts }
              : i,
          ),
        }));
      },

      declineInterest: (interestId) => {
        const ts = now();
        set((state) => ({
          interests: state.interests.map((i) =>
            i.id === interestId
              ? { ...i, status: "declined" as const, updated_at: ts }
              : i,
          ),
        }));
      },

      markInterestViewed: (interestId) => {
        const ts = now();
        set((state) => ({
          interests: state.interests.map((i) =>
            i.id === interestId && i.status === "pending"
              ? { ...i, status: "viewed" as const, updated_at: ts }
              : i,
          ),
        }));
      },

      expressInterest: (vendorId, needId, brideProfileId, message) => {
        // Verify need exists + is still discoverable.
        const need = get().needs.find((n) => n.id === needId);
        if (!need || need.status !== "looking" || !need.is_visible_to_vendors) {
          return { ok: false as const, reason: "missing_need" as const };
        }

        // Duplicate guard: one interest per vendor per need.
        const dup = get().interests.find(
          (i) => i.vendor_id === vendorId && i.need_id === needId,
        );
        if (dup) {
          return { ok: false as const, reason: "duplicate" as const };
        }

        // Rate limit: VENDOR_INTEREST_DAILY_LIMIT in any rolling 24h window.
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const recent = get().interests.filter(
          (i) =>
            i.vendor_id === vendorId &&
            new Date(i.created_at).getTime() > cutoff,
        );
        if (recent.length >= VENDOR_INTEREST_DAILY_LIMIT) {
          return { ok: false as const, reason: "rate_limit" as const };
        }

        const ts = now();
        const interest: CommunityVendorInterest = {
          id: uuid(),
          vendor_id: vendorId,
          need_id: needId,
          bride_profile_id: brideProfileId,
          message,
          status: "pending",
          created_at: ts,
          updated_at: ts,
        };
        set((state) => ({ interests: [...state.interests, interest] }));
        return { ok: true as const, interest };
      },

      _expirePending: () => {
        const cutoff =
          Date.now() - VENDOR_INTEREST_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const ts = now();
        const needsExpiring = get().interests.some(
          (i) =>
            (i.status === "pending" || i.status === "viewed") &&
            new Date(i.created_at).getTime() < cutoff,
        );
        if (!needsExpiring) return;
        set((state) => ({
          interests: state.interests.map((i) =>
            (i.status === "pending" || i.status === "viewed") &&
            new Date(i.created_at).getTime() < cutoff
              ? { ...i, status: "expired" as const, updated_at: ts }
              : i,
          ),
        }));
      },

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;
        const existingNeedIds = new Set(get().needs.map((n) => n.id));
        const existingInterestIds = new Set(
          get().interests.map((i) => i.id),
        );
        const needsToAdd = SEED_VENDOR_NEEDS.filter(
          (n) => !existingNeedIds.has(n.id),
        );
        const interestsToAdd = SEED_VENDOR_INTERESTS.filter(
          (i) => !existingInterestIds.has(i.id),
        );
        set((state) => ({
          needs: [...state.needs, ...needsToAdd],
          interests: [...state.interests, ...interestsToAdd],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-vendor-needs",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _vendorNeedsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVendorNeedsStore.subscribe((state) => {
  if (_vendorNeedsSyncTimer) clearTimeout(_vendorNeedsSyncTimer);
  _vendorNeedsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("vendor_needs_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
