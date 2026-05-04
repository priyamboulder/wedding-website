'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import {
  QUESTIONS,
  VENDORS,
  type VendorKey,
} from '@/lib/tools/mini/vendor-questions-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './VendorQuestionGenerator.module.css';

export function VendorQuestionGenerator() {
  const [vendor, setVendor] = useState<VendorKey>('photographer');
  const list = QUESTIONS[vendor];
  const meta = VENDORS.find((v) => v.key === vendor)!;

  return (
    <MiniToolShell
      name="Vendor Question Generator"
      tagline="what to ask before you book"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="vq-vendor">
          Vendor type
        </label>
        <select
          id="vq-vendor"
          className={primitives.select}
          value={vendor}
          onChange={(e) => setVendor(e.target.value as VendorKey)}
        >
          {VENDORS.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={vendor}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {list.length} questions for your {meta.label.toLowerCase()}
          </span>
          <p className={primitives.resultLabel}>
            Bring this list to the consultation. Don&apos;t ask all of them
            at once — pick the five that matter most for your situation.
          </p>

          <ol className={styles.qList}>
            {list.map((item, idx) => (
              <li key={item.q} className={styles.qItem}>
                <span className={styles.qIndex}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className={styles.qBody}>
                  <h3 className={styles.qText}>{item.q}</h3>
                  <p className={styles.qWhy}>{item.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
