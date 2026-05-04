'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { RASHIS, checkCompat } from '@/lib/tools/mini/rashi-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './RashiQuickCheck.module.css';

export function RashiQuickCheck() {
  const [a, setA] = useState<string>('mesh');
  const [b, setB] = useState<string>('tula');

  const result = useMemo(() => checkCompat(a, b), [a, b]);

  return (
    <MiniToolShell
      name="Rashi Compatibility Quick Check"
      tagline="quick compatibility by Moon sign"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="rq-a">
            Partner A&apos;s Moon sign
          </label>
          <select
            id="rq-a"
            className={primitives.select}
            value={a}
            onChange={(e) => setA(e.target.value)}
          >
            {RASHIS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name} ({r.english})
              </option>
            ))}
          </select>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="rq-b">
            Partner B&apos;s Moon sign
          </label>
          <select
            id="rq-b"
            className={primitives.select}
            value={b}
            onChange={(e) => setB(e.target.value)}
          >
            {RASHIS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name} ({r.english})
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${a}-${b}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>compatibility</span>
            <div className={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`${styles.star} ${
                    n <= result.score ? styles.starOn : ''
                  }`}
                >
                  ✦
                </span>
              ))}
              <span className={styles.starLabel}>{result.score} of 5</span>
            </div>
            <p className={primitives.resultLabel}>{result.summary}</p>

            {result.strengths.length > 0 && (
              <div className={styles.section}>
                <span className={primitives.resultEyebrow}>strengths</span>
                <ul className={styles.list}>
                  {result.strengths.map((s) => (
                    <li key={s} className={styles.listItem}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.watch.length > 0 && (
              <div className={styles.section}>
                <span className={primitives.resultEyebrow}>worth watching</span>
                <ul className={styles.list}>
                  {result.watch.map((s) => (
                    <li key={s} className={styles.listItem}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={primitives.crosslink}>
              This is the simplified read. For the full 36-point Ashtakoota
              analysis with Manglik, Nadi, and Bhakoot details,{' '}
              <Link href="/tools/kundli">try Kundli Match</Link> using both
              birth details.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
