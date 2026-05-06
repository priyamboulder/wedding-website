// ═══════════════════════════════════════════════════════════════════════════════════
//   Kolkata — Literary / Editorial-magazine
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Bengali terracotta and deep ink on bone cream. Strong typographic hierarchy,
//   ink-wash decorative elements, two-column literary layout. Bodoni-feel display,
//   Outfit body. A wedding site that reads like a fashion masthead.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import type { CSSProperties } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import {
  Eyebrow,
  FadeIn,
  InkRule,
  NEWSPRINT_BG,
  PhotoPlaceholder,
  alpha,
  formatDate,
  formatDateShort,
} from "./_shared";

const PALETTE = {
  bone: "#F2EBDD",
  boneDeep: "#E8DECB",
  terracotta: "#A04030",
  terracottaDeep: "#7A2A1E",
  green: "#2E4A3A",
  ink: "#1A1410",
  inkSoft: "#3A2E26",
} as const;

const DISPLAY = '"Cormorant Garamond", "Bodoni Moda", Georgia, serif';
const BODY = '"Outfit", "Work Sans", system-ui, sans-serif';

export default function KolkataTemplate({ content, brand, device, mode }: TemplateRenderProps) {
  const compact = device === "mobile";
  const dateLong = formatDate(content.weddingDate);
  const accent = brand.accent || PALETTE.terracotta;

  const cssVars: CSSProperties = {
    ["--k-bone" as string]: PALETTE.bone,
    ["--k-terra" as string]: accent,
    ["--k-ink" as string]: PALETTE.ink,
  };

  return (
    <div
      style={{
        ...cssVars,
        background: PALETTE.bone,
        color: PALETTE.ink,
        fontFamily: BODY,
      }}
    >
      <Hero content={content} brand={brand} compact={compact} dateLong={dateLong} accent={accent} />

      {mode === "showcase" && (
        <>
          <Masthead brand={brand} pages={["Story", "Events", "Travel", "RSVP", "Gallery", "Registry"]} accent={accent} />
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

// ─── Ink-splash decorative SVG ───────────────────────────────────

function InkSplash({ color, opacity = 0.18 }: { color: string; opacity?: number }) {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden
      style={{ opacity }}
    >
      <path
        d="M110 20 C 70 30, 35 60, 30 110 C 25 145, 50 180, 95 195 C 80 175, 75 150, 90 130 C 75 115, 75 90, 100 80 C 90 60, 105 40, 130 50 C 140 35, 165 35, 175 60 C 195 70, 200 100, 180 120 C 195 140, 180 170, 150 175 C 145 195, 115 200, 100 185 C 130 175, 145 155, 140 130 C 165 120, 170 95, 155 75 C 130 65, 110 75, 110 95 C 90 100, 90 125, 105 135 C 95 155, 110 175, 130 170 C 105 185, 75 175, 75 145 C 50 130, 50 95, 80 80 C 75 50, 105 30, 130 45 Z"
        fill={color}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Hero — Vogue-cover layout: massive type, slim ruled line above, terracotta
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
        background: PALETTE.bone,
        ...NEWSPRINT_BG,
        padding: compact ? "48px 24px" : "72px 64px 80px",
        overflow: "hidden",
      }}
    >
      {/* Ink splashes */}
      <div style={{ position: "absolute", top: -40, right: -40, pointerEvents: "none" }}>
        <InkSplash color={accent} opacity={0.14} />
      </div>
      <div style={{ position: "absolute", bottom: -60, left: -60, pointerEvents: "none" }}>
        <InkSplash color={PALETTE.green} opacity={0.1} />
      </div>

      {/* Top ruled bar — masthead */}
      <FadeIn>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            borderBottom: `2px solid ${PALETTE.ink}`,
            marginBottom: compact ? 32 : 56,
          }}
        >
          <div
            style={{
              fontFamily: BODY,
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PALETTE.ink,
            }}
          >
            Vol. I · No. 1
          </div>
          <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 16, color: accent }}>
            {brand.monogramInitials}
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PALETTE.ink,
            }}
          >
            {formatDateShort(content.weddingDate)}
          </div>
        </div>
      </FadeIn>

      {/* Hero grid: massive type + portrait */}
      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
          gap: compact ? 32 : 48,
          alignItems: "center",
        }}
      >
        <div>
          <FadeIn delay={0.05}>
            <div
              style={{
                fontFamily: BODY,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: 16,
              }}
            >
              {content.hero.eyebrow ?? "An Editorial · Together with their families"}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 64 : 132,
                lineHeight: 0.88,
                letterSpacing: "-0.025em",
                color: PALETTE.ink,
                margin: 0,
              }}
            >
              {content.couple.first}
              <span style={{ color: accent, fontStyle: "italic", fontWeight: 400 }}>,</span>
              <br />
              {content.couple.second}
              <span style={{ color: accent, fontStyle: "italic" }}>.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div
              style={{
                marginTop: compact ? 28 : 40,
                paddingTop: 16,
                borderTop: `1px solid ${PALETTE.ink}`,
                display: "flex",
                gap: compact ? 16 : 32,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontFamily: BODY, fontSize: 9, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: PALETTE.inkSoft, opacity: 0.7 }}>
                  Date
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: PALETTE.ink, marginTop: 2 }}>
                  {dateLong}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: BODY, fontSize: 9, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: PALETTE.inkSoft, opacity: 0.7 }}>
                  Place
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: PALETTE.ink, marginTop: 2 }}>
                  {content.primaryVenue}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} y={32}>
          <div style={{ position: "relative" }}>
            {photo ? (
              <img
                src={photo}
                alt=""
                style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", filter: "contrast(1.05) saturate(0.9)" }}
              />
            ) : (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  background: `linear-gradient(180deg, ${alpha(accent, "DD")} 0%, ${alpha(PALETTE.terracottaDeep, "EE")} 60%, ${PALETTE.ink} 100%)`,
                  overflow: "hidden",
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.2 }} aria-hidden>
                  <defs>
                    <pattern id="k-grid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                      <path d="M 4 0 L 0 0 0 4" fill="none" stroke={PALETTE.bone} strokeWidth="0.2" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#k-grid)" />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: DISPLAY,
                    fontSize: 88,
                    fontStyle: "italic",
                    color: PALETTE.bone,
                    opacity: 0.35,
                  }}
                >
                  ❦
                </div>
              </div>
            )}
            {/* Caption */}
            <div
              style={{
                marginTop: 12,
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontSize: 13,
                color: PALETTE.inkSoft,
                opacity: 0.75,
              }}
            >
              The couple, photographed in winter — {formatDate(content.weddingDate, { year: "numeric" })}.
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Masthead — literary nav
// ═══════════════════════════════════════════════════════════════════════════════════

function Masthead({ brand, pages, accent }: { brand: TemplateRenderProps["brand"]; pages: string[]; accent: string }) {
  return (
    <div
      style={{
        background: PALETTE.ink,
        color: PALETTE.bone,
        padding: "16px 64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 16, color: accent }}>
        {brand.monogramInitials}
      </div>
      <nav
        style={{
          display: "flex",
          gap: 28,
          fontFamily: BODY,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
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
//   Story — two-column literary with drop cap
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.bone, ...NEWSPRINT_BG }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Feature · Our Story
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 40 : 72,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              {content.story.title}
            </h2>
            <InkRule color={accent} />
          </div>
        </FadeIn>

        {/* Byline */}
        <FadeIn delay={0.08}>
          <div
            style={{
              marginTop: 32,
              textAlign: "center",
              fontFamily: BODY,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PALETTE.inkSoft,
              opacity: 0.75,
            }}
          >
            By {content.couple.first} & {content.couple.second}
            <span style={{ margin: "0 12px", color: accent }}>·</span>
            {formatDate(content.weddingDate, { month: "long", year: "numeric" })}
          </div>
        </FadeIn>

        {/* Two-column body with drop cap */}
        <div
          style={{
            marginTop: compact ? 40 : 64,
            columnCount: compact ? 1 : 2,
            columnGap: 56,
            columnRule: compact ? "none" : `1px solid ${alpha(PALETTE.ink, "22")}`,
          }}
        >
          <FadeIn delay={0.1}>
            <div>
              {content.story.paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 400,
                    fontSize: compact ? 16 : 18,
                    lineHeight: 1.7,
                    color: PALETTE.ink,
                    margin: i === 0 ? 0 : "20px 0 0",
                    breakInside: "avoid-column",
                  }}
                >
                  {i === 0 && (
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 500,
                        fontStyle: "italic",
                        fontSize: compact ? 72 : 96,
                        lineHeight: 0.85,
                        float: "left",
                        marginRight: 10,
                        marginTop: 6,
                        color: accent,
                      }}
                    >
                      {p.charAt(0)}
                    </span>
                  )}
                  {i === 0 ? p.slice(1) : p}
                </p>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Events — newspaper schedule grid
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
        background: PALETTE.boneDeep,
        ...NEWSPRINT_BG,
        borderTop: `2px solid ${PALETTE.ink}`,
        borderBottom: `2px solid ${PALETTE.ink}`,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              The Programme
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 36 : 64,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Four nights, by the calendar.
            </h2>
            <InkRule color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: 0,
            gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
            border: `1px solid ${PALETTE.ink}`,
            background: PALETTE.bone,
          }}
        >
          {content.events.map((ev, i) => {
            const isLast = i === content.events.length - 1;
            const isLastInRow = !compact && i % 2 === 1;
            return (
              <FadeIn key={ev.id} delay={0.05 + i * 0.06}>
                <article
                  style={{
                    padding: compact ? 28 : 40,
                    borderRight: compact ? "none" : isLastInRow ? "none" : `1px solid ${alpha(PALETTE.ink, "22")}`,
                    borderBottom: isLast ? "none" : `1px solid ${alpha(PALETTE.ink, "22")}`,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      paddingBottom: 12,
                      borderBottom: `2px solid ${accent}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.4em",
                        textTransform: "uppercase",
                        color: accent,
                      }}
                    >
                      Programme · {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontStyle: "italic",
                        fontSize: 14,
                        color: PALETTE.inkSoft,
                      }}
                    >
                      {formatDateShort(ev.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 500,
                      fontSize: compact ? 32 : 44,
                      lineHeight: 1.05,
                      letterSpacing: "-0.015em",
                      marginTop: 16,
                      color: PALETTE.ink,
                    }}
                  >
                    {ev.name}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 400,
                      color: PALETTE.inkSoft,
                    }}
                  >
                    {ev.timeLabel} · {ev.venue}
                  </div>
                  {ev.notes && (
                    <div
                      style={{
                        marginTop: 16,
                        fontFamily: DISPLAY,
                        fontStyle: "italic",
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: PALETTE.inkSoft,
                        opacity: 0.85,
                      }}
                    >
                      &ldquo;{ev.notes}&rdquo;
                    </div>
                  )}
                  {ev.dressCode && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 12,
                        borderTop: `1px solid ${alpha(PALETTE.ink, "22")}`,
                        fontFamily: BODY,
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: PALETTE.inkSoft,
                      }}
                    >
                      Attire · {ev.dressCode}
                    </div>
                  )}
                </article>
              </FadeIn>
            );
          })}
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.bone, ...NEWSPRINT_BG }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Travel & Accommodation
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 32 : 56,
                lineHeight: 1.05,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Practical matters.
            </h2>
            <InkRule color={accent} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            style={{
              maxWidth: 720,
              margin: "32px auto 0",
              textAlign: "center",
              fontFamily: DISPLAY,
              fontSize: 17,
              lineHeight: 1.7,
              color: PALETTE.inkSoft,
            }}
          >
            {content.travel.shuttleNote}
          </p>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            border: `1px solid ${PALETTE.ink}`,
          }}
        >
          {content.travel.recommendedHotels.map((h, i) => {
            const isLast = i === content.travel.recommendedHotels.length - 1;
            return (
              <FadeIn key={h.name} delay={0.05 + i * 0.05}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: compact ? "1fr" : "auto 1fr 2fr",
                    gap: compact ? 8 : 32,
                    padding: 24,
                    borderBottom: isLast ? "none" : `1px solid ${alpha(PALETTE.ink, "22")}`,
                    background: i % 2 === 0 ? PALETTE.bone : PALETTE.boneDeep,
                  }}
                >
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      color: accent,
                      minWidth: 80,
                      paddingTop: 4,
                    }}
                  >
                    {h.tier}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, color: PALETTE.ink }}>
                    {h.name}
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontSize: 15,
                      color: PALETTE.inkSoft,
                      lineHeight: 1.5,
                      paddingTop: 4,
                    }}
                  >
                    {h.note}
                  </div>
                </div>
              </FadeIn>
            );
          })}
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
        background: PALETTE.ink,
        color: PALETTE.bone,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -40, left: -40, opacity: 0.15 }}>
        <InkSplash color={accent} opacity={0.4} />
      </div>
      <div style={{ position: "absolute", bottom: -40, right: -40, opacity: 0.15 }}>
        <InkSplash color={PALETTE.green} opacity={0.4} />
      </div>

      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            Reply Card
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 500,
              fontSize: compact ? 40 : 72,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: "20px 0 24px",
            }}
          >
            We hope you can come.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <InkRule color={accent} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            style={{
              marginTop: 28,
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 18,
              color: PALETTE.bone,
              opacity: 0.85,
            }}
          >
            {dateLong}
            <br />
            {content.primaryVenue}
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div
            style={{
              marginTop: 40,
              display: "inline-block",
              padding: "16px 48px",
              background: accent,
              color: PALETTE.bone,
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
//   Gallery — magazine spread
// ═══════════════════════════════════════════════════════════════════════════════════

function Gallery({ compact, accent }: { compact: boolean; accent: string }) {
  const tints = [accent, PALETTE.green, PALETTE.terracottaDeep, PALETTE.ink, accent, PALETTE.green];
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.bone, ...NEWSPRINT_BG }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Spread · Gallery
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 32 : 56,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              In photographs.
            </h2>
            <InkRule color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 32 : 56,
            display: "grid",
            gap: 4,
            gridTemplateColumns: compact ? "repeat(2, 1fr)" : "2fr 1fr 1fr",
            gridAutoRows: compact ? "180px" : "240px",
          }}
        >
          {tints.map((t, i) => (
            <FadeIn
              key={i}
              delay={0.04 * i}
              style={{
                gridRow: !compact && i === 0 ? "span 2" : undefined,
                gridColumn: !compact && i === 0 ? "1" : undefined,
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(180deg, ${alpha(t, "DD")} 0%, ${alpha(t, "AA")} 100%)`,
                  filter: "contrast(1.05) saturate(0.85)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    fontFamily: BODY,
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: PALETTE.bone,
                    opacity: 0.85,
                  }}
                >
                  Plate {String(i + 1).padStart(2, "0")}
                </div>
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.boneDeep, ...NEWSPRINT_BG }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Registry · A Note
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: compact ? 32 : 56,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Honestly, we&rsquo;re fine.
            </h2>
            <InkRule color={accent} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: 0,
            gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
            border: `2px solid ${PALETTE.ink}`,
          }}
        >
          {content.registry.map((r, i) => {
            const isLast = i === content.registry.length - 1;
            return (
              <FadeIn key={r.id} delay={0.05 + i * 0.06}>
                <div
                  style={{
                    padding: 32,
                    borderRight: compact || isLast ? "none" : `1px solid ${alpha(PALETTE.ink, "22")}`,
                    borderBottom: compact && !isLast ? `1px solid ${alpha(PALETTE.ink, "22")}` : "none",
                    background: i === 1 ? PALETTE.bone : PALETTE.boneDeep,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      color: accent,
                      paddingBottom: 12,
                      borderBottom: `1px solid ${accent}`,
                    }}
                  >
                    No. {String(i + 1).padStart(2, "0")} · {r.kind}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, marginTop: 16, color: PALETTE.ink, lineHeight: 1.1 }}>
                    {r.title}
                  </div>
                  {r.description && (
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: DISPLAY,
                        fontStyle: "italic",
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: PALETTE.inkSoft,
                      }}
                    >
                      {r.description}
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
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
        background: PALETTE.ink,
        color: PALETTE.bone,
        fontFamily: BODY,
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        opacity: 0.85,
      }}
    >
      <span style={{ color: accent }}>{hashtag}</span>
      <span style={{ margin: "0 14px" }}>·</span>
      Kolkata Template
    </footer>
  );
}
