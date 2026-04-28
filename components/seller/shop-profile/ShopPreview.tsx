"use client";

import type { ShopProduct, ShopProfile } from "@/lib/seller/shop-profile-seed";

export default function ShopPreview({ profile }: { profile: ShopProfile }) {
  const featured = profile.products.filter((p) => p.isPinned).slice(0, 6);
  const enabledSpecialties = [
    ...profile.specialties.productTypes,
    ...profile.specialties.culturalFocus,
    ...profile.specialties.styleTags,
    ...profile.specialties.materials,
  ]
    .filter((t) => t.on)
    .slice(0, 12);

  return (
    <div
      className="overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "rgba(44,44,44,0.08)" }}
    >
      {/* Browser chrome bar for "preview" feel */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{
          backgroundColor: "rgba(250,248,245,0.9)",
          borderColor: "rgba(44,44,44,0.06)",
        }}
      >
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8D5D0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F5E6D0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9E8E4]" />
        </div>
        <span className="flex-1 rounded-md bg-white px-2 py-1 font-mono text-[10.5px] text-stone-500">
          ananya.com/shop/
          {profile.identity.shopName.toLowerCase().replace(/\s+/g, "-")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7a5a16]">
          Live preview
        </span>
      </div>

      {/* ── Banner ── */}
      <div
        className="relative flex h-44 items-end overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${profile.identity.bannerHue} 0%, #C4A265 60%, #8E4A3A 100%)`,
        }}
      >
        <div className="absolute inset-0" aria-hidden>
          <svg width="100%" height="100%" className="opacity-20">
            <defs>
              <pattern id="paisley" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <text x="6" y="44" fontSize="36" fill="#FFFFFA">
                  ❁
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#paisley)" />
          </svg>
        </div>
        <div className="relative flex items-end gap-4 px-8 pb-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-[28px] text-[#7a5a16] shadow-lg"
            style={{
              backgroundColor: "#FBF3E4",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
            }}
          >
            {profile.identity.logoInitials}
          </div>
        </div>
      </div>

      {/* ── Shop identity row ── */}
      <section className="px-8 pb-6 pt-5">
        <h2
          className="text-[30px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.015em",
          }}
        >
          {profile.identity.shopName || "Your shop name"}
        </h2>
        <p className="mt-1 text-[13.5px] italic text-stone-600">
          {profile.identity.tagline || "Your tagline will appear here."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone-600">
          <span>📍 {profile.seller.location}</span>
          <Dot />
          <StarRating value={profile.stats.rating} />
          <span className="font-mono text-[11px]">
            {profile.stats.rating.toFixed(1)} ({profile.stats.reviewCount} reviews)
          </span>
          <Dot />
          <span className="font-mono text-[11px]">
            {profile.stats.productCount} products
          </span>
          <Dot />
          <span className="font-mono text-[11px]">
            {profile.stats.totalSales} sales
          </span>
        </div>
        {profile.identity.instagramHandle && (
          <p className="mt-1.5 font-mono text-[11px] text-stone-500">
            IG · {profile.identity.instagramHandle}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[12.5px] font-medium text-white"
            style={{ backgroundColor: "#C4A265" }}
          >
            <span aria-hidden>✉</span> Message Shop
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-white px-4 text-[12.5px] text-[#2C2C2C]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            <span aria-hidden>♡</span> Follow
          </button>
          {profile.policies.rushOrdersAvailable && (
            <span
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 font-mono text-[10.5px] uppercase tracking-wider text-[#7a5a16]"
              style={{ backgroundColor: "#F5E6D0" }}
            >
              ⚡ Rush orders available
            </span>
          )}
        </div>
        {enabledSpecialties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {enabledSpecialties.map((t) => (
              <span
                key={t.key}
                className="rounded-full border px-2.5 py-0.5 text-[11px] text-stone-600"
                style={{
                  backgroundColor: "#FBF3E4",
                  borderColor: "rgba(196,162,101,0.35)",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── About ── */}
      <Section title="About">
        <p
          className="text-[14px] leading-relaxed text-stone-700"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {profile.about.story}
        </p>
        <div
          className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t pt-4 text-[12px] text-stone-600"
          style={{ borderColor: "rgba(44,44,44,0.06)" }}
        >
          <span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#7a5a16]">
              Seller
            </span>{" "}
            {profile.seller.ownerName}
          </span>
          <span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#7a5a16]">
              In business
            </span>{" "}
            {profile.seller.yearsInBusiness} yrs
          </span>
          <span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#7a5a16]">
              Speaks
            </span>{" "}
            {profile.seller.languages.join(", ")}
          </span>
          <span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#7a5a16]">
              Replies
            </span>{" "}
            {profile.seller.responseTime}
          </span>
        </div>
      </Section>

      {/* ── Featured ── */}
      <Section title="Featured Products" count={featured.length}>
        {featured.length === 0 ? (
          <p className="text-[12.5px] italic text-stone-500">
            Pin up to 6 products on the left to feature them here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        )}
      </Section>

      {/* ── All Products ── */}
      <Section
        title="All Products"
        action={
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            {profile.products.length} items
          </span>
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {["All", "Invitations", "Save the Dates", "Programs", "Menus"].map(
            (f, i) => (
              <span
                key={f}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                  i === 0
                    ? "text-[#7a5a16]"
                    : "text-stone-500"
                }`}
                style={{
                  backgroundColor: i === 0 ? "#F5E6D0" : "#FFFFFA",
                  borderColor:
                    i === 0 ? "rgba(196,162,101,0.45)" : "rgba(44,44,44,0.1)",
                }}
              >
                {f}
              </span>
            ),
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {profile.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {/* ── Reviews ── */}
      <Section
        title="Reviews"
        action={
          <span className="flex items-center gap-1.5 text-[12px]">
            <StarRating value={profile.stats.rating} />
            <span className="font-mono text-[11px] text-stone-500">
              {profile.stats.rating.toFixed(1)} · {profile.stats.reviewCount}{" "}
              reviews
            </span>
          </span>
        }
      >
        <div className="space-y-4">
          {profile.reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-lg border bg-[#FFFFFA] px-4 py-4"
              style={{ borderColor: "rgba(196,162,101,0.2)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[15px] text-[#2C2C2C]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    {r.coupleName}
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
                    {r.weddingLabel}
                  </p>
                </div>
                <StarRating value={r.rating} />
              </div>
              <p
                className="mt-2 text-[13.5px] italic leading-relaxed text-stone-700"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                "{r.excerpt}"
              </p>
              <p className="mt-2 font-mono text-[10.5px] text-stone-500">
                Reviewed — {r.productTitle} · {r.postedAgo}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* ── Policies ── */}
      <Section title="Policies">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PolicyBlock
            label="Processing"
            body={profile.policies.processingTime}
          />
          <PolicyBlock
            label="Shipping"
            body={profile.policies.shippingPolicy}
          />
          <PolicyBlock
            label="Returns"
            body={profile.policies.returnPolicy}
          />
          <PolicyBlock
            label="Custom orders"
            body={profile.policies.customOrderPolicy}
          />
        </dl>
        <p
          className="mt-4 border-t pt-3 font-mono text-[10.5px] uppercase tracking-wider text-stone-500"
          style={{ borderColor: "rgba(44,44,44,0.06)" }}
        >
          Payments accepted —{" "}
          <span className="tracking-normal normal-case text-stone-600">
            {profile.payment.paymentMethods.join(", ")}
          </span>
        </p>
      </Section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-t px-8 py-6"
      style={{ borderColor: "rgba(44,44,44,0.06)" }}
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <h3
          className="flex items-center gap-2 text-[19px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
          {typeof count === "number" && (
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
              — {count}
            </span>
          )}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProductCard({
  product,
  featured = false,
}: {
  product: ShopProduct;
  featured?: boolean;
}) {
  return (
    <div className="group">
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md"
        style={{
          background: `linear-gradient(135deg, ${product.swatch} 0%, ${product.swatch}CC 100%)`,
        }}
      >
        <span className="text-[48px] text-white/90" aria-hidden>
          {product.glyph}
        </span>
        {featured && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ backgroundColor: "#FBF3E4", color: "#7a5a16" }}
          >
            ★ Featured
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-[12.5px] leading-tight text-[#2C2C2C]">
        {product.title}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-stone-500">
        ${product.price}
        <span className="mx-1.5 text-stone-300">·</span>
        {product.salesCount} sold
      </p>
    </div>
  );
}

function PolicyBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
        {label}
      </dt>
      <dd className="mt-1 text-[12.5px] leading-relaxed text-stone-700">
        {body}
      </dd>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[13px]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{ color: i < Math.round(value) ? "#C4A265" : "#E8D5D0" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function Dot() {
  return (
    <span className="text-stone-300" aria-hidden>
      ·
    </span>
  );
}
