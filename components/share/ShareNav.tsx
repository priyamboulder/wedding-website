"use client";

// ── ShareNav ────────────────────────────────────────────────────────────────
// Public-facing top bar for the /share submission flow. Replaces the couple-
// app TopNav (which assumes a signed-in workspace context with placeholder
// "You & Partner" branding and product nav). The /share flow is fully open
// to anonymous couples — they shouldn't see workspace links.
//
// Right side: an optional `right` slot for back links, plus a quiet "Sign in"
// link that points anyone who already has an account at the auth modal.

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ShareNav({
  right,
  className,
}: {
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header
      role="banner"
      className={cn(
        "relative flex h-16 items-center justify-between border-b border-gold/15 bg-ivory/95 px-6 md:px-10",
        className,
      )}
    >
      <Link
        href="/blog"
        aria-label="The Marigold — home"
        className="font-medium tracking-tight text-ink transition-colors hover:text-gold"
        style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}
      >
        The <em className="italic text-gold">Marigold</em>
      </Link>
      <div className="flex items-center gap-3">
        {right}
        <Link
          href="/signup?redirect=/share"
          className="hidden text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink sm:inline-flex"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
