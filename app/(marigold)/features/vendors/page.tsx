import { FeatureHero } from '@/components/marigold-features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold-features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold-features/FeatureCallout';
import { FeatureCta } from '@/components/marigold-features/FeatureCta';
import { MockupFrame } from '@/components/marigold-ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { VendorsMockup } from '@/components/marigold-mockups/VendorsMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Vendor Hub',
  description:
    'Curated vendor picks based on your wedding, not a marketplace with 50,000 listings. Plus Vendor Roulette, badges, and rich profiles.',
});

function MatchingMockup() {
  return (
    <div
      style={{
        background: 'var(--cream)',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 10px rgba(75,21,40,0.08)',
        border: '1.5px dashed rgba(75,21,40,0.12)',
      }}
    >
      <div
        className="font-syne"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 6,
        }}
      >
        TELL US ABOUT YOUR WEDDING
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 16 }}>
        Five fields. One curated team.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'DATE', value: 'December 12, 2026' },
          { label: 'VENUE', value: 'The Leela Palace · Bengaluru' },
          { label: 'GUESTS', value: '300' },
          { label: 'BUDGET', value: '₹1.5 Cr – ₹3.6 Cr' },
          { label: 'EVENTS', value: 'Pithi · Haldi · Sangeet · Ceremony' },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              background: 'white',
              borderRadius: 4,
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            <span
              className="font-syne"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: 'var(--mauve)',
              }}
            >
              {r.label}
            </span>
            <span style={{ color: 'var(--wine)' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 14,
          background: 'var(--pink)',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          borderRadius: 4,
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        Build my vendor team →
      </div>
    </div>
  );
}

function RouletteMockup() {
  return (
    <div
      style={{
        background: 'var(--wine)',
        color: 'white',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 14px rgba(75,21,40,0.18)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="font-scrawl"
        style={{
          fontSize: 18,
          color: 'var(--gold-light)',
          marginBottom: 6,
          transform: 'rotate(-2deg)',
          display: 'inline-block',
        }}
      >
        can't decide?
      </div>
      <div
        className="font-serif"
        style={{ fontSize: 28, color: 'white', marginBottom: 4, lineHeight: 1.05 }}
      >
        Spin the <i style={{ color: 'var(--hot-pink)' }}>Roulette.</i>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
        We'll surface a fresh pick from your open categories.
      </div>

      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          margin: '0 auto',
          background:
            'conic-gradient(var(--pink) 0 14%, var(--hot-pink) 14% 28%, var(--gold) 28% 42%, var(--peach) 42% 56%, var(--lavender) 56% 70%, var(--mint) 70% 84%, var(--sky) 84% 100%)',
          border: '4px solid white',
          boxShadow: '0 0 0 3px var(--gold)',
          position: 'relative',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: 26,
            borderRadius: '50%',
            background: 'var(--wine)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-instrument-serif), serif',
            color: 'var(--hot-pink)',
            fontSize: 16,
          }}
        >
          SPIN
        </div>
      </div>

      <div
        className="font-syne"
        style={{
          marginTop: 16,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          color: 'var(--gold)',
        }}
      >
        7 OPEN CATEGORIES
      </div>
    </div>
  );
}

function ProfileMockup() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
      }}
    >
      <div
        style={{
          height: 90,
          background: 'linear-gradient(135deg, var(--blush), var(--peach))',
          borderRadius: 4,
          marginBottom: 14,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            background: 'var(--gold)',
            color: 'white',
            padding: '3px 8px',
            borderRadius: 2,
            fontFamily: 'var(--font-syne), sans-serif',
          }}
        >
          ANANYA SELECT
        </span>
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            background: 'var(--deep-pink)',
            color: 'white',
            padding: '3px 8px',
            borderRadius: 2,
            fontFamily: 'var(--font-syne), sans-serif',
          }}
        >
          TOP MATCH
        </span>
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 4 }}>
        Studio Marigold — Photography
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)', marginBottom: 12 }}>
        Mumbai · Travels everywhere · 12 destination weddings · ₹8L–₹14L
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Editorial', 'Film-grain', 'Candid', 'Multi-day'].map((c) => (
          <span
            key={c}
            className="font-syne"
            style={{
              fontSize: 9,
              padding: '3px 8px',
              border: '1px solid rgba(75,21,40,0.12)',
              borderRadius: 2,
              color: 'var(--wine)',
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--wine)',
          fontStyle: 'italic',
          padding: '8px 12px',
          background: 'var(--gold-light)',
          borderRadius: 4,
        }}
      >
        Why we matched: editorial style + Bengaluru travel + your guest count
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <>
      <FeatureHero
        tag="the matchmaker"
        label="VENDOR HUB"
        title="Curated picks.<br/><em>Not a marketplace.</em>"
        subtitle="Tell us your date, venue, guest count, budget, and events. We'll build a curated vendor team — and tell you exactly why each one is a fit."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={1} pin={{ color: 'pink', position: 'left' }}>
              <VendorsMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="Your team, <em>built for you.</em>"
            body="No 50,000-listing marketplace. No infinite scroll. Just a tight, curated team across photography, HMUA, décor, catering, entertainment, wardrobe, and stationery — picked because they actually fit your wedding."
            detail="Each card tells you the why. Travel reach, destination experience, style alignment, budget tier. Click in for the full profile, the moodboard preview, and the booking flow."
            scrawl="we vetted them so you don't have to"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={-1.2} tapes={['tl', 'tr']}>
              <MatchingMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="HOW IT WORKS"
            title="Five fields.<br/>One curated team."
            body="Date. Venue. Guests. Budget. Events. That's it. The Marigold runs that against our vetted vendor pool and surfaces a tight team — not 200 results, not 50, just the right ones."
            detail="Update any field and the team re-curates in real time. Add events later, swap venues, raise budget — your team adjusts. No re-onboarding, no starting over."
            scrawl="setup takes 90 seconds, we timed it"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={1.4} pin={{ color: 'gold', position: 'center' }}>
              <RouletteMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="VENDOR ROULETTE"
            title="Can't decide?<br/><em>Spin it.</em>"
            body="Stuck on a category? Hit Roulette and we'll surface a random vetted pick from your open categories. Sometimes the best decision is the one made for you."
            detail="It only pulls from vendors who match your date, venue, and budget — so even the random pick isn't truly random. It's curated chaos."
            scrawl="my florist? roulette pulled her. truly."
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={-0.8} tapes={['center']}>
              <div
                style={{
                  background: 'white',
                  borderRadius: 6,
                  padding: 22,
                  boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
                }}
              >
                <div
                  className="font-syne"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'var(--pink)',
                    marginBottom: 6,
                  }}
                >
                  FILTERS
                </div>
                <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
                  Narrow it your way.
                </div>
                {[
                  { label: 'TIER', chips: ['Ananya Select', 'Verified', 'Rising'] },
                  { label: 'TRAVEL', chips: ['Pan-India', 'Same-state', 'International'] },
                  {
                    label: 'CATEGORY',
                    chips: ['Photography', 'HMUA', 'Décor', 'Music', 'Catering'],
                  },
                  { label: 'ASSIGNMENT', chips: ['Unassigned', 'Mom shortlist', 'Booked'] },
                ].map((row) => (
                  <div key={row.label} style={{ marginBottom: 10 }}>
                    <div
                      className="font-syne"
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        color: 'var(--mauve)',
                        marginBottom: 4,
                      }}
                    >
                      {row.label}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {row.chips.map((c, i) => (
                        <span
                          key={c}
                          className="font-syne"
                          style={{
                            fontSize: 9,
                            padding: '3px 8px',
                            borderRadius: 2,
                            background: i === 0 ? 'var(--gold)' : 'var(--blush)',
                            color: i === 0 ? 'white' : 'var(--deep-pink)',
                            fontWeight: 600,
                            letterSpacing: 0.5,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE FILTERS"
            title="Slice it like<br/>a pro planner."
            body="Filter by tier (Ananya Select only, please), travel availability, destination experience, category, or assignment status. Save your filter as a view — your shortlist stays organized."
            detail="Want only Top Match Ananya Select photographers who travel internationally and don't already exist on your mom's list? Three taps."
            scrawl="ananya select is *the* tier btw"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1.5} pin={{ color: 'red', position: 'right' }}>
              <ProfileMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE PROFILES"
            title="Profiles that<br/><em>actually help.</em>"
            body="Every vendor profile shows their tier badge, travel reach, signature style, sample work, real reviews, and — crucially — why we matched them to you."
            detail="Top Match means your inputs aligned across every dimension. Rising Star means new to our roster but already turning heads. Ananya Select means hand-picked by our editorial team."
            scrawl="badges that actually mean something"
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="A taste-maker.<br/><em>Not a yellow-pages.</em>"
        cells={[
          {
            label: 'CURATED',
            title: 'Vetted pool',
            body: 'Every vendor is vetted by our editorial team. No paid listings.',
          },
          {
            label: 'CONTEXTUAL',
            title: 'Match logic',
            body: 'Your date, venue, budget, and events drive every recommendation.',
          },
          {
            label: 'PLAYFUL',
            title: 'Roulette',
            body: 'When you can\'t decide, spin. Curated randomness.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay match me"
        heading="Ready to meet <i>the matchmaker?</i>"
        buttonLabel="Build My Team"
        secondary={{ label: 'Browse Directory', href: '/vendors-directory' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>roulette has spun 12,847 times. just saying.</ScrawlNote>
      </div>
    </>
  );
}
