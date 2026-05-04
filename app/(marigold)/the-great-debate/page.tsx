import { supabase } from '@/lib/supabase/client';
import { listPolls, getEngagementStats } from '@/lib/polls/archive';
import { DebatesArchive } from '@/components/the-great-debate/DebatesArchive';
import { pageMetadata } from '@/lib/marigold/seo';
import heroStyles from '@/components/the-great-debate/Hero.module.css';

export const metadata = pageMetadata({
  title: 'The Great Debate — The Marigold',
  description:
    '300 wedding-planning questions, no right answers, plenty of aunty disapproval. Vote on the debates dividing brides, grooms, moms, and aunties everywhere.',
});

// Re-fetch on every request — votes and trending state shift constantly.
export const dynamic = 'force-dynamic';

function Hero({
  totalVotes,
  totalPolls,
}: {
  totalVotes: number;
  totalPolls: number;
}) {
  const formattedVotes = totalVotes.toLocaleString();
  const formattedPolls = totalPolls.toLocaleString();
  return (
    <section className={heroStyles.section}>
      <span className={`${heroStyles.dot} ${heroStyles.dot1}`} aria-hidden="true" />
      <span className={`${heroStyles.dot} ${heroStyles.dot2}`} aria-hidden="true" />
      <span className={`${heroStyles.dot} ${heroStyles.dot3}`} aria-hidden="true" />
      <span className={`${heroStyles.dot} ${heroStyles.dot4}`} aria-hidden="true" />
      <span className={`${heroStyles.ring} ${heroStyles.ring1}`} aria-hidden="true" />
      <span className={`${heroStyles.ring} ${heroStyles.ring2}`} aria-hidden="true" />

      <div className={heroStyles.inner}>
        <p className={heroStyles.subhead}>the great debate</p>
        <h1 className={heroStyles.heading}>
          Where Opinions Go to <em className={heroStyles.headingAccent}>Fight.</em>
        </h1>
        <p className={heroStyles.subtitle}>
          300 questions. No right answers. Plenty of aunty disapproval.
        </p>
        <div className={heroStyles.stats} aria-label="Engagement stats">
          <span>
            <span className={heroStyles.statsNumber}>{formattedVotes}</span> votes cast
          </span>
          <span className={heroStyles.statsDivider} aria-hidden="true" />
          <span>
            across <span className={heroStyles.statsNumber}>{formattedPolls}</span> debates
          </span>
        </div>
      </div>
    </section>
  );
}

export default async function TheGreatDebatePage() {
  let initialPolls: Awaited<ReturnType<typeof listPolls>> = {
    polls: [],
    total_polls: 0,
    has_more: false,
  };
  let stats = { total_votes: 0, total_polls: 0 };

  try {
    [initialPolls, stats] = await Promise.all([
      listPolls(supabase, { sort: 'trending', category: 'all', limit: 20, offset: 0 }),
      getEngagementStats(supabase),
    ]);
  } catch {
    // Fall through to empty state — the archive client also retries.
  }

  return (
    <>
      <Hero totalVotes={stats.total_votes} totalPolls={stats.total_polls} />
      <DebatesArchive
        initialPolls={initialPolls.polls}
        initialHasMore={initialPolls.has_more}
        initialTotalPolls={initialPolls.total_polls}
      />
    </>
  );
}
