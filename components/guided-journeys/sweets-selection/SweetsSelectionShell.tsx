"use client";

// ── Sweets Selection journey shell ────────────────────────────────────────
// Bespoke shell for the Selection journey. Mirrors the editorial layout of
// LogisticsJourneyShell and OfficiantBuildShell — intro, progress bar,
// expandable session cards, completion banner — but renders the four
// custom Selection session UIs which write directly through cake-sweets-
// store and workspace-store.

import { useCallback, useMemo, useState, type ReactNode } from "react";
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
  SWEETS_SELECTION_CATEGORY,
  SWEETS_SELECTION_JOURNEY_ID,
  SWEETS_SELECTION_SESSIONS,
  type SweetsSelectionSessionDef,
  type SweetsSelectionSessionKey,
} from "@/lib/guided-journeys/sweets-selection";
import type { GuidedSessionStatus } from "@/lib/guided-journey/types";
import type { WorkspaceCategory } from "@/types/workspace";
import { useSweetsSelectionLauncher } from "@/stores/sweets-selection-launcher";
import { Send, Share2, X } from "lucide-react";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import { CakeDesignSession } from "./CakeDesignSession";
import { MithaiSpreadSession } from "./MithaiSpreadSession";
import { DessertTablesSession } from "./DessertTablesSession";
import { ServicePlanSession } from "./ServicePlanSession";

const INTRO = EXTRA_JOURNEY_INTROS["cake_sweets:selection"];

const SESSION_BODIES: Record<
  SweetsSelectionSessionKey,
  (props: { category: WorkspaceCategory; onSkipToNext?: () => void }) => React.ReactElement
> = {
  cake_design: CakeDesignSession,
  mithai_spread: MithaiSpreadSession,
  dessert_tables: DessertTablesSession,
  service_plan: ServicePlanSession,
};

export function SweetsSelectionShell({
  category,
  initialSessionKey,
}: {
  category: WorkspaceCategory;
  initialSessionKey?: SweetsSelectionSessionKey;
}) {
  const [state, update] = useCategoryJourneyState(
    SWEETS_SELECTION_CATEGORY,
    SWEETS_SELECTION_JOURNEY_ID,
  );
  const setSession = useSweetsSelectionLauncher((s) => s.setSession);
  const close = useSweetsSelectionLauncher((s) => s.close);

  const [openKey, setOpenKey] = useState<SweetsSelectionSessionKey | null>(
    initialSessionKey ?? firstIncomplete(state.sessionStatus),
  );

  const sessionStatuses = useMemo(
    () =>
      SWEETS_SELECTION_SESSIONS.map((s) => ({
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
    (key: SweetsSelectionSessionKey) => {
      update((s) => setSessionStatus(s, key, "completed"));
      const idx = SWEETS_SELECTION_SESSIONS.findIndex((s) => s.key === key);
      const next = SWEETS_SELECTION_SESSIONS.slice(idx + 1).find(
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

  const skipToNext = useCallback(
    (key: SweetsSelectionSessionKey) => {
      const idx = SWEETS_SELECTION_SESSIONS.findIndex((s) => s.key === key);
      const next = SWEETS_SELECTION_SESSIONS[idx + 1];
      if (next) {
        setOpenKey(next.key);
        setSession(next.key);
      }
    },
    [setSession],
  );

  const reopen = useCallback(
    (key: SweetsSelectionSessionKey) => {
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
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Intro allDone={allDone} onClose={close} />

        {allDone ? (
          <CompletionBanner onClose={close} />
        ) : (
          <ProgressBar
            completed={completed}
            total={sessionStatuses.length}
          />
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
                <Body
                  category={category}
                  onSkipToNext={() => skipToNext(session.key)}
                />
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
): SweetsSelectionSessionKey | null {
  for (const session of SWEETS_SELECTION_SESSIONS) {
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
          background: `linear-gradient(120deg, ${C.rosePale} 0%, transparent 65%)`,
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
              color: C.rose,
              marginBottom: 8,
            }}
          >
            ✦ Sweets selection ✦
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close selection journey"
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
            maxWidth: 620,
            lineHeight: 1.5,
          }}
        >
          {allDone
            ? "Cake spec'd, mithai picked, tables planned, service locked."
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

// ─── Completion banner (no brief) ────────────────────────────────────────

function CompletionBanner({ onClose }: { onClose: () => void }) {
  // Live counts pulled straight from the canonical store so they stay in
  // sync if the couple edits Selection from the full workspace afterwards.
  const lovedCatalogCount = useCakeSweetsStore(
    (s) =>
      Object.values(s.dessert_catalog).filter((r) => r === "love").length,
  );
  const customCount = useCakeSweetsStore(
    (s) =>
      Object.values(s.dessert_meta).filter((m) => m.custom === true).length,
  );

  const totalDesserts = lovedCatalogCount; // dessert_catalog already includes custom ids
  const customNote =
    customCount > 0 ? ` (${customCount} custom)` : "";

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
        Your dessert program is built.
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
        Cake locked · {totalDesserts} mithai item
        {totalDesserts === 1 ? "" : "s"}
        {customNote} · service plan ready
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
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
          <Send size={12} strokeWidth={2} /> Send to baker
        </button>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
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
          <Send size={12} strokeWidth={2} /> Send to mithai vendor
        </button>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
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
          <Share2 size={12} strokeWidth={2} /> Share day-of plan with planner
        </button>
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
          Open mithai tab →
        </button>
      </div>
    </section>
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
  session: SweetsSelectionSessionDef & { status: GuidedSessionStatus };
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
              maxWidth: 620,
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
                    ? "When the service plan looks right, lock it in."
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
                {isFinal ? "Lock in service plan →" : "I'm happy with this →"}
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
