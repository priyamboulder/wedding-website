'use client';

import { useEffect, useRef } from 'react';
import { ChunkyButton } from '@/components/ui/ChunkyButton';
import { TornDivider } from '@/components/ui/TornDivider';
import { FloatingConfessions } from '@/components/sections/FloatingConfessions';

type Doodle = {
  cx: string;
  cy: string;
  baseRotate: number;
  parallax: number;
  svg: React.ReactNode;
  size: number;
};

const doodles: Doodle[] = [
  {
    cx: '5%',
    cy: '12%',
    baseRotate: -20,
    parallax: 22,
    size: 80,
    svg: (
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
    ),
  },
  {
    cx: '88%',
    cy: '20%',
    baseRotate: 15,
    parallax: 32,
    size: 60,
    svg: (
      <path
        d="M30 5l5 15h15l-12 9 5 16-13-10-13 10 5-16-12-9h15z"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
      />
    ),
  },
  {
    cx: '10%',
    cy: '72%',
    baseRotate: 25,
    parallax: -28,
    size: 70,
    svg: (
      <path
        d="M35 10c20 0 25 20 15 30s-25 10-30 0-5-30 15-30z"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
      />
    ),
  },
  {
    cx: '84%',
    cy: '80%',
    baseRotate: -10,
    parallax: 18,
    size: 50,
    svg: (
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
    ),
  },
  {
    cx: '50%',
    cy: '8%',
    baseRotate: 8,
    parallax: -16,
    size: 46,
    svg: (
      <path
        d="M23 4 L28 18 L42 22 L31 31 L34 44 L23 36 L12 44 L15 31 L4 22 L18 18 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.1"
      />
    ),
  },
];

export function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const doodleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      doodleRefs.current.forEach((node, i) => {
        if (!node) return;
        const d = doodles[i];
        const tx = currentX * d.parallax;
        const ty = currentY * d.parallax;
        node.style.transform = `translate(${tx}px, ${ty}px) rotate(${d.baseRotate}deg)`;
      });
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    container.addEventListener('mousemove', handleMove);
    return () => {
      container.removeEventListener('mousemove', handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const layer = trailRef.current;
    if (!container || !layer) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = !window.matchMedia('(any-hover: hover)').matches;
    if (reduced || noHover) return;

    const FLOWER_SVGS = [
      `<svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="8" rx="5" ry="8" fill="currentColor" opacity="0.9"/>
        <ellipse cx="16" cy="8" rx="5" ry="8" fill="currentColor" opacity="0.9" transform="rotate(72 16 16)"/>
        <ellipse cx="16" cy="8" rx="5" ry="8" fill="currentColor" opacity="0.9" transform="rotate(144 16 16)"/>
        <ellipse cx="16" cy="8" rx="5" ry="8" fill="currentColor" opacity="0.9" transform="rotate(216 16 16)"/>
        <ellipse cx="16" cy="8" rx="5" ry="8" fill="currentColor" opacity="0.9" transform="rotate(288 16 16)"/>
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.6"/>
      </svg>`,
      `<svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(45 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(90 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(135 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(180 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(225 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(270 16 16)"/>
        <ellipse cx="16" cy="6" rx="4" ry="7" fill="currentColor" opacity="0.85" transform="rotate(315 16 16)"/>
        <circle cx="16" cy="16" r="3.5" fill="currentColor" opacity="0.5"/>
      </svg>`,
      `<svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="14" rx="5" ry="9" fill="currentColor" opacity="0.8" transform="rotate(-20 12 14)"/>
        <ellipse cx="22" cy="12" rx="4.5" ry="8" fill="currentColor" opacity="0.7" transform="rotate(25 22 12)"/>
        <ellipse cx="16" cy="22" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(5 16 22)"/>
      </svg>`,
      `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9"/>
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9" transform="rotate(120 12 12)"/>
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9" transform="rotate(180 12 12)"/>
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9" transform="rotate(240 12 12)"/>
        <ellipse cx="12" cy="5" rx="4" ry="6" fill="currentColor" opacity="0.9" transform="rotate(300 12 12)"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.4"/>
      </svg>`,
    ];

    const FLOWER_COLORS: string[][] = [
      ['var(--gold-light)', 'var(--hot-pink)'],
      ['var(--gold)', '#ffffff'],
      ['var(--hot-pink)', 'var(--blush)'],
      ['var(--gold-light)', 'var(--hot-pink)'],
    ];

    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 150) return;
      if (layer.childElementCount >= 12) return;
      lastSpawnRef.current = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const variation = Math.floor(Math.random() * FLOWER_SVGS.length);
      const palette = FLOWER_COLORS[variation];
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = 20 + Math.random() * 12;
      const startRotation = (Math.random() - 0.5) * 60;
      const targetOpacity = 0.25 + Math.random() * 0.1;

      const flower = document.createElement('span');
      flower.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin-left:${-size / 2}px;margin-top:${-size / 2}px;color:${color};pointer-events:none;will-change:transform,opacity;--start-rotation:${startRotation}deg;--target-opacity:${targetOpacity};animation:flower-bloom 2.5s ease-out forwards;`;
      flower.innerHTML = FLOWER_SVGS[variation];

      flower.addEventListener('animationend', () => flower.remove());
      layer.appendChild(flower);
    };

    container.addEventListener('mousemove', handleMove);
    return () => {
      container.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    <>
      <section
        ref={containerRef}
        className="relative -mt-[100px] flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-[140px] text-center"
        style={{
          background:
            'linear-gradient(135deg, #D4537E 0%, #C44A72 50%, #D4537E 100%)',
          backgroundSize: '200% 200%',
          animation: 'hero-breathe 25s ease-in-out infinite',
        }}
      >
        <FloatingConfessions />
        <div
          ref={trailRef}
          aria-hidden="true"
          className="ambient-motion pointer-events-none absolute inset-0 z-[5] overflow-hidden"
        />

        {doodles.map((d, i) => (
          <span
            key={i}
            ref={(el) => {
              doodleRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: d.cx,
              top: d.cy,
              opacity: 0.1,
              transform: `rotate(${d.baseRotate}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            <svg width={d.size} height={d.size} viewBox={`0 0 ${d.size} ${d.size}`}>
              {d.svg}
            </svg>
          </span>
        ))}

        <div className="relative z-[2] flex flex-col items-center">
        <div
          className="font-scrawl text-gold-light"
          style={{
            fontSize: '26px',
            fontWeight: 600,
            marginBottom: '12px',
            transform: 'rotate(-3deg)',
            animation: 'fade-up 0.8s ease-out 0.2s both',
          }}
        >
          psst... your wedding planning era starts here
        </div>

        <h1
          className="font-serif text-white"
          style={{
            fontSize: 'clamp(56px, 11vw, 130px)',
            fontWeight: 400,
            lineHeight: 0.9,
            marginBottom: '12px',
            animation: 'fade-up 0.8s ease-out 0.4s both',
          }}
        >
          The{' '}
          <i
            style={{
              fontStyle: 'italic',
              display: 'block',
              fontSize: '0.85em',
              color: 'var(--gold-light)',
              fontWeight: 400,
            }}
          >
            Marigold
          </i>
        </h1>

        <div
          className="font-syne uppercase text-white"
          style={{
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '5px',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '28px',
            animation: 'fade-up 0.8s ease-out 0.55s both',
          }}
        >
          where beautiful chaos blooms
        </div>

        <p
          className="font-body"
          style={{
            fontSize: '17px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '480px',
            lineHeight: 1.7,
            marginBottom: '40px',
            animation: 'fade-up 0.8s ease-out 0.65s both',
          }}
        >
          The only wedding platform that{' '}
          <strong style={{ color: 'white', fontWeight: 600 }}>actually gets it.</strong> 582 tasks
          across 13 planning phases. Vendor moodboards. AI-powered briefs. A shagun pool tracker.
          And yes — a special login for your mom.
        </p>

        <div
          className="flex flex-wrap justify-center gap-4"
          style={{ animation: 'fade-up 0.8s ease-out 0.8s both' }}
        >
          <ChunkyButton variant="white" href="/pricing">
            Start Your Journey
          </ChunkyButton>
          <ChunkyButton variant="outline" href="#features">
            Show Me Everything
          </ChunkyButton>
        </div>

        <p
          className="font-scrawl"
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '32px',
            animation: 'fade-up 0.8s ease-out 1s both',
          }}
        >
          * side effects include texting your florist at 2am and building a Gantt chart for your
          sangeet
        </p>
        </div>
      </section>
      <TornDivider fromColor="var(--pink)" toColor="var(--cream)" />
    </>
  );
}
