// ── Finance exports ───────────────────────────────────────────────────────
// CSV + PDF generators for the Reports tab. PDFs use jsPDF (already in
// package.json). CSVs are generated as strings and downloaded via Blob.

import jsPDF from "jspdf";
import type {
  FinanceBudget,
  FinanceCategory,
  FinanceCategoryId,
  FinanceCategoryRollup,
  FinanceContributor,
  FinanceContributorAllocation,
  FinanceInvoice,
  FinancePayment,
} from "@/types/finance";
import {
  FINANCE_CATEGORY_LABEL,
  INVOICE_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/types/finance";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import { centsToDollars, formatDollars } from "./format";

// Resolve a human-readable category name from the categories list (custom
// + default). Falls back to the legacy static map when `categories` is
// omitted so older callers keep working.
function resolveCategoryName(
  id: FinanceCategoryId,
  categories?: Pick<FinanceCategory, "id" | "name">[],
): string {
  const hit = categories?.find((c) => c.id === id);
  if (hit) return hit.name;
  return (
    FINANCE_CATEGORY_LABEL[id as WorkspaceCategorySlug] ?? "Uncategorized"
  );
}

// ── Download helpers ──────────────────────────────────────────────────────

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

// ── CSV exports ───────────────────────────────────────────────────────────

export function exportInvoicesCsv(
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  categories?: Pick<FinanceCategory, "id" | "name">[],
) {
  const paidByInvoice = new Map<string, number>();
  for (const p of payments) {
    paidByInvoice.set(
      p.invoice_id,
      (paidByInvoice.get(p.invoice_id) ?? 0) + p.amount_cents,
    );
  }

  const rows: (string | number | null | undefined)[][] = [
    [
      "Invoice #",
      "Vendor",
      "Category",
      "Amount (USD)",
      "Paid (USD)",
      "Remaining (USD)",
      "Due Date",
      "Status",
      "Notes",
    ],
    ...invoices.map((i) => {
      const paid = paidByInvoice.get(i.id) ?? 0;
      return [
        i.invoice_number ?? "",
        i.vendor_name_fallback ?? "",
        resolveCategoryName(i.category_id, categories),
        centsToDollars(i.amount_cents).toFixed(2),
        centsToDollars(paid).toFixed(2),
        centsToDollars(i.amount_cents - paid).toFixed(2),
        i.due_date,
        INVOICE_STATUS_LABEL[i.status],
        i.notes ?? "",
      ];
    }),
  ];
  const csv = buildCsv(rows);
  triggerDownload(
    `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
}

export function exportPaymentScheduleCsv(
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  categories?: Pick<FinanceCategory, "id" | "name">[],
) {
  const rows: (string | number | null | undefined)[][] = [
    ["Type", "Date", "Vendor", "Category", "Amount (USD)", "Method", "Invoice #", "Notes"],
  ];
  // Upcoming invoices (not paid)
  for (const i of invoices.filter((i) => i.status !== "paid" && i.status !== "draft")) {
    rows.push([
      "Upcoming",
      i.due_date,
      i.vendor_name_fallback ?? "",
      resolveCategoryName(i.category_id, categories),
      centsToDollars(i.amount_cents).toFixed(2),
      "",
      i.invoice_number ?? "",
      i.notes ?? "",
    ]);
  }
  // Paid payments
  for (const p of payments) {
    const inv = invoices.find((i) => i.id === p.invoice_id);
    rows.push([
      "Paid",
      p.paid_date,
      inv?.vendor_name_fallback ?? "",
      inv ? resolveCategoryName(inv.category_id, categories) : "",
      centsToDollars(p.amount_cents).toFixed(2),
      PAYMENT_METHOD_LABEL[p.payment_method],
      inv?.invoice_number ?? "",
      p.notes ?? "",
    ]);
  }

  // Sort by date ascending
  const header = rows[0]!;
  const body = rows.slice(1).sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  const csv = buildCsv([header, ...body]);
  triggerDownload(
    `payment-schedule-${new Date().toISOString().slice(0, 10)}.csv`,
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
}

// ── PDF helpers ───────────────────────────────────────────────────────────

function pdfHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 40, 50);
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(subtitle, 40, 68);
    doc.setTextColor(0);
  }
  doc.setDrawColor(200);
  doc.line(40, 80, 555, 80);
}

function pdfFooter(doc: jsPDF, pageIndex: number, totalPages: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    `Generated ${new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    40,
    h - 20,
  );
  doc.text(`Page ${pageIndex} of ${totalPages}`, w - 80, h - 20);
  doc.setTextColor(0);
}

// ── Budget PDF ────────────────────────────────────────────────────────────

export function exportBudgetPdf(
  rollups: FinanceCategoryRollup[],
  budgets: FinanceBudget[],
  categories?: Pick<FinanceCategory, "id" | "name">[],
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  pdfHeader(
    doc,
    "Wedding Budget",
    "Full allocation, quoted, committed, and remaining by category",
  );

  const startY = 110;
  const rowH = 22;
  const cols = [
    { label: "Category", x: 40, w: 140 },
    { label: "Allocated", x: 180, w: 80, align: "right" as const },
    { label: "Quoted", x: 260, w: 80, align: "right" as const },
    { label: "Committed", x: 340, w: 80, align: "right" as const },
    { label: "Paid", x: 420, w: 60, align: "right" as const },
    { label: "Remaining", x: 480, w: 75, align: "right" as const },
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  for (const c of cols) {
    doc.text(
      c.label,
      c.x + (c.align === "right" ? c.w : 0),
      startY,
      { align: c.align ?? "left" },
    );
  }
  doc.setDrawColor(210);
  doc.line(40, startY + 6, 555, startY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let y = startY + rowH;
  const totals = {
    allocated: 0,
    quoted: 0,
    committed: 0,
    paid: 0,
    remaining: 0,
  };
  for (const r of rollups) {
    const row = [
      resolveCategoryName(r.category_id, categories),
      formatDollars(r.allocated_cents),
      formatDollars(r.quoted_cents),
      formatDollars(r.committed_cents),
      formatDollars(r.paid_cents),
      formatDollars(r.remaining_cents),
    ];
    doc.text(String(row[0]), cols[0]!.x, y);
    for (let i = 1; i < cols.length; i++) {
      doc.text(String(row[i]), cols[i]!.x + cols[i]!.w, y, { align: "right" });
    }
    totals.allocated += r.allocated_cents;
    totals.quoted += r.quoted_cents;
    totals.committed += r.committed_cents;
    totals.paid += r.paid_cents;
    totals.remaining += r.remaining_cents;
    y += rowH;
  }

  doc.setDrawColor(180);
  doc.line(40, y - 14, 555, y - 14);
  doc.setFont("helvetica", "bold");
  doc.text("Totals", cols[0]!.x, y);
  doc.text(formatDollars(totals.allocated), cols[1]!.x + cols[1]!.w, y, { align: "right" });
  doc.text(formatDollars(totals.quoted), cols[2]!.x + cols[2]!.w, y, { align: "right" });
  doc.text(formatDollars(totals.committed), cols[3]!.x + cols[3]!.w, y, { align: "right" });
  doc.text(formatDollars(totals.paid), cols[4]!.x + cols[4]!.w, y, { align: "right" });
  doc.text(formatDollars(totals.remaining), cols[5]!.x + cols[5]!.w, y, { align: "right" });
  y += rowH * 2;

  // Notes section
  const notesBudgets = budgets.filter((b) => (b.notes ?? "").trim().length > 0);
  if (notesBudgets.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Notes", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const b of notesBudgets) {
      const label = `${resolveCategoryName(b.category_id, categories)}: `;
      doc.setFont("helvetica", "bold");
      doc.text(label, 40, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(b.notes ?? "", 480);
      doc.text(lines, 40 + doc.getTextWidth(label), y);
      y += 14 * Math.max(1, lines.length);
      if (y > 720) {
        doc.addPage();
        y = 60;
      }
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    pdfFooter(doc, i, totalPages);
  }
  doc.save(`wedding-budget-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Year-end / tax-prep PDF ───────────────────────────────────────────────

export function exportYearEndPdf(
  invoices: FinanceInvoice[],
  payments: FinancePayment[],
  contributors: FinanceContributor[],
  _allocations: FinanceContributorAllocation[],
  year: number = new Date().getFullYear(),
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  pdfHeader(
    doc,
    `Year-End Summary · ${year}`,
    "Payments and contributors made between Jan 1 and Dec 31 — for US tax preparation",
  );

  let y = 110;
  const yearPayments = payments.filter((p) =>
    p.paid_date.startsWith(String(year)),
  );
  const yearTotal = yearPayments.reduce((s, p) => s + p.amount_cents, 0);

  // Summary block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total payments in ${year}: ${formatDollars(yearTotal)}`, 40, y);
  y += 14;
  doc.text(`Number of payments: ${yearPayments.length}`, 40, y);
  y += 24;

  // Payments table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payments", 40, y);
  y += 18;
  doc.setFontSize(9);
  const cols = [
    { label: "Date", x: 40, w: 80 },
    { label: "Vendor", x: 120, w: 200 },
    { label: "Method", x: 320, w: 80 },
    { label: "Amount", x: 480, w: 75, align: "right" as const },
  ];
  for (const c of cols) {
    doc.text(c.label, c.x + (c.align === "right" ? c.w : 0), y, { align: c.align ?? "left" });
  }
  doc.setDrawColor(210);
  doc.line(40, y + 6, 555, y + 6);
  doc.setFont("helvetica", "normal");
  y += 20;
  for (const p of yearPayments) {
    const inv = invoices.find((i) => i.id === p.invoice_id);
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.text(p.paid_date, 40, y);
    doc.text(
      doc.splitTextToSize(inv?.vendor_name_fallback ?? "Unknown vendor", 190)[0] ?? "",
      120,
      y,
    );
    doc.text(PAYMENT_METHOD_LABEL[p.payment_method], 320, y);
    doc.text(formatDollars(p.amount_cents), 480 + 75, y, { align: "right" });
    y += 16;
  }

  y += 20;

  // Contributors block
  if (y > 680) {
    doc.addPage();
    y = 60;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Contributors", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const c of contributors) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.text(`${c.name} (${c.relationship})`, 40, y);
    doc.text(
      `Pledged ${formatDollars(c.pledged_cents)} · Paid ${formatDollars(c.paid_cents)}`,
      320,
      y,
    );
    y += 14;
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    pdfFooter(doc, i, totalPages);
  }
  doc.save(`year-end-summary-${year}.pdf`);
}
