"use client";

// ── Transportation Build journey shell ────────────────────────────────────
// Renders the three-session journey overlay. Mirrors the editorial layout
// of JewelryBuildShell — intro, progress bar, expandable session cards,
// completion banner with three action CTAs.

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Send, Share2, FileDown, X } from "lucide-react";
import {
  setSessionStatus,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import { EXTRA_JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
  statusColors,
} from "@/components/workspace/shared/guided-journey/styles";
import {
  TRANSPORTATION_BUILD_CATEGORY,
  TRANSPORTATION_BUILD_JOURNEY_ID,
  TRANSPORTATION_BUILD_SESSIONS,
  type TransportationBuildSessionDef,
  type TransportationBuildSessionKey,
} from "@/lib/guided-journeys/transportation-build";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";
import type { WorkspaceCategory } from "@/types/workspace";
import { useTransportationBuildLauncher } from "@/stores/transportation-build-launcher";
import { BaraatWalkthroughSession } from "./BaraatWalkthroughSession";
import { GuestMovementMathSession } from "./GuestMovementMathSession";
import { FleetRosterSession } from "./FleetRosterSession";

const INTRO = EXTRA_JOURNEY_INTROS["transportation:build"];

const SESSION_BODIES: Record<
  TransportationBuildSessionKey,
  (props: { category: WorkspaceCategory }) => React.ReactElement
> = {
  baraat_walkthrough: ({ category }) => (
    <BaraatWalkthroughSession category={category} />
  ),
  guest_movement_math: ({ category }) => (
    <GuestMovementMathSession category={category} />
  ),
  fleet_roster: ({ category }) => <FleetRosterSession category={category} />,
};

export function TransportationBuildShell({
  category,
  initialSessionKey,
}: {
  category: WorkspaceCategory;
  initialSessionKey?: TransportationBuildSessionKey;
}) {
  const [state, update] = useCategoryJourneyState(
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );
  const setSession = useTransportationBuildLauncher((s) => s.setSession);
  const close = useTransportationBuildLauncher((s) => s.close);

  const [openKey, setOpenKey] = useState<TransportationBuildSessionKey | null>(
    initialSessionKey ?? firstIncomplete(state.sessionStatus),
  );

  const sessionStatuses = useMemo(
    () =>
      TRANSPORTATION_BUILD_SESSIONS.map((s) => ({
        ...s,
        status: (state.sessionStatus[s.key] ??
          "not_started") as GuidedSessionStatus,
      })),
    [state.sessionStatus],
  );

  const completed = sessionStatuses.filter(
    (s) => s.status === "completed",
  ).length;
  const allDone = completed === sessionStatuses.length;

  const markComplete = useCallback(
    (key: TransportationBuildSessionKey) => {
      update((s) => setSessionStatus(s, key, "completed"));
      const idx = TRANSPORTATION_BUILD_SESSIONS.findIndex((s) => s.key === key);
      const next = TRANSPORTATION_BUILD_SESSIONS.slice(idx + 1).find(
        (s) =>
          (state.sessionStatus[s.key] ?? "not_started") !== "completed",
      );
      if (next) {
        setOpenKey(next.key);
        setSession(next.key);
      } else {
        setOpenKey(null);
      }
    },
    [update, state.sessionStatus, setSession],
  );

  const reopen = useCallback(
    (key: TransportationBuildSessionKey) => {
      update((s) => setSessionStatus(s, key, "in_progress"));
      setOpenKey(key);
      setSession(key);
    },
    [update, setSession],
  );

  return (
    <div
      style={{
        backgroundColor: C.ivory,
        minHeight: "100%",
        padding: "32px 40px 120px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Intro allDone={allDone} onClose={close} />

        {allDone ? (
          <CompletionBanner onClose={close} />
        ) : (
          <ProgressBar completed={completed} total={sessionStatuses.length} />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 8,
          }}
        >
          {sessionStatuses.map((session) => {
            const Body = SESSION_BODIES[session.key];
            return (
              <SessionCard
                key={session.key}
                session={session}
                expanded={openKey === session.key}
                isFinal={session.index === sessionStatuses.length}
                onToggle={() => {
                  setOpenKey((cur) =>
                    cur === session.key ? null : session.key,
                  );
                  if (openKey !== session.key) setSession(session.key);
                }}
                onMarkComplete={() => markComplete(session.key)}
                onReopen={() => reopen(session.key)}
              >
                <Body category={category} />
              </SessionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function firstIncomplete(
  statuses: Record<string, GuidedSessionStatus>,
): TransportationBuildSessionKey | null {
  for (const session of TRANSPORTATION_BUILD_SESSIONS) {
    if ((statuses[session.key] ?? "not_started") !== "completed") {
      return session.key;
    }
  }
  return null;
}

// ─── Intro ───────────────────────────────────────────────────────────────

function Intro({
  allDone,
  onClose,
}: {
  allDone: boolean;
  onClose: () => void;
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
          background: `linear-gradient(120deg, ${C.goldSoft} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 8,
            }}
          >
            ✦ Transportation build ✦
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close build journey"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.muted,
              padding: 0,
            }}
          >
            <X size={16} strokeWidth={1.6} />
          </button>
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
          {allDone ? INTRO.altHeading : INTRO.heading}
        </h2>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 17,
            color: C.muted,
            margin: 0,
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          {allDone
            ? "Routes mapped, fleet contracted, Day-of Route Plan ready."
            : `${INTRO.subtext} Take them one at a time — your edits sync straight back into the full workspace.`}
        </p>
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
            Skip the journey — back to the full workspace →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────

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
            background: `linear-gradient(90deg, ${C.gold} 0%, ${C.rose} 100%)`,
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

// ─── Completion banner (no brief, three CTAs) ─────────────────────────────

function CompletionBanner({ onClose }: { onClose: () => void }) {
  const [state] = useCategoryJourneyState(
    TRANSPORTATION_BUILD_CATEGORY,
    TRANSPORTATION_BUILD_JOURNEY_ID,
  );

  const movement = state.formData["guest_movement_math"] as
    | { shuttle_runs?: unknown[]; airport_pickups?: unknown[]; vip_moves?: unknown[] }
    | undefined;
  const fleet = state.formData["fleet_roster"] as
    | { fleet?: unknown[] }
    | undefined;

  const shuttleCount = movement?.shuttle_runs?.length ?? 0;
  const pickupCount = movement?.airport_pickups?.length ?? 0;
  const vipCount = movement?.vip_moves?.length ?? 0;
  const fleetCount = fleet?.fleet?.length ?? 0;

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
        ✓ All 3 sessions complete
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
        Your transport plan is locked.
      </h3>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: C.muted,
          margin: "0 auto 16px",
          maxWidth: 540,
          lineHeight: 1.5,
        }}
      >
        {shuttleCount} shuttle run{shuttleCount === 1 ? "" : "s"} · {pickupCount}{" "}
        airport pickup{pickupCount === 1 ? "" : "s"} · {vipCount} VIP move
        {vipCount === 1 ? "" : "s"} · {fleetCount} vehicle
        {fleetCount === 1 ? "" : "s"} assigned.
      </p>
      <div
        style={{
          display: "inline-flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <CompletionButton primary>
          <Share2 size={12} strokeWidth={2} /> Share schedule with planner
        </CompletionButton>
        <CompletionButton>
          <Send size={12} strokeWidth={2} /> Send driver contact sheet
        </CompletionButton>
        <CompletionButton>
          <FileDown size={12} strokeWidth={2} /> Export day-of route plan
        </CompletionButton>
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
          Open day-of plan →
        </button>
      </div>
    </section>
  );
}

function CompletionButton({
  children,
  primary,
}: {
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 22px",
        backgroundColor: primary ? C.ink : "transparent",
        color: primary ? C.ivory : C.muted,
        border: primary ? "none" : `1px solid ${C.line}`,
        borderRadius: 4,
        fontFamily: FONT_SANS,
        fontSize: 12.5,
        fontWeight: 500,
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── Session card ────────────────────────────────────────────────────────

function SessionCard({
  session,
  expanded,
  isFinal,
  onToggle,
  onMarkComplete,
  onReopen,
  children,
}: {
  session: TransportationBuildSessionDef & { status: GuidedSessionStatus };
  expanded: boolean;
  isFinal: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
  onReopen: () => void;
  children: ReactNode;
}) {
  const colors = statusColors(session.status);
  const isActive = session.status === "in_progress" || expanded;
  const isComplete = session.status === "completed";
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
          {isComplete ? "✓" : session.index}
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
              }}
            >
              {session.title}
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
              ~{session.estimatedMinutes} min
            </span>
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: C.muted,
              margin: "4px 0 0",
              lineHeight: 1.5,
              maxWidth: 640,
            }}
          >
            {session.subtitle}
          </p>
        </div>
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.label,
            flexShrink: 0,
          }}
        >
          {session.status === "completed"
            ? "Complete"
            : session.status === "in_progress"
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
                minWidth: 0,
              }}
            >
              {session.status === "completed"
                ? "Locked in. Reopen any time to refine it."
                : session.status === "in_progress"
                  ? isFinal
                    ? "When the fleet looks right, lock it in."
                    : "When this feels right, lock it in and move to the next session."
                  : "Touch anything above to start — we'll save as you go."}
            </div>
            {session.status === "in_progress" && (
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
                {isFinal ? "Lock in fleet roster →" : "I'm happy with this →"}
              </button>
            )}
            {session.status === "completed" && (
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
