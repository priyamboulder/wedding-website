"use client";

// ── Amber indicator ─────────────────────────────────────────────────────────
// Inline amber notice surfaced on vendor storefront pages and full vendor
// rows. Links into the Grapevine filtered to the tagged vendor.

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function AmberIndicator({
  vendorId,
  threadCount,
}: {
  vendorId: string;
  threadCount: number;
}) {
  if (threadCount <= 0) return null;
  return (
    <Link
      href={`/community?tab=the-grapevine&vendor=${vendorId}`}
      className="flex items-center gap-3 rounded-xl border border-saffron/40 bg-saffron/10 px-4 py-3 text-[12.5px] text-ink transition-colors hover:bg-saffron/15"
    >
      <AlertTriangle
        size={15}
        strokeWidth={1.8}
        className="shrink-0 text-saffron"
      />
      <span className="flex-1">
        <span className="font-medium">discussed in the grapevine.</span>{" "}
        <span className="text-ink-muted">
          {threadCount === 1
            ? "1 brides-only thread mentions this vendor."
            : `${threadCount} brides-only threads mention this vendor.`}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-saffron">
        view
        <ArrowRight size={12} strokeWidth={2} />
      </span>
    </Link>
  );
}
