"use client";

// ──────────────────────────────────────────────────────────────────────────
// DeepDive — the "AI deeper dive" CTA below the matches.
//
// Calls /api/tools/match/deep-dive with the user's inputs + the top matches
// and renders the prose analysis in-place. The endpoint always returns a
// readable answer (it falls back to a heuristic when ANTHROPIC_API_KEY
// isn't set), so the success path is the same in both modes.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";

import type {
  MatchDeepDiveResponse,
  MatchInputs,
  MatchedDestination,
} from "@/types/match";

import styles from "./DeepDive.module.css";

type Props = {
  inputs: MatchInputs;
  matches: MatchedDestination[];
};

type Status = "idle" | "loading" | "ok" | "error";

export function DeepDive({ inputs, matches }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [analysis, setAnalysis] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const run = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/tools/match/deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          matches: matches.map((m) => ({
            slug: m.slug,
            name: m.name,
            score: m.score,
            reasons: m.reasons,
          })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as MatchDeepDiveResponse;
      if (!res.ok || !json.ok || !json.analysis) {
        throw new Error(json.error ?? "Could not run the deep dive.");
      }
      setAnalysis(json.analysis);
      setStatus("ok");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <section className={styles.section}>
        <span className={styles.kicker}>✿ deeper dive</span>
        <h3 className={styles.heading}>The honest read</h3>
        <div className={styles.prose}>
          {analysis.split("\n\n").map((block, idx) => (
            <p key={idx}>{block}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <span className={styles.kicker}>✿ want a deeper analysis?</span>
      <h3 className={styles.heading}>
        We'll have <em>Claude</em> walk through your top matches.
      </h3>
      <p className={styles.body}>
        How they actually compare. Where the budget might pinch. Which one we'd
        recommend for the priorities you picked — and why.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={run}
          disabled={status === "loading" || matches.length === 0}
        >
          {status === "loading" ? "Thinking…" : "Run the deeper dive →"}
        </button>
      </div>
      {status === "error" && (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </section>
  );
}
