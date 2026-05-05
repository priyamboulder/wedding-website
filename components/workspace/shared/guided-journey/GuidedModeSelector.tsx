"use client";

// Mode pill: "Guide me through it" vs "I'll fill it in myself".
// Mirrors PhotographyModeSelector's design but reads its session count and
// estimated minutes from the category schema + intro registry.

import type { CSSProperties } from "react";
import { JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import type { CategoryKey, GuidedMode } from "@/lib/guided-journey/types";
import { C, FONT_MONO, FONT_SANS } from "./styles";

export function GuidedModeSelector({
  category,
  mode,
  onChange,
}: {
  category: CategoryKey;
  mode: GuidedMode;
  onChange: (m: GuidedMode) => void;
}) {
  const schema = CATEGORY_SCHEMAS[category];
  const intro = JOURNEY_INTROS[category];
  const sessionCount = schema.sessions.length;
  const guidedSub = `${sessionCount} session${sessionCount === 1 ? "" : "s"} · ~${intro.totalMinutes} min`;

  return (
    <div
      role="radiogroup"
      aria-label="Workspace mode"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        backgroundColor: C.champagnePale,
        border: `1px solid ${C.champagne}`,
        borderRadius: 999,
      }}
    >
      <ModePill
        active={mode === "guided"}
        label="Guide me through it"
        sub={guidedSub}
        onClick={() => onChange("guided")}
      />
      <ModePill
        active={mode === "manual"}
        label="I'll fill it in myself"
        sub="Full workspace"
        onClick={() => onChange("manual")}
      />
    </div>
  );
}

function ModePill({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      style={pillButtonStyle(active)}
      title={sub}
    >
      <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 500 }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: active ? C.rosePale : C.faint,
          marginLeft: 8,
        }}
      >
        {sub}
      </span>
    </button>
  );
}

function pillButtonStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 18px",
    border: "none",
    borderRadius: 999,
    backgroundColor: active ? C.rose : "transparent",
    color: active ? C.paper : C.muted,
    cursor: "pointer",
    transition: "background-color 0.15s, color 0.15s",
  };
}
