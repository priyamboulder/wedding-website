"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import { Countdown } from "./primitives";

export function ExhibitionBanner({
  weddingId,
  className = "mx-6 mt-4",
}: {
  weddingId: string;
  className?: string;
}) {
  const live = useExhibitionsStore((s) =>
    s.listExhibitions().find((e) => e.status === "live"),
  );
  if (!live) return null;

  return (
    <Link
      href={`/${weddingId}/shopping/exhibitions/${live.slug}`}
      className={`group relative ${className} flex flex-col gap-3 overflow-hidden rounded-xl border border-gold/30 bg-white px-5 py-4 transition-all hover:border-gold/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6`}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-1/2 opacity-70"
        style={{
          background:
            live.cover_gradient ??
            "linear-gradient(90deg, transparent 0%, #F0E4C8 40%, #D4A843 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-3/5"
        style={{
          background:
            "linear-gradient(90deg, #FFFFFF 65%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold-pale/50">
          <Sparkles size={16} strokeWidth={1.6} className="text-gold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-rose/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-rose" />
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Live Now — Virtual Exhibition
            </span>
          </div>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            {live.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
            <span>{live.exhibitor_count} exhibitors</span>
            <span aria-hidden className="text-ink-faint">·</span>
            <Countdown target={live.ends_at} label="ends in" />
          </div>
        </div>
      </div>

      <div className="relative inline-flex items-center gap-1.5 self-start rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-transform group-hover:translate-x-0.5 sm:self-auto"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Browse Now <ArrowRight size={11} strokeWidth={2} />
      </div>
    </Link>
  );
}
