"use client";

// ── Trail vendor row ─────────────────────────────────────────────────────
// A single ranked row on a trail page. Collapsed: rank, vendor name, avg
// score, count, top words. Expanded: all individual One Look cards.

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import type { TrailVendorEntry } from "@/lib/one-look/trails";
import { scoreTone } from "@/types/one-look";
import { OneLookCard } from "./OneLookCard";

const SCORE_CHIP: Record<"warm" | "neutral" | "cool", string> = {
  warm: "bg-gold-pale/70 ring-gold/40 text-ink",
  neutral: "bg-ivory-warm ring-border text-ink",
  cool: "bg-stone-100 ring-stone-300 text-ink-muted",
};

export function TrailVendorRow({
  rank,
  entry,
}: {
  rank: number;
  entry: TrailVendorEntry;
}) {
  const [expanded, setExpanded] = useState(false);
  const tone = scoreTone(entry.averageScore);

  const vendorHref =
    entry.reviews[0].coordinationVendorId
      ? `/coordination/vendors/${entry.reviews[0].coordinationVendorId}`
      : entry.reviews[0].platformVendorId
        ? `/vendors/${entry.reviews[0].platformVendorId}`
        : null;

  return (
    <li>
      <div className="rounded-lg border border-border bg-white">
        <div className="flex items-center gap-4 p-4">
          <span
            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ivory-warm font-mono text-[12px] uppercase tracking-[0.14em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            #{rank}
          </span>
          <div className="min-w-0 flex-1">
            {vendorHref ? (
              <NextLink
                href={vendorHref}
                className="font-serif text-[16px] leading-snug text-ink hover:underline"
              >
                {entry.vendorName}
              </NextLink>
            ) : (
              <p className="font-serif text-[16px] leading-snug text-ink">
                {entry.vendorName}
              </p>
            )}
            <p
              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {entry.lookCount} {entry.lookCount === 1 ? "look" : "looks"}
            </p>
            {entry.words.length > 0 && (
              <p className="mt-1.5 font-serif text-[13px] italic text-ink-muted">
                {entry.words.map((w) => `"${w.word}"`).join(" · ")}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-baseline rounded-full px-3 py-1.5 ring-1 font-serif text-[22px] leading-none tabular-nums",
              SCORE_CHIP[tone],
            )}
          >
            {entry.averageScore.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse reviews" : "Expand reviews"}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            {expanded ? (
              <ChevronUp size={13} strokeWidth={1.8} />
            ) : (
              <ChevronDown size={13} strokeWidth={1.8} />
            )}
          </button>
        </div>

        {expanded && (
          <div className="space-y-3 border-t border-border bg-ivory-warm/30 p-4">
            {entry.reviews.map((r) => (
              <OneLookCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
