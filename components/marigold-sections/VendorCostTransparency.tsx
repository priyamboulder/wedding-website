'use client';

// ── VendorCostTransparency ─────────────────────────────────────────────────
// Collapsible info bar that surfaces realistic vendor pricing for the
// currently filtered category on /vendors-directory. Renders nothing when
// the active filter is "All" or an unmapped category (e.g. "Venues",
// "Wardrobe") so the bar only appears when we actually have data.
//
// Collapsed: one-line headline ("Photography in DFW: $2,500 – $15,000+").
// Expanded: 4-column tier breakdown (Budget / Mid / Premium / Luxury) +
// footnote explaining the source.

import { useState } from 'react';
import {
  costRangeCategoryFromFilter,
  formatHeadlineRange,
  formatRange,
  getCostRangeForCategory,
  tierLabel,
  unitLabel,
} from '@/lib/vendors/cost-ranges';
import styles from './VendorCostTransparency.module.css';

interface Props {
  /** The currently selected category filter label (e.g. 'Photography'). */
  filterLabel: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}

export function VendorCostTransparency({ filterLabel }: Props) {
  const [expanded, setExpanded] = useState(false);

  const category = costRangeCategoryFromFilter(filterLabel);
  if (!category) return null;

  const breakdown = getCostRangeForCategory(category, 'dallas');
  if (!breakdown) return null;

  const headline = formatHeadlineRange(breakdown);
  const headlineUnit = breakdown.ranges[0]?.unit;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <button
          type="button"
          className={styles.summaryRow}
          aria-expanded={expanded}
          aria-controls="vendor-cost-detail"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={styles.icon} aria-hidden="true">
            📊
          </span>
          <span className={styles.summaryText}>
            <span className={styles.eyebrow}>real cost in DFW</span>
            <span className={styles.headline}>
              {breakdown.categoryLabel} in {breakdown.cityLabel}:{' '}
              <em>{headline}</em>
            </span>
            {headlineUnit && (
              <span className={styles.unit}>{unitLabel(headlineUnit)}</span>
            )}
          </span>
          <span className={styles.toggleHint}>
            {expanded ? 'Hide' : 'See tiers'}
            <ChevronIcon open={expanded} />
          </span>
        </button>

        {expanded && (
          <div id="vendor-cost-detail" className={styles.detail}>
            <div className={styles.tierRow}>
              {breakdown.ranges.map((r) => (
                <div key={r.tier} className={styles.tier}>
                  <span className={styles.tierLabel}>{tierLabel(r.tier)}</span>
                  <span className={styles.tierRange}>
                    {formatRange(r.minPrice, r.maxPrice)}
                  </span>
                  <span className={styles.tierUnit}>
                    {r.notes ?? unitLabel(r.unit)}
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.footnote}>
              Based on real wedding data for the Dallas–Fort Worth area.
              Prices vary by experience, coverage, and deliverables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
