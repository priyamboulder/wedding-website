import Link from 'next/link';
import styles from './ShareYourShaadi.module.css';

export function ShareYourShaadi() {
  return (
    <section
      className={styles.section}
      aria-labelledby="share-your-shaadi-heading"
    >
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />

      <div className={styles.inner}>
        <span className={styles.eyebrow}>just got married?</span>
        <h2 id="share-your-shaadi-heading" className={styles.heading}>
          Your <em>shaadi</em> belongs here too.
        </h2>
        <Link href="/share" className={styles.link}>
          <span className={styles.linkLabel}>Share your wedding</span>
          <span aria-hidden="true" className={styles.linkArrow}>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
