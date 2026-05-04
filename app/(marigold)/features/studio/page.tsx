import { FeatureHero } from '@/components/marigold-features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold-features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold-features/FeatureCallout';
import { FeatureCta } from '@/components/marigold-features/FeatureCta';
import { MockupFrame } from '@/components/marigold-ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold-ui/ScrawlNote';
import { StudioMockup } from '@/components/marigold-mockups/StudioMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — The Studio',
  description:
    'One brand system, every surface. Monogram, logo, palette, typography — cascading to website, invitations, print, and outfit style guide.',
});

function MonogramMockup() {
  return (
    <div
      style={{
        background: 'var(--cream)',
        borderRadius: 6,
        padding: 22,
        boxShadow: '3px 4px 12px rgba(75,21,40,0.08)',
        textAlign: 'center',
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
          marginBottom: 12,
        }}
      >
        THE SIGNATURE
      </div>

      <div
        style={{
          width: 160,
          height: 160,
          margin: '0 auto 16px',
          border: '2px solid var(--wine)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          position: 'relative',
        }}
      >
        <div
          className="font-serif"
          style={{
            fontSize: 56,
            color: 'var(--wine)',
            lineHeight: 1,
            fontStyle: 'italic',
          }}
        >
          A<span style={{ color: 'var(--pink)' }}>&</span>R
        </div>
        <div
          className="font-syne"
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: 2,
            color: 'var(--mauve)',
          }}
        >
          12 · 12 · 2026
        </div>
      </div>

      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 4 }}>
        Cascades everywhere.
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)' }}>
        Save-the-dates · Invitations · Website · Signage · Wax seals · Cake topper
      </div>
    </div>
  );
}

function LogoMockup() {
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
          marginBottom: 12,
        }}
      >
        THE WORDMARK · 3 VARIANTS
      </div>

      {[
        { font: 'var(--font-instrument-serif), serif', text: 'Ananya & Rohan', size: 26 },
        {
          font: 'var(--font-instrument-serif), serif',
          text: 'A & R',
          size: 38,
          italic: true,
        },
        {
          font: 'var(--font-syne), sans-serif',
          text: 'ANANYA · ROHAN',
          size: 14,
          letter: 4,
          weight: 700,
        },
      ].map((v, i) => (
        <div
          key={i}
          style={{
            background: i === 1 ? 'var(--blush)' : 'var(--cream)',
            borderRadius: 4,
            padding: 18,
            marginBottom: 8,
            textAlign: 'center',
            color: 'var(--wine)',
            fontFamily: v.font,
            fontSize: v.size,
            fontStyle: v.italic ? 'italic' : 'normal',
            letterSpacing: v.letter || 0,
            fontWeight: v.weight || 400,
          }}
        >
          {v.text}
        </div>
      ))}

      <div
        style={{
          fontSize: 11,
          color: 'var(--mauve)',
          fontStyle: 'italic',
          marginTop: 6,
        }}
      >
        Pick one for headers, one for signatures, one for save-the-dates.
      </div>
    </div>
  );
}

function StyleMockup() {
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
          color: 'var(--gold)',
          marginBottom: 4,
        }}
      >
        THE PALETTE & TYPE · 100% COMPLETE
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 22, marginBottom: 4 }}>
        Rajwara Rose · Editorial House
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)', marginBottom: 14 }}>
        Your brand kit, locked in
      </div>

      <div className="font-syne" style={{ fontSize: 9, fontWeight: 700, color: 'var(--mauve)', letterSpacing: 1.5, marginBottom: 6 }}>
        PALETTE
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {[
          { c: '#993556', n: 'Rajwara' },
          { c: '#D4537E', n: 'Pink' },
          { c: '#ED93B1', n: 'Hot Pink' },
          { c: '#F5E6C8', n: 'Gold Light' },
          { c: '#FFD8B8', n: 'Peach' },
          { c: '#4B1528', n: 'Wine' },
        ].map((s) => (
          <div key={s.c} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                background: s.c,
                height: 36,
                borderRadius: 3,
                marginBottom: 4,
              }}
            />
            <div
              className="font-syne"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1,
                color: 'var(--mauve)',
              }}
            >
              {s.n.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="font-syne" style={{ fontSize: 9, fontWeight: 700, color: 'var(--mauve)', letterSpacing: 1.5, marginBottom: 6 }}>
        TYPOGRAPHY
      </div>
      <div
        style={{
          background: 'var(--cream)',
          borderRadius: 4,
          padding: 14,
          marginBottom: 8,
        }}
      >
        <div className="font-serif text-wine" style={{ fontSize: 24 }}>
          Ananya &amp; Rohan
        </div>
        <div
          className="font-syne"
          style={{
            fontSize: 10,
            color: 'var(--mauve)',
            letterSpacing: 1.5,
            marginTop: 4,
          }}
        >
          INSTRUMENT SERIF · SYNE · CAVEAT
        </div>
      </div>

      <div className="font-syne" style={{ fontSize: 9, fontWeight: 700, color: 'var(--mauve)', letterSpacing: 1.5, marginBottom: 6 }}>
        MOTIFS
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['marigold sprig', 'paisley scroll', 'gold leaf'].map((m) => (
          <span
            key={m}
            className="font-body"
            style={{
              fontSize: 11,
              padding: '5px 10px',
              borderRadius: 2,
              background: 'var(--blush)',
              color: 'var(--deep-pink)',
              fontWeight: 500,
            }}
          >
            ✿ {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function SurfacesMockup() {
  return (
    <div
      style={{
        background: 'var(--peach)',
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
        FOUR SURFACES
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        Where your brand lives
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'WEBSITE', title: 'Digital welcome', detail: 'Your story · the schedule · RSVP' },
          { label: 'INVITATIONS', title: 'The Suite', detail: 'Save-the-date · main · RSVP card' },
          { label: 'PRINT & SIGNAGE', title: 'Day-of', detail: 'Welcome boards · menus · seating' },
          { label: 'OUTFIT STYLE GUIDE', title: 'Wardrobe', detail: 'Per-event looks · accessories' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'white',
              borderRadius: 4,
              padding: '12px 14px',
              fontSize: 11,
            }}
          >
            <div
              className="font-syne"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: 'var(--mauve)',
                marginBottom: 3,
              }}
            >
              {s.label}
            </div>
            <div
              className="font-serif"
              style={{ fontSize: 16, color: 'var(--wine)', marginBottom: 4 }}
            >
              {s.title}
            </div>
            <div style={{ color: 'var(--mauve)', fontSize: 10 }}>{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeepsakesMockup() {
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
          marginBottom: 4,
        }}
      >
        KEEPSAKES
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        After the wedding lives forever
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { title: 'Photo Albums', detail: 'Auto-curated. Smart-cropped. Printable.' },
          { title: 'Content Studio', detail: 'Share-ready social posts in your brand kit.' },
          { title: 'Magazine', detail: 'Editorial spread of your wedding for the press.' },
        ].map((k) => (
          <div
            key={k.title}
            style={{
              background: 'white',
              padding: '12px 14px',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                className="font-serif"
                style={{ fontSize: 16, color: 'var(--wine)', marginBottom: 2 }}
              >
                {k.title}
              </div>
              <div style={{ color: 'var(--mauve)', fontSize: 10 }}>{k.detail}</div>
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
              OPEN →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletionMockup() {
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
          color: 'var(--gold)',
          marginBottom: 6,
        }}
      >
        CREATIVE COMPLETION
      </div>
      <div className="font-serif" style={{ fontSize: 36, color: 'var(--hot-pink)', marginBottom: 16 }}>
        32%
      </div>

      {[
        { label: 'Monogram', val: 0 },
        { label: 'Wedding Logo', val: 48 },
        { label: 'Style', val: 100 },
        { label: 'Website', val: 35 },
        { label: 'Invitations', val: 41 },
        { label: 'Print & Signage', val: 0 },
      ].map((s) => (
        <div key={s.label} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              marginBottom: 3,
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</span>
            <span style={{ color: 'var(--hot-pink)' }}>{s.val}%</span>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              height: 4,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: s.val === 100 ? 'var(--gold)' : 'var(--hot-pink)',
                height: '100%',
                width: `${s.val}%`,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudioPage() {
  return (
    <>
      <FeatureHero
        tag="the art director"
        label="THE STUDIO"
        title="One brand system.<br/><em>Every surface.</em>"
        subtitle="Pick a monogram, a logo, a palette, a typography stack. Watch it cascade to your website, invitations, print, signage, and outfit style guide. Your wedding, fully designed."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={0.8} pin={{ color: 'blue', position: 'left' }}>
              <StudioMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="Six identity layers.<br/><em>One brand kit.</em>"
            body="The Studio is where your wedding becomes a brand. Six layers — Monogram, Wedding Logo, Style, Website, Invitations, Print & Signage — each with its own builder, its own preview, and its own progress bar."
            detail="Open The Studio at any point in planning and see exactly what's done, what's drafted, and what's untouched. Creative completion percentage updates as you build. Locked-in at 100%? You've got a real brand."
            scrawl="32% complete = the journey is just starting"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={-1.2} tapes={['tl', 'tr']}>
              <MonogramMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE MONOGRAM"
            title="The signature that<br/><em>cascades everywhere.</em>"
            body="Pick a monogram — your initials, date, location, or any combination. The Studio offers dozens of layouts and treatments, from classic interlocking serif to modern minimal."
            detail="Once chosen, the monogram cascades to every surface — save-the-dates, invitations, website header, signage, wax seals, even the cake topper. Update it once and watch it ripple."
            scrawl="A&R · 12·12·2026 · obsessed"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={1.4} pin={{ color: 'pink', position: 'right' }}>
              <LogoMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE WORDMARK"
            title="A logo for headers,<br/>signatures, save-the-dates."
            body="Beyond the monogram, a wedding wordmark — the type-driven logotype you'll use in horizontal contexts. Headers. Email signatures. Save-the-date envelopes. Magazine bylines."
            detail="Pick from three stylistic axes — serif vs. sans, full-name vs. initials, formal vs. playful. The Studio generates variants automatically and lets you fine-tune each one."
            scrawl="three variants, three vibes"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={-1} tapes={['center']}>
              <StyleMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="STYLE"
            title="Palette. Typography.<br/><em>Motifs.</em>"
            body="The brand kit lives here. Six-color palette with semantic names ('Rajwara,' 'Pink,' 'Wine'). Typography pair. Signature motifs — marigold sprig, paisley scroll, gold leaf — that recur across surfaces."
            detail="Once locked, the kit gets a name. 'Rajwara Rose · Editorial House.' That's how your wedding gets referenced internally — and on your magazine spread."
            scrawl="rajwara rose · editorial house · IT'S A NAME"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={0.8} tapes={['tl']}>
              <SurfacesMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE FOUR SURFACES"
            title="Website. Invitations.<br/>Print. <em>Outfit guide.</em>"
            body="The four surfaces where your brand actually lives. Each has its own builder, its own preview, its own export. All of them pulled from the same brand kit."
            detail="Website: digital welcome, schedule, RSVP. Invitations: the suite, save-the-dates, RSVP cards. Print & Signage: welcome boards, menus, seating. Outfit Style Guide: per-event looks for you and your wedding party."
            scrawl="four surfaces, one voice"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.5} pin={{ color: 'gold', position: 'left' }}>
              <KeepsakesMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="KEEPSAKES"
            title="After the wedding<br/><em>lives forever.</em>"
            body="Three keepsake surfaces that turn the wedding into a forever artifact. Photo Albums (auto-curated and printable). Content Studio (share-ready social posts in your brand kit). Magazine (editorial spread of your wedding)."
            detail="The Magazine is the showstopper — a beautifully designed editorial of your wedding, ready to send to press, share with family, or print as a coffee-table book. Other platforms give you JPGs. We give you a magazine."
            scrawl="vogue who? you have your own spread."
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.8} pin={{ color: 'red', position: 'center' }}>
              <CompletionMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="COMPLETION TRACKING"
            title="A progress bar<br/><em>per surface.</em>"
            body="The Studio tracks creative completion across every layer. Monogram done? 100%. Style done? 100%. Website at 35%? You'll see it. Invitations at 41%? Same."
            detail="One overall percentage at the top tells you how 'finished' your brand is. Useful when you're three months out and need to know what's still drafty."
            scrawl="100% on style? showoff."
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="A wedding brand,<br/><em>not a font on a template.</em>"
        cells={[
          {
            label: 'CASCADING',
            title: 'One source, many surfaces',
            body: 'Update the monogram once — every surface follows.',
          },
          {
            label: 'STRUCTURED',
            title: 'Six layers',
            body: 'Monogram, Logo, Style, Website, Invitations, Print — built sequentially.',
          },
          {
            label: 'LASTING',
            title: 'Keepsakes',
            body: 'Photo albums, content studio, magazine — designed for after.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay i want a magazine spread"
        heading="Ready to open <i>the studio?</i>"
        buttonLabel="Build My Brand"
        secondary={{ label: 'See All Features', href: '/features' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>side effect: you'll start judging other people's wedding monograms</ScrawlNote>
      </div>
    </>
  );
}
