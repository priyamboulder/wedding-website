"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MessageSquare, Reply, Trash2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommentsStore } from "@/stores/comments-store";
import type { Comment, CommentEntityType } from "@/types/popout-infrastructure";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

function renderBody(body: string) {
  // Highlight @mentions in gold
  const parts = body.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-medium text-gold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// ── Composer ─────────────────────────────────────────────────────────────────

interface ComposerProps {
  onSubmit: (body: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

function Composer({
  onSubmit,
  placeholder = "Add a comment\u2026",
  autoFocus = false,
  compact = false,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, onSubmit]);

  return (
    <div
      className={cn(
        "border border-border rounded-lg bg-ivory-warm/50 overflow-hidden",
        "focus-within:border-gold/40 transition-colors",
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        className={cn(
          "w-full bg-transparent px-3 py-2 text-sm text-ink resize-none",
          "placeholder:text-ink-faint focus:outline-none",
          "font-sans leading-relaxed",
        )}
      />
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-[10px] text-ink-faint">
          {"\u2318"}+Enter to post
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            "text-xs font-medium px-3 py-1 rounded-md transition-colors",
            value.trim()
              ? "bg-gold text-ivory hover:bg-gold-light"
              : "bg-ivory-deep text-ink-faint cursor-not-allowed",
          )}
        >
          Post
        </button>
      </div>
    </div>
  );
}

// ── Single comment ───────────────────────────────────────────────────────────

interface CommentBubbleProps {
  comment: Comment;
  onReply?: () => void;
  isReply?: boolean;
}

function CommentBubble({ comment, onReply, isReply = false }: CommentBubbleProps) {
  const deleteComment = useCommentsStore((s) => s.deleteComment);

  return (
    <div
      className={cn(
        "group",
        isReply ? "pl-6 border-l-2 border-gold-pale" : "",
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Author avatar placeholder */}
        <div
          className={cn(
            "flex-shrink-0 rounded-full bg-gold-pale flex items-center justify-center font-serif font-semibold text-gold",
            isReply ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs",
          )}
        >
          {comment.author.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-sm font-semibold text-ink-soft">
              {comment.author}
            </span>
            <span className="text-[10px] text-ink-faint">
              {timeAgo(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-[10px] text-ink-faint italic">
                (edited)
              </span>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-ink-soft leading-relaxed mt-0.5">
            {renderBody(comment.body)}
          </p>

          {/* Attachment indicator */}
          {comment.attachment && (
            <a
              href={comment.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-gold hover:text-gold-light transition-colors"
            >
              <Paperclip className="h-3 w-3" />
              {comment.attachment.filename}
            </a>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isReply && onReply && (
              <button
                type="button"
                onClick={onReply}
                className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-gold transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
            <button
              type="button"
              onClick={() => deleteComment(comment.id)}
              className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-rose transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface CommentThreadProps {
  entityType: CommentEntityType;
  entityId: string;
  author?: string;
  className?: string;
}

export function CommentThread({
  entityType,
  entityId,
  author = "You",
  className,
}: CommentThreadProps) {
  const comments = useCommentsStore((s) => s.comments);
  const addComment = useCommentsStore((s) => s.addComment);

  const topLevel = useMemo(
    () =>
      comments
        .filter(
          (c) =>
            c.entity_type === entityType &&
            c.entity_id === entityId &&
            c.parent_id === null,
        )
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
    [comments, entityType, entityId],
  );

  const getReplies = useCallback(
    (parentId: string) =>
      comments
        .filter((c) => c.parent_id === parentId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
    [comments],
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handlePost = useCallback(
    (body: string, parentId: string | null = null) => {
      addComment({
        entity_type: entityType,
        entity_id: entityId,
        parent_id: parentId,
        author,
        body,
        mentions: extractMentions(body),
        attachment: null,
      });
      setReplyingTo(null);
    },
    [entityType, entityId, author, addComment],
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-ink-muted" />
        <h4 className="font-serif text-sm font-semibold text-ink-soft tracking-wide">
          Correspondence
        </h4>
        {topLevel.length > 0 && (
          <span className="text-[10px] text-ink-faint bg-ivory-deep rounded-full px-1.5 py-0.5">
            {topLevel.length}
          </span>
        )}
      </div>

      {/* Comments list */}
      {topLevel.length > 0 ? (
        <div className="space-y-4">
          {topLevel.map((comment) => {
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id} className="space-y-2">
                <CommentBubble
                  comment={comment}
                  onReply={() =>
                    setReplyingTo(
                      replyingTo === comment.id ? null : comment.id,
                    )
                  }
                />

                {/* Replies */}
                {replies.map((reply) => (
                  <CommentBubble
                    key={reply.id}
                    comment={reply}
                    isReply
                  />
                ))}

                {/* Reply composer */}
                {replyingTo === comment.id && (
                  <div className="pl-6">
                    <Composer
                      onSubmit={(body) => handlePost(body, comment.id)}
                      placeholder="Write a reply\u2026"
                      autoFocus
                      compact
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-ink-faint italic pl-6">
          No notes yet. Start the conversation below.
        </p>
      )}

      {/* Main composer */}
      <Composer onSubmit={(body) => handlePost(body)} />
    </div>
  );
}
