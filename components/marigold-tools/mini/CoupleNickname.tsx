'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './CoupleNickname.module.css';

type Style = 'all' | 'classic' | 'monogram' | 'bollywood' | 'cute';

const STYLE_LABELS: Record<Style, string> = {
  all: 'Show me everything',
  classic: 'Classic blends',
  monogram: 'Monogram-style',
  bollywood: 'Bollywood couples',
  cute: 'Cute & playful',
};

type Suggestion = { name: string; style: Exclude<Style, 'all'>; note: string };

function clean(s: string): string {
  return s.replace(/[^a-zA-Z]/g, '');
}

function cap(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function vowels(s: string): number[] {
  const idx: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if ('aeiouAEIOU'.includes(s[i] ?? '')) idx.push(i);
  }
  return idx;
}

function blend(a: string, b: string, mode: 'AB' | 'BA'): string {
  if (!a || !b) return '';
  const A = cap(a);
  const B = cap(b);
  if (mode === 'AB') {
    const av = vowels(A);
    const cut = av.length > 0 ? Math.min(av[Math.floor(av.length / 2)]! + 1, A.length) : Math.ceil(A.length / 2);
    const half = A.slice(0, Math.max(2, cut));
    const bv = vowels(B);
    const start = bv.length > 0 ? Math.max(0, bv[0]! - 1) : 0;
    const tail = B.slice(start);
    return cap(half + tail.toLowerCase());
  } else {
    return blend(b, a, 'AB');
  }
}

function generate(aRaw: string, bRaw: string): Suggestion[] {
  const a = clean(aRaw);
  const b = clean(bRaw);
  const A = cap(a);
  const B = cap(b);
  if (!A || !B) return [];

  const out: Suggestion[] = [];

  // Classic blends — Brangelina-style
  const ab = blend(A, B, 'AB');
  const ba = blend(A, B, 'BA');
  if (ab && ab !== A && ab !== B) {
    out.push({ name: ab, style: 'classic', note: `${A.slice(0, Math.ceil(A.length / 2))} + ${B.slice(Math.floor(B.length / 2))}` });
  }
  if (ba && ba !== A && ba !== B && ba !== ab) {
    out.push({ name: ba, style: 'classic', note: `${B.slice(0, Math.ceil(B.length / 2))} + ${A.slice(Math.floor(A.length / 2))}` });
  }
  // First-half + first-half
  out.push({ name: cap(A.slice(0, Math.ceil(A.length / 2)) + B.slice(0, Math.ceil(B.length / 2))).toLowerCase().split('').map((c, i) => i === 0 ? c.toUpperCase() : c).join(''), style: 'classic', note: 'first halves' });

  // Monogram — initials
  const ai = A.charAt(0);
  const bi = B.charAt(0);
  out.push({ name: `${ai} & ${bi}`, style: 'monogram', note: 'initials with ampersand' });
  out.push({ name: `${ai}${bi}`, style: 'monogram', note: 'paired initials' });
  out.push({ name: `${ai}.${bi}.`, style: 'monogram', note: 'period-separated' });

  // Bollywood couples — name in the style of famous on-screen / real-life jodis
  out.push({ name: `${A} & ${B}`, style: 'bollywood', note: 'classic ampersand pairing' });
  out.push({ name: `Team ${A}${B.slice(0, 2)}`, style: 'bollywood', note: 'Virushka / DeepVeer style' });
  out.push({ name: `${A}-${B}`, style: 'bollywood', note: 'hyphenated power couple' });

  // Cute / playful
  out.push({ name: `${A} ka ${B}`, style: 'cute', note: 'Hindi possessive — playful' });
  out.push({ name: `${A} + ${B}`, style: 'cute', note: 'plus sign forever' });
  out.push({ name: `${A} loves ${B}`, style: 'cute', note: 'wholesome' });
  if (A.length > 2 && B.length > 2) {
    out.push({ name: `${A.slice(0, 3)}${B.slice(0, 3)}`, style: 'cute', note: 'three-letter blend' });
  }

  // Dedupe by name (case-insensitive)
  const seen = new Set<string>();
  return out.filter((s) => {
    const k = s.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return s.name.length > 0;
  });
}

export function CoupleNickname() {
  const [aFirst, setAFirst] = useState('');
  const [bFirst, setBFirst] = useState('');
  const [style, setStyle] = useState<Style>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const suggestions = useMemo(() => generate(aFirst, bFirst), [aFirst, bFirst]);
  const filtered = useMemo(
    () => (style === 'all' ? suggestions : suggestions.filter((s) => s.style === style)),
    [suggestions, style],
  );

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500);
    } catch {
      // clipboard blocked; user can copy manually
    }
  }

  return (
    <MiniToolShell
      name="Couple Name Generator"
      tagline="your celebrity couple name"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="cn-a">
            Your first name
          </label>
          <input
            id="cn-a"
            type="text"
            className={primitives.input}
            value={aFirst}
            onChange={(e) => setAFirst(e.target.value)}
            placeholder="Priya"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="cn-b">
            Partner&apos;s first name
          </label>
          <input
            id="cn-b"
            type="text"
            className={primitives.input}
            value={bFirst}
            onChange={(e) => setBFirst(e.target.value)}
            placeholder="Arjun"
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="cn-style">
          Style
        </label>
        <select
          id="cn-style"
          className={primitives.select}
          value={style}
          onChange={(e) => setStyle(e.target.value as Style)}
        >
          {(Object.keys(STYLE_LABELS) as Style[]).map((s) => (
            <option key={s} value={s}>
              {STYLE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              {filtered.length} ideas
            </span>
            <p className={primitives.resultLabel}>Tap to copy.</p>

            <ul className={styles.list}>
              {filtered.map((s) => (
                <li key={s.name} className={styles.item}>
                  <button
                    type="button"
                    onClick={() => copy(s.name)}
                    className={styles.itemButton}
                  >
                    <span className={styles.name}>{s.name}</span>
                    <span className={styles.note}>{s.note}</span>
                    <span className={styles.copy}>
                      {copied === s.name ? 'copied!' : 'copy'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
