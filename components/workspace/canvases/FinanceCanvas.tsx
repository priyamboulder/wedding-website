"use client";

// ── Finance canvas ────────────────────────────────────────────────────────
// Header with eyebrow + serif title + right-side actions, secondary tab bar
// (6 tabs), scrollable body. Supports ?category= query param across every
// tab and surfaces a dismissible filter chip when active.

import {
  useCallback,
  useMemo,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  Receipt,
  Banknote,
  HeartHandshake,
  FileDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinanceCategoryId } from "@/types/finance";
import { FINANCE_CATEGORY_LABEL } from "@/types/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { FilterChip } from "@/components/workspace/finance/shared";
import { FinanceOverviewTab } from "@/components/workspace/finance/FinanceOverviewTab";
import { FinanceBudgetTab } from "@/components/workspace/finance/FinanceBudgetTab";
import { FinanceInvoicesTab } from "@/components/workspace/finance/FinanceInvoicesTab";
import { FinanceTransactionsView } from "@/components/workspace/finance/FinanceTransactionsView";
import { FinanceContributorsTab } from "@/components/workspace/finance/FinanceContributorsTab";
import { FinanceReportsTab } from "@/components/workspace/finance/FinanceReportsTab";
import { FinanceOnboardingQuiz } from "@/components/workspace/finance/FinanceOnboardingQuiz";

type FinanceTabId =
  | "overview"
  | "budget"
  | "invoices"
  | "transactions"
  | "contributors"
  | "reports";

const TABS: Array<{ id: FinanceTabId; label: string; icon: typeof LayoutGrid }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "transactions", label: "Transactions", icon: Banknote },
  { id: "contributors", label: "Contributors", icon: HeartHandshake },
  { id: "reports", label: "Reports", icon: FileDown },
];

function isValidCategory(
  slug: string | null,
  knownIds: Set<string>,
): slug is FinanceCategoryId {
  if (!slug) return false;
  return slug in FINANCE_CATEGORY_LABEL || knownIds.has(slug);
}

export function FinanceCanvas() {
  return (
    <Suspense fallback={<div className="flex-1 animate-pulse bg-ivory-warm/40" />}>
      <FinanceCanvasInner />
    </Suspense>
  );
}

function FinanceCanvasInner() {
  const router = useRouter();
  const params = useSearchParams();
  const storeCategories = useFinanceStore((s) => s.categories);
  const onboarding = useFinanceStore((s) => s.settings.onboarding);
  const resetOnboarding = useFinanceStore((s) => s.resetOnboarding);
  const [quizOpen, setQuizOpen] = useState(!onboarding.completed);
  const knownCategoryIds = useMemo(
    () => new Set(storeCategories.map((c) => c.id)),
    [storeCategories],
  );
  const rawCategory = params?.get("category") ?? null;
  const categoryFilter: FinanceCategoryId | null = isValidCategory(
    rawCategory,
    knownCategoryIds,
  )
    ? rawCategory
    : null;
  const rawTab = (params?.get("tab") ?? "overview") as FinanceTabId;
  const tabExists = TABS.some((t) => t.id === rawTab);
  const [tab, setTabState] = useState<FinanceTabId>(tabExists ? rawTab : "overview");

  const setTab = useCallback(
    (next: FinanceTabId) => {
      setTabState(next);
      const sp = new URLSearchParams(params?.toString() ?? "");
      if (next === "overview") sp.delete("tab");
      else sp.set("tab", next);
      const q = sp.toString();
      router.replace(`/workspace/finance${q ? `?${q}` : ""}`, { scroll: false });
    },
    [params, router],
  );

  const dismissCategoryFilter = useCallback(() => {
    const sp = new URLSearchParams(params?.toString() ?? "");
    sp.delete("category");
    const q = sp.toString();
    router.replace(`/workspace/finance${q ? `?${q}` : ""}`, { scroll: false });
  }, [params, router]);

  const body: ReactNode = useMemo(() => {
    switch (tab) {
      case "overview":
        return <FinanceOverviewTab categoryFilter={categoryFilter} onNavigate={setTab} />;
      case "budget":
        return <FinanceBudgetTab categoryFilter={categoryFilter} />;
      case "invoices":
        return <FinanceInvoicesTab categoryFilter={categoryFilter} />;
      case "transactions":
        return <FinanceTransactionsView categoryFilter={categoryFilter} />;
      case "contributors":
        return <FinanceContributorsTab categoryFilter={categoryFilter} />;
      case "reports":
        return <FinanceReportsTab categoryFilter={categoryFilter} />;
    }
  }, [tab, categoryFilter, setTab]);

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <nav
              aria-label="Breadcrumb"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Link
                href="/workspace"
                className="transition-colors hover:text-saffron"
              >
                Workspace
              </Link>
              <span className="mx-2 text-ink-faint/60">·</span>
              <span className="text-saffron">Finance</span>
            </nav>
            <h1 className="mt-1.5 flex items-center gap-2.5 font-serif text-[30px] leading-[1.1] text-ink">
              <Wallet size={26} strokeWidth={1.5} className="text-ink-muted" />
              Finance
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              Budget, invoices, and payments across all categories
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {categoryFilter && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Scoped to
                </span>
                <FilterChip
                  label={
                    storeCategories.find((c) => c.id === categoryFilter)?.name ??
                    FINANCE_CATEGORY_LABEL[
                      categoryFilter as keyof typeof FINANCE_CATEGORY_LABEL
                    ] ??
                    categoryFilter
                  }
                  onDismiss={dismissCategoryFilter}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                resetOnboarding();
                setQuizOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:border-saffron/50 hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Sparkles size={11} strokeWidth={1.8} />
              {onboarding.completed ? "Re-run setup quiz" : "Run setup quiz"}
            </button>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label="Finance sections"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
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
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
        <div className="mx-auto max-w-6xl">{body}</div>
      </div>

      {quizOpen && (
        <FinanceOnboardingQuiz onClose={() => setQuizOpen(false)} />
      )}
    </main>
  );
}
