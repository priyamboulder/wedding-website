"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exhibitor } from "@/types/exhibition";
import { FeatureBadges, GradientCover } from "./primitives";

export function ExhibitorCard({
  exhibitor,
  href,
  itemCount,
  variant = "standard",
}: {
  exhibitor: Exhibitor;
  href: string;
  itemCount?: number;
  variant?: "standard" | "featured";
}) {
  const isFeatured = variant === "featured";
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-white transition-all",
        "hover:border-gold/35 hover:shadow-md",
        isFeatured ? "w-[260px] shrink-0" : "w-full",
      )}
    >
      <GradientCover
        gradient={exhibitor.booth_gradient}
        label={exhibitor.external_name}
        sublabel={exhibitor.booth_category.replace("_", " ")}
        ratio={isFeatured ? "4/5" : "4/5"}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-serif text-[17px] leading-tight text-ink">
            {exhibitor.booth_name}
          </h3>
          {exhibitor.booth_tagline && (
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted line-clamp-2">
              {exhibitor.booth_tagline}
            </p>
          )}
        </div>
        <FeatureBadges exhibitor={exhibitor} />
        <div className="mt-auto flex items-center justify-between pt-2">
          {itemCount != null && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold transition-transform group-hover:translate-x-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Visit Booth <ArrowRight size={10} strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
