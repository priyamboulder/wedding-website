import Link from 'next/link';
import {
  MOOD_COLORS,
  moodLabel,
  type DiaryDay,
  type WeekOfDiary,
} from '@/types/week-of';
import styles from './WeekOfArticle.module.css';

function formatHeroMeta(diary: WeekOfDiary): string | null {
  const parts: string[] = [];
  if (diary.wedding_date) {
    const d = new Date(diary.wedding_date);
    if (!Number.isNaN(d.getTime())) {
      parts.push(
        d.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
      );
    }
  }
  if (diary.location) parts.push(diary.location.toUpperCase());
  if (diary.guest_count) parts.push(`${diary.guest_count} GUESTS`);
  return parts.length > 0 ? parts.join('  ·  ') : null;
}

function DaySection({ day }: { day: DiaryDay }) {
  const colors = MOOD_COLORS[day.mood] ?? MOOD_COLORS.peaceful;
  return (
    <article className={styles.day}>
      <div className={styles.dayHeader}>
        Day {day.day_number} — {day.day_of_week}
      </div>
      <h2 className={styles.dayTitle}>{day.title}</h2>
      <span
        className={styles.moodPill}
        style={{ background: colors.bg, color: colors.fg }}
      >
        <span className={styles.moodDot} aria-hidden="true" />
        {moodLabel(day.mood)}
      </span>
      <p className={styles.body}>{day.body}</p>
      {day.pull_quote && (
        <blockquote className={styles.pullQuote}>
          <p className={styles.pullQuoteText}>&ldquo;{day.pull_quote}&rdquo;</p>
        </blockquote>
      )}
      {day.image_url && (
        <img
          className={styles.dayPhoto}
          src={day.image_url}
          alt={`${day.title} — Day ${day.day_number}`}
          loading="lazy"
        />
      )}
    </article>
  );
}

export function WeekOfArticle({ diary }: { diary: WeekOfDiary }) {
  const heroMeta = formatHeroMeta(diary);
  const heroStyle = diary.cover_image
    ? { backgroundImage: `url("${diary.cover_image}")` }
    : undefined;

  return (
    <div className={styles.page}>
      <header
        className={`${styles.hero} ${diary.cover_image ? styles.heroWithImage : ''}`}
        style={heroStyle}
      >
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            The Week Of
            <span className={styles.eyebrowDot} aria-hidden="true" />
            A Diary
          </div>
          <h1 className={styles.heroTitle}>{diary.title}</h1>
          {heroMeta && <div className={styles.heroMeta}>{heroMeta}</div>}
        </div>
      </header>

      <section className={styles.personaBar}>
        <div className={styles.personaInner}>
          <span className={styles.personaLabel}>Written by</span>
          <p className={styles.personaText}>{diary.author_persona}</p>
        </div>
      </section>

      {diary.intro_text && (
        <p className={styles.intro}>{diary.intro_text}</p>
      )}

      <section className={styles.days}>
        {diary.days.map((day) => (
          <DaySection key={`${day.day_number}-${day.title}`} day={day} />
        ))}

        <div className={styles.endmark}>· End of Week ·</div>
        <div className={styles.backLinkWrap}>
          <Link href="/blog" className={styles.backLink}>
            ← Back to The Planning Circle
          </Link>
        </div>
      </section>
    </div>
  );
}
