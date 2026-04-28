"use client";

// ── Platform page ─────────────────────────────────────────────
// Dedicated page explaining the full Ananya planning platform.
// Hero + interactive module showcase + with/without comparison
// + account-creation CTA at foot.

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { PLATFORM_MODULES } from "@/lib/marketing/data";
import { useAuthStore } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export default function PlatformPage() {
  return (
    <SiteLayout>
      <Hero />
      <Modules />
      <Comparison />
      <AccountCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-8 md:px-12 md:pb-32 md:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          The Platform
        </span>
        <h1
          className="mt-6 max-w-[1080px] text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(38px, 5.6vw, 104px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          The marketplace finds
          <br />
          your people.
          <br />
          <span style={{ fontStyle: "italic" }}>
            The platform orchestrates everything else.
          </span>
        </h1>
        <p
          className="mt-10 max-w-[620px] text-[#5E544B]"
          style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
        >
          Nine modules. One system. Built to carry a multi-day Indian
          wedding from the first muhurtham conversation to the last
          vidaai — with both families, every vendor, and every guest
          accounted for.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <HeroAccountCTA />

          <Link
            href="/marketplace"
            className="text-[13px] tracking-[0.08em] text-[#1C1917]/65 transition-colors hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Browse the marketplace
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Modules() {
  const [active, setActive] = useState(0);
  const current = PLATFORM_MODULES[active];

  return (
    <section className="bg-[#EDE8E0] py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:mb-24 md:flex-row md:items-end md:gap-12">
          <div className="max-w-[640px]">
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              What's inside
            </span>
            <h2
              className="mt-6 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(32px, 4.5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                fontWeight: 400,
              }}
            >
              Every part of the day,
              <br />
              <span style={{ fontStyle: "italic" }}>composed as one.</span>
            </h2>
          </div>
          <p
            className="max-w-[380px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7 }}
          >
            Hover or click a module on the left to preview what it
            looks like inside the planner.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[360px_1fr] md:gap-16">
          <ul className="flex flex-col">
            {PLATFORM_MODULES.map((m, i) => {
              const isActive = i === active;
              return (
                <li key={m.slug}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className="relative block w-full cursor-pointer py-5 text-left md:py-5"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#B8755D] transition-all duration-500"
                      style={{
                        width: "1px",
                        height: isActive ? "54%" : "0%",
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                    <div className="flex items-baseline gap-4 pl-6 pr-2">
                      <span
                        className="text-[11px]"
                        style={{
                          fontFamily: BODY,
                          letterSpacing: "0.2em",
                          color: isActive ? "#B8755D" : "#A8998A",
                          transition: "color 400ms ease",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <h4
                          style={{
                            fontFamily: DISPLAY,
                            fontSize: 22,
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
                          className="mt-1.5"
                          style={{
                            fontFamily: BODY,
                            fontSize: 13,
                            lineHeight: 1.55,
                            color: isActive ? "#B8755D" : "#A8998A",
                            opacity: isActive ? 0.85 : 1,
                            transition: "color 400ms ease, opacity 400ms ease",
                          }}
                        >
                          {m.blurb}
                        </p>
                      </div>
                    </div>
                    {i < PLATFORM_MODULES.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-6 right-0 h-px bg-[#1C1917]/10"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative overflow-hidden rounded-[20px] p-10 md:p-12"
                  style={{
                    backgroundColor: current.previewBg,
                    color: current.previewFg,
                    aspectRatio: "16 / 10",
                    boxShadow:
                      "0 40px 80px -50px rgba(90, 55, 30, 0.35), 0 10px 30px -20px rgba(90,55,30,0.15)",
                  }}
                >
                  <span
                    className="text-[10px] uppercase"
                    style={{
                      fontFamily: BODY,
                      letterSpacing: "0.3em",
                      opacity: 0.75,
                    }}
                  >
                    {current.title}
                  </span>
                  <p
                    className="mt-6 max-w-[520px]"
                    style={{
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontSize: 28,
                      lineHeight: 1.25,
                    }}
                  >
                    {current.blurb}
                  </p>

                  <ModulePreview slug={current.slug} fg={current.previewFg} />
                </div>

                <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-10">
                  {current.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[#1C1917]/85"
                      style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
                    >
                      <span className="mt-2 h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-2.5">
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Per-module preview art ────────────────────────────────────
// Lightweight faux-UI mockups rendered inside the colored hero
// card. Each slug gets a distinct visual so the showcase feels
// alive without needing real video assets.
function ModulePreview({ slug, fg }: { slug: string; fg: string }) {
  const card = "rgba(255,255,255,0.08)";
  const border = "rgba(255,255,255,0.18)";
  const soft = "rgba(255,255,255,0.55)";

  const shell: React.CSSProperties = {
    position: "absolute",
    right: 32,
    bottom: 32,
    left: "auto",
    color: fg,
  };

  if (slug === "guests") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[12px] border p-4"
          style={{
            borderColor: border,
            background: card,
            minWidth: 280,
            fontFamily: BODY,
          }}
        >
          <div className="flex items-center justify-between text-[10px] uppercase" style={{ letterSpacing: "0.2em", opacity: 0.7 }}>
            <span>Household · Patel (6)</span>
            <span>RSVP · 5 of 6</span>
          </div>
          <div className="mt-3 space-y-2 text-[12px]">
            {["Anika · Jain", "Rohan · +1", "Mira · veg", "Devan · child", "Meera · pending"].map((r) => (
              <div key={r} className="flex items-center justify-between">
                <span style={{ opacity: 0.85 }}>{r}</span>
                <span style={{ color: soft }}>●</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "stationery") {
    return (
      <div style={shell} className="hidden md:flex items-end gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[6px] border"
            style={{
              borderColor: border,
              background: "rgba(255,255,255,0.12)",
              width: 92,
              height: 128,
              transform: `translateY(${i * -6}px) rotate(${(i - 1) * 2}deg)`,
            }}
          >
            <div className="px-3 pt-6 text-center" style={{ fontFamily: DISPLAY }}>
              <div className="text-[10px] uppercase" style={{ letterSpacing: "0.2em", opacity: 0.75 }}>
                Save
              </div>
              <div className="mt-2" style={{ fontSize: 14, fontStyle: "italic" }}>
                the date
              </div>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: soft }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slug === "day-of") {
    return (
      <div style={shell} className="hidden md:block" >
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: border, background: card, minWidth: 300, fontFamily: BODY }}
        >
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.24em", opacity: 0.7 }}>
            Muhurtham · 07:42
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              ["06:40", "Baraat line-up", false],
              ["07:15", "Guests seated", true],
              ["07:42", "Ganesh puja", true],
              ["08:05", "Pheras", false],
              ["09:30", "Breakfast", false],
            ].map(([t, label, live]) => (
              <div key={label as string} className="flex items-center gap-3 text-[12px]">
                <span style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.75 }}>
                  {t}
                </span>
                <span style={{ opacity: 0.9 }}>{label}</span>
                {live ? (
                  <span className="ml-auto h-[6px] w-[6px] rounded-full" style={{ background: fg }} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "wardrobe") {
    return (
      <div style={shell} className="hidden md:grid grid-cols-4 gap-2" >
        {["Mehndi", "Sangeet", "Pheras", "Reception"].map((c, i) => (
          <div
            key={c}
            className="rounded-[8px] border"
            style={{
              borderColor: border,
              background: "rgba(255,255,255,0.10)",
              width: 72,
              height: 96,
            }}
          >
            <div
              className="h-2/3 rounded-t-[8px]"
              style={{ background: `rgba(255,255,255,${0.22 - i * 0.035})` }}
            />
            <div
              className="px-2 py-2 text-[9.5px] uppercase"
              style={{ fontFamily: BODY, letterSpacing: "0.18em", opacity: 0.8 }}
            >
              {c}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slug === "catering") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: border, background: card, minWidth: 290, fontFamily: BODY }}
        >
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.24em", opacity: 0.7 }}>
            Reception · 182 plates
          </div>
          <div className="mt-3 space-y-2 text-[12px]">
            {[
              ["Vegetarian", 124],
              ["Jain/Satvik", 31],
              ["Non-veg", 22],
              ["Child / allergy", 5],
            ].map(([label, n]) => (
              <div key={label as string} className="flex items-center gap-3">
                <span style={{ opacity: 0.9, width: 110 }}>{label}</span>
                <div className="h-[3px] flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(((n as number) / 182) * 100)}%`,
                      background: fg,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.8, width: 28, textAlign: "right" }}>
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "guest-experience") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[22px] border p-3"
          style={{
            borderColor: border,
            background: card,
            width: 180,
            height: 260,
            fontFamily: BODY,
          }}
        >
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,0.12)", height: "100%" }}>
            <div className="text-[9px] uppercase" style={{ letterSpacing: "0.22em", opacity: 0.7 }}>
              For the Patels
            </div>
            <div className="mt-3" style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 18 }}>
              Welcome.
            </div>
            <div className="mt-5 space-y-2 text-[11px]">
              <div style={{ opacity: 0.85 }}>Fri · Mehndi, 4pm</div>
              <div style={{ opacity: 0.85 }}>Sat · Sangeet, 7pm</div>
              <div style={{ opacity: 0.85 }}>Sun · Pheras, 7:42am</div>
            </div>
            <div className="mt-4 h-px w-full" style={{ background: soft, opacity: 0.4 }} />
            <div className="mt-3 text-[10px]" style={{ opacity: 0.7 }}>
              Shuttle · Block 2 · 6:50am
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slug === "vendor-hub") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: border, background: card, minWidth: 320, fontFamily: BODY }}
        >
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.24em", opacity: 0.7 }}>
            Vendor Inbox
          </div>
          <div className="mt-3 space-y-2.5 text-[12px]">
            {[
              ["Kavita Florals", "Proof · awaiting approval", true],
              ["Studio Vachan", "Contract v3 signed", false],
              ["Rupa Catering", "Tasting confirmed 4/28", false],
              ["Arrivals DFW", "Shuttle manifest sent", false],
            ].map(([v, note, flag]) => (
              <div key={v as string} className="flex items-center gap-3">
                <span className="h-[6px] w-[6px] rounded-full" style={{ background: flag ? fg : "rgba(255,255,255,0.35)" }} />
                <span style={{ opacity: 0.95, width: 128 }}>{v}</span>
                <span style={{ opacity: 0.7 }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "budget") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: border, background: card, minWidth: 310, fontFamily: BODY }}
        >
          <div className="flex items-center justify-between text-[10px] uppercase" style={{ letterSpacing: "0.22em", opacity: 0.7 }}>
            <span>Budget · $184,000</span>
            <span>Deposits · 64%</span>
          </div>
          <div className="mt-4 h-[4px] w-full rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-full rounded-full" style={{ width: "64%", background: fg, opacity: 0.9 }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-y-2 text-[12px]">
            {[
              ["Decor", "$42k"],
              ["Catering", "$38k"],
              ["Photography", "$22k"],
              ["Stationery", "$6k"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between pr-4">
                <span style={{ opacity: 0.85 }}>{k}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.8 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "timeline") {
    return (
      <div style={shell} className="hidden md:block">
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: border, background: card, minWidth: 340, fontFamily: BODY }}
        >
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.22em", opacity: 0.7 }}>
            9 months → Wedding day
          </div>
          <div className="mt-4 space-y-2">
            {[
              ["Venue booked", 0.05, true],
              ["Save-the-dates sent", 0.22, true],
              ["RSVPs closed", 0.66, false],
              ["Catering count locked", 0.74, false],
              ["Final seating", 0.88, false],
              ["Muhurtham", 1, false],
            ].map(([label, pos, done]) => (
              <div key={label as string} className="flex items-center gap-3 text-[11px]">
                <span style={{ width: 130, opacity: 0.9 }}>{label}</span>
                <div className="relative h-[2px] flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
                  <span
                    className="absolute top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${(pos as number) * 100}%`,
                      width: 8,
                      height: 8,
                      background: done ? fg : "rgba(255,255,255,0.6)",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function Comparison() {
  const without = [
    "A guest spreadsheet your aunt still edits by email",
    "Five WhatsApp groups — vendors, cousins, in-laws, decor, photography",
    "A caterer count that's three days stale",
    "Two parents asking the same vendor the same question, separately",
    "A budget tracker in someone's Notes app",
    "The muhurtham moves, and so does everything — by hand",
    "Guests texting for the dress code, the venue, the shuttle",
    "No single answer to \"where are we on this?\"",
  ];
  const withA = [
    "One guest list. Both families. RSVPs, dietary, lodging — live.",
    "One inbox per vendor. Threads, contracts, approvals in order.",
    "The caterer gets the count the moment RSVPs close.",
    "Permissions keep both families informed without overlap.",
    "A real budget, with deposits, actuals, and who paid what.",
    "Move the muhurtham; the whole schedule recomposes around it.",
    "Guests get a personal link with itinerary, maps, and shuttles.",
    "One dashboard — green, amber, red — visible to the whole family.",
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-36">
      <div className="max-w-[760px]">
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          The difference
        </span>
        <h2
          className="mt-6 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(32px, 4.5vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            fontWeight: 400,
          }}
        >
          What planning looks like
          <br />
          <span style={{ fontStyle: "italic" }}>without Ananya vs. with Ananya.</span>
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-[#1C1917]/10 bg-[#1C1917]/10 md:mt-20 md:grid-cols-2">
        <ComparisonColumn
          kicker="Without"
          heading="Scattered, stale, stressful."
          tone="muted"
          items={without}
        />
        <ComparisonColumn
          kicker="With Ananya"
          heading="Composed, current, calm."
          tone="warm"
          items={withA}
        />
      </div>
    </section>
  );
}

function ComparisonColumn({
  kicker,
  heading,
  tone,
  items,
}: {
  kicker: string;
  heading: string;
  tone: "muted" | "warm";
  items: string[];
}) {
  const isWarm = tone === "warm";
  const bg = isWarm ? "#1C1917" : "#F7F5F0";
  const fg = isWarm ? "#F7F5F0" : "#1C1917";
  const subFg = isWarm ? "rgba(247,245,240,0.72)" : "rgba(28,25,23,0.72)";
  const accent = isWarm ? "#B8755D" : "#A8998A";
  const bullet = isWarm ? "#B8755D" : "rgba(28,25,23,0.3)";

  return (
    <div className="p-8 md:p-12" style={{ background: bg, color: fg }}>
      <span
        className="text-[11px] uppercase"
        style={{ fontFamily: BODY, letterSpacing: "0.3em", color: accent }}
      >
        {kicker}
      </span>
      <h3
        className="mt-5"
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(24px, 2.4vw, 34px)",
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          fontWeight: 400,
        }}
      >
        {heading}
      </h3>
      <ul className="mt-8 space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-4 border-t pt-4"
            style={{
              borderColor: isWarm ? "rgba(247,245,240,0.12)" : "rgba(28,25,23,0.10)",
              fontFamily: BODY,
              fontSize: 15,
              lineHeight: 1.6,
              color: subFg,
            }}
          >
            <span
              aria-hidden
              className="mt-2 h-[4px] w-[4px] rotate-45 shrink-0"
              style={{ background: bullet }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroAccountCTA() {
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const user = useAuthStore((s) => s.user);
  if (user) {
    return (
      <Link
        href="/workspace"
        className="inline-flex items-center gap-3 bg-[#1C1917] px-9 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        Open your planner
        <span aria-hidden className="inline-block translate-y-[-1px]">→</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openSignUp("planning-tool")}
      className="inline-flex items-center gap-3 bg-[#1C1917] px-9 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
      style={{ fontFamily: BODY, fontWeight: 500 }}
    >
      Create Your Account
      <span aria-hidden className="inline-block translate-y-[-1px]">→</span>
    </button>
  );
}

function AccountCTA() {
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const user = useAuthStore((s) => s.user);

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-12 md:pb-40">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] bg-[#1C1917] px-8 py-20 text-[#F7F5F0] md:px-20 md:py-28"
      >
        <div className="relative z-10 text-center">
          <span
            className="text-[11px] uppercase"
            style={{
              fontFamily: BODY,
              letterSpacing: "0.3em",
              color: "#B8755D",
              fontWeight: 500,
            }}
          >
            Free · No credit card · Skip anytime
          </span>
          <h2
            className="mx-auto mt-8 max-w-[900px]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 5vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            Create your account.
            <br />
            <span style={{ fontStyle: "italic" }}>Plan the wedding you actually want.</span>
          </h2>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
            {user ? (
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 bg-[#B8755D] px-10 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                Open your planner →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openSignUp("planning-tool")}
                className="inline-flex items-center justify-center gap-2 bg-[#B8755D] px-10 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                Create Your Account →
              </button>
            )}
            <Link
              href="/marketplace"
              className="text-[13px] tracking-[0.08em] text-[#F7F5F0]/70 transition-colors hover:text-[#F7F5F0]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Browse the marketplace
            </Link>
          </div>

          <p
            className="mx-auto mt-10 max-w-[560px]"
            style={{
              fontFamily: BODY,
              fontSize: 14,
              lineHeight: 1.75,
              color: "rgba(247,245,240,0.65)",
            }}
          >
            An account unlocks saved selections, vendor conversations,
            and the full planning platform. The marketplace stays open
            to everyone.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
