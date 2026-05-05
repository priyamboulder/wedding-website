"use client";

// ── ShareShell ──────────────────────────────────────────────────────────────
// Shared layout for the /share/* submission flow. Renders the TopNav, an
// editorial header with eyebrow + title + scattered decorative dots, and an
// optional stepper.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareNav } from "@/components/share/ShareNav";
import { ShareStepper, type ShareStep } from "@/components/share/ShareStepper";
import { ShareDots } from "@/components/share/ShareDots";
import { ShareSessionBootstrap } from "@/components/share/ShareSessionBootstrap";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  step?: ShareStep | null;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  // When true, skip the inner max-w container so child can lay out edge-to-edge.
  bleed?: boolean;
};

export function ShareShell({
  eyebrow,
  title,
  subtitle,
  step = null,
  backHref = "/blog",
  backLabel = "Back to The Marigold",
  children,
  bleed = false,
}: Props) {
  return (
    <div className="relative min-h-screen bg-ivory">
      <ShareDots />
      <ShareSessionBootstrap />
      <ShareNav
        right={
          <Link
            href={backHref}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            {backLabel}
          </Link>
        }
      />

      <header className="relative z-10 border-b border-gold/15 bg-ivory/80 px-6 pb-8 pt-10 md:px-10 md:pt-14">
        <div className="mx-auto max-w-5xl">
          {eyebrow && (
            <p
              className="font-display text-[15px] italic text-gold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className="mt-2 text-[40px] font-medium leading-[1.05] tracking-[-0.005em] text-ink md:text-[52px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-muted md:text-[16px]">
              {subtitle}
            </p>
          )}
          {step && (
            <div className="mt-7">
              <ShareStepper current={step} />
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 px-6 py-10 md:px-10 md:py-14">
        {bleed ? (
          children
        ) : (
          <div className="mx-auto max-w-5xl">{children}</div>
        )}
      </main>
    </div>
  );
}
