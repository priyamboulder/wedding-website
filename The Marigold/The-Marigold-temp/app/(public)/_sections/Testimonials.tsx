import { PushPin, type PinColor } from '@/components/ui/PushPin';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import styles from './Testimonials.module.css';

type Testimonial = {
  quote: string;
  author: string;
  pin: PinColor;
  tag?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "\"My photographer literally said 'this is the best brief I've ever received.' I just answered 5 fun questions. The Marigold did the rest.\"",
    author: 'PRIYA S. — bride, recovering perfectionist',
    pin: 'pink',
    tag: 'obsessed',
  },
  {
    quote:
      '"I showed my mom the moodboard feature and she hasn\'t called me about décor in two weeks. TWO WEEKS. Worth every penny."',
    author: 'AISHA M. — bride, finally at peace',
    pin: 'gold',
  },
  {
    quote:
      '"As the mom, I feel SEEN. I have my own login. I can add my suggestions. Nobody can say I wasn\'t involved."',
    author: 'SUNITA AUNTY — momzilla, proudly',
    pin: 'red',
    tag: 'aunty approved',
  },
];

export function Testimonials() {
  return (
    <section className={styles.section}>
      <SectionHeader
        scrawl="real people, real chaos, real love"
        heading="Heard Through <em>the Grapevine</em>"
        sub="What our couples (and their moms) are saying."
      />
      <div className={styles.board}>
        {TESTIMONIALS.map((t, i) => (
          <ScrollReveal key={i} className={`${styles.sticky} ${styles[`sticky${i + 1}`]}`}>
            <PushPin color={t.pin} position="center" />
            {t.tag && <span className={styles.tag}>{t.tag}</span>}
            <blockquote>{t.quote}</blockquote>
            <div className={styles.auth}>{t.author}</div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
