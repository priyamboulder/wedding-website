"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export function SubPageHeader({
  eyebrow,
  title,
  subline,
  backHref = "/community?tab=connect&sub=rishta-circle",
  backLabel = "Back to the Rishta Circle",
}: {
  eyebrow: string;
  title: string;
  subline?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="border-b border-gold/15 bg-white px-10 pb-10 pt-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          {backLabel}
        </Link>
        <div className="mt-5 flex items-center gap-2">
          <Lock size={11} strokeWidth={2} className="text-gold" />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </p>
        </div>
        <h1 className="mt-2 font-serif text-[40px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
          {title}
        </h1>
        {subline && (
          <p className="mt-2 max-w-[640px] font-serif text-[16px] italic text-ink-muted">
            {subline}
          </p>
        )}
      </div>
    </header>
  );
}
