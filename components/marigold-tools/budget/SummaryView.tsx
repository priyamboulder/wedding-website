"use client";

import { useState } from "react";

import type { BudgetSummary } from "@/lib/budget";
import type { BudgetLocationRow, BudgetTier } from "@/types/budget";

import styles from "./SummaryView.module.css";

const TIER_LABEL: Record<BudgetTier, string> = {
  essential: "Essential",
  elevated: "Elevated",
  luxury: "Luxury",
  ultra: "Ultra",
};

type Props = {
  summary: BudgetSummary;
  location: BudgetLocationRow;
  totalBudget: number | null;
  token: string | null;
  onShare: () => void;
  onSave: () => void;
  onAi: () => void;
};

export function SummaryView({
  summary,
  location,
  totalBudget,
  token,
  onShare,
  onSave,
  onAi,
}: Props) {
  const [copied, setCopied] = useState(false);

  const overUnder = totalBudget ? summary.totals.grand - totalBudget : 0;

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const text = formatShareText(summary, location, totalBudget, token);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Shaadi Budget",
          text,
          url: shareUrl(token),
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n\n${shareUrl(token)}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* user cancelled — silent */
    }
    onShare();
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.scrawl}>your plan</span>
          <h1 className={styles.title}>
            ${summary.totals.grand.toLocaleString("en-US")}
          </h1>
          {totalBudget != null && (
            <p className={styles.subtotal}>
              {overUnder > 0
                ? `${formatUSD(Math.abs(overUnder))} over your $${totalBudget.toLocaleString()} target`
                : overUnder < 0
                ? `${formatUSD(Math.abs(overUnder))} under your $${totalBudget.toLocaleString()} target — room to play`
                : `Right on your $${totalBudget.toLocaleString()} target`}
            </p>
          )}
        </header>

        {/* ── Per-event lines ─────────────────────────────────────────── */}
        <div className={styles.eventGroups}>
          {summary.events.map((e) => (
            <div key={e.event.slug} className={styles.eventGroup}>
              <div className={styles.eventGroupHead}>
                <span className={styles.groupIcon} aria-hidden>{e.event.icon}</span>
                <h3 className={styles.groupName}>{e.event.name}</h3>
                <span className={styles.groupGuests}>{e.guestCount} guests</span>
                <span className={styles.groupTotal}>${e.subtotal.toLocaleString("en-US")}</span>
              </div>
              <ul className={styles.lineList}>
                {e.vendors.map((v) => (
                  <li key={v.key} className={styles.line}>
                    <span className={styles.lineIcon} aria-hidden>{v.categoryIcon}</span>
                    <span className={styles.lineName}>{v.categoryName}</span>
                    <span className={styles.lineTier}>{TIER_LABEL[v.tier]}</span>
                    <span className={styles.lineCost}>
                      ${v.cost.toLocaleString("en-US")}
                    </span>
                  </li>
                ))}
                {e.addons.map((a) => (
                  <li key={a.key} className={`${styles.line} ${styles.lineAddon}`}>
                    <span className={styles.lineIcon} aria-hidden>{a.addonIcon}</span>
                    <span className={styles.lineName}>{a.addonName}</span>
                    <span className={styles.lineTier}>add-on</span>
                    <span className={styles.lineCost}>
                      ${a.cost.toLocaleString("en-US")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Wedding-wide ────────────────────────────────────────────── */}
        {(summary.weddingWideVendors.length > 0 ||
          summary.weddingWideAddons.length > 0) && (
          <div className={styles.eventGroup}>
            <div className={styles.eventGroupHead}>
              <span className={styles.groupIcon} aria-hidden>✿</span>
              <h3 className={styles.groupName}>Wedding-wide</h3>
              <span className={styles.groupGuests} />
              <span className={styles.groupTotal}>
                ${(summary.totals.weddingWide +
                  summary.weddingWideAddons.reduce((s, a) => s + a.cost, 0)
                ).toLocaleString("en-US")}
              </span>
            </div>
            <ul className={styles.lineList}>
              {summary.weddingWideVendors.map((v) => (
                <li key={v.key} className={styles.line}>
                  <span className={styles.lineIcon} aria-hidden>{v.categoryIcon}</span>
                  <span className={styles.lineName}>{v.categoryName}</span>
                  <span className={styles.lineTier}>{TIER_LABEL[v.tier]}</span>
                  <span className={styles.lineCost}>
                    ${v.cost.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
              {summary.weddingWideAddons.map((a) => (
                <li key={a.key} className={`${styles.line} ${styles.lineAddon}`}>
                  <span className={styles.lineIcon} aria-hidden>{a.addonIcon}</span>
                  <span className={styles.lineName}>{a.addonName}</span>
                  <span className={styles.lineTier}>add-on</span>
                  <span className={styles.lineCost}>
                    ${a.cost.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grandRow}>
          <span className={styles.grandLabel}>Grand total</span>
          <span className={styles.grandValue}>
            ${summary.totals.grand.toLocaleString("en-US")}
          </span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.actionGhost} onClick={handleShare}>
            {copied ? "Copied ✓" : "Share"}
          </button>
          <button type="button" className={styles.actionPrimary} onClick={onSave}>
            Save to my account
          </button>
          <button type="button" className={styles.actionAi} onClick={onAi}>
            ✨ Get AI recommendations
          </button>
        </div>
      </div>
    </section>
  );
}

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function shareUrl(token: string | null): string {
  if (typeof window === "undefined") return "";
  const base = window.location.origin + "/tools/budget/build";
  if (!token) return base;
  return `${base}?plan=${token}`;
}

function formatShareText(
  summary: BudgetSummary,
  location: BudgetLocationRow,
  totalBudget: number | null,
  _token: string | null,
): string {
  const lines: string[] = [];
  lines.push(`✿ My Shaadi Budget — ${location.name}`);
  lines.push(`Grand total: $${summary.totals.grand.toLocaleString("en-US")}`);
  if (totalBudget) {
    lines.push(`Target: $${totalBudget.toLocaleString("en-US")}`);
  }
  lines.push("");
  for (const e of summary.events) {
    lines.push(`${e.event.icon} ${e.event.name} (${e.guestCount}) — $${e.subtotal.toLocaleString("en-US")}`);
  }
  lines.push(`✿ Wedding-wide — $${summary.totals.weddingWide.toLocaleString("en-US")}`);
  return lines.join("\n");
}
