"use client";

import type { BudgetSummary } from "@/lib/budget";

import styles from "./StickySummary.module.css";

type Props = {
  summary: BudgetSummary;
  totalBudget: number | null;
  view: "build" | "summary";
  onChangeView: (view: "build" | "summary") => void;
  onRequestSave: () => void;
};

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function StickySummary({
  summary,
  totalBudget,
  view,
  onChangeView,
  onRequestSave,
}: Props) {
  const grand = summary.totals.grand;
  const target = totalBudget ?? 0;
  const overUnder = target > 0 ? grand - target : 0;
  const pct = target > 0 ? Math.min(150, Math.round((grand / target) * 100)) : 0;

  let statusLabel = "on target";
  let statusKind: "ok" | "over" | "under" = "ok";
  if (target > 0) {
    if (grand > target * 1.05) {
      statusKind = "over";
      statusLabel = `${formatUSD(Math.abs(overUnder))} over`;
    } else if (grand < target * 0.95) {
      statusKind = "under";
      statusLabel = `${formatUSD(Math.abs(overUnder))} under`;
    }
  }

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.totalCol}>
          <span className={styles.eyebrow}>grand total</span>
          <div className={styles.totalRow}>
            <span className={styles.total}>${grand.toLocaleString("en-US")}</span>
            {target > 0 && (
              <span
                className={[styles.status, styles[`status-${statusKind}`]]
                  .filter(Boolean)
                  .join(" ")}
              >
                {statusLabel}
              </span>
            )}
          </div>
          {target > 0 && (
            <div className={styles.progressTrack} role="progressbar" aria-valuenow={pct}>
              <div
                className={[
                  styles.progressFill,
                  statusKind === "over" ? styles.progressOver : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
              {pct > 100 && (
                <div
                  className={styles.progressOverflow}
                  style={{ width: `${Math.min(50, pct - 100)}%` }}
                />
              )}
            </div>
          )}
        </div>

        <div className={styles.chips}>
          <Chip label="Events" amount={summary.totals.events} />
          <Chip label="Wedding-wide" amount={summary.totals.weddingWide} />
          <Chip label="Add-Ons" amount={summary.totals.addons} />
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === "build"}
              className={[
                styles.toggleBtn,
                view === "build" ? styles.toggleBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChangeView("build")}
            >
              Build
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "summary"}
              className={[
                styles.toggleBtn,
                view === "summary" ? styles.toggleBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChangeView("summary")}
            >
              Summary
            </button>
          </div>

          <button type="button" className={styles.saveBtn} onClick={onRequestSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={styles.chip}>
      <span className={styles.chipLabel}>{label}</span>
      <span className={styles.chipAmount}>${amount.toLocaleString("en-US")}</span>
    </div>
  );
}
