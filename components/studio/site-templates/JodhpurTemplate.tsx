// ═══════════════════════════════════════════════════════════════════════════════════
//   Jodhpur — Editorial template renderer
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Indigo walls, marble courtyards. Editorial-stack hero, single deep accent,
//   confident serif display. The reference implementation for the renderer
//   architecture — every other template (Udaipur, Chettinad, ...) follows the
//   same shape: one component, consumes (content, brand, device, mode).
// ═══════════════════════════════════════════════════════════════════════════════════

import type { CSSProperties } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";

const TEMPLATE_PALETTE = {
  hero: "#1E3A5F",
  heroEdge: "#2D5380",
  inkOnDark: "#FAF7F2",
} as const;

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", opts);
}

export default function JodhpurTemplate({ content, brand, device, mode }: TemplateRenderProps) {
  const compact = device === "mobile";
  const dateLong = formatDate(content.weddingDate);

  // Brand cascade as CSS custom properties on the root.
  // Templates that hardcode a palette (like Jodhpur's indigo) still expose
  // brand tokens for accent/typography so the Brand Kit cascade works.
  const cssVars: CSSProperties = {
    ["--brand-ink" as string]: brand.ink,
    ["--brand-surface" as string]: brand.surface,
    ["--brand-accent" as string]: brand.accent,
    ["--brand-accent-soft" as string]: brand.accentSoft,
    ["--brand-display" as string]: brand.displayFont,
    ["--brand-body" as string]: brand.bodyFont,
  };

  return (
    <div
      style={{
        ...cssVars,
        background: "var(--brand-surface)",
        color: "var(--brand-ink)",
        fontFamily: "var(--brand-body)",
      }}
    >
      <Hero content={content} brand={brand} compact={compact} dateLong={dateLong} />

      {mode === "showcase" && (
        <>
          <Nav content={content} brand={brand} compact={compact} />
          <StorySection content={content} compact={compact} />
          <Divider />
          <EventsSection content={content} compact={compact} />
          <RsvpBand content={content} dateLong={dateLong} compact={compact} />
          <Footer name="Jodhpur" />
        </>
      )}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────

function Hero({
  content,
  brand,
  compact,
  dateLong,
}: {
  content: TemplateRenderProps["content"];
  brand: TemplateRenderProps["brand"];
  compact: boolean;
  dateLong: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${TEMPLATE_PALETTE.hero} 0%, ${TEMPLATE_PALETTE.heroEdge} 100%)`,
        aspectRatio: compact ? "3 / 4" : "16 / 9",
        color: TEMPLATE_PALETTE.inkOnDark,
      }}
    >
      {/* Editorial-stack: eyebrow top, names bottom-left, hairline + date below */}
      <div className="absolute inset-0 flex flex-col p-[6%]">
        <div
          style={{
            fontFamily: "var(--brand-body)",
            fontSize: compact ? 10 : 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          {content.hero.eyebrow ?? "Together with their families"}
        </div>

        <div className="mt-auto" />

        <div
          style={{
            fontFamily: "var(--brand-display)",
            fontSize: compact ? 44 : 88,
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
          }}
        >
          {content.couple.first}
          <span style={{ color: brand.accent, fontStyle: "italic" }}> & </span>
          {content.couple.second}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: compact ? 24 : 36,
              height: 1,
              background: brand.accent,
            }}
          />
          <span
            style={{
              fontFamily: "var(--brand-body)",
              fontSize: compact ? 11 : 13,
              letterSpacing: "0.04em",
              opacity: 0.85,
            }}
          >
            {dateLong} · {content.primaryVenue}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────

function Nav({
  content,
  brand,
  compact,
}: {
  content: TemplateRenderProps["content"];
  brand: TemplateRenderProps["brand"];
  compact: boolean;
}) {
  const links = ["Our Story", "Events", "Travel", "RSVP", "Gallery"];
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: compact ? "12px 24px" : "18px 40px",
        borderBottom: `1px solid ${brand.accent}22`,
        background: "var(--brand-surface)",
      }}
    >
      <div style={{ fontFamily: "var(--brand-display)", fontSize: 16 }}>
        {brand.monogramInitials.split("&")[0]}
        <span style={{ color: brand.accent }}>&</span>
        {brand.monogramInitials.split("&")[1] ?? ""}
      </div>
      {!compact && (
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          {links.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Story ────────────────────────────────────────────────────────

function StorySection({
  content,
  compact,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
}) {
  return (
    <section style={{ padding: compact ? "40px 24px" : "72px 40px" }}>
      <Eyebrow>Our Story</Eyebrow>
      <h2
        style={{
          marginTop: 12,
          fontFamily: "var(--brand-display)",
          fontSize: compact ? 28 : 48,
          lineHeight: 1.08,
          letterSpacing: "-0.015em",
        }}
      >
        {content.story.title}
      </h2>
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gap: 32,
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
        }}
      >
        {content.story.paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: "var(--brand-body)",
              fontSize: 15,
              lineHeight: 1.7,
              opacity: 0.82,
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

// ── Events ───────────────────────────────────────────────────────

function EventsSection({
  content,
  compact,
}: {
  content: TemplateRenderProps["content"];
  compact: boolean;
}) {
  return (
    <section style={{ padding: compact ? "40px 24px" : "72px 40px" }}>
      <Eyebrow>Events</Eyebrow>
      <h2
        style={{
          marginTop: 12,
          fontFamily: "var(--brand-display)",
          fontSize: compact ? 26 : 44,
          lineHeight: 1.08,
          letterSpacing: "-0.015em",
        }}
      >
        Three days. One ceremony. A wedding.
      </h2>
      <div
        style={{
          marginTop: 32,
          display: "grid",
          gap: 20,
          gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
        }}
      >
        {content.events.map((ev) => (
          <article
            key={ev.id}
            style={{
              padding: 22,
              borderRadius: 8,
              background: "var(--brand-accent-soft)",
              border: "1px solid var(--brand-accent)33",
            }}
          >
            <div style={{ fontFamily: "var(--brand-display)", fontSize: 24 }}>{ev.name}</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                opacity: 0.6,
              }}
            >
              {formatDate(ev.date, { month: "short", day: "numeric" })} · {ev.timeLabel}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.82 }}>{ev.venue}</div>
            {ev.dressCode && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                }}
              >
                {ev.dressCode}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// ── RSVP ─────────────────────────────────────────────────────────

function RsvpBand({
  content,
  dateLong,
  compact,
}: {
  content: TemplateRenderProps["content"];
  dateLong: string;
  compact: boolean;
}) {
  return (
    <section
      style={{
        position: "relative",
        padding: compact ? "56px 24px" : "80px 40px",
        textAlign: "center",
        background: `linear-gradient(180deg, ${TEMPLATE_PALETTE.hero} 0%, ${TEMPLATE_PALETTE.hero} 55%, var(--brand-accent) 55%, var(--brand-accent) 100%)`,
        color: TEMPLATE_PALETTE.inkOnDark,
      }}
    >
      <Eyebrow inverse>RSVP</Eyebrow>
      <h2
        style={{
          marginTop: 12,
          fontFamily: "var(--brand-display)",
          fontSize: compact ? 28 : 44,
        }}
      >
        We hope you&apos;ll join us.
      </h2>
      <p
        style={{
          marginTop: 12,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        {dateLong} · {content.primaryVenue}
      </p>
      <div
        style={{
          marginTop: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 28px",
          background: "var(--brand-surface)",
          color: "var(--brand-ink)",
          borderRadius: 999,
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
        }}
      >
        Reply by {formatDate(content.rsvp.deadlineIso, { month: "short", day: "numeric" })}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: 0.65,
        }}
      >
        {content.couple.hashtag}
      </div>
    </section>
  );
}

// ── Footer / shared bits ─────────────────────────────────────────

function Footer({ name }: { name: string }) {
  return (
    <footer
      style={{
        padding: "24px 40px",
        textAlign: "center",
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity: 0.5,
      }}
    >
      Template · {name} — rendered with your Brand Kit
    </footer>
  );
}

function Divider() {
  return <div style={{ height: 1, margin: "0 40px", background: "var(--brand-accent)33" }} />;
}

function Eyebrow({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <div
      style={{
        fontFamily: "var(--brand-body)",
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: inverse ? TEMPLATE_PALETTE.inkOnDark : "var(--brand-accent)",
        opacity: inverse ? 0.7 : 1,
      }}
    >
      {children}
    </div>
  );
}
