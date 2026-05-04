"use client";

// ──────────────────────────────────────────────────────────────────────────
// AI Destination Analyst — auth-walled "Want a deeper analysis?" payoff for
// the Match Me results spread.
//
// Sends Match inputs + algorithmic top matches to /api/tools/ai with
// action=destination and renders the editorial card.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";

import { PRIORITY_LABELS } from "@/lib/match";
import type {
  MatchInputs,
  MatchedDestination,
  PrioritySlug,
} from "@/types/match";
import type { AiDestinationRequest } from "@/types/ai-advisor";
import { useAuthStore } from "@/stores/auth-store";

import { useAiAdvisor } from "./use-ai-advisor";
import {
  AiAuthCta,
  AiBadge,
  AiDisclaimer,
  AiErrorPanel,
  AiLoading,
} from "./AiPrimitives";

import styles from "./AiDestinationAnalyst.module.css";

type Props = {
  inputs: MatchInputs;
  matches: MatchedDestination[];
};

export function AiDestinationAnalyst({ inputs, matches }: Props) {
  const user = useAuthStore((s) => s.user);
  const [intent, setIntent] = useState<"idle" | "started">("idle");

  const buildRequest = useCallback((): AiDestinationRequest => {
    return {
      action: "destination",
      inputs: {
        budget: inputs.budget,
        guests: inputs.guests,
        priorities: inputs.priorities.map(
          (p) => PRIORITY_LABELS[p as PrioritySlug] ?? p,
        ),
        dealbreakers: inputs.dealbreakers as string[],
      },
      matches: matches.slice(0, 5).map((m) => ({
        slug: m.slug,
        name: m.name,
        score: m.score,
        tagline: m.tagline,
        tags: m.tags,
        reasons: m.reasons,
      })),
    };
  }, [inputs, matches]);

  const advisor = useAiAdvisor<"destination">(buildRequest);

  const handleStart = () => {
    setIntent("started");
    advisor.run();
  };

  if (intent === "idle" || advisor.status === "idle") {
    return (
      <section className={styles.section}>
        <div className={styles.cta}>
          <span className={styles.kicker}>✿ want a deeper analysis?</span>
          <h3 className={styles.heading}>
            we'll have the <em>Marigold AI</em> walk through your top matches
          </h3>
          <p className={styles.body}>
            How they actually compare for you specifically. The risks worth
            thinking about. One wild card you didn't pick that might surprise you.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleStart}
            disabled={matches.length === 0}
          >
            ✦ Get the deeper analysis →
          </button>
          <AiDisclaimer />
        </div>
      </section>
    );
  }

  if (!user || advisor.status === "auth_required") {
    return (
      <section className={styles.section}>
        <AiAuthCta feature="destination" />
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
          <AiErrorPanel rateLimited message={advisor.errorMessage} onRetry={advisor.run} />
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
            aria-label="Refresh analysis"
          >
            ↻ refresh
          </button>
        </header>

        <p className={styles.personality}>{data.personality}</p>

        <div className={styles.prose}>
          {data.analysis.split(/\n\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {data.wildCard && (
          <div className={styles.wildCard}>
            <span className={styles.wildEyebrow}>✿ the wild card</span>
            <h4 className={styles.wildName}>{data.wildCard.name}</h4>
            <p className={styles.wildReason}>{data.wildCard.reason}</p>
          </div>
        )}

        <AiDisclaimer />
      </div>
    </section>
  );
}
