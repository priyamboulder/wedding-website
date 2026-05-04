"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

import styles from "./SaveAuthGate.module.css";

type Reason = "save" | "share" | "ai";

const COPY: Record<Reason, { title: string; sub: string; cta: string }> = {
  save: {
    title: "Save your budget?",
    sub: "We'll save it to your account so you can come back any time, on any device. Your in-progress plan stays exactly as it is.",
    cta: "Sign up & save",
  },
  share: {
    title: "Share with the family?",
    sub: "Save the plan first so the people you share with see the same numbers — even if you tweak them later.",
    cta: "Sign up & share",
  },
  ai: {
    title: "Get AI recommendations?",
    sub: "We'll analyze your plan and suggest where to splurge, where to save, and which vendors fit your vibe. Free with an account.",
    cta: "Sign up for AI tips",
  },
};

type Props = {
  reason: Reason;
  anonymousToken: string;
  onClose: () => void;
};

export function SaveAuthGate({ reason, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const router = useRouter();

  // If the user is already authed, skip the gate and go straight to the
  // dashboard — the parent reducer/persistence layer will surface the
  // plan data once they're there.
  useEffect(() => {
    if (user) {
      router.push("/dashboard?source=budget_save");
    }
  }, [user, router]);

  if (user) return null;

  const copy = COPY[reason];

  const handleCta = () => {
    openSignUp("planning-tool");
    onClose();
  };

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <span className={styles.scrawl}>✿ one quick step</span>
        <h2 className={styles.heading}>{copy.title}</h2>
        <p className={styles.sub}>{copy.sub}</p>

        <ul className={styles.bullets}>
          <li>Your plan auto-claims to your account on signup</li>
          <li>Pick up exactly where you left off, on any device</li>
          <li>No spam — just your budget</li>
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryCta} onClick={handleCta}>
            {copy.cta} →
          </button>
          <button type="button" className={styles.secondaryCta} onClick={onClose}>
            Keep building
          </button>
        </div>

        <p className={styles.fineprint}>
          Already have an account?{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              useAuthStore.getState().openSignIn("planning-tool");
              onClose();
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
