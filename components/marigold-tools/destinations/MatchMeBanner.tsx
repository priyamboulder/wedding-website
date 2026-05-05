import Link from 'next/link';
import styles from './MatchMeBanner.module.css';

type MatchMeBannerProps = {
  /** Forwarded query params (guests, vibe, budget) so Match Me starts
   *  pre-populated with whatever the visitor has already chosen. */
  href?: string;
};

export function MatchMeBanner({ href = '/tools/match' }: MatchMeBannerProps) {
  return (
    <section className={styles.wrap} aria-label="Match Me cross-link">
      <div className={styles.inner}>
        <p className={styles.title}>Not sure where to start?</p>
        <p className={styles.copy}>
          Tell us your budget and guest count — Match Me will find your top 3
          destinations with reasons.
        </p>
        <Link href={href} className={styles.cta}>
          <span>Try Match Me</span>
          <span aria-hidden="true" className={styles.arrow}>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
