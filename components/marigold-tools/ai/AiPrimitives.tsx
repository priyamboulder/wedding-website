"use client";

// Shared atoms used by all three AI advisor cards: badge, disclaimer,
// inline auth gate, error / rate-limit copy.

import { useAuthStore } from "@/stores/auth-store";
import { AI_BADGE_LABEL, AI_DISCLAIMER, AI_ERROR_COPY } from "@/types/ai-advisor";

import styles from "./AiPrimitives.module.css";

export function AiBadge() {
  return <span className={styles.badge}>{AI_BADGE_LABEL}</span>;
}

export function AiDisclaimer() {
  return <p className={styles.disclaimer}>{AI_DISCLAIMER}</p>;
}

type AuthCtaProps = {
  // What the user just tried to unlock — drives the headline copy.
  feature: "budget" | "destination" | "vendor";
};

const AUTH_COPY: Record<AuthCtaProps["feature"], { title: string; sub: string }> = {
  budget: {
    title: "Get the Marigold AI on your budget",
    sub: "We'll analyze your plan against the location, culture, and tier choices you've made — and tell you exactly where to splurge or save.",
  },
  destination: {
    title: "Get the Marigold AI on your matches",
    sub: "An editorial read on why these destinations fit you, the real risks, and one wild card you didn't pick.",
  },
  vendor: {
    title: "Get the Marigold AI on this shortlist",
    sub: "We'll cut through the grid and tell you which 2–3 vendors actually fit your wedding, and what the tradeoffs really are.",
  },
};

export function AiAuthCta({ feature }: AuthCtaProps) {
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const copy = AUTH_COPY[feature];
  return (
    <div className={styles.authCard}>
      <span className={styles.kicker}>✿ unlock with an account</span>
      <h3 className={styles.authTitle}>{copy.title}</h3>
      <p className={styles.authBody}>{copy.sub}</p>
      <div className={styles.authActions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => openSignUp("planning-tool")}
        >
          Sign up — free →
        </button>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => openSignIn("planning-tool")}
        >
          already have an account? sign in
        </button>
      </div>
      <AiDisclaimer />
    </div>
  );
}

type LoadingProps = { phrase: string };

export function AiLoading({ phrase }: LoadingProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spark} aria-hidden>
        ✦
      </span>
      <span className={styles.loadingText}>{phrase}</span>
    </div>
  );
}

type ErrorProps = {
  rateLimited?: boolean;
  message?: string;
  onRetry: () => void;
};

export function AiErrorPanel({ rateLimited, message, onRetry }: ErrorProps) {
  return (
    <div className={styles.errorPanel} role="alert">
      <p className={styles.errorBody}>
        {rateLimited ? message || AI_ERROR_COPY : AI_ERROR_COPY}
      </p>
      {!rateLimited && (
        <button type="button" className={styles.linkBtn} onClick={onRetry}>
          try again
        </button>
      )}
    </div>
  );
}
