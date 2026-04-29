'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type BloomVariant = 1 | 2 | 3 | 4;

type Bloom = {
  id: number;
  y: number;
  side: 'left' | 'right';
  offset: number;
  size: number;
  rotation: number;
  opacity: number;
  variant: BloomVariant;
  color: string;
};

const COLORS = ['#ED93B1', '#D4A853', '#FBEAF0', '#993556'];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateBlooms(count: number, mobile: boolean): Bloom[] {
  const blooms: Bloom[] = [];
  const viewport = typeof window !== 'undefined' ? window.innerHeight : 800;
  let y = viewport + 80;
  for (let i = 0; i < count; i++) {
    const side: 'left' | 'right' = mobile ? 'right' : i % 2 === 0 ? 'left' : 'right';
    blooms.push({
      id: i,
      y: y + rand(-60, 60),
      side,
      offset: rand(0.5, 4),
      size: mobile ? rand(20, 32) : rand(24, 48),
      rotation: rand(-15, 15),
      opacity: rand(0.08, 0.15),
      variant: ((i % 4) + 1) as BloomVariant,
      color: COLORS[i % COLORS.length],
    });
    y += rand(420, 540);
  }
  return blooms;
}

function MarigoldSvg({ variant, color }: { variant: BloomVariant; color: string }) {
  switch (variant) {
    case 1:
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <g fill={color}>
            <ellipse cx="24" cy="10" rx="5" ry="9" />
            <ellipse cx="24" cy="38" rx="5" ry="9" />
            <ellipse cx="10" cy="24" rx="9" ry="5" />
            <ellipse cx="38" cy="24" rx="9" ry="5" />
            <ellipse cx="14" cy="14" rx="6" ry="5" transform="rotate(-45 14 14)" />
            <ellipse cx="34" cy="34" rx="6" ry="5" transform="rotate(-45 34 34)" />
          </g>
          <circle cx="24" cy="24" r="4" fill="#D4A853" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <g fill={color}>
            <ellipse cx="14" cy="20" rx="6" ry="3" transform="rotate(-30 14 20)" />
            <ellipse cx="30" cy="14" rx="6" ry="3" transform="rotate(20 30 14)" />
            <ellipse cx="32" cy="32" rx="7" ry="3" transform="rotate(-15 32 32)" />
          </g>
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <path
            d="M24 6 C 14 14, 14 26, 24 28 C 34 26, 34 14, 24 6 Z"
            fill={color}
          />
          <path
            d="M24 28 C 24 32, 22 40, 18 44"
            fill="none"
            stroke="#8A6070"
            strokeOpacity="0.7"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 4:
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <g fill="none" stroke={color} strokeWidth="1.6">
            <circle cx="24" cy="24" r="16" />
            <circle cx="24" cy="24" r="11" />
            <circle cx="24" cy="24" r="6" />
          </g>
          <circle cx="24" cy="24" r="3" fill={color} />
        </svg>
      );
  }
}

export function ScrollBlooms() {
  const [enabled, setEnabled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [bloomedIds, setBloomedIds] = useState<Set<number>>(new Set());
  const triggeredRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    setMobile(window.matchMedia('(max-width: 767px)').matches);
    setEnabled(true);
  }, []);

  const blooms = useMemo<Bloom[]>(() => {
    if (!enabled) return [];
    return generateBlooms(mobile ? 5 : 11, mobile);
  }, [enabled, mobile]);

  useEffect(() => {
    if (!enabled || blooms.length === 0) return;

    const checkScroll = () => {
      tickingRef.current = false;
      const threshold = window.scrollY + window.innerHeight * 0.85;
      let changed = false;
      const next = new Set(triggeredRef.current);
      for (const b of blooms) {
        if (!next.has(b.id) && b.y < threshold) {
          next.add(b.id);
          changed = true;
        }
      }
      if (changed) {
        triggeredRef.current = next;
        setBloomedIds(new Set(next));
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.setTimeout(checkScroll, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [blooms, enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="ambient-motion pointer-events-none absolute inset-x-0 top-0 z-0"
      style={{ height: '100%' }}
    >
      {blooms.map((b) => {
        const visible = bloomedIds.has(b.id);
        const sideStyle =
          b.side === 'left' ? { left: `${b.offset}%` } : { right: `${b.offset}%` };

        return (
          <div
            key={b.id}
            className="absolute"
            style={{
              ...sideStyle,
              top: b.y,
              width: b.size,
              height: b.size,
              opacity: visible ? b.opacity : 0,
              transform: `scale(${visible ? 1 : 0.5}) rotate(${b.rotation}deg)`,
              transition:
                'opacity 1.2s ease-out, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <MarigoldSvg variant={b.variant} color={b.color} />
          </div>
        );
      })}
    </div>
  );
}
