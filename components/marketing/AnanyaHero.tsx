"use client";

// ── AnanyaHero ────────────────────────────────────────────────────────────
// Dense mood-board collage. 17 warm-toned plates authored by hand — a mix
// of small squares, tall portraits, and wide landscapes — positioned with
// percentages so the composition stays proportionally consistent across
// viewport widths. Four pairs deliberately overlap (with heavier shadows
// + higher z-index) so the layering reads as intentional depth, not a bug.
// A soft ivory radial wash feathered in the center keeps the headline
// readable without a hard cutout. Placeholder colored rectangles only —
// no stock photos, per spec.

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

const HEADLINE = "'Cormorant Garamond', Georgia, serif";
const BODY = "'Inter', system-ui, sans-serif";

const C = {
  ivory: "#FAF9F6",
  ivoryWarm: "#FFFFF0",
  champagne: "#D4C5B2",
  gold: "#B8976A",
  charcoal: "#2C2C2C",
  brown: "#8B6F5C",
};

type TileSize = "S" | "P" | "L"; // Square / Portrait / Landscape
type Tile = {
  id: string;
  label: string;
  size: TileSize;
  x: number; // % from left of hero
  y: number; // % from top of hero
  color: string;
  photo?: string; // real wedding photo URL
  dx: number; // px offset X (jitter)
  dy: number; // px offset Y (jitter)
  r: number; // rotation deg
  z: number; // base z-index
  over?: boolean; // renders with heavier shadow — the "stacked on top" plate
};

// Size tokens. Widths clamp-scale so the composition holds from ~1200px up
// to ultrawide; aspect-ratio controls the shape.
const SIZE: Record<TileSize, React.CSSProperties> = {
  S: { width: "clamp(130px, 13vw, 210px)", aspectRatio: "1 / 1" },
  P: { width: "clamp(140px, 13vw, 220px)", aspectRatio: "3 / 4" },
  L: { width: "clamp(220px, 22vw, 360px)", aspectRatio: "5 / 3" },
};

// Desktop collage — 17 plates, distributed along edges/corners so the
// center stays open for the headline. Four intentional overlaps:
// mehndi×baraat, dupatta×bridal, entry×pheras, varmala×firstlook.
const TILES: Tile[] = [
  // ── Top band ─────────────────────────────────────────────────────────
  { id: "mehndi",    label: "Mehndi",         size: "S", x: 3,  y: 5,  color: "#A0755A", photo: "/wedding-photos/mehndi/mehndi-01.jpg",          dx: -6, dy: -4, r: 0,    z: 5, over: true },
  { id: "baraat",    label: "The Baraat",     size: "P", x: 14, y: 2,  color: "#B8976A", photo: "/wedding-photos/baraat/baraat-01.jpg",           dx: 4,  dy: -8, r: 0,    z: 3 },
  { id: "mandap",    label: "Floral Mandap",  size: "S", x: 42, y: 3,  color: "#8B6F5C", photo: "/wedding-photos/usa-decor/usa-decor-001.jpg",    dx: -5, dy: 6,  r: 1.5,  z: 2 },
  { id: "sangeet",   label: "Sangeet Night",  size: "S", x: 72, y: 4,  color: "#C4A882", photo: "/wedding-photos/sangeet/sangeet-01.jpg",         dx: 3,  dy: -5, r: 0,    z: 4 },
  { id: "bridal",    label: "Bridal Details", size: "P", x: 85, y: 3,  color: "#C2A6A1", photo: "/wedding-photos/portrait/portrait-01.jpg",       dx: -4, dy: 8,  r: 0,    z: 2 },
  { id: "dupatta",   label: "Dupatta",        size: "S", x: 82, y: 4,  color: "#D4B5A0", photo: "/wedding-photos/new/new-01.jpg",                 dx: -3, dy: 7,  r: 0,    z: 6, over: true },

  // ── Upper-mid band ───────────────────────────────────────────────────
  { id: "ceremony",  label: "Ceremony",       size: "L", x: 3,  y: 25, color: "#CBBBA8", photo: "/wedding-photos/wedding/wedding-01.jpg",         dx: 6,  dy: -3, r: 0,    z: 3 },
  { id: "brass",     label: "Brass & Bloom",  size: "L", x: 75, y: 24, color: "#D4B5A0", photo: "/wedding-photos/usa-decor/usa-decor-005.jpg",    dx: -7, dy: 4,  r: -1.2, z: 3 },

  // ── Mid band ─────────────────────────────────────────────────────────
  { id: "jaimala",   label: "Jaimala",        size: "S", x: 4,  y: 44, color: "#B5B8A3", photo: "/wedding-photos/best/best-01.jpg",               dx: 4,  dy: 5,  r: 0,    z: 2 },
  { id: "haldi",     label: "Haldi",          size: "P", x: 17, y: 42, color: "#B8976A", photo: "/wedding-photos/haldi/haldi-01.jpg",             dx: -3, dy: -6, r: 0,    z: 3 },
  { id: "reception", label: "Reception",      size: "P", x: 73, y: 42, color: "#8B6F5C", photo: "/wedding-photos/usa-decor/usa-decor-026.jpg",    dx: 5,  dy: 4,  r: 0,    z: 3 },
  { id: "decor",     label: "Decor",          size: "S", x: 86, y: 44, color: "#D4C5B2", photo: "/wedding-photos/usa-decor/usa-decor-010.jpg",    dx: -4, dy: -8, r: 1,    z: 4 },

  // ── Bottom band ──────────────────────────────────────────────────────
  { id: "pheras",    label: "Pheras",         size: "L", x: 3,  y: 73, color: "#A0755A", photo: "/wedding-photos/wedding/wedding-04.jpg",         dx: 7,  dy: 3,  r: 0,    z: 3 },
  { id: "entry",     label: "Bridal Entry",   size: "S", x: 22, y: 70, color: "#C2A6A1", photo: "/wedding-photos/best/best-03.jpg",               dx: -6, dy: -4, r: 0,    z: 5, over: true },
  { id: "cocktail",  label: "Cocktail Hour",  size: "S", x: 44, y: 74, color: "#E8DDD3", photo: "/wedding-photos/usa-portrait/usa-portrait-001.jpg", dx: 3, dy: -6, r: 0,  z: 2 },
  { id: "firstlook", label: "First Look",     size: "L", x: 60, y: 74, color: "#CBBBA8", photo: "/wedding-photos/portrait/portrait-06.jpg",       dx: -5, dy: 6,  r: 0,    z: 3 },
  { id: "varmala",   label: "Varmala",        size: "S", x: 82, y: 68, color: "#C4A882", photo: "/wedding-photos/best/best-05.jpg",               dx: 4,  dy: -3, r: -1.5, z: 6, over: true },
];

// Mobile keeps just enough tiles to feel like a collage without clutter.
const MOBILE_IDS = ["mehndi", "baraat", "sangeet", "haldi", "firstlook", "varmala"];

export function AnanyaHero() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const user = useAuthStore((s) => s.user);

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{
        backgroundColor: C.ivory,
        minHeight: "94vh",
      }}
    >
      {/* ── Desktop collage (absolute-positioned) ───────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {TILES.map((t) => (
          <CollageTile
            key={t.id}
            tile={t}
            activeId={activeId}
            setActiveId={setActiveId}
          />
        ))}
      </div>

      {/* ── Mobile collage (simplified 2×3 grid with light jitter) ──── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid md:hidden"
        style={{
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: "10px",
          padding: "14px 14px 90px",
        }}
      >
        {TILES.filter((t) => MOBILE_IDS.includes(t.id)).map((t, i) => (
          <div
            key={t.id}
            className="pointer-events-auto relative overflow-hidden"
            onMouseEnter={() => setActiveId(t.id)}
            onMouseLeave={() => setActiveId(null)}
            style={{
              backgroundColor: t.color,
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: 2,
              transform: `rotate(${i === 1 || i === 4 ? (i === 1 ? -1 : 1) : 0}deg)`,
              opacity: activeId && activeId !== t.id ? 0.5 : activeId === t.id ? 1 : 0.82,
              filter: activeId === t.id ? "saturate(1)" : "saturate(0.75)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {t.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo} alt={t.label} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
          </div>
        ))}
      </div>

      {/* ── Feathered center wash ───────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 52% 58% at 50% 50%, rgba(250,249,246,0.94) 0%, rgba(250,249,246,0.82) 40%, rgba(250,249,246,0.35) 72%, rgba(250,249,246,0) 100%)",
        }}
      />

      {/* ── Top wash for nav legibility ─────────────────────────────── */}
      {/* Gives the shared <Nav> a soft ivory backdrop while it's at its
          transparent top-of-page state — nav itself sits at z-50 above. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-28"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250,249,246,0.78) 0%, rgba(250,249,246,0.48) 55%, rgba(250,249,246,0) 100%)",
        }}
      />

      {/* ── Headline ────────────────────────────────────────────────── */}
      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1100px] px-6 text-center md:px-12">
        <div className="pointer-events-auto mx-auto flex flex-col items-center gap-7 py-12 md:gap-9 md:py-16">
          <span
            className="uppercase"
            style={{
              fontFamily: HEADLINE,
              fontSize: 12,
              letterSpacing: "0.3em",
              color: C.gold,
              fontWeight: 500,
            }}
          >
            Dallas — Fort Worth · Launching 2026
          </span>

          <h1
            style={{
              fontFamily: HEADLINE,
              fontSize: "clamp(44px, 6.6vw, 78px)",
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
              color: C.charcoal,
              fontWeight: 400,
              margin: 0,
            }}
          >
            <span className="block">Every detail.</span>
            <span
              className="block"
              style={{ fontStyle: "italic", color: C.gold, fontWeight: 400 }}
            >
              Every emotion.
            </span>
            <span className="block">Orchestrated.</span>
          </h1>

          <p
            className="mx-auto"
            style={{
              fontFamily: BODY,
              fontSize: 17,
              lineHeight: 1.6,
              color: C.charcoal,
              fontWeight: 300,
              margin: 0,
              maxWidth: 480,
            }}
          >
            The planning atelier and curated marketplace for modern Indian weddings.
          </p>

          <div className="mt-2 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <Link
              href="/marketplace"
              className="hero-cta-primary inline-flex items-center"
              style={{
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                backgroundColor: C.charcoal,
                color: C.ivoryWarm,
                padding: "16px 36px",
                borderRadius: 0,
                transition:
                  "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              Explore Vendors
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="hero-cta-link group inline-flex items-center gap-2"
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  color: C.charcoal,
                  textTransform: "uppercase",
                }}
              >
                <span className="hero-cta-underline relative">Your dashboard</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openSignUp("planning-tool")}
                className="hero-cta-link group inline-flex items-center gap-2"
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  color: C.charcoal,
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span className="hero-cta-underline relative">Join the Waitlist</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
        style={{ animation: "ananyaHeroBounce 2.4s ease-in-out infinite" }}
      >
        <div className="flex flex-col items-center gap-2" style={{ color: C.gold, opacity: 0.85 }}>
          <span
            className="uppercase"
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: "0.36em",
              fontWeight: 500,
            }}
          >
            Scroll
          </span>
          <span
            aria-hidden
            style={{
              display: "block",
              width: 1,
              height: 22,
              backgroundColor: "currentColor",
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes ananyaHeroBounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 4px); }
        }
        .hero-cta-primary:hover {
          transform: translateY(-2px);
          background-color: ${C.brown} !important;
          box-shadow: 0 14px 30px rgba(44, 28, 16, 0.18);
        }
        .hero-cta-underline::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 1px;
          background-color: currentColor;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-cta-link:hover .hero-cta-underline::after {
          transform: scaleX(1);
        }
      `}</style>
    </section>
  );
}

// ── A single collage tile ──────────────────────────────────────────────────
// Handlers + transform live on the same element so the hit area follows the
// visual (translate + rotate move both). z-index lifts on hover so the
// active plate stacks cleanly above its overlapping neighbours.
function CollageTile({
  tile,
  activeId,
  setActiveId,
}: {
  tile: Tile;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const isActive = activeId === tile.id;
  const isDimmed = activeId !== null && !isActive;
  const size = SIZE[tile.size];

  return (
    <div
      className="pointer-events-auto absolute overflow-hidden"
      onMouseEnter={() => setActiveId(tile.id)}
      onMouseLeave={() => setActiveId(null)}
      style={{
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        ...size,
        backgroundColor: tile.color,
        border: "1px solid rgba(0, 0, 0, 0.05)",
        borderRadius: 2,
        transform: `translate(${tile.dx}px, ${tile.dy}px) rotate(${tile.r}deg) scale(${isActive ? 1.03 : 1})`,
        transformOrigin: "center center",
        zIndex: isActive ? 30 : tile.z,
        opacity: isDimmed ? 0.5 : isActive ? 1 : 0.8,
        filter: isActive ? "saturate(1)" : "saturate(0.75)",
        boxShadow: tile.over
          ? isActive
            ? "0 10px 28px rgba(0, 0, 0, 0.18)"
            : "0 4px 20px rgba(0, 0, 0, 0.10)"
          : isActive
            ? "0 8px 24px rgba(0, 0, 0, 0.14)"
            : "0 2px 10px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.3s ease, opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease",
        cursor: "default",
      }}
    >
      {tile.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tile.photo}
          alt={tile.label}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <span
        className="absolute inset-0 flex select-none items-center justify-center uppercase"
        style={{
          fontFamily: HEADLINE,
          fontSize: 11,
          letterSpacing: "2px",
          fontWeight: 500,
          color: "#FFFFFF",
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.4s ease",
          textShadow: "0 1px 8px rgba(0, 0, 0, 0.55)",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {tile.label}
      </span>
    </div>
  );
}
