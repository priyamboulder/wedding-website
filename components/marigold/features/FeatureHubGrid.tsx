import Link from 'next/link';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import { TapeStrip } from '@/components/marigold/ui/TapeStrip';
import { PushPin } from '@/components/marigold/ui/PushPin';
import styles from './FeatureHubGrid.module.css';

const arrow = (
  <span aria-hidden="true" style={{ marginLeft: 4 }}>
    →
  </span>
);

export function FeatureHubGrid() {
  return (
    <div className={styles.grid}>
      {/* 1 — CHECKLIST */}
      <ScrollReveal className={`${styles.card} ${styles.checklist}`}>
        <TapeStrip position="tl" />
        <TapeStrip position="tr" />
        <div className={styles.eyebrow} style={{ color: 'rgba(255,255,255,0.7)' }}>
          The Checklist
        </div>
        <h3 className={styles.title}>
          582 tasks. <em style={{ color: 'var(--gold-light)' }}>13 phases.</em>
        </h3>
        <p className={styles.body} style={{ color: 'rgba(255,255,255,0.85)' }}>
          The full chronological arc of your wedding, broken into bite-sized tasks. AI suggests
          what's next.
        </p>
        <ul className={styles.bullets} style={{ color: 'rgba(255,255,255,0.78)' }}>
          <li>Foundation, Branding, Bookings, Attire — every phase</li>
          <li>Filter by status, priority, assignee, category</li>
          <li>Each task links to its workspace or vendor</li>
        </ul>
        <span className={styles.scrawl} style={{ color: 'var(--gold-light)' }}>
          it's giving project manager energy
        </span>
        <Link href="/features/checklist" className={styles.cta}>
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
          Curated picks. <em style={{ color: 'var(--pink)' }}>Not a marketplace.</em>
        </h3>
        <p className={styles.body} style={{ color: 'var(--wine)' }}>
          Tell us your date, venue, guests, budget. We build your vendor team.
        </p>
        <ul className={styles.bullets} style={{ color: 'var(--mauve)' }}>
          <li>Filter by tier, travel, destination experience</li>
          <li>Top Match &amp; Rising Star badges</li>
          <li>Vendor Roulette — for the indecisive</li>
        </ul>
        <span className={styles.scrawl} style={{ color: 'var(--pink)' }}>
          no endless WeddingWire scrolling
        </span>
        <Link href="/features/vendors" className={styles.cta}>
          Meet the matchmaker {arrow}
        </Link>
      </ScrollReveal>

      {/* 3 — WORKSPACES (polaroid, wine) */}
      <ScrollReveal className={`${styles.card} ${styles.workspaces}`}>
        <PushPin color="red" position="left" />
        <div className={styles.eyebrow}>Vendor Workspaces</div>
        <h3 className={styles.title}>
          14 spaces. <em>One brief.</em>
        </h3>
        <p className={styles.body}>
          Vibe quizzes, style keywords, moodboards — the brief your vendor reads first.
        </p>
        <ul className={styles.bullets}>
          <li>Photography, Décor, Catering, Music, HMUA &amp; more</li>
          <li>Real-time colour &amp; tone slider</li>
          <li>Palette flows across every workspace</li>
        </ul>
        <span className={styles.scrawl}>vendors will think you hired a planner</span>
        <Link href="/features/workspaces" className={styles.cta}>
          Step inside {arrow}
        </Link>
      </ScrollReveal>

      {/* 4 — GUESTS (sticky note) */}
      <ScrollReveal className={`${styles.card} ${styles.guests}`}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 18,
            background: 'rgba(212,83,126,0.18)',
            borderBottom: '1px dashed rgba(75,21,40,0.12)',
          }}
        />
        <div className={styles.eyebrow} style={{ marginTop: 8 }}>
          Guest Management
        </div>
        <h3 className={styles.title}>
          Bride side. <em>Groom side.</em>
        </h3>
        <p className={styles.body}>
          Per-event RSVPs. AI suggests who you forgot. Your mom can stop keeping a parallel list.
        </p>
        <span className={styles.scrawl}>aunty IS keeping score</span>
        <Link href="/features/guests" className={styles.cta}>
          Track every guest {arrow}
        </Link>
      </ScrollReveal>

      {/* 5 — REGISTRY (postcard) */}
      <ScrollReveal className={`${styles.card} ${styles.registry}`}>
        <TapeStrip position="center" />
        <div className={styles.eyebrow}>Registry</div>
        <h3 className={styles.title}>
          Honeymoon. <em>Shagun.</em>
        </h3>
        <p className={styles.body}>
          Public registry, honeymoon fund, shagun pool, thank-you tracker.
        </p>
        <Link href="/features/registry" className={styles.cta}>
          See the vault {arrow}
        </Link>
      </ScrollReveal>

      {/* 6 — STUDIO (notebook with stamp) */}
      <ScrollReveal className={`${styles.card} ${styles.studio}`}>
        <PushPin color="gold" position="right" />
        <div className={styles.stamp} aria-hidden="true">
          with love
        </div>
        <div className={styles.eyebrow}>The Studio</div>
        <h3 className={styles.title}>
          One brand. <em>Every surface.</em>
        </h3>
        <p className={styles.body}>
          Monogram, logo, palette, typography — cascading to every surface of your wedding.
        </p>
        <ul className={styles.bullets}>
          <li>Website, Invitations, Print &amp; Signage</li>
          <li>Outfit Style Guide</li>
          <li>Photo albums, Content Studio, Magazine keepsakes</li>
        </ul>
        <span className={styles.scrawl}>rajwara rose · editorial house</span>
        <Link href="/features/studio" className={styles.cta}>
          Open the studio {arrow}
        </Link>
      </ScrollReveal>

      {/* 7 — COMMUNITY (folded corner) */}
      <ScrollReveal className={`${styles.card} ${styles.community}`}>
        <PushPin color="blue" position="left" />
        <span className={styles.fold} aria-hidden="true" />
        <div className={styles.eyebrow}>The Planning Circle</div>
        <h3 className={styles.title}>
          Not a forum. <em>A community.</em>
        </h3>
        <p className={styles.body}>
          Editorial, real weddings, The Confessional, The Grapevine, live AMAs.
        </p>
        <ul className={styles.bullets}>
          <li>Anonymous venting. Recommendations &amp; tea.</li>
          <li>Find brides in your city or with your venue</li>
          <li>Live events with industry experts</li>
        </ul>
        <span className={styles.scrawl}>the confessional alone is worth it</span>
        <Link href="/features/community" className={styles.cta}>
          Join the circle {arrow}
        </Link>
      </ScrollReveal>
    </div>
  );
}
