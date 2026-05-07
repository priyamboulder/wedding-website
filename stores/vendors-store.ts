import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as Sentry from "@sentry/nextjs";
import type {
  Vendor,
  VendorCategory,
} from "@/types/vendor-unified";
import type {
  ShortlistEntry,
  ShortlistStatus,
  TaskVendorLink,
  VendorLinkStatus,
  Collection,
} from "@/types/vendor";
// Vendor seed is NOT imported at module level — it's 107K lines / ~3MB.
// Initial state starts empty; initFromAPI() loads from Supabase on mount.
// The seed file is only loaded lazily as a fallback if the API returns nothing.

// ── Supabase sync helpers (fire-and-forget) ──────────────────────────────────
async function getSupabase() {
  if (typeof window === "undefined") return null;
  try {
    const { supabaseBrowser } = await import("@/lib/supabase/browser-client");
    return supabaseBrowser;
  } catch {
    return null;
  }
}

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ananya-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function dbUpsertShortlist(entry: ShortlistEntry) {
  const sb = await getSupabase();
  const coupleId = getCurrentUserId();
  if (!sb || !coupleId) return;
  await sb.from("couple_shortlist_v2").upsert({
    couple_id: coupleId,
    vendor_id: entry.vendor_id,
    saved_at: entry.saved_at,
    notes: entry.notes ?? "",
    status: entry.status ?? "shortlisted",
  });
}

async function dbDeleteShortlist(vendorId: string) {
  const sb = await getSupabase();
  const coupleId = getCurrentUserId();
  if (!sb || !coupleId) return;
  await sb.from("couple_shortlist_v2").delete().eq("couple_id", coupleId).eq("vendor_id", vendorId);
}

export async function loadShortlistFromDB(): Promise<ShortlistEntry[]> {
  const sb = await getSupabase();
  const coupleId = getCurrentUserId();
  if (!sb || !coupleId) return [];
  try {
    const { data } = await sb.from("couple_shortlist_v2").select("*").eq("couple_id", coupleId);
    return (data ?? []).map((r) => ({
      vendor_id: r.vendor_id,
      saved_at: r.saved_at,
      notes: r.notes,
      status: r.status as ShortlistStatus,
    }));
  } catch {
    return [];
  }
}

// ── Store shape ─────────────────────────────────────────────────────────────
// Directory = global vendor DB, here seeded from the unified vendor seed.
// Shortlist + task links = couple-scoped state that also powers the
// task-level vendor panel. Inquiries live in their own store.

interface VendorsState {
  vendors: Vendor[];
  // Per-category vendor pools. Populated by `loadCategory` in a single batch
  // so the directory subscribes to a slice that doesn't grow progressively
  // (which would jank the masonry as columns rebalance mid-scroll).
  categoryVendors: Partial<Record<VendorCategory, Vendor[]>>;
  loadingCategories: Partial<Record<VendorCategory, boolean>>;
  collections: Collection[];
  shortlist: ShortlistEntry[];
  taskLinks: TaskVendorLink[];

  // Directory
  addVendors: (vendors: Vendor[]) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  getVendorBySlug: (slug: string) => Vendor | undefined;
  getVendorsByCategory: (category: VendorCategory) => Vendor[];
  loadCategory: (
    category: VendorCategory,
    opts?: { force?: boolean },
  ) => Promise<void>;

  // Shortlist (the "heart" action)
  isShortlisted: (vendorId: string) => boolean;
  toggleShortlist: (vendorId: string) => void;
  saveFromRoulette: (
    vendorId: string,
    sessionId: string,
    status?: "shortlisted" | "contacted",
  ) => void;
  removeFromShortlist: (vendorId: string) => void;
  setShortlistStatus: (vendorId: string, status: ShortlistStatus) => void;
  updateShortlistEntry: (
    vendorId: string,
    patch: Partial<ShortlistEntry>,
  ) => void;
  reorderShortlist: (orderedVendorIds: string[]) => void;
  addCustomVendor: (input: {
    name: string;
    category: VendorCategory;
    location?: string;
    notes?: string;
  }) => ShortlistEntry;

  // Task links (the "LINK TO A TASK" action from the drawer)
  getTaskLinksForVendor: (vendorId: string) => TaskVendorLink[];
  getVendorsForTask: (taskId: string) => string[];
  linkVendorToTask: (vendorId: string, taskId: string) => void;
  unlinkVendorFromTask: (vendorId: string, taskId: string) => void;
  setLinkStatus: (vendorId: string, taskId: string, status: VendorLinkStatus) => void;

  // Supabase sync
  syncShortlistFromDB: () => Promise<void>;
  // Load vendor directory from API (replaces seed data with live DB rows)
  initFromAPI: () => Promise<void>;
}

// Fill in defaults for any required Vendor fields the DB row is missing.
// The production `vendors` table (supabase/migrations/0001_vendors.sql) is
// much sparser than the unified Vendor type — it omits venue_connections,
// planner_connections, packages, portfolio_images, etc. Without this
// normalization, consumers like CategoryDrillIn that call
// `vendor.venue_connections.some(...)` crash on undefined.
function normalizeVendorRow(row: Partial<Vendor> & { id: string; name: string; category: VendorCategory }): Vendor {
  const now = row.created_at ?? new Date().toISOString();
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    name: row.name,
    owner_name: row.owner_name ?? "",
    category: row.category,
    tier: row.tier ?? "free",
    is_verified: row.is_verified ?? false,
    bio: row.bio ?? "",
    tagline: row.tagline ?? "",
    location: row.location ?? "",
    travel_level: row.travel_level ?? "local",
    years_active: row.years_active ?? 0,
    team_size: row.team_size ?? 0,
    style_tags: row.style_tags ?? [],
    contact: row.contact ?? { email: "", phone: "", website: "", instagram: "" },
    cover_image: row.cover_image ?? "",
    portfolio_images: row.portfolio_images ?? [],
    price_display: row.price_display ?? { type: "contact" },
    currency: row.currency ?? "INR",
    rating: row.rating ?? null,
    review_count: row.review_count ?? 0,
    wedding_count: row.wedding_count ?? 0,
    response_time_hours: row.response_time_hours ?? null,
    profile_completeness: row.profile_completeness ?? 0,
    created_at: now,
    updated_at: row.updated_at ?? now,
    planner_connections: row.planner_connections ?? [],
    venue_connections: row.venue_connections ?? [],
    packages: row.packages ?? [],
    // Optional rich-profile fields are passed through as-is.
    ...(row.instagram_handle !== undefined ? { instagram_handle: row.instagram_handle } : {}),
    ...(row.instagram_followers !== undefined ? { instagram_followers: row.instagram_followers } : {}),
    ...(row.services !== undefined ? { services: row.services } : {}),
    ...(row.languages !== undefined ? { languages: row.languages } : {}),
    ...(row.travel_fee_description !== undefined ? { travel_fee_description: row.travel_fee_description } : {}),
    ...(row.passport_valid !== undefined ? { passport_valid: row.passport_valid } : {}),
    ...(row.destination_booking_lead_months !== undefined ? { destination_booking_lead_months: row.destination_booking_lead_months } : {}),
    ...(row.preferred_regions !== undefined ? { preferred_regions: row.preferred_regions } : {}),
    ...(row.destinations !== undefined ? { destinations: row.destinations } : {}),
    ...(row.portfolio_posts !== undefined ? { portfolio_posts: row.portfolio_posts } : {}),
    ...(row.weddings !== undefined ? { weddings: row.weddings } : {}),
    ...(row.couple_reviews !== undefined ? { couple_reviews: row.couple_reviews } : {}),
    ...(row.planner_endorsements !== undefined ? { planner_endorsements: row.planner_endorsements } : {}),
  };
}

// Minimal valid Vendor for couple-typed custom entries. The couple doesn't
// know structured prices, portfolio images, connections, etc. — so we fill
// the unified shape with empty/contact defaults and let the shortlist notes
// carry the actual context.
function makeCustomVendor(
  id: string,
  input: {
    name: string;
    category: VendorCategory;
    location?: string;
  },
  now: string,
): Vendor {
  return {
    id,
    slug: id,
    name: input.name.trim(),
    owner_name: "",
    category: input.category,
    tier: "free",
    is_verified: false,
    bio: "",
    tagline: "",
    location: input.location?.trim() || "",
    travel_level: "local",
    years_active: 0,
    team_size: 0,
    style_tags: [],
    contact: {
      email: "",
      phone: "",
      website: "",
      instagram: "",
    },
    cover_image: "",
    portfolio_images: [],
    price_display: { type: "contact" },
    currency: "INR",
    rating: null,
    review_count: 0,
    wedding_count: 0,
    response_time_hours: null,
    profile_completeness: 0,
    created_at: now,
    updated_at: now,
    planner_connections: [],
    venue_connections: [],
    packages: [],
  };
}

export const useVendorsStore = create<VendorsState>()(
  persist(
    (set, get) => ({
      vendors: [],
      categoryVendors: {},
      loadingCategories: {},
      collections: [],
      shortlist: [],
      taskLinks: [],

      addVendors: (vendors) =>
        set((state) => {
          const existing = new Set(state.vendors.map((v) => v.id));
          const merged = [
            ...state.vendors,
            ...vendors.filter((v) => !existing.has(v.id)),
          ];
          return { vendors: merged };
        }),

      updateVendor: (id, patch) =>
        set((state) => ({
          vendors: state.vendors.map((v) =>
            v.id === id ? { ...v, ...patch, updated_at: new Date().toISOString() } : v,
          ),
        })),

      getVendorBySlug: (slug) => get().vendors.find((v) => v.slug === slug),

      getVendorsByCategory: (category) =>
        get().vendors.filter((v) => v.category === category),

      isShortlisted: (vendorId) =>
        get().shortlist.some((e) => e.vendor_id === vendorId),

      toggleShortlist: (vendorId) => {
        const existing = get().shortlist.find((e) => e.vendor_id === vendorId);
        if (existing) {
          set((state) => ({
            shortlist: state.shortlist.filter((e) => e.vendor_id !== vendorId),
            taskLinks: state.taskLinks.filter((l) => l.vendor_id !== vendorId),
          }));
          dbDeleteShortlist(vendorId).catch((err) => Sentry.captureException(err));
        } else {
          const entry: ShortlistEntry = {
            vendor_id: vendorId,
            saved_at: new Date().toISOString(),
            notes: "",
            status: "shortlisted",
          };
          set((state) => ({ shortlist: [...state.shortlist, entry] }));
          dbUpsertShortlist(entry).catch((err) => Sentry.captureException(err));
        }
      },

      saveFromRoulette: (vendorId, sessionId, status = "shortlisted") => {
        const existing = get().shortlist.find((e) => e.vendor_id === vendorId);
        if (existing) {
          set((state) => ({
            shortlist: state.shortlist.map((e) =>
              e.vendor_id === vendorId
                ? {
                    ...e,
                    status,
                    source: "roulette",
                    roulette_session_id: sessionId,
                  }
                : e,
            ),
          }));
          return;
        }
        set((state) => ({
          shortlist: [
            ...state.shortlist,
            {
              vendor_id: vendorId,
              saved_at: new Date().toISOString(),
              notes: "",
              status,
              source: "roulette",
              roulette_session_id: sessionId,
            },
          ],
        }));
      },

      setShortlistStatus: (vendorId, status) => {
        set((state) => ({
          shortlist: state.shortlist.map((e) =>
            e.vendor_id === vendorId ? { ...e, status } : e,
          ),
        }));
        const entry = get().shortlist.find((e) => e.vendor_id === vendorId);
        if (entry) dbUpsertShortlist({ ...entry, status }).catch((err) => Sentry.captureException(err));
      },

      removeFromShortlist: (vendorId) => {
        set((state) => ({
          shortlist: state.shortlist.filter((e) => e.vendor_id !== vendorId),
          taskLinks: state.taskLinks.filter((l) => l.vendor_id !== vendorId),
        }));
        dbDeleteShortlist(vendorId).catch((err) => Sentry.captureException(err));
      },

      updateShortlistEntry: (vendorId, patch) => {
        set((state) => ({
          shortlist: state.shortlist.map((e) =>
            e.vendor_id === vendorId ? { ...e, ...patch } : e,
          ),
        }));
        const entry = get().shortlist.find((e) => e.vendor_id === vendorId);
        if (entry) dbUpsertShortlist({ ...entry, ...patch }).catch((err) => Sentry.captureException(err));
      },

      reorderShortlist: (orderedVendorIds) =>
        set((state) => {
          const byId = new Map(state.shortlist.map((e) => [e.vendor_id, e]));
          const reordered: ShortlistEntry[] = [];
          orderedVendorIds.forEach((id, idx) => {
            const entry = byId.get(id);
            if (entry) {
              reordered.push({ ...entry, sort_order: idx });
              byId.delete(id);
            }
          });
          // Append any entries the caller didn't include (keeps the set complete).
          for (const entry of byId.values()) reordered.push(entry);
          return { shortlist: reordered };
        }),

      addCustomVendor: ({ name, category, location, notes }) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        const vendor = makeCustomVendor(id, { name, category, location }, now);
        const entry: ShortlistEntry = {
          vendor_id: id,
          saved_at: now,
          notes: notes ?? "",
          status: "shortlisted",
          is_custom: true,
        };
        set((state) => ({
          vendors: [...state.vendors, vendor],
          shortlist: [...state.shortlist, entry],
        }));
        return entry;
      },

      getTaskLinksForVendor: (vendorId) =>
        get().taskLinks.filter((l) => l.vendor_id === vendorId),

      getVendorsForTask: (taskId) =>
        get()
          .taskLinks.filter((l) => l.task_id === taskId)
          .map((l) => l.vendor_id),

      linkVendorToTask: (vendorId, taskId) => {
        // Auto-shortlist if not already — linking implies intent.
        if (!get().shortlist.some((e) => e.vendor_id === vendorId)) {
          set((state) => ({
            shortlist: [
              ...state.shortlist,
              {
                vendor_id: vendorId,
                saved_at: new Date().toISOString(),
                notes: "",
                status: "shortlisted",
              },
            ],
          }));
        }
        if (
          get().taskLinks.some(
            (l) => l.vendor_id === vendorId && l.task_id === taskId,
          )
        ) {
          return;
        }
        set((state) => ({
          taskLinks: [
            ...state.taskLinks,
            {
              vendor_id: vendorId,
              task_id: taskId,
              linked_at: new Date().toISOString(),
              status: "linked",
            },
          ],
        }));
      },

      unlinkVendorFromTask: (vendorId, taskId) =>
        set((state) => ({
          taskLinks: state.taskLinks.filter(
            (l) => !(l.vendor_id === vendorId && l.task_id === taskId),
          ),
        })),

      setLinkStatus: (vendorId, taskId, status) =>
        set((state) => ({
          taskLinks: state.taskLinks.map((l) =>
            l.vendor_id === vendorId && l.task_id === taskId
              ? { ...l, status }
              : l,
          ),
        })),

      syncShortlistFromDB: async () => {
        const dbEntries = await loadShortlistFromDB();
        if (dbEntries.length === 0) return;
        set((s) => {
          const dbIds = new Set(dbEntries.map((e) => e.vendor_id));
          const localOnly = s.shortlist.filter((e) => !dbIds.has(e.vendor_id));
          return { shortlist: [...dbEntries, ...localOnly] };
        });
      },

      // Load all vendors in a single category. Internal paging happens in
      // memory; we only call `set` once at the end so the directory grid
      // doesn't re-render mid-scroll (which is what was making cards appear
      // to "insert above the viewport" with the masonry layout).
      loadCategory: async (category, opts) => {
        const state = get();
        if (!opts?.force && state.categoryVendors[category]) return;
        if (state.loadingCategories[category]) return;

        set((s) => ({
          loadingCategories: { ...s.loadingCategories, [category]: true },
        }));

        try {
          // Always use the unified seed as the base for this category —
          // it contains all 14k real vendors including the ones from Downloads.
          const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
          const seedCat = (UNIFIED_VENDORS as Vendor[]).filter(
            (v) => v.category === category,
          );

          // Enrich with any live Supabase data for this category (optional).
          let apiCat: Vendor[] = [];
          try {
            const r = await fetch(
              `/api/vendors?category=${encodeURIComponent(category)}&limit=100&offset=0`,
            );
            if (r.ok) {
              const j = await r.json();
              const moreRaw: Array<Partial<Vendor> & { id: string; name: string; category: VendorCategory }> = j.vendors ?? [];
              apiCat = moreRaw.map(normalizeVendorRow);
            }
          } catch { /* API unavailable — seed is sufficient */ }

          // Merge: seed first, API only fills fields the seed left empty
          const byId = new Map<string, Vendor>(seedCat.map((v) => [v.id, v]));
          for (const api of apiCat) {
            const seed = byId.get(api.id);
            if (seed) {
              byId.set(api.id, {
                ...seed,
                rating: seed.rating ?? api.rating,
                review_count: seed.review_count || api.review_count,
                cover_image: seed.cover_image || api.cover_image,
                portfolio_images: (seed.portfolio_images?.length ?? 0) > 0
                  ? seed.portfolio_images
                  : api.portfolio_images,
                contact: {
                  email: seed.contact.email || api.contact.email,
                  phone: seed.contact.phone || api.contact.phone,
                  website: seed.contact.website || api.contact.website,
                  instagram: seed.contact.instagram || api.contact.instagram,
                },
              });
            } else {
              byId.set(api.id, api);
            }
          }
          const result = Array.from(byId.values());

          set((s) => {
            const existingIds = new Set(s.vendors.map((v) => v.id));
            const newOnes = result.filter((v) => !existingIds.has(v.id));
            return {
              vendors: newOnes.length > 0 ? [...s.vendors, ...newOnes] : s.vendors,
              categoryVendors: { ...s.categoryVendors, [category]: result },
              loadingCategories: { ...s.loadingCategories, [category]: false },
            };
          });
        } catch {
          try {
            const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
            const seedCat = (UNIFIED_VENDORS as Vendor[]).filter(
              (v) => v.category === category,
            );
            set((s) => ({
              categoryVendors: { ...s.categoryVendors, [category]: seedCat },
              loadingCategories: { ...s.loadingCategories, [category]: false },
            }));
          } catch {
            set((s) => ({
              loadingCategories: { ...s.loadingCategories, [category]: false },
            }));
          }
        }
      },

      initFromAPI: async () => {
        // Always load the full seed first so all 14k real vendors are present.
        const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
        set((s) => {
          const customOnly = s.vendors.filter((v) => v.id.startsWith("custom-"));
          const existingIds = new Set(customOnly.map((v) => v.id));
          const merged = [
            ...customOnly,
            ...(UNIFIED_VENDORS as Vendor[]).filter((v) => !existingIds.has(v.id)),
          ];
          return { vendors: merged };
        });

        // Then enrich with live Supabase data — only fill fields the seed left empty.
        // Never overwrite cover_image / portfolio_images / contact with empty API values.
        try {
          const res = await fetch("/api/vendors?limit=100&offset=0");
          if (!res.ok) return;
          const json = await res.json();
          const rawVendors: Array<Partial<Vendor> & { id: string; name: string; category: VendorCategory }> = json.vendors ?? [];
          if (rawVendors.length === 0) return;
          const apiVendors: Vendor[] = rawVendors.map(normalizeVendorRow);
          set((s) => {
            const byId = new Map(s.vendors.map((v) => [v.id, v]));
            for (const api of apiVendors) {
              const seed = byId.get(api.id);
              if (seed) {
                // Only take API value when seed field is genuinely empty
                byId.set(api.id, {
                  ...seed,
                  rating: seed.rating ?? api.rating,
                  review_count: seed.review_count || api.review_count,
                  // Never overwrite images with empty strings
                  cover_image: seed.cover_image || api.cover_image,
                  portfolio_images: (seed.portfolio_images?.length ?? 0) > 0
                    ? seed.portfolio_images
                    : api.portfolio_images,
                  // Keep seed contact if it has more data
                  contact: {
                    email: seed.contact.email || api.contact.email,
                    phone: seed.contact.phone || api.contact.phone,
                    website: seed.contact.website || api.contact.website,
                    instagram: seed.contact.instagram || api.contact.instagram,
                  },
                });
              } else {
                // Net-new vendor only in DB — add it
                byId.set(api.id, api);
              }
            }
            return { vendors: Array.from(byId.values()) };
          });
        } catch { /* Supabase unavailable — seed is sufficient */ }
      },
    }),
    {
      name: "ananya-vendors",
      version: 3,
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
      partialize: (state) => ({
        // Only persist couple-scoped state. The vendor catalogue (~3MB) is
        // reloaded from Supabase on mount — persisting it would make every
        // page load parse a huge localStorage entry on the main thread.
        shortlist: state.shortlist,
        taskLinks: state.taskLinks,
        collections: state.collections,
      }),
    },
  ),
);
