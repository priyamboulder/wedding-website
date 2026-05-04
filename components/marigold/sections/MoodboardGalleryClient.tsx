'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionHeader } from '@/components/marigold/ui/SectionHeader';
import type { MoodboardRow } from '@/types/moodboard';
import styles from './MoodboardGallery.module.css';

type Props = {
  moodboards: MoodboardRow[];
};

// One-line scrawls per moodboard — keep these short, lowercase, and a
// little cheeky. They surface as the Caveat-font tagline under the title,
// matching the scrapbook voice elsewhere on the page.
const SCRAWLS: Record<string, string> = {
  'mughal-grandeur': 'palace energy',
  'modern-minimalist': 'less, but louder',
  'garden-party': 'florals on florals',
  'temple-elegance': 'silk + brass kinda day',
  'coastal-sunset': 'barefoot pheras',
  'jewel-tone-maximalist': 'more is more',
  'pastel-dream': 'soft girl shaadi',
  'old-world-romance': 'haveli, candlelit',
  'bollywood-glam': 'sangeet but make it loud',
  'rustic-charm': 'wildflowers + lanterns',
};

export function MoodboardGalleryClient({ moodboards }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.85));
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section className={styles.section} aria-labelledby="moodboards-heading">
      <div className={styles.inner}>
        <SectionHeader
          scrawl="find your aesthetic"
          heading="Moodboards for every kind of <i>shaadi</i>"
          sub="Ten starting points for the look of your wedding. Pick the one that feels closest — we'll help you make it yours."
        />

        <div className={styles.scrollerWrap}>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label="Scroll moodboards left"
          >
            ←
          </button>

          <div className={styles.scroller} ref={scrollerRef} role="list">
            {moodboards.map((m) => (
              <Link
                key={m.id}
                href={`/moodboards/${m.slug}`}
                className={styles.card}
                role="listitem"
                aria-label={`${m.name} moodboard`}
              >
                <div className={styles.collage} aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={panelStyle(m, i)} />
                  ))}
                </div>
                <div className={styles.caption}>
                  <h3 className={styles.cardName}>{m.name}</h3>
                  {SCRAWLS[m.slug] && (
                    <span className={styles.cardScrawl}>{SCRAWLS[m.slug]}</span>
                  )}
                  <span className={styles.cardCta}>Explore →</span>
                </div>
              </Link>
            ))}

            <Link href="/moodboards" className={styles.browseCard} role="listitem">
              <span>
                Browse all moodboards <span className={styles.browseCardArrow}>→</span>
              </span>
            </Link>
          </div>

          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label="Scroll moodboards right"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

// When a real cover_images entry exists for this panel, use it as a
// background image. Otherwise paint the matching color_palette swatch as
// a soft gradient — gives each card a distinct identity until photography
// is wired up.
function panelStyle(m: MoodboardRow, index: number): React.CSSProperties {
  const image = m.cover_images?.[index];
  if (image) {
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  const palette = m.color_palette?.length ? m.color_palette : ['#C4A265'];
  const base = palette[index % palette.length];
  const accent = palette[(index + 1) % palette.length] ?? base;
  return {
    background: `linear-gradient(135deg, ${base} 0%, ${accent} 100%)`,
  };
}
