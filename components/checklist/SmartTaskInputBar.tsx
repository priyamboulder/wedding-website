"use client";

// SmartTaskInputBar — natural-language task input for the checklist page.
//
// Slots in between the phase progress bar and the filter row. The user
// types a free-text task ("Book mehendi artist by May 15 @Ananya — Vendors")
// and we POST to /api/checklist/smart-add. The server returns a structured
// parse plus optional suggestions; the bar shows a confirmation pill, and
// on [Add] calls `onAdd` — the parent decides how to translate the parse
// into a checklist item (usually via useChecklistStore.addCustomItem).
//
// Visual language follows AICommandBar from the guest list — same border,
// gold-tan accents, sparkle icon, rotating placeholder, rounded pill. This
// is purely additive; it does not modify any existing UI.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  ArrowUp,
  Loader2,
  X,
  Check,
  Edit3,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Flag,
  Tag,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types mirror /api/checklist/smart-add response ────────────────────────

export type ParsedTaskPriority = "low" | "medium" | "high" | "critical";

export interface ParsedTaskSuggestion {
  title: string;
  deadline: string | null;
  priority: ParsedTaskPriority;
  phaseId: string | null;
  subsectionKey: string | null;
  categoryTags: string[];
}

export interface ParsedTask {
  title: string;
  deadline: string | null;
  assignee: { id: string; name: string } | null;
  priority: ParsedTaskPriority;
  phaseId: string | null;
  phaseTitle: string | null;
  subsectionKey: string | null;
  subsectionLabel: string | null;
  categoryTags: string[];
  confidence: number;
  duplicateOf: string | null;
  warnings: string[];
  suggestions: ParsedTaskSuggestion[];
}

export interface SmartTaskContext {
  today: string;
  weddingDate: string | null;
  phases: Array<{
    id: string;
    title: string;
    subsections: Array<{ key: string; label: string }>;
  }>;
  categoryTags: Array<{ slug: string; label: string }>;
  members: Array<{ id: string; name: string }>;
  events: Array<{ name: string; date: string }>;
  existingTitles: string[];
}

interface Props {
  context: SmartTaskContext;
  /** Called when the user accepts a parsed task (primary or a suggestion). */
  onAdd: (task: ParsedTask | ParsedTaskSuggestion) => void;
  /** Phase id the bar is scoped to, used as a fallback when the AI doesn't pick one. */
  fallbackPhaseId?: string;
  /** Optional placeholder override. */
  placeholders?: string[];
}

type State =
  | { kind: "idle" }
  | { kind: "thinking" }
  | { kind: "confirming"; parsed: ParsedTask; raw: string }
  | { kind: "error"; message: string };

const DEFAULT_PLACEHOLDERS = [
  "Book mehendi artist by May 15 @Priya — high priority",
  "Get sangeet choreographer quotes, due next Friday",
  "Finalize guest favors @Arjun — Gifts & Favors",
  "Compare 3 florists for mandap decor by end of month",
  "Urgent: confirm pandit muhurat times",
];

export function SmartTaskInputBar({
  context,
  onAdd,
  fallbackPhaseId,
  placeholders = DEFAULT_PLACEHOLDERS,
}: Props) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  // Track which of the parsed suggestions have already been added so we can
  // dim them after [+] without collapsing the panel mid-flow.
  const [addedSuggestionIdx, setAddedSuggestionIdx] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focused || value) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(id);
  }, [focused, value, placeholders.length]);

  const submit = useCallback(async () => {
    const input = value.trim();
    if (!input) return;
    setState({ kind: "thinking" });
    try {
      const res = await fetch("/api/checklist/smart-add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, context }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        parsed?: ParsedTask;
        error?: string;
      };
      if (!data.ok || !data.parsed) {
        setState({
          kind: "error",
          message:
            data.error ??
            "I couldn't parse that. Try \"Book mehendi artist by May 15 @Priya — high priority\".",
        });
        return;
      }
      setAddedSuggestionIdx(new Set());
      setState({ kind: "confirming", parsed: data.parsed, raw: input });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Request failed.",
      });
    }
  }, [value, context]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape") {
        setState({ kind: "idle" });
      }
    },
    [submit],
  );

  const confirmAdd = useCallback(
    (overrides: {
      deadline: string | null;
      assignee: { id: string; name: string } | null;
    }) => {
      if (state.kind !== "confirming") return;
      const p = state.parsed;
      // If the AI didn't pick a phase but the bar is scoped to one, fill it in.
      const resolvedPhaseId = p.phaseId ?? fallbackPhaseId ?? null;
      onAdd({
        ...p,
        phaseId: resolvedPhaseId,
        deadline: overrides.deadline,
        assignee: overrides.assignee,
      });
      setValue("");
      setState({ kind: "idle" });
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [state, onAdd, fallbackPhaseId],
  );

  const dismiss = useCallback(() => {
    setValue("");
    setState({ kind: "idle" });
  }, []);

  const edit = useCallback(() => {
    if (state.kind !== "confirming") return;
    setValue(state.raw);
    setState({ kind: "idle" });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [state]);

  const addSuggestion = useCallback(
    (idx: number) => {
      if (state.kind !== "confirming") return;
      const s = state.parsed.suggestions[idx];
      if (!s) return;
      const resolvedPhaseId = s.phaseId ?? fallbackPhaseId ?? null;
      onAdd({ ...s, phaseId: resolvedPhaseId });
      setAddedSuggestionIdx((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    },
    [state, onAdd, fallbackPhaseId],
  );

  return (
    <div>
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
          onChange={(e) => setValue(e.target.value.slice(0, 500))}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused
              ? "Add a task in plain English — deadline, assignee, priority auto-detected"
              : placeholders[placeholderIdx]
          }
          disabled={state.kind === "thinking"}
          className="flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted/75 focus:outline-none disabled:opacity-60"
          aria-label="Smart task input"
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
          aria-label="Parse task"
        >
          {state.kind === "thinking" ? (
            <Loader2 size={13} strokeWidth={2} className="animate-spin" />
          ) : (
            <ArrowUp size={13} strokeWidth={2} />
          )}
        </button>
      </div>

      {state.kind === "confirming" && (
        <ConfirmationPill
          parsed={state.parsed}
          fallbackPhaseTitle={
            state.parsed.phaseTitle ||
            context.phases.find((p) => p.id === fallbackPhaseId)?.title ||
            null
          }
          members={context.members}
          onConfirm={confirmAdd}
          onEdit={edit}
          onDismiss={dismiss}
          addedSuggestionIdx={addedSuggestionIdx}
          onAddSuggestion={addSuggestion}
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

// ── Confirmation pill ─────────────────────────────────────────────────────

function ConfirmationPill({
  parsed,
  fallbackPhaseTitle,
  members,
  onConfirm,
  onEdit,
  onDismiss,
  addedSuggestionIdx,
  onAddSuggestion,
}: {
  parsed: ParsedTask;
  fallbackPhaseTitle: string | null;
  members: Array<{ id: string; name: string }>;
  onConfirm: (overrides: {
    deadline: string | null;
    assignee: { id: string; name: string } | null;
  }) => void;
  onEdit: () => void;
  onDismiss: () => void;
  addedSuggestionIdx: Set<number>;
  onAddSuggestion: (idx: number) => void;
}) {
  const [editedDeadline, setEditedDeadline] = useState<string | null>(
    parsed.deadline,
  );
  const [editedAssigneeId, setEditedAssigneeId] = useState<string | null>(
    parsed.assignee?.id ?? null,
  );
  const [assignOpen, setAssignOpen] = useState(false);
  const assignWrapRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!assignOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        assignWrapRef.current &&
        !assignWrapRef.current.contains(e.target as Node)
      ) {
        setAssignOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAssignOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [assignOpen]);

  const editedAssignee = editedAssigneeId
    ? members.find((m) => m.id === editedAssigneeId) ?? null
    : null;

  const chips = useMemo(() => {
    const out: Array<{ icon: React.ReactNode; label: string; tone: "normal" | "warn" }> = [];
    if (parsed.priority !== "medium") {
      out.push({
        icon: <Flag size={11} strokeWidth={1.7} />,
        label: priorityLabel(parsed.priority),
        tone: "normal",
      });
    }
    const phaseLabel = parsed.phaseTitle || fallbackPhaseTitle;
    if (phaseLabel) {
      out.push({
        icon: <Tag size={11} strokeWidth={1.7} />,
        label: parsed.subsectionLabel ? `${phaseLabel} · ${parsed.subsectionLabel}` : phaseLabel,
        tone: "normal",
      });
    }
    return out;
  }, [parsed, fallbackPhaseTitle]);

  const lowConf = parsed.confidence < 0.7;

  return (
    <div className="mt-2 rounded-md border border-gold/30 bg-white px-4 py-3">
      <div className="mb-2 flex items-start gap-3">
        <Sparkles size={13} strokeWidth={1.7} className="mt-1 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {lowConf ? "Best guess — review before adding" : "Ready to add"}
          </p>
          <p className="text-[13px] font-medium leading-snug text-ink">{parsed.title}</p>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-2 ml-6 flex flex-wrap items-center gap-1.5">
          {chips.map((c, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                c.tone === "warn"
                  ? "border-rose-light/40 bg-rose-pale/40 text-rose"
                  : "border-gold/25 bg-gold-pale/30 text-ink-muted",
              )}
            >
              {c.icon}
              {c.label}
            </span>
          ))}
        </div>
      )}

      {parsed.duplicateOf && (
        <div className="mb-2 ml-6 flex items-start gap-1.5 rounded-md border border-amber-200/60 bg-amber-50/70 px-2 py-1 text-[11.5px] text-amber-800">
          <AlertCircle size={12} strokeWidth={1.7} className="mt-0.5 shrink-0" />
          Similar task already exists: <span className="font-medium">&ldquo;{parsed.duplicateOf}&rdquo;</span>
        </div>
      )}

      {parsed.warnings.length > 0 && (
        <ul className="mb-2 ml-6 space-y-0.5">
          {parsed.warnings.map((w, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11.5px] text-rose/90"
            >
              <AlertCircle size={11} strokeWidth={1.7} className="mt-0.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-2 ml-6 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            const el = dateInputRef.current;
            if (!el) return;
            if (typeof el.showPicker === "function") {
              try {
                el.showPicker();
                return;
              } catch {
                // Fall through to focus() if showPicker is blocked.
              }
            }
            el.focus();
            el.click();
          }}
          className={cn(
            "relative inline-flex cursor-pointer items-center gap-1 rounded-full border border-gold/25 bg-gold-pale/30 px-2 py-0.5 text-[11px] transition-colors hover:bg-gold-pale/55",
            editedDeadline ? "text-ink-muted" : "text-ink-faint",
          )}
          aria-label="Set deadline"
        >
          <Calendar size={11} strokeWidth={1.7} />
          <span>
            {editedDeadline ? formatDateLabel(editedDeadline) : "Set deadline"}
          </span>
          <input
            ref={dateInputRef}
            type="date"
            value={editedDeadline ?? ""}
            onChange={(e) => setEditedDeadline(e.target.value || null)}
            tabIndex={-1}
            className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
            aria-hidden="true"
          />
        </button>

        <div ref={assignWrapRef} className="relative">
          <button
            type="button"
            onClick={() => setAssignOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold-pale/30 px-2 py-0.5 text-[11px] transition-colors hover:bg-gold-pale/55",
              editedAssignee ? "text-ink-muted" : "text-ink-faint",
            )}
            aria-haspopup="listbox"
            aria-expanded={assignOpen}
          >
            <UserIcon size={11} strokeWidth={1.7} />
            <span>{editedAssignee?.name ?? "Assign"}</span>
          </button>
          {assignOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
            >
              {editedAssigneeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedAssigneeId(null);
                    setAssignOpen(false);
                  }}
                  className="block w-full border-b border-border/60 px-3 py-1.5 text-left text-[11.5px] text-ink-faint hover:bg-ivory-warm"
                >
                  Unassigned
                </button>
              )}
              <div className="sidebar-scroll max-h-48 overflow-y-auto py-1">
                {members.length === 0 ? (
                  <div className="px-3 py-2 text-[11.5px] italic text-ink-faint">
                    No members
                  </div>
                ) : (
                  members.map((m) => {
                    const active = editedAssigneeId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setEditedAssigneeId(m.id);
                          setAssignOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] transition-colors",
                          active
                            ? "bg-gold-pale/40 text-ink"
                            : "text-ink-muted hover:bg-ivory-warm",
                        )}
                      >
                        <span className="truncate">{m.name}</span>
                        {active && (
                          <Check
                            size={11}
                            strokeWidth={2}
                            className="shrink-0 text-gold"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ml-6 flex items-center gap-2">
        <button
          onClick={() =>
            onConfirm({
              deadline: editedDeadline,
              assignee: editedAssignee
                ? { id: editedAssignee.id, name: editedAssignee.name }
                : null,
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
        >
          <Check size={12} strokeWidth={2} />
          Add
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

      {parsed.suggestions.length > 0 && (
        <div className="mt-3 ml-6 rounded-md border border-gold/20 bg-gold-pale/10 px-3 py-2">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            You might also want to:
          </p>
          <ul className="space-y-1">
            {parsed.suggestions.map((s, i) => {
              const added = addedSuggestionIdx.has(i);
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded px-1 py-0.5 text-[12px]",
                    added ? "opacity-55" : "hover:bg-white/60",
                  )}
                >
                  <span className="flex-1 truncate text-ink">
                    {s.title}
                    {(s.deadline || s.priority !== "medium") && (
                      <span className="ml-2 text-[11px] text-ink-faint">
                        {s.deadline ? formatDateLabel(s.deadline) : null}
                        {s.deadline && s.priority !== "medium" ? " · " : null}
                        {s.priority !== "medium" ? priorityLabel(s.priority) : null}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => onAddSuggestion(i)}
                    disabled={added}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors",
                      added
                        ? "border-sage/40 bg-sage/10 text-sage"
                        : "border-gold/40 bg-white text-gold hover:bg-gold-pale/60",
                    )}
                    aria-label={added ? "Added" : `Add suggestion: ${s.title}`}
                  >
                    {added ? <Check size={11} strokeWidth={2} /> : <Plus size={11} strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function priorityLabel(p: ParsedTaskPriority): string {
  if (p === "critical") return "Critical";
  if (p === "high") return "High priority";
  if (p === "low") return "Low priority";
  return "Medium";
}

function formatDateLabel(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
