// ═══════════════════════════════════════════════════════════════════════════════════
//   Shared template primitives
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Reusable bits the four polished renderers (Jodhpur, Pondicherry, Kolkata,
//   Jaisalmer) all draw from: scroll-fade wrapper, decorative SVG dividers,
//   texture backgrounds, formatters. Keeps every template rendering the same
//   shape (Hero / Story / Events / Travel / RSVP / Gallery / Registry / Footer)
//   without copy-pasting motion + ornament code five times over.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ── Date formatting ──────────────────────────────────────────────

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" },
): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", opts);
}

export function formatDateShort(iso: string): string {
  return formatDate(iso, { month: "short", day: "numeric" });
}

// ── Scroll-triggered fade (respects reduced motion) ──────────────

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── Ornamental dividers ──────────────────────────────────────────

/** Centered diamond with hairlines — used in Jodhpur, Pondicherry. */
export function DiamondDivider({ color, width = 240 }: { color: string; width?: number }) {
  return (
    <div className="flex items-center justify-center gap-3" style={{ color }}>
      <span style={{ display: "inline-block", height: 1, width, background: color, opacity: 0.35 }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 0 L14 7 L7 14 L0 7 Z" stroke={color} strokeWidth="1" />
        <circle cx="7" cy="7" r="1.5" fill={color} />
      </svg>
      <span style={{ display: "inline-block", height: 1, width, background: color, opacity: 0.35 }} />
    </div>
  );
}

/** Floral medallion — Pondicherry's botanical accent. */
export function FloralDivider({ color, width = 200 }: { color: string; width?: number }) {
  return (
    <div className="flex items-center justify-center gap-4" style={{ color }}>
      <span style={{ display: "inline-block", height: 1, width, background: color, opacity: 0.4 }} />
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden>
        <path
          d="M16 2 C 12 6, 8 8, 4 10 C 8 12, 12 14, 16 18 C 20 14, 24 12, 28 10 C 24 8, 20 6, 16 2 Z"
          stroke={color}
          strokeWidth="0.8"
          fill="none"
          opacity="0.7"
        />
        <circle cx="16" cy="10" r="1.6" fill={color} />
      </svg>
      <span style={{ display: "inline-block", height: 1, width, background: color, opacity: 0.4 }} />
    </div>
  );
}

/** Heavy editorial rule with serif glyph — Kolkata. */
export function InkRule({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3" style={{ color }}>
      <span style={{ display: "inline-block", height: 2, width: 56, background: color }} />
      <span
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        ❦
      </span>
      <span style={{ display: "inline-block", height: 2, width: 56, background: color }} />
    </div>
  );
}

/** Jaali geometric repeat — Jaisalmer. */
export function JaaliDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-1" style={{ color }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 1 L17 9 L9 17 L1 9 Z M9 4 L14 9 L9 14 L4 9 Z"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            opacity={i % 2 === 0 ? 0.85 : 0.45}
          />
        </svg>
      ))}
    </div>
  );
}

// ── Texture backgrounds (SVG noise / patterns) ───────────────────

/** Soft marble veining for Jodhpur cream sections. */
export const MARBLE_BG: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.82  0 0 0 0 0.74  0 0 0 0.06 0'/></filter><rect width='600' height='600' filter='url(%23m)'/></svg>\")",
  backgroundSize: "600px 600px",
};

/** Linen weave for Pondicherry warm cream. */
export const LINEN_BG: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='l'><feTurbulence type='turbulence' baseFrequency='0.85' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0.7  0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0.05 0'/></filter><rect width='240' height='240' filter='url(%23l)'/></svg>\")",
  backgroundSize: "240px 240px",
};

/** Newsprint grain for Kolkata cream. */
export const NEWSPRINT_BG: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1' seed='2'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0.07 0'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>\")",
  backgroundSize: "180px 180px",
};

/** Fine sandstone grain for Jaisalmer. */
export const SANDSTONE_BG: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' seed='6'/><feColorMatrix values='0 0 0 0 0.84  0 0 0 0 0.66  0 0 0 0 0.36  0 0 0 0.08 0'/></filter><rect width='320' height='320' filter='url(%23s)'/></svg>\")",
  backgroundSize: "320px 320px",
};

// ── Eyebrow label ────────────────────────────────────────────────

export function Eyebrow({
  children,
  color,
  fontFamily,
  align = "left",
}: {
  children: ReactNode;
  color: string;
  fontFamily?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        fontFamily: fontFamily ?? '"Outfit", sans-serif',
        fontSize: 11,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color,
        opacity: 0.85,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
}

// ── Photo placeholder (for gallery / hero when no upload) ────────

export function PhotoPlaceholder({
  aspect = "4 / 5",
  label,
  tint,
  inkOnDark = "#FAF7F2",
}: {
  aspect?: string;
  label?: string;
  tint: string;
  inkOnDark?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        background: `linear-gradient(160deg, ${tint}E6 0%, ${tint}99 60%, ${tint}66 100%)`,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
        aria-hidden
      >
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.4" fill={inkOnDark} />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dotgrid)" />
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: inkOnDark,
            opacity: 0.55,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ── Hex color helpers ────────────────────────────────────────────

/** Append an alpha hex (e.g. "33") to a 6-digit hex color. */
export function alpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}

/** Relative-luminance check for choosing legible text on a background. */
export function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.6;
}
