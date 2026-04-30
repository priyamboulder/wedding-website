import { StickyTag } from '@/components/ui/StickyTag';
import { TornDivider } from '@/components/ui/TornDivider';
import styles from './FeatureHero.module.css';

type FeatureHeroProps = {
  tag: string;
  label: string;
  title: string;
  subtitle: string;
};

export function FeatureHero({ tag, label, title, subtitle }: FeatureHeroProps) {
  return (
    <>
      <section className={styles.hero}>
        <span
          aria-hidden="true"
          className={`${styles.scribble} ${styles['scribble-1']}`}
        >
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="26"
              fill="none"
              stroke="var(--pink)"
              strokeWidth="1.4"
              strokeDasharray="4 6"
            />
          </svg>
        </span>
        <span
          aria-hidden="true"
          className={`${styles.scribble} ${styles['scribble-2']}`}
        >
          <svg width="58" height="58" viewBox="0 0 58 58">
            <path
              d="M29 6l5 14h14l-11 9 4 15-12-9-12 9 4-15-11-9h14z"
              fill="none"
              stroke="var(--pink)"
              strokeWidth="1.2"
            />
          </svg>
        </span>

        <div className={styles.inner}>
          <StickyTag>{tag}</StickyTag>
          <span className={styles.label}>{label}</span>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </section>
      <TornDivider fromColor="var(--paper)" toColor="var(--cream)" />
    </>
  );
}
