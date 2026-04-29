import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { ScrawlNote } from '@/components/ui/ScrawlNote';
import { StickyTag } from '@/components/ui/StickyTag';
import { TornDivider } from '@/components/ui/TornDivider';
import { ShoppingBrowser } from '@/components/sections/ShoppingBrowser';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Shopping',
  description:
    'Browse curated bridal picks, peer-to-peer marketplace listings, and time-boxed exhibitions. Window-shop the edit; sign up to save, message sellers, and unlock more.',
});

function ShoppingHero() {
  return (
    <section
      className="relative px-6 md:px-10"
      style={{
        background: 'linear-gradient(180deg, var(--paper) 0%, var(--cream) 100%)',
        minHeight: '40vh',
        paddingTop: 110,
        paddingBottom: 56,
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '22%',
          left: '6%',
          opacity: 0.18,
          transform: 'rotate(-12deg)',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 74 74">
          <circle
            cx="37"
            cy="37"
            r="28"
            fill="none"
            stroke="var(--pink)"
            strokeWidth="1.4"
            strokeDasharray="4 6"
          />
        </svg>
      </span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '18%',
          right: '7%',
          opacity: 0.18,
          transform: 'rotate(18deg)',
        }}
      >
        <svg width="54" height="54" viewBox="0 0 60 60">
          <path
            d="M30 6l5 14h14l-11 9 4 15-12-9-12 9 4-15-11-9h14z"
            fill="none"
            stroke="var(--pink)"
            strokeWidth="1.2"
          />
        </svg>
      </span>

      <div
        className="relative text-center"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        <StickyTag>the edit</StickyTag>
        <div
          className="font-syne"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'var(--pink)',
            marginBottom: 12,
          }}
        >
          SHOPPING
        </div>
        <h1
          className="font-serif text-wine scrapbook-heading"
          style={{
            fontSize: 'clamp(34px, 5.4vw, 60px)',
            lineHeight: 1.04,
            fontWeight: 400,
            marginBottom: 14,
          }}
          dangerouslySetInnerHTML={{
            __html: 'Shop Like a Bride <em>Who Knows</em>',
          }}
        />
        <p
          className="font-body text-mauve"
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          Curated picks, creator collections, a marketplace for pre-loved pieces, and
          exhibitions you won't find anywhere else.
        </p>
        <div style={{ marginTop: 12 }}>
          <ScrawlNote>not a checkout. a planning superpower.</ScrawlNote>
        </div>
      </div>

      <ShoppingBrowser />
    </section>
  );
}

export default function ShoppingPage() {
  return (
    <>
      <ShoppingHero />

      <TornDivider fromColor="var(--paper)" toColor="var(--wine)" />

      <section
        className="relative overflow-hidden text-center"
        style={{
          background: 'var(--wine)',
          padding: '90px 24px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -120,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'var(--pink)',
            opacity: 0.1,
            animation: 'bob 6s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -100,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'var(--gold)',
            opacity: 0.08,
            animation: 'bob 8s ease-in-out infinite 2s',
          }}
        />

        <div className="relative" style={{ maxWidth: 760, margin: '0 auto' }}>
          <span
            className="block font-scrawl"
            style={{ color: 'var(--hot-pink)', fontSize: 22, marginBottom: 12 }}
          >
            (the shopping comes naturally)
          </span>
          <h2
            className="font-serif text-white"
            style={{
              fontSize: 'clamp(32px, 5vw, 54px)',
              lineHeight: 1.05,
              marginBottom: 30,
              fontWeight: 400,
            }}
          >
            Start shopping.<br />
            <i style={{ color: 'var(--hot-pink)' }}>
              Well — start planning first.
            </i>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <ChunkyButton variant="white" href="/pricing">
              Sign Up Free
            </ChunkyButton>
            <ChunkyButton variant="outline" href="/features">
              See All Features
            </ChunkyButton>
          </div>
          <p
            className="font-body"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              marginTop: 22,
              fontStyle: 'italic',
            }}
          >
            * the platform takes nothing on marketplace transactions. just here to introduce
            you.
          </p>
        </div>
      </section>

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <ScrawlNote>
          p.s. yes you can save the Sabyasachi at 2am. that's literally the point.
        </ScrawlNote>
      </div>
    </>
  );
}
