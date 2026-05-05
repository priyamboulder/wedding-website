import Link from 'next/link';
import { SectionHeader } from '@/components/marigold/ui/SectionHeader';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import { PushPin, type PinColor } from '@/components/marigold/ui/PushPin';
import { supabase } from '@/lib/supabase/client';
import { fetchActiveOrUpcomingSession } from '@/lib/grapevine-ama/queries';
import styles from './Testimonials.module.css';

type Testimonial = {
  quote: string;
  author: string;
  pin: PinColor;
  tag?: string;
  className: string;
};

const items: Testimonial[] = [
  {
    quote:
      "My photographer literally said 'this is the best brief I've ever received.' I just answered 5 fun questions. The Marigold did the rest.",
    author: 'PRIYA S. — bride, recovering perfectionist',
    pin: 'pink',
    tag: 'obsessed',
    className: styles.sticky1,
  },
  {
    quote:
      "I showed my mom the moodboard feature and she hasn't called me about décor in two weeks. TWO WEEKS. Worth every penny.",
    author: 'AISHA M. — bride, finally at peace',
    pin: 'gold',
    className: styles.sticky2,
  },
  {
    quote:
      'As the mom, I feel SEEN. I have my own login. I can add my suggestions. Nobody can say I wasn\'t involved.',
    author: 'SUNITA AUNTY — momzilla, proudly',
    pin: 'red',
    tag: 'aunty approved',
    className: styles.sticky3,
  },
];

export async function Testimonials() {
  // Promote the live AMA when one's running, otherwise nudge readers into
  // the archive — the section already brands itself "Heard Through the
  // Grapevine," so this connects the testimonial vibe to the actual
  // Grapevine feature.
  const session = await fetchActiveOrUpcomingSession(supabase).catch(() => null);
  const live = session?.status === 'live' ? session : null;

  return (
    <section id="marigold-testimonials" className={styles.section}>
      <SectionHeader
        scrawl="real people, real chaos, real love"
        heading="Heard Through <em>the Grapevine</em>"
        sub="What our couples (and their moms) are saying."
      />
      <div className={styles.board}>
        {items.map((t) => (
          <ScrollReveal key={t.author} className={`${styles.sticky} ${t.className}`}>
            <PushPin color={t.pin} position="center" />
            {t.tag && <span className={styles.tag}>{t.tag}</span>}
            <blockquote className={styles.quote}>{`"${t.quote}"`}</blockquote>
            <div className={styles.author}>{t.author}</div>
          </ScrollReveal>
        ))}
      </div>

      {live ? (
        <Link
          href={`/grapevine/${live.slug}`}
          className={`${styles.tieIn} ${styles.tieInLive}`}
        >
          <span className={`${styles.tieInBadge} ${styles.tieInBadgeLive}`}>
            <span className={styles.tieInDot} aria-hidden="true" />
            Live now
          </span>
          <p className={styles.tieInText}>
            <em>{live.expert_name}</em> is answering your questions
          </p>
          <span className={styles.tieInCta}>Join the AMA →</span>
        </Link>
      ) : (
        <Link href="/blog" className={styles.tieIn}>
          <span className={styles.tieInBadge}>The Grapevine</span>
          <p className={styles.tieInText}>
            Want <em>real answers from real experts?</em>
          </p>
          <span className={styles.tieInCta}>Browse The Grapevine →</span>
        </Link>
      )}
    </section>
  );
}
