"use client";

// ── /community/blog/[slug] ──────────────────────────────────────────────────
// Long-form reading view for a Blog post. Keeps the same block-renderer shape
// as the old /journal/[slug] page (paragraph with drop cap, pull quote,
// inline image) but wraps in the app TopNav instead of the marketing
// SiteLayout. Related articles link back into /community/blog.

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/shell/TopNav";
import { JOURNAL } from "@/lib/marketing/data";
import { BLOG_CATEGORIES } from "@/lib/community/seed";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = JOURNAL.find((j) => j.slug === slug);
  if (!entry) return notFound();

  const categoryLabel =
    BLOG_CATEGORIES.find((c) => c.tags.includes(entry.tag))?.label ?? entry.tag;

  const related = JOURNAL.filter(
    (j) => j.slug !== entry.slug && j.tag === entry.tag,
  )
    .concat(JOURNAL.filter((j) => j.slug !== entry.slug && j.tag !== entry.tag))
    .slice(0, 3);

  let firstParagraphSeen = false;

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[960px] px-6 pb-2 pt-6 md:px-0">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition-colors hover:text-saffron"
          style={{ fontFamily: BODY }}
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to Community
        </Link>
      </div>

      {/* Article header */}
      <article className="mx-auto max-w-[960px] px-6 md:px-0">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="py-12"
        >
          <div className="flex items-center gap-3">
            <span
              className="rounded-full border border-ink/20 px-3 py-1 text-[10px] uppercase text-ink"
              style={{ fontFamily: BODY, letterSpacing: "0.25em" }}
            >
              {categoryLabel}
            </span>
            <span
              className="text-[11px] uppercase text-ink-faint"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              {entry.kicker}
            </span>
          </div>
          <h1
            className="mt-6 text-ink"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(34px, 5vw, 68px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              fontWeight: 400,
            }}
          >
            {entry.title}
          </h1>
          <p
            className="mt-6 max-w-[640px] italic text-ink-muted"
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              lineHeight: 1.5,
            }}
          >
            {entry.dek}
          </p>
          <div
            className="mt-8 flex items-center gap-5 text-ink-faint"
            style={{ fontFamily: BODY, fontSize: 13, letterSpacing: "0.04em" }}
          >
            <span>{entry.author}</span>
            <span className="h-[3px] w-[3px] rotate-45 bg-saffron" />
            <span>{entry.date}</span>
            <span className="h-[3px] w-[3px] rotate-45 bg-saffron" />
            <span>{entry.readTime}</span>
          </div>
        </motion.header>
      </article>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto aspect-[2/1] w-full max-w-[1400px] px-0 md:aspect-[5/2] md:px-12"
      >
        <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: entry.bg }}>
          {entry.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.image}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
            />
          )}
        </div>
      </motion.div>

      {/* Body */}
      <article className="mx-auto max-w-[720px] px-6 py-20 md:px-0 md:py-28">
        {entry.body.map((block, i) => {
          if (block.type === "p") {
            const isFirst = !firstParagraphSeen;
            if (isFirst) firstParagraphSeen = true;
            return <Paragraph key={i} text={block.text} withDropCap={isFirst} />;
          }
          if (block.type === "quote") {
            return (
              <PullQuote
                key={i}
                text={block.text}
                attribution={block.attribution}
              />
            );
          }
          return (
            <InlineImage
              key={i}
              bg={block.bg}
              src={block.src}
              caption={block.caption}
              aspect={block.aspect}
            />
          );
        })}
      </article>

      {/* Related */}
      <section className="mx-auto max-w-[1400px] border-t border-ink/10 px-6 py-20 md:px-12 md:py-24">
        <h2
          className="mb-10"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            fontWeight: 400,
          }}
        >
          more from <span style={{ fontStyle: "italic" }}>the community</span>
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/community/blog/${r.slug}`}
              className="group block"
            >
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"
                style={{ backgroundColor: r.bg }}
              >
                {r.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <span
                  className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] uppercase backdrop-blur-sm"
                  style={{
                    fontFamily: BODY,
                    letterSpacing: "0.25em",
                    color: r.image ? "#fff" : r.fg,
                    backgroundColor: "rgba(0,0,0,0.22)",
                  }}
                >
                  {r.tag}
                </span>
              </div>
              <h3
                className="mt-4 text-ink transition-colors group-hover:text-saffron"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 22,
                  lineHeight: 1.2,
                  letterSpacing: "-0.005em",
                  fontWeight: 500,
                }}
              >
                {r.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Block renderers ─────────────────────────────────────────────────────────

function Paragraph({
  text,
  withDropCap,
}: {
  text: string;
  withDropCap: boolean;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 text-ink/85"
      style={{ fontFamily: BODY, fontSize: 18, lineHeight: 1.8 }}
    >
      {withDropCap ? (
        <>
          <span
            className="float-left mr-3 text-saffron"
            style={{
              fontFamily: DISPLAY,
              fontSize: 72,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {text.charAt(0)}
          </span>
          {text.slice(1)}
        </>
      ) : (
        text
      )}
    </motion.p>
  );
}

function PullQuote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="my-14 border-l-2 border-saffron pl-8 md:my-20"
    >
      <blockquote
        className="text-ink"
        style={{
          fontFamily: DISPLAY,
          fontStyle: "italic",
          fontSize: "clamp(24px, 3vw, 34px)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          fontWeight: 400,
        }}
      >
        &ldquo;{text}&rdquo;
      </blockquote>
      {attribution && (
        <figcaption
          className="mt-5 text-ink-faint"
          style={{
            fontFamily: BODY,
            fontSize: 12.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          — {attribution}
        </figcaption>
      )}
    </motion.figure>
  );
}

function InlineImage({
  bg,
  src,
  caption,
  aspect = "wide",
}: {
  bg: string;
  src?: string;
  caption?: string;
  aspect?: "wide" | "tall" | "square";
}) {
  const aspectClass =
    aspect === "tall"
      ? "aspect-[4/5]"
      : aspect === "square"
        ? "aspect-square"
        : "aspect-[16/9]";
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="my-12 md:my-16"
    >
      <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg`} style={{ backgroundColor: bg }}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      {caption && (
        <figcaption
          className="mt-4 text-ink-faint"
          style={{
            fontFamily: BODY,
            fontSize: 12.5,
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
