import { FeatureHero } from '@/components/marigold-features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold-features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold-features/FeatureCallout';
import { FeatureCta } from '@/components/marigold-features/FeatureCta';
import { MockupFrame } from '@/components/marigold-ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { CommunityMockup } from '@/components/marigold-mockups/CommunityMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — The Planning Circle',
  description:
    'Editorial, real weddings, The Confessional, The Grapevine, live AMAs. Vogue Weddings meets Reddit, minus the toxicity.',
});

function EditorialMockup() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 0,
        boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 22 }}>
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
          EDITORIAL
        </div>
        <div className="font-serif text-wine" style={{ fontSize: 22, marginBottom: 4 }}>
          stories from the studio.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            color: 'var(--mauve)',
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          long reads, short tips, vendor spotlights.
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {['All', 'Planning Tips', 'Style', 'Culture', 'Vendor Spotlights'].map((c, i) => (
            <span
              key={c}
              className="font-syne"
              style={{
                fontSize: 9,
                padding: '4px 10px',
                borderRadius: 2,
                background: i === 0 ? 'var(--wine)' : 'transparent',
                color: i === 0 ? 'white' : 'var(--wine)',
                border: i === 0 ? 'none' : '1px solid rgba(75,21,40,0.15)',
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {c}
            </span>
          ))}
        </div>

        {[
          {
            cat: 'STYLE',
            title: 'Why every Indian wedding needs a non-rose flower',
            meta: 'by Anika Sehgal · 8 min read',
          },
          {
            cat: 'CULTURE',
            title: 'A modern brides guide to the haldi ceremony',
            meta: 'by The Marigold Team · 12 min read',
          },
          {
            cat: 'VENDOR SPOTLIGHTS',
            title: 'Inside Studio Marigold\'s editorial photography',
            meta: 'by Priya Kapoor · 6 min read',
          },
        ].map((a) => (
          <div
            key={a.title}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid rgba(75,21,40,0.06)',
            }}
          >
            <div
              className="font-syne"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: 'var(--gold)',
                marginBottom: 2,
              }}
            >
              {a.cat}
            </div>
            <div
              className="font-serif"
              style={{ fontSize: 14, color: 'var(--wine)', marginBottom: 2 }}
            >
              {a.title}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mauve)' }}>{a.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealWeddingsMockup() {
  return (
    <div
      style={{
        background: 'var(--blush)',
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
        REAL WEDDINGS · FEATURED
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 14 }}>
        Couples who actually planned with us.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { c: 'var(--peach)', n: 'Anika & Vikram', l: 'Udaipur · 320 guests' },
          { c: 'var(--gold-light)', n: 'Mira & Kabir', l: 'Goa · destination' },
          { c: 'var(--mint)', n: 'Sara & Rohan', l: 'Bangalore · 180 guests' },
          { c: 'var(--lavender)', n: 'Nisha & Arjun', l: 'Jaipur · multi-day' },
        ].map((w) => (
          <div
            key={w.n}
            style={{
              background: 'white',
              borderRadius: 4,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ background: w.c, height: 56 }} />
            <div style={{ padding: 10 }}>
              <div
                className="font-serif"
                style={{ fontSize: 14, color: 'var(--wine)', marginBottom: 2 }}
              >
                {w.n}
              </div>
              <div style={{ fontSize: 10, color: 'var(--mauve)' }}>{w.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectMockup() {
  return (
    <div
      style={{
        background: 'var(--cream)',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
        border: '1.5px dashed rgba(75,21,40,0.18)',
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
        CONNECT · BRIDES NEAR YOU
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 12 }}>
        Find your wedding twins.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Rhea S.', match: 'Same venue · The Leela Palace', date: 'Nov 2026' },
          { name: 'Tanvi M.', match: 'Bangalore · 300 guests', date: 'Dec 2026' },
          { name: 'Alia D.', match: '4 events · same wardrobe palette', date: 'Jan 2027' },
        ].map((b) => (
          <div
            key={b.name}
            style={{
              background: 'white',
              padding: '10px 14px',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{ color: 'var(--wine)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}
              >
                {b.name} · <span style={{ color: 'var(--mauve)' }}>{b.date}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--mauve)' }}>{b.match}</div>
            </div>
            <span
              className="font-syne"
              style={{
                fontSize: 9,
                color: 'var(--pink)',
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              CONNECT →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfessionalMockup() {
  return (
    <div
      style={{
        background: 'var(--wine)',
        color: 'white',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 14px rgba(75,21,40,0.18)',
      }}
    >
      <div
        className="font-syne"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--hot-pink)',
          marginBottom: 6,
        }}
      >
        THE CONFESSIONAL · ANONYMOUS
      </div>
      <div className="font-serif" style={{ fontSize: 20, color: 'white', marginBottom: 14 }}>
        Vent here. <i style={{ color: 'var(--gold-light)' }}>No judgment.</i>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          {
            text: '"my mom added 47 people to the guest list at midnight without telling me"',
            tag: '#momzilla',
          },
          {
            text: '"my fiancé thinks ₹3L for the photographer is too much. it\'s our wedding."',
            tag: '#budgetwars',
          },
          {
            text: '"i love planning. like, genuinely. is that weird?"',
            tag: '#sorrynotsorry',
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.04)',
              padding: '12px 14px',
              borderRadius: 4,
              borderLeft: '3px solid var(--hot-pink)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                fontStyle: 'italic',
                marginBottom: 4,
              }}
            >
              {c.text}
            </div>
            <span
              className="font-syne"
              style={{
                fontSize: 9,
                color: 'var(--hot-pink)',
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {c.tag.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrapevineMockup() {
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
          color: 'var(--gold)',
          marginBottom: 6,
        }}
      >
        THE GRAPEVINE · TEA & RECS
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 12 }}>
        Recommendations &amp; tea.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          {
            q: 'Best tailor in Delhi for blouse work?',
            answers: 12,
            tag: 'WARDROBE',
          },
          {
            q: 'Has anyone used Photographer X? Real reviews?',
            answers: 8,
            tag: 'PHOTOGRAPHY',
          },
          {
            q: 'Florist who can do mandap on a tight timeline?',
            answers: 5,
            tag: 'DÉCOR',
          },
        ].map((g) => (
          <div
            key={g.q}
            style={{
              background: 'white',
              padding: '10px 14px',
              borderRadius: 4,
            }}
          >
            <div
              className="font-syne"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: 'var(--pink)',
                marginBottom: 3,
              }}
            >
              {g.tag}
            </div>
            <div style={{ fontSize: 13, color: 'var(--wine)', marginBottom: 4 }}>{g.q}</div>
            <div style={{ fontSize: 10, color: 'var(--mauve)' }}>
              💬 {g.answers} replies · refresh for more
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveMockup() {
  return (
    <div
      style={{
        background: 'var(--pink)',
        color: 'white',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 14px rgba(75,21,40,0.18)',
      }}
    >
      <div
        className="font-syne"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 6,
          color: 'white',
          opacity: 0.7,
        }}
      >
        ● LIVE NOW · 1,247 BRIDES
      </div>
      <div className="font-serif" style={{ fontSize: 26, color: 'white', marginBottom: 4 }}>
        Ask Marcy Blum <i style={{ color: 'var(--gold-light)' }}>anything.</i>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 14,
        }}
      >
        the planner of the planners. 30 minutes, all your questions.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          'How do you handle a difficult MOH? — Riya',
          'Real talk on destination weddings — Anjali',
          'When do you send save-the-dates? — Tanvi',
        ].map((q) => (
          <div
            key={q}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 12px',
              borderRadius: 4,
              fontSize: 12,
              color: 'white',
              fontStyle: 'italic',
            }}
          >
            {q}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          background: 'white',
          color: 'var(--pink)',
          textAlign: 'center',
          padding: 10,
          borderRadius: 4,
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        Join the AMA →
      </div>
    </div>
  );
}

export default function CommunityFeaturePage() {
  return (
    <>
      <FeatureHero
        tag="the village"
        label="THE PLANNING CIRCLE"
        title="Not a forum.<br/><em>A community.</em>"
        subtitle="Editorial, real weddings, anonymous venting, recommendations and tea, live AMAs with industry experts. Think Vogue Weddings meets Reddit, minus the toxicity."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['tr']}>
              <CommunityMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="Five rooms.<br/><em>One circle.</em>"
            body="Editorial, Real Weddings, Connect, The Confessional, The Grapevine — five distinct rooms, each with its own tone, its own purpose, its own community vibe."
            detail="Plus live events with industry experts (yes, Marcy Blum has done one). Open the Circle and you'll find something to read, someone to vent to, or someone to ask. It's the social layer your planning needs."
            scrawl="finally — a community that gets it"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.2} pin={{ color: 'pink', position: 'left' }}>
              <EditorialMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="EDITORIAL"
            title="Vogue Weddings energy.<br/><em>Better tips.</em>"
            body="Long reads, short tips, vendor spotlights. The editorial team writes about Indian weddings the way Vogue writes about fashion — beautifully, specifically, with real expertise."
            detail="Filter by category: Planning Tips, Style & Inspiration, Culture & Traditions, Vendor Spotlights. Save articles to your Studio for inspiration. Share them with your wedding party. They actually pull their weight."
            scrawl="the haldi guide alone is worth bookmarking"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1.4} tapes={['tl', 'tr']}>
              <RealWeddingsMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="REAL WEDDINGS"
            title="Couples who<br/>actually planned here."
            body="Featured weddings from couples who used The Marigold from start to finish. Their moodboards, their vendor lists, their final results. With permission, with full credit, with all the details."
            detail="Filter by location, guest count, style, or vendor — and find weddings shaped like yours. Use them as references, as benchmarks, or just as inspiration. It's social proof that's actually useful."
            scrawl="anika & vikram's udaipur wedding? insane."
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.5} pin={{ color: 'gold', position: 'right' }}>
              <ConnectMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="CONNECT"
            title="Find your<br/><em>wedding twins.</em>"
            body="Brides at the same venue. Brides on the same date. Brides with the same guest count. Brides with the same wardrobe palette. The Marigold surfaces matches and lets you DM directly."
            detail="It's not a public forum. It's not a free-for-all. It's curated parallel-planning — find someone whose wedding shape mirrors yours and trade notes, vendors, and sanity."
            scrawl="my leela palace twin literally saved my flowers"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['center']}>
              <ConfessionalMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE CONFESSIONAL"
            title="Vent here.<br/><em>Anonymous.</em>"
            body="The Confessional is for the unsaid stuff. Mom drama. Budget panic. Vendor frustrations. Fiancé fights. Post anonymously. React to others. Feel deeply seen."
            detail="Moderated by the team — but never edited. The Confessional is the safety valve every bride needs. Sometimes you don't want advice. You just want someone to read it and nod."
            scrawl="the confessional alone is worth signing up. trust us."
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={0.8} pin={{ color: 'red', position: 'left' }}>
              <GrapevineMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE GRAPEVINE"
            title="Recommendations.<br/><em>Tea.</em>"
            body="Threaded Q&A for vendor recommendations, real reviews, and the gossip that doesn't get printed. 'Best tailor in Delhi for blouse work?' — 12 brides have answered."
            detail="Tag questions by category. Vote answers up. Save vendors directly to your shortlist. The Grapevine is what happens when you put 50,000 brides in one room and let them talk."
            scrawl="tea you can actually USE"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.6} pin={{ color: 'pink', position: 'center' }}>
              <LiveMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="LIVE EVENTS"
            title="AMAs with the<br/><em>real ones.</em>"
            body="Marcy Blum has done one. So has Vandana Mohan. Live AMAs with the planners, designers, photographers, and editors actually shaping the industry — not just LinkedIn-influencer types."
            detail="30-minute drop-ins, fully open. Submit questions ahead, vote on others, watch live, replay later. The replay archive alone is worth your annual subscription."
            scrawl="marcy. blum. answered. my. question."
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="Vogue Weddings meets Reddit.<br/><em>Minus the toxicity.</em>"
        cells={[
          {
            label: 'CURATED',
            title: 'Editorial-grade',
            body: 'Real reporting, real photography, real expertise — not SEO sludge.',
          },
          {
            label: 'SAFE',
            title: 'Confessional + moderation',
            body: 'A place to vent without Reddit-level chaos.',
          },
          {
            label: 'CONNECTED',
            title: 'Wedding twins',
            body: 'Find brides shaped like you. Trade notes. Save vendors.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay take me to the circle"
        heading="Ready to join <i>the community?</i>"
        buttonLabel="Step Inside"
        secondary={{ label: 'Read the Blog', href: '/blog' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>1,247 brides currently in the marcy blum AMA. catch up.</ScrawlNote>
      </div>
    </>
  );
}
