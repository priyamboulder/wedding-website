"use client";

// ──────────────────────────────────────────────────────────────────────────
// CoupleEstimator — single-card couple-mode flow.
//
// Tier counts + scale/style/tradition/location pills → totals + per-tier
// breakdown card. Animations match the guest-mode result so both modes
// feel like the same product.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";

import type {
  CoupleInputs,
  CoupleTier,
  Location,
  Tradition,
  WeddingScale,
  WeddingStyle,
} from "@/types/shagun";
import {
  COUPLE_TIERS,
  COUPLE_TIER_LABELS,
  COUPLE_TIER_SUBLABELS,
  LOCATION_LABELS,
  TRADITION_LABELS,
  WEDDING_SCALE_LABELS,
  WEDDING_SCALE_SUBLABELS,
  WEDDING_STYLE_LABELS,
  encodeCoupleInputs,
  estimateCoupleShagun,
} from "@/lib/shagun";

import styles from "./Couple.module.css";

const SCALE_OPTS: WeddingScale[] = ["intimate", "standard", "grand", "mega"];
const STYLE_OPTS: WeddingStyle[] = [
  "traditional-banquet",
  "upscale-hotel",
  "luxury-destination",
  "casual-backyard",
  "destination-travel",
];
const TRADITION_OPTS: Tradition[] = [
  "north-indian",
  "punjabi",
  "gujarati",
  "south-indian",
  "bengali",
  "marathi",
  "muslim",
  "sikh",
  "jain",
  "mixed-fusion",
  "general",
];
const LOCATION_OPTS: Location[] = [
  "both-us",
  "us-guest-india-wedding",
  "india-guest-us-wedding",
  "both-india",
];

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

interface CoupleSetupProps {
  initial: CoupleInputs;
  onSubmit: (inputs: CoupleInputs) => void;
  onBack: () => void;
}

export function CoupleSetup({ initial, onSubmit, onBack }: CoupleSetupProps) {
  const [counts, setCounts] = useState(initial.counts);
  const [scale, setScale] = useState<WeddingScale>(initial.weddingScale);
  const [style, setStyle] = useState<WeddingStyle>(initial.weddingStyle);
  const [tradition, setTradition] = useState<Tradition>(initial.tradition);
  const [location, setLocation] = useState<Location>(initial.location);

  const totalGuests = useMemo(
    () => COUPLE_TIERS.reduce((sum, t) => sum + (counts[t] || 0), 0),
    [counts],
  );

  const handleCount = (tier: CoupleTier, raw: string) => {
    const n = Number(raw);
    setCounts((prev) => ({
      ...prev,
      [tier]: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0,
    }));
  };

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Couple mode</span>
      <h2 className={styles.heading}>
        how much shagun should we <em>expect?</em>
      </h2>
      <p className={styles.sub}>
        Punch in your guest counts by tier — we'll estimate the total cash gift
        coming in. Useful for post-wedding budget planning. Not every guest
        gives shagun, so we apply realistic per-tier participation rates.
      </p>

      <p className={styles.subgroupTitle}>Guest breakdown</p>
      <div className={styles.tierTable}>
        {COUPLE_TIERS.map((tier) => (
          <div key={tier} className={styles.tierRow}>
            <div className={styles.tierLabelCell}>
              <span className={styles.tierLabel}>
                {COUPLE_TIER_LABELS[tier]}
              </span>
              <span className={styles.tierSub}>
                {COUPLE_TIER_SUBLABELS[tier]}
              </span>
            </div>
            <input
              type="number"
              className={styles.tierCountInput}
              min={0}
              step={1}
              inputMode="numeric"
              value={counts[tier] === 0 ? "" : String(counts[tier])}
              placeholder="0"
              onChange={(e) => handleCount(tier, e.target.value)}
              aria-label={`${COUPLE_TIER_LABELS[tier]} count`}
            />
          </div>
        ))}
      </div>

      <p className={styles.subgroupTitle}>Wedding scale</p>
      <div className={styles.pillRow}>
        {SCALE_OPTS.map((s) => (
          <button
            key={s}
            type="button"
            className={[styles.pill, scale === s ? styles.pillSelected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setScale(s)}
          >
            {WEDDING_SCALE_LABELS[s]} — {WEDDING_SCALE_SUBLABELS[s]}
          </button>
        ))}
      </div>

      <p className={styles.subgroupTitle}>Wedding style</p>
      <div className={styles.pillRow}>
        {STYLE_OPTS.map((s) => (
          <button
            key={s}
            type="button"
            className={[styles.pill, style === s ? styles.pillSelected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setStyle(s)}
          >
            {WEDDING_STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      <p className={styles.subgroupTitle}>Cultural tradition</p>
      <div className={styles.pillRow}>
        {TRADITION_OPTS.map((t) => (
          <button
            key={t}
            type="button"
            className={[styles.pill, tradition === t ? styles.pillSelected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTradition(t)}
          >
            {TRADITION_LABELS[t]}
          </button>
        ))}
      </div>

      <p className={styles.subgroupTitle}>Location</p>
      <div className={styles.pillRow}>
        {LOCATION_OPTS.map((l) => (
          <button
            key={l}
            type="button"
            className={[styles.pill, location === l ? styles.pillSelected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setLocation(l)}
          >
            {LOCATION_LABELS[l]}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() =>
            onSubmit({
              counts,
              weddingScale: scale,
              weddingStyle: style,
              tradition,
              location,
            })
          }
          disabled={totalGuests === 0}
        >
          Estimate total ✿
        </button>
      </div>
    </div>
  );
}

interface CoupleResultsProps {
  inputs: CoupleInputs;
  onEdit: () => void;
  onSwitchMode: () => void;
}

export function CoupleResults({
  inputs,
  onEdit,
  onSwitchMode,
}: CoupleResultsProps) {
  const result = useMemo(() => estimateCoupleShagun(inputs), [inputs]);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const [displayedLow, setDisplayedLow] = useState(0);
  const [displayedHigh, setDisplayedHigh] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 32;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const t = Math.min(1, frame / total);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedLow(Math.round(result.totalLow * eased));
      setDisplayedHigh(Math.round(result.totalHigh * eased));
      if (frame < total) raf = requestAnimationFrame(tick);
      else {
        setDisplayedLow(result.totalLow);
        setDisplayedHigh(result.totalHigh);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.totalLow, result.totalHigh]);

  const handleShare = async () => {
    try {
      const token = encodeCoupleInputs(inputs);
      const url = `${window.location.origin}${window.location.pathname}#m=c&a=${token}`;
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#m=c&a=${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  return (
    <div className={styles.wrap}>
      <article className={styles.totalCard}>
        <span className={styles.totalEyebrow}>Estimated total shagun</span>
        <div className={styles.totalNumber}>
          {formatUsd(displayedLow)} – {formatUsd(displayedHigh)}
        </div>
        <p className={styles.totalContext}>
          Across {result.totalGuests.toLocaleString()} guests •{" "}
          {TRADITION_LABELS[inputs.tradition]} •{" "}
          {WEDDING_STYLE_LABELS[inputs.weddingStyle].toLowerCase()}
        </p>
      </article>

      <section className={styles.breakdownCard}>
        <h3 className={styles.breakdownTitle}>
          breakdown <em>by tier</em>
        </h3>
        <div className={styles.breakdownTable}>
          {result.byTier
            .filter((t) => t.count > 0)
            .map((tier) => (
              <div key={tier.tier} className={styles.breakdownRow}>
                <span className={styles.breakdownLabel}>{tier.label}</span>
                <span className={styles.breakdownCount}>
                  {tier.count} {tier.count === 1 ? "guest" : "guests"}
                </span>
                <span className={styles.breakdownAmount}>
                  {formatUsd(tier.subtotalLow)} – {formatUsd(tier.subtotalHigh)}
                </span>
              </div>
            ))}
          {result.byTier.every((t) => t.count === 0) && (
            <p className={styles.realityText}>
              Add at least one guest to see a breakdown.
            </p>
          )}
        </div>
      </section>

      <article className={styles.realityCheck}>
        <span className={styles.realityEyebrow}>⚡ reality check</span>
        <p className={styles.realityText}>{result.realityCheckNote}</p>
      </article>

      <section className={styles.ctaWrap}>
        <h3 className={styles.ctaTitle}>
          Track <em>actual</em> shagun as it comes in.
        </h3>
        <p className={styles.ctaBody}>
          Once you sign in, log shagun per guest as envelopes come in. Future
          weddings need future reciprocity — we'll keep that ledger for you.
        </p>

        <div className={styles.secondaryRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleShare}
          >
            ↗{" "}
            {shareState === "copied"
              ? "Link copied!"
              : shareState === "error"
                ? "Couldn't copy"
                : "Share with my partner"}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onSwitchMode}
          >
            I'm a guest — calculate mine →
          </button>
        </div>

        <div className={styles.secondaryRow}>
          <button type="button" className={styles.tertiaryLink} onClick={onEdit}>
            ← edit my answers
          </button>
        </div>
      </section>
    </div>
  );
}
