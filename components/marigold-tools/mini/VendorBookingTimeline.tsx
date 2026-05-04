'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './InvitationTimeline.module.css';

const STYLES = [
  { key: 'hindu-north', label: 'Hindu — North Indian' },
  { key: 'hindu-south', label: 'Hindu — South Indian' },
  { key: 'sikh', label: 'Sikh' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'fusion', label: 'Fusion / Interfaith' },
  { key: 'nontrad', label: 'Non-traditional' },
] as const;

type StyleKey = (typeof STYLES)[number]['key'];

type Vendor = {
  name: string;
  monthsBefore: number;
  rangeLabel: string;
  note: string;
  // Optional bumps for specific traditions where lead times differ.
  bumps?: Partial<Record<StyleKey, number>>;
};

const VENDORS: Vendor[] = [
  {
    name: 'Venue',
    monthsBefore: 15,
    rangeLabel: '12 – 18 months',
    note: 'The single most date-constraining vendor. Lock this first.',
  },
  {
    name: 'Wedding planner',
    monthsBefore: 12,
    rangeLabel: '10 – 14 months',
    note: 'Hire before the venue if you want their input on the venue choice.',
  },
  {
    name: 'Photographer',
    monthsBefore: 12,
    rangeLabel: '10 – 14 months',
    note: 'Top South Asian photographers book a year out — sometimes 18 months.',
  },
  {
    name: 'Videographer',
    monthsBefore: 12,
    rangeLabel: '10 – 14 months',
    note: 'Often the same studio as your photographer — bundle and save.',
  },
  {
    name: 'Caterer (Indian)',
    monthsBefore: 10,
    rangeLabel: '8 – 12 months',
    note: 'Indian caterers in DFW are heavily booked — six months is risky.',
    bumps: { 'hindu-south': 1 }, // South Indian caterers a touch earlier
  },
  {
    name: 'Decorator / florist',
    monthsBefore: 8,
    rangeLabel: '6 – 10 months',
    note: 'Mandap design needs lead time. Florals can book later.',
  },
  {
    name: 'DJ / music',
    monthsBefore: 7,
    rangeLabel: '6 – 8 months',
    note: 'A good Bollywood DJ in DFW books up by 6 months.',
  },
  {
    name: 'Mehndi artist',
    monthsBefore: 5,
    rangeLabel: '4 – 6 months',
    note: 'Top artists travel — book early if you want a specific name.',
  },
  {
    name: 'Hair & makeup',
    monthsBefore: 5,
    rangeLabel: '4 – 6 months',
    note: 'Trials should happen 2–3 months out, after booking.',
  },
  {
    name: 'Pandit / officiant',
    monthsBefore: 5,
    rangeLabel: '3 – 6 months',
    note: 'Confirm muhurat timing with them before printing invitations.',
    bumps: { sikh: -1, muslim: -1 }, // Gurdwara/Imam typically less constrained
  },
  {
    name: 'Invitation design',
    monthsBefore: 5,
    rangeLabel: '4 – 6 months',
    note: 'Send 8–10 weeks before the wedding (12 for destination).',
  },
  {
    name: 'Transportation / shuttle',
    monthsBefore: 3,
    rangeLabel: '2 – 4 months',
    note: 'Confirm bus/horse/vintage car after the venue is set.',
  },
  {
    name: 'Wedding cake / sweets',
    monthsBefore: 3,
    rangeLabel: '2 – 4 months',
    note: 'Indian sweet vendors also need lead time for ladoos and barfi orders.',
  },
  {
    name: 'Dhol / baraat music',
    monthsBefore: 2.5,
    rangeLabel: '2 – 3 months',
    note: 'Dhol players can be booked late but the great ones go fast.',
    bumps: { muslim: -2, nontrad: -2 },
  },
  {
    name: 'Day-of coordinator',
    monthsBefore: 2.5,
    rangeLabel: '2 – 3 months',
    note: 'If your planner does not stay through the day, this is essential.',
  },
];

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function offsetMonths(weddingISO: string, months: number): Date | null {
  if (!weddingISO) return null;
  const [y, m, d] = weddingISO.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() - Math.round(months));
  return date;
}

export function VendorBookingTimeline() {
  const [wedding, setWedding] = useState<string>('');
  const [styleKey, setStyleKey] = useState<StyleKey>('hindu-north');

  const items = useMemo(() => {
    if (!wedding) return null;
    return VENDORS.map((v) => {
      const months = v.monthsBefore + (v.bumps?.[styleKey] ?? 0);
      return {
        ...v,
        adjustedMonths: months,
        date: offsetMonths(wedding, months),
      };
    })
      .filter((v): v is typeof v & { date: Date } => v.date !== null)
      .sort((a, b) => b.adjustedMonths - a.adjustedMonths);
  }, [wedding, styleKey]);

  return (
    <MiniToolShell
      name="Vendor Booking Timeline"
      tagline="when should you book each vendor?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="vb-date">
          Wedding date
        </label>
        <input
          id="vb-date"
          type="date"
          className={primitives.input}
          value={wedding}
          onChange={(e) => setWedding(e.target.value)}
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="vb-style">
          Wedding style (optional)
        </label>
        <select
          id="vb-style"
          className={primitives.select}
          value={styleKey}
          onChange={(e) => setStyleKey(e.target.value as StyleKey)}
        >
          {STYLES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {items && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              your booking timeline
            </span>
            <p className={primitives.resultLabel}>
              Earliest first. Don&apos;t panic if you&apos;re past one of these
              dates — most are flexible by a month or two.
            </p>

            <ol className={styles.timeline}>
              {items.map((v) => (
                <li key={v.name} className={styles.item}>
                  <div className={styles.dot} />
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemDate}>{fmtDate(v.date)}</span>
                      <span className={styles.itemWeeks}>{v.rangeLabel}</span>
                    </div>
                    <h3 className={styles.itemLabel}>{v.name}</h3>
                    <p className={styles.itemNote}>{v.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
