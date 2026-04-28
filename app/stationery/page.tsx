"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import {
  STATIONERY_SUITES,
  type StationeryFormat,
  type StationeryOccasion,
  type StationeryStyle,
  type StationerySuite,
} from "@/lib/marketing/data";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const STYLE_OPTIONS: StationeryStyle[] = [
  "Traditional",
  "Contemporary",
  "Fusion",
  "Minimalist",
];

const OCCASION_OPTIONS: StationeryOccasion[] = [
  "Engagement",
  "Sangeet",
  "Mehndi",
  "Wedding",
  "Reception",
  "Save the Date",
];

const FORMAT_OPTIONS: StationeryFormat[] = [
  "Scroll",
  "Boxed",
  "Flat Card",
  "Digital + Print Bundle",
];

type PriceBand = { label: string; min: number; max: number };
const PRICE_BANDS: PriceBand[] = [
  { label: "Under $15", min: 0, max: 14.99 },
  { label: "$15 – $20", min: 15, max: 20 },
  { label: "$20 – $25", min: 20.01, max: 25 },
  { label: "$25+", min: 25.01, max: Infinity },
];

export default function StationeryPage() {
  const [styles, setStyles] = useState<Set<StationeryStyle>>(new Set());
  const [occasions, setOccasions] = useState<Set<StationeryOccasion>>(new Set());
  const [formats, setFormats] = useState<Set<StationeryFormat>>(new Set());
  const [priceBand, setPriceBand] = useState<PriceBand | null>(null);

  const filtered = useMemo(() => {
    return STATIONERY_SUITES.filter((s) => {
      if (styles.size && !s.styleCategories.some((c) => styles.has(c)))
        return false;
      if (occasions.size && !s.occasions.some((o) => occasions.has(o)))
        return false;
      if (formats.size && !formats.has(s.format)) return false;
      if (priceBand && (s.price < priceBand.min || s.price > priceBand.max))
        return false;
      return true;
    });
  }, [styles, occasions, formats, priceBand]);

  const activeCount =
    styles.size + occasions.size + formats.size + (priceBand ? 1 : 0);

  const clearAll = () => {
    setStyles(new Set());
    setOccasions(new Set());
    setFormats(new Set());
    setPriceBand(null);
  };

  return (
    <SiteLayout>
      <Hero />
      <div className="bg-[#EDE8E0]">
        <section className="mx-auto max-w-[1400px] px-6 pb-16 pt-2 md:px-12 md:pb-20">
          <Filters
            styles={styles}
            onStyles={setStyles}
            occasions={occasions}
            onOccasions={setOccasions}
            formats={formats}
            onFormats={setFormats}
            priceBand={priceBand}
            onPriceBand={setPriceBand}
            total={filtered.length}
            activeCount={activeCount}
            onClear={clearAll}
          />
          <ProductGrid suites={filtered} />
        </section>
        <EditorialCallout />
        <Process />
      </div>
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="bg-[#EDE8E0]">
      <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-8 md:px-12 md:pb-24 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            The Stationery Collection
          </span>
          <h1
            className="mt-6 max-w-[1040px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(40px, 6vw, 104px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Invitations
            <br />
            <span style={{ fontStyle: "italic" }}>that arrive</span> before you do.
          </h1>
          <p
            className="mt-10 max-w-[560px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
          >
            Hand-set in India, proofed to your household, addressed from Ananya,
            and shipped worldwide. Every suite is browsable in full — no login
            required to preview, customize, or add to your selections.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

type FiltersProps = {
  styles: Set<StationeryStyle>;
  onStyles: (v: Set<StationeryStyle>) => void;
  occasions: Set<StationeryOccasion>;
  onOccasions: (v: Set<StationeryOccasion>) => void;
  formats: Set<StationeryFormat>;
  onFormats: (v: Set<StationeryFormat>) => void;
  priceBand: PriceBand | null;
  onPriceBand: (v: PriceBand | null) => void;
  total: number;
  activeCount: number;
  onClear: () => void;
};

function Filters({
  styles,
  onStyles,
  occasions,
  onOccasions,
  formats,
  onFormats,
  priceBand,
  onPriceBand,
  total,
  activeCount,
  onClear,
}: FiltersProps) {
  const toggle = <T,>(set: Set<T>, value: T, setter: (v: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  return (
    <div className="border-y border-[#1C1917]/12 py-8 md:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          <FilterGroup label="Style">
            {STYLE_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                active={styles.has(opt)}
                onClick={() => toggle(styles, opt, onStyles)}
                label={opt}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Occasion">
            {OCCASION_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                active={occasions.has(opt)}
                onClick={() => toggle(occasions, opt, onOccasions)}
                label={opt}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Format">
            {FORMAT_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                active={formats.has(opt)}
                onClick={() => toggle(formats, opt, onFormats)}
                label={opt}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Price range">
            {PRICE_BANDS.map((band) => (
              <Chip
                key={band.label}
                active={priceBand?.label === band.label}
                onClick={() =>
                  onPriceBand(priceBand?.label === band.label ? null : band)
                }
                label={band.label}
              />
            ))}
          </FilterGroup>
        </div>
        <div className="flex shrink-0 items-start justify-between gap-6 lg:flex-col lg:items-end lg:justify-start lg:text-right">
          <div>
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              Showing
            </span>
            <div
              className="mt-2 text-[#1C1917]"
              style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 500 }}
            >
              {total}{" "}
              <span
                className="text-[#A8998A]"
                style={{ fontFamily: BODY, fontSize: 13, fontWeight: 400 }}
              >
                of {STATIONERY_SUITES.length} suites
              </span>
            </div>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[12px] uppercase tracking-[0.18em] text-[#B8755D] transition-colors hover:text-[#1C1917]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span
        className="text-[11px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
      >
        {label}
      </span>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
        active
          ? "border-[#1C1917] bg-[#1C1917] text-[#F7F5F0]"
          : "border-[#1C1917]/25 bg-transparent text-[#1C1917]/80 hover:border-[#1C1917]/60"
      }`}
      style={{ fontFamily: BODY, fontWeight: active ? 500 : 400 }}
    >
      {label}
    </button>
  );
}

function ProductGrid({ suites }: { suites: StationerySuite[] }) {
  if (suites.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-start gap-6 border border-dashed border-[#1C1917]/20 p-10 md:p-14">
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          No suites match
        </span>
        <p
          className="max-w-[440px] text-[#1C1917]/75"
          style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7 }}
        >
          Try removing a filter — or get in touch and we&apos;ll brief the
          press on a one-of-one direction for you.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
      {suites.map((suite, i) => (
        <SuiteCard key={suite.slug} suite={suite} index={i} />
      ))}
    </div>
  );
}

function SuiteCard({ suite, index }: { suite: StationerySuite; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.8,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/stationery/${suite.slug}`} className="group block">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{ backgroundColor: suite.bg }}
        >
          <div
            className="absolute left-[10%] top-[10%] h-[70%] w-[58%] shadow-[0_20px_50px_-30px_rgba(28,25,23,0.3)] transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:rotate-[-4deg]"
            style={{ backgroundColor: "#E0DACD", transform: "rotate(-3deg)" }}
          />
          <div
            className="absolute left-[22%] top-[14%] h-[78%] w-[60%] shadow-[0_30px_60px_-30px_rgba(28,25,23,0.35)] transition-transform duration-700 ease-out group-hover:translate-y-1 group-hover:rotate-[2deg]"
            style={{
              backgroundColor: suite.card,
              transform: "rotate(1.2deg)",
              opacity: 0.9,
            }}
          />
          <div
            className="absolute left-[14%] top-[6%] flex h-[84%] w-[70%] flex-col items-center justify-center p-6 shadow-[0_40px_80px_-30px_rgba(28,25,23,0.45)] transition-transform duration-700 ease-out group-hover:-translate-y-2"
            style={{ backgroundColor: suite.card, color: suite.ink }}
          >
            <span
              className="text-[9px] uppercase"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.36em",
                color: suite.ink,
                opacity: 0.6,
              }}
            >
              {suite.defaultGreeting}
            </span>
            <div
              className="my-5 h-px w-14"
              style={{ backgroundColor: suite.accent }}
            />
            <h3
              className="text-center"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(22px, 2.2vw, 28px)",
                lineHeight: 1.1,
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              {suite.defaultNames.one}
              <br />
              &amp; {suite.defaultNames.two}
            </h3>
            <div
              className="my-5 h-px w-14"
              style={{ backgroundColor: suite.accent }}
            />
            <span
              className="text-center text-[9px] uppercase"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.3em",
                color: suite.ink,
                opacity: 0.6,
              }}
            >
              {suite.format}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-6">
          <div>
            <h3
              className="text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontWeight: 500,
              }}
            >
              {suite.name}
            </h3>
            <p
              className="mt-2 text-[#A8998A]"
              style={{ fontFamily: BODY, fontSize: 12.5, letterSpacing: "0.04em" }}
            >
              {suite.style}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span
              className="block text-[10px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.24em" }}
            >
              From
            </span>
            <span
              className="text-[#1C1917]"
              style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 500 }}
            >
              ${suite.price}
              <span
                className="ml-1 text-[12px]"
                style={{
                  fontFamily: BODY,
                  color: "#A8998A",
                  fontWeight: 400,
                }}
              >
                /suite
              </span>
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div
            className="flex flex-wrap gap-x-3 gap-y-1 text-[#1C1917]/60"
            style={{ fontFamily: BODY, fontSize: 11.5, letterSpacing: "0.06em" }}
          >
            {suite.styleCategories.slice(0, 2).map((s) => (
              <span key={s} className="uppercase">
                {s}
              </span>
            ))}
          </div>
          <span
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.08em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Preview <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function EditorialCallout() {
  return (
    <section className="border-y border-[#1C1917]/10 bg-[#F0E8D8]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-24 md:grid-cols-[1.1fr_1fr] md:gap-20 md:px-12 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[11px] uppercase text-[#8A5444]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            The Sourcing Model
          </span>
          <h2
            className="mt-6 text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(36px, 5vw, 76px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Handcrafted in India.
            <br />
            <span style={{ fontStyle: "italic" }}>Delivered worldwide.</span>
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5 self-end"
        >
          <p
            className="max-w-[520px] text-[#1C1917]/85"
            style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
          >
            Every suite on this page is hand-pressed in one of four family
            workshops — Jaipur, Varanasi, Udaipur, and Pondicherry. We pay their
            asking price, keep a full studio credit in every listing, and hand-carry
            the proofs through customs ourselves.
          </p>
          <p
            className="max-w-[520px] text-[#1C1917]/85"
            style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
          >
            From approval to your guests&apos; doorsteps — anywhere in the world —
            is six to twelve weeks. That&apos;s the real cost of a card worth
            keeping.
          </p>
          <Link
            href="/journal/why-we-chose-jaipur"
            className="mt-3 inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.18em] text-[#8A5444] transition-colors hover:text-[#1C1917]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Read the Jaipur dispatch <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    {
      n: "01",
      title: "Preview any suite",
      body: "Every collection is fully browsable — customize names, text, and palette before you ever reach out.",
    },
    {
      n: "02",
      title: "Add to selections",
      body: "Save favorites to an inquiry cart. No login needed — your list is held locally until you ask for proofs.",
    },
    {
      n: "03",
      title: "Proof from the press",
      body: "When you're ready, the studio sets a letterpress proof and mails a physical sample to you.",
    },
    {
      n: "04",
      title: "To every doorstep",
      body: "Printed, addressed from your Ananya guest list, and shipped to every household on earth.",
    },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-12 md:py-40">
      <div className="mb-20 max-w-[720px]">
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          How it works
        </span>
        <h2
          className="mt-6 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(32px, 4.2vw, 60px)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            fontWeight: 400,
          }}
        >
          Browse, customize,
          <br />
          <span style={{ fontStyle: "italic" }}>inquire when you&apos;re ready.</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="border-t border-[#1C1917]/15 pt-6"
          >
            <span
              className="text-[11px] uppercase text-[#B8755D]"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.3em",
                fontWeight: 500,
              }}
            >
              {s.n}
            </span>
            <h3
              className="mt-5 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                lineHeight: 1.2,
                letterSpacing: "-0.005em",
                fontWeight: 500,
              }}
            >
              {s.title}
            </h3>
            <p
              className="mt-3 text-[#1C1917]/75"
              style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.7 }}
            >
              {s.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
