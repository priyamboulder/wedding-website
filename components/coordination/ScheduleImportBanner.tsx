"use client";

// ── Schedule → Coordination import banner ──────────────────────────────────
// When the Schedule Builder has items tagged with platform vendors but the
// coordination hub is empty, offer a one-click import. Review-first opens a
// preview modal.

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useScheduleStore } from "@/stores/schedule-store";
import { useEventsStore } from "@/stores/events-store";
import { useVendorsStore } from "@/stores/vendors-store";
import {
  applyImport,
  buildImportPreview,
  countImportableRows,
  type ImportPreviewRow,
} from "@/lib/coordination/schedule-import";
import { formatEventDate, formatTime } from "@/lib/coordination/format";

export function ScheduleImportBanner() {
  const scheduleItems = useScheduleStore((s) => s.items);
  const events = useEventsStore((s) => s.events);
  const platformVendors = useVendorsStore((s) => s.vendors);
  const count = useMemo(
    () => countImportableRows(scheduleItems, platformVendors),
    [scheduleItems, platformVendors],
  );
  const [reviewOpen, setReviewOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (count === 0) return null;
  if (result) {
    return (
      <section className="mb-6 rounded-lg border border-sage/30 bg-sage-pale/30 px-5 py-4 text-[12.5px] text-ink-soft">
        {result}
      </section>
    );
  }

  const preview = buildImportPreview(scheduleItems, events, platformVendors);
  const uniqueVendors = new Set(preview.map((r) => r.vendorId)).size;

  return (
    <section className="mb-6 flex flex-col gap-3 rounded-lg border border-gold/25 bg-gold-pale/30 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles size={16} strokeWidth={1.8} className="mt-0.5 text-gold" />
        <div>
          <p className="font-serif text-[14px] text-ink">
            <span className="font-medium">Import from your schedule</span> —{" "}
            <span className="text-ink-muted italic">
              we found {count} schedule item{count === 1 ? "" : "s"} tagged with{" "}
              {uniqueVendors} vendor{uniqueVendors === 1 ? "" : "s"}.
            </span>
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Auto-populate the coordination timeline — you can edit anything
            afterwards.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          className="rounded-md border border-gold/30 bg-white px-3 py-1.5 text-[11.5px] font-medium text-gold hover:bg-gold-pale/40"
        >
          Review first
        </button>
        <button
          type="button"
          onClick={() => {
            const r = applyImport(preview, platformVendors);
            setResult(
              `Imported ${r.createdVendors} vendor${r.createdVendors === 1 ? "" : "s"} and ${r.createdAssignments} assignment${r.createdAssignments === 1 ? "" : "s"}.`,
            );
          }}
          className="rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90"
        >
          Import all
        </button>
      </div>

      {reviewOpen ? (
        <ImportPreviewModal
          rows={preview}
          onClose={() => setReviewOpen(false)}
          onConfirm={() => {
            const r = applyImport(preview, platformVendors);
            setReviewOpen(false);
            setResult(
              `Imported ${r.createdVendors} vendor${r.createdVendors === 1 ? "" : "s"} and ${r.createdAssignments} assignment${r.createdAssignments === 1 ? "" : "s"}.`,
            );
          }}
        />
      ) : null}
    </section>
  );
}

function ImportPreviewModal({
  rows,
  onClose,
  onConfirm,
}: {
  rows: ImportPreviewRow[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const byVendor = new Map<string, ImportPreviewRow[]>();
  for (const row of rows) {
    const list = byVendor.get(row.vendorName) ?? [];
    list.push(row);
    byVendor.set(row.vendorName, list);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              Preview
            </p>
            <h2 className="mt-0.5 font-serif text-[22px] text-ink">
              import from schedule.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {Array.from(byVendor.entries()).map(([vendorName, vendorRows]) => (
            <article
              key={vendorName}
              className="rounded-lg border border-gold/15 px-4 py-3"
            >
              <h3 className="font-serif text-[15px] text-ink">{vendorName}</h3>
              <ul className="mt-1.5 flex flex-col gap-1 text-[12px] text-ink-soft">
                {vendorRows.map((r, i) => (
                  <li key={i}>
                    · <strong>{r.eventName}</strong> —{" "}
                    {formatEventDate(r.eventDate)} ·{" "}
                    {formatTime(r.serviceStart)} – {formatTime(r.serviceEnd)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gold/10 bg-white px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Import all
          </button>
        </div>
      </div>
    </div>
  );
}
