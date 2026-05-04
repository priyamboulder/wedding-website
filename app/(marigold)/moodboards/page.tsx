import Link from 'next/link';

import { createAnonClient } from '@/lib/supabase/server-client';
import { listMoodboards } from '@/lib/moodboards/queries';
import { FALLBACK_MOODBOARDS } from '@/lib/moodboards/fallback';
import type { MoodboardRow } from '@/types/moodboard';

import styles from './page.module.css';

export const revalidate = 300;

export default async function MoodboardsIndexPage() {
  let moodboards: MoodboardRow[] = [];
  try {
    moodboards = await listMoodboards(createAnonClient());
  } catch {
    moodboards = [];
  }
  if (moodboards.length === 0) moodboards = FALLBACK_MOODBOARDS;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>find your aesthetic</span>
        <h1 className={styles.title}>Moodboards</h1>
        <p className={styles.sub}>
          Ten starting points for the look of your shaadi. Pick the one that
          feels closest — we'll help you make it yours.
        </p>
      </header>

      <ul className={styles.grid}>
        {moodboards.map((m) => (
          <li key={m.id}>
            <Link href={`/moodboards/${m.slug}`} className={styles.card}>
              <div className={styles.collage} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => {
                  const palette = m.color_palette ?? [];
                  const a = palette[i % palette.length] ?? '#C4A265';
                  const b = palette[(i + 1) % palette.length] ?? a;
                  return (
                    <span
                      key={i}
                      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
                    />
                  );
                })}
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{m.name}</h2>
                <p className={styles.cardDescription}>{m.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
