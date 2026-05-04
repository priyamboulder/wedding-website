"use client";

// ──────────────────────────────────────────────────────────────────────────
// AI Budget Advisor — the auth-walled "Get AI recommendations" payoff that
// renders inside the Budget Builder's Summary view.
//
// On click → checks auth → renders sign-up if not authed → otherwise calls
// /api/tools/ai with action=budget and renders the recommendation cards.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from "react";

import type { BudgetSummary } from "@/lib/budget";
import type { BudgetCultureWithEvents, BudgetLocationRow, BudgetTier } from "@/types/budget";
import type { AiBudgetRequest, AiBudgetSuggestion } from "@/types/ai-advisor";
import { useAuthStore } from "@/stores/auth-store";

import { useAiAdvisor } from "./use-ai-advisor";
import {
  AiAuthCta,
  AiBadge,
  AiDisclaimer,
  AiErrorPanel,
  AiLoading,
} from "./AiPrimitives";

import styles from "./AiBudgetAdvisor.module.css";

type Props = {
  summary: BudgetSummary;
  location: BudgetLocationRow;
  culture: BudgetCultureWithEvents | null;
  totalBudget: number | null;
  globalTier: BudgetTier;
};

export function AiBudgetAdvisor({
  summary,
  location,
  culture,
  totalBudget,
  globalTier,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const [intent, setIntent] = useState<"idle" | "started">("idle");

  const buildRequest = useCallback((): AiBudgetRequest => {
    return {
      action: "budget",
      locationName: location.name,
      locationSlug: location.slug,
      cultureName: culture?.name ?? null,
      cultureSlug: culture?.slug ?? null,
      totalBudget,
      grandTotal: summary.totals.grand,
      globalTier,
      events: summary.events.map((e) => ({
        slug: e.event.slug,
        name: e.event.name,
        guestCount: e.guestCount,
        subtotal: e.subtotal,
        vendors: e.vendors.map((v) => ({
          category: v.categoryName,
          tier: v.tier,
          cost: v.cost,
        })),
      })),
      weddingWideVendors: summary.weddingWideVendors.map((v) => ({
        category: v.categoryName,
        tier: v.tier,
        cost: v.cost,
      })),
      weddingWideAddons: summary.weddingWideAddons.map((a) => ({
        name: a.addonName,
        cost: a.cost,
      })),
    };
  }, [location, culture, totalBudget, summary, globalTier]);

  const advisor = useAiAdvisor<"budget">(buildRequest);

  const overUnder = useMemo(
    () => (totalBudget != null ? summary.totals.grand - totalBudget : null),
    [summary.totals.grand, totalBudget],
  );

  const handleStart = () => {
    setIntent("started");
    advisor.run();
  };

  // Idle (pre-click) state — render the CTA card.
  if (intent === "idle" || advisor.status === "idle") {
    return (
      <section className={styles.section} id="ai-budget-advisor">
        <div className={styles.cta}>
          <span className={styles.kicker}>✿ deeper dive</span>
          <h3 className={styles.heading}>
            want the <em>Marigold AI</em> on this plan?
          </h3>
          <p className={styles.body}>
            {overUnder != null && overUnder > 0
              ? "you're over your target — we'll tell you exactly where to trim, with dollar impact, before you cut anything you'll regret."
              : overUnder != null && overUnder < 0
                ? "you have headroom — we'll tell you the high-impact upgrades that actually show up in the photos and the memories."
                : "we'll cross-check your tiers against the location, the culture, and what real Indian weddings of this size cost — and tell you what to do."}
          </p>
          <button type="button" className={styles.primaryBtn} onClick={handleStart}>
            ✦ Get AI recommendations →
          </button>
          <AiDisclaimer />
        </div>
      </section>
    );
  }

  if (!user || advisor.status === "auth_required") {
    return (
      <section className={styles.section}>
        <AiAuthCta feature="budget" />
      </section>
    );
  }

  if (advisor.status === "loading") {
    return (
      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiLoading phrase={advisor.loadingPhrase} />
        </div>
      </section>
    );
  }

  if (advisor.status === "rate_limited") {
    return (
      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiErrorPanel
            rateLimited
            message={advisor.errorMessage}
            onRetry={advisor.run}
          />
        </div>
      </section>
    );
  }

  if (advisor.status === "error") {
    return (
      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.shellHead}>
            <AiBadge />
          </header>
          <AiErrorPanel onRetry={advisor.run} />
        </div>
      </section>
    );
  }

  const data = advisor.data;
  if (!data) return null;

  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <header className={styles.shellHead}>
          <AiBadge />
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={advisor.run}
            aria-label="Refresh recommendations"
          >
            ↻ refresh
          </button>
        </header>

        <p className={styles.headline}>{data.headline}</p>

        <ul className={styles.suggestionList}>
          {data.suggestions.map((s, i) => (
            <SuggestionRow key={i} s={s} />
          ))}
        </ul>

        <AiDisclaimer />
      </div>
    </section>
  );
}

function SuggestionRow({ s }: { s: AiBudgetSuggestion }) {
  const kindClass =
    s.kind === "savings"
      ? styles.kindSavings
      : s.kind === "upgrade"
        ? styles.kindUpgrade
        : styles.kindNeutral;
  return (
    <li className={`${styles.suggestion} ${kindClass}`}>
      <span className={styles.eyebrow}>{s.eyebrow}</span>
      <p className={styles.suggestionBody}>{s.body}</p>
      {s.impactUsd != null && s.impactUsd > 0 && (
        <span className={styles.impact}>≈ ${s.impactUsd.toLocaleString("en-US")}</span>
      )}
    </li>
  );
}
