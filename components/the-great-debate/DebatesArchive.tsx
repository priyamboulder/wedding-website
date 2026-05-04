'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { ArchiveSort, PollWithCounts } from '@/lib/polls/archive';
import type { PollCategory } from '@/types/polls';
import { PollCard } from './PollCard';
import styles from './DebatesArchive.module.css';

type CategoryFilter = PollCategory | 'all';

interface Props {
  initialPolls: PollWithCounts[];
  initialHasMore: boolean;
  initialTotalPolls: number;
}

interface SortOption {
  value: ArchiveSort;
  label: string;
}

const SORTS: SortOption[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'most_votes', label: 'Most Votes' },
  { value: 'newest', label: 'Newest' },
  { value: 'controversial', label: 'Most Controversial' },
];

const CATEGORIES: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'ceremony_traditions', label: 'Ceremony & Traditions' },
  { value: 'guest_experience', label: 'Guest Experience' },
  { value: 'food_drinks', label: 'Food & Drinks' },
  { value: 'fashion_beauty', label: 'Fashion & Beauty' },
  { value: 'photography_video', label: 'Photography & Video' },
  { value: 'music_entertainment', label: 'Music & Entertainment' },
  { value: 'decor_venue', label: 'Décor & Venue' },
  { value: 'budget_planning', label: 'Budget & Planning' },
  { value: 'family_dynamics', label: 'Family Dynamics' },
  { value: 'honeymoon_post_wedding', label: 'Honeymoon' },
  { value: 'invitations_communication', label: 'Invitations' },
  { value: 'modern_vs_traditional', label: 'Modern vs Traditional' },
  { value: 'spicy_hot_takes', label: 'Spicy Hot Takes 🔥' },
  { value: 'would_you_ever', label: 'Would You Ever' },
  { value: 'this_or_that', label: 'This or That' },
];

const PAGE_SIZE = 20;

export function DebatesArchive({
  initialPolls,
  initialHasMore,
}: Props) {
  const [sort, setSort] = useState<ArchiveSort>('trending');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [polls, setPolls] = useState<PollWithCounts[]>(initialPolls);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Track an in-flight request so a quick filter change cancels stale results.
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (
      nextSort: ArchiveSort,
      nextCategory: CategoryFilter,
      offset: number,
    ) => {
      const params = new URLSearchParams({
        sort: nextSort,
        category: nextCategory,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const res = await fetch(`/api/polls/list?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      return (await res.json()) as {
        polls: PollWithCounts[];
        has_more: boolean;
        total_polls: number;
      };
    },
    [],
  );

  const reload = useCallback(
    async (nextSort: ArchiveSort, nextCategory: CategoryFilter) => {
      const id = ++requestIdRef.current;
      setLoading(true);
      try {
        const result = await fetchPage(nextSort, nextCategory, 0);
        if (id !== requestIdRef.current) return;
        setPolls(result.polls);
        setHasMore(result.has_more);
      } catch {
        if (id === requestIdRef.current) {
          setPolls([]);
          setHasMore(false);
        }
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    },
    [fetchPage],
  );

  // Re-fetch whenever sort or category changes (skip the initial render which
  // is already populated server-side with sort=trending/category=all).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    void reload(sort, category);
  }, [sort, category, reload]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchPage(sort, category, polls.length);
      setPolls((prev) => [...prev, ...result.polls]);
      setHasMore(result.has_more);
    } catch {
      // Surface nothing — user can retry with the button.
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, polls.length, sort, category]);

  return (
    <section className={styles.wrap} aria-label="Debate archive">
      <div className={styles.inner}>
        <div className={styles.sortBar} role="tablist" aria-label="Sort polls">
          {SORTS.map((s, i) => (
            <Fragment key={s.value}>
              {i > 0 && <span className={styles.sortDivider} aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={sort === s.value}
                className={`${styles.sortBtn} ${
                  sort === s.value ? styles.sortBtnActive : ''
                }`}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </button>
            </Fragment>
          ))}
        </div>

        <div className={styles.filterRow} role="tablist" aria-label="Categories">
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {polls.length === 0 && !loading ? (
          <p className={styles.empty}>
            No debates in this category yet — try another shelf.
          </p>
        ) : (
          <div className={`${styles.grid} ${loading ? styles.gridLoading : ''}`}>
            {polls.map((p) => (
              <PollCard key={p.id} poll={p} />
            ))}
          </div>
        )}

        {hasMore && polls.length > 0 && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.loadMore}
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
