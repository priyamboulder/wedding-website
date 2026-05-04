import Link from 'next/link';
import type {
  BudgetLocationRow,
  BudgetLocationRegionRow,
} from '@/types/budget';
import styles from './OverviewTab.module.css';

type OverviewTabProps = {
  location: BudgetLocationRow;
  regions: BudgetLocationRegionRow[];
  onSwitchToVendors?: () => void;
  // The section is reachable as a server-rendered fallback when the tabs
  // are not interactive. The CTA jumps to the venues section by anchor.
  vendorsAnchor?: string;
};

function paragraphsFrom(prose: string): string[] {
  if (!prose.trim()) return [];
  return prose
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function OverviewTab({
  location,
  regions,
  onSwitchToVendors,
  vendorsAnchor,
}: OverviewTabProps) {
  const paragraphs = paragraphsFrom(location.overview);

  return (
    <div className={styles.panel}>
      <div className={styles.proseSlab}>
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p key={idx} className={styles.prose}>
              {para}
            </p>
          ))
        ) : (
          <p className={styles.prose}>
            {location.tagline || 'A destination story is on the way for ' + location.name + '.'}
            {' '}
            <em>
              Tap into the vendors below — they&apos;re the people who actually pull these
              weddings off here.
            </em>
          </p>
        )}
      </div>

      {regions.length > 0 && (
        <section className={styles.regions}>
          <h2 className={styles.sectionHeading}>
            <span className={styles.sectionScrawl}>where exactly?</span>
            zones inside <em>{location.name}</em>
          </h2>
          <div className={styles.regionGrid}>
            {regions.map((r) => (
              <div key={r.id} className={styles.regionCard}>
                <h3 className={styles.regionName}>{r.name}</h3>
                {r.description && (
                  <p className={styles.regionDescription}>{r.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {location.tips && (
        <section className={styles.tips}>
          <span className={styles.tipsLabel}>insider tip ✿</span>
          <p className={styles.tipsBody}>{location.tips}</p>
        </section>
      )}

      <div className={styles.ctaRow}>
        {onSwitchToVendors ? (
          <button
            type="button"
            className={styles.primaryCta}
            onClick={onSwitchToVendors}
          >
            Browse vendors here →
          </button>
        ) : (
          <a href={vendorsAnchor ?? '#vendors'} className={styles.primaryCta}>
            Browse vendors here →
          </a>
        )}
        <Link
          href={`/tools/budget/build?location=${location.slug}`}
          className={styles.secondaryCta}
        >
          Build my budget for {location.name} →
        </Link>
      </div>
    </div>
  );
}
