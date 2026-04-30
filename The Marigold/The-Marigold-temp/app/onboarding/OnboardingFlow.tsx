'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { FloatingConfessions } from '@/components/sections/FloatingConfessions';
import styles from './OnboardingFlow.module.css';

const FIRST_NAME = 'Anjali';
const TOTAL_SCREENS = 6;

const EVENTS = [
  'Engagement Party',
  'Pithi',
  'Haldi',
  'Mehendi',
  'Sangeet',
  'Nikkah',
  'Ceremony',
  'Cocktail Hour',
  'Reception',
  'After-party',
  'Welcome Dinner',
  'Farewell Brunch',
];

const GUEST_BUCKETS = ['<100', '100–200', '200–300', '300–500', '500+'] as const;

type VibeKey = 'grand' | 'modern' | 'romantic' | 'bold';

const VIBES: {
  key: VibeKey;
  title: string;
  blurb: string;
  thumb: string;
  keywords: string[];
}[] = [
  {
    key: 'grand',
    title: 'Grand & Traditional',
    blurb: 'rich colors, gold accents, ornate',
    thumb: 'linear-gradient(135deg, #993556 0%, #D4A853 100%)',
    keywords: ['regal', 'ornate', 'gold-leaf', 'rajwara'],
  },
  {
    key: 'modern',
    title: 'Modern & Minimal',
    blurb: 'clean lines, muted palette, understated',
    thumb: 'linear-gradient(135deg, #E0D0F0 0%, #FFF8F2 60%, #C8DFF5 100%)',
    keywords: ['editorial', 'restrained', 'muted', 'architectural'],
  },
  {
    key: 'romantic',
    title: 'Romantic & Whimsical',
    blurb: 'soft colors, garden vibes, dreamy',
    thumb: 'linear-gradient(135deg, #FBEAF0 0%, #FFD8B8 50%, #C8EDDA 100%)',
    keywords: ['garden', 'dreamy', 'film-grain', 'pastel'],
  },
  {
    key: 'bold',
    title: 'Bold & Eclectic',
    blurb: 'mixed patterns, unexpected pairings, maximalist',
    thumb: 'linear-gradient(135deg, #ED93B1 0%, #D4A853 50%, #4B1528 100%)',
    keywords: ['maximalist', 'clashing-prints', 'electric', 'block-print'],
  },
];

const PRIORITIES_INITIAL = [
  'Venue & Date',
  'Photography & Video',
  'Outfits & Styling',
  'Food & Catering',
  'Guest Management',
  'D\u00e9cor & Florals',
  'Music & Entertainment',
  'Budget & Planning',
];

function ScreenDots({ current, onJump, scrapbook }: {
  current: number;
  onJump: (i: number) => void;
  scrapbook: boolean;
}) {
  return (
    <div className={styles.dots} aria-label="Onboarding progress">
      {Array.from({ length: TOTAL_SCREENS }).map((_, i) => {
        const active = i === current;
        const cls = [
          styles.dot,
          scrapbook ? styles.dotScrapbook : styles.dotBackend,
          active && (scrapbook ? styles.dotScrapbookActive : styles.dotBackendActive),
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={i}
            type="button"
            className={cls}
            aria-label={`Go to step ${i + 1}`}
            aria-current={active ? 'step' : undefined}
            onClick={() => onJump(i)}
          />
        );
      })}
    </div>
  );
}

function SkipLink({ scrapbook, onSkip }: { scrapbook: boolean; onSkip: () => void }) {
  const cls = [styles.skip, scrapbook ? styles.skipScrapbook : styles.skipBackend].join(' ');
  return (
    <button type="button" className={cls} onClick={onSkip}>
      Skip setup &rarr;
    </button>
  );
}

/* -------------------- Screen 1 -------------------- */
function ScreenWelcome({ onNext }: { onNext: () => void }) {
  return (
    <section className={`${styles.screen} ${styles.welcomeBg}`}>
      <FloatingConfessions />
      <div className={`${styles.welcomeWrap} ${styles.fadeIn}`}>
        <span className={styles.welcomeScrawl}>okay deep breath</span>
        <h1 className={styles.welcomeHeading}>
          Welcome to The Marigold,{' '}
          <i className={styles.welcomeHeadingItalic}>{FIRST_NAME}.</i>
        </h1>
        <div className={styles.welcomeSub}>
          your wedding planning era officially starts now
        </div>
        <p className={styles.welcomeBody}>
          We&apos;re going to ask you a few quick questions to set up your wedding workspace.
          Takes about 2 minutes. We promise it&apos;s painless.
        </p>
        <ChunkyButton variant="white" onClick={onNext}>
          Let&apos;s Go
        </ChunkyButton>
      </div>
    </section>
  );
}

/* -------------------- Screen 2 -------------------- */
type BasicsState = {
  partner1: string;
  partner2: string;
  date: string;
  noDate: boolean;
  location: string;
  noLocation: boolean;
  guests: number; // index into GUEST_BUCKETS
};

function ScreenBasics({
  state,
  setState,
  onNext,
}: {
  state: BasicsState;
  setState: (s: BasicsState) => void;
  onNext: () => void;
}) {
  const canContinue =
    state.partner1.trim().length > 0 &&
    state.partner2.trim().length > 0;

  return (
    <section className={styles.splitWrap}>
      <div className={styles.splitLeft}>
        <div className={`${styles.fadeIn}`}>
          <div className={styles.splitLeftScrawl}>
            the boring
            <br />
            stuff first
          </div>
          <div className={styles.splitLeftSub}>2 minutes, promise</div>
        </div>
      </div>

      <div className={styles.splitRight}>
        <div className={`${styles.formWrap} ${styles.fadeIn}`}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>What should we call you two?</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="Partner 1 name"
                value={state.partner1}
                onChange={(e) => setState({ ...state, partner1: e.target.value })}
              />
              <input
                type="text"
                className={styles.input}
                placeholder="Partner 2 name"
                value={state.partner2}
                onChange={(e) => setState({ ...state, partner2: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>When&apos;s the big day?</label>
            <input
              type="date"
              className={styles.input}
              value={state.date}
              disabled={state.noDate}
              onChange={(e) => setState({ ...state, date: e.target.value })}
            />
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={state.noDate}
                onChange={(e) =>
                  setState({ ...state, noDate: e.target.checked, date: e.target.checked ? '' : state.date })
                }
              />
              We haven&apos;t decided yet
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Where are you getting married?</label>
            <input
              type="text"
              className={styles.input}
              placeholder="City, venue, or vibe"
              value={state.location}
              disabled={state.noLocation}
              onChange={(e) => setState({ ...state, location: e.target.value })}
            />
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={state.noLocation}
                onChange={(e) =>
                  setState({ ...state, noLocation: e.target.checked, location: e.target.checked ? '' : state.location })
                }
              />
              Not sure yet
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>How many guests (roughly)?</label>
            <div className={styles.segmented}>
              {GUEST_BUCKETS.map((b, i) => (
                <button
                  key={b}
                  type="button"
                  className={`${styles.segment} ${i === state.guests ? styles.segmentActive : ''}`}
                  onClick={() => setState({ ...state, guests: i })}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.backendBtn}
              disabled={!canContinue}
              onClick={onNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Screen 3 -------------------- */
function ScreenEvents({
  selected,
  toggle,
  onNext,
}: {
  selected: Set<string>;
  toggle: (e: string) => void;
  onNext: () => void;
}) {
  return (
    <section className={`${styles.screen} ${styles.creamBg}`}>
      <div className={`${styles.contentWrap} ${styles.fadeIn}`}>
        <h2 className={styles.heading}>What events are you planning?</h2>
        <p className={styles.subline}>
          Tap all that apply. You can always add or remove later.
        </p>

        <div className={styles.chipGrid}>
          {EVENTS.map((e) => {
            const active = selected.has(e);
            return (
              <button
                key={e}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                onClick={() => toggle(e)}
                aria-pressed={active}
              >
                {e}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 28 }}>
          <span className={styles.scrawlNote}>
            don&apos;t worry, you don&apos;t have to plan them all at once
          </span>
        </div>

        <button
          type="button"
          className={styles.backendBtn}
          onClick={onNext}
          disabled={selected.size === 0}
        >
          Next
        </button>
      </div>
    </section>
  );
}

/* -------------------- Screen 4 -------------------- */
function ScreenVibe({
  vibe,
  setVibe,
  onNext,
}: {
  vibe: VibeKey | null;
  setVibe: (v: VibeKey) => void;
  onNext: () => void;
}) {
  return (
    <section className={`${styles.screen} ${styles.creamBg}`} style={{ position: 'relative' }}>
      <div className={styles.pinkAccent} aria-hidden="true" />
      <div className={`${styles.contentWrap} ${styles.fadeIn}`}>
        <h2 className={styles.heading}>How would you describe your wedding vibe?</h2>
        <p className={styles.subline}>
          Pick the one that&apos;s closest. We&apos;ll seed your workspace with starter style
          keywords and a suggested palette.
        </p>

        <div className={styles.vibeGrid}>
          {VIBES.map((v) => {
            const active = vibe === v.key;
            return (
              <button
                key={v.key}
                type="button"
                className={`${styles.vibeCard} ${active ? styles.vibeCardActive : ''}`}
                onClick={() => setVibe(v.key)}
                aria-pressed={active}
              >
                <div
                  className={styles.vibeThumb}
                  style={{ background: v.thumb }}
                  aria-hidden="true"
                />
                <div className={styles.vibeTitle}>{v.title}</div>
                <div style={{ fontSize: 12, color: 'var(--mauve)', marginBottom: 10 }}>
                  {v.blurb}
                </div>
                <div className={styles.vibeKeywords}>
                  {v.keywords.map((k) => (
                    <span key={k} className={styles.kw}>
                      + {k}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 24 }}>
          <span className={styles.scrawlNote}>
            you can change everything later — this just gives us a starting point
          </span>
        </div>

        <button
          type="button"
          className={styles.backendBtn}
          onClick={onNext}
          disabled={vibe === null}
        >
          Next
        </button>
      </div>
    </section>
  );
}

/* -------------------- Screen 5 -------------------- */
function ScreenPriorities({
  order,
  setOrder,
  onNext,
}: {
  order: string[];
  setOrder: (s: string[]) => void;
  onNext: () => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (i: number) => (e: React.DragEvent) => {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setOverIndex(i);
  };

  const handleDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) {
      setOverIndex(null);
      return;
    }
    const next = order.slice();
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    dragIndex.current = null;
    setOverIndex(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <section className={`${styles.screen} ${styles.creamBg}`}>
      <div className={`${styles.contentWrap} ${styles.fadeIn}`}>
        <h2 className={styles.heading}>What&apos;s most important to you right now?</h2>
        <p className={styles.subline}>
          Drag to rank. We&apos;ll customize your checklist and surface the top three first.
        </p>

        <ol className={styles.rankList}>
          {order.map((p, i) => {
            const top = i < 3;
            const isOver = overIndex === i;
            return (
              <li
                key={p}
                className={`${styles.rankRow} ${isOver ? styles.dragOver : ''}`}
                draggable
                onDragStart={handleDragStart(i)}
                onDragOver={handleDragOver(i)}
                onDragLeave={() => setOverIndex(null)}
                onDrop={handleDrop(i)}
              >
                <span className={`${styles.rankNum} ${top ? styles.rankNumTop : ''}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.rankLabel}>{p}</span>
                <button
                  type="button"
                  aria-label={`Move ${p} up`}
                  className={styles.btnGhost}
                  onClick={() => move(i, -1)}
                  style={{ padding: '6px 8px' }}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  aria-label={`Move ${p} down`}
                  className={styles.btnGhost}
                  onClick={() => move(i, 1)}
                  style={{ padding: '6px 8px' }}
                >
                  &darr;
                </button>
                <span className={styles.rankHandle} aria-hidden="true">
                  ::
                </span>
              </li>
            );
          })}
        </ol>

        <p className={styles.rankHint}>
          Top 3 get highlighted phases and tasks bumped to the front of your checklist.
        </p>

        <button type="button" className={styles.backendBtn} onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}

/* -------------------- Screen 6 -------------------- */
function Confetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const left = Math.random() * 100;
      const cx = (Math.random() - 0.5) * 240;
      const delay = Math.random() * 0.6;
      const size = 6 + Math.random() * 6;
      const isGold = Math.random() < 0.55;
      return {
        id: i,
        left,
        cx,
        delay,
        size,
        color: isGold ? '#D4A853' : '#D4537E',
      };
    });
  }, []);

  return (
    <div className={styles.confettiLayer} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={styles.confetti}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            ['--cx' as string]: `${p.cx}px`,
          }}
        />
      ))}
    </div>
  );
}

function ScreenDone({
  eventCount,
  onFinish,
}: {
  eventCount: number;
  onFinish: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`${styles.screen} ${styles.creamBg}`}>
      {showConfetti && <Confetti />}
      <div className={`${styles.contentWrap} ${styles.fadeIn}`} style={{ maxWidth: 640, textAlign: 'left' }}>
        <h2 className={styles.heading}>
          You&apos;re all set, <i style={{ fontStyle: 'italic', color: 'var(--pink)' }}>{FIRST_NAME}</i>.
        </h2>
        <p className={styles.subline}>
          Your workspace is ready. We&apos;ve set up your checklist, seeded your first workspace,
          and queued up your starter tasks.
        </p>

        <ul className={styles.confirmList}>
          <li className={styles.confirmRow}>
            <span className={styles.confirmCheck}>&#10003;</span>
            <span>582 tasks loaded across 13 phases</span>
          </li>
          <li className={styles.confirmRow}>
            <span className={styles.confirmCheck}>&#10003;</span>
            <span>{eventCount} events added to your timeline</span>
          </li>
          <li className={styles.confirmRow}>
            <span className={styles.confirmCheck}>&#10003;</span>
            <span>Style keywords seeded from your vibe selection</span>
          </li>
          <li className={styles.confirmRow}>
            <span className={styles.confirmCheck}>&#10003;</span>
            <span>Top priorities moved to the front of your checklist</span>
          </li>
        </ul>

        <div>
          <span className={styles.scrawlNote}>now go plan something beautiful</span>
        </div>

        <button type="button" className={styles.backendBtn} onClick={onFinish}>
          Open My Workspace
        </button>
      </div>
    </section>
  );
}

/* -------------------- Root -------------------- */
export function OnboardingFlow() {
  const [step, setStep] = useState(0);

  const [basics, setBasics] = useState<BasicsState>({
    partner1: '',
    partner2: '',
    date: '',
    noDate: false,
    location: '',
    noLocation: false,
    guests: 1,
  });

  const [events, setEvents] = useState<Set<string>>(new Set(['Sangeet', 'Ceremony', 'Reception']));
  const [vibe, setVibe] = useState<VibeKey | null>(null);
  const [priorities, setPriorities] = useState<string[]>(PRIORITIES_INITIAL);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_SCREENS - 1));
  const skip = () => setStep(TOTAL_SCREENS - 1);
  const finish = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const toggleEvent = (e: string) => {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  };

  const onJump = (i: number) => {
    if (i <= step) setStep(i);
  };

  const scrapbookHeader = step <= 1;

  return (
    <div className={styles.shell}>
      <SkipLink scrapbook={scrapbookHeader} onSkip={skip} />

      {step === 0 && <ScreenWelcome onNext={next} />}
      {step === 1 && <ScreenBasics state={basics} setState={setBasics} onNext={next} />}
      {step === 2 && (
        <ScreenEvents selected={events} toggle={toggleEvent} onNext={next} />
      )}
      {step === 3 && <ScreenVibe vibe={vibe} setVibe={setVibe} onNext={next} />}
      {step === 4 && (
        <ScreenPriorities order={priorities} setOrder={setPriorities} onNext={next} />
      )}
      {step === 5 && <ScreenDone eventCount={events.size} onFinish={finish} />}

      <ScreenDots current={step} onJump={onJump} scrapbook={scrapbookHeader} />
    </div>
  );
}
