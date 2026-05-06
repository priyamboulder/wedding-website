// ═══════════════════════════════════════════════════════════════════════════════════
//   Pondicherry — Romantic / Candlelit warmth
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Candlelight amber and colonial cream. Arched frames around photos (a French-
//   quarter colonial nod), warm radial gradients, italic Cormorant script accents,
//   linen-textured backgrounds. Soft, warm, inviting.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import type { CSSProperties } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import {
  Eyebrow,
  FadeIn,
  FloralDivider,
  LINEN_BG,
  PhotoPlaceholder,
  alpha,
  formatDate,
  formatDateShort,
} from "./_shared";

const PALETTE = {
  cream: "#F5EDE0",
  creamDeep: "#EFE3CD",
  amber: "#E8A85C",
  amberDeep: "#C97E3A",
  terracotta: "#A05742",
  ink: "#3A2820",
  inkSoft: "#5C4438",
} as const;

const DISPLAY = '"Cormorant Garamond", Georgia, serif';
const BODY = '"Outfit", "Inter", system-ui, sans-serif';

export default function PondicherryTemplate({ content, brand, device, mode }: TemplateRenderProps) {
  const compact = device === "mobile";
  const dateLong = formatDate(content.weddingDate);
  const accent = brand.accent || PALETTE.amber;

  const cssVars: CSSProperties = {
    ["--p-cream" as string]: PALETTE.cream,
    ["--p-amber" as string]: accent,
    ["--p-ink" as string]: PALETTE.ink,
  };

  return (
    <div
      style={{
        ...cssVars,
        background: PALETTE.cream,
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

// ─── Arch SVG mask used for photos throughout ────────────────────

function ArchedFrame({
  children,
  borderColor,
  aspect = "3 / 4",
}: {
  children: React.ReactNode;
  borderColor: string;
  aspect?: string;
}) {
  return (
    <div style={{ position: "relative", aspectRatio: aspect, width: "100%" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px 9999px 4px 4px",
          overflow: "hidden",
          border: `1px solid ${borderColor}`,
          boxShadow: `inset 0 0 0 6px ${PALETTE.cream}, inset 0 0 0 7px ${alpha(borderColor, "55")}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Hero
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
        background: `radial-gradient(ellipse at 30% 30%, ${alpha(accent, "55")} 0%, ${PALETTE.creamDeep} 45%, ${PALETTE.cream} 100%)`,
        ...LINEN_BG,
        padding: compact ? "64px 28px 80px" : "100px 64px 140px",
        overflow: "hidden",
      }}
    >
      {/* Candlelight glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          background: `radial-gradient(circle, ${alpha(accent, "44")} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-30%",
          right: "-15%",
          width: "70%",
          height: "70%",
          background: `radial-gradient(circle, ${alpha(PALETTE.terracotta, "33")} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
          gap: compact ? 40 : 80,
          alignItems: "center",
        }}
      >
        {/* Left: text */}
        <div style={{ textAlign: compact ? "center" : "left" }}>
          <FadeIn>
            <div
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontSize: compact ? 18 : 22,
                color: accent,
                marginBottom: 16,
              }}
            >
              {content.couple.hashtag}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 300,
                fontSize: compact ? 10 : 11,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: PALETTE.inkSoft,
                opacity: 0.8,
                marginBottom: 24,
              }}
            >
              {content.hero.eyebrow ?? "Together with their families"}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 300,
                fontSize: compact ? 56 : 96,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                color: PALETTE.ink,
                margin: 0,
              }}
            >
              {content.couple.first}
              <br />
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: compact ? 36 : 56,
                  color: accent,
                }}
              >
                & {content.couple.second}
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div
              style={{
                marginTop: compact ? 28 : 40,
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontSize: compact ? 18 : 22,
                color: PALETTE.inkSoft,
                lineHeight: 1.4,
              }}
            >
              {dateLong}
              <br />
              <span style={{ fontFamily: BODY, fontStyle: "normal", fontWeight: 300, fontSize: compact ? 12 : 13, letterSpacing: "0.18em", textTransform: "uppercase", color: PALETTE.inkSoft, opacity: 0.75 }}>
                {content.primaryVenue}
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Right: arched portrait */}
        <FadeIn delay={0.2} y={32}>
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            <ArchedFrame borderColor={accent} aspect="3 / 4">
              {photo ? (
                <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(160deg, ${alpha(accent, "AA")} 0%, ${alpha(PALETTE.terracotta, "BB")} 100%)`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: DISPLAY,
                      fontSize: 56,
                      fontStyle: "italic",
                      color: PALETTE.cream,
                      opacity: 0.85,
                    }}
                  >
                    {brand.monogramInitials}
                  </div>
                </div>
              )}
            </ArchedFrame>
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
        borderBottom: `1px solid ${alpha(accent, "44")}`,
        borderTop: `1px solid ${alpha(accent, "44")}`,
        background: PALETTE.creamDeep,
      }}
    >
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 22, fontWeight: 500, color: accent }}>
        {initials[0]}
        <span style={{ color: PALETTE.ink, margin: "0 4px" }}>·</span>
        {initials[1] ?? ""}
      </div>
      <nav
        style={{
          display: "flex",
          gap: 28,
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 300,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: PALETTE.inkSoft,
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
    <section
      style={{
        padding: compact ? "72px 28px" : "120px 64px",
        background: PALETTE.cream,
        ...LINEN_BG,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Our Story
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: compact ? 36 : 60,
                lineHeight: 1.05,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              {content.story.title}
            </h2>
            <FloralDivider color={accent} width={120} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: compact ? 28 : 56,
            gridTemplateColumns: compact ? "1fr" : "auto 1fr",
            alignItems: "start",
          }}
        >
          {!compact && (
            <FadeIn delay={0.1} y={32}>
              <div style={{ width: 220 }}>
                <ArchedFrame borderColor={accent} aspect="3 / 4">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(180deg, ${alpha(accent, "BB")} 0%, ${alpha(PALETTE.terracotta, "AA")} 100%)`,
                    }}
                  />
                </ArchedFrame>
              </div>
            </FadeIn>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {content.story.paragraphs.map((p, i) => (
              <FadeIn key={i} delay={0.12 + i * 0.08}>
                <p
                  style={{
                    fontFamily: BODY,
                    fontWeight: 300,
                    fontSize: compact ? 15 : 17,
                    lineHeight: 1.85,
                    color: PALETTE.inkSoft,
                    margin: 0,
                  }}
                >
                  {p}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Events
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
        background: `linear-gradient(180deg, ${PALETTE.creamDeep} 0%, ${PALETTE.cream} 100%)`,
        ...LINEN_BG,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              The Celebrations
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: compact ? 32 : 56,
                lineHeight: 1.05,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Four days, one love.
            </h2>
            <FloralDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "flex",
            flexDirection: "column",
            gap: compact ? 24 : 32,
          }}
        >
          {content.events.map((ev, i) => (
            <FadeIn key={ev.id} delay={0.05 + i * 0.06} y={20}>
              <article
                style={{
                  display: "grid",
                  gridTemplateColumns: compact ? "1fr" : "auto 1px 1fr 1fr",
                  gap: compact ? 12 : 36,
                  alignItems: "center",
                  padding: compact ? "20px 0" : "24px 32px",
                  background: i % 2 === 0 ? "transparent" : alpha(accent, "0F"),
                  border: `1px solid ${alpha(accent, "33")}`,
                  borderLeft: `4px solid ${accent}`,
                }}
              >
                <div style={{ minWidth: 100 }}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontWeight: 500,
                      fontSize: compact ? 32 : 44,
                      color: accent,
                      lineHeight: 1,
                    }}
                  >
                    {formatDateShort(ev.date)}
                  </div>
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 10,
                      fontWeight: 400,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      color: PALETTE.inkSoft,
                      marginTop: 4,
                    }}
                  >
                    {ev.timeLabel}
                  </div>
                </div>
                {!compact && <div style={{ height: 64, background: alpha(accent, "44") }} />}
                <div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 400,
                      fontSize: compact ? 26 : 32,
                      color: PALETTE.ink,
                      lineHeight: 1.1,
                    }}
                  >
                    {ev.name}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 300,
                      color: PALETTE.inkSoft,
                      opacity: 0.8,
                    }}
                  >
                    {ev.venue}
                  </div>
                </div>
                <div>
                  {ev.dressCode && (
                    <div
                      style={{
                        fontFamily: BODY,
                        fontSize: 10,
                        fontWeight: 300,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: accent,
                      }}
                    >
                      {ev.dressCode}
                    </div>
                  )}
                  {ev.notes && (
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: DISPLAY,
                        fontStyle: "italic",
                        fontSize: 14,
                        color: PALETTE.inkSoft,
                        opacity: 0.85,
                      }}
                    >
                      {ev.notes}
                    </div>
                  )}
                </div>
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.cream, ...LINEN_BG }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Travel
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: compact ? 32 : 52,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Where to lay your head.
            </h2>
            <FloralDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            style={{
              marginTop: 32,
              textAlign: "center",
              maxWidth: 640,
              margin: "32px auto 0",
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.6,
              color: PALETTE.inkSoft,
            }}
          >
            {content.travel.shuttleNote}
          </p>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 56,
            display: "grid",
            gap: 16,
            gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
          }}
        >
          {content.travel.recommendedHotels.map((h, i) => (
            <FadeIn key={h.name} delay={0.05 + i * 0.05}>
              <div
                style={{
                  padding: 28,
                  background: PALETTE.creamDeep,
                  border: `1px solid ${alpha(accent, "33")}`,
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 9,
                    fontWeight: 400,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: accent,
                  }}
                >
                  {h.tier}
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 26, marginTop: 6, color: PALETTE.ink }}>
                  {h.name}
                </div>
                {h.note && (
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontSize: 14,
                      color: PALETTE.inkSoft,
                      opacity: 0.85,
                    }}
                  >
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
        background: `radial-gradient(ellipse at 50% 50%, ${alpha(accent, "55")} 0%, ${PALETTE.creamDeep} 60%, ${PALETTE.cream} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 100%, ${alpha(PALETTE.terracotta, "44")} 0%, transparent 60%)`,
        }}
      />
      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            RSVP
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: compact ? 36 : 64,
              lineHeight: 1.05,
              margin: "20px 0 28px",
              color: PALETTE.ink,
            }}
          >
            Will you be there?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <FloralDivider color={accent} width={100} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            style={{
              marginTop: 28,
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: 13,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: PALETTE.inkSoft,
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
              borderRadius: 999,
              background: PALETTE.ink,
              color: PALETTE.cream,
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.32em",
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
//   Gallery — arched frames in a soft staggered grid
// ═══════════════════════════════════════════════════════════════════════════════════

function Gallery({ compact, accent }: { compact: boolean; accent: string }) {
  const tints = [accent, PALETTE.terracotta, PALETTE.amberDeep, PALETTE.terracotta, accent, PALETTE.amberDeep];
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.cream, ...LINEN_BG }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Gallery
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: compact ? 32 : 52,
                margin: "16px 0 24px",
                color: PALETTE.ink,
              }}
            >
              Memories so far
            </h2>
            <FloralDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 32 : 56,
            display: "grid",
            gap: compact ? 16 : 24,
            gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          }}
        >
          {tints.map((t, i) => (
            <FadeIn key={i} delay={0.04 * i}>
              <div style={{ marginTop: i % 3 === 1 ? (compact ? 16 : 32) : 0 }}>
                <ArchedFrame borderColor={accent} aspect="3 / 4">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(180deg, ${alpha(t, "BB")} 0%, ${alpha(t, "77")} 100%)`,
                    }}
                  />
                </ArchedFrame>
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.creamDeep, ...LINEN_BG }}>
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            Registry
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: compact ? 32 : 52,
              margin: "16px 0 24px",
              color: PALETTE.ink,
            }}
          >
            Your presence is gift enough.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <FloralDivider color={accent} width={100} />
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
                  padding: 28,
                  background: PALETTE.cream,
                  border: `1px solid ${alpha(accent, "44")}`,
                  borderRadius: 4,
                  height: "100%",
                  position: "relative",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -10,
                    left: 24,
                    background: PALETTE.creamDeep,
                    padding: "0 12px",
                    fontFamily: BODY,
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: accent,
                  }}
                >
                  {r.kind}
                </span>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 24, color: PALETTE.ink, marginTop: 6 }}>
                  {r.title}
                </div>
                {r.description && (
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: DISPLAY,
                      fontStyle: "italic",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: PALETTE.inkSoft,
                      opacity: 0.85,
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
        background: PALETTE.cream,
        borderTop: `1px solid ${alpha(accent, "44")}`,
        fontFamily: BODY,
        fontWeight: 300,
        fontSize: 10,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: PALETTE.inkSoft,
        opacity: 0.75,
      }}
    >
      <span style={{ color: accent, fontFamily: DISPLAY, fontStyle: "italic", fontSize: 13, letterSpacing: "0.04em", textTransform: "none" }}>
        {hashtag}
      </span>
      <span style={{ margin: "0 14px" }}>·</span>
      Pondicherry Template
    </footer>
  );
}
