"use client";

// ── Transactions view ─────────────────────────────────────────────────────
// Shown inside the Payments tab as a third view sibling to Schedule and
// Calendar. Ledger of every bank-statement transaction with upload flow:
//
//   1. Drag-drop / file-picker for PDF (bank statement) or CSV.
//   2. Server parse (PDF → Claude Haiku; CSV → local first, Claude for
//      ambiguous rows).
//   3. Review table with suggested category + event + payer — user
//      confirms or overrides, then commits.
//   4. Duplicate detection on commit — offers merge / keep both / ignore.
//   5. Ledger view with multi-select bulk tagging, filter chips, and
//      inline category/event/payer edits.

import { useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  StickyNote,
  Wallet,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  daysUntil,
  formatDateLong,
  formatDateShort,
  formatDollars,
} from "@/lib/finance/format";
import {
  buildSuggestion,
  csvRowsToDrafts,
  parseCsv,
} from "@/lib/finance/transactions";
import type {
  FinanceCategory,
  FinanceCategoryId,
  FinanceContributor,
  FinanceEvent,
  FinanceTransaction,
  FundSource,
  ParsedTransactionDraft,
  TransactionSource,
} from "@/types/finance";
import {
  CategoryChip,
  FinanceActionButton,
  FinancePanelCard,
  FinanceStatTile,
  MonoCell,
  SidePanel,
  ToggleChip,
} from "./shared";

type FundFilter = "all" | "shared" | "personal";
type DateRangeFilter = "all" | "this_month" | "last_30" | "last_90";

interface Props {
  categoryFilter: FinanceCategoryId | null;
}

export function FinanceTransactionsView({ categoryFilter }: Props) {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const events = useFinanceStore((s) => s.events);
  const contributors = useFinanceStore((s) => s.contributors);
  const invoices = useFinanceStore((s) => s.invoices);
  const deleteTxn = useFinanceStore((s) => s.deleteTransaction);
  const updateTxn = useFinanceStore((s) => s.updateTransaction);
  const bulkUpdate = useFinanceStore((s) => s.bulkUpdateTransactions);
  const bulkSetEventTag = useFinanceStore((s) => s.bulkSetEventTag);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPanel, setBulkPanel] = useState<
    null | "category" | "event" | "payer" | "fund_source"
  >(null);

  const [fundFilter, setFundFilter] = useState<FundFilter>("all");
  const [payerFilter, setPayerFilter] = useState<string>("all");
  const [catFilterLocal, setCatFilterLocal] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (categoryFilter && t.category_id !== categoryFilter) return false;
        if (catFilterLocal !== "all" && t.category_id !== catFilterLocal)
          return false;
        if (fundFilter !== "all" && t.fund_source !== fundFilter) return false;
        if (payerFilter !== "all" && t.payer_contributor_id !== payerFilter)
          return false;
        if (dateFilter !== "all") {
          const delta = daysUntil(t.date);
          if (dateFilter === "this_month" && (delta < -30 || delta > 0))
            return false;
          if (dateFilter === "last_30" && (delta < -30 || delta > 0))
            return false;
          if (dateFilter === "last_90" && (delta < -90 || delta > 0))
            return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    transactions,
    categoryFilter,
    catFilterLocal,
    fundFilter,
    payerFilter,
    dateFilter,
  ]);

  // Totals derived from the filtered set so the summary tiles reflect the
  // current view rather than the full ledger.
  const totals = useMemo(() => {
    let shared = 0;
    let personal = 0;
    for (const t of filtered) {
      if (t.fund_source === "personal") personal += t.amount_cents;
      else shared += t.amount_cents;
    }
    return { shared, personal, total: shared + personal };
  }, [filtered]);

  const allSelected =
    filtered.length > 0 && selected.size === filtered.length;
  const activeCats = categories.filter((c) => !c.hidden);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Transactions
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            {filtered.length} line item{filtered.length === 1 ? "" : "s"}
            {filtered.length !== transactions.length && (
              <span className="ml-2 text-[12px] text-ink-muted">
                of {transactions.length}
              </span>
            )}
          </h3>
        </div>
        <FinanceActionButton
          icon={<Upload size={13} strokeWidth={1.8} />}
          label="Upload statement"
          onClick={() => setUploadOpen(true)}
          primary
        />
      </div>

      {/* ── Fund-source summary tiles (drive the filter on click) ───── */}
      <section className="grid grid-cols-3 gap-3">
        <FinanceStatTile
          label="Shared fund"
          value={formatDollars(totals.shared)}
          hint="From the pooled wedding budget"
          tone="ink"
          mono
        />
        <FinanceStatTile
          label="Personal"
          value={formatDollars(totals.personal)}
          hint="Tracked but outside the budget"
          tone="gold"
          mono
        />
        <FinanceStatTile
          label="Total spend (filtered)"
          value={formatDollars(totals.total)}
          hint="Shared + personal combined"
          tone="sage"
          mono
        />
      </section>

      {/* ── Filter row ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Fund
          </span>
          {(["all", "shared", "personal"] as FundFilter[]).map((f) => (
            <ToggleChip
              key={f}
              active={fundFilter === f}
              onClick={() => setFundFilter(f)}
            >
              {f === "all" ? "All" : f}
            </ToggleChip>
          ))}
          <span
            className="ml-3 mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Date
          </span>
          {(["all", "this_month", "last_30", "last_90"] as DateRangeFilter[]).map(
            (r) => (
              <ToggleChip
                key={r}
                active={dateFilter === r}
                onClick={() => setDateFilter(r)}
              >
                {r === "all"
                  ? "All time"
                  : r === "this_month"
                    ? "This month"
                    : r === "last_30"
                      ? "Last 30d"
                      : "Last 90d"}
              </ToggleChip>
            ),
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Payer
          </span>
          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All payers</option>
            {contributors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {!categoryFilter && (
            <>
              <span
                className="ml-1 mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Category
              </span>
              <select
                value={catFilterLocal}
                onChange={(e) => setCatFilterLocal(e.target.value)}
                className="rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">All categories</option>
                {activeCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {(fundFilter !== "all" ||
            payerFilter !== "all" ||
            catFilterLocal !== "all" ||
            dateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setFundFilter("all");
                setPayerFilter("all");
                setCatFilterLocal("all");
                setDateFilter("all");
              }}
              className="ml-1 inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <X size={11} strokeWidth={1.8} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-ink/20 bg-ink/5 px-3 py-2">
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {selected.size} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <FinanceActionButton
              label="Tag fund"
              onClick={() => setBulkPanel("fund_source")}
            />
            <FinanceActionButton
              label="Tag category"
              onClick={() => setBulkPanel("category")}
            />
            <FinanceActionButton
              label="Tag event"
              onClick={() => setBulkPanel("event")}
            />
            <FinanceActionButton
              label="Tag payer"
              onClick={() => setBulkPanel("payer")}
            />
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded p-1 text-ink-muted hover:bg-ivory hover:text-ink"
              aria-label="Clear selection"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}

      <FinancePanelCard className="overflow-hidden p-0">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-8 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      allSelected ? new Set() : new Set(filtered.map((t) => t.id)),
                    )
                  }
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                  className="text-ink-faint hover:text-ink"
                >
                  {allSelected ? (
                    <CheckSquare size={13} strokeWidth={1.8} />
                  ) : (
                    <Square size={13} strokeWidth={1.8} />
                  )}
                </button>
              </th>
              <Th align="left">Date</Th>
              <Th align="left">Description</Th>
              <Th align="left">Fund</Th>
              <Th align="left">Account</Th>
              <Th align="left">Category</Th>
              <Th align="left">Event</Th>
              <Th align="left">Payer</Th>
              <Th align="left">Linked</Th>
              <Th align="left">Notes</Th>
              <Th>Amount</Th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-10 text-center text-[13px] text-ink-muted">
                  No transactions match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <LedgerRow
                key={t.id}
                transaction={t}
                categories={categories}
                events={events}
                contributors={contributors}
                invoices={invoices}
                selected={selected.has(t.id)}
                onToggle={() =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(t.id)) next.delete(t.id);
                    else next.add(t.id);
                    return next;
                  })
                }
                onChange={(patch) => updateTxn(t.id, patch)}
                onDelete={() => deleteTxn(t.id)}
              />
            ))}
          </tbody>
        </table>
      </FinancePanelCard>

      {uploadOpen && (
        <UploadStatementPanel onClose={() => setUploadOpen(false)} />
      )}

      {bulkPanel && (
        <BulkTagPanel
          kind={bulkPanel}
          ids={Array.from(selected)}
          onCommitEvent={(eventId) => {
            bulkSetEventTag(Array.from(selected), eventId);
            setBulkPanel(null);
            setSelected(new Set());
          }}
          onCommitSimple={(patch) => {
            bulkUpdate(Array.from(selected), patch);
            setBulkPanel(null);
            setSelected(new Set());
          }}
          onClose={() => setBulkPanel(null)}
        />
      )}
    </div>
  );
}

// ── Header cell ───────────────────────────────────────────────────────────

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted",
        align === "right" ? "text-right" : "text-left",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

// ── Ledger row with inline category/event/payer selects ─────────────────

function LedgerRow({
  transaction,
  categories,
  events,
  contributors,
  invoices,
  selected,
  onToggle,
  onChange,
  onDelete,
}: {
  transaction: FinanceTransaction;
  categories: FinanceCategory[];
  events: FinanceEvent[];
  contributors: FinanceContributor[];
  invoices: ReturnType<typeof useFinanceStore.getState>["invoices"];
  selected: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<FinanceTransaction>) => void;
  onDelete: () => void;
}) {
  const activeCats = categories.filter((c) => !c.hidden);
  const linkedInvoice = invoices.find((i) => i.id === transaction.invoice_id);
  const payer = contributors.find(
    (c) => c.id === transaction.payer_contributor_id,
  );
  const primaryEventId = transaction.event_splits[0]?.event_id ?? "";

  return (
    <tr
      className={cn(
        "border-b border-border/60 hover:bg-ivory/30",
        selected && "bg-gold-pale/25",
      )}
    >
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={selected ? "Deselect" : "Select"}
          className="text-ink-faint hover:text-ink"
        >
          {selected ? (
            <CheckSquare size={13} strokeWidth={1.8} />
          ) : (
            <Square size={13} strokeWidth={1.8} />
          )}
        </button>
      </td>
      <td className="px-3 py-2">
        <span
          className="font-mono text-[11.5px] tabular-nums text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDateShort(transaction.date)}
        </span>
      </td>
      <td className="px-3 py-2">
        <p className="truncate text-[12px] text-ink">
          {transaction.description}
        </p>
        {transaction.source !== "manual" && (
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {transaction.source === "pdf_import" ? "PDF" : "CSV"}
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <FundSourcePill
          value={transaction.fund_source}
          onChange={(v) => onChange({ fund_source: v })}
        />
      </td>
      <td className="px-3 py-2">
        {transaction.account_last4 && (
          <span
            className="font-mono text-[10.5px] tabular-nums text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ••{transaction.account_last4}
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <select
          value={transaction.category_id ?? ""}
          onChange={(e) =>
            onChange({ category_id: e.target.value || null })
          }
          className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
        >
          <option value="">—</option>
          {activeCats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={primaryEventId}
          onChange={(e) =>
            onChange({
              event_splits: e.target.value
                ? [
                    {
                      event_id: e.target.value,
                      amount_cents: transaction.amount_cents,
                    },
                  ]
                : [],
            })
          }
          className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
        >
          <option value="">—</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={transaction.payer_contributor_id ?? ""}
          onChange={(e) =>
            onChange({ payer_contributor_id: e.target.value || null })
          }
          className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
        >
          <option value="">—</option>
          {contributors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={transaction.invoice_id ?? ""}
          onChange={(e) =>
            onChange({ invoice_id: e.target.value || null })
          }
          className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
        >
          <option value="">—</option>
          {invoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.vendor_name_fallback ?? "Vendor"} ·{" "}
              {formatDollars(i.amount_cents)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <NotesCell
          value={transaction.notes ?? ""}
          onChange={(v) => onChange({ notes: v || null })}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <MonoCell value={formatDollars(transaction.amount_cents)} />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete transaction"
          className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

// ── Fund source pill: small toggle between Shared/Personal ──────────────
// Visual: ink-on-ivory for shared (the default), gold-tinted for personal so
// it stands out at a glance when scanning the ledger.

function FundSourcePill({
  value,
  onChange,
}: {
  value: FundSource;
  onChange: (v: FundSource) => void;
}) {
  const isPersonal = value === "personal";
  const Icon = isPersonal ? User : Wallet;
  return (
    <button
      type="button"
      onClick={() => onChange(isPersonal ? "shared" : "personal")}
      title={`${isPersonal ? "Personal — not from shared fund" : "Shared — from the wedding fund"}. Click to flip.`}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
        isPersonal
          ? "border-gold/50 bg-gold-light/20 text-ink hover:bg-gold-light/40"
          : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={10} strokeWidth={1.8} />
      {isPersonal ? "Personal" : "Shared"}
    </button>
  );
}

// ── Notes cell: click to expand into a textarea popover ─────────────────
// Saves on blur or Cmd/Ctrl+Enter; Escape reverts. We keep the clickable
// surface compact so the ledger row doesn't reflow, but give a full
// textarea once open for the >1-line notes a couple typically writes.

function NotesCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEditing = () => {
    setDraft(value);
    setOpen(true);
  };
  const commit = () => {
    setOpen(false);
    if (draft !== value) onChange(draft);
  };
  const revert = () => {
    setOpen(false);
    setDraft(value);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={startEditing}
        aria-label={value ? "Edit note" : "Add note"}
        title={value || "Add note"}
        className={cn(
          "flex w-full min-w-[120px] max-w-[220px] items-center gap-1.5 rounded-sm border border-transparent px-1 py-0.5 text-left text-[11.5px] transition-colors hover:border-border hover:bg-white",
          value ? "text-ink" : "text-ink-faint italic",
        )}
      >
        <StickyNote
          size={11}
          strokeWidth={1.8}
          className={value ? "text-saffron" : "text-ink-faint"}
        />
        <span className="truncate">{value || "Add note…"}</span>
      </button>
      {open && (
        <>
          {/* Click-outside shield — closes without saving */}
          <button
            type="button"
            aria-label="Close note editor"
            onClick={revert}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-50 mt-1 w-[300px] rounded-md border border-border bg-white p-3 shadow-xl"
          >
            <p
              className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Note
            </p>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  revert();
                } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  commit();
                }
              }}
              rows={4}
              placeholder="e.g. Split with Shalini; receipt on fridge."
              className="w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ⌘↵ save · Esc cancel
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={revert}
                  className="rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-ivory hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commit}
                  className="rounded-md bg-ink px-2.5 py-1 text-[11px] text-ivory hover:bg-ink-soft"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Bulk-tag side panel ──────────────────────────────────────────────────

function BulkTagPanel({
  kind,
  ids,
  onCommitEvent,
  onCommitSimple,
  onClose,
}: {
  kind: "category" | "event" | "payer" | "fund_source";
  ids: string[];
  onCommitEvent: (eventId: string | null) => void;
  onCommitSimple: (patch: Partial<FinanceTransaction>) => void;
  onClose: () => void;
}) {
  const categories = useFinanceStore((s) => s.categories);
  const events = useFinanceStore((s) => s.events);
  const contributors = useFinanceStore((s) => s.contributors);

  const [value, setValue] = useState<string>("");

  const title =
    kind === "category"
      ? `Tag category on ${ids.length}`
      : kind === "event"
        ? `Tag event on ${ids.length}`
        : kind === "fund_source"
          ? `Set fund source on ${ids.length}`
          : `Tag payer on ${ids.length}`;

  const commit = () => {
    if (kind === "category") {
      onCommitSimple({ category_id: value || null });
      return;
    }
    if (kind === "event") {
      // Split amounts follow each transaction's own amount_cents — the
      // store's bulkSetEventTag handles the per-row math.
      onCommitEvent(value || null);
      return;
    }
    if (kind === "fund_source") {
      onCommitSimple({
        fund_source: (value === "personal" ? "personal" : "shared") as FundSource,
      });
      return;
    }
    onCommitSimple({ payer_contributor_id: value || null });
  };

  return (
    <SidePanel
      title={title}
      eyebrow="Bulk action"
      onClose={onClose}
      widthClass="w-[420px]"
      footer={
        <div className="flex items-center justify-end gap-2">
          <FinanceActionButton label="Cancel" onClick={onClose} />
          <FinanceActionButton label="Apply" primary onClick={commit} />
        </div>
      }
    >
      <div className="space-y-3">
        {kind === "category" && (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="">— Clear category</option>
            {categories
              .filter((c) => !c.hidden)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}
        {kind === "event" && (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="">— Clear event tag</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        )}
        {kind === "payer" && (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="">— Clear payer</option>
            {contributors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.relationship}
              </option>
            ))}
          </select>
        )}
        {kind === "fund_source" && (
          <div className="flex flex-col gap-2">
            {(["shared", "personal"] as FundSource[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setValue(opt)}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-3 py-2 text-left text-[12.5px] transition-colors",
                  value === opt
                    ? "border-ink bg-white"
                    : "border-border bg-white/60 hover:border-saffron/50",
                )}
              >
                <span className="mt-0.5">
                  {opt === "shared" ? (
                    <Wallet size={13} strokeWidth={1.8} className="text-ink-muted" />
                  ) : (
                    <User size={13} strokeWidth={1.8} className="text-gold" />
                  )}
                </span>
                <div>
                  <p className="font-medium text-ink capitalize">{opt}</p>
                  <p className="text-[11px] text-ink-muted">
                    {opt === "shared"
                      ? "Counts against the pooled wedding budget."
                      : "Tracked but does not draw down the shared fund."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="text-[11.5px] text-ink-muted">
          Applies to all {ids.length} selected rows.
        </p>
      </div>
    </SidePanel>
  );
}

// ── Upload + review flow ─────────────────────────────────────────────────

function UploadStatementPanel({ onClose }: { onClose: () => void }) {
  const categories = useFinanceStore((s) => s.categories);
  const events = useFinanceStore((s) => s.events);
  const contributors = useFinanceStore((s) => s.contributors);
  const addBulk = useFinanceStore((s) => s.addTransactionsBulk);
  const findDuplicate = useFinanceStore((s) => s.findDuplicateOf);

  const [stage, setStage] = useState<"idle" | "parsing" | "review" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ParsedTransactionDraft[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importSource, setImportSource] = useState<TransactionSource>("manual");

  async function handleFile(file: File) {
    setError(null);
    setStage("parsing");
    setImportSource(file.name.toLowerCase().endsWith(".csv") ? "csv_import" : "pdf_import");
    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        await handleCsv(file);
      } else if (file.name.toLowerCase().endsWith(".pdf")) {
        await handlePdf(file);
      } else {
        throw new Error("Upload a PDF or CSV file.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
      setStage("error");
    }
  }

  async function handleCsv(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    const { drafts: local, skipped: skippedRows } = csvRowsToDrafts(
      rows,
      categories,
      contributors,
    );

    // Rows that came back with no category suggestion are the ambiguous
    // ones. Forward only those to Claude to save tokens.
    const ambiguous = local
      .map((d, idx) => ({ d, idx }))
      .filter(({ d }) => !d.suggested_category_id);

    if (ambiguous.length > 0) {
      try {
        const res = await fetch("/api/finance/parse-statement", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mode: "csv_rows",
            rows: ambiguous.map(({ d }) => ({
              date: d.date,
              description: d.description,
              amount_cents: d.amount_cents,
              account_last4: d.account_last4,
            })),
            categories: categories
              .filter((c) => !c.hidden)
              .map((c) => ({ id: c.id, name: c.name })),
            events: events.map((e) => ({ id: e.id, name: e.name })),
            contributors: contributors.map((c) => ({
              id: c.id,
              name: c.name,
              relationship: c.relationship,
            })),
          }),
        });
        const payload = (await res.json()) as {
          transactions: ParsedTransactionDraft[];
        };
        // Stitch Claude's suggestions back into the local drafts.
        for (const tx of payload.transactions ?? []) {
          const localIdx = local.findIndex(
            (d) =>
              d.date === tx.date &&
              d.description === tx.description &&
              d.amount_cents === tx.amount_cents &&
              !d.suggested_category_id,
          );
          if (localIdx >= 0 && tx.suggested_category_id) {
            local[localIdx] = {
              ...local[localIdx]!,
              suggested_category_id: tx.suggested_category_id,
              suggested_event_id:
                tx.suggested_event_id ?? local[localIdx]!.suggested_event_id,
              suggested_payer_contributor_id:
                tx.suggested_payer_contributor_id ??
                local[localIdx]!.suggested_payer_contributor_id,
              confidence: tx.confidence,
            };
          }
        }
      } catch {
        // Non-fatal: local heuristics still stand.
      }
    }

    setDrafts(local);
    setSkipped(
      skippedRows.map(
        (r) => `${r.reason}: ${r.row.slice(0, 3).join(" · ") || "(empty row)"}`,
      ),
    );
    setStage("review");
  }

  async function handlePdf(file: File) {
    const buf = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const res = await fetch("/api/finance/parse-statement", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: "pdf",
        pdf_base64: base64,
        filename: file.name,
        categories: categories
          .filter((c) => !c.hidden)
          .map((c) => ({ id: c.id, name: c.name })),
        events: events.map((e) => ({ id: e.id, name: e.name })),
        contributors: contributors.map((c) => ({
          id: c.id,
          name: c.name,
          relationship: c.relationship,
        })),
      }),
    });
    const payload = (await res.json()) as {
      transactions: ParsedTransactionDraft[];
      error?: string;
    };
    if (payload.error) throw new Error(payload.error);
    // PDF results come straight from the model — run the client suggestion
    // helper over any row without a category hint so merchant keywords
    // still get a shot.
    const enriched = (payload.transactions ?? []).map((d) =>
      d.suggested_category_id
        ? d
        : buildSuggestion(
            {
              date: d.date,
              description: d.description,
              amount_cents: d.amount_cents,
              account_last4: d.account_last4,
            },
            categories,
            contributors,
          ),
    );
    setDrafts(enriched);
    setSkipped([]);
    setStage("review");
  }

  return (
    <SidePanel
      title="Upload statement"
      eyebrow="Transactions"
      onClose={onClose}
      widthClass="w-[760px]"
    >
      {stage === "idle" && (
        <DropZone
          onFiles={(f) => f[0] && handleFile(f[0])}
          dragOver={dragOver}
          onDragOver={setDragOver}
          fileRef={fileRef}
        />
      )}
      {stage === "parsing" && (
        <div className="flex flex-col items-center gap-3 py-12 text-ink-muted">
          <Loader2 size={24} className="animate-spin text-saffron" />
          <p className="font-serif text-[16px] text-ink">Parsing statement…</p>
          <p className="text-[12px]">
            {importSource === "pdf_import"
              ? "Sending PDF to Claude Haiku for extraction."
              : "Reading CSV and matching merchants."}
          </p>
        </div>
      )}
      {stage === "error" && (
        <div className="space-y-3 py-8">
          <div className="flex items-center gap-2 text-rose">
            <AlertTriangle size={18} strokeWidth={1.8} />
            <p className="font-serif text-[16px]">We couldn't parse that file</p>
          </div>
          <p className="text-[12.5px] text-ink-muted">{error}</p>
          <FinanceActionButton
            label="Try another file"
            onClick={() => setStage("idle")}
            primary
          />
        </div>
      )}
      {stage === "review" && (
        <ReviewTable
          drafts={drafts}
          setDrafts={setDrafts}
          skipped={skipped}
          source={importSource}
          onCancel={onClose}
          onCommit={(rows) => {
            // Duplicate detection per row; user can decide to drop
            // duplicates by unchecking them in the review table.
            addBulk(
              rows.map((r) => ({
                date: r.date,
                description: r.description,
                amount_cents: r.amount_cents,
                account_last4: r.account_last4,
                category_id: r.suggested_category_id,
                event_splits: r.suggested_event_id
                  ? [
                      {
                        event_id: r.suggested_event_id,
                        amount_cents: r.amount_cents,
                      },
                    ]
                  : [],
                payer_contributor_id: r.suggested_payer_contributor_id,
                fund_source: r.fund_source,
                source: importSource,
              })),
            );
            onClose();
          }}
          findDuplicate={findDuplicate}
        />
      )}
    </SidePanel>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────

function DropZone({
  onFiles,
  dragOver,
  onDragOver,
  fileRef,
}: {
  onFiles: (files: FileList | File[]) => void;
  dragOver: boolean;
  onDragOver: (over: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(true);
      }}
      onDragLeave={() => onDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        onDragOver(false);
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors",
        dragOver
          ? "border-saffron bg-gold-pale/30"
          : "border-border bg-ivory/30 hover:border-saffron",
      )}
    >
      <FileText size={24} strokeWidth={1.4} className="text-ink-muted" />
      <p className="font-serif text-[17px] text-ink">
        Drop a PDF or CSV statement
      </p>
      <p className="max-w-md text-[12.5px] text-ink-muted">
        We'll extract the transactions, match merchants against your vendors
        and categories, and show them here for you to review before saving.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.csv,application/pdf,text/csv"
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <FinanceActionButton
        icon={<Upload size={12} strokeWidth={1.8} />}
        label="Choose file"
        onClick={() => fileRef.current?.click()}
        primary
      />
    </div>
  );
}

// ── Review table ─────────────────────────────────────────────────────────

function ReviewTable({
  drafts,
  setDrafts,
  skipped,
  source,
  onCancel,
  onCommit,
  findDuplicate,
}: {
  drafts: ParsedTransactionDraft[];
  setDrafts: React.Dispatch<React.SetStateAction<ParsedTransactionDraft[]>>;
  skipped: string[];
  source: TransactionSource;
  onCancel: () => void;
  onCommit: (rows: ParsedTransactionDraft[]) => void;
  findDuplicate: (d: {
    date: string;
    description: string;
    amount_cents: number;
  }) => FinanceTransaction | null;
}) {
  const allCategories = useFinanceStore((s) => s.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => !c.hidden),
    [allCategories],
  );
  const events = useFinanceStore((s) => s.events);
  const contributors = useFinanceStore((s) => s.contributors);

  // Which rows does the user want to commit.
  const [kept, setKept] = useState<Set<number>>(
    () => new Set(drafts.map((_, i) => i)),
  );

  const duplicates = useMemo(
    () =>
      drafts.map((d) => {
        const dup = findDuplicate({
          date: d.date,
          description: d.description,
          amount_cents: d.amount_cents,
        });
        return dup;
      }),
    [drafts, findDuplicate],
  );

  const total = useMemo(
    () =>
      drafts
        .filter((_, i) => kept.has(i))
        .reduce((s, d) => s + d.amount_cents, 0),
    [drafts, kept],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Review
          </p>
          <p className="font-serif text-[16px] text-ink">
            {drafts.length} transaction{drafts.length === 1 ? "" : "s"} parsed
            {skipped.length > 0 &&
              ` · ${skipped.length} skipped`}
          </p>
        </div>
        <p
          className="font-mono text-[12px] tabular-nums text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDollars(total)} to commit
        </p>
      </div>

      {skipped.length > 0 && (
        <div className="rounded-md border border-gold/30 bg-gold-pale/25 px-3 py-2 text-[11.5px] text-ink-muted">
          <span
            className="mr-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Skipped
          </span>
          {skipped.slice(0, 3).join(" · ")}
          {skipped.length > 3 && ` · +${skipped.length - 3} more`}
        </div>
      )}

      <div className="max-h-[520px] overflow-y-auto rounded-md border border-border">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-border">
              <th className="w-8 px-2 py-2" />
              <Th align="left">Date</Th>
              <Th align="left">Description</Th>
              <Th align="left">Fund</Th>
              <Th align="left">Category</Th>
              <Th align="left">Event</Th>
              <Th align="left">Payer</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((d, idx) => {
              const dup = duplicates[idx];
              const isKept = kept.has(idx);
              return (
                <tr
                  key={idx}
                  className={cn(
                    "border-b border-border/60",
                    !isKept && "opacity-40",
                  )}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={isKept}
                      onChange={() =>
                        setKept((prev) => {
                          const next = new Set(prev);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        })
                      }
                      className="h-3.5 w-3.5 accent-ink"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className="font-mono text-[11px] tabular-nums text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatDateShort(d.date)}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <p className="max-w-[180px] truncate text-[11.5px] text-ink">
                        {d.description}
                      </p>
                      {d.confidence === "high" && (
                        <Sparkles
                          size={11}
                          strokeWidth={1.8}
                          className="text-saffron"
                          aria-label="High confidence suggestion"
                        />
                      )}
                      {dup && (
                        <span
                          className="rounded-sm border border-rose/40 bg-rose/10 px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-rose"
                          style={{ fontFamily: "var(--font-mono)" }}
                          title="Matches an existing transaction (same date/amount/description)"
                        >
                          Duplicate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <FundSourcePill
                      value={d.fund_source}
                      onChange={(v) =>
                        setDrafts((prev) => {
                          const next = prev.slice();
                          next[idx] = { ...next[idx]!, fund_source: v };
                          return next;
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={d.suggested_category_id ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => {
                          const next = prev.slice();
                          next[idx] = {
                            ...next[idx]!,
                            suggested_category_id: e.target.value || null,
                          };
                          return next;
                        })
                      }
                      className={cn(
                        "w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none",
                        !d.suggested_category_id && "text-ink-faint italic",
                      )}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={d.suggested_event_id ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => {
                          const next = prev.slice();
                          next[idx] = {
                            ...next[idx]!,
                            suggested_event_id: e.target.value || null,
                          };
                          return next;
                        })
                      }
                      className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
                    >
                      <option value="">—</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={d.suggested_payer_contributor_id ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => {
                          const next = prev.slice();
                          next[idx] = {
                            ...next[idx]!,
                            suggested_payer_contributor_id:
                              e.target.value || null,
                          };
                          return next;
                        })
                      }
                      className="w-full rounded-sm border border-transparent bg-transparent py-0.5 text-[11.5px] text-ink hover:border-border focus:border-ink focus:outline-none"
                    >
                      <option value="">—</option>
                      {contributors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <MonoCell value={formatDollars(d.amount_cents)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[11.5px] text-ink-muted">
          <span
            className="mr-2 font-mono text-[9.5px] uppercase tracking-[0.12em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Source
          </span>
          {source === "pdf_import" ? "PDF" : source === "csv_import" ? "CSV" : "Manual"}
        </div>
        <div className="flex items-center gap-2">
          <FinanceActionButton label="Cancel" onClick={onCancel} />
          <FinanceActionButton
            label={`Commit ${kept.size} row${kept.size === 1 ? "" : "s"}`}
            primary
            disabled={kept.size === 0}
            onClick={() =>
              onCommit(drafts.filter((_, i) => kept.has(i)))
            }
          />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  if (typeof btoa !== "undefined") return btoa(binary);
  return Buffer.from(binary, "binary").toString("base64");
}
