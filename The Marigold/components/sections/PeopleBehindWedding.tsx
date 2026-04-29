import Link from 'next/link';
import type { ReactElement } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TapeStrip } from '@/components/ui/TapeStrip';
import { PushPin } from '@/components/ui/PushPin';
import styles from './PeopleBehindWedding.module.css';

const ClipboardIcon = () => (
  <svg className={styles.icon} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="7" y="6" width="18" height="22" rx="1.5" />
    <rect x="11.5" y="3.5" width="9" height="5" rx="1" />
    <path d="M11 14h10M11 18h10M11 22h6" />
  </svg>
);

const PaletteIcon = () => (
  <svg className={styles.icon} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 4C9.4 4 4 9 4 15.2c0 5.4 4 9.6 9 9.6 1.6 0 2.4-1.2 2.4-2.4 0-1-.6-1.6-.6-2.6 0-1.2 1-2 2.4-2H21c4 0 7-3 7-7C28 7.6 22.6 4 16 4z" />
    <circle cx="10.5" cy="13" r="1.2" />
    <circle cx="15" cy="9.5" r="1.2" />
    <circle cx="21" cy="10" r="1.2" />
    <circle cx="23" cy="15" r="1.2" />
  </svg>
);

const VenueIcon = () => (
  <svg className={styles.icon} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 14l11-8 11 8" />
    <path d="M7 13v14h18V13" />
    <path d="M13 27v-7h6v7" />
    <path d="M9 17h3M20 17h3" />
  </svg>
);

const StarIcon = () => (
  <svg className={styles.icon} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 5l3.2 7 7.6.9-5.6 5 1.5 7.6L16 21.8 9.3 25.5l1.5-7.6-5.6-5L12.8 12z" />
  </svg>
);

type ProCard = {
  key: string;
  className: string;
  decoration: 'tape-tl' | 'pin-gold' | 'tape-center' | 'pin-pink';
  Icon: () => ReactElement;
  title: string;
  body: string;
  scrawl: string;
  linkLabel: string;
  href: string;
};

const cards: ProCard[] = [
  {
    key: 'planner',
    className: styles.planner,
    decoration: 'tape-tl',
    Icon: ClipboardIcon,
    title: 'Your Planner',
    body:
      "Your planner sees your checklist, your vendor team, your guest list, and your budget — all in one place. No more 'can you send me that spreadsheet again?' conversations.",
    scrawl: 'Urvashi manages 8 weddings from here',
    linkLabel: 'Are you a planner? →',
    href: '/for/planners',
  },
  {
    key: 'vendor',
    className: styles.vendor,
    decoration: 'pin-gold',
    Icon: PaletteIcon,
    title: 'Your Vendors',
    body:
      "When you send The Brief, your vendor receives it inside their own Marigold workspace. They see your moodboard, your style keywords, your colour palette. No misinterpretation. No 'what exactly do you mean by dusty rose?'",
    scrawl: '127 vendors and counting',
    linkLabel: 'Are you a vendor? →',
    href: '/for/vendors',
  },
  {
    key: 'venue',
    className: styles.venue,
    decoration: 'tape-center',
    Icon: VenueIcon,
    title: 'Your Venue',
    body:
      'Your venue shares their floor plans, preferred vendor lists, setup timelines, and capacity details right inside the platform. Your planner and decorator see the same info you do.',
    scrawl: 'from Udaipur palaces to Brooklyn lofts',
    linkLabel: 'Are you a venue? →',
    href: '/for/venues',
  },
  {
    key: 'creator',
    className: styles.creator,
    decoration: 'pin-pink',
    Icon: StarIcon,
    title: 'Your Creators & Stylists',
    body:
      'The creators and stylists on The Marigold curate shopping picks, share outfit guides, and publish editorial content — all tailored to weddings like yours.',
    scrawl: 'your personal wedding editor',
    linkLabel: 'Are you a creator? →',
    href: '/for/creators',
  },
];

function Decoration({ kind }: { kind: ProCard['decoration'] }) {
  switch (kind) {
    case 'tape-tl':
      return <TapeStrip position="tl" />;
    case 'tape-center':
      return <TapeStrip position="center" />;
    case 'pin-gold':
      return <PushPin color="gold" position="right" />;
    case 'pin-pink':
      return <PushPin color="pink" position="left" />;
  }
}

export function PeopleBehindWedding() {
  return (
    <section className={styles.section}>
      <SectionHeader
        scrawl="it takes a village (a very stylish village)"
        heading="Your Team is <em>Already Here</em>"
        sub="The best planners, vendors, venues, and creators use The Marigold too. That means one platform, one conversation, zero lost WhatsApp threads."
      />

      <div className={styles.grid}>
        {cards.map((card) => (
          <ScrollReveal
            key={card.key}
            className={`${styles.card} ${card.className}`}
          >
            <Decoration kind={card.decoration} />
            <card.Icon />
            <h3 className={styles.title}>{card.title}</h3>
            <p className={styles.body}>{card.body}</p>
            <span className={styles.scrawl}>{card.scrawl}</span>
            <Link href={card.href} className={styles.proLink}>
              {card.linkLabel}
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
