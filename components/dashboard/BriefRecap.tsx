"use client";

// ── Brief recap ───────────────────────────────────────────────────────────
// Read-only mirror of the six summary tiles that live on the brief summary
// page. Editing happens there — the dashboard surfaces these as orientation,
// not as an editing surface. Keep in sync with the SummaryTile usage in
// components/events/dashboard/EventsDashboard.tsx; regeneration logic lives
// on the brief, never here.

import Link from "next/link";
import { useEventsStore } from "@/stores/events-store";
import {
  EVENT_TYPE_OPTIONS,
  PALETTE_LIBRARY,
  PRIORITY_OPTIONS,
  TRADITION_OPTIONS,
} from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";
import { cn } from "@/lib/utils";

export function BriefRecap() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);

  return (
    <section className="mt-12">
      <SectionHeader label="The brief · Foundation" href="/events" />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Tile label="Program" body={programLine(events)} />
        <Tile label="Traditions" body={traditionsLine(coupleContext.traditions)} />
        <Tile label="Total guests" body={`${coupleContext.totalGuestCount}`} />
        <Tile label="Palette" body={palettesLine(events)} />
        <Tile label="Top priorities" body={prioritiesLine(coupleContext.priorityRanking)} />
        <Tile label="Story" body={coupleContext.storyText.trim() || "—"} italic />
      </div>
    </section>
  );
}

function SectionHeader({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </h2>
      <Link
        href={href}
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Edit →
      </Link>
    </div>
  );
}

function Tile({
  label,
  body,
  italic,
}: {
  label: string;
  body: string;
  italic?: boolean;
}) {
  return (
    <div className="border border-border bg-white px-4 py-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[13px] leading-snug text-ink",
          italic && "font-serif italic text-[14px]",
        )}
      >
        {body}
      </p>
    </div>
  );
}

function programLine(events: EventRecord[]): string {
  if (events.length === 0) return "—";
  return events
    .map(
      (e) =>
        EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type,
    )
    .join(" · ");
}

function traditionsLine(traditions: string[]): string {
  if (traditions.length === 0) return "—";
  return traditions
    .map((t) => TRADITION_OPTIONS.find((o) => o.id === t)?.name ?? t)
    .join(", ");
}

function prioritiesLine(ranking: string[]): string {
  if (ranking.length === 0) return "—";
  return ranking
    .slice(0, 3)
    .map((p) => PRIORITY_OPTIONS.find((o) => o.id === p)?.name ?? p)
    .join(" · ");
}

function palettesLine(events: EventRecord[]): string {
  const names = events
    .map((e) => {
      if (e.paletteCustomName?.trim()) return e.paletteCustomName.trim();
      if (e.paletteId)
        return PALETTE_LIBRARY.find((p) => p.id === e.paletteId)?.name ?? null;
      if (e.customPalette) return "Custom";
      return null;
    })
    .filter((n): n is string => Boolean(n));
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return "—";
  if (unique.length === 1) return unique[0];
  return unique.slice(0, 3).join(" · ") + (unique.length > 3 ? "…" : "");
}
