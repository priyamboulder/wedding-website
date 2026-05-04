'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './PlusOnePolicy.module.css';

type Budget = 'tight' | 'moderate' | 'generous';

const BUDGETS: { key: Budget; label: string; sub: string }[] = [
  { key: 'tight', label: 'Tight', sub: 'minimize plus-ones' },
  { key: 'moderate', label: 'Moderate', sub: 'some plus-ones' },
  { key: 'generous', label: 'Generous', sub: 'most people get plus-ones' },
];

type Tier = {
  key: string;
  label: string;
  // Per-budget verdict + rationale
  verdicts: Record<
    Budget,
    { verdict: 'yes' | 'maybe' | 'no'; rationale: string }
  >;
  // Estimated % of guests in this tier who actually use the +1 they're given
  uptake: number;
};

const TIERS: Tier[] = [
  {
    key: 'married',
    label: 'Married couples',
    verdicts: {
      tight: { verdict: 'yes', rationale: 'Always invite married couples together. Non-negotiable.' },
      moderate: { verdict: 'yes', rationale: 'Always invite married couples together.' },
      generous: { verdict: 'yes', rationale: 'Always — and they\'ll always use it.' },
    },
    uptake: 0.95,
  },
  {
    key: 'engaged',
    label: 'Engaged couples',
    verdicts: {
      tight: { verdict: 'yes', rationale: 'Engaged is functionally married for invitation purposes.' },
      moderate: { verdict: 'yes', rationale: 'Engaged means engaged — invite both.' },
      generous: { verdict: 'yes', rationale: 'Always.' },
    },
    uptake: 0.9,
  },
  {
    key: 'cohabit',
    label: 'Couples dating 1+ year (or living together)',
    verdicts: {
      tight: { verdict: 'yes', rationale: "Don't split up serious couples — feels exclusionary." },
      moderate: { verdict: 'yes', rationale: 'Long-term partners deserve the +1.' },
      generous: { verdict: 'yes', rationale: 'Always.' },
    },
    uptake: 0.85,
  },
  {
    key: 'newdating',
    label: 'Couples dating < 1 year',
    verdicts: {
      tight: { verdict: 'no', rationale: 'New relationships fade. Don\'t bake them into a 300-person guest list.' },
      moderate: { verdict: 'maybe', rationale: 'Case-by-case. If they\'ll know other guests, skip the +1.' },
      generous: { verdict: 'yes', rationale: 'Sure — extend the +1 even to new relationships.' },
    },
    uptake: 0.6,
  },
  {
    key: 'singlefriends',
    label: 'Single friends (will know other guests)',
    verdicts: {
      tight: { verdict: 'no', rationale: 'They\'ll have friends there. Save the seat.' },
      moderate: { verdict: 'no', rationale: 'They have a built-in friend group at the wedding.' },
      generous: { verdict: 'yes', rationale: 'Optional but kind.' },
    },
    uptake: 0.3,
  },
  {
    key: 'singlestrangers',
    label: 'Single friends (won\'t know anyone else)',
    verdicts: {
      tight: { verdict: 'maybe', rationale: 'Stretch the budget for these — being seated with strangers as a solo is awful.' },
      moderate: { verdict: 'yes', rationale: 'Yes — kindness budget. Stranger weddings are isolating.' },
      generous: { verdict: 'yes', rationale: 'Always.' },
    },
    uptake: 0.65,
  },
  {
    key: 'singlecousins',
    label: 'Single cousins',
    verdicts: {
      tight: { verdict: 'no', rationale: 'Family table = built-in plus-ones.' },
      moderate: { verdict: 'maybe', rationale: 'Depends on age — adult cousins yes, college cousins probably no.' },
      generous: { verdict: 'yes', rationale: 'Sure.' },
    },
    uptake: 0.4,
  },
  {
    key: 'parentfriends',
    label: "Parents' friends",
    verdicts: {
      tight: { verdict: 'no', rationale: "Their spouse, sure. A new +1, no." },
      moderate: { verdict: 'no', rationale: 'Spouse only.' },
      generous: { verdict: 'maybe', rationale: 'Spouse always; new partners case-by-case.' },
    },
    uptake: 0.2,
  },
  {
    key: 'colleagues',
    label: 'Colleagues',
    verdicts: {
      tight: { verdict: 'no', rationale: 'Colleagues without a known partner = no.' },
      moderate: { verdict: 'no', rationale: 'Spouse if married; nobody otherwise.' },
      generous: { verdict: 'maybe', rationale: 'Only if you want a much bigger wedding.' },
    },
    uptake: 0.5,
  },
];

const PER_GUEST_DEFAULT = 150;

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function PlusOnePolicy() {
  const [budget, setBudget] = useState<Budget>('moderate');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(TIERS.map((t) => t.key)),
  );
  const [counts, setCounts] = useState<Record<string, number>>({});

  function toggleTier(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  const result = useMemo(() => {
    const rows = TIERS.filter((t) => selected.has(t.key));
    let estimatedPlusOnes = 0;
    rows.forEach((t) => {
      const verdict = t.verdicts[budget];
      const count = counts[t.key] ?? 0;
      if (verdict.verdict === 'yes') estimatedPlusOnes += count * t.uptake;
      if (verdict.verdict === 'maybe') estimatedPlusOnes += count * t.uptake * 0.5;
    });
    estimatedPlusOnes = Math.round(estimatedPlusOnes);
    return { rows, estimatedPlusOnes, budgetImpact: estimatedPlusOnes * PER_GUEST_DEFAULT };
  }, [selected, budget, counts]);

  return (
    <MiniToolShell
      name="Plus-One Policy Decider"
      tagline="who gets a plus-one and who doesn't?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Budget posture</label>
        <div className={styles.budgetRow}>
          {BUDGETS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBudget(b.key)}
              className={`${styles.budgetChip} ${
                budget === b.key ? styles.budgetChipActive : ''
              }`}
            >
              <span className={styles.budgetLabel}>{b.label}</span>
              <span className={styles.budgetSub}>{b.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Guest tiers on your list</label>
        <div className={styles.tierList}>
          {TIERS.map((t) => {
            const verdict = t.verdicts[budget];
            const isOn = selected.has(t.key);
            return (
              <div key={t.key} className={styles.tier}>
                <label
                  className={`${primitives.checkboxLabel} ${
                    isOn ? primitives.checkboxLabelChecked : ''
                  }`}
                  style={{ flex: 1 }}
                >
                  <input
                    type="checkbox"
                    className={primitives.checkbox}
                    checked={isOn}
                    onChange={() => toggleTier(t.key)}
                  />
                  {t.label}
                </label>
                <span
                  className={`${styles.verdict} ${
                    styles[`verdict_${verdict.verdict}`]
                  }`}
                >
                  {verdict.verdict === 'yes' && '✓ yes'}
                  {verdict.verdict === 'maybe' && '? case-by-case'}
                  {verdict.verdict === 'no' && '✕ no'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {selected.size > 0 && (
        <div className={primitives.field}>
          <label className={primitives.label}>Approximate guests in each tier</label>
          <div className={styles.countGrid}>
            {Array.from(selected).map((key) => {
              const t = TIERS.find((x) => x.key === key)!;
              return (
                <div key={key} className={styles.countRow}>
                  <span className={styles.countLabel}>{t.label}</span>
                  <input
                    type="number"
                    className={styles.countInput}
                    value={counts[key] || ''}
                    min={0}
                    onChange={(e) =>
                      setCounts({
                        ...counts,
                        [key]: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {result.rows.length > 0 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              estimated plus-ones who&apos;ll attend
            </span>
            <div className={primitives.bigNumber}>{result.estimatedPlusOnes}</div>
            <p className={primitives.resultLabel}>
              At a default {fmt(PER_GUEST_DEFAULT)}/guest, that&apos;s about{' '}
              {fmt(result.budgetImpact)} in extra catering and seating.
            </p>

            <div className={primitives.crosslink}>
              <strong>Etiquette refresher:</strong> never split a married or
              engaged couple — that&apos;s a deal-breaker. Single friends who
              won&apos;t know anyone deserve a +1 so they&apos;re not stranded
              at a stranger table.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
