"use client";

// ── For Vendors ────────────────────────────────────────────────
// Recruitment page: hero, how-it-works, why-ananya, categories,
// a clean application form, and an FAQ accordion. Public — no
// account creation required; vendor accounts are provisioned
// after approval.

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type FormState = {
  businessName: string;
  category: string;
  location: string;
  website: string;
  yearsInBusiness: string;
  notes: string;
};

const INITIAL: FormState = {
  businessName: "",
  category: "",
  location: "",
  website: "",
  yearsInBusiness: "",
  notes: "",
};

const CATEGORY_OPTIONS = [
  "Decor & Design",
  "Catering & Dining",
  "Photography",
  "Videography",
  "Mehndi & Henna",
  "Priests & Pandits",
  "Hair & Makeup",
  "Entertainment & Music",
  "Stationery & Invitations",
  "Florists",
  "Transportation",
  "Venues",
  "Bridal Couture",
  "Jewelry",
  "Planning & Coordination",
  "Other",
];

const STEPS = [
  {
    n: "01",
    title: "Apply",
    body: "Fill out a short form with your studio details, portfolio link, and a few words about your work. No account needed yet.",
  },
  {
    n: "02",
    title: "Get Reviewed",
    body: "Our curation team reviews every application by hand. We look at craft, consistency, and whether you're a fit for the couples on Ananya.",
  },
  {
    n: "03",
    title: "Launch Your Profile",
    body: "Approved vendors get onboarded: we set up your account, help you build a standout profile, and you're live in the marketplace.",
  },
];

const VALUE_PROPS = [
  {
    title: "Curated visibility",
    body: "We keep the vendor list intentionally small. Couples trust Ananya because every vendor here has been vetted — you're not competing in a crowd of thousands.",
  },
  {
    title: "Inquiry management tools",
    body: "Lead inbox, proposal builder, calendar holds, and contracts — all in one place. No more losing a quote in an email thread.",
  },
  {
    title: "Multi-day wedding expertise",
    body: "Our platform is built for the reality of Indian weddings: sangeet, mehndi, haldi, baraat, reception. Timelines and coordination that actually fit.",
  },
  {
    title: "Vendor-to-vendor network",
    body: "Photographers know the best mehndi artists; decorators know the caterers who won't miss a cue. The community here refers each other.",
  },
];

const FAQ = [
  {
    q: "Is there a fee to join?",
    a: "No — applying and maintaining a profile is free. We charge a flat introduction fee when a couple books you through the platform. There's no commission on your gross, and clients are always yours to keep.",
  },
  {
    q: "How does the curation process work?",
    a: "A small team reviews each application by hand. We look at your portfolio, years of experience, and the shape of your work. Most decisions take 7 to 10 days. If we're not the right fit right now, we'll tell you why.",
  },
  {
    q: "How do inquiries work?",
    a: "Couples who reach you on Ananya have already clarified their dates, budget, and style in our planner. You get a structured brief, not a cold DM. You respond with a proposal, we help you close — and payment goes directly between you and the client.",
  },
  {
    q: "Can I manage my profile myself?",
    a: "Yes. Once approved, you get a full vendor dashboard: update photos, availability, packages, and respond to inquiries on your own schedule. We're here when you need us, not in the way when you don't.",
  },
];

export default function ForVendorsPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <SiteLayout>
      {/* Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-8 md:px-12 md:pb-32 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            For Vendors
          </span>
          <h1
            className="mt-6 max-w-[900px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(40px, 6vw, 96px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Your craft
            <br />
            <span style={{ fontStyle: "italic" }}>deserves a stage.</span>
          </h1>
          <p
            className="mt-8 max-w-[620px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 17.5, lineHeight: 1.75 }}
          >
            Ananya is a curated marketplace for the artisans, studios, and
            specialists who make Indian weddings unforgettable. We don&apos;t
            list everyone — we list the ones we&apos;d hire ourselves. If
            that&apos;s you, we&apos;d love to meet.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#apply"
              className="inline-flex items-center gap-3 bg-[#1C1917] px-9 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Apply to join →
            </a>
            <Link
              href="/for-vendors/register"
              className="inline-flex items-center gap-3 border border-[#1C1917]/30 px-9 py-4 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Already approved? Register →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works ─────────────────────────────────────────── */}
      <section className="border-t border-[#1C1917]/10 bg-[#F7F5F0]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <SectionLabel eyebrow="How it works" />
          <h2
            className="mt-6 max-w-[720px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            Three steps, <span style={{ fontStyle: "italic" }}>no noise.</span>
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {STEPS.map((s) => (
              <StepCard key={s.n} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Ananya ───────────────────────────────────────────── */}
      <section className="border-t border-[#1C1917]/10">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <SectionLabel eyebrow="Why Ananya" />
          <h2
            className="mt-6 max-w-[820px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            A marketplace that <span style={{ fontStyle: "italic" }}>works for you,</span> not the other way around.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-x-16 gap-y-14 md:grid-cols-2">
            {VALUE_PROPS.map((v, i) => (
              <ValueProp key={v.title} n={String(i + 1).padStart(2, "0")} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* Supported Categories ─────────────────────────────────── */}
      <section className="border-t border-[#1C1917]/10 bg-[#F7F5F0]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-28">
          <SectionLabel eyebrow="Supported categories" />
          <h2
            className="mt-6 max-w-[720px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            We&apos;re currently welcoming applications from:
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
            {CATEGORY_OPTIONS.filter((c) => c !== "Other").map((c) => (
              <li
                key={c}
                className="border-t border-[#1C1917]/15 pt-4 text-[#1C1917]"
                style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500 }}
              >
                {c}
              </li>
            ))}
          </ul>
          <p
            className="mt-12 max-w-[560px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.75 }}
          >
            Don&apos;t see your craft? Select <em>Other</em> in the form —
            we&apos;re always open to adjacent specialties that serve Indian
            weddings well.
          </p>
        </div>
      </section>

      {/* Application Form ─────────────────────────────────────── */}
      <section id="apply" className="border-t border-[#1C1917]/10">
        <div className="mx-auto max-w-[880px] px-6 py-24 md:px-12 md:py-32">
          <SectionLabel eyebrow="Apply to join" />
          <h2
            className="mt-6 max-w-[640px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            Tell us about <span style={{ fontStyle: "italic" }}>your studio.</span>
          </h2>
          <p
            className="mt-6 max-w-[520px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75 }}
          >
            No account required. We&apos;ll only create one once you&apos;ve
            been approved. Already been approved?{" "}
            <Link
              href="/for-vendors/register"
              className="text-[#B8755D] underline underline-offset-2 hover:text-[#1C1917] transition-colors"
              style={{ fontFamily: BODY }}
            >
              Register your account →
            </Link>
          </p>

          <div className="mt-14 rounded-[20px] border border-[#1C1917]/10 bg-[#F7F5F0] p-8 shadow-[0_30px_60px_-40px_rgba(28,25,23,0.15)] md:p-12">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                <Field
                  label="Business name"
                  value={form.businessName}
                  onChange={(v) => update("businessName", v)}
                  required
                />
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(v) => update("category", v)}
                    options={CATEGORY_OPTIONS}
                    required
                  />
                  <Field
                    label="Location"
                    value={form.location}
                    onChange={(v) => update("location", v)}
                    placeholder="City, country"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-[1.5fr_1fr]">
                  <Field
                    label="Portfolio link or website"
                    value={form.website}
                    onChange={(v) => update("website", v)}
                    placeholder="https://"
                    required
                  />
                  <Field
                    label="Years in business"
                    type="number"
                    value={form.yearsInBusiness}
                    onChange={(v) => update("yearsInBusiness", v)}
                    required
                  />
                </div>
                <TextArea
                  label="Tell us about your work"
                  value={form.notes}
                  onChange={(v) => update("notes", v)}
                  rows={6}
                  placeholder="What makes your studio different? Signature style, dream clients, recent projects you're proud of."
                />

                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center gap-3 bg-[#1C1917] px-9 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D] sm:w-auto sm:self-start"
                  style={{ fontFamily: BODY, fontWeight: 500 }}
                >
                  Submit application →
                </button>
                <p
                  className="text-[#A8998A]"
                  style={{ fontFamily: BODY, fontSize: 12.5, lineHeight: 1.7 }}
                >
                  Applications are reviewed weekly. You&apos;ll hear back in
                  7–10 days. No account is created until you&apos;re approved.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-start gap-6 py-8"
              >
                <span className="h-[3px] w-8 bg-[#B8755D]" />
                <h3
                  className="text-[#1C1917]"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 40,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    fontWeight: 400,
                  }}
                >
                  Thank you,{" "}
                  <span style={{ fontStyle: "italic" }}>
                    {form.businessName || "truly"}
                  </span>
                  .
                </h3>
                <p
                  className="max-w-[460px] text-[#1C1917]/75"
                  style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75 }}
                >
                  Your application is in. A real person on our curation team
                  will read every word. If you&apos;re a fit, we&apos;ll reach
                  out within 7 to 10 days to set up your vendor account and
                  walk you through onboarding.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ ──────────────────────────────────────────────────── */}
      <section className="border-t border-[#1C1917]/10 bg-[#F7F5F0]">
        <div className="mx-auto max-w-[880px] px-6 py-24 md:px-12 md:py-32">
          <SectionLabel eyebrow="Frequently asked" />
          <h2
            className="mt-6 text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            Questions, <span style={{ fontStyle: "italic" }}>answered.</span>
          </h2>
          <div className="mt-12 border-t border-[#1C1917]/15">
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// ─── Building blocks ──────────────────────────────────────────

function SectionLabel({ eyebrow }: { eyebrow: string }) {
  return (
    <span
      className="text-[11px] uppercase text-[#B8755D]"
      style={{ fontFamily: BODY, letterSpacing: "0.3em", fontWeight: 500 }}
    >
      {eyebrow}
    </span>
  );
}

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col">
      <span
        className="text-[11px] uppercase text-[#B8755D]"
        style={{ fontFamily: BODY, letterSpacing: "0.3em", fontWeight: 500 }}
      >
        Step {n}
      </span>
      <h3
        className="mt-4 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-4 text-[#1C1917]/75"
        style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.75 }}
      >
        {body}
      </p>
    </div>
  );
}

function ValueProp({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-[#1C1917]/15 pt-6">
      <span
        className="text-[11px] uppercase text-[#B8755D]"
        style={{ fontFamily: BODY, letterSpacing: "0.3em", fontWeight: 500 }}
      >
        {n}
      </span>
      <h3
        className="mt-4 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-4 max-w-[480px] text-[#1C1917]/75"
        style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.75 }}
      >
        {body}
      </p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1C1917]/15">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-6 py-7 text-left transition-colors hover:text-[#B8755D]"
      >
        <span
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            fontWeight: 500,
          }}
        >
          {q}
        </span>
        <span
          className="shrink-0 text-[#B8755D] transition-transform"
          style={{
            fontFamily: BODY,
            fontSize: 22,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
          aria-hidden
        >
          +
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p
          className="max-w-[640px] pb-7 text-[#1C1917]/75"
          style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75 }}
        >
          {a}
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[11px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
      >
        {label}
        {required && <span className="ml-1 text-[#B8755D]">·</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="border-b border-[#1C1917]/25 bg-transparent py-2 text-[15px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY }}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[11px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
      >
        {label}
        {required && <span className="ml-1 text-[#B8755D]">·</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border-b border-[#1C1917]/25 bg-transparent py-2 text-[15px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY }}
      >
        <option value="">Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[11px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
      >
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="resize-none border-b border-[#1C1917]/25 bg-transparent py-2 text-[15px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY }}
      />
    </label>
  );
}
