"use client";

// ── Guest Experiences guided journey ──────────────────────────────────────
// Bespoke shell because Sessions 2–4 are catalog-react / event-map / brief
// flows that the schema-based renderer can't express. Mirrors the visual
// language of GuidedJourneyShell (the generic schema-based shell) and
// reuses its primitives where possible (status chips, progress bar,
// celebration banner).
//
// Sessions:
//   1. Vibe form     — same fields as the schema-based form, but rendered
//                       through the shared ExperienceVibeForm component so
//                       it's identical to the workspace section.
//   2. Browse        — category-by-category walkthrough of the Explorer.
//   3. Map           — the same Experience Map as the workspace tab.
//   4. Brief         — the brief editor + things-i-cant-stop-thinking-about.
//
// Session statuses are stored in the journey state. We auto-promote a
// session to "in_progress" when its first interaction lands and the user
// explicitly locks each session in.

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import { buildRuntimeSessions } from "@/lib/guided-journey/runtime";
import {
  setSessionStatus,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import type { RuntimeSession } from "@/lib/guided-journey/types";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
  statusColors,
} from "@/components/workspace/shared/guided-journey/styles";
import { ExperienceVibeForm } from "./ExperienceVibeForm";
import { ExperienceExplorer, ReactionCounter } from "./ExperienceExplorer";
import { ExperienceMap } from "./ExperienceMap";
import { ExperienceBriefEditor } from "./ExperienceBriefEditor";
import { CantStopThinkingAbout } from "./CantStopThinkingAbout";

const CATEGORY = "guest_experiences" as const;

export function GuestExperiencesGuidedJourney({
  onSwitchToManual,
}: {
  onSwitchToManual: () => void;
}) {
  const schema = CATEGORY_SCHEMAS[CATEGORY];
  const intro = JOURNEY_INTROS[CATEGORY];
  const [state, update] = useCategoryJourneyState(CATEGORY);

  // Pull store-derived data so we can promote Sessions 2–4 to "in_progress"
  // automatically once the user has interacted (reactions / event toggles /
  // brief edits).
  const cards = useGuestExperiencesStore((s) => s.cards);
  const briefText = useGuestExperiencesStore((s) => s.brief);
  const inspiration = useGuestExperiencesStore((s) => s.inspirationEntries);

  const reactionCount = useMemo(
    () => Object.values(cards).filter((c) => c.reaction !== null).length,
    [cards],
  );
  const lovedCount = useMemo(
    () => Object.values(cards).filter((c) => c.reaction === "love").length,
    [cards],
  );
  const assignmentCount = useMemo(
    () => Object.values(cards).filter((c) => c.event_assignments.length > 0).length,
    [cards],
  );

  // Compute runtime sessions from the schema, then patch the derived
  // statuses so progress / completion stays accurate even though Sessions
  // 2–4 don't have schema fields to derive `hasData` from.
  const sessions = useMemo(() => {
    const base = buildRuntimeSessions(schema, state);
    return base.map((s) => {
      if (s.status === "completed") return s;
      if (s.key === "experience_browse") {
        if (reactionCount > 0)
          return { ...s, status: "in_progress", hasData: true } as RuntimeSession;
      }
      if (s.key === "experience_map") {
        if (assignmentCount > 0)
          return { ...s, status: "in_progress", hasData: true } as RuntimeSession;
      }
      if (s.key === "experience_brief") {
        if (briefText.trim().length > 0 || inspiration.length > 0)
          return { ...s, status: "in_progress", hasData: true } as RuntimeSession;
      }
      return s;
    });
  }, [schema, state, reactionCount, assignmentCount, briefText, inspiration.length]);

  const completed = sessions.filter((s) => s.status === "completed").length;
  const next = sessions.find((s) => s.status !== "completed");
  const allDone = sessions.length > 0 && !next;

  const [openKey, setOpenKey] = useState<string | null>(next?.key ?? sessions[0]?.key ?? null);

  const markComplete = useCallback(
    (key: string) => {
      update((s) => setSessionStatus(s, key, "completed"));
      const after = sessions.find(
        (sess) =>
          sess.index > (sessions.find((x) => x.key === key)?.index ?? 0) &&
          sess.status !== "completed",
      );
      setOpenKey(after?.key ?? null);
    },
    [update, sessions],
  );

  const reopen = useCallback(
    (key: string) => {
      update((s) => setSessionStatus(s, key, "in_progress"));
      setOpenKey(key);
    },
    [update],
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
        <JourneyIntro
          allDone={allDone}
          intro={intro}
          onSwitchToManual={onSwitchToManual}
        />

        {allDone ? (
          <CelebrationBanner
            sessions={sessions}
            onReadBrief={() => setOpenKey("experience_brief")}
            onSwitchToManual={onSwitchToManual}
          />
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
              session={session}
              expanded={openKey === session.key}
              onToggle={() =>
                setOpenKey((cur) => (cur === session.key ? null : session.key))
              }
              onMarkComplete={() => markComplete(session.key)}
              onReopen={() => reopen(session.key)}
              isFinal={session.index === sessions.length}
            >
              <SessionBody
                sessionKey={session.key}
                lovedCount={lovedCount}
                onAdvance={() => markComplete(session.key)}
              />
            </SessionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Session bodies ──────────────────────────────────────────────────────

function SessionBody({
  sessionKey,
  lovedCount,
  onAdvance,
}: {
  sessionKey: string;
  lovedCount: number;
  onAdvance: () => void;
}) {
  if (sessionKey === "experience_vibe") {
    return <ExperienceVibeForm variant="guided" />;
  }
  if (sessionKey === "experience_browse") {
    return (
      <div className="space-y-4">
        <ReactionCounter />
        <ExperienceExplorer mode="guided" onComplete={onAdvance} />
      </div>
    );
  }
  if (sessionKey === "experience_map") {
    if (lovedCount === 0) {
      return (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-6 py-10 text-center text-[13px] text-ink-muted">
          You haven't loved anything yet. Hop back to the previous session and
          react to a few experiences — they'll show up here by event.
        </div>
      );
    }
    return <ExperienceMap />;
  }
  if (sessionKey === "experience_brief") {
    return (
      <div className="space-y-8">
        <ExperienceBriefEditor variant="guided" />
        <CantStopThinkingAbout variant="guided" />
      </div>
    );
  }
  return null;
}

// ─── The remaining UI pieces are local copies of GuidedJourneyShell's
//     visual primitives, simplified for this category. We don't share the
//     exact components because that file expects schema-driven session
//     bodies (FieldRenderer + auto-draft). Keeping the visuals here also
//     lets us tweak the language for guest experiences specifically.

function JourneyIntro({
  allDone,
  intro,
  onSwitchToManual,
}: {
  allDone: boolean;
  intro: { heading: string; altHeading: string; subtext: string };
  onSwitchToManual: () => void;
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
          ✦  Your guided journey  ✦
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
            ? "Every session is complete. You can revisit any of them, or switch to the full workspace to refine the details."
            : `${intro.subtext} Take them one at a time — you can always switch to the full workspace if you'd rather browse it all yourself.`}
        </p>
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={onSwitchToManual}
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
            Skip the journey — I'll fill it in myself →
          </button>
        </div>
      </div>
    </section>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
  onMarkComplete,
  onReopen,
  isFinal,
  children,
}: {
  session: RuntimeSession;
  expanded: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
  onReopen: () => void;
  isFinal: boolean;
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
        <SessionNumber session={session} accent={colors.accent} />
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
        <StatusPill status={session.status} accent={colors.label} />
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
          <SessionFooter
            status={session.status}
            isFinal={isFinal}
            onMarkComplete={onMarkComplete}
            onReopen={onReopen}
          />
        </div>
      )}
    </article>
  );
}

function SessionNumber({
  session,
  accent,
}: {
  session: RuntimeSession;
  accent: string;
}) {
  const isComplete = session.status === "completed";
  return (
    <span
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        backgroundColor: isComplete ? accent : C.paper,
        border: `1.5px solid ${accent}`,
        color: isComplete ? C.paper : accent,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_SERIF,
        fontSize: 18,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {isComplete ? <ThinCheck size={16} stroke={C.paper} /> : session.index}
    </span>
  );
}

function StatusPill({
  status,
  accent,
}: {
  status: "not_started" | "in_progress" | "completed";
  accent: string;
}) {
  const label =
    status === "completed"
      ? "Complete"
      : status === "in_progress"
        ? "In progress"
        : "Not started";
  return (
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
        color: accent,
        flexShrink: 0,
      }}
    >
      {status === "completed" && <ThinCheck size={11} stroke={accent} />}
      {label}
    </span>
  );
}

function ThinCheck({ size = 12, stroke }: { size?: number; stroke: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3.5 8.5 L6.75 11.75 L12.5 4.75"
        stroke={stroke}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SessionFooter({
  status,
  isFinal,
  onMarkComplete,
  onReopen,
}: {
  status: "not_started" | "in_progress" | "completed";
  isFinal: boolean;
  onMarkComplete: () => void;
  onReopen: () => void;
}) {
  return (
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
        {status === "completed"
          ? isFinal
            ? "Brief locked in. Reopen any time to refine it."
            : "Locked in. Reopen any time to refine it."
          : status === "in_progress"
            ? isFinal
              ? "Read it back. When the brief sounds like you, lock it in."
              : "When this feels right, lock it in and move to the next session."
            : "Touch anything above to start — we'll save as you go."}
      </div>

      {status !== "completed" && (
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
            transition: "color 0.15s, border-color 0.15s",
            flexShrink: 0,
          }}
        >
          {isFinal ? "Lock in my brief →" : "I'm happy with this →"}
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
            transition: "color 0.15s",
            flexShrink: 0,
          }}
        >
          Edit this section
        </button>
      )}
    </div>
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

function CelebrationBanner({
  sessions,
  onReadBrief,
  onSwitchToManual,
}: {
  sessions: RuntimeSession[];
  onReadBrief: () => void;
  onSwitchToManual: () => void;
}) {
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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: FONT_SANS,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.sage,
          marginBottom: 8,
        }}
      >
        <ThinCheck size={11} stroke={C.sage} />
        All {sessions.length} sessions complete
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
        Your experience plan is ready ✨
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
        View your brief, tweak anything, or share it with your planner.
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
          onClick={onReadBrief}
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
          Read your brief →
        </button>
        <button
          type="button"
          onClick={onSwitchToManual}
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
          Open full workspace
        </button>
      </div>
    </section>
  );
}
