import Link from 'next/link';
import type { ContinentSummary } from '@/lib/destinations';
import {
  classifyFit,
  fitLabel,
  formatStartingPrice,
  REGION_ECONOMICS,
  type BudgetBucket,
  type GuestBucket,
} from '@/lib/destinations';
import styles from './ContinentGrid.module.css';

type ContinentGridProps = {
  continents: ContinentSummary[];
  guests?: GuestBucket | null;
  budget?: BudgetBucket | null;
};

export function ContinentGrid({
  continents,
  guests = null,
  budget = null,
}: ContinentGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {continents.map((c, idx) => {
            const economics = REGION_ECONOMICS[c.slug];
            const priceLine = formatStartingPrice(c.slug, guests);
            const fit = classifyFit(c.slug, guests, budget);
            return (
              <Link
                key={c.slug}
                href={`/tools/destinations/${c.slug}`}
                className={[
                  styles.card,
                  idx % 2 === 0 ? styles.tiltLeft : styles.tiltRight,
                ]
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
                  {fit && (
                    <span
                      className={[
                        styles.fitBadge,
                        fit === 'great-value' ? styles.fitGreat : '',
                        fit === 'good-fit' ? styles.fitGood : '',
                        fit === 'stretch' ? styles.fitStretch : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {fitLabel(fit)}
                    </span>
                  )}
                </div>
                <div className={styles.body}>
                  <h2 className={styles.name}>{c.name}</h2>
                  <p className={styles.tagline}>{c.tagline}</p>
                  <p className={styles.price}>{priceLine}</p>
                  <p className={styles.insight}>{economics.insight}</p>
                  <span className={styles.cta}>Explore →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
