import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createAnonClient } from '@/lib/supabase/server-client';
import { getMoodboard, listMoodboardItems } from '@/lib/moodboards/queries';
import { findFallbackMoodboard } from '@/lib/moodboards/fallback';
import type { MoodboardItemRow, MoodboardRow } from '@/types/moodboard';

import styles from './page.module.css';

export const revalidate = 300;

type Params = { slug: string };

async function resolveMoodboard(slug: string): Promise<{
  moodboard: MoodboardRow | null;
  items: MoodboardItemRow[];
}> {
  try {
    const supabase = createAnonClient();
    const board = await getMoodboard(supabase, slug);
    if (board) {
      const items = await listMoodboardItems(supabase, board.id);
      return { moodboard: board, items };
    }
  } catch {
    // fall through to static fallback
  }
  return { moodboard: findFallbackMoodboard(slug), items: [] };
}

export default async function MoodboardDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const { moodboard, items } = await resolveMoodboard(slug);
  if (!moodboard) notFound();

  const palette = moodboard.color_palette ?? [];
  const tags = moodboard.style_tags ?? [];

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <Link href="/moodboards" className={styles.back}>
          ← All moodboards
        </Link>
        <span className={styles.eyebrow}>moodboard</span>
        <h1 className={styles.title}>{moodboard.name}</h1>
        <p className={styles.description}>{moodboard.description}</p>
      </header>

      <section className={styles.metaRow} aria-label="Aesthetic details">
        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Palette</span>
          <ul className={styles.swatches}>
            {palette.map((hex) => (
              <li key={hex} className={styles.swatch}>
                <span
                  className={styles.swatchDot}
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                <span className={styles.swatchHex}>{hex}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Style</span>
          <ul className={styles.tags}>
            {tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.itemsSection} aria-label="Inspiration">
        <h2 className={styles.itemsHeading}>Inspiration</h2>
        {items.length === 0 ? (
          <div className={styles.itemsEmpty}>More inspiration coming soon.</div>
        ) : (
          <ul className={styles.itemsGrid}>
            {items.map((item) => (
              <li key={item.id} className={styles.itemCard}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.caption ?? ''} className={styles.itemImage} />
                ) : (
                  <div
                    className={styles.itemImage}
                    style={{
                      background: paletteGradient(palette),
                    }}
                    aria-hidden="true"
                  />
                )}
                {item.caption && <p className={styles.itemCaption}>{item.caption}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className={styles.cta}>
        <Link
          href={`/login?redirect=/moodboards/${moodboard.slug}`}
          className={styles.saveButton}
        >
          Save This Moodboard
        </Link>
        <p className={styles.ctaHint}>Sign in to keep this moodboard in your planning circle.</p>
      </footer>
    </article>
  );
}

function paletteGradient(palette: string[]): string {
  if (palette.length === 0) return 'linear-gradient(135deg, #C4A265 0%, #FFFDF5 100%)';
  if (palette.length === 1) return `linear-gradient(135deg, ${palette[0]}, ${palette[0]})`;
  return `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 100%)`;
}
