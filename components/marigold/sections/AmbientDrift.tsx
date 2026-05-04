'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './AmbientDrift.module.css';

type Variant = 'petal' | 'sparkle' | 'diamond';

interface Element {
  id: number;
  variant: Variant;
  startX: number;   // viewport %
  startY: number;   // viewport %
  driftX: number;   // px
  driftY: number;   // px
  rotate: number;   // deg
  duration: number; // s
  delay: number;    // s
  opacity: number;
  color: string;
}

const COLORS = ['#ED93B1', '#D4A853', '#FBEAF0', '#C4A265', '#F5D9A0'];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickVariant(): Variant {
  const r = Math.random();
  if (r < 0.45) return 'petal';
  if (r < 0.8) return 'sparkle';
  return 'diamond';
}

function generate(count: number): Element[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    variant: pickVariant(),
    startX: rand(2, 98),
    startY: rand(5, 95),
    driftX: rand(-90, 90),
    driftY: rand(-220, -120),
    rotate: rand(-180, 180),
    duration: rand(14, 22),
    delay: rand(-22, 0),
    opacity: rand(0.1, 0.2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

function PetalSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path
        d="M12 2 C 7 7, 7 14, 12 16 C 17 14, 17 7, 12 2 Z"
        fill={color}
        opacity="0.85"
      />
    </svg>
  );
}

export function AmbientDrift() {
  const [enabled, setEnabled] = useState(false);
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    setCount(mobile ? 6 : 10);
    setEnabled(true);
  }, []);

  const elements = useMemo<Element[]>(
    () => (enabled ? generate(count) : []),
    [enabled, count],
  );

  if (!enabled) return null;

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.shimmer} />
      {elements.map((el) => {
        const className = `${styles.element} ${
          el.variant === 'petal'
            ? styles.petal
            : el.variant === 'sparkle'
              ? styles.sparkle
              : styles.diamond
        }`;
        const style = {
          left: `${el.startX}%`,
          top: `${el.startY}%`,
          color: el.color,
          animationDuration: `${el.duration}s`,
          animationDelay: `${el.delay}s`,
          ['--drift-x' as string]: `${el.driftX}px`,
          ['--drift-y' as string]: `${el.driftY}px`,
          ['--drift-rotate' as string]: `${el.rotate}deg`,
          ['--drift-opacity' as string]: el.opacity,
        } as React.CSSProperties;

        if (el.variant === 'petal') {
          return (
            <div key={el.id} className={className} style={style}>
              <PetalSvg color={el.color} />
            </div>
          );
        }

        if (el.variant === 'sparkle') {
          return (
            <div
              key={el.id}
              className={className}
              style={{ ...style, background: el.color }}
            />
          );
        }

        return <div key={el.id} className={className} style={style} />;
      })}
    </div>
  );
}
