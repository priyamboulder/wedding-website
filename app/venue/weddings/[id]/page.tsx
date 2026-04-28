import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SectionHeader,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import { SETUP_DISPLAY, VendorBadge } from "@/components/venue/showcase-ui";
import {
  SHOWCASE_WEDDINGS,
  VENDOR_CATEGORY_META,
  VENUE,
} from "@/lib/venue/seed";

export function generateStaticParams() {
  return SHOWCASE_WEDDINGS.map((w) => ({ id: w.id }));
}

export default function WeddingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const wedding = SHOWCASE_WEDDINGS.find((w) => w.id === params.id);
  if (!wedding) notFound();

  const gallery = wedding.photoGallery ?? [wedding.heroImageUrl];

  return (
    <div className="mx-auto max-w-[1200px] px-8 pt-8 pb-16">
      {/* Back link */}
      <Link
        href="/venue/weddings"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9E8245] hover:text-[#C4A265]"
      >
        <span aria-hidden>←</span>
        Back to Showcase
      </Link>

      {/* Title block */}
      <section className="mt-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
          Wedding showcase
        </p>
        <h1
          className="mt-2 text-[48px] leading-[1.02] text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {wedding.coupleNames}'s Wedding
        </h1>
        <p
          className="mt-2 text-[15px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {wedding.dateRange}
          <Dot />
          {wedding.ceremonyType}
          {wedding.ceremonyDetail ? ` ${wedding.ceremonyDetail}` : ""}
          <Dot />
          {wedding.duration} celebration
        </p>
        <p className="mt-1 text-[13px] text-[#5a5a5a]">
          <span className="font-mono text-[12px] text-[#2C2C2C]">
            {wedding.guestCount}
          </span>{" "}
          guests
          <Dot />
          {wedding.spaces.join(" + ")}
          <Dot />
          {SETUP_DISPLAY[wedding.setup]}
        </p>
      </section>

      {/* Gallery */}
      <section className="mt-8">
        <PhotoGallery photos={gallery} featuredIndex={0} />
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          {wedding.photoCount} photos
          <span className="mx-2 text-[#cdbf9c]">·</span>
          pulled from Instagram posts by vendors and the planner
        </p>
      </section>

      {/* Two-column: events + venue CTA; vendor team full width below */}
      {wedding.events && wedding.events.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Events" eyebrow="Multi-day breakdown" />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {wedding.events.map((day) => (
              <VenueCard key={day.label} className="p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                  {day.label}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {day.items.map((item, i) => (
                    <li key={`${item.name}-${i}`}>
                      <p
                        className="text-[18px] leading-tight text-[#2C2C2C]"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                      </p>
                      <p className="text-[12px] text-[#6a6a6a]">{item.space}</p>
                    </li>
                  ))}
                </ul>
              </VenueCard>
            ))}
          </div>
        </section>
      )}

      {/* Vendor team */}
      <section className="mt-12">
        <SectionHeader
          title="The Full Vendor Team"
          eyebrow={`${wedding.vendors.length} vendors`}
        />
        <VenueCard className="mt-5 overflow-hidden">
          <ul>
            {wedding.vendors.map((v, i) => {
              const meta = VENDOR_CATEGORY_META[v.category];
              return (
                <li
                  key={`${v.category}-${i}`}
                  className={i === 0 ? "" : "border-t"}
                  style={
                    i === 0
                      ? undefined
                      : { borderColor: VENUE_PALETTE.hairlineSoft }
                  }
                >
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span aria-hidden className="w-6 text-[16px]">
                      {meta.icon}
                    </span>
                    <span className="min-w-[180px] font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                      {meta.label}
                    </span>
                    <span
                      className="flex-1 text-[14px] text-[#2C2C2C]"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {v.name}
                    </span>
                    {v.badge === "select" && <VendorBadge kind="select" />}
                    {v.badge === "verified" && <VendorBadge kind="verified" />}
                    <Link
                      href={v.href ?? "#"}
                      className="shrink-0 text-[12px] font-medium text-[#9E8245] hover:text-[#C4A265]"
                    >
                      View →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </VenueCard>
      </section>

      {/* CTA */}
      <section
        className="mt-12 rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "#FBF1DF",
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
        }}
      >
        <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
          Inspired by this wedding?
        </p>
        <h2
          className="mt-2 text-[28px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.005em",
          }}
        >
          Planning a similar wedding at {VENUE.name}?
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Inquire with this venue
            <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            className="rounded-full px-5 py-2.5 text-[13px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            }}
          >
            Book a tour
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- Photo gallery ------------------------------- */

function PhotoGallery({
  photos,
  featuredIndex = 0,
}: {
  photos: string[];
  featuredIndex?: number;
}) {
  const featured = photos[featuredIndex];
  const thumbs = photos.filter((_, i) => i !== featuredIndex);

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
      <div
        className="relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2"
        style={{ aspectRatio: "4 / 3" }}
      >
        <img
          src={featured}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {thumbs.slice(0, 4).map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative overflow-hidden rounded-xl"
          style={{ aspectRatio: "4 / 3" }}
        >
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}
      {/* Extra rows for the remaining photos */}
      {thumbs.length > 4 && (
        <div
          className="md:col-span-4 grid grid-cols-3 gap-2 md:grid-cols-6"
          style={{ gridColumn: "1 / -1" }}
        >
          {thumbs.slice(4).map((src, i) => (
            <div
              key={`rest-${src}-${i}`}
              className="relative overflow-hidden rounded-lg"
              style={{ aspectRatio: "1 / 1" }}
            >
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dot() {
  return (
    <span className="mx-1.5 text-[#b5a68e]" aria-hidden>
      ·
    </span>
  );
}
