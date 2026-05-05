"use client";

// ── Generic workspace canvas ────────────────────────────────────────────────
// The shell every purpose-built category canvas renders inside of. Mirrors
// the layout Photography pioneered: header with status dot + title + actions,
// persistent upcoming-tasks strip, vendor-preview banner, tab navigation,
// and a scrollable body.
//
// Photography keeps its own bespoke PhotographyCanvas for now. New categories
// (catering, videography, décor, etc.) each ship a thin wrapper that passes
// their tab config and renderTab function to this component.

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { ChevronRight, Eye, Send, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useFinanceStore } from "@/stores/finance-store";
import { formatDollarsShort } from "@/lib/finance/format";
import type { WorkspaceCategory } from "@/types/workspace";
import { STATUS_DOT, STATUS_LABEL } from "@/types/workspace";
import type { FinanceCategoryId } from "@/types/finance";
import type { CategoryTabDef } from "@/lib/workspace/category-tabs";
import { RoleSwitcher } from "./photography/RoleSwitcher";
import { UndoToastHost } from "./editable/UndoToast";

export interface WorkspaceCanvasProps<TabId extends string> {
  category: WorkspaceCategory;
  // Shown next to the title. Usually the same lucide icon the sidebar uses.
  categoryIcon: ElementType;
  // Eyebrow suffix, e.g. "Catering" → "Workspace · Catering".
  eyebrowSuffix: string;
  // Ordered list of tabs; first is active on mount.
  tabs: CategoryTabDef<TabId>[];
  // Tab ids that should render full-width (no max-w wrapper), like the
  // photography shot list's two-pane layout.
  fullWidthTabIds?: TabId[];
  // Called with the active tab id + a nav callback tabs can use to hop to
  // another tab (e.g., Overview's "See all" chevron jumps to Shortlist).
  renderTab: (tab: TabId, setTab: (t: TabId) => void) => ReactNode;
  // Optional extra content rendered alongside budget/invite in the actions
  // cluster. Photography uses this for a vision-progress ring.
  headerActions?: ReactNode;
  // Optional content rendered between the title row and the tabs nav.
  // Photography uses this for the guided/manual mode pill.
  subHeader?: ReactNode;
  // When provided, replaces the tabbed body entirely and hides the tabs nav.
  // Photography uses this to render the guided journey when guided mode is
  // active.
  bodyOverride?: ReactNode;
}

export function WorkspaceCanvas<TabId extends string>({
  category,
  categoryIcon: CategoryIcon,
  eyebrowSuffix,
  tabs,
  fullWidthTabIds,
  renderTab,
  headerActions,
  subHeader,
  bodyOverride,
}: WorkspaceCanvasProps<TabId>) {
  const [activeTab, setActiveTab] = useState<TabId>(
    (tabs[0]?.id ?? ("" as TabId)) as TabId,
  );
  const vendors = useVendorsStore((s) => s.vendors);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const assignedVendor = category.assigned_vendor_id
    ? vendors.find((v) => v.id === category.assigned_vendor_id)
    : null;

  const isVendorView = currentRole === "vendor";

  let subline = STATUS_LABEL[category.status];
  if (category.status === "assigned" && assignedVendor) {
    subline = `Assigned — ${assignedVendor.name}`;
  } else if (category.status === "shortlisted") {
    subline = "Shortlisted — options being compared";
  } else if (category.status === "open") {
    subline = "Not started";
  }

  const visibleTabs = useMemo(
    () => (isVendorView ? tabs.filter((t) => !t.hideFromVendor) : tabs),
    [isVendorView, tabs],
  );

  // If the user hops into vendor view while on a vendor-hidden tab, bounce.
  useEffect(() => {
    if (isVendorView && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]!.id);
    }
  }, [isVendorView, activeTab, visibleTabs]);

  const fullWidth = fullWidthTabIds?.includes(activeTab) ?? false;

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  STATUS_DOT[category.status],
                )}
                aria-hidden
              />
              <p
                className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Workspace · {eyebrowSuffix}
              </p>
            </div>
            <h1 className="mt-2 flex items-center gap-3 font-serif text-[46px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
              <CategoryIcon size={34} strokeWidth={1.5} className="text-ink-muted" />
              {category.name}
            </h1>
            <p className="mt-1.5 font-serif text-[17px] italic text-ink-muted">
              {subline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isVendorView && <BudgetBadge slug={category.slug} />}
            {headerActions}
            {!isVendorView && category.status !== "open" && (
              <ActionButton
                icon={<Send size={13} strokeWidth={1.8} />}
                label="Invite vendor"
              />
            )}
            <RoleSwitcher />
          </div>
        </div>

        {subHeader && <div className="mt-4">{subHeader}</div>}

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        {!bodyOverride && (
        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label={`${eyebrowSuffix} workspace sections`}
        >
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as TabId)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
        )}
      </header>

      {isVendorView && (
        <div
          className="flex items-center gap-2 border-b border-gold/25 bg-gold-light/15 px-10 py-2.5"
          role="status"
        >
          <Eye size={13} strokeWidth={1.8} className="text-ink-muted" />
          <p className="text-[12px] text-ink">
            Previewing as <span className="font-medium">vendor</span>.
            <span className="text-ink-muted">
              {" "}
              Budgets, the shortlist, and couple-internal state are hidden.
            </span>
          </p>
        </div>
      )}

      {/* ── Tab body ───────────────────────────────────────────────────── */}
      {bodyOverride ? (
        <div className="flex-1 overflow-y-auto bg-white">
          {bodyOverride}
        </div>
      ) : fullWidth ? (
        <div className="flex-1 overflow-hidden bg-white">
          {renderTab(activeTab, setActiveTab)}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
          <div className="mx-auto max-w-6xl">
            {renderTab(activeTab, setActiveTab)}
          </div>
        </div>
      )}

      <UndoToastHost />
    </main>
  );
}

// ── Budget badge ───────────────────────────────────────────────────────────
// Per-category mini budget card in the header. Reads allocation from
// finance_budgets (source of truth) and committed from category-scoped
// invoices. Click-through scopes Finance to the same category.

function BudgetBadge({ slug }: { slug: FinanceCategoryId }) {
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const budget = budgets.find((b) => b.category_id === slug);
  const allocated = budget?.allocated_cents ?? 0;
  const committed = invoices
    .filter((i) => i.category_id === slug)
    .filter((i) => ["approved", "paid", "overdue"].includes(i.status))
    .reduce((s, i) => s + i.amount_cents, 0);
  const over = allocated > 0 && committed > allocated;

  return (
    <Link
      href={`/workspace/finance?category=${slug}`}
      aria-label={`Budget for ${slug}: ${formatDollarsShort(committed)} of ${formatDollarsShort(allocated)}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors",
        "border-border bg-white hover:border-saffron/40 hover:bg-ivory-warm/30",
      )}
    >
      <Wallet size={13} strokeWidth={1.6} className="text-ink-muted" />
      <span className="flex flex-col leading-tight">
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Budget
        </span>
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            over ? "text-rose" : "text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDollarsShort(committed)}
          <span className="mx-1 text-ink-faint">/</span>
          {formatDollarsShort(allocated)}
        </span>
      </span>
      <ChevronRight
        size={12}
        strokeWidth={2}
        className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

// ── Action button ──────────────────────────────────────────────────────────

function ActionButton({
  icon,
  label,
  primary = false,
}: {
  icon: ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        primary
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
