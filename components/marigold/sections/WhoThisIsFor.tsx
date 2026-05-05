import styles from './WhoThisIsFor.module.css';

type Pill = {
  emoji: string;
  label: string;
};

const PILLS: Pill[] = [
  { emoji: '🪷', label: 'Multi-ceremony planning' },
  { emoji: '👥', label: '200–800+ guests' },
  { emoji: '🤝', label: 'South Asian vendor network' },
  { emoji: '🐴', label: 'Baraat to reception' },
  { emoji: '👩', label: 'Your mom gets a login' },
];

export function WhoThisIsFor() {
  return (
    <section className={styles.section} aria-labelledby="who-this-is-for-heading">
      <span className={styles.bloom} aria-hidden="true">❀</span>
      <span className={styles.bloomAlt} aria-hidden="true">✿</span>

      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot6}`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.subhead}>who is this even for</span>
          <h2 id="who-this-is-for-heading" className={styles.heading}>
            Built for the Wedding Nobody Else <i>Gets</i>
          </h2>
        </header>

        <blockquote className={styles.pullQuote}>
          <span className={styles.quoteOpen} aria-hidden="true">&ldquo;</span>
          If your wedding has a mehendi, a sangeet, a haldi, AND a reception&hellip;
          <span className={styles.quoteClose} aria-hidden="true">&rdquo;</span>
        </blockquote>

        <p className={styles.lede}>
          &hellip;and your guest list just hit 300 because your mom remembered her college roommate &mdash; you&rsquo;re in the right place. The Marigold is built for multi-day, multi-ceremony South Asian weddings in the US. The kind with a baraat, a shagun pool, and a seating chart that requires a United Nations&ndash;level understanding of family politics.
        </p>

        <ul className={styles.pills}>
          {PILLS.map((pill, idx) => (
            <li
              key={pill.label}
              className={`${styles.pill} ${styles[`pill${(idx % 3) + 1}`]}`}
            >
              <span className={styles.pillEmoji} aria-hidden="true">{pill.emoji}</span>
              <span>{pill.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
