import { createAnonClient } from '@/lib/supabase/server-client';
import { getFeaturedPoll } from '@/lib/polls/queries';
import { DailyDebatePoll } from './DailyDebatePoll';
import styles from './DailyDebate.module.css';

export async function DailyDebate() {
  let snapshot: Awaited<ReturnType<typeof getFeaturedPoll>> = null;
  try {
    const supabase = createAnonClient();
    snapshot = await getFeaturedPoll(supabase);
  } catch {
    return null;
  }
  if (!snapshot) return null;

  return (
    <section className={styles.section} aria-labelledby="daily-debate-question">
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot6}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

      <div className={styles.inner}>
        <DailyDebatePoll
          poll={snapshot.poll}
          initialCounts={snapshot.counts}
          initialTotal={snapshot.total}
        />
      </div>
    </section>
  );
}
