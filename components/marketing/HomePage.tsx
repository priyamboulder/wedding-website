"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { JOURNAL, PLATFORM_MODULES } from "@/lib/marketing/data";
import type { Category } from "@/lib/marketing/data";
import { useAuthStore } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// ── Scroll-in helper ──────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color: "#B8755D",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const openSignIn = useAuthStore((s) => s.openSignIn);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
        backgroundColor: "#1A1410",
        padding: "80px 24px 100px",
      }}
    >
      {/* Background image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/wedding-photos/best/best-04.jpg"
          alt="Wedding ceremony"
          fill
          style={{ objectFit: "cover", opacity: 0.38 }}
          priority
        />
      </div>

      {/* Gradient vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(20,14,10,0.72) 100%)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 780, margin: "0 auto" }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(250,240,225,0.55)",
            marginBottom: 32,
          }}
        >
          A wedding platform for South Asian couples
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(42px, 7vw, 88px)",
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            color: "#FAF5EC",
            marginBottom: 28,
          }}
        >
          Every ceremony,
          <br />
          every vendor,
          <br />
          <em style={{ fontStyle: "italic", color: "#D4A96A" }}>one place.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.35 }}
          style={{
            fontFamily: BODY,
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(250,240,225,0.72)",
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          Plan every ceremony, book curated vendors, design stationery, and build your
          wedding website — built for the multi-day South Asian wedding.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
          <button
            onClick={() => openSignIn()}
            style={{
              fontFamily: BODY,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "14px 32px",
              background: "#B8755D",
              color: "#FAF5EC",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Start planning
          </button>
          <Link
            href="/marketplace"
            style={{
              fontFamily: BODY,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "14px 32px",
              background: "rgba(250,240,225,0.10)",
              color: "#FAF5EC",
              border: "1px solid rgba(250,240,225,0.25)",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Browse vendors
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "rgba(250,240,225,0.30)",
            marginTop: 48,
            textTransform: "uppercase",
          }}
        >
          Marketplace · Stationery · Planner · Studio · Community
        </motion.p>
      </div>
    </section>
  );
}

// ── Categories grid ───────────────────────────────────────────────────────────
function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section style={{ padding: "96px 24px", background: "#F7F5F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <SectionLabel>Vendor marketplace</SectionLabel>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              color: "#1C1917",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Every vendor, curated.
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 16,
              color: "#6B6B6B",
              marginBottom: 48,
              maxWidth: 520,
            }}
          >
            From mandap decorators to dhol players. Browse by ceremony, style, and region.
          </p>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {categories.map((cat, i) => (
            <FadeUp key={cat.slug} delay={i * 0.04}>
              <Link href={`/marketplace?category=${cat.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    background: cat.bg,
                    cursor: "pointer",
                  }}
                >
                  {cat.photo && (
                    <Image
                      src={cat.photo}
                      alt={cat.name}
                      fill
                      style={{ objectFit: "cover", opacity: 0.55 }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "16px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#FAF5EC",
                        marginBottom: 2,
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        color: "rgba(250,245,236,0.6)",
                        textTransform: "uppercase",
                      }}
                    >
                      {cat.count} vendors
                    </p>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link
              href="/marketplace"
              style={{
                fontFamily: BODY,
                fontSize: 14,
                fontWeight: 500,
                color: "#B8755D",
                textDecoration: "none",
                borderBottom: "1px solid #B8755D",
                paddingBottom: 2,
              }}
            >
              Browse all vendors →
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Platform modules ──────────────────────────────────────────────────────────
function PlatformSection() {
  const featured = PLATFORM_MODULES.slice(0, 6);
  return (
    <section
      style={{
        padding: "96px 24px",
        background: "#1A1410",
        color: "#FAF5EC",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#D4A96A",
              marginBottom: 12,
            }}
          >
            The planning platform
          </p>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              color: "#FAF5EC",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Built for the multi-day wedding.
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 16,
              color: "rgba(250,245,236,0.55)",
              marginBottom: 56,
              maxWidth: 480,
            }}
          >
            Nine modules, one platform. Everything from muhurtham-aware timelines to guest
            management across both families.
          </p>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            border: "1px solid rgba(250,245,236,0.08)",
          }}
        >
          {featured.map((mod, i) => (
            <FadeUp key={mod.slug} delay={i * 0.05}>
              <Link href={`/platform#${mod.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "36px 32px",
                    borderRight: "1px solid rgba(250,245,236,0.08)",
                    borderBottom: "1px solid rgba(250,245,236,0.08)",
                    height: "100%",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "rgba(250,245,236,0.04)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                  }
                >
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#D4A96A",
                      marginBottom: 10,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 20,
                      fontWeight: 400,
                      color: "#FAF5EC",
                      marginBottom: 10,
                    }}
                  >
                    {mod.title}
                  </p>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(250,245,236,0.55)",
                    }}
                  >
                    {mod.blurb}
                  </p>
                  <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {mod.pills.map((pill) => (
                      <span
                        key={pill}
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          padding: "4px 10px",
                          border: "1px solid rgba(250,245,236,0.15)",
                          borderRadius: 100,
                          color: "rgba(250,245,236,0.45)",
                        }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.15}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link
              href="/platform"
              style={{
                fontFamily: BODY,
                fontSize: 14,
                fontWeight: 500,
                color: "#D4A96A",
                textDecoration: "none",
                borderBottom: "1px solid #D4A96A",
                paddingBottom: 2,
              }}
            >
              Explore all features →
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Studio CTA ────────────────────────────────────────────────────────────────
function StudioCta() {
  return (
    <section
      style={{
        padding: "96px 24px",
        background: "#F0EAE0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <FadeUp>
          <SectionLabel>Wedding website studio</SectionLabel>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              color: "#1C1917",
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Your wedding,
            <br />
            beautifully published.
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 16,
              lineHeight: 1.7,
              color: "#6B6B6B",
              marginBottom: 32,
            }}
          >
            Choose from 17 hand-crafted templates — from dramatic photo-art backdrops to
            full editorial HTML designs. Personalise with your names, story, and events.
            Published in minutes.
          </p>
          <Link
            href="/studio"
            style={{
              display: "inline-block",
              fontFamily: BODY,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "14px 28px",
              background: "#1C1917",
              color: "#FAF5EC",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Open studio →
          </Link>
        </FadeUp>

        {/* Template grid preview */}
        <FadeUp delay={0.15}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { bg: "#2C1A2E", label: "Baroque Dark Rose" },
              { bg: "#0A2A3B", label: "Celestial Midnight" },
              { bg: "#1A0A05", label: "Pichwai Nandi" },
              { bg: "#3A2010", label: "Royal Mughal" },
              { bg: "#FAF5EC", label: "Ivory & Gold" },
              { bg: "#14240E", label: "Botanical Garden" },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  background: t.bg,
                  borderRadius: 8,
                  aspectRatio: "4/3",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 10,
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Journal preview ───────────────────────────────────────────────────────────
function JournalSection() {
  const featured = JOURNAL.slice(0, 3);

  return (
    <section style={{ padding: "96px 24px", background: "#F7F5F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <SectionLabel>Community journal</SectionLabel>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              color: "#1C1917",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Vendor notes. Tradition guides.
            <br />
            Real weddings.
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 16,
              color: "#6B6B6B",
              marginBottom: 56,
              maxWidth: 480,
            }}
          >
            Written by the vendors and couples who know what actually matters.
          </p>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {featured.map((entry, i) => (
            <FadeUp key={entry.slug} delay={i * 0.07}>
              <Link
                href={`/community/${entry.slug}`}
                style={{ textDecoration: "none", display: "block", height: "100%" }}
              >
                <article
                  style={{
                    background: entry.bg,
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "36px 32px 28px", flex: 1 }}>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.45)",
                        marginBottom: 16,
                      }}
                    >
                      {entry.kicker} · {entry.readTime}
                    </p>
                    <h3
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 22,
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: entry.fg,
                        marginBottom: 16,
                      }}
                    >
                      {entry.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: `${entry.fg}99`,
                      }}
                    >
                      {entry.dek}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "16px 32px",
                      borderTop: `1px solid ${entry.fg}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 12,
                        color: `${entry.fg}60`,
                      }}
                    >
                      {entry.author}
                    </p>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: `${entry.fg}50`,
                      }}
                    >
                      {entry.date}
                    </p>
                  </div>
                </article>
              </Link>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link
              href="/community"
              style={{
                fontFamily: BODY,
                fontSize: 14,
                fontWeight: 500,
                color: "#B8755D",
                textDecoration: "none",
                borderBottom: "1px solid #B8755D",
                paddingBottom: 2,
              }}
            >
              Read all articles →
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCta() {
  const openSignIn = useAuthStore((s) => s.openSignIn);

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "#1C1410",
        textAlign: "center",
        color: "#FAF5EC",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <FadeUp>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#D4A96A",
              marginBottom: 24,
            }}
          >
            Start planning today
          </p>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 400,
              lineHeight: 1.12,
              color: "#FAF5EC",
              marginBottom: 20,
            }}
          >
            The wedding
            <br />
            you&apos;ve been planning
            <br />
            <em style={{ color: "#D4A96A" }}>since forever.</em>
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(250,245,236,0.55)",
              marginBottom: 40,
            }}
          >
            Create your account and get access to the full platform — marketplace,
            planner, studio, and stationery.
          </p>
          <button
            onClick={() => openSignIn()}
            style={{
              fontFamily: BODY,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "16px 40px",
              background: "#B8755D",
              color: "#FAF5EC",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Create free account
          </button>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export function HomePage({ categories }: { categories: Category[] }) {
  return (
    <>
      <Hero />
      <CategoriesSection categories={categories} />
      <PlatformSection />
      <StudioCta />
      <JournalSection />
      <FinalCta />
    </>
  );
}
