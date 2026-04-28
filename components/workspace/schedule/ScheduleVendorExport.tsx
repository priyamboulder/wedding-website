"use client";

// ── ScheduleVendorExport ───────────────────────────────────────────────────
// Per-vendor grouped view with a printable "vendor sheet" per section. Each
// section shows the assigned slots plus one adjacent item before/after so
// the vendor knows who they follow and who follows them. A planner-only
// "Unassigned" section at the bottom surfaces items that still need a
// vendor tagged.

import { Copy, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleItem, VendorExportEntry } from "@/types/schedule";
import { formatTime12h, formatTimeRange } from "@/lib/schedule/data";

interface Props {
  entries: VendorExportEntry[];
  unassignedItems: ScheduleItem[];
  eventLabel: string;
  eventDate: string | null;
  venueName: string | null;
}

export function ScheduleVendorExport({
  entries,
  unassignedItems,
  eventLabel,
  eventDate,
  venueName,
}: Props) {
  if (entries.length === 0 && unassignedItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="section-eyebrow">VENDOR VIEW</p>
        <h2 className="section-title mt-2">No schedule yet</h2>
        <p className="section-description mx-auto mt-2">
          Draft or build a timeline first, then assign vendors from the
          detail drawer.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">VENDOR VIEW</p>
          <h2 className="section-title mt-1">{eventLabel} — by vendor</h2>
          <p className="section-description mt-2">
            Each vendor sees only their slots plus the items immediately
            before and after, so they know their call time and hard stop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
        >
          <Printer size={12} strokeWidth={1.6} />
          Print all
        </button>
      </header>

      <div className="space-y-6">
        {entries.map((entry) => (
          <VendorBlock
            key={entry.vendor}
            entry={entry}
            eventLabel={eventLabel}
            eventDate={eventDate}
            venueName={venueName}
          />
        ))}
        {unassignedItems.length > 0 && (
          <UnassignedBlock items={unassignedItems} />
        )}
      </div>
    </div>
  );
}

function VendorBlock({
  entry,
  eventLabel,
  eventDate,
  venueName,
}: {
  entry: VendorExportEntry;
  eventLabel: string;
  eventDate: string | null;
  venueName: string | null;
}) {
  const isContext = (id: string) =>
    entry.contextItems.some((c) => c.id === id);

  const merged = [...entry.items, ...entry.contextItems].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  function handleCopy() {
    const lines: string[] = [];
    lines.push(`${entry.vendor} — ${eventLabel}`);
    if (eventDate) lines.push(`Date: ${eventDate}`);
    if (venueName) lines.push(`Venue: ${venueName}`);
    lines.push("");
    for (const item of merged) {
      const when = formatTimeRange(item.startTime, item.endTime);
      const loc = item.location ? ` · ${item.location}` : "";
      const tag = isContext(item.id) ? "  (context)" : "";
      lines.push(`${when}  ${item.label}${loc}${tag}`);
      if (item.notesForVendor && !isContext(item.id)) {
        lines.push(`    ↳ ${item.notesForVendor}`);
      }
    }
    navigator.clipboard?.writeText(lines.join("\n"));
  }

  return (
    <section className="rounded-lg border border-border bg-white px-6 py-5">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-ink">{entry.vendor}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            {entry.items.length} slot{entry.items.length === 1 ? "" : "s"}
            {eventDate ? ` · ${eventDate}` : ""}
            {venueName ? ` · ${venueName}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-ink-faint hover:text-ink print:hidden"
        >
          <Copy size={11} strokeWidth={1.6} />
          Copy
        </button>
      </header>

      <ul className="divide-y divide-border">
        {merged.map((item) => {
          const context = isContext(item.id);
          return (
            <li
              key={item.id}
              className={cn(
                "grid grid-cols-[140px_1fr] gap-3 py-2.5",
                context && "opacity-60",
              )}
            >
              <span className="font-mono text-[12px] tabular-nums text-ink-muted">
                {formatTimeRange(item.startTime, item.endTime)}
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-ink">
                  {item.label}
                  {context && (
                    <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                      context
                    </span>
                  )}
                </p>
                {(item.location || item.notesForVendor) && (
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    {item.location}
                    {item.location && item.notesForVendor && " · "}
                    {item.notesForVendor}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function UnassignedBlock({ items }: { items: ScheduleItem[] }) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-5">
      <header className="mb-3">
        <h3 className="text-[16px] font-semibold text-ink">Unassigned</h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          {items.length} item{items.length === 1 ? "" : "s"} · Assign vendors
          from the detail drawer
        </p>
      </header>
      <ul className="divide-y divide-border/60">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[120px_1fr] gap-3 py-2 text-[12.5px]"
          >
            <span className="font-mono tabular-nums text-ink-muted">
              {formatTime12h(item.startTime)}
            </span>
            <span className="text-ink">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
