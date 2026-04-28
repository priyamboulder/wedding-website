"use client";

// ── Favorites view ──────────────────────────────────────────────────────────
// /vendors?tab=favorites — a filtered list of vendors the couple has hearted.
// Heart membership is stored in the vendors store `shortlist` slice (the same
// state the heart on VendorCard toggles), so unhearting here removes the
// vendor from this list in real time.

import { useCallback, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { VendorsTabBar } from "@/components/vendors/VendorsTabBar";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorProfilePanel } from "@/components/vendors/VendorProfilePanel";
import { InquiryDialog } from "@/components/vendors/InquiryDialog";
import { useVendorsStore } from "@/stores/vendors-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useVenueStore } from "@/stores/venue-store";
import type { ChecklistItem } from "@/types/checklist";

export function FavoritesView({
  coordinationBadge,
  favoritesBadge,
}: {
  coordinationBadge?: string | null;
  favoritesBadge?: string | null;
}) {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const taskLinks = useVendorsStore((s) => s.taskLinks);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const removeFromShortlist = useVendorsStore((s) => s.removeFromShortlist);

  const tasks = useChecklistStore((s) => s.items);
  const venueProfileName = useVenueStore((s) => s.profile.name);

  const [drawerVendorId, setDrawerVendorId] = useState<string | null>(null);
  const [inquiryVendorId, setInquiryVendorId] = useState<string | null>(null);
  const [inquirySource, setInquirySource] =
    useState<"marketplace" | "profile_panel">("marketplace");

  const favoriteVendors = useMemo(() => {
    // Preserve the user's shortlist order — that's the order they favorited in.
    const byId = new Map(vendors.map((v) => [v.id, v] as const));
    return shortlist
      .map((e) => byId.get(e.vendor_id))
      .filter((v): v is (typeof vendors)[number] => Boolean(v));
  }, [vendors, shortlist]);

  const statusByVendorId = useMemo(
    () => new Map(shortlist.map((e) => [e.vendor_id, e.status])),
    [shortlist],
  );

  const tasksById = useMemo(() => {
    const m = new Map<string, ChecklistItem>();
    for (const t of tasks) m.set(t.id, t);
    return m;
  }, [tasks]);

  const firstLinkedTaskTitle = useCallback(
    (vendorId: string): { title: string | null; count: number } => {
      const links = taskLinks.filter((l) => l.vendor_id === vendorId);
      if (links.length === 0) return { title: null, count: 0 };
      const t = tasksById.get(links[0].task_id);
      return { title: t?.title ?? null, count: links.length };
    },
    [taskLinks, tasksById],
  );

  // Same unfavorite UX as My Vendors: warn if task links would be severed.
  const handleHeart = useCallback(
    (vendorId: string) => {
      const saved = isShortlisted(vendorId);
      if (saved) {
        const linkedCount = taskLinks.filter(
          (l) => l.vendor_id === vendorId,
        ).length;
        if (linkedCount > 0) {
          const ok = window.confirm(
            `This vendor is linked to ${linkedCount} task${linkedCount === 1 ? "" : "s"}. Unsaving will unlink them. Continue?`,
          );
          if (!ok) return;
          removeFromShortlist(vendorId);
          return;
        }
      }
      toggleShortlist(vendorId);
    },
    [isShortlisted, taskLinks, toggleShortlist, removeFromShortlist],
  );

  const drawerVendor = useMemo(
    () => vendors.find((v) => v.id === drawerVendorId) ?? null,
    [vendors, drawerVendorId],
  );

  const inquiryVendor = useMemo(
    () => vendors.find((v) => v.id === inquiryVendorId) ?? null,
    [vendors, inquiryVendorId],
  );

  const openInquiryFromCard = useCallback((id: string) => {
    setInquirySource("marketplace");
    setInquiryVendorId(id);
  }, []);

  const openInquiryFromPanel = useCallback((id: string) => {
    setInquirySource("profile_panel");
    setInquiryVendorId(id);
  }, []);

  const hasFavorites = favoriteVendors.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <VendorsTabBar
        activeTab="favorites"
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />

      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
            <div>
              <h1 className="font-serif text-[20px] text-ink">Favorites</h1>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Vendors you&apos;ve hearted. Tap the ♥ on any card to remove.
              </p>
            </div>
            {hasFavorites && (
              <span
                className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {favoriteVendors.length} saved
              </span>
            )}
          </header>

          {hasFavorites ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteVendors.map((v) => {
                const link = firstLinkedTaskTitle(v.id);
                return (
                  <VendorCard
                    key={v.id}
                    vendor={v}
                    shortlisted
                    status={statusByVendorId.get(v.id)}
                    linkedTaskCount={link.count}
                    linkedTaskTitle={link.title}
                    onOpen={() => setDrawerVendorId(v.id)}
                    onToggleShortlist={() => handleHeart(v.id)}
                    onChooseTask={() => setDrawerVendorId(v.id)}
                    onInquire={() => openInquiryFromCard(v.id)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyFavoritesState />
          )}
        </div>
      </main>

      <VendorProfilePanel
        vendor={drawerVendor}
        onClose={() => setDrawerVendorId(null)}
        onOpenVendor={(id) => setDrawerVendorId(id)}
        onInquire={openInquiryFromPanel}
        coupleVenueName={venueProfileName || null}
      />

      <InquiryDialog
        vendor={inquiryVendor}
        source={inquirySource}
        onClose={() => setInquiryVendorId(null)}
      />
    </div>
  );
}

function EmptyFavoritesState() {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-pale/50 text-rose">
        <Heart size={30} strokeWidth={1.4} />
      </div>
      <div className="flex max-w-md flex-col gap-1.5">
        <h2 className="font-serif text-[20px] text-ink">No favorites yet</h2>
        <p className="text-[13px] text-ink-muted">
          Tap the ♥ on any vendor to save them here.
        </p>
      </div>
    </div>
  );
}
