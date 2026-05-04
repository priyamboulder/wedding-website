"use client";

// Grapevine session page (/grapevine/[slug]).
// Renders three modes:
//   - upcoming  → countdown panel + "Submit a Question Early" + "Remind Me"
//   - live      → header with pulsing badge, Q submission, Answered + Queue
//   - archived  → no submission; queue collapsed; reactions/upvotes still active

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import {
  PERSONA_PRESETS,
  PERSONA_TAG_MAX,
  QUESTION_TEXT_MAX,
  REACTION_ICON,
  REACTION_LABEL,
  REACTION_ORDER,
  type GrapevineAnswer,
  type GrapevineQAPair,
  type GrapevineQuestion,
  type GrapevineReactionType,
  type GrapevineSession,
} from "@/types/grapevine-ama";
import styles from "./SessionPage.module.css";

interface ApiResponse {
  session: GrapevineSession;
  answered: GrapevineQAPair[];
  queue: GrapevineQuestion[];
  userUpvotes: string[];
  userReactions: Record<string, string[]>;
}

function avatarInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatLongDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function countdown(target: string | null): string {
  if (!target) return "";
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return "Starting any moment now";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes} minutes`;
}

async function getAuthToken(): Promise<{ token: string | null; authed: boolean }> {
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    const t = data.session?.access_token ?? null;
    return { token: t, authed: !!t };
  } catch {
    return { token: null, authed: false };
  }
}

export function SessionPage({ slug }: { slug: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"answered" | "queue">("answered");
  const [toast, setToast] = useState<string | null>(null);
  const [reminderSet, setReminderSet] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  // Auth state — controls whether the question submission form renders.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: s } = await supabaseBrowser.auth.getSession();
        if (alive) setAuthed(!!s.session);
      } catch {
        if (alive) setAuthed(false);
      }
    })();
    const sub = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  // Initial fetch.
  const refresh = useCallback(async () => {
    try {
      const { token } = await getAuthToken();
      const res = await fetch(`/api/grapevine/sessions/${slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) {
        setError("Could not load this session.");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as ApiResponse;
      setData(j);
      setLoading(false);
    } catch {
      setError("Could not load this session.");
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscriptions — only for live sessions. We refresh the whole
  // page payload on each event (cheap; the session is small) rather than
  // patch local state for every realtime event.
  useEffect(() => {
    if (!data || data.session.status !== "live") return;
    const sId = data.session.id;
    const ch = supabaseBrowser
      .channel(`grapevine-ama-${sId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grapevine_ama_questions",
          filter: `session_id=eq.${sId}`,
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "grapevine_ama_answers",
          filter: `session_id=eq.${sId}`,
        },
        async (payload) => {
          const a = payload.new as GrapevineAnswer;
          const expert = data.session.expert_name;
          const preview = a.answer_text.slice(0, 60);
          flashToast(`New answer! ${expert} just answered: "${preview}…"`);
          refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grapevine_ama_upvotes",
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grapevine_ama_reactions",
        },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabaseBrowser.removeChannel(ch);
    };
  }, [data, refresh, flashToast]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.frame}>
          <p className={styles.empty}>Loading…</p>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.frame}>
          <Link href="/blog" className={styles.backLink}>
            ← The Planning Circle
          </Link>
          <p className={styles.empty}>{error ?? "Not found."}</p>
        </div>
      </div>
    );
  }

  const { session, answered, queue, userUpvotes, userReactions } = data;
  const status = session.status;

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <Link href="/blog" className={styles.backLink}>
          ← The Planning Circle
        </Link>

        <Header session={session} />

        {status === "upcoming" && (
          <UpcomingPanel
            session={session}
            authed={authed}
            reminderSet={reminderSet}
            onReminderSet={() => {
              setReminderSet(true);
              flashToast("We'll remind you when this AMA goes live.");
            }}
          />
        )}

        {(status === "ended" || status === "archived") && (
          <p className={styles.archivedNotice}>
            This session has ended. Browse the archive below — upvoting and
            reactions remain active.
          </p>
        )}

        {(status === "live" || status === "upcoming") && (
          <SubmitForm
            sessionId={session.id}
            authed={authed}
            isUpcoming={status === "upcoming"}
            onSubmitted={() => {
              flashToast("Your question is in the queue! Upvote others while you wait.");
              refresh();
            }}
          />
        )}

        {(status === "live" || status === "archived" || status === "ended") && (
          <>
            {status === "live" && (
              <div className={styles.subTabs}>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("answered")}
                  className={`${styles.subTab} ${
                    activeSubTab === "answered" ? styles.subTabActive : ""
                  }`}
                >
                  Answered ({answered.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("queue")}
                  className={`${styles.subTab} ${
                    activeSubTab === "queue" ? styles.subTabActive : ""
                  }`}
                >
                  Queue ({queue.length})
                </button>
              </div>
            )}

            {status === "live" && activeSubTab === "queue" ? (
              <QueueList
                queue={queue}
                userUpvotes={new Set(userUpvotes)}
                authed={authed}
                onMutated={refresh}
              />
            ) : (
              <AnsweredList
                answered={answered}
                userReactions={userReactions}
                authed={authed}
                onMutated={refresh}
              />
            )}
          </>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function Header({ session }: { session: GrapevineSession }) {
  const status = session.status;
  return (
    <div className={styles.header}>
      <div
        className={`${styles.headerStatus} ${
          status === "live"
            ? styles.statusLive
            : status === "upcoming"
              ? styles.statusUpcoming
              : styles.statusArchived
        }`}
      >
        {status === "live" && <span className={styles.liveDot} aria-hidden="true" />}
        {status === "live" && "Live"}
        {status === "upcoming" && "Coming Up"}
        {(status === "ended" || status === "archived") &&
          `Archived · ${formatLongDate(session.actual_end ?? session.created_at)}`}
      </div>

      <h1 className={styles.title}>{session.title}</h1>

      <div className={styles.expertCard}>
        <div className={styles.expertAvatarLg} aria-hidden="true">
          {avatarInitial(session.expert_name)}
        </div>
        <div className={styles.expertBlock}>
          <h2 className={styles.expertNameLg}>{session.expert_name}</h2>
          {session.expert_title && (
            <span className={styles.expertTitleLg}>{session.expert_title}</span>
          )}
          {session.expert_bio && (
            <p className={styles.expertBio}>{session.expert_bio}</p>
          )}
          {(session.expert_credentials ?? []).length > 0 && (
            <div className={styles.credentials}>
              {(session.expert_credentials ?? []).map((c) => (
                <span key={c} className={styles.credentialPill}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.statsRow}>
        <span>
          <strong>{session.total_questions}</strong> questions asked
        </span>
        <span>·</span>
        <span>
          <strong>{session.total_answered}</strong> answered
        </span>
      </div>
    </div>
  );
}

// ── Upcoming panel ────────────────────────────────────────────────────────

function UpcomingPanel({
  session,
  authed,
  reminderSet,
  onReminderSet,
}: {
  session: GrapevineSession;
  authed: boolean;
  reminderSet: boolean;
  onReminderSet: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(0);
  // Re-render the countdown periodically.
  useEffect(() => {
    const id = window.setInterval(() => setPulse((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const handleRemind = async () => {
    if (!authed) {
      window.location.href = "/pricing";
      return;
    }
    setBusy(true);
    const { token } = await getAuthToken();
    try {
      await fetch("/api/grapevine/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id: session.id }),
      });
      onReminderSet();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.upcomingPanel}>
      <p className={styles.countdown} key={pulse}>
        {countdown(session.scheduled_start)}
      </p>
      <p className={styles.scheduledDate}>
        {formatLongDate(session.scheduled_start)}
        {session.scheduled_start && (
          <>
            {" "}at{" "}
            {new Date(session.scheduled_start).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </>
        )}
      </p>
      <p className={styles.submitNote}>
        Questions submitted now go to the expert in advance — you can lock in
        your spot before the queue gets crowded.
      </p>
      <div className={styles.upcomingActions}>
        <button
          type="button"
          className={styles.remindButton}
          onClick={handleRemind}
          disabled={busy || reminderSet}
        >
          {reminderSet ? "Reminder set ✓" : "Remind Me"}
        </button>
      </div>
    </div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────

function SubmitForm({
  sessionId,
  authed,
  isUpcoming,
  onSubmitted,
}: {
  sessionId: string;
  authed: boolean;
  isUpcoming: boolean;
  onSubmitted: () => void;
}) {
  const [persona, setPersona] = useState(PERSONA_PRESETS[0]);
  const [months, setMonths] = useState("6");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!authed) {
    return (
      <div className={styles.submit}>
        <p className={styles.submitNote}>
          <a href="/pricing">Sign in to ask a question →</a>
          <br />
          <span style={{ opacity: 0.7 }}>You can still read along without an account.</span>
        </p>
      </div>
    );
  }

  const finalPersona = persona.includes("__ months")
    ? persona.replace("__ months", `${months || "?"} months`)
    : persona;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (text.trim().length === 0) return;
    setBusy(true);
    const { token } = await getAuthToken();
    try {
      const res = await fetch("/api/grapevine/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          session_id: sessionId,
          question_text: text,
          persona_tag: finalPersona.slice(0, PERSONA_TAG_MAX),
          is_anonymous: anonymous,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.error ?? "Could not submit question.");
      } else {
        setText("");
        setConfirm(true);
        onSubmitted();
      }
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.submit} onSubmit={submit}>
      <span className={styles.submitLabel}>
        {isUpcoming ? "Submit a question early" : "Ask a question"}
      </span>
      <div className={styles.submitRow}>
        <textarea
          className={styles.submitTextarea}
          placeholder="What do you want to ask the expert?"
          maxLength={QUESTION_TEXT_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Question"
        />
        <div className={styles.submitMeta}>
          <select
            className={styles.submitPersona}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            aria-label="Persona"
          >
            {PERSONA_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {persona.includes("__ months") && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={styles.submitMonths}
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="6"
              aria-label="Months out"
            />
          )}
          <label className={styles.submitAnonymous}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Ask Anonymously
          </label>
          <span className={styles.submitCounter}>
            {text.length}/{QUESTION_TEXT_MAX}
          </span>
        </div>
        {err && (
          <p className={styles.submitNote} style={{ color: "#A03030" }}>{err}</p>
        )}
        {confirm && (
          <p className={styles.submitConfirm}>
            Your question is in the queue! Upvote others while you wait.
          </p>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={busy || text.trim().length === 0}
        >
          {busy ? "Submitting…" : "Submit Question"}
        </button>
      </div>
    </form>
  );
}

// ── Answered list ─────────────────────────────────────────────────────────

function AnsweredList({
  answered,
  userReactions,
  authed,
  onMutated,
}: {
  answered: GrapevineQAPair[];
  userReactions: Record<string, string[]>;
  authed: boolean;
  onMutated: () => void;
}) {
  if (answered.length === 0) {
    return (
      <p className={styles.empty}>
        No answers yet — questions in the queue will appear here as the expert
        responds.
      </p>
    );
  }
  return (
    <div className={styles.qaList}>
      {answered.map((pair) => (
        <QAPairItem
          key={pair.question.id}
          pair={pair}
          userReactionTypes={
            new Set(
              (userReactions[pair.answer?.id ?? ""] ??
                []) as GrapevineReactionType[],
            )
          }
          authed={authed}
          onMutated={onMutated}
        />
      ))}
    </div>
  );
}

function QAPairItem({
  pair,
  userReactionTypes,
  authed,
  onMutated,
}: {
  pair: GrapevineQAPair;
  userReactionTypes: Set<GrapevineReactionType>;
  authed: boolean;
  onMutated: () => void;
}) {
  const { question, answer } = pair;
  return (
    <div id={`q-${question.id}`} className={styles.qaItem}>
      <div className={styles.questionCard}>
        {question.persona_tag && (
          <p className={styles.questionPersona}>{question.persona_tag}</p>
        )}
        <p className={styles.questionText}>{question.question_text}</p>
        <div className={styles.questionFooter}>
          {question.status === "pinned" && (
            <span className={styles.pinnedTag}>📌 Pinned</span>
          )}
          <span>
            {question.total_upvotes ?? question.upvote_count} upvote
            {(question.total_upvotes ?? question.upvote_count) === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {answer && (
        <div
          className={`${styles.answerCard} ${
            answer.is_highlighted ? styles.answerHighlight : ""
          }`}
        >
          {answer.is_highlighted && (
            <span className={styles.standoutBadge}>⭐ Standout Answer</span>
          )}
          <div className={styles.answerHeader}>
            <div className={styles.answerAvatar} aria-hidden="true">
              {avatarInitial(answer.answered_by ?? "?")}
            </div>
            <span className={styles.answerAuthor}>
              {answer.answered_by ?? "The expert"}
            </span>
          </div>
          <p className={styles.answerText}>{answer.answer_text}</p>
          <div className={styles.reactionRow}>
            {REACTION_ORDER.map((rt) => (
              <ReactionButton
                key={rt}
                answerId={answer.id}
                type={rt}
                count={answer.reaction_counts?.[rt] ?? 0}
                isActive={userReactionTypes.has(rt)}
                authed={authed}
                onMutated={onMutated}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReactionButton({
  answerId,
  type,
  count,
  isActive,
  authed,
  onMutated,
}: {
  answerId: string;
  type: GrapevineReactionType;
  count: number;
  isActive: boolean;
  authed: boolean;
  onMutated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [localActive, setLocalActive] = useState(isActive);
  const [localCount, setLocalCount] = useState(count);
  // Resync from props when realtime refresh runs.
  useEffect(() => {
    setLocalActive(isActive);
    setLocalCount(count);
  }, [isActive, count]);

  const handleClick = async () => {
    if (!authed) {
      window.location.href = "/pricing";
      return;
    }
    if (busy) return;
    setBusy(true);
    // Optimistic flip
    setLocalActive((p) => !p);
    setLocalCount((c) => c + (localActive ? -1 : 1));
    const { token } = await getAuthToken();
    try {
      const res = await fetch("/api/grapevine/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answer_id: answerId, reaction_type: type }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.counts && typeof j.counts[type] === "number") {
        setLocalCount(j.counts[type]);
        setLocalActive(!!j.active);
      }
      onMutated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.reactionButton} ${
        localActive ? styles.reactionButtonActive : ""
      }`}
      onClick={handleClick}
      disabled={busy}
      title={REACTION_LABEL[type]}
    >
      <span className={styles.reactionEmoji} aria-hidden="true">
        {REACTION_ICON[type]}
      </span>
      <span>{REACTION_LABEL[type]}</span>
      <span className={styles.reactionCount}>{localCount}</span>
    </button>
  );
}

// ── Queue list (live only) ────────────────────────────────────────────────

function QueueList({
  queue,
  userUpvotes,
  authed,
  onMutated,
}: {
  queue: GrapevineQuestion[];
  userUpvotes: Set<string>;
  authed: boolean;
  onMutated: () => void;
}) {
  if (queue.length === 0) {
    return <p className={styles.empty}>No questions in the queue right now.</p>;
  }
  return (
    <>
      <p className={styles.queueNote}>
        Upvote the questions you want answered! The expert sees the most
        popular ones first.
      </p>
      <div className={styles.qaList}>
        {queue.map((q) => (
          <div key={q.id} id={`q-${q.id}`} className={styles.qaItem}>
            <div className={styles.questionCard}>
              {q.persona_tag && (
                <p className={styles.questionPersona}>{q.persona_tag}</p>
              )}
              <p className={styles.questionText}>{q.question_text}</p>
              <div className={styles.questionFooter}>
                {q.status === "pinned" && (
                  <span className={styles.pinnedTag}>📌 Pinned</span>
                )}
                <UpvoteButton
                  questionId={q.id}
                  total={q.total_upvotes ?? q.upvote_count}
                  isActive={userUpvotes.has(q.id)}
                  authed={authed}
                  onMutated={onMutated}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function UpvoteButton({
  questionId,
  total,
  isActive,
  authed,
  onMutated,
}: {
  questionId: string;
  total: number;
  isActive: boolean;
  authed: boolean;
  onMutated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [localActive, setLocalActive] = useState(isActive);
  const [localTotal, setLocalTotal] = useState(total);
  useEffect(() => {
    setLocalActive(isActive);
    setLocalTotal(total);
  }, [isActive, total]);

  const handleClick = async () => {
    if (!authed) {
      window.location.href = "/pricing";
      return;
    }
    if (busy) return;
    setBusy(true);
    setLocalActive((p) => !p);
    setLocalTotal((t) => t + (localActive ? -1 : 1));
    const { token } = await getAuthToken();
    try {
      const res = await fetch("/api/grapevine/upvotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question_id: questionId }),
      });
      const j = await res.json().catch(() => ({}));
      if (typeof j?.total_upvotes === "number") {
        setLocalTotal(j.total_upvotes);
        setLocalActive(!!j.upvoted);
      }
      onMutated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.upvoteButton} ${
        localActive ? styles.upvoteButtonActive : ""
      }`}
      onClick={handleClick}
      disabled={busy}
    >
      ⬆ {localTotal}
    </button>
  );
}
