"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MiniToolShell } from "@/components/marigold-tools/mini/MiniToolShell";
import primitives from "@/components/marigold-tools/mini/MiniToolPrimitives.module.css";

import styles from "./OutfitCalculatorTool.module.css";

type EventKey =
  | "engagement"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "cocktail"
  | "reception"
  | "brunch";

type Persona = "bride" | "groom";
type Importance = "very" | "somewhat" | "not";
type Budget = "under-3" | "three-eight" | "eight-fifteen" | "fifteen-plus";
type Change = "yes" | "no" | "maybe";

const EVENTS: { key: EventKey; label: string }[] = [
  { key: "engagement", label: "Engagement party" },
  { key: "haldi", label: "Haldi" },
  { key: "mehendi", label: "Mehendi night" },
  { key: "sangeet", label: "Sangeet" },
  { key: "baraat", label: "Baraat" },
  { key: "ceremony", label: "Wedding ceremony" },
  { key: "cocktail", label: "Cocktail hour" },
  { key: "reception", label: "Reception dinner" },
  { key: "brunch", label: "Next-day brunch" },
];

type Row = {
  event: string;
  needed: string;
  notes: string;
  optional?: boolean;
  earliest?: boolean;
};

const BRIDE_TABLE: Record<EventKey, Row> = {
  engagement: {
    event: "Engagement party",
    needed: "Yes",
    notes: "Anarkali or saree — set the tone, but save your big swings for later",
    earliest: true,
  },
  haldi: {
    event: "Haldi",
    needed: "Yes, casual",
    notes: "White or yellow, budget-friendly cotton — it WILL get stained",
  },
  mehendi: {
    event: "Mehendi night",
    needed: "Yes",
    notes: "Semi-formal lehenga or sharara, comfortable for long sitting",
  },
  sangeet: {
    event: "Sangeet",
    needed: "Yes",
    notes: "Your most expressive look — choreography, lighting, video reels",
  },
  baraat: {
    event: "Baraat",
    needed: "Optional",
    notes: "Most brides skip — but a coordinated entrance look is a moment",
    optional: true,
  },
  ceremony: {
    event: "Wedding ceremony",
    needed: "Yes",
    notes: "The lehenga. Order 8–12 months out. Alterations take 4–8 weeks",
  },
  cocktail: {
    event: "Cocktail hour",
    needed: "Optional",
    notes: "Indo-western or saree if changing between ceremony and reception",
    optional: true,
  },
  reception: {
    event: "Reception dinner",
    needed: "Yes or change",
    notes: "Optional second look — gown, sharara, or modern sari",
  },
  brunch: {
    event: "Next-day brunch",
    needed: "Yes, casual",
    notes: "Light kurta, breezy salwar, or coordinated sundress",
  },
};

const GROOM_TABLE: Record<EventKey, Row> = {
  engagement: {
    event: "Engagement party",
    needed: "Yes",
    notes: "Bandhgala or sherwani-lite — coordinated with partner",
    earliest: true,
  },
  haldi: {
    event: "Haldi",
    needed: "Yes, casual",
    notes: "White kurta + churidar. It's getting destroyed",
  },
  mehendi: {
    event: "Mehendi night",
    needed: "Yes",
    notes: "Pathani or kurta-jacket combo — semi-formal",
  },
  sangeet: {
    event: "Sangeet",
    needed: "Yes",
    notes: "Indo-western or embroidered jacket — you're on the dance floor",
  },
  baraat: {
    event: "Baraat",
    needed: "Yes",
    notes: "Sherwani + safa (turban) + sehra optional — order 6 months out",
  },
  ceremony: {
    event: "Wedding ceremony",
    needed: "Often same as baraat",
    notes: "Most grooms wear baraat sherwani through ceremony",
    optional: true,
  },
  cocktail: {
    event: "Cocktail hour",
    needed: "Optional",
    notes: "Black or burgundy bandhgala if changing for evening",
    optional: true,
  },
  reception: {
    event: "Reception dinner",
    needed: "Yes",
    notes: "Suit, tuxedo, or modern bandhgala — your formal moment",
  },
  brunch: {
    event: "Next-day brunch",
    needed: "Yes, casual",
    notes: "Linen kurta, polo, or smart-casual button-down",
  },
};

const BUDGET_LABEL: Record<Budget, string> = {
  "under-3": "Under $3K",
  "three-eight": "$3–8K",
  "eight-fifteen": "$8–15K",
  "fifteen-plus": "$15K+",
};

const BUDGET_MID: Record<Budget, number> = {
  "under-3": 2000,
  "three-eight": 5500,
  "eight-fifteen": 11500,
  "fifteen-plus": 22000,
};

const EARLIEST_LABEL: Partial<Record<EventKey, string>> = {
  engagement: "engagement",
  haldi: "haldi",
  mehendi: "mehendi",
};

export function OutfitCalculatorTool() {
  const [selected, setSelected] = useState<Set<EventKey>>(
    new Set(["mehendi", "sangeet", "ceremony", "reception"]),
  );
  const [change, setChange] = useState<Change>("maybe");
  const [firstLook, setFirstLook] = useState<boolean>(false);
  const [importance, setImportance] = useState<Importance>("somewhat");
  const [budget, setBudget] = useState<Budget>("three-eight");
  const [persona, setPersona] = useState<Persona>("bride");
  const [copied, setCopied] = useState(false);

  function toggle(k: EventKey) {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setSelected(next);
  }

  const rows = useMemo(() => {
    const table = persona === "bride" ? BRIDE_TABLE : GROOM_TABLE;
    return EVENTS.filter((e) => selected.has(e.key)).map((e) => table[e.key]);
  }, [persona, selected]);

  const summary = useMemo(() => {
    const required = rows.filter((r) => !r.optional).length;
    let optional = rows.filter((r) => r.optional).length;
    if (change === "yes") optional += 1;
    if (firstLook) optional += 1;
    return { required, optional };
  }, [rows, change, firstLook]);

  const earliestEvent = useMemo(() => {
    for (const e of EVENTS) {
      if (selected.has(e.key) && EARLIEST_LABEL[e.key]) {
        return EARLIEST_LABEL[e.key]!;
      }
    }
    return "your first event";
  }, [selected]);

  const orderingMonths = earliestEvent === "engagement" ? 10 : earliestEvent === "haldi" ? 9 : 8;

  const perOutfit = useMemo(() => {
    const total = summary.required + summary.optional;
    if (total === 0) return null;
    return Math.round(BUDGET_MID[budget] / total);
  }, [budget, summary]);

  const tightBudget =
    budget === "under-3" && summary.required + summary.optional >= 5;

  async function copyText() {
    if (rows.length === 0) return;
    const lines = [
      `Outfit plan — ${persona === "bride" ? "Bride" : "Groom"}`,
      `Required looks: ${summary.required} · Optional add-ons: ${summary.optional}`,
      ``,
      ...rows.map((r) => `${r.event} → ${r.needed} — ${r.notes}`),
      ``,
      `Order ceremony piece by ${orderingMonths}+ months before ${earliestEvent}.`,
      `From The Marigold — Outfit Count Calculator`,
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
      name="Outfit Count Calculator"
      tagline="how many looks do you actually need?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Events you're attending</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const on = selected.has(e.key);
            return (
              <label
                key={e.key}
                className={`${primitives.checkboxLabel} ${
                  on ? primitives.checkboxLabelChecked : ""
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={on}
                  onChange={() => toggle(e.key)}
                />
                {e.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Change during reception?</label>
        <div className={styles.choiceRow}>
          <Choice active={change === "yes"} label="Yes" onClick={() => setChange("yes")} />
          <Choice active={change === "no"} label="No" onClick={() => setChange("no")} />
          <Choice active={change === "maybe"} label="Maybe" onClick={() => setChange("maybe")} />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>
          First look or pre-ceremony photos?
        </label>
        <div className={styles.choiceRow}>
          <Choice active={firstLook} label="Yes" onClick={() => setFirstLook(true)} />
          <Choice active={!firstLook} label="No" onClick={() => setFirstLook(false)} />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>
          How important is every outfit being different?
        </label>
        <div className={styles.choiceRow}>
          <Choice
            active={importance === "very"}
            label="Very"
            onClick={() => setImportance("very")}
          />
          <Choice
            active={importance === "somewhat"}
            label="Somewhat"
            onClick={() => setImportance("somewhat")}
          />
          <Choice
            active={importance === "not"}
            label="Not at all"
            onClick={() => setImportance("not")}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Rough total outfit budget</label>
        <div className={styles.choiceRow}>
          {(Object.keys(BUDGET_LABEL) as Budget[]).map((b) => (
            <Choice
              key={b}
              active={budget === b}
              label={BUDGET_LABEL[b]}
              onClick={() => setBudget(b)}
            />
          ))}
        </div>
      </div>

      <div className={styles.personaRow}>
        <button
          type="button"
          className={`${styles.personaBtn} ${
            persona === "bride" ? styles.personaBtnOn : ""
          }`}
          onClick={() => setPersona("bride")}
        >
          Bride
        </button>
        <button
          type="button"
          className={`${styles.personaBtn} ${
            persona === "groom" ? styles.personaBtnOn : ""
          }`}
          onClick={() => setPersona("groom")}
        >
          Groom
        </button>
      </div>

      {rows.length > 0 && (
        <div className={primitives.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <span className={primitives.resultEyebrow}>your outfit plan</span>
              <p className={styles.resultLine}>
                <em>{summary.required}</em> required looks ·{" "}
                <em>{summary.optional}</em> optional add-ons
              </p>
            </div>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={copyText}
            >
              {copied ? "copied!" : "copy"}
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Outfit needed</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.event} className={r.optional ? styles.optionalRow : ""}>
                    <td>{r.event}</td>
                    <td>
                      <span
                        className={`${styles.pill} ${
                          r.optional ? styles.pillOptional : ""
                        }`}
                      >
                        {r.needed}
                      </span>
                    </td>
                    <td>{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.checklist}>
            <span className={primitives.resultEyebrow}>don't forget</span>
            <ul>
              <li>Shoes that match each outfit (or a flexible nude/gold pair)</li>
              <li>Jewelry sets — at least one statement, one understated</li>
              <li>Dupatta variations and pinning options</li>
              <li>Alteration timeline: <strong>4–8 weeks per piece</strong></li>
              <li>Backup safety pins, double-sided tape, fashion tape</li>
            </ul>
          </div>

          {tightBudget && perOutfit && (
            <div className={primitives.crosslink}>
              <strong>Budget reality check.</strong> With{" "}
              {summary.required + summary.optional} looks at {BUDGET_LABEL[budget]},
              you're budgeting roughly <strong>${perOutfit.toLocaleString()}</strong>{" "}
              per outfit. Tight but possible — prioritize ceremony and sangeet,
              repeat or rent the rest.
            </div>
          )}

          <div className={styles.alterationCallout}>
            <span className={primitives.resultEyebrow}>plan ahead</span>
            <p className={styles.alterationCopy}>
              Order your ceremony lehenga at least{" "}
              <strong>{orderingMonths} months</strong> before {earliestEvent}.
              Alterations take 4–8 weeks, and rushed work shows in photos.
            </p>
          </div>
        </div>
      )}

      <p className={styles.softCta}>
        Save your outfit plan and set alteration reminders →{" "}
        <Link href="/signup?from=outfit-calculator">
          Create your Marigold account
        </Link>
      </p>
    </MiniToolShell>
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
