// ── Finance data model ─────────────────────────────────────────────────────
// Shape mirrors the eventual Supabase tables, but everything persists in
// localStorage via Zustand today (see stores/finance-store.ts). Monetary
// values are always integer cents (USD) — format at the view layer only.
//
// In v2 (this pass) we added:
//   • First-class FinanceCategory records (default + custom, hideable)
//   • FinanceEvent records (Haldi, Sangeet, Ceremony, …) for event-based
//     budgeting and invoice/transaction tagging
//   • FinanceTransaction ledger with multi-event split tagging
//   • AllocationPreset for saved percentage templates
//
// Legacy compatibility: category_id on Invoice/Contributor/Allocation stays
// a string — default cats keep the workspace slugs ("venue", "catering", …)
// so existing seed data loads unchanged.

import type { WorkspaceCategorySlug } from "./workspace";

// A category id is either a default workspace slug or a locally-generated
// `cat_…` string for a couple-created custom category.
export type FinanceCategoryId = string;

export const DEFAULT_CATEGORY_SLUGS: WorkspaceCategorySlug[] = [
  "venue",
  "catering",
  "decor_florals",
  "photography",
  "videography",
  "entertainment",
  "hmua",
  "wardrobe",
  "stationery",
  "mehndi",
  "transportation",
  "pandit_ceremony",
];

// ── finance_categories ─────────────────────────────────────────────────────
// One row per category. Default categories are seeded with fixed ids matching
// the workspace slugs so invoices/allocations keyed to them keep working.
// Custom categories get ids like `cat_xyz123`. Default categories cannot be
// deleted — only `hidden` — so the workspace sidebar stays coherent.
export interface FinanceCategory {
  id: FinanceCategoryId;
  wedding_id: string;
  name: string;
  // Tailwind bg-* class for the color dot. Limited to the Ananya palette.
  color_class: string;
  is_default: boolean;
  hidden: boolean;
  sort_order: number;
  created_at: string;
}

// Palette the category color-dot picker exposes. Key = user-facing label.
export const FINANCE_COLOR_SWATCHES: Array<{ label: string; class: string }> = [
  { label: "Ink", class: "bg-ink" },
  { label: "Ink soft", class: "bg-ink-soft" },
  { label: "Ink muted", class: "bg-ink-muted" },
  { label: "Saffron", class: "bg-saffron" },
  { label: "Gold", class: "bg-gold" },
  { label: "Gold light", class: "bg-gold-light" },
  { label: "Rose", class: "bg-rose" },
  { label: "Rose light", class: "bg-rose-light" },
  { label: "Sage", class: "bg-sage" },
  { label: "Sage light", class: "bg-sage-light" },
  { label: "Amber", class: "bg-amber-500" },
  { label: "Stone", class: "bg-stone-400" },
];

// ── finance_budgets ────────────────────────────────────────────────────────
// One row per (wedding_id, category_id). `allocated_cents` is what the
// couple plans to spend on this category.
export interface FinanceBudget {
  wedding_id: string;
  category_id: FinanceCategoryId;
  allocated_cents: number;
  notes: string | null;
  updated_at: string;
}

// ── finance_events ─────────────────────────────────────────────────────────
// Indian wedding event (Haldi, Mehendi, Sangeet, Ceremony, Reception, …)
// used for event-based budget rollups and tagging invoices/transactions.
export interface FinanceEvent {
  id: string;
  wedding_id: string;
  name: string;
  // ISO yyyy-mm-dd, optional — the timeline hasn't been integrated yet so
  // events can exist without dates.
  date: string | null;
  sort_order: number;
  allocated_cents: number;
  created_at: string;
}

// ── finance_payments (declared early so milestones can reference method) ──
export type FinancePaymentMethod =
  | "ach"
  | "wire"
  | "check"
  | "credit_card"
  | "zelle"
  | "cash"
  | "other";

// ── finance_invoices ───────────────────────────────────────────────────────
export type FinanceInvoiceStatus =
  | "draft"
  | "awaiting_approval"
  | "approved"
  | "paid"
  | "partially_paid"
  | "overdue";

export interface FinanceInvoice {
  id: string;
  wedding_id: string;
  vendor_id: string | null;
  vendor_name_fallback: string | null;
  category_id: FinanceCategoryId;
  // Event tags with per-event split. Sum of splits must equal amount_cents.
  // Optional — omit for invoices that aren't event-bound.
  event_splits: Array<{ event_id: string; amount_cents: number }>;
  invoice_number: string | null;
  amount_cents: number;
  due_date: string; // ISO yyyy-mm-dd
  status: FinanceInvoiceStatus;
  pdf_url: string | null;
  pdf_filename: string | null;
  notes: string | null;
  extracted_data_jsonb: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ── finance_invoice_milestones ─────────────────────────────────────────────
// Vendor invoices typically split into 2–4 installments (signing deposit,
// midpoint, final balance). Each milestone tracks its own due/paid state and
// can link back to the matching transaction once paid.
export type MilestoneStatus = "unpaid" | "paid" | "overdue";

export interface FinanceInvoiceMilestone {
  id: string;
  invoice_id: string;
  name: string; // e.g. "Signing deposit", "Final balance"
  amount_cents: number;
  due_date: string; // ISO yyyy-mm-dd
  status: MilestoneStatus;
  paid_date: string | null; // ISO yyyy-mm-dd
  payment_method: FinancePaymentMethod | null;
  payment_reference: string | null;
  transaction_id: string | null;
  sort_order: number;
  created_at: string;
}

// ── finance_invoice_comments ───────────────────────────────────────────────
// Threaded notes on an invoice. Pin-able for important info.
export interface FinanceInvoiceComment {
  id: string;
  invoice_id: string;
  author_name: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

// ── finance_invoice_activity ───────────────────────────────────────────────
// Auto-generated log of state changes on an invoice.
export type ActivityKind =
  | "invoice_created"
  | "invoice_uploaded"
  | "milestone_added"
  | "milestone_paid"
  | "milestone_deleted"
  | "comment_added"
  | "status_changed"
  | "edited";

export interface FinanceInvoiceActivity {
  id: string;
  invoice_id: string;
  kind: ActivityKind;
  message: string;
  actor_name: string | null;
  created_at: string;
}

// ── finance_payments ───────────────────────────────────────────────────────
export interface FinancePayment {
  id: string;
  invoice_id: string;
  amount_cents: number;
  paid_date: string; // ISO yyyy-mm-dd
  payment_method: FinancePaymentMethod;
  notes: string | null;
  created_at: string;
}

// ── finance_contributors ───────────────────────────────────────────────────
export type ContributorVisibilityScope = "all" | "self" | "named_categories";

export interface FinanceContributor {
  id: string;
  wedding_id: string;
  name: string;
  relationship: string;
  pledged_cents: number;
  paid_cents: number;
  visibility_scope: ContributorVisibilityScope;
  notes: string | null;
  created_at: string;
}

export interface FinanceContributorAllocation {
  id: string;
  contributor_id: string;
  category_id: FinanceCategoryId | null;
  invoice_id: string | null;
  amount_cents: number;
  note: string | null;
}

// ── finance_transactions ───────────────────────────────────────────────────
// Bank-statement ledger. Either manually entered or imported via PDF/CSV
// upload. `source` tags the origin so we can re-run parsing if needed.
export type TransactionSource = "manual" | "csv_import" | "pdf_import";

// Where the money came from. Shared = the pooled wedding fund (counts toward
// joint budget). Personal = the payer's own money on a wedding-adjacent
// expense (outfits, jewelry, grooming) that does NOT draw down the budget.
export type FundSource = "shared" | "personal";

export interface FinanceTransaction {
  id: string;
  wedding_id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  // Positive cents for money-out (the common case). Signed so credits /
  // refunds can be stored as negatives.
  amount_cents: number;
  account_last4: string | null;
  category_id: FinanceCategoryId | null;
  // Per-event split; sums to amount_cents when present. Allows one
  // merchant line (e.g. florist) to span multiple events without double-
  // counting the totals.
  event_splits: Array<{ event_id: string; amount_cents: number }>;
  payer_contributor_id: string | null;
  invoice_id: string | null;
  // Whether this expense came from the shared wedding fund or the payer's
  // personal money. Defaults to "shared".
  fund_source: FundSource;
  notes: string | null;
  receipt_url: string | null;
  receipt_filename: string | null;
  source: TransactionSource;
  // Hash used for duplicate detection (date|amount|description).
  dedupe_hash: string;
  created_at: string;
}

// Shape returned by the /api/finance/parse-statement route before the user
// reviews + commits. Has suggestions, no ids yet.
export interface ParsedTransactionDraft {
  date: string;
  description: string;
  amount_cents: number;
  account_last4: string | null;
  suggested_category_id: FinanceCategoryId | null;
  suggested_event_id: string | null;
  suggested_payer_contributor_id: string | null;
  // Default suggestion is "shared"; user can flip to "personal" before commit.
  fund_source: FundSource;
  confidence: "high" | "medium" | "low";
}

// ── Allocation presets (saved templates) ───────────────────────────────────
export interface AllocationPreset {
  id: string;
  wedding_id: string;
  name: string; // e.g. "Our defaults"
  // Map of category_id → fraction (0..1). Must sum to ~1.0.
  percentages: Record<FinanceCategoryId, number>;
  is_default: boolean;
  created_at: string;
}

// Spec-provided default percentages. Key is the workspace slug.
// The original spec covered the first 12 categories; newer categories
// (jewelry, cake & sweets, gifting, travel & accommodations) default to
// 0 and expect an explicit allocation by the couple.
export const SPEC_DEFAULT_PERCENTAGES: Record<WorkspaceCategorySlug, number> = {
  venue: 0.25,
  catering: 0.23,
  decor_florals: 0.15,
  photography: 0.09,
  videography: 0.06,
  entertainment: 0.07,
  guest_experiences: 0,
  hmua: 0.04,
  wardrobe: 0.05,
  stationery: 0.02,
  mehndi: 0.01,
  transportation: 0.01,
  pandit_ceremony: 0.03,
  jewelry: 0,
  cake_sweets: 0,
  gifting: 0,
  travel_accommodations: 0,
};

// ── finance_settings ───────────────────────────────────────────────────────
// Wedding-level knobs: the total budget, active preset, onboarding state.
export type SplitModel =
  | "fifty_fifty"
  | "primary_family"
  | "by_event"
  | "couple_only"
  | "custom";

export interface FinanceOnboardingState {
  completed: boolean;
  split_model: SplitModel | null;
  has_total_budget: boolean;
  track_personal: "yes" | "no" | "some" | null;
  // Free-text capture of any "Bride's family covers Mehendi & Sangeet" rules
  // the couple jotted during the quiz. Drives no logic on its own — it's
  // surfaced on Contributor cards and used as a hint when reviewing imports.
  category_responsibility_notes: Array<{
    contributor_id: string;
    scope: string;
  }>;
  completed_at: string | null;
}

export interface FinanceSettings {
  wedding_id: string;
  total_budget_cents: number;
  active_preset_id: string | null;
  onboarding: FinanceOnboardingState;
  updated_at: string;
}

// ── Derived summary shape ──────────────────────────────────────────────────
export interface FinanceSummary {
  totalBudget: number;
  committed: number;
  paid: number;
  upcoming: number;
}

// ── Category roll-up (one row per active category in the Budget tab) ──────
export interface FinanceCategoryRollup {
  category_id: FinanceCategoryId;
  allocated_cents: number;
  quoted_cents: number;
  committed_cents: number;
  paid_cents: number;
  // Sum of transactions.amount_cents tagged to this category.
  transacted_cents: number;
  remaining_cents: number;
  pct_of_total: number;
}

// ── Event roll-up (one row per event in the Event-based view) ──────────────
export interface FinanceEventRollup {
  event_id: string;
  allocated_cents: number;
  quoted_cents: number; // sum of event-split invoices
  committed_cents: number;
  paid_cents: number;
  transacted_cents: number;
  remaining_cents: number;
}

// ── Labels / display metadata (LEGACY: default categories only) ───────────
// Kept as a fallback for code that still references the static map. New UI
// should read labels from the categories store instead.
export const FINANCE_CATEGORY_LABEL: Record<WorkspaceCategorySlug, string> = {
  photography: "Photography",
  videography: "Videography",
  catering: "Catering",
  decor_florals: "Décor & Florals",
  entertainment: "Entertainment",
  guest_experiences: "Guest Experiences",
  hmua: "HMUA",
  venue: "Venue",
  mehndi: "Mehndi",
  transportation: "Transportation",
  stationery: "Stationery",
  pandit_ceremony: "Officiant & Ceremony",
  wardrobe: "Wardrobe",
  jewelry: "Jewelry",
  cake_sweets: "Cake & Sweets",
  gifting: "Gifting",
  travel_accommodations: "Travel & Accommodations",
};

export const FINANCE_CATEGORY_TINT: Record<WorkspaceCategorySlug, string> = {
  photography: "bg-ink",
  videography: "bg-ink-soft",
  catering: "bg-saffron",
  decor_florals: "bg-rose",
  entertainment: "bg-gold",
  guest_experiences: "bg-saffron/60",
  hmua: "bg-sage",
  venue: "bg-ink-muted",
  mehndi: "bg-gold-light",
  transportation: "bg-stone-400",
  stationery: "bg-rose/70",
  pandit_ceremony: "bg-amber-500",
  wardrobe: "bg-saffron/70",
  jewelry: "bg-gold/80",
  cake_sweets: "bg-rose-light",
  gifting: "bg-sage-light",
  travel_accommodations: "bg-ink-muted/70",
};

export const INVOICE_STATUS_LABEL: Record<FinanceInvoiceStatus, string> = {
  draft: "Draft",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  paid: "Paid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
};

export const INVOICE_STATUS_TONE: Record<FinanceInvoiceStatus, string> = {
  draft: "bg-ink-faint",
  awaiting_approval: "bg-gold",
  approved: "bg-sage",
  paid: "bg-ink",
  partially_paid: "bg-saffron",
  overdue: "bg-rose",
};

export const PAYMENT_METHOD_LABEL: Record<FinancePaymentMethod, string> = {
  ach: "ACH",
  wire: "Wire",
  check: "Check",
  credit_card: "Credit card",
  zelle: "Zelle",
  cash: "Cash",
  other: "Other",
};

export const FUND_SOURCE_LABEL: Record<FundSource, string> = {
  shared: "Shared",
  personal: "Personal",
};

export const SPLIT_MODEL_LABEL: Record<SplitModel, string> = {
  fifty_fifty: "50/50 between families",
  primary_family: "One family covers most",
  by_event: "Split by event",
  couple_only: "Couple pays everything",
  custom: "Custom split",
};

export const DEFAULT_WEDDING_ID = "wedding_default";

// ── Default event list (Indian wedding) ────────────────────────────────────
// Pulled into the store on first boot. Editable in Finance settings.
export const SPEC_DEFAULT_EVENTS: Array<Pick<FinanceEvent, "name" | "sort_order">> = [
  { name: "Engagement", sort_order: 0 },
  { name: "Haldi", sort_order: 1 },
  { name: "Mehendi", sort_order: 2 },
  { name: "Sangeet", sort_order: 3 },
  { name: "Ceremony", sort_order: 4 },
  { name: "Reception", sort_order: 5 },
  { name: "Post-wedding Brunch", sort_order: 6 },
];
