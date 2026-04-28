"use client";

// ── /studio/magazine/[slug] ─────────────────────────────────────────────────
// Individual wedding feature article — the editorial view a reader lands on
// after clicking into a featured wedding from /studio/magazine. Long-form
// magazine layout: hero, fact bar, narrative sections, photo breaks, pull
// quote, couple block quote, vendor team, and a "more from the magazine"
// row. All content is hardcoded mock data for Priya & Arjun (Nov 2026,
// Umaid Bhawan Palace, Jodhpur). No persistence.

import { useState } from "react";
import NextLink from "next/link";
import {
  ArrowUpRight,
  Camera,
  Heart,
  Link as LinkIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";

// ── Mock data ───────────────────────────────────────────────────────────────

const WEDDING = {
  kicker: "Real Wedding",
  couple: "Priya & Arjun",
  tagline:
    "Four days of celebration in Jodhpur — rooted in love, ritual, and every song we danced to along the way.",
  date: "November 13, 2026",
  venue: "Umaid Bhawan Palace",
  location: "Jodhpur, Rajasthan",
  guests: "450 Guests",
  events: "Mehendi, Sangeet, Wedding, Reception",
  tradition: "Telugu-Malayali",
  season: "Fall 2026",
  planner: "The Wedding Soirée Co.",
  photographer: "Stories by Joseph Radhik",
  heroGradient: "from-[#F1D6C2] via-[#D89874] to-[#9E5237]",
};

type SectionHeadingProps = { children: React.ReactNode };
function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2
      className="mb-6 text-[34px] font-light leading-[1.05] tracking-[-0.01em] text-ink lowercase"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </h2>
  );
}

function BodyParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6 text-[16px] leading-[1.75] text-ink-soft"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </p>
  );
}

function PhotoPlaceholder({
  gradient,
  aspect = "aspect-[4/3]",
  caption,
  className,
}: {
  gradient: string;
  aspect?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm bg-gradient-to-br",
          aspect,
          gradient,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(0,0,0,0.12),transparent_55%)]" />
      </div>
      {caption && (
        <figcaption
          className="mt-3 text-center text-[13px] italic text-ink-muted"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── "More weddings" mini-data (kept local for self-containment) ─────────────

const MORE = [
  {
    slug: "sneha-arjun",
    couple: "sneha & arjun",
    tagline: "four days, two pandits, a telugu-malayali love story.",
    meta: "Hyderabad → Udaipur · Mar 2026",
    gradient: "from-[#E9C8B5] via-[#D8A080] to-[#B56A4A]",
    tradition: "Telugu · Malayali",
    venue: "Palace",
  },
  {
    slug: "meera-julian",
    couple: "meera & julian",
    tagline: "a barefoot ceremony, two priests, a shared first dance.",
    meta: "London → Goa · Jan 2026",
    gradient: "from-[#E4DCC8] via-[#C7BFA7] to-[#8AA38C]",
    tradition: "Hindu · Catholic",
    venue: "Beach",
  },
  {
    slug: "aisha-kabir",
    couple: "aisha & kabir",
    tagline: "mehendi at dusk, the lake turning gold under a borrowed sky.",
    meta: "Karachi → Lake Como · Jun 2026",
    gradient: "from-[#EEDCB0] via-[#D6B77A] to-[#9C7A3E]",
    tradition: "Pakistani · Muslim",
    venue: "Estate",
  },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function WeddingFeaturePage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative">
        <div
          className={cn(
            "relative h-[60vh] min-h-[480px] w-full bg-gradient-to-br",
            WEDDING.heroGradient,
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(0,0,0,0.18),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ivory via-ivory/80 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[980px] px-6 pb-12 md:pb-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-rose">
              {WEDDING.kicker}
            </p>
            <h1
              className="mt-4 text-[44px] font-light leading-[1.02] tracking-[-0.01em] text-ink md:text-[56px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {WEDDING.couple}
            </h1>
            <p
              className="mt-4 max-w-[620px] text-[17px] italic leading-[1.45] text-ink-muted md:text-[18px]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {WEDDING.tagline}
            </p>
            <p className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.24em] text-ink-soft">
              {WEDDING.date} · {WEDDING.venue}, {WEDDING.location.split(",")[0]} ·{" "}
              {WEDDING.guests} · {WEDDING.tradition}
            </p>
            <p
              className="mt-3 text-[13px] italic text-ink-muted"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Photography by {WEDDING.photographer}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Details Bar ──────────────────────────────────────────── */}
      <section className="border-y border-[#E8E4DF] bg-ivory">
        <div className="mx-auto max-w-[1120px] px-6">
          <dl className="grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4 md:gap-y-0 md:py-10 lg:grid-cols-7">
            {[
              ["Venue", WEDDING.venue],
              ["Location", WEDDING.location],
              ["Guests", "450"],
              ["Events", "Mehendi · Sangeet · Wedding · Reception"],
              ["Traditions", "Telugu & Malayali"],
              ["Season", WEDDING.season],
              ["Planner", WEDDING.planner],
            ].map(([label, value]) => (
              <div key={label} className="px-2 text-center lg:px-3">
                <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted">
                  {label}
                </dt>
                <dd
                  className="mt-2 text-[13.5px] leading-[1.35] text-ink"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Article body + sticky share bar ────────────────────────────── */}
      <div className="relative mx-auto max-w-[1120px] px-6">
        <StickyShareBar saved={saved} onSave={() => setSaved((s) => !s)} />

        <article className="mx-auto max-w-[720px] py-16 md:py-24">
          {/* ── the love story ── */}
          <SectionHeading>the love story.</SectionHeading>
          <BodyParagraph>
            Priya and Arjun first met on a rain-soaked afternoon in Bangalore,
            trading seats on a delayed flight that neither of them had wanted
            to take. She was heading home from a sister&rsquo;s engagement.
            He was flying in for a cousin&rsquo;s wedding. By the time the
            plane finally lifted, they had compared notes on grandmothers,
            filter coffee, and the correct way to fold a sari &mdash; and, as
            Priya tells it, she already knew.
          </BodyParagraph>
          <BodyParagraph>
            Three years later, on a walk through Cubbon Park in the first
            cool week of October, Arjun proposed with his grandmother&rsquo;s
            ring and a speech he&rsquo;d been rehearsing in the shower for
            months. &ldquo;He forgot the middle part entirely,&rdquo; Priya
            laughs. &ldquo;I said yes anyway. I liked the ending.&rdquo;
          </BodyParagraph>

          {/* Photo break */}
          <PhotoPlaceholder
            gradient="from-[#F3DCC7] via-[#DDA683] to-[#A05F3E]"
            aspect="aspect-[3/2]"
            caption="a quiet moment before the baraat — the groom with his grandfather."
            className="my-12"
          />

          {/* ── the vision ── */}
          <SectionHeading>the vision.</SectionHeading>
          <BodyParagraph>
            From the first planning conversation, the couple knew they wanted
            the wedding to feel less like a production and more like a family
            reunion that happened to include a marriage. Jodhpur &mdash; and
            Umaid Bhawan Palace &mdash; was the natural choice: warm stone,
            endless courtyards, and the kind of golden light that makes every
            photograph feel remembered.
          </BodyParagraph>
          <BodyParagraph>
            The palette moved with the light: sunrise peach for the mehendi,
            deep marigold and rust for the sangeet, a quieter ivory-and-gold
            for the wedding itself, and finally a jewel-toned emerald for
            reception night. The two families &mdash; one Telugu, one
            Malayali &mdash; each brought traditions the couple wanted to
            keep whole, not blend into something unrecognizable.
          </BodyParagraph>

          <PullQuote>
            We didn&rsquo;t want a wedding that looked like a Pinterest
            board. We wanted one that sounded like our grandmothers laughing
            in the next room.
            <cite>— Priya</cite>
          </PullQuote>

          {/* ── 2x2 photo grid ── */}
          <div className="my-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <PhotoPlaceholder
              gradient="from-[#EDCBB2] via-[#D39C78] to-[#A4623E]"
              aspect="aspect-square"
              caption="mehendi details"
            />
            <PhotoPlaceholder
              gradient="from-[#F2E3CC] via-[#D9BE91] to-[#A3814B]"
              aspect="aspect-square"
              caption="the invitation suite"
            />
            <PhotoPlaceholder
              gradient="from-[#F6DDCA] via-[#E0A889] to-[#B56C48]"
              aspect="aspect-square"
              caption="table setting"
            />
            <PhotoPlaceholder
              gradient="from-[#E9D4B0] via-[#C9A36E] to-[#88653A]"
              aspect="aspect-square"
              caption="floral arrangements"
            />
          </div>

          {/* ── the events ── */}
          <SectionHeading>the events.</SectionHeading>

          <EventSubHeading>Mehendi</EventSubHeading>
          <BodyParagraph>
            The mehendi unfolded in the palace&rsquo;s western courtyard on
            the first afternoon, shaded by jali screens and scented with
            jasmine. Priya sat with twenty-three of the women in her life
            &mdash; mother, aunts, sisters, cousins, grandmothers on both
            sides &mdash; while three artists worked their way up her arms.
            Filter coffee was served in brass tumblers; somebody&rsquo;s
            aunt started singing before anyone asked.
          </BodyParagraph>

          <EventSubHeading>Sangeet</EventSubHeading>
          <BodyParagraph>
            The sangeet was staged in the palace&rsquo;s Baradari lawn under
            a sky of paper lanterns. Ten months of family rehearsals paid
            off: the bride&rsquo;s cousins opened with a Bharatanatyam piece,
            the groom&rsquo;s friends countered with something they
            generously called choreography, and the fathers &mdash; neither
            of whom had agreed to dance in advance &mdash; closed the night
            to a song from the 70s neither family had heard in years.
          </BodyParagraph>

          <EventSubHeading>Wedding Ceremony</EventSubHeading>
          <BodyParagraph>
            Two pandits, two ceremonies, one morning. The Telugu rites came
            first at sunrise, then the Malayali rituals followed seamlessly
            beneath the same mandap &mdash; the families had rehearsed the
            handoff like a relay. The ceremony ran long. Nobody minded. A
            great-aunt who&rsquo;d flown from Trivandrum cried at both halves.
          </BodyParagraph>

          <EventSubHeading>Reception</EventSubHeading>
          <BodyParagraph>
            Reception night was emerald and gold, held in the palace&rsquo;s
            main ballroom with a live band flown in from Mumbai. The first
            dance was to a song Priya&rsquo;s grandmother used to sing in
            the kitchen. The last song was at 3:47 a.m., and the dance floor
            emptied only because the staff started (politely) stacking chairs.
          </BodyParagraph>

          {/* Panoramic photo break */}
          <PhotoPlaceholder
            gradient="from-[#E7C6A8] via-[#C88C63] to-[#6F3E24]"
            aspect="aspect-[21/9]"
            caption="umaid bhawan palace at dusk, the evening of the wedding ceremony."
            className="my-16"
          />

          {/* ── in their own words ── */}
          <SectionHeading>in their own words.</SectionHeading>
          <InTheirOwnWords />

          {/* ── the vendor team ── */}
          <section className="mt-20">
            <SectionHeading>the vendor team.</SectionHeading>
            <p
              className="mb-10 text-[14.5px] italic text-ink-muted"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              The extraordinary team behind Priya &amp; Arjun&rsquo;s four days.
            </p>
            <VendorTeam />
          </section>
        </article>
      </div>

      {/* ── More weddings ──────────────────────────────────────────────── */}
      <section className="border-t border-[#E8E4DF] bg-ivory">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <h2
              className="text-[34px] font-light lowercase leading-[1.05] tracking-[-0.01em] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              more from the magazine.
            </h2>
            <NextLink
              href="/community?tab=editorial&sub=magazine"
              className="hidden items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-rose hover:underline md:inline-flex"
            >
              All Features
              <ArrowUpRight size={14} strokeWidth={1.8} />
            </NextLink>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MORE.map((w) => (
              <MoreCard key={w.slug} wedding={w} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8E4DF] py-10">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
          <p className="text-[11px] uppercase tracking-[0.24em] text-ink-muted">
            You &amp; Partner &mdash; Editorial
          </p>
          <NextLink
            href="/studio/magazine/submit"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-rose hover:underline"
          >
            Submit Your Wedding
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </NextLink>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function EventSubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-rose">
      {children}
    </h3>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-14 border-l-2 border-rose pl-8">
      <span
        className="pointer-events-none block text-[64px] leading-none text-rose/60"
        style={{ fontFamily: "var(--font-display)" }}
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p
        className="-mt-4 text-[26px] font-light italic leading-[1.35] text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </p>
    </blockquote>
  );
}

function InTheirOwnWords() {
  return (
    <div className="my-4 rounded-sm border-l-[3px] border-rose bg-[#FFF5EF] px-8 py-10 md:px-12 md:py-12">
      <p
        className="text-[17px] italic leading-[1.7] text-ink-soft"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        &ldquo;The moment we&rsquo;ll keep was smaller than we expected. After
        the pheras, in the narrow hallway between the ceremony and the
        lunch tent, both our mothers just stopped &mdash; they&rsquo;d been
        holding each other&rsquo;s hands without realizing, and neither of
        them wanted to let go. No photographer was there. No one was
        watching. That&rsquo;s the memory. The rest of the four days was
        beautiful, of course, but that&rsquo;s the part we talk about at
        night.&rdquo;
      </p>
      <p className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.28em] text-rose">
        &mdash; Priya &amp; Arjun
      </p>
    </div>
  );
}

// ── Vendor team ─────────────────────────────────────────────────────────────

const VENDORS: Array<{ category: string; name: string; slug: string }> = [
  { category: "Venue", name: "Umaid Bhawan Palace", slug: "umaid-bhawan-palace" },
  { category: "Planner", name: "The Wedding Soirée Co.", slug: "wedding-soiree-co" },
  { category: "Photographer", name: "Stories by Joseph Radhik", slug: "joseph-radhik" },
  { category: "Videographer", name: "House on the Clouds", slug: "house-on-the-clouds" },
  { category: "Florist", name: "Phoolwala Atelier", slug: "phoolwala-atelier" },
  { category: "Caterer", name: "Marigold & Saffron", slug: "marigold-saffron" },
  { category: "Band", name: "The Mumbai Connective", slug: "mumbai-connective" },
  { category: "Makeup", name: "Namrata Soni", slug: "namrata-soni" },
  { category: "Mehendi Artist", name: "Veena Nagda", slug: "veena-nagda" },
  { category: "Invitations", name: "Paperweight Press", slug: "paperweight-press" },
  { category: "Décor", name: "Shaadi Squad Design", slug: "shaadi-squad-design" },
];

function VendorTeam() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      {VENDORS.map((v) => (
        <NextLink
          key={v.slug}
          href={`/vendor/${v.slug}`}
          className="group flex items-baseline justify-between gap-6 border-b border-[#E8E4DF] pb-4 transition-colors hover:border-rose"
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-ink-muted">
              {v.category}
            </p>
            <p
              className="mt-1.5 text-[17px] leading-[1.25] text-ink transition-colors group-hover:text-rose"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {v.name}
            </p>
          </div>
          <ArrowUpRight
            size={16}
            strokeWidth={1.6}
            className="shrink-0 translate-y-1 text-ink-muted transition-colors group-hover:text-rose"
          />
        </NextLink>
      ))}
    </div>
  );
}

// ── Sticky share bar ────────────────────────────────────────────────────────

function StickyShareBar({
  saved,
  onSave,
}: {
  saved: boolean;
  onSave: () => void;
}) {
  const actions = [
    { label: "Copy link", icon: LinkIcon },
    { label: "Pinterest", icon: Share2 },
    { label: "Instagram", icon: Camera },
    { label: "WhatsApp", icon: MessageCircle },
  ];

  return (
    <>
      {/* Desktop — left rail */}
      <aside className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden lg:block">
        <div className="sticky top-32 flex flex-col items-center gap-3 py-8 pl-2 pointer-events-auto">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              aria-label={a.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E4DF] bg-white text-ink-muted transition-colors hover:border-rose hover:text-rose"
            >
              <a.icon size={15} strokeWidth={1.6} />
            </button>
          ))}
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? "Remove from saved" : "Save feature"}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
              saved
                ? "border-rose bg-rose text-white"
                : "border-[#E8E4DF] bg-white text-ink-muted hover:border-rose hover:text-rose",
            )}
          >
            <Heart
              size={15}
              strokeWidth={1.8}
              className={cn(saved && "fill-current")}
            />
          </button>
          <div className="my-2 h-6 w-px bg-[#E8E4DF]" />
          <NextLink
            href="/studio/magazine/submit"
            className="writing-vertical text-[10px] font-medium uppercase tracking-[0.28em] text-rose hover:underline"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
            }}
          >
            Submit yours →
          </NextLink>
        </div>
      </aside>

      {/* Mobile — bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E8E4DF] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {actions.slice(0, 4).map((a) => (
              <button
                key={a.label}
                type="button"
                aria-label={a.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E4DF] bg-white text-ink-muted hover:text-rose"
              >
                <a.icon size={14} strokeWidth={1.6} />
              </button>
            ))}
            <button
              type="button"
              onClick={onSave}
              aria-label={saved ? "Remove from saved" : "Save feature"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                saved
                  ? "border-rose bg-rose text-white"
                  : "border-[#E8E4DF] bg-white text-ink-muted hover:text-rose",
              )}
            >
              <Heart
                size={14}
                strokeWidth={1.8}
                className={cn(saved && "fill-current")}
              />
            </button>
          </div>
          <NextLink
            href="/studio/magazine/submit"
            className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-rose hover:underline"
          >
            Submit yours →
          </NextLink>
        </div>
      </div>
    </>
  );
}

// ── More weddings card ──────────────────────────────────────────────────────

function MoreCard({ wedding }: { wedding: (typeof MORE)[number] }) {
  return (
    <NextLink
      href={`/studio/magazine/${wedding.slug}`}
      className="group block"
    >
      <div
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-gradient-to-br",
          wedding.gradient,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-white/85">
            {wedding.tradition} · {wedding.venue}
          </p>
          <h3
            className="mt-2 text-[24px] font-light leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {wedding.couple}.
          </h3>
        </div>
      </div>
      <p
        className="mt-4 text-[15px] italic leading-[1.45] text-ink-soft"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        &ldquo;{wedding.tagline}&rdquo;
      </p>
      <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-ink-muted">
        {wedding.meta}
      </p>
    </NextLink>
  );
}
