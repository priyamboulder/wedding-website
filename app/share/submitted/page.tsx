"use client";

// ── /share/submitted ────────────────────────────────────────────────────────
// Confirmation screen after a couple submits. Pulls the most recent submission
// from the store so we can show their names back to them.

import Link from "next/link";
import { ArrowRight, Heart, UserPlus } from "lucide-react";
import { ShareNav } from "@/components/share/ShareNav";
import { ShareDots } from "@/components/share/ShareDots";
import { Badge } from "@/components/share/Badge";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import { useAuthStore } from "@/stores/auth-store";

export default function SubmittedPage() {
  const last = useShareShaadiStore((s) => s.submitted[0]);
  const isSignedIn = useAuthStore((s) => Boolean(s.user));

  return (
    <div className="relative min-h-screen overflow-hidden bg-ivory">
      <ShareDots />
      <ShareNav />
      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:px-10 md:py-32">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale text-gold">
          <Heart size={28} strokeWidth={1.6} />
        </span>
        <Badge tone="gold" className="mt-6">
          IN REVIEW
        </Badge>
        <h1
          className="mt-5 text-[40px] font-medium leading-[1.05] tracking-[-0.005em] text-ink md:text-[60px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your story is with our <em className="italic text-gold">editors.</em>
        </h1>
        {last && (
          <p
            className="mt-4 text-[17px] italic text-ink-soft md:text-[19px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {last.brideName} &amp; {last.groomName} —{" "}
            {[last.venue, last.city].filter(Boolean).join(", ")}.
          </p>
        )}
        <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-ink-muted">
          We&rsquo;ll be in touch within 5 days. If your wedding is selected for
          a Real Wedding feature, an editor will email you with the proposed
          edits and a publication date. Otherwise, your story stays in our
          archive — and may inspire a future piece.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-ink/90"
          >
            See real weddings
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        {/* Soft account nudge — shown only to anonymous submitters. Not a
            gate; the submission has already been recorded. */}
        {!isSignedIn && (
          <aside
            className="mt-14 flex w-full max-w-xl flex-col items-start gap-3 rounded-2xl border border-gold/25 bg-ivory-warm/60 p-5 text-left md:flex-row md:items-center md:gap-5 md:p-6"
            aria-label="Optional account creation"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-pale text-gold"
            >
              <UserPlus size={18} strokeWidth={1.7} />
            </span>
            <div className="flex-1">
              <p
                className="text-[16px] italic leading-snug text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Want to track your submission and get notified when it&rsquo;s
                published?
              </p>
              <p className="mt-1 text-[13px] leading-[1.55] text-ink-muted">
                Optional — your story is already with our editors either way.
              </p>
            </div>
            <Link
              href={`/signup?redirect=/share/submitted${
                last?.contactEmail
                  ? `&email=${encodeURIComponent(last.contactEmail)}`
                  : ""
              }`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-ink/90"
            >
              Create a free account
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </aside>
        )}
      </main>
    </div>
  );
}
