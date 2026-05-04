import Link from 'next/link';
import type { ContinentSummary } from '@/lib/destinations';
import styles from './ContinentGrid.module.css';

type ContinentGridProps = {
  continents: ContinentSummary[];
};

export function ContinentGrid({ continents }: ContinentGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {continents.map((c, idx) => (
            <Link
              key={c.slug}
              href={`/tools/destinations/${c.slug}`}
              className={[styles.card, idx % 2 === 0 ? styles.tiltLeft : styles.tiltRight]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.heroImageUrl}
                  alt=""
                  className={styles.image}
                  loading="lazy"
                />
                <span className={styles.countBadge}>
                  {c.destinationCount === 0
                    ? 'coming soon'
                    : `${c.destinationCount} destination${c.destinationCount === 1 ? '' : 's'}`}
                </span>
              </div>
              <div className={styles.body}>
                <h2 className={styles.name}>{c.name}</h2>
                <p className={styles.tagline}>{c.tagline}</p>
                <span className={styles.cta}>Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
