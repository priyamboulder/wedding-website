'use client';

import Link from 'next/link';
import { TapeStrip } from '@/components/marigold-ui/TapeStrip';
import { PushPin } from '@/components/marigold-ui/PushPin';
import type { WeekOfDiarySummary } from '@/types/week-of';
import styles from './WeekOfCard.module.css';

const PIN_COLORS = ['pink', 'gold', 'red'] as const;

function JournalIcon() {
  return (
    <svg
      className={styles.badgeIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" />
      <path d="M5 4v14" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

function formatMonthYear(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

export function WeekOfCard({
  diary,
  index,
}: {
  diary: WeekOfDiarySummary;
  index: number;
}) {
  // Mirrors the rotation/decoration cadence of WeddingCard so the two
  // card types feel like they belong on the same scrapbook board.
  const rotations = [-1.2, 1, -0.8, 0.8, -1.4, 0.6];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 3 === 0;
  const showPin = index % 3 === 1;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  const monthYear = formatMonthYear(diary.wedding_date);
  const tags = diary.tags.slice(0, 4);

  const coverStyle = diary.cover_image
    ? {
        backgroundImage: `url("${diary.cover_image}")`,
      }
    : undefined;

  return (
    <Link
      href={`/the-week-of/${diary.id}`}
      className={styles.card}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Read ${diary.title}`}
    >
      {showTape && <TapeStrip position="tr" />}
      {showPin && <PushPin color={pinColor} position="center" />}
      <div className={styles.polaroid}>
        <div
          className={`${styles.cover} ${diary.cover_image ? '' : styles.coverImage}`}
          style={coverStyle}
        >
          <span className={styles.badge}>
            <JournalIcon />
            The Week Of
          </span>
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
              {diary.tags.length > tags.length && (
                <span className={styles.tag}>+{diary.tags.length - tags.length}</span>
              )}
            </div>
          )}
        </div>
        <div className={styles.info}>
          <h3 className={styles.title}>{diary.title}</h3>
          <p className={styles.persona}>{diary.author_persona}</p>
          {(monthYear || diary.location) && (
            <div className={styles.meta}>
              {monthYear && <span>{monthYear}</span>}
              {monthYear && diary.location && <span className={styles.metaDot} aria-hidden="true" />}
              {diary.location && <span>{diary.location}</span>}
              {(monthYear || diary.location) && diary.day_count > 0 && (
                <span className={styles.metaDot} aria-hidden="true" />
              )}
              {diary.day_count > 0 && <span>{diary.day_count} days</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
