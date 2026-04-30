import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { ScrawlNote } from '@/components/ui/ScrawlNote';
import { StickyTag } from '@/components/ui/StickyTag';
import { TornDivider } from '@/components/ui/TornDivider';
import { VendorBrowser } from '@/components/sections/VendorBrowser';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Vendors Directory',
  description:
    'Browse hand-picked South Asian wedding vendors — photographers, decorators, HMUAs, caterers, and more. Window-shop the directory; sign up to dig deeper.',
});

function VendorsHero() {
  return (
    <section
      className="relative px-6 md:px-10"
      style={{
        background:
          'linear-gradient(180deg, var(--paper) 0%, var(--cream) 100%)',
        minHeight: '50vh',
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
        <StickyTag>the matchmaker</StickyTag>
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
          VENDORS DIRECTORY
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
            __html: 'Your Dream Team, <em>Curated</em>',
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
          Not a marketplace. Not a directory with 50,000 listings. A hand-picked
          team built around YOUR wedding.
        </p>
        <div style={{ marginTop: 12 }}>
          <ScrawlNote>we vetted them so you don't have to</ScrawlNote>
        </div>

        <VendorBrowser />
      </div>
    </section>
  );
}

export default function VendorsDirectoryPage() {
  return (
    <>
      <VendorsHero />

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
            (90 seconds, then your team is built)
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
            See who we'd recommend<br />
            <i style={{ color: 'var(--hot-pink)' }}>for YOUR wedding.</i>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <ChunkyButton variant="white" href="/pricing">
              Sign Up Free
            </ChunkyButton>
            <ChunkyButton variant="outline" href="/features/vendors">
              How Matching Works
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
            * no paid listings, no sponsored placement, no 50,000 results.
          </p>
        </div>
      </section>
    </>
  );
}
