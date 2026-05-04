"use client";

import Link from "next/link";

import type { StarsResult } from "@/types/wedding-stars";

import { Insights } from "./Insights";
import { Timeline } from "./Timeline";
import styles from "./Report.module.css";

type Props = {
  result: StarsResult;
  onEdit: () => void;
  onReset: () => void;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatRange(startISO: string, endISO: string): string {
  const [sy, sm] = startISO.split("-").map((v) => parseInt(v, 10));
  const [ey, em] = endISO.split("-").map((v) => parseInt(v, 10));
  if (sy === ey) {
    return `${MONTH_NAMES[sm - 1]} – ${MONTH_NAMES[em - 1]} ${sy}`;
  }
  return `${MONTH_NAMES[sm - 1]} ${sy} – ${MONTH_NAMES[em - 1]} ${ey}`;
}

function timelineRangeLabel(months: { ymKey: string; label: string }[]): string {
  if (months.length === 0) return "";
  return `${months[0].label} → ${months[months.length - 1].label}`;
}

export function Report({ result, onEdit, onReset }: Props) {
  return (
    <div className={styles.wrap}>
      <header className={styles.banner}>
        <div className={styles.bannerInner}>
          <span className={styles.eyebrow}>Your wedding stars</span>
          <h2 className={styles.rashi}>
            <span className={styles.rashiName}>{result.rashi}</span>
            <span className={styles.rashiEnglish}>({result.rashiEnglish}) Moon</span>
          </h2>
          <p className={styles.range}>Timeline: {timelineRangeLabel(result.months)}</p>

          {result.resolvedFromBirth && (
            <p className={styles.note}>
              Resolved from your birth details using our Vedic calculation
              engine. For a precise reading, your family pandit can verify with
              your exact birth time.
            </p>
          )}
        </div>

        <div className={styles.bannerActions}>
          <button type="button" className={styles.linkBtn} onClick={onEdit}>
            ← Edit details
          </button>
          <button type="button" className={styles.linkBtn} onClick={onReset}>
            Start over
          </button>
        </div>
      </header>

      {result.goldenWindow && (
        <section className={styles.golden}>
          <span className={styles.goldenLabel}>★ Golden window</span>
          <h3 className={styles.goldenTitle}>{result.goldenWindow.event}</h3>
          <p className={styles.goldenRange}>
            {formatRange(result.goldenWindow.startISO, result.goldenWindow.endISO)}
            {" · "}your {ordinal(result.goldenWindow.houseForRashi)} house
          </p>
          <p className={styles.goldenBody}>{result.goldenWindow.weddingImpact}</p>
          {result.goldenWindow.proTip && (
            <p className={styles.goldenTip}>
              <span className={styles.goldenTipLabel}>Pro tip</span>
              {result.goldenWindow.proTip}
            </p>
          )}
        </section>
      )}

      <Insights insights={result.insights} />

      <section className={styles.timelineSection}>
        <header className={styles.timelineHead}>
          <span className={styles.eyebrow}>The full year</span>
          <h3 className={styles.timelineTitle}>
            Every <em>window</em>, month by month.
          </h3>
          <p className={styles.timelineSub}>
            Tap any transit to see the wedding impact, what to act on, and what
            to hold.
          </p>
        </header>
        <Timeline months={result.months} />
      </section>

      <section className={styles.ctaCard}>
        <h3 className={styles.ctaTitle}>
          Get weekly Wedding Star <em>updates</em>.
        </h3>
        <p className={styles.ctaBody}>
          We&rsquo;ll send you a personalized weekly briefing — what&rsquo;s
          shifting, what to act on, what to hold. Tied to your Moon sign,
          tailored to your timeline.
        </p>
        <p className={styles.ctaNote}>
          Coming soon. In the meantime, save your timeline link or screenshot it
          so you can come back as windows open and close.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/tools/kundli" className={styles.ctaSecondary}>
            Match your kundli with your partner →
          </Link>
          <Link href="/tools/dates" className={styles.ctaSecondary}>
            Find auspicious wedding dates →
          </Link>
          <Link href="/tools/ready" className={styles.ctaSecondary}>
            Am I ready? →
          </Link>
        </div>
      </section>
    </div>
  );
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
