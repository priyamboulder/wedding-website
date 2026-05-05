import Link from 'next/link';
import { ARTICLES, REAL_WEDDINGS, type Article, type RealWedding } from '@/lib/marigold/editorial';
import { listToolsCatalog } from '@/lib/tools';
import { createAnonClient } from '@/lib/supabase/server-client';
import type { ToolCatalogRow } from '@/types/tools';
import styles from './TrendingOnMarigold.module.css';

const TOOL_ICONS: Record<string, string> = {
  budget: '💸',
  destinations: '🗺️',
  match: '✨',
  visualizer: '🎨',
  guests: '📋',
  shagun: '🎁',
  dates: '📅',
  kundli: '🔮',
};

function pickRealWedding(): RealWedding | null {
  return REAL_WEDDINGS[0] ?? null;
}

function pickArticle(): Article | null {
  return ARTICLES[0] ?? null;
}

export async function TrendingOnMarigold() {
  let firstTool: ToolCatalogRow | null = null;
  try {
    const supabase = createAnonClient();
    const tools = await listToolsCatalog(supabase);
    firstTool = tools[0] ?? null;
  } catch {
    firstTool = null;
  }

  const realWedding = pickRealWedding();
  const article = pickArticle();

  if (!realWedding && !article && !firstTool) return null;

  return (
    <section className={styles.section} aria-labelledby="trending-marigold-heading">
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.scrawl}>trending on the marigold</span>
          <h2 id="trending-marigold-heading" className={styles.heading}>
            What everyone&rsquo;s reading.
          </h2>
          <span className={styles.metaRow}>
            <span className={styles.pulse} aria-hidden="true" />
            this week&rsquo;s top three
          </span>
        </header>

        <div className={styles.grid}>
          {realWedding && <RealWeddingCard wedding={realWedding} rank="01" />}
          {article && <EditorialCard article={article} rank="02" />}
          {firstTool && <ToolCard tool={firstTool} rank="03" />}
        </div>
      </div>
    </section>
  );
}

function RealWeddingCard({ wedding, rank }: { wedding: RealWedding; rank: string }) {
  const gradient = `linear-gradient(135deg, ${wedding.gradientColors[0]} 0%, ${wedding.gradientColors[1]} 100%)`;
  const events = wedding.events.slice(0, 3);

  return (
    <Link href="/blog" className={`${styles.card} ${styles.cardTerracotta}`}>
      <span className={`${styles.sticker} ${styles.stickerPink}`}>Most Read</span>
      <span className={styles.rank} aria-hidden="true">
        {rank}
      </span>
      <div className={styles.media} style={{ background: gradient }} aria-hidden="true" />
      <span className={`${styles.cardDot} ${styles.cardDot1}`} aria-hidden="true" />
      <span className={`${styles.cardDot} ${styles.cardDot2}`} aria-hidden="true" />
      <div className={styles.cardBody}>
        <div className={styles.eventPills}>
          {events.map((event) => (
            <span key={event} className={styles.eventPill}>
              {event}
            </span>
          ))}
        </div>
        <h3 className={styles.cardTitle}>{wedding.coupleNames}</h3>
        <p className={styles.cardMeta}>{wedding.summary}</p>
        {wedding.scrawl && <p className={styles.pullQuote}>{wedding.scrawl}</p>}
        <div className={styles.cardFooter}>
          <span className={styles.cardCta}>Read the wedding</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}

function EditorialCard({ article, rank }: { article: Article; rank: string }) {
  return (
    <Link href="/blog" className={`${styles.card} ${styles.cardPlum}`}>
      <span className={styles.sticker}>Fan Favorite</span>
      <span className={styles.rank} aria-hidden="true">
        {rank}
      </span>
      <span className={`${styles.cardDot} ${styles.cardDot1}`} aria-hidden="true" />
      <span className={`${styles.cardDot} ${styles.cardDot2}`} aria-hidden="true" />
      <div className={styles.cardBody}>
        <span className={styles.categoryTag}>{article.category}</span>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.cardExcerpt}>{article.excerpt}</p>
        <p className={styles.byline}>
          by {article.author} · {article.readingTime}
        </p>
        <div className={styles.cardFooter}>
          <span className={styles.cardCta}>Read the article</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}

function ToolCard({ tool, rank }: { tool: ToolCatalogRow; rank: string }) {
  const icon = TOOL_ICONS[tool.slug] ?? '🛠️';
  const isSoon = tool.status === 'coming_soon';

  return (
    <Link href={tool.cta_route} className={`${styles.card} ${styles.cardSage}`}>
      <span className={`${styles.sticker} ${styles.stickerGold}`}>Popular Pick</span>
      <span className={styles.rank} aria-hidden="true">
        {rank}
      </span>
      <span className={`${styles.cardDot} ${styles.cardDot1}`} aria-hidden="true" />
      <span className={`${styles.cardDot} ${styles.cardDot2}`} aria-hidden="true" />
      <div className={styles.cardBody}>
        <span className={styles.categoryTag}>The Toolkit</span>
        <div className={styles.cardIcon} aria-hidden="true">
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{tool.name}</h3>
        <p className={styles.cardTagline}>{tool.tagline}</p>
        <div className={styles.cardFooter}>
          <span className={styles.cardCta}>
            {isSoon ? 'Notify me' : 'Try it free'}
          </span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
