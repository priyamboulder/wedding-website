"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type {
  DoshaResult,
  KootaResult,
  MatchResult,
  ScoreTier,
} from "@/types/kundli";

import styles from "./Report.module.css";

type Props = {
  result: MatchResult;
  onReset: () => void;
  onEdit: () => void;
};

type ViewMode = "plain" | "traditional";

const TIER_CLASS: Record<ScoreTier, string> = {
  exceptional: styles.tierExceptional,
  excellent: styles.tierExcellent,
  good: styles.tierGood,
  manageable: styles.tierManageable,
  challenging: styles.tierChallenging,
};

function dots(obtained: number, max: number): string {
  // For the plain-language readout. Round obtained to nearest int for the
  // dot rendering so 2.5/4 shows as ●●●○ — close enough for an at-a-glance
  // visualisation.
  const filled = Math.round(obtained);
  const empty = max - filled;
  return "●".repeat(filled) + "○".repeat(Math.max(0, empty));
}

function formatScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function statusIcon(s: KootaResult["status"]): string {
  if (s === "favorable") return "✓";
  if (s === "challenging") return "⚠";
  return "△";
}

function ScoreRing({ total, max, tier }: { total: number; max: number; tier: ScoreTier }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(eased * total);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const pct = animated / max;
  const r = 92;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className={styles.ring}>
      <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden>
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="8"
        />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 110 110)"
          style={{ filter: "drop-shadow(0 0 10px rgba(212,168,83,0.55))" }}
        />
      </svg>
      <div className={styles.ringInner}>
        <div className={`${styles.ringScore} ${TIER_CLASS[tier]}`}>
          {formatScore(Math.round(animated * 10) / 10)}
        </div>
        <div className={styles.ringMax}>of {max}</div>
      </div>
    </div>
  );
}

function ChartCard({ which, chart, name }: { which: string; chart: MatchResult["partnerA"]; name: string }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartLabel}>{which}</div>
      <div className={styles.chartName}>{name || "Unnamed"}</div>
      <dl className={styles.chartList}>
        <div className={styles.chartRow}>
          <dt>Moon sign (Rashi)</dt>
          <dd>{chart.rashi}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Birth star (Nakshatra)</dt>
          <dd>{chart.nakshatra.englishName}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Pada</dt>
          <dd>{chart.pada}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Nadi</dt>
          <dd>{chart.nakshatra.nadi}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Gana</dt>
          <dd>{chart.nakshatra.gana}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Yoni</dt>
          <dd>{chart.nakshatra.yoni}</dd>
        </div>
        <div className={styles.chartRow}>
          <dt>Varna</dt>
          <dd>{chart.nakshatra.varna}</dd>
        </div>
      </dl>
      {chart.estimated && (
        <p className={styles.chartCaveat}>{chart.estimationReason}</p>
      )}
    </div>
  );
}

function KootaTraditional({ kootas, total, max }: { kootas: KootaResult[]; total: number; max: number }) {
  return (
    <table className={styles.kootaTable}>
      <thead>
        <tr>
          <th>Koota</th>
          <th>Max</th>
          <th>Obtained</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {kootas.map((k, i) => (
          <tr key={k.key}>
            <td>
              <span className={styles.kootaIndex}>{i + 1}.</span>{" "}
              <span className={styles.kootaTradName}>{k.name}</span>
              <div className={styles.kootaTradNote}>{k.traditionalNote}</div>
            </td>
            <td>{k.max}</td>
            <td className={styles.kootaScore}>{formatScore(k.obtained)}</td>
            <td>
              <span className={`${styles.kootaStatus} ${styles["status_" + k.status]}`}>
                {statusIcon(k.status)}
              </span>
            </td>
          </tr>
        ))}
        <tr className={styles.kootaTotalRow}>
          <td>Total</td>
          <td>{max}</td>
          <td className={styles.kootaScore}>{formatScore(total)}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function KootaPlain({ kootas }: { kootas: KootaResult[] }) {
  return (
    <ol className={styles.kootaList}>
      {kootas.map((k, i) => (
        <li key={k.key} className={styles.kootaItem}>
          <div className={styles.kootaItemHead}>
            <span className={styles.kootaItemIdx}>{i + 1}.</span>
            <span className={styles.kootaItemTitle}>{k.plainName}</span>
            <span className={styles.kootaItemScore}>
              {formatScore(k.obtained)}/{k.max}
            </span>
          </div>
          <div className={styles.kootaDots} aria-hidden>{dots(k.obtained, k.max)}</div>
          <p className={styles.kootaItemNote}>{k.plainNote}</p>
        </li>
      ))}
    </ol>
  );
}

function DoshaCard({ d }: { d: DoshaResult }) {
  const flag = d.present && !d.cancelled
    ? styles.doshaPresent
    : d.present && d.cancelled
      ? styles.doshaCancelled
      : styles.doshaClear;
  const icon = d.present && !d.cancelled
    ? "⚠"
    : d.present && d.cancelled
      ? "↻"
      : "✓";
  const label = d.present && !d.cancelled
    ? "Dosha Present"
    : d.present && d.cancelled
      ? "Cancellation Applies"
      : d.key === "manglik"
        ? "Outside Scope"
        : "No Dosha";

  return (
    <div className={`${styles.doshaCard} ${flag}`}>
      <div className={styles.doshaHead}>
        <span className={styles.doshaName}>{d.name}</span>
        <span className={styles.doshaBadge}>
          <span aria-hidden>{icon}</span> {label}
        </span>
      </div>
      <p className={styles.doshaSummary}>{d.summary}</p>
      {d.cancellationReasons.length > 0 && (
        <ul className={styles.doshaList}>
          {d.cancellationReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {d.remedyNote && <p className={styles.doshaRemedy}>{d.remedyNote}</p>}
    </div>
  );
}

export function Report({ result, onReset, onEdit }: Props) {
  const [view, setView] = useState<ViewMode>("plain");
  const aLabel = result.partnerAName || "Partner A";
  const bLabel = result.partnerBName || "Partner B";

  return (
    <article className={styles.report}>
      <section className={`${styles.hero} ${TIER_CLASS[result.tier]}`}>
        <div className={styles.heroNames}>
          <span className={styles.heroName}>{aLabel}</span>
          <span className={styles.heroAmp} aria-hidden>✦</span>
          <span className={styles.heroName}>{bLabel}</span>
        </div>
        <ScoreRing total={result.total} max={result.max} tier={result.tier} />
        <div className={styles.heroLabel}>{result.tierLabel}</div>
        <p className={styles.heroBlurb}>{result.tierBlurb}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Birth chart summary</h2>
        <div className={styles.chartGrid}>
          <ChartCard which="Partner A" chart={result.partnerA} name={aLabel} />
          <ChartCard which="Partner B" chart={result.partnerB} name={bLabel} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionHeading}>The 8 Koota breakdown</h2>
          <div className={styles.viewToggle} role="tablist" aria-label="Reading mode">
            <button
              role="tab"
              aria-selected={view === "plain"}
              type="button"
              className={`${styles.viewBtn} ${view === "plain" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("plain")}
            >
              Plain language
            </button>
            <button
              role="tab"
              aria-selected={view === "traditional"}
              type="button"
              className={`${styles.viewBtn} ${view === "traditional" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("traditional")}
            >
              Traditional
            </button>
          </div>
        </div>
        {view === "plain" ? (
          <KootaPlain kootas={result.kootas} />
        ) : (
          <KootaTraditional kootas={result.kootas} total={result.total} max={result.max} />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Dosha analysis</h2>
        <div className={styles.doshaGrid}>
          {result.doshas.map((d) => (
            <DoshaCard key={d.key} d={d} />
          ))}
        </div>
      </section>

      <section className={styles.summarySection}>
        <h2 className={styles.summaryHeading}>The reading</h2>
        <p className={styles.summaryBody}>{result.summary}</p>
        <p className={styles.summaryFinePrint}>
          The Ashtakoota system is one input — meaningful, but not a verdict.
          A score reflects astrological alignment; a marriage is built on
          daily effort, communication, and love.
        </p>
      </section>

      <section className={styles.ctas}>
        <Link href="/tools/dates" className={styles.ctaPrimary}>
          Find your wedding date →
        </Link>
        <button type="button" className={styles.ctaGhost} onClick={onEdit}>
          Edit details
        </button>
        <button type="button" className={styles.ctaGhost} onClick={onReset}>
          Start over
        </button>
      </section>
    </article>
  );
}
