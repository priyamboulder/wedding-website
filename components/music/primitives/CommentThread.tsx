"use client";

// ── CommentThread ─────────────────────────────────────────────────────────
// Per-item discussion surface. Inline on any music entity — songs,
// performers, set-list slots, etc.
//
// Behavior:
//   • 2 levels of nesting max. Replies to a reply flatten to the parent.
//   • @-mentions for "@priya" / "@arjun" / "@urvashi" / "@vendor-id" are
//     auto-highlighted. Tab sets `mentionablePartyIds` to control which
//     ids produce the mention dropdown when the user types "@".
//   • If the draft contains a URL, the first one is rendered as a
//     ReferenceEmbed below the body after post.
//   • Each comment shows its AttributionChip + relative timestamp + body
//     + optional reference embed.

import { useMemo, useState, type ReactNode } from "react";
import { AtSign, CornerDownRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MusicComment,
  MusicParty,
  MusicPartyId,
} from "@/types/music";
import { resolveMusicParty } from "@/lib/music/parties";
import { firstUrl } from "@/lib/music/references";
import { AttributionChip } from "./AttributionChip";
import { ReferenceEmbed } from "./ReferenceEmbed";

const MAX_DEPTH = 2;

export interface CommentThreadProps {
  comments: MusicComment[];
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  // Fires when the user submits. parentId is undefined for top-level.
  onPost: (body: string, parentId: string | undefined, referenceUrl: string | undefined) => void;
  // Party ids eligible for @-mention. Defaults to the three internal
  // parties. Tabs that render vendor presence can append vendor ids.
  mentionablePartyIds?: MusicPartyId[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function CommentThread({
  comments,
  partyMap,
  currentPartyId,
  onPost,
  mentionablePartyIds,
  placeholder = "Add a comment…",
  emptyMessage = "No comments yet.",
  className,
}: CommentThreadProps) {
  // Group comments by parent. Any reply to a reply (grand-child) gets
  // flattened up to the root so MAX_DEPTH is enforced.
  const tree = useMemo(() => buildTree(comments), [comments]);

  return (
    <div className={cn("space-y-3", className)}>
      {tree.roots.length === 0 && (
        <p className="text-[11.5px] italic text-ink-faint">{emptyMessage}</p>
      )}
      {tree.roots.map((root) => (
        <CommentNode
          key={root.id}
          comment={root}
          replies={tree.children[root.id] ?? []}
          partyMap={partyMap}
          currentPartyId={currentPartyId}
          mentionablePartyIds={mentionablePartyIds}
          depth={0}
          onPost={onPost}
        />
      ))}
      <Composer
        partyMap={partyMap}
        currentPartyId={currentPartyId}
        mentionablePartyIds={mentionablePartyIds}
        placeholder={placeholder}
        onPost={(body, refUrl) => onPost(body, undefined, refUrl)}
      />
    </div>
  );
}

// ── Node ─────────────────────────────────────────────────────────────────

function CommentNode({
  comment,
  replies,
  partyMap,
  currentPartyId,
  mentionablePartyIds,
  depth,
  onPost,
}: {
  comment: MusicComment;
  replies: MusicComment[];
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  mentionablePartyIds?: MusicPartyId[];
  depth: number;
  onPost: CommentThreadProps["onPost"];
}) {
  const [replying, setReplying] = useState(false);
  const party = partyMap[comment.party_id] ?? resolveMusicParty(comment.party_id);

  return (
    <article
      className={cn(
        "space-y-2",
        depth > 0 && "border-l border-border pl-3",
      )}
    >
      <header className="flex flex-wrap items-center gap-2">
        <AttributionChip
          partyIds={[comment.party_id]}
          partyMap={partyMap}
          timestamp={comment.created_at}
          size="sm"
        />
        <span className="text-[11.5px] font-medium text-ink">
          {party.display_name}
        </span>
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {relTime(comment.created_at)}
        </span>
      </header>
      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">
        {renderWithMentions(comment.body, partyMap)}
      </p>
      {comment.reference_url && (
        <div className="max-w-[480px]">
          <ReferenceEmbed url={comment.reference_url} variant="card" />
        </div>
      )}
      <div className="flex items-center gap-3">
        {depth < MAX_DEPTH - 1 && (
          <button
            type="button"
            onClick={() => setReplying((r) => !r)}
            className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <CornerDownRight size={10} strokeWidth={1.8} />
            {replying ? "cancel" : "reply"}
          </button>
        )}
      </div>
      {replying && (
        <Composer
          partyMap={partyMap}
          currentPartyId={currentPartyId}
          mentionablePartyIds={mentionablePartyIds}
          placeholder={`Reply to ${party.display_name}…`}
          onPost={(body, refUrl) => {
            onPost(body, comment.id, refUrl);
            setReplying(false);
          }}
          autoFocus
        />
      )}
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              replies={[]}
              partyMap={partyMap}
              currentPartyId={currentPartyId}
              mentionablePartyIds={mentionablePartyIds}
              depth={depth + 1}
              onPost={onPost}
            />
          ))}
        </div>
      )}
    </article>
  );
}

// ── Composer ─────────────────────────────────────────────────────────────

function Composer({
  partyMap,
  currentPartyId,
  mentionablePartyIds,
  placeholder,
  onPost,
  autoFocus,
}: {
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  mentionablePartyIds?: MusicPartyId[];
  placeholder: string;
  onPost: (body: string, refUrl: string | undefined) => void;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const refUrl = firstUrl(draft);

  function post() {
    const body = draft.trim();
    if (!body) return;
    onPost(body, refUrl ?? undefined);
    setDraft("");
  }

  const me = partyMap[currentPartyId] ?? resolveMusicParty(currentPartyId);

  return (
    <div className="space-y-2 rounded-md border border-border bg-white p-2">
      <div className="flex items-start gap-2">
        <AttributionChip
          partyIds={[currentPartyId]}
          partyMap={partyMap}
          size="sm"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              post();
            }
          }}
          placeholder={`${me.display_name}: ${placeholder}`}
          rows={2}
          autoFocus={autoFocus}
          className="min-h-[44px] flex-1 resize-y rounded-sm border border-transparent bg-transparent px-1 py-1 text-[12.5px] leading-snug text-ink outline-none placeholder:text-ink-faint focus:border-gold/40"
        />
      </div>
      {refUrl && (
        <div className="max-w-[420px]">
          <ReferenceEmbed url={refUrl} variant="inline" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {mentionablePartyIds && mentionablePartyIds.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <AtSign size={10} strokeWidth={1.8} />
              mention
            </span>
          )}
          {refUrl && (
            <span className="inline-flex items-center gap-1">
              <Paperclip size={10} strokeWidth={1.8} />
              link attached
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={post}
          disabled={!draft.trim()}
          className={cn(
            "rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
            draft.trim()
              ? "border-gold/40 bg-gold-pale/40 text-ink hover:bg-gold-pale/70"
              : "cursor-not-allowed border-border bg-ivory-warm text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          post
        </button>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

interface CommentTree {
  roots: MusicComment[];
  children: Record<string, MusicComment[]>;
}

// Build a 2-level tree. Any comment whose parent is itself a reply (has
// its own parent_id) is flattened onto the grandparent — we never let
// the tree go deeper than MAX_DEPTH.
function buildTree(comments: MusicComment[]): CommentTree {
  const byId = new Map<string, MusicComment>();
  for (const c of comments) byId.set(c.id, c);

  const roots: MusicComment[] = [];
  const children: Record<string, MusicComment[]> = {};

  for (const c of comments) {
    if (!c.parent_id) {
      roots.push(c);
      continue;
    }
    const parent = byId.get(c.parent_id);
    if (!parent) {
      roots.push(c);
      continue;
    }
    const root = parent.parent_id ? byId.get(parent.parent_id) ?? parent : parent;
    const bucket = children[root.id] ?? [];
    bucket.push(c);
    children[root.id] = bucket;
  }

  const byCreated = (a: MusicComment, b: MusicComment) =>
    a.created_at.localeCompare(b.created_at);
  roots.sort(byCreated);
  for (const key of Object.keys(children)) children[key]!.sort(byCreated);

  return { roots, children };
}

const MENTION_RE = /@([a-z0-9_-]+)/gi;

function renderWithMentions(
  body: string,
  partyMap: Record<MusicPartyId, MusicParty>,
) {
  const parts: ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(body))) {
    const handle = match[1]!.toLowerCase();
    const party =
      partyMap[handle] ??
      Object.values(partyMap).find(
        (p) => p.display_name.toLowerCase() === handle,
      );
    if (!party) continue;
    if (match.index > lastIdx) {
      parts.push(body.slice(lastIdx, match.index));
    }
    parts.push(
      <span
        key={`m-${key++}`}
        className="rounded-sm bg-gold-pale/60 px-1 font-medium text-ink"
      >
        @{party.display_name}
      </span>,
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < body.length) parts.push(body.slice(lastIdx));
  return parts.length > 0 ? parts : body;
}

function relTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const diffMin = Math.round((Date.now() - then) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
