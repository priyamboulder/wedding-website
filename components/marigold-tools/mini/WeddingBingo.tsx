'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { buildCard, type BingoCeremony } from '@/lib/tools/mini/bingo-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingBingo.module.css';

const CEREMONIES: { key: BingoCeremony; label: string }[] = [
  { key: 'hindu', label: 'Hindu' },
  { key: 'sikh', label: 'Sikh' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'fusion', label: 'Fusion' },
  { key: 'western', label: 'Western (no SA-specific squares)' },
];

const COUNTS = [10, 20, 30, 50] as const;

export function WeddingBingo() {
  const [ceremony, setCeremony] = useState<BingoCeremony>('hindu');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [lastName, setLastName] = useState('');
  const [count, setCount] = useState<number>(10);
  const [generated, setGenerated] = useState(false);

  const cards = useMemo(() => {
    if (!generated) return [];
    return Array.from({ length: count }, (_, i) =>
      buildCard(i, ceremony, nameA, nameB, lastName),
    );
  }, [generated, count, ceremony, nameA, nameB, lastName]);

  function handlePrint() {
    window.print();
  }

  return (
    <MiniToolShell
      name="Wedding Bingo Generator"
      tagline="custom bingo cards for your reception"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="wb-ceremony">
          Ceremony type
        </label>
        <select
          id="wb-ceremony"
          className={primitives.select}
          value={ceremony}
          onChange={(e) => setCeremony(e.target.value as BingoCeremony)}
        >
          {CEREMONIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-namea">
            Your first name (optional)
          </label>
          <input
            id="wb-namea"
            type="text"
            className={primitives.input}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Priya"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-nameb">
            Partner&apos;s name (optional)
          </label>
          <input
            id="wb-nameb"
            type="text"
            className={primitives.input}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Arjun"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-last">
            Last name (optional)
          </label>
          <input
            id="wb-last"
            type="text"
            className={primitives.input}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Sharma"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-count">
            How many unique cards?
          </label>
          <select
            id="wb-count"
            className={primitives.select}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c} cards
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className={primitives.button}
        onClick={() => setGenerated(true)}
      >
        Generate {count} cards →
      </button>

      <AnimatePresence>
        {generated && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <div className={styles.resultHeader}>
              <span className={primitives.resultEyebrow}>
                {cards.length} cards ready
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className={styles.printBtn}
              >
                🖨 Print all
              </button>
            </div>
            <p className={primitives.note} style={{ marginBottom: 16 }}>
              Use your browser&apos;s print dialog (or save as PDF). Cards are
              designed to fit one per page.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {generated && (
        <div className={styles.printArea}>
          {cards.map((cells, idx) => (
            <Card key={idx} cells={cells} cardNumber={idx + 1} totalCards={cards.length} />
          ))}
        </div>
      )}
    </MiniToolShell>
  );
}

function Card({
  cells,
  cardNumber,
  totalCards,
}: {
  cells: string[];
  cardNumber: number;
  totalCards: number;
}) {
  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Wedding Bingo</h2>
        <span className={styles.cardMeta}>
          Card {cardNumber} of {totalCards}
        </span>
      </header>
      <div className={styles.grid}>
        {cells.map((text, i) => (
          <div
            key={i}
            className={`${styles.cell} ${text === 'FREE' ? styles.cellFree : ''}`}
          >
            <span>{text}</span>
          </div>
        ))}
      </div>
      <p className={styles.cardFooter}>
        Mark a square when it happens. Five in a row wins.
      </p>
    </div>
  );
}
