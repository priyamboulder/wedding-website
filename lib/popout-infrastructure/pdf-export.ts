import jsPDF from "jspdf";
import type { ChecklistItem } from "@/types/checklist";
import type { PDFExportOptions } from "@/types/popout-infrastructure";

// ── Color constants (matching the design system) ─────────────────────────────

const GOLD = [184, 134, 11] as const; // #B8860B
const INK = [26, 26, 26] as const; // #1A1A1A
const INK_MUTED = [107, 107, 107] as const; // #6B6B6B
const IVORY_WARM = [245, 241, 232] as const; // #F5F1E8
const GOLD_PALE = [240, 228, 200] as const; // #F0E4C8

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
  not_applicable: "N/A",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Main export function ─────────────────────────────────────────────────────

export async function exportToPDF(
  item: ChecklistItem,
  options: PDFExportOptions,
): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 60;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helper to check page overflow ──────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  function checkPage(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // ── Gold accent line at top ────────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + contentWidth, y);
  y += 24;

  // ── Title ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(item.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 28 + 8;

  // ── Metadata row ───────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK_MUTED);
  const meta = [
    `Status: ${STATUS_LABELS[item.status] ?? item.status}`,
    `Priority: ${PRIORITY_LABELS[item.priority] ?? item.priority}`,
    `Due: ${formatDate(item.due_date)}`,
    `Assigned: ${item.assigned_to}`,
  ].join("   \u00B7   ");
  doc.text(meta, margin, y);
  y += 20;

  // ── Thin separator ────────────────────────────────────────────────────
  doc.setDrawColor(...GOLD_PALE);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  // ── Description ────────────────────────────────────────────────────────
  if (item.description) {
    checkPage(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...GOLD);
    doc.text("Description", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const descLines = doc.splitTextToSize(item.description, contentWidth);
    for (const line of descLines) {
      checkPage(14);
      doc.text(line, margin, y);
      y += 14;
    }
    y += 12;
  }

  // ── Decisions ──────────────────────────────────────────────────────────
  if (options.includeDecisions && item.decision_fields.length > 0) {
    checkPage(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...GOLD);
    doc.text("Decisions", margin, y);
    y += 16;

    for (const field of item.decision_fields) {
      checkPage(36);
      // Field label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK_MUTED);
      doc.text(field.label, margin, y);
      y += 12;

      // Field value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const valueStr =
        field.value == null
          ? "\u2014"
          : Array.isArray(field.value)
            ? field.value.join(", ")
            : String(field.value);
      const valLines = doc.splitTextToSize(valueStr, contentWidth);
      for (const line of valLines) {
        checkPage(14);
        doc.text(line, margin, y);
        y += 14;
      }
      y += 8;
    }
    y += 4;
  }

  // ── Notes ──────────────────────────────────────────────────────────────
  if (options.includeNotes && item.notes) {
    checkPage(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...GOLD);
    doc.text("Notes", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(item.notes, contentWidth);
    for (const line of noteLines) {
      checkPage(14);
      doc.text(line, margin, y);
      y += 14;
    }
    y += 12;
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerY = pageHeight - 30;
  doc.setDrawColor(...GOLD_PALE);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, margin + contentWidth, footerY - 8);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MUTED);
  doc.text(
    `Ananya Wedding Checklist  \u00B7  Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    footerY,
  );

  return doc.output("blob");
}
