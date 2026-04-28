"use client";

// ── ShowcaseLooksGallery ────────────────────────────────────────────────────
// Photo gallery with Instagram-style product pins. Each photo can have 0+
// ProductTags; pins render at pinX/pinY and expand on hover/click to show
// the product card + couple's note. Tags without a photoId surface in a
// compact "Also tagged" list below the gallery.

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ImageOff, Quote, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ShowcasePhoto,
  ShowcaseProductTag,
  ShowcaseProductSection,
} from "@/types/showcase";
import { getStoreProduct, getStoreVendor } from "@/lib/store-seed";
import type { StoreProduct } from "@/lib/link-preview/types";

interface Props {
  section: ShowcaseProductSection;
  photos: ShowcasePhoto[];
  productTags: ShowcaseProductTag[];
  heading: string;
  eyebrow: string;
}

export function ShowcaseLooksGallery({
  section,
  photos,
  productTags,
  heading,
  eyebrow,
}: Props) {
  const sectionPhotos = photos.filter((p) => p.section === section);
  const sectionTags = productTags.filter((t) => t.section === section);
  const untaggedPhotoTags = sectionTags.filter((t) => !t.photoId);

  if (sectionPhotos.length === 0 && sectionTags.length === 0) return null;

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[960px] px-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
          {heading}
        </h2>

        {sectionPhotos.length > 0 && (
          <div
            className={cn(
              "mt-8 grid gap-4",
              sectionPhotos.length === 1 && "grid-cols-1",
              sectionPhotos.length === 2 && "grid-cols-1 sm:grid-cols-2",
              sectionPhotos.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {sectionPhotos.map((photo) => (
              <TaggedPhoto
                key={photo.id}
                photo={photo}
                tags={sectionTags.filter((t) => t.photoId === photo.id)}
              />
            ))}
          </div>
        )}

        {untaggedPhotoTags.length > 0 && (
          <div className="mt-10">
            <Eyebrow>Also tagged</Eyebrow>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {untaggedPhotoTags.map((t) => (
                <ProductTagCard key={t.id} tag={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Tagged photo (with clickable pins) ──────────────────────────────────────

function TaggedPhoto({
  photo,
  tags,
}: {
  photo: ShowcasePhoto;
  tags: ShowcaseProductTag[];
}) {
  const [err, setErr] = useState(false);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const pinnedTags = tags.filter(
    (t) => typeof t.pinX === "number" && typeof t.pinY === "number",
  );

  return (
    <figure className="relative overflow-hidden rounded-lg bg-ivory-warm">
      <div className="relative aspect-[4/5] w-full">
        {photo.imageUrl && !err ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageUrl}
            alt={photo.caption ?? "Wedding photo"}
            onError={() => setErr(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={22} strokeWidth={1.3} />
          </div>
        )}
        {pinnedTags.map((t) => (
          <Pin
            key={t.id}
            tag={t}
            active={activeTagId === t.id}
            onToggle={() =>
              setActiveTagId((prev) => (prev === t.id ? null : t.id))
            }
          />
        ))}
      </div>
      {photo.caption && (
        <figcaption className="bg-white px-3 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Pin({
  tag,
  active,
  onToggle,
}: {
  tag: ShowcaseProductTag;
  active: boolean;
  onToggle: () => void;
}) {
  const product = getStoreProduct(tag.productId);
  const x = (tag.pinX ?? 0.5) * 100;
  const y = (tag.pinY ?? 0.5) * 100;

  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={product ? `Tagged product: ${product.title}` : "Tagged product"}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gold text-ivory shadow-md transition-transform",
          active ? "scale-110" : "animate-pulse-soft hover:scale-110",
        )}
      >
        <Tag size={12} strokeWidth={2} />
      </button>
      {active && product && (
        <div className="absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-gold/25 bg-white shadow-xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-ink-muted hover:text-ink"
            aria-label="Close product tag"
          >
            <X size={11} strokeWidth={1.8} />
          </button>
          <CompactTagCard product={product} note={tag.note} />
        </div>
      )}
    </div>
  );
}

// ── Tag card (compact — used by pin popover + "also tagged" list) ───────────

function CompactTagCard({
  product,
  note,
}: {
  product: StoreProduct;
  note?: string;
}) {
  const [err, setErr] = useState(false);
  const vendor = getStoreVendor(product.vendorId);
  return (
    <div className="flex flex-col">
      <div className="aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {product.heroImage && !err ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.heroImage}
            alt={product.title}
            onError={() => setErr(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={20} strokeWidth={1.3} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Tagged product
        </p>
        <h4 className="mt-1 font-serif text-[14px] leading-tight text-ink">
          {product.title}
        </h4>
        {vendor && (
          <p
            className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {vendor.name}
          </p>
        )}
        {note && (
          <p className="mt-2 font-serif text-[12.5px] italic leading-snug text-ink-muted">
            <Quote
              size={9}
              strokeWidth={1.6}
              className="-mt-0.5 mr-1 inline text-gold"
            />
            {note}
          </p>
        )}
        <Link
          href={`/default/shopping?mode=ananya_store&product=${product.id}`}
          className="mt-3 flex items-center justify-center gap-1 rounded-md border border-ink bg-ink py-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-ink/90"
        >
          Shop the piece
          <ArrowUpRight size={10} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function ProductTagCard({ tag }: { tag: ShowcaseProductTag }) {
  const product = getStoreProduct(tag.productId);
  if (!product) return null;
  const vendor = getStoreVendor(product.vendorId);
  const [err, setErr] = useState(false);

  return (
    <div className="flex gap-3 overflow-hidden rounded-xl border border-gold/20 bg-white">
      <div className="h-28 w-24 shrink-0 overflow-hidden bg-ivory-warm">
        {product.heroImage && !err ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.heroImage}
            alt={product.title}
            onError={() => setErr(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={18} strokeWidth={1.3} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 py-2 pr-3">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Tagged · {vendor?.name ?? "Ananya store"}
        </p>
        <h4 className="font-serif text-[14px] leading-tight text-ink">
          {product.title}
        </h4>
        {tag.note && (
          <p className="line-clamp-2 font-serif text-[12px] italic text-ink-muted">
            “{tag.note}”
          </p>
        )}
        <Link
          href={`/default/shopping?mode=ananya_store&product=${product.id}`}
          className="mt-1 inline-flex items-center gap-1 self-start text-[11.5px] text-saffron hover:text-gold"
        >
          Shop
          <ArrowUpRight size={10} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}
