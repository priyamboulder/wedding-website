// ── Finance derived selectors ─────────────────────────────────────────────
// Derived data the UI needs: total summary, per-category/per-event rollup,
// upcoming payments, and decision items. All take store slices as arguments
// so they can be memoized at the hook level.

import type {
  FinanceBudget,
  FinanceCategory,
  FinanceCategoryId,
  FinanceCategoryRollup,
  FinanceContributor,
  FinanceContributorAllocation,
  FinanceEvent,
  FinanceEventRollup,
  FinanceInvoice,
  FinancePayment,
  FinanceSummary,
  FinanceTransaction,
} from "@/types/finance";

const COMMITTED_STATUSES = new Set(["approved", "paid", "overdue"]);
const PENDING_STATUSES = new Set(["approved", "overdue", "awaiting_approval"]);

export function computeFinanceSummary(
  budgets: FinanceBudget[],
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  now: Date = new Date(),
): FinanceSummary {
  const totalBudget = budgets.reduce((s, b) => s + b.allocated_cents, 0);
  const committed = invoices
    .filter((i) => COMMITTED_STATUSES.has(i.status))
    .reduce((s, i) => s + i.amount_cents, 0);
  const paid = payments.reduce((s, p) => s + p.amount_cents, 0);

  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const upcoming = invoices
    .filter((i) => PENDING_STATUSES.has(i.status))
    .filter((i) => {
      const d = new Date(i.due_date);
      return d >= now && d <= in30;
    })
    .reduce((s, i) => s + i.amount_cents, 0);

  return { totalBudget, committed, paid, upcoming };
}

export function computeRollups(
  budgets: FinanceBudget[],
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  categoryIds: FinanceCategoryId[],
  transactions: FinanceTransaction[] = [],
): FinanceCategoryRollup[] {
  const totalAllocated = budgets.reduce((s, b) => s + b.allocated_cents, 0);
  const paidByInvoice = new Map<string, number>();
  for (const p of payments) {
    paidByInvoice.set(
      p.invoice_id,
      (paidByInvoice.get(p.invoice_id) ?? 0) + p.amount_cents,
    );
  }

  return categoryIds.map((cid) => {
    const budget = budgets.find((b) => b.category_id === cid);
    const catInvoices = invoices.filter((i) => i.category_id === cid);
    const allocated = budget?.allocated_cents ?? 0;
    const quoted = catInvoices.reduce((s, i) => s + i.amount_cents, 0);
    const committed = catInvoices
      .filter((i) => COMMITTED_STATUSES.has(i.status))
      .reduce((s, i) => s + i.amount_cents, 0);
    const paid = catInvoices.reduce(
      (s, i) => s + (paidByInvoice.get(i.id) ?? 0),
      0,
    );
    const transacted = transactions
      .filter((t) => t.category_id === cid)
      .reduce((s, t) => s + t.amount_cents, 0);
    return {
      category_id: cid,
      allocated_cents: allocated,
      quoted_cents: quoted,
      committed_cents: committed,
      paid_cents: paid,
      transacted_cents: transacted,
      remaining_cents: allocated - committed,
      pct_of_total: totalAllocated > 0 ? allocated / totalAllocated : 0,
    };
  });
}

// ── Event rollups ─────────────────────────────────────────────────────────
// A single line item (invoice/transaction) can be tagged to multiple events
// with per-event split amounts. Splits sum to the parent amount so totals
// roll up without double counting. Un-tagged items are excluded from events.

export function computeEventRollups(
  events: FinanceEvent[],
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  transactions: FinanceTransaction[],
): FinanceEventRollup[] {
  const paidByInvoice = new Map<string, number>();
  for (const p of payments) {
    paidByInvoice.set(
      p.invoice_id,
      (paidByInvoice.get(p.invoice_id) ?? 0) + p.amount_cents,
    );
  }
  return events.map((e) => {
    let quoted = 0;
    let committed = 0;
    let paid = 0;
    for (const inv of invoices) {
      const split = inv.event_splits.find((x) => x.event_id === e.id);
      if (!split) continue;
      quoted += split.amount_cents;
      if (COMMITTED_STATUSES.has(inv.status)) committed += split.amount_cents;
      const totalPaid = paidByInvoice.get(inv.id) ?? 0;
      if (inv.amount_cents > 0) {
        // Pro-rate payments across the same splits the invoice declared.
        paid += Math.round(
          (totalPaid * split.amount_cents) / inv.amount_cents,
        );
      }
    }
    let transacted = 0;
    for (const t of transactions) {
      const split = t.event_splits.find((x) => x.event_id === e.id);
      if (split) transacted += split.amount_cents;
    }
    return {
      event_id: e.id,
      allocated_cents: e.allocated_cents,
      quoted_cents: quoted,
      committed_cents: committed,
      paid_cents: paid,
      transacted_cents: transacted,
      remaining_cents: e.allocated_cents - committed,
    };
  });
}

// ── Per-category × per-event matrix for the expanded By-Event row ─────────

export function computeEventCategoryBreakdown(
  eventId: string,
  invoices: FinanceInvoice[],
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
): Array<{
  category_id: FinanceCategoryId;
  category_name: string;
  color_class: string;
  quoted_cents: number;
  transacted_cents: number;
}> {
  const rows = new Map<
    FinanceCategoryId,
    { quoted: number; transacted: number }
  >();
  for (const inv of invoices) {
    const split = inv.event_splits.find((x) => x.event_id === eventId);
    if (!split) continue;
    const entry = rows.get(inv.category_id) ?? { quoted: 0, transacted: 0 };
    entry.quoted += split.amount_cents;
    rows.set(inv.category_id, entry);
  }
  for (const t of transactions) {
    const split = t.event_splits.find((x) => x.event_id === eventId);
    if (!split || !t.category_id) continue;
    const entry = rows.get(t.category_id) ?? { quoted: 0, transacted: 0 };
    entry.transacted += split.amount_cents;
    rows.set(t.category_id, entry);
  }
  return Array.from(rows.entries()).map(([cid, v]) => {
    const cat = categories.find((c) => c.id === cid);
    return {
      category_id: cid,
      category_name: cat?.name ?? "Uncategorized",
      color_class: cat?.color_class ?? "bg-ink-faint",
      quoted_cents: v.quoted,
      transacted_cents: v.transacted,
    };
  });
}

// ── Decision-like items for the Overview ──────────────────────────────────

export type FinanceDecisionKind =
  | "overdue_invoice"
  | "upcoming_due"
  | "over_budget"
  | "uncommitted_transaction";

export interface FinanceDecision {
  id: string;
  kind: FinanceDecisionKind;
  title: string;
  subtitle: string;
  amount_cents: number;
  due_date?: string;
  category_id?: FinanceCategoryId;
  invoice_id?: string;
}

export function computeDecisions(
  budgets: FinanceBudget[],
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  rollups: FinanceCategoryRollup[],
  now: Date = new Date(),
): FinanceDecision[] {
  const out: FinanceDecision[] = [];

  for (const i of invoices) {
    if (i.status === "overdue") {
      out.push({
        id: `dec_overdue_${i.id}`,
        kind: "overdue_invoice",
        title: `${i.vendor_name_fallback ?? "Invoice"} — overdue`,
        subtitle: `${i.invoice_number ?? "No invoice #"} · due ${i.due_date}`,
        amount_cents: i.amount_cents,
        due_date: i.due_date,
        category_id: i.category_id,
        invoice_id: i.id,
      });
    }
  }

  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);
  for (const i of invoices) {
    if (i.status === "paid" || i.status === "draft") continue;
    const due = new Date(i.due_date);
    if (due >= now && due <= in7) {
      out.push({
        id: `dec_upcoming_${i.id}`,
        kind: "upcoming_due",
        title: `${i.vendor_name_fallback ?? "Invoice"} — due soon`,
        subtitle: `Due ${i.due_date} · ${i.category_id}`,
        amount_cents: i.amount_cents,
        due_date: i.due_date,
        category_id: i.category_id,
        invoice_id: i.id,
      });
    }
  }

  for (const r of rollups) {
    if (r.allocated_cents > 0 && r.committed_cents > r.allocated_cents) {
      out.push({
        id: `dec_over_${r.category_id}`,
        kind: "over_budget",
        title: `${r.category_id} — over budget`,
        subtitle: `Committed exceeds allocation by ${r.committed_cents - r.allocated_cents} cents`,
        amount_cents: r.committed_cents - r.allocated_cents,
        category_id: r.category_id,
      });
    }
  }

  const order: Record<FinanceDecisionKind, number> = {
    overdue_invoice: 0,
    upcoming_due: 1,
    over_budget: 2,
    uncommitted_transaction: 3,
  };
  out.sort((a, b) => order[a.kind] - order[b.kind]);
  return out;
}

// ── Payment-schedule helpers ──────────────────────────────────────────────

export interface WeekPaymentGroup {
  weekStart: string;
  items: FinanceInvoice[];
  total_cents: number;
}

export function groupInvoicesByWeek(
  invoices: FinanceInvoice[],
): WeekPaymentGroup[] {
  const byWeek = new Map<string, FinanceInvoice[]>();
  for (const i of invoices) {
    const d = new Date(i.due_date);
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - d.getDay());
    const key = sunday.toISOString().slice(0, 10);
    const arr = byWeek.get(key) ?? [];
    arr.push(i);
    byWeek.set(key, arr);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, items]) => ({
      weekStart,
      items: items.sort((a, b) => a.due_date.localeCompare(b.due_date)),
      total_cents: items.reduce((s, i) => s + i.amount_cents, 0),
    }));
}

// ── 90-day outflow buckets ────────────────────────────────────────────────

export interface OutflowBucket {
  monthKey: string;
  label: string;
  total_cents: number;
}

export function computeOutflow90Days(
  invoices: FinanceInvoice[],
  now: Date = new Date(),
): OutflowBucket[] {
  const end = new Date(now);
  end.setDate(end.getDate() + 90);
  const MONTH_LABEL = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const buckets: OutflowBucket[] = [];
  const seen = new Set<string>();

  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 0; i < 4; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    if (!seen.has(key)) {
      seen.add(key);
      buckets.push({
        monthKey: key,
        label: MONTH_LABEL[cursor.getMonth()]!,
        total_cents: 0,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const inv of invoices) {
    if (inv.status === "paid" || inv.status === "draft") continue;
    const d = new Date(inv.due_date);
    if (d < now || d > end) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.find((b) => b.monthKey === key);
    if (bucket) bucket.total_cents += inv.amount_cents;
  }
  return buckets;
}

// ── Contributor helpers ───────────────────────────────────────────────────

export interface ContributorRow extends FinanceContributor {
  remaining_cents: number;
  funded_cents: number;
  // Transactions where this contributor is listed as the payer, summed
  // across all fund sources. Kept for back-compat; prefer the
  // shared/personal breakdown below.
  transaction_total_cents: number;
  // Sum of payer transactions tagged fund_source = "shared".
  shared_spent_cents: number;
  // Sum of payer transactions tagged fund_source = "personal".
  personal_spent_cents: number;
  // Combined wedding-related spend (shared paid into the fund + their own
  // personal wedding expenses). Used for the "total wedding spend" cell.
  total_spend_cents: number;
  transactions_count: number;
  personal_transactions_count: number;
  allocations_count: number;
}

export function computeContributorRows(
  contributors: FinanceContributor[],
  allocations: FinanceContributorAllocation[],
  transactions: FinanceTransaction[] = [],
): ContributorRow[] {
  return contributors.map((c) => {
    const mine = allocations.filter((a) => a.contributor_id === c.id);
    const funded = mine.reduce((s, a) => s + a.amount_cents, 0);
    const myTxns = transactions.filter((t) => t.payer_contributor_id === c.id);
    const transacted = myTxns.reduce((s, t) => s + t.amount_cents, 0);
    const shared = myTxns
      .filter((t) => t.fund_source !== "personal")
      .reduce((s, t) => s + t.amount_cents, 0);
    const personal = myTxns
      .filter((t) => t.fund_source === "personal")
      .reduce((s, t) => s + t.amount_cents, 0);
    return {
      ...c,
      funded_cents: funded,
      remaining_cents: c.pledged_cents - c.paid_cents,
      transaction_total_cents: transacted,
      shared_spent_cents: shared,
      personal_spent_cents: personal,
      // Total wedding spend = what they put into the shared fund + their own
      // personal wedding expenses. Use paid_cents (their pledge progress)
      // for the shared side rather than raw transactions to avoid double
      // counting when the same payment is logged as both contributor.paid_cents
      // and a transaction row.
      total_spend_cents: c.paid_cents + personal,
      transactions_count: myTxns.length,
      personal_transactions_count: myTxns.filter(
        (t) => t.fund_source === "personal",
      ).length,
      allocations_count: mine.length,
    };
  });
}
