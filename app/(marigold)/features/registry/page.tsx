import { FeatureHero } from '@/components/marigold-features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold-features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold-features/FeatureCallout';
import { FeatureCta } from '@/components/marigold-features/FeatureCta';
import { MockupFrame } from '@/components/marigold-ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { RegistryMockup } from '@/components/mockups/RegistryMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Registry & Gifts',
  description:
    'Honeymoon fund, shagun pool, thank-you tracker. Public registry page, top contributors, recent activity feed.',
});

function PublicPageMockup() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 0,
        boxShadow: '3px 4px 14px rgba(75,21,40,0.1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: 'var(--wine)',
          color: 'rgba(255,255,255,0.6)',
          padding: '8px 16px',
          fontSize: 11,
          display: 'flex',
          gap: 8,
          fontFamily: 'var(--font-syne), sans-serif',
        }}
      >
        <span style={{ color: 'var(--hot-pink)' }}>●</span>
        <span style={{ color: 'var(--hot-pink)', letterSpacing: 1 }}>ananya.wed/ananya-and-rohan</span>
      </div>
      <div
        style={{
          padding: 22,
          background:
            'linear-gradient(135deg, var(--blush) 0%, var(--cream) 50%, var(--gold-light) 100%)',
        }}
      >
        <div
          className="font-scrawl"
          style={{
            fontSize: 18,
            color: 'var(--pink)',
            transform: 'rotate(-2deg)',
            display: 'inline-block',
            marginBottom: 4,
          }}
        >
          our wedding wishlist ✿
        </div>
        <div className="font-serif text-wine" style={{ fontSize: 28, lineHeight: 1.05 }}>
          Ananya &amp; Rohan
        </div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            color: 'var(--mauve)',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          December 12, 2026 · Bengaluru
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Honeymoon', 'Shagun', 'Registry', 'Charitable'].map((c, i) => (
            <span
              key={c}
              className="font-syne"
              style={{
                fontSize: 9,
                padding: '4px 10px',
                background: i === 0 ? 'var(--pink)' : 'white',
                color: i === 0 ? 'white' : 'var(--wine)',
                borderRadius: 2,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {c.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HoneymoonMockup() {
  return (
    <div
      style={{
        background: 'var(--mint)',
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
          color: 'var(--gold)',
          marginBottom: 4,
        }}
      >
        HONEYMOON FUND · KYOTO
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 26, marginBottom: 4 }}>
        $3,300 <span style={{ fontSize: 14, color: 'var(--mauve)' }}>/ $12,000</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--wine)', opacity: 0.7, marginBottom: 12 }}>
        28% funded · $8,700 to go · 31 contributors
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.4)',
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: 'var(--gold)',
            height: '100%',
            width: '28%',
            borderRadius: 6,
          }}
        />
      </div>

      <div className="font-serif text-wine" style={{ fontSize: 14, marginBottom: 6 }}>
        What we're funding
      </div>
      {[
        { item: '4 nights at a ryokan in Kyoto', amt: '$2,400' },
        { item: 'Tasting menu in Tokyo', amt: '$600' },
        { item: 'A cooking class in Osaka', amt: '$300' },
      ].map((r) => (
        <div
          key={r.item}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '5px 0',
            fontSize: 12,
            color: 'var(--wine)',
            borderBottom: '1px dashed rgba(75,21,40,0.1)',
          }}
        >
          <span>{r.item}</span>
          <span>{r.amt}</span>
        </div>
      ))}
    </div>
  );
}

function ShagunMockup() {
  return (
    <div
      style={{
        background: 'var(--gold-light)',
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
          color: 'var(--deep-pink)',
          marginBottom: 4,
        }}
      >
        SHAGUN POOL
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 28, marginBottom: 12 }}>
        $1,854 received
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'Ravi Chacha', amt: '$501', side: 'Groom' },
          { name: 'Anjali Aunty', amt: '$251', side: 'Bride' },
          { name: 'Vikram & Family', amt: '$351', side: 'Bride' },
          { name: 'Mehta Couple', amt: '$251', side: 'Mutual' },
          { name: 'Bajwa Family', amt: '$500', side: 'Groom' },
        ].map((r) => (
          <div
            key={r.name}
            style={{
              background: 'white',
              padding: '8px 12px',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            <div>
              <div style={{ color: 'var(--wine)', fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: 'var(--mauve)', fontSize: 10 }}>{r.side} side</div>
            </div>
            <span
              className="font-serif"
              style={{ color: 'var(--pink)', fontSize: 16 }}
            >
              {r.amt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThankYouMockup() {
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
        THANK-YOU TRACKER
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 12 }}>
        47 sent · 18 pending
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div
          style={{
            flex: 1,
            background: 'var(--mint)',
            borderRadius: 4,
            padding: '10px 12px',
            fontSize: 11,
          }}
        >
          <div style={{ fontWeight: 700, color: '#2a8055', fontSize: 18 }}>47</div>
          <div style={{ color: 'var(--wine)' }}>Sent</div>
        </div>
        <div
          style={{
            flex: 1,
            background: 'var(--peach)',
            borderRadius: 4,
            padding: '10px 12px',
            fontSize: 11,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--deep-pink)', fontSize: 18 }}>18</div>
          <div style={{ color: 'var(--wine)' }}>Pending</div>
        </div>
        <div
          style={{
            flex: 1,
            background: 'var(--blush)',
            borderRadius: 4,
            padding: '10px 12px',
            fontSize: 11,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 18 }}>3</div>
          <div style={{ color: 'var(--wine)' }}>Drafted</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'Anjali & Dev', gift: '10 trees ($170)', status: 'sent' },
          { name: 'Sharma family', gift: 'Le Creuset set', status: 'pending' },
          { name: 'Ravi Chacha', gift: 'Shagun $501', status: 'drafted' },
        ].map((r) => (
          <div
            key={r.name}
            style={{
              fontSize: 11,
              padding: '6px 10px',
              background: 'var(--cream)',
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--wine)' }}>
              {r.name} · <span style={{ color: 'var(--mauve)' }}>{r.gift}</span>
            </span>
            <span
              className="font-syne"
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                color:
                  r.status === 'sent'
                    ? '#2a8055'
                    : r.status === 'pending'
                    ? 'var(--deep-pink)'
                    : 'var(--pink)',
                textTransform: 'uppercase',
              }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityMockup() {
  return (
    <div
      style={{
        background: 'var(--lavender)',
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
          color: 'var(--deep-pink)',
          marginBottom: 6,
        }}
      >
        TOP CONTRIBUTORS · LIVE
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        Aunty IS keeping score
      </div>
      {[
        { rank: '01', name: 'Anjali & Dev', amt: '$1,700', side: 'Bride side' },
        { rank: '02', name: 'Ravi Chacha', amt: '$1,600', side: 'Groom side' },
        { rank: '03', name: 'The Mehtas', amt: '$1,251', side: 'Mutual' },
        { rank: '04', name: 'Bajwa family', amt: '$1,000', side: 'Groom side' },
      ].map((r) => (
        <div
          key={r.rank}
          style={{
            background: 'white',
            padding: '10px 14px',
            borderRadius: 4,
            marginBottom: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <span
              className="font-serif"
              style={{ color: 'var(--gold)', fontSize: 16, fontWeight: 400 }}
            >
              {r.rank}
            </span>
            <div>
              <div style={{ color: 'var(--wine)', fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: 'var(--mauve)', fontSize: 10 }}>{r.side}</div>
            </div>
          </div>
          <span
            className="font-serif"
            style={{ color: 'var(--pink)', fontSize: 18 }}
          >
            {r.amt}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegistryPage() {
  return (
    <>
      <FeatureHero
        tag="the vault"
        label="REGISTRY & GIFTS"
        title="Honeymoon fund. Shagun pool.<br/><em>Thank-you tracker.</em>"
        subtitle="A registry that makes sense for Indian weddings. Cash pools, charitable giving, public registry pages, contributor leaderboards, and a thank-you tracker so nobody gets ghosted."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={-1.5} tapes={['tl']}>
              <RegistryMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="One dashboard.<br/><em>Every gift counted.</em>"
            body="Total received vs. registry value. Honeymoon fund progress. Shagun pool running total. Charitable giving subtotal. Top contributors leaderboard. It's all on one screen."
            detail="Every gift gets logged the moment it lands — whether it's a Le Creuset off the registry, $501 of shagun, or 10 trees planted in your name. The dashboard updates live."
            scrawl="$8,724 by week three? you have generous people."
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.2} pin={{ color: 'pink', position: 'center' }}>
              <PublicPageMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="PUBLIC REGISTRY"
            title="Your page,<br/>your URL."
            body="Your registry lives at ananya.wed/your-couple-name — a beautiful, branded public page guests can visit, browse, and contribute through. No more 'here's the Amazon link, here's the Honeyfund link, here's the Venmo handle.'"
            detail="The page pulls your monogram, palette, and typography from The Studio — so it actually looks like your wedding. Guests see your story, your fund tabs, and a one-tap contribution flow."
            scrawl="ananya.wed/ananya-and-rohan ←"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['tr']}>
              <HoneymoonMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="HONEYMOON FUND"
            title="Funding a memory,<br/><em>not a toaster.</em>"
            body="Set a honeymoon goal — total amount, location, what you're funding. Guests can contribute in any amount, see the progress bar climb, and pick what they're funding ('I got you the ryokan night')."
            detail="Update the destination after the wedding and the page becomes a 'where we went' diary. Photos, stories, gratitude — sent automatically to the contributors who funded each piece."
            scrawl="kyoto + 31 contributors = goals"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.5} pin={{ color: 'gold', position: 'left' }}>
              <ShagunMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="SHAGUN POOL"
            title="The cash tradition.<br/>Beautifully tracked."
            body="Shagun is a thing. Cash gifts are a thing. Pretending they're not is exhausting. The Marigold has a dedicated shagun pool with running totals, contributor names, and side-of-family tagging."
            detail="Every contribution gets logged with a name, amount, side, and optional note. Filter by side to settle 'who gave what' debates. Export the whole list as a PDF when aunty inevitably asks."
            scrawl="ravi chacha came in HOT this year"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.8} tapes={['center']}>
              <ThankYouMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THANK-YOU TRACKER"
            title="Sent. Pending.<br/><em>Drafted.</em>"
            body="Every gift gets a thank-you status: sent, drafted, or pending. Filter by pending to see who's still waiting. Use The Marigold's templated message starters or write your own."
            detail="Tag thank-you's by mode (handwritten, email, in-person) and by recipient relationship — so you don't accidentally send your boss the same wording you sent your nani."
            scrawl="18 pending? you have a busy weekend."
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1} pin={{ color: 'red', position: 'right' }}>
              <ActivityMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="LEADERBOARD & FEED"
            title="Top contributors.<br/><em>Recent activity.</em>"
            body="The top contributors leaderboard updates live. Recent activity shows the last 10 gifts as they come in — name, amount, side, gift type. It's a feed, but make it gracious."
            detail="Filter the leaderboard by side to settle the 'whose family was more generous' debate (we don't recommend this, but it's there). Export everything as a PDF for record-keeping."
            scrawl="aunty WILL screenshot this."
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="Built for <em>Indian weddings</em>,<br/>not American showers."
        cells={[
          {
            label: 'CASH-NATIVE',
            title: 'Shagun pool',
            body: 'Tracks cash gifts the way they actually happen — by name, side, and amount.',
          },
          {
            label: 'EXPERIENCE-FIRST',
            title: 'Honeymoon fund',
            body: 'Specific goals (ryokan night, tasting menu) — not just a generic pool.',
          },
          {
            label: 'CLOSED-LOOP',
            title: 'Thank-you tracker',
            body: 'Nobody gets ghosted. Aunty gets a card.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay open the vault"
        heading="Ready to track <i>every gift?</i>"
        buttonLabel="Build My Registry"
        secondary={{ label: 'See All Features', href: '/features' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>"10 trees. one per semester we survived together." — actual gift note</ScrawlNote>
      </div>
    </>
  );
}
