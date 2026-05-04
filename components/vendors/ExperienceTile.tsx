"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import type { Experience } from "@/lib/vendors/data";

export function ExperienceTile({ experience }: { experience: Experience }) {
  const { added, slug, name, icon, thumbnail, toneColor, moment } = experience;
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <Link
      href={`/vendors/experiences/${slug}`}
      className={`group relative flex flex-col rounded-md bg-white p-3 transition-colors ${
        added
          ? "border border-sage/60 hover:border-sage"
          : "border border-[color:var(--color-border)] hover:border-ink/15"
      }`}
    >
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{ aspectRatio: "16 / 9", backgroundColor: toneColor }}
      >
        {!imgFailed && (
          <img
            src={thumbnail}
            alt=""
            className="relative z-10 h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
        {imgFailed && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[20px] text-white/90"
            aria-hidden
          >
            {icon}
          </span>
        )}
        {added && (
          <span
            className="absolute right-1 top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-sage text-ivory"
            aria-label="Added"
          >
            <Check size={9} strokeWidth={2.5} />
          </span>
        )}
      </div>

      <span className="mt-2 text-[13px] font-medium text-ink">{name}</span>
      <span className="text-[11px] text-ink-faint">{moment}</span>
    </Link>
  );
}
