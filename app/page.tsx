"use client";

// ── Ananya landing page ───────────────────────────────────────────────────
// Aesop × Condé Nast Traveller × Aman Resorts. Quiet luxury. One terracotta
// accent used sparingly. Nav and Footer come from <SiteLayout/>; this file
// renders the hero through the featured-vendors sections underneath.

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { AnanyaHero } from "@/components/marketing/AnanyaHero";
import { CATEGORIES, PLATFORM_MODULES } from "@/lib/marketing/data";
import { useVendorsStore } from "@/stores/vendors-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

export default function Landing() {
  return (
    <SiteLayout flushTop>
      <AnanyaHero />
      <Marketplace />
      <FeaturedVendors />
      <Platform />
      <StationeryTeaser />
      <TrustNotes />
      <VendorCTA />
    </SiteLayout>
  );
}

// ── Marketplace ─────────────────────────────────────────────────
function Marketplace() {
  return (
    <section id="marketplace" className="relative pt-32 md:pt-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between md:gap-16"
        >
          <h2
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(40px, 5.5vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            The Marketplace
          </h2>
          <p
            className="max-w-[440px] text-[#A8998A]"
            style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.65 }}
          >
            Every vendor on Ananya is here because they&apos;re extraordinary at what they do.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-6 md:gap-6 md:px-12"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="shrink-0" aria-hidden />
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.slug} index={i} cat={cat} />
          ))}
          <div className="w-6 shrink-0 md:w-12" aria-hidden />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1400px] px-6 md:px-12">
        <Link
          href="/marketplace"
          className="group inline-flex items-center gap-2 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          <span className="relative">
            Browse the full marketplace
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#B8755D] transition-transform duration-500 group-hover:scale-x-100" />
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}

function CategoryCard({
  cat,
  index,
}: {
  cat: (typeof CATEGORIES)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0"
    >
      <Link
        href={`/marketplace/${cat.slug}`}
        className="group relative flex h-[380px] w-[280px] snap-start flex-col justify-end overflow-hidden p-6 transition-transform duration-700 hover:-translate-y-2"
        style={{ backgroundColor: cat.bg, color: cat.fg }}
      >
        {cat.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.photo}
            alt={cat.name}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-30"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <p
            className="max-w-[200px]"
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.35,
              color: cat.fg,
              opacity: 0.85,
            }}
          >
            {cat.tagline}
          </p>
        </div>

        <div className="relative z-10 transition-opacity duration-500 group-hover:opacity-0">
          <div
            className="text-[10px] uppercase"
            style={{
              fontFamily: BODY,
              letterSpacing: "0.26em",
              opacity: 0.7,
              fontWeight: 400,
            }}
          >
            {String(index + 1).padStart(2, "0")} — {cat.count} Vendors
          </div>
          <h3
            className="mt-3"
            style={{
              fontFamily: DISPLAY,
              fontSize: 28,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              fontWeight: 500,
            }}
          >
            {cat.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Featured vendors ────────────────────────────────────────────
function FeaturedVendors() {
  const allVendors = useVendorsStore((s) => s.vendors);
  const initFromAPI = useVendorsStore((s) => s.initFromAPI);
  const featured = allVendors.slice(0, 6);

  useEffect(() => {
    if (allVendors.length === 0) initFromAPI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="relative pt-28 md:pt-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.4 }}
          className="mb-14 flex items-baseline justify-between"
        >
          <h3
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(26px, 2.8vw, 36px)",
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            Featured this season
          </h3>
          <Link
            href="/marketplace"
            className="text-[13px] tracking-[0.04em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            All Vendors →
          </Link>
        </motion.div>

        {featured.length === 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full bg-[#E8E3DC] rounded-sm" />
                <div className="mt-5 h-5 w-3/4 bg-[#E8E3DC] rounded-sm" />
                <div className="mt-2 h-3 w-1/2 bg-[#E8E3DC] rounded-sm" />
              </div>
            ))}
          </div>
        ) : (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px" }}
          variants={stagger}
          className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featured.map((v) => (
            <motion.div key={v.slug ?? v.id} variants={fadeUp}>
              <Link href={`/marketplace/${v.slug}`} className="group block">
                <div className="relative aspect-square w-full overflow-hidden bg-[#9C6F5D]">
                  {v.cover_image && (
                    <img
                      src={v.cover_image}
                      alt={v.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-4 top-4">
                    <span
                      className="inline-flex items-center gap-2 bg-[#F7F5F0]/90 px-3 py-1.5 text-[9px] uppercase text-[#1C1917]"
                      style={{ fontFamily: BODY, letterSpacing: "0.22em", fontWeight: 500 }}
                    >
                      <span className="h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
                      Ananya Curated
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{ boxShadow: "inset 0 -100px 120px -60px rgba(0,0,0,0.35)" }}
                  />
                </div>
                <div className="mt-5">
                  <h4
                    className="text-[#1C1917]"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 22,
                      lineHeight: 1.15,
                      letterSpacing: "-0.005em",
                      fontWeight: 500,
                    }}
                  >
                    {v.name}
                  </h4>
                  <p
                    className="mt-1.5 text-[#A8998A]"
                    style={{ fontFamily: BODY, fontSize: 13, letterSpacing: "0.02em" }}
                  >
                    {CATEGORY_LABELS[v.category]} · {v.location}
                  </p>
                </div>
                <span
                  className="mt-3 inline-block text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
                  style={{ fontFamily: BODY, fontWeight: 500 }}
                >
                  View Profile →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )}
      </div>
    </section>
  );
}

// ── Platform preview ────────────────────────────────────────────
function Platform() {
  const [active, setActive] = useState(0);
  const current = PLATFORM_MODULES[active];

  return (
    <section id="platform" className="relative pt-40 md:pt-56">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[960px] text-center"
        >
          <h2
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(36px, 5vw, 76px)",
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            The marketplace finds your people.
            <br />
            <span style={{ fontStyle: "italic" }}>
              The platform orchestrates everything else.
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid gap-10 md:mt-24 md:grid-cols-[40%_60%] md:gap-14 lg:gap-20"
        >
          <ul className="flex flex-col">
            {PLATFORM_MODULES.map((m, i) => {
              const isActive = i === active;
              return (
                <li key={m.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className="relative block w-full cursor-pointer py-5 text-left md:py-7"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#B8755D] transition-all duration-500"
                      style={{
                        width: "1px",
                        height: isActive ? "46%" : "0%",
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                    <div className="pl-6 pr-2 md:pl-8">
                      <h4
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 24,
                          lineHeight: 1.15,
                          letterSpacing: "-0.005em",
                          fontWeight: 500,
                          color: isActive ? "#B8755D" : "#1C1917",
                          transition: "color 400ms ease",
                        }}
                      >
                        {m.title}
                      </h4>
                      <p
                        className="mt-2"
                        style={{
                          fontFamily: BODY,
                          fontSize: 14.5,
                          lineHeight: 1.6,
                          color: isActive ? "#B8755D" : "#A8998A",
                          opacity: isActive ? 0.85 : 1,
                          transition: "color 400ms ease, opacity 400ms ease",
                        }}
                      >
                        {m.blurb}
                      </p>
                    </div>
                    {i < PLATFORM_MODULES.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-6 right-0 h-px bg-[#1C1917]/10 md:left-8"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col">
            <div
              className="relative w-full overflow-hidden rounded-[18px]"
              style={{
                aspectRatio: "16 / 10",
                boxShadow:
                  "0 30px 60px -40px rgba(90, 55, 30, 0.35), 0 10px 20px -15px rgba(90, 55, 30, 0.15)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0"
                  style={{
                    backgroundColor: current.previewBg,
                    color: current.previewFg,
                  }}
                >
                  <ModulePreview slug={current.slug} fg={current.previewFg} />
                  <span
                    className="absolute left-6 top-5 text-[10px] uppercase"
                    style={{
                      fontFamily: BODY,
                      letterSpacing: "0.3em",
                      opacity: 0.75,
                      color: current.previewFg,
                    }}
                  >
                    Preview — {current.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {current.pills.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full border border-[#1C1917]/12 bg-[#F7F5F0] px-4 py-1.5 text-[11px] uppercase text-[#1C1917]/75"
                  style={{ fontFamily: BODY, letterSpacing: "0.16em", fontWeight: 500 }}
                >
                  {p}
                </span>
              ))}
            </div>
            <Link
              href="/platform"
              className="group mt-8 inline-flex items-center gap-2 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              <span className="relative">
                Explore the platform
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#B8755D] transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Module preview mockups ──────────────────────────────────────
// Each platform module gets a tiny animated UI mockup that plays
// on a loop — acts as a stand-in for a product screen recording
// without the weight of actual video assets.

function ModulePreview({ slug, fg }: { slug: string; fg: string }) {
  switch (slug) {
    case "guests":
      return <GuestsMockup fg={fg} />;
    case "stationery":
      return <StationeryMockup fg={fg} />;
    case "day-of":
      return <DayOfMockup fg={fg} />;
    case "wardrobe":
      return <WardrobeMockup fg={fg} />;
    case "catering":
      return <CateringMockup fg={fg} />;
    case "guest-experience":
      return <GuestExperienceMockup fg={fg} />;
    default:
      return null;
  }
}

function MockCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-[6px] bg-[#F7F5F0]/95 px-4 py-3 text-[#1C1917] shadow-[0_12px_24px_-18px_rgba(0,0,0,0.35)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Demo-only data for the marketing landing page mockup animation.
// These are illustrative examples, not real user data.
const LANDING_GUEST_DEMO = [
  { name: "The Shah Family", sub: "Party of 5 · Attending", state: "yes" },
  { name: "Priya & Aditya", sub: "Party of 2 · Attending", state: "yes" },
  { name: "Meera Desai", sub: "Party of 1 · Pending", state: "pending" },
  { name: "The Kapoor Family", sub: "Party of 4 · Attending", state: "yes" },
];

function GuestsMockup({ fg }: { fg: string }) {
  const guests = LANDING_GUEST_DEMO;
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-10 pt-12">
      {guests.map((g, i) => (
        <motion.div
          key={g.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
        >
          <MockCard className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 500 }}>
                {g.name}
              </div>
              <div
                className="mt-0.5 text-[#6B6B6B]"
                style={{ fontFamily: BODY, fontSize: 11 }}
              >
                {g.sub}
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[9px] uppercase"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.18em",
                backgroundColor: g.state === "yes" ? "#E8F0E0" : "#F5E6C8",
                color: g.state === "yes" ? "#4A5240" : "#8A6B22",
                fontWeight: 500,
              }}
            >
              {g.state === "yes" ? "RSVP ✓" : "Pending"}
            </span>
          </MockCard>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-1 flex items-center gap-2 pl-1 text-[10px] uppercase"
        style={{ fontFamily: BODY, letterSpacing: "0.24em", color: fg, opacity: 0.7 }}
      >
        <span className="h-[3px] w-[3px] rotate-45 bg-current" />
        412 of 524 confirmed
      </motion.div>
    </div>
  );
}

function StationeryMockup({ fg }: { fg: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-10 pt-6">
      <div className="relative h-[78%] w-[58%]">
        <motion.div
          initial={{ opacity: 0, y: 14, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 0.7 }}
          className="absolute left-0 top-[8%] h-[84%] w-[76%] bg-[#E0DACD] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 14, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="absolute right-0 top-[3%] flex h-[94%] w-[78%] flex-col items-center justify-center bg-[#FDFBF5] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]"
        >
          <span
            className="text-[8px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            Together with their families
          </span>
          <div className="my-3 h-px w-10 bg-[#B8755D]" />
          <div
            className="text-center text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.1,
            }}
          >
            Aanya
            <br />
            <span
              className="text-[10px] not-italic text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.26em" }}
            >
              &amp;
            </span>
            <br />
            Rohan
          </div>
          <div className="my-3 h-px w-10 bg-[#B8755D]" />
          <span
            className="text-center text-[8px] uppercase text-[#1C1917]/60"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            The Twentieth of November
          </span>
        </motion.div>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-5 right-6 rounded-full bg-[#F7F5F0]/90 px-3 py-1 text-[9px] uppercase text-[#1C1917]"
        style={{ fontFamily: BODY, letterSpacing: "0.22em", fontWeight: 500 }}
      >
        Proof · v3
      </motion.span>
    </div>
  );
}

function DayOfMockup({ fg }: { fg: string }) {
  const cues = [
    { time: "04:17 AM", label: "Muhurtham", pill: "Anchor" },
    { time: "05:30 AM", label: "Pheras begin", pill: "Officiant cue" },
    { time: "07:00 AM", label: "Breakfast service", pill: "Catering" },
    { time: "09:15 AM", label: "Reception shuttles", pill: "Transport" },
  ];
  return (
    <div className="absolute inset-0 px-10 pt-12">
      <div className="relative h-full">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute left-[14px] top-2 h-[72%] w-px origin-top bg-current opacity-40"
          style={{ color: fg }}
        />
        <div className="flex flex-col gap-2.5">
          {cues.map((c, i) => (
            <motion.div
              key={c.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.15 }}
              className="relative flex items-center gap-4"
            >
              <span
                className="relative z-10 h-[10px] w-[10px] rounded-full border-2"
                style={{
                  borderColor: fg,
                  backgroundColor: i === 0 ? "#B8755D" : "transparent",
                }}
              />
              <MockCard className="flex flex-1 items-center justify-between py-2">
                <div>
                  <div
                    className="text-[10px] uppercase text-[#A8998A]"
                    style={{ fontFamily: BODY, letterSpacing: "0.22em" }}
                  >
                    {c.time}
                  </div>
                  <div
                    className="mt-0.5"
                    style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 500 }}
                  >
                    {c.label}
                  </div>
                </div>
                <span
                  className="rounded-full border border-[#1C1917]/12 px-2.5 py-1 text-[9px] uppercase text-[#1C1917]/70"
                  style={{
                    fontFamily: BODY,
                    letterSpacing: "0.18em",
                    fontWeight: 500,
                  }}
                >
                  {c.pill}
                </span>
              </MockCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WardrobeMockup({ fg }: { fg: string }) {
  const looks = [
    { name: "Mehndi",    color: "#D4A843", photo: "/wedding-photos/mehndi/mehndi-02.jpg" },
    { name: "Sangeet",   color: "#B8755D", photo: "/wedding-photos/sangeet/sangeet-03.jpg" },
    { name: "Pheras",    color: "#9C6F5D", photo: "/wedding-photos/wedding/wedding-02.jpg" },
    { name: "Reception", color: "#3A4452", photo: "/wedding-photos/usa-decor/usa-decor-030.jpg" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 px-10 pt-10">
      <div className="grid grid-cols-4 gap-3">
        {looks.map((l, i) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 * i }}
            className="overflow-hidden rounded-[6px] bg-[#F7F5F0]/95 shadow-[0_12px_24px_-18px_rgba(0,0,0,0.35)]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: l.color }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.photo} alt={l.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </div>
            <div
              className="px-2 py-2 text-center text-[10px] uppercase text-[#1C1917]/80"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.2em",
                fontWeight: 500,
              }}
            >
              {l.name}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-1 flex items-center justify-between text-[10px] uppercase"
        style={{ fontFamily: BODY, letterSpacing: "0.24em", color: fg, opacity: 0.8 }}
      >
        <span>Fitting 3 · confirmed</span>
        <span>4 looks · bride</span>
      </motion.div>
    </div>
  );
}

function CateringMockup({ fg }: { fg: string }) {
  const dishes = [
    { name: "Dhokla station", tag: "Jain · Vg" },
    { name: "Kathi rolls, live", tag: "Veg / Chx" },
    { name: "Chaat bar", tag: "All diets" },
    { name: "Masala dosa cart", tag: "Veg · GF" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-10 pt-10">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-1 flex items-center justify-between text-[10px] uppercase"
        style={{ fontFamily: BODY, letterSpacing: "0.24em", color: fg, opacity: 0.85 }}
      >
        <span>Sangeet · Saturday</span>
        <span>412 covers</span>
      </motion.div>
      {dishes.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
        >
          <MockCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rotate-45 bg-[#B8755D]" />
              <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 500 }}>
                {d.name}
              </span>
            </div>
            <span
              className="rounded-full bg-[#EDE8E0] px-2.5 py-1 text-[9px] uppercase text-[#5C463A]"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.18em",
                fontWeight: 500,
              }}
            >
              {d.tag}
            </span>
          </MockCard>
        </motion.div>
      ))}
    </div>
  );
}

function GuestExperienceMockup({ fg }: { fg: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative h-[78%] w-[42%] min-w-[200px] overflow-hidden rounded-[22px] bg-[#1C1917] p-[6px] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)]"
      >
        <div className="h-full w-full overflow-hidden rounded-[18px] bg-[#F7F5F0] p-4">
          <div
            className="text-[8px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
          >
            Shah — Party of 5
          </div>
          <div
            className="mt-1 text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              fontStyle: "italic",
              lineHeight: 1.1,
            }}
          >
            Today — Sangeet
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {["6:00  Arrivals & chai", "7:30  Dhol procession", "8:15  Performances", "10:00  Dinner"].map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
                className="rounded-md bg-[#EDE8E0] px-2.5 py-1.5 text-[10px] text-[#1C1917]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mt-3 rounded-md border border-[#B8755D]/40 bg-[#F5E0D6]/40 px-2.5 py-1.5 text-[9px] uppercase text-[#8A4A32]"
            style={{ fontFamily: BODY, letterSpacing: "0.2em", fontWeight: 500 }}
          >
            Shuttle 4 · 5:30 lobby
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Stationery teaser ───────────────────────────────────────────
function StationeryTeaser() {
  return (
    <section
      id="stationery"
      className="relative mt-40 bg-[#EDE8E0] py-32 md:mt-56 md:py-48"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 lg:col-start-1"
          >
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              Stationery — a preview
            </span>
            <h2
              className="mt-8 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(36px, 5vw, 76px)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                fontWeight: 400,
              }}
            >
              Invitations that
              <br />
              <span style={{ fontStyle: "italic" }}>arrive before you do.</span>
            </h2>
            <p
              className="mt-8 max-w-[480px] text-[#5E544B]"
              style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.7 }}
            >
              Hand-lettered and crafted by artisans in India. Customized through
              the platform. Delivered to every doorstep.
            </p>
            <Link
              href="/stationery"
              className="group mt-10 inline-flex items-center gap-2 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              <span className="relative">
                Preview Collections
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#B8755D] transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:col-start-8"
          >
            <InvitationSuite />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InvitationSuite() {
  return (
    <div className="relative aspect-[4/5] w-full">
      <div
        className="absolute left-[10%] top-[6%] h-[70%] w-[58%] bg-[#E0DACD] shadow-[0_20px_50px_-30px_rgba(28,25,23,0.3)]"
        style={{ transform: "rotate(-3deg)" }}
      />
      <div
        className="absolute left-[22%] top-[14%] h-[78%] w-[60%] bg-[#F2EDE2] shadow-[0_30px_60px_-30px_rgba(28,25,23,0.35)]"
        style={{ transform: "rotate(1.5deg)" }}
      />
      <div className="absolute left-[14%] top-[4%] flex h-[86%] w-[70%] flex-col items-center justify-center bg-[#F7F5F0] p-8 shadow-[0_40px_80px_-30px_rgba(28,25,23,0.45)]">
        <span
          className="text-[9px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.36em" }}
        >
          Together with their families
        </span>
        <div className="my-6 h-px w-14 bg-[#B8755D]" />
        <h3
          className="text-center text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(24px, 3vw, 38px)",
            lineHeight: 1.1,
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          Aanya
          <br />
          <span className="text-[13px] not-italic text-[#A8998A]" style={{ fontFamily: BODY, letterSpacing: "0.28em" }}>
            &amp;
          </span>
          <br />
          Rohan
        </h3>
        <div className="my-6 h-px w-14 bg-[#B8755D]" />
        <span
          className="text-center text-[10px] uppercase text-[#1C1917]/60"
          style={{ fontFamily: BODY, letterSpacing: "0.32em", lineHeight: 2 }}
        >
          The Twentieth of November
          <br />
          Two Thousand and Twenty-Six
        </span>
      </div>
    </div>
  );
}

// ── Trust / social proof ───────────────────────────────────────
function TrustNotes() {
  const lines = [
    "Launching in DFW",
    "40+ curated vendors",
    "Built for multi-day celebrations",
    "Trusted by families who care about the details",
  ];
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px" }}
          variants={stagger}
          className="flex flex-col items-center justify-center gap-y-6 text-center md:flex-row md:flex-wrap md:justify-between md:gap-x-10"
        >
          {lines.map((line, i) => (
            <motion.div
              key={line}
              variants={fadeUp}
              className="flex items-center gap-6"
            >
              <span
                className="text-[13px] uppercase text-[#1C1917]/70"
                style={{
                  fontFamily: BODY,
                  letterSpacing: "0.24em",
                  fontWeight: 400,
                }}
              >
                {line}
              </span>
              {i < lines.length - 1 && (
                <span className="hidden h-[3px] w-[3px] rotate-45 bg-[#B8755D] md:inline-block" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Vendor CTA ──────────────────────────────────────────────────
function VendorCTA() {
  return (
    <section id="vendors-apply" className="relative py-32 md:py-48">
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            For Vendors
          </span>
          <h2
            className="mx-auto mt-8 max-w-[820px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(34px, 4.6vw, 68px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            If your work speaks,
            <br />
            <span style={{ fontStyle: "italic" }}>we&apos;d like to listen.</span>
          </h2>
          <p
            className="mx-auto mt-8 max-w-[560px] text-[#A8998A]"
            style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.7 }}
          >
            Ananya is a curated marketplace. We partner with vendors who bring
            craft, reliability, and heart to every celebration.
          </p>
          <Link
            href="/for-vendors"
            className="group mt-12 inline-flex items-center gap-2 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            <span className="relative">
              Apply to Join
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#B8755D] transition-transform duration-500 group-hover:scale-x-100" />
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
