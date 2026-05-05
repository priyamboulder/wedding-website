'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import styles from './ToolsTeaser.module.css';

type ToolKey =
  | 'destinations'
  | 'budget'
  | 'match'
  | 'vendor-roulette'
  | 'vibe-quiz'
  | 'guests'
  | 'timeline'
  | 'compare';

type Tool = {
  key: ToolKey;
  icon: string;
  name: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  ctaRoute: string;
  status: 'live' | 'soon';
  smallCta: string;
  Preview: () => ReactNode;
};

const UNSPLASH = (id: string, w = 320) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// ── Visual preview mockups (occupy the same slot as the original
// previewGrid — kept consistent in size and palette) ────────────────────

function DestinationPreview() {
  const items = [
    {
      name: 'Udaipur',
      thumb: UNSPLASH('photo-1583939411023-14783179e581'),
      alt: 'Udaipur palace at golden hour',
      range: '$150K–$400K',
      ecosystem: 'Strong vendor ecosystem',
      tier: 'strong' as const,
      weather: 'Oct–Mar ideal',
    },
    {
      name: 'Cancún',
      thumb: UNSPLASH('photo-1519741497674-611481863552'),
      alt: 'Cancún coastline',
      range: '$80K–$200K',
      ecosystem: 'Moderate vendor ecosystem',
      tier: 'moderate' as const,
      weather: 'Nov–Apr ideal',
    },
    {
      name: 'Hudson Valley, NY',
      thumb: UNSPLASH('photo-1464366400600-7168b8af9bc3'),
      alt: 'Hudson Valley landscape',
      range: '$120K–$300K',
      ecosystem: 'Strong vendor ecosystem',
      tier: 'strong' as const,
      weather: 'May–Oct ideal',
    },
  ];
  return (
    <div className={styles.previewGrid}>
      {items.map((d) => (
        <div key={d.name} className={styles.previewCard}>
          <div className={styles.previewImageWrap}>
            <img
              src={d.thumb}
              alt={d.alt}
              loading="lazy"
              className={styles.previewImage}
            />
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewName}>{d.name}</div>
            <div className={styles.previewRange}>
              {d.range}
              <span className={styles.previewRangeNote}> · 200 guests</span>
            </div>
            <div
              className={[
                styles.previewEcosystem,
                styles[`previewEcosystem_${d.tier}`],
              ].join(' ')}
            >
              <span className={styles.previewDot} aria-hidden="true" />
              {d.ecosystem}
            </div>
            <div className={styles.previewWeather}>{d.weather}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetPreview() {
  const cats = [
    { label: 'Venue & Lodging', amount: 60000, pct: 30 },
    { label: 'Catering (4 events)', amount: 45000, pct: 22.5 },
    { label: 'Décor — mandap, sangeet, mehendi, reception', amount: 30000, pct: 15 },
    { label: 'Photography & Video', amount: 18000, pct: 9 },
    { label: 'Attire & Jewelry', amount: 15000, pct: 7.5 },
    { label: 'Music & Entertainment', amount: 12000, pct: 6 },
    { label: 'Invitations & Stationery', amount: 5000, pct: 2.5 },
    { label: 'Other', amount: 15000, pct: 7.5 },
  ];
  const fmt = (n: number) => '$' + n.toLocaleString();
  return (
    <div className={styles.budgetMock}>
      <div className={styles.budgetTopBar}>
        <div className={styles.budgetTopLabel}>Total budget</div>
        <div className={styles.budgetTopValue}>$200,000 · 250 guests</div>
      </div>
      <div className={styles.budgetBarStack}>
        {cats.map((c, i) => (
          <div key={c.label} className={styles.budgetRow}>
            <div className={styles.budgetRowLabel}>{c.label}</div>
            <div className={styles.budgetRowTrack}>
              <div
                className={styles.budgetRowFill}
                style={{
                  width: `${c.pct * 2.4}%`,
                  background:
                    i % 2 === 0
                      ? 'linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 100%)'
                      : 'linear-gradient(90deg, #E8C9C0 0%, #F2D5D0 100%)',
                }}
              />
            </div>
            <div className={styles.budgetRowAmount}>{fmt(c.amount)}</div>
          </div>
        ))}
      </div>
      <div className={styles.budgetFooter}>
        <span className={styles.budgetFooterPill}>~$800 per guest</span>
        <span className={styles.budgetFooterPillGood}>$12K under budget ✓</span>
      </div>
    </div>
  );
}

function MatchPreview() {
  const cards = [
    {
      name: 'Udaipur',
      thumb: UNSPLASH('photo-1583939411023-14783179e581'),
      match: 94,
      reason: 'Strong Indian catering network',
    },
    {
      name: 'Napa Valley',
      thumb: UNSPLASH('photo-1507434965515-61970f2bd7c6'),
      match: 87,
      reason: 'Fire ceremony permitted on-site',
    },
    {
      name: 'Hudson Valley',
      thumb: UNSPLASH('photo-1464366400600-7168b8af9bc3'),
      match: 82,
      reason: '200+ room block available',
    },
  ];
  return (
    <div className={styles.matchMock}>
      <div className={styles.matchInputRow}>
        <span className={styles.matchInputLabel}>Your brief</span>
        <span className={styles.matchInputValue}>
          250 guests · $150–250K · Palace &amp; grandeur
        </span>
      </div>
      <div className={styles.matchCards}>
        {cards.map((c) => (
          <div key={c.name} className={styles.matchCard}>
            <div className={styles.matchThumbWrap}>
              <img
                src={c.thumb}
                alt={c.name}
                loading="lazy"
                className={styles.matchThumb}
              />
              <span className={styles.matchBadge}>{c.match}% match</span>
            </div>
            <div className={styles.matchCardBody}>
              <div className={styles.matchName}>{c.name}</div>
              <div className={styles.matchReason}>{c.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorRoulettePreview() {
  return (
    <div className={styles.rouletteMock}>
      <div className={styles.rouletteStack}>
        <div className={[styles.rouletteCard, styles.rouletteBack2].join(' ')} />
        <div className={[styles.rouletteCard, styles.rouletteBack1].join(' ')} />
        <div className={[styles.rouletteCard, styles.rouletteFront].join(' ')}>
          <div className={styles.rouletteImage}>
            <img
              src={UNSPLASH('photo-1519225421980-715cb0215aed')}
              alt="vendor"
              loading="lazy"
            />
            <span className={styles.roulettePrice}>$$</span>
          </div>
          <div className={styles.rouletteBody}>
            <div className={styles.rouletteName}>Radiant Lens Photography</div>
            <div className={styles.rouletteLocation}>Dallas, TX</div>
            <div className={styles.rouletteRating}>
              <span className={styles.rouletteStars}>★★★★★</span>
              <span className={styles.rouletteRatingNum}>4.9</span>
            </div>
            <div className={styles.rouletteTags}>
              <span>candid</span>
              <span>editorial</span>
              <span>cultural</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.rouletteActions}>
        <span
          className={[styles.rouletteAction, styles.rouletteSkip].join(' ')}
          aria-hidden="true"
        >
          ✕
        </span>
        <span className={styles.rouletteCounter}>3 of 12 matches</span>
        <span
          className={[styles.rouletteAction, styles.rouletteSave].join(' ')}
          aria-hidden="true"
        >
          ♡
        </span>
      </div>
    </div>
  );
}

function VibeQuizPreview() {
  const swatches = ['#5B1A2A', '#C49A4B', '#FFF8F2', '#8FA68A', '#E9C7C0'];
  const keywords = ['palace', 'jewel tones', 'candlelight', 'intricate'];
  return (
    <div className={styles.vibeMock}>
      <div className={styles.vibeEyebrow}>Your vibe profile</div>
      <h4 className={styles.vibeTitle}>Regal Romance</h4>
      <div className={styles.vibeSwatches}>
        {swatches.map((c, i) => (
          <span
            key={i}
            className={styles.vibeSwatch}
            style={{ background: c }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className={styles.vibeKeywords}>
        {keywords.map((k) => (
          <span key={k} className={styles.vibePill}>
            {k}
          </span>
        ))}
      </div>
      <div className={styles.vibeTeaser}>Your moodboard is ready →</div>
    </div>
  );
}

function GuestEstimatorPreview() {
  const rows = [
    { label: "Bride's immediate family", count: 24 },
    { label: "Bride's extended", count: 86 },
    { label: "Groom's immediate family", count: 18 },
    { label: "Groom's extended", count: 72 },
    { label: "Couple's friends", count: 45 },
    { label: '"Can\'t NOT invite"', count: 42 },
  ];
  return (
    <div className={styles.guestsMock}>
      <div className={styles.guestsTopBar}>
        <span className={styles.guestsTopLabel}>Estimated total</span>
        <span className={styles.guestsTopValue}>287 guests</span>
      </div>
      <div className={styles.guestsRows}>
        {rows.map((r) => (
          <div key={r.label} className={styles.guestsRow}>
            <span className={styles.guestsRowLabel}>{r.label}</span>
            <span className={styles.guestsRowDots} aria-hidden="true" />
            <span className={styles.guestsRowCount}>{r.count}</span>
          </div>
        ))}
      </div>
      <div className={styles.guestsEvents}>
        <div className={styles.guestsEvent}>
          <span>All events</span>
          <strong>201</strong>
        </div>
        <div className={styles.guestsEvent}>
          <span>Sangeet</span>
          <strong>235</strong>
        </div>
        <div className={styles.guestsEvent}>
          <span>Reception</span>
          <strong>287</strong>
        </div>
      </div>
    </div>
  );
}

function TimelinePreview() {
  const milestones = [
    { out: '12 months out', items: 'Book venue · photographer · order lehenga' },
    { out: '9 months out', items: 'Book caterer · hire decorator · save-the-dates' },
    { out: '6 months out', items: 'Mehendi artist · baraat logistics · sangeet playlist' },
    { out: '3 months out', items: 'Send invitations · trousseau shopping' },
    { out: '1 month out', items: 'Final guest count · fittings · rehearsal' },
  ];
  return (
    <div className={styles.timelineMock}>
      <div className={styles.timelineSpine} aria-hidden="true" />
      {milestones.map((m) => (
        <div key={m.out} className={styles.timelineStep}>
          <span className={styles.timelineDot} aria-hidden="true" />
          <div className={styles.timelineStepBody}>
            <div className={styles.timelineOut}>{m.out}</div>
            <div className={styles.timelineItems}>{m.items}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparePreview() {
  const rows = [
    { label: 'Est. cost (250 guests)', a: '$280K', b: '$160K' },
    { label: 'Vendor ecosystem', a: '★★★★★', b: '★★★☆☆' },
    { label: 'Guest travel', a: 'Intl flights', b: 'Direct from US' },
    { label: 'Fire ceremony', a: 'Most venues OK', b: 'Select beach only' },
    { label: 'Peak season', a: 'Oct–Mar', b: 'Nov–Apr' },
  ];
  return (
    <div className={styles.compareMock}>
      <div className={styles.compareHeader}>
        <div className={[styles.compareSide, styles.compareSideA].join(' ')}>
          <span className={styles.compareEyebrow}>Destination A</span>
          <span className={styles.compareName}>Udaipur</span>
        </div>
        <div className={styles.compareVs} aria-hidden="true">vs</div>
        <div className={[styles.compareSide, styles.compareSideB].join(' ')}>
          <span className={styles.compareEyebrow}>Destination B</span>
          <span className={styles.compareName}>Cancún</span>
        </div>
      </div>
      <div className={styles.compareRows}>
        {rows.map((r) => (
          <div key={r.label} className={styles.compareRow}>
            <span className={styles.compareRowA}>{r.a}</span>
            <span className={styles.compareRowLabel}>{r.label}</span>
            <span className={styles.compareRowB}>{r.b}</span>
          </div>
        ))}
      </div>
      <div className={styles.compareFooter}>
        <span className={styles.compareWinnerA}>Best for: cultural authenticity</span>
        <span className={styles.compareWinnerB}>Best for: budget-conscious</span>
      </div>
    </div>
  );
}

// ── Tool catalog (carousel order) ─────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    key: 'destinations',
    icon: '🗺️',
    name: 'Destination Explorer',
    tagline: 'where should you actually do this',
    description:
      'Udaipur to Lake Como, Cancún to Napa — find out what a 200-guest Indian wedding actually costs in each destination. We factored in the baraat horse.',
    ctaLabel: 'Explore destinations',
    ctaRoute: '/tools/destinations',
    status: 'live',
    smallCta: 'Try it free',
    Preview: DestinationPreview,
  },
  {
    key: 'budget',
    icon: '💸',
    name: 'Shaadi Budget™',
    tagline: 'the budget tool that actually gets indian weddings',
    description:
      'Not a generic wedding budget spreadsheet. This one knows that your décor budget splits across mandap, sangeet stage, mehendi setup, and reception — and that catering for 300 means four separate menus across four days.',
    ctaLabel: 'Try Shaadi Budget free',
    ctaRoute: '/tools/budget',
    status: 'live',
    smallCta: 'Try it free',
    Preview: BudgetPreview,
  },
  {
    key: 'match',
    icon: '✨',
    name: 'Match Me',
    tagline: "tell us your budget, we'll show you where you can go",
    description:
      "Enter your guest count, budget range, and vibe — and we'll match you with destinations that can actually handle a multi-day Indian wedding. No more Googling “does this resort allow fire ceremonies.”",
    ctaLabel: 'Try Match Me free',
    ctaRoute: '/tools/match',
    status: 'live',
    smallCta: 'Try it free',
    Preview: MatchPreview,
  },
  {
    key: 'vendor-roulette',
    icon: '🎰',
    name: 'Vendor Roulette',
    tagline: 'spin the wheel, find your vendor',
    description:
      "Can't decide between vendors? Vendor Roulette surfaces a random curated pick — swipe right to save, swipe left to skip. It's Tinder for wedding vendors, minus the awkward small talk.",
    ctaLabel: 'Try Vendor Roulette',
    ctaRoute: '/tools/vendor-match-quiz',
    status: 'soon',
    smallCta: 'Notify me',
    Preview: VendorRoulettePreview,
  },
  {
    key: 'vibe-quiz',
    icon: '🎨',
    name: 'The Vibe Quiz',
    tagline: 'find your wedding aesthetic in 2 minutes',
    description:
      "Answer 8 visual questions and we'll generate your wedding vibe profile — mood palette, style keywords, and curated inspiration. Share it with vendors so they actually understand what “modern but traditional” means.",
    ctaLabel: 'Take the Vibe Quiz',
    ctaRoute: '/tools',
    status: 'soon',
    smallCta: 'Notify me',
    Preview: VibeQuizPreview,
  },
  {
    key: 'guests',
    icon: '👥',
    name: 'Guest Count Estimator',
    tagline: 'how many people are actually coming',
    description:
      "You think it's 200. Your mom thinks it's 400. Build a realistic guest count by family branch, event type, and the “we can't NOT invite them” category.",
    ctaLabel: 'Estimate your guest count',
    ctaRoute: '/tools/guests',
    status: 'live',
    smallCta: 'Try it free',
    Preview: GuestEstimatorPreview,
  },
  {
    key: 'timeline',
    icon: '📅',
    name: 'Timeline Builder',
    tagline: 'when should you actually start planning',
    description:
      "Tell us your wedding date and we'll reverse-engineer a planning timeline with Indian wedding milestones — “book pandit,” “confirm baraat permits,” “order lehenga (yes, 8 months out).”",
    ctaLabel: 'Build your timeline',
    ctaRoute: '/tools',
    status: 'soon',
    smallCta: 'Notify me',
    Preview: TimelinePreview,
  },
  {
    key: 'compare',
    icon: '⚖️',
    name: 'Cost Comparison',
    tagline: 'udaipur vs. cancún — side by side',
    description:
      'Pick two destinations and compare head-to-head: total cost, vendor ecosystem, guest travel, ceremony accommodations, and weather.',
    ctaLabel: 'Compare destinations',
    ctaRoute: '/tools/destinations',
    status: 'live',
    smallCta: 'Try it free',
    Preview: ComparePreview,
  },
];

// ── Carousel ─────────────────────────────────────────────────────────────

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function ToolsTeaser() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);
  const len = TOOLS.length;

  const featured = TOOLS[activeIndex];
  const supportA = TOOLS[mod(activeIndex + 1, len)];
  const supportB = TOOLS[mod(activeIndex + 2, len)];

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      setDirection(dir);
      setActiveIndex(mod(next, len));
    },
    [len],
  );

  const onPrev = () => goTo(activeIndex - 1, -1);
  const onNext = () => goTo(activeIndex + 1, 1);

  const onSelect = (idx: number) => {
    if (idx === activeIndex) return;
    const dir: 1 | -1 = mod(idx - activeIndex, len) <= len / 2 ? 1 : -1;
    goTo(idx, dir);
  };

  // Keyboard nav (arrow keys when section is focused).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (!e.target.closest(`.${styles.section}`)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Featured-card swipe (mobile).
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) onNext();
    else onPrev();
  };

  const slideClass =
    direction === 1 ? styles.slideInRight : styles.slideInLeft;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.scrawl}>free + no signup</span>
          <h2 className={styles.heading}>
            tools that do the <em>dreaming</em> for you.
          </h2>
        </div>

        <div className={styles.carousel}>
          <button
            type="button"
            onClick={onPrev}
            className={[styles.arrow, styles.arrowPrev].join(' ')}
            aria-label="Previous tool"
          >
            ‹
          </button>

          <div className={styles.layout}>
            {/* Featured card — keyed by tool to re-mount with slide animation. */}
            <Link
              key={featured.key}
              href={featured.ctaRoute}
              className={[styles.featured, slideClass].join(' ')}
              aria-label={`Open ${featured.name}`}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <span className={styles.featuredEyebrow}>
                <span>Featured tool</span>
                <span
                  className={[
                    styles.featuredStatus,
                    featured.status === 'soon' ? styles.featuredStatusSoon : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {featured.status === 'soon' ? 'Soon' : 'Live'}
                </span>
              </span>

              <h3 className={styles.featuredTitle}>{featured.name}</h3>
              <p className={styles.featuredSubtext}>{featured.description}</p>

              <div className={styles.featuredVisual}>
                <featured.Preview />
              </div>

              <span className={styles.featuredCta}>
                <span>{featured.ctaLabel}</span>
                <span aria-hidden="true" className={styles.featuredCtaArrow}>
                  →
                </span>
              </span>
            </Link>

            <div className={styles.supporting}>
              {[supportA, supportB].map((tool, slotIdx) => {
                const isSoon = tool.status === 'soon';
                const targetIdx = mod(activeIndex + 1 + slotIdx, len);
                const restRot = slotIdx === 0 ? '-0.8deg' : '0.6deg';
                return (
                  <button
                    key={`${slotIdx}-${tool.key}`}
                    type="button"
                    onClick={() => onSelect(targetIdx)}
                    className={[styles.supportCard, slideClass].join(' ')}
                    aria-label={`Feature ${tool.name}`}
                    style={
                      { '--rest-rot': restRot } as CSSProperties
                    }
                  >
                    <span className={styles.supportEyebrow}>
                      <span>Tool</span>
                      <span
                        className={[
                          styles.supportStatus,
                          isSoon ? styles.supportStatusSoon : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {isSoon ? 'Soon' : 'Live'}
                      </span>
                    </span>
                    <div className={styles.supportIcon} aria-hidden="true">
                      {tool.icon}
                    </div>
                    <h3 className={styles.supportTitle}>{tool.name}</h3>
                    <p className={styles.supportTagline}>{tool.tagline}</p>
                    <span className={styles.supportCta}>
                      {tool.smallCta} →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className={[styles.arrow, styles.arrowNext].join(' ')}
            aria-label="Next tool"
          >
            ›
          </button>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Tool indicator">
          {TOOLS.map((t, i) => (
            <button
              key={t.key}
              type="button"
              className={[
                styles.dot,
                i === activeIndex ? styles.dotActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(i)}
              aria-label={`Show ${t.name}`}
              aria-selected={i === activeIndex}
            />
          ))}
        </div>

        <div className={styles.footerRow}>
          <Link href="/tools" className={styles.footerLink}>
            See all the tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
