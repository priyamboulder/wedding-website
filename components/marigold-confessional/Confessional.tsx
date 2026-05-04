'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import {
  COMMENT_CONTENT_MAX,
  PERSONA_PRESETS,
  PERSONA_TAG_MAX,
  POST_CONTENT_MAX,
  POST_TYPE_BADGE,
  POST_TYPE_EMOJI,
  POST_TYPE_LABEL,
  POST_TYPE_TINT,
  REACTION_ICON,
  REACTION_LABEL,
  REACTION_ORDER,
  type MarigoldConfessionPostWithCounts,
  type MarigoldConfessionReaction,
  type MarigoldConfessionType,
} from '@/types/marigold-confessional';
import styles from './Confessional.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<{
  token: string | null;
  authed: boolean;
}> {
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token ?? null;
    return { token, authed: !!token };
  } catch {
    return { token: null, authed: false };
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.round(d / 7);
  if (w < 4) return `${w} week${w === 1 ? '' : 's'} ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`;
  const y = Math.round(d / 365);
  return `${y} year${y === 1 ? '' : 's'} ago`;
}

const FILTERS: Array<{
  value: 'all' | MarigoldConfessionType;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'rant', label: 'Rants' },
  { value: 'confession', label: 'Confessions' },
  { value: 'hot_take', label: 'Hot Takes' },
  { value: 'would_you_believe', label: 'Would You Believe' },
];

// ── Comment ────────────────────────────────────────────────────────────────

interface CommentRow {
  id: string;
  post_id: string;
  persona_tag: string;
  content: string;
  created_at: string;
}

function CommentForm({
  postId,
  authed,
  onPosted,
}: {
  postId: string;
  authed: boolean;
  onPosted: (c: CommentRow) => void;
}) {
  const [persona, setPersona] = useState(PERSONA_PRESETS[0]);
  const [customMonths, setCustomMonths] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authed) {
    return (
      <p className={styles.commentLoginPrompt}>
        <a href="/pricing">Sign in to join the conversation →</a>
      </p>
    );
  }

  const finalPersona = persona.includes('__ months')
    ? persona.replace('__ months', `${customMonths || '?'} months`)
    : persona;

  const handleSubmit = async () => {
    setError(null);
    if (content.trim().length === 0) return;
    setBusy(true);
    const { token } = await getAuthToken();
    try {
      const res = await fetch('/api/marigold-confessional/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          post_id: postId,
          persona_tag: finalPersona.slice(0, PERSONA_TAG_MAX),
          content,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? 'Could not post comment.');
      } else if (json?.comment) {
        onPosted(json.comment);
        setContent('');
      }
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.commentForm}>
      <select
        className={styles.commentPersonaSelect}
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        aria-label="Persona"
      >
        {PERSONA_PRESETS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {persona.includes('__ months') && (
        <input
          type="number"
          min={0}
          max={99}
          placeholder="months out"
          className={styles.commentPersonaSelect}
          value={customMonths}
          onChange={(e) => setCustomMonths(e.target.value)}
          aria-label="Months out"
        />
      )}
      <textarea
        className={styles.commentInput}
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, COMMENT_CONTENT_MAX))}
        maxLength={COMMENT_CONTENT_MAX}
        placeholder="Add a comment…"
      />
      <div className={styles.commentRow}>
        <span className={styles.commentCount}>
          {content.length} / {COMMENT_CONTENT_MAX}
        </span>
        <button
          type="button"
          className={styles.commentSubmit}
          onClick={handleSubmit}
          disabled={busy || content.trim().length === 0}
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

function Comments({
  postId,
  authed,
  onCountChange,
}: {
  postId: string;
  authed: boolean;
  onCountChange: (n: number) => void;
}) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(
        `/api/marigold-confessional/comments?post_id=${encodeURIComponent(postId)}`,
      );
      const json = await res.json().catch(() => ({}));
      if (!alive) return;
      setComments(Array.isArray(json?.comments) ? json.comments : []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  return (
    <div className={styles.comments}>
      {loading ? (
        <p className={styles.commentLoginPrompt}>Loading…</p>
      ) : comments.length === 0 ? (
        <p className={styles.commentLoginPrompt}>
          No comments yet — be the first.
        </p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <p className={styles.commentPersona}>{c.persona_tag}</p>
            <p className={styles.commentContent}>{c.content}</p>
            <span className={styles.commentMeta}>
              {relativeTime(c.created_at)}
            </span>
          </div>
        ))
      )}
      <CommentForm
        postId={postId}
        authed={authed}
        onPosted={(c) => {
          setComments((prev) => [...prev, c]);
          onCountChange(comments.length + 1);
        }}
      />
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

interface CardProps {
  post: MarigoldConfessionPostWithCounts;
  myReactions: Set<MarigoldConfessionReaction>;
  authed: boolean;
  onReact: (
    postId: string,
    reaction: MarigoldConfessionReaction,
    counts: Pick<
      MarigoldConfessionPostWithCounts,
      | 'reaction_same'
      | 'reaction_aunty_disapproves'
      | 'reaction_fire'
      | 'reaction_sending_chai'
      | 'comment_count'
    >,
    active: boolean,
  ) => void;
  onCommentCountChange: (postId: string, n: number) => void;
}

function Card({
  post,
  myReactions,
  authed,
  onReact,
  onCommentCountChange,
}: CardProps) {
  const [showComments, setShowComments] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [busyRx, setBusyRx] = useState<MarigoldConfessionReaction | null>(null);

  const tint = POST_TYPE_TINT[post.post_type];
  const badge = POST_TYPE_BADGE[post.post_type];

  const reactionCount = (rx: MarigoldConfessionReaction): number => {
    if (rx === 'same') return post.reaction_same;
    if (rx === 'aunty_disapproves') return post.reaction_aunty_disapproves;
    if (rx === 'fire') return post.reaction_fire;
    return post.reaction_sending_chai;
  };

  const handleReact = async (rx: MarigoldConfessionReaction) => {
    if (!authed) {
      window.location.href = '/pricing';
      return;
    }
    if (busyRx) return;
    setBusyRx(rx);
    const { token } = await getAuthToken();
    try {
      const res = await fetch('/api/marigold-confessional/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ post_id: post.id, reaction_type: rx }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.counts) {
        onReact(post.id, rx, json.counts, !!json.active);
      }
    } finally {
      setBusyRx(null);
    }
  };

  const handleReport = async () => {
    if (reportSent) return;
    setReportSent(true);
    try {
      await fetch('/api/marigold-confessional/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'post', id: post.id }),
      });
    } catch {
      /* no-op — silent fail */
    }
  };

  return (
    <article className={styles.card} style={{ background: tint }}>
      <span
        className={styles.badge}
        style={{ background: badge.bg, color: badge.fg }}
      >
        <span className={styles.badgeIcon} aria-hidden="true">
          {POST_TYPE_EMOJI[post.post_type]}
        </span>
        {POST_TYPE_LABEL[post.post_type]}
      </span>
      <p className={styles.persona}>{post.persona_tag}</p>
      <p className={styles.content}>{post.content}</p>
      <div className={styles.metaRow}>
        <span>{relativeTime(post.created_at)}</span>
        <button
          type="button"
          className={styles.reportBtn}
          onClick={handleReport}
          disabled={reportSent}
          aria-label={reportSent ? 'Reported' : 'Report this post'}
          title={reportSent ? 'Reported — thanks' : 'Report'}
        >
          ⚐
        </button>
      </div>
      <div className={styles.reactRow}>
        {REACTION_ORDER.map((rx) => {
          const active = myReactions.has(rx);
          const icon = REACTION_ICON[rx];
          const label = REACTION_LABEL[rx];
          const count = reactionCount(rx);
          return (
            <button
              key={rx}
              type="button"
              className={`${styles.react} ${active ? styles.reactActive : ''}`}
              onClick={() => handleReact(rx)}
              aria-pressed={active}
            >
              {icon && <span aria-hidden="true">{icon}</span>}
              {label && <span>{label}</span>}
              <span className={styles.reactCount}>· {count}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.commentToggle}
        onClick={() => setShowComments((v) => !v)}
      >
        💬 {post.comment_count} {showComments ? '— hide' : ''}
      </button>
      {showComments && (
        <Comments
          postId={post.id}
          authed={authed}
          onCountChange={(n) => onCommentCountChange(post.id, n)}
        />
      )}
    </article>
  );
}

// ── Post modal ─────────────────────────────────────────────────────────────

function PostModal({
  onClose,
  onPosted,
}: {
  onClose: () => void;
  onPosted: (post: MarigoldConfessionPostWithCounts) => void;
}) {
  const [type, setType] = useState<MarigoldConfessionType>('rant');
  const [persona, setPersona] = useState(PERSONA_PRESETS[0]);
  const [customMonths, setCustomMonths] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const finalPersona = useMemo(() => {
    if (persona === 'Custom...') return customPersona.slice(0, 30);
    if (persona.includes('__ months')) {
      return persona.replace('__ months', `${customMonths || '?'} months`);
    }
    return persona;
  }, [persona, customMonths, customPersona]);

  const tooLong = content.length > POST_CONTENT_MAX;
  const canSubmit =
    !busy &&
    content.trim().length > 0 &&
    !tooLong &&
    finalPersona.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    if (!canSubmit) return;
    setBusy(true);
    const { token } = await getAuthToken();
    try {
      const res = await fetch('/api/marigold-confessional/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          post_type: type,
          persona_tag: finalPersona,
          content,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? 'Could not post.');
        setBusy(false);
        return;
      }
      const raw = json.post;
      // Hydrate to the with-counts shape so the new card renders immediately.
      const post: MarigoldConfessionPostWithCounts = {
        ...(raw as MarigoldConfessionPostWithCounts),
        reaction_same: 0,
        reaction_aunty_disapproves: 0,
        reaction_fire: 0,
        reaction_sending_chai: 0,
        comment_count: 0,
      };
      onPosted(post);
      onClose();
    } catch {
      setError('Network error.');
      setBusy(false);
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.modalEyebrow}>The Confessional</div>
        <h2 className={styles.modalTitle}>
          Share your <i>story.</i>
        </h2>

        <span className={styles.modalLabel}>Pick a vibe</span>
        <div className={styles.typeRow}>
          {(
            ['rant', 'confession', 'hot_take', 'would_you_believe'] as const
          ).map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.typeOption} ${
                type === t ? styles.typeOptionActive : ''
              }`}
              onClick={() => setType(t)}
              aria-pressed={type === t}
            >
              <span className={styles.typeEmoji}>{POST_TYPE_EMOJI[t]}</span>
              {POST_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <span className={styles.modalLabel}>Persona</span>
        <div className={styles.personaSelect}>
          <select
            className={styles.select}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            {PERSONA_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="Custom...">Custom…</option>
          </select>
          {persona.includes('__ months') && (
            <input
              type="number"
              min={0}
              max={99}
              className={styles.textInput}
              placeholder="how many months out?"
              value={customMonths}
              onChange={(e) => setCustomMonths(e.target.value)}
            />
          )}
          {persona === 'Custom...' && (
            <input
              type="text"
              maxLength={30}
              className={styles.textInput}
              placeholder="describe yourself (max 30 chars)"
              value={customPersona}
              onChange={(e) => setCustomPersona(e.target.value)}
            />
          )}
        </div>

        <span className={styles.modalLabel}>Your story</span>
        <textarea
          className={styles.textArea}
          maxLength={POST_CONTENT_MAX + 50}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Spill it. We're here for solidarity, not receipts."
        />
        <div
          className={`${styles.charCount} ${
            tooLong ? styles.charCountOver : ''
          }`}
        >
          {content.length} / {POST_CONTENT_MAX}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {busy ? 'Posting…' : 'Post Anonymously'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feed ───────────────────────────────────────────────────────────────────

export function MarigoldConfessional() {
  const [posts, setPosts] = useState<MarigoldConfessionPostWithCounts[]>([]);
  const [userReactions, setUserReactions] = useState<
    Record<string, Set<MarigoldConfessionReaction>>
  >({});
  const [filter, setFilter] = useState<'all' | MarigoldConfessionType>('all');
  const [authed, setAuthed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const offsetRef = useRef(0);

  // Auth state.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { authed: a } = await getAuthToken();
      if (alive) setAuthed(a);
    })();
    const sub = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => {
      alive = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const load = useCallback(
    async (opts: { reset: boolean }) => {
      if (opts.reset) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      params.set('offset', String(offsetRef.current));
      try {
        const res = await fetch(
          `/api/marigold-confessional/posts?${params.toString()}`,
        );
        const json = await res.json().catch(() => ({}));
        const incoming = (json?.posts ??
          []) as MarigoldConfessionPostWithCounts[];
        const rxMap = (json?.userReactions ?? {}) as Record<string, string[]>;
        setPosts((prev) => (opts.reset ? incoming : [...prev, ...incoming]));
        setUserReactions((prev) => {
          const next = opts.reset ? {} : { ...prev };
          for (const [postId, list] of Object.entries(rxMap)) {
            next[postId] = new Set(list as MarigoldConfessionReaction[]);
          }
          return next;
        });
        setHasMore(!!json?.hasMore);
        offsetRef.current += incoming.length;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load({ reset: true });
  }, [load]);

  const handleReact = (
    postId: string,
    rx: MarigoldConfessionReaction,
    counts: Pick<
      MarigoldConfessionPostWithCounts,
      | 'reaction_same'
      | 'reaction_aunty_disapproves'
      | 'reaction_fire'
      | 'reaction_sending_chai'
      | 'comment_count'
    >,
    active: boolean,
  ) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...counts } : p)),
    );
    setUserReactions((prev) => {
      const set = new Set(prev[postId] ?? []);
      if (active) set.add(rx);
      else set.delete(rx);
      return { ...prev, [postId]: set };
    });
  };

  const handleCommentCountChange = (postId: string, n: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comment_count: n } : p)),
    );
  };

  const handlePosted = (post: MarigoldConfessionPostWithCounts) => {
    if (filter === 'all' || filter === post.post_type) {
      setPosts((prev) => [post, ...prev]);
      offsetRef.current += 1;
    }
  };

  return (
    <div className={styles.wrap}>
      <a href="/the-great-debate" className={styles.debatesLink}>
        Browse All 300 Debates →
      </a>

      <div className={styles.topActions}>
        {authed ? (
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => setShowModal(true)}
          >
            Share Your Story
          </button>
        ) : (
          <a href="/pricing" className={styles.signInLink}>
            Sign in to share your story →
          </a>
        )}
        <span className={styles.feedHint}>anonymous, on purpose</span>
      </div>

      <div className={styles.banner} role="note">
        <span className={styles.bannerIcon} aria-hidden="true">
          ☕
        </span>
        <span>
          Rant about the situation, not the person. We're here for solidarity,
          not receipts.
        </span>
      </div>

      <div className={styles.filterRow} role="tablist" aria-label="Post type">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.pill} ${active ? styles.pillActive : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className={styles.empty}>Loading the latest…</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>
          No stories here yet — be the first to share.
        </p>
      ) : (
        <div className={styles.feed}>
          {posts.map((p) => (
            <Card
              key={p.id}
              post={p}
              authed={authed}
              myReactions={userReactions[p.id] ?? new Set()}
              onReact={handleReact}
              onCommentCountChange={handleCommentCountChange}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => load({ reset: false })}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {showModal && (
        <PostModal
          onClose={() => setShowModal(false)}
          onPosted={handlePosted}
        />
      )}
    </div>
  );
}
