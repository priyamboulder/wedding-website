"use client";

// ── Roulette swipe experience ───────────────────────────────────────────────
// Full-screen, one-vendor-at-a-time. Swipe right to save, left to skip, up
// to view the full profile. Desktop users can use arrow keys or the action
// buttons. Actions are logged to the roulette-store; saves also write to
// the existing shortlist with source="roulette" so they surface in My
// Vendors alongside manual saves.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Heart,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { useRouletteStore } from "@/stores/roulette-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { Vendor } from "@/types/vendor";
import type { RouletteAction } from "@/types/roulette";

const SWIPE_THRESHOLD = 110;

export function RouletteSwipe({
  sessionId,
  onEnd,
  onRestart,
}: {
  sessionId: string;
  onEnd: () => void;
  onRestart: () => void;
}) {
  const session = useRouletteStore((s) =>
    s.sessions.find((x) => x.id === sessionId),
  );
  const advanceSession = useRouletteStore((s) => s.advanceSession);
  const completeSession = useRouletteStore((s) => s.completeSession);
  const recordAction = useRouletteStore((s) => s.recordAction);

  const vendors = useVendorsStore((s) => s.vendors);
  const saveFromRoulette = useVendorsStore((s) => s.saveFromRoulette);

  const vendorById = useMemo(() => {
    const m = new Map<string, Vendor>();
    for (const v of vendors) m.set(v.id, v);
    return m;
  }, [vendors]);

  const [index, setIndex] = useState(session?.current_index ?? 0);
  const [imageIndex, setImageIndex] = useState(0);
  const [imagesViewed, setImagesViewed] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const cardShownAt = useRef<number>(Date.now());

  const currentVendorId = session?.vendor_order[index];
  const currentVendor = currentVendorId
    ? vendorById.get(currentVendorId)
    : undefined;

  // Reset per-card state whenever the card changes.
  useEffect(() => {
    setImageIndex(0);
    setImagesViewed(1);
    setProfileOpen(false);
    cardShownAt.current = Date.now();
  }, [currentVendorId]);

  const commitAction = useCallback(
    (action: RouletteAction) => {
      if (!session || !currentVendor) return;
      const timeSpent = Math.max(
        1,
        Math.round((Date.now() - cardShownAt.current) / 1000),
      );
      recordAction({
        session_id: session.id,
        vendor_id: currentVendor.id,
        action,
        position_in_stack: index + 1,
        time_spent_seconds: timeSpent,
        images_viewed: imagesViewed,
        viewed_full_profile: profileOpen,
      });

      if (action === "save") {
        saveFromRoulette(currentVendor.id, session.id, "shortlisted");
      } else if (action === "book_call") {
        saveFromRoulette(currentVendor.id, session.id, "contacted");
      }

      if (action === "view_profile") {
        setProfileOpen(true);
        return; // view_profile doesn't advance the stack
      }

      const next = index + 1;
      if (next >= session.total_vendors) {
        completeSession(session.id);
        onEnd();
      } else {
        advanceSession(session.id, next);
        setIndex(next);
      }
    },
    [
      session,
      currentVendor,
      index,
      imagesViewed,
      profileOpen,
      recordAction,
      saveFromRoulette,
      completeSession,
      advanceSession,
      onEnd,
    ],
  );

  // Keyboard shortcuts — right = save, left = skip, up = view profile.
  useEffect(() => {
    if (profileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        commitAction("save");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        commitAction("skip");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        commitAction("view_profile");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commitAction, profileOpen]);

  if (!session) {
    return (
      <EmptyState
        title="session not found"
        hint="start a new roulette round to begin"
        onRestart={onRestart}
      />
    );
  }

  if (!currentVendor) {
    return (
      <EmptyState
        title="no more vendors"
        hint="you've seen everyone matching these filters"
        onRestart={onRestart}
      />
    );
  }

  const portfolioImages = (currentVendor.portfolio_images ?? []).slice(0, 3);
  const cycleImage = (dir: 1 | -1) => {
    const next = (imageIndex + dir + portfolioImages.length) %
      portfolioImages.length;
    setImageIndex(next);
    setImagesViewed((v) => Math.max(v, next + 1));
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-ivory">
      <div className="flex items-center justify-between border-b border-gold/10 bg-white/50 px-5 py-3 text-xs text-ink-muted">
        <span>
          {index + 1} of {session.total_vendors}
        </span>
        <button
          type="button"
          onClick={() => {
            completeSession(session.id);
            onEnd();
          }}
          className="text-ink-muted transition-colors hover:text-ink"
        >
          end session ×
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-6">
        <AnimatePresence mode="wait" custom={index}>
          <SwipeCard
            key={currentVendor.id}
            vendor={currentVendor}
            imageIndex={imageIndex}
            onCycleImage={cycleImage}
            selectedStyleTags={session.filters.style_tags}
            onCommit={commitAction}
            onOpenProfile={() => commitAction("view_profile")}
          />
        </AnimatePresence>
      </div>

      {profileOpen && (
        <FullProfileSheet
          vendor={currentVendor}
          onClose={() => setProfileOpen(false)}
          onAct={(action) => {
            setProfileOpen(false);
            commitAction(action);
          }}
        />
      )}
    </div>
  );
}

// ── Single swipeable card ───────────────────────────────────────────────────

function SwipeCard({
  vendor,
  imageIndex,
  onCycleImage,
  selectedStyleTags,
  onCommit,
  onOpenProfile,
}: {
  vendor: Vendor;
  imageIndex: number;
  onCycleImage: (dir: 1 | -1) => void;
  selectedStyleTags: string[];
  onCommit: (action: RouletteAction) => void;
  onOpenProfile: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-12, 0, 12]);
  const saveIndicator = useTransform(x, [30, SWIPE_THRESHOLD], [0, 1]);
  const skipIndicator = useTransform(x, [-SWIPE_THRESHOLD, -30], [1, 0]);

  const portfolio = (vendor.portfolio_images ?? []).slice(0, 3);
  const current = portfolio[imageIndex] ?? portfolio[0];

  const priceLabel = formatPriceShort(vendor.price_display);
  const highlight =
    vendor.couple_reviews?.find((r) => r.rating >= 4.5)?.body ??
    vendor.planner_endorsements?.[0]?.body ??
    null;
  const highlightAuthor =
    vendor.couple_reviews?.find((r) => r.rating >= 4.5)?.couple_names ??
    vendor.planner_endorsements?.[0]?.planner_name ??
    null;

  const matchedTags = new Set(
    selectedStyleTags.map((t) => t.toLowerCase()),
  );

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      style={{ x, y, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) {
          onCommit("save");
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
          onCommit("skip");
        } else if (info.offset.y < -SWIPE_THRESHOLD) {
          onOpenProfile();
        }
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-[0_20px_60px_-20px_rgba(26,26,26,0.25)]"
    >
      {/* ── Hero image carousel ───────────────────────────────────── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory-warm">
        {current ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={current.url}
            alt={current.alt ?? vendor.name}
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : null}

        {/* Image tap targets */}
        {portfolio.length > 1 && (
          <>
            <button
              type="button"
              aria-label="previous image"
              onClick={(e) => {
                e.stopPropagation();
                onCycleImage(-1);
              }}
              className="absolute inset-y-0 left-0 flex w-1/3 items-center justify-start px-3 opacity-0 transition-opacity hover:opacity-100"
            >
              <ChevronLeft size={20} className="text-white drop-shadow" />
            </button>
            <button
              type="button"
              aria-label="next image"
              onClick={(e) => {
                e.stopPropagation();
                onCycleImage(1);
              }}
              className="absolute inset-y-0 right-0 flex w-1/3 items-center justify-end px-3 opacity-0 transition-opacity hover:opacity-100"
            >
              <ChevronRight size={20} className="text-white drop-shadow" />
            </button>
          </>
        )}

        {/* Image dots */}
        {portfolio.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {portfolio.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === imageIndex ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        )}

        {/* Swipe indicators */}
        <motion.div
          style={{ opacity: saveIndicator }}
          className="pointer-events-none absolute left-4 top-4 rounded-md border-2 border-rose bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose"
        >
          save
        </motion.div>
        <motion.div
          style={{ opacity: skipIndicator }}
          className="pointer-events-none absolute right-4 top-4 rounded-md border-2 border-ink-muted bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-muted"
        >
          skip
        </motion.div>

        {/* View-profile nudge */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenProfile();
          }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-ivory backdrop-blur hover:bg-ink"
        >
          <ArrowUp size={10} strokeWidth={2} />
          profile
        </button>
      </div>

      {/* ── Info panel ────────────────────────────────────────────── */}
      <div className="px-5 py-4">
        <h2 className="font-display text-2xl text-ink">{vendor.name}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          {CATEGORY_LABELS[vendor.category]}
          {vendor.location ? ` · ${vendor.location}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {vendor.rating != null && (
            <span className="text-ink">
              ★ {vendor.rating.toFixed(1)}{" "}
              <span className="text-ink-muted">
                ({vendor.review_count})
              </span>
            </span>
          )}
          <span className="text-ink-muted">{priceLabel}</span>
        </div>

        {highlight && (
          <blockquote className="mt-3 border-l-2 border-gold/40 pl-3 text-xs italic text-ink-muted">
            &ldquo;{truncate(highlight, 140)}&rdquo;
            {highlightAuthor && (
              <footer className="mt-1 not-italic text-[10px] uppercase tracking-wider text-ink-faint">
                — {highlightAuthor}
              </footer>
            )}
          </blockquote>
        )}

        {vendor.style_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.style_tags.slice(0, 6).map((tag) => {
              const matched = matchedTags.has(tag.toLowerCase());
              return (
                <span
                  key={tag}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    matched
                      ? "bg-gold-pale text-ink"
                      : "bg-ivory-deep text-ink-muted",
                  )}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-t border-gold/10 px-6 py-4">
        <ActionButton
          label="skip"
          tone="muted"
          onClick={() => onCommit("skip")}
        >
          <X size={20} strokeWidth={1.8} />
        </ActionButton>
        <ActionButton
          label="save"
          tone="rose"
          onClick={() => onCommit("save")}
          emphasize
        >
          <Heart size={22} strokeWidth={1.8} />
        </ActionButton>
        <ActionButton
          label="book call"
          tone="gold"
          onClick={() => onCommit("book_call")}
        >
          <Phone size={20} strokeWidth={1.8} />
        </ActionButton>
      </div>
    </motion.div>
  );
}

// ── Slide-up full profile sheet ─────────────────────────────────────────────

function FullProfileSheet({
  vendor,
  onClose,
  onAct,
}: {
  vendor: Vendor;
  onClose: () => void;
  onAct: (action: RouletteAction) => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 top-10 z-20 flex flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-gold/10 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-ink-muted hover:text-ink"
        >
          ← back to roulette
        </button>
        <div className="h-1 w-10 rounded-full bg-ink-faint/40" />
        <div className="w-24" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-[16/9] w-full bg-ivory-warm">
          {vendor.cover_image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={vendor.cover_image}
              alt={vendor.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="px-6 py-5">
          <h2 className="font-display text-3xl text-ink">{vendor.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {CATEGORY_LABELS[vendor.category]}
            {vendor.location ? ` · ${vendor.location}` : ""}
          </p>
          {vendor.bio && (
            <p className="mt-4 text-sm leading-relaxed text-ink">{vendor.bio}</p>
          )}

          {(vendor.portfolio_images ?? []).length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(vendor.portfolio_images ?? []).slice(0, 12).map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt ?? `${vendor.name} ${i + 1}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}

          {vendor.packages.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                — packages —
              </div>
              <div className="space-y-3">
                {vendor.packages.slice(0, 3).map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-md border border-gold/15 bg-ivory-warm/40 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-ink">
                        {pkg.name}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {formatPriceShort(pkg.price_display)}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="mt-1 text-xs text-ink-muted">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-around gap-3 border-t border-gold/10 bg-white px-6 py-4">
        <ActionButton
          label="skip"
          tone="muted"
          onClick={() => onAct("skip")}
        >
          <X size={20} strokeWidth={1.8} />
        </ActionButton>
        <ActionButton
          label="save"
          tone="rose"
          onClick={() => onAct("save")}
          emphasize
        >
          <Heart size={22} strokeWidth={1.8} />
        </ActionButton>
        <ActionButton
          label="book call"
          tone="gold"
          onClick={() => onAct("book_call")}
        >
          <Phone size={20} strokeWidth={1.8} />
        </ActionButton>
      </div>
    </motion.div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────────

function ActionButton({
  children,
  label,
  tone,
  emphasize,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  tone: "muted" | "rose" | "gold";
  emphasize?: boolean;
  onClick: () => void;
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose/40 bg-rose-pale/40 text-rose hover:border-rose"
      : tone === "gold"
        ? "border-gold/40 bg-gold-pale/40 text-gold hover:border-gold"
        : "border-ink-faint/40 bg-white text-ink-muted hover:border-ink-muted hover:text-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full border-2 transition-transform active:scale-95",
          emphasize ? "h-14 w-14" : "h-12 w-12",
          toneClass,
        )}
      >
        {children}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </span>
    </button>
  );
}

function EmptyState({
  title,
  hint,
  onRestart,
}: {
  title: string;
  hint: string;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="text-sm text-ink-muted">{hint}</p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-2 rounded-full bg-ink px-5 py-2 text-xs font-medium text-ivory hover:opacity-90"
      >
        start a new round
      </button>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}
