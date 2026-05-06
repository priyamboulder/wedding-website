import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import styles from './DesignYourWorld.module.css';

type Template = {
  name: string;
  vibe: string;
  href: string;
  variant: 'classic' | 'modern' | 'maximalist';
};

const TEMPLATES: Template[] = [
  {
    name: 'The Classic',
    vibe: 'ivory · serif · timeless',
    href: '/studio/templates/classic',
    variant: 'classic',
  },
  {
    name: 'The Modern',
    vibe: 'editorial · airy · sans-serif',
    href: '/studio/templates/modern',
    variant: 'modern',
  },
  {
    name: 'The Maximalist',
    vibe: 'jewel tones · borders · ornate',
    href: '/studio/templates/maximalist',
    variant: 'maximalist',
  },
];

type Invite = {
  event: string;
  date: string;
  variant: 'mehendi' | 'sangeet' | 'wedding';
  ornament: string;
};

const INVITES: Invite[] = [
  { event: 'Mehendi',  date: 'Twelve · Three',     variant: 'mehendi',  ornament: '✺' },
  { event: 'Sangeet',  date: 'Thirteen · Three',   variant: 'sangeet',  ornament: '❉' },
  { event: 'The Wedding', date: 'Fourteen · Three', variant: 'wedding',  ornament: '✦' },
];

type Mono = {
  name: string;
  render: ReactNode;
};

const MONOGRAMS: Mono[] = [
  {
    name: 'Rose',
    render: <span className={styles.monoRose}>R&amp;A</span>,
  },
  {
    name: 'Malin',
    render: (
      <span className={styles.monoMalin}>
        <span>R</span>
        <span>A</span>
      </span>
    ),
  },
  {
    name: 'Acadia',
    render: <span className={styles.monoAcadia}>R&amp;A</span>,
  },
  {
    name: 'Gianna',
    render: (
      <span className={styles.monoGianna}>
        <span>R</span>
        <span className={styles.monoGiannaLine} aria-hidden="true" />
        <span>A</span>
      </span>
    ),
  },
  {
    name: 'Cybil',
    render: (
      <span className={styles.monoCybil}>
        R<span className={styles.monoCybilAmp}>&amp;</span>A
      </span>
    ),
  },
  {
    name: 'Chloe',
    render: (
      <span className={styles.monoChloe}>
        R&amp;A
        <span className={styles.monoChloeFlourish} aria-hidden="true" />
      </span>
    ),
  },
];

type Freebie = {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
};

const FREEBIES: Freebie[] = [
  {
    icon: '✦',
    title: 'Monogram Preview',
    description: 'See your initials in all 6 styles. Instant download.',
    cta: 'Download free',
    href: '/studio/monogram-preview',
  },
  {
    icon: '🎨',
    title: 'Colour Palette Generator',
    description: 'Input your lehenga colour, get a full wedding palette.',
    cta: 'Try it free',
    href: '/tools/palette',
  },
  {
    icon: '📋',
    title: 'Guest List Template',
    description: 'The spreadsheet your mom will actually understand.',
    cta: 'Download free',
    href: '/tools/guest-list-template',
  },
  {
    icon: '⏰',
    title: 'Day-Of Timeline',
    description: 'Baraat at 10am. Ceremony by 11. Cocktails by… we’ll figure it out.',
    cta: 'Download free',
    href: '/tools/day-of-timeline',
  },
];

const DOTS: { top: string; left: string; size: number; tone: 'gold' | 'pink' | 'blush' }[] = [
  { top: '6%',  left: '8%',  size: 8, tone: 'pink'  },
  { top: '14%', left: '92%', size: 6, tone: 'gold'  },
  { top: '32%', left: '4%',  size: 7, tone: 'gold'  },
  { top: '46%', left: '95%', size: 8, tone: 'blush' },
  { top: '60%', left: '6%',  size: 6, tone: 'pink'  },
  { top: '72%', left: '90%', size: 7, tone: 'gold'  },
  { top: '86%', left: '10%', size: 8, tone: 'blush' },
  { top: '92%', left: '88%', size: 6, tone: 'pink'  },
];

const TONE_CLASS = {
  gold:  styles.dotGold,
  pink:  styles.dotPink,
  blush: styles.dotBlush,
} as const;

export function DesignYourWorld() {
  return (
    <section
      id="design-your-world"
      className={styles.section}
      aria-labelledby="design-your-world-heading"
    >
      {DOTS.map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={[styles.dot, TONE_CLASS[d.tone]].join(' ')}
          style={
            {
              top: d.top,
              left: d.left,
              width: `${d.size}px`,
              height: `${d.size}px`,
            } as CSSProperties
          }
        />
      ))}

      <div className={styles.inner}>
        {/* ─── Top header ──────────────────────────── */}
        <div className={styles.topHeader}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowOrn} aria-hidden="true">✦</span>
            your wedding, your brand
            <span className={styles.eyebrowOrn} aria-hidden="true">✦</span>
          </span>
          <h2 id="design-your-world-heading" className={styles.heading}>
            Design Your <em className={styles.headingEm}>Entire</em> Wedding Identity.
          </h2>
          <p className={styles.subhead}>
            Your monogram. Your website. Your invitations. Your save-the-dates.
            All designed in one place — and they actually match.
          </p>
        </div>

        {/* ─── 1. Wedding Websites ─────────────────── */}
        <div className={styles.sub}>
          <div className={styles.subHeader}>
            <h3 className={styles.subTitle}>
              A wedding website that doesn&rsquo;t look like <em>everyone else&rsquo;s</em>.
            </h3>
          </div>

          <div className={styles.templateRow}>
            {TEMPLATES.map((t) => (
              <Link key={t.variant} href={t.href} className={styles.templateCard}>
                <div
                  className={[styles.templateMockup, styles[t.variant]].join(' ')}
                  aria-hidden="true"
                >
                  {t.variant === 'classic' && (
                    <>
                      <div className={styles.mockHeader}>Save the date</div>
                      <div>
                        <div className={styles.mockOrn}>✦ ✦ ✦</div>
                        <div className={styles.mockTitle}>Riya &amp; Arjun</div>
                        <div className={styles.mockBlock} />
                        <div className={styles.mockSub} style={{ marginTop: 12 }}>
                          November · Twenty Twenty-Six
                        </div>
                      </div>
                      <div className={styles.mockMeta}>Udaipur · India</div>
                    </>
                  )}

                  {t.variant === 'modern' && (
                    <>
                      <div className={styles.mockHeader}>R · A &mdash; 11.26</div>
                      <div className={styles.mockTitle}>
                        riya
                        <br />
                        <b>+ arjun</b>
                      </div>
                      <div className={styles.mockSub}>
                        a five-day shaadi in udaipur.
                      </div>
                      <div className={styles.mockBars}>
                        <span className={styles.mockBar} />
                        <span className={styles.mockBar} />
                        <span className={styles.mockBar} />
                      </div>
                    </>
                  )}

                  {t.variant === 'maximalist' && (
                    <>
                      <span className={styles.mockMotif} aria-hidden="true" />
                      <div className={styles.mockHeader}>the wedding of</div>
                      <div>
                        <div className={styles.mockTitle}>Riya &amp; Arjun</div>
                        <div className={styles.mockOrn}>❀ ✦ ❀</div>
                        <div className={styles.mockSub}>nov · twenty-six</div>
                      </div>
                      <div className={styles.mockHeader}>udaipur, india</div>
                    </>
                  )}
                </div>

                <div className={styles.templateMeta}>
                  <span className={styles.templateName}>{t.name}</span>
                  <span className={styles.templateVibe}>{t.vibe}</span>
                  <span className={styles.templatePreview}>Preview →</span>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.quip}>
            <span className={styles.quipBar} aria-hidden="true" />
            <span>finally, a wedding website your guests will actually visit</span>
          </div>

          <div className={styles.ctaRow}>
            <Link href="/studio/website" className={styles.cta}>
              Build your website
              <span className={styles.ctaArrow} aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* ─── 2. Digital Invitations ──────────────── */}
        <div className={styles.sub}>
          <div className={styles.subHeader}>
            <h3 className={styles.subTitle}>
              Send <em>stunning</em> invitations &mdash; no postage required.
            </h3>
            <p className={styles.subBlurb}>
              Match your moodboard. Send via link or WhatsApp. Track RSVPs in real time.
              Your aunties will still ask if you got their reply.
            </p>
          </div>

          <div className={styles.invitesRow}>
            {INVITES.map((inv) => {
              const variantClass =
                inv.variant === 'mehendi' ? styles.inviteMehendi
                : inv.variant === 'sangeet' ? styles.inviteSangeet
                : styles.inviteWedding;
              return (
                <div key={inv.variant} className={styles.invite}>
                  <div className={[styles.inviteFrame, variantClass].join(' ')}>
                    <span className={styles.inviteOrn} aria-hidden="true">{inv.ornament}</span>
                    <span className={styles.inviteEvent}>{inv.event}</span>
                    <span className={styles.inviteCouple}>R &nbsp;·&nbsp; A</span>
                    <span className={styles.inviteDivider} aria-hidden="true" />
                    <span className={styles.inviteDate}>{inv.date}</span>
                  </div>
                  <div className={styles.inviteCaption}>
                    {inv.variant === 'mehendi' && 'henna · haldi · home'}
                    {inv.variant === 'sangeet' && 'dhol · dance · drama'}
                    {inv.variant === 'wedding' && 'pheras at sunset'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.ctaRow}>
            <Link href="/studio/invitations" className={styles.cta}>
              Explore invitations
              <span className={styles.ctaArrow} aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* ─── 3. Monogram Designer ────────────────── */}
        <div className={styles.sub}>
          <div className={styles.subHeader}>
            <h3 className={styles.subTitle}>
              Your monogram. <em>Everywhere.</em>
            </h3>
            <p className={styles.subBlurb}>
              Design it once in the Studio. It cascades to your website, invitations,
              signage, and print &mdash; with per-design overrides wherever you need them.
            </p>
          </div>

          <div className={styles.monoGrid}>
            {MONOGRAMS.map((m) => (
              <div key={m.name} className={styles.monoCard}>
                <div className={styles.monoMark} aria-hidden="true">{m.render}</div>
                <div className={styles.monoLabel}>{m.name}</div>
              </div>
            ))}
          </div>

          <div className={styles.quip}>
            <span className={styles.quipBar} aria-hidden="true" />
            <span>it&rsquo;s giving custom stationery suite without the $4,000 price tag</span>
          </div>

          <div className={styles.ctaRow}>
            <Link href="/studio/monogram" className={styles.cta}>
              Design your monogram
              <span className={styles.ctaArrow} aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* ─── 4. Free downloads / bonus shelf ─────── */}
        <div className={styles.bonusShelf}>
          <span className={styles.bonusTag}>The Free Shelf</span>

          <div className={styles.subHeader}>
            <h3 className={styles.subTitle}>
              Free things. Because <em>shaadi</em> is expensive enough.
            </h3>
          </div>

          <div className={styles.freebiesRow}>
            {FREEBIES.map((f) => (
              <Link key={f.title} href={f.href} className={styles.freebie}>
                <span className={styles.freebieIcon} aria-hidden="true">{f.icon}</span>
                <span className={styles.freebieTitle}>{f.title}</span>
                <span className={styles.freebieDesc}>{f.description}</span>
                <span className={styles.freebieCta}>{f.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
