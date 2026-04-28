import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  CoverageAssignment,
  CoverageService,
  CoverageState,
  PaymentMilestone,
  WeddingEvent,
  WorkspaceAuthorRole,
  WorkspaceCategory,
  WorkspaceCategorySlug,
  WorkspaceContract,
  WorkspaceDecision,
  WorkspaceItem,
  WorkspaceMoodboardItem,
  WorkspaceNote,
  WorkspaceRole,
} from "@/types/workspace";
import type { SourceRef } from "@/types/journal-entries";
import {
  SEED_CATEGORIES,
  SEED_CONTRACTS,
  SEED_COVERAGE,
  SEED_DECISIONS,
  SEED_ITEMS,
  SEED_MOODBOARD,
  SEED_NOTES,
} from "@/lib/workspace-seed";

interface WorkspaceState {
  categories: WorkspaceCategory[];
  items: WorkspaceItem[];
  decisions: WorkspaceDecision[];
  notes: WorkspaceNote[];
  moodboard: WorkspaceMoodboardItem[];
  coverage: CoverageAssignment[];
  contracts: WorkspaceContract[];

  // Couple-custom ordering of the vendor workspace list (sidebar rail).
  // null means "fall back to the hard-coded default order." When set, this
  // array is the source of truth â€” any newly-seeded slugs not present fall
  // through to the end of the list.
  vendorOrder: WorkspaceCategorySlug[] | null;
  setVendorOrder: (order: WorkspaceCategorySlug[]) => void;
  resetVendorOrder: () => void;

  currentRole: WorkspaceRole;
  setCurrentRole: (role: WorkspaceRole) => void;

  getCategory: (slug: WorkspaceCategorySlug) => WorkspaceCategory | null;
  itemsFor: (categoryId: string, tab?: WorkspaceItem["tab"]) => WorkspaceItem[];
  decisionsFor: (categoryId: string) => WorkspaceDecision[];
  notesFor: (categoryId: string) => WorkspaceNote[];
  moodboardFor: (categoryId: string) => WorkspaceMoodboardItem[];
  coverageFor: (categoryId: string) => CoverageAssignment[];
  contractsFor: (categoryId: string) => WorkspaceContract[];
  openDecisionsCount: (categoryId: string) => number;
  progressFor: (categoryId: string) => { done: number; total: number };

  addNote: (categoryId: string, body: string, authorId?: string) => void;
  updateNote: (noteId: string, body: string) => void;
  deleteNote: (noteId: string) => void;

  addDecision: (
    categoryId: string,
    question: string,
    opts?: {
      description?: string;
      options?: string[];
      linked_vendor_id?: string | null;
      linked_event?: WeddingEvent | null;
    },
  ) => void;
  resolveDecision: (decisionId: string, resolution?: string) => void;
  reopenDecision: (decisionId: string) => void;
  deleteDecision: (decisionId: string) => void;
  toggleDecisionVeto: (decisionId: string) => void;

  addMoodboardItem: (
    categoryId: string,
    image_url: string,
    caption: string,
    source?: SourceRef,
  ) => void;
  deleteMoodboardItem: (id: string) => void;
  updateMoodboardItem: (
    id: string,
    patch: Partial<WorkspaceMoodboardItem>,
  ) => void;

  addItem: (item: Omit<WorkspaceItem, "id">) => void;
  updateItem: (itemId: string, patch: Partial<WorkspaceItem>) => void;
  deleteItem: (itemId: string) => void;

  setCategoryBudget: (categoryId: string, amount: number | null) => void;

  setCoverageAssignment: (
    categoryId: string,
    event: WeddingEvent,
    service: CoverageService,
    patch: { state: CoverageState; vendor_id?: string | null },
  ) => void;

  addContract: (
    input: Omit<WorkspaceContract, "id" | "created_at" | "updated_at">,
  ) => void;
  updateContract: (contractId: string, patch: Partial<WorkspaceContract>) => void;
  markMilestonePaid: (
    contractId: string,
    milestoneId: string,
    paid: boolean,
  ) => void;
  countersignContract: (contractId: string) => void;
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const asAuthor = (r: WorkspaceRole): WorkspaceAuthorRole =>
  r === "vendor" ? "planner" : r;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      categories: SEED_CATEGORIES,
      items: SEED_ITEMS,
      decisions: SEED_DECISIONS,
      notes: SEED_NOTES,
      moodboard: SEED_MOODBOARD,
      coverage: SEED_COVERAGE,
      contracts: SEED_CONTRACTS,
      vendorOrder: null,
      currentRole: "planner",

      setVendorOrder: (order) => set({ vendorOrder: order }),
      resetVendorOrder: () => set({ vendorOrder: null }),

      setCurrentRole: (role) => set({ currentRole: role }),

      getCategory: (slug) =>
        get().categories.find((c) => c.slug === slug) ?? null,

      itemsFor: (categoryId, tab) => {
        const items = get()
          .items.filter((i) => i.category_id === categoryId)
          .filter((i) => (tab ? i.tab === tab : true))
          .sort((a, b) => a.sort_order - b.sort_order);
        return items;
      },

      decisionsFor: (categoryId) =>
        get()
          .decisions.filter((d) => d.category_id === categoryId)
          .sort((a, b) => (a.status === "open" ? -1 : 1)),

      notesFor: (categoryId) =>
        get()
          .notes.filter((n) => n.category_id === categoryId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),

      moodboardFor: (categoryId) =>
        get()
          .moodboard.filter((m) => m.category_id === categoryId)
          .sort((a, b) => a.sort_order - b.sort_order),

      coverageFor: (categoryId) =>
        get().coverage.filter((c) => c.category_id === categoryId),

      contractsFor: (categoryId) =>
        get()
          .contracts.filter((c) => c.category_id === categoryId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      openDecisionsCount: (categoryId) =>
        get().decisions.filter(
          (d) => d.category_id === categoryId && d.status === "open",
        ).length,

      progressFor: (categoryId) => {
        const items = get().items.filter((i) => i.category_id === categoryId);
        const decisions = get().decisions.filter(
          (d) => d.category_id === categoryId,
        );
        const total = items.length + decisions.length;
        const done =
          items.length +
          decisions.filter((d) => d.status === "resolved").length;
        if (total === 0) return { done: 0, total: 0 };
        return { done, total };
      },

      addNote: (categoryId, body, authorId) =>
        set((s) => ({
          notes: [
            ...s.notes,
            {
              id: rid("wn"),
              category_id: categoryId,
              body,
              author_id: authorId ?? asAuthor(s.currentRole),
              created_at: nowIso(),
            },
          ],
        })),

      updateNote: (noteId, body) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === noteId ? { ...n, body } : n)),
        })),

      deleteNote: (noteId) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== noteId) })),

      addDecision: (categoryId, question, opts) =>
        set((s) => ({
          decisions: [
            ...s.decisions,
            {
              id: rid("wd"),
              category_id: categoryId,
              question,
              status: "open",
              resolved_at: null,
              created_at: nowIso(),
              created_by: asAuthor(s.currentRole),
              description: opts?.description,
              options: opts?.options,
              linked_vendor_id: opts?.linked_vendor_id ?? null,
              linked_event: opts?.linked_event ?? null,
              veto_flags: [],
            },
          ],
        })),

      resolveDecision: (decisionId, resolution) =>
        set((s) => ({
          decisions: s.decisions.map((d) =>
            d.id === decisionId
              ? {
                  ...d,
                  status: "resolved",
                  resolved_at: nowIso(),
                  resolved_by: asAuthor(s.currentRole),
                  resolution: resolution ?? d.resolution,
                }
              : d,
          ),
        })),

      reopenDecision: (decisionId) =>
        set((s) => ({
          decisions: s.decisions.map((d) =>
            d.id === decisionId
              ? { ...d, status: "open", resolved_at: null, resolved_by: null }
              : d,
          ),
        })),

      deleteDecision: (decisionId) =>
        set((s) => ({
          decisions: s.decisions.filter((d) => d.id !== decisionId),
        })),

      toggleDecisionVeto: (decisionId) =>
        set((s) => {
          // Veto is couple-side â€” planner and vendor view cannot flag it.
          if (s.currentRole === "vendor" || s.currentRole === "planner") {
            return {};
          }
          const author = asAuthor(s.currentRole);
          return {
            decisions: s.decisions.map((d) => {
              if (d.id !== decisionId) return d;
              const flags = d.veto_flags ?? [];
              const has = flags.includes(author);
              return {
                ...d,
                veto_flags: has
                  ? flags.filter((f) => f !== author)
                  : [...flags, author],
              };
            }),
          };
        }),

      addMoodboardItem: (categoryId, image_url, caption, source) =>
        set((s) => {
          const existing = s.moodboard.filter(
            (m) => m.category_id === categoryId,
          );
          return {
            moodboard: [
              ...s.moodboard,
              {
                id: rid("wmb"),
                category_id: categoryId,
                image_url,
                caption,
                sort_order: existing.length + 1,
                ...(source ? { source } : {}),
              },
            ],
          };
        }),

      deleteMoodboardItem: (id) =>
        set((s) => ({ moodboard: s.moodboard.filter((m) => m.id !== id) })),

      updateMoodboardItem: (id, patch) =>
        set((s) => ({
          moodboard: s.moodboard.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),

      addItem: (item) =>
        set((s) => ({
          items: [...s.items, { ...item, id: rid("wi") }],
        })),

      updateItem: (itemId, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
        })),

      deleteItem: (itemId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

      setCategoryBudget: (categoryId, amount) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId ? { ...c, budget_allocated: amount } : c,
          ),
        })),

      setCoverageAssignment: (categoryId, event, service, patch) =>
        set((s) => {
          const existing = s.coverage.find(
            (c) =>
              c.category_id === categoryId &&
              c.event === event &&
              c.service === service,
          );
          if (existing) {
            return {
              coverage: s.coverage.map((c) =>
                c.id === existing.id
                  ? {
                      ...c,
                      state: patch.state,
                      vendor_id: patch.vendor_id ?? null,
                    }
                  : c,
              ),
            };
          }
          return {
            coverage: [
              ...s.coverage,
              {
                id: rid("cov"),
                category_id: categoryId,
                event,
                service,
                state: patch.state,
                vendor_id: patch.vendor_id ?? null,
              },
            ],
          };
        }),

      addContract: (input) =>
        set((s) => ({
          contracts: [
            ...s.contracts,
            {
              ...input,
              id: rid("ctr"),
              created_at: nowIso(),
              updated_at: nowIso(),
            },
          ],
        })),

      updateContract: (contractId, patch) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === contractId ? { ...c, ...patch, updated_at: nowIso() } : c,
          ),
        })),

      markMilestonePaid: (contractId, milestoneId, paid) =>
        set((s) => ({
          contracts: s.contracts.map((c) => {
            if (c.id !== contractId) return c;
            const schedule: PaymentMilestone[] = c.payment_schedule.map((m) =>
              m.id === milestoneId
                ? { ...m, paid_at: paid ? nowIso() : null }
                : m,
            );
            return { ...c, payment_schedule: schedule, updated_at: nowIso() };
          }),
        })),

      countersignContract: (contractId) =>
        set((s) => {
          const role = s.currentRole;
          if (role !== "priya" && role !== "arjun") return {};
          return {
            contracts: s.contracts.map((c) => {
              if (c.id !== contractId) return c;
              const priya =
                role === "priya" ? nowIso() : c.countersigned_by_priya_at;
              const arjun =
                role === "arjun" ? nowIso() : c.countersigned_by_arjun_at;
              const bothSigned = Boolean(priya) && Boolean(arjun);
              return {
                ...c,
                countersigned_by_priya_at: priya,
                countersigned_by_arjun_at: arjun,
                status: bothSigned ? "countersigned" : c.status,
                updated_at: nowIso(),
              };
            }),
          };
        }),
    }),
    {
      name: "ananya:workspace",
      version: 4,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      partialize: (state) => ({
        categories: state.categories,
        items: state.items,
        decisions: state.decisions,
        notes: state.notes,
        moodboard: state.moodboard,
        coverage: state.coverage,
        contracts: state.contracts,
        currentRole: state.currentRole,
        vendorOrder: state.vendorOrder,
      }),
      migrate: (persisted, version) => {
        // v1 â†’ v2 adds coverage, contracts, currentRole, and the
        // budget_allocated field on photography. v2 â†’ v3 appends the new
        // vendor categories (jewelry, cake & sweets, gifting, travel &
        // accommodations) to persisted category lists so existing dev users
        // see them in the sidebar without wiping their state.
        let p = (persisted ?? {}) as Partial<WorkspaceState>;
        if (version < 2) {
          p = {
            ...p,
            coverage:
              (p.coverage as CoverageAssignment[] | undefined) ?? SEED_COVERAGE,
            contracts:
              (p.contracts as WorkspaceContract[] | undefined) ?? SEED_CONTRACTS,
            currentRole:
              (p.currentRole as WorkspaceRole | undefined) ?? "planner",
            categories:
              (p.categories as WorkspaceCategory[] | undefined)?.map((c) =>
                c.slug === "photography" && c.budget_allocated == null
                  ? { ...c, budget_allocated: 2_500_000 }
                  : c,
              ) ?? SEED_CATEGORIES,
          };
        }
        if (version < 3) {
          const existing = (p.categories as WorkspaceCategory[] | undefined) ?? [];
          const seen = new Set(existing.map((c) => c.slug));
          const appended = SEED_CATEGORIES.filter((c) => !seen.has(c.slug));
          p = {
            ...p,
            categories: [...existing, ...appended],
          };
        }
        if (version < 4) {
          // Jewelry workspace was rebuilt from scratch; legacy items on the
          // old jewelry tabs are dropped rather than re-homed. Treat this
          // as greenfield â€” the new tabs don't share data shape with the
          // retired inventory/pairing/insurance/documents surfaces.
          const JEWELRY_LEGACY_TABS = new Set([
            "bridal_sets",
            "heirloom_pieces",
            "jewelry_rentals",
            "jewelry_inventory",
            "jewelry_pairing",
            "jewelry_insurance",
            "jewelry_documents",
          ]);
          const oldItems = (p.items as WorkspaceItem[] | undefined) ?? [];
          p = {
            ...p,
            items: oldItems.filter((it) => !JEWELRY_LEGACY_TABS.has(it.tab as string)),
          };
        }
        return p;
      },
      // Belt-and-suspenders backfill. Migrate only runs on a version bump;
      // this fires on every load and appends any seed category whose slug
      // isn't already in the persisted list. Keeps the sidebar in sync
      // with SEED_CATEGORIES even if the persisted state is stuck at a
      // newer version than expected (e.g. dev snapshot from a future build).
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const seen = new Set(state.categories.map((c) => c.slug));
        const missing = SEED_CATEGORIES.filter((c) => !seen.has(c.slug));
        if (missing.length > 0) {
          state.categories = [...state.categories, ...missing];
        }
      },
    },
  ),
);

let _workspaceSyncTimer: ReturnType<typeof setTimeout> | null = null;
useWorkspaceStore.subscribe((state) => {
  if (_workspaceSyncTimer) clearTimeout(_workspaceSyncTimer);
  _workspaceSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { categories, items, decisions, notes, moodboard, coverage, contracts, vendorOrder } = state;
    dbUpsert("workspace_state", { couple_id: coupleId, categories, items, decisions, notes, moodboard, coverage, contracts, vendor_order: vendorOrder });
  }, 600);
});
