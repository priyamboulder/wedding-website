"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  REPORT_REASON_LABELS,
  type ReportReason,
} from "@/types/marketplace";

// Shared marketplace report dialog. Used from both the listing detail page
// and inline card affordances. Keeps the modal styling and reason list in
// one place so they don't drift apart.

export function ReportListingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => void;
}) {
  const [reason, setReason] = useState<ReportReason>("inaccurate_photos");
  const [details, setDetails] = useState("");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-xl border border-gold/20 bg-ivory p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — report this listing —
            </p>
            <h2 className="mt-2 font-serif text-[20px] text-ink">
              Let us know what&rsquo;s off.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {Object.entries(REPORT_REASON_LABELS).map(([k, label]) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink hover:border-gold/30"
            >
              <input
                type="radio"
                name="report-reason"
                value={k}
                checked={reason === k}
                onChange={() => setReason(k as ReportReason)}
                className="accent-gold"
              />
              {label}
            </label>
          ))}
        </div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Anything else we should know? (optional)"
          className="mt-4 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink outline-none focus:border-gold"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-gold/30 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(reason, details.trim() || undefined)}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}
