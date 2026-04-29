import type { CSSProperties, ReactNode } from 'react';
import { SectionHeader } from '@/components/marigold/ui/SectionHeader';
import { ScrawlNote } from '@/components/marigold/ui/ScrawlNote';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import { TapeStrip } from '@/components/marigold/ui/TapeStrip';
import { PushPin } from '@/components/marigold/ui/PushPin';
import { StickyTag } from '@/components/marigold/ui/StickyTag';
import { ChunkyButton } from '@/components/marigold/ui/ChunkyButton';
import { TornDivider } from '@/components/marigold/ui/TornDivider';
import { FeatureCta } from '@/components/marigold/features/FeatureCta';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Pricing',
  description:
    'Three plans. No hidden fees. No "contact sales." Pick what works and start planning.',
});

type Tier = {
  key: 'seed' | 'bloom' | 'planner';
  title: string;
  price: string;
  priceSub?: string;
  scrawl: string;
  features: string[];
  cta: { label: string; variant: 'pink' | 'white' | 'outline'; href: string };
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    key: 'seed',
    title: 'The Seed',
    price: '$0',
    priceSub: 'forever',
    scrawl: 'dip your toes in',
    features: [
      'Basic checklist (Phase 1 only)',
      'Guest list up to 50',
      '1 workspace (Photography)',
      'Community access (read only)',
      'Wedding website (basic template)',
    ],
    cta: { label: 'Start Free', variant: 'outline', href: '/signup' },
  },
  {
    key: 'bloom',
    title: 'The Full Bloom',
    price: '$XX',
    priceSub: 'per month',
    scrawl: 'the whole enchilada. or paneer tikka.',
    popular: true,
    features: [
      'All 582 tasks across 13 planning phases',
      'All 12+ vendor workspaces',
      'Unlimited guests with per-event tracking',
      'Full vendor matching + Roulette',
      'Registry (honeymoon fund, shagun pool, charitable giving)',
      'The Studio (monogram, logo, style, website, invitations, print)',
      'Community (full access + The Confessional + The Grapevine)',
      'Shopping (all tabs + marketplace)',
      'AI briefs + quiz-generated content',
      'CSV import/export',
      'Member access for family (yes, mom gets a login)',
    ],
    cta: { label: 'Start Planning', variant: 'white', href: '/signup' },
  },
  {
    key: 'planner',
    title: 'The Planner Edition',
    price: 'Custom',
    scrawl: 'for the professionals',
    features: [
      'Everything in The Full Bloom',
      'Multi-wedding management',
      'Client dashboard',
      'White-label options',
      'Priority support',
      'Custom vendor network',
      'Analytics & reporting',
    ],
    cta: { label: 'Talk to Us', variant: 'outline', href: '/contact' },
  },
];

const featureColumns = [
  {
    label: 'PLANNING',
    rows: [
      { feature: 'Master checklist', seed: 'Phase 1 only', bloom: 'All 582 tasks', planner: 'All 582 tasks' },
      { feature: 'Planning phases', seed: '1 of 13', bloom: 'All 13', planner: 'All 13' },
      { feature: 'AI suggestions', seed: false, bloom: true, planner: true },
      { feature: 'CSV import / export', seed: false, bloom: true, planner: true },
    ],
  },
  {
    label: 'GUESTS',
    rows: [
      { feature: 'Guest list', seed: 'Up to 50', bloom: 'Unlimited', planner: 'Unlimited' },
      { feature: 'Per-event RSVPs', seed: false, bloom: true, planner: true },
      { feature: 'Bride / groom side tracking', seed: false, bloom: true, planner: true },
      { feature: 'Mom gets her own login', seed: false, bloom: true, planner: true },
    ],
  },
  {
    label: 'VENDORS & WORKSPACES',
    rows: [
      { feature: 'Vendor workspaces', seed: '1 (Photography)', bloom: 'All 12+', planner: 'All 12+' },
      { feature: 'Vendor matching', seed: false, bloom: true, planner: true },
      { feature: 'Vendor Roulette', seed: false, bloom: true, planner: true },
      { feature: 'Custom vendor network', seed: false, bloom: false, planner: true },
    ],
  },
  {
    label: 'STUDIO & WEBSITE',
    rows: [
      { feature: 'Wedding website', seed: 'Basic template', bloom: 'Full Studio', planner: 'White-label' },
      { feature: 'Monogram + logo + palette', seed: false, bloom: true, planner: true },
      { feature: 'Invitations & print', seed: false, bloom: true, planner: true },
    ],
  },
  {
    label: 'EXTRAS',
    rows: [
      { feature: 'Community access', seed: 'Read only', bloom: 'Full', planner: 'Full' },
      { feature: 'The Confessional + Grapevine', seed: false, bloom: true, planner: true },
      { feature: 'Multi-wedding management', seed: false, bloom: false, planner: true },
      { feature: 'Priority support', seed: false, bloom: false, planner: true },
    ],
  },
];

const faqs: {
  q: string;
  a: string;
  bg: string;
  color?: string;
  rotate: number;
  pinColor?: 'pink' | 'gold' | 'red' | 'blue';
  pinPos?: 'left' | 'right' | 'center';
  tape?: 'tl' | 'tr' | 'center';
}[] = [
  {
    q: 'Can I switch plans later?',
    a: "Anytime. Upgrade mid-planning, downgrade after the honeymoon, drift between Seed and Full Bloom while you decide. Your data stays put either way — we don't hold guest lists hostage.",
    bg: 'var(--blush)',
    rotate: -2.5,
    pinColor: 'pink',
    pinPos: 'left',
  },
  {
    q: 'Does my mom really get her own login?',
    a: "Really. Family members get their own access at the Full Bloom tier — they can see what's assigned to them, mark things done, and add comments. They cannot see the line item where you priced 'avoid mother-in-law's florist.' That's between you and the platform.",
    bg: 'var(--gold-light)',
    rotate: 1.8,
    tape: 'tr',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: "You get 90 days to export everything — guest list, checklist, moodboards, vendor briefs, registry, the lot. Full CSV export, no questions, no exit interview. After that we delete it. Your wedding, your data.",
    bg: 'var(--lavender)',
    rotate: -1.5,
    pinColor: 'blue',
    pinPos: 'right',
  },
  {
    q: 'Is there a couple discount? We are literally two people.',
    a: "Full Bloom is one subscription per wedding, not per person — so by definition it's already a couple plan. Add as many family logins as you need at no extra cost. The 'two-people' math has been done for you.",
    bg: 'var(--mint)',
    rotate: 2.5,
    tape: 'tl',
  },
  {
    q: 'Can my wedding planner use this too?',
    a: "Yes — and they should. They can be added as a member of your Full Bloom workspace, or pick up The Planner Edition to manage you alongside their other clients. Either way, no more email-attachment ping-pong.",
    bg: 'var(--peach)',
    rotate: -2,
    pinColor: 'gold',
    pinPos: 'center',
  },
  {
    q: 'What about hidden fees?',
    a: "There aren't any. The price you see is the price. We don't take a cut of your registry, we don't sell vendors a slot in your matches, and we don't 'unlock features' the day before your wedding. Promise.",
    bg: 'var(--sky)',
    rotate: 1.5,
    tape: 'center',
  },
];

function CardShell({
  children,
  style,
  rotate,
  bg,
  width,
  raised,
}: {
  children: ReactNode;
  style?: CSSProperties;
  rotate: number;
  bg: string;
  width: number;
  raised?: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: bg,
        borderRadius: 8,
        padding: '38px 32px 34px',
        width: '100%',
        maxWidth: width,
        transform: `rotate(${rotate}deg)`,
        boxShadow: raised
          ? '6px 8px 28px rgba(75,21,40,0.18)'
          : '3px 4px 14px rgba(75,21,40,0.10)',
        zIndex: raised ? 2 : 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FeatureRow({
  text,
  color = 'var(--wine)',
  check = 'var(--pink)',
}: {
  text: string;
  color?: string;
  check?: string;
}) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '7px 0',
        fontSize: 14,
        lineHeight: 1.5,
        color,
      }}
    >
      <span
        className="font-scrawl"
        style={{
          color: check,
          fontSize: 22,
          lineHeight: 1,
          marginTop: -2,
          flexShrink: 0,
          transform: 'rotate(-6deg)',
          width: 18,
        }}
        aria-hidden="true"
      >
        ✓
      </span>
      <span>{text}</span>
    </li>
  );
}

function PriceBlock({
  price,
  sub,
  color = 'var(--wine)',
  subColor = 'var(--mauve)',
}: {
  price: string;
  sub?: string;
  color?: string;
  subColor?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span
        className="font-serif"
        style={{
          fontSize: 'clamp(48px, 6vw, 64px)',
          lineHeight: 1,
          color,
          fontWeight: 400,
          letterSpacing: '-0.5px',
        }}
      >
        {price}
      </span>
      {sub && (
        <span
          className="font-syne"
          style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: subColor,
            marginTop: 8,
          }}
        >
          / {sub}
        </span>
      )}
    </div>
  );
}

function TierTitle({ children, color = 'var(--wine)' }: { children: ReactNode; color?: string }) {
  return (
    <h3
      className="font-serif"
      style={{
        fontSize: 30,
        lineHeight: 1.1,
        color,
        fontWeight: 400,
        marginBottom: 6,
      }}
    >
      {children}
    </h3>
  );
}

function ComparisonCheck({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span
        className="font-body"
        style={{
          fontSize: 13,
          color: 'var(--wine)',
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <span
        className="font-scrawl"
        style={{
          color: 'var(--pink)',
          fontSize: 28,
          lineHeight: 1,
          display: 'inline-block',
          transform: 'rotate(-8deg)',
        }}
        aria-label="included"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="font-scrawl"
      style={{
        color: 'rgba(138,96,112,0.55)',
        fontSize: 22,
        lineHeight: 1,
        display: 'inline-block',
        transform: 'rotate(6deg)',
      }}
      aria-label="not included"
    >
      —
    </span>
  );
}

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative px-6 md:px-10"
        style={{ paddingTop: 130, paddingBottom: 60 }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 110,
            left: '8%',
            opacity: 0.5,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="22"
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
            top: 160,
            right: '10%',
            opacity: 0.45,
            transform: 'rotate(12deg)',
          }}
        >
          <svg width="54" height="54" viewBox="0 0 54 54">
            <path
              d="M27 6l5 13h13l-10 8 4 14-12-9-12 9 4-14-10-8h13z"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.2"
            />
          </svg>
        </span>

        <SectionHeader
          scrawl="the part where we talk money"
          heading="Simple Pricing, <em>No Drama</em>"
          sub="No hidden fees. No 'contact sales.' Just pick what works."
        />
      </section>

      {/* PRICING CARDS */}
      <section
        className="relative px-6 md:px-10"
        style={{ paddingBottom: 110 }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 36,
            rowGap: 60,
          }}
        >
          {/* SEED — mint sticky note */}
          <ScrollReveal>
            <CardShell bg="var(--mint)" rotate={-2.5} width={340}>
              <PushPin color="pink" position="center" />
              <TierTitle>{tiers[0].title}</TierTitle>
              <PriceBlock price={tiers[0].price} sub={tiers[0].priceSub} />
              <div style={{ marginBottom: 16 }}>
                <ScrawlNote>{tiers[0].scrawl}</ScrawlNote>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 26px',
                  borderTop: '1.5px dashed rgba(75,21,40,0.18)',
                  paddingTop: 14,
                }}
              >
                {tiers[0].features.map((f) => (
                  <FeatureRow key={f} text={f} check="var(--deep-pink)" />
                ))}
              </ul>
              <ChunkyButton variant="outline" href={tiers[0].cta.href} className="!text-wine !border-wine/40">
                {tiers[0].cta.label}
              </ChunkyButton>
            </CardShell>
          </ScrollReveal>

          {/* FULL BLOOM — pink card, raised */}
          <ScrollReveal>
            <CardShell bg="var(--pink)" rotate={-1.5} width={420} raised>
              <TapeStrip position="tl" />
              <TapeStrip position="tr" />
              <div style={{ marginBottom: 4 }}>
                <StickyTag>most popular</StickyTag>
              </div>
              <TierTitle color="white">{tiers[1].title}</TierTitle>
              <PriceBlock
                price={tiers[1].price}
                sub={tiers[1].priceSub}
                color="white"
                subColor="rgba(255,255,255,0.75)"
              />
              <div style={{ marginBottom: 16 }}>
                <span
                  className="inline-block font-scrawl"
                  style={{
                    fontSize: 18,
                    color: 'var(--gold-light)',
                    transform: 'rotate(-1deg)',
                  }}
                >
                  {tiers[1].scrawl}
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 28px',
                  borderTop: '1.5px dashed rgba(255,255,255,0.3)',
                  paddingTop: 14,
                }}
              >
                {tiers[1].features.map((f) => (
                  <FeatureRow
                    key={f}
                    text={f}
                    color="rgba(255,255,255,0.94)"
                    check="var(--gold-light)"
                  />
                ))}
              </ul>
              <ChunkyButton variant="white" href={tiers[1].cta.href}>
                {tiers[1].cta.label}
              </ChunkyButton>
            </CardShell>
          </ScrollReveal>

          {/* PLANNER — wine card with gold */}
          <ScrollReveal>
            <CardShell bg="var(--wine)" rotate={2} width={340}>
              <PushPin color="gold" position="left" />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  width: 50,
                  height: 50,
                  border: '1.5px dashed rgba(212,168,83,0.55)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(8deg)',
                  fontFamily: 'var(--font-caveat), cursive',
                  fontSize: 12,
                  color: 'var(--gold)',
                  textAlign: 'center',
                  lineHeight: 1.05,
                  padding: 4,
                }}
              >
                pros only
              </span>
              <TierTitle color="white">{tiers[2].title}</TierTitle>
              <PriceBlock
                price={tiers[2].price}
                color="var(--gold-light)"
                subColor="var(--gold)"
              />
              <div style={{ marginBottom: 16 }}>
                <span
                  className="inline-block font-scrawl"
                  style={{
                    fontSize: 18,
                    color: 'var(--gold)',
                    transform: 'rotate(-1deg)',
                  }}
                >
                  {tiers[2].scrawl}
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 28px',
                  borderTop: '1.5px dashed rgba(212,168,83,0.4)',
                  paddingTop: 14,
                }}
              >
                {tiers[2].features.map((f) => (
                  <FeatureRow
                    key={f}
                    text={f}
                    color="rgba(255,255,255,0.88)"
                    check="var(--gold)"
                  />
                ))}
              </ul>
              <ChunkyButton
                variant="outline"
                href={tiers[2].cta.href}
                className="!border-[var(--gold)] !text-[var(--gold-light)]"
              >
                {tiers[2].cta.label}
              </ChunkyButton>
            </CardShell>
          </ScrollReveal>
        </div>

        <div className="text-center" style={{ marginTop: 56 }}>
          <ScrawlNote>p.s. all plans come with a 14-day try-before-you-RSVP window ✿</ScrawlNote>
        </div>
      </section>

      {/* TORN DIVIDER INTO COMPARISON */}
      <TornDivider fromColor="var(--cream)" toColor="var(--paper)" />

      {/* COMPARISON TABLE */}
      <section
        className="relative px-6 md:px-10"
        style={{ background: 'var(--paper)', paddingTop: 90, paddingBottom: 90 }}
      >
        <SectionHeader
          scrawl="the long version"
          heading="What's <em>in each plan</em>"
          sub="Every feature, side by side. No corporate-grid energy."
        />

        <ScrollReveal>
          <div
            style={{
              maxWidth: 1080,
              margin: '0 auto',
              background: 'var(--cream)',
              borderRadius: 8,
              border: '1.5px dashed rgba(75,21,40,0.22)',
              padding: '28px 24px 32px',
              boxShadow: '4px 6px 18px rgba(75,21,40,0.10)',
              transform: 'rotate(-0.4deg)',
              position: 'relative',
            }}
          >
            <TapeStrip position="tl" />
            <TapeStrip position="tr" />

            {/* Header row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                gap: 12,
                padding: '10px 16px 14px',
                borderBottom: '2px dashed rgba(75,21,40,0.22)',
                alignItems: 'end',
              }}
            >
              <div />
              {[
                { name: 'The Seed', tone: 'var(--deep-pink)' },
                { name: 'Full Bloom', tone: 'var(--pink)', star: true },
                { name: 'Planner', tone: 'var(--gold)' },
              ].map((c) => (
                <div key={c.name} style={{ textAlign: 'center', position: 'relative' }}>
                  {c.star && (
                    <span
                      className="font-scrawl"
                      style={{
                        position: 'absolute',
                        top: -28,
                        left: '50%',
                        transform: 'translateX(-50%) rotate(-4deg)',
                        color: 'var(--gold)',
                        fontSize: 17,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ↓ pick this one ↓
                    </span>
                  )}
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 22,
                      color: c.tone,
                      lineHeight: 1.1,
                    }}
                  >
                    {c.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Sections */}
            {featureColumns.map((section, sIdx) => (
              <div key={section.label} style={{ marginTop: sIdx === 0 ? 8 : 24 }}>
                <div
                  className="font-syne"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    color: 'var(--pink)',
                    padding: '6px 16px 10px',
                  }}
                >
                  ✦ {section.label}
                </div>
                {section.rows.map((row, rIdx) => (
                  <div
                    key={row.feature}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                      gap: 12,
                      padding: '14px 16px',
                      background: rIdx % 2 === 0 ? 'transparent' : 'var(--blush)',
                      borderRadius: 4,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      className="font-body"
                      style={{ fontSize: 14, color: 'var(--wine)', fontWeight: 500 }}
                    >
                      {row.feature}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <ComparisonCheck value={row.seed} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <ComparisonCheck value={row.bloom} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <ComparisonCheck value={row.planner} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <span
              className="font-scrawl"
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -18,
                right: 32,
                color: 'var(--pink)',
                fontSize: 19,
                transform: 'rotate(-3deg)',
                background: 'var(--paper)',
                padding: '0 10px',
              }}
            >
              and a few surprises we didn't list ✿
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* TORN DIVIDER INTO FAQ */}
      <TornDivider fromColor="var(--paper)" toColor="var(--cream)" />

      {/* FAQ */}
      <section
        className="relative px-6 md:px-10"
        style={{ paddingTop: 90, paddingBottom: 110 }}
      >
        <SectionHeader
          scrawl="the things you're definitely thinking"
          heading="Questions, <em>answered</em>"
          sub="Yes, even the awkward ones."
        />

        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 36,
            rowGap: 56,
            padding: '20px 12px',
          }}
        >
          {faqs.map((f, i) => (
            <ScrollReveal key={f.q}>
              <div
                style={{
                  position: 'relative',
                  background: f.bg,
                  borderRadius: 6,
                  padding: '32px 26px 28px',
                  transform: `rotate(${f.rotate}deg)`,
                  boxShadow: '3px 4px 14px rgba(75,21,40,0.10)',
                  minHeight: 220,
                }}
              >
                {f.tape && <TapeStrip position={f.tape} />}
                {f.pinColor && f.pinPos && (
                  <PushPin color={f.pinColor} position={f.pinPos} />
                )}
                <div
                  className="font-syne"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'var(--pink)',
                    marginBottom: 8,
                  }}
                >
                  Q · {String(i + 1).padStart(2, '0')}
                </div>
                <h3
                  className="font-scrawl"
                  style={{
                    fontSize: 26,
                    lineHeight: 1.15,
                    color: 'var(--wine)',
                    marginBottom: 12,
                    fontWeight: 600,
                  }}
                >
                  {f.q}
                </h3>
                <p
                  className="font-body"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--wine)',
                    opacity: 0.88,
                  }}
                >
                  {f.a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 56 }}>
          <ScrawlNote>still have questions? hit the chat. there's a real person there.</ScrawlNote>
        </div>
      </section>

      {/* FINAL CTA */}
      <FeatureCta
        scrawl="okay we're ready"
        heading="Pick a plan. <i>Plan a wedding.</i>"
        buttonLabel="Start with Full Bloom"
        secondary={{ label: 'Browse Features', href: '/features' }}
      />
    </>
  );
}
