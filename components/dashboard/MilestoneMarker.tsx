"use client";

// ── MilestoneMarker ────────────────────────────────────────────────────
// "Moments worth marking" card. Watches platform state and surfaces the
// most recent un-dismissed milestone as a quiet, gold-foil-stamped card.
// Dismissed milestones stay in the store and feed the Planning Journal
// timeline + Year in Review.
//
// The detector is run on every relevant data change via `useEffect`,
// idempotent thanks to the store's `triggerIfNew` guard. New milestones
// fire silently — only the latest active one shows up here.

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Sparkle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useEventsStore } from "@/stores/events-store";
import { useFinanceStore } from "@/stores/finance-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import { useMilestonesStore } from "@/stores/milestones-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { detectMilestones } from "@/lib/dashboard/milestone-triggers";

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MilestoneMarker() {
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const checklistItems = useChecklistStore((s) => s.items);

  const events = useEventsStore((s) => s.events);
  const programDiscoveryComplete = useEventsStore(
    (s) => s.coupleContext.programDiscoveryComplete ?? false,
  );

  const totalBudgetCents = useFinanceStore((s) => s.settings.total_budget_cents);
  const transactions = useFinanceStore((s) => s.transactions);

  const roster = useGuestRosterStore((s) => s.entries);
  const categories = useWorkspaceStore((s) => s.categories);

  const milestones = useMilestonesStore((s) => s.milestones);
  const triggerIfNew = useMilestonesStore((s) => s.triggerIfNew);
  const dismiss = useMilestonesStore((s) => s.dismiss);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );

  // Sum of category budget allocations — used to detect "fully mapped".
  const allocatedBudget = useMemo(
    () =>
      categories.reduce(
        (acc, c) => acc + (c.budget_allocated ?? 0),
        0,
      ),
    [categories],
  );

  // Run detection any time the input data shifts. The store's
  // triggerIfNew guards against duplicate firings, so the effect can
  // be liberal about re-runs.
  useEffect(() => {
    const candidates = detectMilestones({
      weddingDate,
      events,
      guestCount: roster.length,
      workspaceCategories: categories,
      checklistItems,
      totalBudgetCents,
      allocatedBudget,
      programDiscoveryComplete,
      saveTheDatesSent: false,
      invitationsSent: false,
      outfitOrdered: false,
    });
    candidates.forEach((c) => triggerIfNew(c.type, c.message));
    void transactions;
  }, [
    weddingDate,
    events,
    roster.length,
    categories,
    checklistItems,
    totalBudgetCents,
    allocatedBudget,
    programDiscoveryComplete,
    transactions,
    triggerIfNew,
  ]);

  const active = useMemo(() => {
    const undismissed = milestones.filter((m) => !m.dismissed);
    if (undismissed.length === 0) return null;
    return undismissed.reduce((latest, m) =>
      new Date(m.triggeredAt).getTime() >
      new Date(latest.triggeredAt).getTime()
        ? m
        : latest,
    );
  }, [milestones]);

  if (!active) return null;

  return (
    <section
      aria-label="A milestone worth marking"
      className="relative rounded-[8px] px-6 py-5 text-left"
      style={{
        border: "1px solid var(--dash-gold)",
        background:
          "linear-gradient(180deg, rgba(201,169,110,0.06) 0%, var(--dash-canvas) 60%)",
        boxShadow: "var(--dash-shadow-sm)",
      }}
    >
      <button
        type="button"
        onClick={() => dismiss(active.id)}
        aria-label="Dismiss milestone"
        className="absolute right-3 top-3 rounded-full p-1 text-[color:var(--dash-text-faint)] transition-colors hover:bg-[color:var(--dash-blush-soft)] hover:text-[color:var(--dash-text)]"
      >
        <X size={13} strokeWidth={1.8} />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <Sparkle
          size={16}
          strokeWidth={1.4}
          className="mt-1 shrink-0 text-[color:var(--dash-gold)]"
          aria-hidden
          fill="currentColor"
          fillOpacity={0.25}
        />
        <div className="min-w-0">
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--dash-gold)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            A moment worth marking
          </p>
          <p
            className="mt-1 font-serif text-[20px] italic leading-snug text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            {active.message}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--dash-text-faint)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {dateLabel(active.triggeredAt)}
            </span>
            <Link
              href="/dashboard/milestones"
              className="text-[11px] font-medium text-[color:var(--dash-gold)] hover:text-[color:var(--dash-text)]"
            >
              View all milestones →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
