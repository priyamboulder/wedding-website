"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MiniToolShell } from "@/components/marigold-tools/mini/MiniToolShell";
import primitives from "@/components/marigold-tools/mini/MiniToolPrimitives.module.css";

import {
  categorize,
  type Ctx,
  type EventKey,
  type VendorDef,
} from "./catalog";

import styles from "./VendorChecklistTool.module.css";

type Guests = Ctx["guests"];
type Planner = Ctx["planner"];

const EVENTS: { key: EventKey; label: string }[] = [
  { key: "engagement", label: "Engagement party" },
  { key: "haldi", label: "Haldi" },
  { key: "mehendi", label: "Mehendi night" },
  { key: "sangeet", label: "Sangeet" },
  { key: "baraat", label: "Baraat" },
  { key: "ceremony", label: "Hindu ceremony" },
  { key: "civil", label: "Civil ceremony" },
  { key: "cocktail", label: "Cocktail hour" },
  { key: "reception", label: "Reception / dinner" },
  { key: "brunch", label: "Next-day brunch" },
];

const GUESTS_LABEL: Record<Guests, string> = {
  "under-100": "Under 100",
  "100-200": "100–200",
  "200-300": "200–300",
  "300-plus": "300+",
};

const AVERAGE_FOR: Record<number, number> = {
  3: 9,
  4: 11,
  5: 13,
  6: 14,
  7: 16,
};

export function VendorChecklistTool() {
  const [events, setEvents] = useState<Set<EventKey>>(
    new Set(["mehendi", "sangeet", "ceremony", "reception"]),
  );
  const [separateVenues, setSeparateVenues] = useState<boolean>(false);
  const [planner, setPlanner] = useState<Planner>("day-of");
  const [guests, setGuests] = useState<Guests>("100-200");
  const [copied, setCopied] = useState(false);

  function toggle(k: EventKey) {
    const next = new Set(events);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setEvents(next);
  }

  const ctx: Ctx = useMemo(
    () => ({
      events: EVENTS.filter((e) => events.has(e.key)).map((e) => e.key),
      separateVenues,
      planner,
      guests,
    }),
    [events, separateVenues, planner, guests],
  );

  const { required, recommended, optional } = useMemo(
    () => categorize(ctx),
    [ctx],
  );

  const totalCount = required.length + recommended.length + optional.length;
  const eventCount = ctx.events.length;
  const averageBookings = AVERAGE_FOR[eventCount] ?? Math.max(8, eventCount * 2);

  async function copyText() {
    if (totalCount === 0) return;
    const lines: string[] = [
      `Vendor checklist — ${eventCount} event${eventCount === 1 ? "" : "s"}, ${GUESTS_LABEL[guests]} guests`,
      ``,
      `REQUIRED (${required.length})`,
      ...required.map((v) => `  · ${v.category} — ${v.bookingWindow}`),
      ``,
      `RECOMMENDED (${recommended.length})`,
      ...recommended.map((v) => `  · ${v.category} — ${v.bookingWindow}`),
      ``,
      `OPTIONAL (${optional.length})`,
      ...optional.map((v) => `  · ${v.category} — ${v.bookingWindow}`),
      ``,
      `From The Marigold — Vendor Checklist`,
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
      name="Vendor Checklist"
      tagline="who do you actually need to hire?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Events you're planning</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const on = events.has(e.key);
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
        <label className={primitives.label}>
          Events at different venues?
        </label>
        <div className={styles.choiceRow}>
          <Choice
            active={separateVenues}
            label="Yes"
            onClick={() => setSeparateVenues(true)}
          />
          <Choice
            active={!separateVenues}
            label="No — one venue"
            onClick={() => setSeparateVenues(false)}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Hiring a planner?</label>
        <div className={styles.choiceRow}>
          <Choice
            active={planner === "full"}
            label="Full planner"
            onClick={() => setPlanner("full")}
          />
          <Choice
            active={planner === "day-of"}
            label="Day-of coordinator"
            onClick={() => setPlanner("day-of")}
          />
          <Choice
            active={planner === "none"}
            label="No planner"
            onClick={() => setPlanner("none")}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Rough guest count</label>
        <div className={styles.choiceRow}>
          {(Object.keys(GUESTS_LABEL) as Guests[]).map((g) => (
            <Choice
              key={g}
              active={guests === g}
              label={GUESTS_LABEL[g]}
              onClick={() => setGuests(g)}
            />
          ))}
        </div>
      </div>

      {eventCount > 0 && (
        <div className={primitives.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <span className={primitives.resultEyebrow}>your vendor stack</span>
              <p className={styles.resultLine}>
                <em>{totalCount}</em> categories · across{" "}
                <em>{eventCount}</em> event{eventCount === 1 ? "" : "s"}
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

          <Tier
            label="Required"
            count={required.length}
            tone="required"
            vendors={required}
            ctx={ctx}
          />
          <Tier
            label="Recommended"
            count={recommended.length}
            tone="recommended"
            vendors={recommended}
            ctx={ctx}
          />
          <Tier
            label="Optional"
            count={optional.length}
            tone="optional"
            vendors={optional}
            ctx={ctx}
          />

          <div className={primitives.crosslink}>
            <strong>You've identified {totalCount} vendor categories.</strong>{" "}
            The average Marigold couple books around <strong>{averageBookings}</strong>{" "}
            vendors for a {eventCount}-event wedding — slightly more if every
            event is at a different venue.
          </div>

          <p className={primitives.note}>
            Booking windows are for DFW peak season (Oct–Mar). Off-peak you can
            move 2–3 months later. Off-season weddings in summer get 4–6 months
            of slack.
          </p>
        </div>
      )}

      <p className={styles.softCta}>
        Turn this into your live vendor tracker →{" "}
        <Link href="/signup?from=vendor-checklist">
          Create your free Marigold account
        </Link>
      </p>
    </MiniToolShell>
  );
}

function Tier({
  label,
  count,
  tone,
  vendors,
  ctx,
}: {
  label: string;
  count: number;
  tone: "required" | "recommended" | "optional";
  vendors: VendorDef[];
  ctx: Ctx;
}) {
  if (count === 0) return null;
  return (
    <section className={`${styles.tier} ${styles[`tier_${tone}`]}`}>
      <div className={styles.tierHeader}>
        <span className={styles.tierLabel}>{label}</span>
        <span className={styles.tierCount}>{count}</span>
      </div>
      <div className={styles.vendorList}>
        {vendors.map((v) => (
          <VendorRow key={v.id} vendor={v} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}

function VendorRow({ vendor, ctx }: { vendor: VendorDef; ctx: Ctx }) {
  const events =
    vendor.serves === "all"
      ? "every event"
      : vendor.serves
          .filter((e) => ctx.events.includes(e))
          .join(" · ");

  return (
    <div className={styles.vendor}>
      <div className={styles.vendorHead}>
        <h4 className={styles.vendorName}>{vendor.category}</h4>
        <span className={styles.vendorServes}>{events}</span>
      </div>
      <div className={styles.vendorMeta}>
        <span className={styles.metaLabel}>How many?</span>
        <span className={styles.metaValue}>{vendor.quantity(ctx)}</span>
      </div>
      <div className={styles.vendorMeta}>
        <span className={styles.metaLabel}>Booking window</span>
        <span className={styles.metaValue}>{vendor.bookingWindow}</span>
      </div>
      <div className={styles.questions}>
        <span className={styles.metaLabel}>Questions to ask</span>
        <ul>
          {vendor.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
          <li className={styles.questionsMore}>
            More questions in your Marigold account →
          </li>
        </ul>
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

