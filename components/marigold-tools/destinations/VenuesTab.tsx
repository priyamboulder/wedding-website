'use client';

import { useMemo, useState } from 'react';
import type { RankedVendor } from '@/types/vendors';
import { VendorCard } from './VendorCard';
import styles from './VenuesTab.module.css';

type VenueWithMeta = {
  vendor: RankedVendor;
  // The server pre-resolved the venue's pricing band for the venue category.
  priceLowUsd: number | null;
  priceHighUsd: number | null;
  // Editorial sub-label like "Palace Hotel" / "Beach Resort". Pulled from
  // the venue's tagline if structured, otherwise blank.
  typeLabel?: string;
};

type VenuesTabProps = {
  venues: VenueWithMeta[];
  locationSlug: string;
  locationName: string;
};

type CapacityBucket = 'all' | 'small' | 'medium' | 'large' | 'mega';
type TierFilter = 'all' | 'essential' | 'elevated' | 'luxury' | 'ultra';

const CAPACITY_BUCKETS: { id: CapacityBucket; label: string; range: [number, number] }[] = [
  { id: 'small',  label: 'small (<150)',     range: [0, 149] },
  { id: 'medium', label: 'medium (150–300)', range: [150, 300] },
  { id: 'large',  label: 'large (300–600)',  range: [300, 600] },
  { id: 'mega',   label: 'mega (600+)',      range: [600, Number.MAX_SAFE_INTEGER] },
];

const TIERS: TierFilter[] = ['essential', 'elevated', 'luxury', 'ultra'];

function capacityMatches(
  vendor: RankedVendor,
  bucket: CapacityBucket,
): boolean {
  if (bucket === 'all') return true;
  const cfg = CAPACITY_BUCKETS.find((b) => b.id === bucket);
  if (!cfg) return true;
  const [low, high] = cfg.range;
  // Vendor matches the bucket if their declared range overlaps with it.
  // Null bounds are wild — treat as inclusive on that side.
  const venueMin = vendor.capacity_min ?? 0;
  const venueMax = vendor.capacity_max ?? Number.MAX_SAFE_INTEGER;
  return venueMin <= high && venueMax >= low;
}

export function VenuesTab({ venues, locationSlug, locationName }: VenuesTabProps) {
  const [capacity, setCapacity] = useState<CapacityBucket>('all');
  const [tier, setTier] = useState<TierFilter>('all');

  const filtered = useMemo(() => {
    return venues.filter(({ vendor }) => {
      if (!capacityMatches(vendor, capacity)) return false;
      if (tier !== 'all' && !vendor.tier_match.includes(tier)) return false;
      return true;
    });
  }, [venues, capacity, tier]);

  return (
    <div className={styles.panel} id="vendors">
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <span className={styles.scrawl}>where you&apos;ll actually do this</span>
          venues in <em>{locationName}</em>
        </h2>
        <p className={styles.sub}>
          Palace hotels, beach resorts, vineyards. Sponsored partners surface first; the rest
          rotate so nobody&apos;s permanently buried by alphabetical order.
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>capacity</span>
          <div className={styles.pillRow}>
            <FilterPill active={capacity === 'all'} onClick={() => setCapacity('all')}>
              all
            </FilterPill>
            {CAPACITY_BUCKETS.map((b) => (
              <FilterPill
                key={b.id}
                active={capacity === b.id}
                onClick={() => setCapacity(b.id)}
              >
                {b.label}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>tier</span>
          <div className={styles.pillRow}>
            <FilterPill active={tier === 'all'} onClick={() => setTier('all')}>
              all
            </FilterPill>
            {TIERS.map((t) => (
              <FilterPill key={t} active={tier === t} onClick={() => setTier(t)}>
                {t}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyScrawl}>nothing matching ✿</span>
          <p>
            Loosen the filters or check back — we&apos;re still scouting venues in{' '}
            {locationName}.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(({ vendor, priceLowUsd, priceHighUsd, typeLabel }) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              priceLowUsd={priceLowUsd}
              priceHighUsd={priceHighUsd}
              typeLabel={typeLabel}
              sourceTool="destination_explorer"
              inquiryContext={{
                location_slug: locationSlug,
                category_slug: 'venue',
              }}
              emphasized={vendor.rank_bucket === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[styles.pill, active ? styles.pillActive : ''].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
