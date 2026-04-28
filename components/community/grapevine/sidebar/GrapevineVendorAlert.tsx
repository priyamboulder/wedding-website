"use client";

// ── Sidebar vendor alert card ──────────────────────────────────────────────
// Collects vendors on the current bride's shortlist that have crossed the
// amber-alert threshold, and shows a single informational card linking
// into a filtered Grapevine view. Dismissals are per-vendor and persist
// in the Grapevine store.

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useVendorsStore } from "@/stores/vendors-store";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useGrapevineAlertsBatch } from "../integration/useGrapevineAlerts";

export function GrapevineVendorAlert() {
  const shortlist = useVendorsStore((s) => s.shortlist);
  const vendors = useVendorsStore((s) => s.vendors);
  const dismissed = useGrapevineStore((s) => s.dismissed_vendor_alerts);
  const dismiss = useGrapevineStore((s) => s.dismissVendorAlert);

  const shortlistedIds = useMemo(
    () => Array.from(new Set(shortlist.map((s) => s.vendor_id))),
    [shortlist],
  );
  const alerts = useGrapevineAlertsBatch(shortlistedIds);

  const flagged = useMemo(() => {
    return shortlistedIds
      .filter((id) => alerts[id]?.has_alert && !dismissed.includes(id))
      .map((id) => {
        const vendor = vendors.find((v) => v.id === id);
        return {
          id,
          name: vendor?.name ?? "a vendor on your shortlist",
          count: alerts[id]?.thread_count ?? 0,
        };
      });
  }, [shortlistedIds, alerts, dismissed, vendors]);

  if (flagged.length === 0) return null;

  // Show at most three vendor names inline; the rest collapse into "+N more".
  const display = flagged.slice(0, 3);
  const overflow = flagged.length - display.length;

  return (
    <section className="rounded-2xl border border-saffron/40 bg-saffron/8 p-5">
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          size={15}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-saffron"
        />
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            heads up
          </p>
          <p className="mt-1 font-serif text-[15px] italic leading-snug text-ink">
            vendors on your shortlist have been mentioned in the grapevine.
          </p>
          <ul className="mt-3 space-y-2">
            {display.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-3 text-[12.5px]"
              >
                <Link
                  href={`/community?tab=the-grapevine&vendor=${v.id}`}
                  className="min-w-0 flex-1 truncate font-medium text-ink hover:underline"
                >
                  {v.name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-muted">
                    {v.count} thread{v.count === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => dismiss(v.id)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-faint hover:bg-ink/10 hover:text-ink"
                    aria-label={`dismiss alert for ${v.name}`}
                  >
                    <X size={10} strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
            {overflow > 0 && (
              <li className="text-[11.5px] italic text-ink-muted">
                + {overflow} more
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
