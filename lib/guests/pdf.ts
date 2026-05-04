// ──────────────────────────────────────────────────────────────────────────
// Guest Count PDF export.
//
// Branded breakdown — total range, side-by-side table, per-event chart,
// and insights — all drawn with jsPDF primitives. The PDF is the primary
// share artifact ("text it to your parents before the next family call").
// ──────────────────────────────────────────────────────────────────────────

import jsPDF from "jspdf";

import type { EstimateOutput, GuestEstimateState } from "@/types/guests";

import { TIERS, TIER_ORDER } from "./defaults";

const C_WINE: [number, number, number] = [75, 21, 40];
const C_PINK: [number, number, number] = [212, 83, 126];
const C_MAUVE: [number, number, number] = [138, 96, 112];
const C_GOLD: [number, number, number] = [212, 168, 83];
const C_PAPER: [number, number, number] = [255, 245, 235];
const C_CREAM: [number, number, number] = [255, 248, 242];
const C_BAR: [number, number, number] = [212, 83, 126];
const C_BAR_DIM: [number, number, number] = [212, 168, 83];

export function exportGuestPdf(
  state: GuestEstimateState,
  output: EstimateOutput,
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── Header band ────────────────────────────────────────────────────────
  doc.setFillColor(...C_CREAM);
  doc.rect(0, 0, pageW, 46, "F");
  doc.setTextColor(...C_PINK);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("✿ the marigold guest count estimator", margin, 13);
  doc.setTextColor(...C_WINE);
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.text("Your real number.", margin, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C_MAUVE);
  doc.text(
    "A defensible breakdown — both sides, every tier, every event.",
    margin,
    34,
  );
  doc.setDrawColor(...C_PINK);
  doc.setLineWidth(0.4);
  doc.line(margin, 42, pageW - margin, 42);

  // ── Range card ─────────────────────────────────────────────────────────
  let y = 54;
  doc.setFillColor(...C_PAPER);
  doc.setDrawColor(...C_WINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 38, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("YOUR ESTIMATED GUEST COUNT", margin + 6, y + 9);

  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(...C_WINE);
  doc.text(
    `${output.totalRange.low} – ${output.totalRange.high}`,
    margin + 6,
    y + 24,
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...C_MAUVE);
  const eventCount = state.events.length;
  doc.text(
    `across ${eventCount} event${eventCount === 1 ? "" : "s"} · ${output.totalNames} total names on the list`,
    margin + 6,
    y + 32,
  );

  y += 48;

  // ── Side-by-side breakdown ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("SIDE BY SIDE", margin, y);
  y += 4;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Header row
  const colW = contentW / 4;
  const enabledSides = output.bySide.filter((s) => s.enabled);
  const sharedTotal = TIER_ORDER.reduce((acc, t) => {
    const sideSum = output.bySide.reduce(
      (a, s) => a + (s.enabled ? s.byTier[t] : 0),
      0,
    );
    const tier = output.byTier.find((x) => x.tierId === t)?.count ?? 0;
    return acc + Math.max(0, tier - sideSum);
  }, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_WINE);
  doc.text("Tier", margin, y);
  let cx = margin + colW * 1.2;
  for (const s of enabledSides) {
    doc.text(s.label, cx, y, { align: "center" });
    cx += colW;
  }
  doc.text("Total", pageW - margin, y, { align: "right" });
  y += 4;
  doc.setDrawColor(220, 200, 210);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const tierId of TIER_ORDER) {
    const tierName = TIERS.find((t) => t.id === tierId)?.name ?? tierId;
    doc.setTextColor(...C_WINE);
    doc.setFont("times", "italic");
    doc.text(tierName, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C_MAUVE);
    let cx2 = margin + colW * 1.2;
    for (const s of enabledSides) {
      doc.text(String(s.byTier[tierId]), cx2, y, { align: "center" });
      cx2 += colW;
    }
    const total = output.byTier.find((x) => x.tierId === tierId)?.count ?? 0;
    doc.setTextColor(...C_WINE);
    doc.setFont("helvetica", "bold");
    doc.text(String(total), pageW - margin, y, { align: "right" });
    y += 6;
  }

  // Total row
  doc.setDrawColor(...C_GOLD);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C_WINE);
  doc.text("Total names", margin, y);
  let cx3 = margin + colW * 1.2;
  for (const s of enabledSides) {
    doc.text(String(s.totalNames), cx3, y, { align: "center" });
    cx3 += colW;
  }
  doc.text(String(output.totalNames), pageW - margin, y, { align: "right" });
  y += 10;

  if (sharedTotal > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...C_MAUVE);
    doc.text(
      `Shared (couple's friends + professional): ${sharedTotal} — counted in totals.`,
      margin,
      y,
    );
    y += 6;
  }

  // ── Per-event chart ────────────────────────────────────────────────────
  if (y > pageH - 80) {
    doc.addPage();
    y = margin + 8;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("PER-EVENT ESTIMATES", margin, y);
  y += 4;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const maxCount = Math.max(1, ...output.byEvent.map((e) => e.estimatedCount));
  const labelW = 50;
  const barFieldW = contentW - labelW - 18;
  for (const evt of output.byEvent) {
    if (y > pageH - 30) {
      doc.addPage();
      y = margin + 8;
    }
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...C_WINE);
    doc.text(evt.name, margin, y);

    const ratio = evt.estimatedCount / maxCount;
    const barW = Math.max(2, ratio * barFieldW);
    const barColor =
      evt.slug === "ceremony" || evt.slug === "reception" ? C_BAR : C_BAR_DIM;
    doc.setFillColor(...barColor);
    doc.roundedRect(margin + labelW, y - 4, barW, 5, 1.2, 1.2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C_WINE);
    doc.text(String(evt.estimatedCount), pageW - margin, y, { align: "right" });
    y += 10;
  }

  // ── Cost preview ───────────────────────────────────────────────────────
  if (y > pageH - 50) {
    doc.addPage();
    y = margin + 8;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_PINK);
  doc.text("COST PREVIEW", margin, y);
  y += 4;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C_MAUVE);
  doc.text(
    `At $${state.costPerHead}/guest (DFW Indian-wedding average for food + venue):`,
    margin,
    y,
  );
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(...C_WINE);
  doc.text(
    `$${formatNum(output.costEstimate.low)} – $${formatNum(output.costEstimate.high)}`,
    margin,
    y,
  );
  y += 10;

  // ── Insights ───────────────────────────────────────────────────────────
  if (output.insights.length > 0) {
    if (y > pageH - 50) {
      doc.addPage();
      y = margin + 8;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C_PINK);
    doc.text("WHAT THIS TELLS US", margin, y);
    y += 4;
    doc.setDrawColor(...C_GOLD);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    for (const insight of output.insights) {
      if (y > pageH - 25) {
        doc.addPage();
        y = margin + 8;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C_MAUVE);
      const lines = doc.splitTextToSize(insight, contentW - 6);
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 4;
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C_GOLD);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
    doc.setTextColor(...C_MAUVE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("the marigold · guest count estimator", margin, pageH - 9);
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

export function downloadGuestPdf(filename: string, doc: jsPDF) {
  doc.save(filename);
}

function formatNum(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(Math.round(n));
}
