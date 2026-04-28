"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Star,
  MapPin,
  Sparkles,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreVendor } from "@/lib/link-preview/types";
import { STORE_PRODUCTS, getStoreVendor } from "@/lib/store-seed";

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function VendorProfileDrawer({
  vendorId,
  onClose,
  onProductClick,
}: {
  vendorId: string | null;
  onClose: () => void;
  onProductClick?: (productId: string) => void;
}) {
  const vendor: StoreVendor | null = getStoreVendor(vendorId);

  useEffect(() => {
    if (!vendorId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [vendorId, onClose]);

  const otherProducts = vendor
    ? STORE_PRODUCTS.filter((p) => p.vendorId === vendor.id)
    : [];

  return (
    <AnimatePresence>
      {vendor && (
        <>
          <motion.div
            key="vendor-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[1px]"
          />
          <motion.aside
            key="vendor-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-[520px] flex-col border-l border-gold/20 bg-white shadow-[-12px_0_32px_rgba(26,26,26,0.15)]"
          >
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Artisan Profile
              </span>
              <button
                onClick={onClose}
                aria-label="Close profile"
                className="rounded-md p-1 text-ink-faint hover:bg-ivory-warm hover:text-ink"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Hero collage */}
              <div className="grid grid-cols-4 gap-0.5 bg-ivory-warm">
                {vendor.portfolioImages.slice(0, 4).map((src, i) => (
                  <div
                    key={src + i}
                    className={cn(
                      "overflow-hidden",
                      i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-5 px-5 py-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={13}
                      strokeWidth={1.8}
                      className="text-saffron"
                    />
                    <h2 className="font-serif text-[24px] leading-tight text-ink">
                      {vendor.name}
                    </h2>
                  </div>
                  <p className="text-[13px] italic text-ink-muted">
                    {vendor.tagline}
                  </p>
                  <div
                    className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin size={11} strokeWidth={1.6} />
                      {vendor.origin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} strokeWidth={1.6} className="text-saffron" />
                      {vendor.rating.toFixed(1)} · {vendor.reviewCount} reviews
                    </span>
                    {vendor.foundedYear && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} strokeWidth={1.6} />
                        Est. {vendor.foundedYear}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {vendor.bio}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {vendor.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-gold/30 bg-gold-pale/30 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-gold"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Other products */}
                {otherProducts.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-gold/10 pt-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      Products from this artisan
                    </span>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {otherProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onProductClick?.(p.id)}
                          className="group flex flex-col gap-1.5 text-left"
                        >
                          <div className="aspect-square overflow-hidden rounded-md bg-ivory-warm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.heroImage}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <span className="line-clamp-2 font-serif text-[11.5px] text-ink">
                            {p.title}
                          </span>
                          <span
                            className="font-mono text-[10.5px] font-semibold text-saffron"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {money(p.basePrice, p.currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews placeholder */}
                <div className="flex flex-col gap-2 rounded-md border border-gold/15 bg-ivory-warm/40 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Recent reviews
                  </span>
                  <div className="flex flex-col gap-2 text-[12px] text-ink-soft">
                    <Review
                      author="Arjun M."
                      rating={5}
                      body="The craftsmanship on our lehenga exceeded every expectation. You can feel every thread."
                    />
                    <Review
                      author="Priya K."
                      rating={5}
                      body="Communicated at every step — even the color swatches were couriered for approval."
                    />
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50">
                  <MessageCircle size={13} strokeWidth={1.8} />
                  Message {vendor.name.split(" ")[0]}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Review({
  author,
  rating,
  body,
}: {
  author: string;
  rating: number;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-saffron/50 pl-3">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-ink">{author}</span>
        <span
          className="font-mono text-[10px] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {"★".repeat(rating)}
        </span>
      </div>
      <span className="text-[11.5px] italic text-ink-muted">{body}</span>
    </div>
  );
}
