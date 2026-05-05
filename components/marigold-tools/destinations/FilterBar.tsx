'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './FilterBar.module.css';

export type GuestCount = 'under-150' | '150-300' | '300-500' | '500-plus';
export type Vibe = 'palace' | 'modern' | 'beach' | 'garden';
export type Budget = 'under-100k' | '100-250k' | '250-500k' | '500k-plus';

export const GUEST_OPTIONS: { value: GuestCount; label: string; pill: string }[] = [
  { value: 'under-150', label: 'Under 150', pill: 'Under 150 guests' },
  { value: '150-300', label: '150–300', pill: '150–300 guests' },
  { value: '300-500', label: '300–500', pill: '300–500 guests' },
  { value: '500-plus', label: '500+', pill: '500+ guests' },
];

export const VIBE_OPTIONS: { value: Vibe; label: string; pill: string }[] = [
  { value: 'palace', label: 'Palace & Grandeur', pill: 'Palace & Grandeur' },
  { value: 'modern', label: 'Modern & Minimal', pill: 'Modern & Minimal' },
  { value: 'beach', label: 'Beach & Tropical', pill: 'Beach & Tropical' },
  { value: 'garden', label: 'Garden & Outdoor', pill: 'Garden & Outdoor' },
];

export const BUDGET_OPTIONS: { value: Budget; label: string; pill: string }[] = [
  { value: 'under-100k', label: 'Under $100K', pill: 'Under $100K' },
  { value: '100-250k', label: '$100–250K', pill: '$100–250K' },
  { value: '250-500k', label: '$250–500K', pill: '$250–500K' },
  { value: '500k-plus', label: '$500K+', pill: '$500K+' },
];

type FilterKey = 'guests' | 'vibe' | 'budget';

const PLACEHOLDERS: Record<FilterKey, string> = {
  guests: '+ Guest count',
  vibe: '+ Vibe',
  budget: '+ Budget',
};

const TITLES: Record<FilterKey, string> = {
  guests: 'Guest count',
  vibe: 'Vibe',
  budget: 'Budget',
};

function getPillLabel(key: FilterKey, value: string | null): string | null {
  if (!value) return null;
  const list =
    key === 'guests' ? GUEST_OPTIONS : key === 'vibe' ? VIBE_OPTIONS : BUDGET_OPTIONS;
  return list.find((o) => o.value === value)?.pill ?? null;
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openKey, setOpenKey] = useState<FilterKey | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const guests = searchParams.get('guests');
  const vibe = searchParams.get('vibe');
  const budget = searchParams.get('budget');

  const hasAny = Boolean(guests || vibe || budget);

  useEffect(() => {
    if (!openKey) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openKey]);

  const updateParam = (key: FilterKey, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpenKey(null);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {!hasAny && (
        <p className={styles.prompt}>
          Set your guest count, vibe, and budget to see personalized results
        </p>
      )}

      <div className={styles.row} role="group" aria-label="Active filters">
        <FilterPill
          filterKey="guests"
          value={guests}
          options={GUEST_OPTIONS}
          isOpen={openKey === 'guests'}
          onToggle={() => setOpenKey(openKey === 'guests' ? null : 'guests')}
          onSelect={(v) => updateParam('guests', v)}
          onClear={() => updateParam('guests', null)}
        />
        <FilterPill
          filterKey="vibe"
          value={vibe}
          options={VIBE_OPTIONS}
          isOpen={openKey === 'vibe'}
          onToggle={() => setOpenKey(openKey === 'vibe' ? null : 'vibe')}
          onSelect={(v) => updateParam('vibe', v)}
          onClear={() => updateParam('vibe', null)}
        />
        <FilterPill
          filterKey="budget"
          value={budget}
          options={BUDGET_OPTIONS}
          isOpen={openKey === 'budget'}
          onToggle={() => setOpenKey(openKey === 'budget' ? null : 'budget')}
          onSelect={(v) => updateParam('budget', v)}
          onClear={() => updateParam('budget', null)}
        />
      </div>

      <div className={styles.creds} aria-label="Marigold credentials">
        <span className={styles.cred}>30+ destinations</span>
        <span aria-hidden="true" className={styles.credDot} />
        <span className={styles.cred}>500+ vendors</span>
        <span aria-hidden="true" className={styles.credDot} />
        <span className={styles.cred}>Calibrated for Indian weddings</span>
      </div>
    </div>
  );
}

type FilterPillProps = {
  filterKey: FilterKey;
  value: string | null;
  options: { value: string; label: string; pill: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClear: () => void;
};

function FilterPill({
  filterKey,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  onClear,
}: FilterPillProps) {
  const label = getPillLabel(filterKey, value);
  const isEmpty = !value;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className={[styles.pill, isEmpty ? styles.pillEmpty : '']
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{label ?? PLACEHOLDERS[filterKey]}</span>
        {!isEmpty ? (
          <span
            role="button"
            aria-label={`Clear ${TITLES[filterKey]}`}
            tabIndex={0}
            className={styles.clear}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }
            }}
          >
            ×
          </span>
        ) : (
          <span aria-hidden="true" className={styles.caret}>
            ▾
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.popover} role="listbox">
          <span className={styles.popoverTitle}>{TITLES[filterKey]}</span>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={[
                styles.option,
                value === opt.value ? styles.optionActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
