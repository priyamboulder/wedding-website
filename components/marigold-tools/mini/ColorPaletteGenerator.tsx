'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import {
  rankPalettes,
  type Season,
  type Vibe,
  type Tradition,
  type Palette,
} from '@/lib/tools/mini/palette-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './ColorPaletteGenerator.module.css';

const SEASONS: { key: Season; label: string }[] = [
  { key: 'spring', label: 'Spring' },
  { key: 'summer', label: 'Summer' },
  { key: 'fall', label: 'Fall' },
  { key: 'winter', label: 'Winter' },
];

const VIBES: { key: Vibe; label: string }[] = [
  { key: 'romantic', label: 'Romantic' },
  { key: 'bold', label: 'Bold' },
  { key: 'earthy', label: 'Earthy' },
  { key: 'modern', label: 'Modern' },
  { key: 'traditional', label: 'Traditional' },
  { key: 'regal', label: 'Regal' },
];

const TRADITIONS: { key: Tradition; label: string }[] = [
  { key: 'north', label: 'North Indian' },
  { key: 'south', label: 'South Indian' },
  { key: 'gujarati', label: 'Gujarati' },
  { key: 'sikh', label: 'Sikh' },
  { key: 'fusion', label: 'Fusion' },
  { key: 'minimal', label: 'Minimal tradition' },
];

const MUST_INCLUDE_OPTIONS = [
  { label: 'No preference', value: '' },
  { label: 'Red', value: '#9B1B30' },
  { label: 'Gold', value: '#C9A96E' },
  { label: 'Pink', value: '#E8B4B8' },
  { label: 'Green', value: '#1F5F4F' },
  { label: 'Blue', value: '#1A2447' },
  { label: 'Purple', value: '#7A5965' },
  { label: 'Orange', value: '#FF8C32' },
  { label: 'Ivory', value: '#F5EFE3' },
];

export function ColorPaletteGenerator() {
  const [season, setSeason] = useState<Season>('fall');
  const [vibe, setVibe] = useState<Vibe>('regal');
  const [tradition, setTradition] = useState<Tradition>('north');
  const [mustInclude, setMustInclude] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const palettes = useMemo(
    () => rankPalettes({ season, vibe, tradition, mustInclude: mustInclude || undefined }),
    [season, vibe, tradition, mustInclude],
  );

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
    } catch {
      // ignore
    }
  }

  const featured = palettes[0];
  const alternates = palettes.slice(1);

  return (
    <MiniToolShell
      name="Color Palette Generator"
      tagline="find your wedding colors"
      estimatedTime="1 min"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="cp-season">
            Season
          </label>
          <select
            id="cp-season"
            className={primitives.select}
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
          >
            {SEASONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="cp-vibe">
            Vibe
          </label>
          <select
            id="cp-vibe"
            className={primitives.select}
            value={vibe}
            onChange={(e) => setVibe(e.target.value as Vibe)}
          >
            {VIBES.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="cp-tradition">
            Tradition influence
          </label>
          <select
            id="cp-tradition"
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
          <label className={primitives.label} htmlFor="cp-must">
            Must include color
          </label>
          <select
            id="cp-must"
            className={primitives.select}
            value={mustInclude}
            onChange={(e) => setMustInclude(e.target.value)}
          >
            {MUST_INCLUDE_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {featured && (
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your palette</span>
            <h2 className={styles.paletteName}>{featured.name}</h2>

            <div className={styles.featuredSwatches}>
              {featured.colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => copy(c.hex)}
                  className={styles.swatch}
                >
                  <div
                    className={styles.swatchColor}
                    style={{ background: c.hex }}
                  />
                  <span className={styles.swatchName}>{c.name}</span>
                  <span className={styles.swatchHex}>
                    {copied === c.hex ? 'copied!' : c.hex}
                  </span>
                  <span className={styles.swatchUse}>{c.use}</span>
                </button>
              ))}
            </div>

            {alternates.length > 0 && (
              <div className={styles.altsSection}>
                <span className={primitives.resultEyebrow}>alternates</span>
                <div className={styles.altsList}>
                  {alternates.map((p) => (
                    <AltCard key={p.id} palette={p} onCopy={copy} copied={copied} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}

function AltCard({
  palette,
  onCopy,
  copied,
}: {
  palette: Palette;
  onCopy: (hex: string) => void;
  copied: string | null;
}) {
  return (
    <div className={styles.altCard}>
      <span className={styles.altName}>{palette.name}</span>
      <div className={styles.altSwatches}>
        {palette.colors.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => onCopy(c.hex)}
            className={styles.altSwatch}
            style={{ background: c.hex }}
            aria-label={`${c.name} ${c.hex}`}
            title={`${c.name} — ${c.hex}${copied === c.hex ? ' (copied!)' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
