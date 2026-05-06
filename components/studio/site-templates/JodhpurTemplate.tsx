// ═══════════════════════════════════════════════════════════════════════════════════
//   Jodhpur — Editorial / Coffee-table-book luxe
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Deep indigo and warm marble cream. Full-bleed photographic hero with a soft
//   dark overlay, gold ornamental dividers, marble-veined section backgrounds.
//   Cormorant Garamond display, Outfit body. Quiet confidence — magazine cover
//   for a wedding.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import type { CSSProperties } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import {
  DiamondDivider,
  Eyebrow,
  FadeIn,
  MARBLE_BG,
  PhotoPlaceholder,
  alpha,
  formatDate,
  formatDateShort,
} from "./_shared";

const PALETTE = {
  indigo: "#1B1F3B",
  indigoEdge: "#2A3052",
  cream: "#F5EFE2",
  marbleWarm: "#EFE6D2",
  gold: "#C9A961",
  goldDeep: "#A88742",
  ink: "#1F2236",
} as const;

const DISPLAY = '"Cormorant Garamond", "Fraunces", Georgia, serif';
const BODY = '"Outfit", "Inter", system-ui, sans-serif';

export default function JodhpurTemplate({ content, brand, device, mode }: TemplateRenderProps) {
  const compact = device === "mobile";
  const dateLong = formatDate(content.weddingDate);
  const accent = brand.accent || PALETTE.gold;

  const cssVars: CSSProperties = {
    ["--j-indigo" as string]: PALETTE.indigo,
    ["--j-cream" as string]: PALETTE.cream,
    ["--j-gold" as string]: accent,
    ["--j-ink" as string]: PALETTE.ink,
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

// ═══════════════════════════════════════════════════════════════════════════════════
//   Hero — full-bleed indigo with photo overlay + editorial stack
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
        background: `linear-gradient(135deg, ${PALETTE.indigo} 0%, ${PALETTE.indigoEdge} 100%)`,
        aspectRatio: compact ? "3 / 4" : "16 / 9",
        color: PALETTE.cream,
        overflow: "hidden",
      }}
    >
      {photo ? (
        <>
          <img
            src={photo}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                `linear-gradient(180deg, ${PALETTE.indigo}99 0%, ${PALETTE.indigo}66 50%, ${PALETTE.indigo}DD 100%)`,
            }}
          />
        </>
      ) : (
        <>
          {/* Decorative star-field for photoless hero */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, opacity: 0.18 }}
            aria-hidden
          >
            <defs>
              <pattern id="j-stars" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.3" fill={PALETTE.cream} />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#j-stars)" />
          </svg>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 30% 30%, ${accent}22 0%, transparent 55%)`,
            }}
          />
        </>
      )}

      {/* Top monogram */}
      <div
        style={{
          position: "absolute",
          top: compact ? 24 : 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontFamily: DISPLAY,
          fontSize: compact ? 18 : 22,
          letterSpacing: "0.04em",
          color: PALETTE.cream,
          opacity: 0.9,
        }}
      >
        {brand.monogramInitials}
      </div>

      {/* Editorial stack — eyebrow top, names bottom */}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: compact ? "0 28px 40px" : "0 64px 80px",
        }}
      >
        <FadeIn y={16}>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: compact ? 10 : 12,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: compact ? 16 : 24,
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
              fontSize: compact ? 56 : 128,
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            <span style={{ display: "block" }}>{content.couple.first}</span>
            <span
              style={{
                display: "block",
                fontStyle: "italic",
                fontSize: compact ? 32 : 64,
                color: accent,
                margin: compact ? "4px 0" : "8px 0",
                fontWeight: 400,
              }}
            >
              and
            </span>
            <span style={{ display: "block" }}>{content.couple.second}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div
            style={{
              marginTop: compact ? 20 : 36,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              aria-hidden
              style={{ display: "inline-block", width: compact ? 24 : 48, height: 1, background: accent }}
            />
            <span
              style={{
                fontFamily: BODY,
                fontWeight: 300,
                fontSize: compact ? 11 : 13,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              {dateLong}
            </span>
            <span
              aria-hidden
              style={{ display: "inline-block", width: 4, height: 4, borderRadius: 999, background: accent }}
            />
            <span
              style={{
                fontFamily: BODY,
                fontWeight: 300,
                fontSize: compact ? 11 : 13,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              {content.primaryVenue}
            </span>
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
        borderBottom: `1px solid ${alpha(accent, "33")}`,
        background: PALETTE.cream,
      }}
    >
      <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 400, letterSpacing: "0.04em" }}>
        {initials[0]}
        <span style={{ color: accent, fontStyle: "italic", margin: "0 4px" }}>&</span>
        {initials[1] ?? ""}
      </div>
      <nav
        style={{
          display: "flex",
          gap: 32,
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 300,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: PALETTE.ink,
          opacity: 0.7,
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
        position: "relative",
        padding: compact ? "72px 28px" : "120px 64px",
        ...MARBLE_BG,
        background: `${PALETTE.cream}`,
      }}
    >
      <div style={{ ...MARBLE_BG, position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none" }} aria-hidden />
      <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Eyebrow color={accent} fontFamily={BODY} align="center">
            Our Story
          </Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 300,
              fontSize: compact ? 36 : 64,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              margin: "20px 0 32px",
            }}
          >
            {content.story.title}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <DiamondDivider color={accent} width={120} />
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 36 : 56,
            display: "grid",
            gap: compact ? 24 : 56,
            gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
            textAlign: "left",
          }}
        >
          {content.story.paragraphs.map((p, i) => (
            <FadeIn key={i} delay={0.15 + i * 0.08}>
              <p
                style={{
                  fontFamily: BODY,
                  fontWeight: 300,
                  fontSize: compact ? 15 : 17,
                  lineHeight: 1.85,
                  color: PALETTE.ink,
                  opacity: 0.82,
                  margin: 0,
                }}
              >
                {i === 0 && (
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: compact ? 56 : 78,
                      lineHeight: 0.85,
                      float: "left",
                      marginRight: 12,
                      marginTop: 4,
                      color: accent,
                      fontStyle: "italic",
                      fontWeight: 500,
                    }}
                  >
                    {p.charAt(0)}
                  </span>
                )}
                {i === 0 ? p.slice(1) : p}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Events — multi-day grid
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
        background: PALETTE.indigo,
        color: PALETTE.cream,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Events
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 300,
                fontSize: compact ? 32 : 56,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: "16px 0 24px",
              }}
            >
              Three days of celebration.
            </h2>
            <DiamondDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: compact ? 20 : 28,
            gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
          }}
        >
          {content.events.map((ev, i) => (
            <FadeIn key={ev.id} delay={0.05 + i * 0.06}>
              <article
                style={{
                  position: "relative",
                  padding: compact ? 28 : 36,
                  border: `1px solid ${alpha(accent, "44")}`,
                  background: `${PALETTE.indigoEdge}33`,
                  backdropFilter: "blur(2px)",
                }}
              >
                {/* Top corner ornaments */}
                <span
                  aria-hidden
                  style={{ position: "absolute", top: 8, left: 8, width: 14, height: 14, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` }}
                />
                <span
                  aria-hidden
                  style={{ position: "absolute", bottom: 8, right: 8, width: 14, height: 14, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}` }}
                />

                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    fontWeight: 300,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: 12,
                  }}
                >
                  {formatDateShort(ev.date)} · {ev.timeLabel}
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: compact ? 28 : 36, lineHeight: 1.1 }}>
                  {ev.name}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: BODY,
                    fontSize: 14,
                    fontWeight: 300,
                    opacity: 0.85,
                  }}
                >
                  {ev.venue}
                </div>
                {ev.dressCode && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: `1px solid ${alpha(accent, "33")}`,
                      fontFamily: BODY,
                      fontSize: 10,
                      fontWeight: 300,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Attire · {ev.dressCode}
                  </div>
                )}
                {ev.notes && (
                  <div style={{ marginTop: 10, fontFamily: BODY, fontSize: 13, fontWeight: 300, fontStyle: "italic", opacity: 0.7 }}>
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.cream, ...MARBLE_BG }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Travel & Stay
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 300,
                fontSize: compact ? 32 : 52,
                lineHeight: 1.05,
                margin: "16px 0 24px",
              }}
            >
              Coming to the city.
            </h2>
            <DiamondDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            style={{
              marginTop: 32,
              textAlign: "center",
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: 14,
              lineHeight: 1.8,
              color: PALETTE.ink,
              opacity: 0.78,
              maxWidth: 640,
              margin: "32px auto 0",
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
                  padding: 24,
                  background: alpha(accent, "11"),
                  border: `1px solid ${alpha(accent, "33")}`,
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
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 24, marginTop: 6 }}>{h.name}</div>
                {h.note && (
                  <div style={{ marginTop: 10, fontFamily: BODY, fontSize: 13, fontWeight: 300, opacity: 0.75 }}>
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
//   RSVP band
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
        background: PALETTE.indigo,
        color: PALETTE.cream,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, opacity: 0.12 }}
        aria-hidden
      >
        <defs>
          <pattern id="j-rsvp-stars" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.4" fill={accent} />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#j-rsvp-stars)" />
      </svg>

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
              fontWeight: 300,
              fontSize: compact ? 36 : 64,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              margin: "20px 0 24px",
            }}
          >
            We&rsquo;d love to see you there.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <DiamondDivider color={accent} width={100} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            style={{
              marginTop: 28,
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.85,
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
              padding: "16px 40px",
              border: `1px solid ${accent}`,
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: accent,
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
//   Gallery
// ═══════════════════════════════════════════════════════════════════════════════════

function Gallery({ compact, accent }: { compact: boolean; accent: string }) {
  const tints = [PALETTE.indigo, accent, PALETTE.indigoEdge, PALETTE.goldDeep, PALETTE.indigo, accent];
  return (
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.cream, ...MARBLE_BG }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <Eyebrow color={accent} fontFamily={BODY} align="center">
              Gallery
            </Eyebrow>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: compact ? 32 : 52,
                lineHeight: 1.05,
                margin: "16px 0 24px",
              }}
            >
              moments
            </h2>
            <DiamondDivider color={accent} width={100} />
          </div>
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 32 : 56,
            display: "grid",
            gap: 12,
            gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          }}
        >
          {tints.map((t, i) => (
            <FadeIn key={i} delay={0.04 * i}>
              <PhotoPlaceholder tint={t} aspect={i % 3 === 1 ? "3 / 4" : "4 / 5"} label={`Memory ${i + 1}`} />
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
    <section style={{ padding: compact ? "72px 28px" : "120px 64px", background: PALETTE.indigoEdge, color: PALETTE.cream }}>
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
              fontWeight: 300,
              fontSize: compact ? 32 : 52,
              lineHeight: 1.05,
              margin: "16px 0 24px",
            }}
          >
            With gratitude.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <DiamondDivider color={accent} width={100} />
        </FadeIn>

        <div
          style={{
            marginTop: compact ? 40 : 64,
            display: "grid",
            gap: 16,
            gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
            textAlign: "left",
          }}
        >
          {content.registry.map((r, i) => (
            <FadeIn key={r.id} delay={0.05 + i * 0.06}>
              <div
                style={{
                  padding: 28,
                  border: `1px solid ${alpha(accent, "44")}`,
                  background: `${PALETTE.indigo}55`,
                  height: "100%",
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
                  {r.kind}
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 24, marginTop: 8 }}>{r.title}</div>
                {r.description && (
                  <div style={{ marginTop: 12, fontFamily: BODY, fontSize: 13, fontWeight: 300, lineHeight: 1.7, opacity: 0.82 }}>
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
        background: PALETTE.indigo,
        color: PALETTE.cream,
        fontFamily: BODY,
        fontWeight: 300,
        fontSize: 10,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        opacity: 0.65,
      }}
    >
      <span style={{ color: accent }}>{hashtag}</span>
      <span style={{ margin: "0 12px" }}>·</span>
      Jodhpur Template
    </footer>
  );
}
