// ═══════════════════════════════════════════════════════════════════════════════════
//   Jaisalmer — Destination / Desert palace
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Sandstone gold and desert dusk. Wide cinematic hero, warm golden-hour
//   gradient, sandstone grain, geometric Rajasthani jaali borders. Expansive,
//   warm, adventurous — the golden hour of a desert palace wedding.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import type { CSSProperties } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import {
  Eyebrow,
  FadeIn,
  JaaliDivider,
  PhotoPlaceholder,
  SANDSTONE_BG,
  alpha,
  formatDate,
  formatDateShort,
} from "./_shared";

const PALETTE = {
  sand: "#F2DEB7",
  sandDeep: "#E2C081",
  gold: "#D4A95E",
  goldDeep: "#B0843A",
  rust: "#A05A28",
  dusk: "#2E3A5C",
  duskDeep: "#1B2240",
  ink: "#3A2E1A",
} as const;

const DISPLAY = '"Cormorant Garamond", "DM Serif Display", Georgia, serif';
const BODY = '"Outfit", "Inter", system-ui, sans-serif';

export default function JaisalmerTemplate({ content, brand, device, mode }: TemplateRenderProps) {
  const compact = device === "mobile";
  const dateLong = formatDate(content.weddingDate);
  const accent = brand.accent || PALETTE.gold;

  const cssVars: CSSProperties = {
    ["--js-sand" as string]: PALETTE.sand,
    ["--js-gold" as string]: accent,
    ["--js-dusk" as string]: PALETTE.dusk,
  };

  return (
    <div
      style={{
        ...cssVars,
        background: PALETTE.sand,
        color: PALETTE.ink,
        fontFamily: BODY,
      }}
    >
      <Hero content={content} brand={brand} compact={compact} dateLong={dateLong} accent={accent} />

      {mode === "showcase" && (
        <>
          <Nav brand={brand} pages={["Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"]} accent={accent} />
          <Story content={content} compact={compact} accent={accent} />
          <Events content={content} compact={compact} accent={accent} />
          <Travel content={content} compact={compact} accent={accent} />
          <Rsvp content={content} dateLong={dateLong} compact={compact} accent={accent} />
          <Gallery compact={compact} accent={accent} />
          <Registry content={content} compact={compact} accent={accent} />
          <Footer accent={accent} hashtag={content.couple.hashtag} />
        </>
      )}
    </div>
  );
}

// ─── Decorative jaali border SVG ─────────────────────────────────

function JaaliBorder({ color, height = 32 }: { color: string; height?: number }) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 600 32"
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <pattern id={`jb-${color.replace("#", "")}`} x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M16 4 L28 16 L16 28 L4 16 Z" stroke={color} strokeWidth="0.7" fill="none" opacity="0.7" />
          <path d="M16 10 L22 16 L16 22 L10 16 Z" stroke={color} strokeWidth="0.5" fill="none" opacity="0.45" />
        </pattern>
      </defs>
      <rect width="600" height="32" fill={`url(#jb-${color.replace("#", "")})`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Hero — wide cinematic 21:9
// ═══════════════════════════════════════════════════════════════════════════════════

function Hero({
  content,
  brand,
  compact,
  dateLong,
  accent,
}: {
  content: TemplateRenderProps["content"];
  brand: TemplateRenderProps["brand"];
  compact: boolean;
  dateLong: string;
  accent: string;
}) {
  const photo = content.hero.photoUrl;
  return (
    <section
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${PALETTE.sand} 0%, ${accent} 30%, ${PALETTE.rust} 65%, ${PALETTE.dusk} 100%)`,
        ...SANDSTONE_BG,
        aspectRatio: compact ? "3 / 4" : "21 / 9",
        overflow: "hidden",
      }}
    >
      {photo && (
        <>
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(1.05) contrast(1.02)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, transparent 0%, ${alpha(PALETTE.duskDeep, "55")} 70%, ${alpha(PALETTE.duskDeep, "AA")} 100%)`,
            }}
          />
        </>
      )}

      {/* Sun glow */}
      {!photo && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: compact ? 240 : 400,
            height: compact ? 240 : 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(PALETTE.sand, "DD")} 0%, ${alpha(accent, "88")} 30%, transparent 70%)`,
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top jaali border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 0", color: PALETTE.sand, opacity: 0.55 }}>
        <JaaliBorder color={PALETTE.sand} height={20} />
      </div>

      {/* Bottom jaali border */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 0", color: PALETTE.sand, opacity: 0.55 }}>
        <JaaliBorder color={PALETTE.sand} height={20} />
      </div>

      {/* Centered hero content */}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: compact ? "40px 28px" : "80px 64px",
          textAlign: "center",
          color: PALETTE.sand,
        }}
      >
        <FadeIn>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: compact ? 10 : 12,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              opacity: 0.9,
              marginBottom: compact ? 20 : 32,
            }}
          >
            {content.hero.eyebrow ?? "A desert palace wedding"}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: compact ? 56 : 144,
              lineHeight: 0.92,
              letterSpacing: "-0.015em",
              margin: 0,
              textShadow: `0 2px 24px ${alpha(PALETTE.duskDeep, "66")}`,
            }}
          >
            {content.couple.first}
            <span
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: compact ? 32 : 80,
                margin: "0 16px",
                opacity: 0.92,
              }}
            >
              &
            </span>
            {content.couple.second}
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ marginTop: compact ? 28 : 48 }}>
            <JaaliDivider color={PALETTE.sand} />
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div
            style={{
              marginTop: compact ? 20 : 32,
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: compact ? 12 : 14,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              opacity: 0.92,
            }}
          >
            {dateLong}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: compact ? 16 : 20,
              opacity: 0.92,
            }}
          >
            {content.primaryVenue}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Nav
// ═══════════════════════════════════════════════════════════════════════════════════

function Nav({ brand, pages, accent }: { brand: TemplateRenderProps["brand"]; pages: string[]; accent: string }) {
  const initials = brand.monogramInitials.split("&");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 64px",
        background: PALETTE.sandDeep,
        ...SANDSTONE_BG,
        borderBottom: `1px solid ${alpha(accent, "55")}`,
      }}
    >
      <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 400, letterSpacing: "0.04em", color: PALETTE.ink }}>
        {initials[0]}
        <span style={{ color: accent, fontStyle: "italic", margin: "0 4px" }}>&</span>
        {initials[1] ?? ""}
      </div>
      <nav
        style={{
          display: "flex",
          gap: 28,
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 300,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: PALETTE.ink,
          opacity: 0.85,
        }}
      >
        {pages.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Story
// ═══════════════════════════════════════════════════════════════════════════════════

function Story({
  content,
  compact,
  accent,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
  accent: string;
}) {
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.sand, ...SANDSTONE_BG }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Our Story
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: compact ? 36 : 64,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              {content.story.title}
            </h2>
            <JaaliDivider color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {content.story.paragraphs.map((p, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.08}>
              <p
                style={{
                  fontFamily: BODY,
                  fontWeight: 300,
                  fontSize: compact ? 15 : 18,
                  lineHeight: 1.85,
                  color: PALETTE.ink,
                  opacity: 0.85,
                  margin: 0,
                  textAlign: "center",
                  maxWidth: 720,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {p}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Events — desert sunset palette band
// ═══════════════════════════════════════════════════════════════════════════════════

function Events({
  content,
  compact,
  accent,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
  accent: string;
}) {
  return (
    <section
      style={{
        padding: compact ? "72px 28px" : "120px 64px",
        background: `linear-gradient(180deg, ${PALETTE.dusk} 0%, ${PALETTE.duskDeep} 100%)`,
        color: PALETTE.sand,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top jaali */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, color: accent, opacity: 0.55 }}>
        <JaaliBorder color={accent} height={24} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, color: accent, opacity: 0.55 }}>
        <JaaliBorder color={accent} height={24} />
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              The Itinerary
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: compact ? 32 : 56,
                lineHeight: 1.05,
                margin: "16px 0 24px",
              }}
            >
              From mehndi to moonrise.
            </h2>
            <JaaliDivider color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: compact ? 16 : 20,
            gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
          }}
        >
          {content.events.map((ev, i) => (
            <FadeIn key={ev.id} delay={0.05 + i * 0.06}>
              <article
                style={{
                  position: "relative",
                  padding: compact ? 28 : 36,
                  background: `linear-gradient(160deg, ${alpha(PALETTE.sand, "0F")} 0%, ${alpha(accent, "11")} 100%)`,
                  border: `1px solid ${alpha(accent, "55")}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                {/* Corner ornaments */}
                {[
                  { top: -1, left: -1, br: "0 0 0 0" },
                  { top: -1, right: -1, br: "0 0 0 0" },
                  { bottom: -1, left: -1, br: "0 0 0 0" },
                  { bottom: -1, right: -1, br: "0 0 0 0" },
                ].map((pos, idx) => (
                  <span
                    key={idx}
                    aria-hidden
                    style={{
                      position: "absolute",
                      ...pos,
                      width: 12,
                      height: 12,
                      borderTop: pos.top !== undefined ? `2px solid ${accent}` : undefined,
                      borderBottom: pos.bottom !== undefined ? `2px solid ${accent}` : undefined,
                      borderLeft: pos.left !== undefined ? `2px solid ${accent}` : undefined,
                      borderRight: pos.right !== undefined ? `2px solid ${accent}` : undefined,
                    }}
                  />
                ))}

                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 400,
                      fontSize: compact ? 44 : 56,
                      lineHeight: 1,
                      color: accent,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: BODY,
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: "0.4em",
                        textTransform: "uppercase",
                        color: accent,
                      }}
                    >
                      {formatDateShort(ev.date)} · {ev.timeLabel}
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: compact ? 26 : 32, marginTop: 4, lineHeight: 1.1 }}>
                      {ev.name}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: `1px solid ${alpha(accent, "33")}`,
                    fontFamily: BODY,
                    fontSize: 13,
                    fontWeight: 300,
                    opacity: 0.9,
                  }}
                >
                  {ev.venue}
                </div>
                {ev.dressCode && (
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: BODY,
                      fontSize: 10,
                      fontWeight: 300,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    {ev.dressCode}
                  </div>
                )}
                {ev.notes && (
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontSize: 14,
                      lineHeight: 1.5,
                      opacity: 0.82,
                    }}
                  >
                    {ev.notes}
                  </div>
                )}
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Travel
// ═══════════════════════════════════════════════════════════════════════════════════

function Travel({
  content,
  compact,
  accent,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
  accent: string;
}) {
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.sand, ...SANDSTONE_BG }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Travel
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: compact ? 32 : 56,
                lineHeight: 1.05,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Crossing the desert.
            </h2>
            <JaaliDivider color={accent} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            style={{
              maxWidth: 720,
              margin: "32px auto 0",
              textAlign: "center",
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: 15,
              lineHeight: 1.75,
              color: PALETTE.ink,
              opacity: 0.82,
            }}
          >
            {content.travel.shuttleNote}
          </p>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: 16,
            gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
          }}
        >
          {content.travel.recommendedHotels.map((h, i) => (
            <FadeIn key={h.name} delay={0.05 + i * 0.05}>
              <div
                style={{
                  position: "relative",
                  padding: 28,
                  background: PALETTE.sandDeep,
                  border: `1px solid ${alpha(accent, "55")}`,
                  borderRadius: 2,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -8,
                    left: 24,
                    background: PALETTE.sand,
                    padding: "0 12px",
                    fontFamily: BODY,
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: accent,
                  }}
                >
                  {h.tier}
                </span>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 26, color: PALETTE.ink, marginTop: 8 }}>
                  {h.name}
                </div>
                {h.note && (
                  <div style={{ marginTop: 10, fontFamily: BODY, fontSize: 13, fontWeight: 300, color: PALETTE.ink, opacity: 0.78 }}>
                    {h.note}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   RSVP
// ═══════════════════════════════════════════════════════════════════════════════════

function Rsvp({
  content,
  dateLong,
  compact,
  accent,
}: {
  content: TemplateRenderProps["content"];
  dateLong: string;
  compact: boolean;
  accent: string;
}) {
  return (
    <section
      style={{
        position: "relative",
        padding: compact ? "80px 28px" : "120px 64px",
        textAlign: "center",
        background: `linear-gradient(180deg, ${PALETTE.rust} 0%, ${PALETTE.dusk} 60%, ${PALETTE.duskDeep} 100%)`,
        color: PALETTE.sand,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, color: accent, opacity: 0.55 }}>
        <JaaliBorder color={accent} height={24} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, color: accent, opacity: 0.55 }}>
        <JaaliBorder color={accent} height={24} />
      </div>

      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            Reply
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: compact ? 40 : 72,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              margin: "20px 0 24px",
            }}
          >
            Cross the desert with us.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <JaaliDivider color={accent} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            style={{
              marginTop: 28,
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            {dateLong} · {content.primaryVenue}
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div
            style={{
              marginTop: 36,
              display: "inline-block",
              padding: "16px 48px",
              background: accent,
              color: PALETTE.duskDeep,
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reply by {formatDateShort(content.rsvp.deadlineIso)}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Gallery — wide cinematic strip
// ═══════════════════════════════════════════════════════════════════════════════════

function Gallery({ compact, accent }: { compact: boolean; accent: string }) {
  const tints = [accent, PALETTE.rust, PALETTE.dusk, PALETTE.goldDeep, PALETTE.rust, accent];
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.sand, ...SANDSTONE_BG }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Gallery
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: compact ? 32 : 56,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Memories under the dunes.
            </h2>
            <JaaliDivider color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 32 : 56,
            display: "grid",
            gap: 8,
            gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
            gridAutoRows: compact ? "160px" : "200px",
          }}
        >
          {tints.map((t, i) => (
            <FadeIn
              key={i}
              delay={0.04 * i}
              style={{
                gridColumn: !compact && (i === 0 || i === 5) ? "span 2" : !compact && i === 2 ? "span 2" : "span 1",
                gridRow: !compact && i === 2 ? "span 2" : undefined,
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(160deg, ${alpha(t, "DD")} 0%, ${alpha(t, "99")} 100%)`,
                  border: `1px solid ${alpha(accent, "33")}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 6,
                    border: `1px solid ${alpha(PALETTE.sand, "44")}`,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Registry
// ═══════════════════════════════════════════════════════════════════════════════════

function Registry({
  content,
  compact,
  accent,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
  accent: string;
}) {
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.sandDeep, ...SANDSTONE_BG }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            Registry
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: compact ? 32 : 56,
              margin: "16px 0 24px",
              color: PALETTE.ink,
            }}
          >
            With deepest gratitude.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <JaaliDivider color={accent} />
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: 20,
            gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
            textAlign: "left",
          }}
        >
          {content.registry.map((r, i) => (
            <FadeIn key={r.id} delay={0.05 + i * 0.06}>
              <div
                style={{
                  position: "relative",
                  padding: 32,
                  background: PALETTE.sand,
                  border: `1px solid ${alpha(accent, "55")}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 400,
                    fontSize: 36,
                    color: accent,
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: accent,
                    marginTop: 14,
                  }}
                >
                  {r.kind}
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 24, color: PALETTE.ink, marginTop: 6, lineHeight: 1.1 }}>
                  {r.title}
                </div>
                {r.description && (
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: PALETTE.ink,
                      opacity: 0.78,
                    }}
                  >
                    {r.description}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Footer
// ═══════════════════════════════════════════════════════════════════════════════════

function Footer({ accent, hashtag }: { accent: string; hashtag: string }) {
  return (
    <footer
      style={{
        padding: "32px 40px",
        textAlign: "center",
        background: PALETTE.duskDeep,
        color: PALETTE.sand,
        fontFamily: BODY,
        fontWeight: 300,
        fontSize: 10,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        opacity: 0.85,
      }}
    >
      <span style={{ color: accent }}>{hashtag}</span>
      <span style={{ margin: "0 14px" }}>·</span>
      Jaisalmer Template
    </footer>
  );
}
