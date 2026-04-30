import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { StickyTag } from '@/components/marigold-ui/StickyTag';
import { TornDivider } from '@/components/marigold-ui/TornDivider';
import { ChunkyButton } from '@/components/marigold-ui/ChunkyButton';
import { PlanningCircleBrowser } from '@/components/marigold-sections/PlanningCircleBrowser';
import { LIVE_EVENT } from '@/lib/marigold/editorial';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — The Planning Circle',
  description:
    'The Planning Circle: editorial stories, real weddings, and the digital magazine from The Marigold. Planning tips, vendor spotlights, culture deep-dives, and the unfiltered side of the wedding-planning world.',
});

function PlanningCircleHero() {
  return (
    <section
      className="relative px-6 md:px-10"
      style={{
        background: 'var(--cream)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
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
          top: '24%',
          left: '7%',
          opacity: 0.16,
          transform: 'rotate(-14deg)',
        }}
      >
        <svg width="58" height="58" viewBox="0 0 60 60">
          <path
            d="M30 8c4 6 8 8 14 8-6 4-8 8-8 14-4-6-8-8-14-8 6-4 8-8 8-14z"
            fill="none"
            stroke="var(--pink)"
            strokeWidth="1.2"
          />
        </svg>
      </span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          right: '8%',
          opacity: 0.18,
          transform: 'rotate(20deg)',
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
            strokeDasharray="3 7"
          />
        </svg>
      </span>

      <div
        className="relative text-center"
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        <StickyTag>the edit</StickyTag>
        <ScrawlNote className="block" >
          stories from the studio — and the brides figuring it out alongside you
        </ScrawlNote>
        <h1
          className="font-serif text-wine scrapbook-heading"
          style={{
            fontSize: 'clamp(48px, 7vw, 72px)',
            lineHeight: 1.02,
            fontWeight: 400,
            marginTop: 18,
            marginBottom: 16,
            textTransform: 'lowercase',
          }}
          dangerouslySetInnerHTML={{
            __html: 'the planning <em style="color: var(--pink);">circle.</em>',
          }}
        />
        <p
          className="font-body text-mauve"
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          The editorial side of The Marigold. Planning tips, real weddings, vendor
          spotlights, culture deep-dives, and the magazine you'll actually want to
          read.
        </p>

        {LIVE_EVENT.active && (
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
            <a
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--hot-pink)',
                color: 'var(--wine)',
                padding: '12px 22px 12px 18px',
                borderRadius: 999,
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                boxShadow: '3px 4px 0 var(--wine)',
                textDecoration: 'none',
                transform: 'rotate(-1deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#E63946',
                    animation: 'pulse 1.4s ease-in-out infinite',
                    boxShadow: '0 0 0 4px rgba(230, 57, 70, 0.18)',
                  }}
                />
                LIVE NOW
              </span>
              <span
                aria-hidden="true"
                style={{
                  width: 1,
                  height: 18,
                  background: 'rgba(75, 21, 40, 0.4)',
                }}
              />
              <span style={{ letterSpacing: 0.4, fontWeight: 700, textTransform: 'none', fontSize: 13 }}>
                {LIVE_EVENT.topic} →
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BlogPage() {
  return (
    <>
      <PlanningCircleHero />
      <PlanningCircleBrowser />

      <TornDivider fromColor="var(--cream)" toColor="var(--wine)" />

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
            (the rest of the magazine lives inside)
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
            Read the ones we publish.<br />
            <i style={{ color: 'var(--hot-pink)' }}>
              Then live the one you're planning.
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
            * the editorial is free. the workspace, checklist, and studio are where
            it gets fun.
          </p>
        </div>
      </section>
    </>
  );
}
