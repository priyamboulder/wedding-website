"use client";

// ── Messages panel ──────────────────────────────────────────────────────────
// Two-pane layout: accepted connection list on the left, active thread on the
// right. Mobile collapses to thread-only when one is selected.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";
import type { CommunityConnection, CommunityProfile } from "@/types/community";

export function MessagesPanel() {
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );
  const getProfile = useMemo(
    () => (id: string) => profiles.find((p) => p.id === id),
    [profiles],
  );

  const allConnections = useCommunitySocialStore((s) => s.connections);
  const accepted = useMemo(
    () =>
      myProfileId
        ? allConnections.filter(
            (c) =>
              c.status === "accepted" &&
              (c.requester_id === myProfileId ||
                c.recipient_id === myProfileId),
          )
        : [],
    [allConnections, myProfileId],
  );
  const messages = useCommunitySocialStore((s) => s.messages);
  const searchParams = useSearchParams();

  // Deep-link support: ?thread=<id> picks an active thread.
  const threadParam = searchParams?.get("thread") ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(threadParam);
  useEffect(() => {
    if (threadParam) setSelectedId(threadParam);
  }, [threadParam]);

  // Order threads by most-recent message.
  const orderedConnections = useMemo(() => {
    const lastAt = (c: CommunityConnection) => {
      const thisThread = messages.filter((m) => m.connection_id === c.id);
      if (thisThread.length === 0) return new Date(c.updated_at).getTime();
      return Math.max(...thisThread.map((m) => new Date(m.created_at).getTime()));
    };
    return [...accepted].sort((a, b) => lastAt(b) - lastAt(a));
  }, [accepted, messages]);

  if (!myProfile) {
    return (
      <div className="px-10 py-16 text-center">
        <p className="font-serif text-[22px] italic text-ink">
          set up your profile to start messaging.
        </p>
      </div>
    );
  }

  if (accepted.length === 0) {
    return (
      <div className="px-10 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory-warm/40 text-gold">
          <MessageCircle size={22} strokeWidth={1.5} />
        </div>
        <p className="mt-5 font-serif text-[22px] italic text-ink">
          no threads yet.
        </p>
        <p className="mt-2 text-[14px] leading-[1.65] text-ink-muted">
          connect with a bride on the discover tab and start a conversation.
        </p>
      </div>
    );
  }

  const selectedConnection = orderedConnections.find((c) => c.id === selectedId);

  return (
    <div className="px-4 py-6 md:px-10 md:py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        <div
          className={cn(
            "rounded-xl border border-gold/15 bg-white md:block",
            selectedConnection ? "hidden md:block" : "block",
          )}
        >
          <ThreadList
            connections={orderedConnections}
            myProfileId={myProfileId!}
            selectedId={selectedId}
            onSelect={setSelectedId}
            getProfile={getProfile}
          />
        </div>

        <div
          className={cn(
            "flex min-h-[520px] flex-col rounded-xl border border-gold/15 bg-white md:block",
            selectedConnection ? "flex" : "hidden md:flex",
          )}
        >
          {selectedConnection ? (
            <MessageThread
              connection={selectedConnection}
              myProfileId={myProfileId!}
              getProfile={getProfile}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <p className="font-serif text-[18px] italic text-ink-muted">
                pick a thread to start reading.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Thread list ─────────────────────────────────────────────────────────────

function ThreadList({
  connections,
  myProfileId,
  selectedId,
  onSelect,
  getProfile,
}: {
  connections: CommunityConnection[];
  myProfileId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  getProfile: (id: string) => CommunityProfile | undefined;
}) {
  const allMessages = useCommunitySocialStore((s) => s.messages);

  return (
    <ul className="divide-y divide-gold/10">
      {connections.map((c) => {
        const themId =
          c.requester_id === myProfileId ? c.recipient_id : c.requester_id;
        const them = getProfile(themId);
        if (!them) return null;
        const thread = allMessages
          .filter((m) => m.connection_id === c.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
        const last = thread[0];
        const unread = thread.some(
          (m) => m.sender_id !== myProfileId && !m.read_at,
        );
        const isActive = c.id === selectedId;

        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                isActive ? "bg-ivory-warm/40" : "hover:bg-ivory-warm/20",
              )}
            >
              <BrideAvatar
                name={them.display_name}
                src={them.avatar_data_url}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-serif text-[15px] font-medium text-ink">
                    {them.display_name}
                  </p>
                  {unread && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-saffron"
                      aria-label="Unread"
                    />
                  )}
                </div>
                {last ? (
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[12.5px]",
                      unread ? "font-medium text-ink" : "text-ink-muted",
                    )}
                  >
                    {last.sender_id === myProfileId && "you: "}
                    {last.body}
                  </p>
                ) : (
                  <p className="mt-0.5 truncate text-[12.5px] italic text-ink-faint">
                    no messages yet — say hello.
                  </p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── Message thread ──────────────────────────────────────────────────────────

function MessageThread({
  connection,
  myProfileId,
  getProfile,
  onBack,
}: {
  connection: CommunityConnection;
  myProfileId: string;
  getProfile: (id: string) => CommunityProfile | undefined;
  onBack: () => void;
}) {
  const themId =
    connection.requester_id === myProfileId
      ? connection.recipient_id
      : connection.requester_id;
  const them = getProfile(themId);
  const allMessages = useCommunitySocialStore((s) => s.messages);
  const thread = useMemo(
    () =>
      allMessages
        .filter((m) => m.connection_id === connection.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    [allMessages, connection.id],
  );
  const sendMessage = useCommunitySocialStore((s) => s.sendMessage);
  const markThreadRead = useCommunitySocialStore((s) => s.markThreadRead);

  const [draft, setDraft] = useState("");

  // Mark thread read on open + when new messages arrive while open.
  useEffect(() => {
    markThreadRead(connection.id, myProfileId);
  }, [connection.id, myProfileId, markThreadRead, thread.length]);

  if (!them) return null;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(connection.id, myProfileId, body);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gold/10 px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-muted transition-colors hover:text-ink md:hidden"
          aria-label="Back to threads"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
        </button>
        <BrideAvatar
          name={them.display_name}
          src={them.avatar_data_url}
          size={36}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-[16px] font-medium text-ink">
            {them.display_name}
          </p>
          {them.wedding_city && (
            <p className="truncate text-[12px] text-ink-muted">
              getting married in {them.wedding_city}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {thread.length === 0 ? (
          <p className="mt-10 text-center font-serif text-[16px] italic text-ink-muted">
            start the conversation — brides like you are just as nervous to say
            hello.
          </p>
        ) : (
          thread.map((m) => {
            const mine = m.sender_id === myProfileId;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  mine ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-[1.55]",
                    mine
                      ? "bg-ink text-ivory"
                      : "bg-ivory-warm/60 text-ink",
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gold/10 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-white px-3 py-2">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Say something…"
            className="max-h-32 flex-1 resize-none bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={draft.trim().length === 0}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              draft.trim().length === 0
                ? "cursor-not-allowed bg-ink/30 text-ivory"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            <Send size={12} strokeWidth={1.8} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
