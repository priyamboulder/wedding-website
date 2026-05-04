import Link from 'next/link';
import type { CategoryServingLocation } from '@/lib/destinations';
import styles from './CategoriesTab.module.css';

type CategoriesTabProps = {
  continentSlug: string;
  locationSlug: string;
  locationName: string;
  categories: CategoryServingLocation[];
};

function formatStartingPrice(value: number): string {
  if (value >= 1000) return `from $${Math.round(value / 1000)}K`;
  return `from $${value}`;
}

export function CategoriesTab({
  continentSlug,
  locationSlug,
  locationName,
  categories,
}: CategoriesTabProps) {
  if (categories.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyScrawl}>almost there ✿</span>
        <h3 className={styles.emptyHeading}>
          we&apos;re still building our roster for <em>{locationName}</em>
        </h3>
        <p className={styles.emptyBody}>
          The first wave of vendors goes live shortly. Drop your email on the explorer hub
          and we&apos;ll tell you when {locationName} fills out.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <span className={styles.scrawl}>the people who pull this off</span>
          vendors who travel to <em>{locationName}</em>
        </h2>
        <p className={styles.sub}>
          Pick a category. Each card opens onto a page of real vendors — sponsored partners
          first, then everyone else, rotated random so no one game-the-system names like
          &quot;AAA Photography.&quot;
        </p>
      </div>

      <div className={styles.grid}>
        {categories.map(({ category, vendorCount, startingPriceUsd }) => (
          <Link
            key={category.id}
            href={`/tools/destinations/${continentSlug}/${locationSlug}/vendors/${category.slug}`}
            className={styles.card}
          >
            <div className={styles.iconBox} aria-hidden="true">
              {category.icon || '✦'}
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{category.name}</h3>
              <div className={styles.metaRow}>
                <span className={styles.count}>
                  {vendorCount} vendor{vendorCount === 1 ? '' : 's'}
                </span>
                {startingPriceUsd != null && (
                  <span className={styles.price}>
                    {formatStartingPrice(startingPriceUsd)}
                  </span>
                )}
              </div>
            </div>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
