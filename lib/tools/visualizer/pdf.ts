// ──────────────────────────────────────────────────────────────────────────
// Visualizer PDF export.
//
// Builds a print-friendly multi-page PDF from a generated VisualizerOutput.
// One page per spread of days (3 days fit per landscape page). Drawn with
// jsPDF primitives so we don't need html2canvas.
// ──────────────────────────────────────────────────────────────────────────

import jsPDF from "jspdf";

import type {
  VisualizerInputs,
  VisualizerOutput,
} from "@/types/visualizer";
import { formatClockTime, styleLabel, formatLabel } from "./scheduler";

// Brand-aligned colors (RGB tuples for jsPDF).
const C_WINE: [number, number, number] = [75, 21, 40];
const C_PINK: [number, number, number] = [212, 83, 126];
const C_MAUVE: [number, number, number] = [138, 96, 112];
const C_GOLD: [number, number, number] = [212, 168, 83];
const C_PAPER: [number, number, number] = [255, 245, 235];
const C_CREAM: [number, number, number] = [255, 248, 242];

export function exportTimelinePdf(
  output: VisualizerOutput,
  _inputs: VisualizerInputs,
): jsPDF {
  // Landscape A4: 297 x 210 mm
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageW = 297;
  const pageH = 210;
  const margin = 12;

  drawHeader(doc, output, pageW);

  const contentTop = 38;
  const contentBottom = pageH - 18;

  // 3 days per page.
  const daysPerPage = 3;
  const pageCount = Math.ceil(output.days.length / daysPerPage);

  for (let p = 0; p < pageCount; p++) {
    if (p > 0) {
      doc.addPage();
      drawHeader(doc, output, pageW);
    }
    const slice = output.days.slice(p * daysPerPage, (p + 1) * daysPerPage);
    const colWidth = (pageW - margin * 2 - 8 * (slice.length - 1)) / slice.length;
    slice.forEach((day, idx) => {
      const x = margin + idx * (colWidth + 8);
      drawDay(doc, day, x, contentTop, colWidth, contentBottom - contentTop);
    });
    drawFooter(doc, pageW, pageH);
  }

  return doc;
}

// ── Header ────────────────────────────────────────────────────────────────

function drawHeader(doc: jsPDF, output: VisualizerOutput, pageW: number) {
  // Cream stripe across the top.
  doc.setFillColor(...C_CREAM);
  doc.rect(0, 0, pageW, 32, "F");

  // Eyebrow scrawl.
  doc.setTextColor(...C_PINK);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("✿ the marigold weekend visualizer", 12, 11);

  // Title.
  doc.setTextColor(...C_WINE);
  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.text("Your wedding weekend, hour by hour", 12, 22);

  // Meta row right.
  const meta = `${formatLabel(output.format)} · ${styleLabel(output.weddingStyle)}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_MAUVE);
  doc.text(meta, pageW - 12, 22, { align: "right" });

  // Pink rule.
  doc.setDrawColor(...C_PINK);
  doc.setLineWidth(0.4);
  doc.line(12, 30, pageW - 12, 30);
}

// ── Day column ────────────────────────────────────────────────────────────

function drawDay(
  doc: jsPDF,
  day: VisualizerOutput["days"][number],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  // Card background.
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_WINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 3, 3, "FD");

  // Day header.
  doc.setTextColor(...C_PINK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`DAY ${day.dayNumber}`, x + 5, y + 7);

  doc.setTextColor(...C_WINE);
  doc.setFont("times", "italic");
  doc.setFontSize(15);
  const dayName = day.dayLabel.split(" — ")[1] ?? day.dayLabel;
  doc.text(dayName, x + 5, y + 14);

  // Divider.
  doc.setDrawColor(200, 180, 188);
  doc.setLineWidth(0.15);
  doc.line(x + 5, y + 17, x + w - 5, y + 17);

  // Events.
  let cursorY = y + 22;
  const blockWidth = w - 10;

  for (const event of day.events) {
    const blockHeight = estimateBlockHeight(doc, event.logisticsNote, blockWidth);
    if (cursorY + blockHeight > y + h - 5) break; // page-trim safety

    // Time strip.
    doc.setTextColor(...C_WINE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(
      `${formatClockTime(event.startMinutes)} – ${formatClockTime(event.endMinutes)}`,
      x + 5,
      cursorY,
    );

    // Block bg.
    const blockY = cursorY + 1.5;
    doc.setFillColor(...C_PAPER);
    doc.setDrawColor(220, 200, 210);
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 5, blockY, blockWidth, blockHeight - 1.5, 2, 2, "FD");

    // Pink left accent.
    doc.setFillColor(...C_PINK);
    doc.rect(x + 5, blockY, 1.2, blockHeight - 1.5, "F");

    // Event name.
    doc.setTextColor(...C_WINE);
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.text(`${event.icon}  ${event.name}`, x + 9, blockY + 6);

    // Duration label.
    doc.setTextColor(...C_MAUVE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const dur = `${event.durationHours}h`;
    doc.text(dur.toUpperCase(), x + w - 7, blockY + 6, { align: "right" });

    // Logistics note (wrapped).
    doc.setTextColor(...C_MAUVE);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    const wrapped = doc.splitTextToSize(event.logisticsNote, blockWidth - 8);
    doc.text(wrapped, x + 9, blockY + 11);

    cursorY = blockY + blockHeight + 3;
  }
}

function estimateBlockHeight(
  doc: jsPDF,
  note: string,
  blockWidth: number,
): number {
  doc.setFontSize(7);
  const lines = doc.splitTextToSize(note, blockWidth - 8);
  return 12 + Math.max(1, lines.length) * 3;
}

// ── Footer ────────────────────────────────────────────────────────────────

function drawFooter(doc: jsPDF, pageW: number, pageH: number) {
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.2);
  doc.line(12, pageH - 12, pageW - 12, pageH - 12);

  doc.setTextColor(...C_MAUVE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("the marigold · wedding weekend visualizer", 12, pageH - 7);

  doc.setFont("helvetica", "italic");
  doc.text(
    "build the rest at the marigold — no signup needed for this part",
    pageW - 12,
    pageH - 7,
    { align: "right" },
  );
}

export function downloadPdf(filename: string, doc: jsPDF) {
  doc.save(filename);
}
