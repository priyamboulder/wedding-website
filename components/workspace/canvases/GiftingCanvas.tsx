"use client";

// ── Gifting workspace ───────────────────────────────────────────────────────
// Guest welcome bags, trousseau packaging, return favors, family exchanges,
// and a dedicated Thank-You tracker (culturally expected, often multi-
// generational in Indian families).

import {
  Gift,
  HandHeart,
  Handshake,
  Package,
  PackageOpen,
} from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  GIFTING_TABS,
  type GiftingTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { CategoryShortlistContractTab } from "@/components/workspace/shared/CategoryShortlistContractTab";
import { CategoryItemList } from "@/components/workspace/shared/CategoryItemList";
import { ThankYouTracker } from "@/components/workspace/gifting/ThankYouTracker";
import { GiftingVisionTab } from "@/components/workspace/gifting/GiftingVisionTab";
import { GiftingItemList } from "@/components/workspace/gifting/GiftingItemList";

export function GiftingCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <WorkspaceCanvas<GiftingTabId>
      category={category}
      categoryIcon={Gift}
      eyebrowSuffix="Gifting"
      tabs={GIFTING_TABS}
      renderTab={(tabId) => (
        <GiftingTab tab={tabId} category={category} />
      )}
    />
  );
}

function GiftingTab({
  tab,
  category,
}: {
  tab: GiftingTabId;
  category: WorkspaceCategory;
}) {
  switch (tab) {
    case "vision":
      return <GiftingVisionTab category={category} />;
    case "shortlist_contract":
      return <CategoryShortlistContractTab category={category} />;
    case "welcome_bags":
      return (
        <GiftingItemList
          category={category}
          tab="welcome_bags"
          title="Guest welcome bags"
          icon={<PackageOpen size={14} strokeWidth={1.8} />}
          description="Hotel drop welcome bags — itinerary card, local snacks, water, hangover kit. One bag per room in the block."
          placeholder="Add a welcome-bag item"
          emptyMessage="No welcome-bag items yet — love ideas in Vision & Mood to start."
        />
      );
    case "trousseau_packaging":
      return (
        <GiftingItemList
          category={category}
          tab="trousseau_packaging"
          title="Trousseau packaging"
          icon={<Package size={14} strokeWidth={1.8} />}
          description="Bride's trousseau — saree trays, jewelry boxes, nagphans. Coordinate with stationery for labels and monograms."
          placeholder="Add a trousseau piece"
          emptyMessage="No trousseau pieces yet — love ideas in Vision & Mood to start."
        />
      );
    case "return_favors":
      return (
        <GiftingItemList
          category={category}
          tab="return_favors"
          title="Return favors"
          icon={<Gift size={14} strokeWidth={1.8} />}
          description="Thank-you favors for guests — mini diya sets, potli bags, artisanal chocolates. Quantity by RSVP head count."
          placeholder="Add a favor"
          emptyMessage="No favors planned yet — love ideas in Vision & Mood to start."
        />
      );
    case "family_exchanges":
      return (
        <CategoryItemList
          category={category}
          tab="family_exchanges"
          blockType="note"
          title="Family gift exchanges"
          icon={<Handshake size={14} strokeWidth={1.8} />}
          description="Milni / vevai exchanges between families. Track gifts for parents, siblings, and bridal party. Vendor tips go here too."
          placeholder="Add an exchange (e.g. Milni — Mamaji → Groom's family)"
          defaultBlockType="note"
          emptyMessage="No family exchanges logged yet."
        />
      );
    case "thank_you":
      return <ThankYouTracker category={category} />;
  }
}
