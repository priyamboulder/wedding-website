'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import {
  rankSongs,
  type SongEvent,
  type SongMood,
  type SongTempo,
  type SongLanguage,
} from '@/lib/tools/mini/song-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './BridalEntrySong.module.css';

const EVENTS: { key: SongEvent; label: string }[] = [
  { key: 'ceremony', label: 'Ceremony' },
  { key: 'reception', label: 'Reception' },
  { key: 'sangeet', label: 'Sangeet' },
];

const MOODS: { key: SongMood; label: string }[] = [
  { key: 'grand', label: 'Grand & dramatic' },
  { key: 'romantic', label: 'Romantic & emotional' },
  { key: 'fun', label: 'Fun & upbeat' },
  { key: 'modern', label: 'Modern & cool' },
  { key: 'traditional', label: 'Traditional & devotional' },
];

const TEMPOS: { key: SongTempo; label: string }[] = [
  { key: 'slow', label: 'Slow' },
  { key: 'medium', label: 'Medium' },
  { key: 'upbeat', label: 'Upbeat' },
];

const LANGUAGES: { key: SongLanguage; label: string }[] = [
  { key: 'hindi', label: 'Hindi' },
  { key: 'punjabi', label: 'Punjabi' },
  { key: 'tamil', label: 'Tamil' },
  { key: 'telugu', label: 'Telugu' },
  { key: 'english', label: 'English' },
  { key: 'instrumental', label: 'Instrumental' },
];

export function BridalEntrySong() {
  const [event, setEvent] = useState<SongEvent>('ceremony');
  const [mood, setMood] = useState<SongMood>('romantic');
  const [tempo, setTempo] = useState<SongTempo>('slow');
  const [languages, setLanguages] = useState<Set<SongLanguage>>(
    new Set(['hindi', 'english']),
  );

  function toggleLang(l: SongLanguage) {
    const next = new Set(languages);
    if (next.has(l)) next.delete(l);
    else next.add(l);
    setLanguages(next);
  }

  const songs = useMemo(
    () =>
      rankSongs({
        event,
        mood,
        tempo,
        languages: Array.from(languages),
      }),
    [event, mood, tempo, languages],
  );

  return (
    <MiniToolShell
      name="Bridal Entry Song Picker"
      tagline="what's your walk-in vibe?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Event</label>
        <div className={styles.pillRow}>
          {EVENTS.map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => setEvent(e.key)}
              className={`${styles.pill} ${event === e.key ? styles.pillActive : ''}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="bs-mood">
          Mood
        </label>
        <select
          id="bs-mood"
          className={primitives.select}
          value={mood}
          onChange={(e) => setMood(e.target.value as SongMood)}
        >
          {MOODS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Tempo</label>
        <div className={styles.pillRow}>
          {TEMPOS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTempo(t.key)}
              className={`${styles.pill} ${tempo === t.key ? styles.pillActive : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Languages (multi-select)</label>
        <div className={primitives.checkboxGrid}>
          {LANGUAGES.map((l) => {
            const isOn = languages.has(l.key);
            return (
              <label
                key={l.key}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggleLang(l.key)}
                />
                {l.label}
              </label>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${event}-${mood}-${tempo}-${Array.from(languages).join('-')}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {songs.length} match{songs.length === 1 ? '' : 'es'}
          </span>
          <p className={primitives.resultLabel}>
            {songs.length === 0
              ? 'No matches — try widening your language filter.'
              : 'Best matches first. Send your picks to the DJ along with the cue point.'}
          </p>

          <ol className={styles.songList}>
            {songs.map((s, idx) => (
              <li key={s.title} className={styles.songItem}>
                <span className={styles.idx}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <span className={styles.title}>{s.title}</span>
                    <span className={styles.artist}>— {s.artist}</span>
                  </div>
                  <p className={styles.cue}>{s.cue}</p>
                  {s.note && <p className={styles.note}>{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>

          <p className={primitives.note}>
            Ask your DJ for a clean edit that starts at the right moment —
            you don&apos;t want a 30-second instrumental intro before the
            actual reveal.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
