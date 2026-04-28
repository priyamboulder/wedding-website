"use client";

// ── Marketplace category page ──────────────────────────────────
// Public landing for a single category. Reads vendors from the unified
// vendors-store, filtered to the category slug.

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { CATEGORIES } from "@/lib/marketing/data";
import { useVendorsStore } from "@/stores/vendors-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import type { VendorCategory } from "@/types/vendor";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

// Map marketing category slug → unified VendorCategory id.
const MARKETING_SLUG_TO_CATEGORY: Record<string, VendorCategory | undefined> = {
  "decor-design": "decor_florals",
  "catering-dining": "catering",
  photography: "photography",
  "hair-makeup": "hmua",
  entertainment: "entertainment",
  stationery: "stationery",
  "priests-pandits": "pandit_ceremony",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);
  const [activeSub, setActiveSub] = useState<Record<string, string | null>>({});
  const vendors = useVendorsStore((s) => s.vendors);
  const initFromAPI = useVendorsStore((s) => s.initFromAPI);

  useEffect(() => {
    if (vendors.length === 0) initFromAPI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!category) return notFound();

  const unifiedCategory = MARKETING_SLUG_TO_CATEGORY[category.slug];

  const categoryVendors = useMemo(
    () => (unifiedCategory ? vendors.filter((v) => v.category === unifiedCategory) : []),
    [vendors, unifiedCategory],
  );

  const activeTags = Object.values(activeSub).filter(Boolean) as string[];

  const filteredVendors = useMemo(() => {
    if (activeTags.length === 0) return categoryVendors;
    return categoryVendors.filter((v) => {
      const tags = v.style_tags.map((t) => t.toLowerCase());
      return activeTags.every((t) => tags.includes(t.toLowerCase()));
    });
  }, [categoryVendors, activeTags]);

  const related = (category.related ?? [])
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 3);

  const toggleSub = (group: string, option: string) => {
    setActiveSub((prev) => ({
      ...prev,
      [group]: prev[group] === option ? null : option,
    }));
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-6 pb-4 pt-4 md:px-12 md:pb-6 md:pt-6">
        <div
          className="flex items-center gap-2 text-[12px] text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
        >
          <Link href="/marketplace" className="transition-colors hover:text-[#B8755D]">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[#1C1917]/70">{category.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 pb-14 pt-4 md:px-12 md:pb-20 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            The Marketplace · Category
          </span>
          <h1
            className="mt-6 max-w-[1000px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(40px, 6vw, 96px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {category.name}
          </h1>
          <p
            className="mt-8 max-w-[640px] text-[#1C1917]/75"
            style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 22, lineHeight: 1.5 }}
          >
            {category.longDescription ?? category.description}
          </p>
        </motion.div>
      </section>

      <section className="sticky top-[64px] z-30 border-y border-[#1C1917]/10 bg-[#F7F5F0]/85 backdrop-blur md:top-[72px]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="flex items-center gap-2 overflow-x-auto py-4 md:py-5 workspace-event-chip-scroll">
            <CategoryChip
              href="/marketplace"
              label="All Vendors"
              count={vendors.length}
              active={false}
            />
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.slug}
                href={`/marketplace/category/${cat.slug}`}
                label={cat.name}
                count={cat.count}
                active={cat.slug === category.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {category.subfilters && category.subfilters.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pt-10 md:px-12 md:pt-14">
          <div className="flex flex-col gap-6">
            {category.subfilters.map((group) => (
              <div key={group.label} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <span
                  className="shrink-0 text-[10px] uppercase text-[#A8998A]"
                  style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
                >
                  {group.label}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {group.options.map((opt) => {
                    const active = activeSub[group.label] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleSub(group.label, opt)}
                        className="rounded-full border px-3.5 py-1.5 transition-colors"
                        style={{
                          fontFamily: BODY,
                          fontSize: 12.5,
                          letterSpacing: "0.04em",
                          borderColor: active ? "#1C1917" : "rgba(28,25,23,0.15)",
                          backgroundColor: active ? "#1C1917" : "transparent",
                          color: active ? "#F7F5F0" : "#1C1917",
                        }}
                        aria-pressed={active}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveSub({})}
                className="self-start text-[12px] tracking-[0.04em] text-[#B8755D] transition-colors hover:text-[#1C1917]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                Clear filters
              </button>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((v, i) => (
            <motion.div
              key={v.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/marketplace/${v.slug}`} className="group block">
                <div className="relative aspect-square w-full overflow-hidden bg-[#9C6F5D]">
                  {v.cover_image && (
                    <img
                      src={v.cover_image}
                      alt={v.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-4 top-4">
                    <span
                      className="inline-flex items-center gap-2 bg-[#F7F5F0]/90 px-3 py-1.5 text-[9px] uppercase text-[#1C1917]"
                      style={{ fontFamily: BODY, letterSpacing: "0.22em", fontWeight: 500 }}
                    >
                      <span className="h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
                      Ananya Curated
                    </span>
                  </div>
                  <div
                    className="absolute bottom-4 left-4 text-[11px] uppercase text-white/90"
                    style={{
                      fontFamily: BODY,
                      letterSpacing: "0.26em",
                      opacity: 0.8,
                    }}
                  >
                    {formatPriceShort(v.price_display)} · {v.years_active} yrs
                  </div>
                </div>
                <div className="mt-5">
                  <h4
                    className="text-[#1C1917]"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 24,
                      lineHeight: 1.15,
                      letterSpacing: "-0.005em",
                      fontWeight: 500,
                    }}
                  >
                    {v.name}
                  </h4>
                  <p
                    className="mt-1.5 text-[#A8998A]"
                    style={{ fontFamily: BODY, fontSize: 13, letterSpacing: "0.02em" }}
                  >
                    {CATEGORY_LABELS[v.category]} · {v.location}
                  </p>
                  {v.tagline && (
                    <p
                      className="mt-3 text-[#1C1917]/75"
                      style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 17, lineHeight: 1.4 }}
                    >
                      {v.tagline}
                    </p>
                  )}
                </div>
                <span
                  className="mt-4 inline-block text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
                  style={{ fontFamily: BODY, fontWeight: 500 }}
                >
                  View Profile →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        {filteredVendors.length === 0 && (
          <p
            className="mx-auto max-w-[560px] py-28 text-center text-[#A8998A]"
            style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 22, lineHeight: 1.5 }}
          >
            {categoryVendors.length === 0
              ? "This category is still being built. Check back — we're vetting new studios each week."
              : "No studios match that combination yet. Try clearing a filter."}
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-12 md:pb-32">
          <div className="border-t border-[#1C1917]/10 pt-16 md:pt-24">
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              You might also explore
            </span>
            <h2
              className="mt-5 mb-12 max-w-[600px]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 36,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              Vendors who pair <span style={{ fontStyle: "italic" }}>well with {category.name.toLowerCase()}.</span>
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/marketplace/category/${rel.slug}`}
                  className="group block"
                >
                  <div
                    className="aspect-[5/4] w-full overflow-hidden"
                    style={{ backgroundColor: rel.bg }}
                  >
                    <div className="flex h-full flex-col justify-end p-6">
                      <span
                        className="text-[10px] uppercase"
                        style={{
                          fontFamily: BODY,
                          letterSpacing: "0.3em",
                          color: rel.fg,
                          opacity: 0.75,
                        }}
                      >
                        {rel.count} studios
                      </span>
                      <h3
                        className="mt-3"
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 28,
                          lineHeight: 1.1,
                          letterSpacing: "-0.01em",
                          fontWeight: 500,
                          color: rel.fg,
                        }}
                      >
                        {rel.name}
                      </h3>
                    </div>
                  </div>
                  <p
                    className="mt-4 max-w-[380px] text-[#1C1917]/75"
                    style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 17, lineHeight: 1.45 }}
                  >
                    {rel.tagline}
                  </p>
                  <span
                    className="mt-3 inline-block text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
                    style={{ fontFamily: BODY, fontWeight: 500 }}
                  >
                    Explore {rel.name} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function CategoryChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-full border px-4 py-2 transition-colors"
      style={{
        fontFamily: BODY,
        fontSize: 13,
        letterSpacing: "0.04em",
        borderColor: active ? "#1C1917" : "rgba(28,25,23,0.15)",
        backgroundColor: active ? "#1C1917" : "transparent",
        color: active ? "#F7F5F0" : "#1C1917",
      }}
      aria-current={active ? "page" : undefined}
    >
      {label}
      <span
        className="ml-2 text-[11px]"
        style={{ opacity: active ? 0.65 : 0.45 }}
      >
        {count}
      </span>
    </Link>
  );
}
