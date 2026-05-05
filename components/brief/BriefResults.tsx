'use client';

// ──────────────────────────────────────────────────────────────────────────
// BriefResults — the magazine-style payoff after the quiz.
//
// Sections (top → bottom):
//   1. Hero summary — at-a-glance + editorial paragraph
//   2. Estimated budget breakdown (or benchmark range if "unsure")
//   3. Planning timeline (visual milestones)
//   4. Vibe profile (palette + keywords + description)
//   5. Top 3 priorities (with personalized insights)
//   6. What to do right now (3 actions, 2 link out, 1 requires signup)
//   7. CTA — "Ready to make it real?" + email capture + share
//
// Every section is its own component so the file stays scannable and the
// CSS module groups by visual element.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';

import styles from './BriefResults.module.css';
import {
  buildBudgetBreakdown,
  buildSummary,
  buildTimeline,
  eventsCount,
  guestMidpoint,
  PRIORITY_LABEL_MAP,
  priorityInsight,
} from '@/lib/brief/calculations';
import {
  DESTINATION_OPTIONS,
  EVENT_OPTIONS,
  GUEST_OPTIONS,
  TIMELINE_OPTIONS,
  VIBE_OPTIONS,
} from '@/lib/brief/options';
import type { BriefRecord } from '@/lib/brief/types';

export function BriefResults({ brief }: { brief: BriefRecord }) {
  const vibe = VIBE_OPTIONS.find((v) => v.value === brief.vibe)!;
  const dest = DESTINATION_OPTIONS.find((d) => d.value === brief.destination)!;
  const guestCard = GUEST_OPTIONS.find((g) => g.value === brief.guests)!;
  const eventCard = EVENT_OPTIONS.find((e) => e.value === brief.events)!;
  const timelineCard = TIMELINE_OPTIONS.find((t) => t.value === brief.timeline)!;

  const summary = buildSummary(brief);
  const budget = buildBudgetBreakdown(brief);
  const timeline = buildTimeline(brief);

  return (
    <div className={styles.root}>
      <TopBrand />

      <Hero
        summary={summary}
        events={eventsCount(brief)}
        guests={guestMidpoint(brief)}
        vibeLabel={vibe.label}
        destLabel={dest.label}
        timelineLabel={timelineCard.label}
        guestRange={guestCard.range}
        eventLabel={eventCard.label}
      />

      <Budget budget={budget} brief={brief} vibeLabel={vibe.label} />

      <Timeline milestones={timeline} hasDate={brief.timeline !== 'no-date'} />

      <VibeProfile vibe={vibe} />

      <Priorities brief={brief} />

      <Actions brief={brief} vibeLabel={vibe.label} />

      <FinalCta publicId={brief.public_id} />
    </div>
  );
}

// ── Top-of-page brand ──────────────────────────────────────────────────
function TopBrand() {
  return (
    <header className={styles.topBar}>
      <Link href="/" className={styles.brand}>the brief</Link>
      <Link href="/brief" className={styles.startOver}>
        Take it again →
      </Link>
    </header>
  );
}

// ── Section 1: Hero ────────────────────────────────────────────────────
function Hero({
  summary,
  events,
  guests,
  vibeLabel,
  destLabel,
  timelineLabel,
  guestRange,
  eventLabel,
}: {
  summary: string;
  events: number;
  guests: number;
  vibeLabel: string;
  destLabel: string;
  timelineLabel: string;
  guestRange: string;
  eventLabel: string;
}) {
  return (
    <section className={`${styles.section} ${styles.hero}`}>
      <div className={styles.eyebrow}>your brief</div>
      <h1 className={styles.heroTitle}>
        Your <span className={styles.italic}>Wedding</span>
      </h1>

      <ul className={styles.statRow}>
        <Stat label={eventLabel} value={`${events} event${events > 1 ? 's' : ''}`} />
        <Stat label={guestRange} value={`~${guests} guests`} />
        <Stat label="vibe" value={vibeLabel} />
        <Stat label="location" value={destLabel} />
        <Stat label="timeline" value={timelineLabel} />
      </ul>

      <p className={styles.heroParagraph}>{summary}</p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </li>
  );
}

// ── Section 2: Budget breakdown ────────────────────────────────────────
function Budget({
  budget,
  brief,
  vibeLabel,
}: {
  budget: ReturnType<typeof buildBudgetBreakdown>;
  brief: BriefRecord;
  vibeLabel: string;
}) {
  const isUnsure = brief.budget === 'unsure';
  return (
    <section className={styles.section}>
      <SectionHead
        eyebrow="section 02"
        title="Your Estimated Budget"
        subtitle={
          isUnsure
            ? `For your shape of wedding, here's the range couples typically spend.`
            : `How a typical ${vibeLabel} wedding at your scale tends to allocate.`
        }
      />

      {isUnsure && budget.range === null ? (
        <BenchmarkRange brief={brief} vibeLabel={vibeLabel} />
      ) : (
        <>
          <div className={styles.budgetTotal}>
            <span className={styles.budgetTotalLabel}>Estimated total</span>
            <span className={styles.budgetTotalValue}>
              ${(budget.total! / 1000).toFixed(0)}K
            </span>
            {budget.perGuest !== null && (
              <span className={styles.budgetPerGuest}>
                ${budget.perGuest.toLocaleString()} per guest
              </span>
            )}
          </div>

          <div className={styles.budgetBars}>
            {budget.categories.map((c) => (
              <div key={c.key} className={styles.budgetRow}>
                <div className={styles.budgetRowHead}>
                  <span className={styles.budgetCategory}>{c.label}</span>
                  <span className={styles.budgetAmount}>
                    ${(c.amount / 1000).toFixed(0)}K · {c.pct}%
                  </span>
                </div>
                <div className={styles.budgetBarTrack}>
                  <div
                    className={styles.budgetBarFill}
                    style={{ width: `${c.pct * 4}%`, maxWidth: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className={styles.sectionFootnote}>
        This is a starting point. <Link href="/tools/budget">Shaadi Budget™</Link> goes deeper. →
      </p>
    </section>
  );
}

function BenchmarkRange({
  brief,
  vibeLabel,
}: {
  brief: BriefRecord;
  vibeLabel: string;
}) {
  const events = eventsCount(brief);
  const guests = guestMidpoint(brief);
  // Rough heuristic: $500/guest base × event multiplier × vibe tilt.
  const base = guests * 500;
  const eventMult = 1 + (events - 1) * 0.18;
  const vibeMult = brief.vibe === 'mughal' || brief.vibe === 'bollywood' ? 1.25 : 1.0;
  const low = Math.round((base * eventMult * vibeMult * 0.7) / 5000) * 5000;
  const high = Math.round((base * eventMult * vibeMult * 1.4) / 5000) * 5000;

  return (
    <div className={styles.benchmark}>
      <div className={styles.benchmarkLabel}>Typical range</div>
      <div className={styles.benchmarkValue}>
        ${(low / 1000).toFixed(0)}K – ${(high / 1000).toFixed(0)}K
      </div>
      <p className={styles.benchmarkNote}>
        Couples planning a {events}-event, ~{guests}-guest {vibeLabel} wedding usually land in this band. When you have a number, come back — we&apos;ll re-run your breakdown.
      </p>
    </div>
  );
}

// ── Section 3: Timeline ────────────────────────────────────────────────
function Timeline({
  milestones,
  hasDate,
}: {
  milestones: ReturnType<typeof buildTimeline>;
  hasDate: boolean;
}) {
  return (
    <section className={styles.section}>
      <SectionHead
        eyebrow="section 03"
        title="Your Planning Timeline"
        subtitle={
          hasDate
            ? 'Your runway, mapped to the things that need to happen first.'
            : `Here's what a 12-month runway looks like.`
        }
      />

      <ol className={styles.timeline}>
        {milestones.map((m, i) => (
          <li key={i} className={styles.timelineItem}>
            <div className={styles.timelineMarker}>
              <span className={styles.timelineDot} aria-hidden="true" />
              <span className={styles.timelineLine} aria-hidden="true" />
            </div>
            <div className={styles.timelineBody}>
              <div className={styles.timelineLabel}>{m.label}</div>
              <p className={styles.timelineDesc}>{m.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className={styles.sectionFootnote}>
        <Link href="/tools/timeline-builder">Timeline Builder</Link> creates your full day-by-day plan. →
      </p>
    </section>
  );
}

// ── Section 4: Vibe profile ────────────────────────────────────────────
function VibeProfile({ vibe }: { vibe: typeof VIBE_OPTIONS[number] }) {
  return (
    <section className={`${styles.section} ${styles.vibeSection}`}>
      <SectionHead eyebrow="section 04" title="Your Vibe Profile" />

      <div className={styles.vibeName}>{vibe.label}</div>
      <div className={styles.vibeTagline}>{vibe.tagline}</div>

      <div className={styles.vibePalette} aria-hidden="true">
        {vibe.palette.map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>

      <ul className={styles.vibeKeywords}>
        {vibe.keywords.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>

      <p className={styles.vibeDesc}>{vibe.description}</p>

      <p className={styles.sectionFootnote}>
        The <Link href="/tools/wedding-personality">Vibe Quiz</Link> goes even deeper into your aesthetic. →
      </p>
    </section>
  );
}

// ── Section 5: Top 3 priorities ────────────────────────────────────────
function Priorities({ brief }: { brief: BriefRecord }) {
  return (
    <section className={styles.section}>
      <SectionHead
        eyebrow="section 05"
        title="Your Top 3 Priorities"
        subtitle="Where the budget tilts and where to spend your decision-making energy."
      />

      <ol className={styles.prioList}>
        {brief.priorities.map((p, i) => (
          <li key={p} className={styles.prioItem}>
            <span className={styles.prioRank}>#{i + 1}</span>
            <div className={styles.prioBody}>
              <div className={styles.prioName}>{PRIORITY_LABEL_MAP[p]}</div>
              <p className={styles.prioInsight}>
                {priorityInsight((i + 1) as 1 | 2 | 3, p, brief)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className={styles.sectionFootnote}>
        Your <Link href="/checklist">checklist</Link> is already prioritized around these. →
      </p>
    </section>
  );
}

// ── Section 6: What to do right now ────────────────────────────────────
function Actions({
  brief,
  vibeLabel,
}: {
  brief: BriefRecord;
  vibeLabel: string;
}) {
  const destHref = `/tools/destinations?vibe=${brief.vibe}&guests=${brief.guests}&budget=${brief.budget}`;
  const budgetHref = `/tools/budget?guests=${brief.guests}&events=${brief.events}&budget=${brief.budget}`;
  return (
    <section className={styles.section}>
      <SectionHead eyebrow="section 06" title="What to Do Right Now" />

      <div className={styles.actionStack}>
        <ActionCard
          step="01"
          title="Explore destinations"
          body={`Based on your guest count and ${vibeLabel} vibe, here are destinations worth a closer look.`}
          href={destHref}
          ctaLabel="Open Destination Explorer →"
        />
        <ActionCard
          step="02"
          title="Try Shaadi Budget"
          body="Get a detailed breakdown with line items for every vendor category, prefilled from your answers."
          href={budgetHref}
          ctaLabel="Open Shaadi Budget →"
        />
        <ActionCard
          step="03"
          title="Start your checklist"
          body="Your personalized checklist is ready — already prioritized by your timeline and what matters most."
          href={`/signup?from=brief&id=${brief.public_id}`}
          ctaLabel="Sign up to unlock →"
          locked
        />
      </div>
    </section>
  );
}

function ActionCard({
  step,
  title,
  body,
  href,
  ctaLabel,
  locked,
}: {
  step: string;
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
  locked?: boolean;
}) {
  return (
    <Link href={href} className={`${styles.action} ${locked ? styles.actionLocked : ''}`}>
      <span className={styles.actionStep}>{step}</span>
      <div className={styles.actionBody}>
        <div className={styles.actionTitle}>
          {title}
          {locked && <span className={styles.actionLockTag}>SIGNUP</span>}
        </div>
        <p className={styles.actionDesc}>{body}</p>
        <span className={styles.actionCta}>{ctaLabel}</span>
      </div>
    </Link>
  );
}

// ── Section 7: Final CTA + email capture + share ───────────────────────
function FinalCta({ publicId }: { publicId: string }) {
  return (
    <section className={`${styles.section} ${styles.finalCta}`}>
      <h2 className={styles.finalTitle}>
        This is your starting point.
        <br />
        <span className={styles.italic}>The Marigold makes it happen.</span>
      </h2>
      <p className={styles.finalSubtext}>
        Your personalized checklist, vendor matches, and planning toolkit are
        ready. Sign up to unlock everything.
      </p>

      <Link href={`/signup?from=brief&id=${publicId}`} className={styles.finalPrimary}>
        START PLANNING <span aria-hidden="true">→</span>
      </Link>

      <SaveBriefForm publicId={publicId} />

      <ShareLink publicId={publicId} />
    </section>
  );
}

function SaveBriefForm({ publicId }: { publicId: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/brief/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save email.');
      setState('sent');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (state === 'sent') {
    return (
      <p className={styles.saveSent}>
        ✓ Saved. We&apos;ll send your Brief to <strong>{email}</strong>.
      </p>
    );
  }

  return (
    <form className={styles.saveForm} onSubmit={submit}>
      <div className={styles.saveLead}>
        <span className={styles.saveLabel}>Save Your Brief</span>
        <span className={styles.saveSub}>
          Not ready to sign up? We&apos;ll email it so you can come back to it.
        </span>
      </div>
      <div className={styles.saveRow}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'submitting'}
          className={styles.saveInput}
        />
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={state === 'submitting'}
        >
          {state === 'submitting' ? 'Saving...' : 'Send it'}
        </button>
      </div>
      {state === 'error' && errorMsg && (
        <p className={styles.saveError}>{errorMsg}</p>
      )}
    </form>
  );
}

function ShareLink({ publicId }: { publicId: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/brief/${publicId}`
        : `/brief/${publicId}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'My Wedding Brief',
          text: 'I just took The Brief — here\'s my wedding snapshot.',
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled share dialog or clipboard blocked — silently noop */
    }
  };

  return (
    <button type="button" className={styles.share} onClick={onShare}>
      {copied ? 'Link copied ✓' : 'Share Your Brief'}
    </button>
  );
}

// ── Reusable section header ────────────────────────────────────────────
function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className={styles.sectionHead}>
      <span className={styles.sectionEyebrow}>{eyebrow}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
    </header>
  );
}
