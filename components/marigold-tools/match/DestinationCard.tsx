"use client";

import Link from "next/link";

import type { MatchedDestination } from "@/types/match";

import styles from "./DestinationCard.module.css";

type Variant = "featured" | "standard" | "tail";

const KIND_GLYPH: Record<string, string> = {
  budget: "⌬",
  capacity: "✦",
  priority: "✿",
  geo: "✈",
  vendor: "❖",
  soft: "·",
};

type Props = {
  match: MatchedDestination;
  variant: Variant;
};

export function DestinationCard({ match, variant }: Props) {
  const isTail = variant === "tail";
  const isFeatured = variant === "featured";

  return (
    <article
      className={[
        styles.card,
        isFeatured ? styles.cardFeatured : "",
        isTail ? styles.cardTail : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={styles.media}
        style={
          match.hero_image_url
            ? { backgroundImage: `url(${match.hero_image_url})` }
            : undefined
        }
      >
        <div className={styles.scoreBadge} aria-label={`${match.score}% match`}>
          <span className={styles.scoreNumber}>{match.score}</span>
          <span className={styles.scoreUnit}>% match</span>
        </div>
        {!match.hero_image_url && (
          <span className={styles.fallbackGlyph} aria-hidden>
            ✿
          </span>
        )}
      </div>

      <div className={styles.body}>
        <header className={styles.headerRow}>
          <h3 className={styles.name}>{match.name}</h3>
          <span className={styles.continent}>
            {match.country ?? match.continent ?? ""}
          </span>
        </header>
        <p className={styles.tagline}>{match.tagline}</p>

        {match.reasons.length > 0 && !isTail && (
          <ul className={styles.reasons}>
            {match.reasons.map((r, idx) => (
              <li key={idx} className={styles.reason}>
                <span
                  className={styles.reasonGlyph}
                  aria-hidden
                  data-kind={r.kind}
                >
                  {KIND_GLYPH[r.kind] ?? "·"}
                </span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        )}

        {!isTail && (
          <div className={styles.actions}>
            <Link
              href={`/tools/destinations/${match.slug}`}
              className={styles.primaryLink}
            >
              Explore {match.name} →
            </Link>
            <Link
              href={`/tools/budget/build?location=${match.slug}&from=match`}
              className={styles.secondaryLink}
            >
              Build budget for {match.name} →
            </Link>
          </div>
        )}

        {isTail && (
          <Link
            href={`/tools/destinations/${match.slug}`}
            className={styles.tailLink}
          >
            Look closer →
          </Link>
        )}
      </div>
    </article>
  );
}
