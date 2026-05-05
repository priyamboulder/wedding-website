import Link from 'next/link';
import { SectionHeader } from '@/components/marigold/ui/SectionHeader';
import styles from './ScrapbookGrid.module.css';
import { MOCKUPS, type ModuleSlug } from './ScrapbookMockups';

type Tint = 'champagne' | 'blush' | 'mauve';

type Module = {
  slug: ModuleSlug;
  name: string;
  href: string;
  glyph: string;
  tint: Tint;
  size: 'featured' | 'wide' | 'narrow' | 'half';
  headlinePlain: string;
  headlineEm: string;
  description: string;
  detail?: string;
  quip: string;
};

const MODULES: Module[] = [
  {
    slug: 'checklist',
    name: 'The Checklist',
    href: '/features/checklist',
    glyph: '✦',
    tint: 'champagne',
    size: 'featured',
    headlinePlain: '582 tasks.',
    headlineEm: '13 phases.',
    description:
      "From 'discuss overall wedding vision' to 'confirm the baraat horse.' AI suggests what's next.",
    detail:
      'A living plan that reshuffles itself every time your timeline, guest list, or vibe changes.',
    quip: "it's giving project manager energy",
  },
  {
    slug: 'vendors',
    name: 'Vendor Hub',
    href: '/features/vendors',
    glyph: '❋',
    tint: 'blush',
    size: 'wide',
    headlinePlain: 'Curated picks.',
    headlineEm: 'Not a marketplace.',
    description:
      'Hand-vetted vendors matched to YOUR wedding. Not a 50,000-listing yellow pages.',
    quip: 'vendor roulette is a real thing',
  },
  {
    slug: 'workspaces',
    name: 'Vendor Workspaces',
    href: '/features/workspaces',
    glyph: '◈',
    tint: 'mauve',
    size: 'narrow',
    headlinePlain: '12',
    headlineEm: 'dedicated rooms.',
    description:
      'Vibe quiz, style keywords, moodboards — The Brief your vendor reads first.',
    quip: 'vendors will think you hired a planner',
  },
  {
    slug: 'guests',
    name: 'Guest Management',
    href: '/features/guests',
    glyph: '❖',
    tint: 'champagne',
    size: 'narrow',
    headlinePlain: 'Bride side.',
    headlineEm: 'Groom side.',
    description:
      'Per-event RSVPs across both families. AI tracks who you invited, who you forgot, who never replied.',
    quip: 'AI remembers the people you forgot',
  },
  {
    slug: 'registry',
    name: 'Registry & Gifts',
    href: '/features/registry',
    glyph: '♦',
    tint: 'blush',
    size: 'wide',
    headlinePlain: 'Honeymoon fund.',
    headlineEm: 'Shagun pool.',
    description:
      'A registry that finally fits Indian weddings — cash envelopes, contributions, thank-you tracker, top-shagun leaderboard.',
    quip: 'aunty IS keeping score',
  },
  {
    slug: 'studio',
    name: 'The Studio',
    href: '/features/studio',
    glyph: '✿',
    tint: 'mauve',
    size: 'half',
    headlinePlain: 'One brand.',
    headlineEm: 'Every surface.',
    description:
      'Monogram, palette, type, website, invitations, signage — generated as one cohesive system.',
    quip: 'one brand system to rule them all',
  },
  {
    slug: 'community',
    name: 'The Planning Circle',
    href: '/features/community',
    glyph: '✧',
    tint: 'champagne',
    size: 'half',
    headlinePlain: 'Not a forum.',
    headlineEm: 'A community.',
    description:
      'Editorial, real weddings, The Confessional, The Grapevine, live events — anonymous and unfiltered.',
    quip: 'the confessional alone is worth signing up',
  },
];

const TINT_CLASS: Record<Tint, string> = {
  champagne: styles.tintChampagne,
  blush: styles.tintBlush,
  mauve: styles.tintMauve,
};

const SIZE_CLASS = {
  featured: styles.sizeFeatured,
  wide: styles.sizeWide,
  narrow: styles.sizeNarrow,
  half: styles.sizeHalf,
} as const;

export function ScrapbookGrid() {
  return (
    <section
      id="features"
      className={styles.section}
    >
      <span className={styles.bgGlow1} aria-hidden="true" />
      <span className={styles.bgGlow2} aria-hidden="true" />

      <SectionHeader
        scrawl="okay here's what you're actually getting"
        heading="The Full Picture"
        sub="Seven rooms in one platform. Each one earns its keep."
      />

      <div className={styles.grid}>
        {MODULES.map((m) => {
          const Mockup = MOCKUPS[m.slug];
          return (
            <Link
              key={m.slug}
              href={m.href}
              data-slug={m.slug}
              className={`${styles.card} ${TINT_CLASS[m.tint]} ${SIZE_CLASS[m.size]}`}
              aria-label={`${m.name} — ${m.headlinePlain} ${m.headlineEm}`}
            >
              <span className={styles.cardTexture} aria-hidden="true" />
              <span className={styles.cardMotif} aria-hidden="true" />

              {m.size === 'featured' && (
                <span className={styles.featuredWatermark} aria-hidden="true">
                  <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMaxYMid meet">
                    <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
                      <rect x="22" y="28" width="14" height="14" />
                      <line x1="46" y1="35" x2="172" y2="35" />
                      <rect x="22" y="58" width="14" height="14" />
                      <line x1="46" y1="65" x2="158" y2="65" />
                      <rect x="22" y="88" width="14" height="14" />
                      <line x1="46" y1="95" x2="172" y2="95" />
                      <rect x="22" y="118" width="14" height="14" />
                      <line x1="46" y1="125" x2="142" y2="125" />
                      <rect x="22" y="148" width="14" height="14" />
                      <line x1="46" y1="155" x2="166" y2="155" />
                      <path d="M25 33 l4 4 l7 -8" className={styles.checkmark1} stroke="currentColor" strokeWidth="1.6" />
                      <path d="M25 63 l4 4 l7 -8" className={styles.checkmark2} stroke="currentColor" strokeWidth="1.6" />
                      <path d="M25 93 l4 4 l7 -8" className={styles.checkmark3} stroke="currentColor" strokeWidth="1.6" />
                    </g>
                  </svg>
                </span>
              )}

              <div className={styles.cardText}>
                <span className={styles.glyph} aria-hidden="true">
                  {m.glyph}
                </span>
                <span className={styles.name}>{m.name}</span>

                <h3 className={styles.headline}>
                  {m.headlinePlain}{' '}
                  <em className={styles.headlineEm}>{m.headlineEm}</em>
                </h3>

                <p className={styles.body}>{m.description}</p>
                {m.detail && <p className={styles.detail}>{m.detail}</p>}
              </div>

              <span className={styles.quip}>
                <span className={styles.quipMark} aria-hidden="true">—</span>
                <em>{m.quip}</em>
              </span>

              <div className={styles.preview} aria-hidden="true">
                <div className={styles.previewMockup}>
                  <Mockup />
                </div>
                <span className={styles.previewLink}>
                  <span className={styles.previewLinkText}>See {m.name}</span>
                  <span className={styles.previewLinkArrow} aria-hidden="true">→</span>
                </span>
              </div>

              <span className={styles.tapHint} aria-hidden="true">
                <span className={styles.tapHintIcon}>👁</span> Preview
              </span>
            </Link>
          );
        })}
      </div>

      <div className={styles.ctaWrap}>
        <Link href="/features" className={styles.cta}>
          See it all in action
          <span aria-hidden="true" className={styles.ctaArrow}>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
