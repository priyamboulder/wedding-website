"use client";

// ── GuideBody ───────────────────────────────────────────────────────────────
// Renders a guide's body block-by-block. Each block type has its own small
// renderer below. Product/vendor embeds resolve from the store seed and fail
// gracefully if the referenced item has been removed from the catalog.

import { useState } from "react";
import Link from "next/link";
import {
  Quote,
  CheckSquare,
  ImageOff,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideBodyBlock } from "@/types/guide";
import { getStoreProduct, getStoreVendor } from "@/lib/store-seed";
import type { StoreProduct } from "@/lib/link-preview/types";

export function GuideBody({ blocks }: { blocks: GuideBodyBlock[] }) {
  return (
    <div className="flex flex-col gap-7">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} index={i} />
      ))}
    </div>
  );
}

function BlockRenderer({
  block,
  index,
}: {
  block: GuideBodyBlock;
  index: number;
}) {
  switch (block.type) {
    case "rich_text":
      return <RichText html={block.html} dropCap={index === 0} />;
    case "image":
      return <ImageBlock images={block.images} />;
    case "product_embed":
      return (
        <ProductEmbed productId={block.productId} context={block.context} />
      );
    case "vendor_mention":
      return (
        <VendorMention vendorId={block.vendorId} context={block.context} />
      );
    case "pull_quote":
      return (
        <PullQuote text={block.text} attribution={block.attribution} />
      );
    case "comparison":
      return <Comparison title={block.title} items={block.items} />;
    case "list":
      return (
        <ListBlock
          variant={block.variant}
          title={block.title}
          items={block.items}
        />
      );
    default:
      return null;
  }
}

// ── Rich text ───────────────────────────────────────────────────────────────

function RichText({ html, dropCap }: { html: string; dropCap?: boolean }) {
  return (
    <div
      className={cn(
        "prose-guide font-serif text-[18px] leading-[1.75] text-ink",
        dropCap && "guide-dropcap",
      )}
      // Author-trusted HTML (seed-controlled, not user input).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Image block ─────────────────────────────────────────────────────────────

function ImageBlock({
  images,
}: {
  images: { url: string; alt: string; caption?: string }[];
}) {
  if (images.length === 0) return null;
  if (images.length === 1) {
    const img = images[0];
    return (
      <figure className="-mx-2 sm:-mx-6 md:-mx-12">
        <SafeImage
          src={img.url}
          alt={img.alt}
          className="aspect-[16/10] w-full rounded-lg object-cover"
        />
        {img.caption && (
          <figcaption className="mt-3 px-2 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            {img.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return (
    <figure>
      <div
        className={cn(
          "grid gap-3",
          images.length === 2 && "grid-cols-1 sm:grid-cols-2",
          images.length === 3 && "grid-cols-1 sm:grid-cols-3",
          images.length >= 4 && "grid-cols-2",
        )}
      >
        {images.map((img, i) => (
          <SafeImage
            key={i}
            src={img.url}
            alt={img.alt}
            className="aspect-square w-full rounded-md object-cover"
          />
        ))}
      </div>
      {images.some((i) => i.caption) && (
        <figcaption className="mt-3 px-2 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
          {images.find((i) => i.caption)?.caption}
        </figcaption>
      )}
    </figure>
  );
}

function SafeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-ivory-warm text-ink-faint/40",
          className,
        )}
      >
        <ImageOff size={22} strokeWidth={1.3} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      loading="lazy"
      className={className}
    />
  );
}

// ── Product embed ───────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function ProductEmbed({
  productId,
  context,
}: {
  productId: string;
  context?: string;
}) {
  const product = getStoreProduct(productId);
  if (!product) return null;
  const vendor = getStoreVendor(product.vendorId);

  return (
    <aside className="my-2 overflow-hidden rounded-xl border border-gold/25 bg-ivory-warm/30">
      {context && (
        <p className="border-b border-gold/15 bg-white/60 px-4 py-2 font-serif text-[14px] italic text-ink-muted">
          <Quote
            size={11}
            strokeWidth={1.6}
            className="-mt-0.5 mr-1.5 inline text-gold"
          />
          {context}
        </p>
      )}
      <div className="flex items-stretch gap-0">
        <ProductImage product={product} />
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <div>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Featured product · Ananya store
            </p>
            <h4 className="mt-1.5 font-serif text-[17px] leading-tight text-ink">
              {product.title}
            </h4>
            {vendor && (
              <p
                className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {vendor.name} · {vendor.origin}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gold/15 pt-3">
            <span
              className="font-mono text-[14px] font-semibold text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(product.basePrice, product.currency)}
            </span>
            <Link
              href={`/default/shopping?mode=ananya_store&product=${product.id}`}
              className="flex items-center gap-1 rounded-md border border-ink bg-ink px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-ink/90"
            >
              View item
              <ArrowUpRight size={11} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProductImage({ product }: { product: StoreProduct }) {
  const [err, setErr] = useState(false);
  return (
    <div className="hidden w-40 shrink-0 bg-ivory-warm sm:block">
      {product.heroImage && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.heroImage}
          alt={product.title}
          onError={() => setErr(true)}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
          <ImageOff size={20} strokeWidth={1.3} />
        </div>
      )}
    </div>
  );
}

// ── Vendor mention ──────────────────────────────────────────────────────────

function VendorMention({
  vendorId,
  context,
}: {
  vendorId: string;
  context?: string;
}) {
  const vendor = getStoreVendor(vendorId);
  if (!vendor) return null;

  return (
    <aside className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory-warm font-serif text-[18px] text-ink"
        aria-hidden
      >
        {vendor.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Vendor mention
        </p>
        <h4 className="mt-0.5 font-serif text-[15px] text-ink">
          {vendor.name}
        </h4>
        <p className="text-[12px] text-ink-muted">
          {context ?? vendor.tagline}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1 text-gold">
            <Star size={10} strokeWidth={1.8} fill="currentColor" />
            {vendor.rating.toFixed(1)}
          </span>
          <span aria-hidden>·</span>
          <span>{vendor.reviewCount} reviews</span>
        </div>
      </div>
      <button
        type="button"
        className="hidden shrink-0 items-center gap-1 rounded-md border border-gold/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-gold transition-colors hover:bg-gold-pale/40 sm:flex"
      >
        View vendor
        <ArrowUpRight size={11} strokeWidth={2} />
      </button>
    </aside>
  );
}

// ── Pull quote ──────────────────────────────────────────────────────────────

function PullQuote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <blockquote className="my-2 border-l-4 border-gold/60 bg-ivory-warm/40 px-6 py-5">
      <p className="font-serif text-[22px] italic leading-[1.4] text-ink">
        &ldquo;{text}&rdquo;
      </p>
      {attribution && (
        <p
          className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — {attribution}
        </p>
      )}
    </blockquote>
  );
}

// ── Comparison ──────────────────────────────────────────────────────────────

function Comparison({
  title,
  items,
}: {
  title?: string;
  items: { productId: string; highlight?: string }[];
}) {
  const resolved: { product: StoreProduct; highlight: string | undefined }[] =
    items.flatMap((i) => {
      const product = getStoreProduct(i.productId);
      return product ? [{ product, highlight: i.highlight }] : [];
    });
  if (resolved.length === 0) return null;
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      {title && (
        <h4 className="mb-4 font-serif text-[18px] text-ink">{title}</h4>
      )}
      <div
        className={cn(
          "grid gap-4",
          resolved.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {resolved.map(({ product, highlight }) => (
          <div
            key={product.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-ivory-warm/30 p-3"
          >
            <SafeImage
              src={product.heroImage}
              alt={product.title}
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <h5 className="font-serif text-[14px] leading-tight text-ink">
              {product.title}
            </h5>
            <span
              className="font-mono text-[12px] font-semibold text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(product.basePrice, product.currency)}
            </span>
            {highlight && (
              <p className="text-[12px] italic leading-snug text-ink-muted">
                {highlight}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Lists ───────────────────────────────────────────────────────────────────

function ListBlock({
  variant,
  title,
  items,
}: {
  variant: "numbered" | "checklist" | "bullets";
  title?: string;
  items: string[];
}) {
  return (
    <section className="rounded-lg border border-gold/15 bg-ivory-warm/30 px-5 py-4">
      {title && (
        <p
          className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {title}
        </p>
      )}
      <ul className="flex flex-col gap-2.5 text-[15px] leading-[1.55] text-ink">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <Marker variant={variant} index={i} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Marker({
  variant,
  index,
}: {
  variant: "numbered" | "checklist" | "bullets";
  index: number;
}) {
  if (variant === "numbered") {
    return (
      <span
        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-[10.5px] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {index + 1}
      </span>
    );
  }
  if (variant === "checklist") {
    return (
      <CheckSquare
        size={16}
        strokeWidth={1.6}
        className="mt-0.5 shrink-0 text-gold"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60"
    />
  );
}

