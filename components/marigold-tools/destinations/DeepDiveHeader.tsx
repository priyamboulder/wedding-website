import type { BudgetLocationRow } from '@/types/budget';
import styles from './DeepDiveHeader.module.css';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80';

type DeepDiveHeaderProps = {
  location: BudgetLocationRow;
  heroImageUrl: string;
};

function formatBudget(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

export function DeepDiveHeader({ location, heroImageUrl }: DeepDiveHeaderProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl || FALLBACK_HERO}
          alt={location.name}
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.inner}>
        <span className={styles.eyebrow}>The Marigold Destination Explorer</span>
        <h1 className={styles.title}>{location.name}</h1>
        {location.tagline && (
          <p className={styles.tagline}>{location.tagline}</p>
        )}
        <div className={styles.statRow}>
          <span className={styles.stat}>
            <span className={styles.statLabel}>multiplier</span>
            <span className={styles.statValue}>{location.multiplier}x Dallas</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>min budget</span>
            <span className={styles.statValue}>
              from {formatBudget(location.min_budget_usd)}
            </span>
          </span>
          {location.best_months && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>best months</span>
              <span className={styles.statValue}>{location.best_months}</span>
            </span>
          )}
          {location.best_for && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>best for</span>
              <span className={styles.statValue}>{location.best_for}</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
