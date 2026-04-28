"use client";

// AICommandBar — natural-language input that sits above the guest list.
//
// Responsibilities:
//   1. Collect the user's prompt and POST to /api/ai/guest-command with a
//      compact snapshot (totals, households, events, guest digests).
//   2. When the server returns a mutating action, show a confirmation card
//      that summarizes the change. The parent page supplies the handlers
//      that actually perform the mutation — this component never touches
//      guest state directly.
//   3. When the server returns `answer` or `clarify`, render it inline as a
//      subtle response card (the Conversational Q&A stretch goal, which
//      shares infrastructure with mutating commands).
//
// Design language follows the existing guest list — warm off-white, ink
// text, golden-tan accents, no new patterns.

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, Loader2, X, Check, Edit3, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  GuestCommandAction,
  GuestCommandSnapshot,
} from "./types";

const ROTATING_PLACEHOLDERS = [
  'Add the Sharma family — 4 people, groom\'s side, Jaipur',
  'Who hasn\'t RSVPd for the reception?',
  'Mark all of Nana\'s cousins as confirmed',
  'How many out-of-town guests need hotel rooms?',
  'Draft RSVP follow-up messages for pending guests',
];

interface Props {
  snapshot: GuestCommandSnapshot;
  onApply: (action: GuestCommandAction) => void;
  /** Optional — when provided, the bar shows a pass-through "Draft RSVPs" quick hook. */
  onOpenDrafts?: () => void;
}

type State =
  | { kind: "idle" }
  | { kind: "thinking" }
  | { kind: "response"; action: GuestCommandAction; prompt: string }
  | { kind: "error"; message: string };

export function AICommandBar({ snapshot, onApply, onOpenDrafts }: Props) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const history = useRef<string[]>([]);
  const historyIdx = useRef<number | null>(null);

  // Rotate the placeholder every 4s when idle + unfocused.
  useEffect(() => {
    if (focused || value) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [focused, value]);

  const submit = useCallback(async () => {
    const prompt = value.trim();
    if (!prompt) return;
    history.current = [prompt, ...history.current.filter((h) => h !== prompt)].slice(0, 20);
    historyIdx.current = null;
    setState({ kind: "thinking" });
    try {
      const res = await fetch("/api/ai/guest-command", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, snapshot }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        action?: GuestCommandAction;
        error?: string;
      };
      if (!data.ok || !data.action) {
        setState({
          kind: "error",
          message:
            data.error ??
            "I'm not sure what you mean. Try \"Add Priya Mehta, bride's friend, from Mumbai\" or \"How many guests are confirmed?\"",
        });
        return;
      }
      setState({ kind: "response", action: data.action, prompt });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Request failed.",
      });
    }
  }, [value, snapshot]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      } else if (e.key === "ArrowUp" && history.current.length > 0) {
        e.preventDefault();
        const next =
          historyIdx.current == null
            ? 0
            : Math.min(history.current.length - 1, historyIdx.current + 1);
        historyIdx.current = next;
        setValue(history.current[next] ?? "");
      } else if (e.key === "ArrowDown" && historyIdx.current != null) {
        e.preventDefault();
        const next = historyIdx.current - 1;
        if (next < 0) {
          historyIdx.current = null;
          setValue("");
        } else {
          historyIdx.current = next;
          setValue(history.current[next] ?? "");
        }
      } else if (e.key === "Escape") {
        setState({ kind: "idle" });
      }
    },
    [submit],
  );

  const confirm = useCallback(() => {
    if (state.kind !== "response") return;
    onApply(state.action);
    setValue("");
    setState({ kind: "idle" });
  }, [state, onApply]);

  const edit = useCallback(() => {
    if (state.kind !== "response") return;
    setValue(state.prompt);
    setState({ kind: "idle" });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [state]);

  return (
    <div className="mb-4">
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-lg border bg-gold-pale/15 px-3 py-2 transition-all",
          focused
            ? "border-gold/50 bg-gold-pale/25 shadow-[0_0_0_3px_rgba(198,152,85,0.08)]"
            : "border-gold/25 hover:border-gold/40",
        )}
      >
        <Sparkles
          size={15}
          strokeWidth={1.7}
          className={cn(
            "shrink-0 transition-colors",
            focused ? "text-gold" : "text-gold/70",
          )}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused
              ? 'Ask AI anything — "Add the Sharma family, 4 people, groom\'s side, from Jaipur"'
              : ROTATING_PLACEHOLDERS[placeholderIdx]
          }
          disabled={state.kind === "thinking"}
          className="flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted/75 focus:outline-none disabled:opacity-60"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="rounded p-0.5 text-ink-faint hover:text-ink"
            aria-label="Clear"
          >
            <X size={13} strokeWidth={1.7} />
          </button>
        )}
        <button
          onClick={submit}
          disabled={!value.trim() || state.kind === "thinking"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all",
            value.trim() && state.kind !== "thinking"
              ? "bg-ink text-ivory hover:opacity-90"
              : "bg-ivory-warm text-ink-faint",
          )}
          aria-label="Send"
        >
          {state.kind === "thinking" ? (
            <Loader2 size={13} strokeWidth={2} className="animate-spin" />
          ) : (
            <ArrowUp size={13} strokeWidth={2} />
          )}
        </button>
      </div>

      {state.kind === "response" && (
        <ResponseCard
          action={state.action}
          onConfirm={confirm}
          onEdit={edit}
          onDismiss={() => {
            setValue("");
            setState({ kind: "idle" });
          }}
          onOpenDrafts={onOpenDrafts}
        />
      )}

      {state.kind === "error" && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-rose-light/40 bg-rose-pale/40 px-3 py-2 text-[12.5px] text-rose">
          <AlertCircle size={13} strokeWidth={1.7} className="mt-0.5 shrink-0" />
          <span className="flex-1">{state.message}</span>
          <button
            onClick={() => setState({ kind: "idle" })}
            className="rounded p-0.5 text-rose/70 hover:text-rose"
            aria-label="Dismiss"
          >
            <X size={12} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

function ResponseCard({
  action,
  onConfirm,
  onEdit,
  onDismiss,
  onOpenDrafts,
}: {
  action: GuestCommandAction;
  onConfirm: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  onOpenDrafts?: () => void;
}) {
  // Q&A response — a subtle chat-style card, no Confirm/Edit buttons.
  if (action.kind === "answer") {
    const draftIntent = /rsvp (reminder|follow[- ]?up|message)/i.test(action.text);
    return (
      <div className="mt-2 flex items-start gap-3 rounded-md border border-gold/25 bg-white px-4 py-3 text-[13px] leading-relaxed text-ink">
        <Sparkles size={13} strokeWidth={1.7} className="mt-1 shrink-0 text-gold" />
        <p className="flex-1 whitespace-pre-wrap">{action.text}</p>
        {draftIntent && onOpenDrafts && (
          <button
            onClick={onOpenDrafts}
            className="shrink-0 rounded-md border border-gold/40 bg-gold-pale/40 px-3 py-1 text-[11.5px] font-medium text-saffron hover:bg-gold-pale/60"
          >
            Draft messages
          </button>
        )}
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-ink-faint hover:text-ink"
          aria-label="Dismiss"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  if (action.kind === "clarify") {
    return (
      <div className="mt-2 flex items-start gap-3 rounded-md border border-gold/25 bg-white px-4 py-3 text-[13px] text-ink">
        <Sparkles size={13} strokeWidth={1.7} className="mt-1 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            I need a little more info
          </p>
          <p className="leading-relaxed">{action.question}</p>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-md bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory hover:opacity-90"
        >
          Refine
        </button>
      </div>
    );
  }

  if (action.kind === "error") {
    return (
      <div className="mt-2 flex items-start gap-3 rounded-md border border-rose-light/40 bg-rose-pale/40 px-4 py-3 text-[12.5px] text-rose">
        <AlertCircle size={13} strokeWidth={1.7} className="mt-0.5 shrink-0" />
        <p className="flex-1 leading-relaxed">{action.message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-rose/70 hover:text-rose"
          aria-label="Dismiss"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  // Mutating action — confirmation card.
  const bullets = actionBullets(action);
  return (
    <div className="mt-2 rounded-md border border-gold/30 bg-white px-4 py-3">
      <div className="mb-2 flex items-start gap-3">
        <Sparkles size={13} strokeWidth={1.7} className="mt-1 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Ready to apply
          </p>
          <p className="text-[13px] leading-relaxed text-ink">{action.summary}</p>
        </div>
      </div>
      {bullets.length > 0 && (
        <ul className="mb-3 ml-6 list-disc space-y-0.5 text-[12px] text-ink-muted">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      <div className="ml-6 flex items-center gap-2">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
        >
          <Check size={12} strokeWidth={2} />
          Confirm
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
        >
          <Edit3 size={12} strokeWidth={1.7} />
          Edit
        </button>
        <button
          onClick={onDismiss}
          className="ml-auto rounded p-1 text-ink-faint hover:text-ink"
          aria-label="Dismiss"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function actionBullets(action: GuestCommandAction): string[] {
  switch (action.kind) {
    case "add_household": {
      const b: string[] = [];
      b.push(`${action.household.displayName} (${sideLabel(action.household.side)})`);
      b.push(`Addressed as "${action.household.addressing}"`);
      if (action.household.members.length > 0) {
        b.push(
          `${action.household.members.length} member${action.household.members.length === 1 ? "" : "s"}: ${action.household.members.map((m) => `${m.firstName} ${m.lastName}`).join(", ")}`,
        );
      }
      if (action.household.invitedEvents.length > 0) {
        b.push(`Invited to ${action.household.invitedEvents.length} event${action.household.invitedEvents.length === 1 ? "" : "s"}`);
      }
      if (action.household.city) {
        b.push(`${action.household.city}${action.household.outOfTown ? " · out of town" : ""}`);
      }
      return b;
    }
    case "update_guests": {
      const b: string[] = [];
      b.push(`Affects ${action.guestIds.length} guest${action.guestIds.length === 1 ? "" : "s"}`);
      for (const [k, v] of Object.entries(action.patch)) {
        if (Array.isArray(v)) {
          b.push(`${k}: ${v.join(", ")}`);
        } else if (v != null) {
          b.push(`${k} → ${v}`);
        }
      }
      return b;
    }
    case "set_rsvp":
      return [
        `Set RSVP to "${action.status}" for ${action.guestIds.length} guest${action.guestIds.length === 1 ? "" : "s"}`,
        action.eventIds.length > 0
          ? `Events: ${action.eventIds.join(", ")}`
          : "Across all invited events",
      ];
    case "toggle_invitation":
      return [
        `${action.add ? "Invite" : "Uninvite"} ${action.guestIds.length} guest${action.guestIds.length === 1 ? "" : "s"}`,
        `Events: ${action.eventIds.join(", ")}`,
      ];
    default:
      return [];
  }
}

function sideLabel(side: "bride" | "groom" | "mutual"): string {
  if (side === "bride") return "Bride's side";
  if (side === "groom") return "Groom's side";
  return "Mutual";
}
