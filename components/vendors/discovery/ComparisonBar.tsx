"use client";

import { Scale, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor-unified";
import { MAX_COMPARE_COUNT } from "@/stores/discovery-store";

export function ComparisonBar({
  selectedVendors,
  onRemove,
  onClearAll,
  onOpen,
}: {
  selectedVendors: Vendor[];
  onRemove: (vendorId: string) => void;
  onClearAll: () => void;
  onOpen: () => void;
}) {
  if (selectedVendors.length === 0) return null;
  const canCompare = selectedVendors.length >= 2;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-40 flex w-[min(92vw,820px)] -translate-x-1/2 items-center gap-3 rounded-full border border-gold/30 bg-white/95 p-2.5 pl-4 pr-3 shadow-[0_14px_40px_-12px_rgba(26,26,26,0.25)] backdrop-blur-md",
      )}
    >
      <div className="flex items-center gap-2">
        <Scale size={14} strokeWidth={1.8} className="text-gold" />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Compare
        </span>
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {selectedVendors.length}/{MAX_COMPARE_COUNT}
        </span>
      </div>

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {selectedVendors.map((v) => (
          <Pill key={v.id} vendor={v} onRemove={() => onRemove(v.id)} />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-full px-3 py-1 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={!canCompare}
          onClick={onOpen}
          className={cn(
            "rounded-full px-4 py-1.5 text-[12px] transition-all",
            canCompare
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "cursor-not-allowed bg-ivory-warm text-ink-faint",
          )}
        >
          Compare →
        </button>
      </div>
    </div>
  );
}

function Pill({
  vendor,
  onRemove,
}: {
  vendor: Vendor;
  onRemove: () => void;
}) {
  const img = vendor.cover_image || (vendor.portfolio_images ?? [])[0]?.url;
  return (
    <span className="group flex shrink-0 items-center gap-1.5 rounded-full bg-ivory-warm py-1 pl-1 pr-2 text-[11.5px] text-ink ring-1 ring-border">
      <span className="h-5 w-5 overflow-hidden rounded-full bg-ivory-deep">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={vendor.name} className="h-full w-full object-cover" />
        )}
      </span>
      <span className="max-w-[140px] truncate">{vendor.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${vendor.name}`}
        className="ml-0.5 rounded-full text-ink-faint transition-colors hover:text-rose"
      >
        <X size={10} strokeWidth={2} />
      </button>
    </span>
  );
}
