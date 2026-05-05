"use client";

// ── PlanningPulse ──────────────────────────────────────────────────────
// Compact 4-row block at the top of the right column. Each row:
// label (small caps Inter) + primary number (Cormorant) + description
// (Outfit gray) + arrow link, with a thin dusty-blush progress bar
// underneath. Total height ~170px.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useChecklistStore } from "@/stores/checklist-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import { useFinanceStore } from "@/stores/finance-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface StatRowProps {
  href: string;
  label: string;
  primary: string;
  description: string;
  progress?: number;
}

function StatRow({ href, label, primary, description, progress }: StatRowProps) {
  return (
    <Link href={href} className="group block">
      <div className="flex items-baseline gap-3 py-1">
        <span
          className="w-[68px] shrink-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "Inter, var(--font-sans), sans-serif", fontWeight: 500 }}
        >
          {label}
        </span>
        <span
          className="font-serif text-[16px] leading-none text-[color:var(--dash-text)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
          }}
        >
          {primary}
        </span>
        <span
          className="min-w-0 flex-1 truncate text-[12px] text-[color:var(--dash-text-muted)]"
          style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
        >
          {description}
        </span>
        <ArrowUpRight
          size={11}
          strokeWidth={1.8}
          className="shrink-0 text-[color:var(--dash-text-faint)] transition-colors group-hover:text-[color:var(--dash-blush-deep)]"
        />
      </div>
      {progress != null && (
        <div className="ml-[80px] h-[2px] rounded-full bg-[color:var(--dash-blush-soft)]">
          <div
            className="h-full rounded-full bg-[color:var(--dash-blush)] transition-all"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
    </Link>
  );
}

export function PlanningPulse() {
  const items = useChecklistStore((s) => s.items);
  const phases = useChecklistStore((s) => s.phases);
  const roster = useGuestRosterStore((s) => s.entries);
  const totalBudgetCents = useFinanceStore(
    (s) => s.settings.total_budget_cents,
  );
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useWorkspaceStore((s) => s.categories);

  const totalTasks = items.length;
  const doneTasks = items.filter((i) => i.status === "done").length;
  const checklistProgress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const currentPhase = phases.find((p) => {
    const phItems = items.filter((i) => i.phase_id === p.id);
    if (phItems.length === 0) return false;
    return phItems.some(
      (i) => i.status !== "done" && i.status !== "not_applicable",
    );
  });

  const guestCount = roster.length;
  const spentCents = transactions.reduce(
    (acc, t) => acc + (t.amount_cents ?? 0),
    0,
  );
  const budgetProgress =
    totalBudgetCents > 0 ? Math.min(1, spentCents / totalBudgetCents) : 0;

  const bookedVendors = categories.filter((c) => c.status === "assigned").length;
  const totalVendorCats = categories.length;
  const vendorProgress =
    totalVendorCats > 0 ? bookedVendors / totalVendorCats : 0;

  return (
    <section>
      <h2 className="dash-section-title mb-2">Planning at a glance</h2>
      <div className="flex flex-col gap-2">
        <StatRow
          href="/checklist"
          label="Checklist"
          primary={`${doneTasks} / ${totalTasks}`}
          description={currentPhase?.title ?? "All phases set"}
          progress={checklistProgress}
        />
        <StatRow
          href="/guests"
          label="Guests"
          primary={`${guestCount}`}
          description={
            guestCount === 0 ? "Start your guest list" : "on the roster"
          }
        />
        <StatRow
          href="/finance"
          label="Budget"
          primary={
            totalBudgetCents > 0
              ? `$${Math.round(spentCents / 100).toLocaleString()}`
              : "Not set"
          }
          description={
            totalBudgetCents > 0
              ? `of $${Math.round(totalBudgetCents / 100).toLocaleString()}`
              : "Tap to set"
          }
          progress={totalBudgetCents > 0 ? budgetProgress : undefined}
        />
        <StatRow
          href="/vendors"
          label="Vendors"
          primary={`${bookedVendors} / ${totalVendorCats}`}
          description={
            bookedVendors === 0 ? "None booked" : "categories booked"
          }
          progress={vendorProgress}
        />
      </div>
    </section>
  );
}
