"use client";

// ── Events workspace shell ────────────────────────────────────────────────
// Visual parity with components/workspace/WorkspaceCanvas.tsx — the shared
// shell every vendor-category canvas uses. Events doesn't fit the
// WorkspaceCategory model (multi-event, no single vendor assignment) so we
// reproduce the same visual structure here:
//   · status dot + eyebrow "Workspace · Events [ / Chapter ]"
//   · big serif title (dynamic — "Events" on story, event name on detail)
//   · italic subline
//   · right-side action bar: BudgetBadge + Invite vendor + Shortlist + RoleSwitcher
//   · tab bar with ink underline (optional — story view hides it)
//   · scrollable body wrapped in max-w-6xl

import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ChevronRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import { formatDollarsShort } from "@/lib/finance/format";
import { RoleSwitcher } from "@/components/workspace/photography/RoleSwitcher";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;

export interface EventsShellTab<TabId extends string> {
  id: TabId;
  label: string;
  icon: IconComponent;
}

export interface EventsShellAction {
  icon: ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
  href?: string;
  title?: string;
}

interface Props<TabId extends string> {
  eyebrow: string;
  title: string;
  // Optional override — replaces the plain-text title with custom content
  // (e.g., an inline editable input). Still renders inside the same
  // Cormorant/46px treatment as the static title.
  titleContent?: ReactNode;
  titleIcon?: IconComponent;
  subline: string;
  sublineContent?: ReactNode;
  statusDotClass?: string;
  breadcrumb?: ReactNode;
  actions?: EventsShellAction[];
  tabs?: EventsShellTab<TabId>[];
  activeTab?: TabId;
  onChangeTab?: (t: TabId) => void;
  secondaryStrip?: ReactNode;
  children: ReactNode;
  bodyVariant?: "padded" | "flush";
}

const EVENT_BUDGET_CATEGORIES = [
  "venue",
  "catering",
  "decor_florals",
  "entertainment",
  "hmua",
] as const;

export function EventsWorkspaceShell<TabId extends string>({
  eyebrow,
  title,
  titleContent,
  titleIcon: TitleIcon,
  subline,
  sublineContent,
  statusDotClass = "bg-saffron",
  breadcrumb,
  actions,
  tabs,
  activeTab,
  onChangeTab,
  secondaryStrip,
  children,
  bodyVariant = "padded",
}: Props<TabId>) {
  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        {breadcrumb && (
          <div className="-mt-2 mb-3 flex items-center justify-between gap-3">
            {breadcrumb}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", statusDotClass)}
                aria-hidden
              />
              <p
                className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-2 flex items-center gap-3 font-serif text-[46px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
              {TitleIcon && (
                <TitleIcon
                  size={34}
                  strokeWidth={1.5}
                  className="text-ink-muted shrink-0"
                />
              )}
              {titleContent ?? <span className="truncate">{title}</span>}
            </h1>
            <p className="mt-1.5 font-serif text-[17px] italic text-ink-muted">
              {sublineContent ?? subline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EventsBudgetBadge />
            {actions?.map((a) => (
              <ShellActionButton key={a.label} action={a} />
            ))}
            <RoleSwitcher />
          </div>
        </div>

        {tabs && tabs.length > 0 && (
          <nav
            className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
            aria-label="Events workspace sections"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeTab?.(t.id)}
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

      {secondaryStrip}

      {bodyVariant === "flush" ? (
        <div className="flex-1 overflow-hidden bg-white">{children}</div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      )}
    </main>
  );
}

function ShellActionButton({ action }: { action: EventsShellAction }) {
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
    action.primary
      ? "bg-ink text-ivory hover:bg-ink-soft"
      : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
  );
  if (action.href) {
    return (
      <Link href={action.href} title={action.title} className={className}>
        {action.icon}
        {action.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={action.onClick}
      title={action.title}
      className={className}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

// ── Budget badge ──────────────────────────────────────────────────────────
// Mirrors WorkspaceCanvas.BudgetBadge but sums over the event-relevant
// finance categories instead of a single slug.

function EventsBudgetBadge() {
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);

  let allocated = 0;
  let committed = 0;
  for (const cat of EVENT_BUDGET_CATEGORIES) {
    const b = budgets.find((x) => x.category_id === cat);
    allocated += b?.allocated_cents ?? 0;
  }
  for (const inv of invoices) {
    if (
      !EVENT_BUDGET_CATEGORIES.includes(
        inv.category_id as (typeof EVENT_BUDGET_CATEGORIES)[number],
      )
    ) {
      continue;
    }
    if (!["approved", "paid", "overdue"].includes(inv.status)) continue;
    committed += inv.amount_cents;
  }

  if (allocated === 0) return null;
  const over = committed > allocated;

  return (
    <Link
      href="/workspace/finance"
      aria-label={`Events budget: ${formatDollarsShort(committed)} of ${formatDollarsShort(allocated)}`}
      className="group inline-flex items-center gap-2 rounded-md border border-border bg-white px-2.5 py-1.5 transition-colors hover:border-saffron/40 hover:bg-ivory-warm/30"
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
