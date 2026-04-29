"use client";

// Fills empty whitespace in dashboard pages with warm, contextual playcard tips.
// Each page passes its own set of tips relevant to what users do on that page.

const FONT_SERIF = "var(--font-instrument-serif, 'Instrument Serif'), serif";
const FONT_SYNE = "var(--font-syne, 'Syne'), sans-serif";

type Tip = {
  eyebrow: string;
  text: string;
  color: { bg: string; border: string; tilt: string };
};

const COLORS = [
  { bg: '#FFF8F2', border: 'rgba(212,168,83,0.22)', tilt: 'rotate(-1deg)' },
  { bg: '#FBEAF0', border: 'rgba(212,83,126,0.15)', tilt: 'rotate(0.8deg)' },
  { bg: '#F0FAF5', border: 'rgba(100,180,140,0.2)', tilt: 'rotate(-0.5deg)' },
  { bg: '#F5EFFF', border: 'rgba(140,100,200,0.15)', tilt: 'rotate(0.7deg)' },
];

export const CHECKLIST_TIPS: Tip[] = [
  { eyebrow: 'pro tip', text: 'Tick off tasks in order — each phase unlocks the next. Vendors book up 12–18 months out.', color: COLORS[0] },
  { eyebrow: 'did you know', text: 'You can assign tasks to your partner, mum, or planner — delegate without losing the thread.', color: COLORS[1] },
  { eyebrow: 'from the studio', text: 'Link shopping items directly to a task — your moodboard and checklist stay in sync.', color: COLORS[2] },
  { eyebrow: 'gentle nudge', text: 'Blocked tasks are normal. Flag them, move on, and come back when the vendor replies.', color: COLORS[3] },
];

export const SHOPPING_TIPS: Tip[] = [
  { eyebrow: 'how it works', text: 'Paste any product URL here — we pull the image, title and price automatically.', color: COLORS[0] },
  { eyebrow: 'pro tip', text: 'Drop links directly from a task\'s detail drawer to keep inspo organised by category.', color: COLORS[1] },
  { eyebrow: 'did you know', text: 'Drag cards to reorder your wish list. Mark items as purchased to track your spend.', color: COLORS[2] },
];

export const PHOTOGRAPHY_TIPS: Tip[] = [
  { eyebrow: 'vision tip', text: 'Fill in your style keywords first — it becomes the brief you hand your photographer.', color: COLORS[0] },
  { eyebrow: 'did you know', text: 'The colour & tone slider shows the same frame in three grades — find your light.', color: COLORS[1] },
  { eyebrow: 'from the team', text: 'Add VIP shots early. Photographers need this list at least two weeks before the day.', color: COLORS[2] },
  { eyebrow: 'pro tip', text: 'An Inspiration gallery beats a mood board. Real weddings > Pinterest for briefing.', color: COLORS[3] },
];

export const STUDIO_TIPS: Tip[] = [
  { eyebrow: 'how it works', text: 'Pick a monogram once — it cascades to your website, invitations, and print automatically.', color: COLORS[0] },
  { eyebrow: 'pro tip', text: 'Lock your palette before designing invitations. Printers need exact HEX values.', color: COLORS[1] },
  { eyebrow: 'did you know', text: 'Your Brand Kit syncs across all four surfaces. Edit once, update everywhere.', color: COLORS[2] },
];

export const COMMUNITY_TIPS: Tip[] = [
  { eyebrow: 'the confessional', text: 'Anonymous, always. Drop your 2am panic in the Confessional — the community has been there.', color: COLORS[1] },
  { eyebrow: 'real weddings', text: 'Submit yours after the big day — your story might be exactly what someone else needs to read.', color: COLORS[0] },
  { eyebrow: 'the grapevine', text: 'Ask anything — vendor recs, budget splits, family politics. Real answers from real couples.', color: COLORS[2] },
];

export const GUESTS_TIPS: Tip[] = [
  { eyebrow: 'pro tip', text: 'Group guests by household to send one invite per family — saves a dozen WhatsApp threads.', color: COLORS[0] },
  { eyebrow: 'did you know', text: 'The AI flag surfaces guests without RSVPs two weeks before each event automatically.', color: COLORS[1] },
  { eyebrow: 'from the team', text: 'Set dietary flags early — caterers need a final count 10 days before the reception.', color: COLORS[2] },
  { eyebrow: 'gentle nudge', text: 'Import from CSV in one step — no need to add 99 guests one by one.', color: COLORS[3] },
];

export function MarigoldTipStrip({ tips }: { tips: Tip[] }) {
  return (
    <div
      className="mt-14"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
        paddingTop: 8,
      }}
    >
      {tips.map((tip, i) => (
        <div
          key={i}
          className="relative px-4 py-5 transition-all duration-200"
          style={{
            background: tip.color.bg,
            border: `1px solid ${tip.color.border}`,
            transform: tip.color.tilt,
            boxShadow: '0 2px 8px rgba(75,21,40,0.05), 0 6px 18px rgba(75,21,40,0.04)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(75,21,40,0.09)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = tip.color.tilt;
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(75,21,40,0.05), 0 6px 18px rgba(75,21,40,0.04)';
          }}
        >
          {/* tape */}
          <div style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 11,
            background: 'rgba(255,220,180,0.8)',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(75,21,40,0.08)',
          }} />
          <p style={{
            fontFamily: FONT_SYNE,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--pink, #D4537E)',
            marginBottom: 8,
          }}>
            {tip.eyebrow}
          </p>
          <p style={{
            fontFamily: FONT_SYNE,
            fontSize: 12.5,
            color: 'var(--wine, #4B1528)',
            lineHeight: 1.6,
            fontWeight: 400,
          }}>
            {tip.text}
          </p>
        </div>
      ))}
    </div>
  );
}
