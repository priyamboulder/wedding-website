// ── Finance store ──────────────────────────────────────────────────────────
// Zustand + localStorage with a Supabase-shaped query surface. Each action
// corresponds to a future Supabase mutation; each selector corresponds to a
// future Supabase query. Swap-over is a one-file change: replace the state
// mutations with supabase.from(...).insert/update/delete calls.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, dbLoadAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  ActivityKind,
  AllocationPreset,
  ContributorVisibilityScope,
  FinanceBudget,
  FinanceCategory,
  FinanceCategoryId,
  FinanceContributor,
  FinanceContributorAllocation,
  FinanceEvent,
  FinanceInvoice,
  FinanceInvoiceActivity,
  FinanceInvoiceComment,
  FinanceInvoiceMilestone,
  FinanceInvoiceStatus,
  FinanceOnboardingState,
  FinancePayment,
  FinancePaymentMethod,
  FinanceSettings,
  FinanceTransaction,
  FundSource,
  MilestoneStatus,
  TransactionSource,
} from "@/types/finance";
import { DEFAULT_WEDDING_ID } from "@/types/finance";
import {
  SEED_FINANCE_BUDGETS,
  SEED_FINANCE_CATEGORIES,
  SEED_FINANCE_CONTRIBUTORS,
  SEED_FINANCE_CONTRIBUTOR_ALLOCATIONS,
  SEED_FINANCE_EVENTS,
  SEED_FINANCE_INVOICES,
  SEED_FINANCE_INVOICE_ACTIVITY,
  SEED_FINANCE_INVOICE_COMMENTS,
  SEED_FINANCE_INVOICE_MILESTONES,
  SEED_FINANCE_PAYMENTS,
  SEED_FINANCE_PRESETS,
  SEED_FINANCE_SETTINGS,
  SEED_FINANCE_TRANSACTIONS,
} from "@/lib/finance-seed";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function transactionDedupeHash(
  date: string,
  amount_cents: number,
  description: string,
): string {
  return `${date}|${amount_cents}|${description.trim().toLowerCase()}`;
}

// ── Mutation input shapes ──────────────────────────────────────────────────

export interface InvoiceCreateInput {
  vendor_id?: string | null;
  vendor_name_fallback?: string | null;
  category_id: FinanceCategoryId;
  event_splits?: Array<{ event_id: string; amount_cents: number }>;
  invoice_number?: string | null;
  amount_cents: number;
  due_date: string;
  status?: FinanceInvoiceStatus;
  pdf_url?: string | null;
  pdf_filename?: string | null;
  notes?: string | null;
}

export interface InvoicePatch {
  vendor_id?: string | null;
  vendor_name_fallback?: string | null;
  category_id?: FinanceCategoryId;
  event_splits?: Array<{ event_id: string; amount_cents: number }>;
  invoice_number?: string | null;
  amount_cents?: number;
  due_date?: string;
  status?: FinanceInvoiceStatus;
  notes?: string | null;
}

export interface ContributorCreateInput {
  name: string;
  relationship: string;
  pledged_cents: number;
  paid_cents?: number;
  visibility_scope?: ContributorVisibilityScope;
  notes?: string | null;
}

export interface ContributorPatch {
  name?: string;
  relationship?: string;
  pledged_cents?: number;
  paid_cents?: number;
  visibility_scope?: ContributorVisibilityScope;
  notes?: string | null;
}

export interface ContributorAllocationInput {
  contributor_id: string;
  category_id?: FinanceCategoryId | null;
  invoice_id?: string | null;
  amount_cents: number;
  note?: string | null;
}

export interface CategoryCreateInput {
  name: string;
  color_class: string;
  allocated_cents?: number;
}

export interface CategoryPatch {
  name?: string;
  color_class?: string;
  hidden?: boolean;
  sort_order?: number;
}

export interface EventCreateInput {
  name: string;
  date?: string | null;
  allocated_cents?: number;
}

export interface EventPatch {
  name?: string;
  date?: string | null;
  allocated_cents?: number;
  sort_order?: number;
}

export interface TransactionCreateInput {
  date: string;
  description: string;
  amount_cents: number;
  account_last4?: string | null;
  category_id?: FinanceCategoryId | null;
  event_splits?: Array<{ event_id: string; amount_cents: number }>;
  payer_contributor_id?: string | null;
  invoice_id?: string | null;
  fund_source?: FundSource;
  notes?: string | null;
  receipt_url?: string | null;
  receipt_filename?: string | null;
  source?: TransactionSource;
}

export interface TransactionPatch {
  date?: string;
  description?: string;
  amount_cents?: number;
  account_last4?: string | null;
  category_id?: FinanceCategoryId | null;
  event_splits?: Array<{ event_id: string; amount_cents: number }>;
  payer_contributor_id?: string | null;
  invoice_id?: string | null;
  fund_source?: FundSource;
  notes?: string | null;
  receipt_url?: string | null;
  receipt_filename?: string | null;
}

export interface MilestoneCreateInput {
  invoice_id: string;
  name: string;
  amount_cents: number;
  due_date: string;
  status?: MilestoneStatus;
}

export interface MilestonePatch {
  name?: string;
  amount_cents?: number;
  due_date?: string;
  status?: MilestoneStatus;
  paid_date?: string | null;
  payment_method?: FinancePaymentMethod | null;
  payment_reference?: string | null;
  transaction_id?: string | null;
}

export interface PresetCreateInput {
  name: string;
  percentages: Record<FinanceCategoryId, number>;
}

// ── Store shape ────────────────────────────────────────────────────────────

interface FinanceState {
  // ── Records ─────────────────────────────────────────────────────────────
  categories: FinanceCategory[];
  events: FinanceEvent[];
  budgets: FinanceBudget[];
  invoices: FinanceInvoice[];
  invoiceMilestones: FinanceInvoiceMilestone[];
  invoiceComments: FinanceInvoiceComment[];
  invoiceActivity: FinanceInvoiceActivity[];
  payments: FinancePayment[];
  contributors: FinanceContributor[];
  allocations: FinanceContributorAllocation[];
  transactions: FinanceTransaction[];
  presets: AllocationPreset[];
  settings: FinanceSettings;

  // ── Categories ──────────────────────────────────────────────────────────
  visibleCategories: () => FinanceCategory[];
  categoryById: (id: FinanceCategoryId) => FinanceCategory | null;
  addCategory: (input: CategoryCreateInput) => FinanceCategory;
  updateCategory: (id: FinanceCategoryId, patch: CategoryPatch) => void;
  deleteCategory: (id: FinanceCategoryId) => void;

  // ── Events ──────────────────────────────────────────────────────────────
  addEvent: (input: EventCreateInput) => FinanceEvent;
  updateEvent: (id: string, patch: EventPatch) => void;
  deleteEvent: (id: string) => void;

  // ── Budgets ─────────────────────────────────────────────────────────────
  getBudgetFor: (category_id: FinanceCategoryId) => FinanceBudget | null;
  setAllocated: (
    category_id: FinanceCategoryId,
    allocated_cents: number,
    notes?: string,
  ) => void;
  setMultipleAllocations: (
    updates: Array<{ category_id: FinanceCategoryId; allocated_cents: number }>,
  ) => void;

  // ── Settings (total budget) ─────────────────────────────────────────────
  setTotalBudget: (cents: number) => void;
  applyPresetToAllocations: (
    preset_id: string,
    opts?: { scaleToTotal?: boolean },
  ) => Array<{ category_id: FinanceCategoryId; allocated_cents: number }>;
  setActivePreset: (preset_id: string | null) => void;

  // ── Presets ─────────────────────────────────────────────────────────────
  addPreset: (input: PresetCreateInput) => AllocationPreset;
  deletePreset: (id: string) => void;

  // ── Invoices ────────────────────────────────────────────────────────────
  addInvoice: (input: InvoiceCreateInput) => FinanceInvoice;
  updateInvoice: (id: string, patch: InvoicePatch) => void;
  deleteInvoice: (id: string) => void;
  setInvoiceStatus: (id: string, status: FinanceInvoiceStatus) => void;
  bulkSetInvoiceStatus: (ids: string[], status: FinanceInvoiceStatus) => void;

  // ── Payments ────────────────────────────────────────────────────────────
  addPayment: (
    invoice_id: string,
    amount_cents: number,
    payment_method: FinancePaymentMethod,
    notes?: string,
    paid_date?: string,
  ) => FinancePayment;
  markInvoicePaid: (
    invoice_id: string,
    opts?: { payment_method?: FinancePaymentMethod; notes?: string },
  ) => void;

  // ── Contributors ────────────────────────────────────────────────────────
  addContributor: (input: ContributorCreateInput) => FinanceContributor;
  updateContributor: (id: string, patch: ContributorPatch) => void;
  deleteContributor: (id: string) => void;

  // ── Allocations ─────────────────────────────────────────────────────────
  addAllocation: (
    input: ContributorAllocationInput,
  ) => FinanceContributorAllocation;
  deleteAllocation: (id: string) => void;
  allocationsFor: (
    contributor_id: string,
  ) => FinanceContributorAllocation[];

  // ── Transactions ────────────────────────────────────────────────────────
  addTransaction: (input: TransactionCreateInput) => FinanceTransaction;
  addTransactionsBulk: (
    inputs: TransactionCreateInput[],
  ) => FinanceTransaction[];
  updateTransaction: (id: string, patch: TransactionPatch) => void;
  deleteTransaction: (id: string) => void;
  bulkUpdateTransactions: (
    ids: string[],
    patch: TransactionPatch,
  ) => void;
  // Event tagging varies per-row because the split amount follows each
  // transaction's own amount_cents. This keeps the bulk apply coherent
  // without forcing callers to build per-row patches.
  bulkSetEventTag: (ids: string[], event_id: string | null) => void;
  findDuplicateOf: (
    draft: TransactionCreateInput,
  ) => FinanceTransaction | null;

  // ── Invoice milestones ──────────────────────────────────────────────────
  milestonesFor: (invoice_id: string) => FinanceInvoiceMilestone[];
  addMilestone: (input: MilestoneCreateInput) => FinanceInvoiceMilestone;
  updateMilestone: (id: string, patch: MilestonePatch) => void;
  deleteMilestone: (id: string) => void;
  markMilestonePaid: (
    id: string,
    opts?: {
      payment_method?: FinancePaymentMethod;
      payment_reference?: string;
      transaction_id?: string;
      paid_date?: string;
    },
  ) => void;
  // Re-derive an invoice's status from its milestones (paid / partially_paid
  // / overdue / approved). Called after milestone mutations.
  recomputeInvoiceStatus: (invoice_id: string) => void;

  // ── Invoice comments ────────────────────────────────────────────────────
  commentsFor: (invoice_id: string) => FinanceInvoiceComment[];
  addComment: (
    invoice_id: string,
    body: string,
    author_name: string,
  ) => FinanceInvoiceComment;
  toggleCommentPin: (id: string) => void;
  deleteComment: (id: string) => void;

  // ── Invoice activity ────────────────────────────────────────────────────
  activityFor: (invoice_id: string) => FinanceInvoiceActivity[];
  logActivity: (
    invoice_id: string,
    kind: ActivityKind,
    message: string,
    actor_name?: string | null,
  ) => void;

  // ── Onboarding ──────────────────────────────────────────────────────────
  setOnboarding: (patch: Partial<FinanceOnboardingState>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // ── Bulk reset (dev-only) ───────────────────────────────────────────────
  resetToSeed: () => void;

  // ── DB sync ─────────────────────────────────────────────────────────────
  loadFromDB: () => Promise<void>;
  initFromAPI: () => Promise<void>;
}

// Persisted state v1 missed the v2 fields. The migrate fn fills them in
// from seed data so upgrading users keep their edits without crashing.
function migrateV1ToV2(state: unknown): unknown {
  const s = (state ?? {}) as Record<string, unknown>;
  return {
    categories: (s.categories as FinanceCategory[] | undefined) ??
      SEED_FINANCE_CATEGORIES,
    events: (s.events as FinanceEvent[] | undefined) ?? SEED_FINANCE_EVENTS,
    budgets: (s.budgets as FinanceBudget[] | undefined) ??
      SEED_FINANCE_BUDGETS,
    invoices: ((s.invoices as FinanceInvoice[] | undefined) ??
      SEED_FINANCE_INVOICES).map((i) => ({
        ...i,
        event_splits: i.event_splits ?? [],
      })),
    payments: (s.payments as FinancePayment[] | undefined) ??
      SEED_FINANCE_PAYMENTS,
    contributors: (s.contributors as FinanceContributor[] | undefined) ??
      SEED_FINANCE_CONTRIBUTORS,
    allocations:
      (s.allocations as FinanceContributorAllocation[] | undefined) ??
      SEED_FINANCE_CONTRIBUTOR_ALLOCATIONS,
    transactions:
      (s.transactions as FinanceTransaction[] | undefined) ??
      SEED_FINANCE_TRANSACTIONS,
    presets:
      (s.presets as AllocationPreset[] | undefined) ?? SEED_FINANCE_PRESETS,
    settings:
      (s.settings as FinanceSettings | undefined) ?? SEED_FINANCE_SETTINGS,
  };
}

// v2 → v3 adds: per-invoice milestones/comments/activity, onboarding state
// on settings, and `fund_source` on transactions. We default new fields
// rather than wipe stored edits.
function migrateV2ToV3(state: unknown): unknown {
  const s = (state ?? {}) as Record<string, unknown>;
  const oldSettings = s.settings as FinanceSettings | undefined;
  const settings: FinanceSettings = oldSettings
    ? {
        ...oldSettings,
        onboarding: oldSettings.onboarding ?? SEED_FINANCE_SETTINGS.onboarding,
      }
    : SEED_FINANCE_SETTINGS;
  const transactions = (
    (s.transactions as FinanceTransaction[] | undefined) ?? []
  ).map((t) => ({
    ...t,
    fund_source: t.fund_source ?? "shared",
  }));
  return {
    ...s,
    transactions,
    invoiceMilestones:
      (s.invoiceMilestones as FinanceInvoiceMilestone[] | undefined) ??
      SEED_FINANCE_INVOICE_MILESTONES,
    invoiceComments:
      (s.invoiceComments as FinanceInvoiceComment[] | undefined) ??
      SEED_FINANCE_INVOICE_COMMENTS,
    invoiceActivity:
      (s.invoiceActivity as FinanceInvoiceActivity[] | undefined) ??
      SEED_FINANCE_INVOICE_ACTIVITY,
    settings,
  };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      categories: SEED_FINANCE_CATEGORIES,
      events: SEED_FINANCE_EVENTS,
      budgets: SEED_FINANCE_BUDGETS,
      invoices: SEED_FINANCE_INVOICES,
      invoiceMilestones: SEED_FINANCE_INVOICE_MILESTONES,
      invoiceComments: SEED_FINANCE_INVOICE_COMMENTS,
      invoiceActivity: SEED_FINANCE_INVOICE_ACTIVITY,
      payments: SEED_FINANCE_PAYMENTS,
      contributors: SEED_FINANCE_CONTRIBUTORS,
      allocations: SEED_FINANCE_CONTRIBUTOR_ALLOCATIONS,
      transactions: SEED_FINANCE_TRANSACTIONS,
      presets: SEED_FINANCE_PRESETS,
      settings: SEED_FINANCE_SETTINGS,

      // ── Categories ────────────────────────────────────────────────────
      visibleCategories: () =>
        get()
          .categories.filter((c) => !c.hidden)
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order),

      categoryById: (id) =>
        get().categories.find((c) => c.id === id) ?? null,

      addCategory: (input) => {
        const existing = get().categories;
        const nextOrder =
          existing.reduce((m, c) => Math.max(m, c.sort_order), -1) + 1;
        const row: FinanceCategory = {
          id: uid("cat"),
          wedding_id: DEFAULT_WEDDING_ID,
          name: input.name.trim(),
          color_class: input.color_class,
          is_default: false,
          hidden: false,
          sort_order: nextOrder,
          created_at: nowIso(),
        };
        set((s) => {
          const nextBudgets = input.allocated_cents
            ? [
                ...s.budgets,
                {
                  wedding_id: DEFAULT_WEDDING_ID,
                  category_id: row.id,
                  allocated_cents: input.allocated_cents,
                  notes: null,
                  updated_at: nowIso(),
                } satisfies FinanceBudget,
              ]
            : s.budgets;
          return {
            categories: [...s.categories, row],
            budgets: nextBudgets,
          };
        });
        const _coupCat = getCurrentCoupleId();
        if (_coupCat) dbUpsert("finance_categories", { ...row, couple_id: _coupCat });
        return row;
      },

      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("finance_categories", { id, couple_id: coupleId, ...patch });
      },

      // Default categories cannot be deleted, only hidden. Custom categories
      // are removed along with their budget rows; invoices/transactions
      // tagged to them are left in place with the (now orphaned) id — the
      // UI treats an unknown id as "Uncategorized".
      deleteCategory: (id) => {
        set((s) => {
          const target = s.categories.find((c) => c.id === id);
          if (!target || target.is_default) return s;
          return {
            categories: s.categories.filter((c) => c.id !== id),
            budgets: s.budgets.filter((b) => b.category_id !== id),
            // Clear category_id on transactions pointing at it so the
            // ledger stays readable (they just fall into Uncategorized).
            transactions: s.transactions.map((t) =>
              t.category_id === id ? { ...t, category_id: null } : t,
            ),
          };
        });
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("finance_categories", { id, couple_id: coupleId });
      },

      // ── Events ────────────────────────────────────────────────────────
      addEvent: (input) => {
        const existing = get().events;
        const nextOrder =
          existing.reduce((m, e) => Math.max(m, e.sort_order), -1) + 1;
        const row: FinanceEvent = {
          id: uid("evt"),
          wedding_id: DEFAULT_WEDDING_ID,
          name: input.name.trim(),
          date: input.date ?? null,
          sort_order: nextOrder,
          allocated_cents: input.allocated_cents ?? 0,
          created_at: nowIso(),
        };
        set((s) => ({ events: [...s.events, row] }));
        return row;
      },

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),

      deleteEvent: (id) =>
        set((s) => ({
          events: s.events.filter((e) => e.id !== id),
          invoices: s.invoices.map((i) => ({
            ...i,
            event_splits: i.event_splits.filter((x) => x.event_id !== id),
          })),
          transactions: s.transactions.map((t) => ({
            ...t,
            event_splits: t.event_splits.filter((x) => x.event_id !== id),
          })),
        })),

      // ── Budgets ───────────────────────────────────────────────────────
      getBudgetFor: (category_id) =>
        get().budgets.find((b) => b.category_id === category_id) ?? null,

      setAllocated: (category_id, allocated_cents, notes) =>
        set((s) => {
          const idx = s.budgets.findIndex((b) => b.category_id === category_id);
          const next: FinanceBudget = {
            wedding_id: DEFAULT_WEDDING_ID,
            category_id,
            allocated_cents,
            notes: notes ?? s.budgets[idx]?.notes ?? null,
            updated_at: nowIso(),
          };
          if (idx >= 0) {
            const copy = s.budgets.slice();
            copy[idx] = { ...copy[idx]!, ...next };
            return { budgets: copy };
          }
          return { budgets: [...s.budgets, next] };
        }),

      setMultipleAllocations: (updates) =>
        set((s) => {
          const byKey = new Map(s.budgets.map((b) => [b.category_id, b]));
          for (const u of updates) {
            const prev = byKey.get(u.category_id);
            byKey.set(u.category_id, {
              wedding_id: DEFAULT_WEDDING_ID,
              category_id: u.category_id,
              allocated_cents: u.allocated_cents,
              notes: prev?.notes ?? null,
              updated_at: nowIso(),
            });
          }
          return { budgets: Array.from(byKey.values()) };
        }),

      // ── Settings + preset application ─────────────────────────────────
      setTotalBudget: (cents) => {
        set((s) => ({
          settings: {
            ...s.settings,
            total_budget_cents: Math.max(0, cents),
            updated_at: nowIso(),
          },
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("finance_settings", { couple_id: coupleId, total_budget_cents: Math.max(0, cents), updated_at: nowIso() });
      },

      applyPresetToAllocations: (preset_id, opts) => {
        const state = get();
        const preset = state.presets.find((p) => p.id === preset_id);
        if (!preset) return [];
        const total = opts?.scaleToTotal
          ? state.settings.total_budget_cents
          : state.settings.total_budget_cents;
        return Object.entries(preset.percentages)
          .filter(([cid]) => {
            const cat = state.categories.find((c) => c.id === cid);
            return cat && !cat.hidden;
          })
          .map(([category_id, pct]) => ({
            category_id,
            allocated_cents: Math.round(total * pct),
          }));
      },

      setActivePreset: (preset_id) =>
        set((s) => ({
          settings: {
            ...s.settings,
            active_preset_id: preset_id,
            updated_at: nowIso(),
          },
        })),

      // ── Presets ───────────────────────────────────────────────────────
      addPreset: (input) => {
        const row: AllocationPreset = {
          id: uid("preset"),
          wedding_id: DEFAULT_WEDDING_ID,
          name: input.name.trim(),
          percentages: input.percentages,
          is_default: false,
          created_at: nowIso(),
        };
        set((s) => ({ presets: [...s.presets, row] }));
        return row;
      },

      deletePreset: (id) =>
        set((s) => {
          const target = s.presets.find((p) => p.id === id);
          if (!target || target.is_default) return s;
          return {
            presets: s.presets.filter((p) => p.id !== id),
            settings:
              s.settings.active_preset_id === id
                ? { ...s.settings, active_preset_id: null }
                : s.settings,
          };
        }),

      // ── Invoices ──────────────────────────────────────────────────────
      addInvoice: (input) => {
        const row: FinanceInvoice = {
          id: uid("inv"),
          wedding_id: DEFAULT_WEDDING_ID,
          vendor_id: input.vendor_id ?? null,
          vendor_name_fallback: input.vendor_name_fallback ?? null,
          category_id: input.category_id,
          event_splits: input.event_splits ?? [],
          invoice_number: input.invoice_number ?? null,
          amount_cents: input.amount_cents,
          due_date: input.due_date,
          status: input.status ?? "awaiting_approval",
          pdf_url: input.pdf_url ?? null,
          pdf_filename: input.pdf_filename ?? null,
          notes: input.notes ?? null,
          extracted_data_jsonb: null,
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((s) => ({ invoices: [row, ...s.invoices] }));
        const _coupInv = getCurrentCoupleId();
        if (_coupInv) dbUpsert("finance_invoices", { ...row, couple_id: _coupInv, event_splits: row.event_splits ?? [] });
        return row;
      },

      updateInvoice: (id, patch) => {
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, ...patch, updated_at: nowIso() } : i,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("finance_invoices", { id, couple_id: coupleId, ...patch, updated_at: nowIso() });
      },

      deleteInvoice: (id) => {
        set((s) => ({
          invoices: s.invoices.filter((i) => i.id !== id),
          payments: s.payments.filter((p) => p.invoice_id !== id),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("finance_invoices", { id, couple_id: coupleId });
      },

      setInvoiceStatus: (id, status) => {
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, status, updated_at: nowIso() } : i,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("finance_invoices", { id, couple_id: coupleId, status, updated_at: nowIso() });
      },

      bulkSetInvoiceStatus: (ids, status) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            ids.includes(i.id) ? { ...i, status, updated_at: nowIso() } : i,
          ),
        })),

      // ── Payments ──────────────────────────────────────────────────────
      addPayment: (invoice_id, amount_cents, payment_method, notes, paid_date) => {
        const row: FinancePayment = {
          id: uid("pay"),
          invoice_id,
          amount_cents,
          paid_date: paid_date ?? todayIso(),
          payment_method,
          notes: notes ?? null,
          created_at: nowIso(),
        };
        set((s) => ({ payments: [row, ...s.payments] }));
        return row;
      },

      markInvoicePaid: (invoice_id, opts) => {
        const invoice = get().invoices.find((i) => i.id === invoice_id);
        if (!invoice) return;
        get().addPayment(
          invoice_id,
          invoice.amount_cents,
          opts?.payment_method ?? "other",
          opts?.notes,
        );
        get().setInvoiceStatus(invoice_id, "paid");
      },

      // ── Contributors ──────────────────────────────────────────────────
      addContributor: (input) => {
        const row: FinanceContributor = {
          id: uid("ctb"),
          wedding_id: DEFAULT_WEDDING_ID,
          name: input.name,
          relationship: input.relationship,
          pledged_cents: input.pledged_cents,
          paid_cents: input.paid_cents ?? 0,
          visibility_scope: input.visibility_scope ?? "all",
          notes: input.notes ?? null,
          created_at: nowIso(),
        };
        set((s) => ({ contributors: [row, ...s.contributors] }));
        return row;
      },

      updateContributor: (id, patch) =>
        set((s) => ({
          contributors: s.contributors.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteContributor: (id) =>
        set((s) => ({
          contributors: s.contributors.filter((c) => c.id !== id),
          allocations: s.allocations.filter((a) => a.contributor_id !== id),
          transactions: s.transactions.map((t) =>
            t.payer_contributor_id === id
              ? { ...t, payer_contributor_id: null }
              : t,
          ),
        })),

      // ── Allocations ───────────────────────────────────────────────────
      addAllocation: (input) => {
        const row: FinanceContributorAllocation = {
          id: uid("alo"),
          contributor_id: input.contributor_id,
          category_id: input.category_id ?? null,
          invoice_id: input.invoice_id ?? null,
          amount_cents: input.amount_cents,
          note: input.note ?? null,
        };
        set((s) => ({ allocations: [...s.allocations, row] }));
        return row;
      },

      deleteAllocation: (id) =>
        set((s) => ({ allocations: s.allocations.filter((a) => a.id !== id) })),

      allocationsFor: (contributor_id) =>
        get().allocations.filter((a) => a.contributor_id === contributor_id),

      // ── Transactions ──────────────────────────────────────────────────
      addTransaction: (input) => {
        const row: FinanceTransaction = {
          id: uid("txn"),
          wedding_id: DEFAULT_WEDDING_ID,
          date: input.date,
          description: input.description,
          amount_cents: input.amount_cents,
          account_last4: input.account_last4 ?? null,
          category_id: input.category_id ?? null,
          event_splits: input.event_splits ?? [],
          payer_contributor_id: input.payer_contributor_id ?? null,
          invoice_id: input.invoice_id ?? null,
          fund_source: input.fund_source ?? "shared",
          notes: input.notes ?? null,
          receipt_url: input.receipt_url ?? null,
          receipt_filename: input.receipt_filename ?? null,
          source: input.source ?? "manual",
          dedupe_hash: transactionDedupeHash(
            input.date,
            input.amount_cents,
            input.description,
          ),
          created_at: nowIso(),
        };
        set((s) => ({ transactions: [row, ...s.transactions] }));
        const _coupTxn = getCurrentCoupleId();
        if (_coupTxn) dbUpsert("finance_transactions", { ...row, couple_id: _coupTxn, event_splits: row.event_splits ?? [] });
        return row;
      },

      addTransactionsBulk: (inputs) => {
        const rows: FinanceTransaction[] = inputs.map((input) => ({
          id: uid("txn"),
          wedding_id: DEFAULT_WEDDING_ID,
          date: input.date,
          description: input.description,
          amount_cents: input.amount_cents,
          account_last4: input.account_last4 ?? null,
          category_id: input.category_id ?? null,
          event_splits: input.event_splits ?? [],
          payer_contributor_id: input.payer_contributor_id ?? null,
          invoice_id: input.invoice_id ?? null,
          fund_source: input.fund_source ?? "shared",
          notes: input.notes ?? null,
          receipt_url: input.receipt_url ?? null,
          receipt_filename: input.receipt_filename ?? null,
          source: input.source ?? "manual",
          dedupe_hash: transactionDedupeHash(
            input.date,
            input.amount_cents,
            input.description,
          ),
          created_at: nowIso(),
        }));
        set((s) => ({ transactions: [...rows, ...s.transactions] }));
        return rows;
      },

      updateTransaction: (id, patch) => {
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  dedupe_hash:
                    patch.date != null ||
                    patch.amount_cents != null ||
                    patch.description != null
                      ? transactionDedupeHash(
                          patch.date ?? t.date,
                          patch.amount_cents ?? t.amount_cents,
                          patch.description ?? t.description,
                        )
                      : t.dedupe_hash,
                }
              : t,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("finance_transactions", { id, couple_id: coupleId, ...patch });
      },

      deleteTransaction: (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("finance_transactions", { id, couple_id: coupleId });
      },

      bulkUpdateTransactions: (ids, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            ids.includes(t.id) ? { ...t, ...patch } : t,
          ),
        })),

      bulkSetEventTag: (ids, event_id) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            ids.includes(t.id)
              ? {
                  ...t,
                  event_splits: event_id
                    ? [{ event_id, amount_cents: t.amount_cents }]
                    : [],
                }
              : t,
          ),
        })),

      findDuplicateOf: (draft) => {
        const hash = transactionDedupeHash(
          draft.date,
          draft.amount_cents,
          draft.description,
        );
        return (
          get().transactions.find((t) => t.dedupe_hash === hash) ?? null
        );
      },

      // ── Invoice milestones ────────────────────────────────────────────
      milestonesFor: (invoice_id) =>
        get()
          .invoiceMilestones.filter((m) => m.invoice_id === invoice_id)
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order),

      addMilestone: (input) => {
        const existing = get().invoiceMilestones.filter(
          (m) => m.invoice_id === input.invoice_id,
        );
        const nextOrder =
          existing.reduce((m, x) => Math.max(m, x.sort_order), -1) + 1;
        const row: FinanceInvoiceMilestone = {
          id: uid("ms"),
          invoice_id: input.invoice_id,
          name: input.name.trim(),
          amount_cents: input.amount_cents,
          due_date: input.due_date,
          status: input.status ?? "unpaid",
          paid_date: null,
          payment_method: null,
          payment_reference: null,
          transaction_id: null,
          sort_order: nextOrder,
          created_at: nowIso(),
        };
        set((s) => ({ invoiceMilestones: [...s.invoiceMilestones, row] }));
        get().logActivity(
          input.invoice_id,
          "milestone_added",
          `Added milestone '${row.name}' — ${(row.amount_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
        );
        get().recomputeInvoiceStatus(input.invoice_id);
        return row;
      },

      updateMilestone: (id, patch) => {
        const before = get().invoiceMilestones.find((m) => m.id === id);
        set((s) => ({
          invoiceMilestones: s.invoiceMilestones.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        }));
        if (before) get().recomputeInvoiceStatus(before.invoice_id);
      },

      deleteMilestone: (id) => {
        const before = get().invoiceMilestones.find((m) => m.id === id);
        set((s) => ({
          invoiceMilestones: s.invoiceMilestones.filter((m) => m.id !== id),
        }));
        if (before) {
          get().logActivity(
            before.invoice_id,
            "milestone_deleted",
            `Removed milestone '${before.name}'`,
          );
          get().recomputeInvoiceStatus(before.invoice_id);
        }
      },

      markMilestonePaid: (id, opts) => {
        const ms = get().invoiceMilestones.find((m) => m.id === id);
        if (!ms) return;
        const paid_date = opts?.paid_date ?? todayIso();
        set((s) => ({
          invoiceMilestones: s.invoiceMilestones.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "paid",
                  paid_date,
                  payment_method: opts?.payment_method ?? m.payment_method,
                  payment_reference:
                    opts?.payment_reference ?? m.payment_reference,
                  transaction_id: opts?.transaction_id ?? m.transaction_id,
                }
              : m,
          ),
        }));
        get().logActivity(
          ms.invoice_id,
          "milestone_paid",
          `Marked '${ms.name}' as paid — ${(ms.amount_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
        );
        get().recomputeInvoiceStatus(ms.invoice_id);
      },

      // Re-derive an invoice's overall status from its milestones. Rules:
      //   no milestones → leave status as-is (manual control)
      //   any overdue milestone → overdue
      //   all paid → paid
      //   some paid → partially_paid
      //   none paid, none overdue → leave status as-is
      recomputeInvoiceStatus: (invoice_id) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === invoice_id);
        if (!inv) return;
        const ms = state.invoiceMilestones.filter(
          (m) => m.invoice_id === invoice_id,
        );
        if (ms.length === 0) return;
        const today = todayIso();
        const allPaid = ms.every((m) => m.status === "paid");
        const anyPaid = ms.some((m) => m.status === "paid");
        const anyOverdue = ms.some(
          (m) => m.status !== "paid" && m.due_date < today,
        );
        let next: FinanceInvoiceStatus = inv.status;
        if (allPaid) next = "paid";
        else if (anyOverdue) next = "overdue";
        else if (anyPaid) next = "partially_paid";
        if (next !== inv.status) {
          set((s) => ({
            invoices: s.invoices.map((i) =>
              i.id === invoice_id
                ? { ...i, status: next, updated_at: nowIso() }
                : i,
            ),
          }));
          get().logActivity(
            invoice_id,
            "status_changed",
            `Status auto-updated to ${next.replace(/_/g, " ")}`,
          );
        }
      },

      // ── Invoice comments ──────────────────────────────────────────────
      commentsFor: (invoice_id) =>
        get()
          .invoiceComments.filter((c) => c.invoice_id === invoice_id)
          .slice()
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.created_at.localeCompare(a.created_at);
          }),

      addComment: (invoice_id, body, author_name) => {
        const row: FinanceInvoiceComment = {
          id: uid("cmt"),
          invoice_id,
          author_name: author_name || "You",
          body: body.trim(),
          pinned: false,
          created_at: nowIso(),
        };
        set((s) => ({ invoiceComments: [row, ...s.invoiceComments] }));
        get().logActivity(
          invoice_id,
          "comment_added",
          `${row.author_name} added a comment`,
          row.author_name,
        );
        return row;
      },

      toggleCommentPin: (id) =>
        set((s) => ({
          invoiceComments: s.invoiceComments.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c,
          ),
        })),

      deleteComment: (id) =>
        set((s) => ({
          invoiceComments: s.invoiceComments.filter((c) => c.id !== id),
        })),

      // ── Invoice activity ──────────────────────────────────────────────
      activityFor: (invoice_id) =>
        get()
          .invoiceActivity.filter((a) => a.invoice_id === invoice_id)
          .slice()
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      logActivity: (invoice_id, kind, message, actor_name = null) => {
        const row: FinanceInvoiceActivity = {
          id: uid("act"),
          invoice_id,
          kind,
          message,
          actor_name,
          created_at: nowIso(),
        };
        set((s) => ({ invoiceActivity: [row, ...s.invoiceActivity] }));
      },

      // ── Onboarding ────────────────────────────────────────────────────
      setOnboarding: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            onboarding: { ...s.settings.onboarding, ...patch },
            updated_at: nowIso(),
          },
        })),

      completeOnboarding: () =>
        set((s) => ({
          settings: {
            ...s.settings,
            onboarding: {
              ...s.settings.onboarding,
              completed: true,
              completed_at: nowIso(),
            },
            updated_at: nowIso(),
          },
        })),

      resetOnboarding: () =>
        set((s) => ({
          settings: {
            ...s.settings,
            onboarding: {
              completed: false,
              split_model: null,
              has_total_budget: s.settings.total_budget_cents > 0,
              track_personal: null,
              category_responsibility_notes: [],
              completed_at: null,
            },
            updated_at: nowIso(),
          },
        })),

      // ── DB sync ───────────────────────────────────────────────────────
      loadFromDB: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId) return;
        try {
        const [invoiceRows, txnRows, catRows, settingRows] = await Promise.all([
          dbLoadAll("finance_invoices", coupleId),
          dbLoadAll("finance_transactions", coupleId),
          dbLoadAll("finance_categories", coupleId),
          dbLoadAll("finance_settings", coupleId),
        ]);
        set((s) => {
          const mergedInvoices =
            invoiceRows.length > 0
              ? (() => {
                  const dbIds = new Set(invoiceRows.map((r) => r.id as string));
                  const base = s.invoices.map((i) => {
                    const row = invoiceRows.find((r) => r.id === i.id);
                    return row ? { ...i, ...(row as Partial<typeof i>) } : i;
                  });
                  const fresh = invoiceRows.filter((r) => !s.invoices.some((i) => i.id === r.id));
                  void dbIds;
                  return [...base, ...(fresh as unknown as typeof s.invoices)];
                })()
              : s.invoices;

          const mergedTxns =
            txnRows.length > 0
              ? (() => {
                  const base = s.transactions.map((t) => {
                    const row = txnRows.find((r) => r.id === t.id);
                    return row ? { ...t, ...(row as Partial<typeof t>) } : t;
                  });
                  const fresh = txnRows.filter((r) => !s.transactions.some((t) => t.id === r.id));
                  return [...base, ...(fresh as unknown as typeof s.transactions)];
                })()
              : s.transactions;

          const mergedCats =
            catRows.length > 0
              ? (() => {
                  const base = s.categories.map((c) => {
                    const row = catRows.find((r) => r.id === c.id);
                    return row ? { ...c, ...(row as Partial<typeof c>) } : c;
                  });
                  const fresh = catRows.filter((r) => !s.categories.some((c) => c.id === r.id));
                  return [...base, ...(fresh as unknown as typeof s.categories)];
                })()
              : s.categories;

          const mergedSettings =
            settingRows.length > 0
              ? { ...s.settings, ...(settingRows[0] as Partial<typeof s.settings>) }
              : s.settings;

          return {
            invoices: mergedInvoices,
            transactions: mergedTxns,
            categories: mergedCats,
            settings: mergedSettings,
          };
        });
        } catch { /* Silently fall back to persisted/seed data */ }
      },

      // ── API-backed init (alternative to loadFromDB for browser context) ──
      // Fetches all finance data via the REST API layer rather than direct DB.
      // Used on app boot when a couple_id is available in auth state.
      initFromAPI: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId || typeof window === "undefined") return;
        try {
          const res = await fetch(`/api/finance/data?couple_id=${encodeURIComponent(coupleId)}`);
          if (!res.ok) return;
          const json = await res.json();
          const { invoices = [], transactions = [], categories = [], settings } = json;
          if (!invoices.length && !transactions.length && !categories.length && !settings) return;
          set((s) => ({
            invoices: invoices.length > 0 ? invoices : s.invoices,
            transactions: transactions.length > 0 ? transactions : s.transactions,
            categories: categories.length > 0 ? categories : s.categories,
            settings: settings ? { ...s.settings, ...settings } : s.settings,
          }));
        } catch {
          // Silently fall back to persisted/seed data
        }
      },

      // ── Reset ─────────────────────────────────────────────────────────
      resetToSeed: () =>
        set({
          categories: SEED_FINANCE_CATEGORIES,
          events: SEED_FINANCE_EVENTS,
          budgets: SEED_FINANCE_BUDGETS,
          invoices: SEED_FINANCE_INVOICES,
          invoiceMilestones: SEED_FINANCE_INVOICE_MILESTONES,
          invoiceComments: SEED_FINANCE_INVOICE_COMMENTS,
          invoiceActivity: SEED_FINANCE_INVOICE_ACTIVITY,
          payments: SEED_FINANCE_PAYMENTS,
          contributors: SEED_FINANCE_CONTRIBUTORS,
          allocations: SEED_FINANCE_CONTRIBUTOR_ALLOCATIONS,
          transactions: SEED_FINANCE_TRANSACTIONS,
          presets: SEED_FINANCE_PRESETS,
          settings: SEED_FINANCE_SETTINGS,
        }),
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 3,
      migrate: (persisted, version) => {
        let next = persisted as unknown;
        if (version < 2) next = migrateV1ToV2(next);
        if (version < 3) next = migrateV2ToV3(next);
        return next;
      },
    },
  ),
);
