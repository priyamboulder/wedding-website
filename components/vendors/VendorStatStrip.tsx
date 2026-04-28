"use client";

import { Sparkles } from "lucide-react";
import type { Vendor } from "@/types/vendor";
import type { VendorFilterContext } from "@/lib/vendors/filters";

interface Props {
  vendors: Vendor[];
  ctx: VendorFilterContext;
}

export function VendorStatStrip({ vendors, ctx }: Props) {
  const total = vendors.length;
  const shortlisted = ctx.shortlistIds.size;
  const linked = ctx.linkedVendorIds.size;
  // Count of Ananya Select (premium) vendors in the full directory — normalizes
  // the tier concept in the header without pushing an upsell CTA on couples.
  const selectCount = vendors.filter((v) => v.tier === "select").length;

  let contacted = 0;
  let booked = 0;
  for (const status of ctx.statusByVendorId.values()) {
    if (
      status === "contacted" ||
      status === "quoted" ||
      status === "contracted" ||
      status === "booked"
    ) {
      contacted += 1;
    }
    if (status === "booked") booked += 1;
  }

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gold/15 bg-white px-8 py-4 md:grid-cols-6"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <SummaryCell label="Total Vendors" value={String(total)} />
      <SummaryCell
        label="Ananya Select"
        value={String(selectCount)}
        goldAccent
      />
      <SummaryCell label="Shortlisted" value={String(shortlisted)} accent />
      <SummaryCell label="Linked" value={String(linked)} />
      <SummaryCell label="Contacted" value={String(contacted)} />
      <SummaryCell label="Booked" value={String(booked)} accent />
    </div>
  );
}

function SummaryCell({
  label,
  value,
  suffix,
  accent,
  goldAccent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
  goldAccent?: boolean;
}) {
  const isEmpty = value === "—";
  const valueClass = isEmpty
    ? "text-[17px] text-ink-faint"
    : goldAccent
      ? "text-[17px] font-semibold text-gold"
      : accent
        ? "text-[17px] font-semibold text-saffron"
        : "text-[17px] font-medium text-ink";
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {goldAccent && (
          <Sparkles size={9} strokeWidth={2} className="text-gold" />
        )}
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className={valueClass}>{value}</span>
        {suffix && (
          <span className="text-[10px] lowercase tracking-wider text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
