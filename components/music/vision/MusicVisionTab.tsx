"use client";

// ── Music & Entertainment Vision tab ──────────────────────────────────────
// Wraps the shared CategoryVisionTab and adds three Music-specific cards
// above the moodboard/palette/notes grid:
//   • Energy Map — visual representation of the energy arc across events
//   • Sound Brief — narrative summary derived from quiz answers
//   • Genre Mix — chip list of the couple's music-taste preferences
//   • Non-negotiables — pre-pinned moments

import {
  Activity,
  ListMusic,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryVisionTab } from "@/components/workspace/shared/CategoryVisionTab";
import {
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import {
  ENERGY_EVENTS,
  GENRE_LABEL,
  LIVE_DJ_LABEL,
  NON_NEG_LABEL,
  SANGEET_STYLE_LABEL,
  useMusicSoundscapeStore,
} from "@/stores/music-soundscape-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type { EnergyEventId } from "@/types/music";

export function MusicVisionTab({ category }: { category: WorkspaceCategory }) {
  return (
    <CategoryVisionTab
      category={category}
      leading={<MusicVisionLeading />}
    />
  );
}

function MusicVisionLeading() {
  const energyArc = useMusicSoundscapeStore((s) => s.energy_arc);
  const sangeetStyle = useMusicSoundscapeStore((s) => s.sangeet_style);
  const liveDj = useMusicSoundscapeStore((s) => s.live_dj_mix);
  const genreMix = useMusicSoundscapeStore((s) => s.genre_mix);
  const nonNeg = useMusicSoundscapeStore((s) => s.non_negotiables);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard
        icon={<Activity size={13} strokeWidth={1.7} />}
        title="Energy Map"
      >
        <p className="text-[12px] text-ink-muted">
          The emotional temperature design across your wedding week.
        </p>
        <EnergyChart points={energyArc} />
      </PanelCard>

      <PanelCard
        icon={<Sparkles size={13} strokeWidth={1.7} />}
        title="Your sound brief"
      >
        <ul className="space-y-2 text-[12.5px]">
          <BriefRow label="Sangeet style" value={SANGEET_STYLE_LABEL[sangeetStyle]} />
          <BriefRow label="Live vs DJ" value={LIVE_DJ_LABEL[liveDj]} />
        </ul>

        <div className="mt-4">
          <Eyebrow>Genre mix</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {genreMix.length === 0 ? (
              <p className="text-[11.5px] italic text-ink-faint">
                Take the vision quiz to set genre preferences.
              </p>
            ) : (
              genreMix.map((g) => <Tag key={g} tone="saffron">{GENRE_LABEL[g]}</Tag>)
            )}
          </div>
        </div>

        <div className="mt-4">
          <Eyebrow>
            <span className="inline-flex items-center gap-1">
              <ListMusic size={10} strokeWidth={1.7} /> Non-negotiables
            </span>
          </Eyebrow>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {nonNeg.length === 0 ? (
              <p className="text-[11.5px] italic text-ink-faint">
                None yet. Add them in the vision quiz.
              </p>
            ) : (
              nonNeg.map((m) => <Tag key={m} tone="rose">{NON_NEG_LABEL[m]}</Tag>)
            )}
          </div>
        </div>
      </PanelCard>
    </div>
  );
}

// ── Energy chart (inline SVG, no deps) ───────────────────────────────────

function EnergyChart({ points }: { points: { event: EnergyEventId; energy: number }[] }) {
  const ordered = ENERGY_EVENTS.map(
    (e) => points.find((p) => p.event === e.id) ?? { event: e.id, energy: 50 },
  );

  // SVG viewport — 300x100, padding 10. Bars + line.
  const W = 320;
  const H = 110;
  const PAD = 14;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2 - 18; // reserve 18 for x labels
  const barWidth = innerW / ordered.length / 1.6;
  const stride = innerW / ordered.length;

  const linePoints = ordered.map((p, i) => {
    const x = PAD + stride * (i + 0.5);
    const y = PAD + innerH - (p.energy / 100) * innerH;
    return [x, y] as const;
  });

  const setEnergy = useMusicSoundscapeStore((s) => s.setEnergyForEvent);

  return (
    <div className="mt-3 space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Energy arc across wedding events"
        className="w-full"
      >
        {/* Baseline */}
        <line
          x1={PAD}
          y1={PAD + innerH}
          x2={W - PAD}
          y2={PAD + innerH}
          stroke="currentColor"
          className="text-border"
        />
        {/* Bars */}
        {ordered.map((p, i) => {
          const x = PAD + stride * (i + 0.5) - barWidth / 2;
          const h = (p.energy / 100) * innerH;
          const y = PAD + innerH - h;
          const tone =
            p.energy < 35 ? "text-sage" : p.energy < 65 ? "text-saffron" : "text-rose";
          return (
            <rect
              key={p.event}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={2}
              ry={2}
              className={cn("fill-current opacity-30", tone)}
            />
          );
        })}
        {/* Line */}
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="text-ink"
          points={linePoints.map(([x, y]) => `${x},${y}`).join(" ")}
        />
        {/* Dots */}
        {linePoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            className="fill-saffron stroke-saffron"
          />
        ))}
        {/* X labels */}
        {ordered.map((p, i) => {
          const x = PAD + stride * (i + 0.5);
          return (
            <text
              key={p.event}
              x={x}
              y={H - 4}
              textAnchor="middle"
              className="fill-current text-[8px] uppercase tracking-[0.06em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {ENERGY_EVENTS.find((e) => e.id === p.event)?.label.slice(0, 4)}
            </text>
          );
        })}
      </svg>

      {/* Inline sliders for fine-tuning */}
      <div className="space-y-1">
        {ordered.map((p) => (
          <div key={p.event} className="flex items-center gap-2 text-[11px]">
            <span
              className="w-16 font-mono uppercase tracking-[0.08em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {ENERGY_EVENTS.find((e) => e.id === p.event)?.label}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={p.energy}
              onChange={(e) => setEnergy(p.event, Number(e.target.value))}
              className="h-1 flex-1 accent-saffron"
              aria-label={`Energy for ${p.event}`}
            />
            <span
              className="w-8 text-right font-mono tabular-nums text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {p.energy}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
      <Eyebrow>{label}</Eyebrow>
      <span className="text-[12px] text-ink">{value}</span>
    </li>
  );
}
