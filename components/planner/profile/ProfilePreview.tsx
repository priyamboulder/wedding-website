"use client";

import type { ProfileData } from "@/lib/planner/profile-seed";
import { TRAVEL_RADIUS_LABEL } from "@/lib/planner/profile-seed";
import { PLANNER_PALETTE } from "@/components/planner/ui";

type Variant = "panel" | "full";

export default function ProfilePreview({
  profile,
  variant = "panel",
}: {
  profile: ProfileData;
  variant?: Variant;
}) {
  const full = variant === "full";

  return (
    <div
      className={`space-y-10 ${full ? "px-4 pb-16 pt-10 sm:px-10" : "px-6 py-8"}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Header profile={profile} full={full} />
      <StatsBar profile={profile} />
      <AboutSection profile={profile} />
      <PortfolioGrid profile={profile} full={full} />
      <ServicesSection profile={profile} />
      <WeddingHistorySection profile={profile} />
      <VendorRosterSection profile={profile} />
      <VenuesSection profile={profile} />
      {profile.destinationRegions.some((r) => r.selected) && (
        <DestinationSection profile={profile} />
      )}
      <ReviewsSection profile={profile} />
      <InquireCta profile={profile} />
    </div>
  );
}

function Header({ profile, full }: { profile: ProfileData; full: boolean }) {
  const selectedCeremonies = profile.ceremonyTypes
    .filter((c) => c.selected)
    .map((c) => c.label.replace(/^Hindu — /, ""));

  return (
    <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <div
        className={`grid shrink-0 place-items-center rounded-full ${
          full ? "h-32 w-32 text-[40px]" : "h-24 w-24 text-[28px]"
        }`}
        style={{
          backgroundColor: PLANNER_PALETTE.champagne,
          color: PLANNER_PALETTE.goldDeep,
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {profile.photoMonogram || initials(profile.plannerName)}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
          {profile.companyName}
        </p>
        <h1
          className={`mt-2 text-[#2C2C2C] ${full ? "text-[56px]" : "text-[38px]"} leading-[1.03]`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.015em",
          }}
        >
          {profile.plannerName}
        </h1>
        <p
          className={`mt-3 ${full ? "text-[19px]" : "text-[15.5px]"} italic text-[#5a5a5a]`}
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {profile.tagline}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-[#6a6a6a]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden style={{ color: PLANNER_PALETTE.goldDeep }}>◉</span>
            {profile.baseLocation}
          </span>
          <span className="text-[#c8b795]">·</span>
          <span>{TRAVEL_RADIUS_LABEL[profile.travelRadius]}</span>
          {profile.instagramHandle && (
            <>
              <span className="text-[#c8b795]">·</span>
              <span className="font-mono text-[11.5px] text-[#9E8245]">
                {profile.instagramHandle}
              </span>
            </>
          )}
        </div>
        {selectedCeremonies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCeremonies.map((c) => (
              <span
                key={c}
                className="rounded-full px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: "#FDF1E3",
                  color: "#8a5a20",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsBar({ profile }: { profile: ProfileData }) {
  const items = [
    { value: `${profile.weddingsPlanned}+`, label: "Weddings" },
    { value: profile.stats.vendors.toString(), label: "Vendors" },
    { value: profile.yearsExperience.toString(), label: "Years" },
    { value: `★ ${profile.stats.rating.toFixed(1)}`, label: `${profile.stats.reviewCount} reviews` },
  ];

  return (
    <section
      className="grid grid-cols-2 rounded-2xl px-2 py-4 sm:grid-cols-4"
      style={{
        backgroundColor: PLANNER_PALETTE.champagne,
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`px-4 py-2 text-center ${
            i > 0 ? "sm:border-l" : ""
          } ${i === 2 ? "border-t sm:border-t-0" : ""} ${i === 3 ? "border-t sm:border-t-0" : ""}`}
          style={{ borderColor: "rgba(196,162,101,0.35)" }}
        >
          <p
            className="text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {it.value}
          </p>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a5a20]">
            {it.label}
          </p>
        </div>
      ))}
    </section>
  );
}

function AboutSection({ profile }: { profile: ProfileData }) {
  const paragraphs = profile.bio.split(/\n\n+/);
  return (
    <section>
      <SectionHeading eyebrow="About" title={`Meet ${profile.plannerName.split(" ")[0]}`} />
      <div className="mt-5 space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-[1.7] text-[#3a3a3a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {p}
          </p>
        ))}
      </div>
      {profile.languages.length > 0 && (
        <p className="mt-5 text-[12.5px] text-[#6a6a6a]">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
            Languages
          </span>
          <span className="ml-3">{profile.languages.join(" · ")}</span>
        </p>
      )}
      {profile.credentials.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-[#5a5a5a]">
          {profile.credentials.map((c) => (
            <span key={c.id} className="inline-flex items-baseline gap-1.5">
              <span aria-hidden style={{ color: PLANNER_PALETTE.goldDeep }}>
                {c.kind === "award" ? "✦" : c.kind === "press" ? "✎" : "✓"}
              </span>
              <span className="text-[#2C2C2C]">{c.label}</span>
              {c.year && <span className="font-mono text-[10.5px] text-[#8a8a8a]">{c.year}</span>}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function PortfolioGrid({ profile, full }: { profile: ProfileData; full: boolean }) {
  if (profile.portfolio.length === 0) return null;
  const cols = full ? "grid-cols-4" : "grid-cols-3";
  return (
    <section>
      <SectionHeading
        eyebrow={`Portfolio · ${profile.instagramHandle}`}
        title="Recent work"
      />
      <div className={`mt-5 grid ${cols} gap-2`}>
        {profile.portfolio.map((p) => (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden rounded-lg"
            title={p.caption}
            style={{
              background: `linear-gradient(135deg, ${p.swatch} 0%, ${p.accent} 100%)`,
              boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)",
            }}
          >
            <span
              className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 text-[10px] leading-snug text-white opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
              }}
            >
              {p.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({ profile }: { profile: ProfileData }) {
  const active = profile.services.filter((s) => s.enabled);
  if (active.length === 0) return null;

  return (
    <section>
      <SectionHeading eyebrow="Services" title="How we work together" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {active.map((svc) => (
          <div
            key={svc.id}
            className="rounded-2xl border p-5"
            style={{ borderColor: PLANNER_PALETTE.hairline, backgroundColor: "#FFFFFF" }}
          >
            <p
              className="text-[17px] text-[#2C2C2C]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {svc.label}
            </p>
            <p
              className="mt-1 font-mono text-[11.5px] text-[#9E8245]"
            >
              ${svc.priceLow.toLocaleString()}
              {svc.priceHigh > svc.priceLow &&
                ` – $${svc.priceHigh.toLocaleString()}`}
            </p>
            <p
              className="mt-3 text-[13.5px] leading-relaxed text-[#5a5a5a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {svc.includes}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeddingHistorySection({ profile }: { profile: ProfileData }) {
  if (profile.weddingHistory.length === 0) return null;
  return (
    <section>
      <SectionHeading eyebrow="Recent weddings" title="Couples I've worked with" />
      <div className="mt-5 space-y-3">
        {profile.weddingHistory.map((w) => (
          <div
            key={w.id}
            className="flex items-stretch gap-4 rounded-2xl border p-4"
            style={{ borderColor: PLANNER_PALETTE.hairline, backgroundColor: "#FFFFFF" }}
          >
            <div className="flex w-24 shrink-0 flex-col overflow-hidden rounded-lg">
              {w.palette.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: hex, minHeight: "30px" }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[19px] leading-tight text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {w.coupleNames}
              </p>
              <p className="mt-0.5 text-[12px] text-[#6a6a6a]">
                <span className="text-[#2C2C2C]">{w.date}</span>
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {w.venue}
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {w.location}
              </p>
              <p
                className="mt-2 text-[13.5px] italic text-[#5a5a5a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {w.headline}
              </p>
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                {w.vendors} vendor team
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VendorRosterSection({ profile }: { profile: ProfileData }) {
  const categories = [
    { label: "Photography", count: 12 },
    { label: "Decor & Florals", count: 8 },
    { label: "HMUA", count: 9 },
    { label: "Catering", count: 6 },
    { label: "DJ", count: 5 },
    { label: "Mehndi", count: 6 },
    { label: "Videography", count: 8 },
    { label: "Stationery", count: 3 },
    { label: "Officiant", count: 2 },
    { label: "Choreography", count: 3 },
  ];
  return (
    <section>
      <SectionHeading
        eyebrow={`Vendor network · ${profile.stats.vendors} vendors`}
        title="My trusted roster"
      />
      <p
        className="mt-2 text-[13.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Vendors I know, trust, and have worked with repeatedly. You'll get curated recommendations from this list.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {categories.map((c) => (
          <div
            key={c.label}
            className="rounded-xl px-3 py-3"
            style={{
              backgroundColor: "#FBF4E6",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.2)",
            }}
          >
            <p
              className="text-[22px] leading-none text-[#2C2C2C]"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
            >
              {c.count}
            </p>
            <p className="mt-1.5 text-[11.5px] text-[#5a5a5a]">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VenuesSection({ profile }: { profile: ProfileData }) {
  return (
    <section>
      <SectionHeading eyebrow="Venue partners" title="Where I've worked" />
      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {profile.venuesWorked.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)",
            }}
          >
            <div className="min-w-0">
              <p
                className="truncate text-[14.5px] text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {v.name}
              </p>
              <p className="truncate text-[11.5px] text-[#6a6a6a]">{v.location}</p>
            </div>
            <span className="font-mono text-[11px] text-[#9E8245]">
              {v.weddingsHosted}×
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DestinationSection({ profile }: { profile: ProfileData }) {
  const selected = profile.destinationRegions.filter((r) => r.selected);
  return (
    <section>
      <SectionHeading eyebrow="Destinations" title="I travel for couples" />
      <div className="mt-5 flex flex-wrap gap-2">
        {selected.map((r) => (
          <span
            key={r.key}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] text-[#2C2C2C]"
            style={{
              backgroundColor: PLANNER_PALETTE.champagne,
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
            }}
          >
            <span aria-hidden style={{ color: PLANNER_PALETTE.goldDeep }}>✈</span>
            {r.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function ReviewsSection({ profile }: { profile: ProfileData }) {
  return (
    <section>
      <SectionHeading
        eyebrow={`Reviews · ★ ${profile.stats.rating.toFixed(1)} from ${profile.stats.reviewCount} couples`}
        title="What couples say"
      />
      <div className="mt-5 space-y-4">
        {profile.reviews.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border p-5"
            style={{ borderColor: PLANNER_PALETTE.hairline, backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-[17px] text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                "{r.headline}"
              </p>
              <span
                className="shrink-0 font-mono text-[12px]"
                style={{ color: PLANNER_PALETTE.goldDeep }}
              >
                {"★".repeat(r.rating)}
              </span>
            </div>
            <p
              className="mt-2 text-[14px] leading-relaxed text-[#4a4a4a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {r.body}
            </p>
            <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
              {r.couple} · {r.weddingDate}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InquireCta({ profile }: { profile: ProfileData }) {
  return (
    <section
      className="rounded-2xl px-8 py-10 text-center"
      style={{
        backgroundColor: PLANNER_PALETTE.charcoal,
        color: "#FAF8F5",
      }}
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
        Inquire with this planner
      </p>
      <h3
        className="mt-3 text-[32px] leading-tight"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        Let's talk about your wedding
      </h3>
      <p
        className="mx-auto mt-3 max-w-md text-[15px] italic text-[#d7cdb8]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {profile.plannerName.split(" ")[0]} takes twelve couples a year. Book a complimentary consult to see if it's a fit.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-medium transition-colors"
        style={{
          backgroundColor: PLANNER_PALETTE.gold,
          color: PLANNER_PALETTE.charcoal,
        }}
      >
        Request a consultation
        <span aria-hidden>→</span>
      </button>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#C4A265]">
        {eyebrow}
      </p>
      <h2
        className="mt-1.5 text-[28px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
