// ── /share ──────────────────────────────────────────────────────────────────
// "Share Your Shaadi" landing page. Shown when a couple clicks the banner from
// the Real Weddings tab — mirrors the pitch section but as its own URL so the
// page can be linked from emails and other touchpoints.

import Link from "next/link";
import { ArrowLeft, ArrowRight, PenLine, Sparkles, Heart } from "lucide-react";
import { ShareNav } from "@/components/share/ShareNav";
import { Badge } from "@/components/share/Badge";
import { GradientCard } from "@/components/share/GradientCard";
import { ShareDots } from "@/components/share/ShareDots";
import { SubmittedCount } from "@/components/share/SubmittedCount";
import { ShareSessionBootstrap } from "@/components/share/ShareSessionBootstrap";

export const metadata = {
  title: "Share Your Shaadi · The Marigold",
  description:
    "Just got married? Submit your wedding for a Real Wedding feature on The Marigold.",
};

export default function ShareLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ivory">
      <ShareDots />
      <ShareNav />
      <ShareSessionBootstrap />

      {/* Hero */}
      <section className="relative z-10 px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/community?tab=real-weddings"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to Real Weddings
          </Link>
          <p
            className="mt-8 font-display text-[18px] italic text-gold md:text-[22px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            share your shaadi
          </p>
          <h1
            className="mt-3 max-w-3xl text-[44px] font-medium leading-[1.04] tracking-[-0.005em] text-ink md:text-[64px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your wedding deserves more than an{" "}
            <em className="italic text-gold">album.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-ink-muted md:text-[18px]">
            Every wedding on The Marigold started right here — a couple who
            wanted to share their story. We&rsquo;ll help you tell yours,
            whether you&rsquo;re a writer or not.
          </p>

          {/* Two paths */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <PathCard
              href="/share/new?path=diy"
              badge={<Badge tone="rose">DIY STORYTELLER</Badge>}
              icon={<PenLine size={24} strokeWidth={1.6} />}
              title="I'll build it myself."
              description="Choose your angle, build your story block by block, and submit when you're ready. Our editors will polish and publish."
              time="~30 min"
              cta="Start building"
              variant="rose-saffron"
            />
            <PathCard
              href="/share/interview"
              badge={<Badge tone="gold">GUIDED BY AI</Badge>}
              icon={<Sparkles size={24} strokeWidth={1.6} />}
              title="Interview me."
              description="Answer a few questions in a casual conversation with our AI editor. We'll draft your story from your answers — you just review and approve."
              time="~15 min"
              cta="Start chatting"
              variant="gold-pink"
            />
          </div>

          {/* Social proof */}
          <div className="mt-12">
            <SubmittedCount />
          </div>

          {/* Reassurance line */}
          <div className="mt-14 grid grid-cols-1 gap-6 rounded-2xl border border-gold/15 bg-ivory-warm/50 p-6 md:grid-cols-3 md:p-8">
            <ReassureItem
              eyebrow="01"
              title="No writing pressure."
              body="Skip blocks that don't resonate. Use ours, write your own, or let our AI do the first pass."
            />
            <ReassureItem
              eyebrow="02"
              title="Editors polish."
              body="Every story is read by a human editor before it goes live. We tighten, never rewrite."
            />
            <ReassureItem
              eyebrow="03"
              title="Published in ~5 days."
              body="If we feature you, your wedding goes live with full credits, vendor tags, and a beautiful gallery."
            />
          </div>

          {/* What we're looking for */}
          <div className="mt-16 flex items-start gap-3 border-t border-gold/15 pt-10">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose/15 text-rose">
              <Heart size={16} strokeWidth={1.8} />
            </span>
            <div>
              <p
                className="text-[13px] font-semibold uppercase tracking-[0.2em] text-ink"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                What we&rsquo;re looking for
              </p>
              <p className="mt-2 max-w-2xl text-[15.5px] leading-[1.7] text-ink-muted">
                Real weddings, told honestly. The chaotic baraat, the aunty who
                cried during the vidaai, the décor moment your photographer
                hyperventilated about. Big or small. Local or destination. If
                it was yours, we want to hear it.
              </p>
              <Link
                href="/community?tab=real-weddings"
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold hover:text-rose"
              >
                See real weddings already on The Marigold
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PathCard({
  href,
  badge,
  title,
  description,
  time,
  cta,
  icon,
  variant,
}: {
  href: string;
  badge: React.ReactNode;
  title: string;
  description: string;
  time: string;
  cta: string;
  icon: React.ReactNode;
  variant: "rose-saffron" | "gold-pink";
}) {
  return (
    <Link href={href} className="block">
      <GradientCard variant={variant} className="p-7 md:p-9">
        <div className="flex items-start justify-between gap-3">
          {badge}
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-ink"
          >
            {icon}
          </span>
        </div>
        <h3
          className="mt-7 text-[30px] font-medium leading-tight text-ink md:text-[36px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.65] text-ink-soft">
          {description}
        </p>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-gold/25 pt-4">
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {time}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ink">
            {cta}
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </div>
      </GradientCard>
    </Link>
  );
}

function ReassureItem({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <p
        className="mt-2 text-[20px] font-medium leading-tight text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </p>
      <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-muted">{body}</p>
    </div>
  );
}
