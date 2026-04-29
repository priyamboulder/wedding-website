"use client";

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

const TILE_STYLES = [
  { bg: '#FFF8F2', border: 'rgba(212,168,83,0.2)', tilt: 'rotate(-0.8deg)' },
  { bg: '#FBEAF0', border: 'rgba(212,83,126,0.15)', tilt: 'rotate(0.6deg)' },
  { bg: '#F0FAF5', border: 'rgba(100,180,140,0.2)', tilt: 'rotate(-0.4deg)' },
  { bg: '#F5EFFF', border: 'rgba(140,100,200,0.15)', tilt: 'rotate(0.9deg)' },
  { bg: '#FFF3E8', border: 'rgba(212,140,83,0.2)', tilt: 'rotate(-0.6deg)' },
  { bg: '#EEF6FF', border: 'rgba(83,140,212,0.2)', tilt: 'rotate(0.5deg)' },
];

export function BriefRecap() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);

  const tiles = [
    { label: "Program", body: programLine(events) },
    { label: "Traditions", body: traditionsLine(coupleContext.traditions) },
    { label: "Total guests", body: `${coupleContext.totalGuestCount}` },
    { label: "Palette", body: palettesLine(events) },
    { label: "Top priorities", body: prioritiesLine(coupleContext.priorityRanking) },
    { label: "Story", body: coupleContext.storyText.trim() || "—", italic: true },
  ];

  return (
    <section className="mt-12">
      <SectionHeader label="The brief · Foundation" href="/events" />
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" style={{ paddingTop: 8 }}>
        {tiles.map((tile, i) => (
          <Tile key={tile.label} label={tile.label} body={tile.body} italic={tile.italic} style={TILE_STYLES[i]} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="playcard-label">{label}</p>
      <Link
        href={href}
        className="transition-colors"
        style={{
          fontFamily: "var(--font-syne, 'Syne')",
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(75,21,40,0.4)',
          fontWeight: 600,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(75,21,40,0.4)')}
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
  style,
}: {
  label: string;
  body: string;
  italic?: boolean;
  style: { bg: string; border: string; tilt: string };
}) {
  return (
    <div
      className="relative px-4 py-4 transition-all duration-200"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        transform: style.tilt,
        boxShadow: '0 2px 8px rgba(75,21,40,0.05), 0 6px 20px rgba(75,21,40,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(75,21,40,0.09), 0 12px 32px rgba(75,21,40,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = style.tilt;
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(75,21,40,0.05), 0 6px 20px rgba(75,21,40,0.04)';
      }}
    >
      {/* tape strip */}
      <div style={{
        position: 'absolute',
        top: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 36,
        height: 12,
        background: 'rgba(255,220,180,0.75)',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(75,21,40,0.08)',
      }} />
      <p className="playcard-label" style={{ fontSize: 9, letterSpacing: '0.18em' }}>{label}</p>
      <p
        className={cn("mt-2 leading-snug", italic && "italic")}
        style={{
          fontFamily: italic
            ? "var(--font-instrument-serif, 'Instrument Serif'), serif"
            : "var(--font-syne, 'Syne'), sans-serif",
          fontSize: italic ? 15 : 14,
          color: 'var(--wine, #4B1528)',
          fontWeight: 400,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function programLine(events: EventRecord[]): string {
  if (events.length === 0) return "—";
  return events
    .map((e) => EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type)
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
      if (e.paletteId) return PALETTE_LIBRARY.find((p) => p.id === e.paletteId)?.name ?? null;
      if (e.customPalette) return "Custom";
      return null;
    })
    .filter((n): n is string => Boolean(n));
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return "—";
  if (unique.length === 1) return unique[0];
  return unique.slice(0, 3).join(" · ") + (unique.length > 3 ? "…" : "");
}
