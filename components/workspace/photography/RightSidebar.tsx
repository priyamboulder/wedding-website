"use client";

// ── Photography workspace right sidebar ────────────────────────────────────
// Persistent across all tabs. Four panels, top to bottom:
//   1. Needs Your Attention — pending items derived live from state
//   2. The Circle          — collaborators with online dots
//   3. Activity Feed       — chronological edits by the couple/planner
//   4. Quick Note          — textarea + Send; posts a workspace note with
//                            the currently-viewed tab as context

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Camera,
  Send,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import { PanelCard } from "@/components/workspace/blocks/primitives";

export function RightSidebar({
  category,
  activeTab,
  onNavigate,
}: {
  category: WorkspaceCategory;
  activeTab: string;
  onNavigate: (tab: string) => void;
}) {
  return (
    <aside
      className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-border bg-ivory-warm/40 px-4 py-5 lg:block"
      aria-label="Photography sidebar"
    >
      <div className="space-y-4">
        <NeedsYourAttention category={category} onNavigate={onNavigate} />
        <TheCircle />
        <ActivityFeed category={category} />
        <QuickNote category={category} activeTab={activeTab} />
      </div>
    </aside>
  );
}

// ── Needs Your Attention ──────────────────────────────────────────────────

function NeedsYourAttention({
  category,
  onNavigate,
}: {
  category: WorkspaceCategory;
  onNavigate: (tab: string) => void;
}) {
  const vips = usePhotographyStore((s) => s.vips);
  const shots = usePhotographyStore((s) => s.shots);
  const rituals = usePhotographyStore((s) => s.rituals);
  const deliverables = usePhotographyStore((s) => s.deliverables);

  const items = useMemo(() => {
    const out: { label: string; tab: string; tone: "rose" | "marigold" | "ink" }[] =
      [];
    const unassignedShots = shots.filter(
      (s) =>
        s.category_id === category.id && (!s.assigned_photographer || !s.checked),
    ).length;
    if (unassignedShots > 0) {
      out.push({
        label: `${unassignedShots} shots need assignment or approval`,
        tab: "shot_list",
        tone: "marigold",
      });
    }
    const unmarkedVips = vips.filter(
      (v) =>
        v.category_id === category.id &&
        (!v.relationship || !v.name || v.name === "New VIP"),
    ).length;
    if (unmarkedVips > 0) {
      out.push({
        label: `${unmarkedVips} VIPs need names & relationships`,
        tab: "vips",
        tone: "ink",
      });
    }
    const missingRefs = rituals.filter(
      (r) => r.category_id === category.id && r.applies && !r.reference_image_url,
    ).length;
    if (missingRefs > 0) {
      out.push({
        label: `${missingRefs} rituals missing reference photos`,
        tab: "rituals",
        tone: "ink",
      });
    }
    const overdue = deliverables.filter((d) => {
      if (d.category_id !== category.id) return false;
      if (!d.due_date) return false;
      if (d.status === "delivered" || d.status === "approved") return false;
      return new Date(d.due_date).getTime() < Date.now();
    }).length;
    if (overdue > 0) {
      out.push({
        label: `${overdue} deliverables overdue`,
        tab: "deliverables",
        tone: "rose",
      });
    }
    return out;
  }, [vips, shots, rituals, deliverables, category.id]);

  return (
    <PanelCard
      icon={<AlertCircle size={13} strokeWidth={1.8} />}
      title="Needs your attention"
      badge={
        items.length > 0 ? (
          <span
            className="rounded-full bg-rose px-1.5 text-[10px] font-medium text-ivory"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {items.length}
          </span>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-[12px] italic text-ink-muted">
          Nothing pressing — everything's in good shape.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onNavigate(it.tab)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-sm border px-2 py-1.5 text-left text-[12px] transition-colors",
                  it.tone === "rose"
                    ? "border-rose/40 bg-rose-pale/30 text-rose hover:bg-rose-pale/50"
                    : it.tone === "marigold"
                      ? "border-marigold/40 bg-marigold-pale/30 text-marigold hover:bg-marigold-pale/50"
                      : "border-border bg-white text-ink hover:border-saffron hover:text-saffron",
                )}
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span className="flex-1">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── The Circle ────────────────────────────────────────────────────────────

const CIRCLE_MEMBERS = [
  { id: "bride", name: "Priya", role: "Bride", online: true },
  { id: "groom", name: "Arjun", role: "Groom", online: false },
  { id: "planner", name: "Planner", role: "Planner", online: true },
  {
    id: "photographer",
    name: "Photographer",
    role: "Lead photographer",
    online: false,
  },
];

function TheCircle() {
  return (
    <PanelCard
      icon={<Users size={13} strokeWidth={1.8} />}
      title="The circle"
    >
      <ul className="space-y-1.5">
        {CIRCLE_MEMBERS.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-[12px] text-ink-soft hover:bg-ivory"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ivory-warm text-ink-muted">
              <UserCircle size={18} strokeWidth={1.4} />
            </span>
            <span className="flex-1 truncate">
              <span className="font-medium text-ink">{m.name}</span>
              <span className="ml-1.5 text-ink-faint">{m.role}</span>
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                m.online ? "bg-sage" : "bg-ink-faint/40",
              )}
              aria-label={m.online ? "Online" : "Offline"}
            />
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────

function ActivityFeed({ category }: { category: WorkspaceCategory }) {
  const notes = useWorkspaceStore((s) => s.notes);
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const vips = usePhotographyStore((s) => s.vips);
  const shots = usePhotographyStore((s) => s.shots);

  const events = useMemo(() => {
    const out: { when: string; body: string }[] = [];
    const ns = notes.filter((n) => n.category_id === category.id);
    for (const n of ns.slice(0, 4)) {
      out.push({
        when: n.created_at,
        body: `${n.author_id} · ${n.body.slice(0, 60)}${n.body.length > 60 ? "…" : ""}`,
      });
    }
    const recentShots = shots
      .filter((s) => s.category_id === category.id && s.checked)
      .slice(0, 3);
    for (const s of recentShots) {
      out.push({
        when: new Date().toISOString(),
        body: `Shot captured: ${s.title}`,
      });
    }
    const newVips = vips
      .filter(
        (v) => v.category_id === category.id && v.name && v.name !== "New VIP",
      )
      .slice(0, 3);
    for (const v of newVips) {
      out.push({
        when: new Date().toISOString(),
        body: `VIP added: ${v.name}`,
      });
    }
    const pins = moodboard.filter((m) => m.category_id === category.id).slice(0, 2);
    for (const p of pins) {
      out.push({
        when: new Date().toISOString(),
        body: `Pinned to moodboard${p.caption ? `: ${p.caption}` : ""}`,
      });
    }
    return out
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 6);
  }, [notes, moodboard, vips, shots, category.id]);

  return (
    <PanelCard
      icon={<Camera size={13} strokeWidth={1.8} />}
      title="Activity"
    >
      {events.length === 0 ? (
        <p className="text-[12px] italic text-ink-muted">
          No activity yet. As you and your team add things, they'll appear here.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {events.map((e, i) => (
            <li key={i} className="text-[11.5px] leading-relaxed">
              <p className="text-ink-soft">{e.body}</p>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {new Date(e.when).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Quick Note ────────────────────────────────────────────────────────────

function QuickNote({
  category,
  activeTab,
}: {
  category: WorkspaceCategory;
  activeTab: string;
}) {
  const addNote = useWorkspaceStore((s) => s.addNote);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    const b = body.trim();
    if (!b) return;
    addNote(category.id, `[${activeTab}] ${b}`);
    setBody("");
    setSent(true);
    setTimeout(() => setSent(false), 1800);
  }

  return (
    <PanelCard
      icon={<Send size={13} strokeWidth={1.8} />}
      title="Quick note"
    >
      <p
        className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        From: {activeTab}
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        placeholder="A quick note to your photographer…"
        rows={3}
        className="w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
      />
      <div className="mt-1.5 flex items-center justify-between">
        <span className="font-mono text-[9.5px] text-ink-faint">
          ⌘+Enter to send
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!body.trim()}
          className="flex items-center gap-1 rounded-sm bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send size={11} /> {sent ? "Sent" : "Send"}
        </button>
      </div>
    </PanelCard>
  );
}

