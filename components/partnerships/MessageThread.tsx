"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnershipMessage, MessageSenderType } from "@/types/partnership";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function MessageThread({
  messages,
  perspective,
  onSend,
}: {
  messages: PartnershipMessage[];
  perspective: MessageSenderType;
  onSend?: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim() || !onSend) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-muted">
            No messages yet.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderType === perspective;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-1",
                  mine ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug",
                    mine
                      ? "bg-ink text-ivory"
                      : "bg-ivory-warm/70 text-ink",
                  )}
                >
                  {m.messageText}
                </div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                  {m.senderType} · {timeAgo(m.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {onSend && (
        <div className="flex gap-2 rounded-md border border-border bg-white p-1.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Reply…"
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              draft.trim()
                ? "bg-ink text-ivory hover:bg-ink/90"
                : "cursor-not-allowed bg-ink/20 text-ivory",
            )}
            aria-label="Send"
          >
            <Send size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}
