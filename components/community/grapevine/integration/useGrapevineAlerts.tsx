"use client";

// ── Grapevine alert hooks ───────────────────────────────────────────────────
// Two thin wrappers over the store:
//   - useGrapevineAlert(vendorId) — single-vendor lookup, used on storefronts
//     and individual checklist rows.
//   - useGrapevineAlertsBatch(vendorIds) — list-view lookup; the store does
//     a single pass to avoid N+1 reads when shortlists/Roulette are open.
// Both honour the spec's threshold (3+ active threads in alert-eligible
// topic categories before the amber dot fires).

import { useMemo } from "react";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { GRAPEVINE_VENDOR_ALERT_THRESHOLD } from "@/lib/community/grapevine";
import type { GrapevineVendorAlertSummary } from "@/types/grapevine";

export interface GrapevineAlert {
  has_alert: boolean;
  thread_count: number;
  summary: GrapevineVendorAlertSummary | null;
}

export function useGrapevineAlert(vendorId?: string): GrapevineAlert {
  // Subscribe to the threads array so the alert refreshes when posts change.
  const threads = useGrapevineStore((s) => s.threads);
  return useMemo<GrapevineAlert>(() => {
    if (!vendorId)
      return { has_alert: false, thread_count: 0, summary: null };
    const summary = useGrapevineStore.getState().getVendorAlertSummary(vendorId);
    return {
      has_alert:
        !!summary && summary.thread_count >= GRAPEVINE_VENDOR_ALERT_THRESHOLD,
      thread_count: summary?.thread_count ?? 0,
      summary,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, vendorId]);
}

export function useGrapevineAlertsBatch(
  vendorIds: string[],
): Record<string, GrapevineAlert> {
  const threads = useGrapevineStore((s) => s.threads);
  // Stable string key so callers passing array literals don't thrash the memo.
  const idsKey = vendorIds.join(",");
  return useMemo(() => {
    const summaries = useGrapevineStore
      .getState()
      .getVendorAlertSummaries(vendorIds);
    const out: Record<string, GrapevineAlert> = {};
    for (const id of vendorIds) {
      const summary = summaries[id] ?? null;
      out[id] = {
        has_alert:
          !!summary && summary.thread_count >= GRAPEVINE_VENDOR_ALERT_THRESHOLD,
        thread_count: summary?.thread_count ?? 0,
        summary,
      };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, idsKey]);
}
