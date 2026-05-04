// ──────────────────────────────────────────────────────────────────────────
// Readiness report PDF export.
//
// Branded one-or-two-page PDF capturing the tier, score, top priorities,
// and what-can-wait list. Drawn with jsPDF primitives — no html2canvas, so
// it stays sharp at any scale and ships at a small file size.
// ──────────────────────────────────────────────────────────────────────────

import jsPDF from "jspdf";

import type { ReadinessResult } from "@/types/readiness";

const C_WINE: [number, number, number] = [75, 21, 40];
const C_PINK: [number, number, number] = [212, 83, 126];
const C_MAUVE: [number, number, number] = [138, 96, 112];
const C_GOLD: [number, number, number] = [212, 168, 83];
const C_PAPER: [number, number, number] = [255, 245, 235];
const C_CREAM: [number, number, number] = [255, 248, 242];

export function exportReadinessPdf(result: ReadinessResult): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── Header band ─────────────────────────────────────────────────────────
  doc.setFillColor(...C_CREAM);
  doc.rect(0, 0, pageW, 46, "F");

  doc.setTextColor(...C_PINK);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("✿ the marigold readiness check", margin, 13);

  doc.setTextColor(...C_WINE);
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.text("Where you actually stand.", margin, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C_MAUVE);
  doc.text(
    "A personalized readiness report from The Marigold tools.",
    margin,
    34,
  );

  doc.setDrawColor(...C_PINK);
  doc.setLineWidth(0.4);
  doc.line(margin, 42, pageW - margin, 42);

  // ── Tier card ───────────────────────────────────────────────────────────
  let y = 54;
  doc.setFillColor(...C_PAPER);
  doc.setDrawColor(...C_WINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 38, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("YOUR READINESS", margin + 6, y + 9);

  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.setTextColor(...C_WINE);
  doc.text(result.tierLabel, margin + 6, y + 20);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...C_MAUVE);
  const blurbWrapped = doc.splitTextToSize(result.tierBlurb, contentW - 12);
  doc.text(blurbWrapped.slice(0, 2), margin + 6, y + 27);

  // Score circle on the right
  const cx = pageW - margin - 18;
  const cy = y + 19;
  doc.setFillColor(...C_PINK);
  doc.circle(cx, cy, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.text(String(Math.round(result.score)), cx, cy + 2, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("/100", cx, cy + 8, { align: "center" });

  y += 48;

  // ── Top priorities ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("YOUR TOP 5 RIGHT NOW", margin, y);
  y += 6;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  for (const item of result.priorities) {
    if (y > pageH - 60) {
      doc.addPage();
      y = margin + 8;
    }

    // Rank
    doc.setFont("times", "italic");
    doc.setFontSize(28);
    doc.setTextColor(...C_PINK);
    doc.text(String(item.rank).padStart(2, "0"), margin, y + 6);

    // Action
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...C_WINE);
    const action = doc.splitTextToSize(item.action, contentW - 18);
    doc.text(action, margin + 14, y + 4);

    let inner = y + 4 + action.length * 5;

    // Why
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_MAUVE);
    const why = doc.splitTextToSize(item.why, contentW - 18);
    doc.text(why, margin + 14, inner + 2);
    inner += 2 + why.length * 4.2;

    // Timeframe
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C_WINE);
    doc.text("Timeframe:", margin + 14, inner + 4);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...C_MAUVE);
    const tfText = doc.splitTextToSize(item.timeframe, contentW - 36);
    doc.text(tfText, margin + 33, inner + 4);
    inner += 4 + tfText.length * 4;

    if (item.budgetNote) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_GOLD);
      doc.text("Budget:", margin + 14, inner + 4);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C_MAUVE);
      const bn = doc.splitTextToSize(item.budgetNote, contentW - 30);
      doc.text(bn, margin + 28, inner + 4);
      inner += 4 + bn.length * 4;
    }

    y = inner + 8;
    doc.setDrawColor(220, 200, 210);
    doc.setLineWidth(0.15);
    doc.line(margin + 14, y - 4, pageW - margin, y - 4);
  }

  // ── What can wait ───────────────────────────────────────────────────────
  if (y > pageH - 70) {
    doc.addPage();
    y = margin + 8;
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("WHAT CAN WAIT — BREATHE", margin, y);
  y += 6;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  for (const item of result.canWait) {
    if (y > pageH - 25) {
      doc.addPage();
      y = margin + 8;
    }
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...C_WINE);
    doc.text(item.label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_MAUVE);
    const detail = doc.splitTextToSize(item.detail, contentW - 4);
    doc.text(detail, margin, y + 5);
    y += 5 + detail.length * 4.2 + 5;
  }

  // ── Footer on every page ────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C_GOLD);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

    doc.setTextColor(...C_MAUVE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("the marigold · readiness check", margin, pageH - 9);

    doc.setFont("helvetica", "italic");
    doc.text(
      "build the rest at themarigold.com — no signup needed for this part",
      pageW - margin,
      pageH - 9,
      { align: "right" },
    );
  }

  return doc;
}

export function downloadReadinessPdf(filename: string, doc: jsPDF) {
  doc.save(filename);
}
