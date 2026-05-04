"use client";

// ──────────────────────────────────────────────────────────────────────────
// SaveMatchesPrompt — soft email capture below the matches.
//
// Saves to tool_match_results via /api/tools/match/save. Goes through the
// same anonymous_token namespace as the Budget tool, so signup later
// reclaims both the saved match and any in-progress budget plan.
// ──────────────────────────────────────────────────────────────────────────

import { useState, type FormEvent } from "react";
import Link from "next/link";

import type { MatchInputs, MatchedDestination } from "@/types/match";

import styles from "./SaveMatchesPrompt.module.css";

type Props = {
  inputs: MatchInputs;
  matches: MatchedDestination[];
  anonymousToken: string | null;
  saved: boolean;
  onSaved: () => void;
};

type Status = "idle" | "submitting" | "ok" | "error";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SaveMatchesPrompt({
  inputs,
  matches,
  anonymousToken,
  saved,
  onSaved,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (saved || status === "ok") {
    return (
      <section className={styles.section}>
        <span className={styles.kicker}>sent ✿</span>
        <h3 className={styles.heading}>Saved.</h3>
        <p className={styles.body}>
          We'll email your matches and remember them on this device. Sign up
          to keep them on every device.
        </p>
        <Link href="/signup?source=match_save" className={styles.upgradeBtn}>
          Create an account →
        </Link>
      </section>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!EMAIL_RX.test(email)) {
      setErrorMsg("That email looks malformed.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/tools/match/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          anonymous_token: anonymousToken,
          inputs,
          matches: matches.map((m) => ({
            slug: m.slug,
            score: m.score,
            reasons: m.reasons,
          })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Could not save your matches.");
      }
      setStatus("ok");
      onSaved();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section className={styles.section}>
      <span className={styles.kicker}>before you go</span>
      <h3 className={styles.heading}>
        Save these <em>matches?</em>
      </h3>
      <p className={styles.body}>
        We'll email the list and your inputs. No spam — just one email so you
        can come back to this without retyping everything.
      </p>
      <form className={styles.form} onSubmit={submit} noValidate>
        <input
          type="email"
          required
          placeholder="you@somewhere.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          aria-label="Email"
        />
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Save my matches"}
        </button>
      </form>
      {status === "error" && (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </section>
  );
}
