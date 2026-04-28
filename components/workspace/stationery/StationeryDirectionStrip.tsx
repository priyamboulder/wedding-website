"use client";

// ── Stationery direction strip ────────────────────────────────────────────
// A thin always-on strip that sits above the working tabs (Suite Builder,
// Print Matrix, etc.). Summarises the vision-level direction — print
// method, palette source, motif language — and flashes the next critical-
// path date so the couple never forgets what they're racing against.

import { useMemo } from "react";
import { Clock, Printer, Palette, Shapes } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  STATIONERY_MOTIF_LABEL,
  STATIONERY_PRINT_METHOD_LABEL,
  type StationeryPrintMethod,
} from "@/types/stationery";
import {
  computeStationeryTimeline,
  formatStationeryDate,
} from "@/lib/stationery/timeline";
import { Eyebrow } from "@/components/workspace/blocks/primitives";

const PRINT_METHODS: StationeryPrintMethod[] = [
  "letterpress",
  "foil",
  "flat_premium",
  "digital",
  "hybrid",
];

export function StationeryDirectionStrip() {
  const printMethod = useStationeryStore((s) => s.primaryPrintMethod);
  const setPrintMethod = useStationeryStore((s) => s.setPrimaryPrintMethod);
  const paletteSource = useStationeryStore((s) => s.paletteSource);
  const setPaletteSource = useStationeryStore((s) => s.setPaletteSource);
  const motif = useStationeryStore((s) => s.visualIdentity.motif);

  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const timeline = useMemo(
    () => computeStationeryTimeline(weddingDate, printMethod),
    [weddingDate, printMethod],
  );

  const bottleneck = useMemo(() => {
    if (!timeline) return null;
    const cands = [
      {
        label: "Design approval",
        date: timeline.designApprovalBy,
        days: timeline.daysUntilDesignApproval,
      },
      {
        label: "Mail by (domestic)",
        date: timeline.mailBy,
        days: timeline.daysUntilMail,
      },
      {
        label: "RSVPs due",
        date: timeline.rsvpDue,
        days: timeline.daysUntilRsvp,
      },
    ].filter((c) => c.days >= 0);
    return cands.sort((a, b) => a.days - b.days)[0] ?? null;
  }, [timeline]);

  return (
    <section className="mb-5 rounded-md border border-border bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <DirectionChip icon={<Printer size={12} strokeWidth={1.8} />} label="Primary print">
          <select
            value={printMethod}
            onChange={(e) =>
              setPrintMethod(e.target.value as StationeryPrintMethod)
            }
            className="rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[12px] font-medium text-ink hover:border-border focus:border-saffron focus:outline-none"
          >
            {PRINT_METHODS.map((m) => (
              <option key={m} value={m}>
                {STATIONERY_PRINT_METHOD_LABEL[m]}
              </option>
            ))}
          </select>
        </DirectionChip>

        <DirectionChip icon={<Palette size={12} strokeWidth={1.8} />} label="Palette">
          <button
            type="button"
            onClick={() =>
              setPaletteSource(
                paletteSource === "wedding" ? "independent" : "wedding",
              )
            }
            className="rounded-sm px-1 py-0.5 text-[12px] font-medium text-ink hover:text-saffron"
          >
            {paletteSource === "wedding"
              ? "Wedding palette (Décor)"
              : "Independent palette"}
          </button>
        </DirectionChip>

        <DirectionChip icon={<Shapes size={12} strokeWidth={1.8} />} label="Motif">
          <span className="text-[12px] font-medium text-ink">
            {STATIONERY_MOTIF_LABEL[motif]}
          </span>
        </DirectionChip>

        {bottleneck && (
          <DirectionChip
            icon={<Clock size={12} strokeWidth={1.8} />}
            label="Next deadline"
            tone="saffron"
          >
            <span className="text-[12px] font-medium text-ink">
              {bottleneck.label} · {formatStationeryDate(bottleneck.date)}
            </span>
            <span
              className={cn(
                "ml-1.5 font-mono text-[10px]",
                bottleneck.days < 14 ? "text-rose" : "text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {bottleneck.days === 0 ? "today" : `in ${bottleneck.days} days`}
            </span>
          </DirectionChip>
        )}
      </div>
    </section>
  );
}

function DirectionChip({
  icon,
  label,
  children,
  tone = "ink",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: "ink" | "saffron";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5",
        tone === "saffron" ? "border-saffron/40" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-sm",
          tone === "saffron"
            ? "bg-saffron-pale/60 text-saffron"
            : "bg-ivory-warm text-ink-muted",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-0.5 flex items-baseline">{children}</div>
      </div>
    </div>
  );
}
