'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WhoPaysForWhat.module.css';

type Tradition =
  | 'north'
  | 'south'
  | 'gujarati'
  | 'punjabi'
  | 'sikh'
  | 'muslim'
  | 'bengali'
  | 'marathi'
  | 'general'
  | 'western';

const TRADITIONS: { key: Tradition; label: string }[] = [
  { key: 'north', label: 'Hindu — North Indian' },
  { key: 'south', label: 'Hindu — South Indian' },
  { key: 'gujarati', label: 'Gujarati' },
  { key: 'punjabi', label: 'Punjabi' },
  { key: 'sikh', label: 'Sikh' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'bengali', label: 'Bengali' },
  { key: 'marathi', label: 'Marathi' },
  { key: 'general', label: 'General Indian' },
  { key: 'western', label: 'Western / American' },
];

type Mode = 'traditional' | 'modern' | 'compare';

type CategoryRow = {
  category: string;
  // Per-tradition traditional payer (for "Bride", "Groom", "Both",
  // "Hosting family", etc.). All defaults are reasonable; specific traditions
  // override.
  traditional: Partial<Record<Tradition, string>>;
  defaultTraditional: string;
  modern: string;
};

const CATEGORIES: CategoryRow[] = [
  {
    category: 'Venue',
    defaultTraditional: "Bride's family",
    traditional: { muslim: "Groom's family (often)", western: "Bride's family", sikh: 'Both families' },
    modern: 'Whoever is hosting / split per host contribution',
  },
  {
    category: 'Catering — ceremony',
    defaultTraditional: "Bride's family",
    traditional: { muslim: "Groom's family", western: "Bride's family" },
    modern: 'Same as venue — whoever hosts',
  },
  {
    category: 'Catering — sangeet',
    defaultTraditional: "Groom's family (if they host)",
    traditional: {
      sikh: "Bride's family or hosts together",
      western: 'N/A',
    },
    modern: 'Whoever hosts the event',
  },
  {
    category: 'Catering — reception',
    defaultTraditional: "Groom's family",
    traditional: { western: "Bride's family", muslim: "Groom's family (Walima)" },
    modern: 'Couple or split — usually largest food expense',
  },
  {
    category: "Bride's outfits",
    defaultTraditional: "Bride's family + groom's family contributes lehenga",
    traditional: {
      muslim: 'Mahr (groom gives, bride keeps)',
      western: 'Bride or her family',
      sikh: "Bride's family",
    },
    modern: 'Bride or couple',
  },
  {
    category: "Groom's outfits",
    defaultTraditional: "Groom's family",
    traditional: {},
    modern: 'Groom or couple',
  },
  {
    category: 'Bridal jewelry',
    defaultTraditional: "Both families contribute key pieces",
    traditional: {
      muslim: 'Mahr or family gift',
      western: 'Often family heirlooms or gift',
      bengali: "Bride's mother gives signature pieces",
      south: "Both families (gold is significant — see local norms)",
    },
    modern: 'Family gifts or couple',
  },
  {
    category: 'Mehndi event',
    defaultTraditional: "Bride's family",
    traditional: { western: 'N/A', muslim: "Bride's family (Mayoun)" },
    modern: 'Bride / her family',
  },
  {
    category: 'Sangeet event',
    defaultTraditional: "Groom's family (often)",
    traditional: { sikh: 'Both families share', western: 'N/A' },
    modern: 'Hosting family or couple',
  },
  {
    category: 'Decoration & florals',
    defaultTraditional: 'Hosting family per event',
    traditional: { western: "Bride's family" },
    modern: 'Per-event host',
  },
  {
    category: 'Photography & video',
    defaultTraditional: "Bride's family or both",
    traditional: { western: "Bride's family" },
    modern: 'Couple or split',
  },
  {
    category: 'Invitations',
    defaultTraditional: "Bride's family",
    traditional: { muslim: 'Both families', western: "Bride's family" },
    modern: 'Couple',
  },
  {
    category: 'Honeymoon',
    defaultTraditional: 'Couple',
    traditional: { western: 'Couple', sikh: 'Couple' },
    modern: 'Couple',
  },
  {
    category: 'Shagun / gifts to family',
    defaultTraditional: "Both families exchange",
    traditional: {
      western: 'N/A',
      muslim: "Mahr from groom's side",
      south: 'Both families exchange ceremonially',
    },
    modern: 'Optional — many modern couples downplay',
  },
];

// Note on dowry — sensitive subject. Acknowledge it's outdated and illegal in
// India, while recognizing some families may still raise it.
const SENSITIVE_NOTE =
  'Dowry is illegal in India and not part of modern Indian-American weddings. If a family raises it, the universal answer is "no, that\'s not what we do."';

export function WhoPaysForWhat() {
  const [tradition, setTradition] = useState<Tradition>('north');
  const [mode, setMode] = useState<Mode>('compare');

  const rows = useMemo(() => {
    return CATEGORIES.map((c) => ({
      category: c.category,
      traditional: c.traditional[tradition] ?? c.defaultTraditional,
      modern: c.modern,
    }));
  }, [tradition]);

  return (
    <MiniToolShell
      name="Who Pays for What?"
      tagline="traditional breakdown vs. modern split"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="wp-tradition">
          Tradition
        </label>
        <select
          id="wp-tradition"
          className={primitives.select}
          value={tradition}
          onChange={(e) => setTradition(e.target.value as Tradition)}
        >
          {TRADITIONS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>View</label>
        <div className={styles.modeRow}>
          {(['traditional', 'modern', 'compare'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`${styles.modeChip} ${
                mode === m ? styles.modeChipActive : ''
              }`}
            >
              {m === 'compare' ? 'Side by side' : m}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tradition}-${mode}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {TRADITIONS.find((t) => t.key === tradition)?.label}
          </span>
          <p className={primitives.resultLabel}>
            {mode === 'compare'
              ? 'Tradition on the left. Modern norms on the right.'
              : mode === 'traditional'
              ? 'How it has historically worked.'
              : 'How most modern couples in the US actually do it.'}
          </p>

          <div className={styles.table}>
            {rows.map((row) => (
              <div key={row.category} className={styles.row}>
                <span className={styles.cat}>{row.category}</span>
                {(mode === 'traditional' || mode === 'compare') && (
                  <span className={`${styles.cell} ${styles.tradCell}`}>
                    {row.traditional}
                  </span>
                )}
                {(mode === 'modern' || mode === 'compare') && (
                  <span className={`${styles.cell} ${styles.modCell}`}>
                    {row.modern}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className={primitives.crosslink}>
            <strong>On dowry:</strong> {SENSITIVE_NOTE}
          </div>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
