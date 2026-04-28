"use client";

// Floating "messages" launcher — round FAB in the bottom-right that opens a
// slide-over panel with the couple's vendor inquiries and group threads.
// Mounted once in the root layout; hides itself on routes that have their
// own inbox UX (vendor/seller/planner portals, marketing pages).

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, X, ChevronLeft, Send, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useInquiryStore } from "@/stores/inquiry-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import type { Inquiry, InquiryMessage, MessageAttachment } from "@/types/inquiry";
import type {
  Conversation,
  ConversationMessage,
  Participant,
  ParticipantRole,
} from "@/types/conversation";

// ── Visibility rules ──────────────────────────────────────────────────

// Routes where the launcher is suppressed because a dedicated inbox already
// exists (vendor/seller/planner portals) or where a floating UI would be
// wrong (marketing pages, auth flows).
const HIDE_PREFIXES = [
  "/vendor",
  "/seller",
  "/planner",
  "/venue",
  "/for-vendors",
  "/signup",
  "/signin",
];

// Marketing root ("/") is shared between the homepage and the couple portal
// landing. The launcher only makes sense on the couple's planning surfaces.
const SHOW_PREFIXES = [
  "/app",
  "/checklist",
  "/vendors",
  "/guests",
  "/registry",
  "/studio",
  "/journal",
  "/workspace",
  "/shopping",
  "/marketplace",
  "/cart",
  "/dashboard",
  "/events",
  "/documents",
  "/portal-hub",
];

function shouldShow(pathname: string | null): boolean {
  if (!pathname) return false;
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return false;
  return SHOW_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

// ── Demo identity ─────────────────────────────────────────────────────

// The couple portal seeds assume a logged-in Priya Menon / couple-priya-arjun.
// Real signed-in users get their own id; signed-out demo visitors fall back to
// the seed couple so the demo renders out of the box.
const DEMO_COUPLE_ID = "couple-priya-arjun";
const DEMO_COUPLE_NAME = "Priya Menon";

function useCoupleIdentity() {
  const user = useAuthStore((s) => s.user);
  return {
    id: user?.id ?? DEMO_COUPLE_ID,
    name: user?.name ?? DEMO_COUPLE_NAME,
    isDemo: !user,
  };
}

// ── Component ─────────────────────────────────────────────────────────

type TabKey = "inquiries" | "groups";
type View =
  | { kind: "list" }
  | { kind: "inquiry"; id: string }
  | { kind: "conversation"; id: string }
  | { kind: "new-group" };

export default function MessagesLauncher() {
  const pathname = usePathname();
  const visible = shouldShow(pathname);

  const couple = useCoupleIdentity();

  // Select raw arrays (stable refs) then derive filtered+sorted lists in
  // useMemo. Zustand's getServerSnapshot must return the same reference on
  // repeat calls, so .filter().sort() inside the selector trips an infinite
  // loop warning on SSR.
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const allConversations = useConversationStore((s) => s.conversations);

  const inquiries = useMemo(
    () =>
      allInquiries
        .filter((i) => i.couple_id === couple.id)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    [allInquiries, couple.id],
  );
  const conversations = useMemo(
    () =>
      allConversations
        .filter((c) => c.participants.some((p) => p.id === couple.id))
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    [allConversations, couple.id],
  );

  const unread = useMemo(() => {
    let count = 0;
    for (const inq of inquiries) {
      const last = inq.messages[inq.messages.length - 1];
      if (last?.sender === "vendor") count += 1;
    }
    // Treat a conversation as "unread" if the last message wasn't from the
    // couple — same shape as the inquiry rule.
    for (const c of conversations) {
      const last = c.messages[c.messages.length - 1];
      if (last && last.sender_id !== couple.id) count += 1;
    }
    return count;
  }, [inquiries, conversations, couple.id]);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("inquiries");
  const [view, setView] = useState<View>({ kind: "list" });

  // Reset state whenever the panel closes so re-opens feel fresh.
  useEffect(() => {
    if (!open) {
      setView({ kind: "list" });
    }
  }, [open]);

  // Escape closes the panel (and backs out of nested views first).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (view.kind !== "list") setView({ kind: "list" });
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, view]);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Messages${unread > 0 ? ` — ${unread} unread` : ""}`}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-[#FBF9F4] shadow-[0_12px_32px_-8px_rgba(26,26,26,0.45)] transition-transform hover:scale-105"
      >
        <MessageSquare size={18} strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C97B63] px-1 text-[10.5px] font-semibold text-[#FBF9F4] ring-2 ring-[#F7F5F0]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#1a1a1a]/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-[#F7F5F0] shadow-[-24px_0_60px_-20px_rgba(26,26,26,0.35)]"
            role="dialog"
            aria-label="Messages"
          >
            <LauncherHeader
              view={view}
              tab={tab}
              onTabChange={setTab}
              onBack={() => setView({ kind: "list" })}
              onClose={() => setOpen(false)}
              inquiryCount={inquiries.length}
              groupCount={conversations.length}
              onNewGroup={() => setView({ kind: "new-group" })}
            />

            <div className="flex-1 overflow-hidden">
              {view.kind === "list" && (
                <ListPane
                  tab={tab}
                  inquiries={inquiries}
                  conversations={conversations}
                  coupleId={couple.id}
                  onOpenInquiry={(id) => setView({ kind: "inquiry", id })}
                  onOpenConversation={(id) =>
                    setView({ kind: "conversation", id })
                  }
                />
              )}
              {view.kind === "inquiry" && (
                <InquiryThread
                  inquiryId={view.id}
                  coupleName={couple.name}
                />
              )}
              {view.kind === "conversation" && (
                <ConversationThread
                  conversationId={view.id}
                  couple={couple}
                />
              )}
              {view.kind === "new-group" && (
                <NewGroupPane
                  couple={couple}
                  onCreated={(id) => setView({ kind: "conversation", id })}
                  onCancel={() => setView({ kind: "list" })}
                />
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// ── Header ────────────────────────────────────────────────────────────

function LauncherHeader({
  view,
  tab,
  onTabChange,
  onBack,
  onClose,
  inquiryCount,
  groupCount,
  onNewGroup,
}: {
  view: View;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  onBack: () => void;
  onClose: () => void;
  inquiryCount: number;
  groupCount: number;
  onNewGroup: () => void;
}) {
  const isList = view.kind === "list";

  return (
    <header className="border-b border-[rgba(26,26,26,0.08)] bg-[#F7F5F0]">
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          {!isList && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 hover:bg-[#F5F1E8] hover:text-[#1a1a1a]"
            >
              <ChevronLeft size={14} strokeWidth={1.8} />
            </button>
          )}
          <h2
            className="text-[18px] text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
          >
            {view.kind === "new-group" ? "New group" : "Messages"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 hover:bg-[#F5F1E8] hover:text-[#1a1a1a]"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {isList && (
        <div className="flex items-center justify-between gap-3 px-5 pb-3">
          <div className="flex gap-4">
            <TabButton
              label="Inquiries"
              count={inquiryCount}
              active={tab === "inquiries"}
              onClick={() => onTabChange("inquiries")}
            />
            <TabButton
              label="Groups"
              count={groupCount}
              active={tab === "groups"}
              onClick={() => onTabChange("groups")}
            />
          </div>
          {tab === "groups" && (
            <button
              type="button"
              onClick={onNewGroup}
              className="inline-flex items-center gap-1 rounded-full border border-[#1a1a1a] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-[#FBF9F4] transition-opacity hover:opacity-90"
            >
              <Plus size={11} strokeWidth={2} />
              New group
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 pb-2 text-[13px] transition-colors ${
        active ? "text-[#1a1a1a]" : "text-stone-500 hover:text-[#1a1a1a]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[10.5px] ${
          active ? "bg-[#1a1a1a] text-[#FBF9F4]" : "bg-stone-200 text-stone-600"
        }`}
      >
        {count}
      </span>
      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#1a1a1a]" />
      )}
    </button>
  );
}

// ── List pane ─────────────────────────────────────────────────────────

function ListPane({
  tab,
  inquiries,
  conversations,
  coupleId,
  onOpenInquiry,
  onOpenConversation,
}: {
  tab: TabKey;
  inquiries: Inquiry[];
  conversations: Conversation[];
  coupleId: string;
  onOpenInquiry: (id: string) => void;
  onOpenConversation: (id: string) => void;
}) {
  if (tab === "inquiries") {
    if (inquiries.length === 0) {
      return (
        <EmptyPane
          title="No vendor inquiries yet"
          body="When you send an inquiry from a vendor profile, their reply lives here."
        />
      );
    }
    return (
      <ul className="h-full overflow-y-auto">
        {inquiries.map((inq) => (
          <InquiryRow
            key={inq.id}
            inquiry={inq}
            onOpen={() => onOpenInquiry(inq.id)}
          />
        ))}
      </ul>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyPane
        title="No groups yet"
        body="Start a group thread with your planner and vendors to coordinate a specific moment — mandap, sangeet, day-of handoff."
      />
    );
  }
  return (
    <ul className="h-full overflow-y-auto">
      {conversations.map((c) => (
        <ConversationRow
          key={c.id}
          conversation={c}
          coupleId={coupleId}
          onOpen={() => onOpenConversation(c.id)}
        />
      ))}
    </ul>
  );
}

function InquiryRow({
  inquiry,
  onOpen,
}: {
  inquiry: Inquiry;
  onOpen: () => void;
}) {
  const last = inquiry.messages[inquiry.messages.length - 1];
  const isUnread = last?.sender === "vendor";
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`block w-full border-b border-[rgba(26,26,26,0.05)] px-5 py-4 text-left transition-colors hover:bg-[#FBF7EC]/70 ${
          isUnread ? "bg-[#FBF7EC]/40" : ""
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {isUnread && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C97B63]"
                aria-label="New"
              />
            )}
            <p className={`truncate text-[14px] ${isUnread ? "font-semibold" : "font-medium"} text-[#1a1a1a]`}>
              {inquiry.vendor_name}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
            {timeAgo(inquiry.updated_at)}
          </span>
        </div>
        <p className="mt-0.5 text-[11.5px] text-stone-500">
          {CATEGORY_LABELS[inquiry.vendor_category]}
        </p>
        <p
          className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-stone-600"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {last?.body ?? ""}
        </p>
      </button>
    </li>
  );
}

function ConversationRow({
  conversation,
  coupleId,
  onOpen,
}: {
  conversation: Conversation;
  coupleId: string;
  onOpen: () => void;
}) {
  const last = conversation.messages[conversation.messages.length - 1];
  const isUnread = last && last.sender_id !== coupleId;
  const others = conversation.participants.filter((p) => p.id !== coupleId);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`block w-full border-b border-[rgba(26,26,26,0.05)] px-5 py-4 text-left transition-colors hover:bg-[#FBF7EC]/70 ${
          isUnread ? "bg-[#FBF7EC]/40" : ""
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {isUnread && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C97B63]"
                aria-label="New"
              />
            )}
            <p className={`truncate text-[14px] ${isUnread ? "font-semibold" : "font-medium"} text-[#1a1a1a]`}>
              {conversation.title}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
            {timeAgo(conversation.updated_at)}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-stone-500">
          <Users size={10} strokeWidth={1.8} />
          {others
            .slice(0, 3)
            .map((p) => p.name)
            .join(", ")}
          {others.length > 3 ? ` +${others.length - 3}` : ""}
        </p>
        {last && (
          <p
            className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-stone-600"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            <span className="font-medium text-stone-700">
              {last.sender_id === coupleId ? "You" : last.sender_name}:
            </span>{" "}
            {last.body}
          </p>
        )}
      </button>
    </li>
  );
}

// ── Thread panes ──────────────────────────────────────────────────────

function InquiryThread({
  inquiryId,
  coupleName,
}: {
  inquiryId: string;
  coupleName: string;
}) {
  const inquiry = useInquiryStore((s) =>
    s.inquiries.find((i) => i.id === inquiryId),
  );
  const sendMessage = useInquiryStore((s) => s.sendMessage);
  const [draft, setDraft] = useState("");

  if (!inquiry) {
    return (
      <EmptyPane title="Conversation not found" body="This thread has been removed." />
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(inquiry.id, {
      sender: "couple",
      sender_name: coupleName,
      body: draft.trim(),
    });
    setDraft("");
  };

  const isLocked =
    inquiry.status === "declined" ||
    inquiry.status === "expired" ||
    inquiry.status === "booked";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[rgba(26,26,26,0.06)] px-5 py-3">
        <p
          className="text-[15px] text-[#1a1a1a]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
        >
          {inquiry.vendor_name}
        </p>
        <p className="mt-0.5 text-[11.5px] text-stone-500">
          {CATEGORY_LABELS[inquiry.vendor_category]}
          {inquiry.venue_name ? ` · ${inquiry.venue_name}` : ""}
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto bg-[#FAF7EF]/40 px-4 py-4">
        {inquiry.messages.map((msg) => (
          <InquiryBubble key={msg.id} msg={msg} />
        ))}
      </ul>

      {!isLocked ? (
        <Composer draft={draft} setDraft={setDraft} onSend={handleSend} />
      ) : (
        <div className="border-t border-[rgba(26,26,26,0.06)] bg-stone-50 px-5 py-3 text-center text-[11.5px] italic text-stone-500">
          {inquiry.status === "booked"
            ? "This vendor is booked. Day-to-day coordination happens in the vendor workspace."
            : "This thread is archived."}
        </div>
      )}
    </div>
  );
}

function ConversationThread({
  conversationId,
  couple,
}: {
  conversationId: string;
  couple: { id: string; name: string };
}) {
  const conversation = useConversationStore((s) =>
    s.conversations.find((c) => c.id === conversationId),
  );
  const postMessage = useConversationStore((s) => s.postMessage);
  const [draft, setDraft] = useState("");

  if (!conversation) {
    return (
      <EmptyPane title="Group not found" body="This conversation has been removed." />
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    postMessage(conversation.id, {
      sender_id: couple.id,
      sender_name: couple.name,
      sender_role: "couple",
      body: draft.trim(),
    });
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[rgba(26,26,26,0.06)] px-5 py-3">
        <p
          className="text-[15px] text-[#1a1a1a]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
        >
          {conversation.title}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {conversation.participants.map((p) => (
            <ParticipantChip key={p.id} participant={p} isYou={p.id === couple.id} />
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto bg-[#FAF7EF]/40 px-4 py-4">
        {conversation.messages.map((msg) => (
          <ConversationBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.sender_id === couple.id}
          />
        ))}
      </ul>

      <Composer draft={draft} setDraft={setDraft} onSend={handleSend} />
    </div>
  );
}

function InquiryBubble({ msg }: { msg: InquiryMessage }) {
  const isOwn = msg.sender === "couple";
  return (
    <Bubble
      isOwn={isOwn}
      senderName={isOwn ? "You" : msg.sender_name}
      created_at={msg.created_at}
      body={msg.body}
      attachments={msg.attachments}
    />
  );
}

function ConversationBubble({
  msg,
  isOwn,
}: {
  msg: ConversationMessage;
  isOwn: boolean;
}) {
  return (
    <Bubble
      isOwn={isOwn}
      senderName={isOwn ? "You" : msg.sender_name}
      senderRole={msg.sender_role}
      created_at={msg.created_at}
      body={msg.body}
      attachments={msg.attachments}
    />
  );
}

function Bubble({
  isOwn,
  senderName,
  senderRole,
  created_at,
  body,
  attachments,
}: {
  isOwn: boolean;
  senderName: string;
  senderRole?: ParticipantRole;
  created_at: string;
  body: string;
  attachments: MessageAttachment[];
}) {
  const timestamp = new Date(created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`flex items-baseline gap-2 px-1 text-[11px] text-stone-500 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-medium text-stone-700">{senderName}</span>
          {senderRole && !isOwn && (
            <span className="rounded-full bg-stone-200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-600">
              {senderRole}
            </span>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
            {timestamp}
          </span>
        </div>
        <div
          className={`mt-1 rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
            isOwn
              ? "rounded-br-md bg-[#FBF9F4] text-[#1a1a1a]"
              : "rounded-bl-md bg-[#F5EBD6] text-[#2a2218]"
          }`}
          style={{
            fontFamily: "'EB Garamond', serif",
            border: "1px solid rgba(26,26,26,0.06)",
          }}
        >
          <p className="whitespace-pre-wrap">{body}</p>
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border border-[rgba(26,26,26,0.12)] bg-white/70 px-2 py-1.5"
                >
                  <span aria-hidden className="text-[12px]">
                    {a.kind === "pdf" ? "📄" : "🖼"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[12px] text-[#1a1a1a]">
                      {a.name}
                    </p>
                    <p className="font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
                      {a.kind} · {a.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ParticipantChip({
  participant,
  isYou,
}: {
  participant: Participant;
  isYou: boolean;
}) {
  const roleLabel =
    participant.role === "couple"
      ? "Couple"
      : participant.role === "planner"
        ? "Planner"
        : participant.role === "vendor"
          ? participant.vendor_category
            ? CATEGORY_LABELS[participant.vendor_category]
            : "Vendor"
          : "Member";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] ${
        isYou
          ? "bg-[#1a1a1a] text-[#FBF9F4]"
          : "border border-[rgba(26,26,26,0.1)] bg-white text-stone-700"
      }`}
    >
      <span className={isYou ? "" : "font-medium"}>
        {isYou ? "You" : participant.name}
      </span>
      <span
        className={`font-mono text-[9px] uppercase tracking-wider ${
          isYou ? "text-[#FBF9F4]/60" : "text-stone-400"
        }`}
      >
        {roleLabel}
      </span>
    </span>
  );
}

// ── Composer ──────────────────────────────────────────────────────────

function Composer({
  draft,
  setDraft,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSend();
    }
  };
  return (
    <div className="border-t border-[rgba(26,26,26,0.08)] bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a reply… (⌘⏎ to send)"
          rows={2}
          className="flex-1 resize-none rounded-lg border bg-white p-2.5 text-[13.5px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
          style={{
            borderColor: "rgba(26,26,26,0.12)",
            fontFamily: "'EB Garamond', serif",
          }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!draft.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[#FBF9F4] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

// ── New group flow ────────────────────────────────────────────────────

function NewGroupPane({
  couple,
  onCreated,
  onCancel,
}: {
  couple: { id: string; name: string };
  onCreated: (conversationId: string) => void;
  onCancel: () => void;
}) {
  const createConversation = useConversationStore((s) => s.createConversation);
  // Pull the couple's shortlist + saved vendors as the pool of invitees.
  const allVendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const shortlistedVendors = useMemo(() => {
    const ids = new Set(shortlist.map((e) => e.vendor_id));
    return allVendors.filter((v) => ids.has(v.id));
  }, [allVendors, shortlist]);

  // Fallback roster for the demo — if the couple hasn't shortlisted anyone yet,
  // offer the seed vendors so "New group" isn't an empty dropdown.
  const candidates = shortlistedVendors.length > 0
    ? shortlistedVendors
    : allVendors.slice(0, 8);

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includePlanner, setIncludePlanner] = useState(true);
  const [kickoff, setKickoff] = useState("");

  const canSubmit = title.trim().length > 1 && (selected.size > 0 || includePlanner);

  const handleCreate = () => {
    if (!canSubmit) return;
    const participants: Participant[] = [
      { id: couple.id, role: "couple", name: couple.name },
    ];
    if (includePlanner) {
      participants.push({
        id: "planner-radz-events",
        role: "planner",
        name: "Radhika Desai",
      });
    }
    for (const id of selected) {
      const v = allVendors.find((x) => x.id === id);
      if (!v) continue;
      participants.push({
        id: v.id,
        role: "vendor",
        name: v.name,
        vendor_category: v.category,
      });
    }
    const id = createConversation({
      title: title.trim(),
      created_by: couple.id,
      participants,
      initial_message: kickoff.trim()
        ? {
            sender_id: couple.id,
            sender_name: couple.name,
            sender_role: "couple",
            body: kickoff.trim(),
          }
        : undefined,
    });
    onCreated(id);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
            Group name
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mandap team, Day-of coordination"
            className="mt-1.5 w-full rounded-md border bg-white px-3 py-2 text-[14px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
            style={{ borderColor: "rgba(26,26,26,0.12)" }}
          />
        </label>

        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
            Participants
          </p>
          <label className="mt-2 flex items-center gap-3 rounded-md border border-[rgba(26,26,26,0.1)] bg-white px-3 py-2.5">
            <input
              type="checkbox"
              checked={includePlanner}
              onChange={(e) => setIncludePlanner(e.target.checked)}
              className="h-4 w-4 accent-[#B8755D]"
            />
            <div className="flex-1">
              <p className="text-[13.5px] font-medium text-[#1a1a1a]">
                Radhika Desai
              </p>
              <p className="text-[11.5px] text-stone-500">
                Your planner · Radz Events
              </p>
            </div>
          </label>

          <div className="mt-3 space-y-1">
            {candidates.length === 0 ? (
              <p
                className="rounded-md border border-dashed border-stone-300 bg-white px-3 py-4 text-center text-[12.5px] italic text-stone-500"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Shortlist vendors from the marketplace first — they'll appear
                here to add to the group.
              </p>
            ) : (
              candidates.map((v) => {
                const isOn = selected.has(v.id);
                return (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                      isOn
                        ? "border-[rgba(184,134,11,0.5)] bg-[#FBF7EC]"
                        : "border-[rgba(26,26,26,0.1)] bg-white hover:bg-[#F5F1E8]/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(v.id)) next.delete(v.id);
                          else next.add(v.id);
                          return next;
                        })
                      }
                      className="h-4 w-4 accent-[#B8755D]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-[#1a1a1a]">
                        {v.name}
                      </p>
                      <p className="truncate text-[11.5px] text-stone-500">
                        {CATEGORY_LABELS[v.category]}
                        {v.location ? ` · ${v.location}` : ""}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
            Kickoff message (optional)
          </span>
          <textarea
            value={kickoff}
            onChange={(e) => setKickoff(e.target.value)}
            placeholder="A short note to set context for the group."
            rows={3}
            className="mt-1.5 w-full resize-none rounded-md border bg-white p-3 text-[13.5px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
            style={{
              borderColor: "rgba(26,26,26,0.12)",
              fontFamily: "'EB Garamond', serif",
            }}
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[rgba(26,26,26,0.08)] bg-white px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-[12.5px] text-stone-600 hover:text-[#1a1a1a]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canSubmit}
          className="inline-flex items-center rounded-md bg-[#1a1a1a] px-4 py-2 text-[12.5px] font-medium text-[#FBF9F4] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create group
        </button>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────

function EmptyPane({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <p
        className="text-[17px] text-[#1a1a1a]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
      >
        {title}
      </p>
      <p
        className="mt-2 max-w-[320px] text-[13.5px] italic leading-relaxed text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {body}
      </p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
