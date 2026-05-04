'use client';

import { useMemo, useState } from 'react';
import type { RankedVendor } from '@/types/vendors';
import type { BudgetTier } from '@/types/budget';
import { AiVendorMatchmaker } from '@/components/marigold-tools/ai/AiVendorMatchmaker';
import { VendorCard } from './VendorCard';
import styles from './VendorListView.module.css';

type VendorWithMeta = {
  vendor: RankedVendor;
  priceLowUsd: number | null;
  priceHighUsd: number | null;
};

type VendorListViewProps = {
  vendors: VendorWithMeta[];
  locationSlug: string;
  locationName: string;
  categorySlug: string;
  categoryName: string;
  // Whether to show the capacity facet — only meaningful for venue-related
  // categories (venue, mandap, hotel-block).
  showCapacity?: boolean;
};

type Tier = 'essential' | 'elevated' | 'luxury' | 'ultra';
const ALL_TIERS: Tier[] = ['essential', 'elevated', 'luxury', 'ultra'];

type CapacityBucket = 'all' | 'small' | 'medium' | 'large' | 'mega';
const CAPACITY_BUCKETS: { id: CapacityBucket; label: string; range: [number, number] }[] = [
  { id: 'small',  label: 'small (<150)',     range: [0, 149] },
  { id: 'medium', label: 'medium (150–300)', range: [150, 300] },
  { id: 'large',  label: 'large (300–600)',  range: [300, 600] },
  { id: 'mega',   label: 'mega (600+)',      range: [600, Number.MAX_SAFE_INTEGER] },
];

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'verified';

const SORT_LABELS: Record<SortMode, string> = {
  featured: 'the marigold pick',
  'price-asc': 'cheapest first',
  'price-desc': 'fanciest first',
  verified: 'verified only',
};

export function VendorListView({
  vendors,
  locationSlug,
  locationName,
  categorySlug,
  categoryName,
  showCapacity = false,
}: VendorListViewProps) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [capacity, setCapacity] = useState<CapacityBucket>('all');
  const [sort, setSort] = useState<SortMode>('featured');

  // The single tier most likely to drive an AI recommendation. If the user
  // has narrowed to one, we trust it; otherwise leave null.
  const preferredTier: BudgetTier | null =
    tiers.length === 1 ? (tiers[0] as BudgetTier) : null;

  const visible = useMemo(() => {
    let pool = vendors.slice();

    if (tiers.length > 0) {
      pool = pool.filter(({ vendor }) =>
        tiers.some((t) => vendor.tier_match.includes(t)),
      );
    }

    if (showCapacity && capacity !== 'all') {
      const cfg = CAPACITY_BUCKETS.find((b) => b.id === capacity);
      if (cfg) {
        const [low, high] = cfg.range;
        pool = pool.filter(({ vendor }) => {
          const min = vendor.capacity_min ?? 0;
          const max = vendor.capacity_max ?? Number.MAX_SAFE_INTEGER;
          return min <= high && max >= low;
        });
      }
    }

    if (sort === 'verified') {
      pool = pool.filter(({ vendor }) => vendor.verified);
    }

    if (sort === 'price-asc' || sort === 'price-desc') {
      pool = pool
        .filter((v) => v.priceLowUsd != null)
        .sort((a, b) => {
          const aPrice = a.priceLowUsd ?? 0;
          const bPrice = b.priceLowUsd ?? 0;
          return sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
        });
    }
    // The default 'featured' sort respects the server's rank_bucket order
    // (sponsored matching → featured → verified → random) — no client sort.

    return pool;
  }, [vendors, tiers, capacity, sort, showCapacity]);

  const toggleTier = (t: Tier) => {
    setTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Filter vendors">
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>tier</span>
          <div className={styles.checkColumn}>
            {ALL_TIERS.map((t) => (
              <label key={t} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={tiers.includes(t)}
                  onChange={() => toggleTier(t)}
                  className={styles.checkbox}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {showCapacity && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>capacity</span>
            <div className={styles.checkColumn}>
              <label className={styles.checkRow}>
                <input
                  type="radio"
                  name="capacity"
                  checked={capacity === 'all'}
                  onChange={() => setCapacity('all')}
                  className={styles.checkbox}
                />
                <span>all</span>
              </label>
              {CAPACITY_BUCKETS.map((b) => (
                <label key={b.id} className={styles.checkRow}>
                  <input
                    type="radio"
                    name="capacity"
                    checked={capacity === b.id}
                    onChange={() => setCapacity(b.id)}
                    className={styles.checkbox}
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>sort</span>
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {SORT_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <div className={styles.results}>
        <AiVendorMatchmaker
          vendors={visible}
          locationName={locationName}
          locationSlug={locationSlug}
          categoryName={categoryName}
          categorySlug={categorySlug}
          preferredTier={preferredTier}
          totalBudget={null}
        />

        {visible.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyScrawl}>nothing matching ✿</span>
            <p>
              Loosen the filters — or hop back to the destination page; we may have a
              different category that&apos;s further along here.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map(({ vendor, priceLowUsd, priceHighUsd }) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                priceLowUsd={priceLowUsd}
                priceHighUsd={priceHighUsd}
                sourceTool="destination_explorer"
                inquiryContext={{
                  location_slug: locationSlug,
                  category_slug: categorySlug,
                }}
                emphasized={vendor.rank_bucket === 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
