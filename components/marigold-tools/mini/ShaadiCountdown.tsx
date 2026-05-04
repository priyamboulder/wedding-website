'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './ShaadiCountdown.module.css';

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
};

function diff(target: Date, now: Date): Parts {
  const ms = target.getTime() - now.getTime();
  const past = ms < 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { days, hours, minutes, seconds, past };
}

function milestone(days: number): string | null {
  if (days < 0) return null;
  if (days === 0) return 'Today is the day. Breathe.';
  if (days === 1) return 'Tomorrow. Tomorrow!';
  if (days <= 7) return 'Less than a week to go.';
  if (days <= 30) return 'Final countdown — under a month.';
  if (days <= 100) return '100 days or fewer. Things are getting real.';
  if (days <= 180) return 'Six months out. The middle game.';
  return null;
}

function fmtLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ShaadiCountdown() {
  const [dateStr, setDateStr] = useState('');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [now, setNow] = useState<Date>(() => new Date());

  const target = useMemo(() => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0);
  }, [dateStr]);

  // Tick once per second when there's an active target
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const parts = target ? diff(target, now) : null;
  const callout = parts ? milestone(parts.days) : null;
  const couple =
    nameA && nameB
      ? `${nameA} & ${nameB}`
      : nameA || nameB || 'Your wedding';

  return (
    <MiniToolShell
      name="Shaadi Countdown"
      tagline="how many days until your wedding?"
      estimatedTime="10 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="sc-date">
          Wedding date
        </label>
        <input
          id="sc-date"
          type="date"
          className={primitives.input}
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sc-namea">
            Your name (optional)
          </label>
          <input
            id="sc-namea"
            type="text"
            className={primitives.input}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Priya"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sc-nameb">
            Partner&apos;s name (optional)
          </label>
          <input
            id="sc-nameb"
            type="text"
            className={primitives.input}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Arjun"
          />
        </div>
      </div>

      <AnimatePresence>
        {target && parts && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>{couple}</span>
            <p className={styles.targetDate}>{fmtLong(target)}</p>

            {parts.past ? (
              <div className={styles.pastBlock}>
                <p className={styles.pastLine}>
                  Married for {parts.days} day
                  {parts.days === 1 ? '' : 's'} and counting.
                </p>
                <p className={primitives.note}>
                  Hope it&apos;s been everything you hoped for. (And maybe go
                  back and unsubscribe from a wedding email or two.)
                </p>
              </div>
            ) : (
              <>
                <div className={styles.tickerGrid}>
                  <Cell value={parts.days} label="days" />
                  <Cell value={parts.hours} label="hours" />
                  <Cell value={parts.minutes} label="min" />
                  <Cell value={parts.seconds} label="sec" />
                </div>

                {callout && (
                  <p className={styles.milestoneCallout}>{callout}</p>
                )}

                <p className={primitives.note}>
                  On {fmtLong(target)}, you&apos;ll be married.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.cell}>
      <span className={styles.cellValue}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className={styles.cellLabel}>{label}</span>
    </div>
  );
}
