import { FeatureHero } from '@/components/marigold-features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold-features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold-features/FeatureCallout';
import { FeatureCta } from '@/components/marigold-features/FeatureCta';
import { MockupFrame } from '@/components/marigold-ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { WorkspacesMockup } from '@/components/mockups/WorkspacesMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Vendor Workspaces',
  description:
    'Vibe quizzes, style keywords, moodboards, and The Brief — discover your style before you ever talk to a vendor.',
});

const workspaces = [
  'Photography',
  'Décor & Florals',
  'Catering',
  'Music & Entertainment',
  'Hair & Makeup',
  'Mehendi',
  'Videography',
  'Venue',
  'Priest / Pandit',
  'Stationery',
  'Cake & Sweets',
  'Wardrobe',
  'Jewelry',
  'Guest Experiences',
];

function QuizMockup() {
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
        VIBE QUIZ · QUESTION 3 OF 5
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 22, marginBottom: 14 }}>
        How do you want your photos to feel?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'A.', text: 'Cinematic, slow, golden-hour drenched.', selected: true },
          { label: 'B.', text: 'Editorial, structured, magazine-worthy.', selected: false },
          { label: 'C.', text: 'Documentary, candid, blink-and-you\'ll-miss-it.', selected: false },
          { label: 'D.', text: 'Painterly, moody, a little melancholy.', selected: false },
        ].map((opt) => (
          <div
            key={opt.label}
            style={{
              padding: '10px 14px',
              background: opt.selected ? 'var(--pink)' : 'white',
              color: opt.selected ? 'white' : 'var(--wine)',
              borderRadius: 4,
              fontSize: 13,
              display: 'flex',
              gap: 10,
              fontWeight: opt.selected ? 600 : 400,
            }}
          >
            <span style={{ opacity: 0.7 }}>{opt.label}</span>
            <span>{opt.text}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: 'var(--mauve)',
          fontStyle: 'italic',
        }}
      >
        ✨ We'll turn your answers into a brief, keywords, and a colour palette
      </div>
    </div>
  );
}

function ToneSliderMockup() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
      }}
    >
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 6 }}>
        Colour &amp; tone
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)', marginBottom: 16 }}>
        Slide to re-grade the same frame in real time.
      </div>

      <div
        style={{
          height: 120,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #c9a07a, #e8c8a8 40%, #d4a890 70%, #8a5e4a)',
          marginBottom: 12,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'white',
            background: 'rgba(0,0,0,0.25)',
            padding: '3px 8px',
            borderRadius: 2,
            fontFamily: 'var(--font-syne), sans-serif',
          }}
        >
          SOFTLY EDITORIAL · 55
        </span>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: 'linear-gradient(90deg, #d4a890, #e8d5c4, #c8dff5)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: '55%',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'white',
            border: '3px solid var(--pink)',
            transform: 'translateX(-50%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: 'var(--mauve)',
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginTop: 6,
        }}
      >
        <span>WARM FILM</span>
        <span>NEUTRAL</span>
        <span>COOL EDITORIAL</span>
      </div>
    </div>
  );
}

function MoodboardMockup() {
  const tiles = [
    { color: 'var(--blush)', tall: false },
    { color: 'var(--peach)', tall: true },
    { color: 'var(--gold-light)', tall: false },
    { color: 'var(--lavender)', tall: false },
    { color: 'var(--mint)', tall: true },
    { color: 'var(--sky)', tall: false },
  ];

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 20,
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
          marginBottom: 4,
        }}
      >
        MOODBOARD → REFERENCES → BRIEF
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 14 }}>
        Pin → react → generate.
      </div>
      <div
        style={{
          columnCount: 3,
          columnGap: 6,
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            style={{
              height: t.tall ? 96 : 60,
              background: t.color,
              borderRadius: 4,
              marginBottom: 6,
              breakInside: 'avoid',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                fontSize: 9,
                background: 'white',
                color: i % 2 ? 'var(--pink)' : 'var(--wine)',
                padding: '2px 6px',
                borderRadius: 10,
                fontWeight: 600,
                fontFamily: 'var(--font-syne), sans-serif',
                letterSpacing: 0.5,
              }}
            >
              {i % 2 ? '♥ love' : '✕ not for us'}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          background: 'var(--gold-light)',
          padding: '10px 12px',
          borderRadius: 4,
          fontSize: 12,
          color: 'var(--wine)',
          fontStyle: 'italic',
        }}
      >
        ✨ Your brief now reads: "warm but never saccharine, candid + intentional, golden-hour priority"
      </div>
    </div>
  );
}

function CrossWorkspaceMockup() {
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
          color: 'var(--pink)',
          marginBottom: 6,
        }}
      >
        ONE PALETTE · EVERY WORKSPACE
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        Décor → Stationery → Wardrobe → Cake.
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['#993556', '#D4537E', '#ED93B1', '#F5E6C8', '#FFD8B8', '#4B1528'].map((c) => (
          <div
            key={c}
            style={{
              flex: 1,
              height: 40,
              background: c,
              borderRadius: 3,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'DÉCOR', value: 'Rajwara rose · velvet · marigold' },
          { label: 'STATIONERY', value: 'Same palette · serif foil' },
          { label: 'WARDROBE', value: 'Cooler tones for sangeet, deep wine for ceremony' },
          { label: 'CAKE', value: 'Pink ombre, gold leaf' },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              fontSize: 11,
              padding: '6px 10px',
              background: 'white',
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
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
    </div>
  );
}

export default function WorkspacesPage() {
  return (
    <>
      <FeatureHero
        tag="the heart"
        label="VENDOR WORKSPACES"
        title="Discover your style <em>before</em><br/>you talk to a vendor."
        subtitle="14 dedicated workspaces. A vibe quiz, style keywords, moodboards, references, and The Brief — the document your vendor reads first."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.6} tapes={['center']}>
              <WorkspacesMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="A workspace per<br/><em>vendor category.</em>"
            body="Photography, Décor & Florals, Catering, Music — every vendor type you'll hire has its own dedicated space inside The Marigold. Not a shared notes doc. A real, structured workspace."
            detail="Each one follows the same arc: take a vibe quiz → tap style keywords → build a moodboard → react to references → generate The Brief. By the time you meet a vendor, you already know what you want."
            scrawl="every workspace knows your taste"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1} pin={{ color: 'pink', position: 'right' }}>
              <QuizMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE VIBE QUIZ"
            title="Five fun questions.<br/>One sharp brief."
            body="The vibe quiz takes 90 seconds. By the end, The Marigold has auto-drafted your brief, surfaced relevant style keywords, and built a starter colour palette."
            detail="The questions are weirdly good. 'Pick a movie, not a wedding.' 'Choose a song from your sangeet playlist.' 'Pick a flower that isn't a rose.' Your answers shape every decision downstream."
            scrawl="more buzzfeed than survey, deliberately"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['tl']}>
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
                  STYLE KEYWORDS · DÉCOR
                </div>
                <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
                  Tap to add. Tap to remove.
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {[
                    { w: 'rajwara', on: true },
                    { w: 'velvet', on: true },
                    { w: 'marigold', on: true },
                    { w: 'minimalist', on: false },
                    { w: 'tropical', on: false },
                    { w: 'celestial', on: true },
                    { w: 'baroque', on: false },
                    { w: 'pastel', on: false },
                    { w: 'monochrome', on: false },
                    { w: 'gold-heavy', on: true },
                  ].map((k) => (
                    <span
                      key={k.w}
                      className="font-body"
                      style={{
                        fontSize: 11,
                        padding: '5px 12px',
                        borderRadius: 2,
                        background: k.on ? 'var(--pink)' : 'transparent',
                        color: k.on ? 'white' : 'var(--wine)',
                        border: k.on ? 'none' : '1px solid rgba(75,21,40,0.15)',
                        fontWeight: 500,
                      }}
                    >
                      {k.on ? '+ ' : ''}
                      {k.w}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    background: 'var(--gold-light)',
                    padding: 10,
                    borderRadius: 4,
                    fontSize: 12,
                    color: 'var(--wine)',
                    fontStyle: 'italic',
                  }}
                >
                  Auto-tagged on your moodboard pins
                </div>
              </div>
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="STYLE KEYWORDS"
            title="Tappable chips,<br/><em>per workspace.</em>"
            body="Each workspace has its own keyword library — tuned to that vendor type. Décor has 'rajwara,' 'minimalist,' 'tropical.' HMUA has 'soft glam,' 'editorial,' 'no-makeup makeup.' You tap what feels right."
            detail="Keywords carry into The Brief and into your moodboard. They also help us match better — the more keywords you tap, the sharper our vendor recommendations get."
            scrawl="rajwara + celestial = unhinged in the best way"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.4} pin={{ color: 'gold', position: 'left' }}>
              <ToneSliderMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="COLOUR & TONE"
            title="A slider, not<br/>a swatchbook."
            body="The Photography workspace's signature feature: a real-time colour & tone slider. Move it from warm-film to cool-editorial and watch the same reference photo re-grade in real time."
            detail="Pin the position you love and your photographer gets that exact value in The Brief. No more 'I want it warm but not too warm but also editorial.' Just a number on a slider."
            scrawl="55 = softly editorial. it's a vibe."
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1.2} tapes={['tr']}>
              <MoodboardMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE PIPELINE"
            title="Moodboard → References<br/>→ <em>The Brief.</em>"
            body="Pin images to your moodboard. React to vendor references with 'love' or 'not for us.' The Marigold reads your reactions and writes The Brief — a single document your vendor reads first."
            detail="The Brief includes your style keywords, palette, references with reasoning ('we love this for the silhouette, not the lighting'), and the must-haves and never-evers. It's the single source of truth."
            scrawl="the brief has actually saved marriages"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={0.8} pin={{ color: 'red', position: 'center' }}>
              <CrossWorkspaceMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="CROSS-WORKSPACE FLOW"
            title="Your décor palette<br/><em>flows everywhere.</em>"
            body="Pick a palette in Décor and watch it appear in Stationery (envelope liners), Wardrobe (sangeet outfit accents), Cake & Sweets (frosting tones), and even Mehendi (henna stain warmth)."
            detail="Change the palette in Décor and it ripples downstream — with your approval. No more invitation suites that don't match the mandap. No more wardrobe that fights the floor plan."
            scrawl="aesthetic continuity, automated"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.5} tapes={['tl', 'tr']}>
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
                  ALL 14 WORKSPACES
                </div>
                <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
                  Every vendor, every space.
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                  }}
                >
                  {workspaces.map((w) => (
                    <div
                      key={w}
                      style={{
                        background: 'white',
                        padding: '6px 10px',
                        borderRadius: 3,
                        fontSize: 11,
                        color: 'var(--wine)',
                      }}
                    >
                      <span style={{ color: 'var(--pink)', marginRight: 6 }}>·</span>
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE FULL ROSTER"
            title="14 workspaces.<br/>One brand voice."
            body="Photography. Décor & Florals. Catering. Music & Entertainment. Hair & Makeup. Mehendi. Videography. Venue. Priest / Pandit. Stationery. Cake & Sweets. Wardrobe. Jewelry. Guest Experiences."
            detail="Each one structured the same way. Each one speaking to each other. Each one feeding into your unified brand kit and The Brief. It's a cathedral, not a coat closet."
            scrawl="yes, even the priest gets a workspace"
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="Not a vendor portal.<br/><em>A studio for your taste.</em>"
        cells={[
          {
            label: 'STRUCTURED',
            title: 'Same arc, every space',
            body: 'Quiz → keywords → moodboard → references → brief. Repeatable, clear.',
          },
          {
            label: 'CONNECTED',
            title: 'Cross-pollination',
            body: 'Palette and keywords ripple across every workspace.',
          },
          {
            label: 'OUTPUT-FOCUSED',
            title: 'The Brief',
            body: 'A real document your vendor reads — not a vibes-only Pinterest board.',
          },
        ]}
      />

      <FeatureCta
        scrawl="let's discover your vibe"
        heading="Ready to step <i>inside?</i>"
        buttonLabel="Open a Workspace"
        secondary={{ label: 'See All Features', href: '/features' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>your vendor will say "this is the best brief I've ever read" — guaranteed*</ScrawlNote>
      </div>
    </>
  );
}
