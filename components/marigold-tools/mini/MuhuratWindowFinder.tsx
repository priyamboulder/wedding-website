'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { HINDU_MUHURAT_2026 } from '@/lib/auspicious-date/data/muhurat-2026';
import { HINDU_MUHURAT_2027 } from '@/lib/auspicious-date/data/muhurat-2027';
import type { YearMuhuratData } from '@/types/auspicious-date';
import primitives from './MiniToolPrimitives.module.css';
import styles from './MuhuratWindowFinder.module.css';

type Ceremony = 'hindu' | 'sikh' | 'muslim' | 'other';

const CEREMONIES: { key: Ceremony; label: string }[] = [
  { key: 'hindu', label: 'Hindu' },
  { key: 'sikh', label: 'Sikh — Anand Karaj' },
  { key: 'muslim', label: 'Muslim — Nikah' },
  { key: 'other', label: 'Other / civil' },
];

function getYear(iso: string): number | null {
  const y = parseInt(iso.slice(0, 4), 10);
  return isNaN(y) ? null : y;
}

function getMonth(iso: string): number | null {
  const m = parseInt(iso.slice(5, 7), 10);
  return isNaN(m) ? null : m;
}

function getDay(iso: string): number | null {
  const d = parseInt(iso.slice(8, 10), 10);
  return isNaN(d) ? null : d;
}

function fmtLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function dataFor(year: number): YearMuhuratData | null {
  if (year === 2026) return HINDU_MUHURAT_2026;
  if (year === 2027) return HINDU_MUHURAT_2027;
  return null;
}

function isInBlockedPeriod(
  iso: string,
  data: YearMuhuratData,
): { name: string; explanation: string } | null {
  for (const block of data.blockedPeriods) {
    if (iso >= block.start && iso <= block.end) {
      return { name: block.name, explanation: block.explanation };
    }
  }
  return null;
}

export function MuhuratWindowFinder() {
  const [date, setDate] = useState('');
  const [ceremony, setCeremony] = useState<Ceremony>('hindu');

  const result = useMemo(() => {
    if (!date) return null;
    const year = getYear(date);
    const month = getMonth(date);
    const day = getDay(date);
    if (!year || !month || !day) return null;

    if (ceremony === 'sikh') {
      return {
        kind: 'sikh' as const,
        windowLabel: '9:00 AM – 11:00 AM (typical)',
        note: 'Anand Karaj is most often performed in the morning, before the langar service. Confirm exact timing with your Gurdwara — some accept afternoon ceremonies, others do not.',
      };
    }

    if (ceremony === 'muslim') {
      return {
        kind: 'muslim' as const,
        windowLabel: 'After Zuhr prayer (early afternoon)',
        note: 'Nikah is typically scheduled after Zuhr prayer for daytime weddings, or after Maghrib for evening ones. There is no fixed astrological window — confirm with your Imam.',
      };
    }

    if (ceremony === 'other') {
      return {
        kind: 'other' as const,
        windowLabel: 'No restriction',
        note: 'Civil and interfaith ceremonies have no traditional muhurat. Pick the time that works for your venue and guests.',
      };
    }

    // Hindu — look up real data
    const data = dataFor(year);
    if (!data) {
      return {
        kind: 'no-data' as const,
        windowLabel: '—',
        note: `We only have published Panchang data for 2026 and 2027 right now. For ${year}, confirm with your family pandit.`,
      };
    }

    const blocked = isInBlockedPeriod(date, data);
    if (blocked) {
      return {
        kind: 'blocked' as const,
        blockName: blocked.name,
        explanation: blocked.explanation,
      };
    }

    const monthData = data.months[month];
    const isMuhuratDay = monthData?.dates.includes(day) ?? false;

    if (!isMuhuratDay) {
      return {
        kind: 'no-muhurat' as const,
        monthQuality: monthData?.quality ?? 'limited',
        monthNotes: monthData?.notes,
        warning: monthData?.warning,
      };
    }

    const detail = data.dateDetails[date];
    return {
      kind: 'muhurat' as const,
      window: detail?.muhuratWindow,
      nakshatra: detail?.nakshatra,
      tithi: detail?.tithi,
      notes: detail?.notes,
    };
  }, [date, ceremony]);

  return (
    <MiniToolShell
      name="Muhurat Window Finder"
      tagline="what time should your ceremony start?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="mw-date">
          Wedding date
        </label>
        <input
          id="mw-date"
          type="date"
          className={primitives.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min="2026-01-01"
          max="2027-12-31"
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="mw-ceremony">
          Ceremony type
        </label>
        <select
          id="mw-ceremony"
          className={primitives.select}
          value={ceremony}
          onChange={(e) => setCeremony(e.target.value as Ceremony)}
        >
          {CEREMONIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${date}-${ceremony}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>{fmtLong(date)}</span>

            {result.kind === 'muhurat' && (
              <>
                <div className={styles.window}>
                  {result.window
                    ? `${result.window.start} – ${result.window.end}`
                    : 'Auspicious day'}
                </div>
                <p className={primitives.resultLabel}>
                  This is a published muhurat date.
                </p>
                {(result.nakshatra || result.tithi) && (
                  <div className={primitives.breakdown}>
                    {result.nakshatra && (
                      <div className={primitives.breakdownRow}>
                        <span className={primitives.breakdownLabel}>
                          Nakshatra
                        </span>
                        <span className={primitives.breakdownValue}>
                          {result.nakshatra}
                        </span>
                      </div>
                    )}
                    {result.tithi && (
                      <div className={primitives.breakdownRow}>
                        <span className={primitives.breakdownLabel}>Tithi</span>
                        <span className={primitives.breakdownValue}>
                          {result.tithi}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {result.notes && (
                  <p className={primitives.note}>{result.notes}</p>
                )}
              </>
            )}

            {result.kind === 'blocked' && (
              <>
                <div className={`${styles.window} ${styles.windowBlocked}`}>
                  Blocked
                </div>
                <p className={primitives.resultLabel}>
                  Falls within {result.blockName}.
                </p>
                <p className={primitives.note}>{result.explanation}</p>
              </>
            )}

            {result.kind === 'no-muhurat' && (
              <>
                <div className={`${styles.window} ${styles.windowNeutral}`}>
                  No published muhurat
                </div>
                <p className={primitives.resultLabel}>
                  This date is not on the published Panchang muhurat list.
                </p>
                {result.monthNotes && (
                  <p className={primitives.note}>{result.monthNotes}</p>
                )}
                {result.warning && (
                  <p className={primitives.note} style={{ color: 'var(--pink)' }}>
                    {result.warning}
                  </p>
                )}
              </>
            )}

            {(result.kind === 'sikh' ||
              result.kind === 'muslim' ||
              result.kind === 'other' ||
              result.kind === 'no-data') && (
              <>
                <div className={styles.window}>{result.windowLabel}</div>
                <p className={primitives.note}>{result.note}</p>
              </>
            )}

            {ceremony === 'hindu' && (
              <div className={primitives.crosslink}>
                Want a full year-by-year auspicious-date browser with weather
                and venue pricing?{' '}
                <Link href="/tools/dates">Try Auspicious Date Finder →</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className={primitives.note}>
        Confirm exact timing with your family pandit — these are based on
        widely published 2026/2027 Panchang data, but regional traditions
        vary.
      </p>
    </MiniToolShell>
  );
}
