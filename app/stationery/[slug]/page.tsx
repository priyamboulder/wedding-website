"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { STATIONERY_SUITES, type StationerySuite } from "@/lib/marketing/data";
import { useCartStore } from "@/stores/cart-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const PALETTES = [
  { label: "Signature", bg: null, card: null, accent: null, ink: null },
  { label: "Ivory & saffron", bg: "#F4EDE0", card: "#FDFAF1", accent: "#C27B1D", ink: "#1C1917" },
  { label: "Walnut & rose", bg: "#E8DED3", card: "#F3E9D8", accent: "#8A5444", ink: "#2A1A10" },
  { label: "Sage & bone", bg: "#E5E4D4", card: "#F4F2E4", accent: "#6B8566", ink: "#1C1917" },
  { label: "Ink & gold", bg: "#E2DDD0", card: "#F1EAD5", accent: "#B8860B", ink: "#1C1917" },
];

export default function StationeryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const suite = STATIONERY_SUITES.find((s) => s.slug === slug);
  if (!suite) return notFound();
  return <SuiteDetail suite={suite} />;
}

function SuiteDetail({ suite }: { suite: StationerySuite }) {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);

  const [activeView, setActiveView] = useState(0);
  const [nameOne, setNameOne] = useState(suite.defaultNames.one);
  const [nameTwo, setNameTwo] = useState(suite.defaultNames.two);
  const [greeting, setGreeting] = useState(suite.defaultGreeting);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const palette = PALETTES[paletteIndex];
  const bg = palette.bg ?? suite.bg;
  const card = palette.card ?? suite.card;
  const accent = palette.accent ?? suite.accent;
  const ink = palette.ink ?? suite.ink;

  const inSelections = useMemo(
    () => items.some((i) => i.id === `stationery:${suite.slug}`),
    [items, suite.slug],
  );

  const related = STATIONERY_SUITES.filter((s) => s.slug !== suite.slug).slice(
    0,
    3,
  );

  const handleAdd = () => {
    add({
      id: `stationery:${suite.slug}`,
      kind: "stationery",
      title: `${suite.name} — ${suite.format}`,
      subtitle: `${nameOne} & ${nameTwo} · ${palette.label}`,
      price: suite.price,
      imageBg: card,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  };

  return (
    <SiteLayout>
      {/* Breadcrumbs */}
      <div className="bg-[#EDE8E0]">
        <div className="mx-auto max-w-[1400px] px-6 pb-2 pt-4 md:px-12 md:pt-6">
          <nav
            className="flex items-center gap-2 text-[12px] text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
          >
            <Link href="/stationery" className="hover:text-[#B8755D]">
              Stationery
            </Link>
            <span>/</span>
            <span className="text-[#1C1917]">{suite.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero: views + info */}
      <section className="bg-[#EDE8E0]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-12 md:px-12 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Views */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] w-full overflow-hidden"
              style={{ backgroundColor: bg }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <ViewCard
                    suite={suite}
                    view={suite.views[activeView]}
                    nameOne={nameOne}
                    nameTwo={nameTwo}
                    greeting={greeting}
                    bg={bg}
                    card={card}
                    accent={accent}
                    ink={ink}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-3">
              {suite.views.map((v, i) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setActiveView(i)}
                  aria-pressed={activeView === i}
                  className={`relative aspect-[4/5] w-[88px] overflow-hidden transition-all ${
                    activeView === i
                      ? "outline outline-2 outline-offset-2 outline-[#B8755D]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: bg }}
                >
                  <div
                    className="absolute inset-[10%]"
                    style={{
                      backgroundColor: card,
                      transform: `rotate(${i % 2 === 0 ? "-2deg" : "2deg"})`,
                    }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 h-[2px] w-4 -translate-x-1/2 -translate-y-1/2"
                    style={{ backgroundColor: accent }}
                  />
                </button>
              ))}
            </div>
            <p
              className="mt-4 text-[#1C1917]/70"
              style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6 }}
            >
              <span
                className="mr-3 text-[10px] uppercase tracking-[0.24em] text-[#A8998A]"
                style={{ fontFamily: BODY }}
              >
                View {activeView + 1}/{suite.views.length}
              </span>
              <span className="text-[#1C1917]" style={{ fontWeight: 500 }}>
                {suite.views[activeView].label}
              </span>{" "}
              — {suite.views[activeView].note}
            </p>
          </div>

          {/* Info + customize */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
              >
                {suite.style}
              </span>
              <h1
                className="mt-4 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(44px, 5.4vw, 80px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                {suite.name}
              </h1>
              <p
                className="mt-6 max-w-[560px] text-[#1C1917]/80"
                style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
              >
                {suite.description}
              </p>

              <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
                <div>
                  <span
                    className="block text-[10px] uppercase text-[#A8998A]"
                    style={{ fontFamily: BODY, letterSpacing: "0.24em" }}
                  >
                    From
                  </span>
                  <span
                    className="text-[#1C1917]"
                    style={{ fontFamily: DISPLAY, fontSize: 36, fontWeight: 500 }}
                  >
                    ${suite.price}
                    <span
                      className="ml-2 text-[14px] text-[#A8998A]"
                      style={{ fontFamily: BODY, fontWeight: 400 }}
                    >
                      /suite
                    </span>
                  </span>
                </div>
                <div>
                  <span
                    className="block text-[10px] uppercase text-[#A8998A]"
                    style={{ fontFamily: BODY, letterSpacing: "0.24em" }}
                  >
                    Lead time
                  </span>
                  <span
                    className="text-[#1C1917]"
                    style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 500 }}
                  >
                    {suite.leadTime}
                  </span>
                </div>
                <div>
                  <span
                    className="block text-[10px] uppercase text-[#A8998A]"
                    style={{ fontFamily: BODY, letterSpacing: "0.24em" }}
                  >
                    Format
                  </span>
                  <span
                    className="text-[#1C1917]"
                    style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 500 }}
                  >
                    {suite.format}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Customize */}
            <div className="mt-12 border-t border-[#1C1917]/15 pt-10">
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
              >
                Customize
              </span>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <LabeledInput
                  label="Name one"
                  value={nameOne}
                  onChange={setNameOne}
                />
                <LabeledInput
                  label="Name two"
                  value={nameTwo}
                  onChange={setNameTwo}
                />
                <div className="md:col-span-2">
                  <LabeledInput
                    label="Greeting"
                    value={greeting}
                    onChange={setGreeting}
                    placeholder={suite.defaultGreeting}
                  />
                </div>
              </div>

              <div className="mt-8">
                <span
                  className="text-[11px] uppercase text-[#A8998A]"
                  style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
                >
                  Palette
                </span>
                <div className="mt-4 flex flex-wrap gap-3">
                  {PALETTES.map((p, i) => {
                    const swatchBg = p.bg ?? suite.bg;
                    const swatchCard = p.card ?? suite.card;
                    const swatchAccent = p.accent ?? suite.accent;
                    const isActive = paletteIndex === i;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPaletteIndex(i)}
                        aria-pressed={isActive}
                        className={`flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 transition-colors ${
                          isActive
                            ? "border-[#1C1917] bg-[#1C1917] text-[#F7F5F0]"
                            : "border-[#1C1917]/20 text-[#1C1917]/85 hover:border-[#1C1917]/60"
                        }`}
                        style={{ fontFamily: BODY, fontSize: 12.5 }}
                      >
                        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: swatchBg }}>
                          <span
                            className="absolute inset-1 rounded-full"
                            style={{ backgroundColor: swatchCard }}
                          />
                          <span
                            className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2"
                            style={{ backgroundColor: swatchAccent }}
                          />
                        </span>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add to Selections */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-3 bg-[#1C1917] px-8 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                {added
                  ? "Added to selections ✓"
                  : inSelections
                    ? "Update selection"
                    : "Add to Selections"}
              </button>
              <Link
                href="/cart"
                className="text-[12.5px] tracking-[0.04em] text-[#1C1917]/75 transition-colors hover:text-[#B8755D]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                View selections →
              </Link>
              <p
                className="basis-full text-[#A8998A]"
                style={{ fontFamily: BODY, fontSize: 11.5, lineHeight: 1.7 }}
              >
                No login required. Your selections are held locally until you
                inquire or order samples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suite contents */}
      <section className="bg-[#F7F5F0]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.3fr] md:gap-20">
            <div>
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
              >
                What&apos;s in the suite
              </span>
              <h2
                className="mt-6 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(28px, 3.4vw, 48px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                  fontWeight: 400,
                }}
              >
                Everything <span style={{ fontStyle: "italic" }}>that arrives</span>.
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-0 md:grid-cols-2">
              {suite.includes.map((inc) => (
                <li
                  key={inc}
                  className="flex items-start gap-4 border-t border-[#1C1917]/10 py-6"
                >
                  <span
                    className="mt-[10px] h-[5px] w-[5px] rotate-45 shrink-0"
                    style={{ backgroundColor: suite.accent }}
                  />
                  <span
                    className="text-[#1C1917]"
                    style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6 }}
                  >
                    {inc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Paper & material */}
      <section className="bg-[#EDE8E0]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.3fr] md:gap-20">
            <div>
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
              >
                Paper &amp; material
              </span>
              <h2
                className="mt-6 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(28px, 3.4vw, 48px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                  fontWeight: 400,
                }}
              >
                {suite.paperStock}
              </h2>
            </div>
            <ul className="flex flex-col gap-0">
              {suite.paperDetails.map((d, i) => (
                <li
                  key={d}
                  className="flex items-start gap-6 border-t border-[#1C1917]/10 py-6"
                >
                  <span
                    className="text-[11px] uppercase text-[#A8998A]"
                    style={{
                      fontFamily: BODY,
                      letterSpacing: "0.24em",
                      minWidth: 28,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[#1C1917]/85"
                    style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7 }}
                  >
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Artisan story */}
      <section className="bg-[#1C1917] text-[#F7F5F0]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 py-24 md:grid-cols-[1fr_1.3fr] md:gap-20 md:px-12 md:py-36">
          <div>
            <span
              className="text-[11px] uppercase text-[#B8755D]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              The artisan
            </span>
            <h2
              className="mt-6"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(32px, 4.2vw, 60px)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                fontWeight: 400,
              }}
            >
              {suite.artisan.name}
            </h2>
            <p
              className="mt-4 text-[#F7F5F0]/60"
              style={{
                fontFamily: BODY,
                fontSize: 14,
                letterSpacing: "0.06em",
              }}
            >
              {suite.artisan.place}
            </p>
          </div>
          <div>
            <p
              className="max-w-[620px] text-[#F7F5F0]/85"
              style={{ fontFamily: BODY, fontSize: 19, lineHeight: 1.75 }}
            >
              {suite.artisan.story}
            </p>
            <Link
              href="/journal/why-we-chose-jaipur"
              className="mt-10 inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.18em] text-[#B8755D] transition-colors hover:text-[#F7F5F0]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Visit the workshop <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-[#F7F5F0]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="mb-14 flex items-baseline justify-between">
            <h2
              className="text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(28px, 3.4vw, 44px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              You may also like
            </h2>
            <Link
              href="/stationery"
              className="text-[12px] uppercase tracking-[0.18em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              All suites →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/stationery/${r.slug}`}
                className="group block"
              >
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden"
                  style={{ backgroundColor: r.bg }}
                >
                  <div
                    className="absolute inset-[12%] transition-transform duration-700 group-hover:-translate-y-2"
                    style={{
                      backgroundColor: r.card,
                      transform: "rotate(-1deg)",
                      boxShadow:
                        "0 30px 60px -30px rgba(28,25,23,0.35)",
                    }}
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <h3
                    className="text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
                    style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 500 }}
                  >
                    {r.name}
                  </h3>
                  <span
                    className="text-[#A8998A]"
                    style={{ fontFamily: BODY, fontSize: 13 }}
                  >
                    from ${r.price}
                  </span>
                </div>
                <p
                  className="mt-1 text-[#A8998A]"
                  style={{
                    fontFamily: BODY,
                    fontSize: 12.5,
                    letterSpacing: "0.04em",
                  }}
                >
                  {r.style}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[10px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.24em" }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-[#1C1917]/25 bg-transparent py-2 text-[16px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY }}
      />
    </label>
  );
}

function ViewCard({
  suite,
  view,
  nameOne,
  nameTwo,
  greeting,
  bg,
  card,
  accent,
  ink,
}: {
  suite: StationerySuite;
  view: StationerySuite["views"][number];
  nameOne: string;
  nameTwo: string;
  greeting: string;
  bg: string;
  card: string;
  accent: string;
  ink: string;
}) {
  void suite;
  void bg;
  return (
    <>
      <div
        className="absolute left-[10%] top-[10%] h-[70%] w-[58%] shadow-[0_20px_50px_-30px_rgba(28,25,23,0.3)]"
        style={{ backgroundColor: "#E0DACD", transform: "rotate(-3deg)" }}
      />
      <div
        className="absolute left-[22%] top-[14%] h-[78%] w-[60%] shadow-[0_30px_60px_-30px_rgba(28,25,23,0.35)]"
        style={{
          backgroundColor: card,
          transform: "rotate(1.2deg)",
          opacity: 0.9,
        }}
      />
      <div
        className="absolute left-[14%] top-[6%] flex h-[84%] w-[70%] flex-col items-center justify-center p-8 shadow-[0_40px_80px_-30px_rgba(28,25,23,0.45)]"
        style={{ backgroundColor: card, color: ink }}
      >
        <span
          className="text-[9px] uppercase"
          style={{
            fontFamily: BODY,
            letterSpacing: "0.36em",
            color: ink,
            opacity: 0.6,
          }}
        >
          {greeting}
        </span>
        <div
          className="my-5 h-px w-16"
          style={{ backgroundColor: accent }}
        />
        <h3
          className="text-center"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(26px, 2.6vw, 34px)",
            lineHeight: 1.1,
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          {nameOne || "—"}
          <br />
          &amp; {nameTwo || "—"}
        </h3>
        <div
          className="my-5 h-px w-16"
          style={{ backgroundColor: accent }}
        />
        <span
          className="text-center text-[9px] uppercase"
          style={{
            fontFamily: BODY,
            letterSpacing: "0.3em",
            color: ink,
            opacity: 0.6,
          }}
        >
          {view.label}
        </span>
      </div>
    </>
  );
}
