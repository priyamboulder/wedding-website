"use client";

// ──────────────────────────────────────────────────────────────────────────
// CTAFooter — conversion section below the generated timeline.
//
// Primary CTA points at signup with the timeline config encoded in the
// query string (so the post-auth onboarding can pre-fill the workspace).
// PDF + share both work without an account — that's the point.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";

import type {
  VisualizerInputs,
  VisualizerOutput,
} from "@/types/visualizer";
import {
  downloadPdf,
  encodeConfig,
  exportTimelinePdf,
  styleLabel,
} from "@/lib/tools/visualizer";

import styles from "./CTAFooter.module.css";

type Props = {
  inputs: VisualizerInputs;
  output: VisualizerOutput;
};

export function CTAFooter({ inputs, output }: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const handleDownload = () => {
    const filename = `marigold-weekend-${inputs.style}-${inputs.days}day.pdf`;
    const doc = exportTimelinePdf(output, inputs);
    downloadPdf(filename, doc);
  };

  const handleShare = async () => {
    try {
      const token = encodeConfig(inputs);
      const url = `${window.location.origin}${window.location.pathname}#plan=${token}`;
      await navigator.clipboard.writeText(url);
      // Reflect to URL so refresh keeps the same plan.
      window.history.replaceState(null, "", `#plan=${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const signupHref = `/signup?from=visualizer&plan=${encodeConfig(inputs)}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.note}>
        <span className={styles.eyebrow}>What's next</span>
        <h3 className={styles.title}>
          You got the <em>overview</em> for free.
        </h3>
        <p className={styles.body}>
          Save it, customize every detail, get vendor matches that travel for
          your {styleLabel(inputs.style).toLowerCase()} ceremony, and lock the
          real plan inside The Marigold.
        </p>
      </div>

      <div className={styles.actions}>
        <Link href={signupHref} className={styles.primaryBtn}>
          Save &amp; customize this timeline →
        </Link>

        <div className={styles.secondaryRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleDownload}
          >
            <span className={styles.btnIcon} aria-hidden>
              ↓
            </span>
            Download as PDF
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleShare}
          >
            <span className={styles.btnIcon} aria-hidden>
              ↗
            </span>
            {shareState === "copied"
              ? "Link copied!"
              : shareState === "error"
                ? "Couldn't copy"
                : "Share with my partner"}
          </button>
        </div>

        <Link href={signupHref} className={styles.tertiaryLink}>
          Start planning your {styleLabel(inputs.style).toLowerCase()} wedding
          inside The Marigold →
        </Link>
      </div>
    </div>
  );
}
