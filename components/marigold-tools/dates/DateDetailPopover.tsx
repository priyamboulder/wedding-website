"use client";

// ──────────────────────────────────────────────────────────────────────────
// DateDetailPopover — modal-ish detail card for a tapped date.
// Uses a portal-free fixed overlay so it works at every viewport without
// adding a portal manager. Closes on backdrop click or Escape.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";

import type {
  AuspiciousDate,
  DateStatus,
  TraditionDateInfo,
} from "@/types/auspicious-date";

import styles from "./DateDetailPopover.module.css";

const TRADITION_LABELS: Record<string, string> = {
  "hindu-general": "Hindu Panchang",
  "hindu-north": "North Indian Panchang",
  "hindu-south": "South Indian Panchang",
  "hindu-gujarati": "Gujarati Panchang",
  "hindu-bengali": "Bengali Panchang",
  "hindu-marathi": "Marathi Panchang",
  sikh: "Sikh / Nanakshahi",
  muslim: "Islamic / Hijri",
  jain: "Jain Panchang",
  none: "No tradition",
};

type Props = {
  date: AuspiciousDate;
  isShortlisted: boolean;
  onClose: () => void;
  onAddShortlist: () => void;
  onRemoveShortlist: () => void;
};

export function DateDetailPopover({
  date,
  isShortlisted,
  onClose,
  onAddShortlist,
  onRemoveShortlist,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const status = combinedStatus(date);
  const headlineColor = headlineForStatus(status);
  const headlineLabel = labelForStatus(status);
  const fmtDate = formatLong(date.date);
  const blockedTradition = date.traditions.find(
    (t) => t.status === "blocked" || t.status === "avoid",
  );
  const auspiciousTradition = date.traditions.find(
    (t) => t.status === "highly-auspicious" || t.status === "auspicious",
  );

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.popover}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={fmtDate}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <p className={styles.eyebrow}>{date.logistics.dayOfWeek}</p>
        <h3 className={styles.dateTitle}>{fmtDate}</h3>

        <div
          className={styles.statusRow}
          style={{ "--status-color": headlineColor } as React.CSSProperties}
        >
          <span className={styles.statusBullet} aria-hidden />
          <span className={styles.statusText}>{headlineLabel}</span>
        </div>

        {auspiciousTradition && (
          <PanchangBlock info={auspiciousTradition} />
        )}

        {blockedTradition && (
          <div className={styles.blockBox}>
            <span className={styles.blockReason}>
              {blockedTradition.blockReason}
            </span>
            {blockedTradition.blockExplanation && (
              <p className={styles.blockExplanation}>
                {blockedTradition.blockExplanation}
              </p>
            )}
            {blockedTradition.tradition === "hindu-general" && (
              <p className={styles.blockNote}>
                Some modern families proceed during this period — discuss with
                your pandit.
              </p>
            )}
          </div>
        )}

        <div className={styles.factGrid}>
          <Fact label="Weather">
            ~{date.weather.avgHighF}°F · {date.weather.description}
          </Fact>
          <Fact label="Day">
            {date.logistics.dayOfWeek}
            {date.logistics.isLongWeekend && date.logistics.holidayName ? (
              <span className={styles.factSub}>
                ({date.logistics.holidayName})
              </span>
            ) : null}
          </Fact>
          <Fact label="Venue pricing">
            <span className={styles.tier} data-tier={date.logistics.venuePricingTier}>
              {labelForTier(date.logistics.venuePricingTier)}
            </span>
            {date.logistics.venuePricingNote && (
              <span className={styles.factSub}>{date.logistics.venuePricingNote}</span>
            )}
          </Fact>
          <Fact label="Demand">
            <span className={styles.tier} data-tier={date.demand}>
              {date.demand.replace("-", " ")}
            </span>
            <DemandHint demand={date.demand} />
          </Fact>
          <Fact label="Days from today">
            {date.logistics.daysFromToday >= 0
              ? `${date.logistics.daysFromToday} days away`
              : `${Math.abs(date.logistics.daysFromToday)} days ago`}
          </Fact>
          <Fact label="Match score">
            {Math.round(date.overallScore)} / 100
          </Fact>
        </div>

        {date.traditions.length > 1 && (
          <div className={styles.traditionStack}>
            <span className={styles.traditionStackLabel}>
              All selected traditions:
            </span>
            <ul>
              {date.traditions.map((t) => (
                <li key={t.tradition}>
                  <span className={styles.traditionName}>
                    {TRADITION_LABELS[t.tradition] ?? t.tradition}
                  </span>
                  <span className={styles.traditionStatus}>
                    {labelForStatus(t.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.actions}>
          {!isShortlisted ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onAddShortlist}
              disabled={status === "blocked"}
            >
              ★ Add to my shortlist
            </button>
          ) : (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onRemoveShortlist}
            >
              Remove from shortlist
            </button>
          )}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className={styles.footnote}>
          Confirm your final date with your family pandit, priest, or imam.
          This tool helps you narrow the field — your tradition confirms the pick.
        </p>
      </div>
    </div>
  );
}

function PanchangBlock({ info }: { info: TraditionDateInfo }) {
  const hasAny = info.muhuratWindow || info.nakshatra || info.tithi || info.notes;
  if (!hasAny) return null;
  return (
    <div className={styles.panchang}>
      {info.muhuratWindow && (
        <p className={styles.muhuratWindow}>
          <span className={styles.muhuratLabel}>Muhurat window</span>
          <span className={styles.muhuratTime}>
            {info.muhuratWindow.start} – {info.muhuratWindow.end}
          </span>
        </p>
      )}
      {(info.nakshatra || info.tithi) && (
        <p className={styles.panchangMeta}>
          {info.nakshatra && (
            <span>
              <span className={styles.panchangKey}>Nakshatra: </span>
              <em>{info.nakshatra}</em>
            </span>
          )}
          {info.tithi && (
            <span>
              <span className={styles.panchangKey}>Tithi: </span>
              <em>{info.tithi}</em>
            </span>
          )}
        </p>
      )}
      {info.notes && <p className={styles.panchangNotes}>{info.notes}</p>}
    </div>
  );
}

function DemandHint({ demand }: { demand: string }) {
  const map: Record<string, string> = {
    extreme: "⚡ Book venues 18+ months ahead",
    "very-high": "⚡ High demand — start vendor outreach this week",
    high: "Popular muhurat — venues book early",
    moderate: "Moderate demand",
    low: "Low demand — better venue availability",
  };
  return <span className={styles.factSub}>{map[demand] ?? ""}</span>;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <div className={styles.factValue}>{children}</div>
    </div>
  );
}

function combinedStatus(d: AuspiciousDate): DateStatus {
  if (d.traditions.length === 0) return "neutral";
  if (d.traditions.some((t) => t.status === "blocked")) return "blocked";
  if (d.traditions.some((t) => t.status === "avoid")) return "avoid";
  if (d.traditions.some((t) => t.status === "highly-auspicious")) return "highly-auspicious";
  if (d.traditions.some((t) => t.status === "auspicious")) return "auspicious";
  return "neutral";
}

function labelForStatus(s: DateStatus): string {
  switch (s) {
    case "highly-auspicious":
      return "Shubh muhurat available";
    case "auspicious":
      return "Auspicious";
    case "avoid":
      return "Soft avoid — check with family";
    case "blocked":
      return "Inauspicious — traditionally blocked";
    case "neutral":
    default:
      return "Neutral — no tradition flag";
  }
}

function headlineForStatus(s: DateStatus): string {
  switch (s) {
    case "highly-auspicious":
      return "var(--gold)";
    case "auspicious":
      return "#B58A3D";
    case "avoid":
      return "#C25775";
    case "blocked":
      return "#7A1F2E";
    default:
      return "var(--mauve)";
  }
}

function labelForTier(tier: string): string {
  return tier.replace("-", " ");
}

function formatLong(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
