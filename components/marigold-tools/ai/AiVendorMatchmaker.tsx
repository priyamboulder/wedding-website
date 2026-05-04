"use client";

// ──────────────────────────────────────────────────────────────────────────
// AI Vendor Matchmaker — auth-walled "Help me pick" card on the destination
// vendor list. Sends the actual vendor list (already filtered by location +
// category) plus the user's tier preference to /api/tools/ai with
// action=vendor and renders 2–3 conversational picks.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";

import type { RankedVendor } from "@/types/vendors";
import type { BudgetTier } from "@/types/budget";
import type { AiVendorRequest } from "@/types/ai-advisor";
import { useAuthStore } from "@/stores/auth-store";

import { useAiAdvisor } from "./use-ai-advisor";
import {
  AiAuthCta,
  AiBadge,
  AiDisclaimer,
  AiErrorPanel,
  AiLoading,
} from "./AiPrimitives";

import styles from "./AiVendorMatchmaker.module.css";

type VendorWithMeta = {
  vendor: RankedVendor;
  priceLowUsd: number | null;
  priceHighUsd: number | null;
};

type Props = {
  vendors: VendorWithMeta[];
  locationName: string;
  locationSlug: string;
  categoryName: string;
  categorySlug: string;
  preferredTier: BudgetTier | null;
  totalBudget: number | null;
};

export function AiVendorMatchmaker({
  vendors,
  locationName,
  locationSlug,
  categoryName,
  categorySlug,
  preferredTier,
  totalBudget,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const [intent, setIntent] = useState<"idle" | "started">("idle");

  const buildRequest = useCallback((): AiVendorRequest => {
    return {
      action: "vendor",
      locationName,
      locationSlug,
      categoryName,
      categorySlug,
      totalBudget,
      preferredTier,
      vendors: vendors.slice(0, 24).map(({ vendor, priceLowUsd, priceHighUsd }) => ({
        id: vendor.id,
        name: vendor.name,
        tagline: vendor.tagline,
        homeBase: vendor.home_base_city
          ? `${vendor.home_base_city}${vendor.home_base_country ? ", " + vendor.home_base_country : ""}`
          : null,
        travelsGlobally: vendor.travels_globally,
        tierMatch: vendor.tier_match,
        capacityMin: vendor.capacity_min,
        capacityMax: vendor.capacity_max,
        verified: vendor.verified,
        placementTier: vendor.placement_tier,
        priceLowUsd,
        priceHighUsd,
      })),
    };
  }, [
    vendors,
    locationName,
    locationSlug,
    categoryName,
    categorySlug,
    totalBudget,
    preferredTier,
  ]);

  const advisor = useAiAdvisor<"vendor">(buildRequest);

  const handleStart = () => {
    setIntent("started");
    advisor.run();
  };

  if (vendors.length === 0) return null;

  if (intent === "idle" || advisor.status === "idle") {
    return (
      <aside className={styles.aside}>
        <div className={styles.cta}>
          <span className={styles.kicker}>✿ help me pick</span>
          <h3 className={styles.heading}>
            cut through the grid with the <em>Marigold AI</em>
          </h3>
          <p className={styles.body}>
            We'll read your shortlist and tell you the 2–3 vendors that actually
            fit you — and the honest tradeoffs you should know about.
          </p>
          <button type="button" className={styles.primaryBtn} onClick={handleStart}>
            ✦ Help me pick →
          </button>
          <AiDisclaimer />
        </div>
      </aside>
    );
  }

  if (!user || advisor.status === "auth_required") {
    return (
      <aside className={styles.aside}>
        <AiAuthCta feature="vendor" />
      </aside>
    );
  }

  if (advisor.status === "loading") {
    return (
      <aside className={styles.aside}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiLoading phrase={advisor.loadingPhrase} />
        </div>
      </aside>
    );
  }

  if (advisor.status === "rate_limited") {
    return (
      <aside className={styles.aside}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiErrorPanel rateLimited message={advisor.errorMessage} onRetry={advisor.run} />
        </div>
      </aside>
    );
  }

  if (advisor.status === "error") {
    return (
      <aside className={styles.aside}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiErrorPanel onRetry={advisor.run} />
        </div>
      </aside>
    );
  }

  const data = advisor.data;
  if (!data) return null;

  return (
    <aside className={styles.aside}>
      <div className={styles.shell}>
        <header className={styles.shellHead}>
          <AiBadge />
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={advisor.run}
            aria-label="Refresh picks"
          >
            ↻ refresh
          </button>
        </header>

        <p className={styles.intro}>{data.intro}</p>

        <ol className={styles.pickList}>
          {data.picks.map((pick, i) => (
            <li key={pick.vendorId} className={styles.pick}>
              <div className={styles.pickRank}>{i + 1}</div>
              <div className={styles.pickBody}>
                <h4 className={styles.pickName}>{pick.vendorName}</h4>
                <p className={styles.pickReasoning}>{pick.reasoning}</p>
                {pick.tradeoff && (
                  <p className={styles.pickTradeoff}>
                    <span className={styles.tradeoffLabel}>tradeoff —</span>{" "}
                    {pick.tradeoff}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <AiDisclaimer />
      </div>
    </aside>
  );
}
