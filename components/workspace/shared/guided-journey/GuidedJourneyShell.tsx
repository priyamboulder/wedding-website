"use client";

// Generic guided journey shell. Renders the intro, progress bar, session
// cards (with status), and the celebration banner when every session is
// complete. The body of each session is rendered by FieldRenderer based on
// the category schema.
//
// All categories except Photography use this shell. (Photography has its
// own bespoke implementation in components/workspace/photography/GuidedJourney.tsx
// because its fields predate the schema framework.)

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { JOURNEY_INTROS } from "@/lib/guided-journey/session-config";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import {
  buildRuntimeSessions,
  draftBriefFromCues,
  nextIncompleteSession,
} from "@/lib/guided-journey/runtime";
import {
  setSessionFormPath,
  setSessionStatus,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import type {
  CategoryKey,
  RuntimeSession,
} from "@/lib/guided-journey/types";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF, statusColors } from "./styles";
import { FieldRenderer } from "./Fields";
import {
  VenueBriefSession,
  VenueDiscoverySession,
  VenuePrioritiesSession,
  VenueRequirementsSession,
} from "@/components/workspace/venue/guided/VenueGuidedSessions";

// Sessions whose body is rendered by a bespoke React component (reading
// from a category-specific store) instead of the schema-driven FieldRenderer.
// Listing a session here means the schema fields are still consulted for
// hasData / summary in the runtime, but the body UI ignores them in favour
// of the registered component.
const CUSTOM_SESSION_BODIES: Record<string, () => React.ReactElement> = {
  venue_discovery: () => <VenueDiscoverySession />,
  venue_priorities: () => <VenuePrioritiesSession />,
  venue_requirements: () => <VenueRequirementsSession />,
  // venue_brief intentionally uses the bespoke body too — reusing the same
  // VenueBriefEditor that lives on Tab 1 of the full workspace.
  venue_brief: () => <VenueBriefSession />,
};

export function GuidedJourneyShell({
  category,
  onSwitchToManual,
}: {
  category: CategoryKey;
  onSwitchToManual: () => void;
}) {
  const schema = CATEGORY_SCHEMAS[category];
  const intro = JOURNEY_INTROS[category];
  const [state, update] = useCategoryJourneyState(category);
  const sessions = useMemo(
    () => buildRuntimeSessions(schema, state),
    [schema, state],
  );
  const completed = sessions.filter((s) => s.status === "completed").length;
  const next = nextIncompleteSession(sessions);
  const [openKey, setOpenKey] = useState<string | null>(next?.key ?? null);

  const allDone = sessions.length > 0 && next === null;

  const onFieldChange = useCallback(
    (sessionKey: string) => (path: string, value: unknown) => {
      update((s) => setSessionFormPath(s, sessionKey, path, value));
    },
    [update],
  );

  const markComplete = useCallback(
    (key: string) => {
      update((s) => setSessionStatus(s, key, "completed"));
      const after = sessions.find(
        (s) =>
          s.index >
            (sessions.find((x) => x.key === key)?.index ?? 0) &&
          s.status !== "completed",
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

  const draftBrief = useCallback(
    (session: RuntimeSession) => {
      const brief = session.fields.find((f) => f.kind === "brief");
      if (!brief || brief.kind !== "brief") return;
      const seed = draftBriefFromCues(
        state,
        brief.draftCues,
        `Here's a starter for your ${intro.heading
          .replace(/^Let's /, "")
          .replace(/[.?!]+$/, "")}.`,
      );
      update((s) => setSessionFormPath(s, session.key, brief.path, seed));
    },
    [state, intro.heading, update],
  );

  if (sessions.length === 0) {
    // Defensive — would only happen if a canvas wired to a category whose
    // schema is empty (e.g. photography placeholder).
    return (
      <div
        style={{
          padding: 40,
          fontFamily: FONT_SERIF,
          color: C.muted,
          fontStyle: "italic",
        }}
      >
        Guided journey for this category is being designed.
      </div>
    );
  }

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
            onReadBrief={() => {
              const brief = sessions.find((s) => s.isBrief);
              if (brief) setOpenKey(brief.key);
            }}
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
                session={session}
                formData={state.formData[session.key] ?? {}}
                onChange={onFieldChange(session.key)}
                onDraftBrief={() => draftBrief(session)}
              />
            </SessionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Intro panel ─────────────────────────────────────────────────────────
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
            : `${intro.subtext} Take them one at a time — you can always switch to the full workspace if you'd rather fill it in yourself.`}
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

// ─── Session card ───────────────────────────────────────────────────────
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
              maxWidth: 560,
            }}
          >
            {isComplete && session.summary ? session.summary : session.subtitle}
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
            {session.subtitle}
          </div>
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

function SessionBody({
  session,
  formData,
  onChange,
  onDraftBrief,
}: {
  session: RuntimeSession;
  formData: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  onDraftBrief: () => void;
}) {
  const customBody = CUSTOM_SESSION_BODIES[session.key];
  if (customBody) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {customBody()}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {session.fields.map((field) => (
        <FieldRenderer
          key={field.path}
          field={field}
          formData={formData}
          onChange={onChange}
          onDraftBrief={onDraftBrief}
        />
      ))}
    </div>
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

// ─── Progress bar ───────────────────────────────────────────────────────
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

// ─── Celebration banner ─────────────────────────────────────────────────
function CelebrationBanner({
  sessions,
  onReadBrief,
  onSwitchToManual,
}: {
  sessions: RuntimeSession[];
  onReadBrief: () => void;
  onSwitchToManual: () => void;
}) {
  const hasBrief = sessions.some((s) => s.isBrief);
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
        Your brief is ready ✨
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
        View it, tweak it, or share it with your vendors.
      </p>
      <div
        style={{
          display: "inline-flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {hasBrief && (
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
        )}
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
