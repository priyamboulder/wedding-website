"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCurrentMember,
  getMembers,
  getMyPendingApplication,
} from "@/lib/rishta-circle/storage";
import { ensureSeeded } from "@/lib/rishta-circle/seed-data";
import type { Application, Member } from "@/lib/rishta-circle/types";

type Viewer =
  | { kind: "loading" }
  | { kind: "guest" }
  | { kind: "pending"; application: Application }
  | { kind: "declined"; application: Application }
  | { kind: "member"; member: Member };

const TESTIMONIALS = [
  {
    quote:
      "It didn't feel like a dating app — it felt like being introduced by a mutual friend with very good taste.",
    attribution: "Priya & Rohan, matched in 2025",
  },
  {
    quote:
      "I submitted my son's profile nervously. Every family we met through the circle was sincere and lovely.",
    attribution: "Kavita, mother of a member",
  },
  {
    quote:
      "Private, calm, and quietly curated. The opposite of the apps, which is exactly what I wanted.",
    attribution: "Maya D.",
  },
];

export function RishtaCircleTab() {
  const [viewer, setViewer] = useState<Viewer>({ kind: "loading" });
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    ensureSeeded();
    setMemberCount(getMembers().length);
    const member = getCurrentMember();
    if (member) {
      setViewer({ kind: "member", member });
      return;
    }
    const pending = getMyPendingApplication();
    if (pending) {
      if (pending.status === "pending") {
        setViewer({ kind: "pending", application: pending });
      } else if (pending.status === "declined") {
        setViewer({ kind: "declined", application: pending });
      } else {
        setViewer({ kind: "guest" });
      }
      return;
    }
    setViewer({ kind: "guest" });
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Subtle warm gradient wash to signal gated territory */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #FBF6EA 0%, #FFFFFF 35%, #FFFFFF 100%)",
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-10 pt-16 pb-14 text-center">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
          <Lock size={10} strokeWidth={2} />
          Vetted · Invitation to apply
        </div>
        <h1 className="mt-7 font-serif text-[56px] font-bold leading-[1.02] tracking-[-0.01em] text-ink md:text-[64px]">
          rishta circle.
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] font-serif text-[18px] italic leading-relaxed text-ink-muted">
          a vetted community for meaningful introductions.
        </p>
        <p className="mx-auto mt-6 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          An application-only circle for families and individuals serious about
          finding a life partner. Every profile is reviewed by hand. Browsing is
          calm, private, and entirely on your own terms — the opposite of an app.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {viewer.kind === "member" ? (
            <Link
              href="/community/rishta-circle/directory"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-[14px] font-medium text-white transition-colors hover:bg-gold-light"
            >
              Enter the Rishta Circle
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          ) : viewer.kind === "pending" ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-pale/60 px-6 py-3 text-[14px] font-medium text-ink-soft">
              <ShieldCheck size={15} strokeWidth={2} className="text-gold" />
              Your application is under review
            </div>
          ) : viewer.kind === "declined" ? (
            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-rose-light/60 bg-white px-5 py-2 text-[13px] text-rose">
                Your most recent application wasn't accepted.
              </span>
              <Link
                href="/community/rishta-circle/apply"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-ink-soft"
              >
                Apply again
              </Link>
            </div>
          ) : (
            <Link
              href="/community/rishta-circle/apply"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-[14px] font-medium text-white transition-colors hover:bg-gold-light"
            >
              Apply to Join
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          )}

          {viewer.kind !== "loading" && (
            <p className="text-[12.5px] text-ink-muted">
              {memberCount} members and counting
            </p>
          )}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-10 py-10">
        <div className="text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
            How it works
          </p>
          <h2 className="mt-2 font-serif text-[30px] font-semibold leading-tight text-ink">
            Three quiet steps.
          </h2>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          <StepCard
            index="01"
            title="Apply"
            description="Share a little about yourself — or your son or daughter. Family submissions are welcome."
          />
          <StepCard
            index="02"
            title="Get reviewed"
            description="Every application is read by hand. We focus on sincerity, not selfies."
          />
          <StepCard
            index="03"
            title="Browse & connect"
            description="Approved members browse the directory and express interest privately. Contact details only exchange on mutual yes."
          />
        </ol>
      </section>

      {/* ── Social proof ───────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-10 py-12">
        <div className="rounded-2xl border border-gold/15 bg-white/70 px-8 py-10 backdrop-blur-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
                In their words
              </p>
              <h2 className="mt-2 font-serif text-[26px] font-semibold text-ink">
                Members, gently on the record.
              </h2>
            </div>
            <div className="hidden items-center gap-1.5 text-[12.5px] text-ink-muted md:flex">
              <Sparkles size={14} strokeWidth={1.8} className="text-gold" />
              {memberCount} members
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.attribution}
                className="rounded-xl border border-ink/6 bg-white p-5"
              >
                <p className="font-serif text-[15px] italic leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  — {t.attribution}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Foot rail ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-10 pb-20 pt-6 text-center">
        <p className="text-[13px] text-ink-muted">
          Looking for the reviewer tools?{" "}
          <Link
            href="/community/rishta-circle/admin"
            className="underline underline-offset-4 hover:text-ink"
          >
            Open the admin panel
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function StepCard({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-2xl border border-ink/8 bg-white px-6 py-7 text-left shadow-sm">
      <p className={cn("font-serif text-[38px] font-bold leading-none text-gold")}>
        {index}
      </p>
      <p className="mt-4 font-serif text-[20px] font-semibold text-ink">
        {title}
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        {description}
      </p>
    </li>
  );
}
