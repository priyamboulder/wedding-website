"use client";

// ── Vendor profile pop-out panel ────────────────────────────────────────────
// Large slide-over opened from a vendor card. Reads the full rich record —
// Instagram portfolio, wedding graph, planner + venue connections, destination
// entries, couple reviews, planner endorsements — all from the unified Vendor
// object in vendors-store. Fields not populated fall back to empty-states.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Heart,
  Star,
  Plane,
  Clock,
  Briefcase,
  Users,
  MapPin,
  BadgeCheck,
  Mail,
  Phone,
  Globe,
  Globe2,
  AtSign,
  Sparkles,
  Check,
  ImageOff,
  Languages,
  Play,
  Filter,
  CalendarDays,
  Building2,
  ChevronRight,
  Flag,
  GitCompare,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Vendor,
  VendorImage,
  VendorPackage,
  PortfolioPost,
  VendorWedding,
  CoupleReview,
  PlannerEndorsement,
  WeddingVendorReference,
  PlannerConnection,
  VenueConnection,
} from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import {
  formatPriceDetail,
  formatPriceShort,
} from "@/lib/vendors/price-display";
import { useVendorsStore } from "@/stores/vendors-store";
import { InquireButton } from "./InquiryDialog";

interface VendorProfilePanelProps {
  vendor: Vendor | null;
  onClose: () => void;
  coupleVenueId?: string | null;
  coupleVenueName?: string | null;
  coupleplannerIds?: string[];
  onOpenVendor?: (vendorId: string) => void;
  onInquire?: (vendorId: string) => void;
}

type TabId = "overview" | "portfolio" | "weddings" | "reviews" | "packages" | "about";
type PortfolioFilter = "all" | "by_wedding" | "by_venue" | "destination";
type WeddingFilter = "all" | "local" | "destination";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "portfolio", label: "Portfolio" },
  { id: "weddings", label: "Weddings" },
  { id: "reviews", label: "Reviews" },
  { id: "packages", label: "Packages" },
  { id: "about", label: "About" },
];

export function VendorProfilePanel({
  vendor,
  onClose,
  coupleVenueId = null,
  coupleVenueName = null,
  coupleplannerIds = [],
  onOpenVendor,
  onInquire,
}: VendorProfilePanelProps) {
  const allVendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);

  const [lightbox, setLightbox] = useState<PortfolioPost | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>("all");
  const [portfolioLimit, setPortfolioLimit] = useState(12);
  const [weddingFilter, setWeddingFilter] = useState<WeddingFilter>("all");

  useEffect(() => {
    setLightbox(null);
    setTab("overview");
    setPortfolioFilter("all");
    setPortfolioLimit(12);
    setWeddingFilter("all");
  }, [vendor?.id]);

  useEffect(() => {
    if (!vendor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightbox) {
        setLightbox(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vendor, onClose, lightbox]);

  const shortlisted = useMemo(
    () => (vendor ? shortlist.some((e) => e.vendor_id === vendor.id) : false),
    [shortlist, vendor],
  );

  const similarVendors = useMemo(() => {
    if (!vendor) return [] as Vendor[];
    return allVendors
      .filter((v) => v.id !== vendor.id && v.category === vendor.category)
      .slice(0, 6);
  }, [allVendors, vendor]);

  // ── Derived data ────────────────────────────────────────────────────────
  // All memos declared up-front so hook order stays stable when vendor
  // toggles between null and a record.

  const portfolio = useMemo(
    () => vendor?.portfolio_posts ?? [],
    [vendor],
  );
  const weddings = useMemo(() => vendor?.weddings ?? [], [vendor]);
  const coupleReviews = useMemo(
    () => vendor?.couple_reviews ?? [],
    [vendor],
  );
  const plannerEndorsements = useMemo(
    () => vendor?.planner_endorsements ?? [],
    [vendor],
  );
  const destinations = useMemo(() => vendor?.destinations ?? [], [vendor]);
  const services = useMemo(() => vendor?.services ?? [], [vendor]);
  const languages = useMemo(() => vendor?.languages ?? [], [vendor]);

  const featuredPackages = useMemo(() => {
    if (!vendor) return [];
    return [...vendor.packages].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    });
  }, [vendor]);

  const plannerConnections = useMemo<
    Array<PlannerConnection & { is_couples_planner: boolean }>
  >(() => {
    if (!vendor) return [];
    return vendor.planner_connections.map((p) => ({
      ...p,
      is_couples_planner: coupleplannerIds.includes(p.planner_id),
    }));
  }, [vendor, coupleplannerIds]);

  const venueConnections = useMemo<
    Array<VenueConnection & { is_couples_venue: boolean }>
  >(() => {
    if (!vendor) return [];
    return vendor.venue_connections.map((v) => ({
      ...v,
      is_couples_venue: coupleVenueId === v.venue_id,
    }));
  }, [vendor, coupleVenueId]);

  const heroReview = useMemo<CoupleReview | null>(() => {
    if (!vendor) return null;
    if (
      vendor.travel_level === "destination" ||
      vendor.travel_level === "worldwide"
    ) {
      return (
        coupleReviews.find((r) => r.is_destination) ??
        coupleReviews[0] ??
        null
      );
    }
    return coupleReviews[0] ?? null;
  }, [vendor, coupleReviews]);

  const filteredPortfolio = useMemo(() => {
    switch (portfolioFilter) {
      case "by_wedding":
        return portfolio.filter((p) => p.wedding_id != null);
      case "by_venue":
        return portfolio.filter((p) => p.venue_id != null);
      case "destination": {
        const destWeddingIds = new Set(
          weddings.filter((w) => w.is_destination).map((w) => w.id),
        );
        return portfolio.filter(
          (p) => p.wedding_id != null && destWeddingIds.has(p.wedding_id),
        );
      }
      default:
        return portfolio;
    }
  }, [portfolio, portfolioFilter, weddings]);

  const filteredWeddings = useMemo(() => {
    switch (weddingFilter) {
      case "local":
        return weddings.filter((w) => !w.is_destination);
      case "destination":
        return weddings.filter((w) => w.is_destination);
      default:
        return weddings;
    }
  }, [weddings, weddingFilter]);

  const countryCount = useMemo(() => {
    const set = new Set<string>();
    for (const d of destinations) set.add(d.country);
    return set.size;
  }, [destinations]);

  if (!vendor) return null;

  const coverUrl = vendor.cover_image || (vendor.portfolio_images ?? [])[0]?.url || "";
  const isSelect = vendor.tier === "select";

  return (
    <AnimatePresence>
      {vendor && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[960px] flex-col overflow-hidden bg-ivory shadow-[-24px_0_60px_-20px_rgba(26,26,26,0.25)]"
            role="dialog"
            aria-label={`${vendor.name} profile`}
          >
            {/* Close button — floats above the scroll so it stays visible. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-soft ring-1 ring-border transition-colors hover:bg-white"
            >
              <X size={14} strokeWidth={1.8} />
            </button>

            <div className="flex-1 overflow-y-auto panel-scroll">
              {/* Hero cover — scrolls away with the content so the bottom
                  sections get full height on short screens. */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-ivory-warm">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={vendor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
                    <ImageOff size={28} strokeWidth={1.3} />
                  </div>
                )}
                {isSelect && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold ring-1 ring-gold/30">
                    <Sparkles size={10} strokeWidth={2} />
                    Ananya Select
                  </span>
                )}
              </div>

              <div className="px-7 pt-6">
                {/* Category + actions */}
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {CATEGORY_LABELS[vendor.category]}
                  </p>
                  <div className="flex items-center gap-1">
                    <IconGhost label="Share">
                      <Share2 size={13} strokeWidth={1.7} />
                    </IconGhost>
                    <IconGhost label="Compare">
                      <GitCompare size={13} strokeWidth={1.7} />
                    </IconGhost>
                    <IconGhost label="Flag">
                      <Flag size={13} strokeWidth={1.7} />
                    </IconGhost>
                  </div>
                </div>

                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <h2
                    className="flex items-start gap-1.5 text-[28px] font-medium leading-tight text-ink"
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Fraunces', Georgia, serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {vendor.name}
                    {vendor.is_verified && (
                      <span
                        title="Verified by Ananya"
                        className="mt-[7px] text-gold"
                      >
                        <BadgeCheck size={17} strokeWidth={1.9} />
                      </span>
                    )}
                  </h2>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleShortlist(vendor.id)}
                      aria-label={
                        shortlisted
                          ? "Remove from shortlist"
                          : "Save to shortlist"
                      }
                      aria-pressed={shortlisted}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                        shortlisted
                          ? "border-saffron/30 text-saffron"
                          : "border-border text-ink-muted hover:text-ink",
                      )}
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.8}
                        fill={shortlisted ? "currentColor" : "none"}
                      />
                    </button>
                    {onInquire && (
                      <InquireButton
                        size="lg"
                        label="Inquire Now"
                        onClick={() => onInquire(vendor.id)}
                      />
                    )}
                  </div>
                </div>

                {vendor.tagline && (
                  <p className="mt-2 font-serif text-[15px] italic leading-snug text-ink-soft">
                    {vendor.tagline}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
                  {vendor.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} strokeWidth={1.6} />
                      {vendor.location}
                    </span>
                  )}
                  {vendor.rating !== null && (
                    <span className="flex items-center gap-1.5">
                      <Star
                        size={13}
                        strokeWidth={1.6}
                        className="text-saffron"
                        fill="currentColor"
                      />
                      <span className="font-mono">
                        {vendor.rating.toFixed(1)}
                      </span>
                      <span className="text-ink-faint">
                        ({vendor.review_count} reviews)
                      </span>
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-ink-soft">
                    {formatPriceShort(vendor.price_display)}
                  </span>
                  <TravelPill
                    level={vendor.travel_level}
                    countryCount={countryCount}
                  />
                </div>

                {/* Key stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border/60 py-4 sm:grid-cols-4">
                  <Stat
                    icon={<Briefcase size={12} strokeWidth={1.6} />}
                    label="Years active"
                    value={`${vendor.years_active}`}
                  />
                  <Stat
                    icon={<Users size={12} strokeWidth={1.6} />}
                    label="Team size"
                    value={`${vendor.team_size}`}
                  />
                  <Stat
                    icon={<Sparkles size={12} strokeWidth={1.6} />}
                    label="Weddings"
                    value={`${vendor.wedding_count}`}
                  />
                  <Stat
                    icon={<Clock size={12} strokeWidth={1.6} />}
                    label="Responds"
                    value={
                      vendor.response_time_hours != null
                        ? `within ${vendor.response_time_hours}h`
                        : "—"
                    }
                  />
                </div>

                {/* Tabs */}
                <div className="mt-5 border-b border-border">
                  <div className="flex items-center gap-5 overflow-x-auto">
                    {TABS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={cn(
                          "relative shrink-0 pb-2 text-[12.5px] font-medium transition-colors",
                          tab === id
                            ? "text-ink"
                            : "text-ink-muted hover:text-ink",
                        )}
                      >
                        {label}
                        {tab === id && (
                          <motion.span
                            layoutId="vendor-profile-tab"
                            transition={{
                              duration: 0.25,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                            className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-ink"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-6 pb-10">
                  {tab === "overview" && (
                    <OverviewTab
                      vendor={vendor}
                      plannerConnections={plannerConnections}
                      venueConnections={venueConnections}
                      coupleVenueName={coupleVenueName}
                      heroReview={heroReview}
                      topPackage={
                        featuredPackages.find((p) => p.featured) ??
                        featuredPackages[0] ??
                        null
                      }
                      portfolio={portfolio}
                      onOpenLightbox={setLightbox}
                      services={services}
                      destinations={destinations}
                      countryCount={countryCount}
                      plannerEndorsements={plannerEndorsements}
                    />
                  )}
                  {tab === "portfolio" && (
                    <PortfolioTab
                      portfolio={filteredPortfolio}
                      totalCount={portfolio.length}
                      filter={portfolioFilter}
                      onFilter={setPortfolioFilter}
                      limit={portfolioLimit}
                      onShowMore={() => setPortfolioLimit((l) => l + 12)}
                      onOpenLightbox={setLightbox}
                    />
                  )}
                  {tab === "weddings" && (
                    <WeddingsTab
                      weddings={filteredWeddings}
                      totalCount={weddings.length}
                      filter={weddingFilter}
                      onFilter={setWeddingFilter}
                      onOpenVendor={onOpenVendor}
                      currentVendorId={vendor.id}
                    />
                  )}
                  {tab === "reviews" && (
                    <ReviewsTab reviews={coupleReviews} vendor={vendor} />
                  )}
                  {tab === "packages" && (
                    <PackagesTab packages={featuredPackages} />
                  )}
                  {tab === "about" && (
                    <AboutTab
                      vendor={vendor}
                      services={services}
                      languages={languages}
                    />
                  )}
                </div>

                {similarVendors.length > 0 && onOpenVendor && (
                  <section className="border-t border-border pt-6">
                    <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                      Similar vendors
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {similarVendors.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onOpenVendor(v.id)}
                          className="group flex items-center gap-2.5 rounded-md border border-border bg-white p-2 text-left transition-all hover:border-gold/40 hover:shadow-sm"
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-ivory-warm">
                            {v.cover_image && (
                              <img
                                src={v.cover_image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-medium text-ink">
                              {v.name}
                            </p>
                            <p className="truncate font-mono text-[10px] text-ink-muted">
                              {formatPriceShort(v.price_display)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.aside>

          {lightbox && (
            <Lightbox post={lightbox} onClose={() => setLightbox(null)} />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────────

function OverviewTab({
  vendor,
  plannerConnections,
  venueConnections,
  coupleVenueName,
  heroReview,
  topPackage,
  portfolio,
  onOpenLightbox,
  services,
  destinations,
  countryCount,
  plannerEndorsements,
}: {
  vendor: Vendor;
  plannerConnections: Array<PlannerConnection & { is_couples_planner: boolean }>;
  venueConnections: Array<VenueConnection & { is_couples_venue: boolean }>;
  coupleVenueName: string | null;
  heroReview: CoupleReview | null;
  topPackage: VendorPackage | null;
  portfolio: PortfolioPost[];
  onOpenLightbox: (post: PortfolioPost) => void;
  services: string[];
  destinations: Vendor["destinations"];
  countryCount: number;
  plannerEndorsements: PlannerEndorsement[];
}) {
  const previewPosts = portfolio.slice(0, 6);

  return (
    <div className="space-y-7">
      {vendor.bio && (
        <p className="text-[14px] leading-[1.7] text-ink-soft">{vendor.bio}</p>
      )}

      {services.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Services
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-ivory-warm px-2.5 py-1 text-[11.5px] text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {previewPosts.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            From the portfolio
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {previewPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onOpenLightbox(post)}
                className="relative aspect-square overflow-hidden rounded-md bg-ivory-warm"
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                />
                {post.is_video && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink">
                    <Play size={10} strokeWidth={2} fill="currentColor" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {heroReview && <ReviewCard review={heroReview} />}

      {destinations && destinations.length > 0 && (
        <DestinationsSection
          destinations={destinations}
          countryCount={countryCount}
          totalWeddings={destinations.reduce(
            (sum, d) => sum + d.wedding_count,
            0,
          )}
          travelFeeDescription={vendor.travel_fee_description ?? null}
          passportValid={vendor.passport_valid ?? null}
          bookingLeadMonths={vendor.destination_booking_lead_months ?? null}
        />
      )}

      {plannerConnections.length > 0 && (
        <PlannersSection connections={plannerConnections} />
      )}

      {plannerEndorsements.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Planner Endorsements
          </h3>
          <ul className="space-y-3">
            {plannerEndorsements.map((e) => (
              <li
                key={e.id}
                className="rounded-md border border-border bg-white p-3"
              >
                <p className="font-serif text-[13px] italic leading-snug text-ink-soft">
                  &ldquo;{e.body}&rdquo;
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  — {e.planner_name}, {e.planner_company} · {e.wedding_count}{" "}
                  wedding{e.wedding_count === 1 ? "" : "s"} together
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {venueConnections.length > 0 && (
        <VenuesSection
          venues={venueConnections}
          coupleVenueName={coupleVenueName}
        />
      )}

      {topPackage && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Featured package
          </h3>
          <PackageCard pkg={topPackage} />
        </section>
      )}
    </div>
  );
}

function PortfolioTab({
  portfolio,
  totalCount,
  filter,
  onFilter,
  limit,
  onShowMore,
  onOpenLightbox,
}: {
  portfolio: PortfolioPost[];
  totalCount: number;
  filter: PortfolioFilter;
  onFilter: (f: PortfolioFilter) => void;
  limit: number;
  onShowMore: () => void;
  onOpenLightbox: (post: PortfolioPost) => void;
}) {
  if (totalCount === 0) {
    return (
      <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
        No portfolio posts yet.
      </p>
    );
  }

  const visible = portfolio.slice(0, limit);
  const hasMore = portfolio.length > limit;
  const filters: Array<{ id: PortfolioFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "by_wedding", label: "By wedding" },
    { id: "by_venue", label: "By venue" },
    { id: "destination", label: "Destination" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter size={12} strokeWidth={1.7} className="shrink-0 text-ink-faint" />
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors",
              filter === f.id
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink/30",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {portfolio.length === 0 ? (
        <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
          No posts match this filter.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {visible.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onOpenLightbox(post)}
                className="relative aspect-square overflow-hidden rounded-md bg-ivory-warm"
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                />
                {post.is_video && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink">
                    <Play size={10} strokeWidth={2} fill="currentColor" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={onShowMore}
              className="mx-auto block rounded-full border border-border bg-white px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-muted hover:border-ink/30 hover:text-ink"
            >
              Show more · {portfolio.length - limit} left
            </button>
          )}
        </>
      )}
    </div>
  );
}

function WeddingsTab({
  weddings,
  totalCount,
  filter,
  onFilter,
  onOpenVendor,
  currentVendorId,
}: {
  weddings: VendorWedding[];
  totalCount: number;
  filter: WeddingFilter;
  onFilter: (f: WeddingFilter) => void;
  onOpenVendor?: (vendorId: string) => void;
  currentVendorId: string;
}) {
  if (totalCount === 0) {
    return (
      <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
        No wedding history on file yet.
      </p>
    );
  }

  const filters: Array<{ id: WeddingFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "local", label: "Local" },
    { id: "destination", label: "Destination" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter size={12} strokeWidth={1.7} className="text-ink-faint" />
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] transition-colors",
              filter === f.id
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink/30",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {weddings.length === 0 ? (
        <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
          No weddings match this filter.
        </p>
      ) : (
        <ul className="space-y-4">
          {weddings.map((w) => (
            <WeddingCard
              key={w.id}
              wedding={w}
              onOpenVendor={onOpenVendor}
              currentVendorId={currentVendorId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function WeddingCard({
  wedding,
  onOpenVendor,
  currentVendorId,
}: {
  wedding: VendorWedding;
  onOpenVendor?: (vendorId: string) => void;
  currentVendorId: string;
}) {
  const date = new Date(wedding.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-white">
      {wedding.cover_image_url && (
        <div className="aspect-[16/7] w-full overflow-hidden bg-ivory-warm">
          <img
            src={wedding.cover_image_url}
            alt={wedding.couple_names}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-[16px] text-ink">
              {wedding.couple_names}
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] text-ink-muted">
              <MapPin size={10} strokeWidth={1.7} />
              {wedding.venue_name}
              <span className="text-ink-faint">·</span>
              {wedding.venue_city}
              {wedding.country ? `, ${wedding.country}` : `, ${wedding.venue_state}`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">
              <CalendarDays
                size={10}
                strokeWidth={1.7}
                className="mr-1 inline-block -mt-0.5"
              />
              {date}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
              {wedding.duration_days}-day
              {wedding.is_destination && " · destination"}
            </p>
          </div>
        </div>

        {wedding.vendor_team.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Wedding team
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {wedding.vendor_team.map((t) => (
                <TeamChip
                  key={t.vendor_id}
                  teammate={t}
                  isCurrent={t.vendor_id === currentVendorId}
                  onOpenVendor={onOpenVendor}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

function TeamChip({
  teammate,
  isCurrent,
  onOpenVendor,
}: {
  teammate: WeddingVendorReference;
  isCurrent: boolean;
  onOpenVendor?: (vendorId: string) => void;
}) {
  const clickable = !isCurrent && onOpenVendor;
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px]",
    isCurrent
      ? "border-gold bg-gold-pale/40 text-gold"
      : "border-border bg-white text-ink-muted",
    clickable && "hover:border-ink/30 hover:text-ink",
  );
  const inner = (
    <>
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
        {teammate.category === "hmua"
          ? "HMUA"
          : teammate.category === "decor_florals"
            ? "Decor"
            : teammate.category === "pandit_ceremony"
              ? "Officiant"
              : teammate.category.charAt(0).toUpperCase() +
                teammate.category.slice(1)}
      </span>
      <span className="truncate">{teammate.name}</span>
      {teammate.traveled && teammate.home_base && (
        <span className="font-mono text-[9px] text-ink-faint">
          (from {teammate.home_base})
        </span>
      )}
    </>
  );
  if (clickable) {
    return (
      <li>
        <button
          type="button"
          onClick={() => onOpenVendor!(teammate.vendor_id)}
          className={classes}
        >
          {inner}
        </button>
      </li>
    );
  }
  return <li className={classes}>{inner}</li>;
}

function ReviewsTab({
  reviews,
  vendor,
}: {
  reviews: CoupleReview[];
  vendor: Vendor;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
        No reviews yet.
      </p>
    );
  }
  const destinationReviews = reviews.filter((r) => r.is_destination);
  const localReviews = reviews.filter((r) => !r.is_destination);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
        <span
          className="font-mono text-[22px] font-medium text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {vendor.rating?.toFixed(1) ?? "—"}
        </span>
        <div className="flex-1">
          <div className="flex text-saffron">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                strokeWidth={1.6}
                fill={
                  i < Math.round(vendor.rating ?? 0) ? "currentColor" : "none"
                }
              />
            ))}
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            Based on {vendor.review_count} reviews
          </p>
        </div>
      </div>

      {destinationReviews.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-teal">
            <Plane size={11} strokeWidth={1.7} />
            Destination reviews
          </h3>
          <div className="space-y-3">
            {destinationReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}

      {localReviews.length > 0 && (
        <section>
          {destinationReviews.length > 0 && (
            <h3 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              All reviews
            </h3>
          )}
          <div className="space-y-3">
            {localReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: CoupleReview }) {
  return (
    <figure className="rounded-lg border border-border bg-white p-4">
      {review.is_destination && review.destination_location && (
        <p className="mb-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-teal">
          <Plane size={9} strokeWidth={2} />
          Destination · {review.destination_location}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-saffron">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            strokeWidth={1.6}
            fill={i < review.rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      <blockquote className="mt-2 font-serif text-[13.5px] italic leading-snug text-ink-soft">
        &ldquo;{review.body}&rdquo;
      </blockquote>
      <figcaption className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        <span className="flex items-center gap-1">
          — {review.couple_names}
          {review.venue_name && ` · ${review.venue_name}`}
          {review.verified && (
            <BadgeCheck size={10} strokeWidth={1.9} className="ml-1 text-gold" />
          )}
        </span>
        <span>
          {new Date(review.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </figcaption>
    </figure>
  );
}

function PackagesTab({ packages }: { packages: VendorPackage[] }) {
  if (packages.length === 0) {
    return (
      <p className="rounded-md border border-ink/8 bg-white p-6 text-center text-[12.5px] italic text-ink-muted">
        This vendor hasn't published packages yet. Reach out through their
        contact info for a custom quote.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: VendorPackage }) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4",
        pkg.featured
          ? "border-gold/40 shadow-[0_0_0_1px_rgba(184,134,11,0.1)]"
          : "border-border",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {pkg.featured && (
              <span className="rounded-full bg-gold-pale px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold">
                Featured
              </span>
            )}
            {pkg.seasonal && (
              <span className="rounded-full bg-teal-pale/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-teal">
                Seasonal
              </span>
            )}
          </div>
          <h4 className="mt-1 font-serif text-[16px] font-medium text-ink">
            {pkg.name}
          </h4>
          <p className="mt-2 text-[13px] leading-snug text-ink-soft">
            {pkg.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className="font-serif text-[18px] font-medium text-ink"
            style={{ letterSpacing: "-0.01em" }}
          >
            {formatPriceDetail(pkg.price_display)}
          </p>
        </div>
      </header>

      {pkg.inclusions.length > 0 && (
        <ul className="mt-3 space-y-1 text-[12.5px] text-ink-soft">
          {pkg.inclusions.map((inc) => (
            <li key={inc} className="flex items-start gap-2">
              <Check
                size={11}
                strokeWidth={2}
                className="mt-[3px] shrink-0 text-gold"
              />
              {inc}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-2 font-mono text-[10.5px] text-ink-muted">
        {pkg.lead_time && (
          <span>
            Lead time:{" "}
            <span className="text-ink-soft">{pkg.lead_time}</span>
          </span>
        )}
        {pkg.capacity_notes && (
          <span>
            Capacity:{" "}
            <span className="text-ink-soft">{pkg.capacity_notes}</span>
          </span>
        )}
      </footer>
    </article>
  );
}

function AboutTab({
  vendor,
  services,
  languages,
}: {
  vendor: Vendor;
  services: string[];
  languages: string[];
}) {
  const contactRows: Array<[string, string, React.ReactNode]> = [
    ["Email", vendor.contact.email, <Mail size={13} strokeWidth={1.6} key="m" />],
    ["Phone", vendor.contact.phone, <Phone size={13} strokeWidth={1.6} key="p" />],
    ["Website", vendor.contact.website, <Globe size={13} strokeWidth={1.6} key="w" />],
    [
      "Instagram",
      vendor.instagram_handle ?? vendor.contact.instagram,
      <AtSign size={13} strokeWidth={1.6} key="i" />,
    ],
    [
      "Pinterest",
      vendor.contact.pinterest ?? "",
      <Sparkles size={13} strokeWidth={1.6} key="pi" />,
    ],
    [
      "Facebook",
      vendor.contact.facebook ?? "",
      <AtSign size={13} strokeWidth={1.6} key="f" />,
    ],
  ];

  return (
    <div className="space-y-5">
      {vendor.bio && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            About the studio
          </h3>
          <p className="text-[14px] leading-[1.7] text-ink-soft">
            {vendor.bio}
          </p>
        </section>
      )}

      {services.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Services
          </h3>
          <ul className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[13px] text-ink-soft">
                <Check size={11} strokeWidth={2} className="mt-[4px] text-gold" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {vendor.style_tags.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Style
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {vendor.style_tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-ivory-warm px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            <Languages size={12} strokeWidth={1.7} />
            Languages
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <span
                key={l}
                className="rounded-full border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-soft"
              >
                {l}
              </span>
            ))}
          </div>
        </section>
      )}

      {vendor.travel_fee_description && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            <Plane size={12} strokeWidth={1.7} />
            Travel policy
          </h3>
          <p className="rounded-md border border-border bg-white p-3 text-[13px] italic text-ink-soft">
            {vendor.travel_fee_description}
          </p>
          {vendor.destination_booking_lead_months != null && (
            <p className="mt-2 font-mono text-[10.5px] text-ink-muted">
              Destinations book {vendor.destination_booking_lead_months}+
              months in advance.
            </p>
          )}
        </section>
      )}

      <section>
        <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Contact
        </h3>
        <ul className="space-y-2">
          {contactRows.map(
            ([label, value, icon]) =>
              value && (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-md border border-ink/8 bg-white px-3 py-2.5"
                >
                  <span className="text-ink-faint">{icon}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                    {label}
                  </span>
                  <span className="ml-auto truncate text-[12.5px] text-ink-soft">
                    {value}
                  </span>
                </li>
              ),
          )}
        </ul>
      </section>
    </div>
  );
}

// ── Small helpers ───────────────────────────────────────────────────────────

function DestinationsSection({
  destinations,
  countryCount,
  totalWeddings,
  travelFeeDescription,
  passportValid,
  bookingLeadMonths,
}: {
  destinations: NonNullable<Vendor["destinations"]>;
  countryCount: number;
  totalWeddings: number;
  travelFeeDescription: string | null;
  passportValid: boolean | null;
  bookingLeadMonths: number | null;
}) {
  // Group entries by region for the segmented display. Regions render as
  // section headers, cities underneath as visual tiles with large numerals.
  const byRegion = useMemo(() => {
    const map = new Map<string, NonNullable<Vendor["destinations"]>>();
    for (const d of destinations) {
      const arr = map.get(d.region) ?? [];
      arr.push(d);
      map.set(d.region, arr);
    }
    return [...map.entries()].sort(
      (a, b) =>
        b[1].reduce((s, d) => s + d.wedding_count, 0) -
        a[1].reduce((s, d) => s + d.wedding_count, 0),
    );
  }, [destinations]);

  return (
    <section className="rounded-xl border border-teal/20 bg-gradient-to-br from-teal-pale/40 via-ivory to-ivory p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-teal">
            <Globe2 size={12} strokeWidth={1.8} />
            Destinations worked
          </p>
          <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
            {countryCount} countr{countryCount === 1 ? "y" : "ies"} ·{" "}
            <span className="text-teal">{totalWeddings}</span> wedding
            {totalWeddings === 1 ? "" : "s"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {passportValid && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-teal ring-1 ring-teal/20">
              <BadgeCheck size={10} strokeWidth={2} />
              Passport ready
            </span>
          )}
          {bookingLeadMonths != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-teal ring-1 ring-teal/20">
              <Clock size={10} strokeWidth={1.8} />
              {bookingLeadMonths}mo lead
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {byRegion.map(([region, entries]) => (
          <div key={region}>
            <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-teal/80">
              {region}
            </p>
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {entries.map((d) => (
                <li
                  key={`${d.city}-${d.country}`}
                  className="relative overflow-hidden rounded-lg bg-white p-3 ring-1 ring-teal/15"
                >
                  <p
                    className="font-serif text-[28px] font-medium leading-none text-teal"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {d.wedding_count}
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-ink">
                    {d.city}
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-ink-muted">
                    {d.country}
                  </p>
                  <MapPin
                    size={14}
                    strokeWidth={1.5}
                    className="absolute right-2 top-2 text-teal/25"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {travelFeeDescription && (
        <div className="mt-5 flex items-start gap-2 rounded-md bg-white/70 px-3 py-2.5 ring-1 ring-teal/15">
          <Plane
            size={12}
            strokeWidth={1.7}
            className="mt-[3px] shrink-0 text-teal"
          />
          <p className="text-[12px] leading-snug text-ink-soft">
            <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
              Travel fee
            </span>{" "}
            · {travelFeeDescription}
          </p>
        </div>
      )}
    </section>
  );
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "·";
}

function PlannersSection({
  connections,
}: {
  connections: Array<PlannerConnection & { is_couples_planner: boolean }>;
}) {
  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-gold">
            <Sparkles size={12} strokeWidth={1.8} />
            Trusted by Planners
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            {connections.length} planner
            {connections.length === 1 ? "" : "s"} recommend this studio
          </h3>
        </div>
      </header>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {connections.slice(0, 6).map((p) => (
          <li
            key={p.planner_id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              p.is_couples_planner
                ? "border-gold/50 bg-gold-pale/30"
                : "border-border bg-white",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-[14px] font-medium",
                p.is_couples_planner
                  ? "bg-gold text-ivory"
                  : "bg-ivory-warm text-ink-soft ring-1 ring-border",
              )}
            >
              {initialsOf(p.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13.5px] text-ink">
                {p.name}
                {p.is_couples_planner && (
                  <span className="rounded-full bg-gold px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-ivory">
                    your planner
                  </span>
                )}
              </p>
              <p className="truncate font-mono text-[10.5px] text-ink-muted">
                {p.company}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="font-serif text-[20px] font-medium leading-none text-gold"
                style={{ letterSpacing: "-0.01em" }}
              >
                {p.wedding_count}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                weddings
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VenuesSection({
  venues,
  coupleVenueName,
}: {
  venues: Array<VenueConnection & { is_couples_venue: boolean }>;
  coupleVenueName: string | null;
}) {
  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-saffron">
            <Building2 size={12} strokeWidth={1.8} />
            Has shot at
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            {venues.length} venue{venues.length === 1 ? "" : "s"} in their
            wedding history
          </h3>
        </div>
      </header>
      <ul className="space-y-2">
        {venues.slice(0, 6).map((v) => (
          <li
            key={v.venue_id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              v.is_couples_venue
                ? "border-gold/50 bg-gold-pale/30"
                : "border-border bg-white",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                v.is_couples_venue
                  ? "bg-gold text-ivory"
                  : "bg-ivory-warm text-ink-muted ring-1 ring-border",
              )}
            >
              <Building2 size={15} strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13.5px] text-ink">
                {v.name}
                {v.is_couples_venue && (
                  <span className="rounded-full bg-gold px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-ivory">
                    your venue
                  </span>
                )}
              </p>
              <p className="flex items-center gap-1 font-mono text-[10.5px] text-ink-muted">
                <MapPin size={9} strokeWidth={1.7} />
                {v.city}, {v.state}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="font-serif text-[20px] font-medium leading-none text-saffron"
                style={{ letterSpacing: "-0.01em" }}
              >
                {v.wedding_count}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                wedding{v.wedding_count === 1 ? "" : "s"}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {coupleVenueName &&
        !venues.some((v) => v.is_couples_venue) && (
          <p className="mt-3 font-mono text-[10.5px] italic text-ink-muted">
            Not yet shot at {coupleVenueName}.
          </p>
        )}
    </section>
  );
}

function TravelPill({
  level,
  countryCount,
}: {
  level: Vendor["travel_level"];
  countryCount: number;
}) {
  if (level === "local") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">
        Local
      </span>
    );
  }
  const label =
    level === "worldwide"
      ? "Worldwide"
      : level === "destination"
        ? "Destination"
        : level === "nationwide"
          ? "Nationwide"
          : "Regional";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-pale/70 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-teal">
      <Plane size={9} strokeWidth={2} />
      {label}
      {(level === "destination" || level === "worldwide") && countryCount > 0 && (
        <span className="text-teal/70">
          · {countryCount} countr{countryCount === 1 ? "y" : "ies"}
        </span>
      )}
    </span>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 font-mono text-[13.5px] text-ink">{value}</p>
    </div>
  );
}

function IconGhost({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
    >
      {children}
    </button>
  );
}

function Lightbox({
  post,
  onClose,
}: {
  post: PortfolioPost;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink/85 p-8"
    >
      <img
        src={post.image_url}
        alt={post.caption}
        className="max-h-[85vh] max-w-full rounded-md object-contain"
      />
      {post.caption && (
        <p className="mt-3 max-w-[640px] text-center text-[13px] italic text-white/90">
          {post.caption}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink-soft ring-1 ring-border hover:bg-white"
      >
        <X size={16} strokeWidth={1.8} />
      </button>
    </motion.div>
  );
}
