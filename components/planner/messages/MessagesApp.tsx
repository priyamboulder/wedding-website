"use client";

import { useMemo, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import {
  MESSAGE_GROUPS,
  QUICK_REPLIES,
  type Attachment,
  type ConversationGroup,
  type ConversationThread,
  type QuickReply,
  type ThreadMessage,
} from "@/lib/planner/messages";

type SendMode = "me" | "couple";

export default function MessagesApp() {
  const [activeId, setActiveId] = useState<string>("pa-elegant");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sendMode, setSendMode] = useState<SendMode>("me");
  const [showTemplates, setShowTemplates] = useState(false);

  const groups = useMemo(() => filterGroups(MESSAGE_GROUPS, query), [query]);
  const active = useMemo(() => findThread(MESSAGE_GROUPS, activeId), [activeId]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Communication Hub
          </p>
          <h1
            className="mt-2 text-[38px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Messages
          </h1>
          <p
            className="mt-1.5 text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Every conversation across every wedding — in one quiet place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] text-[#5a5a5a] hover:bg-[#F5E6D0]/55"
            style={{ borderColor: PLANNER_PALETTE.hairline }}
          >
            <span aria-hidden>⊕</span>
            New conversation
          </button>
        </div>
      </header>

      <div
        className="grid h-[calc(100vh-220px)] min-h-[640px] grid-cols-[320px_1fr] overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: PLANNER_PALETTE.hairline,
          boxShadow:
            "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.18)",
        }}
      >
        <Sidebar
          groups={groups}
          activeId={activeId}
          onSelect={setActiveId}
          query={query}
          onQuery={setQuery}
        />
        <section
          className="flex min-w-0 flex-col"
          style={{ borderLeft: `1px solid ${PLANNER_PALETTE.hairline}` }}
        >
          {active ? (
            <ThreadPanel
              thread={active.thread}
              groupLabel={active.group.label}
              draft={draft}
              onDraft={setDraft}
              sendMode={sendMode}
              onSendMode={setSendMode}
              showTemplates={showTemplates}
              onToggleTemplates={() => setShowTemplates((v) => !v)}
              onPickTemplate={(t) => {
                setDraft(fillTemplate(t, active.thread));
                setShowTemplates(false);
              }}
            />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}

function filterGroups(groups: ConversationGroup[], q: string) {
  if (!q.trim()) return groups;
  const needle = q.toLowerCase();
  return groups
    .map((g) => ({
      ...g,
      threads: g.threads.filter((t) => {
        if (t.title.toLowerCase().includes(needle)) return true;
        if (t.preview.toLowerCase().includes(needle)) return true;
        if (g.label.toLowerCase().includes(needle)) return true;
        return t.messages.some((m) => m.body.toLowerCase().includes(needle));
      }),
    }))
    .filter((g) => g.threads.length > 0);
}

function findThread(
  groups: ConversationGroup[],
  id: string,
): { group: ConversationGroup; thread: ConversationThread } | null {
  for (const g of groups) {
    const t = g.threads.find((t) => t.id === id);
    if (t) return { group: g, thread: t };
  }
  return null;
}

function fillTemplate(t: QuickReply, thread: ConversationThread) {
  const ctx = thread.context ?? {};
  return t.body
    .replace(/\{couple\}/g, ctx.couple ?? "the couple")
    .replace(/\{venue\}/g, ctx.venue ?? "the venue")
    .replace(/\{date\}/g, ctx.dates ?? "their wedding date")
    .replace(/\{guests\}/g, ctx.guests ? String(ctx.guests) : "—")
    .replace(/\{vendor\}/g, thread.title);
}

// ─── Sidebar ───────────────────────────────────────────────────────────

function Sidebar({
  groups,
  activeId,
  onSelect,
  query,
  onQuery,
}: {
  groups: ConversationGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (v: string) => void;
}) {
  return (
    <aside className="flex min-w-0 flex-col" style={{ backgroundColor: "#FCFAF5" }}>
      <div
        className="flex items-center justify-between gap-2 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
      >
        <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
          Messages
        </p>
        <span className="font-mono text-[10.5px] text-[#8a8a8a]">
          {groups.reduce((acc, g) => acc + g.threads.length, 0)}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <label className="relative flex items-center">
          <span
            className="pointer-events-none absolute left-3 text-[13px] text-[#9E8245]"
            aria-hidden
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-full border bg-white py-1.5 pl-8 pr-3 text-[12.5px] text-[#2C2C2C] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#EAD3B0]"
            style={{ borderColor: PLANNER_PALETTE.hairline }}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {groups.length === 0 && (
          <p className="px-4 py-6 text-[12.5px] italic text-[#8a8a8a]">
            No conversations match “{query}”.
          </p>
        )}
        {groups.map((group) => (
          <div key={group.id} className="mt-2">
            <div className="flex items-center gap-2 px-4 pb-1 pt-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-[#9E8245]">
                {group.label}
              </p>
              {group.dates && (
                <span className="text-[10.5px] text-[#b5a68e]">·</span>
              )}
              {group.dates && (
                <p className="text-[10.5px] italic text-[#8a8a8a]">
                  {group.dates}
                </p>
              )}
              <span className="ml-auto font-mono text-[10.5px] text-[#8a8a8a]">
                {group.threads.length}
              </span>
            </div>
            <ul>
              {group.threads.map((t) => (
                <ThreadRow
                  key={t.id}
                  thread={t}
                  active={t.id === activeId}
                  onSelect={() => onSelect(t.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ThreadRow({
  thread,
  active,
  onSelect,
}: {
  thread: ConversationThread;
  active: boolean;
  onSelect: () => void;
}) {
  const isUnread = thread.unread > 0;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors"
        style={{
          backgroundColor: active ? "#F5E6D0" : "transparent",
        }}
      >
        <span
          aria-hidden
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11.5px]"
          style={{
            backgroundColor: active ? "rgba(255,255,255,0.6)" : "#F5E6D0",
            color: "#9E8245",
          }}
        >
          {thread.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={`truncate text-[12.5px] ${
                isUnread ? "font-semibold text-[#2C2C2C]" : "text-[#2C2C2C]"
              }`}
            >
              {thread.title}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              {thread.urgent && isUnread && (
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PLANNER_PALETTE.critical }}
                />
              )}
              {isUnread && (
                <span
                  className="inline-grid h-4 min-w-[16px] place-items-center rounded-full px-1 font-mono text-[9.5px] font-semibold text-white"
                  style={{ backgroundColor: PLANNER_PALETTE.goldDeep }}
                >
                  {thread.unread}
                </span>
              )}
            </div>
          </div>
          {thread.subtitle && (
            <p className="truncate text-[10.5px] italic text-[#8a8a8a]">
              {thread.subtitle}
            </p>
          )}
          <p className="mt-0.5 truncate text-[11.5px] text-[#6a6a6a]">
            {thread.preview}
          </p>
        </div>
      </button>
    </li>
  );
}

// ─── Thread panel ──────────────────────────────────────────────────────

function ThreadPanel({
  thread,
  groupLabel,
  draft,
  onDraft,
  sendMode,
  onSendMode,
  showTemplates,
  onToggleTemplates,
  onPickTemplate,
}: {
  thread: ConversationThread;
  groupLabel: string;
  draft: string;
  onDraft: (v: string) => void;
  sendMode: SendMode;
  onSendMode: (m: SendMode) => void;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  onPickTemplate: (t: QuickReply) => void;
}) {
  const canToggleSendMode = thread.kind === "vendor" || thread.kind === "outreach";

  return (
    <>
      <header
        className="flex items-start justify-between gap-4 px-6 py-4"
        style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C4A265]">
            {groupLabel}
          </p>
          <h2
            className="mt-1 text-[24px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {thread.title}
          </h2>
          {thread.subtitle && (
            <p className="mt-0.5 text-[12px] italic text-[#6a6a6a]">
              {thread.subtitle}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton glyph="☎" label="Call" />
          <IconButton glyph="⚲" label="Attach" />
          <IconButton glyph="⋯" label="More" />
        </div>
      </header>

      {thread.context && <ContextRibbon ctx={thread.context} />}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <ul className="space-y-4">
          {thread.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </ul>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#b5a68e]">
          — end of thread · live —
        </p>
      </div>

      {showTemplates && (
        <TemplateTray
          onPick={onPickTemplate}
          onClose={onToggleTemplates}
        />
      )}

      <Composer
        draft={draft}
        onDraft={onDraft}
        sendMode={sendMode}
        onSendMode={onSendMode}
        canToggleSendMode={canToggleSendMode}
        onOpenTemplates={onToggleTemplates}
        templatesOpen={showTemplates}
      />
    </>
  );
}

function ContextRibbon({
  ctx,
}: {
  ctx: NonNullable<ConversationThread["context"]>;
}) {
  const parts: { label: string; value: string }[] = [];
  if (ctx.couple) parts.push({ label: "Couple", value: ctx.couple });
  if (ctx.dates) parts.push({ label: "Dates", value: ctx.dates });
  if (ctx.venue) parts.push({ label: "Venue", value: ctx.venue });
  if (ctx.guests) parts.push({ label: "Guests", value: String(ctx.guests) });
  if (ctx.events && ctx.events.length > 0)
    parts.push({ label: "Events", value: ctx.events.join(", ") });

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-1 px-6 py-2.5"
      style={{
        backgroundColor: "#FBF4E6",
        borderBottom: `1px solid ${PLANNER_PALETTE.hairline}`,
      }}
    >
      {parts.map((p) => (
        <div key={p.label} className="flex items-baseline gap-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
            {p.label}
          </span>
          <span className="text-[12px] text-[#2C2C2C]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isPlanner = message.role === "planner";
  const bg = isPlanner ? "#2C2C2C" : "#FFFFFF";
  const fg = isPlanner ? "#FAF8F5" : "#2C2C2C";

  return (
    <li
      className={`flex items-start gap-3 ${
        isPlanner ? "flex-row-reverse" : ""
      }`}
    >
      <span
        aria-hidden
        className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px]"
        style={{
          backgroundColor: isPlanner ? "#F5E6D0" : "#FBF1DF",
          color: "#7a5a1a",
          fontFamily: "'Cormorant Garamond', serif",
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.4)",
        }}
      >
        {message.initials}
      </span>
      <div className={`min-w-0 max-w-[620px] ${isPlanner ? "items-end" : ""}`}>
        <div
          className={`flex items-baseline gap-2 ${
            isPlanner ? "justify-end" : ""
          }`}
        >
          <p className="text-[12.5px] font-medium text-[#2C2C2C]">
            {message.from}
          </p>
          <p className="font-mono text-[10px] text-[#8a8a8a]">{message.time}</p>
        </div>
        <div
          className="mt-1 whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
          style={{
            backgroundColor: bg,
            color: fg,
            border: isPlanner
              ? "none"
              : `1px solid ${PLANNER_PALETTE.hairline}`,
            borderTopLeftRadius: isPlanner ? undefined : 4,
            borderTopRightRadius: isPlanner ? 4 : undefined,
          }}
        >
          {message.body}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div
            className={`mt-2 flex flex-wrap gap-2 ${
              isPlanner ? "justify-end" : ""
            }`}
          >
            {message.attachments.map((a, i) => (
              <AttachmentChip key={i} attachment={a} />
            ))}
          </div>
        )}
        {isPlanner && message.seen && (
          <p className="mt-1 text-right font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            ✓ Seen
          </p>
        )}
      </div>
    </li>
  );
}

function AttachmentChip({ attachment }: { attachment: Attachment }) {
  const glyph =
    attachment.kind === "image"
      ? "◨"
      : attachment.kind === "doc"
        ? "📄"
        : "🔗";
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11.5px]"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: PLANNER_PALETTE.hairline,
      }}
    >
      <span aria-hidden className="text-[12px]">
        {glyph}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#2C2C2C]">
          {attachment.kind === "link" ? attachment.name : attachment.name}
        </p>
        <p className="truncate text-[10px] text-[#8a8a8a]">
          {attachment.kind === "link" ? attachment.url : attachment.meta}
        </p>
      </div>
    </div>
  );
}

function IconButton({ glyph, label }: { glyph: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full text-[14px] text-[#5a5a5a] hover:bg-[#F5E6D0]/65"
    >
      <span aria-hidden>{glyph}</span>
    </button>
  );
}

function TemplateTray({
  onPick,
  onClose,
}: {
  onPick: (t: QuickReply) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="px-6 py-4"
      style={{
        backgroundColor: "#FBF4E6",
        borderTop: `1px solid ${PLANNER_PALETTE.hairline}`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
          Quick replies · auto-fills from thread context
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close templates"
          className="font-mono text-[11px] text-[#8a8a8a] hover:text-[#2C2C2C]"
        >
          close ✕
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {QUICK_REPLIES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className="rounded-lg border bg-white px-3 py-2 text-left hover:border-[#C4A265]"
            style={{ borderColor: PLANNER_PALETTE.hairline }}
          >
            <p className="text-[12.5px] font-medium text-[#2C2C2C]">
              {t.label}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] italic text-[#6a6a6a]">
              {t.body}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({
  draft,
  onDraft,
  sendMode,
  onSendMode,
  canToggleSendMode,
  onOpenTemplates,
  templatesOpen,
}: {
  draft: string;
  onDraft: (v: string) => void;
  sendMode: SendMode;
  onSendMode: (m: SendMode) => void;
  canToggleSendMode: boolean;
  onOpenTemplates: () => void;
  templatesOpen: boolean;
}) {
  return (
    <div
      className="px-6 py-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: `1px solid ${PLANNER_PALETTE.hairline}`,
      }}
    >
      <div className="flex items-center gap-2 pb-2">
        {canToggleSendMode && (
          <div
            className="flex items-center overflow-hidden rounded-full border"
            style={{ borderColor: PLANNER_PALETTE.hairline }}
          >
            <SendToggle
              active={sendMode === "me"}
              onClick={() => onSendMode("me")}
              label="Send as me"
              sub="Planner"
            />
            <SendToggle
              active={sendMode === "couple"}
              onClick={() => onSendMode("couple")}
              label="Send as couple"
              sub="Planner noted"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onOpenTemplates}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] transition-colors ${
            templatesOpen
              ? "bg-[#F5E6D0] text-[#2C2C2C]"
              : "text-[#5a5a5a] hover:bg-[#F5E6D0]/55"
          }`}
          style={{ borderColor: PLANNER_PALETTE.hairline }}
        >
          <span aria-hidden>✎</span>
          Templates
        </button>
      </div>
      <div
        className="flex items-end gap-2 rounded-2xl border bg-white px-3 py-2"
        style={{ borderColor: PLANNER_PALETTE.hairline }}
      >
        <button
          type="button"
          aria-label="Attach"
          className="grid h-9 w-9 place-items-center rounded-full text-[14px] text-[#9E8245] hover:bg-[#F5E6D0]/65"
        >
          ⚲
        </button>
        <textarea
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="Write a message…"
          rows={2}
          className="min-h-[44px] flex-1 resize-none bg-transparent text-[13px] text-[#2C2C2C] placeholder:text-[#aaa] focus:outline-none"
        />
        <button
          type="button"
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium text-[#FAF8F5] transition-opacity disabled:opacity-40"
          style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
        >
          Send
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function SendToggle({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 text-left"
      style={{
        backgroundColor: active ? PLANNER_PALETTE.champagne : "transparent",
      }}
    >
      <p className="text-[11.5px] font-medium text-[#2C2C2C]">{label}</p>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#9E8245]">
        {sub}
      </p>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="grid flex-1 place-items-center px-10 text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#C4A265]">
          Nothing selected
        </p>
        <p
          className="mt-3 text-[22px] text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Pick a conversation to read or reply
        </p>
      </div>
    </div>
  );
}
