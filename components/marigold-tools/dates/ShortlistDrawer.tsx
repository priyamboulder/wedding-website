"use client";

// ──────────────────────────────────────────────────────────────────────────
// ShortlistDrawer — slide-in panel listing shortlisted dates with the
// share/conversion CTAs at the bottom.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

import type {
  AuspiciousDate,
  ShortlistedDate,
  UserFilters,
} from "@/types/auspicious-date";

import styles from "./ShortlistDrawer.module.css";

type Props = {
  shortlist: ShortlistedDate[];
  dateIndex: Map<string, AuspiciousDate>;
  filters: UserFilters;
  onClose: () => void;
  onRemove: (iso: string) => void;
};

export function ShortlistDrawer({
  shortlist,
  dateIndex,
  filters,
  onClose,
  onRemove,
}: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sorted = [...shortlist].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  const handleShare = async () => {
    try {
      const isoList = sorted.map((s) => s.isoDate).join(",");
      const url = `${window.location.origin}${window.location.pathname}#shortlist=${encodeURIComponent(isoList)}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="My date shortlist"
      >
        <header className={styles.header}>
          <span className={styles.eyebrow}>My shortlist</span>
          <h3 className={styles.title}>
            Dates you're <em>watching</em>
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No dates yet.</p>
            <p className={styles.emptyBody}>
              Tap any date on the calendar and hit "Add to my shortlist" to
              start building your list. The sweet-spot dates (gold with green
              outline) are the ones you'll want first.
            </p>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {sorted.map((s) => {
                const date = dateIndex.get(s.isoDate);
                if (!date) return null;
                return (
                  <ShortlistCard
                    key={s.isoDate}
                    date={date}
                    onRemove={() => onRemove(s.isoDate)}
                  />
                );
              })}
            </ul>

            <div className={styles.cta}>
              <p className={styles.ctaHeading}>Send this to your family</p>
              <div className={styles.ctaActions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleShare}
                >
                  {shareState === "copied"
                    ? "Link copied ✓"
                    : shareState === "error"
                      ? "Couldn't copy"
                      : "Copy share link"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handlePrint}
                >
                  Print / save as PDF
                </button>
              </div>
              <p className={styles.ctaFootnote}>
                Send the link to your parents and pandit before the family call.
                Cities and filters: <strong>{cityLabel(filters.city)}</strong> · {filters.years.join(" + ")}.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ShortlistCard({
  date,
  onRemove,
}: {
  date: AuspiciousDate;
  onRemove: () => void;
}) {
  const auspicious = date.traditions.find(
    (t) => t.status === "highly-auspicious" || t.status === "auspicious",
  );
  const blocked = date.traditions.find(
    (t) => t.status === "blocked" || t.status === "avoid",
  );

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.cardDate}>
          <span className={styles.cardStar}>★</span>
          {formatLong(date.date)}
        </p>
        {date.logistics.daysFromToday >= 0 && (
          <span className={styles.cardDays}>
            {date.logistics.daysFromToday} days away
          </span>
        )}
      </div>

      <ScoreRow
        label="Auspicious"
        score={
          auspicious?.status === "highly-auspicious"
            ? 5
            : auspicious?.status === "auspicious"
              ? 4
              : blocked
                ? 1
                : 3
        }
      />
      <ScoreRow label="Weather" score={date.weather.weatherScore} />
      <ScoreRow
        label="Logistics"
        score={
          date.logistics.dayOfWeek === "Saturday" && date.logistics.isLongWeekend
            ? 5
            : date.logistics.isWeekend
              ? 4
              : 3
        }
      />
      <ScoreRow label="Demand" score={demandToScore(date.demand)} />

      {auspicious?.muhuratWindow && (
        <p className={styles.muhurat}>
          Muhurat: {auspicious.muhuratWindow.start} – {auspicious.muhuratWindow.end}
        </p>
      )}
      {auspicious?.nakshatra && (
        <p className={styles.muhuratMeta}>
          Nakshatra <em>{auspicious.nakshatra}</em>
          {auspicious.tithi && (
            <>
              {" "}· Tithi <em>{auspicious.tithi}</em>
            </>
          )}
        </p>
      )}

      {blocked && (
        <p className={styles.blockedNote}>
          ⚠ Falls during {blocked.blockReason} — discuss with your family.
        </p>
      )}

      <button type="button" className={styles.removeBtn} onClick={onRemove}>
        Remove from shortlist
      </button>
    </li>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <span className={styles.scoreDots} aria-label={`${score} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={[
              styles.scoreDot,
              i <= score ? styles.scoreDotFilled : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </span>
    </div>
  );
}

function demandToScore(demand: string): number {
  switch (demand) {
    case "extreme":
      return 5;
    case "very-high":
      return 4;
    case "high":
      return 3;
    case "moderate":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function formatLong(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cityLabel(city: string): string {
  const map: Record<string, string> = {
    dallas: "Dallas / DFW",
    houston: "Houston",
    nyc: "NYC",
    chicago: "Chicago",
    la: "LA",
    "bay-area": "Bay Area",
    dc: "DC",
    atlanta: "Atlanta",
    india: "India",
    other: "Other",
  };
  return map[city] ?? city;
}
