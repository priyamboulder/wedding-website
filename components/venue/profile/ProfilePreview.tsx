"use client";

import { useMemo, useState } from "react";
import { VENUE_PALETTE } from "@/components/venue/ui";
import type { VenueProfile } from "@/lib/venue/profile-seed";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

/* Right-panel preview: how couples browsing Ananya see this venue.
   Reads from the same VenueProfile the editor mutates, so changes reflect instantly. */

export function ProfilePreview({ profile }: { profile: VenueProfile }) {
  const visibleGallery = profile.gallery.filter((p) => !p.hidden);
  const featured = visibleGallery.filter((p) => p.featured);
  const heroPhoto = featured[0] ?? visibleGallery[0];

  const maxCeremony = useMemo(
    () => Math.max(...profile.spaces.map((s) => s.capacity.ceremony), 0),
    [profile.spaces]
  );

  return (
    <div
      className="h-full overflow-hidden rounded-2xl border"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        backgroundColor: "#FFFFFF",
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.18)",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{
          borderColor: VENUE_PALETTE.hairline,
          backgroundColor: "#FAF8F5",
        }}
      >
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#E67E22" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#C4A265" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#27AE60" }} />
        </span>
        <span className="mx-auto rounded-full bg-white px-3 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)" }}>
          ananya.com/venues/{slugify(profile.basics.name)}
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          Couple view
        </span>
      </div>

      <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
        {/* Hero */}
        <div
          className="relative h-[260px] w-full"
          style={{
            backgroundImage: heroPhoto ? `url(${heroPhoto.url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#EAD3B0",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em]"
              style={{ color: "#F5E6D0" }}>
              {profile.basics.type} · {profile.basics.city}, {profile.basics.state}
            </p>
            <h1
              className="mt-1.5 text-[34px] leading-[1.05]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {profile.basics.name}
            </h1>
            <p
              className="mt-1 text-[14px] italic"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {profile.basics.tagline}
            </p>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#2C2C2C]">
              ◔ {profile.basics.instagram}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-9 px-6 py-7">
          <QuickStats profile={profile} maxCeremony={maxCeremony} />

          <section>
            <SectionTitle eyebrow="About">About this venue</SectionTitle>
            <div
              className="mt-3 space-y-3 text-[14.5px] leading-[1.7] text-[#3a3a3a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {profile.basics.description
                .split(/\n\s*\n/)
                .map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>

          <SpacesPreview profile={profile} />

          <AmenitiesPreview profile={profile} />

          <GalleryPreview profile={profile} />

          <PricingPreview profile={profile} />

          <CalendarPreview profile={profile} />

          <ContactFooter profile={profile} />
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ---------------------------- Subsections --------------------------- */

function SectionTitle({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#C4A265]">
        {eyebrow}
      </p>
      <h2
        className="mt-1 text-[24px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function QuickStats({
  profile,
  maxCeremony,
}: {
  profile: VenueProfile;
  maxCeremony: number;
}) {
  const rooms = profile.amenityGroups
    .flatMap((g) => g.items)
    .find((i) => i.id === "rooms")?.detail;
  const cheapest = profile.pricingTiers
    .map((t) => t.priceLow)
    .filter((n) => n > 0)
    .reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);

  const stats: { label: string; value: string }[] = [
    { label: "Capacity", value: `Up to ${maxCeremony}` },
    { label: "Spaces", value: `${profile.spaces.length}` },
    {
      label: "Starting at",
      value:
        cheapest === Number.POSITIVE_INFINITY
          ? "—"
          : `$${(cheapest / 1000).toFixed(0)}K`,
    },
    { label: "Rooms on-site", value: rooms ?? "—" },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 rounded-xl border p-4 sm:grid-cols-4"
      style={{ borderColor: VENUE_PALETTE.hairline, backgroundColor: "#FBF9F5" }}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9E8245]">
            {s.label}
          </p>
          <p
            className="mt-1 text-[18px] text-[#2C2C2C]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SpacesPreview({ profile }: { profile: VenueProfile }) {
  return (
    <section>
      <SectionTitle eyebrow="Spaces">Event spaces</SectionTitle>
      <div className="mt-4 space-y-4">
        {profile.spaces.map((space) => (
          <div
            key={space.id}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: VENUE_PALETTE.hairline }}
          >
            <div className="flex flex-wrap">
              <div className="relative h-[180px] w-full sm:w-[42%]">
                {space.photoUrls[0] ? (
                  <img
                    src={space.photoUrls[0]}
                    alt={space.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: "#EAD3B0" }}
                  />
                )}
                {space.photoUrls.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-[2px] font-mono text-[10px] text-white">
                    +{space.photoUrls.length - 1}
                  </span>
                )}
              </div>
              <div className="flex-1 p-4">
                <h3
                  className="text-[20px] leading-none text-[#2C2C2C]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {space.name}
                </h3>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9E8245]">
                  {space.type} · {space.floor} floor · {space.sqft.toLocaleString()} sq ft
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-[12.5px] text-[#3a3a3a]">
                  <CapacityChip label="Ceremony" value={space.capacity.ceremony} />
                  <CapacityChip label="Reception" value={space.capacity.reception} />
                  <CapacityChip label="Cocktail" value={space.capacity.cocktail} />
                </div>
                {space.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {space.features.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] text-[#5a4a30]"
                        style={{
                          backgroundColor: "#F5E6D0",
                          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.28)",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CapacityChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
        {label}
      </span>
      <span
        className="font-mono text-[13px] text-[#2C2C2C]"
        style={{ fontWeight: 500 }}
      >
        {value}
      </span>
    </span>
  );
}

function AmenitiesPreview({ profile }: { profile: VenueProfile }) {
  return (
    <section>
      <SectionTitle eyebrow="South Asian amenities">
        What this venue supports
      </SectionTitle>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {profile.amenityGroups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border p-4"
            style={{ borderColor: VENUE_PALETTE.hairline, backgroundColor: "#FFFFFF" }}
          >
            <h3
              className="text-[16px] text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {group.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {group.items
                .filter((i) => i.answer !== "no")
                .map((i) => (
                  <li key={i.id}>
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[5px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px]"
                        style={{
                          backgroundColor:
                            i.answer === "yes"
                              ? "rgba(39, 174, 96, 0.16)"
                              : "rgba(196, 162, 101, 0.16)",
                          color:
                            i.answer === "yes" ? "#1e6e3d" : "#6c5520",
                        }}
                      >
                        {i.answer === "yes" ? "✓" : "?"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[#2C2C2C]">
                          {i.label}
                          {i.detail && (
                            <span className="ml-1.5 font-mono text-[11px] text-[#9E8245]">
                              · {i.detail}
                            </span>
                          )}
                        </p>
                        {i.note && (
                          <p
                            className="mt-0.5 text-[11.5px] italic text-[#6a6a6a]"
                            style={{ fontFamily: "'EB Garamond', serif" }}
                          >
                            {i.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function GalleryPreview({ profile }: { profile: VenueProfile }) {
  const [tab, setTab] = useState<"marketing" | "instagram">("marketing");
  const visible = profile.gallery.filter((p) => !p.hidden && p.source === tab);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle eyebrow="Gallery">Photos of the property</SectionTitle>
        <div
          className="inline-flex rounded-full border p-1"
          style={{ borderColor: VENUE_PALETTE.hairline }}
        >
          <button
            type="button"
            onClick={() => setTab("marketing")}
            className={`rounded-full px-3 py-1 text-[11.5px] transition-colors ${
              tab === "marketing"
                ? "bg-[#F5E6D0] text-[#2C2C2C]"
                : "text-[#6a6a6a]"
            }`}
          >
            The venue
          </button>
          <button
            type="button"
            onClick={() => setTab("instagram")}
            className={`rounded-full px-3 py-1 text-[11.5px] transition-colors ${
              tab === "instagram"
                ? "bg-[#F5E6D0] text-[#2C2C2C]"
                : "text-[#6a6a6a]"
            }`}
          >
            Real weddings
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.slice(0, 9).map((photo) => (
          <figure
            key={photo.id}
            className="relative overflow-hidden rounded-lg"
          >
            <img
              src={photo.url}
              alt={photo.caption ?? ""}
              className="aspect-[4/3] w-full object-cover"
            />
            {photo.caption && (
              <figcaption
                className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/55 to-transparent px-2 py-1.5 text-[10.5px] text-white"
              >
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {visible.length > 9 && (
        <p className="mt-2 text-right font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9E8245]">
          + {visible.length - 9} more
        </p>
      )}

      {profile.virtualTourUrl && (
        <div
          className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: VENUE_PALETTE.hairline, backgroundColor: "#FBF1DF" }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
              360° virtual tour
            </p>
            <p className="text-[13px] text-[#5a4a30]">
              Walk the estate without leaving your couch.
            </p>
          </div>
          <a
            href={profile.virtualTourUrl}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#FAF8F5]"
            style={{ backgroundColor: VENUE_PALETTE.charcoal }}
          >
            Launch tour →
          </a>
        </div>
      )}
    </section>
  );
}

function PricingPreview({ profile }: { profile: VenueProfile }) {
  return (
    <section>
      <SectionTitle eyebrow="Pricing">Packages & starting prices</SectionTitle>
      <div className="mt-4 space-y-3">
        {profile.pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-xl border p-4"
            style={{ borderColor: VENUE_PALETTE.hairline }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3
                className="text-[17px] text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {tier.name}
              </h3>
              <p
                className="font-mono text-[15px] text-[#2C2C2C]"
                style={{ fontWeight: 500 }}
              >
                ${formatK(tier.priceLow)} – ${formatK(tier.priceHigh)}
              </p>
            </div>
            {tier.includes && (
              <p
                className="mt-1.5 text-[12.5px] leading-[1.55] text-[#5a5a5a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {tier.includes}
              </p>
            )}
            {tier.fbMinimum && (
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9E8245]">
                F&B minimum · ${formatK(tier.fbMinimum)}
              </p>
            )}
          </div>
        ))}
      </div>
      <div
        className="mt-3 rounded-xl border px-4 py-3 text-[12px] italic text-[#5a4a30]"
        style={{
          borderColor: VENUE_PALETTE.hairline,
          backgroundColor: "#FBF1DF",
          fontFamily: "'EB Garamond', serif",
        }}
      >
        <span className="mr-2 font-mono not-italic text-[10px] uppercase tracking-[0.2em] text-[#9E8245]">
          Seasonal
        </span>
        Peak: {profile.seasonalNotes.peak} · Off-peak: {profile.seasonalNotes.offPeak} ·{" "}
        {profile.seasonalNotes.holiday}
      </div>
    </section>
  );
}

function formatK(n: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString();
}

function CalendarPreview({ profile }: { profile: VenueProfile }) {
  return (
    <section>
      <SectionTitle eyebrow="Availability">When you can book</SectionTitle>
      <p
        className="mt-2 text-[12.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Open dates are shaded cream. Unavailable dates are filled charcoal.
      </p>
      <div className="mt-4">
        <AvailabilityCalendar days={profile.calendar} mode="preview" />
      </div>
    </section>
  );
}

function ContactFooter({ profile }: { profile: VenueProfile }) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        backgroundColor: VENUE_PALETTE.charcoal,
        color: "#FAF8F5",
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.26em]"
        style={{ color: "#F5E6D0" }}>
        Request a tour
      </p>
      <h3
        className="mt-1 text-[24px] leading-none"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Ready to see the estate in person?
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]"
        style={{ color: "#E9E3D8" }}>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden>✉</span>
          {profile.basics.email}
        </span>
        <span aria-hidden style={{ color: "#C4A265" }}>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden>☏</span>
          {profile.basics.phone}
        </span>
        <span aria-hidden style={{ color: "#C4A265" }}>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden>◐</span>
          {profile.basics.website.replace(/^https?:\/\//, "")}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-full px-4 py-2 text-[12.5px] font-medium"
          style={{ backgroundColor: "#FAF8F5", color: VENUE_PALETTE.charcoal }}
        >
          Request tour →
        </button>
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-[12.5px] font-medium"
          style={{ borderColor: "rgba(255,255,240,0.35)", color: "#FAF8F5" }}
        >
          Save to shortlist
        </button>
      </div>
    </section>
  );
}
