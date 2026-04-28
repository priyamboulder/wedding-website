"use client";

// ── Invoices tab ──────────────────────────────────────────────────────────
// Linear-style row list. Filter chips (status, category, date range), bulk
// actions (approve, mark paid, CSV export), and an Upload-invoice side panel
// with PDF upload + manual entry. Extracted-data hook is present but not
// auto-filled in this PR — reserved for a future Claude Haiku pass.

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Download,
  ExternalLink,
  FileUp,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  addDaysIso,
  daysUntil,
  formatDateShort,
  formatDollars,
  isoToday,
  parseDollarsToCents,
} from "@/lib/finance/format";
import { exportInvoicesCsv } from "@/lib/finance/exports";
import type {
  FinanceCategoryId,
  FinanceInvoice,
  FinanceInvoiceStatus,
} from "@/types/finance";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_TONE,
} from "@/types/finance";
import {
  CategoryChip,
  FinanceActionButton,
  FinancePanelCard,
  MonoCell,
  SidePanel,
  ToggleChip,
} from "./shared";
import { FinanceInvoiceDetail } from "./FinanceInvoiceDetail";

const ALL_STATUSES: FinanceInvoiceStatus[] = [
  "draft",
  "awaiting_approval",
  "approved",
  "paid",
  "overdue",
];
type DateRangeFilter = "all" | "overdue" | "this_week" | "this_month" | "future";

interface Props {
  categoryFilter: FinanceCategoryId | null;
}

export function FinanceInvoicesTab({ categoryFilter }: Props) {
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const storeCategories = useFinanceStore((s) => s.categories);
  const activeCategories = useMemo(
    () => storeCategories.filter((c) => !c.hidden),
    [storeCategories],
  );
  const setInvoiceStatus = useFinanceStore((s) => s.setInvoiceStatus);
  const bulkSetStatus = useFinanceStore((s) => s.bulkSetInvoiceStatus);
  const markPaid = useFinanceStore((s) => s.markInvoicePaid);
  const deleteInvoice = useFinanceStore((s) => s.deleteInvoice);

  const [statusFilter, setStatusFilter] = useState<Set<FinanceInvoiceStatus>>(
    new Set(),
  );
  const [catFilter, setCatFilter] = useState<Set<FinanceCategoryId>>(
    new Set(categoryFilter ? [categoryFilter] : []),
  );
  const [range, setRange] = useState<DateRangeFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailInvoice = detailId
    ? invoices.find((i) => i.id === detailId) ?? null
    : null;

  const filtered = useMemo(() => {
    const now = new Date();
    return invoices
      .filter((i) => {
        if (categoryFilter && i.category_id !== categoryFilter) return false;
        if (catFilter.size > 0 && !catFilter.has(i.category_id)) return false;
        if (statusFilter.size > 0 && !statusFilter.has(i.status)) return false;
        if (range !== "all") {
          const delta = daysUntil(i.due_date, now);
          if (range === "overdue" && !(i.status === "overdue" || delta < 0)) return false;
          if (range === "this_week" && (delta < 0 || delta > 7)) return false;
          if (range === "this_month" && (delta < 0 || delta > 30)) return false;
          if (range === "future" && delta <= 30) return false;
        }
        return true;
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [invoices, statusFilter, catFilter, range, categoryFilter]);

  const toggleStatusFilter = (s: FinanceInvoiceStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };
  const toggleCatFilter = (c: FinanceCategoryId) => {
    setCatFilter((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllVisible = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const bulkApprove = () => {
    bulkSetStatus(Array.from(selected), "approved");
    setSelected(new Set());
  };
  const bulkMarkPaid = () => {
    for (const id of selected) markPaid(id);
    setSelected(new Set());
  };
  const bulkExport = () => {
    const set = new Set(selected);
    const chosen = invoices.filter((i) => set.has(i.id));
    const chosenPayments = payments.filter((p) => set.has(p.invoice_id));
    exportInvoicesCsv(
      chosen.length > 0 ? chosen : filtered,
      chosenPayments.length > 0 ? chosenPayments : payments,
      storeCategories,
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter chips + action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Status
          </span>
          {ALL_STATUSES.map((s) => (
            <ToggleChip
              key={s}
              active={statusFilter.has(s)}
              onClick={() => toggleStatusFilter(s)}
            >
              {INVOICE_STATUS_LABEL[s]}
            </ToggleChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "overdue", "this_week", "this_month", "future"] as DateRangeFilter[]).map((r) => (
            <ToggleChip
              key={r}
              active={range === r}
              onClick={() => setRange(r)}
            >
              {r === "all"
                ? "All dates"
                : r === "overdue"
                  ? "Overdue"
                  : r === "this_week"
                    ? "Next 7d"
                    : r === "this_month"
                      ? "Next 30d"
                      : "30d+"}
            </ToggleChip>
          ))}
        </div>
      </div>

      {!categoryFilter && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Category
          </span>
          {activeCategories.map((cat) => (
            <ToggleChip
              key={cat.id}
              active={catFilter.has(cat.id)}
              onClick={() => toggleCatFilter(cat.id)}
            >
              {cat.name}
            </ToggleChip>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-ink-muted">
          {filtered.length} invoice{filtered.length === 1 ? "" : "s"} · {selected.size} selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <>
              <FinanceActionButton
                label="Approve"
                icon={<CheckSquare size={13} strokeWidth={1.8} />}
                onClick={bulkApprove}
              />
              <FinanceActionButton
                label="Mark paid"
                icon={<CheckSquare size={13} strokeWidth={1.8} />}
                onClick={bulkMarkPaid}
              />
            </>
          )}
          <FinanceActionButton
            label="Export CSV"
            icon={<Download size={13} strokeWidth={1.8} />}
            onClick={bulkExport}
          />
          <FinanceActionButton
            label="Upload invoice"
            icon={<Upload size={13} strokeWidth={1.8} />}
            onClick={() => setUploadOpen(true)}
            primary
          />
        </div>
      </div>

      <FinancePanelCard className="overflow-hidden p-0">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-8 px-3 py-2.5">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="rounded p-0.5 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
                  aria-label="Select all visible invoices"
                >
                  {selected.size > 0 && selected.size === filtered.length ? (
                    <CheckSquare size={13} strokeWidth={1.8} />
                  ) : (
                    <Square size={13} strokeWidth={1.8} />
                  )}
                </button>
              </th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Vendor</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Category</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Invoice #</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Amount</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Due</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Status</th>
              <th className="w-24 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[13px] text-ink-muted">
                  No invoices match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((i) => (
              <InvoiceRow
                key={i.id}
                invoice={i}
                selected={selected.has(i.id)}
                onToggleSelect={() => toggleSelected(i.id)}
                onSetStatus={(s) => setInvoiceStatus(i.id, s)}
                onMarkPaid={() => markPaid(i.id)}
                onDelete={() => deleteInvoice(i.id)}
                onOpen={() => setDetailId(i.id)}
              />
            ))}
          </tbody>
        </table>
      </FinancePanelCard>

      {uploadOpen && <UploadInvoicePanel onClose={() => setUploadOpen(false)} defaultCategory={categoryFilter} />}
      {detailInvoice && (
        <FinanceInvoiceDetail
          invoice={detailInvoice}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function InvoiceRow({
  invoice,
  selected,
  onToggleSelect,
  onSetStatus,
  onMarkPaid,
  onDelete,
  onOpen,
}: {
  invoice: FinanceInvoice;
  selected: boolean;
  onToggleSelect: () => void;
  onSetStatus: (s: FinanceInvoiceStatus) => void;
  onMarkPaid: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const delta = daysUntil(invoice.due_date);
  const dueTone =
    invoice.status === "paid"
      ? "faint"
      : delta < 0
        ? "rose"
        : delta <= 7
          ? "gold"
          : "ink";
  const dueSuffix =
    invoice.status === "paid"
      ? null
      : delta < 0
        ? `${-delta}d overdue`
        : delta === 0
          ? "today"
          : `in ${delta}d`;

  return (
    <tr
      className={cn(
        "border-b border-border/60 hover:bg-ivory/30",
        selected && "bg-gold-light/15",
      )}
    >
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={onToggleSelect}
          className="rounded p-0.5 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
          aria-label={selected ? "Deselect invoice" : "Select invoice"}
        >
          {selected ? (
            <CheckSquare size={13} strokeWidth={1.8} className="text-ink" />
          ) : (
            <Square size={13} strokeWidth={1.8} />
          )}
        </button>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpen}
            className="truncate text-left text-[12.5px] text-ink transition-colors hover:text-saffron"
            title="Open invoice details"
          >
            {invoice.vendor_name_fallback ?? "Unknown vendor"}
          </button>
          {invoice.pdf_url && (
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint hover:text-saffron"
              aria-label="View uploaded PDF"
              onClick={(e) => e.stopPropagation()}
            >
              <FileUp size={11} strokeWidth={1.8} />
            </a>
          )}
        </div>
        {invoice.notes && (
          <p className="truncate text-[10.5px] text-ink-faint">{invoice.notes}</p>
        )}
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/workspace/finance?category=${invoice.category_id}`}
          className="inline-flex items-center gap-1 transition-colors hover:text-saffron"
          aria-label={`Scope finance to ${invoice.category_id}`}
        >
          <CategoryChip category={invoice.category_id} size="xs" />
        </Link>
      </td>
      <td className="px-3 py-2.5 font-mono text-[11.5px] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>
        {invoice.invoice_number ?? "—"}
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell value={formatDollars(invoice.amount_cents)} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-col">
          <MonoCell value={formatDateShort(invoice.due_date)} align="left" />
          {dueSuffix && (
            <span
              className={cn(
                "font-mono text-[9.5px] uppercase tracking-[0.12em]",
                dueTone === "rose" && "text-rose",
                dueTone === "gold" && "text-gold",
                dueTone === "faint" && "text-ink-faint",
                dueTone === "ink" && "text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {dueSuffix}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <StatusSelect
          status={invoice.status}
          onChange={onSetStatus}
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          {invoice.status !== "paid" && (
            <button
              type="button"
              onClick={onMarkPaid}
              className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-sage"
              aria-label="Mark invoice paid"
              title="Mark paid"
            >
              <CheckSquare size={13} strokeWidth={1.8} />
            </button>
          )}
          {invoice.vendor_id && (
            <Link
              href={`/vendors/${invoice.vendor_id}`}
              className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-saffron"
              aria-label="Open vendor record"
              title="Vendor record"
            >
              <ExternalLink size={13} strokeWidth={1.8} />
            </Link>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
            aria-label="Delete invoice"
            title="Delete"
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusSelect({
  status,
  onChange,
}: {
  status: FinanceInvoiceStatus;
  onChange: (s: FinanceInvoiceStatus) => void;
}) {
  return (
    <span className="relative inline-flex items-center gap-1.5">
      <span
        className={cn("h-1.5 w-1.5 rounded-full", INVOICE_STATUS_TONE[status])}
        aria-hidden
      />
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as FinanceInvoiceStatus)}
        aria-label="Invoice status"
        className="appearance-none rounded border border-transparent bg-transparent pr-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-border hover:text-ink focus:border-ink focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {INVOICE_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </span>
  );
}

// ── Upload / manual entry side panel ──────────────────────────────────────

function UploadInvoicePanel({
  onClose,
  defaultCategory,
}: {
  onClose: () => void;
  defaultCategory: FinanceCategoryId | null;
}) {
  const addInvoice = useFinanceStore((s) => s.addInvoice);
  const storeCategories = useFinanceStore((s) => s.categories);
  const storeEvents = useFinanceStore((s) => s.events);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategories = storeCategories.filter((c) => !c.hidden);

  const [file, setFile] = useState<File | null>(null);
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState<FinanceCategoryId>(
    defaultCategory ?? activeCategories[0]?.id ?? "venue",
  );
  const [eventId, setEventId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [dueDate, setDueDate] = useState(addDaysIso(14));
  const [status, setStatus] = useState<FinanceInvoiceStatus>("awaiting_approval");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountCents = parseDollarsToCents(amountStr);
  const valid =
    vendor.trim().length > 0 && amountCents != null && amountCents > 0 && !!dueDate;

  const submit = () => {
    setError(null);
    if (!valid || amountCents == null) {
      setError("Vendor name, amount, and due date are required.");
      return;
    }
    // Persist PDF as an in-memory object URL. Integration point for future
    // Supabase storage: replace this with an upload to `finance-invoices`
    // bucket and store the returned public URL. Integration point for the
    // Haiku-based auto-parse step: pass the File/ArrayBuffer through here
    // and populate the form defaults before the user hits save.
    let pdf_url: string | null = null;
    let pdf_filename: string | null = null;
    if (file) {
      pdf_url = URL.createObjectURL(file);
      pdf_filename = file.name;
    }
    addInvoice({
      vendor_name_fallback: vendor.trim(),
      category_id: category,
      event_splits: eventId
        ? [{ event_id: eventId, amount_cents: amountCents }]
        : [],
      invoice_number: invoiceNumber.trim() || null,
      amount_cents: amountCents,
      due_date: dueDate,
      status,
      pdf_url,
      pdf_filename,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <SidePanel
      title="Upload invoice"
      eyebrow="New invoice"
      onClose={onClose}
      widthClass="w-[520px]"
      footer={
        <div className="flex items-center justify-between gap-3">
          {error && <p className="text-[11.5px] text-rose">{error}</p>}
          <div className="ml-auto flex items-center gap-2">
            <FinanceActionButton label="Cancel" onClick={onClose} />
            <FinanceActionButton
              label="Save invoice"
              primary
              onClick={submit}
              disabled={!valid}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* PDF drop / pick */}
        <div>
          <label
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            PDF upload
          </label>
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border bg-ivory/40 py-6 text-center transition-colors hover:border-saffron/40 hover:bg-ivory"
            >
              <FileUp size={18} strokeWidth={1.5} className="text-ink-muted" />
              <span className="text-[12.5px] text-ink-muted">
                Click to pick a PDF (optional)
              </span>
              <span className="text-[10.5px] text-ink-faint">
                Auto-parse coming in a later release — for now, fill the form below.
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
              <FileUp size={14} strokeWidth={1.6} className="text-ink-muted" />
              <span className="flex-1 truncate text-[12px] text-ink">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded p-1 text-ink-faint hover:bg-ivory hover:text-ink"
                aria-label="Remove file"
              >
                <X size={13} strokeWidth={1.8} />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Field label="Vendor">
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Bay View Estate"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Event (optional)">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            >
              <option value="">— None</option>
              {storeEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Invoice number">
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </Field>

          <Field label="Amount (USD)">
            <div className="flex items-center gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9,.]/g, ""))}
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-white px-2 py-2 text-right font-mono text-[12.5px] tabular-nums text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={isoToday()}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            />
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FinanceInvoiceStatus)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {INVOICE_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Deposit for ceremony venue, balance due June 1."
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </Field>
      </div>
    </SidePanel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

