"use client";

// ── Discussions teaser ──────────────────────────────────────────────────────
// Small "from the community" section on the Discover tab that cross-promotes
// the Discussions board. Shows 2–3 recent or active threads as compact
// one-liners; tapping routes into the thread detail.

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useCommunityDiscussionsStore } from "@/stores/community-discussions-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function DiscussionsTeaser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ensureSeeded = useCommunityDiscussionsStore((s) => s.ensureSeeded);
  const discussions = useCommunityDiscussionsStore((s) => s.discussions);
  const profiles = useCommunityProfilesStore((s) => s.profiles);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const top = useMemo(() => {
    return discussions
      .slice()
      .sort((a, b) => {
        const aT = a.last_reply_at ?? a.created_at;
        const bT = b.last_reply_at ?? b.created_at;
        return new Date(bT).getTime() - new Date(aT).getTime();
      })
      .slice(0, 3);
  }, [discussions]);

  if (top.length === 0) return null;

  const go = (discussionId?: string) => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "discussions");
    if (discussionId) p.set("discussion", discussionId);
    else p.delete("discussion");
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  return (
    <section className="mt-8 rounded-2xl border border-gold/15 bg-ivory-warm/30 px-5 py-4">
      <div className="flex items-center justify-between">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — from the community —
        </p>
        <button
          type="button"
          onClick={() => go()}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          see all discussions
          <ArrowRight size={12} strokeWidth={1.8} />
        </button>
      </div>
      <ul className="mt-3 divide-y divide-gold/10">
        {top.map((d) => {
          const author = profiles.find((p) => p.id === d.author_id);
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => go(d.id)}
                className="flex w-full items-center gap-3 py-2 text-left transition-colors hover:text-ink"
              >
                <MessageSquare
                  size={13}
                  strokeWidth={1.8}
                  className="shrink-0 text-saffron"
                />
                <span className="flex-1 truncate text-[13px] italic text-ink">
                  &ldquo;{d.title}&rdquo;
                </span>
                <span className="hidden text-[11.5px] text-ink-faint sm:inline">
                  {author?.display_name ?? "a bride"} · {d.reply_count}{" "}
                  {d.reply_count === 1 ? "reply" : "replies"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
