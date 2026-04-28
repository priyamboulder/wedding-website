import {
  MetaPill,
  ProgressBar,
  SectionHeader,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import {
  OPEN_HOUSE,
  REVIEW_REQUESTS,
  SPOTLIGHTS,
  SPOTLIGHT_FORMATS,
  TESTIMONIALS,
  VENDOR_COMARKETING,
  type OpenHouseEvent,
  type ReviewRequest,
  type Testimonial,
  type VendorCoMarketing,
  type WeddingSpotlight,
} from "@/lib/venue/marketing-seed";

export const metadata = {
  title: "Marketing — Ananya Venue",
};

export default function VenueMarketingPage() {
  const featured = SPOTLIGHTS[0];
  const coMarketing = VENDOR_COMARKETING[0];

  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8 pb-16">
      <PageHeader />

      {/* Tool 1: Spotlight Creator */}
      <section className="mt-10">
        <SectionHeader
          title="Wedding Spotlight Creator"
          eyebrow="Tool · turn a real wedding into shareable content"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <WeddingSelector spotlights={SPOTLIGHTS} selectedId={featured.id} />
          <SpotlightPreview spotlight={featured} />
        </div>
      </section>

      {/* Tool 2: Vendor Co-Marketing */}
      <section className="mt-12">
        <SectionHeader
          title="Vendor Co-Marketing"
          eyebrow="Tool · co-branded content with vendors who've worked here"
        />
        <div className="mt-5">
          <CoMarketingCard campaign={coMarketing} />
        </div>
      </section>

      {/* Tool 3: Testimonials */}
      <section className="mt-12">
        <SectionHeader
          title="Testimonial Manager"
          eyebrow="Tool · feature, collect, and export couple reviews"
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <TestimonialList testimonials={TESTIMONIALS} />
          <ReviewRequestPanel requests={REVIEW_REQUESTS} />
        </div>
      </section>

      {/* Tool 4: Open House */}
      <section className="mt-12">
        <SectionHeader
          title="Open House & Event Promotion"
          eyebrow="Tool · invite Ananya couples to see your venue"
        />
        <div className="mt-5">
          <OpenHousePanel event={OPEN_HOUSE} />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- Header --------------------------------- */

function PageHeader() {
  return (
    <VenueCard>
      <div className="flex flex-wrap items-end justify-between gap-5 p-8">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Marketing & content
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Promote your venue with real weddings
          </h1>
          <p
            className="mt-2 max-w-[620px] text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Turn weddings from your showcase into co-branded content. Every
            export credits the vendors who worked alongside you, so
            co-marketing benefits everyone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MiniStat label="Spotlights ready" value={SPOTLIGHTS.length} />
          <MiniStat label="Testimonials" value={TESTIMONIALS.length} />
          <MiniStat label="Events live" value={1} />
        </div>
      </div>
    </VenueCard>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-center"
      style={{ borderColor: VENUE_PALETTE.hairline, minWidth: 110 }}
    >
      <p
        className="font-mono text-[22px] leading-none text-[#2C2C2C]"
        style={{ fontWeight: 500 }}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
        {label}
      </p>
    </div>
  );
}

/* ------------------------ Spotlight selector + preview -------------------- */

function WeddingSelector({
  spotlights,
  selectedId,
}: {
  spotlights: WeddingSpotlight[];
  selectedId: string;
}) {
  return (
    <VenueCard className="p-5 lg:col-span-2">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        Select a wedding
      </p>
      <ul className="mt-4 space-y-2.5">
        {spotlights.map((s) => {
          const selected = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`group w-full rounded-xl border p-4 text-left transition-colors ${
                  selected ? "" : "hover:bg-[#FBF1DF]"
                }`}
                style={{
                  borderColor: selected
                    ? "rgba(196,162,101,0.55)"
                    : VENUE_PALETTE.hairline,
                  backgroundColor: selected ? "#FBF1DF" : "#FFFFFF",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[16px] text-[#2C2C2C]"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {s.coupleNames}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#6a6a6a]">
                      {s.dateLabel}
                      <span className="mx-1.5 text-[#cdbf9c]">·</span>
                      {s.ceremonyType}
                      <span className="mx-1.5 text-[#cdbf9c]">·</span>
                      {s.guestCount} guests
                    </p>
                  </div>
                  {selected && (
                    <span
                      aria-hidden
                      className="font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: VENUE_PALETTE.goldDeep }}
                    >
                      ✓ Selected
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </VenueCard>
  );
}

function SpotlightPreview({ spotlight }: { spotlight: WeddingSpotlight }) {
  return (
    <VenueCard className="overflow-hidden lg:col-span-3">
      <div
        className="flex items-baseline justify-between border-b px-6 py-3"
        style={{ borderColor: VENUE_PALETTE.hairline }}
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="font-mono text-[11px]"
            style={{ color: VENUE_PALETTE.goldDeep }}
          >
            ✦
          </span>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
            Real Wedding Spotlight · Auto-generated preview
          </p>
        </div>
        <MetaPill tone="gold">Draft</MetaPill>
      </div>

      <div className="p-6">
        {/* Collage */}
        <div className="grid grid-cols-2 gap-1.5">
          {spotlight.photoCollage.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className="aspect-[4/3] overflow-hidden rounded-md"
              style={{ backgroundColor: "#F5EFE3" }}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Caption */}
        <p
          className="mt-5 text-[15px] leading-relaxed text-[#2C2C2C]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {spotlight.headlineCopy}
        </p>

        {/* Vendor credits */}
        <div className="mt-4 rounded-xl bg-[#FBF1DF] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
            Vendor credits
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[12.5px]">
            {spotlight.vendorCredits.map((v) => (
              <span
                key={v.handle}
                className="inline-flex items-baseline gap-1.5"
              >
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
                  {v.role}
                </span>
                <span className="text-[#5a4220]">{v.handle}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Formats */}
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
            Export format
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SPOTLIGHT_FORMATS.map((f, i) => (
              <button
                key={f.key}
                type="button"
                className="rounded-full border px-3.5 py-1.5 text-[11.5px] text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
                style={{
                  borderColor:
                    i === 0 ? "rgba(196,162,101,0.60)" : VENUE_PALETTE.hairline,
                  backgroundColor: i === 0 ? "#F5E6D0" : "#FFFFFF",
                }}
              >
                <span className="font-medium">{f.label}</span>
                <span className="ml-2 font-mono text-[10px] text-[#9E8245]">
                  {f.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Download
            <span aria-hidden>↓</span>
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.45)" }}
          >
            Copy text
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.45)" }}
          >
            Schedule post
          </button>
        </div>
      </div>
    </VenueCard>
  );
}

/* --------------------------- Vendor co-marketing ------------------------- */

function CoMarketingCard({ campaign }: { campaign: VendorCoMarketing }) {
  return (
    <VenueCard className="overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <MetaPill tone="gold">{campaign.vendorCategory}</MetaPill>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              {campaign.vendorHandle}
            </span>
          </div>
          <h3
            className="mt-2 text-[30px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {campaign.vendorName}
          </h3>
          <p
            className="mt-2 text-[15px] italic text-[#5a4220]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            "{campaign.tagline}"
          </p>
          <p
            className="mt-4 text-[13.5px] leading-relaxed text-[#2C2C2C]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {campaign.body}
          </p>

          <div
            className="mt-5 flex items-center gap-4 rounded-xl px-4 py-3"
            style={{ backgroundColor: "#FBF1DF" }}
          >
            <div>
              <p
                className="font-mono text-[22px] leading-none text-[#2C2C2C]"
                style={{ fontWeight: 500 }}
              >
                {campaign.weddingsAtVenue}
              </p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                weddings together
              </p>
            </div>
            <div
              className="h-10 w-px"
              style={{ backgroundColor: "rgba(196,162,101,0.30)" }}
            />
            <div className="text-[12px] text-[#5a4220]">
              Shared by both The Legacy Castle and {campaign.vendorName} — mutual
              promotion to each audience.
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
              style={{
                backgroundColor: VENUE_PALETTE.charcoal,
                color: "#FAF8F5",
              }}
            >
              Publish to Instagram
              <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
              style={{ borderColor: "rgba(196,162,101,0.45)" }}
            >
              Send to {campaign.vendorName.split(" ")[0]}
            </button>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
              Shared with: {campaign.sharedWith.join(", ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-6 lg:p-0">
          {campaign.photos.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden lg:aspect-auto"
              style={{ backgroundColor: "#F5EFE3" }}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </VenueCard>
  );
}

/* ----------------------- Testimonials & review requests ------------------ */

function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="space-y-4 lg:col-span-3">
      <ul className="space-y-4">
        {testimonials.map((t) => (
          <li key={t.id}>
            <TestimonialCard t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <VenueCard className="relative overflow-hidden">
      {t.featured && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: VENUE_PALETTE.gold }}
        />
      )}
      <div className="p-5 pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className="text-[17px] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {t.coupleNames}
          </p>
          <span className="text-[#cdbf9c]" aria-hidden>
            ·
          </span>
          <span className="text-[12px] text-[#6a6a6a]">{t.dateLabel}</span>
          <span className="text-[#cdbf9c]" aria-hidden>
            ·
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
            {t.ceremonyType}
          </span>
          {t.featured && (
            <span className="ml-auto">
              <MetaPill tone="gold">Featured on profile</MetaPill>
            </span>
          )}
        </div>
        <p
          className="mt-3 text-[15px] leading-relaxed italic text-[#2C2C2C]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          "{t.quote}"
        </p>
        <div className="mt-4 flex items-center gap-3 text-[11.5px]">
          <span className="inline-flex items-center gap-1" aria-label={`${t.rating} of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  color:
                    i < t.rating ? VENUE_PALETTE.gold : "rgba(44,44,44,0.15)",
                }}
              >
                ★
              </span>
            ))}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
            {t.source}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border px-3 py-1 text-[11.5px] text-[#2C2C2C] hover:bg-[#F5E6D0]"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            >
              {t.featured ? "Unfeature" : "Feature"}
            </button>
            <button
              type="button"
              className="rounded-full border px-3 py-1 text-[11.5px] text-[#2C2C2C] hover:bg-[#F5E6D0]"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </VenueCard>
  );
}

function ReviewRequestPanel({ requests }: { requests: ReviewRequest[] }) {
  return (
    <VenueCard className="p-5 lg:col-span-2">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
          Review requests
        </p>
        <span className="font-mono text-[11px] text-[#9E8245]">
          Post-wedding outreach
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ borderColor: VENUE_PALETTE.hairline }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-[14.5px] text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {r.coupleNames}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#6a6a6a]">
                {r.daysSinceWedding} days post-wedding
                {r.lastAction && (
                  <>
                    <span className="mx-1.5 text-[#cdbf9c]">·</span>
                    {r.lastAction}
                  </>
                )}
              </p>
            </div>
            <ReviewRequestBadge status={r.status} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 w-full rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
        style={{
          backgroundColor: VENUE_PALETTE.charcoal,
          color: "#FAF8F5",
        }}
      >
        Send review request email
      </button>
    </VenueCard>
  );
}

function ReviewRequestBadge({ status }: { status: ReviewRequest["status"] }) {
  const map = {
    unsent: {
      label: "Send request",
      bg: "#FBF1DF",
      color: VENUE_PALETTE.goldDeep,
    },
    sent: {
      label: "Sent",
      bg: "rgba(39,174,96,0.10)",
      color: VENUE_PALETTE.ontrack,
    },
    "no-response": {
      label: "No response",
      bg: "rgba(230,126,34,0.12)",
      color: VENUE_PALETTE.warning,
    },
  } as const;
  const s = map[status];
  return (
    <span
      className="rounded-full px-2.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

/* ------------------------------- Open house ------------------------------ */

function OpenHousePanel({ event }: { event: OpenHouseEvent }) {
  return (
    <VenueCard className="overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <MetaPill tone="gold">
              {event.status === "live" ? "Live · Promoting" : event.status}
            </MetaPill>
            <span className="text-[#cdbf9c]" aria-hidden>
              ·
            </span>
            <span className="text-[12px] text-[#6a6a6a]">
              {event.daysAway} days away
            </span>
          </div>
          <h3
            className="mt-2 text-[30px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {event.title}
          </h3>
          <p
            className="mt-1.5 text-[14px] text-[#2C2C2C]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            <span
              className="font-mono text-[12.5px]"
              style={{ color: VENUE_PALETTE.goldDeep }}
            >
              {event.date} · {event.time}
            </span>
          </p>
          <p
            className="mt-3 text-[13.5px] leading-relaxed text-[#2C2C2C]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {event.description}
          </p>

          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              Audience
            </p>
            <p className="mt-1 text-[12.5px] text-[#2C2C2C]">
              {event.audience}
            </p>
          </div>

          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              Participating vendors
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {event.participatingVendors.map((v) => (
                <span
                  key={v.name}
                  className="inline-flex items-baseline gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] text-[#5a4a30]"
                  style={{
                    backgroundColor: "#F5E6D0",
                    boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.30)",
                  }}
                >
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
                    {v.category}
                  </span>
                  {v.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
              style={{
                backgroundColor: VENUE_PALETTE.charcoal,
                color: "#FAF8F5",
              }}
            >
              Promote to Ananya couples
              <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
              style={{ borderColor: "rgba(196,162,101,0.45)" }}
            >
              Edit event
            </button>
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
              style={{ borderColor: "rgba(196,162,101,0.45)" }}
            >
              Export RSVP list
            </button>
          </div>
        </div>

        <div
          className="border-t p-6 lg:col-span-2 lg:border-l lg:border-t-0"
          style={{
            borderColor: VENUE_PALETTE.hairline,
            backgroundColor: "#FBF1DF",
          }}
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
            RSVP tracking
          </p>
          <div className="mt-4 space-y-4">
            <RsvpStat
              label="Confirmed"
              value={event.rsvp.confirmed}
              capacity={event.rsvp.capacity}
              primary
            />
            <RsvpStat
              label="Interested"
              value={event.rsvp.interested}
              capacity={event.rsvp.capacity}
            />
          </div>
          <div
            className="mt-5 rounded-xl p-3 text-[11.5px] italic text-[#5a4220]"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.25)",
              fontFamily: "'EB Garamond', serif",
            }}
          >
            At {Math.round((event.rsvp.confirmed / event.rsvp.capacity) * 100)}% of
            capacity — healthy lead. Consider waitlist if interest crosses
            capacity.
          </div>
        </div>
      </div>
    </VenueCard>
  );
}

function RsvpStat({
  label,
  value,
  capacity,
  primary,
}: {
  label: string;
  value: number;
  capacity: number;
  primary?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          {label}
        </span>
        <span
          className="font-mono text-[14px] text-[#2C2C2C]"
          style={{ fontWeight: primary ? 600 : 400 }}
        >
          {value}
          <span className="ml-1 font-mono text-[10.5px] text-[#9E8245]">
            / {capacity}
          </span>
        </span>
      </div>
      <div className="mt-1.5">
        <ProgressBar value={value} total={capacity} />
      </div>
    </div>
  );
}
