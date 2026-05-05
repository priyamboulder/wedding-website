"use client";

// ─────────────────────────────────────────────────────────────────────────
// Photography — Guided Journey
//
// A progressive, editorial-feeling path that walks a couple through the
// Photography workspace one micro-session at a time. Every session writes
// to the same fields the manual workspace uses, so progress flows both
// ways: complete a session here, switch to "fill it in myself", and the
// data is already populated. Vice versa.
//
// Design language matches PhotographyCoupleWorkspace: Cormorant Garamond
// for titles, Inter/Outfit for body, ivory/champagne with rose accent for
// active states and gold for celebratory completed states.
// ─────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import {
  BriefSection,
  EventGallerySection,
  ExclusionsSection,
  GroupsTab,
  KeywordsSection,
  MoodboardSection,
  MomentsSection,
  ToneSection,
  refineBrief,
  type GuidedSessionStatus,
  type PhotoState,
} from "./PhotographyCoupleWorkspace";

type UpdateFn = (
  patch: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>),
) => void;

// ─── Palette (matches PhotographyCoupleWorkspace) ────────────────────────
// Rose/pink is the active accent, gold the completion accent.
const C = {
  ivory: "#FBF9F4",
  ivorySoft: "#FAF7F2",
  paper: "#FFFFFF",
  champagne: "#F2EDE3",
  champagnePale: "#FBFAF7",
  ink: "#1A1A1A",
  inkSoft: "#2E2E2E",
  muted: "#6B6B6B",
  faint: "#A3A3A3",
  line: "rgba(26, 26, 26, 0.08)",
  lineSoft: "rgba(26, 26, 26, 0.04)",
  rose: "#C97B63",
  roseSoft: "#F5DDD2",
  rosePale: "#FBEFE9",
  gold: "#B8860B",
  goldDeep: "#8B6508",
  goldSoft: "#F0E4C8",
  leaf: "#9CAF88",
  // In-progress accent — warm amber, sits in the same register as gold but
  // reads as "active" rather than "celebratory".
  amber: "#B45309",
  // Completed accent — muted sage olive. Luxurious, never bootstrap-green.
  sage: "#6B7F5E",
  sageSoft: "#DFE5D8",
};

const FONT_SERIF = `"Cormorant Garamond", "Playfair Display", Georgia, serif`;
const FONT_SANS = `Inter, system-ui, sans-serif`;
const FONT_MONO = `"JetBrains Mono", "Fira Code", monospace`;

// ─── Session model ───────────────────────────────────────────────────────
// Re-export the underlying status type so callers don't need to import it
// from two places.
export type SessionStatus = GuidedSessionStatus;

export interface GuidedSession {
  id: number;
  title: string;
  prompt: string;
  description: string;
  estMinutes: number;
  status: SessionStatus;
  // True when the session has any underlying data, regardless of explicit
  // status. Used to render mini-summaries on completed cards.
  hasData: boolean;
  // One-line recap of the data the couple has entered. Always derived from
  // PhotoState — shown on completed cards to remind them what they chose.
  summary: string | null;
}

// Status is explicit and stored in PhotoState.sessionStatus, set by user
// action (auto-promoted to "in_progress" on first interaction; promoted to
// "completed" only when they click "I'm happy with this"). When no explicit
// status is set yet, fall back to a data-presence check so couples who
// filled things in via the manual workspace see "in_progress" rather than a
// misleading "not_started".
export function computeSessions(state: PhotoState): GuidedSession[] {
  const definitions = sessionDefinitions(state);
  return definitions.map((d) => ({
    ...d,
    status: deriveSessionStatus(state, d.id, d.hasData),
  }));
}

function deriveSessionStatus(
  state: PhotoState,
  sessionId: number,
  hasData: boolean,
): SessionStatus {
  const explicit = state.sessionStatus?.[sessionId];
  if (explicit) return explicit;
  return hasData ? "in_progress" : "not_started";
}

interface SessionDefinition extends Omit<GuidedSession, "status"> {}

function sessionDefinitions(state: PhotoState): SessionDefinition[] {
  const styleCount = state.styleKeywords.length;
  const toneTouched = state.toneScore !== 55 || state.styleKeywords.length > 0;
  const heartCount = state.heartedInspiration.length;
  const moodCount = state.moodboard.length;
  const eventLoved = state.events.reduce(
    (n, e) => n + e.refs.filter((r) => r.reaction === "love").length,
    0,
  );
  const momentCount = state.moments.length;
  const exclusionCount = state.exclusions.length;
  const groupCount = state.groupPhotos.length;
  const vipCount = state.vips.length;
  const briefLen = state.brief.trim().length;

  return [
    {
      id: 1,
      title: "What's your photography vibe?",
      prompt: "Tap the keywords that resonate, then slide the colour & tone.",
      description:
        "We'll turn your taste into a starting palette your photographer can read in seconds.",
      estMinutes: 2,
      hasData: styleCount > 0 || toneTouched,
      summary:
        styleCount > 0
          ? `${state.styleKeywords.slice(0, 3).join(", ")} · ${toneWord(state.toneScore)}`
          : null,
    },
    {
      id: 2,
      title: "Show us what you love",
      prompt: "Heart the frames that feel like yours. Add your own pins.",
      description:
        "Inspiration travels further than words. Build a small visual library your photographer can study.",
      estMinutes: 3,
      hasData: heartCount + moodCount + eventLoved > 0,
      summary:
        heartCount + moodCount + eventLoved > 0
          ? `${heartCount} hearted · ${moodCount} pins · ${eventLoved} event refs`
          : null,
    },
    {
      id: 3,
      title: "The moments that matter",
      prompt: "List the beats and expressions you can't bear to miss.",
      description:
        "Not a shot list — your emotional input. Photographers read this first when planning the day.",
      estMinutes: 2,
      hasData: momentCount > 0 || exclusionCount > 0,
      summary:
        momentCount > 0
          ? `${momentCount} must-capture moment${momentCount === 1 ? "" : "s"}${
              exclusionCount > 0
                ? ` · ${exclusionCount} no-go${exclusionCount === 1 ? "" : "s"}`
                : ""
            }`
          : null,
    },
    {
      id: 4,
      title: "Your people",
      prompt: "Map your group photos and flag the VIPs.",
      description:
        "The #1 cause of timeline delays. Plan the combos now and the day-of runs at speed.",
      estMinutes: 2,
      hasData: groupCount > 0 || vipCount > 0,
      summary:
        groupCount > 0 || vipCount > 0
          ? `${groupCount} group${groupCount === 1 ? "" : "s"} · ${vipCount} VIP${vipCount === 1 ? "" : "s"}`
          : null,
    },
    {
      id: 5,
      title: "Your photography brief",
      prompt: "We've drafted it from your answers — read, tweak, finalise.",
      description:
        "The document your photographer reads first. It captures the feeling you want, not just the shots.",
      estMinutes: 3,
      hasData: briefLen > 0,
      summary:
        briefLen >= 80
          ? `${briefLen} characters drafted`
          : briefLen > 0
            ? "Draft started"
            : null,
    },
  ];
}

function toneWord(score: number): string {
  if (score < 33) return "Warm & golden";
  if (score < 66) return "Softly editorial";
  return "Cool & moody";
}

export function nextIncompleteSession(
  sessions: GuidedSession[],
): GuidedSession | null {
  return sessions.find((s) => s.status !== "completed") ?? null;
}

export function completionPercentage(sessions: GuidedSession[]): number {
  const done = sessions.filter((s) => s.status === "completed").length;
  return Math.round((done / sessions.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────
// GuidedJourney — top-level body component for guided mode
// ─────────────────────────────────────────────────────────────────────────
export function GuidedJourney({
  state,
  update,
  onSwitchToManual,
}: {
  state: PhotoState;
  update: UpdateFn;
  onSwitchToManual: () => void;
}) {
  const sessions = computeSessions(state);
  const completedCount = sessions.filter(
    (s) => s.status === "completed",
  ).length;
  const next = nextIncompleteSession(sessions);
  // Default-open the next incomplete session so first-time visitors land
  // on something actionable. Power users can collapse it.
  const [openId, setOpenId] = useState<number | null>(next?.id ?? null);

  const allDone = next === null;

  // Mark a session complete on the user's explicit "I'm happy with this"
  // click. Stores the timestamp so we can show "completed N days ago" in
  // the future if useful.
  const markSessionComplete = useCallback(
    (id: number) => {
      update((s) => ({
        sessionStatus: {
          ...(s.sessionStatus ?? {}),
          [id]: "completed",
        },
        sessionCompletedAt: {
          ...(s.sessionCompletedAt ?? {}),
          [id]: Date.now(),
        },
      }));
    },
    [update],
  );

  // Reopen a completed session for editing. Flips status back to
  // "in_progress" and clears the completion timestamp.
  const reopenSession = useCallback(
    (id: number) => {
      update((s) => {
        const nextCompleted = { ...(s.sessionCompletedAt ?? {}) };
        delete nextCompleted[id];
        return {
          sessionStatus: {
            ...(s.sessionStatus ?? {}),
            [id]: "in_progress",
          },
          sessionCompletedAt: nextCompleted,
        };
      });
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
        <JourneyIntro allDone={allDone} onSwitchToManual={onSwitchToManual} />

        {allDone ? (
          <CelebrationBanner
            onReadBrief={() => setOpenId(5)}
            onSwitchToManual={onSwitchToManual}
          />
        ) : (
          <JourneyProgressBar
            completed={completedCount}
            total={sessions.length}
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
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={openId === session.id}
              onToggle={() =>
                setOpenId((cur) => (cur === session.id ? null : session.id))
              }
              onMarkComplete={() => {
                markSessionComplete(session.id);
                // Auto-collapse and advance to the next incomplete session.
                const after = sessions.find(
                  (s) => s.id > session.id && s.status !== "completed",
                );
                setOpenId(after?.id ?? null);
              }}
              onReopen={() => {
                reopenSession(session.id);
                // Keep this session open so the user can edit immediately.
                setOpenId(session.id);
              }}
            >
              <SessionBody session={session} state={state} update={update} />
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
  onSwitchToManual,
}: {
  allDone: boolean;
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
          {allDone
            ? "Your photography vision, fully composed."
            : "Let's design your photography vision together."}
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
            : "Five short sessions. About twelve minutes total. Take them one at a time — you can always switch to the full workspace if you'd rather fill it in yourself."}
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

// ─── Session card ────────────────────────────────────────────────────────
function SessionCard({
  session,
  expanded,
  onToggle,
  onMarkComplete,
  onReopen,
  children,
}: {
  session: GuidedSession;
  expanded: boolean;
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
        // Use longhand so React doesn't warn when the accent / left-border
        // change as the session moves between states. The left edge is
        // thicker and uses the status accent; the rest is the standard
        // hairline (or accent when the session is currently active).
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
        <SessionNumber session={session} colors={colors} />
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
              ~{session.estMinutes} min
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
            {isComplete && session.summary ? session.summary : session.prompt}
          </p>
        </div>
        <StatusPill session={session} colors={colors} />
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
            {session.description}
          </div>
          {children}
          <SessionFooter
            session={session}
            onMarkComplete={onMarkComplete}
            onReopen={onReopen}
            finalSession={session.id === 5}
          />
        </div>
      )}
    </article>
  );
}

function SessionNumber({
  session,
  colors,
}: {
  session: GuidedSession;
  colors: ReturnType<typeof statusColors>;
}) {
  const isComplete = session.status === "completed";
  return (
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
      {isComplete ? <ThinCheck size={16} stroke={C.paper} /> : session.id}
    </span>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────
// Pure typography (no pill background) so it matches the original
// "NOT STARTED" eyebrow label. Three states:
//   • NOT STARTED  — muted stone
//   • IN PROGRESS  — warm amber
//   • COMPLETE     — sage olive, with a thin custom check
function StatusPill({
  session,
  colors,
}: {
  session: GuidedSession;
  colors: ReturnType<typeof statusColors>;
}) {
  const label =
    session.status === "completed"
      ? "Complete"
      : session.status === "in_progress"
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
        color: colors.label,
        flexShrink: 0,
      }}
    >
      {session.status === "completed" && (
        <ThinCheck size={11} stroke={colors.label} />
      )}
      {label}
    </span>
  );
}

// Thin-stroke custom checkmark — purposefully understated to keep the
// completed state feeling editorial, not todo-app-y.
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

// Palette per status:
//   not_started → muted stone (matches existing eyebrow label colour)
//   in_progress → warm amber  (#B45309 — matches the spec's text-amber-700)
//   completed   → sage olive  (#6B7F5E — luxurious, never bootstrap-green)
function statusColors(status: SessionStatus) {
  if (status === "completed") {
    return {
      accent: C.sage,
      label: C.sage,
    };
  }
  if (status === "in_progress") {
    return {
      accent: C.amber,
      label: C.amber,
    };
  }
  return {
    accent: C.faint,
    label: C.muted,
  };
}

// ─── Per-session body — wires existing sections by session number ────────
// Any update routed through `wrappedUpdate` auto-promotes the session to
// "in_progress" on first interaction, and flips a "completed" session back
// to "in_progress" if the couple keeps editing it. The status fields are
// merged into the same patch as the data change so we get a single
// React render and a single localStorage write.
function SessionBody({
  session,
  state,
  update,
}: {
  session: GuidedSession;
  state: PhotoState;
  update: UpdateFn;
}) {
  const wrappedUpdate: UpdateFn = useCallback(
    (patch) => {
      update((s) => {
        const baseUpdate =
          typeof patch === "function" ? patch(s) : patch;
        const current = s.sessionStatus?.[session.id];
        if (current === "in_progress") return baseUpdate;
        return {
          ...baseUpdate,
          sessionStatus: {
            ...(s.sessionStatus ?? {}),
            [session.id]: "in_progress",
          },
        };
      });
    },
    [update, session.id],
  );

  if (session.id === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <KeywordsSection
          selected={state.styleKeywords}
          onChange={(k) => wrappedUpdate({ styleKeywords: k })}
        />
        <ToneSection
          score={state.toneScore}
          onChange={(v) => wrappedUpdate({ toneScore: v })}
        />
      </div>
    );
  }

  if (session.id === 2) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <MoodboardSection
          images={state.moodboard}
          activeTag={state.activeMoodTag}
          setActiveTag={(t) => wrappedUpdate({ activeMoodTag: t })}
          onAdd={(img) =>
            wrappedUpdate((s) => ({ moodboard: [...s.moodboard, img] }))
          }
          onUpdate={(id, patch) =>
            wrappedUpdate((s) => ({
              moodboard: s.moodboard.map((m) =>
                m.id === id ? { ...m, ...patch } : m,
              ),
            }))
          }
          onRemove={(id) =>
            wrappedUpdate((s) => ({
              moodboard: s.moodboard.filter((m) => m.id !== id),
            }))
          }
        />
        <EventGallerySection
          events={state.events}
          onUpdate={(events) => wrappedUpdate({ events })}
        />
      </div>
    );
  }

  if (session.id === 3) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <MomentsSection
          moments={state.moments}
          onChange={(m) => wrappedUpdate({ moments: m })}
        />
        <ExclusionsSection
          open={state.exclusionsOpen}
          setOpen={(o) => wrappedUpdate({ exclusionsOpen: o })}
          items={state.exclusions}
          onChange={(e) => wrappedUpdate({ exclusions: e })}
        />
      </div>
    );
  }

  if (session.id === 4) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <GroupsTab state={state} update={wrappedUpdate} />
      </div>
    );
  }

  // Session 5 — Brief
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <BriefDraftHelper state={state} update={wrappedUpdate} />
      <BriefSection
        brief={state.brief}
        onChange={(v) => wrappedUpdate({ brief: v })}
        onRefine={() =>
          wrappedUpdate({
            brief: refineBrief(
              state.brief,
              state.styleKeywords,
              state.toneScore,
            ),
          })
        }
      />
    </div>
  );
}

// ─── Session 5 helper — pre-populate brief from earlier sessions ─────────
// On first visit to Session 5, the textarea is empty even though we have
// great signal from sessions 1-3. This block surfaces an obvious "draft it
// for me" pathway that uses the existing refineBrief() helper.
function BriefDraftHelper({
  state,
  update,
}: {
  state: PhotoState;
  update: UpdateFn;
}) {
  if (state.brief.trim().length > 0) return null;

  const heartCount = state.heartedInspiration.length;
  const eventLoved = state.events.reduce(
    (n, e) => n + e.refs.filter((r) => r.reaction === "love").length,
    0,
  );
  const cues = [
    state.styleKeywords.length > 0
      ? `${state.styleKeywords.slice(0, 4).join(" · ")}`
      : null,
    `${toneWord(state.toneScore).toLowerCase()} palette`,
    state.moments.length > 0
      ? `${state.moments.length} must-capture moment${state.moments.length === 1 ? "" : "s"}`
      : null,
    heartCount + eventLoved > 0
      ? `${heartCount + eventLoved} hearted reference${heartCount + eventLoved === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div
      style={{
        border: `1px dashed ${C.roseSoft}`,
        backgroundColor: C.rosePale,
        borderRadius: 6,
        padding: "18px 22px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.rose,
          marginBottom: 6,
        }}
      >
        ✨ We can draft this for you
      </div>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 16,
          color: C.inkSoft,
          margin: "0 0 12px",
          lineHeight: 1.5,
          maxWidth: 580,
        }}
      >
        Based on {cues.length > 0 ? cues.join(" · ") : "your earlier answers"},
        we'll write a starting brief you can edit. Nothing's locked.
      </p>
      <button
        type="button"
        onClick={() =>
          update({
            brief: refineBrief(
              state.brief,
              state.styleKeywords,
              state.toneScore,
            ),
          })
        }
        style={{
          padding: "9px 18px",
          backgroundColor: C.rose,
          color: C.paper,
          border: "none",
          borderRadius: 4,
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          fontWeight: 500,
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        Draft my brief →
      </button>
    </div>
  );
}

// ─── Session footer ──────────────────────────────────────────────────────
// Footer for each expanded session. Renders one of three affordances:
//   not_started → soft hint, no button (any input flips status)
//   in_progress → "I'm happy with this →" (explicit completion)
//   completed   → "Edit this section" link (reopens for edits)
function SessionFooter({
  session,
  onMarkComplete,
  onReopen,
  finalSession,
}: {
  session: GuidedSession;
  onMarkComplete: () => void;
  onReopen: () => void;
  finalSession?: boolean;
}) {
  const status = session.status;
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
          ? finalSession
            ? "Brief locked in. Reopen any time to refine it."
            : "Locked in. Reopen any time to refine it."
          : status === "in_progress"
            ? finalSession
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
          onMouseEnter={(e) => {
            e.currentTarget.style.color = C.ink;
            e.currentTarget.style.borderColor = C.ink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = C.inkSoft;
            e.currentTarget.style.borderColor = C.muted;
          }}
        >
          {finalSession ? "Lock in my brief →" : "I'm happy with this →"}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.color = C.muted;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = C.faint;
          }}
        >
          Edit this section
        </button>
      )}
    </div>
  );
}

// ─── Progress bar — between intro and session list ───────────────────────
// Thin, single-pixel rule with a champagne→rose gradient fill. Animates
// width on completion change. Sized to feel like an editorial hairline,
// not a chunky SaaS progress widget.
function JourneyProgressBar({
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

// ─── Celebration banner — replaces progress bar when all 5 are done ──────
function CelebrationBanner({
  onReadBrief,
  onSwitchToManual,
}: {
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
        All five sessions complete
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
        Your photography brief is ready ✨
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
        View it, tweak it, or share it with your photographer.
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

// ─────────────────────────────────────────────────────────────────────────
// Sub-header: mode pill + nudge banner
// ─────────────────────────────────────────────────────────────────────────
export function PhotographyModeSelector({
  mode,
  onChange,
}: {
  mode: "guided" | "manual";
  onChange: (m: "guided" | "manual") => void;
}) {
  const opts: Array<{ id: "guided" | "manual"; label: string; sub: string }> = [
    { id: "guided", label: "Guide me through it", sub: "5 sessions · ~12 min" },
    { id: "manual", label: "I'll fill it in myself", sub: "Full workspace" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Photography workspace mode"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        backgroundColor: C.champagnePale,
        border: `1px solid ${C.champagne}`,
        borderRadius: 999,
      }}
    >
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            style={pillButtonStyle(active)}
            title={o.sub}
          >
            <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 500 }}>
              {o.label}
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
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
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

// ─────────────────────────────────────────────────────────────────────────
// Progress indicator — fits next to the budget badge in the header
// ─────────────────────────────────────────────────────────────────────────
export function PhotographyProgressIndicator({
  pct,
  completed,
  total,
}: {
  pct: number;
  completed: number;
  total: number;
}) {
  const size = 30;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      title={`Photography vision: ${completed} of ${total} sessions complete (${pct}%)`}
      aria-label={`Photography vision: ${completed} of ${total} sessions complete`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "5px 12px 5px 6px",
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        backgroundColor: C.paper,
      }}
    >
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.line}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.rose}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 8.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.faint,
          }}
        >
          Vision
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {completed}/{total}
        </span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Gentle nudge banner — shown when a couple returns with incomplete work
// ─────────────────────────────────────────────────────────────────────────
export function PhotographyNudgeBanner({
  session,
  onTakeMeThere,
  onDismiss,
}: {
  session: GuidedSession;
  onTakeMeThere: () => void;
  onDismiss: () => void;
}) {
  const copy = nudgeCopyFor(session);
  return (
    <div
      role="status"
      style={{
        marginTop: 14,
        backgroundColor: C.rosePale,
        border: `1px solid ${C.roseSoft}`,
        borderRadius: 6,
        padding: "10px 14px 10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        aria-hidden
        style={{
          color: C.rose,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        ✦
      </span>
      <span
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: C.inkSoft,
          flex: 1,
          lineHeight: 1.45,
        }}
      >
        {copy}
      </span>
      <button
        type="button"
        onClick={onTakeMeThere}
        style={{
          padding: "6px 12px",
          backgroundColor: C.rose,
          color: C.paper,
          border: "none",
          borderRadius: 4,
          fontFamily: FONT_SANS,
          fontSize: 11.5,
          fontWeight: 500,
          letterSpacing: "0.04em",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Take me there →
      </button>
      <button
        type="button"
        onClick={onDismiss}
        title="Dismiss"
        style={{
          background: "transparent",
          border: "none",
          color: C.muted,
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}

function nudgeCopyFor(session: GuidedSession): string {
  switch (session.id) {
    case 1:
      return `You haven't shared your photography vibe yet — ${session.estMinutes} min to spark it?`;
    case 2:
      return `No favourites yet — ${session.estMinutes} min to heart a few frames?`;
    case 3:
      return `You haven't told us about the moments that matter — ${session.estMinutes} min to knock it out?`;
    case 4:
      return `You haven't told us about group photos yet — ${session.estMinutes} min to knock it out?`;
    case 5:
      return `Your brief is the document your photographer reads first — ${session.estMinutes} min to draft it?`;
    default:
      return `Pick up where you left off — ${session.estMinutes} min.`;
  }
}
