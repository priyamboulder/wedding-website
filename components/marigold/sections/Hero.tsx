'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TornDivider } from '@/components/marigold/ui/TornDivider';

type GuestCount = 'under-150' | '150-300' | '300-500' | '500-plus';
type Vibe = 'palace' | 'modern' | 'beach' | 'garden';
type Budget = 'under-100k' | '100-250k' | '250-500k' | '500k-plus';

const GUEST_OPTIONS: { value: GuestCount; label: string }[] = [
  { value: 'under-150', label: 'Under 150' },
  { value: '150-300', label: '150–300' },
  { value: '300-500', label: '300–500' },
  { value: '500-plus', label: '500+' },
];

const VIBE_OPTIONS: { value: Vibe; label: string }[] = [
  { value: 'palace', label: 'Palace & Grandeur' },
  { value: 'modern', label: 'Modern & Minimal' },
  { value: 'beach', label: 'Beach & Tropical' },
  { value: 'garden', label: 'Garden & Outdoor' },
];

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: 'under-100k', label: 'Under $100K' },
  { value: '100-250k', label: '$100–250K' },
  { value: '250-500k', label: '$250–500K' },
  { value: '500k-plus', label: '$500K+' },
];

type FlankImage = {
  src: string;
  alt: string;
  width: number;
  rotate: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  z: number;
};

const UNSPLASH = (id: string, w = 520) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const LEFT_IMAGES: FlankImage[] = [
  {
    src: UNSPLASH('photo-1604017011826-d3b4c23f8914'),
    alt: 'Bridal mehendi henna hands',
    width: 270,
    rotate: -3,
    top: '11%',
    left: '3%',
    z: 2,
  },
  {
    src: UNSPLASH('photo-1583391733956-3750e0ff4e8b'),
    alt: 'Indian bride in red lehenga',
    width: 130,
    rotate: 5,
    top: '48%',
    left: '21%',
    z: 1,
  },
  {
    src: UNSPLASH('photo-1583939411023-14783179e581'),
    alt: 'Indian mandap ceremony at a palace',
    width: 180,
    rotate: -7,
    bottom: '11%',
    left: '6%',
    z: 2,
  },
];

const RIGHT_IMAGES: FlankImage[] = [
  {
    src: UNSPLASH('photo-1610440042657-612c34d95e9f'),
    alt: 'Marigold floral wedding decoration',
    width: 210,
    rotate: 5,
    top: '14%',
    right: '3%',
    z: 2,
  },
  {
    src: UNSPLASH('photo-1597994292881-4d68e10c6b5a'),
    alt: 'Indian bride in red and gold lehenga',
    width: 230,
    rotate: -4,
    top: '46%',
    right: '-2%',
    z: 1,
  },
  {
    src: UNSPLASH('photo-1583916055728-9aacd1b4eef9'),
    alt: 'Indian wedding reception table decor',
    width: 190,
    rotate: 3,
    bottom: '14%',
    right: '5%',
    z: 2,
  },
];

const PREVIEW_DESTINATIONS: {
  name: string;
  thumb: string;
  alt: string;
  range: string;
  peak: string;
}[] = [
  {
    name: 'Udaipur',
    thumb: UNSPLASH('photo-1583939411023-14783179e581', 280),
    alt: 'Udaipur',
    range: '$150K–$400K',
    peak: 'Peak: Oct–Mar',
  },
  {
    name: 'Cancún',
    thumb: UNSPLASH('photo-1519741497674-611481863552', 280),
    alt: 'Cancún',
    range: '$80K–$200K',
    peak: 'Peak: Nov–Apr',
  },
  {
    name: 'Hudson Valley',
    thumb: UNSPLASH('photo-1464366400600-7168b8af9bc3', 280),
    alt: 'Hudson Valley',
    range: '$120K–$300K',
    peak: 'Peak: May–Oct',
  },
];

export function MarigoldHero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const lastSpawnRef = useRef(0);
  const router = useRouter();

  const [guests, setGuests] = useState<GuestCount | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);

  const destinationsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (guests) params.set('guests', guests);
    if (vibe) params.set('vibe', vibe);
    if (budget) params.set('budget', budget);
    const qs = params.toString();
    return qs ? `/tools/destinations?${qs}` : '/tools/destinations';
  }, [guests, vibe, budget]);

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

    const FLOWER_COLORS = ['var(--gold-light)', 'var(--gold)', '#ffffff'];

    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 180) return;
      if (layer.childElementCount >= 8) return;
      lastSpawnRef.current = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const variation = Math.floor(Math.random() * FLOWER_SVGS.length);
      const color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      const size = 18 + Math.random() * 10;
      const startRotation = (Math.random() - 0.5) * 60;
      const targetOpacity = 0.22 + Math.random() * 0.08;

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(destinationsHref);
  };

  return (
    <>
      <section
        ref={containerRef}
        id="marigold-hero"
        className="hero-section relative -mt-[100px] flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-[120px] text-center"
        style={{
          background:
            'linear-gradient(135deg, #D4537E 0%, #C44A72 50%, #D4537E 100%)',
          backgroundSize: '200% 200%',
          animation: 'hero-breathe 25s ease-in-out infinite',
        }}
      >
        <div
          ref={trailRef}
          aria-hidden="true"
          className="ambient-motion pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        />

        <FlankImages images={LEFT_IMAGES} side="left" />
        <FlankImages images={RIGHT_IMAGES} side="right" />

        <div className="relative z-[3] flex w-full max-w-[860px] flex-col items-center">
          <div
            className="hero-brand-line"
            style={{
              marginBottom: '18px',
              animation: 'fade-up 0.8s ease-out 0.15s both',
            }}
          >
            <span className="hero-brand-mark">The Marigold</span>
            <span aria-hidden="true" className="hero-brand-divider">✦</span>
            <span className="hero-brand-tag">Indian Wedding Planning</span>
          </div>

          <h1
            className="font-display"
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontSize: 'clamp(42px, 7vw, 86px)',
              fontWeight: 500,
              lineHeight: 1.04,
              color: '#FFF8F2',
              marginBottom: '16px',
              letterSpacing: '-0.5px',
              animation: 'fade-up 0.8s ease-out 0.3s both',
            }}
          >
            Where should you{' '}
            <i style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>
              actually
            </i>{' '}
            get married?
          </h1>

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(15px, 1.5vw, 17px)',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.88)',
              maxWidth: '560px',
              marginBottom: '32px',
              animation: 'fade-up 0.8s ease-out 0.45s both',
            }}
          >
            300 guests. 4 ceremonies. 1 location that can handle all of it.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              width: '100%',
              maxWidth: '760px',
              animation: 'fade-up 0.8s ease-out 0.6s both',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '14px',
                gridTemplateColumns: '1fr',
                marginBottom: '22px',
              }}
              className="hero-explorer-grid"
            >
              <SelectorGroup
                label="Guest count"
                options={GUEST_OPTIONS}
                value={guests}
                onChange={setGuests}
              />
              <SelectorGroup
                label="Vibe"
                options={VIBE_OPTIONS}
                value={vibe}
                onChange={setVibe}
              />
              <SelectorGroup
                label="Budget range"
                options={BUDGET_OPTIONS}
                value={budget}
                onChange={setBudget}
              />
            </div>

            <PreviewStrip />

            <button type="submit" className="hero-cta">
              Show me destinations
              <span aria-hidden="true" className="hero-cta-arrow">→</span>
            </button>
          </form>

          <Link href="/brief" className="hero-secondary-cta">
            <span aria-hidden="true" className="hero-secondary-icon">✦</span>
            <span>or start with The Brief — our 2-minute planning quiz</span>
            <span aria-hidden="true" className="hero-secondary-arrow">→</span>
          </Link>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .hero-explorer-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }

          /* ── Brand line ─────────────────────────────────────── */
          .hero-brand-line {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            line-height: 1;
          }
          .hero-brand-mark {
            font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
            font-style: italic;
            font-weight: 500;
            font-size: 19px;
            letter-spacing: 0.3px;
            color: #FFF8F2;
          }
          .hero-brand-divider {
            color: var(--gold-light);
            font-size: 12px;
            opacity: 0.85;
            transform: translateY(-1px);
          }
          .hero-brand-tag {
            font-family: 'Outfit', sans-serif;
            font-size: 10.5px;
            font-weight: 600;
            letter-spacing: 3.5px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.72);
          }

          /* ── Primary CTA ────────────────────────────────────── */
          .hero-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            padding: 22px 60px;
            background: var(--cream);
            color: var(--wine);
            font-family: 'Outfit', sans-serif;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 3.2px;
            text-transform: uppercase;
            border: 1px solid rgba(75, 21, 40, 0.18);
            border-radius: 0;
            cursor: pointer;
            box-shadow:
              0 16px 36px rgba(75, 21, 40, 0.22),
              0 0 32px rgba(245, 230, 200, 0.38),
              0 1px 0 rgba(255, 255, 255, 0.7) inset;
            transition: transform 0.18s ease, box-shadow 0.22s ease,
              background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
          }
          .hero-cta:hover {
            transform: translateY(-1px);
            background: var(--wine);
            color: var(--cream);
            border-color: var(--wine);
            box-shadow:
              0 22px 46px rgba(75, 21, 40, 0.36),
              0 0 44px rgba(245, 230, 200, 0.55),
              0 0 0 1px rgba(245, 230, 200, 0.25) inset;
          }
          .hero-cta-arrow {
            font-size: 17px;
            transition: transform 0.22s ease;
          }
          .hero-cta:hover .hero-cta-arrow {
            transform: translateX(3px);
          }

          /* ── Secondary CTA pill ─────────────────────────────── */
          .hero-secondary-cta {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 18px;
            padding: 9px 18px;
            font-family: 'Outfit', sans-serif;
            font-size: 13.5px;
            font-weight: 500;
            letter-spacing: 0.2px;
            color: rgba(255, 248, 242, 0.92);
            background: rgba(255, 248, 242, 0.08);
            border: 1px solid rgba(255, 248, 242, 0.32);
            border-radius: 999px;
            text-decoration: none;
            transition: background 0.18s ease, border-color 0.18s ease,
              color 0.18s ease;
            animation: fade-up 0.8s ease-out 0.75s both;
          }
          .hero-secondary-cta:hover {
            background: rgba(255, 248, 242, 0.16);
            border-color: rgba(255, 248, 242, 0.55);
            color: #FFF8F2;
          }
          .hero-secondary-icon {
            color: var(--gold-light);
            font-size: 12px;
          }
          .hero-secondary-arrow {
            font-size: 14px;
            opacity: 0.75;
            transition: transform 0.18s ease;
          }
          .hero-secondary-cta:hover .hero-secondary-arrow {
            transform: translateX(2px);
          }

          /* ── Flank images (polaroid moodboard) ──────────────── */
          .hero-flank {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 2;
            overflow: hidden;
            display: none;
          }
          @media (min-width: 1024px) {
            .hero-flank { display: block; }
          }
          .hero-polaroid {
            position: absolute;
            padding: 8px 8px 22px 8px;
            background: rgba(255, 248, 242, 0.96);
            box-shadow:
              0 18px 38px rgba(75, 21, 40, 0.28),
              0 2px 8px rgba(75, 21, 40, 0.14);
            transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            will-change: transform;
            animation: hero-flank-in 1.1s ease-out 0.2s both;
          }
          .hero-polaroid::after {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 22px;
            background: linear-gradient(
              135deg,
              rgba(212, 83, 126, 0.20) 0%,
              rgba(196, 74, 114, 0.16) 100%
            );
            mix-blend-mode: multiply;
            pointer-events: none;
          }
          .hero-polaroid img {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 4 / 5;
            object-fit: cover;
            filter: saturate(0.68) sepia(0.06) brightness(0.97);
          }
          @keyframes hero-flank-in {
            from { opacity: 0; transform: translateY(20px) rotate(0deg) scale(0.96); }
            to   { opacity: 1; }
          }

          /* ── Preview strip ──────────────────────────────────── */
          .hero-preview-strip {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
            animation: fade-up 0.8s ease-out 0.7s both;
          }
          .hero-preview-card {
            width: 178px;
            background: rgba(255, 248, 242, 0.82);
            border: 1px solid rgba(75, 21, 40, 0.14);
            padding: 6px 6px 10px 6px;
            text-align: left;
            backdrop-filter: blur(2px);
            transition: transform 0.2s ease, background 0.2s ease,
              border-color 0.2s ease;
          }
          .hero-preview-card:hover {
            transform: translateY(-2px);
            background: rgba(255, 248, 242, 0.94);
            border-color: rgba(75, 21, 40, 0.28);
          }
          .hero-preview-thumb {
            width: 100%;
            height: 96px;
            object-fit: cover;
            display: block;
            filter: saturate(0.85);
          }
          .hero-preview-name {
            font-family: 'Outfit', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: var(--wine);
            margin-top: 8px;
            padding: 0 4px;
            letter-spacing: 0.1px;
          }
          .hero-preview-meta {
            font-family: 'Outfit', sans-serif;
            font-size: 10.5px;
            font-weight: 500;
            color: rgba(75, 21, 40, 0.7);
            margin-top: 3px;
            padding: 0 4px;
            letter-spacing: 0.2px;
          }
          @media (max-width: 640px) {
            .hero-preview-strip { display: none; }
          }
          @media (min-width: 641px) and (max-width: 860px) {
            .hero-preview-card:nth-child(3) { display: none; }
          }
        `}</style>
      </section>
      <TornDivider fromColor="var(--pink)" toColor="var(--cream)" />
    </>
  );
}

function FlankImages({
  images,
  side,
}: {
  images: FlankImage[];
  side: 'left' | 'right';
}) {
  return (
    <div className="hero-flank" aria-hidden="true" data-side={side}>
      {images.map((img, i) => {
        const positionStyle: React.CSSProperties = {
          width: img.width,
          transform: `rotate(${img.rotate}deg)`,
          zIndex: img.z,
          animationDelay: `${0.2 + i * 0.12}s`,
        };
        if (img.top) positionStyle.top = img.top;
        if (img.bottom) positionStyle.bottom = img.bottom;
        if (img.left) positionStyle.left = img.left;
        if (img.right) positionStyle.right = img.right;

        return (
          <div key={i} className="hero-polaroid" style={positionStyle}>
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        );
      })}
    </div>
  );
}

function PreviewStrip() {
  return (
    <div className="hero-preview-strip" role="presentation">
      {PREVIEW_DESTINATIONS.map((d) => (
        <div key={d.name} className="hero-preview-card">
          <img
            src={d.thumb}
            alt={d.alt}
            loading="lazy"
            className="hero-preview-thumb"
          />
          <div className="hero-preview-name">{d.name}</div>
          <div className="hero-preview-meta">
            {d.range} · {d.peak}
          </div>
        </div>
      ))}
    </div>
  );
}

type SelectorGroupProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
};

function SelectorGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: SelectorGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.78)',
          textAlign: 'left',
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              style={{
                flex: '1 1 auto',
                minWidth: 'fit-content',
                padding: '10px 14px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                fontWeight: selected ? 600 : 500,
                letterSpacing: '0.2px',
                color: 'var(--wine)',
                background: selected
                  ? 'var(--gold-light)'
                  : 'rgba(255, 248, 242, 0.88)',
                border: selected
                  ? '1px solid rgba(75, 21, 40, 0.45)'
                  : '1px solid rgba(75, 21, 40, 0.16)',
                borderRadius: 0,
                cursor: 'pointer',
                transition:
                  'background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: selected
                  ? '0 2px 6px rgba(75, 21, 40, 0.10)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = 'rgba(255, 248, 242, 1)';
                  e.currentTarget.style.borderColor = 'rgba(75, 21, 40, 0.32)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = 'rgba(255, 248, 242, 0.88)';
                  e.currentTarget.style.borderColor = 'rgba(75, 21, 40, 0.16)';
                }
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
