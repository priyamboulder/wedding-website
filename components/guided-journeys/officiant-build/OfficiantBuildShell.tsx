"use client";

// ── OfficiantBuildShell ─────────────────────────────────────────────────────
// Bespoke shell for the Officiant Build journey. The shared
// `<GuidedJourneyShell />` is single-journey-per-category and uses schema-
// driven FieldRenderer bodies — Build's sessions read & write directly
// through `usePanditStore`, so we host them in a sibling shell that mimics
// the visual language without depending on the schema engine.
//
// Persisted journey state — session statuses (not_started / in_progress /
// completed) and which session is currently expanded — lives in
// localStorage under `marigold:officiant-build`. Field data itself is in
// `usePanditStore` (the canonical source).

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  OFFICIANT_BUILD_SESSIONS,
  type OfficiantBuildSessionKey,
} from "@/lib/guided-journeys/officiant-build";
import { EXTRA_JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF, statusColors } from "@/components/workspace/shared/guided-journey/styles";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";
import { RitualsWalkthroughSession } from "./RitualsWalkthroughSession";
import { FamilyRolesSession } from "./FamilyRolesSession";
import { SamagriReviewSession } from "./SamagriReviewSession";
import { CeremonyLogisticsSession } from "./CeremonyLogisticsSession";
import { usePanditStore } from "@/stores/pandit-store";

// ── Persisted journey state ─────────────────────────────────────────────────

interface BuildJourneyState {
  sessionStatus: Record<OfficiantBuildSessionKey, GuidedSessionStatus>;
  setStatus: (key: OfficiantBuildSessionKey, status: GuidedSessionStatus) => void;
  resetAll: () => void;
}

const initialStatus = OFFICIANT_BUILD_SESSIONS.reduce(
  (acc, s) => ({ ...acc, [s.key]: "not_started" as const }),
  {} as Record<OfficiantBuildSessionKey, GuidedSessionStatus>,
);

export const useOfficiantBuildJourney = create<BuildJourneyState>()(
  persist(
    (set) => ({
      sessionStatus: initialStatus,
      setStatus: (key, status) =>
        set((s) => ({ sessionStatus: { ...s.sessionStatus, [key]: status } })),
      resetAll: () => set({ sessionStatus: initialStatus }),
    }),
    {
      name: "marigold:officiant-build",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      version: 1,
    },
  ),
);

// ── Shell ──────────────────────────────────────────────────────────────────

const SESSION_BODIES: Record<OfficiantBuildSessionKey, () => React.ReactElement> =
  {
    rituals_walkthrough: () => <RitualsWalkthroughSession />,
    family_roles: () => <FamilyRolesSession />,
    samagri_review: () => <SamagriReviewSession />,
    ceremony_logistics: () => <CeremonyLogisticsSession />,
  };

export function OfficiantBuildShell({
  startAtSession,
  onClose,
}: {
  startAtSession?: OfficiantBuildSessionKey;
  onClose?: () => void;
}) {
  const intro = EXTRA_JOURNEY_INTROS["priest:build"];
  const sessionStatus = useOfficiantBuildJourney((s) => s.sessionStatus);
  const setStatus = useOfficiantBuildJourney((s) => s.setStatus);

  // Auto-derive in_progress on field activity. We don't get a save event
  // from the pandit store so we treat "non-default panditStore data" as
  // sufficient for the in_progress signal.
  const ritualsCount = usePanditStore((s) => s.rituals.length);
  const rolesCount = usePanditStore((s) => s.roles.length);
  useEffect(() => {
    // First-touch progression: when the user opens any session it becomes
    // in_progress — see `markActive` below. This effect only resets dead
    // statuses if the underlying store is empty.
    if (ritualsCount === 0) {
      setStatus("rituals_walkthrough", "not_started");
    }
    if (rolesCount === 0) {
      setStatus("family_roles", "not_started");
    }
  }, [ritualsCount, rolesCount, setStatus]);

  const sessions = useMemo(
    () =>
      OFFICIANT_BUILD_SESSIONS.map((s) => ({
        ...s,
        status: sessionStatus[s.key] ?? "not_started",
      })),
    [sessionStatus],
  );

  const next = sessions.find((s) => s.status !== "completed");
  const allDone = !next;
  const completed = sessions.filter((s) => s.status === "completed").length;

  const [openKey, setOpenKey] = useState<OfficiantBuildSessionKey | null>(
    startAtSession ?? next?.key ?? null,
  );

  const markActive = useCallback(
    (key: OfficiantBuildSessionKey) => {
      if ((sessionStatus[key] ?? "not_started") === "not_started") {
        setStatus(key, "in_progress");
      }
    },
    [sessionStatus, setStatus],
  );

  const markComplete = useCallback(
    (key: OfficiantBuildSessionKey) => {
      setStatus(key, "completed");
      const idx = OFFICIANT_BUILD_SESSIONS.findIndex((s) => s.key === key);
      const after = OFFICIANT_BUILD_SESSIONS.slice(idx + 1).find(
        (s) => (sessionStatus[s.key] ?? "not_started") !== "completed",
      );
      setOpenKey(after?.key ?? null);
    },
    [sessionStatus, setStatus],
  );

  return (
    <div
      style={{
        backgroundColor: C.ivory,
        minHeight: "100%",
        padding: "32px 40px 120px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <BuildIntro allDone={allDone} intro={intro} onClose={onClose} />

        {allDone ? (
          <CompletionBanner onClose={onClose} />
        ) : (
          <ProgressBar completed={completed} total={sessions.length} />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 8,
          }}
        >
          {sessions.map((session) => (
            <SessionCard
              key={session.key}
              index={session.index}
              title={session.title}
              subtitle={session.subtitle}
              estimatedMinutes={session.estimatedMinutes}
              status={session.status}
              expanded={openKey === session.key}
              isFinal={session.index === sessions.length}
              onToggle={() => {
                setOpenKey((cur) => (cur === session.key ? null : session.key));
                markActive(session.key);
              }}
              onMarkComplete={() => markComplete(session.key)}
              onReopen={() => {
                setStatus(session.key, "in_progress");
                setOpenKey(session.key);
              }}
            >
              {SESSION_BODIES[session.key]()}
            </SessionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function BuildIntro({
  allDone,
  intro,
  onClose,
}: {
  allDone: boolean;
  intro: { heading: string; altHeading: string; subtext: string };
  onClose?: () => void;
}) {
  return (
    <section
      style={{
        backgroundColor: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 8,
        padding: "28px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(120deg, ${C.rosePale} 0%, transparent 65%)`,
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
            color: C.rose,
            marginBottom: 8,
          }}
        >
          ✦  Build journey  ✦
        </div>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 32,
            margin: "0 0 8px",
            color: C.ink,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
          }}
        >
          {allDone ? intro.altHeading : intro.heading}
        </h2>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 17,
            color: C.muted,
            margin: 0,
            maxWidth: 620,
            lineHeight: 1.5,
          }}
        >
          {allDone
            ? "Every session is locked. You can revisit any of them, or jump to the Ceremony Script tab to see it all stitched together."
            : `${intro.subtext} Take them one at a time — every answer also lives in the full workspace, so you can switch back any time.`}
        </p>
        {onClose && (
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
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
              ← Back to the full workspace
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SessionCard({
  index,
  title,
  subtitle,
  estimatedMinutes,
  status,
  expanded,
  isFinal,
  onToggle,
  onMarkComplete,
  onReopen,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  status: GuidedSessionStatus;
  expanded: boolean;
  isFinal: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
  onReopen: () => void;
  children: ReactNode;
}) {
  const colors = statusColors(status);
  const isComplete = status === "completed";
  const isActive = status === "in_progress" || expanded;
  return (
    <article
      style={{
        backgroundColor: C.paper,
        borderTop: `1px solid ${isActive ? colors.accent : C.line}`,
        borderRight: `1px solid ${isActive ? colors.accent : C.line}`,
        borderBottom: `1px solid ${isActive ? colors.accent : C.line}`,
        borderLeft: `3px solid ${colors.accent}`,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: expanded
          ? "0 6px 22px rgba(46, 36, 24, 0.08)"
          : "0 1px 2px rgba(26, 26, 26, 0.02)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 18,
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: isComplete ? colors.accent : C.paper,
            border: `1.5px solid ${colors.accent}`,
            color: isComplete ? C.paper : colors.accent,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {isComplete ? "✓" : index}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 22,
                color: C.ink,
                margin: 0,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "-0.005em",
              }}
            >
              {title}
            </h3>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: C.faint,
              }}
            >
              ~{estimatedMinutes} min
            </span>
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: C.muted,
              margin: "4px 0 0",
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            {subtitle}
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT_SANS,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.label,
            flexShrink: 0,
          }}
        >
          {status === "completed"
            ? "Complete"
            : status === "in_progress"
              ? "In progress"
              : "Not started"}
        </span>
        <span
          aria-hidden
          style={{
            color: C.faint,
            fontSize: 16,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          ›
        </span>
      </button>
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${C.lineSoft}`,
            padding: "24px 28px 28px",
            backgroundColor: C.ivory,
          }}
        >
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 15,
              color: C.muted,
              marginBottom: 20,
              maxWidth: 620,
              lineHeight: 1.55,
            }}
          >
            {subtitle}
          </div>
          {children}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginTop: 24,
              paddingTop: 18,
              borderTop: `1px dashed ${C.lineSoft}`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: C.muted,
              }}
            >
              {status === "completed"
                ? "Locked in. Reopen any time to refine it."
                : status === "in_progress"
                  ? isFinal
                    ? "When the day-of plan looks right, lock it in."
                    : "When this feels right, lock it in and move to the next session."
                  : "Touch anything above to start — we'll save as you go."}
            </div>
            {status === "in_progress" && (
              <button
                type="button"
                onClick={onMarkComplete}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "6px 0",
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  color: C.inkSoft,
                  cursor: "pointer",
                  borderBottom: `1px solid ${C.muted}`,
                  letterSpacing: "0.02em",
                  flexShrink: 0,
                }}
              >
                {isFinal ? "Lock in day-of plan →" : "I'm happy with this →"}
              </button>
            )}
            {status === "completed" && (
              <button
                type="button"
                onClick={onReopen}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: C.faint,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                }}
              >
                Edit this section
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        margin: "28px 4px 22px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 2,
          backgroundColor: C.line,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, #C4A47C 0%, ${C.rose} 100%)`,
            borderRadius: 999,
            transition: "width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.faint,
          fontWeight: 500,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {completed} of {total} complete
      </span>
    </div>
  );
}

function CompletionBanner({ onClose }: { onClose?: () => void }) {
  const rituals = usePanditStore((s) => s.rituals);
  const roles = usePanditStore((s) => s.roles);
  const samagri = usePanditStore((s) => s.samagri);
  const included = rituals.filter((r) => r.inclusion === "yes").length;

  return (
    <section
      style={{
        marginTop: 28,
        marginBottom: 22,
        backgroundColor: C.paper,
        border: `1px solid ${C.sageSoft}`,
        borderTop: `3px solid ${C.sage}`,
        borderRadius: 6,
        padding: "26px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.sage,
          marginBottom: 8,
        }}
      >
        ✓ All 4 sessions complete
      </div>
      <h3
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 26,
          color: C.ink,
          margin: "0 0 6px",
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        Your ceremony is built.
      </h3>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: C.muted,
          margin: "0 auto 16px",
          maxWidth: 520,
          lineHeight: 1.5,
        }}
      >
        {included} ritual{included === 1 ? "" : "s"} · {roles.length} family
        role{roles.length === 1 ? "" : "s"} · {samagri.length} samagri item
        {samagri.length === 1 ? "" : "s"} · day-of logistics locked.
      </p>
      <div
        style={{
          display: "inline-flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
            // v1: Tab 3 holds the existing export flow.
          }}
          style={{
            padding: "10px 22px",
            backgroundColor: C.ink,
            color: C.ivory,
            border: "none",
            borderRadius: 4,
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Export run-of-show
        </button>
        <button
          type="button"
          onClick={() => {}}
          style={{
            padding: "10px 22px",
            backgroundColor: "transparent",
            color: C.muted,
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Share with officiant
        </button>
        <button
          type="button"
          onClick={() => {}}
          style={{
            padding: "10px 22px",
            backgroundColor: "transparent",
            color: C.muted,
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Send to planner
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 22px",
              backgroundColor: "transparent",
              color: C.muted,
              border: `1px solid ${C.line}`,
              borderRadius: 4,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            Open Ceremony Script →
          </button>
        )}
      </div>
    </section>
  );
}
