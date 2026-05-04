'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { MAJOR_TRANSITS_2026_2027 } from '@/lib/wedding-stars/transits';
import type { TransitDef } from '@/types/wedding-stars';
import primitives from './MiniToolPrimitives.module.css';
import styles from './PlanetaryTransitAlert.module.css';

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉',
  Moon: '☾',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

// One-line wedding implication per kind/planet. Mirrors the spec's intent
// to surface a single actionable note per active transit.
function implicationFor(t: TransitDef): string {
  if (t.kind === 'retrograde') {
    if (t.planet === 'Mercury')
      return "Hold off on signing new vendor contracts and sending invitations. Good for revisiting plans.";
    if (t.planet === 'Venus')
      return 'Big aesthetic decisions — outfits, color, decor — feel uncertain. Wait if you can.';
    return 'Re-examine recent decisions. Avoid finalizing big commitments.';
  }
  if (t.kind === 'exalted')
    return 'Strongly favorable window for major commitments and bookings.';
  if (t.kind === 'combust')
    return 'Energy of this planet is muted. Avoid leaning on it for key decisions.';
  if (t.kind === 'ingress') {
    if (t.planet === 'Jupiter')
      return 'Most benefic transit. Excellent for bookings, family conversations, and big decisions.';
    if (t.planet === 'Venus')
      return 'Favorable for aesthetic choices — venue walkthroughs, decor, dress shopping.';
    if (t.planet === 'Saturn')
      return 'Good for structural work — budgets, contracts, anything requiring discipline.';
    if (t.planet === 'Mars')
      return 'High-energy, action-friendly. Good for ramp-ups; risky for arguments.';
    if (t.planet === 'Mercury')
      return 'Smooth communications. Good window for invitations, RSVPs, family group chats.';
    return 'Energy shift — read its house placement against your Moon sign for specifics.';
  }
  return '';
}

function isActive(t: TransitDef, ymd: string): boolean {
  return ymd >= t.startISO && ymd <= t.endISO;
}

function startsInMonth(t: TransitDef, year: number, month: number): boolean {
  const m = parseInt(t.startISO.slice(5, 7), 10);
  const y = parseInt(t.startISO.slice(0, 4), 10);
  return y === year && m === month;
}

function endsInMonth(t: TransitDef, year: number, month: number): boolean {
  const m = parseInt(t.endISO.slice(5, 7), 10);
  const y = parseInt(t.endISO.slice(0, 4), 10);
  return y === year && m === month;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function fmtMonth(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function todayLocal(): { year: number; month: number; ymd: string } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    ymd:
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0'),
  };
}

const MONTH_OPTIONS: { year: number; month: number; label: string }[] = (() => {
  const out: { year: number; month: number; label: string }[] = [];
  for (const y of [2026, 2027]) {
    for (let m = 1; m <= 12; m++) {
      out.push({ year: y, month: m, label: fmtMonth(y, m) });
    }
  }
  return out;
})();

export function PlanetaryTransitAlert() {
  const { year: defaultYear, month: defaultMonth, ymd } = useMemo(
    () => todayLocal(),
    [],
  );
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);

  const active = useMemo(() => {
    // Bracket the month: any transit overlapping this month.
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(
      lastDay,
    ).padStart(2, '0')}`;
    return MAJOR_TRANSITS_2026_2027.filter(
      (t) => t.startISO <= monthEnd && t.endISO >= monthStart,
    ).sort((a, b) => a.startISO.localeCompare(b.startISO));
  }, [year, month]);

  const events = useMemo(
    () =>
      active.flatMap((t) => {
        const evs: { kind: 'starts' | 'ends'; iso: string; transit: TransitDef }[] = [];
        if (startsInMonth(t, year, month))
          evs.push({ kind: 'starts', iso: t.startISO, transit: t });
        if (endsInMonth(t, year, month))
          evs.push({ kind: 'ends', iso: t.endISO, transit: t });
        return evs;
      }).sort((a, b) => a.iso.localeCompare(b.iso)),
    [active, year, month],
  );

  return (
    <MiniToolShell
      name="Planetary Transit Alert"
      tagline="which planets are moving this month?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="pt-month">
          Month
        </label>
        <select
          id="pt-month"
          className={primitives.select}
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number);
            setYear(y!);
            setMonth(m!);
          }}
        >
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.label} value={`${opt.year}-${opt.month}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {fmtMonth(year, month)}
          </span>
          <p className={primitives.resultLabel}>
            {active.length === 0
              ? 'Quiet month — no major outer-planet movements.'
              : `${active.length} active transit${active.length === 1 ? '' : 's'} this month.`}
          </p>

          {active.length > 0 && (
            <ul className={styles.list}>
              {active.map((t) => {
                const isCurrent =
                  t.startISO <= ymd && t.endISO >= ymd;
                return (
                  <li
                    key={t.id}
                    className={`${styles.item} ${
                      t.warning ? styles.itemWarning : ''
                    }`}
                  >
                    <div className={styles.head}>
                      <span className={styles.glyph}>
                        {PLANET_GLYPH[t.planet] ?? '✦'}
                      </span>
                      <h3 className={styles.event}>{t.event}</h3>
                      {isCurrent && <span className={styles.tag}>active now</span>}
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.range}>
                        {fmtDate(t.startISO)} – {fmtDate(t.endISO)}
                      </span>
                      <span className={styles.kind}>{t.kind}</span>
                    </div>
                    <p className={styles.implication}>{implicationFor(t)}</p>
                  </li>
                );
              })}
            </ul>
          )}

          {events.length > 0 && (
            <div className={styles.eventsSection}>
              <span className={primitives.resultEyebrow}>this month&apos;s events</span>
              <ul className={styles.eventsList}>
                {events.map((e, idx) => (
                  <li key={idx} className={styles.eventItem}>
                    <span className={styles.eventDate}>{fmtDate(e.iso)}</span>
                    <span className={styles.eventLabel}>
                      {e.transit.event} {e.kind}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={primitives.crosslink}>
            Want a personalized 12-month transit timeline mapped to your
            Moon sign?{' '}
            <Link href="/tools/wedding-stars">Try Wedding Stars →</Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
