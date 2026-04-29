import { FeatureHero } from '@/components/marigold/features/FeatureHero';
import { FeatureStrip, FeatureStripText } from '@/components/marigold/features/FeatureStrip';
import { FeatureCallout } from '@/components/marigold/features/FeatureCallout';
import { FeatureCta } from '@/components/marigold/features/FeatureCta';
import { MockupFrame } from '@/components/marigold/ui/MockupFrame';
import { ScrawlNote } from '@/components/marigold/ui/ScrawlNote';
import { ChecklistMockup } from '@/components/marigold/mockups/ChecklistMockup';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — The Checklist',
  description:
    '582 tasks across 13 phases. AI suggestions. Filtering. Task → workspace linking. The brain of your wedding.',
});

const phases = [
  'Foundation & Vision',
  'Branding & Identity',
  'Core Bookings',
  'Attire & Styling',
  'Vendors — Experience Layer',
  'Paper & Stationery',
  'Guest Management',
  'Ceremony Specifics',
  'Gifts & Favors',
  'Legal & Administrative',
  'Final Month',
];

function PhasePoster() {
  return (
    <div
      style={{
        background: 'var(--cream)',
        border: '1.5px dashed rgba(75,21,40,0.18)',
        padding: '24px 22px',
        borderRadius: 6,
        boxShadow: '3px 4px 14px rgba(75,21,40,0.08)',
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
        THE 13-PHASE TIMELINE
      </div>
      <div
        className="font-serif text-wine"
        style={{ fontSize: 22, marginBottom: 16 }}
      >
        From engagement to "I do."
      </div>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          counterReset: 'phase',
        }}
      >
        {phases.map((p, i) => (
          <li
            key={p}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              padding: '6px 0',
              borderBottom: i === phases.length - 1 ? 'none' : '1px solid rgba(75,21,40,0.05)',
              fontSize: 13,
              color: 'var(--wine)',
            }}
          >
            <span
              className="font-syne"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--gold)',
                width: 24,
                letterSpacing: 1,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
      <div
        className="font-scrawl"
        style={{
          color: 'var(--pink)',
          fontSize: 16,
          marginTop: 12,
          transform: 'rotate(-1deg)',
          display: 'inline-block',
        }}
      >
        + 2 secret bonus phases for the truly chaotic
      </div>
    </div>
  );
}

function FilterMockup() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: 20,
        boxShadow: '3px 4px 10px rgba(75,21,40,0.08)',
      }}
    >
      <div
        className="font-syne"
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--mauve)',
          marginBottom: 6,
        }}
      >
        FILTERS · 4 ACTIVE
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 12 }}>
        Slice 582 tasks any way you need.
      </div>
      {[
        { label: 'STATUS', chips: ['Not started', 'In progress', 'Done', 'Blocked'] },
        { label: 'PRIORITY', chips: ['High', 'Medium', 'Low'] },
        { label: 'ASSIGNEE', chips: ['Me', 'Partner', 'Mom', 'Planner'] },
        { label: 'CATEGORY', chips: ['Vendor', 'Couple', 'Family', 'Logistics'] },
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
                className="font-body"
                style={{
                  fontSize: 10,
                  padding: '3px 9px',
                  borderRadius: 2,
                  background: i === 0 ? 'var(--pink)' : 'var(--blush)',
                  color: i === 0 ? 'white' : 'var(--deep-pink)',
                  fontWeight: 600,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkedTaskMockup() {
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
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--deep-pink)',
          marginBottom: 4,
        }}
      >
        TASK · PHASE 5
      </div>
      <div className="font-serif text-wine" style={{ fontSize: 18, marginBottom: 8 }}>
        Confirm baraat horse with vendor
      </div>
      <div style={{ fontSize: 12, color: 'var(--mauve)', marginBottom: 14 }}>
        Due Aug 12 · Assigned to mom · High priority
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'WORKSPACE', value: 'Music & Entertainment' },
          { label: 'VENDOR', value: 'Royal Baraat Co.' },
          { label: 'SUB-TASK', value: 'Get insurance certificate' },
        ].map((r) => (
          <div
            key={r.label}
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
            <span style={{ color: 'var(--wine)' }}>{r.value} →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <>
      <FeatureHero
        tag="the brain"
        label="THE CHECKLIST"
        title="582 tasks. 13 phases.<br/><em>Zero overwhelm.</em>"
        subtitle="From 'discuss overall wedding vision' to 'confirm the baraat horse' — the whole arc, broken into bite-sized tasks. With AI nudges so you always know what's next."
      />

      <section className="px-6 md:px-10" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <FeatureStrip
          visual={
            <MockupFrame rotation={-1} tapes={['tl', 'tr']}>
              <ChecklistMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE OVERVIEW"
            title="Your whole wedding,<br/><em>actually organized.</em>"
            body="Every task is laid out chronologically, slotted into a phase, tagged by category, and assigned to someone. Open the app, see Phase 1 of 13, see what's due today. Done."
            detail="No more 47-tab spreadsheet. No more 'wait, did we book the priest?' panic. Just a clear, calm running list of what to do next."
            scrawl="bridezilla brain, but make it organized"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={1.2} pin={{ color: 'pink', position: 'left' }}>
              <PhasePoster />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE PHASES"
            title="Eleven core phases.<br/>One steady rhythm."
            body="The Marigold is built around how weddings actually unfold — not a generic 12-month checklist. Foundation & Vision comes before Vendor bookings, which comes before Attire, which comes before the Final Month sprint."
            detail="Each phase has its own dashboard view, progress bar, and scope. You'll know exactly where you are in the journey at any moment — and exactly what's left."
            scrawl="phase 5 is where things get *spicy*"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-0.8} tapes={['center']}>
              <div
                style={{
                  background: 'var(--gold-light)',
                  borderRadius: 6,
                  padding: '22px 22px 18px',
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
                  ✨ AI SUGGESTIONS · 3 NEW
                </div>
                {[
                  'Compare 3 florists for mandap decor by end of month',
                  "Add 'tradition lead' tasks for each ceremony",
                  'Block calendar for outfit fittings — you have 7 events',
                ].map((s) => (
                  <div
                    key={s}
                    className="font-body"
                    style={{
                      fontSize: 13,
                      color: 'var(--wine)',
                      fontStyle: 'italic',
                      padding: '8px 12px',
                      background: 'white',
                      borderRadius: 4,
                      marginBottom: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <span>{s}</span>
                    <span
                      className="font-syne"
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--pink)',
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
            label="THE AI"
            title="Suggestions, not<br/><em>another spreadsheet.</em>"
            body="The Marigold reads your wedding details — destination, guest count, events, style — and surfaces tasks you wouldn't have thought of. Forgot a 'tradition lead' for the haldi? It'll mention it."
            detail="Each suggestion can be added with a tap, or dismissed. It learns from what you accept. It will not, however, suggest you ditch the dholki — some things are non-negotiable."
            scrawl="like a planner who actually reads your brief"
          />
        </FeatureStrip>

        <FeatureStrip
          reverse
          visual={
            <MockupFrame rotation={0.8} pin={{ color: 'gold', position: 'right' }}>
              <FilterMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="THE FILTERS"
            title="Slice it any way<br/>you need."
            body="Filter by status, priority, assignee, or category. Combine them. Save views. 'Show me everything mom owes me by Friday' is one tap away."
            detail="Want only high-priority vendor tasks assigned to your partner that are blocked? Done. Want a view that's just 'this week, anyone, all categories'? Also done."
            scrawl="your saved filter, your favourite child"
          />
        </FeatureStrip>

        <FeatureStrip
          visual={
            <MockupFrame rotation={-1.2} tapes={['tl']}>
              <LinkedTaskMockup />
            </MockupFrame>
          }
        >
          <FeatureStripText
            label="LINKED EVERYTHING"
            title="Every task knows<br/><em>where it lives.</em>"
            body="Tap any task and you'll see its workspace, its vendor, its sub-tasks, and its blockers. No more flipping between 6 apps."
            detail="Booking the baraat horse? The task links to Music & Entertainment workspace, to the vendor profile, and to the 'get insurance certificate' sub-task. One graph, no orphans."
            scrawl="everything talks to everything else"
          />
        </FeatureStrip>
      </section>

      <FeatureCallout
        scrawl="what makes this different"
        heading="Not a to-do app.<br/><em>A wedding-shaped brain.</em>"
        cells={[
          {
            label: 'CHRONOLOGICAL',
            title: 'Phase-based',
            body: 'Tasks unfold the way real weddings do — not in a generic Trello board.',
          },
          {
            label: 'CONNECTED',
            title: 'Linked graph',
            body: 'Every task points to a workspace, a vendor, a person. Nothing floats.',
          },
          {
            label: 'INTELLIGENT',
            title: 'AI nudges',
            body: 'Suggestions tailored to your wedding. Not boilerplate.',
          },
        ]}
      />

      <FeatureCta
        scrawl="okay take me to the brain"
        heading="Ready to try <i>the checklist?</i>"
        buttonLabel="Start Planning"
        secondary={{ label: 'See All Features', href: '/features' }}
      />

      <div className="text-center" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <ScrawlNote>p.s. there are 582 tasks. yes we counted.</ScrawlNote>
      </div>
    </>
  );
}
