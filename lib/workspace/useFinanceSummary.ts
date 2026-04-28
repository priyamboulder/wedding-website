"use client";

// ── Finance summary hook ──────────────────────────────────────────────────
// Reads live data from the Finance store. The shape was locked in Prompt 1
// so the BudgetIndicator and any other consumers don't need to change.

import { useMemo } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { computeFinanceSummary } from "@/lib/finance/selectors";
import type { FinanceSummary } from "@/types/finance";

// Keep the historic export name so existing imports keep working.
export type { FinanceSummary };

export function useFinanceSummary(): FinanceSummary {
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);

  return useMemo(
    () => computeFinanceSummary(budgets, invoices, payments),
    [budgets, invoices, payments],
  );
}
