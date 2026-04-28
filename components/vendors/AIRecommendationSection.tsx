"use client";

// ── AI recommendation section ──────────────────────────────────────────────
// Interstitial block that sits above the full vendor marketplace grid. Shows
// the wedding context chip, then one category row per `RECOMMENDATION_CATEGORY_ORDER`,
// then a closing "Inquire with all recommended" CTA. Couples can collapse the
// whole block down to a one-line status bar if they prefer to browse.

import { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ArrowRight,
  Send,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor, VendorCategory } from "@/types/vendor";
import { SHORTLIST_STATUS_LABEL } from "@/types/vendor";
import { useVendorsStore } from "@/stores/vendors-store";
import { useInquiryStore } from "@/stores/inquiry-store";
import { useAuthStore } from "@/stores/auth-store";
import { useVenueStore } from "@/stores/venue-store";
import { useEventsStore } from "@/stores/events-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import {
  buildRecommendations,
  deriveWeddingContext,
  CATEGORY_EMOJI,
  type CategoryRecommendations,
} from "@/lib/vendors/ai-recommendations";
import { AIWeddingContextBar } from "./AIWeddingContextBar";
import { AIRecommendationCard } from "./AIRecommendationCard";

interface AIRecommendationSectionProps {
  onOpenVendor: (vendorId: string) => void;
  onToggleShortlist: (vendorId: string) => void;
  onJumpToCategory?: (category: VendorCategory) => void;
}

export function AIRecommendationSection({
  onOpenVendor,
  onToggleShortlist,
  onJumpToCategory,
}: AIRecommendationSectionProps) {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const submitInquiry = useInquiryStore((s) => s.submitInquiry);
  const user = useAuthStore((s) => s.user);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);

  const venueProfile = useVenueStore((s) => s.profile);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);
  const weddingDate = useChecklistStore((s) => s.weddingDate);

  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const ctx = useMemo(
    () => deriveWeddingContext({ venueProfile, coupleContext, events }),
    [venueProfile, coupleContext, events],
  );

  const allRecs = useMemo(
    () => buildRecommendations({ vendors, shortlist, ctx }),
    [vendors, shortlist, ctx],
  );

  // Filter dismissed vendors and pull in a replacement from the same category
  // scoring pool. For phase 1 we just drop dismissed cards — replacement comes
  // from the existing list past rank 3 (not computed here), so we simply
  // hide and let the couple browse the full grid for more.
  const recs = useMemo(
    () =>
      allRecs.map((cat) => ({
        ...cat,
        recommendations: cat.recommendations.filter(
          (r) => !dismissed.has(r.vendor.id),
        ),
      })),
    [allRecs, dismissed],
  );

  const openCategories = recs.filter((c) => c.state === "open");
  const inProgressCategories = recs.filter((c) => c.state === "in_progress");
  const bookedCategories = recs.filter((c) => c.state === "booked");

  const totalOpenCats = openCategories.length;

  const handleInquire = useCallback(
    (vendor: Vendor) => {
      submitInquiry({
        couple_id: user?.id ?? "couple-demo",
        couple_name: user?.name ?? "",
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        vendor_category: vendor.category,
        planner_id: null,
        source: "recommendation",
        message: buildDefaultInquiryMessage(vendor, ctx, weddingDate),
        package_ids: [],
        wedding_date: weddingDate?.toISOString() ?? "",
        guest_count: ctx.guestCount,
        venue_name: ctx.venueName,
        events: ctx.eventNames,
        budget_min: null,
        budget_max: null,
      });
    },
    [submitInquiry, user, weddingDate, ctx],
  );

  const handleInquireAll = useCallback(() => {
    for (const cat of openCategories) {
      const top = cat.recommendations[0];
      if (!top) continue;
      // Skip vendors already contacted
      const entry = shortlist.find((e) => e.vendor_id === top.vendor.id);
      if (entry && entry.status !== "shortlisted") continue;
      handleInquire(top.vendor);
    }
  }, [openCategories, shortlist, handleInquire]);

  const handleDismiss = useCallback((vendorId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(vendorId);
      return next;
    });
  }, []);

  if (collapsed) {
    return (
      <CollapsedBar
        openCats={totalOpenCats}
        onExpand={() => setCollapsed(false)}
      />
    );
  }

  return (
    <section className="mb-6 flex flex-col gap-5">
      <AIWeddingContextBar
        ctx={ctx}
        weddingDate={weddingDate}
        plannerName={ctx.plannerName}
        plannerCompany={ctx.plannerCompany}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <Sparkles size={13} strokeWidth={1.6} className="text-gold" />
          <h3 className="font-serif text-[16px] text-ink">
            Who we'd recommend
          </h3>
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {totalOpenCats} open {totalOpenCats === 1 ? "category" : "categories"}
            {inProgressCategories.length > 0 &&
              ` · ${inProgressCategories.length} in progress`}
            {bookedCategories.length > 0 && ` · ${bookedCategories.length} booked`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          <ChevronUp size={12} strokeWidth={1.8} />
          Collapse
        </button>
      </div>

      {/* Open categories */}
      <div className="flex flex-col gap-7">
        {openCategories.map((cat) => (
          <CategoryRow
            key={cat.category}
            cat={cat}
            isShortlisted={isShortlisted}
            onOpenVendor={onOpenVendor}
            onToggleShortlist={onToggleShortlist}
            onInquire={handleInquire}
            onDismiss={handleDismiss}
            onJumpToCategory={onJumpToCategory}
          />
        ))}

        {inProgressCategories.length > 0 && (
          <InProgressStrip
            cats={inProgressCategories}
            onOpenVendor={onOpenVendor}
          />
        )}

        {bookedCategories.length > 0 && (
          <BookedStrip cats={bookedCategories} onOpenVendor={onOpenVendor} />
        )}
      </div>

      {totalOpenCats > 0 && (
        <InquireAllCTA
          categoryCount={totalOpenCats}
          onInquireAll={handleInquireAll}
        />
      )}
    </section>
  );
}

// ── Collapsed state ────────────────────────────────────────────────────────

function CollapsedBar({
  openCats,
  onExpand,
}: {
  openCats: number;
  onExpand: () => void;
}) {
  return (
    <section
      onClick={onExpand}
      className="mb-5 flex cursor-pointer items-center justify-between rounded-[10px] border border-gold/25 bg-gradient-to-r from-gold-pale/40 via-white to-ivory-warm/50 px-4 py-2.5 transition-colors hover:border-gold/40"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={13} strokeWidth={1.6} className="text-gold" />
        <span className="font-serif text-[14px] text-ink">
          AI Recommendations
        </span>
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {openCats} {openCats === 1 ? "category needs" : "categories need"} vendors
        </span>
      </div>
      <button
        type="button"
        onClick={onExpand}
        className="flex items-center gap-1 text-[11.5px] font-medium text-gold hover:underline"
      >
        Expand
        <ChevronDown size={12} strokeWidth={1.8} />
      </button>
    </section>
  );
}

// ── Category row ───────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  isShortlisted,
  onOpenVendor,
  onToggleShortlist,
  onInquire,
  onDismiss,
  onJumpToCategory,
}: {
  cat: CategoryRecommendations;
  isShortlisted: (id: string) => boolean;
  onOpenVendor: (id: string) => void;
  onToggleShortlist: (id: string) => void;
  onInquire: (vendor: Vendor) => void;
  onDismiss: (id: string) => void;
  onJumpToCategory?: (category: VendorCategory) => void;
}) {
  if (cat.recommendations.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
        <div className="flex items-baseline gap-2">
          <span aria-hidden className="text-[16px] leading-none">
            {CATEGORY_EMOJI[cat.category]}
          </span>
          <h3 className="font-serif text-[16px] text-ink">
            {CATEGORY_LABELS[cat.category]}
          </h3>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {cat.recommendations.length}{" "}
            {cat.recommendations.length === 1 ? "pick" : "picks"}
          </span>
        </div>
        {onJumpToCategory && (
          <button
            type="button"
            onClick={() => onJumpToCategory(cat.category)}
            className="flex items-center gap-1 text-[11.5px] text-ink-muted transition-colors hover:text-gold"
          >
            View all
            <ArrowRight size={11} strokeWidth={1.8} />
          </button>
        )}
      </header>

      <p className="text-[12px] italic text-ink-muted">
        You haven't booked a {CATEGORY_LABELS[cat.category].toLowerCase()} yet.
        Here are three worth reaching out to based on your venue, budget, and
        wedding style.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cat.recommendations.map((rec) => (
          <AIRecommendationCard
            key={rec.vendor.id}
            rec={rec}
            shortlisted={isShortlisted(rec.vendor.id)}
            onOpenProfile={onOpenVendor}
            onToggleShortlist={onToggleShortlist}
            onInquire={onInquire}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-md bg-ivory-warm/70 px-3 py-2 ring-1 ring-border/50">
        <Info
          size={13}
          strokeWidth={1.6}
          className="mt-[2px] shrink-0 text-gold"
        />
        <p className="text-[11.5px] italic leading-snug text-ink-soft">
          {cat.budgetGuidance}
        </p>
      </div>
    </div>
  );
}

// ── In-progress + booked strips ───────────────────────────────────────────

function InProgressStrip({
  cats,
  onOpenVendor,
}: {
  cats: CategoryRecommendations[];
  onOpenVendor: (id: string) => void;
}) {
  return (
    <section className="rounded-[12px] border border-border bg-white px-4 py-3">
      <header className="mb-2 flex items-center gap-2">
        <Clock size={12} strokeWidth={1.6} className="text-ink-muted" />
        <h4
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          In progress
        </h4>
      </header>
      <ul className="flex flex-col gap-1.5">
        {cats.map((c) => (
          <li
            key={c.category}
            className="flex items-center justify-between text-[12px]"
          >
            <span className="flex items-center gap-2 text-ink">
              <span aria-hidden className="text-[13px] leading-none">
                {CATEGORY_EMOJI[c.category]}
              </span>
              {CATEGORY_LABELS[c.category]}
              <span className="text-ink-muted">
                —{" "}
                {c.inProgressStatus
                  ? SHORTLIST_STATUS_LABEL[c.inProgressStatus].toLowerCase()
                  : "in conversation"}{" "}
                with{" "}
                {c.inProgressVendors.length}{" "}
                {c.inProgressVendors.length === 1 ? "vendor" : "vendors"}
              </span>
            </span>
            {c.inProgressVendors[0] && (
              <button
                type="button"
                onClick={() => onOpenVendor(c.inProgressVendors[0].id)}
                className="text-[11px] text-gold hover:underline"
              >
                View
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookedStrip({
  cats,
  onOpenVendor,
}: {
  cats: CategoryRecommendations[];
  onOpenVendor: (id: string) => void;
}) {
  return (
    <section className="rounded-[12px] border border-sage/30 bg-sage-pale/25 px-4 py-3">
      <header className="mb-2 flex items-center gap-2">
        <Check size={12} strokeWidth={2} className="text-sage" />
        <h4
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Booked
        </h4>
      </header>
      <ul className="flex flex-col gap-1.5">
        {cats.map((c) => (
          <li
            key={c.category}
            className="flex items-center justify-between text-[12px]"
          >
            <span className="flex items-center gap-2 text-ink">
              <span aria-hidden className="text-[13px] leading-none">
                {CATEGORY_EMOJI[c.category]}
              </span>
              {CATEGORY_LABELS[c.category]}
              <span className="text-ink-muted">— {c.bookedVendor?.name}</span>
            </span>
            {c.bookedVendor && (
              <button
                type="button"
                onClick={() => onOpenVendor(c.bookedVendor!.id)}
                className="text-[11px] text-sage hover:underline"
              >
                View
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Inquire-all CTA ───────────────────────────────────────────────────────

function InquireAllCTA({
  categoryCount,
  onInquireAll,
}: {
  categoryCount: number;
  onInquireAll: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onInquireAll();
    setConfirming(false);
  };

  return (
    <section className="rounded-[14px] border border-gold/30 bg-gradient-to-br from-gold-pale/50 via-white to-gold-pale/20 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles size={13} strokeWidth={1.6} className="text-gold" />
            <h3 className="font-serif text-[15px] text-ink">
              Ready to reach out?
            </h3>
          </div>
          <p className="max-w-xl text-[12px] italic text-ink-muted">
            Send a pre-qualified inquiry to the top pick in each open category.
            Each message includes your wedding date, venue, guest count, and
            budget range.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 text-[12px] font-medium transition-colors",
            confirming
              ? "bg-gold text-white hover:bg-gold/90"
              : "bg-ink text-ivory hover:opacity-90",
          )}
        >
          <Send size={12} strokeWidth={1.8} />
          {confirming
            ? `Confirm — send ${categoryCount} ${categoryCount === 1 ? "inquiry" : "inquiries"}`
            : `Inquire with top ${categoryCount} ${categoryCount === 1 ? "pick" : "picks"}`}
        </button>
      </div>
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildDefaultInquiryMessage(
  vendor: Vendor,
  ctx: {
    venueName: string | null;
    guestCount: number;
    eventNames: string[];
    destinationCountry: string | null;
    isDestination: boolean;
  },
  weddingDate: Date | null,
): string {
  const dateStr = weddingDate
    ? weddingDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "our wedding date (TBD)";
  const destination = ctx.isDestination && ctx.destinationCountry
    ? ` — a destination wedding in ${ctx.destinationCountry}`
    : "";
  const events =
    ctx.eventNames.length > 0 ? ctx.eventNames.join(", ") : "our events";

  return `Hi ${vendor.name.split(" ")[0]} team — we're planning our wedding for ${dateStr}${ctx.venueName ? ` at ${ctx.venueName}` : ""}${destination}. We're hosting ${ctx.guestCount} guests across ${events}. We'd love to know if you have availability and receive a rough quote.\n\nSent via Ananya.`;
}
