"use client";

// ── Reports tab ───────────────────────────────────────────────────────────
// Four one-click exports. PDFs use jsPDF; CSVs are downloaded as blobs.
// Budget PDF + Year-end PDF are both family/tax-prep share-ready.

import { useMemo } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { useFinanceStore } from "@/stores/finance-store";
import { computeRollups } from "@/lib/finance/selectors";
import {
  exportBudgetPdf,
  exportInvoicesCsv,
  exportPaymentScheduleCsv,
  exportYearEndPdf,
} from "@/lib/finance/exports";
import { formatDollarsShort } from "@/lib/finance/format";
import type { FinanceCategoryId } from "@/types/finance";
import { FinancePanelCard, FinanceSectionHeader } from "./shared";

interface Props {
  categoryFilter: FinanceCategoryId | null;
}

export function FinanceReportsTab({ categoryFilter }: Props) {
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const contributors = useFinanceStore((s) => s.contributors);
  const allocations = useFinanceStore((s) => s.allocations);
  const storeCategories = useFinanceStore((s) => s.categories);

  const allCategoryIds = useMemo(
    () => storeCategories.filter((c) => !c.hidden).map((c) => c.id),
    [storeCategories],
  );

  const scope = useMemo(
    () =>
      categoryFilter
        ? allCategoryIds.filter((c) => c === categoryFilter)
        : allCategoryIds,
    [categoryFilter, allCategoryIds],
  );

  const scopedInvoices = categoryFilter
    ? invoices.filter((i) => i.category_id === categoryFilter)
    : invoices;
  const scopedBudgets = categoryFilter
    ? budgets.filter((b) => b.category_id === categoryFilter)
    : budgets;
  const scopedPaymentsIds = new Set(scopedInvoices.map((i) => i.id));
  const scopedPayments = categoryFilter
    ? payments.filter((p) => scopedPaymentsIds.has(p.invoice_id))
    : payments;
  const rollups = useMemo(
    () => computeRollups(budgets, invoices, payments, scope),
    [budgets, invoices, payments, scope],
  );

  const totalBudget = scopedBudgets.reduce((s, b) => s + b.allocated_cents, 0);
  const totalInvoiced = scopedInvoices.reduce((s, i) => s + i.amount_cents, 0);
  const totalPaid = scopedPayments.reduce((s, p) => s + p.amount_cents, 0);
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <FinancePanelCard>
        <FinanceSectionHeader
          eyebrow="Reports"
          title="Share-ready exports"
          description="Generate PDFs for family review or CSVs for accountants"
        />
        <p
          className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {categoryFilter ? `Scoped to one category · ` : "All categories · "}
          budget {formatDollarsShort(totalBudget)} · invoiced {formatDollarsShort(totalInvoiced)} · paid {formatDollarsShort(totalPaid)}
        </p>
      </FinancePanelCard>

      <section className="grid gap-3 md:grid-cols-2">
        <ReportCard
          icon={<FileText size={18} strokeWidth={1.5} className="text-saffron" />}
          title="Full budget PDF"
          description="One-page breakdown by category — allocations, commitments, and notes. Share-ready for family."
          actionLabel="Download PDF"
          onClick={() => exportBudgetPdf(rollups, scopedBudgets, storeCategories)}
        />
        <ReportCard
          icon={<FileSpreadsheet size={18} strokeWidth={1.5} className="text-sage" />}
          title="Payment schedule CSV"
          description="Chronological list of upcoming invoices and recorded payments. Opens in Excel or Numbers."
          actionLabel="Download CSV"
          onClick={() =>
            exportPaymentScheduleCsv(scopedInvoices, scopedPayments, storeCategories)
          }
        />
        <ReportCard
          icon={<FileSpreadsheet size={18} strokeWidth={1.5} className="text-ink-muted" />}
          title="Invoice log CSV"
          description="Every invoice with amount, due date, paid status, and notes. Good for vendor reconciliation."
          actionLabel="Download CSV"
          onClick={() =>
            exportInvoicesCsv(scopedInvoices, scopedPayments, storeCategories)
          }
        />
        <ReportCard
          icon={<FileText size={18} strokeWidth={1.5} className="text-gold" />}
          title={`Year-end summary · ${currentYear}`}
          description="Payments made during the current calendar year, plus contributor totals. US tax prep format."
          actionLabel="Download PDF"
          onClick={() =>
            exportYearEndPdf(invoices, payments, contributors, allocations, currentYear)
          }
        />
      </section>
    </div>
  );
}

function ReportCard({
  icon,
  title,
  description,
  actionLabel,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <h3 className="font-serif text-[16px] leading-tight text-ink">{title}</h3>
          <p className="mt-1 text-[12.5px] text-ink-muted">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="mt-auto inline-flex items-center justify-center gap-1.5 self-end rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft"
      >
        <FileDown size={13} strokeWidth={1.8} />
        {actionLabel}
      </button>
    </div>
  );
}
