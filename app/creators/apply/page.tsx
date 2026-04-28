"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gem,
  Palette,
  ShoppingBag,
  Sparkles,
  Sprout,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { ApplicationForm } from "@/components/creators/ApplicationForm";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export default function CreatorApplyPage() {
  return (
    <SiteLayout>
      <Hero />
      <HowItWorks />
      <WhatCreatorsCanDo />
      <WhatWeLookFor />
      <TiersPreview />
      <ApplySection />
      <FAQ />
    </SiteLayout>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[800px]"
        >
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#8B7E6F]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            <Sparkles size={12} className="text-[#B8755D]" strokeWidth={1.8} />
            Creator Program
          </div>
          <h1
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(44px, 6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Share your style.
            <br />
            Grow your audience.
            <br />
            <span className="text-[#B8755D]">Earn on every recommendation.</span>
          </h1>
          <p
            className="mt-8 max-w-[580px] text-[#6B6157]"
            style={{ fontFamily: BODY, fontSize: 18, lineHeight: 1.65 }}
          >
            Ananya is where couples plan the most important celebration of
            their lives. We're looking for editors, stylists, planners, and
            artists with a distinct point of view to guide them — and get paid
            for it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-7 py-3.5 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
              style={{ fontFamily: BODY }}
            >
              Apply now
              <ArrowRight size={14} strokeWidth={2} />
            </a>
            <Link
              href="/creators/application-status"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-7 py-3.5 text-[13px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
              style={{ fontFamily: BODY }}
            >
              Check application status
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── How it works ───────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Apply",
      body: "Share your work, your audience, and what you'd create here. Ten minutes, tops.",
    },
    {
      n: "02",
      title: "Get approved",
      body: "Our editorial team reviews every application within 5 business days.",
    },
    {
      n: "03",
      title: "Start creating",
      body: "Unlock collections, guides, drops, and paid consultations — with commissions on every conversion.",
    },
  ];
  return (
    <section className="border-y border-[#E6DFD3] bg-[#FBF9F4]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-12">
        <SectionHeading eyebrow="How it works" title="Three steps to your creator storefront." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative rounded-2xl border border-[#E6DFD3] bg-white p-8"
            >
              <div
                className="text-[#B8755D]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 44,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.n}
              </div>
              <h3
                className="mt-5 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 26,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h3>
              <p
                className="mt-3 text-[#6B6157]"
                style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
              >
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── What creators can do ────────────────────────────────────────────────

function WhatCreatorsCanDo() {
  const features = [
    {
      icon: ShoppingBag,
      title: "Curate collections",
      body: "Hand-picked Creator Picks rows on the Shopping board — your edit, your voice.",
    },
    {
      icon: Sparkles,
      title: "Host exhibitions & drops",
      body: "Limited-time seasonal drops with countdown moments on every couple's home screen.",
    },
    {
      icon: FileText,
      title: "Publish editorial guides",
      body: "Long-form stories, how-tos, and mood pieces that live in the Community reading room.",
    },
    {
      icon: Palette,
      title: "Offer paid consultations",
      body: "1:1 bookings through the consultation marketplace — you set the rate.",
    },
    {
      icon: TrendingUp,
      title: "Earn commissions",
      body: "5–12% on every referred conversion, paid on a monthly schedule.",
    },
    {
      icon: Gem,
      title: "Grow your tier",
      body: "Standard → Rising → Top Creator → Partner. Higher tiers, higher commissions, more features.",
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <SectionHeading
          eyebrow="What you'll build"
          title="A full creator storefront — not just a link in bio."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-[#E6DFD3] bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B8755D]/10 text-[#B8755D]">
                <f.icon size={20} strokeWidth={1.6} />
              </div>
              <h3
                className="mt-5 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 20,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p
                className="mt-2 text-[#6B6157]"
                style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.65 }}
              >
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── What we look for ────────────────────────────────────────────────────

function WhatWeLookFor() {
  const criteria = [
    {
      title: "Genuine expertise",
      body: "Styling, planning, decor, stationery, beauty, photography, culture. Specialists, not generalists.",
    },
    {
      title: "An existing audience or portfolio",
      body: "Doesn't need to be huge — it needs to demonstrate credibility. Social, blog, press, client work all count.",
    },
    {
      title: "Alignment with our values",
      body: "Authenticity. Inclusivity. Quality over quantity. Editorial taste over hustle.",
    },
    {
      title: "Willingness to create original work",
      body: "Repost-aggregator accounts aren't a fit. We want your point of view.",
    },
  ];
  return (
    <section className="border-y border-[#E6DFD3] bg-[#FBF9F4]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <SectionHeading
          eyebrow="What we look for"
          title="The bar, written plainly — so you can self-select."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {criteria.map((c) => (
            <div
              key={c.title}
              className="flex gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-6"
            >
              <CheckCircle2
                size={22}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 text-[#B8755D]"
              />
              <div>
                <h3
                  className="text-[#1C1917]"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 20,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  className="mt-2 text-[#6B6157]"
                  style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.65 }}
                >
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tier preview ───────────────────────────────────────────────────────

function TiersPreview() {
  const tiers = [
    {
      icon: Sprout,
      name: "Standard",
      commission: "5%",
      blurb: "Where every approved creator begins.",
    },
    {
      icon: TrendingUp,
      name: "Rising",
      commission: "6%",
      blurb: "Momentum tier — unlocks drops and featured placements.",
    },
    {
      icon: Trophy,
      name: "Top Creator",
      commission: "8%",
      blurb: "Editorial spotlight, higher commission, priority support.",
    },
    {
      icon: Gem,
      name: "Partner",
      commission: "10–12%",
      blurb: "Co-curated seasonal collections and brand collaborations.",
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <SectionHeading
          eyebrow="Creator tiers"
          title="Grow from Standard to Partner — on your own timeline."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[#E6DFD3] bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E9DC] text-[#B8755D]">
                <t.icon size={18} strokeWidth={1.6} />
              </div>
              <div
                className="mt-5 text-[11px] uppercase tracking-[0.16em] text-[#8B7E6F]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                {t.name}
              </div>
              <div
                className="mt-1 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 34,
                  lineHeight: 1,
                  letterSpacing: "-0.015em",
                }}
              >
                {t.commission}
              </div>
              <p
                className="mt-3 text-[#6B6157]"
                style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6 }}
              >
                {t.blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Apply section ──────────────────────────────────────────────────────

function ApplySection() {
  return (
    <section id="apply" className="border-y border-[#E6DFD3] bg-[#FBF9F4]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <SectionHeading
          eyebrow="Apply"
          title="Tell us who you are. We'll get back to you in 5 business days."
        />
        <div className="mt-14">
          <ApplicationForm />
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────

function FAQ() {
  const items = [
    {
      q: "How long does approval take?",
      a: "Typically 5 business days. Our editorial team reviews every application personally — we don't use automated filters.",
    },
    {
      q: "Do I need a minimum follower count?",
      a: "No. A small, engaged, wedding-focused audience is more valuable to us than a large generalist one. Portfolio depth matters more than follower count.",
    },
    {
      q: "How do commissions work?",
      a: "You earn 5–12% (depending on tier) on every product a couple buys through your collections, exhibitions, drops, or guides. Commissions are calculated on order subtotal and paid monthly.",
    },
    {
      q: "Can I apply as a vendor too?",
      a: "Yes — vendors can be creators, and creators can be vendors. They're separate programs with separate profiles. Apply to each one that fits.",
    },
    {
      q: "What if I'm rejected?",
      a: "We'll explain why, and you can reapply after 90 days with updated work. Rejections aren't permanent — most rejections are a timing issue.",
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-[860px] px-6 py-24 md:px-12">
        <SectionHeading eyebrow="FAQ" title="Common questions." />
        <div className="mt-12 space-y-3">
          {items.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[#E6DFD3] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 19,
            letterSpacing: "-0.01em",
          }}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.8}
          className={`shrink-0 text-[#8B7E6F] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <p
            className="px-6 pb-5 text-[#6B6157]"
            style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7 }}
          >
            {a}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ── Shared heading ──────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-[760px]">
      <div
        className="text-[11px] uppercase tracking-[0.22em] text-[#B8755D]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {eyebrow}
      </div>
      <h2
        className="mt-4 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(32px, 4vw, 54px)",
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          fontWeight: 400,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
