"use client";

// ── /vendors ─────────────────────────────────────────────────────────────────
// Two-tab shell: My Vendors (the existing directory / shortlist) + Coordination
// (the vendor coordination hub). The tab lives in ?tab=coordination so links
// can deep-link into either view — mirrors /community?tab=connect&sub=brides.

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MyVendorsView } from "@/components/vendors/MyVendorsView";
import { CoordinationView } from "@/components/coordination/CoordinationView";
import { FavoritesView } from "@/components/vendors/FavoritesView";
import { RouletteView } from "@/components/vendors/roulette/RouletteView";
import {
  resolveVendorsTab,
  type VendorsTab,
} from "@/components/vendors/VendorsTabBar";
import { useCoordinationStore } from "@/stores/coordination-store";
import { useEventsStore } from "@/stores/events-store";
import { useVendorsStore } from "@/stores/vendors-store";

export default function VendorsPage() {
  return (
    <Suspense fallback={null}>
      <VendorsPageInner />
    </Suspense>
  );
}

function VendorsPageInner() {
  const searchParams = useSearchParams();
  const activeTab: VendorsTab = resolveVendorsTab(searchParams?.get("tab"));

  const vendors = useCoordinationStore((s) => s.vendors);
  const events = useEventsStore((s) => s.events);
  const shortlistCount = useVendorsStore((s) => s.shortlist.length);

  // Favorites badge: count of hearted vendors. Any shortlist entry counts —
  // the heart on a vendor card toggles shortlist membership, so shortlist
  // and "favorites" are the same set.
  const favoritesBadge = shortlistCount > 0 ? String(shortlistCount) : null;

  // Coordination badge: nudge the user toward the hub when the wedding is
  // within 30 days and some vendors haven't confirmed yet. Computed at page
  // level so it stays consistent between the two tabs.
  const coordinationBadge = useMemo<string | null>(() => {
    if (vendors.length === 0) return null;
    const unconfirmed = vendors.filter(
      (v) => v.overallStatus !== "confirmed",
    ).length;
    if (unconfirmed === 0) return null;

    const upcomingDates = events
      .map((e) => e.eventDate)
      .filter((d): d is string => Boolean(d))
      .sort();
    const firstDate = upcomingDates[0];
    if (!firstDate) return `${unconfirmed} unconfirmed`;

    const daysUntil = Math.ceil(
      (new Date(firstDate).getTime() - Date.now()) / 86_400_000,
    );
    if (daysUntil > 0 && daysUntil <= 30) {
      return `${unconfirmed} unconfirmed`;
    }
    return null;
  }, [vendors, events]);

  if (activeTab === "coordination") {
    return (
      <CoordinationView
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />
    );
  }
  if (activeTab === "favorites") {
    return (
      <FavoritesView
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />
    );
  }
  if (activeTab === "roulette") {
    return (
      <RouletteView
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />
    );
  }
  return (
    <MyVendorsView
      coordinationBadge={coordinationBadge}
      favoritesBadge={favoritesBadge}
    />
  );
}
