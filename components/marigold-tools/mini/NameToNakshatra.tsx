'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { findNakshatraForName } from '@/lib/tools/mini/nakshatra-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './NameToNakshatra.module.css';

export function NameToNakshatra() {
  const [name, setName] = useState('');

  const result = useMemo(
    () => (name.trim() ? findNakshatraForName(name) : null),
    [name],
  );

  return (
    <MiniToolShell
      name="Name to Nakshatra"
      tagline="what birth star does your name belong to?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="nn-name">
          First name
        </label>
        <input
          id="nn-name"
          type="text"
          className={primitives.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Priya"
          autoFocus
        />
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>likely nakshatra</span>
            <h2 className={styles.nakName}>{result.name}</h2>
            <p className={styles.meaning}>{result.meaning}</p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Moon sign</span>
                <span className={primitives.breakdownValue}>{result.rashi}</span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Ruling planet</span>
                <span className={primitives.breakdownValue}>{result.ruler}</span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Deity</span>
                <span className={primitives.breakdownValue}>{result.deity}</span>
              </div>
            </div>

            <div className={primitives.crosslink}>
              This is based on the traditional syllable-to-Nakshatra mapping
              used in Hindu naming conventions. For a precise Nakshatra,{' '}
              <Link href="/tools/kundli">use your birth details instead</Link>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {name.trim() && !result && (
        <p className={primitives.note} style={{ marginTop: 24 }}>
          We couldn&apos;t map that name to a Nakshatra syllable. The mapping
          is based on Sanskrit/Hindi sounds — try the name as it sounds when
          spoken (e.g., &ldquo;Priya&rdquo; → &ldquo;pri&rdquo;).
        </p>
      )}
    </MiniToolShell>
  );
}
