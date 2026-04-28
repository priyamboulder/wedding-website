"use client";

// ── Vendor interest inbox ───────────────────────────────────────────────────
// The bride's view of vendors who've expressed interest in her "looking"
// rows. Grouped by checklist category. Each card shows the vendor's
// pitch + minimal profile and offers Accept (shares contact info) /
// Decline (soft "reviewed other options" status to the vendor) /
// View portfolio.

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { getVendorNeedCategory } from "@/types/vendor-needs";
import type { CommunityVendorInterest, CommunityVendorNeed } from "@/types/vendor-needs";
import type { Vendor } from "@/types/vendor-unified";

export function VendorInterestInbox() {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const allInterests = useVendorNeedsStore((s) => s.interests);
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const acceptInterest = useVendorNeedsStore((s) => s.acceptInterest);
  const declineInterest = useVendorNeedsStore((s) => s.declineInterest);
  const vendors = useVendorsStore((s) => s.vendors);

  // Group active interests by need's category.
  const grouped = useMemo(() => {
    if (!myProfileId) return new Map<string, CommunityVendorInterest[]>();
    const active = allInterests.filter(
      (i) =>
        i.bride_profile_id === myProfileId &&
        (i.status === "pending" ||
          i.status === "viewed" ||
          i.status === "accepted"),
    );
    const map = new Map<string, CommunityVendorInterest[]>();
    for (const interest of active) {
      const need = allNeeds.find((n) => n.id === interest.need_id);
      if (!need) continue;
      const list = map.get(need.category_slug) ?? [];
      list.push(interest);
      map.set(need.category_slug, list);
    }
    return map;
  }, [myProfileId, allInterests, allNeeds]);

  if (!myProfileId) return null;
  if (grouped.size === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-6 text-center text-[13px] italic text-ink-muted">
        nobody's reached out yet — keep your "looking" rows visible and they
        will.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([categorySlug, interests]) => {
        const cat = getVendorNeedCategory(
          categorySlug as ReturnType<typeof getVendorNeedCategory> extends infer _ ? any : any,
        );
        return (
          <section key={categorySlug}>
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-gold">
              {cat?.emoji} {cat?.label} ({interests.length} interested)
            </p>
            <ul className="space-y-3">
              {interests.map((interest) => {
                const need = allNeeds.find((n) => n.id === interest.need_id);
                const vendor = vendors.find((v) => v.id === interest.vendor_id);
                if (!vendor || !need) return null;
                return (
                  <li key={interest.id}>
                    <InterestCard
                      interest={interest}
                      vendor={vendor}
                      need={need}
                      onAccept={() => acceptInterest(interest.id)}
                      onDecline={() => declineInterest(interest.id)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function InterestCard({
  interest,
  vendor,
  onAccept,
  onDecline,
}: {
  interest: CommunityVendorInterest;
  vendor: Vendor;
  need: CommunityVendorNeed;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const accepted = interest.status === "accepted";
  const startingPrice = (() => {
    const featured =
      vendor.packages?.find((p) => p.featured) ?? vendor.packages?.[0];
    if (!featured) return null;
    const pd = featured.price_display;
    if (pd.type === "starting_from") {
      const sym = featured.currency === "INR" ? "₹" : "$";
      return `Starting at ${sym}${pd.amount.toLocaleString()}`;
    }
    if (pd.type === "exact") {
      const sym = featured.currency === "INR" ? "₹" : "$";
      return `${sym}${pd.amount.toLocaleString()}`;
    }
    if (pd.type === "range") {
      const sym = featured.currency === "INR" ? "₹" : "$";
      return `${sym}${pd.min.toLocaleString()}–${sym}${pd.max.toLocaleString()}`;
    }
    return null;
  })();

  return (
    <div className="rounded-xl border border-gold/15 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ivory-warm">
          {vendor.cover_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={vendor.cover_image}
              alt={vendor.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-[20px] text-ink-muted">
              {vendor.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] font-medium text-ink">
            {vendor.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-ink-muted">
            {typeof vendor.rating === "number" && vendor.rating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star
                  size={11}
                  strokeWidth={1.8}
                  className="fill-saffron text-saffron"
                />
                {vendor.rating.toFixed(1)}
                {vendor.review_count > 0 && (
                  <span className="text-ink-faint">
                    ({vendor.review_count})
                  </span>
                )}
              </span>
            )}
            {vendor.location && (
              <>
                <span className="text-ink-faint">·</span>
                <span>{vendor.location}</span>
              </>
            )}
            {startingPrice && (
              <>
                <span className="text-ink-faint">·</span>
                <span>{startingPrice}</span>
              </>
            )}
          </div>
          <p className="mt-3 font-serif text-[14px] italic leading-[1.5] text-ink">
            &ldquo;{interest.message}&rdquo;
          </p>
        </div>
      </div>

      {accepted ? (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-sage/10 px-3 py-2.5 ring-1 ring-sage/30">
          <p className="text-[12.5px] font-medium text-sage">
            ✨ contact info shared. {vendor.name} will reach out soon.
          </p>
          <Link
            href={`/vendors/${vendor.id}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            view profile
            <ExternalLink size={11} strokeWidth={1.8} />
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gold/10 pt-3">
          <Link
            href={`/vendors/${vendor.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
          >
            view portfolio
            <ExternalLink size={10} strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={onDecline}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
          >
            decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              "rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft",
            )}
          >
            accept — share my info
          </button>
        </div>
      )}
    </div>
  );
}
