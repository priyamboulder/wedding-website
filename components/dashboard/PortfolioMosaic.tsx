"use client";

// Editorial photo mosaic shown at the bottom of the dashboard.
// Asymmetric grid layout: one tall hero on the left, 4 smaller frames on the
// right — then a second row of 4 equal tiles. Uses the full portfolio spread
// so every ceremony category is represented.

const MOSAIC_ROWS: { src: string; label: string }[][] = [
  // Row 1 — hero + 4 (rendered as CSS grid: 2 cols, hero spans 2 rows)
  [
    { src: "/images/portfolio/wedding/wedding-04.jpg",      label: "Wedding" },
    { src: "/images/portfolio/portrait/portrait-04.jpg",    label: "Portrait" },
    { src: "/images/portfolio/sangeet/sangeet-03.jpg",      label: "Sangeet" },
    { src: "/images/portfolio/haldi/haldi-03.jpg",          label: "Haldi" },
    { src: "/images/portfolio/baraat/baraat-02.jpg",        label: "Baraat" },
  ],
  // Row 2 — 4 equal tiles
  [
    { src: "/images/portfolio/mehendi/mehendi-02.jpg",      label: "Mehendi" },
    { src: "/images/portfolio/pre-wedding/pre-03.jpg",      label: "Pre-Wedding" },
    { src: "/images/portfolio/best/best-03.jpg",            label: "Best" },
    { src: "/images/portfolio/portrait/portrait-05.jpg",    label: "Portrait" },
  ],
  // Row 3 — 5 equal tiles
  [
    { src: "/images/portfolio/wedding/wedding-05.jpg",      label: "Wedding" },
    { src: "/images/portfolio/best/best-07.jpg",            label: "Best" },
    { src: "/images/portfolio/sangeet/sangeet-04.jpg",      label: "Sangeet" },
    { src: "/images/portfolio/haldi/haldi-04.jpg",          label: "Haldi" },
    { src: "/images/portfolio/best/best-11.jpg",            label: "Best" },
  ],
];

export function PortfolioMosaic() {
  return (
    <section className="mt-16 pb-8">
      <h2
        className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Our work
      </h2>

      {/* Hero + 4 grid */}
      <div className="grid h-[420px] grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-1.5">
        {/* Hero — spans 2 rows */}
        <div className="group relative row-span-2 overflow-hidden bg-[#c8b8a8]">
          <img
            src={MOSAIC_ROWS[0][0].src}
            alt={MOSAIC_ROWS[0][0].label}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/70"
            style={{ fontFamily: "var(--font-mono)" }}>
            {MOSAIC_ROWS[0][0].label}
          </span>
        </div>
        {/* 4 right tiles */}
        {MOSAIC_ROWS[0].slice(1).map((item) => (
          <div key={item.src} className="group relative overflow-hidden bg-[#c8b8a8]">
            <img
              src={item.src}
              alt={item.label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <span className="absolute bottom-2 left-3 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70"
              style={{ fontFamily: "var(--font-mono)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Equal 4-tile row */}
      <div className="mt-1.5 grid h-[200px] grid-cols-4 gap-1.5">
        {MOSAIC_ROWS[1].map((item) => (
          <div key={item.src} className="group relative overflow-hidden bg-[#c8b8a8]">
            <img
              src={item.src}
              alt={item.label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <span className="absolute bottom-2 left-3 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70"
              style={{ fontFamily: "var(--font-mono)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Equal 5-tile row */}
      <div className="mt-1.5 grid h-[180px] grid-cols-5 gap-1.5">
        {MOSAIC_ROWS[2].map((item) => (
          <div key={item.src} className="group relative overflow-hidden bg-[#c8b8a8]">
            <img
              src={item.src}
              alt={item.label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <span className="absolute bottom-2 left-3 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70"
              style={{ fontFamily: "var(--font-mono)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
