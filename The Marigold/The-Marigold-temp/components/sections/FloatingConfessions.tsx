'use client';

import { useEffect, useRef, useState } from 'react';

const CONFESSIONS = [
  'I told my florist I loved the arrangement. I did not love the arrangement.',
  'My mom added 40 guests while I was on vacation.',
  'The Gantt chart has a Gantt chart.',
  "I've changed the colour palette 11 times.",
  "My fiancé thinks we have 200 guests. It's 340.",
  'I practiced my walk down the aisle at 2am.',
  'The Pinterest board has 847 pins and I regret nothing.',
  'I fired a vendor in my dreams and felt guilty the next day.',
  'The shagun spreadsheet is sorted by expected amount.',
  'I have a secret backup lehenga nobody knows about.',
  "I've been engaged for 3 days and I already have 4 vendor quotes.",
  'My sister is more excited about the moodboard than I am.',
  'The baraat horse has more followers than me.',
  'I made a pro/con list for two identical shades of ivory.',
  "My wedding planner doesn't know about the secret Pinterest board.",
  'I told everyone the budget is X. The real budget is 2X.',
  "My cousin asked to sing at the sangeet. I'm pretending I didn't see the text.",
  "I already know my walk-in song. I've known since 2019.",
  'The seating chart has caused more family drama than the guest list.',
  'I rehearse my vows in the shower.',
];

type Confession = {
  id: number;
  text: string;
  left: string;
  top: string;
  rotationStart: number;
  rotationEnd: number;
  duration: number;
  drift: number;
  rise: number;
};

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickDrift() {
  const r = Math.random();
  if (r < 0.4) return { drift: -40, rise: -100 };
  if (r < 0.8) return { drift: 40, rise: -100 };
  return { drift: 0, rise: -120 };
}

export function FloatingConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const indexRef = useRef(0);
  const idRef = useRef(0);
  const activeRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const maxActive = isMobile ? 2 : 4;

    let timeoutId: ReturnType<typeof setTimeout>;

    const spawn = () => {
      if (activeRef.current >= maxActive) {
        timeoutId = setTimeout(spawn, 1200);
        return;
      }

      const text = CONFESSIONS[indexRef.current % CONFESSIONS.length];
      indexRef.current += 1;

      const useLeftZone = Math.random() < 0.5;
      const left = isMobile
        ? randBetween(4, 28)
        : useLeftZone
          ? randBetween(3, 25)
          : randBetween(70, 95);
      const top = isMobile ? randBetween(55, 82) : randBetween(15, 85);
      const rotationStart = randBetween(-3, 3);
      const rotationEnd = rotationStart * randBetween(0.2, 0.5);
      const duration = randBetween(9000, 12000);
      const { drift, rise } = pickDrift();
      const id = idRef.current++;

      const confession: Confession = {
        id,
        text,
        left: `${left}%`,
        top: `${top}%`,
        rotationStart,
        rotationEnd,
        duration,
        drift,
        rise,
      };

      activeRef.current += 1;
      setConfessions((prev) => [...prev, confession]);

      setTimeout(() => {
        activeRef.current = Math.max(0, activeRef.current - 1);
        setConfessions((prev) => prev.filter((c) => c.id !== id));
      }, duration);

      const next = randBetween(3000, 4500);
      timeoutId = setTimeout(spawn, next);
    };

    const startTimeout = setTimeout(spawn, 2500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="ambient-motion pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {confessions.map((c) => (
        <span
          key={c.id}
          className="absolute"
          style={{
            left: c.left,
            top: c.top,
            maxWidth: 260,
            padding: '11px 15px',
            borderRadius: 6,
            background: 'rgba(251, 234, 240, 0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 2px 12px rgba(75, 21, 40, 0.06)',
            color: 'rgba(75, 21, 40, 0.7)',
            fontFamily: 'var(--font-caveat), cursive',
            fontSize: 16.5,
            lineHeight: 1.35,
            textAlign: 'left',
            ['--rot-start' as string]: `${c.rotationStart}deg`,
            ['--rot-end' as string]: `${c.rotationEnd}deg`,
            ['--dx' as string]: `${c.drift}px`,
            ['--dy' as string]: `${c.rise}px`,
            animation: `confession-drift ${c.duration}ms ease-in-out forwards`,
            willChange: 'transform, opacity, filter',
          }}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
}
