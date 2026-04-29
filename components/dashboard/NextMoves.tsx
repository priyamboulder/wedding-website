"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { computeNextMoves } from "@/lib/dashboard/next-moves";

const MOVE_COLORS = [
  { bg: '#FFF8F2', border: 'rgba(212,168,83,0.25)', num: 'var(--gold, #D4A853)' },
  { bg: '#FBEAF0', border: 'rgba(212,83,126,0.18)', num: 'var(--pink, #D4537E)' },
  { bg: '#F0FAF5', border: 'rgba(100,180,140,0.22)', num: '#6BB898' },
  { bg: '#F5EFFF', border: 'rgba(140,100,200,0.18)', num: '#9B6FD4' },
  { bg: '#FFF3E8', border: 'rgba(212,140,83,0.22)', num: '#D48353' },
];

export function NextMoves() {
  const completedAt = useEventsStore((s) => s.quiz.completedAt);
  const events = useEventsStore((s) => s.events);
  const categories = useWorkspaceStore((s) => s.categories);

  const moves = computeNextMoves({
    briefDone: Boolean(completedAt),
    categories,
    eventsCount: events.length,
    eventsMissingMood: events.filter((e) => !e.moodTile).length,
  });

  if (moves.length === 0) return null;

  return (
    <section className="mt-14">
      <p className="playcard-label">Next moves</p>
      <div className="mt-6 flex flex-col gap-4" style={{ paddingTop: 8 }}>
        {moves.map((move, i) => {
          const color = MOVE_COLORS[i % MOVE_COLORS.length];
          return (
            <Link
              key={move.id}
              href={move.href}
              className="group relative flex items-center gap-5 px-5 py-4 transition-all duration-200"
              style={{
                background: color.bg,
                border: `1px solid ${color.border}`,
                transform: i % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.3deg)',
                boxShadow: '0 2px 8px rgba(75,21,40,0.05)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(75,21,40,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = i % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.3deg)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(75,21,40,0.05)';
              }}
            >
              {/* tape */}
              <div style={{
                position: 'absolute',
                top: -6,
                left: 28,
                width: 32,
                height: 12,
                background: 'rgba(255,220,180,0.75)',
                borderRadius: 2,
              }} />
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif, 'Instrument Serif'), serif",
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1,
                  color: color.num,
                  flexShrink: 0,
                  width: 32,
                  textAlign: 'center',
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p style={{
                  fontFamily: "var(--font-instrument-serif, 'Instrument Serif'), serif",
                  fontSize: 18,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: 'var(--wine, #4B1528)',
                }}>
                  {move.title}
                </p>
                <p className="mt-1" style={{
                  fontFamily: "var(--font-syne, 'Syne'), sans-serif",
                  fontSize: 12,
                  color: 'var(--mauve, #8A6070)',
                  lineHeight: 1.5,
                }}>
                  {move.blurb}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                strokeWidth={1.6}
                style={{ flexShrink: 0, color: 'rgba(75,21,40,0.25)', transition: 'color 0.15s' }}
                className="group-hover:!text-pink-400"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
