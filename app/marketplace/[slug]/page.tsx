"use client";

// ── Vendor profile (public marketplace) ─────────────────────────
// Public page. Reads the vendor by slug from vendors-store. Packages come
// from the vendor's `packages` array. Inquiries work without login.

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { useVendorsStore } from "@/stores/vendors-store";
import { useCartStore } from "@/stores/cart-store";
import { useInquiryStore } from "@/stores/inquiry-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthGatedAction } from "@/lib/auth-gate";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import {
  formatPriceDetail,
  formatPriceShort,
  priceDisplayLowEnd,
} from "@/lib/vendors/price-display";
import type { Vendor, VendorPackage } from "@/types/vendor";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type SectionId = "portfolio" | "packages" | "about";

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: "portfolio", label: "Portfolio" },
  { id: "packages", label: "Services & Packages" },
  { id: "about", label: "About" },
];

export default function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const vendor = useVendorsStore((s) => s.vendors.find((v) => v.slug === slug));
  const initFromAPI = useVendorsStore((s) => s.initFromAPI);
  const vendorsCount = useVendorsStore((s) => s.vendors.length);

  useEffect(() => {
    if (vendorsCount === 0) initFromAPI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!vendor) return notFound();
  return <VendorProfile vendor={vendor} />;
}

function VendorProfile({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [active, setActive] = useState<SectionId>("portfolio");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const gateInquiry = useAuthGatedAction("send-inquiry");
  const openInquiry = () => gateInquiry(() => setInquiryOpen(true));
  const cartItems = useCartStore((s) => s.items);
  const addedPackages = useMemo(
    () =>
      cartItems
        .filter((i) => i.id.startsWith(`pkg:${vendor.slug}:`))
        .map((i) => i.id),
    [cartItems, vendor.slug],
  );

  const allVendors = useVendorsStore((s) => s.vendors);
  const related = allVendors
    .filter((v) => v.slug !== vendor.slug && v.category === vendor.category)
    .slice(0, 4);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(s.id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: SectionId) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const categoryLabel = CATEGORY_LABELS[vendor.category];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-6 pb-4 pt-2 md:px-12 md:pb-6 md:pt-4">
        <nav
          className="flex items-center gap-2 text-[12px] text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
          aria-label="Breadcrumb"
        >
          <Link href="/marketplace" className="transition-colors hover:text-[#B8755D]">
            Marketplace
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/marketplace?category=${vendor.category}`}
            className="transition-colors hover:text-[#B8755D]"
          >
            {categoryLabel}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[#1C1917]/70">{vendor.name}</span>
        </nav>
      </div>

      <HeroSection vendor={vendor} onInquiry={openInquiry} />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-10 pb-36 lg:grid-cols-[1fr_340px] lg:gap-16 lg:pb-24">
          <div>
            <nav
              className="sticky top-[64px] z-20 -mx-6 mb-10 border-y border-[#1C1917]/10 bg-[#F7F5F0]/90 px-6 backdrop-blur md:top-[72px] md:-mx-12 md:px-12"
              aria-label="Profile sections"
            >
              <div className="flex items-center gap-1 overflow-x-auto py-3 md:gap-2 md:py-4">
                {SECTIONS.map((s) => {
                  const isActive = active === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className="shrink-0 border px-4 py-2 transition-colors"
                      style={{
                        fontFamily: BODY,
                        fontSize: 12.5,
                        letterSpacing: "0.05em",
                        borderColor: isActive ? "#1C1917" : "rgba(28,25,23,0.15)",
                        backgroundColor: isActive ? "#1C1917" : "transparent",
                        color: isActive ? "#F7F5F0" : "#1C1917",
                        borderRadius: 999,
                      }}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            <PortfolioSection vendor={vendor} />
            <PackagesSection vendor={vendor} addedPackages={addedPackages} />
            <AboutSection vendor={vendor} />
          </div>

          <aside className="hidden lg:block">
            <InquirySidebar vendor={vendor} onOpenForm={openInquiry} />
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-28 md:px-12 md:pb-32">
          <div className="border-t border-[#1C1917]/10 pt-16 md:pt-24">
            <div className="flex items-end justify-between">
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                  fontWeight: 400,
                }}
              >
                Similar <span style={{ fontStyle: "italic" }}>vendors</span>
              </h2>
              <Link
                href={`/marketplace?category=${vendor.category}`}
                className="hidden text-[12.5px] tracking-[0.04em] text-[#1C1917]/70 transition-colors hover:text-[#B8755D] md:inline"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                See all in {categoryLabel} →
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((v) => (
                <Link key={v.slug} href={`/marketplace/${v.slug}`} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#9C6F5D]">
                    {v.cover_image && (
                      <img
                        src={v.cover_image}
                        alt={v.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <h4
                    className="mt-4 text-[#1C1917]"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 20,
                      lineHeight: 1.2,
                      letterSpacing: "-0.005em",
                      fontWeight: 500,
                    }}
                  >
                    {v.name}
                  </h4>
                  <p
                    className="mt-1 text-[#A8998A]"
                    style={{
                      fontFamily: BODY,
                      fontSize: 13,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {v.location}
                  </p>
                  <span
                    className="mt-2 inline-block text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
                    style={{ fontFamily: BODY, fontWeight: 500 }}
                  >
                    View Profile →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileStickyBar vendor={vendor} onOpenForm={openInquiry} />

      <AnimatePresence>
        {inquiryOpen && (
          <InquiryModal
            vendor={vendor}
            onClose={() => setInquiryOpen(false)}
            onSubmitted={() => {
              setInquiryOpen(false);
              window.setTimeout(() => router.push("/cart"), 400);
            }}
          />
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}

function HeroSection({
  vendor,
  onInquiry,
}: {
  vendor: Vendor;
  onInquiry: () => void;
}) {
  const categoryLabel = CATEGORY_LABELS[vendor.category];
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-14 md:px-12 md:pb-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[5/6] w-full overflow-hidden bg-[#9C6F5D]"
        >
          {vendor.cover_image ? (
            <img
              src={vendor.cover_image}
              alt={vendor.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute left-5 top-5">
            <span
              className="inline-flex items-center gap-2 bg-[#F7F5F0]/90 px-3 py-1.5 text-[9px] uppercase text-[#1C1917]"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.22em",
                fontWeight: 500,
              }}
            >
              <span className="h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
              Ananya Curated
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <span
            className="inline-flex self-start text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            {categoryLabel} · {vendor.location}
          </span>
          <h1
            className="mt-5 text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(36px, 5vw, 76px)",
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              fontWeight: 500,
            }}
          >
            {vendor.name}
          </h1>
          {vendor.tagline && (
            <p
              className="mt-4 max-w-[560px] text-[#1C1917]/75"
              style={{
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.4,
              }}
            >
              {vendor.tagline}
            </p>
          )}

          <HeroStats vendor={vendor} />

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <button
              type="button"
              onClick={onInquiry}
              className="inline-flex items-center gap-3 bg-[#1C1917] px-9 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Start a Conversation
            </button>
            <span
              className="text-[12.5px] text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
            >
              No login required · we&apos;ll ask for your email in the form
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStats({ vendor }: { vendor: Vendor }) {
  const stats: Array<{ label: string; value: string }> = [
    { label: "Years", value: `${vendor.years_active}` },
    { label: "Weddings", value: `${vendor.wedding_count}` },
  ];
  if (vendor.rating != null) {
    stats.push({
      label: "Rating",
      value: `${vendor.rating.toFixed(1)}${
        vendor.review_count ? ` · ${vendor.review_count}` : ""
      }`,
    });
  }
  stats.push({ label: "Range", value: vendor.price_display ? formatPriceShort(vendor.price_display) : "" });

  return (
    <dl
      className="mt-8 grid grid-cols-2 gap-y-5 border-y border-[#1C1917]/10 py-6 sm:grid-cols-4"
      style={{ fontFamily: BODY }}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <dt
            className="block text-[10px] uppercase text-[#A8998A]"
            style={{ letterSpacing: "0.28em" }}
          >
            {s.label}
          </dt>
          <dd
            className="mt-2 block text-[#1C1917]"
            style={{ fontSize: 17, fontWeight: 500 }}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PortfolioSection({ vendor }: { vendor: Vendor }) {
  const images = vendor.portfolio_images ?? [];

  return (
    <section
      id="section-portfolio"
      className="scroll-mt-40 pb-20 md:pb-28"
      aria-label="Portfolio"
    >
      <SectionHeading
        kicker="Portfolio"
        title={
          <>
            Their work,
            <br />
            <span style={{ fontStyle: "italic" }}>recently.</span>
          </>
        }
      />
      {images.length === 0 ? (
        <EmptyBlock body="No portfolio images published yet." />
      ) : (
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img, i) => (
            <motion.figure
              key={img.url}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.04 }}
              className="mb-4 break-inside-avoid"
            >
              <div className="overflow-hidden bg-ivory-warm">
                <img
                  src={img.url}
                  alt={img.alt ?? vendor.name}
                  className="w-full object-cover"
                />
              </div>
              {img.alt && (
                <figcaption
                  className="mt-2 text-[11.5px] text-[#A8998A]"
                  style={{
                    fontFamily: BODY,
                    letterSpacing: "0.02em",
                  }}
                >
                  {img.alt}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
      )}
    </section>
  );
}

function PackagesSection({
  vendor,
  addedPackages,
}: {
  vendor: Vendor;
  addedPackages: string[];
}) {
  const packages = [...vendor.packages].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });

  return (
    <section
      id="section-packages"
      className="scroll-mt-40 border-t border-[#1C1917]/10 pb-20 pt-16 md:pb-28 md:pt-24"
      aria-label="Services and packages"
    >
      <SectionHeading
        kicker="Services & Packages"
        title={
          <>
            What they <span style={{ fontStyle: "italic" }}>offer.</span>
          </>
        }
        note="Add anything that looks right to your inquiry. Nothing is billed until you and the vendor agree on terms."
      />
      {packages.length === 0 ? (
        <EmptyBlock body="This vendor is finalizing their published package list. Start a conversation for a custom quote." />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p, i) => (
            <PackageCard
              key={p.id}
              vendor={vendor}
              pkg={p}
              delayIndex={i}
              isAdded={addedPackages.includes(`pkg:${vendor.slug}:${p.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PackageCard({
  vendor,
  pkg,
  delayIndex,
  isAdded,
}: {
  vendor: Vendor;
  pkg: VendorPackage;
  delayIndex: number;
  isAdded: boolean;
}) {
  const addToCart = useCartStore((s) => s.add);
  const gateSave = useAuthGatedAction("save-selection");
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    gateSave(() => {
      addToCart({
        id: `pkg:${vendor.slug}:${pkg.id}`,
        kind: "vendor-package",
        title: pkg.name,
        subtitle: `${vendor.name} · ${CATEGORY_LABELS[vendor.category]}`,
        imageBg: "#9C6F5D",
        price: pkg.price_display ? (priceDisplayLowEnd(pkg.price_display) ?? undefined) : undefined,
      });
      setJustAdded(true);
    });
  };

  const added = isAdded || justAdded;
  const priceLabel = pkg.price_display ? formatPriceDetail(pkg.price_display) : "";
  const hasAmount = pkg.price_display ? pkg.price_display.type !== "contact" : false;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: delayIndex * 0.06 }}
      className="flex flex-col border border-[#1C1917]/10 bg-white/40 p-7 md:p-8"
    >
      <header>
        <h3
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            fontWeight: 500,
          }}
        >
          {pkg.name}
        </h3>
        <p
          className="mt-3 text-[#1C1917]/75"
          style={{
            fontFamily: BODY,
            fontSize: 14.5,
            lineHeight: 1.65,
          }}
        >
          {pkg.description}
        </p>
      </header>

      <ul
        className="mt-6 space-y-2.5 text-[#1C1917]/85"
        style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55 }}
      >
        {pkg.inclusions.map((inc) => (
          <li key={inc} className="flex items-start gap-3">
            <span className="mt-[9px] h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
            {inc}
          </li>
        ))}
      </ul>

      <footer className="mt-auto pt-8">
        <div className="flex items-end justify-between border-t border-[#1C1917]/10 pt-4">
          <div>
            <span
              className="block text-[10px] uppercase text-[#A8998A]"
              style={{
                fontFamily: BODY,
                letterSpacing: "0.28em",
              }}
            >
              {hasAmount ? "Pricing" : "Starts at"}
            </span>
            <span
              className="mt-1 block text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {priceLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={added}
            className="inline-flex items-center border px-4 py-2.5 text-[12px] tracking-[0.06em] transition-colors"
            style={{
              fontFamily: BODY,
              fontWeight: 500,
              borderColor: added ? "#B8755D" : "#1C1917",
              backgroundColor: added ? "#B8755D" : "transparent",
              color: added ? "#F7F5F0" : "#1C1917",
            }}
          >
            {added ? "Added ✓" : "Add to Inquiry"}
          </button>
        </div>
      </footer>
    </motion.article>
  );
}

function AboutSection({ vendor }: { vendor: Vendor }) {
  return (
    <section
      id="section-about"
      className="scroll-mt-40 border-t border-[#1C1917]/10 pt-16 md:pt-24"
      aria-label="About"
    >
      <SectionHeading
        kicker="About"
        title={
          <>
            Behind the <span style={{ fontStyle: "italic" }}>studio.</span>
          </>
        }
      />
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <div>
          {vendor.bio && (
            <p
              className="text-[#1C1917]/80"
              style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75 }}
            >
              {vendor.bio}
            </p>
          )}
        </div>

        <div className="space-y-10">
          {vendor.style_tags.length > 0 && (
            <div>
              <span
                className="block text-[10px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
              >
                Known for
              </span>
              <ul
                className="mt-4 grid grid-cols-1 gap-y-3 text-[#1C1917]/85"
                style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55 }}
              >
                {vendor.style_tags.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-[9px] h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <span
              className="block text-[10px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
            >
              Studio details
            </span>
            <dl
              className="mt-4 grid grid-cols-1 gap-y-3 text-[#1C1917]/85"
              style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.5 }}
            >
              <Detail label="Owner" value={vendor.owner_name || "—"} />
              <Detail label="Team size" value={`${vendor.team_size}`} />
              <Detail label="Years active" value={`${vendor.years_active}`} />
              <Detail
                label="Response time"
                value={
                  vendor.response_time_hours != null
                    ? `within ${vendor.response_time_hours}h`
                    : "—"
                }
              />
              <Detail
                label="Contact"
                value={
                  <span>
                    {vendor.contact.email && (
                      <a
                        href={`mailto:${vendor.contact.email}`}
                        className="text-[#1C1917] underline decoration-[#B8755D]/40 underline-offset-4 transition-colors hover:text-[#B8755D]"
                      >
                        {vendor.contact.email}
                      </a>
                    )}
                    {vendor.contact.email && vendor.contact.phone && (
                      <span className="mx-2 text-[#A8998A]">·</span>
                    )}
                    {vendor.contact.phone && (
                      <a
                        href={`tel:${vendor.contact.phone}`}
                        className="text-[#1C1917] underline decoration-[#B8755D]/40 underline-offset-4 transition-colors hover:text-[#B8755D]"
                      >
                        {vendor.contact.phone}
                      </a>
                    )}
                  </span>
                }
              />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function InquirySidebar({
  vendor,
  onOpenForm,
}: {
  vendor: Vendor;
  onOpenForm: () => void;
}) {
  const cartItems = useCartStore((s) => s.items);
  const cart = useMemo(
    () => cartItems.filter((i) => i.id.startsWith(`pkg:${vendor.slug}:`)),
    [cartItems, vendor.slug],
  );

  return (
    <div className="sticky top-[120px]">
      <div className="border border-[#1C1917]/15 bg-white/70 p-7">
        <span
          className="block text-[10px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
        >
          Start a Conversation
        </span>
        <h3
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            fontWeight: 500,
          }}
        >
          With {vendor.name}
        </h3>
        <p
          className="mt-3 text-[#1C1917]/70"
          style={{
            fontFamily: BODY,
            fontSize: 13.5,
            lineHeight: 1.65,
          }}
        >
          Share the basics of your wedding. The studio will reply within two
          business days.
        </p>

        {cart.length > 0 && (
          <div className="mt-5 border-t border-[#1C1917]/10 pt-4">
            <span
              className="block text-[10px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
            >
              In your inquiry
            </span>
            <ul
              className="mt-2 space-y-1.5 text-[#1C1917]/85"
              style={{ fontFamily: BODY, fontSize: 13 }}
            >
              {cart.map((i) => (
                <li key={i.id} className="flex items-baseline justify-between gap-3">
                  <span>{i.title}</span>
                  {typeof i.price === "number" && (
                    <span className="text-[#A8998A]">
                      ${i.price.toLocaleString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenForm}
          className="mt-6 inline-flex w-full items-center justify-center bg-[#1C1917] px-6 py-3.5 text-[12.5px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Send Inquiry
        </button>
        {vendor.contact.phone && (
          <a
            href={`tel:${vendor.contact.phone}`}
            className="mt-3 inline-flex w-full items-center justify-center border border-[#1C1917]/20 px-6 py-3 text-[12.5px] tracking-[0.06em] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Call {vendor.contact.phone}
          </a>
        )}
      </div>
      <p
        className="mt-4 px-1 text-[#A8998A]"
        style={{
          fontFamily: BODY,
          fontSize: 11.5,
          lineHeight: 1.6,
        }}
      >
        Inquiries are free. You don&apos;t need an account to send one —
        creating one lets you track replies in one place.
      </p>
    </div>
  );
}

function MobileStickyBar({
  vendor,
  onOpenForm,
}: {
  vendor: Vendor;
  onOpenForm: () => void;
}) {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = useMemo(
    () => cartItems.filter((i) => i.id.startsWith(`pkg:${vendor.slug}:`)).length,
    [cartItems, vendor.slug],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1C1917]/10 bg-[#F7F5F0]/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3">
        <div className="flex-1">
          <span
            className="block text-[10px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.22em" }}
          >
            Start a Conversation
          </span>
          <span
            className="mt-0.5 block truncate text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            with {vendor.name}
            {cartCount > 0 && (
              <span className="ml-2 text-[11px] text-[#B8755D]">
                · {cartCount} in inquiry
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenForm}
          className="shrink-0 bg-[#1C1917] px-5 py-3 text-[12px] tracking-[0.08em] text-[#F7F5F0] transition-colors active:bg-[#B8755D]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Send →
        </button>
      </div>
    </div>
  );
}

function InquiryModal({
  vendor,
  onClose,
  onSubmitted,
}: {
  vendor: Vendor;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const submitInquiry = useInquiryStore((s) => s.submitInquiry);
  const user = useAuthStore((s) => s.user);
  const addCart = useCartStore((s) => s.add);
  const cartItems = useCartStore((s) => s.items);
  const cart = useMemo(
    () => cartItems.filter((i) => i.id.startsWith(`pkg:${vendor.slug}:`)),
    [cartItems, vendor.slug],
  );

  const [coupleName, setCoupleName] = useState(user?.name ?? "");
  const [weddingDate, setWeddingDate] = useState(
    user?.wedding?.weddingDate ?? "",
  );
  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [wantsAccount, setWantsAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    coupleName.trim().length > 1 &&
    email.trim().length > 3 &&
    email.includes("@") &&
    !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const packageIds = cart.map((c) => c.id.split(":").slice(-1)[0]);
    submitInquiry({
      couple_id: user?.id ?? `guest_${email.trim().toLowerCase()}`,
      couple_name: coupleName.trim(),
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      vendor_category: vendor.category,
      planner_id: null,
      source: "marketplace",
      message: message.trim(),
      package_ids: packageIds,
      wedding_date: weddingDate.trim(),
      guest_count: user?.wedding?.guestCount ?? 0,
      venue_name: user?.wedding?.location ?? null,
      events: eventType.trim() ? [eventType.trim()] : [],
      budget_min: null,
      budget_max: null,
    });

    addCart({
      id: `inquiry:${vendor.slug}`,
      kind: "vendor-inquiry",
      title: `Inquiry — ${vendor.name}`,
      subtitle: `${CATEGORY_LABELS[vendor.category]} · ${vendor.location}`,
      imageBg: "#9C6F5D",
    });

    onSubmitted();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1C1917]/55 p-0 md:items-center md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[92vh] w-full max-w-[620px] overflow-y-auto bg-[#F7F5F0] p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-[13px] text-[#A8998A] transition-colors hover:text-[#1C1917]"
          style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
          aria-label="Close"
        >
          Close ×
        </button>
        <span
          className="block text-[10px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
        >
          New inquiry
        </span>
        <h2
          id="inquiry-title"
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 30,
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            fontWeight: 500,
          }}
        >
          Tell {vendor.name} about your wedding
        </h2>
        <p
          className="mt-3 text-[#1C1917]/70"
          style={{
            fontFamily: BODY,
            fontSize: 14,
            lineHeight: 1.65,
          }}
        >
          A quick note — the studio replies within two business days.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <Field
            label="Couple's name"
            required
            value={coupleName}
            onChange={setCoupleName}
            placeholder="e.g. Priya and Arjun"
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Wedding date"
              value={weddingDate}
              onChange={setWeddingDate}
              placeholder="e.g. November 2026 (estimate ok)"
            />
            <Field
              label="Event type"
              value={eventType}
              onChange={setEventType}
              placeholder="e.g. 3-day Tamil wedding"
            />
          </div>
          <TextArea
            label="Message"
            value={message}
            onChange={setMessage}
            placeholder="A few sentences on what you're planning, and anything you want them to know."
          />
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          {cart.length > 0 && (
            <div className="border border-[#1C1917]/10 bg-white/50 p-4">
              <span
                className="block text-[10px] uppercase text-[#A8998A]"
                style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
              >
                Packages in this inquiry
              </span>
              <ul
                className="mt-2 space-y-1 text-[#1C1917]/85"
                style={{ fontFamily: BODY, fontSize: 13 }}
              >
                {cart.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span>{c.title}</span>
                    {typeof c.price === "number" && (
                      <span className="text-[#A8998A]">
                        ${c.price.toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label
            className="flex cursor-pointer items-start gap-3 border border-[#1C1917]/10 bg-white/40 p-4"
            style={{ fontFamily: BODY }}
          >
            <input
              type="checkbox"
              checked={wantsAccount}
              onChange={(e) => setWantsAccount(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#B8755D]"
            />
            <span>
              <span
                className="block text-[#1C1917]"
                style={{ fontSize: 13.5, fontWeight: 500 }}
              >
                Create a free account to track this inquiry
              </span>
              <span
                className="mt-1 block text-[#1C1917]/65"
                style={{ fontSize: 12.5, lineHeight: 1.55 }}
              >
                You&apos;ll be able to see the vendor&apos;s reply, forward to a
                partner, and keep every conversation in one place. Skip if
                you&apos;d rather just email.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 pt-2">
            <span
              className="text-[11.5px] text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.02em" }}
            >
              By sending, you agree Ananya may share your note with this vendor.
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center bg-[#1C1917] px-7 py-3 text-[12.5px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D] disabled:opacity-40 disabled:hover:bg-[#1C1917]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              {submitting ? "Sending…" : "Send Inquiry →"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
      <div className="max-w-[560px]">
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          {kicker}
        </span>
        <h2
          className="mt-4"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(28px, 3.2vw, 44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            fontWeight: 400,
          }}
        >
          {title}
        </h2>
      </div>
      {note && (
        <p
          className="max-w-[420px] text-[#1C1917]/65"
          style={{
            fontFamily: BODY,
            fontSize: 13.5,
            lineHeight: 1.6,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function EmptyBlock({ body }: { body: string }) {
  return (
    <p
      className="mx-auto mt-12 max-w-[480px] border border-dashed border-[#1C1917]/15 px-6 py-14 text-center text-[#A8998A]"
      style={{
        fontFamily: DISPLAY,
        fontStyle: "italic",
        fontSize: 18,
        lineHeight: 1.6,
      }}
    >
      {body}
    </p>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[#1C1917]/10 pb-3">
      <span
        className="w-28 shrink-0 text-[10px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.22em", paddingTop: 3 }}
      >
        {label}
      </span>
      <span className="flex-1 text-[#1C1917]/85">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span
        className="block text-[10px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
      >
        {label}
        {required && <span className="ml-1 text-[#B8755D]">·</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full border border-[#1C1917]/15 bg-white/70 px-3 py-3 text-[14px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY }}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span
        className="block text-[10px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
      >
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full border border-[#1C1917]/15 bg-white/70 px-3 py-3 text-[14px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
        style={{ fontFamily: BODY, lineHeight: 1.6 }}
      />
    </label>
  );
}
