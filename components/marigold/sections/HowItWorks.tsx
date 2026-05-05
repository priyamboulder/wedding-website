import Link from 'next/link';
import styles from './HowItWorks.module.css';

type Tone = 'champagne' | 'blush' | 'lavender' | 'mint';
type BadgeTone = 'wine' | 'pink' | 'gold' | 'wineDeep';

type Step = {
  number: string;
  title: string;
  body: string;
  symbol: string;
  badge: string;
  badgeTone: BadgeTone;
  quip: string;
  tone: Tone;
};

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Take The Brief',
    body: "A 2-minute quiz about your wedding — ceremonies, guest count, vibe, priorities. This powers everything that comes next.",
    symbol: '✦',
    badge: '2 Min Start',
    badgeTone: 'wine',
    quip: 'better than a Pinterest board, we promise',
    tone: 'champagne',
  },
  {
    number: '02',
    title: 'Get Your Game Plan',
    body: "Your personalized checklist across 13 planning phases. 582 tasks, but we'll tell you which ones matter right now.",
    symbol: '✓',
    badge: 'AI Powered',
    badgeTone: 'pink',
    quip: "it's giving project manager energy",
    tone: 'blush',
  },
  {
    number: '03',
    title: 'Build Your World',
    body: "Moodboards, vendor briefs, colour palettes, stationery — all in one place. Your vendors see what you see.",
    symbol: '✿',
    badge: 'The Fun Part',
    badgeTone: 'gold',
    quip: 'your vendors will think you hired a planner',
    tone: 'lavender',
  },
  {
    number: '04',
    title: 'Plan With Your People',
    body: "Your planner, your vendors, your mom — everyone gets their own login. One platform, zero lost WhatsApp threads.",
    symbol: '♥',
    badge: 'Mom Approved',
    badgeTone: 'wineDeep',
    quip: 'yes, even mom finally gets a login',
    tone: 'mint',
  },
];

const TONE_CLASS: Record<Tone, string> = {
  champagne: styles.toneChampagne,
  blush: styles.toneBlush,
  lavender: styles.toneLavender,
  mint: styles.toneMint,
};

const BADGE_CLASS: Record<BadgeTone, string> = {
  wine: styles.badgeWine,
  pink: styles.badgePink,
  gold: styles.badgeGold,
  wineDeep: styles.badgeWineDeep,
};

export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-it-works-heading">
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot6}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot7}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot8}`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.subhead}>okay so how does this actually work</span>
          <h2 id="how-it-works-heading" className={styles.heading}>
            Four Steps. <i>Zero</i> Spreadsheets.
          </h2>
        </header>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.number} className={`${styles.step} ${TONE_CLASS[step.tone]}`}>
              <span className={`${styles.badge} ${BADGE_CLASS[step.badgeTone]}`}>
                {step.badge}
              </span>
              <span className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </span>
              <span className={styles.symbol} aria-hidden="true">{step.symbol}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
              <p className={styles.quip}>{step.quip}</p>
            </li>
          ))}
        </ol>

        <div className={styles.ctaWrap}>
          <Link href="/brief" className={styles.cta}>
            Take The Brief
            <span aria-hidden="true" className={styles.ctaArrow}>→</span>
          </Link>
        </div>

        <div className={styles.transition} aria-hidden="true">
          <span className={styles.transitionDot} />
          <span className={styles.transitionDot} />
          <span className={styles.transitionDot} />
        </div>
      </div>
    </section>
  );
}
