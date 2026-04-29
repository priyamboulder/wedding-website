import type { ReactNode } from 'react';
import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { MockupFrame } from '@/components/ui/MockupFrame';
import { ScrawlNote } from '@/components/ui/ScrawlNote';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { StickyTag } from '@/components/ui/StickyTag';
import { ChecklistMockup, VendorsMockup, WorkspacesMockup, GuestsMockup, RegistryMockup, StudioMockup, CommunityMockup } from './FeatureMockups';
import styles from './Features.module.css';
import type { TapePosition } from '@/components/ui/TapeStrip';
import type { PinColor, PinPosition } from '@/components/ui/PushPin';

type FeatureItem = {
  tag: string;
  label: string;
  heading: string;
  body: string;
  detail: string;
  scrawl: string;
  cta?: { label: string; href: string };
  reverse: boolean;
  rotation: number;
  tapes?: TapePosition[];
  pin?: { color: PinColor; position: PinPosition } | null;
  mockup: ReactNode;
};

const FEATURES: FeatureItem[] = [
  {
    tag: 'the brain',
    label: 'The Checklist',
    heading: '582 tasks. 13 phases.<br/><em>Zero overwhelm.</em>',
    body: 'From "discuss overall wedding vision" to "confirm the baraat horse," every single task is laid out in chronological planning phases. Foundation & Vision, Branding & Identity, Core Bookings, Attire & Styling, Vendors, Guest Management — the whole arc.',
    detail:
      "AI suggests tasks based on your wedding style. Filter by status, priority, assignee, or category. Each task links to the workspace or vendor it belongs to. You'll never wonder \"wait, what should I be doing right now?\" again.",
    scrawl: "it's giving project manager energy and we're here for it",
    cta: { label: 'See the Checklist', href: '/features/checklist' },
    reverse: false,
    rotation: -1,
    tapes: ['tl', 'tr'],
    mockup: <ChecklistMockup />,
  },
  {
    tag: 'the matchmaker',
    label: 'Vendor Hub',
    heading: 'Curated picks.<br/><em>Not a marketplace.</em>',
    body: "Enter your date, venue, guest count, budget, and events — and we'll build you a curated vendor team. Photography, HMUA, Décor, Catering, Entertainment, Wardrobe, Stationery. Each recommendation tells you why they're a fit.",
    detail:
      'Filter by tier ("Ananya Select only"), travel availability, destination experience, and category. Can\'t decide? Spin the Vendor Roulette — we\'ll surface a random pick from your open categories. Vendors get badges like "Top Match" and "Rising Star" so you know who\'s earned the hype.',
    scrawl: "no endless scrolling through WeddingWire. you're welcome.",
    cta: { label: 'Explore Vendors', href: '/features/vendors' },
    reverse: true,
    rotation: 1.5,
    pin: { color: 'pink', position: 'left' },
    mockup: <VendorsMockup />,
  },
  {
    tag: 'the heart',
    label: 'Vendor Workspaces',
    heading: 'Discover your style <em>before</em><br/>you talk to a vendor.',
    body: 'Each workspace — Photography, Décor & Florals, Catering, Music, Hair & Makeup, Mehendi, Cake & Sweets, Jewelry, and more — follows the same pattern: take a vibe quiz, tap style keywords, build a moodboard, react to references with "love" or "not for us," then generate The Brief.',
    detail:
      'The Photography workspace has a real-time colour & tone slider — slide it and watch the same photo re-grade from warm film to cool editorial. Your style keywords and colour palette carry across every workspace. It all flows into one document: THE BRIEF YOUR VENDOR READS FIRST.',
    scrawl: "vendors will think you hired a planner. you didn't. you have us.",
    cta: { label: 'See Workspaces', href: '/features/workspaces' },
    reverse: false,
    rotation: -0.5,
    tapes: ['center'],
    mockup: <WorkspacesMockup />,
  },
  {
    tag: 'the diplomat',
    label: 'Guest Management',
    heading: 'Bride side. Groom side.<br/><em>Nobody forgotten.</em>',
    body: 'Every guest, tracked per-event. Not just "coming" or "not coming" — but which of your 4+ events they\'re invited to, confirmed for, and actually attending. Bride side, groom side, mutual. With cities, relationships, and dietary needs.',
    detail:
      'AI suggests additions ("Add the Sharma family — 4 people, groom\'s side, Jaipur"). Filter by side, RSVP status, event, or just search. Import from CSV or add one by one. Switch between list and grid views. And yes — "beta, what about the Sharmas?" has officially been handled.',
    scrawl: 'your mom can stop keeping a parallel list in her Notes app',
    cta: { label: 'Manage Guests', href: '/features/guests' },
    reverse: true,
    rotation: 1,
    pin: { color: 'gold', position: 'right' },
    mockup: <GuestsMockup />,
  },
  {
    tag: 'the vault',
    label: 'Registry & Gifts',
    heading: 'Honeymoon fund.<br/>Shagun pool. <em>Thank-you tracker.</em>',
    body: 'Build a registry with traditional items, a honeymoon fund with a progress bar, a shagun/cash pool, and even a charitable giving option. Your public registry page goes live at ananya.wed/your-names.',
    detail:
      "Track every gift as it arrives — who sent it, when it shipped, whether you've sent a thank-you. The dashboard shows total received vs. registry value, a top contributors leaderboard (because aunty IS keeping score), and a recent activity feed so you never miss a blessing.",
    scrawl: '"10 trees. One per semester we survived together." — actual gift note',
    cta: { label: 'Build a Registry', href: '/features/registry' },
    reverse: false,
    rotation: -1.5,
    tapes: ['tl'],
    mockup: <RegistryMockup />,
  },
  {
    tag: 'the art director',
    label: 'The Studio',
    heading: 'One brand system.<br/><em>Every surface.</em>',
    body: 'Pick a monogram — your initials, date, and location cascade to every surface. Choose a wedding logo. Set your palette, typography, and motifs. Then watch it all flow into your website, invitations, print & signage, and outfit style guide.',
    detail:
      'The Studio tracks creative completion across all four surfaces. Keepsakes like Photo Albums, a Content Studio for share-ready social content, and even a Magazine section for real wedding editorials. Your wedding brand, fully designed — not just a font on a template.',
    scrawl: '100% complete on Style? that\'s giving "rajwara rose · editorial house" energy.',
    cta: { label: 'Open the Studio', href: '/features/studio' },
    reverse: true,
    rotation: 0.8,
    pin: { color: 'blue', position: 'left' },
    mockup: <StudioMockup />,
  },
  {
    tag: 'the village',
    label: 'The Planning Circle',
    heading: 'Not a forum.<br/><em>A community.</em>',
    body: "Editorial articles, real wedding features, vendor spotlights, planning guides — plus spaces you won't find anywhere else. The Confessional for anonymous venting. The Grapevine for recommendations and tea. Connect for finding brides in the same city or with the same venue.",
    detail:
      'Live events with industry experts (yes, Marcy Blum). A magazine section featuring real weddings from the platform. Blog categories spanning Planning Tips, Style & Inspiration, Culture & Traditions, and Vendor Spotlights. Think Vogue Weddings meets Reddit, minus the toxicity.',
    scrawl: 'the confessional alone is worth signing up. trust us.',
    cta: { label: 'Join the Circle', href: '/features/community' },
    reverse: false,
    rotation: -1,
    tapes: ['tr'],
    mockup: <CommunityMockup />,
  },
];

export function Features() {
  return (
    <div>
      {FEATURES.map((f) => (
        <ScrollReveal
          key={f.label}
          className={`${styles.strip} ${f.reverse ? styles.reverse : ''}`}
        >
          <div>
            <MockupFrame
              rotation={f.rotation}
              tapes={f.tapes ?? []}
              pin={f.pin ?? null}
            >
              {f.mockup}
            </MockupFrame>
          </div>
          <div className={styles.text}>
            <StickyTag>{f.tag}</StickyTag>
            <div className={styles.label}>{f.label}</div>
            <h3 dangerouslySetInnerHTML={{ __html: f.heading }} />
            <p>{f.body}</p>
            <p className={styles.detail}>{f.detail}</p>
            <ScrawlNote>{f.scrawl}</ScrawlNote>
            {f.cta && (
              <div className="mt-4">
                <ChunkyButton variant="pink" href={f.cta.href}>
                  {f.cta.label}
                </ChunkyButton>
              </div>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
