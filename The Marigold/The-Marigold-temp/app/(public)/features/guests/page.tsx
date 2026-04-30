import { Fragment } from 'react';
import { FeatureHero } from '@/components/features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/features/FeatureStrip';
import { FeatureCallout } from '@/components/features/FeatureCallout';
import { FeatureCta } from '@/components/features/FeatureCta';
import { MockupFrame } from '@/components/ui/MockupFrame';
import { ScrawlNote } from '@/components/ui/ScrawlNote';
import { GuestsMockup } from '@/components/mockups/GuestsMockup';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Guest Management',
  description:
    'Per-event RSVPs. Bride side, groom side. AI suggestions. Family grouping, dietary needs, CSV import.',
});

function PerEventMockup() {
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
        SHARMA FAMILY · 4 GUESTS
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 14 }}>
        Per-event tracking
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          fontSize: 10,
          textAlign: 'center',
        }}
      >
        <div></div>
        {['Pithi', 'Haldi', 'Sangeet', 'Ceremony'].map((e) => (
          <div
            key={e}
            className="font-syne"
            style={{
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1,
              color: 'var(--mauve)',
              padding: 6,
            }}
          >
            {e.toUpperCase()}
          </div>
        ))}
        {[
          { name: 'Mr. Sharma', cells: ['✓', '✓', '✓', '✓'] },
          { name: 'Mrs. Sharma', cells: ['✓', '✓', '–', '✓'] },
          { name: 'Aarav', cells: ['–', '✓', '✓', '✓'] },
          { name: 'Diya', cells: ['–', '✓', '✓', '✓'] },
        ].map((row) => (
          <Fragment key={row.name}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--wine)',
                padding: 6,
                textAlign: 'left',
                whiteSpace: 'nowrap',
              }}
            >
              {row.name}
            </div>
            {row.cells.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: 6,
                  background: c === '✓' ? 'var(--mint)' : 'var(--blush)',
                  color: c === '✓' ? '#2a8055' : 'var(--mauve)',
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                {c}
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 11,
          color: 'var(--mauve)',
          fontStyle: 'italic',
        }}
      >
        Status: <span style={{ color: 'var(--pink)', fontWeight: 600 }}>Partial · 14/16</span>
      </div>
    </div>
  );
}

function ImportMockup() {
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
        VIEWS &amp; IMPORT
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        List, grid, search, CSV.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'List', active: true },
          { label: 'Grid', active: false },
          { label: 'Family tree', active: false },
        ].map((t) => (
          <span
            key={t.label}
            className="font-syne"
            style={{
              fontSize: 9,
              padding: '4px 10px',
              borderRadius: 2,
              background: t.active ? 'var(--wine)' : 'transparent',
              color: t.active ? 'white' : 'var(--mauve)',
              border: t.active ? 'none' : '1px solid rgba(75,21,40,0.15)',
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          padding: '8px 12px',
          background: 'white',
          borderRadius: 4,
          marginBottom: 10,
          fontSize: 12,
          color: 'var(--mauve)',
        }}
      >
        <span style={{ color: 'var(--pink)' }}>⌕</span>
        <span>Search by name, family, city, or relation…</span>
      </div>

      <div
        style={{
          background: 'var(--gold-light)',
          padding: 12,
          borderRadius: 4,
          fontSize: 12,
          color: 'var(--wine)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontStyle: 'italic' }}>Import_guest_list_v3.csv · 87 rows</span>
        <span
          className="font-syne"
          style={{
            fontSize: 9,
            color: 'var(--pink)',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          UPLOAD →
        </span>
      </div>
    </div>
  );
}

function FamilyMockup() {
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
        AGARWAL FAMILY · GROUP
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 20, marginBottom: 14 }}>
        Family-aware tracking
      </div>

      <div
        style={{
          background: 'white',
          padding: 14,
          borderRadius: 4,
          marginBottom: 12,
          fontSize: 12,
          color: 'var(--wine)',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong>Mr. Pankaj Agarwal</strong> · Head of household
        </div>
        <div style={{ paddingLeft: 14, color: 'var(--mauve)', fontSize: 11 }}>
          ↳ Mrs. Agarwal · spouse
          <br />↳ Riya · daughter, vegetarian
          <br />↳ Aman · son, peanut allergy
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { label: 'VEG', count: 2 },
          { label: 'NON-VEG', count: 2 },
          { label: 'PEANUT-FREE', count: 1 },
          { label: 'BRIDE SIDE', count: 4 },
        ].map((c) => (
          <span
            key={c.label}
            className="font-syne"
            style={{
              fontSize: 9,
              padding: '4px 10px',
              background: 'var(--wine)',
              color: 'white',
              borderRadius: 2,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {c.label} · {c.count}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GuestsPage() {
  return (
    <>
      <FeatureHero
        tag="the diplomat"
        label="GUEST MANAGEMENT"
        title="Bride side. Groom side.<br/><em>Nobody forgotten.</em>"
        subtitle="Every guest, tracked per event. AI suggests who you forgot. Family grouping, dietary needs, CSV import. Your mom's parallel Notes app can finally retire."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={1} pin={{ color: 'gold', position: 'right' }}>
              <GuestsMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="Every guest,<br/><em>per event.</em>"
            body="Not just 'coming' or 'not coming.' Which of your 4+ events they're invited to, confirmed for, and actually attending. Plus their side, city, relation, and dietary needs."
            detail="Switch between bride / groom / mutual filters in a tap. Search by name, relation, or city. Watch the confirmed-vs-invited progress bar climb as RSVPs roll in. The whole mess, organized."
            scrawl="bride 48 · groom 46 · mutual 5"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={-1.2} tapes={['tl', 'tr']}>
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
                  ✨ AI SUGGESTIONS · 5 NEW
                </div>
                {[
                  { name: 'Sharma family', detail: '4 people, groom\'s side, Jaipur' },
                  { name: 'Anjali Mehta', detail: 'MBA classmate, you tagged her in 2023' },
                  { name: 'Bajwa cousins', detail: 'Nana invited their parents — likely a pair' },
                ].map((s) => (
                  <div
                    key={s.name}
                    style={{
                      background: 'white',
                      padding: '10px 12px',
                      borderRadius: 4,
                      marginBottom: 6,
                      fontSize: 12,
                      color: 'var(--wine)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--mauve)' }}>{s.detail}</div>
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
                      ADD →
                    </span>
                  </div>
                ))}
              </div>
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="AI SUGGESTIONS"
            title="The friend who<br/><em>remembers everyone.</em>"
            body="The Marigold reads your existing list and surfaces who you might be forgetting. 'You added Pankaj uncle but not Shilpa aunty.' 'You added Anjali's parents but not Anjali.' That kind of thing."
            detail="It also catches family logic — if you invited the heads of a household, it'll suggest spouse and kids. If you invited a couple, it'll suggest their parents. If you invited the office, it'll roll its eyes but suggest the +1s."
            scrawl="basically your most considerate cousin"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.8} tapes={['center']}>
              <PerEventMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="MULTI-EVENT TRACKING"
            title="Invited to 4.<br/>Confirmed for 2."
            body="Indian weddings are 4+ events deep. Sangeet, mehendi, haldi, ceremony, reception. Your guests have opinions about which they'll attend — track each one separately."
            detail="The grid view shows you exactly who's coming to what. Spot the gaps fast: 'wait, none of the Sharmas RSVP'd for Sangeet?' Send a follow-up in two taps."
            scrawl="partial · 14/16 means call them"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.4} pin={{ color: 'pink', position: 'left' }}>
              <ImportMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="VIEWS & IMPORT"
            title="List or grid.<br/><em>Search or scroll.</em>"
            body="Switch between list, grid, or family-tree view. Search by name, family, city, or relation. Import from CSV (because everyone has a mystery spreadsheet floating around)."
            detail="Family-tree view groups guests by household — useful when you're trying to count plates or address invitations by family unit. Grid view is for the visual people. List view is for the data nerds."
            scrawl="csv import = mom's notes app, formalized"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['tr']}>
              <FamilyMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="FAMILY & DIETARY"
            title="Households, allergies,<br/><em>preferences.</em>"
            body="Group guests by household so you can address invitations as families. Track dietary needs — veg, jain, peanut allergy, no-shellfish — and watch the catering counts auto-update."
            detail="Filter by allergy and instantly see who needs alternates. Filter by side and instantly see your bride / groom split. Filter by city to plan welcome bags by region."
            scrawl="aunty's dietary memory: officially digitized"
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="Not a guest list.<br/><em>A diplomatic system.</em>"
        cells={[
          {
            label: 'PER-EVENT',
            title: 'Multi-event RSVPs',
            body: 'Track who\'s coming to which of your 4+ events.',
          },
          {
            label: 'AI-AWARE',
            title: 'Suggestions',
            body: 'It catches the people you forgot before they call you.',
          },
          {
            label: 'FAMILY-AWARE',
            title: 'Household grouping',
            body: 'Address invitations as families. Track dietary at the unit level.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay show me everyone"
        heading="Ready to track <i>every guest?</i>"
        buttonLabel="Build My Guest List"
        secondary={{ label: 'See All Features', href: '/features' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>"beta, what about the sharmas?" — handled.</ScrawlNote>
      </div>
    </>
  );
}
