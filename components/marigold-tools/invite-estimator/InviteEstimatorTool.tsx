"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MiniToolShell } from "@/components/marigold-tools/mini/MiniToolShell";
import primitives from "@/components/marigold-tools/mini/MiniToolPrimitives.module.css";

import styles from "./InviteEstimatorTool.module.css";

type SideKey = "you" | "partner";
type SideCounts = {
  immediate: number;
  extended: number;
  friends: number;
  work: number;
  community: number;
};

type KidsPolicy = "yes-all" | "family-only" | "none";
type PlusOnePolicy = "all" | "some" | "none";

const ROW_FIELDS: { key: keyof SideCounts; label: string; helper: string }[] = [
  {
    key: "immediate",
    label: "Immediate family",
    helper: "Parents, siblings, their partners + kids",
  },
  {
    key: "extended",
    label: "Extended family",
    helper: "Aunts, uncles, cousins you'd actually invite",
  },
  {
    key: "friends",
    label: "Close friends",
    helper: "Would feel hurt not to be invited",
  },
  {
    key: "work",
    label: "Work colleagues",
    helper: "Coworkers, bosses, clients",
  },
  {
    key: "community",
    label: "Community",
    helper: "Temple, cultural org, neighbors",
  },
];

const EMPTY_SIDE: SideCounts = {
  immediate: 0,
  extended: 0,
  friends: 0,
  work: 0,
  community: 0,
};

function sumSide(s: SideCounts): number {
  return s.immediate + s.extended + s.friends + s.work + s.community;
}

function clean(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(2000, Math.floor(n));
}

export function InviteEstimatorTool() {
  const [you, setYou] = useState<SideCounts>(EMPTY_SIDE);
  const [partner, setPartner] = useState<SideCounts>(EMPTY_SIDE);
  const [kids, setKids] = useState<KidsPolicy>("family-only");
  const [plusOnes, setPlusOnes] = useState<PlusOnePolicy>("some");
  const [international, setInternational] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const yourTotal = sumSide(you);
    const partnerTotal = sumSide(partner);
    const base = yourTotal + partnerTotal;
    if (base <= 0) return null;

    const kidsMult = kids === "yes-all" ? 0.2 : kids === "family-only" ? 0.1 : 0;
    const plusMult =
      plusOnes === "all" ? 0.15 : plusOnes === "some" ? 0.08 : 0;
    const intlMult = international ? 0.12 : 0;

    const adjusted = base * (1 + kidsMult + plusMult + intlMult);
    const low = Math.round(adjusted * 0.88);
    const high = Math.round(adjusted * 1.12);
    const mid = Math.round(adjusted);

    const tablesLow = Math.ceil(low / 10);
    const tablesHigh = Math.ceil(high / 10);
    const roomsLow = international ? Math.ceil((low * 0.35) / 2) : Math.ceil((low * 0.18) / 2);
    const roomsHigh = international ? Math.ceil((high * 0.45) / 2) : Math.ceil((high * 0.25) / 2);

    return {
      yourTotal,
      partnerTotal,
      base,
      low,
      high,
      mid,
      tablesLow,
      tablesHigh,
      roomsLow,
      roomsHigh,
    };
  }, [you, partner, kids, plusOnes, international]);

  async function copyText() {
    if (!result) return;
    const lines = [
      `Wedding headcount: ${result.low}–${result.high} people`,
      ``,
      `Your side: ${result.yourTotal} · Partner's side: ${result.partnerTotal}`,
      `Roughly ${result.tablesLow}–${result.tablesHigh} tables of 10`,
      `~${result.roomsLow}–${result.roomsHigh} hotel rooms for out-of-towners`,
      ``,
      `Kids: ${kids === "yes-all" ? "all" : kids === "family-only" ? "family only" : "none"}`,
      `Plus-ones: ${plusOnes}`,
      `Family flying in from India: ${international ? "yes" : "no"}`,
      ``,
      `From The Marigold — Invite List Estimator`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <MiniToolShell
      name="Invite List Estimator"
      tagline="how many people is this actually?"
      estimatedTime="30 sec"
    >
      <div className={styles.sides}>
        <SideColumn
          label="Your side"
          counts={you}
          onChange={(k, v) => setYou({ ...you, [k]: clean(v) })}
        />
        <SideColumn
          label="Partner's side"
          counts={partner}
          onChange={(k, v) => setPartner({ ...partner, [k]: clean(v) })}
        />
      </div>

      <div className={styles.divider} />

      <div className={primitives.field}>
        <label className={primitives.label}>Inviting kids?</label>
        <div className={styles.choiceRow}>
          <Choice
            active={kids === "yes-all"}
            label="Yes, all"
            onClick={() => setKids("yes-all")}
          />
          <Choice
            active={kids === "family-only"}
            label="Just immediate family"
            onClick={() => setKids("family-only")}
          />
          <Choice
            active={kids === "none"}
            label="No kids"
            onClick={() => setKids("none")}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Plus-ones for single friends?</label>
        <div className={styles.choiceRow}>
          <Choice
            active={plusOnes === "all"}
            label="All get one"
            onClick={() => setPlusOnes("all")}
          />
          <Choice
            active={plusOnes === "some"}
            label="Some get one"
            onClick={() => setPlusOnes("some")}
          />
          <Choice
            active={plusOnes === "none"}
            label="None"
            onClick={() => setPlusOnes("none")}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Family flying in from India?</label>
        <div className={styles.choiceRow}>
          <Choice
            active={international === true}
            label="Yes"
            onClick={() => setInternational(true)}
          />
          <Choice
            active={international === false}
            label="No"
            onClick={() => setInternational(false)}
          />
        </div>
      </div>

      {result && (
        <div className={primitives.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <span className={primitives.resultEyebrow}>
                your wedding is probably
              </span>
              <div className={styles.bigRange}>
                <em>{result.low}</em>
                <span className={styles.dash}>–</span>
                <em>{result.high}</em>
                <span className={styles.suffix}>people</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={copyText}
            >
              {copied ? "copied!" : "copy"}
            </button>
          </div>

          <div className={styles.splitRow}>
            <div className={styles.splitCol}>
              <span className={styles.splitLabel}>Your side</span>
              <span className={styles.splitValue}>{result.yourTotal}</span>
            </div>
            <div className={styles.splitDivider} />
            <div className={styles.splitCol}>
              <span className={styles.splitLabel}>Partner's side</span>
              <span className={styles.splitValue}>{result.partnerTotal}</span>
            </div>
          </div>

          <div className={primitives.breakdown}>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                Tables of 10
              </span>
              <span className={primitives.breakdownValue}>
                {result.tablesLow}–{result.tablesHigh}
              </span>
            </div>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                Hotel rooms for out-of-towners
              </span>
              <span className={primitives.breakdownValue}>
                {result.roomsLow}–{result.roomsHigh}
              </span>
            </div>
          </div>

          {result.high > 250 && (
            <div className={primitives.crosslink}>
              <strong>Heads up — that's a big one.</strong> Venues with this
              capacity in DFW typically start at <strong>$18,000</strong>{" "}
              before food, vendors, or weekend extras. The math gets real fast.
            </div>
          )}

          <p className={primitives.note}>
            This is an estimate built from typical attendance patterns. Your
            real list will land somewhere in this range — and that's already a
            useful number to argue with family about.
          </p>
        </div>
      )}

      <p className={styles.softCta}>
        Ready to build your real guest list?{" "}
        <Link href="/signup?from=invite-estimator">
          Save this to your Marigold account →
        </Link>
      </p>
    </MiniToolShell>
  );
}

function SideColumn({
  label,
  counts,
  onChange,
}: {
  label: string;
  counts: SideCounts;
  onChange: (k: keyof SideCounts, v: number) => void;
}) {
  return (
    <div className={styles.sideCol}>
      <span className={styles.sideHeader}>{label}</span>
      {ROW_FIELDS.map((f) => (
        <div className={styles.fieldRow} key={f.key}>
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>{f.label}</span>
            <span className={styles.fieldHelper}>{f.helper}</span>
          </div>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={styles.numberInput}
            value={counts[f.key] || ""}
            onChange={(e) => onChange(f.key, Number(e.target.value))}
            placeholder="0"
            aria-label={`${label} — ${f.label}`}
          />
        </div>
      ))}
      <div className={styles.sideTotalRow}>
        <span className={styles.sideTotalLabel}>Total</span>
        <span className={styles.sideTotalValue}>{sumSide(counts)}</span>
      </div>
    </div>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.choice} ${active ? styles.choiceActive : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
