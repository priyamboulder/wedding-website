"use client";

// ── ShowcaseShoutouts ───────────────────────────────────────────────────────
// Creator shoutouts — the couple's brief thank-you notes to creators whose
// guides or collections influenced their wedding. Each card links to the
// creator's profile.

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Quote } from "lucide-react";
import type { ShowcaseCreatorShoutout } from "@/types/showcase";
import { getCreator } from "@/lib/creators/seed";

export function ShowcaseShoutouts({
  shoutouts,
}: {
  shoutouts: ShowcaseCreatorShoutout[];
}) {
  if (shoutouts.length === 0) return null;

  return (
    <section className="border-t border-gold/15 bg-ivory-warm/30 py-14">
      <div className="mx-auto max-w-[960px] px-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Creator Shoutouts
        </p>
        <h2 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
          The voices we leaned on.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {shoutouts.map((s) => (
            <ShoutoutCard key={s.id} shoutout={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShoutoutCard({ shoutout }: { shoutout: ShowcaseCreatorShoutout }) {
  const creator = getCreator(shoutout.creatorId);
  if (!creator) return null;

  return (
    <Link
      href={`/default/shopping/creators/${creator.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-gold/20 bg-white p-5 transition-colors hover:border-gold/40"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-10 w-10 rounded-full ring-1 ring-gold/20"
          style={{ background: creator.avatarGradient }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate font-serif text-[15px] text-ink">
              {creator.displayName}
            </p>
            {creator.isVerified && (
              <BadgeCheck size={12} strokeWidth={1.8} className="text-gold" />
            )}
          </div>
          <p
            className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {creator.handle}
          </p>
        </div>
        <ArrowUpRight
          size={14}
          strokeWidth={1.8}
          className="text-ink-muted transition-colors group-hover:text-saffron"
        />
      </div>
      <p className="font-serif text-[15px] italic leading-[1.65] text-ink-muted">
        <Quote
          size={12}
          strokeWidth={1.6}
          className="-mt-1 mr-1.5 inline text-gold"
        />
        {shoutout.shoutoutText}
      </p>
    </Link>
  );
}
