import Link from 'next/link';
import { SectionHeader } from '@/components/marigold/ui/SectionHeader';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import { TapeStrip } from '@/components/marigold/ui/TapeStrip';
import { PushPin } from '@/components/marigold/ui/PushPin';
import { ScrawlNote } from '@/components/marigold/ui/ScrawlNote';
import styles from './ScrapbookGrid.module.css';

const arrow = (
  <span aria-hidden="true" style={{ marginLeft: 4 }}>
    →
  </span>
);

export function ScrapbookGrid() {
  return (
    <section
      id="features"
      className="relative px-6 md:px-10"
      style={{ paddingTop: 100, paddingBottom: 100 }}
    >
      <SectionHeader
        scrawl="okay here's what you're actually getting"
        heading="The <em>Full Picture</em>"
        sub="Seven modules. One platform. Zero boring spreadsheets."
      />

      <div className={styles.grid}>
        {/* 1 — CHECKLIST */}
        <ScrollReveal className={`${styles.card} ${styles.checklist}`}>
          <TapeStrip position="tl" />
          <TapeStrip position="tr" />
          <div className={styles.eyebrow} style={{ color: 'rgba(255,255,255,0.7)' }}>
            The Checklist
          </div>
          <h3 className={styles.title}>
            582 tasks. <i style={{ color: 'var(--gold-light)' }}>13 phases.</i>
          </h3>
          <p className={styles.body} style={{ color: 'rgba(255,255,255,0.85)' }}>
            From "discuss overall wedding vision" to "confirm the baraat horse." AI suggests what's
            next.
          </p>
          <span className={styles.scrawlNote} style={{ color: 'var(--gold-light)' }}>
            it's giving project manager energy
          </span>
          <Link href="/features/checklist" className={`${styles.cta} cta`}>
            Explore the checklist {arrow}
          </Link>
        </ScrollReveal>

        {/* 2 — VENDORS */}
        <ScrollReveal className={`${styles.card} ${styles.vendors}`}>
          <PushPin color="pink" position="center" />
          <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
            Vendor Hub
          </div>
          <h3 className={styles.title}>
            Curated picks. <i style={{ color: 'var(--pink)' }}>Not a marketplace.</i>
          </h3>
          <p className={styles.body} style={{ color: 'var(--mauve)' }}>
            Curated picks based on YOUR wedding. Not a marketplace with 50,000 listings.
          </p>
          <ScrawlNote>vendor roulette is a real thing</ScrawlNote>
          <Link href="/features/vendors" className={`${styles.cta} cta`}>
            Meet the matchmaker {arrow}
          </Link>
        </ScrollReveal>

        {/* 3 — WORKSPACES */}
        <ScrollReveal className={`${styles.card} ${styles.workspaces}`}>
          <PushPin color="red" position="left" />
          <div className={styles.eyebrow} style={{ color: 'var(--hot-pink)' }}>
            Vendor Workspaces
          </div>
          <h3 className={styles.title}>
            <i style={{ color: 'var(--hot-pink)' }}>12</i> dedicated spaces.
          </h3>
          <p className={styles.body} style={{ color: 'rgba(255,255,255,0.7)' }}>
            12 dedicated spaces. Vibe quiz. Style keywords. Moodboards. The Brief your vendor reads
            first.
          </p>
          <span className={styles.scrawlNote} style={{ color: 'var(--hot-pink)' }}>
            vendors will think you hired a planner
          </span>
          <Link href="/features/workspaces" className={`${styles.cta} cta`}>
            Step inside {arrow}
          </Link>
        </ScrollReveal>

        {/* 4 — GUESTS */}
        <ScrollReveal className={`${styles.card} ${styles.guests}`}>
          <div className={styles.guestsPreview} aria-hidden="true" />
          <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
            Guest Management
          </div>
          <h3 className={styles.title}>
            Bride side. <i style={{ color: 'var(--pink)' }}>Groom side.</i>
          </h3>
          <p className={styles.body} style={{ color: 'var(--mauve)' }}>
            Per-event RSVPs. Bride side, groom side. AI suggests who you forgot.
          </p>
          <Link href="/features/guests" className={`${styles.cta} cta`}>
            Track every guest {arrow}
          </Link>
        </ScrollReveal>

        {/* 5 — REGISTRY */}
        <ScrollReveal className={`${styles.card} ${styles.registry}`}>
          <TapeStrip position="center" />
          <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
            Registry & Gifts
          </div>
          <h3 className={styles.title}>
            Honeymoon fund. <i style={{ color: 'var(--pink)' }}>Shagun pool.</i>
          </h3>
          <p className={styles.body} style={{ color: 'var(--wine)' }}>
            Honeymoon fund. Shagun pool. Thank-you tracker. Top contributors leaderboard.
          </p>
          <ScrawlNote>aunty IS keeping score</ScrawlNote>
          <Link href="/features/registry" className={`${styles.cta} cta`}>
            See the vault {arrow}
          </Link>
        </ScrollReveal>

        {/* 6 — STUDIO */}
        <ScrollReveal className={`${styles.card} ${styles.studio}`}>
          <PushPin color="gold" position="right" />
          <div className={styles.stamp} aria-hidden="true">
            with love
          </div>
          <div className={styles.eyebrow} style={{ color: 'var(--deep-pink)' }}>
            The Studio
          </div>
          <h3 className={styles.title}>
            One brand. <i style={{ color: 'var(--deep-pink)' }}>Every surface.</i>
          </h3>
          <p className={styles.body} style={{ color: 'var(--wine)' }}>
            Monogram. Logo. Palette. Website. Invitations. One brand system, every surface.
          </p>
          <Link href="/features/studio" className={`${styles.cta} cta`}>
            Open the studio {arrow}
          </Link>
        </ScrollReveal>

        {/* 7 — COMMUNITY */}
        <ScrollReveal className={`${styles.card} ${styles.community}`}>
          <PushPin color="blue" position="left" />
          <span className={styles.fold} aria-hidden="true" />
          <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
            The Planning Circle
          </div>
          <h3 className={styles.title}>
            Not a forum. <i style={{ color: 'var(--pink)' }}>A community.</i>
          </h3>
          <p className={styles.body} style={{ color: 'var(--wine)' }}>
            Editorial, real weddings, The Confessional, The Grapevine, live events.
          </p>
          <ScrawlNote>the confessional alone is worth signing up</ScrawlNote>
          <Link href="/features/community" className={`${styles.cta} cta`}>
            Join the circle {arrow}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
