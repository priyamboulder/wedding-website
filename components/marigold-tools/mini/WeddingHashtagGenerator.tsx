'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingHashtagGenerator.module.css';

type Tone = 'classic' | 'pun' | 'bollywood' | 'minimal' | 'all';

const TONE_LABELS: Record<Tone, string> = {
  classic: 'Classic & elegant',
  pun: 'Punny & playful',
  bollywood: 'Bollywood-inspired',
  minimal: 'Minimalist',
  all: 'Show me everything',
};

type Suggestion = { tag: string; tone: Exclude<Tone, 'all'> };

function cap(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function strip(s: string): string {
  return s.replace(/[^a-zA-Z]/g, '');
}

// Simple year suffix — most couples use the wedding year. We'll let users
// change it; default to next calendar year as a sensible guess.
function defaultYear(): string {
  return String(new Date().getFullYear() + 1);
}

function generate(
  aFirst: string,
  aLast: string,
  bFirst: string,
  bLast: string,
  year: string,
): Suggestion[] {
  const A = cap(strip(aFirst));
  const Alast = cap(strip(aLast));
  const B = cap(strip(bFirst));
  const Blast = cap(strip(bLast));

  if (!A && !B) return [];

  const out: Suggestion[] = [];

  // Classic — straightforward name + last-name plays
  if (Alast && Blast) {
    out.push({ tag: `#The${Alast}${Blast}s${year}`, tone: 'classic' });
    out.push({ tag: `#${Alast}Meets${Blast}`, tone: 'classic' });
  }
  if (A && B) out.push({ tag: `#${A}And${B}${year}`, tone: 'classic' });

  // Punny — common patterns
  if (B && Blast) {
    out.push({ tag: `#HappilyEverAfter${Blast}`, tone: 'pun' });
  }
  if (Alast) out.push({ tag: `#${Alast}ToTheAltar`, tone: 'pun' });
  if (B) out.push({ tag: `#Forever${B}`, tone: 'pun' });

  // Bollywood — DDLJ / classic film references
  if (A && B) {
    out.push({ tag: `#${A}Aur${B}KiShaadi`, tone: 'bollywood' });
    out.push({ tag: `#Dilwale${B}LeJayenge`, tone: 'bollywood' });
  }
  if (B) out.push({ tag: `#${B}KaSapna`, tone: 'bollywood' });

  // Minimal
  if (Alast && Blast) {
    out.push({ tag: `#${Alast}${Blast}`, tone: 'minimal' });
  }
  if (A && B) out.push({ tag: `#${A}${B}`, tone: 'minimal' });
  if (Alast) out.push({ tag: `#${Alast}Wedding`, tone: 'minimal' });

  return out;
}

export function WeddingHashtagGenerator() {
  const [aFirst, setAFirst] = useState('');
  const [aLast, setALast] = useState('');
  const [bFirst, setBFirst] = useState('');
  const [bLast, setBLast] = useState('');
  const [year, setYear] = useState<string>(defaultYear());
  const [tone, setTone] = useState<Tone>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const suggestions = useMemo(
    () => generate(aFirst, aLast, bFirst, bLast, year),
    [aFirst, aLast, bFirst, bLast, year],
  );

  const filtered = useMemo(
    () => (tone === 'all' ? suggestions : suggestions.filter((s) => s.tone === tone)),
    [suggestions, tone],
  );

  async function copy(tag: string) {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(tag);
      setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1500);
    } catch {
      // Clipboard blocked — silently fail; the tag is visible to copy manually.
    }
  }

  return (
    <MiniToolShell
      name="Wedding Hashtag Generator"
      tagline="cute, clever, or cringe?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-afirst">
            Your first name
          </label>
          <input
            id="hg-afirst"
            type="text"
            className={primitives.input}
            value={aFirst}
            onChange={(e) => setAFirst(e.target.value)}
            placeholder="Priya"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-alast">
            Your last name
          </label>
          <input
            id="hg-alast"
            type="text"
            className={primitives.input}
            value={aLast}
            onChange={(e) => setALast(e.target.value)}
            placeholder="Mehta"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-bfirst">
            Partner&apos;s first name
          </label>
          <input
            id="hg-bfirst"
            type="text"
            className={primitives.input}
            value={bFirst}
            onChange={(e) => setBFirst(e.target.value)}
            placeholder="Arjun"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-blast">
            Partner&apos;s last name
          </label>
          <input
            id="hg-blast"
            type="text"
            className={primitives.input}
            value={bLast}
            onChange={(e) => setBLast(e.target.value)}
            placeholder="Sharma"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-year">
            Wedding year
          </label>
          <input
            id="hg-year"
            type="number"
            className={primitives.input}
            value={year}
            min={2024}
            max={2030}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hg-tone">
            Style
          </label>
          <select
            id="hg-tone"
            className={primitives.select}
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
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

            <ul className={styles.tagList}>
              {filtered.map((s) => (
                <li key={s.tag} className={styles.tagItem}>
                  <button
                    type="button"
                    onClick={() => copy(s.tag)}
                    className={styles.tagButton}
                  >
                    <span className={styles.tagText}>{s.tag}</span>
                    <span className={styles.tagTone}>{s.tone}</span>
                    <span className={styles.tagCopy}>
                      {copied === s.tag ? 'copied!' : 'copy'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className={primitives.note}>
              Search Instagram before you commit — make sure your top picks
              aren&apos;t already in use by another couple.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
