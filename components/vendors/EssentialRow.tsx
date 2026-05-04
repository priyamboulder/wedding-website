"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EssentialCategory, EssentialStatus } from "@/lib/vendors/data";
import { STATUS_LABEL } from "@/lib/vendors/data";

const STATUS_TONE: Record<EssentialStatus, { bg: string; fg: string }> = {
  open:        { bg: "bg-ivory-warm",   fg: "text-ink-muted" },
  contacted:   { bg: "bg-teal-pale",    fg: "text-teal" },
  quoted:      { bg: "bg-saffron-pale", fg: "text-saffron" },
  shortlisted: { bg: "bg-teal-pale",    fg: "text-teal" },
  booked:      { bg: "bg-sage-pale",    fg: "text-sage" },
};

export function EssentialRow({ category }: { category: EssentialCategory }) {
  const tone = STATUS_TONE[category.status];
  return (
    <Link
      href={`/vendors/${category.slug}`}
      className="group flex cursor-pointer items-center gap-4 rounded-lg border border-[color:var(--color-border)] bg-white px-4 py-[14px] transition-colors hover:border-ink/15"
    >
      <PaletteStack colors={category.paletteColors} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-ink">
            {category.name}
          </span>
          <span className="text-[12px] text-ink-faint">
            {category.count} available
          </span>
          <span
            className={`rounded-full px-2 py-[2px] text-[11px] font-normal ${tone.bg} ${tone.fg}`}
          >
            {STATUS_LABEL[category.status]}
          </span>
        </div>
        <div className="flex items-baseline gap-2 text-[12.5px]">
          <span className="truncate font-medium text-ink">
            {category.topPick.name}
          </span>
          <span className="text-ink-muted">·</span>
          <span className="truncate text-ink-muted">
            {category.topPick.why}
          </span>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-ink-muted transition-colors group-hover:text-ink">
        Browse
        <ArrowRight size={13} strokeWidth={1.6} />
      </span>
    </Link>
  );
}

function PaletteStack({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex shrink-0 items-center" aria-hidden>
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block h-9 w-9 rounded-full border-2 border-white"
          style={{
            backgroundColor: c,
            marginLeft: i === 0 ? 0 : -10,
          }}
        />
      ))}
    </span>
  );
}
