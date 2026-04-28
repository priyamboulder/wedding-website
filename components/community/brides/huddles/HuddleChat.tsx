"use client";

// ── Huddle chat ─────────────────────────────────────────────────────────────
// Lightweight text chat inside the room — backed by the huddles store (NOT
// the DM system). Messages persist so latecomers see the conversation.

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HuddleChat({ huddleId }: { huddleId: string }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);

  const messages = useCommunityHuddlesStore((s) => s.messages);
  const sendMessage = useCommunityHuddlesStore((s) => s.sendMessage);

  const huddleMessages = useMemo(
    () =>
      messages
        .filter((m) => m.huddle_id === huddleId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    [messages, huddleId],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [huddleMessages.length]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !myProfileId) return;
    sendMessage(huddleId, myProfileId, body);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gold/15 bg-white">
      <div className="border-b border-gold/10 px-4 py-2.5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — huddle chat —
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {huddleMessages.length === 0 ? (
          <p className="text-center text-[12px] italic text-ink-faint">
            no messages yet — say hi.
          </p>
        ) : (
          huddleMessages.map((m) => {
            const sender = profiles.find((p) => p.id === m.sender_id);
            const isMe = m.sender_id === myProfileId;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2",
                  isMe ? "flex-row-reverse" : "flex-row",
                )}
              >
                <BrideAvatar
                  name={sender?.display_name ?? "?"}
                  src={sender?.avatar_data_url}
                  size={26}
                />
                <div
                  className={cn(
                    "max-w-[240px] rounded-2xl px-3 py-2",
                    isMe
                      ? "rounded-tr-sm bg-ink text-ivory"
                      : "rounded-tl-sm bg-ivory-warm/60 text-ink",
                  )}
                >
                  {!isMe ? (
                    <p
                      className={cn(
                        "text-[10.5px] font-medium uppercase tracking-[0.14em]",
                        "text-ink-faint",
                      )}
                    >
                      {sender?.display_name.split(" ")[0] ?? "bride"}
                    </p>
                  ) : null}
                  <p className="text-[13px] leading-[1.45]">{m.body}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-[10px]",
                      isMe ? "text-ivory/60" : "text-ink-faint",
                    )}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gold/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="type a message…"
            disabled={!myProfileId}
            className="flex-1 rounded-full border border-border bg-white px-4 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none disabled:bg-ivory-warm/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || !myProfileId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink/30"
            aria-label="Send"
          >
            <Send size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
