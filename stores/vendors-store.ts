import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  collections: Collection[];
  shortlist: ShortlistEntry[];
  taskLinks: TaskVendorLink[];

  // Directory
  addVendors: (vendors: Vendor[]) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  getVendorBySlug: (slug: string) => Vendor | undefined;
  getVendorsByCategory: (category: VendorCategory) => Vendor[];

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
          dbDeleteShortlist(vendorId).catch(console.error);
        } else {
          const entry: ShortlistEntry = {
            vendor_id: vendorId,
            saved_at: new Date().toISOString(),
            notes: "",
            status: "shortlisted",
          };
          set((state) => ({ shortlist: [...state.shortlist, entry] }));
          dbUpsertShortlist(entry).catch(console.error);
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
        if (entry) dbUpsertShortlist({ ...entry, status }).catch(console.error);
      },

      removeFromShortlist: (vendorId) => {
        set((state) => ({
          shortlist: state.shortlist.filter((e) => e.vendor_id !== vendorId),
          taskLinks: state.taskLinks.filter((l) => l.vendor_id !== vendorId),
        }));
        dbDeleteShortlist(vendorId).catch(console.error);
      },

      updateShortlistEntry: (vendorId, patch) => {
        set((state) => ({
          shortlist: state.shortlist.map((e) =>
            e.vendor_id === vendorId ? { ...e, ...patch } : e,
          ),
        }));
        const entry = get().shortlist.find((e) => e.vendor_id === vendorId);
        if (entry) dbUpsertShortlist({ ...entry, ...patch }).catch(console.error);
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

      initFromAPI: async () => {
        try {
          // Load first page of vendors from Supabase via API route.
          // If the DB is empty (not yet seeded), the seed fallback stays in place.
          const res = await fetch("/api/vendors?limit=100&offset=0");
          if (!res.ok) return;
          const json = await res.json();
          const apiVendors: Vendor[] = json.vendors ?? [];
          if (apiVendors.length === 0) {
            // DB empty — lazy-load seed as fallback
            const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
            set({ vendors: UNIFIED_VENDORS });
            return;
          }
          set((s) => {
            const dbIds = new Set(apiVendors.map((v) => v.id));
            // Custom vendors added by the couple stay; DB vendors replace seed
            const customOnly = s.vendors.filter((v) => v.id.startsWith("custom-") && !dbIds.has(v.id));
            return { vendors: [...apiVendors, ...customOnly] };
          });
          // If DB has more, load remaining pages in background (capped at 3,000)
          const total: number = json.total ?? 0;
          const MAX_VENDORS = 3000;
          if (total > 100) {
            const totalPages = Math.ceil(total / 100);
            const pageCap = Math.ceil(MAX_VENDORS / 100);
            const pages = Math.min(totalPages, pageCap);
            for (let page = 1; page < pages; page++) {
              const r = await fetch(`/api/vendors?limit=100&offset=${page * 100}`);
              if (!r.ok) break;
              const j = await r.json();
              const more: Vendor[] = j.vendors ?? [];
              if (more.length === 0) break;
              set((s) => {
                if (s.vendors.length >= MAX_VENDORS) return {};
                const existingIds = new Set(s.vendors.map((v) => v.id));
                return { vendors: [...s.vendors, ...more.filter((v) => !existingIds.has(v.id))] };
              });
            }
          }
        } catch {
          // Network error — lazy-load seed as fallback
          try {
            const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
            set((s) => s.vendors.length === 0 ? { vendors: UNIFIED_VENDORS } : {});
          } catch { /* seed also unavailable */ }
        }
      },
    }),
    {
      name: "ananya-vendors",
      version: 1,
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
