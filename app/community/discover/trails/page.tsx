"use client";

// ── /community/discover/trails ─────────────────────────────────────────────
// Discovery grid of One Look trails — (category, city) vendor rankings built
// from bride-submitted One Looks. Public, no auth required to browse.

import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { TrailDiscovery } from "@/components/one-look/TrailDiscovery";

export default function OneLookTrailsDiscoveryPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <header className="border-b border-gold/15 bg-white px-10 pt-8">
        <div className="mx-auto max-w-6xl">
          <NextLink
            href="/community?tab=connect&sub=brides"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to community
          </NextLink>
          <p
            className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            One Look Trails
          </p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
            see how brides rated vendors in your area.
          </h1>
          <p className="mt-2 max-w-[600px] font-serif text-[16px] italic text-ink-muted">
            a single score, a single word, a 20-second hot take — no paragraphs,
            no polish, just the gut reaction fresh from the honeymoon.
          </p>
          <p
            className="mt-5 pb-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            minimum 2 One Looks to appear on a trail · score = average of all
            One Looks for that vendor
          </p>
        </div>
      </header>
      <main className="px-10 py-10">
        <div className="mx-auto max-w-6xl">
          <TrailDiscovery />
        </div>
      </main>
    </div>
  );
}
