"use client";

// ── VenueBuildShell ─────────────────────────────────────────────────────────
// Bespoke shell for the Venue Build journey. Pattern mirrors
// OfficiantBuildShell — single-category-with-multi-journey support is not
// yet baked into the shared GuidedJourneyShell, and Build session bodies
// read & write directly through useVenueStore (no schema-driven engine),
// so we host the cards in a sibling shell that copies the visual chrome.
//
// Persisted journey state — session statuses (not_started / in_progress /
// completed) and which session is currently expanded — lives in
// localStorage under `marigold:venue-build`. Field data itself is in
// `useVenueStore` (the canonical source).
//
// Completion state uses the shared `BuildCompletionState` from section 9
// of the cross-category refinement pass — three CTAs (Share / Send /
// Export). The Officiant shell predates that component and uses an
// inline banner; we adopt the new pattern here.

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  VENUE_BUILD_SESSIONS,
  type VenueBuildSessionKey,
} from "@/lib/guided-journeys/venue-build";
import { EXTRA_JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
  statusColors,
} from "@/components/workspace/shared/guided-journey/styles";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";
import { useVenueStore } from "@/stores/venue-store";
import { BuildCompletionState } from "@/components/guided-journeys/BuildCompletionState";
import { SpacesAndLayoutSession } from "./SpacesAndLayoutSession";
import { RulesAndRestrictionsSession } from "./RulesAndRestrictionsSession";
import { VendorPoliciesSession } from "./VendorPoliciesSession";
import { LoadInAndDayOfSession } from "./LoadInAndDayOfSession";

// ── Persisted journey state ─────────────────────────────────────────────────

// Day-of contact: not first-class on venue-store yet (per the sync layer
// note in venue-build-sync.ts), so we persist it here in journey state
// alongside session statuses. When the venue store gains a contacts slice
// the data migrates over (move-only, no UX change).
export interface DayOfContact {
  id: string;
  role: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

interface VenueBuildJourneyState {
  sessionStatus: Record<VenueBuildSessionKey, GuidedSessionStatus>;
  dayOfContacts: DayOfContact[];
  setStatus: (key: VenueBuildSessionKey, status: GuidedSessionStatus) => void;
  addDayOfContact: () => void;
  updateDayOfContact: (id: string, patch: Partial<DayOfContact>) => void;
  removeDayOfContact: (id: string) => void;
  resetAll: () => void;
}

const initialStatus = VENUE_BUILD_SESSIONS.reduce(
  (acc, s) => ({ ...acc, [s.key]: "not_started" as const }),
  {} as Record<VenueBuildSessionKey, GuidedSessionStatus>,
);

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useVenueBuildJourney = create<VenueBuildJourneyState>()(
  persist(
    (set) => ({
      sessionStatus: initialStatus,
      dayOfContacts: [],
      setStatus: (key, status) =>
        set((s) => ({ sessionStatus: { ...s.sessionStatus, [key]: status } })),
      addDayOfContact: () =>
        set((s) => ({
          dayOfContacts: [
            ...s.dayOfContacts,
            { id: uid(), role: "", name: "", phone: "" },
          ],
        })),
      updateDayOfContact: (id, patch) =>
        set((s) => ({
          dayOfContacts: s.dayOfContacts.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      removeDayOfContact: (id) =>
        set((s) => ({
          dayOfContacts: s.dayOfContacts.filter((c) => c.id !== id),
        })),
      resetAll: () =>
        set({ sessionStatus: initialStatus, dayOfContacts: [] }),
    }),
    {
      name: "marigold:venue-build",
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

const SESSION_BODIES: Record<VenueBuildSessionKey, () => React.ReactElement> = {
  spaces_and_layout: () => <SpacesAndLayoutSession />,
  rules_and_restrictions: () => <RulesAndRestrictionsSession />,
  vendor_policies: () => <VendorPoliciesSession />,
  load_in_and_day_of: () => <LoadInAndDayOfSession />,
};

export function VenueBuildShell({
  startAtSession,
  onClose,
}: {
  startAtSession?: VenueBuildSessionKey;
  onClose?: () => void;
}) {
  const intro = EXTRA_JOURNEY_INTROS["venue:build"];
  const sessionStatus = useVenueBuildJourney((s) => s.sessionStatus);
  const setStatus = useVenueBuildJourney((s) => s.setStatus);

  const sessions = useMemo(
    () =>
      VENUE_BUILD_SESSIONS.map((s) => ({
        ...s,
        status: sessionStatus[s.key] ?? "not_started",
      })),
    [sessionStatus],
  );

  const next = sessions.find((s) => s.status !== "completed");
  const allDone = !next;
  const completed = sessions.filter((s) => s.status === "completed").length;

  const [openKey, setOpenKey] = useState<VenueBuildSessionKey | null>(
    startAtSession ?? next?.key ?? null,
  );

  const markActive = useCallback(
    (key: VenueBuildSessionKey) => {
      if ((sessionStatus[key] ?? "not_started") === "not_started") {
        setStatus(key, "in_progress");
      }
    },
    [sessionStatus, setStatus],
  );

  const markComplete = useCallback(
    (key: VenueBuildSessionKey) => {
      setStatus(key, "completed");
      const idx = VENUE_BUILD_SESSIONS.findIndex((s) => s.key === key);
      const after = VENUE_BUILD_SESSIONS.slice(idx + 1).find(
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
          <CompletionState onClose={onClose} />
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
        position: "relative",
        marginBottom: 28,
        padding: "32px 36px",
        background: C.paper,
        borderRadius: 12,
        border: `1px solid ${C.line}`,
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
            ? "Every rule, every space, every policy — captured. Your downstream vendors can now read directly from this contract."
            : `${intro.subtext} Take them one at a time — every answer also lives in the full Venue workspace, so you can switch back any time.`}
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

function CompletionState({ onClose }: { onClose?: () => void }) {
  const spacesCount = useVenueStore((s) => s.spaces.length);
  const restrictionCount = useVenueStore((s) => s.logistics.restrictions.length);
  const pairingsCount = useVenueStore((s) => s.pairings.length);

  return (
    <div style={{ marginTop: 16, marginBottom: 24 }}>
      <BuildCompletionState
        headline={EXTRA_JOURNEY_INTROS["venue:build"].altHeading}
        tagline="Every policy you captured will broadcast to the workspaces that need it. Catering reads catering rules; décor reads fire policy; transportation reads parking; everyone reads load-in."
        stats={[
          { label: `${spacesCount} ${spacesCount === 1 ? "space" : "spaces"}` },
          { label: `${pairingsCount} event ${pairingsCount === 1 ? "pairing" : "pairings"}` },
          { label: `${restrictionCount} ${restrictionCount === 1 ? "restriction" : "restrictions"} on file` },
        ]}
        ctas={[
          {
            label: "Share with planner",
            variant: "share",
            onClick: () => {
              // Hook for planner share — left as call site since the planner
              // share surface lives in a separate workspace tab.
            },
          },
          {
            label: "Send rules to vendors",
            variant: "send",
            onClick: () => {
              // Hook for vendor packet — surfaces as a generated PDF +
              // email batch in the full workspace's Documents tab.
            },
          },
          {
            label: "Export venue contract summary",
            variant: "export",
            onClick: () => {
              // Hook for export — generates a one-page summary from the
              // venue store. Implemented in Documents tab.
            },
          },
        ]}
        nextRoute={
          onClose
            ? {
                label: "Back to the full workspace",
                onClick: onClose,
              }
            : undefined
        }
      />
    </div>
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
                    ? "When the load-in plan looks right, lock it in."
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
                {isFinal ? "Lock in load-in plan →" : "I'm happy with this →"}
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
