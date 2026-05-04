'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* ============================================================ *
 *  Types
 * ============================================================ */

type Category = 'planning' | 'vendor' | 'family' | 'ai' | 'voice' | 'ornament';
type Kind = 'product' | 'note' | 'doodle';

type LibraryItem = {
  id: string;
  kind: Kind;
  category: Category;
  width: number;
  render: () => ReactNode;
};

type ActiveItem = {
  uid: string;
  itemId: string;
  category: Category;
  kind: Kind;
  width: number;

  startX: number;
  startY: number;
  vx: number;
  vy: number;

  perpX: number;
  perpY: number;
  sineAmp: number;
  sineFreq: number;
  sinePhase: number;

  rotateStart: number;
  rotateEnd: number;

  blur: number;
  baseOpacity: number;

  spawnTime: number;
  totalDuration: number;
};

/* ============================================================ *
 *  Visual constants
 * ============================================================ */

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

type ConfessionPeekProps = { emoji: string; tag: string; text: string };

export function ConfessionPeek({ emoji, tag, text }: ConfessionPeekProps) {
  return (
    <div
      style={{
        width: 244,
        padding: '11px 14px 12px',
        borderRadius: 6,
        background: 'rgba(255, 248, 242, 0.94)',
        border: '1px solid rgba(75, 21, 40, 0.08)',
        boxShadow: '0 4px 18px rgba(75, 21, 40, 0.10), 0 1px 2px rgba(75, 21, 40, 0.06)',
        color: 'var(--wine)',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
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
            background: 'rgba(212, 83, 126, 0.14)',
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          {emoji}
        </span>
        <span
          style={{
            ...labelStyle,
            fontSize: 8.5,
            color: 'var(--pink)',
            letterSpacing: '1.4px',
          }}
        >
          {tag}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-caveat), cursive',
          fontSize: 16,
          lineHeight: 1.35,
          color: 'rgba(75, 21, 40, 0.85)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

type BudgetBarPeekProps = {
  totalLabel?: string;
  spentPct?: number;
  lines?: { label: string; amount: string; done?: boolean }[];
  meta?: string;
};

export function BudgetBarPeek({
  totalLabel = 'Total Budget · $85,000',
  spentPct = 60,
  lines = [
    { label: 'Venue', amount: '$22,000', done: true },
    { label: 'Catering', amount: '$18,500', done: true },
  ],
  meta = '4 of 12 categories set',
}: BudgetBarPeekProps) {
  return (
    <div style={cardBase}>
      <div style={{ ...labelStyle, marginBottom: 8 }}>{totalLabel}</div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(75, 21, 40, 0.08)',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${spentPct}%`,
            height: '100%',
            background: 'var(--pink)',
            borderRadius: 3,
          }}
        />
      </div>
      <div style={{ display: 'grid', rowGap: 5 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11.5,
              color: 'var(--wine)',
            }}
          >
            <span>{l.label}</span>
            <span style={{ color: 'var(--mauve)', fontVariantNumeric: 'tabular-nums' }}>
              {l.amount} {l.done ? '✓' : ''}
            </span>
          </div>
        ))}
      </div>
      <div style={{ ...labelStyle, marginTop: 10, fontSize: 8.5 }}>{meta}</div>
    </div>
  );
}

type VendorMatchPeekProps = {
  name?: string;
  match?: string;
  tags?: string[];
};

export function VendorMatchPeek({
  name = 'Aarav Kapoor Photography',
  match = '94% match to your brief',
  tags = ['EDITORIAL', 'FILM-GRAIN'],
}: VendorMatchPeekProps) {
  return (
    <div style={cardBase}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12 }}>⭐</span>
        <span style={labelStyle}>Top match</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 15,
          lineHeight: 1.2,
          color: 'var(--wine)',
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontStyle: 'italic',
          fontSize: 11.5,
          color: 'var(--pink)',
          marginBottom: 8,
        }}
      >
        {match}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tags.map((t, i) => (
          <span
            key={i}
            style={{
              ...labelStyle,
              fontSize: 8,
              padding: '3px 6px',
              background: 'rgba(212, 83, 126, 0.10)',
              color: 'var(--pink)',
              borderRadius: 3,
              letterSpacing: '1.2px',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ *
 *  Library
 * ============================================================ */

type ConfessionEntry = { emoji: string; tag: string; text: string };

const CONFESSIONS: readonly ConfessionEntry[] = [
  { emoji: '😤', tag: 'RANT · BRIDE', text: 'My MIL invited 47 people I’ve never met...' },
  { emoji: '🤫', tag: 'SECRET · BRIDE', text: 'I secretly hate my lehenga...' },
  { emoji: '🔥', tag: 'HOT TAKE', text: 'Nobody’s sangeet performance is as good as they think...' },
  { emoji: '😱', tag: 'SHOCKED', text: 'My florist said marigolds were “too ethnic”...' },
  { emoji: '😤', tag: 'RANT · BUDGET', text: 'Every vendor adds 30% when they hear “wedding”...' },
  { emoji: '🤫', tag: 'SECRET · BRIDE', text: 'I picked my venue because of Instagram, not because I liked it...' },
  { emoji: '🔥', tag: 'HOT TAKE', text: 'If the ceremony is under 2 hours, did you even get married?' },
  { emoji: '😱', tag: 'SHOCKED · GUEST', text: 'A guest RSVP’d no, showed up with 4 extra people...' },
  { emoji: '😤', tag: 'RANT · FAMILY', text: 'I’ve been asked “what will the aunties think” 47 times...' },
  { emoji: '🤫', tag: 'SECRET · BUDGET', text: 'The groom told friends it costs $50K. It costs $120K...' },
  { emoji: '🔥', tag: 'HOT TAKE', text: 'Engagement shoots in a field at golden hour all look the same...' },
  { emoji: '😱', tag: 'SHOCKED · FAMILY', text: 'My cousin asked to do a gender reveal at my sangeet...' },
  { emoji: '😤', tag: 'RANT · BRIDE', text: 'We’ve had 14 group calls about bridesmaid outfits. FOURTEEN.' },
  { emoji: '🤫', tag: 'SECRET · GUEST', text: 'I go to weddings primarily for the food...' },
  { emoji: '🔥', tag: 'HOT TAKE', text: 'Destination weddings are just small weddings in disguise...' },
  { emoji: '😱', tag: 'SHOCKED · VENDOR', text: 'My photographer charges extra for “smile coaching”...' },
  { emoji: '😤', tag: 'RANT · VENDOR', text: 'I asked for simple mehendi and my MUA said “simple doesn’t photograph well”...' },
  { emoji: '🤫', tag: 'SECRET · BRIDE', text: 'I genuinely do not care about centerpieces...' },
  { emoji: '🔥', tag: 'HOT TAKE', text: 'Most wedding planners are just expensive spreadsheet managers...' },
  { emoji: '😱', tag: 'SHOCKED · MOM', text: 'The mother of the bride wanted the dupatta to match the napkins...' },
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
  // Voice — confession cards (note kind)
  ...CONFESSIONS.map(
    (c, i): LibraryItem => ({
      id: `confession-${i}`,
      kind: 'note',
      category: 'voice',
      width: 244,
      render: () => <ConfessionPeek emoji={c.emoji} tag={c.tag} text={c.text} />,
    })
  ),
  // Tool previews — additional cards from spec
  {
    id: 'budget-bar',
    kind: 'product',
    category: 'planning',
    width: 232,
    render: () => <BudgetBarPeek />,
  },
  {
    id: 'vendor-match',
    kind: 'product',
    category: 'vendor',
    width: 232,
    render: () => <VendorMatchPeek />,
  },
  // Ornament — small SVG doodles
  {
    id: 'doodle-circle',
    kind: 'doodle',
    category: 'ornament',
    width: 80,
    render: () => (
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>
    ),
  },
  {
    id: 'doodle-star',
    kind: 'doodle',
    category: 'ornament',
    width: 60,
    render: () => (
      <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
        <path
          d="M30 5l5 15h15l-12 9 5 16-13-10-13 10 5-16-12-9h15z"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    id: 'doodle-blob',
    kind: 'doodle',
    category: 'ornament',
    width: 70,
    render: () => (
      <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
        <path
          d="M35 10c20 0 25 20 15 30s-25 10-30 0-5-30 15-30z"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    id: 'doodle-square',
    kind: 'doodle',
    category: 'ornament',
    width: 50,
    render: () => (
      <svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true">
        <rect
          x="10"
          y="10"
          width="30"
          height="30"
          rx="4"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="3 5"
          transform="rotate(15 25 25)"
        />
      </svg>
    ),
  },
  {
    id: 'doodle-bigstar',
    kind: 'doodle',
    category: 'ornament',
    width: 46,
    render: () => (
      <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
        <path
          d="M23 4 L28 18 L42 22 L31 31 L34 44 L23 36 L12 44 L15 31 L4 22 L18 18 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.1"
        />
      </svg>
    ),
  },
];

/* ============================================================ *
 *  Configuration
 * ============================================================ */

const FADE_IN_MS = 500;
const FADE_OUT_MS = 500;
const LIFECYCLE_MIN_MS = 8000;
const LIFECYCLE_MAX_MS = 12000;
const SPAWN_INTERVAL_MIN_MS = 3000;
const SPAWN_INTERVAL_MAX_MS = 4000;
const TARGET_DESKTOP = 5;
const TARGET_TABLET = 3;
const TARGET_MOBILE = 2;
const TARGET_SMALL = 1; // <480px — confessions only
const NOTE_RATIO = 0.6; // confessions
const PRODUCT_RATIO = 0.4; // tool previews
// no doodles
const MAX_PER_CATEGORY = 2;

// Lanes: cards spawn within these horizontal bands so they drift through the
// open pink space on either side of the centered hero content.
const LEFT_LANE_MIN = 0.03;
const LEFT_LANE_MAX = 0.30;
const RIGHT_LANE_MIN = 0.70;
const RIGHT_LANE_MAX = 0.97;
const LANE_Y_MIN = 0.05;
const LANE_Y_MAX = 0.95;

// Slow vertical drift over the card's lifecycle, in px.
const DRIFT_MIN = 80;
const DRIFT_MAX = 150;

const RECENT_HISTORY = 8;

/* ============================================================ *
 *  Path generation
 * ============================================================ */

function generatePath(
  W: number,
  H: number,
  itemWidth: number,
  totalDurationMs: number
): {
  startX: number;
  startY: number;
  vx: number;
  vy: number;
} {
  const seconds = totalDurationMs / 1000;

  // Pick a lane. Position the card's CENTER within the lane band, then convert
  // to top-left for the translate3d call.
  const useLeftLane = Math.random() < 0.5;
  const laneMin = useLeftLane ? LEFT_LANE_MIN : RIGHT_LANE_MIN;
  const laneMax = useLeftLane ? LEFT_LANE_MAX : RIGHT_LANE_MAX;

  // Clamp so the card fully fits inside the lane on wide enough viewports;
  // on narrow viewports it may bleed slightly toward the edge or center, which
  // is acceptable visually.
  const halfW = itemWidth / 2;
  let centerXPx = rand(laneMin * W, laneMax * W);
  centerXPx = Math.max(halfW, Math.min(W - halfW, centerXPx));
  const startX = centerXPx - halfW;

  // Vertical: random Y within full hero height. The card may spawn anywhere
  // and drift up/down/diagonally during its lifecycle.
  const startY = rand(LANE_Y_MIN * H, LANE_Y_MAX * H);

  // Drift direction: upward, downward, or diagonal. Slight horizontal sway is
  // applied via the perpendicular sine wobble in PeekItem.
  const driftDistance = rand(DRIFT_MIN, DRIFT_MAX);
  const direction = Math.random();
  let vy: number;
  let vx: number;
  if (direction < 0.4) {
    // upward
    vy = -driftDistance / seconds;
    vx = rand(-8, 8);
  } else if (direction < 0.8) {
    // downward
    vy = driftDistance / seconds;
    vx = rand(-8, 8);
  } else {
    // diagonal — keep horizontal component small so we stay in-lane
    const sign = useLeftLane ? -1 : 1;
    vy = (Math.random() < 0.5 ? -1 : 1) * (driftDistance / seconds);
    vx = sign * rand(4, 10);
  }

  return { startX, startY, vx, vy };
}

/* ============================================================ *
 *  Visual styling per kind
 * ============================================================ */

function styleForKind(kind: Kind): { baseOpacity: number; blur: number } {
  if (kind === 'note') {
    // confessions — semi-transparent, ambient
    return { baseOpacity: rand(0.55, 0.75), blur: 0 };
  }
  if (kind === 'doodle') {
    return { baseOpacity: rand(0.14, 0.22), blur: 0 };
  }
  // product (tool previews) — slightly more opaque so UI is legible
  return { baseOpacity: rand(0.65, 0.85), blur: 0 };
}

function rotationForKind(kind: Kind): { start: number; end: number } {
  if (kind === 'doodle') {
    const start = rand(-12, 12);
    return { start, end: start + (Math.random() < 0.5 ? rand(1, 2) : rand(-2, -1)) };
  }
  // notes + products: scattered -4° to 4°
  const start = rand(-4, 4);
  return { start, end: start + (Math.random() < 0.5 ? rand(0.3, 1) : rand(-1, -0.3)) };
}

/* ============================================================ *
 *  PeekItem — RAF-driven lifecycle wrapper
 * ============================================================ */

type PeekItemProps = {
  data: ActiveItem;
  render: () => ReactNode;
  onExpired: () => void;
  pausedRef: { current: boolean };
};

function PeekItem({ data, render, onExpired, pausedRef }: PeekItemProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let raf = 0;
    let expired = false;
    // When paused, freeze elapsed so cards keep their position/lifecycle when
    // the hero scrolls back into view instead of jumping forward.
    let pausedAt: number | null = null;
    let pausedAccum = 0;

    const tick = () => {
      if (pausedRef.current) {
        if (pausedAt === null) pausedAt = performance.now();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (pausedAt !== null) {
        pausedAccum += performance.now() - pausedAt;
        pausedAt = null;
      }

      const elapsed = performance.now() - data.spawnTime - pausedAccum;
      const t = elapsed / data.totalDuration;

      if (t >= 1) {
        if (!expired) {
          expired = true;
          el.style.opacity = '0';
          onExpired();
        }
        return;
      }

      const seconds = elapsed / 1000;
      const baseX = data.startX + data.vx * seconds;
      const baseY = data.startY + data.vy * seconds;

      const wobble =
        Math.sin(t * Math.PI * data.sineFreq + data.sinePhase) * data.sineAmp;
      const x = baseX + data.perpX * wobble;
      const y = baseY + data.perpY * wobble;

      const rotate =
        data.rotateStart + (data.rotateEnd - data.rotateStart) * t;
      const scale = 0.94 + (1.02 - 0.94) * t;

      let env = 1;
      if (elapsed < FADE_IN_MS) {
        env = elapsed / FADE_IN_MS;
      } else if (elapsed > data.totalDuration - FADE_OUT_MS) {
        env = Math.max(0, (data.totalDuration - elapsed) / FADE_OUT_MS);
      }
      const opacity = data.baseOpacity * env;

      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
      el.style.opacity = `${opacity}`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className="ambient-motion pointer-events-none absolute"
      style={{
        top: 0,
        left: 0,
        width: data.width,
        filter: data.blur ? `blur(${data.blur}px)` : undefined,
        zIndex: 1,
        willChange: 'transform, opacity',
        transform: `translate3d(${data.startX}px, ${data.startY}px, 0) rotate(${data.rotateStart}deg) scale(0.94)`,
        opacity: 0,
        transformOrigin: 'center',
      }}
    >
      {render()}
    </div>
  );
}

/* ============================================================ *
 *  Orchestrator
 * ============================================================ */

const LIBRARY_BY_ID = new Map(LIBRARY.map((it) => [it.id, it]));

export function ProductPeeks() {
  const [active, setActive] = useState<ActiveItem[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<ActiveItem[]>([]);
  const recentItemsRef = useRef<string[]>([]);
  const isHiddenRef = useRef(false);
  const targetCountRef = useRef(0);
  const reducedRef = useRef(false);
  const dimsRef = useRef<{ W: number; H: number }>({ W: 1440, H: 800 });

  /* ---- container measurement ---- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        dimsRef.current = { W: r.width, H: r.height };
      }
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---- breakpoint + reduced-motion tracking ---- */
  const isSmallRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const mqSmall = window.matchMedia('(max-width: 479px)');

    const compute = () => {
      reducedRef.current = mqReduced.matches;
      isSmallRef.current = mqSmall.matches;
      if (mqReduced.matches) {
        targetCountRef.current = 0;
        return;
      }
      if (mqSmall.matches) targetCountRef.current = TARGET_SMALL;
      else if (mqDesktop.matches) targetCountRef.current = TARGET_DESKTOP;
      else if (mqTablet.matches) targetCountRef.current = TARGET_TABLET;
      else targetCountRef.current = TARGET_MOBILE;
    };
    compute();

    mqReduced.addEventListener('change', compute);
    mqDesktop.addEventListener('change', compute);
    mqTablet.addEventListener('change', compute);
    mqSmall.addEventListener('change', compute);
    return () => {
      mqReduced.removeEventListener('change', compute);
      mqDesktop.removeEventListener('change', compute);
      mqTablet.removeEventListener('change', compute);
      mqSmall.removeEventListener('change', compute);
    };
  }, []);

  /* ---- visibility tracking (tab hidden) ---- */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      isHiddenRef.current = document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  /* ---- in-viewport tracking (pause when hero scrolled away) ---- */
  const inViewRef = useRef(true);
  const pausedRef = useRef(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inViewRef.current = entry.isIntersecting;
          pausedRef.current = !entry.isIntersecting;
        }
      },
      { rootMargin: '0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- selection ---- */
  const pickItem = useCallback((): LibraryItem | null => {
    const recent = new Set(recentItemsRef.current);
    const visibleCats = new Map<Category, number>();
    activeRef.current.forEach((a) => {
      visibleCats.set(a.category, (visibleCats.get(a.category) ?? 0) + 1);
    });

    const r = Math.random();
    // On small screens (<480px), force confessions only — tool previews are too
    // dense at that size.
    const desiredKind: Kind = isSmallRef.current
      ? 'note'
      : r < NOTE_RATIO
        ? 'note'
        : r < NOTE_RATIO + PRODUCT_RATIO
          ? 'product'
          : 'doodle';

    const passes = (
      it: LibraryItem,
      opts: { kind: boolean; cat: boolean; recent: boolean }
    ) => {
      if (opts.recent && recent.has(it.id)) return false;
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
  }, []);

  /* ---- spawn ---- */
  const spawnOne = useCallback(() => {
    if (isHiddenRef.current || reducedRef.current) return;
    if (!inViewRef.current) return;
    if (activeRef.current.length >= TARGET_DESKTOP) return;

    const item = pickItem();
    if (!item) return;

    const { W, H } = dimsRef.current;
    const totalDuration = rand(LIFECYCLE_MIN_MS, LIFECYCLE_MAX_MS);
    const path = generatePath(W, H, item.width, totalDuration);

    const speed = Math.hypot(path.vx, path.vy);
    const perpX = speed > 0 ? -path.vy / speed : 0;
    const perpY = speed > 0 ? path.vx / speed : 0;

    const { baseOpacity, blur } = styleForKind(item.kind);
    const rot = rotationForKind(item.kind);

    const newItem: ActiveItem = {
      uid: uid(),
      itemId: item.id,
      category: item.category,
      kind: item.kind,
      width: item.width,
      startX: path.startX,
      startY: path.startY,
      vx: path.vx,
      vy: path.vy,
      perpX,
      perpY,
      sineAmp: rand(14, 38),
      sineFreq: rand(0.6, 1.4),
      sinePhase: rand(0, Math.PI * 2),
      rotateStart: rot.start,
      rotateEnd: rot.end,
      blur,
      baseOpacity,
      spawnTime: performance.now(),
      totalDuration,
    };

    recentItemsRef.current = [
      item.id,
      ...recentItemsRef.current.slice(0, RECENT_HISTORY - 1),
    ];

    activeRef.current = [...activeRef.current, newItem];
    setActive(activeRef.current);
  }, [pickItem]);

  /* ---- expire ---- */
  const handleExpired = useCallback((uidToRemove: string) => {
    activeRef.current = activeRef.current.filter((a) => a.uid !== uidToRemove);
    setActive(activeRef.current);
  }, []);

  /* ---- spawn loop ---- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (
        !isHiddenRef.current &&
        !reducedRef.current &&
        inViewRef.current &&
        activeRef.current.length < targetCountRef.current
      ) {
        spawnOne();
      }
      const delay = rand(SPAWN_INTERVAL_MIN_MS, SPAWN_INTERVAL_MAX_MS);
      timeoutId = setTimeout(tick, delay);
    };

    // Initial fill: stagger a few quick spawns so the field populates fast,
    // then settle into the regular cadence.
    const initialKicks: number[] = [];
    const seedCount = Math.max(0, targetCountRef.current);
    for (let i = 0; i < seedCount; i += 1) {
      const id = window.setTimeout(() => {
        if (!cancelled) spawnOne();
      }, 150 + i * 700);
      initialKicks.push(id);
    }

    timeoutId = setTimeout(tick, 150 + seedCount * 700 + 500);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      initialKicks.forEach((id) => clearTimeout(id));
    };
  }, [spawnOne]);

  return (
    <div
      ref={containerRef}
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
            pausedRef={pausedRef}
          />
        );
      })}
    </div>
  );
}
