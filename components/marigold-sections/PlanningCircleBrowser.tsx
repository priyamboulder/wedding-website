'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChunkyButton } from '@/components/marigold-ui/ChunkyButton';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { TapeStrip } from '@/components/marigold-ui/TapeStrip';
import { PushPin } from '@/components/marigold-ui/PushPin';
import {
  ARTICLES,
  ARTICLE_CATEGORIES,
  MAGAZINE_ISSUES,
  REAL_WEDDINGS,
  type Article,
  type ArticleCategory,
  type EditorialTab,
  type MagazineIssue,
  type RealWedding,
} from '@/lib/marigold/editorial';
import { MarigoldConfessional } from '@/components/marigold-confessional/Confessional';
import { GrapevineTab } from '@/components/grapevine-ama/GrapevineTab';
import { OverspentCard } from '@/components/overspent/OverspentCard';
import { SubmitOverspentModal } from '@/components/overspent/SubmitOverspentModal';
import { WeekOfCard } from '@/components/week-of/WeekOfCard';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import type {
  OverspentSubmissionWithVotes,
  OverspentVote,
} from '@/types/overspent';
import type { WeekOfDiarySummary } from '@/types/week-of';
import styles from './PlanningCircleBrowser.module.css';

type GateContext = 'article' | 'wedding' | 'magazine' | 'submit';
type GateTarget =
  | { context: 'article'; article: Article }
  | { context: 'wedding'; wedding: RealWedding }
  | { context: 'magazine'; issue: MagazineIssue }
  | { context: 'submit' };

const PIN_COLORS = ['pink', 'gold', 'red'] as const;

const TABS: Array<{ value: EditorialTab; label: React.ReactNode; count: number | null }> = [
  { value: 'editorial', label: 'Editorial', count: ARTICLES.length },
  { value: 'real-weddings', label: 'Real Weddings', count: REAL_WEDDINGS.length },
  { value: 'magazine', label: <><span>The </span><i>Magazine</i></>, count: MAGAZINE_ISSUES.length },
  // Count is fetched at mount; null hides the chip until then.
  { value: 'confessional', label: <><span>The </span><i>Confessional</i></>, count: null },
  { value: 'grapevine', label: <><span>The </span><i>Grapevine</i></>, count: null },
];

function StampIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
      <path d="M9 9c.667-2 4.333-2 5 0 .444 1.333-1 2.5-2.5 2.5V13" strokeLinecap="round" />
      <circle cx="11.5" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FeaturedArticle({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: (a: Article) => void;
}) {
  const gradient = `linear-gradient(135deg, ${article.gradientColors[0]} 0%, ${article.gradientColors[1]} 100%)`;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(article);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(article)}
      onKeyDown={handleKey}
      className={styles.featured}
      aria-label={`Read ${article.title}`}
    >
      <TapeStrip position="tl" />
      <div className={styles.featuredImage} style={{ background: gradient }}>
        <span className={styles.featuredCatChip}>{article.category}</span>
        <span className={styles.featuredReadingTime}>{article.readingTime} READ</span>
      </div>
      <div className={styles.featuredText}>
        <span className={styles.featuredCat}>{article.category}</span>
        <h2 className={styles.featuredTitle}>{article.title}</h2>
        <p className={styles.featuredExcerpt}>{article.excerpt}</p>
        <div className={styles.featuredMeta}>
          <span>{article.date}</span>
          <span style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>
            by {article.author}
          </span>
        </div>
        {article.scrawl && (
          <span className={styles.featuredScrawl}>{article.scrawl}</span>
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  index,
  onSelect,
}: {
  article: Article;
  index: number;
  onSelect: (a: Article) => void;
}) {
  const rotations = [-0.5, 0.5, -0.4, 0.4];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 5 === 1;
  const showPin = index % 6 === 4;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  const gradient = `linear-gradient(135deg, ${article.gradientColors[0]} 0%, ${article.gradientColors[1]} 100%)`;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(article);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(article)}
      onKeyDown={handleKey}
      className={styles.card}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Read ${article.title}`}
    >
      {showTape && <TapeStrip position="tl" />}
      {showPin && <PushPin color={pinColor} position="right" />}
      <div className={styles.cardInner}>
        <div className={styles.photo} style={{ background: gradient }}>
          <span className={styles.catChip}>{article.category}</span>
          <span className={styles.readingTime}>{article.readingTime}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.cat}>{article.category}</span>
          <h3 className={styles.title}>{article.title}</h3>
          <p className={styles.excerpt}>{article.excerpt}</p>
          <div className={styles.metaRow}>
            <span className={styles.metaDate}>{article.date}</span>
            <span className={styles.metaAuthor}>by {article.author}</span>
          </div>
          {article.scrawl && (
            <span className={styles.cardScrawl}>{article.scrawl}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function WeddingCard({
  wedding,
  index,
  onSelect,
}: {
  wedding: RealWedding;
  index: number;
  onSelect: (w: RealWedding) => void;
}) {
  const rotations = [-1.2, 1, -0.8, 0.8, -1.4, 0.6];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 3 === 0;
  const showPin = index % 3 === 1;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  const gradient = `linear-gradient(135deg, ${wedding.gradientColors[0]} 0%, ${wedding.gradientColors[1]} 100%)`;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(wedding);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(wedding)}
      onKeyDown={handleKey}
      className={styles.weddingCard}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Read ${wedding.coupleNames}'s wedding`}
    >
      {showTape && <TapeStrip position="tr" />}
      {showPin && <PushPin color={pinColor} position="center" />}
      <div className={styles.polaroid}>
        <div className={styles.weddingPhoto} style={{ background: gradient }}>
          <div className={styles.weddingPhotoTags}>
            {wedding.events.slice(0, 4).map((event) => (
              <span key={event} className={styles.weddingPhotoTag}>{event}</span>
            ))}
            {wedding.events.length > 4 && (
              <span className={styles.weddingPhotoTag}>+{wedding.events.length - 4}</span>
            )}
          </div>
        </div>
        <div className={styles.weddingInfo}>
          <h3 className={styles.coupleNames}>{wedding.coupleNames}</h3>
          <p className={styles.weddingSummary}>{wedding.summary}</p>
          {wedding.scrawl && (
            <span className={styles.weddingScrawl}>{wedding.scrawl}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MagazineCard({
  issue,
  index,
  onSelect,
}: {
  issue: MagazineIssue;
  index: number;
  onSelect: (i: MagazineIssue) => void;
}) {
  const rotations = [-0.6, 0.6, -0.4];
  const rotation = rotations[index % rotations.length];
  const gradient = `linear-gradient(160deg, ${issue.gradientColors[0]} 0%, ${issue.gradientColors[1]} 100%)`;

  return (
    <div
      className={styles.magazineCard}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <TapeStrip position="tl" />
      <TapeStrip position="tr" />
      <div className={styles.magazineCover} style={{ background: gradient }}>
        <div className={styles.magazineMasthead}>The Marigold Magazine</div>
        <div className={styles.magazineCenter}>
          <h3 className={styles.magazineCoverTitle}>{issue.title}</h3>
          <span className={styles.magazineIssueLine}>
            {issue.issueNumber} · {issue.date}
          </span>
        </div>
        <div className={styles.magazineTeasers}>
          {issue.coverTeasers.map((teaser) => (
            <span key={teaser} className={styles.magazineTeaser}>{teaser}</span>
          ))}
        </div>
      </div>
      <div className={styles.magazineFoot}>
        <h4 className={styles.magazineFootTitle}>{issue.title}</h4>
        <span className={styles.magazineFootMeta}>
          {issue.pageCount} pages · {issue.articleCount} articles
        </span>
        <p className={styles.magazineFootDesc}>{issue.description}</p>
        <div className={styles.magazineCta}>
          <ChunkyButton variant="pink" onClick={() => onSelect(issue)}>
            Read the Issue
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}

function SubmitWeddingPostcard({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.postcardWrap}>
      <div className={styles.postcard}>
        <div className={styles.postcardStamp} aria-hidden="true">
          <StampIcon />
          <span>The Marigold</span>
        </div>
        <div>
          <h3 className={styles.postcardHeading}>
            See your wedding <i>in the magazine?</i>
          </h3>
          <p className={styles.postcardBody}>
            We feature real couples from The Marigold. Share your story and you might
            end up in our next issue.
          </p>
          <span className={styles.postcardScrawl}>yes, your mom will frame it</span>
        </div>
        <div>
          <ChunkyButton variant="outline" onClick={onClick}>
            Submit Your Wedding
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}

function LoginGate({ target, onClose }: { target: GateTarget; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  let eyebrow: string;
  let heading: React.ReactNode;
  let copy: string;
  let scrawl: string;

  if (target.context === 'article') {
    eyebrow = 'coming soon';
    heading = (<>This story is <i style={{ color: 'var(--pink)' }}>almost out.</i></>);
    copy = 'New articles drop weekly. Sign up to read the full piece the moment it goes live — and get the rest of the archive while you\'re at it.';
    scrawl = 'we\'re editing as fast as we can';
  } else if (target.context === 'wedding') {
    eyebrow = 'coming soon';
    heading = (<>The full <i style={{ color: 'var(--pink)' }}>wedding story</i></>);
    copy = 'Photos, vendor list, and the bride\'s notes — coming soon. Sign up and we\'ll send you each new feature as it lands.';
    scrawl = 'sneak peek incoming';
  } else if (target.context === 'magazine') {
    eyebrow = 'platform only';
    heading = (<>Log in to <i style={{ color: 'var(--pink)' }}>read the magazine.</i></>);
    copy = 'Full issues live inside The Marigold. It\'s worth it, we promise.';
    scrawl = 'cover to cover, take your time';
  } else {
    eyebrow = 'submissions';
    heading = (<>Tell us about <i style={{ color: 'var(--pink)' }}>your wedding.</i></>);
    copy = 'Submissions live inside The Marigold. Sign up free, then send us your story from your dashboard.';
    scrawl = 'we read every single one';
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-gate-heading"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <TapeStrip position="tl" />
        <TapeStrip position="tr" />
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.modalEyebrow}>{eyebrow}</div>
        <h2 id="editorial-gate-heading" className={styles.modalHeading}>{heading}</h2>
        <p className={styles.modalSub}>{copy}</p>
        <div className={styles.modalScrawl}>{scrawl}</div>
        <div className={styles.modalButtons}>
          <ChunkyButton variant="pink" href="/pricing">
            Sign Up Free
          </ChunkyButton>
          <ChunkyButton variant="white" href="/pricing">
            Log In
          </ChunkyButton>
        </div>
        <button type="button" className={styles.modalDismiss} onClick={onClose}>
          maybe later
        </button>
      </div>
    </div>
  );
}

export function PlanningCircleBrowser() {
  const [tab, setTab] = useState<EditorialTab>('editorial');
  const [filter, setFilter] = useState<'All' | ArticleCategory>('All');
  const [gateTarget, setGateTarget] = useState<GateTarget | null>(null);
  const [stuck, setStuck] = useState(false);
  const [confessionalCount, setConfessionalCount] = useState<number | null>(null);
  const [grapevineCount, setGrapevineCount] = useState<number | null>(null);
  const [overspent, setOverspent] = useState<OverspentSubmissionWithVotes[]>([]);
  const [overspentVotes, setOverspentVotes] = useState<
    Record<string, OverspentVote>
  >({});
  const [authed, setAuthed] = useState(false);
  const [showSplurgeModal, setShowSplurgeModal] = useState(false);
  const [diaries, setDiaries] = useState<WeekOfDiarySummary[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/marigold-confessional/posts?includeCount=1')
      .then((r) => r.json())
      .then((j) => {
        if (alive && typeof j?.total === 'number') setConfessionalCount(j.total);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Grapevine session count for the tab chip — counts archived/ended/live
  // sessions (anything someone could read or join right now).
  useEffect(() => {
    let alive = true;
    fetch('/api/grapevine/sessions')
      .then((r) => r.json())
      .then((j) => {
        if (alive && Array.isArray(j?.sessions)) {
          const visible = j.sessions.filter(
            (s: { status: string }) =>
              s.status === 'archived' ||
              s.status === 'ended' ||
              s.status === 'live',
          );
          setGrapevineCount(visible.length);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Load published "Week Of" diaries — surfaced as cards in the Real
  // Weddings tab alongside the static REAL_WEDDINGS.
  useEffect(() => {
    let alive = true;
    fetch('/api/week-of')
      .then((r) => r.json())
      .then((j) => {
        if (alive && Array.isArray(j?.diaries)) {
          setDiaries(j.diaries as WeekOfDiarySummary[]);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Load Overspent submissions once for the Editorial feed.
  useEffect(() => {
    let alive = true;
    fetch('/api/overspent/submissions')
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (Array.isArray(j?.submissions)) setOverspent(j.submissions);
        if (j?.userVotes && typeof j.userVotes === 'object') {
          setOverspentVotes(j.userVotes as Record<string, OverspentVote>);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Track auth so the Share Your Splurge CTA gates correctly.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabaseBrowser.auth.getSession();
        if (alive) setAuthed(!!data.session);
      } catch {
        if (alive) setAuthed(false);
      }
    })();
    const sub = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      alive = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-89px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => filter === 'All' || a.category === filter);
  }, [filter]);

  const featured = useMemo(() => {
    return ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
  }, []);

  const articleGrid = useMemo(() => {
    if (filter === 'All') {
      return filteredArticles.filter((a) => a.id !== featured.id);
    }
    return filteredArticles;
  }, [filteredArticles, featured, filter]);

  // Interleave Overspent submission cards every N article cards. The grid is
  // 2 columns desktop / 1 column mobile, so dropping one Overspent card after
  // every 4th article gives a "pull-quote between sections" rhythm.
  type FeedItem =
    | { kind: 'article'; article: Article; idx: number }
    | { kind: 'overspent'; submission: OverspentSubmissionWithVotes };

  const editorialFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    let osPtr = 0;
    articleGrid.forEach((article, idx) => {
      items.push({ kind: 'article', article, idx });
      // After indices 3, 7, 11… insert an Overspent card if we still have any.
      if ((idx + 1) % 4 === 0 && osPtr < overspent.length) {
        items.push({ kind: 'overspent', submission: overspent[osPtr] });
        osPtr += 1;
      }
    });
    // Append any remaining overspent submissions at the end.
    while (osPtr < overspent.length) {
      items.push({ kind: 'overspent', submission: overspent[osPtr] });
      osPtr += 1;
    }
    return items;
  }, [articleGrid, overspent]);

  const handleOverspentVoted = (
    id: string,
    vote: OverspentVote,
    counts: { agree_count: number; disagree_count: number },
  ) => {
    setOverspentVotes((prev) => ({ ...prev, [id]: vote }));
    setOverspent((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...counts } : s)),
    );
  };

  const handleSplurgeClick = () => {
    setShowSplurgeModal(true);
  };

  return (
    <>
      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar} role="tablist" aria-label="Planning Circle tabs">
          {TABS.map((t) => {
            const active = tab === t.value;
            const count =
              t.value === 'confessional'
                ? confessionalCount
                : t.value === 'grapevine'
                  ? grapevineCount
                  : t.value === 'real-weddings'
                    ? REAL_WEDDINGS.length + diaries.length
                    : t.count;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              >
                {t.label}
                {count !== null && (
                  <span className={styles.tabCount}>({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

      {tab === 'editorial' && (
        <div className={`${styles.filterBarWrap} ${stuck ? styles.stuck : ''}`}>
          <div className={styles.filterRow} role="tablist" aria-label="Categories">
            {(['All', ...ARTICLE_CATEGORIES] as const).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(cat)}
                  className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.gridWrap}>
        {tab === 'editorial' && (
          <>
            <div className={styles.splurgeBar}>
              <div className={styles.splurgeBarText}>
                <span className={styles.splurgeBarEyebrow}>
                  Overspent or Worth It?
                </span>
                <h3 className={styles.splurgeBarHeading}>
                  Share <i>your splurge</i> — was it worth every penny?
                </h3>
              </div>
              <button
                type="button"
                className={styles.splurgeBarBtn}
                onClick={handleSplurgeClick}
              >
                Share Your Splurge →
              </button>
            </div>

            {filter === 'All' && (
              <FeaturedArticle
                article={featured}
                onSelect={(a) => setGateTarget({ context: 'article', article: a })}
              />
            )}

            {articleGrid.length === 0 ? (
              <div className={styles.empty}>
                <TapeStrip position="center" />
                <div className={styles.emptyTitle}>No stories in this category yet</div>
                <div className={styles.emptyBody}>New essays drop weekly — check back soon.</div>
                <ScrawlNote>or peek at a different shelf</ScrawlNote>
              </div>
            ) : (
              <div className={styles.grid}>
                {editorialFeed.map((item) =>
                  item.kind === 'article' ? (
                    <ArticleCard
                      key={`a-${item.article.id}`}
                      article={item.article}
                      index={item.idx}
                      onSelect={(article) =>
                        setGateTarget({ context: 'article', article })
                      }
                    />
                  ) : (
                    <OverspentCard
                      key={`o-${item.submission.id}`}
                      submission={item.submission}
                      myVote={overspentVotes[item.submission.id] ?? null}
                      onVoted={handleOverspentVoted}
                    />
                  ),
                )}
              </div>
            )}
          </>
        )}

        {tab === 'real-weddings' && (
          <div className={styles.weddingsGrid}>
            {diaries.map((d, idx) => (
              <WeekOfCard key={`d-${d.id}`} diary={d} index={idx} />
            ))}
            {REAL_WEDDINGS.map((w, idx) => (
              <WeddingCard
                key={w.id}
                wedding={w}
                index={diaries.length + idx}
                onSelect={(wedding) => setGateTarget({ context: 'wedding', wedding })}
              />
            ))}
          </div>
        )}

        {tab === 'magazine' && (
          <>
            <div className={styles.magazineGrid}>
              {MAGAZINE_ISSUES.map((issue, idx) => (
                <MagazineCard
                  key={issue.id}
                  issue={issue}
                  index={idx}
                  onSelect={(i) => setGateTarget({ context: 'magazine', issue: i })}
                />
              ))}
            </div>
            <SubmitWeddingPostcard
              onClick={() => setGateTarget({ context: 'submit' })}
            />
          </>
        )}

        {tab === 'confessional' && <MarigoldConfessional />}

        {tab === 'grapevine' && <GrapevineTab />}
      </div>

      {gateTarget && (
        <LoginGate target={gateTarget} onClose={() => setGateTarget(null)} />
      )}

      {showSplurgeModal && (
        <SubmitOverspentModal
          authed={authed}
          onClose={() => setShowSplurgeModal(false)}
        />
      )}
    </>
  );
}
