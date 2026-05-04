'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* ============================================================ *
 *  Types
 * ============================================================ */

type Depth = 'near' | 'mid' | 'far';
type Category = 'planning' | 'vendor' | 'family' | 'ai' | 'voice';
type Kind = 'product' | 'note';

type LibraryItem = {
  id: string;
  kind: Kind;
  category: Category;
  width: number;
  render: () => ReactNode;
};

type Slot = { id: string; top: string; side: 'left' | 'right'; edge: string };

type ActiveItem = {
  uid: string;
  itemId: string;
  slotId: string;
  category: Category;
  kind: Kind;
  width: number;
  depth: Depth;
  side: 'left' | 'right';
  topPct: string;
  edgePct: string;
  offsetX: number;
  offsetY: number;
  rotate: number;
  driftAmplitude: number;
  driftDuration: number;
  driftDelay: number;
  holdDuration: number;
  enterDuration: number;
  exitDuration: number;
};

/* ============================================================ *
 *  Visual constants
 * ============================================================ */

const FADE_DURATION_MS = 1200;

const depthStyles: Record<Depth, { opacity: number; blur: number }> = {
  near: { opacity: 0.55, blur: 0 },
  mid: { opacity: 0.45, blur: 0.6 },
  far: { opacity: 0.38, blur: 1.4 },
};

const cardBase: CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(255, 245, 235, 0.92), rgba(251, 234, 240, 0.88))',
  borderRadius: 10,
  border: '1px solid rgba(75, 21, 40, 0.08)',
  boxShadow:
    '0 6px 22px rgba(75, 21, 40, 0.10), 0 1px 3px rgba(75, 21, 40, 0.06)',
  color: 'var(--wine)',
  padding: 14,
  fontFamily: 'var(--font-space-grotesk), sans-serif',
};

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-syne), sans-serif',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '1.6px',
  color: 'var(--mauve)',
  fontWeight: 700,
};

const easeSoft = [0.4, 0, 0.2, 1] as const;

/* ============================================================ *
 *  Helpers
 * ============================================================ */

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
let uidCounter = 0;
function uid() {
  uidCounter += 1;
  return `peek-${uidCounter.toString(36)}`;
}
function pickDepth(): Depth {
  const r = Math.random();
  if (r < 0.25) return 'near';
  if (r < 0.75) return 'mid';
  return 'far';
}

/* ============================================================ *
 *  Peek content components
 * ============================================================ */

type MoodboardSwatch = { color: string };
type VendorMoodboardPeekProps = {
  vendorName?: string;
  tag?: string;
  swatches?: MoodboardSwatch[];
};

export function VendorMoodboardPeek({
  vendorName = 'Velvet & Marigold',
  tag = 'Décor • Dallas',
  swatches = [
    { color: 'var(--peach)' },
    { color: 'var(--gold-light)' },
    { color: 'var(--lavender)' },
    { color: 'var(--blush)' },
  ],
}: VendorMoodboardPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {swatches.slice(0, 4).map((s, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1 / 1',
              background: s.color,
              borderRadius: 6,
              boxShadow: 'inset 0 0 0 1px rgba(75, 21, 40, 0.06)',
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 17,
          lineHeight: 1.15,
          marginBottom: 3,
          letterSpacing: '0.2px',
        }}
      >
        {vendorName}
      </div>
      <div style={labelStyle}>{tag}</div>
    </div>
  );
}

type EventTimelinePeekProps = { events?: string[]; activeIndex?: number };

export function EventTimelinePeek({
  events = ['Pithi', 'Mehndi', 'Sangeet', 'Haldi', 'Ceremony', 'Reception'],
  activeIndex = 2,
}: EventTimelinePeekProps) {
  return (
    <div style={cardBase}>
      <div style={{ ...labelStyle, marginBottom: 10 }}>Wedding Events</div>
      <div style={{ position: 'relative', paddingLeft: 18 }}>
        <div
          style={{
            position: 'absolute',
            left: 5,
            top: 6,
            bottom: 6,
            width: 1,
            background: 'rgba(75, 21, 40, 0.18)',
          }}
        />
        {events.map((label, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: 14,
                lineHeight: 1.45,
                color: isActive ? 'var(--wine)' : 'rgba(75, 21, 40, 0.65)',
                paddingBottom: 2,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: -18,
                  top: 6,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: isActive ? 'var(--pink)' : 'var(--blush)',
                  border: '1.5px solid var(--pink)',
                }}
              />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ShagunRow = { name: string; expected: string; received?: boolean };
type ShagunTrackerPeekProps = { rows?: ShagunRow[] };

export function ShagunTrackerPeek({
  rows = [
    { name: 'Mehta uncle', expected: '₹21,000', received: true },
    { name: 'Patel masi', expected: '₹11,000', received: true },
    { name: 'Bharadwaj', expected: '₹15,000', received: false },
    { name: 'Rao family', expected: '₹10,000', received: true },
  ],
}: ShagunTrackerPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <div style={labelStyle}>Shagun Pool</div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            fontSize: 11,
            color: 'var(--pink)',
          }}
        >
          ₹57k / ₹57k
        </div>
      </div>
      <div style={{ display: 'grid', rowGap: 6 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              alignItems: 'center',
              columnGap: 8,
              fontSize: 11.5,
              paddingBottom: 5,
              borderBottom:
                i === rows.length - 1
                  ? 'none'
                  : '1px dashed rgba(75, 21, 40, 0.12)',
            }}
          >
            <span style={{ color: 'var(--wine)' }}>{r.name}</span>
            <span
              style={{
                color: 'var(--mauve)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.expected}
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: r.received ? 'var(--pink)' : 'transparent',
                border: r.received ? 'none' : '1px solid rgba(75, 21, 40, 0.25)',
                color: 'var(--cream)',
                fontSize: 9,
                lineHeight: '12px',
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {r.received ? '✓' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type AIBriefPeekProps = { title?: string; body?: string; meta?: string };

export function AIBriefPeek({
  title = 'Your décor brief',
  body = 'Warm marigold + ivory, brass accents, candlelit mandap with hanging phool clouds and soft jasmine garlands trailing the aisle.',
  meta = 'Generated · just now',
}: AIBriefPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, var(--gold-light), var(--gold) 80%)',
            color: 'var(--wine)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✦
        </span>
        <span
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--wine)',
          }}
        >
          {title}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.55,
          color: 'rgba(75, 21, 40, 0.78)',
          margin: 0,
        }}
      >
        {body}
      </p>
      <div style={{ ...labelStyle, marginTop: 10, fontSize: 8.5 }}>{meta}</div>
    </div>
  );
}

type TaskItem = { label: string; done?: boolean };
type TaskListPeekProps = { phaseLabel?: string; items?: TaskItem[] };

export function TaskListPeek({
  phaseLabel = 'Phase 4 of 13 · Vendor Booking',
  items = [
    { label: 'Confirm florist deposit', done: true },
    { label: 'Sign sangeet DJ', done: true },
    { label: 'Tasting at caterer', done: false },
    { label: 'Final mehndi artist', done: false },
  ],
}: TaskListPeekProps) {
  return (
    <div style={cardBase}>
      <div style={{ ...labelStyle, marginBottom: 10 }}>{phaseLabel}</div>
      <div style={{ display: 'grid', rowGap: 7 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 12.5,
              color: it.done ? 'rgba(75, 21, 40, 0.5)' : 'var(--wine)',
              textDecoration: it.done ? 'line-through' : 'none',
              textDecorationColor: 'rgba(75, 21, 40, 0.35)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flex: '0 0 14px',
                width: 14,
                height: 14,
                borderRadius: 4,
                background: it.done ? 'var(--pink)' : 'transparent',
                border: it.done ? 'none' : '1.5px solid rgba(75, 21, 40, 0.3)',
                color: 'var(--cream)',
                fontSize: 10,
                lineHeight: '14px',
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {it.done ? '✓' : ''}
            </span>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type GuestRow = { name: string; rsvp: 'yes' | 'no' | 'pending'; diet?: string };
type GuestListPeekProps = { rows?: GuestRow[]; counterLabel?: string };

export function GuestListPeek({
  rows = [
    { name: 'Priya Mehta', rsvp: 'yes', diet: 'veg' },
    { name: 'Aanya Kapoor', rsvp: 'yes' },
    { name: 'Ravi Sharma', rsvp: 'pending', diet: 'jain' },
    { name: 'Karan Iyer', rsvp: 'yes', diet: 'gf' },
  ],
  counterLabel = 'Guest list · 248 of 320',
}: GuestListPeekProps) {
  return (
    <div style={cardBase}>
      <div style={{ ...labelStyle, marginBottom: 10 }}>{counterLabel}</div>
      <div style={{ display: 'grid', rowGap: 6 }}>
        {rows.map((g, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              columnGap: 8,
              alignItems: 'center',
              fontSize: 11.5,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  g.rsvp === 'yes'
                    ? 'var(--pink)'
                    : g.rsvp === 'no'
                      ? 'rgba(75, 21, 40, 0.2)'
                      : 'transparent',
                border:
                  g.rsvp === 'pending'
                    ? '1px solid rgba(75, 21, 40, 0.3)'
                    : 'none',
              }}
            />
            <span style={{ color: 'var(--wine)' }}>{g.name}</span>
            <span
              style={{
                fontSize: 9,
                color: 'var(--mauve)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontWeight: 700,
              }}
            >
              {g.diet ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type BudgetSegment = { label: string; pct: number; color: string };
type BudgetPiePeekProps = { segments?: BudgetSegment[]; totalLabel?: string };

export function BudgetPiePeek({
  segments = [
    { label: 'Venue', pct: 35, color: 'var(--pink)' },
    { label: 'Catering', pct: 25, color: 'var(--gold)' },
    { label: 'Décor', pct: 15, color: 'var(--lavender)' },
    { label: 'Other', pct: 25, color: 'var(--mauve)' },
  ],
  totalLabel = 'Budget · ₹38L of ₹52L',
}: BudgetPiePeekProps) {
  let acc = 0;
  return (
    <div style={cardBase}>
      <div style={labelStyle}>{totalLabel}</div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 36 36"
          style={{ flex: '0 0 auto' }}
        >
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="rgba(75, 21, 40, 0.08)"
            strokeWidth="3.6"
          />
          {segments.map((s, i) => {
            const dash = `${s.pct} ${100 - s.pct}`;
            const offset = -acc;
            acc += s.pct;
            return (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={s.color}
                strokeWidth="3.6"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                transform="rotate(-90 18 18)"
              />
            );
          })}
        </svg>
        <div style={{ flex: 1, display: 'grid', rowGap: 3 }}>
          {segments.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                color: 'var(--wine)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: s.color,
                }}
              />
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ color: 'var(--mauve)' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type StationeryPeekProps = {
  preTitle?: string;
  bride?: string;
  groom?: string;
  date?: string;
};

export function StationeryPeek({
  preTitle = 'Together with their families',
  bride = 'Aanya',
  groom = 'Rohan',
  date = 'December 12, 2026 · The Leela Palace',
}: StationeryPeekProps) {
  return (
    <div style={cardBase}>
      <div style={labelStyle}>Save the date</div>
      <div
        style={{
          marginTop: 8,
          background: 'linear-gradient(135deg, var(--cream), var(--gold-light))',
          border: '1px solid rgba(75, 21, 40, 0.1)',
          borderRadius: 6,
          padding: '14px 12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 8,
            letterSpacing: '1.5px',
            color: 'var(--mauve)',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {preTitle}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: 18,
            lineHeight: 1.15,
            marginTop: 6,
            color: 'var(--wine)',
          }}
        >
          {bride}
          <br />
          <i style={{ color: 'var(--pink)' }}>&</i>
          <br />
          {groom}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            fontSize: 10.5,
            marginTop: 8,
            color: 'var(--mauve)',
          }}
        >
          {date}
        </div>
      </div>
    </div>
  );
}

type MakeupLookPeekProps = {
  swatches?: string[];
  caption?: string;
  label?: string;
};

export function MakeupLookPeek({
  swatches = ['#E5B89B', '#A03A3A', '#7B3F2C', '#D4537E'],
  caption = 'Smoky kohl + warm rose lip',
  label = 'Bridal · Reception look',
}: MakeupLookPeekProps) {
  return (
    <div style={cardBase}>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 5,
          marginTop: 8,
        }}
      >
        {swatches.map((c, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1 / 1',
              background: c,
              borderRadius: 6,
              boxShadow: 'inset 0 0 0 1px rgba(75, 21, 40, 0.1)',
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 13,
          marginTop: 8,
          color: 'var(--wine)',
        }}
      >
        {caption}
      </div>
    </div>
  );
}

type PriestBookingPeekProps = {
  panditName?: string;
  details?: string;
};

export function PriestBookingPeek({
  panditName = 'Pandit Sharma',
  details = '11:30am ceremony · brings own samagri · vegetarian meal request',
}: PriestBookingPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--pink)',
            color: 'var(--cream)',
            fontSize: 10,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✓
        </span>
        <span style={labelStyle}>Pandit ji booked</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 16,
          color: 'var(--wine)',
          marginBottom: 4,
        }}
      >
        {panditName}
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'rgba(75, 21, 40, 0.7)',
          lineHeight: 1.5,
        }}
      >
        {details}
      </div>
    </div>
  );
}

type SeatingTable = { cx: number; cy: number; label: string };
type SeatingChartPeekProps = {
  tables?: SeatingTable[];
  caption?: string;
  count?: string;
};

export function SeatingChartPeek({
  tables = [
    { cx: 30, cy: 28, label: 'T1' },
    { cx: 80, cy: 22, label: 'T2' },
    { cx: 130, cy: 32, label: 'T3' },
    { cx: 175, cy: 26, label: 'T4' },
    { cx: 50, cy: 60, label: 'T5' },
    { cx: 110, cy: 66, label: 'T6' },
    { cx: 165, cy: 60, label: 'T7' },
  ],
  caption = 'Table 4 · Mehta family',
  count = '32 of 32',
}: SeatingChartPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <span style={labelStyle}>Seating chart</span>
        <span
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            fontSize: 11,
            color: 'var(--pink)',
          }}
        >
          {count}
        </span>
      </div>
      <svg
        width="100%"
        height="84"
        viewBox="0 0 200 84"
        style={{ display: 'block' }}
      >
        {tables.map((t, i) => (
          <g key={i}>
            <circle
              cx={t.cx}
              cy={t.cy}
              r="11"
              fill="rgba(212, 83, 126, 0.12)"
              stroke="var(--pink)"
              strokeWidth="0.8"
            />
            <text
              x={t.cx}
              y={t.cy + 2.5}
              textAnchor="middle"
              fontSize="6"
              fill="var(--wine)"
              fontFamily="var(--font-syne), sans-serif"
              fontWeight="700"
            >
              {t.label}
            </text>
          </g>
        ))}
        <circle cx="105" cy="44" r="4" fill="var(--gold)" />
      </svg>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontStyle: 'italic',
          fontSize: 11,
          color: 'var(--mauve)',
          marginTop: 4,
        }}
      >
        {caption}
      </div>
    </div>
  );
}

type VendorMessagePeekProps = {
  vendor?: string;
  initial?: string;
  message?: string;
  time?: string;
};

export function VendorMessagePeek({
  vendor = 'Velvet & Marigold',
  initial = 'V',
  message = 'Florist confirmed — see you Saturday with the marigold strings & jasmine garlands. Paying balance Friday?',
  time = '2:14 pm',
}: VendorMessagePeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--gold-light), var(--peach))',
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--wine)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initial}
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--wine)' }}>
          {vendor}
        </span>
        <span
          style={{
            fontSize: 9,
            color: 'var(--mauve)',
            marginLeft: 'auto',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {time}
        </span>
      </div>
      <div
        style={{
          background: 'rgba(212, 83, 126, 0.08)',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 12,
          color: 'var(--wine)',
          lineHeight: 1.45,
        }}
      >
        {message}
      </div>
    </div>
  );
}

type OutfitRow = { phase: string; outfit: string; status: string };
type OutfitTrackerPeekProps = { rows?: OutfitRow[]; counterLabel?: string };

export function OutfitTrackerPeek({
  rows = [
    { phase: 'Sangeet', outfit: 'lehenga', status: 'fitting Aug 12' },
    { phase: 'Mehndi', outfit: 'sharara', status: 'ordered' },
    { phase: 'Ceremony', outfit: 'red lehenga', status: 'designing' },
    { phase: 'Reception', outfit: 'saree', status: 'pinned' },
  ],
  counterLabel = 'Outfits · 4 of 6',
}: OutfitTrackerPeekProps) {
  return (
    <div style={cardBase}>
      <div style={labelStyle}>{counterLabel}</div>
      <div style={{ display: 'grid', rowGap: 6, marginTop: 8 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr',
              columnGap: 8,
              fontSize: 11,
              paddingBottom: 4,
              borderBottom:
                i === rows.length - 1
                  ? 'none'
                  : '1px dashed rgba(75, 21, 40, 0.12)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontStyle: 'italic',
                fontSize: 12,
                color: 'var(--pink)',
              }}
            >
              {r.phase}
            </span>
            <span style={{ color: 'var(--wine)' }}>
              {r.outfit}{' '}
              <span style={{ color: 'var(--mauve)' }}>· {r.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type StickyNotePeekProps = { text: string };

export function StickyNotePeek({ text }: StickyNotePeekProps) {
  return (
    <div
      style={{
        maxWidth: 260,
        padding: '11px 15px',
        borderRadius: 6,
        background: 'rgba(251, 234, 240, 0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 2px 12px rgba(75, 21, 40, 0.06)',
        color: 'rgba(75, 21, 40, 0.78)',
        fontFamily: 'var(--font-caveat), cursive',
        fontSize: 16.5,
        lineHeight: 1.35,
        textAlign: 'left',
      }}
    >
      {text}
    </div>
  );
}

/* ============================================================ *
 *  Library
 * ============================================================ */

const STICKY_NOTES: readonly string[] = [
  'I have a secret backup lehenga nobody knows about.',
  'The shagun spreadsheet is sorted by expected amount.',
  'I practiced my walk down the aisle at 2am.',
  'The Pinterest board has 847 pins and I regret nothing.',
  'Aunty already has opinions about the menu.',
  'Phupha is convinced he should DJ.',
  'My mom has a backup plan for the backup plan.',
  'We renamed the WhatsApp group three times.',
  'I told my florist I loved the arrangement. I did not love the arrangement.',
  'My mom added 40 guests while I was on vacation.',
  'The Gantt chart has a Gantt chart.',
  "I've changed the colour palette 11 times.",
  "My fiancé thinks we have 200 guests. It's 340.",
  'I fired a vendor in my dreams and felt guilty the next day.',
  "I've been engaged for 3 days and I already have 4 vendor quotes.",
  'My sister is more excited about the moodboard than I am.',
  'The baraat horse has more followers than me.',
  'I made a pro/con list for two identical shades of ivory.',
  'I told everyone the budget is X. The real budget is 2X.',
  'The seating chart has caused more family drama than the guest list.',
];

const LIBRARY: LibraryItem[] = [
  // Vendor moodboards
  {
    id: 'mood-decor',
    kind: 'product',
    category: 'vendor',
    width: 232,
    render: () => (
      <VendorMoodboardPeek
        vendorName="Velvet & Marigold"
        tag="Décor • Dallas"
        swatches={[
          { color: 'var(--peach)' },
          { color: 'var(--gold-light)' },
          { color: 'var(--lavender)' },
          { color: 'var(--blush)' },
        ]}
      />
    ),
  },
  {
    id: 'mood-photo',
    kind: 'product',
    category: 'vendor',
    width: 232,
    render: () => (
      <VendorMoodboardPeek
        vendorName="Vir & Aaditya"
        tag="Photo • Mumbai"
        swatches={[
          { color: '#5e3a4a' },
          { color: 'var(--wine)' },
          { color: 'var(--peach)' },
          { color: 'var(--cream)' },
        ]}
      />
    ),
  },
  {
    id: 'mood-florist',
    kind: 'product',
    category: 'vendor',
    width: 232,
    render: () => (
      <VendorMoodboardPeek
        vendorName="Bloomscape"
        tag="Florist • Bangalore"
        swatches={[
          { color: 'var(--hot-pink)' },
          { color: 'var(--gold-light)' },
          { color: 'var(--mint)' },
          { color: 'var(--peach)' },
        ]}
      />
    ),
  },
  // Vendor messaging + look board
  {
    id: 'msg-thread',
    kind: 'product',
    category: 'vendor',
    width: 232,
    render: () => <VendorMessagePeek />,
  },
  {
    id: 'mua-look',
    kind: 'product',
    category: 'vendor',
    width: 224,
    render: () => <MakeupLookPeek />,
  },
  // AI briefs
  {
    id: 'ai-decor',
    kind: 'product',
    category: 'ai',
    width: 240,
    render: () => (
      <AIBriefPeek
        title="Your décor brief"
        body="Warm marigold + ivory, brass accents, candlelit mandap with hanging phool clouds and soft jasmine garlands trailing the aisle."
      />
    ),
  },
  {
    id: 'ai-catering',
    kind: 'product',
    category: 'ai',
    width: 240,
    render: () => (
      <AIBriefPeek
        title="Your menu brief"
        body="Paneer tikka kebab station, dahi puri counter, late-night chaat cart at 11pm, slow-pour mango lassi bar by the dance floor."
      />
    ),
  },
  {
    id: 'ai-music',
    kind: 'product',
    category: 'ai',
    width: 240,
    render: () => (
      <AIBriefPeek
        title="Your music brief"
        body="Dhol opening for the baraat, soft Sufi during the pheras, full Punjabi hour at 10pm, slow Bollywood ballads at 1am as it winds down."
      />
    ),
  },
  // Planning
  {
    id: 'timeline',
    kind: 'product',
    category: 'planning',
    width: 200,
    render: () => <EventTimelinePeek />,
  },
  {
    id: 'tasks',
    kind: 'product',
    category: 'planning',
    width: 208,
    render: () => <TaskListPeek />,
  },
  {
    id: 'budget',
    kind: 'product',
    category: 'planning',
    width: 232,
    render: () => <BudgetPiePeek />,
  },
  {
    id: 'stationery',
    kind: 'product',
    category: 'planning',
    width: 200,
    render: () => <StationeryPeek />,
  },
  {
    id: 'priest',
    kind: 'product',
    category: 'planning',
    width: 224,
    render: () => <PriestBookingPeek />,
  },
  {
    id: 'seating',
    kind: 'product',
    category: 'planning',
    width: 224,
    render: () => <SeatingChartPeek />,
  },
  {
    id: 'outfits',
    kind: 'product',
    category: 'planning',
    width: 228,
    render: () => <OutfitTrackerPeek />,
  },
  // Family
  {
    id: 'shagun',
    kind: 'product',
    category: 'family',
    width: 228,
    render: () => <ShagunTrackerPeek />,
  },
  {
    id: 'guests',
    kind: 'product',
    category: 'family',
    width: 224,
    render: () => <GuestListPeek />,
  },
  // Voice — sticky notes
  ...STICKY_NOTES.map(
    (text, i): LibraryItem => ({
      id: `note-${i}`,
      kind: 'note',
      category: 'voice',
      width: 244,
      render: () => <StickyNotePeek text={text} />,
    })
  ),
];

/* ============================================================ *
 *  Slots
 * ============================================================ */

const SLOTS: Slot[] = [
  { id: 'L1', side: 'left', top: '9%', edge: '2.5%' },
  { id: 'L2', side: 'left', top: '32%', edge: '4%' },
  { id: 'L3', side: 'left', top: '56%', edge: '3%' },
  { id: 'L4', side: 'left', top: '78%', edge: '6%' },
  { id: 'R1', side: 'right', top: '12%', edge: '3%' },
  { id: 'R2', side: 'right', top: '34%', edge: '4.5%' },
  { id: 'R3', side: 'right', top: '57%', edge: '2.5%' },
  { id: 'R4', side: 'right', top: '78%', edge: '5%' },
];

/* ============================================================ *
 *  Configuration
 * ============================================================ */

const NOTE_RATIO = 0.4;
const MAX_PER_CATEGORY = 2;
const TARGET_DESKTOP = 4;
const TARGET_TABLET = 3;
const HOLD_MIN_MS = 6000;
const HOLD_MAX_MS = 12000;
const REPLACEMENT_GAP_MIN_MS = 800;
const REPLACEMENT_GAP_MAX_MS = 2200;
const INITIAL_STAGGER_MS = 1500;

/* ============================================================ *
 *  PeekItem — lifecycle wrapper
 * ============================================================ */

type PeekItemProps = {
  data: ActiveItem;
  render: () => ReactNode;
  onExpired: () => void;
};

function PeekItem({ data, render, onExpired }: PeekItemProps) {
  const [exiting, setExiting] = useState(false);
  const target = depthStyles[data.depth];

  useEffect(() => {
    const exitTimer = setTimeout(
      () => setExiting(true),
      data.enterDuration + data.holdDuration
    );
    const removeTimer = setTimeout(
      () => onExpired(),
      data.enterDuration + data.holdDuration + data.exitDuration
    );
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionStyle: CSSProperties = {
    top: `calc(${data.topPct} + ${data.offsetY}px)`,
  };
  if (data.side === 'left') {
    positionStyle.left = `calc(${data.edgePct} + ${data.offsetX}px)`;
  } else {
    positionStyle.right = `calc(${data.edgePct} - ${data.offsetX}px)`;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="ambient-motion pointer-events-none absolute"
      style={{
        ...positionStyle,
        width: data.width,
        filter: target.blur ? `blur(${target.blur}px)` : undefined,
        zIndex: 1,
        willChange: 'opacity, transform',
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: exiting ? 0 : target.opacity,
        scale: exiting ? 0.96 : 1,
      }}
      transition={{
        duration: (exiting ? data.exitDuration : data.enterDuration) / 1000,
        ease: easeSoft,
      }}
    >
      <motion.div
        animate={{ y: [0, -data.driftAmplitude, 0] }}
        transition={{
          duration: data.driftDuration,
          delay: data.driftDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
      >
        <div
          style={{
            transform: `rotate(${data.rotate}deg)`,
            transformOrigin: 'center',
          }}
        >
          {render()}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ *
 *  Orchestrator
 * ============================================================ */

const LIBRARY_BY_ID = new Map(LIBRARY.map((it) => [it.id, it]));

export function ProductPeeks() {
  const [active, setActive] = useState<ActiveItem[]>([]);
  const [targetCount, setTargetCount] = useState(0);

  const activeRef = useRef<ActiveItem[]>([]);
  const slotsInUseRef = useRef<Set<string>>(new Set());
  const recentBySlotRef = useRef<Map<string, string>>(new Map());
  const skipReplacementsRef = useRef(0);
  const isHiddenRef = useRef(false);
  const targetCountRef = useRef(0);
  const previousTargetRef = useRef<number | null>(null);

  /* ---- breakpoint tracking ---- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqTablet = window.matchMedia('(min-width: 768px)');

    const compute = () => {
      if (mqDesktop.matches) return TARGET_DESKTOP;
      if (mqTablet.matches) return TARGET_TABLET;
      return 0;
    };

    const apply = () => setTargetCount(compute());
    apply();

    mqDesktop.addEventListener('change', apply);
    mqTablet.addEventListener('change', apply);
    return () => {
      mqDesktop.removeEventListener('change', apply);
      mqTablet.removeEventListener('change', apply);
    };
  }, []);

  /* ---- visibility tracking ---- */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      const wasHidden = isHiddenRef.current;
      isHiddenRef.current = document.visibilityState === 'hidden';
      if (wasHidden && !isHiddenRef.current) {
        const need = Math.max(
          0,
          targetCountRef.current - activeRef.current.length
        );
        for (let i = 0; i < need; i += 1) {
          window.setTimeout(spawn, i * INITIAL_STAGGER_MS);
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- selection ---- */
  const pickItemForSlot = useCallback(
    (slotId: string, currentlyActive: ActiveItem[]): LibraryItem | null => {
      const avoidId = recentBySlotRef.current.get(slotId);
      const visibleCats = new Map<Category, number>();
      currentlyActive.forEach((a) => {
        visibleCats.set(a.category, (visibleCats.get(a.category) ?? 0) + 1);
      });

      const desiredKind: Kind = Math.random() < NOTE_RATIO ? 'note' : 'product';

      const passes = (it: LibraryItem, opts: { kind: boolean; cat: boolean; recent: boolean }) => {
        if (opts.recent && it.id === avoidId) return false;
        if (opts.kind && it.kind !== desiredKind) return false;
        if (opts.cat && (visibleCats.get(it.category) ?? 0) >= MAX_PER_CATEGORY)
          return false;
        return true;
      };

      const tiers: { kind: boolean; cat: boolean; recent: boolean }[] = [
        { kind: true, cat: true, recent: true },
        { kind: true, cat: false, recent: true },
        { kind: false, cat: true, recent: true },
        { kind: false, cat: false, recent: true },
        { kind: false, cat: false, recent: false },
      ];

      for (const tier of tiers) {
        const pool = LIBRARY.filter((it) => passes(it, tier));
        if (pool.length > 0) return pick(pool);
      }
      return null;
    },
    []
  );

  /* ---- spawn ---- */
  const spawn = useCallback(() => {
    if (isHiddenRef.current) return;
    if (activeRef.current.length >= 6) return;

    const freeSlots = SLOTS.filter((s) => !slotsInUseRef.current.has(s.id));
    if (freeSlots.length === 0) return;
    const slot = pick(freeSlots);

    const item = pickItemForSlot(slot.id, activeRef.current);
    if (!item) return;

    const tilt =
      item.kind === 'note' ? rand(-3.5, 3.5) : rand(-2, 2);

    const newItem: ActiveItem = {
      uid: uid(),
      itemId: item.id,
      slotId: slot.id,
      category: item.category,
      kind: item.kind,
      width: item.width,
      depth: pickDepth(),
      side: slot.side,
      topPct: slot.top,
      edgePct: slot.edge,
      offsetX: rand(-18, 18),
      offsetY: rand(-18, 18),
      rotate: tilt,
      driftAmplitude: rand(6, 10),
      driftDuration: rand(8, 12),
      driftDelay: rand(0, 2),
      holdDuration: rand(HOLD_MIN_MS, HOLD_MAX_MS),
      enterDuration: FADE_DURATION_MS,
      exitDuration: FADE_DURATION_MS,
    };

    slotsInUseRef.current.add(slot.id);
    activeRef.current = [...activeRef.current, newItem];
    setActive(activeRef.current);
  }, [pickItemForSlot]);

  /* ---- expire ---- */
  const handleExpired = useCallback(
    (uidToRemove: string) => {
      const expired = activeRef.current.find((a) => a.uid === uidToRemove);
      activeRef.current = activeRef.current.filter(
        (a) => a.uid !== uidToRemove
      );
      setActive(activeRef.current);

      if (expired) {
        slotsInUseRef.current.delete(expired.slotId);
        recentBySlotRef.current.set(expired.slotId, expired.itemId);
      }

      if (isHiddenRef.current) return;

      if (skipReplacementsRef.current > 0) {
        skipReplacementsRef.current -= 1;
        return;
      }

      const delay = rand(REPLACEMENT_GAP_MIN_MS, REPLACEMENT_GAP_MAX_MS);
      window.setTimeout(() => spawn(), delay);
    },
    [spawn]
  );

  /* ---- target-count reactor ---- */
  useEffect(() => {
    targetCountRef.current = targetCount;
    const prev = previousTargetRef.current;
    previousTargetRef.current = targetCount;

    if (typeof window === 'undefined') return;

    if (prev === null) {
      // Initial mount — fire `targetCount` spawns staggered.
      for (let i = 0; i < targetCount; i += 1) {
        window.setTimeout(spawn, i * INITIAL_STAGGER_MS);
      }
    } else if (targetCount > prev) {
      const diff = targetCount - prev;
      for (let i = 0; i < diff; i += 1) {
        window.setTimeout(spawn, i * INITIAL_STAGGER_MS);
      }
    } else if (targetCount < prev) {
      skipReplacementsRef.current += prev - targetCount;
    }
  }, [targetCount, spawn]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {active.map((item) => {
        const lib = LIBRARY_BY_ID.get(item.itemId);
        if (!lib) return null;
        return (
          <PeekItem
            key={item.uid}
            data={item}
            render={lib.render}
            onExpired={() => handleExpired(item.uid)}
          />
        );
      })}
    </div>
  );
}
