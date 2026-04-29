'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { ScrawlNote } from '@/components/ui/ScrawlNote';
import { TapeStrip } from '@/components/ui/TapeStrip';
import { PushPin } from '@/components/ui/PushPin';
import {
  VENDOR_CATEGORIES,
  VENDORS,
  type PublicVendor,
  type VendorCategory,
} from '@/lib/vendors';
import styles from './VendorBrowser.module.css';

type FilterValue = 'All' | VendorCategory;

const FILTER_VALUES: FilterValue[] = ['All', ...VENDOR_CATEGORIES];

const PIN_COLORS = ['pink', 'gold', 'red'] as const;

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function VendorCard({
  vendor,
  index,
  onSelect,
}: {
  vendor: PublicVendor;
  index: number;
  onSelect: (vendor: PublicVendor) => void;
}) {
  const rotations = [-1, 0.6, -0.4, 1, -0.8, 0.3];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 4 === 3;
  const showPin = index % 5 === 2;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];
  const creamInfo = index % 3 === 0;

  const gradient = `linear-gradient(135deg, ${vendor.gradientColors[0]} 0%, ${vendor.gradientColors[1]} 100%)`;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(vendor);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(vendor)}
      onKeyDown={handleKey}
      className={styles.card}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`View ${vendor.name}`}
    >
      {showTape && <TapeStrip position="tl" />}
      {showPin && <PushPin color={pinColor} position="right" />}
      <div className={styles.cardInner}>
        <div className={styles.photo} style={{ background: gradient }}>
          <span className={styles.catChip}>{vendor.category}</span>
          {vendor.badge && (
            <span
              className={`${styles.badge} ${
                vendor.badge === 'top-match' ? styles.badgeTop : styles.badgeRising
              }`}
            >
              {vendor.badge === 'top-match' ? 'Top Match' : 'Rising Star'}
            </span>
          )}
        </div>
        <div className={`${styles.info} ${creamInfo ? styles.infoCream : ''}`}>
          <h3 className={styles.name}>{vendor.name}</h3>
          <p className={styles.specialty}>{vendor.specialty}</p>
          <p className={styles.location}>
            {vendor.city} · {vendor.travelAvailability}
          </p>
          <div className={styles.tagRow}>
            {vendor.styleTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {vendor.scrawl && (
            <span className={styles.cardScrawl}>{vendor.scrawl}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginGate({
  vendor,
  onClose,
}: {
  vendor: PublicVendor;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-gate-heading"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <TapeStrip position="tl" />
        <TapeStrip position="tr" />
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.modalEyebrow}>locked content</div>
        <h2 id="login-gate-heading" className={styles.modalHeading}>
          Want to <i style={{ color: 'var(--pink)' }}>see more?</i>
        </h2>
        <p className={styles.modalSub}>
          Log in to view {vendor.name}'s full portfolio, pricing,
          availability, and reviews.
        </p>
        <div className={styles.modalScrawl}>trust us, their work is gorgeous</div>
        <div className={styles.modalButtons}>
          <ChunkyButton variant="pink" href="/pricing">
            Log In
          </ChunkyButton>
          <ChunkyButton variant="white" href="/pricing">
            Sign Up Free
          </ChunkyButton>
        </div>
        <button type="button" className={styles.modalDismiss} onClick={onClose}>
          maybe later
        </button>
      </div>
    </div>
  );
}

export function VendorBrowser() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('All');
  const [selected, setSelected] = useState<PublicVendor | null>(null);
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setStuck(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: '-89px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: VENDORS.length };
    for (const v of VENDORS) {
      result[v.category] = (result[v.category] ?? 0) + 1;
    }
    return result;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENDORS.filter((v) => {
      if (filter !== 'All' && v.category !== filter) return false;
      if (!q) return true;
      const haystack = [
        v.name,
        v.category,
        v.specialty,
        v.city,
        ...v.styleTags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, filter]);

  return (
    <>
      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photographers, decorators, caterers..."
            className={styles.searchInput}
            aria-label="Search vendors"
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              clear
            </button>
          )}
        </div>
      </div>

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

      <div className={`${styles.filterBar} ${stuck ? styles.stuck : ''}`}>
        <div className={styles.filterRow} role="tablist" aria-label="Vendor categories">
          {FILTER_VALUES.map((cat) => {
            const active = filter === cat;
            const count = counts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(cat)}
                className={`${styles.pill} ${active ? styles.pillActive : ''}`}
              >
                {cat}
                {active && count > 0 && (
                  <span className={styles.pillCount}>({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.gridWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <TapeStrip position="center" />
            <div className={styles.emptyTitle}>
              No vendors found for "{query}"
            </div>
            <div className={styles.emptyBody}>Try a different search?</div>
            <ScrawlNote>we're adding new vendors every week</ScrawlNote>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((v, idx) => (
              <VendorCard
                key={v.id}
                vendor={v}
                index={idx}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <LoginGate vendor={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
