import Link from 'next/link';
import styles from './TrendingOnMarigold.module.css';

type EditorialCard = {
  href: string;
  index: string;
  category: string;
  title: string;
  excerpt: string;
  metaPrimary: string;
  metaSecondary: string;
  cta: string;
  visual: 'real-wedding' | 'article' | 'toolkit';
  pullQuote?: string;
  events?: string[];
};

const TRENDING: EditorialCard[] = [
  {
    href: '/blog',
    index: '01',
    category: 'Real Wedding',
    title: 'Meera & Kabir, at Umaid Bhawan',
    excerpt:
      'Five days, 450 guests, and a phool ki chadar that took 1,200 marigolds to thread. Inside a Jodhpur palace wedding that made the case for going home.',
    metaPrimary: 'Jodhpur · November 2026',
    metaSecondary: '5 events · 450 guests',
    cta: 'Read the wedding',
    visual: 'real-wedding',
    pullQuote: 'the phool ki chadar alone is worth the click',
    events: ['Haldi', 'Mehendi', 'Sangeet', 'Ceremony', 'Reception'],
  },
  {
    href: '/blog',
    index: '02',
    category: 'Planning',
    title: 'What your caterer wishes you knew about multi-day menus',
    excerpt:
      'Four ceremonies, four menus. How to brief a caterer so the mehendi lunch doesn’t feel like a dress rehearsal for the reception.',
    metaPrimary: 'By Naina Reddy',
    metaSecondary: '9 min read',
    cta: 'Read the article',
    visual: 'article',
  },
  {
    href: '/tools/budget',
    index: '03',
    category: 'The Toolkit',
    title: 'Why 73% of couples blow their budget by sangeet week',
    excerpt:
      'We built a calculator that actually accounts for the sangeet, the mehndi, the outfit changes — and yes, the shagun. Here’s the math your spreadsheet keeps missing.',
    metaPrimary: 'Ananya Editorial',
    metaSecondary: '4 min read',
    cta: 'Try Shaadi Budget',
    visual: 'toolkit',
  },
];

export function TrendingOnMarigold() {
  return (
    <section
      className={styles.section}
      aria-labelledby="trending-marigold-heading"
    >
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>from the edit</span>
          <h2 id="trending-marigold-heading" className={styles.heading}>
            This week on <em>The Marigold</em>.
          </h2>
        </header>

        <div className={styles.grid}>
          {TRENDING.map((item) => (
            <TrendingCard key={item.index} item={item} />
          ))}
        </div>

        <div className={styles.footerRow}>
          <Link href="/blog" className={styles.allLink}>
            <span>See the full edit</span>
            <span aria-hidden="true" className={styles.allArrow}>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrendingCard({ item }: { item: EditorialCard }) {
  return (
    <Link href={item.href} className={styles.card}>
      <CardVisual variant={item.visual} events={item.events} />

      <div className={styles.cardBody}>
        <div className={styles.cardMetaTop}>
          <span className={styles.indexNumber} aria-hidden="true">
            {item.index}
          </span>
          <span className={styles.indexRule} aria-hidden="true" />
          <span className={styles.category}>{item.category}</span>
        </div>

        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardExcerpt}>{item.excerpt}</p>

        {item.pullQuote && (
          <p className={styles.pullQuote}>“{item.pullQuote}”</p>
        )}

        <div className={styles.cardMetaBottom}>
          <span className={styles.metaPrimary}>{item.metaPrimary}</span>
          <span className={styles.metaDivider} aria-hidden="true">
            ·
          </span>
          <span className={styles.metaSecondary}>{item.metaSecondary}</span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.cardCta}>{item.cta}</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CardVisual({
  variant,
  events,
}: {
  variant: EditorialCard['visual'];
  events?: string[];
}) {
  return (
    <div
      className={`${styles.media} ${styles[`media_${variant}`]}`}
      aria-hidden="true"
    >
      <div className={styles.mediaGradient} />
      <div className={styles.mediaTexture} />

      {variant === 'real-wedding' && (
        <>
          <svg
            className={styles.mediaBloom}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.85">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                return (
                  <ellipse
                    key={i}
                    cx="60"
                    cy="32"
                    rx="6"
                    ry="14"
                    fill="currentColor"
                    transform={`rotate(${angle} 60 60)`}
                  />
                );
              })}
              <circle cx="60" cy="60" r="7" fill="#FFF8F2" />
              <circle cx="60" cy="60" r="3" fill="currentColor" />
            </g>
          </svg>
          {events && (
            <div className={styles.mediaPills}>
              {events.slice(0, 3).map((e) => (
                <span key={e} className={styles.mediaPill}>
                  {e}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {variant === 'article' && (
        <svg
          className={styles.mediaArticle}
          viewBox="0 0 160 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="currentColor" strokeWidth="1.4" opacity="0.85">
            <line x1="20" y1="22" x2="84" y2="22" />
            <line x1="20" y1="34" x2="118" y2="34" />
            <line x1="20" y1="46" x2="104" y2="46" />
            <line x1="20" y1="58" x2="118" y2="58" />
            <line x1="20" y1="70" x2="72" y2="70" />
          </g>
          <rect
            x="98"
            y="58"
            width="44"
            height="28"
            fill="currentColor"
            opacity="0.18"
            rx="1"
          />
        </svg>
      )}

      {variant === 'toolkit' && (
        <svg
          className={styles.mediaToolkit}
          viewBox="0 0 160 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="currentColor" strokeWidth="1.4" opacity="0.7">
            <line x1="22" y1="78" x2="138" y2="78" />
          </g>
          {[
            { x: 30, h: 18 },
            { x: 50, h: 32 },
            { x: 70, h: 46 },
            { x: 90, h: 28 },
            { x: 110, h: 52 },
            { x: 130, h: 38 },
          ].map((b, i) => (
            <rect
              key={i}
              x={b.x - 6}
              y={78 - b.h}
              width="12"
              height={b.h}
              fill="currentColor"
              opacity={0.25 + i * 0.08}
              rx="1"
            />
          ))}
          <text
            x="80"
            y="32"
            textAnchor="middle"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontStyle="italic"
            fontSize="22"
            fill="currentColor"
            opacity="0.9"
          >
            73%
          </text>
        </svg>
      )}
    </div>
  );
}
