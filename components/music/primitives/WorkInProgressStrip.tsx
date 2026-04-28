"use client";

// ── WorkInProgressStrip ───────────────────────────────────────────────────
// Horizontally-scrolling strip near the top of each Music tab answering
// "what's moving right now?" in 3 seconds. Shows 3–6 items in flight —
// drafts, pending vendor replies, open debates, anything awaiting
// reaction. Items fall off once resolved.
//
// The strip doesn't compute which items qualify — the tab's data layer
// passes them in as MusicWipItem[]. Keeping it dumb is deliberate: each
// tab has its own "what counts as in-flight" rule (song debates,
// unsigned contract, missing DJ playlist, etc.), and encoding that in
// a primitive would entangle the primitive with every tab's domain.

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MusicParty,
  MusicPartyId,
  MusicWipItem,
} from "@/types/music";
import { AttributionChip } from "./AttributionChip";
import { StatePill } from "./StatePill";

export interface WorkInProgressStripProps {
  items: MusicWipItem[];
  partyMap: Record<MusicPartyId, MusicParty>;
  emptyMessage?: string;
  // Optional section label rendered above the strip.
  title?: string;
  className?: string;
}

export function WorkInProgressStrip({
  items,
  partyMap,
  emptyMessage = "Nothing in flight — every item is either resolved or parked.",
  title = "In flight",
  className,
}: WorkInProgressStripProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <h2
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {title}
        </h2>
        <span
          className="font-mono text-[10px] tabular-nums text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-2 text-[11.5px] text-ink-muted">
          {emptyMessage}
        </div>
      ) : (
        <div className="workspace-event-chip-scroll flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <WipCard key={item.id} item={item} partyMap={partyMap} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────

function WipCard({
  item,
  partyMap,
}: {
  item: MusicWipItem;
  partyMap: Record<MusicPartyId, MusicParty>;
}) {
  const Tag = item.onJump ? "button" : "div";
  return (
    <Tag
      type={item.onJump ? "button" : undefined}
      onClick={item.onJump}
      className={cn(
        "group flex min-w-[240px] max-w-[320px] flex-none flex-col gap-1.5 rounded-md border bg-white px-3 py-2 text-left transition-colors",
        item.onJump
          ? "border-border hover:border-gold/40"
          : "cursor-default border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <StatePill
          state={item.state}
          waitingOn={item.waiting_on}
          partyMap={partyMap}
          size="sm"
        />
        {item.onJump && (
          <ChevronRight
            size={12}
            strokeWidth={1.8}
            className="text-ink-faint transition-transform group-hover:translate-x-0.5"
          />
        )}
      </div>
      <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-ink">
        {item.title}
      </p>
      {item.hint && (
        <p className="line-clamp-2 text-[11px] leading-snug text-ink-muted">
          {item.hint}
        </p>
      )}
      <div className="pt-0.5">
        <AttributionChip
          partyIds={item.attribution}
          partyMap={partyMap}
          size="sm"
        />
      </div>
    </Tag>
  );
}
