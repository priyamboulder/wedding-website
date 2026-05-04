'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import {
  MERCURY_RETROGRADES,
  type RetrogradeWindow,
} from '@/lib/tools/mini/mercury-retrograde-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './MercuryRetrogradeChecker.module.css';

function toYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function findActiveWindow(ymd: string): RetrogradeWindow | null {
  return (
    MERCURY_RETROGRADES.find((w) => ymd >= w.start && ymd <= w.end) ?? null
  );
}

function findNextWindow(ymd: string): RetrogradeWindow | null {
  return MERCURY_RETROGRADES.find((w) => w.start > ymd) ?? null;
}

function formatLong(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aDate = Date.UTC(ay, am - 1, ad);
  const bDate = Date.UTC(by, bm - 1, bd);
  return Math.round((bDate - aDate) / (1000 * 60 * 60 * 24));
}

export function MercuryRetrogradeChecker() {
  const today = useMemo(() => toYMD(new Date()), []);
  const [checkDate, setCheckDate] = useState<string>(today);

  const active = useMemo(() => findActiveWindow(checkDate), [checkDate]);
  const next = useMemo(() => findNextWindow(checkDate), [checkDate]);

  const upcoming = useMemo(
    () => MERCURY_RETROGRADES.filter((w) => w.end >= today).slice(0, 6),
    [today],
  );

  const isToday = checkDate === today;

  return (
    <MiniToolShell
      name="Mercury Retrograde Checker"
      tagline="is Mercury in retrograde right now?"
      estimatedTime="10 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="mr-date">
          Check a date
        </label>
        <input
          id="mr-date"
          type="date"
          className={primitives.input}
          value={checkDate}
          onChange={(e) => setCheckDate(e.target.value || today)}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active ? `yes-${active.start}` : `no-${next?.start ?? 'none'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {isToday ? 'right now' : `on ${formatLong(checkDate)}`}
          </span>

          {active ? (
            <>
              <div className={`${styles.verdict} ${styles.verdictYes}`}>
                Yes
              </div>
              <p className={primitives.resultLabel}>
                Mercury is retrograde.
              </p>
              <div className={primitives.breakdown}>
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>Started</span>
                  <span className={primitives.breakdownValue}>
                    {formatLong(active.start)}
                  </span>
                </div>
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>Ends</span>
                  <span className={primitives.breakdownValue}>
                    {formatLong(active.end)}
                  </span>
                </div>
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Days remaining
                  </span>
                  <span className={primitives.breakdownValue}>
                    {Math.max(0, daysBetween(checkDate, active.end))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`${styles.verdict} ${styles.verdictNo}`}>No</div>
              <p className={primitives.resultLabel}>
                Mercury is direct. Sign the contract.
              </p>
              {next && (
                <div className={primitives.breakdown}>
                  <div className={primitives.breakdownRow}>
                    <span className={primitives.breakdownLabel}>
                      Next retrograde
                    </span>
                    <span className={primitives.breakdownValue}>
                      {formatLong(next.start)}
                    </span>
                  </div>
                  <div className={primitives.breakdownRow}>
                    <span className={primitives.breakdownLabel}>
                      Days from now
                    </span>
                    <span className={primitives.breakdownValue}>
                      {daysBetween(checkDate, next.start)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className={primitives.crosslink}>
            <strong>Wedding planning note:</strong> avoid signing new vendor
            contracts, sending invitations, or finalizing wording during
            retrograde. Good for: reviewing existing plans, revisiting vendors
            you passed on, and catching errors.
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.upcomingSection}>
        <h2 className={styles.upcomingHeading}>Upcoming windows</h2>
        <ul className={styles.upcomingList}>
          {upcoming.map((w) => {
            const isActive = w === active;
            return (
              <li
                key={w.start}
                className={`${styles.upcomingItem} ${
                  isActive ? styles.upcomingItemActive : ''
                }`}
              >
                <span className={styles.upcomingDates}>
                  {formatLong(w.start)} — {formatLong(w.end)}
                </span>
                {isActive && (
                  <span className={styles.upcomingTag}>active</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </MiniToolShell>
  );
}
