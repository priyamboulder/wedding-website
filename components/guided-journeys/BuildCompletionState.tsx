"use client";

// ── BuildCompletionState ────────────────────────────────────────────────────
// Shared closing state for every Build journey. Vision journeys end with a
// generated brief; Build journeys end with an operational completion state
// — the deliverable IS the output, so there's nothing to "compose". Instead
// this component shows summary stats and three action CTAs whose verbs are
// intentional:
//
//   • Share — implies a person  (planner, fiancé, family)
//   • Send  — implies a deliverable to a vendor
//   • Export — implies a document (PDF, calendar, manifest)
//
// Section 9 of the cross-category refinement pass codifies this pattern.
// Each Build journey provides its own labels and handlers; this component
// renders the surface uniformly across categories.

import type { ReactNode } from "react";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
} from "@/components/workspace/shared/guided-journey/styles";

// ── Props ──────────────────────────────────────────────────────────────────

export interface BuildCompletionStat {
  // Short label, e.g. "12 outfits", "4 events", "$48k tracked".
  label: string;
}

export type BuildCompletionCTAVariant = "share" | "send" | "export";

export interface BuildCompletionCTA {
  // Verbed label per section 9: "Share with Priya" / "Send to caterer" /
  // "Export PDF". The verb itself encodes intent; keep it explicit.
  label: string;
  variant: BuildCompletionCTAVariant;
  onClick: () => void;
  disabled?: boolean;
  // Subtle hint shown when disabled (e.g. "Add a planner first").
  disabledTooltip?: string;
}

export interface BuildCompletionStateProps {
  // Headline copy. Conventionally pulled from
  // EXTRA_JOURNEY_INTROS[`<category>:build`].altHeading so a category's
  // intro registry stays the single source of truth for completion copy.
  headline: string;
  // Optional tagline beneath the headline, e.g. "Every session is locked.
  // Revisit any of them, or jump to the deliverable below."
  tagline?: ReactNode;
  // Up to ~4 stats; rendered joined with " · ". Order them so the most
  // load-bearing fact reads first.
  stats: BuildCompletionStat[];
  // Three CTAs by convention but the surface accepts 1–3 — some Builds
  // genuinely have less to send, share, or export.
  ctas: BuildCompletionCTA[];
  // Optional small "Continue to <next>" link rendered at the bottom for
  // categories that have a clear next step (e.g. an auto-derived day-of
  // tab). Keep it subtle so it doesn't compete with the CTAs.
  nextRoute?: { label: string; onClick: () => void };
}

// ── Component ──────────────────────────────────────────────────────────────

export function BuildCompletionState({
  headline,
  tagline,
  stats,
  ctas,
  nextRoute,
}: BuildCompletionStateProps) {
  return (
    <section
      style={{
        position: "relative",
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: "48px 40px",
        overflow: "hidden",
      }}
    >
      {/* soft accent wash to mark this as the closing state */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(120deg, ${C.sageSoft} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.sage,
            marginBottom: 8,
          }}
        >
          ✦  Build complete  ✦
        </div>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 32,
            margin: "0 0 12px",
            color: C.ink,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
          }}
        >
          {headline}
        </h2>

        {tagline && (
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 17,
              color: C.muted,
              margin: "0 0 20px",
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            {tagline}
          </p>
        )}

        {stats.length > 0 && (
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              color: C.inkSoft,
              margin: "0 0 28px",
              letterSpacing: "0.02em",
            }}
          >
            {stats.map((s, i) => (
              <span key={i}>
                {s.label}
                {i < stats.length - 1 && (
                  <span style={{ color: C.faint, margin: "0 10px" }}>·</span>
                )}
              </span>
            ))}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {ctas.map((cta, i) => (
            <CompletionButton key={i} cta={cta} primary={i === 0} />
          ))}
        </div>

        {nextRoute && (
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              onClick={nextRoute.onClick}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                color: C.muted,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                borderBottom: `1px solid ${C.line}`,
                paddingBottom: 1,
              }}
            >
              {nextRoute.label} →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────
// First CTA renders as primary (filled rose), the rest as secondary
// (outlined). All three peer-equal in spacing — the primary fills the
// natural eye-line position, secondaries support it.

function CompletionButton({
  cta,
  primary,
}: {
  cta: BuildCompletionCTA;
  primary: boolean;
}) {
  const base = {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: 500 as const,
    letterSpacing: "0.02em",
    padding: "12px 22px",
    borderRadius: 999,
    cursor: cta.disabled ? "not-allowed" : "pointer",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
    opacity: cta.disabled ? 0.55 : 1,
  } as const;

  const primaryStyle = {
    ...base,
    background: C.rose,
    color: C.paper,
    border: `1px solid ${C.rose}`,
  } as const;

  const secondaryStyle = {
    ...base,
    background: C.paper,
    color: C.ink,
    border: `1px solid ${C.line}`,
  } as const;

  return (
    <button
      type="button"
      onClick={cta.disabled ? undefined : cta.onClick}
      disabled={cta.disabled}
      title={cta.disabled ? cta.disabledTooltip : undefined}
      style={primary ? primaryStyle : secondaryStyle}
    >
      {cta.label}
    </button>
  );
}
