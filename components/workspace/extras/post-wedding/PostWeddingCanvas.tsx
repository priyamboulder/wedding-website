"use client";

// ── Post-Wedding canvas ────────────────────────────────────────────────────
// Five tabs: Thank-Yous, Deliveries, Reviews, Name Change, Archive. Shown in
// the sidebar once the wedding date has passed, or earlier via the manual
// unlock toggle in the workspace settings / this canvas's actions.

import {
  Archive,
  Coins,
  Gift,
  Heart,
  IdCard,
  Package,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { cn } from "@/lib/utils";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import { usePostWeddingBannerVisible } from "@/lib/post-wedding-activation";
import { ThankYouTab } from "./tabs/ThankYouTab";
import { DeliveriesTab } from "./tabs/DeliveriesTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { NameChangeTab } from "./tabs/NameChangeTab";
import { ArchiveTab } from "./tabs/ArchiveTab";
import { ShareNumbersTab } from "./tabs/ShareNumbersTab";
import { MentoringTab } from "./tabs/MentoringTab";

type PostWeddingTabId =
  | "thank_yous"
  | "deliveries"
  | "reviews"
  | "name_change"
  | "share_numbers"
  | "mentoring"
  | "archive";

const TABS: ExtraTabDef<PostWeddingTabId>[] = [
  { id: "thank_yous", label: "Thank-Yous", icon: Gift },
  { id: "deliveries", label: "Deliveries", icon: Package },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "name_change", label: "Name Change", icon: IdCard },
  { id: "share_numbers", label: "Share Your Numbers", icon: Coins },
  { id: "mentoring", label: "Mentoring", icon: Sparkles },
  { id: "archive", label: "Archive", icon: Archive },
];

export function PostWeddingCanvas() {
  const bannerVisible = usePostWeddingBannerVisible();
  const dismissBanner = usePostWeddingStore((s) => s.dismissBanner);

  const giftCount = usePostWeddingStore((s) => s.gifts.length);
  const deliveryCount = usePostWeddingStore((s) => s.deliveries.length);
  const reviewCount = usePostWeddingStore((s) => s.reviews.length);

  const subtitleParts: string[] = [];
  if (giftCount > 0) subtitleParts.push(`${giftCount} gifts`);
  if (deliveryCount > 0) subtitleParts.push(`${deliveryCount} deliveries`);
  if (reviewCount > 0) subtitleParts.push(`${reviewCount} reviews`);
  const subtitle =
    subtitleParts.length > 0
      ? subtitleParts.join(" · ")
      : "the logistical tail — gifts, reviews, deliveries, and the archive.";

  return (
    <ExtraCanvasShell<PostWeddingTabId>
      eyebrow="WORKSPACE · AFTER THE WEDDING"
      icon={Heart}
      title="Post-Wedding"
      subtitle={subtitle}
      statusDotClass="bg-saffron"
      tabs={TABS}
      initialTab="thank_yous"
      renderTab={(tab) => (
        <div className="space-y-6">
          {bannerVisible && <CongratsBanner onDismiss={dismissBanner} />}
          {tab === "thank_yous" && <ThankYouTab />}
          {tab === "deliveries" && <DeliveriesTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "name_change" && <NameChangeTab />}
          {tab === "share_numbers" && <ShareNumbersTab />}
          {tab === "mentoring" && <MentoringTab />}
          {tab === "archive" && <ArchiveTab />}
        </div>
      )}
    />
  );
}

function CongratsBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border border-saffron/30 bg-saffron/10 px-5 py-4",
      )}
    >
      <Heart
        size={18}
        strokeWidth={1.6}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Congratulations — you did it!
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink">
          your post-wedding checklist is ready. take a breath, then work
          through these at your own pace — gifts, deliveries, reviews, and
          everything else that comes after the vows.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-white hover:text-ink"
      >
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}

